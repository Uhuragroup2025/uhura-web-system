import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  History,
  ShieldCheck,
  RotateCw,
  Users,
  ChevronRight,
  Info,
  Lock,
  Plus,
  Check,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  Repeat,
  FileText,
  X,
  Hourglass,
  Tag
} from 'lucide-react';
import {
  ProjectSummaryItem,
  ProjectDeliverable,
  ProjectTeamMember,
  ProjectMonthlyCycle,
  TaskItem,
  FeeRolloverPolicy,
  ProjectDependency,
  ProjectDependencyType,
  ProjectScheduleChange,
  ProjectReworkRound,
  ReworkRoundCause,
  ScheduleChangeCause,
  UserItem,
  normalizeProjectType
} from '../types';
import { UserAvatar } from '../UserAvatar';
import { evaluateProjectHealth, calculateBusinessDays, addBusinessDays } from '../health/projectHealthEngine';

interface ProjectOverviewTabProps {
  project: ProjectSummaryItem & {
    consumedHours: number;
    tasks: TaskItem[];
  };
  deliverables: ProjectDeliverable[];
  coreTeam: ProjectTeamMember[];
  currentUser?: UserItem;
  allUsers?: UserItem[];
  onNavigateToDeliverables: () => void;
  onNavigateToTasks: (frenteName?: string) => void;
  onNavigateToTeam: () => void;
  onSelectClient?: (clientName: string) => void;
  onUpdateProject?: (updatedProject: ProjectSummaryItem) => void;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  project,
  deliverables,
  coreTeam,
  currentUser,
  allUsers = [],
  onNavigateToDeliverables,
  onNavigateToTasks,
  onNavigateToTeam,
  onSelectClient,
  onUpdateProject
}) => {
  const normalizedType = normalizeProjectType(project.projectType);
  const isFixed = normalizedType === 'fixed_project';
  const isFee = normalizedType === 'fee_monthly';
  const isInternal = normalizedType === 'internal_non_billable';

  // Modal states
  const [isReforecastModalOpen, setIsReforecastModalOpen] = useState(false);
  const [isNewDependencyModalOpen, setIsNewDependencyModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedDependencyForFollowUp, setSelectedDependencyForFollowUp] = useState<ProjectDependency | null>(null);
  const [isNewReworkRoundModalOpen, setIsNewReworkRoundModalOpen] = useState(false);

  // Filter for dependencies list
  const [depFilter, setDepFilter] = useState<'all' | 'blocking' | 'pending' | 'received'>('all');

  // Reforecast form state
  const [reforecastDeltaDays, setReforecastDeltaDays] = useState<number>(3);
  const [reforecastCause, setReforecastCause] = useState<ScheduleChangeCause>('client_approval_delay');
  const [reforecastNote, setReforecastNote] = useState<string>('');

  // New Dependency form state
  const [newDepTitle, setNewDepTitle] = useState('');
  const [newDepType, setNewDepType] = useState<ProjectDependencyType>('approval');
  const [newDepOwnerType, setNewDepOwnerType] = useState<'client' | 'uhura'>('client');
  const [newDepExpectedDate, setNewDepExpectedDate] = useState('');
  const [newDepBlocking, setNewDepBlocking] = useState(true);
  const [newDepFollowUpOwnerId, setNewDepFollowUpOwnerId] = useState(currentUser?.id || 'u-3');
  const [newDepDeliverableId, setNewDepDeliverableId] = useState<string>('');

  // Follow-up form state
  const [followUpNoteText, setFollowUpNoteText] = useState('');

  // New Rework Round form state
  const [reworkCause, setReworkCause] = useState<ReworkRoundCause>('client_adjustment');
  const [reworkNote, setReworkNote] = useState('');
  const [reworkEstHours, setReworkEstHours] = useState(4);
  const [reworkDeliverableId, setReworkDeliverableId] = useState('');

  // Active Monthly Cycle for Fee
  const monthlyCycles = project.monthlyCycles || [
    {
      monthKey: '2026-09',
      monthLabel: 'Septiembre 2026',
      quotedHours: project.budgetedHours || 59,
      executedHours: project.consumedHours || 27,
      status: 'active' as const,
      notes: 'Ciclo mensual activo'
    }
  ];

  const [selectedCycleKey, setSelectedCycleKey] = useState<string>(
    project.currentMonthCycle || (monthlyCycles.find((c) => c.status === 'active')?.monthKey || monthlyCycles[0]?.monthKey || '2026-09')
  );

  const currentCycle = monthlyCycles.find((c) => c.monthKey === selectedCycleKey) || monthlyCycles[0];

  // RBAC Permission Check
  // Leader and Executive can execute and confirm Reforecast
  const canConfirmReforecast = useMemo(() => {
    if (!currentUser) return true; // Default fallback in prototype
    const level = currentUser.accessLevel || 'collaborator';
    return level === 'leader' || level === 'executive' || currentUser.role === 'Admin';
  }, [currentUser]);

  // Client Relationship and Commercial can manage dependencies
  const canManageDependencies = useMemo(() => {
    if (!currentUser) return true;
    const level = currentUser.accessLevel || 'collaborator';
    return ['client_relationship', 'commercial', 'leader', 'executive'].includes(level) || currentUser.role === 'Admin';
  }, [currentUser]);

  // 1. EVALUAR MOTOR DE SALUD DEL PROYECTO (PROJECT HEALTH)
  const healthResult = useMemo(() => {
    return evaluateProjectHealth({
      project,
      customTasks: project.tasks
    });
  }, [project]);

  // Rollups & Metrics
  const totalQuotedHours = isFee && currentCycle
    ? currentCycle.quotedHours
    : (project.soldHours && project.soldHours > 0 ? project.soldHours : project.budgetedHours || 0);

  const totalExecutedHours = project.consumedHours || 0;
  const executionPercentage = totalQuotedHours > 0 ? Math.round((totalExecutedHours / totalQuotedHours) * 100) : 0;

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completed || t.status === 'Done').length;
  const progressPercent = healthResult.vectors.burn.progressPct;

  // Dependencies list
  const dependencies: ProjectDependency[] = project.dependencies || [];
  const reworkRounds: ProjectReworkRound[] = project.reworkRounds || [];
  const scheduleHistory: ProjectScheduleChange[] = project.scheduleHistory || [];

  // Filtered dependencies
  const filteredDependencies = useMemo(() => {
    return dependencies.filter((dep) => {
      if (depFilter === 'blocking') return dep.blocking;
      if (depFilter === 'pending') return dep.status === 'pending';
      if (depFilter === 'received') return dep.status === 'received';
      return true;
    });
  }, [dependencies, depFilter]);

  // Suggestion of delay
  const pendingBlockingOverdueDeps = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return dependencies.filter(
      (d) => d.blocking && d.status === 'pending' && d.expectedDate && todayStr > d.expectedDate
    );
  }, [dependencies]);

  // Calculate suggested forecast
  const suggestedShiftDays = useMemo(() => {
    if (pendingBlockingOverdueDeps.length === 0) return 0;
    const todayStr = new Date().toISOString().slice(0, 10);
    const maxDelay = pendingBlockingOverdueDeps.reduce((max, d) => {
      const delay = calculateBusinessDays(d.expectedDate, todayStr);
      return Math.max(max, delay);
    }, 0);
    return Math.max(1, maxDelay);
  }, [pendingBlockingOverdueDeps]);

  // Handlers
  const handleMarkReceived = (depId: string) => {
    if (!onUpdateProject) return;
    const updated = dependencies.map((d) => {
      if (d.id === depId) {
        return {
          ...d,
          status: 'received' as const,
          receivedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    onUpdateProject({
      ...project,
      dependencies: updated
    });
  };

  const handleSaveFollowUp = () => {
    if (!onUpdateProject || !selectedDependencyForFollowUp) return;
    const updated = dependencies.map((d) => {
      if (d.id === selectedDependencyForFollowUp.id) {
        return {
          ...d,
          lastFollowUpAt: new Date().toISOString(),
          followUpNotes: followUpNoteText.trim() || 'Seguimiento registrado con el cliente',
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    onUpdateProject({
      ...project,
      dependencies: updated
    });
    setIsFollowUpModalOpen(false);
    setSelectedDependencyForFollowUp(null);
    setFollowUpNoteText('');
  };

  const handleCreateDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProject || !newDepTitle.trim() || !newDepExpectedDate) return;

    const assignedUser = allUsers.find((u) => u.id === newDepFollowUpOwnerId) || currentUser;
    const newDep: ProjectDependency = {
      id: `dep-${Date.now()}`,
      projectId: project.id,
      deliverableId: newDepDeliverableId || null,
      title: newDepTitle.trim(),
      type: newDepType,
      ownerType: newDepOwnerType,
      followUpOwnerUserId: newDepFollowUpOwnerId,
      followUpOwnerName: assignedUser?.name || 'Client Relationship',
      requestedAt: new Date().toISOString(),
      expectedDate: newDepExpectedDate,
      status: 'pending',
      blocking: newDepBlocking,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdateProject({
      ...project,
      dependencies: [newDep, ...dependencies]
    });

    setIsNewDependencyModalOpen(false);
    setNewDepTitle('');
    setNewDepExpectedDate('');
  };

  const handleConfirmReforecast = () => {
    if (!onUpdateProject || !canConfirmReforecast) return;

    const currentForecast = project.forecastEndDate || project.baselineEndDate || project.endDate || new Date().toISOString().slice(0, 10);
    const newForecastEndDate = addBusinessDays(currentForecast, reforecastDeltaDays);

    const newChangeRecord: ProjectScheduleChange = {
      id: `sch-${Date.now()}`,
      projectId: project.id,
      previousForecastEndDate: currentForecast,
      newForecastEndDate,
      deltaBusinessDays: reforecastDeltaDays,
      cause: reforecastCause,
      confirmedByUserId: currentUser?.id || 'u-2',
      confirmedByName: currentUser?.name || 'Paola Monsalve',
      note: reforecastNote.trim() || 'Reforecast aprobado por líder de proyecto',
      createdAt: new Date().toISOString()
    };

    // Desplazar tareas pendientes en días hábiles (preservando completadas y baseline)
    const updatedTasks = project.tasks.map((task) => {
      if (task.completed || task.status === 'Done') {
        return task; // Completadas permanecen intactas
      }
      const newDueDate = task.dueDate ? addBusinessDays(task.dueDate, reforecastDeltaDays) : task.dueDate;
      const newScheduledDate = task.scheduledDate ? addBusinessDays(task.scheduledDate, reforecastDeltaDays) : task.scheduledDate;
      return {
        ...task,
        dueDate: newDueDate,
        scheduledDate: newScheduledDate,
        isRecalibrated: true,
        recalibrationDays: (task.recalibrationDays || 0) + reforecastDeltaDays,
        recalibrationReason: reforecastNote || 'Desplazamiento por reforecast confirmado de proyecto'
      };
    });

    onUpdateProject({
      ...project,
      forecastEndDate: newForecastEndDate,
      scheduleHistory: [newChangeRecord, ...scheduleHistory],
      tasks: updatedTasks
    });

    setIsReforecastModalOpen(false);
    setReforecastNote('');
  };

  const handleCreateReworkRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProject) return;

    const nextRoundNumber = reworkRounds.length + 1;
    const includedLimit = project.scheduleConfig?.includedReworkRounds ?? 2;
    const isAdditional = nextRoundNumber > includedLimit;

    const newRound: ProjectReworkRound = {
      id: `rw-${Date.now()}`,
      projectId: project.id,
      deliverableId: reworkDeliverableId || null,
      roundNumber: nextRoundNumber,
      cause: reworkCause,
      requestedAt: new Date().toISOString(),
      estimatedHours: reworkEstHours,
      actualHours: 0,
      note: reworkNote.trim(),
      createdByUserId: currentUser?.id || 'u-2',
      createdByName: currentUser?.name || 'Equipo Uhura',
      isAdditionalIteration: isAdditional
    };

    onUpdateProject({
      ...project,
      reworkRounds: [...reworkRounds, newRound]
    });

    setIsNewReworkRoundModalOpen(false);
    setReworkNote('');
  };

  return (
    <div className="space-y-6">
      {/* BANNER DE SUGERENCIA DE REFORECAST (SI HAY ATRASO CRÍTICO DE CLIENTE) */}
      {isFixed && pendingBlockingOverdueDeps.length > 0 && (
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f59e0b]/20 text-[#b45309] flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#92400e]">
                  Atraso Detectado en Insumo Crítico del Cliente
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
                  +{suggestedShiftDays} días hábiles
                </span>
              </div>
              <p className="text-xs text-[#78350f] mt-1 leading-relaxed">
                El insumo <strong className="text-[#92400e] font-bold">"{pendingBlockingOverdueDeps[0].title}"</strong> presenta{' '}
                {suggestedShiftDays} días de demora. El cronograma original proyectaba entrega el{' '}
                <strong className="underline decoration-[#d97706]">
                  {project.baselineEndDate || project.endDate || 'fin de mes'}
                </strong>
                . El forecast calculado sugiere actualizar al{' '}
                <strong className="underline decoration-[#d97706]">
                  {addBusinessDays(project.forecastEndDate || project.baselineEndDate || '2026-10-30', suggestedShiftDays)}
                </strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            {canConfirmReforecast ? (
              <button
                type="button"
                onClick={() => {
                  setReforecastDeltaDays(suggestedShiftDays);
                  setReforecastCause('client_approval_delay');
                  setReforecastNote(`Atraso por espera en insumo de cliente: ${pendingBlockingOverdueDeps[0].title}`);
                  setIsReforecastModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Recalcular cronograma</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f1f5f9] text-[#64748b] text-xs font-medium border border-[#cbd5e1]" title="Solo un Líder o Dirección Ejecutiva puede confirmar reforecasts oficiales">
                <Lock className="w-3.5 h-3.5 text-[#94a3b8]" />
                <span>Aprobación de líder requerida</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. TOP ROLLUP KPI CARDS CON PROJECT HEALTH MULTIVECTORIAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Horas Cotizadas vs Ejecutadas */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              {isFee ? 'Presupuesto Mes' : 'Horas Vendidas / Cotizadas'}
            </span>
            <span className="p-1 rounded-lg bg-[#501f92]/10 text-[#501f92]">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0f172a] font-mono">
                {totalExecutedHours.toFixed(1)}h
              </span>
              <span className="text-xs text-[#64748b] font-medium font-mono">
                / {totalQuotedHours > 0 ? `${totalQuotedHours}h cotizadas` : '0h (Interno)'}
              </span>
            </div>
            <div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${Math.min(executionPercentage, 100)}%` }}
                className={`h-full rounded-full ${
                  executionPercentage > 100 ? 'bg-[#ef4444]' : executionPercentage > 85 ? 'bg-[#f59e0b]' : 'bg-[#501f92]'
                }`}
              />
            </div>
          </div>
          <span className="text-[10px] text-[#64748b] mt-2 block">
            {totalQuotedHours > 0
              ? `${executionPercentage}% consumido (${(totalQuotedHours - totalExecutedHours).toFixed(1)}h margen restante)`
              : 'Sin techo comercial rígido'}
          </span>
        </div>

        {/* Avance Operativo Ponderado */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Avance Ponderado</span>
            <span className="p-1 rounded-lg bg-[#10b981]/10 text-[#10b981]">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#0f172a]">{progressPercent}%</span>
              <span className="text-xs text-[#64748b] font-medium">
                ({completedTasks} de {totalTasks} tareas)
              </span>
            </div>
            <div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                className="h-full rounded-full bg-[#10b981]"
              />
            </div>
          </div>
          <span className="text-[10px] text-[#64748b] mt-2 block">
            Ponderado por horas de tareas y entregables completados
          </span>
        </div>

        {/* Cronograma: Baseline vs Forecast */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Cronograma de Entrega</span>
            <span className="p-1 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6]">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748b] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#94a3b8]" /> Baseline fin:
              </span>
              <span className="font-bold text-[#334155]">{project.baselineEndDate || project.endDate || 'No fijada'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748b]">Forecast vigente:</span>
              <span className={`font-extrabold ${healthResult.vectors.schedule.deltaDays > 0 ? 'text-[#d97706]' : 'text-[#10b981]'}`}>
                {project.forecastEndDate || project.baselineEndDate || project.endDate || 'Al día'}
                {healthResult.vectors.schedule.deltaDays > 0 && ` (+${healthResult.vectors.schedule.deltaDays}d)`}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-[#64748b] mt-2 block">
            {healthResult.vectors.schedule.deltaDays === 0
              ? 'Sincronizado con el plan original'
              : `Desvío de ${healthResult.vectors.schedule.deltaDays} días hábiles vs plan original`}
          </span>
        </div>

        {/* Semáforo & Estado Explicable de Salud */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Salud del Proyecto</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                healthResult.status === 'healthy'
                  ? 'bg-[#10b981]'
                  : healthResult.status === 'attention'
                  ? 'bg-[#f59e0b]'
                  : 'bg-[#ef4444]'
              }`}
            />
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wide uppercase ${
                healthResult.status === 'healthy'
                  ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                  : healthResult.status === 'attention'
                  ? 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]'
                  : 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{healthResult.badge}</span>
            </span>
            <p className="text-[11px] text-[#475569] mt-2 font-medium line-clamp-2 leading-tight">
              {healthResult.primaryReason}
            </p>
            {healthResult.secondaryReason && (
              <p className="text-[10px] text-[#059669] mt-1 font-semibold line-clamp-1 italic">
                {healthResult.secondaryReason}
              </p>
            )}
          </div>
          <div className="text-[10px] text-[#94a3b8] mt-2 flex items-center justify-between">
            <span>Lead: <strong className="text-[#475569]">{project.leadName}</strong></span>
            {canConfirmReforecast && isFixed && (
              <button
                type="button"
                onClick={() => setIsReforecastModalOpen(true)}
                className="text-[10px] font-bold text-[#501f92] hover:underline cursor-pointer"
              >
                Ajustar forecast
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. GOBERNANZA DE CRONOGRAMA & VENTANAS DE CLIENTE (FIXED PROJECT) */}
      {isFixed && (
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#501f92]" />
                <h3 className="font-extrabold text-sm text-[#0f172a]">
                  Gobernanza de Cronograma & Tiempos de Espera del Cliente
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[#501f92]">
                  Baseline Inmutable
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Las ventanas de espera por cliente no consumen capacidad de los colaboradores y excluyen fines de semana y festivos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {canConfirmReforecast && (
                <button
                  type="button"
                  onClick={() => setIsReforecastModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf5ff] hover:bg-[#ede9fe] text-[#501f92] border border-[#ddd6fe] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reforecast controlado</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">Devolución de Kickoff</span>
              <p className="text-sm font-extrabold text-[#0f172a] mt-1">3 días hábiles (default)</p>
              <span className="text-[11px] text-[#64748b] mt-0.5 block">0h capacidad consumida</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">Gates de Aprobación</span>
              <p className="text-sm font-extrabold text-[#0f172a] mt-1">2 gates configurados</p>
              <span className="text-[11px] text-[#64748b] mt-0.5 block">5 días hábiles por gate (0h capacidad)</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">Historial de Reforecasts</span>
              <p className="text-sm font-extrabold text-[#0f172a] mt-1">{scheduleHistory.length} ajustes confirmados</p>
              <span className="text-[11px] text-[#64748b] mt-0.5 block">Trazabilidad inmutable de causa raíz</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECCIÓN DEPENDENCIAS E INSUMOS DE CLIENTE */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-[#501f92]" />
              <h3 className="font-extrabold text-sm text-[#0f172a]">
                Dependencias, Insumos & Aprobaciones de Cliente
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0369a1]">
                {dependencies.length} registradas
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Control de entregables bloqueados por accesos, manuales de marca o feedback del cliente.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtros de dependencias */}
            <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDepFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${depFilter === 'all' ? 'bg-white text-[#501f92] shadow-2xs font-bold' : 'text-[#64748b]'}`}
              >
                Todas ({dependencies.length})
              </button>
              <button
                type="button"
                onClick={() => setDepFilter('blocking')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${depFilter === 'blocking' ? 'bg-white text-[#501f92] shadow-2xs font-bold' : 'text-[#64748b]'}`}
              >
                Bloqueantes
              </button>
              <button
                type="button"
                onClick={() => setDepFilter('pending')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${depFilter === 'pending' ? 'bg-white text-[#501f92] shadow-2xs font-bold' : 'text-[#64748b]'}`}
              >
                Pendientes
              </button>
            </div>

            {canManageDependencies && (
              <button
                type="button"
                onClick={() => setIsNewDependencyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Insumo / Gate</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de dependencias */}
        {filteredDependencies.length === 0 ? (
          <div className="text-center py-8 bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1]">
            <Hourglass className="w-8 h-8 text-[#94a3b8] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-[#475569]">No hay dependencias registradas en este filtro</p>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              Registra insumos pendientes de cliente como manuales de marca, accesos o aprobaciones de gates.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredDependencies.map((dep) => {
              const todayStr = new Date().toISOString().slice(0, 10);
              const isOverdue = dep.status === 'pending' && dep.expectedDate && todayStr > dep.expectedDate;
              const delayDays = isOverdue ? calculateBusinessDays(dep.expectedDate, todayStr) : 0;

              return (
                <div
                  key={dep.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                    dep.status === 'received'
                      ? 'bg-[#f8fafc] border-[#e2e8f0] opacity-80'
                      : isOverdue
                      ? 'bg-[#fffbeb] border-[#fde68a]'
                      : 'bg-white border-[#e2e8f0]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        dep.status === 'received'
                          ? 'bg-[#ecfdf5] text-[#059669]'
                          : isOverdue
                          ? 'bg-[#fef2f2] text-[#dc2626]'
                          : 'bg-[#eff6ff] text-[#2563eb]'
                      }`}
                    >
                      {dep.status === 'received' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Hourglass className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#0f172a]">{dep.title}</span>
                        {dep.blocking && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fee2e2] text-[#991b1b]">
                            Bloqueante
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f1f5f9] text-[#475569]">
                          {dep.type === 'approval' ? 'Aprobación Gate' : dep.type === 'client_input' ? 'Insumo Cliente' : dep.type === 'access' ? 'Accesos' : 'Kickoff'}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
                            Vencido: +{delayDays} días hábiles
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#64748b] mt-1 flex-wrap">
                        <span>Esperado: <strong className="text-[#334155]">{dep.expectedDate}</strong></span>
                        <span>Seguimiento: <strong className="text-[#334155]">{dep.followUpOwnerName || 'Client Relationship'}</strong></span>
                        {dep.lastFollowUpAt && (
                          <span className="text-[#059669] font-medium">
                            Última gestión: {new Date(dep.lastFollowUpAt).toLocaleDateString('es-CO')}
                          </span>
                        )}
                      </div>

                      {dep.followUpNotes && (
                        <p className="text-[11px] text-[#475569] mt-1 italic bg-black/5 px-2 py-0.5 rounded-md">
                          "{dep.followUpNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {dep.status === 'pending' && canManageDependencies && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDependencyForFollowUp(dep);
                            setFollowUpNoteText(dep.followUpNotes || '');
                            setIsFollowUpModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] text-[#475569] text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1.5"
                          title="Registrar nota de seguimiento o contacto con cliente"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#501f92]" />
                          <span>Gestionar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkReceived(dep.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold cursor-pointer shadow-2xs flex items-center gap-1.5"
                          title="Marcar como recibido del cliente"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Marcar recibido</span>
                        </button>
                      </>
                    )}

                    {dep.status === 'received' && (
                      <span className="text-[11px] font-bold text-[#059669] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Recibido
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. SECCIÓN RONDAS DE AJUSTES & RETRABAJO (PROYECTOS FIXED) */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-[#501f92]" />
              <h3 className="font-extrabold text-sm text-[#0f172a]">
                Rondas de Ajuste & Retrabajos ({reworkRounds.length})
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#501f92]">
                2 rondas estándar incluidas
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Trazabilidad de iteraciones originadas por feedback de cliente, QA interno o cambios de alcance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNewReworkRoundModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar ronda</span>
            </button>
          </div>
        </div>

        {reworkRounds.length === 0 ? (
          <div className="text-center py-6 bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1]">
            <Repeat className="w-6 h-6 text-[#94a3b8] mx-auto mb-1 opacity-50" />
            <p className="text-xs font-bold text-[#475569]">Sin rondas de ajustes registradas</p>
            <p className="text-[11px] text-[#64748b]">El proyecto avanza en su primera entrega ordinaria sin reprocesos.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {reworkRounds.map((rw) => {
              const isAdditional = rw.roundNumber > (project.scheduleConfig?.includedReworkRounds ?? 2) || rw.isAdditionalIteration;

              return (
                <div
                  key={rw.id}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isAdditional ? 'bg-[#fffbeb] border-[#fde68a]' : 'bg-white border-[#e2e8f0]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAdditional ? 'bg-[#f59e0b] text-white' : 'bg-[#501f92] text-white'
                      }`}
                    >
                      R{rw.roundNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#0f172a]">Ronda {rw.roundNumber}</span>
                        {isAdditional && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                            Iteración adicional
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f1f5f9] text-[#475569]">
                          {rw.cause === 'client_adjustment'
                            ? 'Feedback de Cliente'
                            : rw.cause === 'scope_redefinition'
                            ? 'Redefinición de Alcance'
                            : 'QA / Error Interno'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#475569] mt-1">
                        {rw.note || 'Ajustes solicitados sobre la versión entregada'}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#64748b] text-right shrink-0">
                    <span>{rw.estimatedHours || 0}h estimadas</span>
                    <span className="block text-[10px] text-[#94a3b8]">{rw.createdByName || 'Equipo Uhura'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: RECALCULAR CRONOGRAMA (REFORECAST CONFIRMADO POR LÍDER) */}
      {isReforecastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center">
                  <RotateCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0f172a]">Recalcular Cronograma Oficial</h3>
                  <p className="text-xs text-[#64748b]">Aprobación exclusiva de Líder o Dirección Ejecutiva</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReforecastModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#0f172a] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Baseline inmutable:</span>
                  <span className="font-bold text-[#0f172a]">{project.baselineEndDate || project.endDate || 'No fijada'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Forecast vigente:</span>
                  <span className="font-bold text-[#0f172a]">{project.forecastEndDate || project.baselineEndDate || 'No fijada'}</span>
                </div>
                <div className="flex justify-between border-t border-[#e2e8f0] pt-1 mt-1 text-[#501f92]">
                  <span className="font-bold">Nuevo forecast proyectado:</span>
                  <span className="font-extrabold">
                    {addBusinessDays(project.forecastEndDate || project.baselineEndDate || '2026-10-30', reforecastDeltaDays)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Desplazamiento en Días Hábiles:
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={reforecastDeltaDays}
                  onChange={(e) => setReforecastDeltaDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs font-bold focus:outline-hidden focus:border-[#501f92]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Causa Raíz Principal del Desvío:
                </label>
                <select
                  value={reforecastCause}
                  onChange={(e) => setReforecastCause(e.target.value as ScheduleChangeCause)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs font-bold focus:outline-hidden focus:border-[#501f92]"
                >
                  <option value="client_approval_delay">Aprobación / Feedback tardío de cliente (Gate)</option>
                  <option value="client_input_delay">Insumo o accesos pendientes del cliente</option>
                  <option value="internal_rework">Retrabajo interno / QA de Uhura</option>
                  <option value="internal_execution_delay">Desvío operativo interno por complejidad</option>
                  <option value="scope_change">Cambio de alcance acordado</option>
                  <option value="other">Otro motivo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Justificación / Nota de Auditoría:
                </label>
                <textarea
                  rows={3}
                  value={reforecastNote}
                  onChange={(e) => setReforecastNote(e.target.value)}
                  placeholder="Detalla la razón del recalculo para constancia en el cierre del proyecto..."
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-hidden focus:border-[#501f92]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsReforecastModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReforecast}
                className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Confirmar y Desplazar Tareas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NUEVA DEPENDENCIA / INSUMO DE CLIENTE */}
      {isNewDependencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-[#501f92]" />
                <h3 className="text-base font-extrabold text-[#0f172a]">Registrar Insumo o Gate</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDependencyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#0f172a] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDependency} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Título del Insumo / Gate:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Manual de Marca, Aprobación Gate 1, Credenciales hosting"
                  value={newDepTitle}
                  onChange={(e) => setNewDepTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-hidden focus:border-[#501f92]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Tipo:</label>
                  <select
                    value={newDepType}
                    onChange={(e) => setNewDepType(e.target.value as ProjectDependencyType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-hidden focus:border-[#501f92]"
                  >
                    <option value="approval">Aprobación / Gate</option>
                    <option value="client_input">Insumo del Cliente</option>
                    <option value="access">Accesos / Credenciales</option>
                    <option value="kickoff_input">Respuestas Kickoff</option>
                    <option value="internal_dependency">Dependencia Interna</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Fecha Acordada:</label>
                  <input
                    type="date"
                    required
                    value={newDepExpectedDate}
                    onChange={(e) => setNewDepExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-hidden focus:border-[#501f92]"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Responsable de Seguimiento:</label>
                <select
                  value={newDepFollowUpOwnerId}
                  onChange={(e) => setNewDepFollowUpOwnerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-hidden focus:border-[#501f92]"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.jobTitle || u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dep-blocking-check"
                  checked={newDepBlocking}
                  onChange={(e) => setNewDepBlocking(e.target.checked)}
                  className="w-4 h-4 rounded text-[#501f92] focus:ring-[#501f92]"
                />
                <label htmlFor="dep-blocking-check" className="text-xs font-bold text-[#334155] cursor-pointer">
                  Es un insumo bloqueante (afecta la ruta crítica del proyecto)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setIsNewDependencyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Guardar insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR GESTIÓN / SEGUIMIENTO AUDITABLE */}
      {isFollowUpModalOpen && selectedDependencyForFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#501f92]" />
                <h3 className="text-base font-extrabold text-[#0f172a]">Registrar Gestión con Cliente</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#0f172a] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-xs text-[#64748b]">
                Insumo: <strong className="text-[#0f172a]">{selectedDependencyForFollowUp.title}</strong>
              </p>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  Nota de Seguimiento / Respuesta del Cliente:
                </label>
                <textarea
                  rows={4}
                  required
                  value={followUpNoteText}
                  onChange={(e) => setFollowUpNoteText(e.target.value)}
                  placeholder="ej. Se contactó a contacto del cliente por correo/WhatsApp; confirmaron que revisan en comité mañana..."
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-hidden focus:border-[#501f92]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsFollowUpModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFollowUp}
                className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Registrar seguimiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REGISTRAR RONDA DE AJUSTES */}
      {isNewReworkRoundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-[#501f92]" />
                <h3 className="text-base font-extrabold text-[#0f172a]">
                  Registrar Ronda {reworkRounds.length + 1} de Ajustes
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewReworkRoundModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#0f172a] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReworkRound} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Causa del Ajuste:</label>
                <select
                  value={reworkCause}
                  onChange={(e) => setReworkCause(e.target.value as ReworkRoundCause)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-hidden focus:border-[#501f92]"
                >
                  <option value="client_adjustment">Feedback ordinario de cliente (dentro de lo previsto)</option>
                  <option value="internal_adjustment">QA / Corrección de error interno de Uhura</option>
                  <option value="scope_redefinition">Redefinición de alcance / Nuevo requerimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Horas Estimadas de Ejecución:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={reworkEstHours}
                  onChange={(e) => setReworkEstHours(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-hidden focus:border-[#501f92]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Descripción de los Ajustes:</label>
                <textarea
                  rows={3}
                  required
                  value={reworkNote}
                  onChange={(e) => setReworkNote(e.target.value)}
                  placeholder="Detalla el feedback entregado por el cliente o las correcciones técnicas requeridas..."
                  className="w-full px-3 py-2 rounded-xl border border-[#cbd5e1] text-xs focus:outline-hidden focus:border-[#501f92]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setIsNewReworkRoundModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Guardar ronda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
