import React, { useState, useEffect } from 'react';
import {
  OrbitView,
  TaskItem,
  UserItem,
  TimeLog,
  ActiveTimerState,
  TaskDeliverable,
  TaskStatus,
  TaskPriority,
  ClientProfile,
  ProjectType,
  TaskRework
} from '../components/taskflow/types';
import {
  initialTasks,
  initialActivities,
  initialUsers,
  initialTimeLogs,
  orbitOperationalAlerts,
  orbitTopClients,
  orbitTrafficLightProjects,
  orbitTeamCapacity,
  clientProjectHierarchy,
  orbitClientsData
} from '../components/taskflow/mockData';
import { TaskflowSidebar } from '../components/taskflow/TaskflowSidebar';
import { TaskflowHeader } from '../components/taskflow/TaskflowHeader';
import { DashboardView } from '../components/taskflow/DashboardView';
import { MyTasksView } from '../components/taskflow/MyTasksView';
import { UsersView } from '../components/taskflow/UsersView';
import { BoardView } from '../components/taskflow/BoardView';
import { ClientsView } from '../components/taskflow/ClientsView';
import { ProjectsView, ProjectSummaryItem } from '../components/taskflow/ProjectsView';
import { NewProjectModal, NewProjectPayload } from '../components/taskflow/NewProjectModal';
import { InviteUserModal } from '../components/taskflow/InviteUserModal';
import { NewTaskModal } from '../components/taskflow/NewTaskModal';
import { ManualTimeLogModal } from '../components/taskflow/ManualTimeLogModal';
import { BandejaDelDiaWidget } from '../components/taskflow/BandejaDelDiaWidget';
import { TaskDetailModal } from '../components/taskflow/TaskDetailModal';
import { TimerSummaryModal, TimerSummaryData } from '../components/taskflow/TimerSummaryModal';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  Plus,
  Type,
  Building2,
  Briefcase,
  BrainCircuit
} from 'lucide-react';

const INITIAL_PROJECTS_LIST: ProjectSummaryItem[] = [
  {
    id: 'prj-yam-navidad',
    name: 'Campaña Navidad Yamaha',
    clientName: 'INCOLMOTOS YAMAHA S.A.',
    brand: 'Yamaha',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    projectType: 'fee_monthly',
    serviceBase: 'Fee Mensual · Campaña & Social',
    budgetedHours: 59,
    soldHours: 59,
    startDate: '2026-08-15',
    endDate: '2026-12-31',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Frentes activos: Redes Sociales (32h), Landing Page (19h) y Pauta (8h)'
  },
  {
    id: 'prj-battsaver-1',
    name: 'Tienda Online BattSaver',
    clientName: 'Rock and Ride S.A.S.',
    brand: 'BattSaver',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    projectType: 'fixed_milestones',
    serviceBase: 'Ecommerce / Shopify',
    budgetedHours: 110,
    soldHours: 110,
    startDate: '2026-08-15',
    endDate: '2026-11-15',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Backlog habilitado: Discovery (14h), UX/UI (36h), Implementación (48h), QA (14h) y Cierre (8h)'
  },
  {
    id: 'prj-1',
    name: 'Fee Mantenimiento Q3 · Tuya',
    clientName: 'TUYA S.A.',
    brand: 'Tuya',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    projectType: 'fee_monthly',
    serviceBase: 'Mantenimiento Web',
    budgetedHours: 45,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Horas y entregas en presupuesto'
  },
  {
    id: 'prj-2',
    name: 'Pauta & Growth Q3 · Flamingo',
    clientName: 'FLAMINGO S.A.S.',
    brand: 'Flamingo',
    leadName: 'Andrés Ríos',
    leadAvatarBg: 'bg-[#ef4444]',
    projectType: 'fee_monthly',
    serviceBase: 'Paid Media & Ads Performance',
    budgetedHours: 60,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Campaña activa con ROAS positivo'
  },
  {
    id: 'prj-3',
    name: 'Mantenimiento Web E-commerce · Distrihogar',
    clientName: 'DISTRIHOGAR S.A.S.',
    brand: 'Distrihogar',
    leadName: 'Catalina Tejada',
    leadAvatarBg: 'bg-[#7c3aed]',
    projectType: 'fee_monthly',
    serviceBase: 'Mantenimiento Web',
    budgetedHours: 35,
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Dentro del consumo acordado'
  },
  {
    id: 'prj-4',
    name: 'Parrilla Redes & Social · Tupperware',
    clientName: 'DART DE COLOMBIA S.A.S.',
    brand: 'Tupperware',
    leadName: 'Catalina Tejada',
    leadAvatarBg: 'bg-[#7c3aed]',
    projectType: 'fee_monthly',
    serviceBase: 'Parrilla de Contenidos & Social',
    budgetedHours: 30,
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'Activo',
    healthStatus: 'verde',
    healthNote: 'Entregables aprobados'
  },
  {
    id: 'prj-5',
    name: 'Landing Page STEM · Parque Explora',
    clientName: 'CORPORACION PARQUE EXPLORA',
    brand: 'Parque Explora',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    projectType: 'fixed_milestones',
    serviceBase: 'Desarrollo Web & E-commerce',
    budgetedHours: 55,
    startDate: '2026-08-10',
    endDate: '2026-09-20',
    status: 'Activo',
    healthStatus: 'amarillo',
    healthNote: 'Alerta: esperando insumos de diseño'
  },
  {
    id: 'prj-6',
    name: 'Rediseño Portal B2B · Almacenes Éxito',
    clientName: 'ALMACENES EXITO S.A.',
    brand: 'Éxito',
    leadName: 'Paola (Lead PM)',
    leadAvatarBg: 'bg-[#501f92]',
    projectType: 'fixed_milestones',
    serviceBase: 'Desarrollo Web & E-commerce',
    budgetedHours: 80,
    startDate: '2026-06-01',
    endDate: '2026-08-15',
    status: 'Activo',
    healthStatus: 'rojo',
    healthNote: 'Desvío en horas y mora en pago'
  }
];

