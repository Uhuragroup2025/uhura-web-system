import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  RotateCw,
  Users,
  ChevronRight,
  Info,
  Lock,
  ArrowRight,
  X,
  FileSpreadsheet
} from 'lucide-react';
import {
  ProjectSummaryItem,
  ProjectDeliverable,
  ProjectTeamMember,
  TaskItem,
  ProjectScheduleChange,
  ScheduleChangeCause,
  UserItem,
  normalizeProjectType
} from '../types';
import { UserAvatar } from '../UserAvatar';
import { evaluateProjectHealth, calculateBusinessDays, addBusinessDays } from '../health/projectHealthEngine';
import { ProjectTeamTab } from './ProjectTeamTab';

interface ProjectOverviewTabProps {
  project: ProjectSummaryItem & {
    consumedHours: number;
    tasks: TaskItem[];
  };
  deliverables: ProjectDeliverable[];
  coreTeam: ProjectTeamMember[];
  allProjects?: ProjectSummaryItem[];
  allTasks?: TaskItem[]; // Todas las tareas (capacidad global del equipo)
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
  allProjects = [],
  allTasks,
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

  // Modal states
  const [isReforecastModalOpen, setIsReforecastModalOpen] = useState(false);

  // Reforecast form state
  const [reforecastDeltaDays, setReforecastDeltaDays] = useState<number>(3);
  const [reforecastCause, setReforecastCause] = useState<ScheduleChangeCause>('client_approval_delay');
  const [reforecastNote, setReforecastNote] = useState<string>('');

  // RBAC Permission Check
  const canConfirmReforecast = useMemo(() => {
    if (!currentUser) return true;
    const level = currentUser.accessLevel || 'collaborator';
    return level === 'leader' || level === 'executive' || currentUser.role === 'Admin';
  }, [currentUser]);

