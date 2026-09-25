import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Square,
  Plus,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Check,
  MessageSquare,
  X,
  Send,
  Layers,
  ChevronRight,
  ChevronDown,
  Repeat,
  Flame,
  Trash2,
  ArrowRight,
  Briefcase,
  Building2,
  Sparkles,
  UserCheck,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  TaskItem,
  ActiveTimerState,
  OrbitView,
  UserItem,
  TimeLog
} from './types';
import { getUserAccessLevel, can } from './auth/permissions';

export interface MiDiaViewProps {
  tasks: TaskItem[];
  currentUser?: UserItem;
  timeLogs?: TimeLog[];
  onDeleteTimeLog?: (id: string) => void;
  activeTimer: ActiveTimerState | null;
  onStartTimer: (task: TaskItem) => void;
  onPauseResumeTimer?: () => void;
  onStopTimer: () => void;
  onOpenTaskDetail: (taskId: string) => void;
  onOpenManualLog: (taskId?: string) => void;
  onToggleTask: (taskId: string) => void;
  onQuickLogHours: (hours: number, label: string, category?: 'client' | 'internal', projectName?: string) => void;
  loggedHoursToday?: number;
  configuredCapacityHours?: number;
  targetDayHours?: number;
  onNavigateToView?: (view: OrbitView) => void;
  opportunities?: any[];
  projects?: any[];
  clients?: any[];
}