export const TaskFlowPrototype: React.FC = () => {
  const [currentView, setCurrentView] = useState<OrbitView>('dashboard');
  const [saasFont, setSaasFont] = useState<'jakarta' | 'inter' | 'montserrat'>('jakarta');
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [clients, setClients] = useState<ClientProfile[]>(orbitClientsData);
  const [projectsList, setProjectsList] = useState<ProjectSummaryItem[]>(INITIAL_PROJECTS_LIST);
  const [activities, setActivities] = useState(initialActivities);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(initialTimeLogs);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskPreselectedContext, setNewTaskPreselectedContext] = useState<{ projectName?: string; clientName?: string } | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectPreselectedClientId, setNewProjectPreselectedClientId] = useState<string | null>(null);
  const [selectedProjectIdForView, setSelectedProjectIdForView] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Time-Tracking Live State (Active timer starts at null by default)
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(null);

  const [isManualLogModalOpen, setIsManualLogModalOpen] = useState(false);
  const [manualLogDefaultTaskId, setManualLogDefaultTaskId] = useState<string | undefined>(undefined);

  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskItem | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Global view selection with automatic reset to section root
  const handleSelectView = (view: OrbitView) => {
    setCurrentView(view);
    // Reset specific sub-navigation states to return to the root screen of the chosen section
    if (view === 'proyectos') {
      setSelectedProjectIdForView(null);
    }
    if (view === 'clientes') {
      setSelectedClientId(null);
    }
  };

  // Timer Summary Modal State
  const [isTimerSummaryOpen, setIsTimerSummaryOpen] = useState(false);
  const [timerSummaryData, setTimerSummaryData] = useState<TimerSummaryData | null>(null);

  // Live Timer Interval Effect (exact seconds, no rounding)
  useEffect(() => {
    if (!activeTimer || activeTimer.isPaused) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || prev.isPaused) return prev;
        return {
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isPaused, activeTimer?.taskId]);

  // Start / Switch Live Timer
  const handleStartTimer = (task: TaskItem) => {
    setActiveTimer({
      taskId: task.id,
      taskTitle: task.title,
      clientName: task.clientName || 'Cliente',
      projectName: task.projectName || task.board,
      categoryType: task.categoryType,
      startTime: Date.now(),
      elapsedSeconds: 0,
      isPaused: false
    });
  };

  // Pause / Resume
  const handlePauseResumeTimer = () => {
    setActiveTimer((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isPaused: !prev.isPaused
      };
    });
  };

  // Stop Timer and Log
  const handleStopTimer = () => {
    if (!activeTimer) return;
    const targetTask = tasks.find((t) => t.id === activeTimer.taskId);
    if (!targetTask) {
      setActiveTimer(null);
      return;
    }

    const sessionSeconds = activeTimer.elapsedSeconds;
    const totalConsumedSeconds = (targetTask.consumedSeconds || 0) + sessionSeconds;
    const budgetedHours = targetTask.budgetedHours || 1;

    // 1. Update task consumed seconds
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === activeTimer.taskId) {
          return {
            ...t,
            consumedSeconds: (t.consumedSeconds || 0) + sessionSeconds
          };
        }
        return t;
      })
    );

    // 2. Add time log
    const newLog: TimeLog = {
      id: `log-${Date.now()}`,
      taskId: activeTimer.taskId,
      taskTitle: activeTimer.taskTitle,
      clientName: activeTimer.clientName,
      projectName: activeTimer.projectName,
      userName: targetTask.assignee.name,
      userInitials: targetTask.assignee.initials,
      userAvatarBg: targetTask.assignee.avatarBg,
      categoryType: activeTimer.categoryType,
      durationSeconds: sessionSeconds,
      isLiveTimer: true,
      date: 'Hoy, 22 Ago 2026'
    };
    setTimeLogs((prev) => [newLog, ...prev]);

    // 3. Show summary modal with exact loaded metrics
    setTimerSummaryData({
      taskId: targetTask.id,
      taskTitle: targetTask.title,
      clientName: targetTask.clientName || 'Cliente',
      projectName: targetTask.projectName || targetTask.board,
      sessionSeconds,
      totalConsumedSeconds,
      budgetedHours
    });
    setIsTimerSummaryOpen(true);

    setActiveTimer(null);
  };

  // Update Budget Hours for a task (by Lead/Director)
  const handleUpdateTaskBudgetHours = (taskId: string, newHours: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            budgetedHours: newHours
          };
        }
        return t;
      })
    );
  };

  // Add Deliverable directly to task
  const handleAddDeliverable = (
    taskId: string,
    del: Omit<TaskDeliverable, 'id' | 'taskId' | 'submittedAt'>
  ) => {
    const newDeliverable: TaskDeliverable = {
      ...del,
      id: `del-${Date.now()}`,
      taskId,
      submittedAt: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'Review',
            deliverables: [newDeliverable, ...(t.deliverables || [])]
          };
        }
        return t;
      })
    );
  };

  // Save Manual Log Fallback
  const handleSaveManualLog = (data: Omit<TimeLog, 'id' | 'date'>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === data.taskId) {
          return {
            ...t,
            consumedSeconds: t.consumedSeconds + data.durationSeconds
          };
        }
        return t;
      })
    );

    const newLog: TimeLog = {
      ...data,
      id: `log-${Date.now()}`,
      date: 'Hoy, 22 Ago 2026'
    };

    setTimeLogs((prev) => [newLog, ...prev]);
  };

  // Open Manual Time Log Modal with predefined task
  const handleOpenManualLogWithTask = (taskId?: string) => {
    setManualLogDefaultTaskId(taskId);
    setIsManualLogModalOpen(true);
  };

  // Update Task Status from Modal
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, completed: newStatus === 'Done' } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => prev ? { ...prev, status: newStatus, completed: newStatus === 'Done' } : null);
    }
  };

  // Update Task Priority from Modal
  const handleUpdateTaskPriority = (taskId: string, newPriority: TaskPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => prev ? { ...prev, priority: newPriority } : null);
    }
  };

  // Add Comment to Task
  const handleAddComment = (taskId: string, commentText: string) => {
    const newComment = {
      id: `msg-${Date.now()}`,
      authorName: 'Paola (Lead PM)',
      authorInitials: 'PL',
      authorAvatarBg: 'bg-[#501f92]',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
      content: commentText
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            messages: [...(t.messages || []), newComment]
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), newComment] } : null
      );
    }
  };

  // Update Task Dates (Inicio y Vencimiento)
  const handleUpdateTaskDates = (taskId: string, startDate: string, dueDate: string, dueText?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              startDate,
              dueDate,
              dueText: dueText || t.dueText
            }
          : t
      )
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
              ...prev,
              startDate,
              dueDate,
              dueText: dueText || prev.dueText
            }
          : null
      );
    }
  };

  // Update Task Team (Assignee, Collaborators, Reviewer, RequestedBy)
  const handleUpdateTaskTeam = (
    taskId: string,
    assignee: TaskItem['assignee'],
    collaborators: TaskItem['collaborators'],
    reviewer?: TaskItem['reviewer'],
    requestedBy?: string
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assignee,
              collaborators,
              reviewer,
              requestedBy: requestedBy || t.requestedBy
            }
          : t
      )
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
              ...prev,
              assignee,
              collaborators,
              reviewer,
              requestedBy: requestedBy || prev.requestedBy
            }
          : null
      );
    }
  };

  // Update Task Acceptance Criteria
  const handleUpdateTaskCriteria = (
    taskId: string,
    criteria: { id: string; text: string; completed: boolean }[]
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              acceptanceCriteria: criteria
            }
          : t
      )
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
              ...prev,
              acceptanceCriteria: criteria
            }
          : null
      );
    }
  };

  // Recalibrate Task Dates (Sincronización de cronograma sin penalizar al colaborador)
  const handleRecalibrateTaskDates = (
    taskId: string,
    daysToAdd: number,
    reason: string,
    responsibleParty: string
  ) => {
    const recalibrationAuditMessage = {
      id: `msg-${Date.now()}`,
      authorName: 'Paola (Lead PM)',
      authorInitials: 'PL',
      authorAvatarBg: 'bg-[#501f92]',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
      content: `🗓️ Cronograma Recalibrado por Product Lead (+${daysToAdd} días). Causa: ${reason} (${responsibleParty}). La fecha límite se actualizó y este desfase NO penaliza el score ni la eficiencia del equipo.`
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const currentDue = t.dueText || t.dueDate || '24 ago. 2026, 18:00';
          const newDueDate = `28 ago. 2026, 18:00 (+${daysToAdd}d recalibrados)`;

          return {
            ...t,
            dueText: newDueDate,
            dueDate: newDueDate,
            isRecalibrated: true,
            recalibrationDays: daysToAdd,
            recalibrationReason: reason,
            blockerInfo: t.blockerInfo
              ? {
                  ...t.blockerInfo,
                  isBlocked: false,
                  resolvedAt: 'Hoy, 22 Ago 2026'
                }
              : undefined,
            messages: [...(t.messages || []), recalibrationAuditMessage]
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => {
        if (!prev) return null;
        const newDueDate = `28 ago. 2026, 18:00 (+${daysToAdd}d recalibrados)`;
        return {
          ...prev,
          dueText: newDueDate,
          dueDate: newDueDate,
          isRecalibrated: true,
          recalibrationDays: daysToAdd,
          recalibrationReason: reason,
          blockerInfo: prev.blockerInfo
            ? {
                ...prev.blockerInfo,
                isBlocked: false,
                resolvedAt: 'Hoy, 22 Ago 2026'
              }
            : undefined,
          messages: [...(prev.messages || []), recalibrationAuditMessage]
        };
      });
    }
  };

  // Update Blocker Info
  const handleUpdateBlockerInfo = (taskId: string, blockerInfo: TaskItem['blockerInfo']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, blockerInfo } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => (prev ? { ...prev, blockerInfo } : null));
    }
  };

  // Update Task Phase (Backlog Synchronization)
  const handleUpdateTaskPhase = (taskId: string, phase: any) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, phase } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => (prev ? { ...prev, phase } : null));
    }
  };

  // Update Task Title
  const handleUpdateTaskTitle = (taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, title: newTitle.trim() } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => (prev ? { ...prev, title: newTitle.trim() } : null));
    }
  };

  // Add Task Rework
  const handleAddRework = (
    taskId: string,
    reworkData: Omit<TaskRework, 'id' | 'taskId' | 'date'>
  ) => {
    const newRework: TaskRework = {
      ...reworkData,
      id: `rwk-${Date.now()}`,
      taskId,
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs'
    };

    const reworkAuditMessage = {
      id: `msg-${Date.now()}`,
      authorName: 'Paola (Lead PM)',
      authorInitials: 'PL',
      authorAvatarBg: 'bg-[#501f92]',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
      content: `🔄 Retrabajo Registrado (${reworkData.origin === 'client' ? 'Cliente' : 'Interno'} - Ronda ${reworkData.roundNumber}): ${reworkData.reason} (Solicitado por: ${reworkData.requestedBy})`
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const currentReworks = t.reworks || [];
          return {
            ...t,
            reworks: [...currentReworks, newRework],
            messages: [...(t.messages || []), reworkAuditMessage]
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) => {
        if (!prev) return null;
        const currentReworks = prev.reworks || [];
        return {
          ...prev,
          reworks: [...currentReworks, newRework],
          messages: [...(prev.messages || []), reworkAuditMessage]
        };
      });
    }
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskForDetail?.id === taskId) {
      setIsTaskDetailModalOpen(false);
      setSelectedTaskForDetail(null);
    }
  };

  // Archive / Unarchive Task
  const handleArchiveTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isArchived: !t.isArchived } : t))
    );
    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev ? { ...prev, isArchived: !prev.isArchived } : null
      );
    }
  };

  // Move Task to another Project / Board / Client
  const handleMoveTask = (
    taskId: string,
    targetProject: string,
    targetClient?: string,
    targetStatus?: TaskStatus
  ) => {
    const auditComment = {
      id: `msg-${Date.now()}`,
      authorName: 'Paola (Lead PM)',
      authorInitials: 'PL',
      authorAvatarBg: 'bg-[#501f92]',
      timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hs',
      content: `📦 Tarea movida a: ${targetProject}${targetClient ? ` (${targetClient})` : ''}.`
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            projectName: targetProject,
            board: targetProject,
            clientName: targetClient || t.clientName,
            status: targetStatus || t.status,
            messages: [...(t.messages || []), auditComment]
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
              ...prev,
              projectName: targetProject,
              board: targetProject,
              clientName: targetClient || prev.clientName,
              status: targetStatus || prev.status,
              messages: [...(prev.messages || []), auditComment]
            }
          : null
      );
    }
  };

  // Delete Log
  const handleDeleteTimeLog = (id: string) => {
    const targetLog = timeLogs.find((l) => l.id === id);
    if (!targetLog) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === targetLog.taskId) {
          return {
            ...t,
            consumedSeconds: Math.max(0, t.consumedSeconds - targetLog.durationSeconds)
          };
        }
        return t;
      })
    );

    setTimeLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Open Task Detail
  const handleOpenTaskDetail = (taskOrId: TaskItem | string) => {
    const target = typeof taskOrId === 'string' ? tasks.find((t) => t.id === taskOrId) : taskOrId;
    if (target) {
      setSelectedTaskForDetail(target);
      setIsTaskDetailModalOpen(true);
    }
  };

  // Toggle task completed state
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'Done' : 'In Progress',
          };
        }
        return t;
      })
    );
  };

  // Add project handler
  const handleAddProject = (projectData: NewProjectPayload) => {
    const newProjectId = `prj-${Date.now()}`;
    const newPrj: ProjectSummaryItem = {
      id: newProjectId,
      name: projectData.name,
      clientName: projectData.clientName,
      brand: projectData.brand,
      leadName: projectData.leadName,
      leadAvatarBg: projectData.leadAvatarBg,
      projectType: projectData.projectType,
      serviceBase: projectData.serviceBase,
      budgetedHours: projectData.budgetedHours,
      soldHours: projectData.soldHours,
      soldValueCOP: projectData.soldValueCOP,
      soldCurrency: projectData.soldCurrency,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      brief: projectData.brief,
      teamMembers: projectData.teamMembers,
      status: 'Activo',
      healthStatus: 'verde',
      healthNote: 'Recién creado · En planificación y arranque'
    };

    setProjectsList((prev) => [newPrj, ...prev]);

    // If template tasks were included, add them to global tasks list
    if (projectData.tasksToCreate && projectData.tasksToCreate.length > 0) {
      const generatedTasks: TaskItem[] = projectData.tasksToCreate.map((t, idx) => ({
        ...t,
        id: `task-${Date.now()}-${idx}`
      }));
      setTasks((prev) => [...generatedTasks, ...prev]);
    }

    // Update client projects history & count
    setClients((prev) =>
      prev.map((cli) => {
        if (cli.name.toLowerCase() === projectData.clientName.toLowerCase()) {
          const formattedValue = projectData.soldValueCOP && projectData.soldValueCOP > 0
            ? `$${(projectData.soldValueCOP / 1000000).toFixed(1)}M`
            : `$${((projectData.budgetedHours * 120000) / 1000000).toFixed(1)}M`;

          const newHistoryItem = {
            id: newProjectId,
            name: projectData.name,
            brand: projectData.brand,
            status: 'Activo' as const,
            quotedValueCOP: formattedValue,
            realMarginPercent: 42.0,
            trafficLight: 'verde' as const,
            tag: projectData.projectType === 'fee_monthly' ? 'Fee mensual' : projectData.projectType === 'fixed_milestones' ? 'Proyecto único' : 'Interno'
          };
          return {
            ...cli,
            projectsCount: cli.projectsCount + 1,
            activeProjectsCount: cli.activeProjectsCount + 1,
            projectsHistory: [newHistoryItem, ...cli.projectsHistory]
          };
        }
        return cli;
      })
    );
  };

  // Update client handler
  const handleUpdateClient = (updatedClient: ClientProfile) => {
    setClients((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  };

  // Add task
  const handleAddTask = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Add user
  const handleAddUser = (newUser: UserItem) => {
    setUsers((prev) => [...prev, newUser]);
  };

  // Delete user
  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard';
      case 'proyectos':
        return 'Proyectos';
      case 'tareas':
        return 'Mis Tareas';
      case 'timesheets':
        return 'Registro de Tiempos';
      case 'capacidad':
        return 'Capacidad del Equipo';
      case 'clientes':
        return 'Clientes';
      case 'cotizador':
        return 'Cotizador';
      case 'finanzas':
        return 'Finanzas';
      case 'el-muro':
        return 'El Muro';
      case 'reportes':
        return 'Reportes';
      case 'nova-ia':
        return 'Nova IA';
      case 'usuarios':
        return 'Usuarios';
      case 'config-roles':
        return 'Roles';
      case 'config-permisos':
        return 'Permisos';
      case 'portal-cliente':
        return 'Portal de Clientes';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="orbit-saas-root min-h-screen bg-[#0d0718] text-white selection:bg-[#ddd6fe] selection:text-[#0f172a]">
      {/* SaaS Live Demo Utility Bar (Compact single header) */}
      <section className="bg-gradient-to-r from-[#1b0d33] to-[#0d0718] py-2.5 px-4 sm:px-6 lg:px-8 border-b border-[#261845]/60">
        <div className="max-w-[1880px] w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f2ecfb] text-[#501f92] text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-[#501f92]" />
              <span>ORBIT</span>
            </span>
            <span className="text-xs text-[#c9b7ff] font-medium hidden sm:inline">
              Sistema Operativo Uhura Group
            </span>
          </div>

          {/* Typography Switcher Bar */}
          <div className="flex items-center gap-2 bg-[#140b24] px-2 py-1 rounded-xl border border-[#261845]">
            <span className="text-[10px] font-bold text-[#c9b7ff] px-1 flex items-center gap-1">
              <Type className="w-3 h-3 text-[#8a4dff]" />
              <span>Fuente:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSaasFont('jakarta')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  saasFont === 'jakarta'
                    ? 'bg-[#501f92] text-white shadow-xs'
                    : 'text-[#c9b7ff]/70 hover:text-white hover:bg-[#261845]'
                }`}
              >
                Plus Jakarta Sans
              </button>
              <button
                onClick={() => setSaasFont('inter')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  saasFont === 'inter'
                    ? 'bg-[#501f92] text-white shadow-xs'
                    : 'text-[#c9b7ff]/70 hover:text-white hover:bg-[#261845]'
                }`}
              >
                Inter
              </button>
              <button
                onClick={() => setSaasFont('montserrat')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  saasFont === 'montserrat'
                    ? 'bg-[#501f92] text-white shadow-xs'
                    : 'text-[#c9b7ff]/70 hover:text-white hover:bg-[#261845]'
                }`}
              >
                Montserrat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main SaaS Canvas Box */}
      <main className="max-w-[1880px] w-full mx-auto px-2 sm:px-4 lg:px-6 mt-3 pb-8">
        <div className={`bg-[#f9fafb] rounded-3xl border border-[#261845] shadow-2xl overflow-hidden flex flex-col min-h-[840px] ${
          saasFont === 'jakarta' ? 'font-saas' : saasFont === 'inter' ? 'font-inter' : 'font-montserrat'
        }`}>
          {/* Top Prototype Navigation Chrome */}
          <div className="bg-[#140b24] px-5 py-2.5 border-b border-[#261845] flex items-center justify-between text-xs text-[#c9b7ff]/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block" />
              <span className="ml-3 font-mono font-bold text-white text-[11px]">
                orbit.uhuragroup.com / {currentView}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-[#d4ff4a] font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#d4ff4a]" />
                <span>Timer en Vivo: <strong>{activeTimer ? 'Activo (Sin redondeo)' : 'En espera'}</strong></span>
              </span>
              <span className="text-[#8a4dff]/40">|</span>
              <span className="flex items-center gap-1 text-white font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8a4dff]" />
                Uhura Operating System 2.0
              </span>
            </div>
          </div>

          {/* Prototype App Body */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Sidebar Desktop */}
            <div className="hidden md:block shrink-0">
              <TaskflowSidebar
                currentView={currentView}
                onSelectView={handleSelectView}
              />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
              <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex">
                <div className="w-64 bg-[#0d0718] h-full shadow-2xl relative z-50">
                  <TaskflowSidebar
                    currentView={currentView}
                    onSelectView={(v) => {
                      handleSelectView(v);
                      setMobileMenuOpen(false);
                    }}
                  />
                </div>
                <div
                  className="flex-1 h-full"
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-[#f8fafc] min-w-0 overflow-y-auto">
              {/* Header with live timer capsule & global task search */}
              <TaskflowHeader
                currentViewTitle={getHeaderTitle()}
                onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
                onSelectAlert={() => handleSelectView('dashboard')}
                onNavigateToDashboard={() => handleSelectView('dashboard')}
                activeTimer={activeTimer}
                onPauseResumeTimer={handlePauseResumeTimer}
                onStopTimer={handleStopTimer}
                onOpenTaskDetail={handleOpenTaskDetail}
                tasks={tasks}
                onSelectTask={(task) => {
                  setSelectedTaskForDetail(task);
                  setIsTaskDetailModalOpen(true);
                }}
              />

              {/* View Content */}
              <div className="p-4 sm:p-7 flex-1">
                {/* 1. DASHBOARD EJECUTIVO */}
                {currentView === 'dashboard' && (
                  <DashboardView
                    tasks={tasks}
                    activeTimer={activeTimer}
                    onStartTimer={handleStartTimer}
                    onPauseResumeTimer={handlePauseResumeTimer}
                    onStopTimer={handleStopTimer}
                    onOpenTaskDetail={handleOpenTaskDetail}
                    onOpenManualLog={handleOpenManualLogWithTask}
                    onNavigateToTasks={() => handleSelectView('tareas')}
                    onNavigateToProjects={() => handleSelectView('proyectos')}
                    onNavigateToClients={() => handleSelectView('clientes')}
                    onNavigateToCapacity={() => handleSelectView('capacidad')}
                    onNavigateToFinance={() => handleSelectView('finanzas')}
                    onSelectClientDetail={(clientName) => {
                      const match = orbitClientsData.find(
                        (c) =>
                          c.name.toLowerCase().includes(clientName.toLowerCase()) ||
                          clientName.toLowerCase().includes(c.name.toLowerCase())
                      );
                      if (match) {
                        setSelectedClientId(match.id);
                      }
                      setCurrentView('clientes');
                    }}
                  />
                )}

                {/* 2. PROYECTOS & JERARQUÍA */}
                {currentView === 'proyectos' && (
                  <ProjectsView
                    tasks={tasks}
                    clients={clients}
                    projectsList={projectsList}
                    selectedProjectId={selectedProjectIdForView}
                    onSelectProject={(id) => setSelectedProjectIdForView(id)}
                    onOpenNewProjectModal={() => {
                      setNewProjectPreselectedClientId(null);
                      setIsNewProjectModalOpen(true);
                    }}
                    onOpenNewTaskModalWithProject={(projectName, clientName) => {
                      setNewTaskPreselectedContext({ projectName, clientName });
                      setIsNewTaskModalOpen(true);
                    }}
                    activeTimer={activeTimer}
                    onStartTimer={handleStartTimer}
                    onPauseResumeTimer={handlePauseResumeTimer}
                    onStopTimer={handleStopTimer}
                    onOpenTaskDetail={handleOpenTaskDetail}
                    onToggleTask={handleToggleTask}
                    onNavigateToClient={(clientName) => {
                      const match = clients.find(
                        (c) =>
                          c.name.toLowerCase().includes(clientName.toLowerCase()) ||
                          clientName.toLowerCase().includes(c.name.toLowerCase())
                      );
                      if (match) {
                        setSelectedClientId(match.id);
                      }
                      setCurrentView('clientes');
                    }}
                  />
                )}

                {/* 3. TAREAS */}
                {currentView === 'tareas' && (
                  <MyTasksView
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
                    activeTimer={activeTimer}
                    onStartTimer={handleStartTimer}
                    onPauseResumeTimer={handlePauseResumeTimer}
                    onStopTimer={handleStopTimer}
                    onOpenTaskDetail={handleOpenTaskDetail}
                    onOpenManualLogModal={(id) => {
                      setManualLogDefaultTaskId(id);
                      setIsManualLogModalOpen(true);
                    }}
                    onUpdateTaskBudgetHours={handleUpdateTaskBudgetHours}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                  />
                )}

                {/* 4. TIMESHEETS / TIME-TRACKING */}
                {currentView === 'timesheets' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <BandejaDelDiaWidget
                      timeLogs={timeLogs}
                      onOpenManualModal={() => {
                        setManualLogDefaultTaskId(undefined);
                        setIsManualLogModalOpen(true);
                      }}
                      onDeleteLog={handleDeleteTimeLog}
                      onOpenTaskDetail={handleOpenTaskDetail}
                    />
                  </div>
                )}

                {/* 5. CAPACIDAD DE EQUIPO */}
                {currentView === 'capacidad' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f1f5f9]">
                        <div className="flex items-center gap-2 text-xs text-[#64748b]">
                          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                          <span>25 colaboradores · 4.400h/mes disponibles · Monitoreo de sobrecarga y balance</span>
                        </div>
                        <span className="text-xs font-bold text-[#501f92] bg-[#f2ecfb] px-3 py-1 rounded-full border border-[#8a4dff]/20 self-start sm:self-auto">
                          4 Semanas de Proyección
                        </span>
                      </div>

                      <div className="space-y-4">
                        {orbitTeamCapacity.map((user) => (
                          <div key={user.id} className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl ${user.avatarBg} text-white flex items-center justify-center font-bold text-xs`}>
                                {user.initials}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-[#0f172a]">{user.name}</h4>
                                <p className="text-xs text-[#64748b]">{user.role}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 sm:w-64">
                              <div className="flex-1">
                                <div className="flex justify-between text-[11px] font-semibold text-[#64748b] mb-1">
                                  <span>Asignación</span>
                                  <span className="text-[#0f172a]">{user.utilizationPercent}%</span>
                                </div>
                                <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                                  <div style={{ width: `${Math.max(user.utilizationPercent, 4)}%` }} className="h-full bg-[#501f92] rounded-full" />
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#0f172a]">{user.hoursAvailable}h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. CLIENTES & CARTERA */}
                {currentView === 'clientes' && (
                  <ClientsView
                    clients={clients}
                    selectedClientId={selectedClientId}
                    onSelectClient={(id) => setSelectedClientId(id)}
                    onNavigateToDashboard={() => {
                      setSelectedClientId(null);
                      setCurrentView('dashboard');
                    }}
                    onNavigateToProject={(projectName) => {
                      const match = projectsList.find((p) => p.name === projectName);
                      if (match) {
                        setSelectedProjectIdForView(match.id);
                      }
                      setCurrentView('proyectos');
                    }}
                    onOpenNewProjectForClient={(clientId) => {
                      setNewProjectPreselectedClientId(clientId);
                      setIsNewProjectModalOpen(true);
                    }}
                    onUpdateClient={handleUpdateClient}
                  />
                )}

                {/* 7. FINANZAS & COTIZADOR */}
                {(currentView === 'finanzas' || currentView === 'cotizador') && (
                  <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                      <div className="text-xs text-[#64748b]">
                        <span>Presupuestación de proyectos por horas hombre y control de cartera</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#f8fafc] text-xs text-[#334155] border border-[#e2e8f0]">
                      <p className="font-bold text-[#0f172a]">Valores en firme de la operación:</p>
                      <p className="text-[11px] mt-1 text-[#64748b]">
                        Cartera por cobrar: <strong className="text-[#0f172a]">$577.7M COP</strong> · Cartera vencida: <strong className="text-[#dc2626]">$501.9M COP</strong> (86.8% en mora).
                      </p>
                    </div>
                  </div>
                )}

                {/* 8. USUARIOS & PERMISOS */}
                {(currentView === 'usuarios' || currentView === 'config-roles' || currentView === 'config-permisos') && (
                  <UsersView
                    users={users}
                    onInviteUser={() => setIsInviteModalOpen(true)}
                    onDeleteUser={handleDeleteUser}
                  />
                )}

                {/* 9. INTELIGENCIA & OTROS */}
                {(currentView === 'el-muro' || currentView === 'reportes' || currentView === 'nova-ia' || currentView === 'portal-cliente') && (
                  <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-[#8a4dff]" />
                      <span className="text-sm font-bold text-[#0f172a]">{getHeaderTitle()}</span>
                    </div>
                    <p className="text-xs text-[#64748b] leading-relaxed">
                      Módulo integrado en Orbit para análisis predictivo de desvíos en entregas y rentabilidad.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Manual Time Log Modal */}
      <ManualTimeLogModal
        isOpen={isManualLogModalOpen}
        onClose={() => setIsManualLogModalOpen(false)}
        tasks={tasks}
        defaultTaskId={manualLogDefaultTaskId}
        onSaveManualLog={handleSaveManualLog}
      />

      {/* Task Detail & Deliverables Modal (COR Visual Split View) */}
      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={() => setIsTaskDetailModalOpen(false)}
        task={selectedTaskForDetail}
        tasksList={tasks}
        onSelectTask={(t) => setSelectedTaskForDetail(t)}
        activeTimer={activeTimer}
        onStartTimer={handleStartTimer}
        onPauseResumeTimer={handlePauseResumeTimer}
        onStopTimer={handleStopTimer}
        onUpdateTitle={handleUpdateTaskTitle}
        onAddRework={handleAddRework}
        onUpdateBudgetHours={handleUpdateTaskBudgetHours}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onUpdateTaskPriority={handleUpdateTaskPriority}
        onUpdateDates={handleUpdateTaskDates}
        onUpdateTeam={handleUpdateTaskTeam}
        onUpdateCriteria={handleUpdateTaskCriteria}
        onAddDeliverable={handleAddDeliverable}
        onAddComment={handleAddComment}
        onRecalibrateDates={handleRecalibrateTaskDates}
        onUpdateBlockerInfo={handleUpdateBlockerInfo}
        onUpdatePhase={handleUpdateTaskPhase}
        onDeleteTask={handleDeleteTask}
        onArchiveTask={handleArchiveTask}
        onNavigateToClient={(clientName) => {
          setIsTaskDetailModalOpen(false);
          const match = orbitClientsData.find(
            (c) =>
              c.name.toLowerCase().includes(clientName.toLowerCase()) ||
              clientName.toLowerCase().includes(c.name.toLowerCase())
          );
          if (match) {
            setSelectedClientId(match.id);
          }
          setCurrentView('clientes');
        }}
        onNavigateToProject={(projectName) => {
          setIsTaskDetailModalOpen(false);
          const match = projectsList.find(
            (p) =>
              p.name.toLowerCase().includes(projectName.toLowerCase()) ||
              projectName.toLowerCase().includes(p.name.toLowerCase())
          );
          if (match) {
            setSelectedProjectIdForView(match.id);
          } else {
            setSelectedProjectIdForView(null);
          }
          setCurrentView('proyectos');
        }}
        onOpenManualLog={handleOpenManualLogWithTask}
        onMoveTask={handleMoveTask}
      />

      {/* Modals */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onAddUser={handleAddUser}
      />

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => {
          setIsNewTaskModalOpen(false);
          setNewTaskPreselectedContext(null);
        }}
        onAddTask={handleAddTask}
        existingTasks={tasks}
        preselectedProjectName={newTaskPreselectedContext?.projectName}
        preselectedClientName={newTaskPreselectedContext?.clientName}
        projectsList={projectsList}
        clientsList={clients}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => {
          setIsNewProjectModalOpen(false);
          setNewProjectPreselectedClientId(null);
        }}
        onAddProject={handleAddProject}
        clients={clients}
        preselectedClientId={newProjectPreselectedClientId || undefined}
      />

      {/* Timer Summary Modal on Stop */}
      <TimerSummaryModal
        isOpen={isTimerSummaryOpen}
        onClose={() => setIsTimerSummaryOpen(false)}
        data={timerSummaryData}
        onOpenTaskDetail={(taskId) => {
          const found = tasks.find((t) => t.id === taskId);
          if (found) {
            setSelectedTaskForDetail(found);
            setIsTaskDetailModalOpen(true);
          }
        }}
      />
    </div>
  );
};