  // Project Health Evaluation
  const healthResult = useMemo(() => {
    return evaluateProjectHealth({
      project,
      customTasks: project.tasks
    });
  }, [project]);

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completed || t.status === 'Done' || t.status === 'completed').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Dependencies & Schedule history
  const dependencies = project.dependencies || [];
  const scheduleHistory: ProjectScheduleChange[] = project.scheduleHistory || [];

  // Suggestion of delay
  const pendingBlockingOverdueDeps = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return dependencies.filter(
      (d) => d.blocking && d.status === 'pending' && d.expectedDate && todayStr > d.expectedDate
    );
  }, [dependencies]);

  const suggestedShiftDays = useMemo(() => {
    if (pendingBlockingOverdueDeps.length === 0) return 0;
    const todayStr = new Date().toISOString().slice(0, 10);
    const maxDelay = pendingBlockingOverdueDeps.reduce((max, d) => {
      const delay = calculateBusinessDays(d.expectedDate, todayStr);
      return Math.max(max, delay);
    }, 0);
    return Math.max(1, maxDelay);
  }, [pendingBlockingOverdueDeps]);

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
      confirmedByName: currentUser?.name || 'Líder Operativo',
      note: reforecastNote.trim() || 'Reforecast aprobado por líder de proyecto',
      createdAt: new Date().toISOString()
    };

    const updatedTasks = project.tasks.map((task) => {
      if (task.completed || task.status === 'Done' || task.status === 'completed') {
        return task;
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f1f5f9] text-[#64748b] text-xs font-medium border border-[#cbd5e1]">
                <Lock className="w-3.5 h-3.5 text-[#94a3b8]" />
                <span>Aprobación de líder requerida</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. ESTRUCTURA OPERATIVA Y ENTREGABLES HEREDADOS (SOLUCIÓN DIRECTA A "NO VI TAREAS") */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#501f92]/10 text-[#501f92]">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-[#0f172a]">
                  Entregables ({deliverables.length})
                </h2>
                <p className="text-xs text-[#64748b]">
                  {totalTasks} tareas · clic en un entregable para ver sus tareas
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTasks()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <span>Ver tareas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Deliverables Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {deliverables.map((del, idx) => {
            const delTasks = project.tasks.filter((t) => t.deliverableId === del.id || t.frente === del.name);
            const completedCount = delTasks.filter((t) => t.completed || t.status === 'Done' || t.status === 'completed').length;
            const delQuotedHours = del.roleBudgets?.reduce((sum, r) => sum + (r.quotedHours || 0), 0) || del.totalQuotedHours || 0;
            const delExecutedHours = delTasks.reduce((sum, t) => sum + ((t.consumedSeconds || 0) / 3600), 0);
            const delPct = delTasks.length > 0 ? Math.round((completedCount / delTasks.length) * 100) : 0;

            return (
              <div
                key={del.id || idx}
                onClick={() => onNavigateToTasks(del.name)}
                className="p-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc]/50 hover:bg-white hover:border-[#501f92] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#ede9fe] text-[#501f92]">
                      Entregable {del.order || idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-[#64748b]">
                      {delQuotedHours}h cotizadas
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-[#0f172a] mt-2 group-hover:text-[#501f92] transition-colors">
                    {del.name}
                  </h3>

                  {del.description && (
                    <p className="text-xs text-[#64748b] mt-1 line-clamp-2">
                      {del.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#e2e8f0]/80">
                  <div className="flex items-center justify-between text-xs text-[#64748b]">
                    <span className="font-medium">
                      {delTasks.length} tareas ({completedCount} completadas)
                    </span>
                    <span className="font-bold text-[#0f172a]">{delPct}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden mt-1.5">
                    <div
                      style={{ width: `${delPct}%` }}
                      className="h-full rounded-full bg-[#10b981]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. GOBERNANZA DE ALCANCE & APROBACIONES (PROYECTO ÚNICO) */}
      {isFixed && (
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#501f92]" />
                <h3 className="font-extrabold text-sm text-[#0f172a]">
                  Cronograma y rondas de ajuste
                </h3>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Tiempos del cliente incluidos en la línea base. No consumen capacidad del equipo.
              </p>
            </div>

            {canConfirmReforecast && (
              <button
                type="button"
                onClick={() => setIsReforecastModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf5ff] hover:bg-[#ede9fe] text-[#501f92] border border-[#ddd6fe] text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reforecast controlado</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Rondas de ajuste (una ronda = el cliente revisa, devuelve ajustes y aprueba) */}
            <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">Rondas de ajuste</span>
              <p className="text-sm font-extrabold text-[#0f172a] mt-1">
                {(project.reworkRounds || []).filter((r) => r.cause === 'client_adjustment').length} usadas de {project.scheduleConfig?.includedReworkRounds ?? 2}
              </p>
              <span className="text-[11px] text-[#64748b] mt-0.5 block">{project.scheduleConfig?.reworkRoundDays ?? 5} días hábiles por ronda · incluidas en el plan</span>
            </div>

            {/* Insumos del cliente tras el kickoff */}
            <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">Insumos del cliente</span>
              <p className="text-sm font-extrabold text-[#0f172a] mt-1">{project.scheduleConfig?.clientKickoffWaitDays ?? 3} días hábiles</p>
              <span className="text-[11px] text-[#64748b] mt-0.5 block">Tras el kickoff · no consume capacidad del equipo</span>
            </div>

            {/* Cambios de cronograma (la fecha vigente está en el KPI «Cronograma») */}
            <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">Cambios de cronograma</span>
              <p className="text-sm font-extrabold text-[#0f172a] mt-1">
                {scheduleHistory.length} reforecast{scheduleHistory.length !== 1 ? 's' : ''}
              </p>
              <span className="text-[11px] text-[#64748b] mt-0.5 block">
                {project.baselineEndDate ? `Línea base: ${project.baselineEndDate}` : 'Línea base al iniciar el proyecto'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. EQUIPO DEL PROYECTO & ASIGNACIÓN (TABLA COMPLETA CON CAPACIDAD GLOBAL) */}
      <div className="pt-2">
        <ProjectTeamTab
          hideHeaderMetrics={true}
          project={project}
          allProjects={allProjects}
          users={allUsers}
          tasks={project.tasks}
          allTasks={allTasks}
          onUpdateProject={(updated) => onUpdateProject?.(updated)}
        />
      </div>

      {/* MODAL: RECALCULAR CRONOGRAMA (REFORECAST CONFIRMADO POR LÍDER) */}
      {isReforecastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-[#0f172a] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-5 animate-in zoom-in-95 duration-150">
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
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Desplazamiento en Días Hábiles:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReforecastDeltaDays((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] active:scale-95 text-[#0f172a] font-black text-lg flex items-center justify-center border border-[#cbd5e1] cursor-pointer transition-all select-none shadow-2xs"
                  >
                    -
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={reforecastDeltaDays}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        setReforecastDeltaDays(isNaN(parsed) ? 1 : Math.max(1, Math.min(60, parsed)));
                      }}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#cbd5e1] bg-white text-[#0f172a] text-center text-sm font-extrabold focus:outline-none focus:border-[#501f92]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setReforecastDeltaDays((prev) => Math.min(60, prev + 1))}
                    className="w-10 h-10 rounded-xl bg-[#501f92] hover:bg-[#381566] active:scale-95 text-white font-black text-lg flex items-center justify-center transition-all cursor-pointer select-none shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Causa Raíz Principal del Desvío:
                </label>
                <select
                  value={reforecastCause}
                  onChange={(e) => setReforecastCause(e.target.value as ScheduleChangeCause)}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#cbd5e1] bg-white text-[#0f172a] text-xs font-bold focus:outline-none focus:border-[#501f92]"
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
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Justificación / Nota de Auditoría:
                </label>
                <textarea
                  rows={3}
                  value={reforecastNote}
                  onChange={(e) => setReforecastNote(e.target.value)}
                  placeholder="Detalla la razón del recálculo para constancia en el cierre del proyecto..."
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#cbd5e1] bg-white text-[#0f172a] placeholder:text-[#7C8AA0] text-xs font-medium focus:outline-none focus:border-[#501f92]"
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
    </div>
  );
};