export const MiDiaView: React.FC<MiDiaViewProps> = ({
  tasks,
  currentUser,
  timeLogs = [],
  onDeleteTimeLog,
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onStopTimer,
  onOpenTaskDetail,
  onOpenManualLog,
  onToggleTask,
  onQuickLogHours,
  loggedHoursToday = 5.5,
  configuredCapacityHours = 8.0,
  targetDayHours = 8.0,
  onNavigateToView,
  opportunities = [],
  projects = [],
  clients = []
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLogsAccordionOpen, setIsLogsAccordionOpen] = useState(false);
  const [chatModalTask, setChatModalTask] = useState<TaskItem | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('Complejidad técnica superior a la prevista');
  const [extraHoursEstimate, setExtraHoursEstimate] = useState<number>(1.5);
  const [notifiedTasks, setNotifiedTasks] = useState<Record<string, { extraHours: number; reason: string; timestamp: string }>>({});

  // 1. RBAC & Identity Resolution
  const accessLevel = currentUser ? getUserAccessLevel(currentUser) : 'leader';
  const currentUserName = currentUser?.name || 'Paola Monsalve';
  const currentUserId = currentUser?.id || 'u-2';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 2. Filtrado de tareas asignadas al usuario actual
  const assignedTasks = useMemo(() => {
    const cId = currentUserId.toLowerCase();
    const cName = currentUserName.toLowerCase();

    return tasks.filter((t) => {
      const matchAssignee =
        t.assignee?.id?.toLowerCase() === cId ||
        t.assignee?.name?.toLowerCase().includes(cName) ||
        cName.includes(t.assignee?.name?.toLowerCase() || '___');
      const matchCollab = t.collaborators?.some(
        (c) => c.name?.toLowerCase().includes(cName)
      );
      return matchAssignee || matchCollab;
    });
  }, [tasks, currentUserId, currentUserName]);

  // Si para un usuario específico no hay tareas asignadas en mockData, permitir fallback a tareas de demostración de su rol
  const activeUserTasks = useMemo(() => {
    if (assignedTasks.length > 0) return assignedTasks;
    if (accessLevel === 'executive') return [];
    // Si no tiene asignadas en mockData, mostrar un conjunto mínimo representativo
    return tasks.slice(0, 3);
  }, [assignedTasks, accessLevel, tasks]);

  // 3. MATRIZ DE PERSPECTIVA POR ROL — EVALUACIÓN DE ELEMENTOS DE ATENCIÓN
  // Retrabajos / Ajustes urgentes
  const reworkTasks = useMemo(() => {
    if (!['collaborator', 'leader', 'client_relationship', 'executive', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    const pool = accessLevel === 'collaborator' ? activeUserTasks : tasks;
    return pool.filter((t) => !t.completed && (t.isRework || (t.reworkRound && t.reworkRound > 0)));
  }, [accessLevel, activeUserTasks, tasks]);

  // Revisiones pendientes
  const reviewTasks = useMemo(() => {
    if (!['leader', 'client_relationship', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    return tasks.filter((t) => !t.completed && (t.status === 'Review' || t.status === 'in_review'));
  }, [accessLevel, tasks]);

  // Bloqueos propios
  const ownBlockedTasks = useMemo(() => {
    if (!['collaborator', 'leader', 'client_relationship', 'commercial', 'administrative', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    return activeUserTasks.filter((t) => !t.completed && Boolean(t.isBlocked || t.blockedReason));
  }, [accessLevel, activeUserTasks]);

  // Bloqueos de equipo (para líderes / executive)
  const teamBlockedTasks = useMemo(() => {
    if (!['leader', 'executive', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    return tasks.filter((t) => !t.completed && Boolean(t.isBlocked || t.blockedReason));
  }, [accessLevel, tasks]);

  // Desvíos de presupuesto / Entregables en riesgo (horas ejecutadas > presupuestadas)
  const overtimeRisks = useMemo(() => {
    if (!['collaborator', 'leader', 'client_relationship', 'executive', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    const pool = accessLevel === 'collaborator' ? activeUserTasks : tasks;
    return pool.filter((t) => {
      if (t.completed) return false;
      const consumedHrs = (t.consumedSeconds || 0) / 3600;
      const budgeted = t.budgetedHours || 0;
      return budgeted > 0 && consumedHrs > budgeted;
    });
  }, [accessLevel, activeUserTasks, tasks]);

  // New Business que requiere acción (cotizaciones pendientes de aprobación o briefs por dimensionar)
  const newBusinessActions = useMemo(() => {
    if (!['leader', 'commercial', 'executive', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    return opportunities.filter((o) => {
      const isActionableStatus =
        o.status === 'discovery' || o.status === 'quoting' || o.status === 'internal_review';
      if (!isActionableStatus) return false;

      // Si es rol líder, filtrar dinámicamente según su leadUserId o nombre de usuario
      if (accessLevel === 'leader') {
        const matchesId = o.leadUserId === currentUserId;
        const matchesName =
          o.leadUserName &&
          o.leadUserName.toLowerCase().includes(currentUserName.toLowerCase());
        return matchesId || matchesName;
      }
      return true;
    });
  }, [accessLevel, opportunities, currentUserId, currentUserName]);

  // Formalizaciones administrativas pendientes (proyectos ganados sin NIT o datos de facturación)
  const fiscalPendingActions = useMemo(() => {
    if (!['commercial', 'administrative', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    return clients.filter((c) => !c.nit || c.nit.includes('Por definir'));
  }, [accessLevel, clients]);

  // Total de elementos accionables de atención
  const totalAttentionCount =
    reworkTasks.length +
    reviewTasks.length +
    ownBlockedTasks.length +
    (accessLevel !== 'collaborator' ? teamBlockedTasks.length : 0) +
    overtimeRisks.length +
    newBusinessActions.length +
    fiscalPendingActions.length;

  const hasAttentionItems = totalAttentionCount > 0;

  // 4. Time Logs de hoy para este usuario
  const todayLogs = useMemo(() => {
    return timeLogs.filter((l) => {
      const matchUser =
        !currentUser ||
        l.userId === currentUserId ||
        l.userName?.toLowerCase().includes(currentUserName.toLowerCase()) ||
        l.userName?.toLowerCase().includes('paola');
      return matchUser;
    });
  }, [timeLogs, currentUser, currentUserId, currentUserName]);

  // Horas asignadas de tareas activas
  const assignedHoursToday = useMemo(() => {
    return activeUserTasks
      .filter((t) => !t.completed)
      .reduce((sum, t) => sum + (t.budgetedHours || 2), 0);
  }, [activeUserTasks]);

  const availableCapacityHours = Math.max(0, configuredCapacityHours - assignedHoursToday);
  const isOverCapacity = assignedHoursToday > configuredCapacityHours;

  const handleSendChatNotification = () => {
    if (!chatModalTask) return;
    setNotifiedTasks((prev) => ({
      ...prev,
      [chatModalTask.id]: {
        extraHours: extraHoursEstimate,
        reason: selectedReason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }));
    showToast(`Alerta de desvío (+${extraHoursEstimate}h) enviada al canal del proyecto.`);
    setChatModalTask(null);
  };

  const isExecutive = accessLevel === 'executive';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0f172a] text-white text-xs font-semibold shadow-xl border border-white/10 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#d4ff4a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3 NIVELES ESTRUCTURALES DE MI DÍA (LIMPIO, SIN COLUMNA LATERAL) */}
      <div className="space-y-6 max-w-6xl mx-auto">

          {/* NIVEL 1: ¿QUÉ REQUIERE MI ATENCIÓN? (CONDICIONAL ESTRICTO: 0 SI NO HAY ACCIONES) */}
          {hasAttentionItems && (
            <div className="bg-[#fffbeb] rounded-3xl p-5 border border-[#fde68a] shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#fef3c7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#f59e0b]/20 text-[#b45309] flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#92400e]">
                      ¿Qué requiere mi atención?
                    </h2>
                    <p className="text-[11px] text-[#b45309]">
                      {totalAttentionCount} asunto{totalAttentionCount > 1 ? 's' : ''} que demanda{totalAttentionCount > 1 ? 'n' : ''} acción o decisión hoy
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fde68a] text-[#78350f]">
                  Prioritario
                </span>
              </div>

              {/* Lista lineal de alertas de atención */}
              <div className="space-y-2">
                {/* 1. Retrabajos / Ajustes urgentes */}
                {reworkTasks.map((t) => (
                  <div
                    key={`rework-${t.id}`}
                    className="p-3 rounded-2xl bg-white border border-[#fde68a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <Repeat className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#0f172a]">{t.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#fee2e2] text-[#991b1b]">
                            Ajuste Ronda {t.reworkRound || 1}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748b] block mt-0.5">
                          {t.clientName || 'Cliente'} • {t.reworkReason || 'Ajustes requeridos'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenTaskDetail(t.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#dc2626] text-white font-bold hover:bg-[#b91c1c] transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      Atender ajuste
                    </button>
                  </div>
                ))}

                {/* 2. Revisiones pendientes */}
                {reviewTasks.map((t) => (
                  <div
                    key={`review-${t.id}`}
                    className="p-3 rounded-2xl bg-white border border-[#fde68a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#8a4dff] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0f172a]">{t.title}</span>
                        <span className="text-[11px] text-[#64748b] block mt-0.5">
                          Entregable listo para revisión de calidad o aprobación de cliente
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenTaskDetail(t.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#501f92] text-white font-bold hover:bg-[#381566] transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      Revisar pieza
                    </button>
                  </div>
                ))}

                {/* 3. Bloqueos de tareas */}
                {ownBlockedTasks.map((t) => (
                  <div
                    key={`blocked-${t.id}`}
                    className="p-3 rounded-2xl bg-white border border-[#fecaca] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertOctagon className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0f172a]">{t.title}</span>
                        <span className="text-[11px] text-[#991b1b] block mt-0.5">
                          Tarea bloqueada por dependencias o insumos de cliente
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenTaskDetail(t.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] font-bold hover:bg-[#fee2e2] transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      Ver bloqueo
                    </button>
                  </div>
                ))}

                {/* 4. Desvíos presupuestales activos */}
                {overtimeRisks.map((t) => {
                  const consumedHrs = ((t.consumedSeconds || 0) / 3600).toFixed(1);
                  const isNotified = Boolean(notifiedTasks[t.id]);
                  return (
                    <div
                      key={`overtime-${t.id}`}
                      className="p-3 rounded-2xl bg-white border border-[#fed7aa] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <Flame className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#0f172a]">{t.title}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
                              {consumedHrs}h / {t.budgetedHours}h cotizadas
                            </span>
                          </div>
                          <span className="text-[11px] text-[#64748b] block mt-0.5">
                            {t.clientName || 'Cliente'} • Horas ejecutadas superaron la estimación original
                          </span>
                        </div>
                      </div>

                      {isNotified ? (
                        <span className="px-2.5 py-1 rounded-xl bg-[#ecfdf5] text-[#059669] font-bold border border-[#a7f3d0] text-[11px]">
                          ✓ Desvío Notificado
                        </span>
                      ) : (
                        <button
                          onClick={() => setChatModalTask(t)}
                          className="px-3 py-1.5 rounded-xl bg-[#ea580c] text-white font-bold hover:bg-[#c2410c] transition-colors self-start sm:self-auto cursor-pointer flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Avisar en chat</span>
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* 5. New business: Brief asignado / Scoping pendiente */}
                {newBusinessActions.map((opp) => {
                  const scopingTask = tasks.find(
                    (t) =>
                      t.id === opp.preventaTimeLogTaskId ||
                      (opp.title && t.title.includes(opp.title) && (t.clientName === 'UHURA Group' || t.board === 'New Business' || t.projectId === 'prj-uhu-3'))
                  );
                  const isTimerRunningOnScoping = activeTimer?.taskId === scopingTask?.id;
                  const isAssignedToCurrentUser =
                    opp.leadUserId === currentUserId ||
                    (opp.leadUserName && opp.leadUserName.toLowerCase().includes(currentUserName.toLowerCase()));
                  const assignedLeadDisplay = opp.leadUserName?.split('·')[0]?.trim() || 'Líder Asignado';
                  const oppHandoffSla = opp.handoffHours || 36;

                  return (
                    <div
                      key={`nb-${opp.id}`}
                      className="p-3.5 rounded-2xl bg-white border border-[#c084fc] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-[#8a4dff]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-[#0f172a]">
                              {opp.prospectAccountName || opp.clientName || 'Nuevo Prospecto'} · {opp.title}
                            </span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#501f92]/10 text-[#501f92]">
                              🟣 Nuevo brief asignado
                            </span>
                            <span className="text-[10px] text-[#0284c7] font-mono">
                              SLA ~{oppHandoffSla}h handoff
                            </span>
                          </div>
                          <span className="text-[11px] text-[#64748b] block mt-0.5">
                            {isAssignedToCurrentUser
                              ? 'Comercial te asignó el scoping'
                              : `Asignado a: ${assignedLeadDisplay}`}{' '}
                            • Imputación de horas a: <strong>UHURA Group → New Business</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {scopingTask && (
                          <button
                            type="button"
                            onClick={() => onStartTimer(scopingTask)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                              isTimerRunningOnScoping
                                ? 'bg-[#ef4444] text-white animate-pulse'
                                : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a]'
                            }`}
                            title="Iniciar timer para imputar horas de preventa a UHURA Group / New Business"
                          >
                            <Play className="w-3.5 h-3.5 text-[#501f92]" />
                            <span>{isTimerRunningOnScoping ? 'Grabando...' : 'Timer Preventa'}</span>
                          </button>
                        )}
                        {onNavigateToView && (
                          <button
                            onClick={() => onNavigateToView('new-business')}
                            className="px-3.5 py-1.5 rounded-xl bg-[#501f92] text-white font-bold hover:bg-[#3d1572] transition-colors cursor-pointer shadow-2xs"
                          >
                            Abrir oportunidad →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 6. Formalizaciones fiscales */}
                {fiscalPendingActions.slice(0, 2).map((c) => (
                  <div
                    key={`fiscal-${c.id}`}
                    className="p-3 rounded-2xl bg-white border border-[#fde68a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <Building2 className="w-4 h-4 text-[#64748b] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0f172a]">{c.name}</span>
                        <span className="text-[11px] text-[#64748b] block mt-0.5">
                          Cliente ganado pendiente de NIT y formalización fiscal para facturación
                        </span>
                      </div>
                    </div>

                    {onNavigateToView && (
                      <button
                        onClick={() => onNavigateToView('clientes')}
                        className="px-3 py-1.5 rounded-xl bg-[#f1f5f9] text-[#0f172a] font-bold hover:bg-[#e2e8f0] transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        Completar datos
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NIVEL 2: ¿QUÉ TENGO QUE HACER HOY? (PROTAGONISTA) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f1f5f9]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight">
                    ¿Qué tengo que hacer hoy?
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#0f172a]">
                    {activeUserTasks.filter((t) => !t.completed).length} pendiente{activeUserTasks.filter((t) => !t.completed).length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Tus misiones y entregables con fecha comprometida para hoy
                </p>
              </div>

              {/* Indicador sutil de carga/disponibilidad personal */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    isOverCapacity
                      ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
                      : 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
                  }`}
                >
                  {isOverCapacity
                    ? `⚠️ Carga alta: ${assignedHoursToday.toFixed(1)}h planificadas`
                    : `🟢 Carga saludable: ${assignedHoursToday.toFixed(1)}h / ${configuredCapacityHours}h`}
                </span>
              </div>
            </div>

            {/* Caso Executive sin tareas asignadas */}
            {isExecutive && activeUserTasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Operación sin excepciones directas
                </h3>
                <p className="text-xs text-[#64748b] max-w-md mx-auto">
                  Como perfil ejecutivo no tienes tareas operativas de producción asignadas para hoy. Tu foco está en las excepciones y decisiones arriba notificadas.
                </p>
              </div>
            ) : activeUserTasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-center space-y-2">
                <p className="text-xs font-semibold text-[#64748b]">
                  No tienes tareas programadas para hoy en tu tablero personal.
                </p>
                <p className="text-[11px] text-[#94a3b8]">
                  Puedes registrar horas de soporte libre o revisar el backlog de Proyectos.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeUserTasks.map((task) => {
                  const isTimerActiveForThisTask = activeTimer?.taskId === task.id;
                  const consumedHrs = ((task.consumedSeconds || 0) / 3600).toFixed(1);
                  const budgetedHrs = (task.budgetedHours || 2).toFixed(1);
                  const isOverBudget = Number(consumedHrs) > Number(budgetedHrs);

                  return (
                    <div
                      key={task.id}
                      className={`group p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        task.completed
                          ? 'bg-[#f8fafc] border-[#e2e8f0] opacity-60'
                          : isTimerActiveForThisTask
                          ? 'bg-[#fbf9ff] border-2 border-[#8a4dff] shadow-sm'
                          : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Checkbox + Titulo + Metadatos */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className="mt-0.5 shrink-0 text-[#94a3b8] hover:text-[#501f92] transition-colors cursor-pointer"
                            title={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#cbd5e1] hover:text-[#8a4dff]" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3
                                onClick={() => onOpenTaskDetail(task.id)}
                                className={`text-xs sm:text-sm font-bold truncate cursor-pointer hover:text-[#501f92] ${
                                  task.completed ? 'line-through text-[#64748b]' : 'text-[#0f172a]'
                                }`}
                              >
                                {task.title}
                              </h3>

                              {task.isRework && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#fee2e2] text-[#991b1b]">
                                  Ajuste R{task.reworkRound || 1}
                                </span>
                              )}

                              {isOverBudget && !task.completed && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
                                  Desvío {consumedHrs}h/{budgetedHrs}h
                                </span>
                              )}

                              {isTimerActiveForThisTask && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8a4dff] text-white flex items-center gap-1 animate-pulse">
                                  <Clock className="w-3 h-3" />
                                  <span>En curso</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-[#64748b] mt-1 flex-wrap">
                              <span className="font-semibold text-[#501f92]">
                                {task.clientName || 'Uhura'}
                              </span>
                              <span>•</span>
                              <span className="truncate">{task.projectName || task.board}</span>
                              <span>•</span>
                              <span className="font-mono">
                                {task.budgetedRoleId || 'Colaborador'} ({consumedHrs}h / {budgetedHrs}h)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Botones de acción directa: Timer & Detalle */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isTimerActiveForThisTask ? (
                            <button
                              onClick={onStopTimer}
                              className="px-3 py-1.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              title="Detener timer y registrar sesión"
                            >
                              <Square className="w-3 h-3 fill-current" />
                              <span className="hidden sm:inline">Detener</span>
                            </button>
                          ) : !task.completed ? (
                            <button
                              onClick={() => onStartTimer(task)}
                              className="px-3 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              title="Iniciar timer para esta tarea"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span className="hidden sm:inline">Iniciar</span>
                            </button>
                          ) : null}

                          <button
                            onClick={() => onOpenTaskDetail(task.id)}
                            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                            title="Ver detalles de la tarea"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* NIVEL 3: ¿CÓMO VOY? (BALANCE COMPACTO, TIMER, CARGA RÁPIDA Y LOGS DE HOY) */}
          {!isExecutive && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight">
                    ¿Cómo voy?
                  </h2>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Balance de jornada y registro de tiempo activo
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenManualLog()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Cargar horas manual</span>
                  </button>
                </div>
              </div>

              {/* Barra de progreso de la jornada */}
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0f172a]">
                    Horas registradas hoy: <span className="font-mono text-sm text-[#501f92]">{loggedHoursToday.toFixed(1)}h</span> / {targetDayHours.toFixed(1)}h
                  </span>
                  <span className="text-[#64748b] font-medium text-[11px]">
                    {loggedHoursToday >= targetDayHours
                      ? '✓ Jornada cubierta'
                      : `${(targetDayHours - loggedHoursToday).toFixed(1)}h para objetivo`}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (loggedHoursToday / targetDayHours) * 100)}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      loggedHoursToday >= targetDayHours ? 'bg-[#10b981]' : 'bg-[#8a4dff]'
                    }`}
                  />
                </div>

                {/* Atajos de Carga Rápida */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase mr-1">
                    Carga rápida:
                  </span>
                  <button
                    onClick={() => onQuickLogHours(0.5, 'Soporte y gestión rápida', 'internal')}
                    className="px-2 py-1 rounded-lg bg-white border border-[#cbd5e1] hover:border-[#8a4dff] text-[11px] font-semibold text-[#0f172a] hover:text-[#501f92] transition-colors cursor-pointer"
                  >
                    +30m
                  </button>
                  <button
                    onClick={() => onQuickLogHours(1.0, 'Sesión operativa', 'client')}
                    className="px-2 py-1 rounded-lg bg-white border border-[#cbd5e1] hover:border-[#8a4dff] text-[11px] font-semibold text-[#0f172a] hover:text-[#501f92] transition-colors cursor-pointer"
                  >
                    +1h
                  </button>
                  <button
                    onClick={() => onQuickLogHours(2.0, 'Bloque de diseño / desarrollo', 'client')}
                    className="px-2 py-1 rounded-lg bg-white border border-[#cbd5e1] hover:border-[#8a4dff] text-[11px] font-semibold text-[#0f172a] hover:text-[#501f92] transition-colors cursor-pointer"
                  >
                    +2h
                  </button>
                  <span className="text-[#cbd5e1]">•</span>
                  <button
                    onClick={() => onQuickLogHours(0.5, 'Daily Standup Uhura', 'internal', 'Uhura Interno')}
                    className="px-2 py-1 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[11px] font-medium text-[#475569] transition-colors cursor-pointer"
                  >
                    Daily (+30m)
                  </button>
                  <button
                    onClick={() => onQuickLogHours(1.0, 'Sync Operativo de Proyecto', 'internal', 'Uhura Interno')}
                    className="px-2 py-1 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[11px] font-medium text-[#475569] transition-colors cursor-pointer"
                  >
                    Sync (+1h)
                  </button>
                </div>
              </div>

              {/* Acordeón de Registros de Hoy */}
              <div className="border border-[#e2e8f0] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setIsLogsAccordionOpen(!isLogsAccordionOpen)}
                  className="w-full p-3.5 bg-white hover:bg-[#f8fafc] flex items-center justify-between text-xs font-bold text-[#0f172a] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#8a4dff]" />
                    <span>Mis registros de hoy ({todayLogs.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#64748b]">
                    <span className="text-[11px] font-mono">{loggedHoursToday.toFixed(1)}h total</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isLogsAccordionOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {isLogsAccordionOpen && (
                  <div className="p-3 bg-[#f8fafc] border-t border-[#e2e8f0] space-y-2">
                    {todayLogs.length === 0 ? (
                      <p className="text-[11px] text-[#94a3b8] text-center py-2">
                        Aún no tienes registros cargados hoy. Usa el timer o la carga manual.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {todayLogs.map((log) => {
                          const logHours = ((log.durationSeconds || 0) / 3600).toFixed(1);
                          return (
                            <div
                              key={log.id}
                              className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-[#0f172a] truncate">
                                  {log.taskTitle || 'Registro de tiempo'}
                                </p>
                                <span className="text-[10px] text-[#64748b] block truncate">
                                  {log.clientName || 'Uhura'} • {log.projectName || 'General'} • {log.date || 'Hoy'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-mono font-bold text-[#501f92]">
                                  {logHours}h
                                </span>
                                {onDeleteTimeLog && (
                                  <button
                                    onClick={() => {
                                      if (confirm('¿Deseas eliminar este registro de tiempo?')) {
                                        onDeleteTimeLog(log.id);
                                        showToast('Registro de tiempo eliminado.');
                                      }
                                    }}
                                    className="p-1 rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                                    title="Eliminar este registro"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Enlace sutil para auditoría histórica */}
                    {onNavigateToView && (
                      <div className="pt-2 text-center">
                        <button
                          onClick={() => onNavigateToView('timesheets')}
                          className="text-[11px] font-semibold text-[#501f92] hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Ver historial completo de semanas anteriores en Timesheets</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
      </div>

      {/* Modal de Alerta de Desvío en Chat */}
      {chatModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#e2e8f0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2 text-[#ea580c]">
                <Flame className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#0f172a]">
                  Notificar Desvío Presupuestal
                </h3>
              </div>
              <button
                onClick={() => setChatModalTask(null)}
                className="p-1 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#64748b]">
                Se enviará una alerta automática al Lead PM y al canal del proyecto para documentar la causa del sobrecosto o re-estimar entregables:
              </p>

              <div>
                <label className="font-bold text-[#0f172a] block mb-1">
                  Motivo principal del desvío:
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs font-medium text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
                >
                  <option value="Complejidad técnica superior a la prevista">
                    Complejidad técnica superior a la prevista
                  </option>
                  <option value="Insumos incompletos o cambios de alcance del cliente">
                    Insumos incompletos o cambios de alcance del cliente
                  </option>
                  <option value="Retrabajo / Feedback en mesa de control">
                    Retrabajo / Feedback en mesa de control
                  </option>
                  <option value="Ajustes de infraestructura o despliegue">
                    Ajustes de infraestructura o despliegue
                  </option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#0f172a] block mb-1">
                  Horas adicionales estimadas para terminar (+horas):
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="20"
                  value={extraHoursEstimate}
                  onChange={(e) => setExtraHoursEstimate(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs font-mono font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <button
                onClick={() => setChatModalTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendChatNotification}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#ea580c] hover:bg-[#c2410c] text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar alerta al canal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
