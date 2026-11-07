import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Pause,
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
  Info,
  Users,
  Hourglass,
  Calendar,
  Gift,
  Heart
} from 'lucide-react';
import {
  TaskItem,
  ActiveTimerState,
  OrbitView,
  UserItem,
  TimeLog,
  ProjectSummaryItem,
  ProjectDependency,
  TeamAbsenceEvent
} from './types';
import { getUserAccessLevel, can } from './auth/permissions';
import { makePersonMatcher, getTaskRelation, isProjectResponsible, makeTaskProjectResolver } from './auth/taskVisibility';
import { initialUsers, initialAbsenceEvents } from './mockData';
import { processTeamLifeEvents } from './copilot/teamLifeEngine';
import { calculateBusinessDays } from './health/projectHealthEngine';
import { TeamHumanProfileModal } from './copilot/TeamHumanProfileModal';
import { UserAvatar } from './UserAvatar';

export interface MiDiaViewProps {
  tasks: TaskItem[];
  currentUser?: UserItem;
  users?: UserItem[];
  absenceEvents?: TeamAbsenceEvent[];
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
  onUpdateUser?: (updatedUser: UserItem) => void;
}

export const MiDiaView: React.FC<MiDiaViewProps> = ({
  tasks,
  currentUser,
  users,
  absenceEvents,
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
  clients = [],
  onUpdateUser
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLogsAccordionOpen, setIsLogsAccordionOpen] = useState(false);
  const [isHumanProfileModalOpen, setIsHumanProfileModalOpen] = useState(false);
  const [selectedTeamUserId, setSelectedTeamUserId] = useState<string | undefined>(undefined);
  const [isLuisaHandoffModalOpen, setIsLuisaHandoffModalOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

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

  // 2. Visibilidad (regla única, ver auth/taskVisibility.ts):
  // - «Qué tengo que hacer hoy»: solo tareas donde el usuario es responsable de ejecución
  //   (assignee / collaborators) con fecha hoy, ventana en curso o vencida; las que debe
  //   revisar (revisor, o líder del proyecto si no hay revisor) y la del timer activo.
  // - Seguidores: van a «Siguiendo», sin urgencia ni conteo.
  // - Excepciones de equipo (bloqueos, desvíos, insumos): solo de proyectos de los que el
  //   usuario es responsable (líder o responsable de cuenta). Dirección y admin ven todo.
  const effectiveUserList = users && users.length > 0 ? users : initialUsers;
  const identity = currentUser || effectiveUserList.find((u) => u.id === currentUserId);
  const matchesMe = useMemo(() => makePersonMatcher(identity, effectiveUserList), [identity, effectiveUserList]);
  const projectOfTask = useMemo(() => makeTaskProjectResolver(projects), [projects]);
  const isGlobalViewer = accessLevel === 'executive' || accessLevel === 'system_admin';
  const myProjectIds = useMemo(
    () => new Set(projects.filter((p) => isProjectResponsible(p, identity, matchesMe)).map((p) => p.id)),
    [projects, identity, matchesMe]
  );
  const inMyScope = (t: TaskItem) => {
    if (isGlobalViewer) return true;
    const p = projectOfTask(t);
    return Boolean(p && myProjectIds.has(p.id));
  };

  const todayIsoForTasks = new Date().toISOString().split('T')[0];
  const isTodayOrDue = (t: TaskItem) => {
    const todayIso = todayIsoForTasks;
    if (t.scheduledDate === todayIso || t.dueDate === todayIso) return true;
    // Tarea en curso: su ventana programada (inicio → vencimiento) incluye hoy
    if (!t.completed && t.scheduledDate && t.dueDate && t.scheduledDate <= todayIso && todayIso <= t.dueDate) return true;
    const dueTxt = (t.dueText || '').toLowerCase();
    if (dueTxt.includes('hoy') || dueTxt.includes('vencid') || dueTxt.includes('urgente')) return true;
    if (t.dueStatus === 'overdue' || t.dueStatus === 'urgent') return true;
    return false;
  };

  const assignedTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.isArchived) return false;
        if (activeTimer?.taskId === t.id) return true;
        const relation = getTaskRelation(t, identity, matchesMe);
        if (relation === 'reviewer') return true;
        if (relation === 'owner' && isTodayOrDue(t)) return true;
        return false;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const prioWeight: Record<string, number> = { urgent: 4, High: 3, high: 3, Medium: 2, medium: 2, Low: 1, low: 1 };
        return (prioWeight[b.priority] || 2) - (prioWeight[a.priority] || 2);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, identity, matchesMe, activeTimer?.taskId]);

  const activeUserTasks = assignedTasks;

  // Tareas que sigo: informativas, sin urgencia (no suman a pendientes, atención ni capacidad)
  const followedTasks = useMemo(
    () =>
      tasks.filter(
        (t) => !t.completed && !t.isArchived && getTaskRelation(t, identity, matchesMe) === 'follower' && (isTodayOrDue(t) || t.status === 'Review')
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, identity, matchesMe]
  );
  const [showFollowed, setShowFollowed] = useState(false);

  // 3. MATRIZ DE PERSPECTIVA POR ROL — EVALUACIÓN DE ELEMENTOS DE ATENCIÓN
  // Retrabajos / Ajustes: los propios; quien es responsable del proyecto ve los de sus proyectos
  const reworkTasks = useMemo(() => {
    if (!['collaborator', 'leader', 'client_relationship', 'executive', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    const pool = accessLevel === 'collaborator' ? activeUserTasks : tasks.filter((t) => inMyScope(t) || activeUserTasks.includes(t));
    return pool.filter((t) => !t.completed && (t.isRework || (t.reworkRound && t.reworkRound > 0)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessLevel, activeUserTasks, tasks, myProjectIds]);

  // Revisiones pendientes: solo las que me corresponde revisar
  const reviewTasks = useMemo(() => {
    if (!['leader', 'client_relationship', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    return tasks.filter((t) => !t.completed && getTaskRelation(t, identity, matchesMe) === 'reviewer');
  }, [accessLevel, tasks, identity, matchesMe]);

  // Bloqueos propios
  const ownBlockedTasks = useMemo(() => {
    if (!['collaborator', 'leader', 'client_relationship', 'commercial', 'administrative', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    return activeUserTasks.filter((t) => !t.completed && Boolean(t.isBlocked || t.blockedReason));
  }, [accessLevel, activeUserTasks]);

  // Bloqueos de equipo: de los proyectos que lidero (Dirección / admin: todos)
  const teamBlockedTasks = useMemo(() => {
    if (!['leader', 'executive', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    return tasks.filter((t) => !t.completed && Boolean(t.isBlocked || t.blockedReason) && inMyScope(t) && !activeUserTasks.includes(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessLevel, tasks, myProjectIds, activeUserTasks]);

  // Desvíos de presupuesto (horas ejecutadas > presupuestadas)
  // Colaborador: en sus tareas. Comercial / líder: en los proyectos de los que es responsable. Dirección: todos.
  const overtimeRisks = useMemo(() => {
    if (!['collaborator', 'leader', 'commercial', 'client_relationship', 'executive', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    const pool = accessLevel === 'collaborator' ? activeUserTasks : tasks.filter((t) => inMyScope(t) || activeUserTasks.includes(t));
    return pool.filter((t) => {
      if (t.completed) return false;
      const consumedHrs = (t.consumedSeconds || 0) / 3600;
      const budgeted = t.budgetedHours || 0;
      return budgeted > 0 && consumedHrs > budgeted;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessLevel, activeUserTasks, tasks, myProjectIds]);

  // New Business que requiere acción (cotizaciones pendientes de aprobación o briefs por dimensionar)
  const newBusinessActions = useMemo(() => {
    if (!['leader', 'commercial', 'executive', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    return opportunities.filter((o) => {
      const isActionableStatus =
        o.status === 'discovery' || o.status === 'quoting' || o.status === 'internal_review';
      if (!isActionableStatus) return false;

      // Si es rol líder, filtrar dinámicamente según su leadUserId, leadUserIds o nombre de usuario
      if (accessLevel === 'leader') {
        const matchesId =
          o.leadUserId === currentUserId ||
          (Array.isArray(o.leadUserIds) && o.leadUserIds.includes(currentUserId));
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

  // Pendientes de Cliente (Insumos, Accesos, Aprobaciones de Gates)
  const clientDependencies = useMemo(() => {
    if (!['client_relationship', 'commercial', 'leader', 'executive', 'system_admin'].includes(accessLevel)) {
      return [];
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const allDeps: Array<ProjectDependency & { projectName: string; clientName: string; delayDays: number }> = [];

    projects.forEach((proj: ProjectSummaryItem) => {
      // Insumos del cliente: solo de proyectos de los que soy responsable (Dirección / admin: todos)
      if (!isGlobalViewer && !myProjectIds.has(proj.id)) return;
      (proj.dependencies || []).forEach((dep) => {
        if (dep.ownerType === 'client' && dep.status === 'pending') {
          const delayDays = dep.expectedDate && todayStr > dep.expectedDate
            ? calculateBusinessDays(dep.expectedDate, todayStr)
            : 0;
          allDeps.push({
            ...dep,
            projectName: proj.name,
            clientName: proj.clientName,
            delayDays
          });
        }
      });
    });

    return allDeps.sort((a, b) => b.delayDays - a.delayDays);
  }, [accessLevel, projects, isGlobalViewer, myProjectIds]);

  // Total de elementos accionables de atención
  const totalAttentionCount =
    reworkTasks.length +
    reviewTasks.length +
    clientDependencies.length +
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

  const isExecutive = accessLevel === 'executive';

  // Contexto humano del equipo ("Hoy en el equipo" & Ausencias)
  const effectiveUsers = useMemo(() => {
    return users && users.length > 0 ? users : initialUsers;
  }, [users]);

  const effectiveAbsences = useMemo(() => {
    return absenceEvents && absenceEvents.length > 0 ? absenceEvents : initialAbsenceEvents;
  }, [absenceEvents]);

  // Fecha de referencia canónica de ECO UAT actual: 19 de Octubre 2026
  const referenceDateStr = '2026-10-19';

  // Radar de ausencias próximas (próximos 14 días o activas)
  const upcomingVacations = useMemo(() => {
    const list: Array<{
      id: string;
      userId: string;
      userName: string;
      user?: UserItem;
      startDate: string;
      endDate: string;
      daysRemaining: number;
      title: string;
      notes?: string;
      isUrgent: boolean;
      daysDuration: number;
    }> = [];

    effectiveAbsences.forEach((abs) => {
      if (abs.status !== 'active') return;
      const targetUser = effectiveUsers.find((u) => u.id === abs.userId);
      const diffDays = Math.ceil(
        (new Date(abs.startDate).getTime() - new Date(referenceDateStr).getTime()) / (1000 * 60 * 60 * 24)
      );

      const endDateEffective = abs.endDate || abs.startDate;
      const duration = Math.ceil(
        (new Date(endDateEffective).getTime() - new Date(abs.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      if (diffDays >= 0 && diffDays <= 14) {
        list.push({
          id: abs.id,
          userId: abs.userId,
          userName: targetUser?.name || abs.userName || 'Colaborador',
          user: targetUser,
          startDate: abs.startDate,
          endDate: endDateEffective,
          daysRemaining: diffDays,
          title: abs.title,
          notes: abs.notes,
          isUrgent: diffDays <= 3,
          daysDuration: duration
        });
      }
    });

    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [effectiveAbsences, effectiveUsers]);

  // Próximos cumpleaños (próximos 14 días de Octubre)
  const upcomingBirthdays = useMemo(() => {
    const currentMonth = 10;
    const currentDay = 19;
    return effectiveUsers
      .filter((u) => {
        if (!u.birthDate) return false;
        const parts = u.birthDate.split('-');
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        return m === currentMonth && d >= currentDay && d <= currentDay + 14;
      })
      .map((u) => {
        const parts = u.birthDate!.split('-');
        const d = parseInt(parts[2], 10);
        const days = d - currentDay;
        return {
          user: u,
          day: d,
          daysRemaining: days,
          dateFormatted: u.birthDateFormatted || `${d} de Octubre`
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [effectiveUsers]);

  // Cuentas y proyectos liderados por Luisa para coordinación de traspasos
  const luisaAccounts = useMemo(() => {
    return clients.filter((c) => {
      const mgr = (c.accountManagerName || '').toLowerCase();
      return mgr.includes('luisa') || c.accountManagerId === 'u-3' || c.accountManagerId === 'u-18';
    });
  }, [clients]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0f172a] text-white text-xs font-semibold shadow-xl border border-white/10 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#d4ff4a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CONTENEDOR 2 COLUMNAS: EJECUCIÓN OPERATIVA + SIDEBAR DE RADAR HUMANO */}
      {/* ==================================================================== */}
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 items-start">
        {/* COLUMNA PRINCIPAL DE EJECUCIÓN (NIVELES 1, 2 Y 3) */}
        <div className="flex-1 min-w-0 space-y-6 w-full">

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
                    onClick={() => onOpenTaskDetail(t.id)}
                    className="p-3 rounded-2xl bg-white border border-[#fde68a] hover:border-[#dc2626] hover:bg-[#fef2f2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer transition-all group shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <Repeat className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#0f172a] group-hover:text-[#dc2626] transition-colors">{t.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#fee2e2] text-[#991b1b]">
                            Ajuste Ronda {t.reworkRound || 1}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748b] block mt-0.5">
                          {t.clientName || 'Cliente'} • {t.reworkReason || 'Ajustes requeridos'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg text-[#dc2626] group-hover:bg-[#fef2f2] font-semibold text-xs transition-colors self-start sm:self-auto shrink-0 inline-flex items-center gap-1">
                      <span>Atender ajuste</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                ))}

                {/* 2. Revisiones pendientes */}
                {reviewTasks.map((t) => (
                  <div
                    key={`review-${t.id}`}
                    onClick={() => onOpenTaskDetail(t.id)}
                    className="p-3 rounded-2xl bg-white border border-[#fde68a] hover:border-[#8a4dff] hover:bg-[#faf5ff]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#8a4dff] shrink-0" />
                      <span className="font-bold text-[#0f172a] group-hover:text-[#501f92] transition-colors">{t.title}</span>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg text-[#501f92] group-hover:bg-[#f5f3ff] font-semibold text-xs transition-colors self-start sm:self-auto shrink-0 inline-flex items-center gap-1">
                      <span>Listo para revisar</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                ))}

                {/* 2.5 Pendientes de Cliente (Insumos, Accesos, Aprobaciones de Gates) */}
                {clientDependencies.map((dep) => (
                  <div
                    key={`client-dep-${dep.id}`}
                    onClick={() => {
                      if (onNavigateToView) onNavigateToView('proyectos');
                    }}
                    className={`p-3.5 rounded-2xl bg-white border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer transition-all group shadow-2xs ${
                      dep.delayDays > 0
                        ? 'border-[#fca5a5] bg-[#fff5f5] hover:border-[#dc2626]'
                        : 'border-[#fde68a] hover:border-[#64748b] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Hourglass className={`w-4 h-4 shrink-0 mt-0.5 ${dep.delayDays > 0 ? 'text-[#dc2626]' : 'text-[#f59e0b]'}`} />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-[#0f172a] group-hover:text-[#501f92] transition-colors">{dep.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8]">
                            {dep.clientName}
                          </span>
                          {dep.blocking && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#fee2e2] text-[#991b1b]">
                              Bloqueante
                            </span>
                          )}
                          {dep.delayDays > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
                              Vencido: +{dep.delayDays} días
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#059669]">
                              Esperado: {dep.expectedDate}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748b] mt-0.5">
                          Aprobación pendiente · Puede impactar fechas del cronograma
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg text-[#334155] group-hover:bg-[#f1f5f9] group-hover:text-[#0f172a] font-semibold text-xs transition-colors shrink-0 self-start sm:self-auto inline-flex items-center gap-1">
                      <span>Gestionar aprobación</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                ))}

                {/* 3. Bloqueos de tareas */}
                {ownBlockedTasks.map((t) => (
                  <div
                    key={`blocked-${t.id}`}
                    onClick={() => onOpenTaskDetail(t.id)}
                    className="p-3 rounded-2xl bg-white border border-[#fecaca] hover:border-[#dc2626] hover:bg-[#fef2f2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer transition-all group shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertOctagon className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0f172a] group-hover:text-[#dc2626] transition-colors">{t.title}</span>
                        <span className="text-[11px] text-[#991b1b] block mt-0.5">
                          Tarea bloqueada por dependencias o insumos de cliente
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg text-[#dc2626] group-hover:bg-[#fef2f2] font-semibold text-xs transition-colors self-start sm:self-auto shrink-0 inline-flex items-center gap-1">
                      <span>Ver bloqueo</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                ))}

                {/* 4. Desvíos presupuestales activos */}
                {overtimeRisks.map((t) => {
                  const consumedHrs = ((t.consumedSeconds || 0) / 3600).toFixed(1);
                  return (
                    <div
                      key={`overtime-${t.id}`}
                      onClick={() => onOpenTaskDetail(t.id)}
                      className="p-3 rounded-2xl bg-white border border-[#fed7aa] hover:border-[#ea580c] hover:bg-[#fff7ed]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer transition-all group shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <Flame className="w-4 h-4 text-[#ea580c] shrink-0" />
                        <span className="font-bold text-[#0f172a] group-hover:text-[#ea580c] transition-colors truncate">
                          {t.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#fff7ed] text-[#c2410c] font-bold border border-[#fed7aa] text-[10px] inline-flex items-center gap-1 shrink-0">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Desvío {consumedHrs}h / {t.budgetedHours}h cotizadas</span>
                        </span>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg text-[#ea580c] group-hover:bg-[#fff7ed] text-xs font-semibold transition-colors self-start sm:self-auto shrink-0 inline-flex items-center gap-1">
                        <span>Ajustar tarea</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
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
                    (Array.isArray(opp.leadUserIds) && opp.leadUserIds.includes(currentUserId)) ||
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
                            className="px-3.5 py-1.5 rounded-xl bg-[#f5f3ff] text-[#501f92] border border-[#ddd6fe] hover:bg-[#ede9fe] font-semibold text-xs transition-colors cursor-pointer"
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
                        {/* Titulo + Metadatos */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
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

                              {isTimerActiveForThisTask && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/30">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      activeTimer?.isPaused ? 'bg-[#f59e0b]' : 'bg-[#501f92] animate-pulse'
                                    }`}
                                  />
                                  En curso
                                </span>
                              )}

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
                            </div>
                          </div>
                        </div>

                        {/* Botones de acción directa: Timer & Detalle */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isTimerActiveForThisTask ? (
                            <>
                              {onPauseResumeTimer && (
                                <button
                                  onClick={onPauseResumeTimer}
                                  className={`p-2 rounded-xl text-white flex items-center justify-center shadow-xs transition-all cursor-pointer ${
                                    activeTimer?.isPaused
                                      ? 'bg-[#10b981] hover:bg-[#059669]'
                                      : 'bg-[#f59e0b] hover:bg-[#d97706]'
                                  }`}
                                  title={activeTimer?.isPaused ? 'Reanudar' : 'Pausar'}
                                  aria-label={activeTimer?.isPaused ? 'Reanudar' : 'Pausar'}
                                >
                                  {activeTimer?.isPaused ? (
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                  ) : (
                                    <Pause className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={onStopTimer}
                                className="p-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                                title="Detener y registrar"
                                aria-label="Detener y registrar"
                              >
                                <Square className="w-3.5 h-3.5 fill-current" />
                              </button>
                            </>
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

            {/* Siguiendo: tareas donde soy seguidor. Informativas, sin urgencia ni conteo. */}
            {followedTasks.length > 0 && (
              <div className="pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setShowFollowed(!showFollowed)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#64748b] hover:text-[#0f172a] cursor-pointer"
                  aria-expanded={showFollowed}
                >
                  <span>Siguiendo · {followedTasks.length} tarea{followedTasks.length !== 1 ? 's' : ''} de otras personas para que estés al tanto</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showFollowed ? 'rotate-90' : ''}`} />
                </button>
                {showFollowed && (
                  <ul className="mt-2 space-y-1.5">
                    {followedTasks.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => onOpenTaskDetail(t.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-left text-xs cursor-pointer"
                        >
                          <span className="flex-1 min-w-0 truncate text-[#334155]">{t.title}</span>
                          <span className="shrink-0 text-[#94a3b8] truncate max-w-[40%]">
                            {t.assignee?.name} · {t.projectName || t.board}
                          </span>
                          {t.status === 'Review' && <span className="shrink-0 text-[10px] font-bold text-[#501f92]">En revisión</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#cbd5e1] hover:border-[#501f92] text-[#334155] hover:text-[#501f92] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#501f92]" />
                    <span>Cargar horas</span>
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
              </div>

              {/* Link directo a Capacidad para ver tiempos de hoy y de la semana */}
              {onNavigateToView && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onNavigateToView('capacidad')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#501f92] hover:bg-[#f5f3ff] transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Ver mis tiempos de hoy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* SIDEBAR DERECHO: RADAR DEL EQUIPO (PRÓXIMAS VACACIONES Y CULTURA) */}
        {/* ==================================================================== */}
        <aside className="w-full xl:w-84 shrink-0 space-y-4">
          {/* Tarjeta Principal del Radar de Ausencias */}
          <div className="bg-white rounded-3xl p-5 border border-[#ede9fe] shadow-xs space-y-4 transition-all">
            {/* Header del Sidebar */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#faf5ff] border border-[#ede9fe] flex items-center justify-center text-sm">
                  🦫
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                    Radar del Equipo
                  </h3>
                  <span className="text-[11px] text-[#64748b] block">
                    Ausencias y fechas clave
                  </span>
                </div>
              </div>

              {upcomingVacations.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] border border-[#fde68a] animate-pulse">
                  {upcomingVacations.length} vacación próxima
                </span>
              )}
            </div>

            {/* CASO ESPECIAL VACACIONES DE LUISA / ALERTAS PRÓXIMAS */}
            {upcomingVacations.length > 0 ? (
              <div className="space-y-3">
                {upcomingVacations.map((vac) => {
                  const isLuisa = vac.userId === 'u-3' || vac.userName.toLowerCase().includes('luisa');
                  const daysBadgeText = vac.daysRemaining === 0
                    ? 'Inicia hoy'
                    : vac.daysRemaining === 1
                    ? 'Mañana'
                    : vac.daysRemaining === 2
                    ? 'Sale en 2 días · Pasado mañana'
                    : `En ${vac.daysRemaining} días`;

                  return (
                    <div
                      key={vac.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isLuisa
                          ? 'bg-gradient-to-br from-[#fffbeb] to-[#fef3c7] border-[#f59e0b] shadow-2xs'
                          : 'bg-[#f8fafc] border-[#e2e8f0]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isLuisa
                            ? 'bg-[#b45309] text-white'
                            : 'bg-[#0284c7]/10 text-[#0284c7]'
                        }`}>
                          🏖️ {daysBadgeText}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748b]">
                          {vac.daysDuration} días
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white font-bold flex items-center justify-center shrink-0 shadow-2xs">
                          {vac.user?.initials || 'LU'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-[#0f172a] truncate">
                            {vac.userName}
                          </h4>
                          <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                            {vac.user?.jobTitle || 'Operaciones & Cuentas'}
                          </p>
                          <p className="text-[10px] font-medium text-[#78350f] mt-1 bg-white/60 p-1.5 rounded-lg border border-[#fde68a]/60">
                            📅 <strong>{vac.startDate} al {vac.endDate}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Prompt funcional y empático */}
                      <div className="mt-3 text-[11px] text-[#78350f] leading-relaxed bg-white/70 p-2.5 rounded-xl border border-[#fde68a]">
                        💡 <strong>Para tener en cuenta:</strong> {vac.userName.split(' ')[0]} saldrá a vacaciones pronto. Si tienes tareas, dudas o temas de clientes con ella, coordina entregas y handoffs antes de su salida.
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-center text-xs text-[#64748b]">
                <p className="font-semibold text-[#0f172a]">Toda la colonia disponible</p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  Sin ausencias ni vacaciones programadas esta semana.
                </p>
              </div>
            )}

            {/* SECCIÓN DE PRÓXIMOS CUMPLEAÑOS */}
            {upcomingBirthdays.length > 0 && (
              <div className="pt-2 border-t border-[#f1f5f9] space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#db2777] block">
                  🎂 Próximos Cumpleaños
                </span>
                {upcomingBirthdays.map((item) => (
                  <div
                    key={item.user.id}
                    className="p-3 rounded-2xl bg-[#fff1f2] border border-[#ffe4e6] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#db2777] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {item.user.initials || 'CV'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0f172a] truncate">
                          {item.user.name}
                        </p>
                        <p className="text-[10px] text-[#64748b] truncate">
                          {item.dateFormatted} {item.daysRemaining > 0 ? `(en ${item.daysRemaining}d)` : '(¡Hoy!)'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#db2777] border border-[#fecdd3]">
                      🎉 {item.daysRemaining === 0 ? 'Hoy' : `${item.daysRemaining}d`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ACCESO DIRECTO A LA COLONIA UHUREÑA */}
            {onNavigateToView && (
              <div className="pt-2 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => onNavigateToView('la-colonia')}
                  className="w-full p-2.5 rounded-2xl bg-[#faf5ff] hover:bg-[#ede9fe] border border-[#ddd6fe] text-[#501f92] text-xs font-bold transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span>🦫</span>
                    <span>Cónoce la colonia Uhureña</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* MODAL DE COORDINACIÓN DE TRASPASO POR VACACIONES DE LUISA */}
      {isLuisaHandoffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-[#e2e8f0] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fffbeb] border border-[#fde68a] flex items-center justify-center text-xl">
                  🏖️
                </div>
                <div>
                  <h3 className="font-bold text-[#0f172a] text-sm">
                    Traspaso de Cuentas — Vacaciones de Luisa
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    Del 21 al 28 de Octubre 2026 (8 días de descanso aprobados)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLuisaHandoffModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#334155] leading-relaxed">
                Antes de salir el <strong>miércoles 21 de Octubre</strong>, estas son las cuentas activas asignadas a Luisa en ECO:
              </p>

              <div className="space-y-2">
                {luisaAccounts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-[#0f172a]">{c.name}</span>
                      <span className="text-[10px] text-[#64748b] block mt-0.5">
                        Líder de cuenta: Luisa Urazán • NIT: {c.nit || 'Activo'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669]">
                      {c.receivableStatus || 'Al día'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fffbeb] border border-[#fde68a] space-y-2">
                <span className="font-bold text-[#78350f] block text-[11px] uppercase tracking-wider">
                  ✓ Checklist de preparación para el equipo:
                </span>
                <ul className="space-y-1.5 text-[11px] text-[#78350f]">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Designar contacto de soporte para clientes de Luisa durante su ausencia.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Revisar entregables críticos de la semana antes del martes 20 Oct.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Consultas operativas con Lu antes del cierre del martes a las 18:00 hs.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => {
                  setSelectedTeamUserId('u-3');
                  setIsLuisaHandoffModalOpen(false);
                  setIsHumanProfileModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#faf5ff] border border-[#ddd6fe] text-[#501f92] text-xs font-bold hover:bg-[#ede9fe] transition-colors cursor-pointer"
              >
                Ver Ficha de Luisa
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLuisaHandoffModalOpen(false);
                  showToast('Coordinación de vacaciones con Luisa registrada.');
                }}
                className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Entendido / Coordinado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FICHA HUMANA & GUSTOS DEL EQUIPO UHURA */}
      <TeamHumanProfileModal
        isOpen={isHumanProfileModalOpen}
        onClose={() => setIsHumanProfileModalOpen(false)}
        users={users && users.length > 0 ? users : initialUsers}
        selectedUserId={selectedTeamUserId}
        onUpdateUser={onUpdateUser}
        currentUser={currentUser}
        singleUserMode={true}
      />
    </div>
  );
};
