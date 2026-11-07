import React, { useState, useMemo, useEffect } from 'react';
import { formatDate, formatDateRange } from '../../utils/formatters';
import { PageHeader } from './PageHeader';
import { TaskItem, ActiveTimerState, ClientProfile, ProjectType, ProjectPhaseItem, ProjectSummaryItem, TaskPriority, UserItem, normalizeProjectType, STANDARD_UHURA_ROLES } from './types';
export type { ProjectSummaryItem };
import { BoardView } from './BoardView';
import { ManagePhasesModal } from './ManagePhasesModal';
import { ImportBacklogModal } from './ImportBacklogModal';
import { ProjectOverviewTab } from './projects/ProjectOverviewTab';
import { ProjectTeamTab } from './projects/ProjectTeamTab';
import { ProjectTasksTab } from './projects/ProjectTasksTab';
import { initialUsers } from './mockData';
import { computeScheduleBaseline, planProjectSchedule } from './schedule/scheduleEngine';
import { buildFeeCycles, contractEndDate as computeContractEnd, monthKeyOf, taskCycleKey, generateCycleTasks, daysUntil, RENEWAL_NOTICE_DAYS } from './schedule/feeCycles';
import { ProjectNotificationsModal } from './integrations/ProjectNotificationsModal';
import { CloseProjectModal } from './projects/CloseProjectModal';
import { canViewProjectNotifications } from './integrations/googleChat';
import { calculateBusinessDays } from './health/projectHealthEngine';
import { can } from './auth/permissions';
import { UserAvatar } from './UserAvatar';
import {
  Button,
  Badge,
  TaskStatusBadge,
  RoleChip,
  Input,
  Tooltip
} from '../ui';
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  Building2,
  Clock,
  Calendar,
  ChevronRight,
  ChevronDown,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Layers,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List,
  FolderKanban,
  Check,
  Lock,
  PieChart,
  Activity,
  FileSpreadsheet,
  Settings2,
  LayoutDashboard,
  Upload,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Table as TableIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Archive,
  Trash2,
  X,
  Pencil,
  Bell,
  Flag
} from 'lucide-react';

interface ProjectsViewProps {
  tasks: TaskItem[];
  clients: ClientProfile[];
  projectsList: ProjectSummaryItem[];
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string | null) => void;
  onOpenNewProjectModal: () => void;
  onOpenNewTaskModalWithProject?: (projectName: string, clientName: string) => void;
  activeTimer: ActiveTimerState | null;
  onStartTimer: (task: TaskItem) => void;
  onPauseResumeTimer?: () => void;
  onStopTimer?: () => void;
  onOpenTaskDetail: (task: TaskItem) => void;
  onToggleTask: (taskId: string) => void;
  onNavigateToClient?: (clientName: string) => void;
  onUpdateProject?: (updatedProject: ProjectSummaryItem) => void;
  onAddTaskToProject?: (newTask: Partial<TaskItem>) => void;
  onImportTasksToProject?: (importedTasks: Partial<TaskItem>[]) => void;
  onArchiveProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onUpdateAllTasks?: (updatedTasks: TaskItem[]) => void;
  currentUser?: UserItem;
  users?: UserItem[];
}

type ProjectDetailTab = 'overview' | 'deliverables' | 'tasks' | 'team' | 'matrix' | 'backlog';
type TasksGroupBy = 'frente' | 'fase' | 'kanban' | 'lista';

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  tasks,
  clients,
  projectsList,
  selectedProjectId: initialSelectedProjectId = null,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenNewTaskModalWithProject,
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onStopTimer,
  onOpenTaskDetail,
  onToggleTask,
  onNavigateToClient,
  onUpdateProject,
  onAddTaskToProject,
  onImportTasksToProject,
  onArchiveProject,
  onDeleteProject,
  onUpdateAllTasks,
  currentUser,
  users
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialSelectedProjectId);
  const [activeProjectMenu, setActiveProjectMenu] = useState<string | null>(null);
  const [projectPendingDelete, setProjectPendingDelete] = useState<ProjectSummaryItem | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isCloseProjectModalOpen, setIsCloseProjectModalOpen] = useState(false);
  const [scheduleSuccessMessage, setScheduleSuccessMessage] = useState<string | null>(null);
  const [scheduleKickoffDate, setScheduleKickoffDate] = useState<string>('');
  const [scheduleDurationWeeks, setScheduleDurationWeeks] = useState<number>(4);
  const [scheduleReworkRounds, setScheduleReworkRounds] = useState<number>(2);
  const [scheduleReworkRoundDays, setScheduleReworkRoundDays] = useState<number>(5);
  const [scheduleKickoffWaitDays, setScheduleKickoffWaitDays] = useState<number>(3);
  const [scheduleContractMonths, setScheduleContractMonths] = useState<number>(6); // Fee: vigencia
  const [scheduleRollover, setScheduleRollover] = useState<'none' | 'carry_over' | 'contractual_cap'>('none'); // Fee: horas no usadas
  const [scheduleRecalculateTasks, setScheduleRecalculateTasks] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fee_monthly' | 'fixed_project' | 'internal_non_billable' | 'risk'>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  
  // Sync selected project ID if prop changes from outside (e.g. breadcrumb navigation)
  useEffect(() => {
    setSelectedProjectId(initialSelectedProjectId);
  }, [initialSelectedProjectId]);

  // Cerrar menú contextual de opciones de proyecto (Archivar / Eliminar) al hacer clic fuera
  useEffect(() => {
    if (!activeProjectMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.project-menu-container')) {
        setActiveProjectMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeProjectMenu]);
  
  // Project Detail Tab & Grouping
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>('overview');
  const [tasksGroupBy, setTasksGroupBy] = useState<TasksGroupBy>('frente');
  const [taskSortDirection, setTaskSortDirection] = useState<'asc' | 'desc'>('asc');
  const [collapsedFrentes, setCollapsedFrentes] = useState<Record<string, boolean>>({});
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});

  // Helper for sorting tasks by due date (Nearest / Overdue / Today first by default)
  const sortTasksByDeadline = (taskList: TaskItem[], direction: 'asc' | 'desc') => {
    return [...taskList].sort((a, b) => {
      // Completed / Done tasks go below active tasks
      const aDone = a.completed || a.status === 'Done';
      const bDone = b.completed || b.status === 'Done';
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;

      // Extract ISO date timestamp or fallback
      const getTimestamp = (t: TaskItem) => {
        if (!t.dueDate) return 9999999999999;
        // Check if today / mañana keyword or date string
        const d = new Date(t.dueDate).getTime();
        return isNaN(d) ? 9999999999999 : d;
      };

      const timeA = getTimestamp(a);
      const timeB = getTimestamp(b);

      if (timeA !== timeB) {
        return direction === 'asc' ? timeA - timeB : timeB - timeA;
      }

      // Priority secondary tie breaker (High > Medium > Low)
      const prioWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      const weightA = prioWeight[a.priority] || 2;
      const weightB = prioWeight[b.priority] || 2;
      return weightB - weightA;
    });
  };

  // Backlog Tab Modals & Filters
  const [isManagePhasesOpen, setIsManagePhasesOpen] = useState(false);
  const [isImportBacklogOpen, setIsImportBacklogOpen] = useState(false);
  const [backlogSearch, setBacklogSearch] = useState('');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [selectedFrenteFilter, setSelectedFrenteFilter] = useState<string>('all');

  // Quick Inline Task Creator State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickFase, setQuickFase] = useState('');
  const [quickFrente, setQuickFrente] = useState('');
  const [quickRole, setQuickRole] = useState('Front-End Dev');
  const [quickHours, setQuickHours] = useState('4');
  const [quickAssignee, setQuickAssignee] = useState('Catalina Tejada');
  const [budgetSubView, setBudgetSubView] = useState<'matrix' | 'deliverables'>('matrix');
  const [teamBudgetSubView, setTeamBudgetSubView] = useState<'team' | 'matrix' | 'deliverables'>('team');

  // Edit Project Modal State (Reemplaza la pestaña de configuración)
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectCode, setEditProjectCode] = useState('');
  const [editProjectLead, setEditProjectLead] = useState('');
  const [editProjectStatus, setEditProjectStatus] = useState<string>('Activo');
  const [editProjectBrief, setEditProjectBrief] = useState('');
  // Fee mensual: ciclo consultado (null = mes en curso, 'all' = contrato completo)
  const [selectedCycleKey, setSelectedCycleKey] = useState<string | null>(null);
  useEffect(() => { setSelectedCycleKey(null); }, [selectedProjectId]);

  // Compute metrics for each project based on tasks (dynamic calculation)
  const enrichedProjects = useMemo(() => {
    return projectsList.map((prj) => {
      const allProjectTasks = tasks.filter(
        (t) =>
          t.projectId === prj.id ||
          t.projectName?.toLowerCase() === prj.name.toLowerCase() ||
          t.board?.toLowerCase() === prj.name.toLowerCase()
      );

      // Fee mensual: ciclos vivos de la vigencia (con renovaciones) y vista filtrada por mes
      const isFeePrj = normalizeProjectType(prj.projectType) === 'fee_monthly';
      let cycles = prj.monthlyCycles || [];
      if (isFeePrj && prj.contractStartDate && prj.contractMonths) {
        const renewals = prj.contractRenewals || [];
        const addedMonths = renewals.reduce((sum, r) => sum + r.addedMonths, 0);
        cycles = buildFeeCycles({
          contractStartDate: prj.contractStartDate,
          periods: [
            { months: Math.max(1, prj.contractMonths - addedMonths), monthlyHours: prj.budgetedHours },
            ...renewals.map((r) => ({ months: r.addedMonths, monthlyHours: r.monthlyHours }))
          ],
          rolloverPolicy: prj.rolloverPolicy,
          tasks: allProjectTasks,
          generatedKeys: (prj.monthlyCycles || []).filter((c) => c.tasksGenerated).map((c) => c.monthKey)
        });
      }
      const activeCycleKey = cycles.find((c) => c.status === 'active')?.monthKey || prj.currentMonthCycle || cycles[cycles.length - 1]?.monthKey || null;
      const viewCycleKey = isFeePrj && cycles.length > 0 && prj.id === selectedProjectId
        ? (selectedCycleKey === 'all' ? null : (selectedCycleKey || activeCycleKey))
        : null;
      const viewCycle = cycles.find((c) => c.monthKey === viewCycleKey) || null;
      const projectTasks = viewCycleKey ? allProjectTasks.filter((t) => taskCycleKey(t) === viewCycleKey) : allProjectTasks;

      const tasksAssignedHours = projectTasks.reduce((acc, t) => acc + (t.budgetedHours || 0), 0);
      const projectSoldHours = prj.soldHours || prj.budgetedHours || 0;
      
      // Rollup from deliverables roleBudgets if defined
      const deliverablesQuoted = prj.deliverables?.reduce(
        (sum, d) => sum + (d.roleBudgets?.reduce((rSum, r) => rSum + (r.quotedHours || 0), 0) || 0),
        0
      ) || 0;

      const baseBudgetedHours = deliverablesQuoted > 0
        ? deliverablesQuoted
        : (projectSoldHours > 0 ? projectSoldHours : tasksAssignedHours);
      // En un ciclo: bolsa del mes + horas trasladadas del mes anterior
      const effectiveBudgetedHours = viewCycle ? viewCycle.quotedHours + (viewCycle.rolloverHoursIn || 0) : baseBudgetedHours;

      const totalConsumedSeconds = projectTasks.reduce((acc, t) => acc + (t.consumedSeconds || 0), 0);
      const consumedHours = totalConsumedSeconds / 3600;
      const completedTasksCount = projectTasks.filter((t) => t.completed || t.status === 'Done').length;
      const inReviewCount = projectTasks.filter((t) => t.status === 'Review').length;
      const totalTasksCount = projectTasks.length;

      // Automatic health evaluation
      let healthStatus = prj.healthStatus;
      let healthNote = prj.healthNote || 'En tiempo y horas';

      if (consumedHours > effectiveBudgetedHours && effectiveBudgetedHours > 0) {
        healthStatus = 'rojo';
        healthNote = `Desvío: +${(consumedHours - effectiveBudgetedHours).toFixed(1)}h sobre lo cotizado`;
      } else if (consumedHours > effectiveBudgetedHours * 0.85 && effectiveBudgetedHours > 0) {
        healthStatus = 'amarillo';
        healthNote = `Consumo alto (${Math.round((consumedHours / effectiveBudgetedHours) * 100)}%)`;
      }

      return {
        ...prj,
        budgetedHours: effectiveBudgetedHours,
        tasksAssignedHours,
        consumedHours,
        completedTasksCount,
        inReviewCount,
        totalTasksCount,
        healthStatus,
        healthNote,
        deliverables: prj.deliverables || [],
        coreTeam: prj.coreTeam || [],
        monthlyCycles: cycles,
        rolloverPolicy: prj.rolloverPolicy || 'none',
        tasks: projectTasks,
        allTasks: allProjectTasks,
        activeCycleKey,
        viewCycleKey
      };
    });
  }, [projectsList, tasks, selectedProjectId, selectedCycleKey]);

  // Handle Project Selection
  const handleCardClick = (id: string) => {
    setSelectedProjectId(id);
    if (onSelectProject) onSelectProject(id);
  };

  const handleBackToPortfolio = () => {
    setSelectedProjectId(null);
    if (onSelectProject) onSelectProject(null);
  };

  // Filtered projects for portfolio view
  const filteredProjects = useMemo(() => {
    return enrichedProjects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchClient = filterClient === 'all' || p.clientName === filterClient;

      let matchType = true;
      const normalizedProjectType = normalizeProjectType(p.projectType);
      if (filterType === 'fee_monthly') matchType = normalizedProjectType === 'fee_monthly';
      else if (filterType === 'fixed_project') matchType = normalizedProjectType === 'fixed_project';
      else if (filterType === 'internal_non_billable') matchType = normalizedProjectType === 'internal_non_billable';
      else if (filterType === 'risk') matchType = p.healthStatus === 'rojo' || p.healthStatus === 'amarillo' || p.consumedHours > p.budgetedHours;

      return matchSearch && matchClient && matchType;
    });
  }, [enrichedProjects, searchQuery, filterClient, filterType]);

  // Overall Portfolio Statistics
  const totalBudgetedHours = enrichedProjects.reduce((acc, p) => acc + p.budgetedHours, 0);
  const totalConsumedHours = enrichedProjects.reduce((acc, p) => acc + p.consumedHours, 0);
  const totalActiveProjects = enrichedProjects.filter((p) => p.status === 'Activo').length;
  const onTrackCount = enrichedProjects.filter((p) => p.healthStatus === 'verde').length;

  // Selected project details
  const currentProject = enrichedProjects.find((p) => p.id === selectedProjectId);
  const isFeeProject = normalizeProjectType(currentProject?.projectType) === 'fee_monthly';
  // Permisos de la vista de proyecto (sin usuario en sesión, el prototipo asume edición)
  const canEditProject = !currentUser || can(currentUser, 'edit', 'proyectos');
  const isCollaboratorView = currentUser?.accessLevel === 'collaborator';
  useEffect(() => {
    if (isCollaboratorView && (activeTab === 'matrix' || activeTab === 'team')) setActiveTab('overview');
  }, [isCollaboratorView, activeTab]);

  // If switching to a fee project while on backlog or phase group, reset to valid views
  useEffect(() => {
    if (isFeeProject) {
      if (activeTab === 'backlog') {
        setActiveTab('tasks');
      }
      if (tasksGroupBy === 'fase') {
        setTasksGroupBy('frente');
      }
    }
  }, [isFeeProject, activeTab, tasksGroupBy]);

  // Frentes breakdown for current project
  const frentesBreakdown = useMemo(() => {
    if (!currentProject) return [];

    const frentesMap: Record<string, {
      name: string;
      tasks: TaskItem[];
      budgetedHours: number;
      consumedHours: number;
      completedCount: number;
    }> = {};

    currentProject.tasks.forEach((task) => {
      const fName = task.frente || 'General / Sin frente';
      if (!frentesMap[fName]) {
        frentesMap[fName] = {
          name: fName,
          tasks: [],
          budgetedHours: 0,
          consumedHours: 0,
          completedCount: 0
        };
      }
      frentesMap[fName].tasks.push(task);
      frentesMap[fName].budgetedHours += task.budgetedHours || 0;
      frentesMap[fName].consumedHours += (task.consumedSeconds || 0) / 3600;
      if (task.completed || task.status === 'Done') {
        frentesMap[fName].completedCount += 1;
      }
    });

    return Object.values(frentesMap).map((frente) => ({
      ...frente,
      tasks: sortTasksByDeadline(frente.tasks, taskSortDirection)
    }));
  }, [currentProject, taskSortDirection]);

  // Phases breakdown for current project (Dynamic and customizable)
  const phasesBreakdown = useMemo(() => {
    if (!currentProject) return [];

    const defaultPhases: ProjectPhaseItem[] = [
      { id: 'ph-1', name: 'Discovery & Estrategia', order: 1, status: 'completed', startDate: '2026-08-15', endDate: '2026-08-30' },
      { id: 'ph-2', name: 'UI/UX & Prototipado', order: 2, status: 'in_progress', startDate: '2026-09-01', endDate: '2026-09-20' },
      { id: 'ph-3', name: 'Implementación / Dev', order: 3, status: 'pending', startDate: '2026-09-21', endDate: '2026-10-31' },
      { id: 'ph-4', name: 'QA & Testing', order: 4, status: 'pending', startDate: '2026-11-01', endDate: '2026-11-20' },
      { id: 'ph-5', name: 'Despliegue & Cierre', order: 5, status: 'pending', startDate: '2026-11-21', endDate: '2026-12-15' }
    ];

    const definedPhases = (currentProject.phasesList && currentProject.phasesList.length > 0)
      ? currentProject.phasesList
      : defaultPhases;

    return definedPhases.map((phase) => {
      const phaseTasks = currentProject.tasks.filter((t) => {
        const tPhase = (t.phase || t.fase || '').toLowerCase().trim();
        const pName = phase.name.toLowerCase().trim();
        if (!tPhase) return false;
        return tPhase === pName || pName.includes(tPhase) || tPhase.includes(pName.split(' ')[0]);
      });

      const sortedPhaseTasks = sortTasksByDeadline(phaseTasks, taskSortDirection);
      const budgetedHours = phaseTasks.reduce((acc, t) => acc + (t.budgetedHours || 0), 0);
      const consumedHours = phaseTasks.reduce((acc, t) => acc + ((t.consumedSeconds || 0) / 3600), 0);
      const completedCount = phaseTasks.filter((t) => t.completed || t.status === 'Done').length;

      return {
        ...phase,
        tasks: sortedPhaseTasks,
        budgetedHours,
        consumedHours,
        completedCount,
        totalCount: phaseTasks.length
      };
    });
  }, [currentProject, taskSortDirection]);

  // Filtered Backlog Tasks
  const filteredBacklogTasks = useMemo(() => {
    if (!currentProject) return [];
    return currentProject.tasks.filter((t) => {
      const matchSearch =
        !backlogSearch.trim() ||
        t.title.toLowerCase().includes(backlogSearch.toLowerCase()) ||
        (t.assignee?.name && t.assignee.name.toLowerCase().includes(backlogSearch.toLowerCase())) ||
        (t.budgetedRole && t.budgetedRole.toLowerCase().includes(backlogSearch.toLowerCase())) ||
        (t.frente && t.frente.toLowerCase().includes(backlogSearch.toLowerCase()));

      const matchPhase =
        selectedPhaseFilter === 'all' ||
        (t.phase || t.fase || '').toLowerCase().includes(selectedPhaseFilter.toLowerCase()) ||
        selectedPhaseFilter.toLowerCase().includes((t.phase || t.fase || '').toLowerCase());

      const matchFrente =
        selectedFrenteFilter === 'all' ||
        (t.frente || '').toLowerCase() === selectedFrenteFilter.toLowerCase();

      return matchSearch && matchPhase && matchFrente;
    });
  }, [currentProject, backlogSearch, selectedPhaseFilter, selectedFrenteFilter]);

  // Roles Breakdown (Vendido vs. Ejecutado por Rol)
  const rolesBreakdown = useMemo(() => {
    if (!currentProject) return [];

    const rolesMap: Record<string, {
      role: string;
      budgetedHours: number;
      executedHours: number;
      tasksCount: number;
      assignees: Set<string>;
    }> = {};

    currentProject.tasks.forEach((task) => {
      const roleName = task.budgetedRole || task.assignee.role || 'Especialista';
      if (!rolesMap[roleName]) {
        rolesMap[roleName] = {
          role: roleName,
          budgetedHours: 0,
          executedHours: 0,
          tasksCount: 0,
          assignees: new Set<string>()
        };
      }

      rolesMap[roleName].budgetedHours += task.budgetedHours || 0;
      rolesMap[roleName].executedHours += (task.consumedSeconds || 0) / 3600;
      rolesMap[roleName].tasksCount += 1;
      if (task.assignee?.name) {
        rolesMap[roleName].assignees.add(task.assignee.name);
      }
    });

    return Object.values(rolesMap).map((r) => {
      const diff = r.executedHours - r.budgetedHours;
      return {
        ...r,
        diff,
        isOverbudget: diff > 0.05,
        percent: r.budgetedHours > 0 ? Math.round((r.executedHours / r.budgetedHours) * 100) : 100,
        assigneesList: Array.from(r.assignees)
      };
    });
  }, [currentProject]);

  const toggleCollapseFrente = (frenteName: string, defaultCollapsed: boolean = false) => {
    setCollapsedFrentes((prev) => {
      const isCurrentlyCollapsed = prev[frenteName] !== undefined ? prev[frenteName] : defaultCollapsed;
      return {
        ...prev,
        [frenteName]: !isCurrentlyCollapsed
      };
    });
  };

  const toggleCollapsePhase = (phaseName: string) => {
    setCollapsedPhases((prev) => ({
      ...prev,
      [phaseName]: !prev[phaseName]
    }));
  };

  const handleCreateQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !currentProject) return;

    const assignedPhase = quickFase || phasesBreakdown[0]?.name || 'Discovery & Estrategia';
    const assignedFrente = quickFrente || frentesBreakdown[0]?.name || 'General';

    const newTaskPayload: Partial<TaskItem> = {
      id: `task-${Date.now()}`,
      title: quickTitle.trim(),
      projectName: currentProject.name,
      clientName: currentProject.clientName,
      board: currentProject.name,
      fase: assignedPhase,
      phase: assignedPhase,
      frente: assignedFrente,
      department: assignedFrente,
      budgetedRole: quickRole,
      budgetedHours: parseFloat(quickHours) || 4,
      consumedSeconds: 0,
      status: 'To Do',
      priority: 'Medium',
      completed: false,
      date: 'Hoy',
      // Sin fechas del proyecto, la tarea nace sin fechas (no se inventan); «Iniciar proyecto» las programa.
      startDate: currentProject.startDate || '',
      dueDate: currentProject.endDate || '',
      baselineStartDate: currentProject.startDate || '',
      baselineDueDate: currentProject.endDate || '',
      dueStatus: 'normal',
      dueText: 'En fecha',
      assignee: {
        name: quickAssignee,
        initials: quickAssignee.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'TM',
        avatarBg: 'bg-[#501f92]',
        role: quickRole
      }
    };

    if (onAddTaskToProject) {
      onAddTaskToProject(newTaskPayload);
    }
    setQuickTitle('');
    setIsQuickAddOpen(false);
  };

  const handleSavePhases = (updatedPhases: ProjectPhaseItem[]) => {
    if (!currentProject || !onUpdateProject) return;
    onUpdateProject({
      ...currentProject,
      phasesList: updatedPhases,
      hasPhasesAndBacklog: true
    });
  };

  const handleToggleBacklogCapability = () => {
    if (!currentProject || !onUpdateProject) return;
    const nextState = !currentProject.hasPhasesAndBacklog;
    onUpdateProject({
      ...currentProject,
      hasPhasesAndBacklog: nextState
    });
  };

  useEffect(() => {
    if (currentProject) {
      setScheduleKickoffDate(currentProject.startDate || new Date().toISOString().slice(0, 10));
      setScheduleReworkRounds(currentProject.scheduleConfig?.includedReworkRounds ?? 2);
      setScheduleReworkRoundDays(currentProject.scheduleConfig?.reworkRoundDays ?? 5);
      setScheduleKickoffWaitDays(currentProject.scheduleConfig?.clientKickoffWaitDays ?? 3);
      setScheduleContractMonths(currentProject.contractMonths ?? 6);
      setScheduleRollover((currentProject.rolloverPolicy as 'none' | 'carry_over' | 'contractual_cap') || 'none');
      // Semanas de producción: fuente de verdad = Alcance (productionWeeks heredado de la conversión)
      const scopeWeeks = currentProject.scheduleConfig?.productionWeeks;
      if (scopeWeeks && scopeWeeks > 0) {
        setScheduleDurationWeeks(scopeWeeks);
      } else {
        const estWeeks = Math.max(1, Math.round((currentProject.budgetedHours || 20) / 20));
        setScheduleDurationWeeks(estWeeks);
      }
    }
  }, [currentProject?.id, isScheduleModalOpen]);

  const isCurrentProjectFee = normalizeProjectType(currentProject?.projectType) === 'fee_monthly';

  const scheduleConfigDraft = useMemo(() => ({
    clientKickoffWaitDays: scheduleKickoffWaitDays,
    includedReworkRounds: scheduleReworkRounds,
    reworkRoundDays: scheduleReworkRoundDays,
    productionWeeks: scheduleDurationWeeks
  }), [scheduleKickoffWaitDays, scheduleReworkRounds, scheduleReworkRoundDays, scheduleDurationWeeks]);

  const scheduleBreakdown = useMemo(() => {
    if (!scheduleKickoffDate) return null;
    return computeScheduleBaseline({
      startDate: scheduleKickoffDate,
      productionWeeks: scheduleDurationWeeks,
      config: scheduleConfigDraft,
      isFee: isCurrentProjectFee
    });
  }, [scheduleKickoffDate, scheduleDurationWeeks, scheduleConfigDraft, isCurrentProjectFee]);

  const calculatedEndDate = scheduleBreakdown?.endDate || '';

  const handleConfirmKickoff = () => {
    if (!currentProject || !scheduleKickoffDate) return;
    // Todas las tareas del proyecto (por id o, en datos legados, por nombre), sin filtro de ciclo
    const projectTasks = ((currentProject as any).allTasks || currentProject.tasks) as TaskItem[];
    const projectTaskIds = new Set(projectTasks.map((t) => t.id));
    const plan = planProjectSchedule({
      startDate: scheduleKickoffDate,
      // Fee: las tareas del alcance son la plantilla del PRIMER mes (≈ 4 semanas)
      productionWeeks: isCurrentProjectFee ? 4 : scheduleDurationWeeks,
      config: scheduleConfigDraft,
      isFee: isCurrentProjectFee,
      deliverables: (currentProject.deliverables || []).map((d) => ({
        id: d.id,
        name: d.name,
        totalQuotedHours: d.totalQuotedHours
      })),
      tasks: projectTasks.map((t) => {
        const dels = currentProject.deliverables || [];
        // Respaldo para datos legados: asociar por nombre del frente si el id no coincide
        const delId = dels.some((d) => d.id === t.deliverableId)
          ? t.deliverableId
          : dels.find((d) => d.name === t.frente)?.id || t.deliverableId;
        return { id: t.id, deliverableId: delId, budgetedHours: t.budgetedHours };
      })
    });
    const finalStartDate = plan.baseline.startDate;
    const finalEndDate = plan.baseline.endDate;
    const plannedDelById = new Map(plan.deliverables.map((d) => [d.id, d]));

    const updatedDeliverables = (currentProject.deliverables || []).map((d) => {
      const planned = plannedDelById.get(d.id);
      return planned ? { ...d, startDate: planned.startDate, endDate: planned.endDate } : d;
    });

    // Primer arranque: congela la línea base. Ajustes posteriores solo mueven el forecast.
    const isFirstKickoff = !currentProject.isKickedOff || !currentProject.baselineEndDate;

    // Fee mensual: contrato por vigencia y ciclos mensuales
    const feeStartKey = monthKeyOf(finalStartDate);
    const feeContractEnd = isCurrentProjectFee ? computeContractEnd(finalStartDate, scheduleContractMonths) : undefined;
    const feeTasksForCycles = projectTasks.map((t) => ({ ...t, cycleKey: t.cycleKey || feeStartKey }));
    const feeCycles = isCurrentProjectFee
      ? buildFeeCycles({
          contractStartDate: finalStartDate,
          periods: [{ months: scheduleContractMonths, monthlyHours: currentProject.budgetedHours }],
          rolloverPolicy: scheduleRollover,
          tasks: feeTasksForCycles,
          generatedKeys: [feeStartKey]
        })
      : undefined;

    const updatedProject: ProjectSummaryItem = {
      ...currentProject,
      status: 'Activo',
      startDate: finalStartDate,
      endDate: isCurrentProjectFee ? feeContractEnd : finalEndDate,
      baselineStartDate: isFirstKickoff ? finalStartDate : currentProject.baselineStartDate,
      baselineEndDate: isCurrentProjectFee ? feeContractEnd : (isFirstKickoff ? finalEndDate : currentProject.baselineEndDate),
      forecastEndDate: isCurrentProjectFee ? feeContractEnd : finalEndDate,
      ...(isCurrentProjectFee
        ? {
            contractMonths: scheduleContractMonths,
            rolloverPolicy: scheduleRollover,
            contractStartDate: finalStartDate,
            contractEndDate: feeContractEnd,
            monthlyCycles: feeCycles,
            currentMonthCycle: feeStartKey
          }
        : {}),
      deliverables: updatedDeliverables,
      isKickedOff: true,
      scheduleConfig: isCurrentProjectFee
        ? { ...scheduleConfigDraft, includedReworkRounds: 0 }
        : scheduleConfigDraft,
      healthNote: `Proyecto iniciado formalmente el ${finalStartDate} con cronograma alineado.`
    };

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }

    if (scheduleRecalculateTasks && onUpdateAllTasks && projectTasks.length > 0) {
      const updatedAllTasks = tasks.map((t) => {
        const slot = projectTaskIds.has(t.id) ? plan.tasks[t.id] : undefined;
        if (!slot) return t;
        return {
          ...t,
          ...(isCurrentProjectFee ? { cycleKey: t.cycleKey || feeStartKey } : {}),
          date: slot.scheduledDate,
          scheduledDate: slot.scheduledDate,
          dueDate: slot.dueDate,
          dueText: `Deadline: ${slot.dueDate}`,
          dueStatus: 'normal' as const
        };
      });
      onUpdateAllTasks(updatedAllTasks);
    }

    setIsScheduleModalOpen(false);
    setScheduleSuccessMessage(
      `🚀 ¡Proyecto "${currentProject.name}" iniciado formalmente el ${finalStartDate}! Cronograma alineado y deadlines sincronizados.`
    );
    setTimeout(() => setScheduleSuccessMessage(null), 6000);
  };

  // --- PROJECT DETAIL VIEW ---
  if (currentProject) {
    const percentHours = currentProject.budgetedHours > 0
      ? Math.round((currentProject.consumedHours / currentProject.budgetedHours) * 100)
      : 0;

    const isProjectCompleted = (currentProject.status as string) === 'completed' || (currentProject.status as string) === 'Cerrado' || (currentProject.status as string) === 'Completado';
    const isProjectArchived = currentProject.status === 'Archivado';
    // «Por iniciar» = aún no se ha pulsado «Iniciar proyecto». Si ya se inició con fecha futura
    // (p. ej. arranque el lunes), queda «Programado», no vuelve a pedir el arranque.
    const isProjectPendingToStart = !isProjectCompleted && !isProjectArchived && (
      !currentProject.isKickedOff ||
      !currentProject.startDate ||
      currentProject.status === 'Planificación' ||
      (currentProject.status as string) === 'Por empezar'
    );
    const isProjectScheduled = !isProjectPendingToStart && !isProjectCompleted && !isProjectArchived &&
      Boolean(currentProject.startDate && currentProject.startDate > todayStr);

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {scheduleSuccessMessage && (
          <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
              <span className="text-xs font-bold">{scheduleSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setScheduleSuccessMessage(null)}
              className="text-xs text-[#065f46] hover:underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-2">
          {/* Breadcrumbs Estandarizadas */}
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <button
              onClick={handleBackToPortfolio}
              className="font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
            >
              Proyectos
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
            <span className="font-bold text-[#0f172a] truncate max-w-xs sm:max-w-md">
              {currentProject.clientName}
            </span>
          </div>
        </div>

        {/* Project Header Banner */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  onClick={() => onNavigateToClient && onNavigateToClient(currentProject.clientName)}
                  className="text-xs font-bold text-[#501f92] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {currentProject.clientName}
                </span>
                <span className="text-[#cbd5e1] font-bold">/</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                    currentProject.projectType === 'fee_monthly'
                      ? 'bg-[#d4ff4a]/20 text-[#2e5e04] border border-[#d4ff4a]/40'
                      : currentProject.projectType === 'fixed_project'
                      ? 'bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]'
                      : 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                  }`}
                >
                  {currentProject.projectType === 'fee_monthly'
                    ? 'Fee mensual'
                    : currentProject.projectType === 'fixed_project'
                    ? 'Proyecto único'
                    : 'Interno / No facturable'}
                </span>
              </div>
              
              <h1 className="text-2xl font-extrabold text-[#0f172a] pt-0.5 tracking-tight">{currentProject.name}</h1>
              
              <p className="text-xs text-[#64748b]">
                Líder del proyecto: <strong className="text-[#0f172a]">{currentProject.leadName}</strong>
              </p>
              {/* Badges de Estado, Gates y Tandas */}
              <div className="flex items-center gap-2 flex-wrap pt-1.5">
                {/* 1. Estado Chip con la misma UI exacta de Gates y Tandas */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isProjectArchived
                      ? 'bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1]'
                      : isProjectCompleted
                      ? 'bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]'
                      : isProjectPendingToStart
                      ? 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]'
                      : 'bg-[#ecfdf5] text-[#166534] border border-[#bbf7d0]'
                  }`}
                  title={isProjectPendingToStart ? 'La fecha de arranque aún no inicia o el proyecto está pendiente de iniciar' : 'El proyecto se encuentra formalmente en ejecución'}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isProjectPendingToStart ? 'bg-[#2563eb] animate-pulse' : isProjectCompleted || isProjectArchived ? 'bg-[#64748b]' : 'bg-[#10b981]'
                    }`}
                  />
                  <span>
                    Estado: {isProjectArchived ? 'Archivado' : isProjectCompleted ? 'Cerrado' : isProjectPendingToStart ? 'Por iniciar' : isProjectScheduled ? `Programado · inicia ${formatDate(currentProject.startDate)}` : 'En ejecución'}
                  </span>
                </span>

                {!isFeeProject && (
                  <>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]"
                      title={`Rondas de ajuste incluidas en contrato · ${currentProject.scheduleConfig?.reworkRoundDays ?? 5} días hábiles por ronda`}
                    >
                      🔄 Rondas de ajuste: {currentProject.scheduleConfig?.includedReworkRounds ?? 2}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Schedule Kickoff Action Button & Project Options Menu (siempre en la misma fila) */}
            <div className="flex items-center gap-2 flex-nowrap min-w-0 max-w-full">
              {isProjectCompleted ? (
                <span className="px-4 py-2 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0] text-[#334155] text-xs font-bold">
                  🏁 Cerrado · Fin real: {formatDate(currentProject.actualEndDate || currentProject.closure?.actualEndDate)}
                </span>
              ) : isProjectPendingToStart && !canEditProject ? (
                <span className="px-4 py-2 rounded-2xl bg-[#faf5ff] border border-[#e9d5ff] text-[#501f92] text-xs font-bold">
                  Por iniciar
                </span>
              ) : isProjectPendingToStart ? (
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                  title="Fijar fecha oficial de arranque y sincronizar automáticamente los deadlines de las actividades del equipo"
                >
                  <Play className="w-4 h-4 fill-current text-[#d4ff4a]" />
                  <span className="text-sm font-black tracking-tight">Iniciar proyecto</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canEditProject}
                  onClick={() => canEditProject && setIsScheduleModalOpen(true)}
                  className="disabled:cursor-default flex flex-wrap md:flex-nowrap md:whitespace-nowrap items-center gap-x-2 gap-y-0.5 min-w-0 text-left px-4 py-2 rounded-2xl bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] hover:border-[#501f92] text-[#0f172a] text-xs font-bold transition-all shadow-xs cursor-pointer group"
                  title="Proyecto iniciado. Clic para ajustar fechas o recalcular cronograma"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#501f92]" />
                  <span className="text-xs text-[#334155] font-semibold">
                    Inicio: {formatDate(currentProject.startDate)}
                  </span>
                  <span className="text-[11px] text-[#64748b]">
                    · Fin: {formatDate(currentProject.endDate, 'Por definir')}
                  </span>
                  {canEditProject && (
                    <span className="text-[10px] text-[#64748b] group-hover:text-[#501f92] underline ml-1">
                      Ajustar
                    </span>
                  )}
                </button>
              )}

              {/* Project Actions Menu (3 dots) — solo si hay acciones para el perfil */}
              {(canEditProject || canViewProjectNotifications(currentUser?.accessLevel)) && (
              <div className="relative project-menu-container shrink-0">
                <button
                  onClick={() => setActiveProjectMenu(activeProjectMenu === currentProject.id ? null : currentProject.id)}
                  className="p-2.5 rounded-2xl bg-white hover:bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a] border border-[#cbd5e1] hover:border-[#501f92] transition-colors cursor-pointer shadow-xs"
                  title="Opciones del proyecto"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeProjectMenu === currentProject.id && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {canEditProject && (
                    <button
                      onClick={() => {
                        setEditProjectName(currentProject.name);
                        setEditProjectCode(currentProject.code || '');
                        setEditProjectLead(currentProject.leadName || '');
                        setEditProjectStatus(currentProject.status || 'Activo');
                        setEditProjectBrief(currentProject.brief || '');
                        setIsEditProjectModalOpen(true);
                        setActiveProjectMenu(null);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#501f92]" />
                      <span>Editar proyecto</span>
                    </button>
                    )}

                    {canViewProjectNotifications(currentUser?.accessLevel) && (
                      <button
                        onClick={() => {
                          setIsNotificationsModalOpen(true);
                          setActiveProjectMenu(null);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Bell className="w-3.5 h-3.5 text-[#501f92]" />
                        <span>Notificaciones</span>
                      </button>
                    )}

                    {canEditProject && !isProjectPendingToStart && !isProjectCompleted && !isProjectArchived && (
                      <button
                        onClick={() => {
                          setIsCloseProjectModalOpen(true);
                          setActiveProjectMenu(null);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5 text-[#501f92]" />
                        <span>Cerrar proyecto</span>
                      </button>
                    )}

                    {canEditProject && (
                    <>
                    <button
                      onClick={() => {
                        if (onArchiveProject) {
                          onArchiveProject(currentProject.id);
                        }
                        setActiveProjectMenu(null);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5 text-[#501f92]" />
                      <span>{currentProject.status === 'Archivado' ? 'Desarchivar proyecto' : 'Archivar proyecto'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setProjectPendingDelete(currentProject);
                        setActiveProjectMenu(null);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#dc2626] hover:bg-[#fee2e2]/40 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#dc2626]" />
                      <span>Eliminar proyecto</span>
                    </button>
                    </>
                    )}
                  </div>
                )}
              </div>
              )}
            </div>
          </div>

          {/* Fee mensual: ciclo consultado, tareas del mes y renovación */}
          {isFeeProject && currentProject.monthlyCycles && currentProject.monthlyCycles.length > 0 && (() => {
            const cycles = currentProject.monthlyCycles;
            const activeKey = (currentProject as any).activeCycleKey as string | null;
            const viewKey = (currentProject as any).viewCycleKey as string | null;
            const allTasks = ((currentProject as any).allTasks || currentProject.tasks) as TaskItem[];
            const activeIdx = Math.max(0, cycles.findIndex((c) => c.monthKey === activeKey));
            const near = cycles.slice(Math.max(0, activeIdx - 1), activeIdx + 2);
            const others = cycles.filter((c) => !near.includes(c));
            const years = Array.from(new Set(others.map((c) => c.monthKey.slice(0, 4))));
            const viewCycle = cycles.find((c) => c.monthKey === viewKey) || null;
            const firstKey = cycles[0].monthKey;
            const templateTasks = allTasks.filter((t) => taskCycleKey(t) === firstKey);
            const canGenerate = canEditProject && viewCycle && viewCycle.status !== 'closed' && currentProject.tasks.length === 0 && templateTasks.length > 0 && viewCycle.monthKey !== firstKey;
            const daysLeft = currentProject.contractEndDate ? daysUntil(currentProject.contractEndDate) : null;
            return (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#f1f5f9] text-xs">
                <label className="flex items-center gap-2 font-semibold text-[#475569]">
                  <span>Ciclo:</span>
                  <select
                    value={selectedCycleKey || ''}
                    onChange={(e) => setSelectedCycleKey(e.target.value || null)}
                    className="px-2.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] font-bold"
                  >
                    <option value="">{cycles.find((c) => c.monthKey === activeKey)?.monthLabel || 'Mes actual'} (en curso)</option>
                    {near.filter((c) => c.monthKey !== activeKey).map((c) => (
                      <option key={c.monthKey} value={c.monthKey}>{c.monthLabel}{c.status === 'closed' ? ' · cerrado' : ' · próximo'}</option>
                    ))}
                    {years.map((y) => (
                      <optgroup key={y} label={`Otros meses ${y}`}>
                        {others.filter((c) => c.monthKey.startsWith(y)).map((c) => (
                          <option key={c.monthKey} value={c.monthKey}>{c.monthLabel}{c.status === 'closed' ? ' · cerrado' : ''}</option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="all">Contrato completo</option>
                  </select>
                </label>
                {viewCycle && (
                  <span className="text-[#64748b]">
                    Bolsa {viewCycle.quotedHours}h{viewCycle.rolloverHoursIn ? ` + ${viewCycle.rolloverHoursIn}h trasladadas` : ''} · {viewCycle.executedHours}h ejecutadas
                  </span>
                )}
                {canGenerate && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!onUpdateAllTasks || !viewCycle) return;
                      const generated = generateCycleTasks(templateTasks, firstKey, viewCycle.monthKey);
                      onUpdateAllTasks([...tasks, ...generated]);
                      onUpdateProject?.({
                        ...currentProject,
                        monthlyCycles: cycles.map((c) => (c.monthKey === viewCycle.monthKey ? { ...c, tasksGenerated: true } : c))
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white font-bold cursor-pointer"
                    title="Crea las tareas recurrentes del mes a partir de la plantilla del primer mes (en producción lo hace ECO automáticamente el día 1)"
                  >
                    Generar tareas de {viewCycle!.monthLabel}
                  </button>
                )}
                {daysLeft !== null && daysLeft <= RENEWAL_NOTICE_DAYS && (
                  <span className={`ml-auto px-2.5 py-1 rounded-full font-bold border ${daysLeft < 0 ? 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]' : 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'}`}>
                    {daysLeft < 0 ? `Contrato vencido hace ${-daysLeft} días` : `Contrato vence en ${daysLeft} días`} · renovar en Resumen
                  </span>
                )}
              </div>
            );
          })()}

          {/* Quick 4 KPIs Bar (Compact, horizontal strip) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#f1f5f9] text-xs">
            {/* 1. Presupuesto */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Presupuesto</span>
              <span className="text-base font-extrabold text-[#0f172a] font-mono mt-0.5">
                {currentProject.budgetedHours % 1 === 0 ? currentProject.budgetedHours : currentProject.budgetedHours.toFixed(1)}h
              </span>
              <span className="text-[10px] text-[#64748b] block mt-0.5 truncate">
                {currentProject.tasksAssignedHours && currentProject.budgetedHours > currentProject.tasksAssignedHours
                  ? `${currentProject.tasksAssignedHours}h asignadas · ${(currentProject.budgetedHours - currentProject.tasksAssignedHours).toFixed(0)}h disp.`
                  : 'Bolsa cotizada'}
              </span>
            </div>

            {/* 2. Horas ejecutadas */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Ejecución</span>
              <span className="text-base font-extrabold text-[#0f172a] font-mono mt-0.5">
                {currentProject.consumedHours.toFixed(1)}h{' '}
                <span className="text-xs font-normal text-[#64748b]">({percentHours}%)</span>
              </span>
              <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden mt-1.5">
                <div
                  style={{ width: `${Math.min(percentHours, 100)}%` }}
                  className={`h-full rounded-full transition-all ${
                    percentHours > 100
                      ? 'bg-[#ef4444]'
                      : percentHours > 85
                      ? 'bg-[#f59e0b]'
                      : 'bg-[#10b981]'
                  }`}
                />
              </div>
            </div>

            {/* 3. Tareas / Entregables */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Tareas</span>
              <span className="text-base font-extrabold text-[#0f172a] mt-0.5">
                {currentProject.completedTasksCount}/{currentProject.totalTasksCount}{' '}
                <span className="text-xs font-normal text-[#64748b]">
                  ({currentProject.totalTasksCount > 0 ? Math.round((currentProject.completedTasksCount / currentProject.totalTasksCount) * 100) : 0}%)
                </span>
              </span>
              <span className="text-[10px] text-[#64748b] block mt-0.5">
                {currentProject.totalTasksCount - currentProject.completedTasksCount} pendientes
              </span>
            </div>

            {/* 4. Cronograma */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Cronograma</span>
              <span className="text-xs font-bold text-[#0f172a] block truncate mt-0.5">
                {isProjectPendingToStart && !currentProject.startDate
                  ? 'Se define al iniciar'
                  : formatDateRange(currentProject.startDate, currentProject.forecastEndDate || currentProject.endDate)}
              </span>
              {(() => {
                const base = currentProject.baselineEndDate;
                const fc = currentProject.forecastEndDate;
                if (!base || !fc || base === fc) return null;
                const late = fc > base;
                const d = late ? calculateBusinessDays(base, fc) : calculateBusinessDays(fc, base);
                return (
                  <span className={`text-[10px] block mt-0.5 font-semibold ${late ? 'text-[#b45309]' : 'text-[#15803d]'}`}>
                    Base {base} · {late ? '+' : '−'}{d} d hábiles
                  </span>
                );
              })()}
              <div className="mt-1">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  currentProject.status === 'Archivado'
                    ? 'bg-[#f1f5f9] text-[#64748b]'
                    : currentProject.status === 'En Pausa'
                    ? 'bg-[#fffbeb] text-[#b45309]'
                    : isProjectPendingToStart
                    ? 'bg-[#faf5ff] text-[#501f92]'
                    : 'bg-[#ecfdf5] text-[#166534]'
                }`}>
                  {isProjectPendingToStart ? 'Por iniciar' : (currentProject.status || 'Activo')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs: Resumen | Tareas | Matriz Horas | Backlog? */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#f5f3ff] text-[#501f92] border border-[#ddd6fe] shadow-2xs'
                : 'text-[#64748b] hover:text-[#501f92] hover:bg-[#f8fafc] border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-current" />
            <span>Resumen</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tasks'
                ? 'bg-[#f5f3ff] text-[#501f92] border border-[#ddd6fe] shadow-2xs'
                : 'text-[#64748b] hover:text-[#501f92] hover:bg-[#f8fafc] border border-transparent'
            }`}
          >
            <List className="w-3.5 h-3.5 text-current" />
            <span>Tareas ({currentProject.tasks.length})</span>
          </button>

          {!isCollaboratorView && (
          <button
            onClick={() => {
              setActiveTab('matrix');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'matrix' || activeTab === 'team'
                ? 'bg-[#f5f3ff] text-[#501f92] border border-[#ddd6fe] shadow-2xs'
                : 'text-[#64748b] hover:text-[#501f92] hover:bg-[#f8fafc] border border-transparent'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-current" />
            <span>Matriz Horas por Rol ({rolesBreakdown.length})</span>
          </button>
          )}

          {!isFeeProject && currentProject.phasesList && currentProject.phasesList.length > 0 && (
            <button
              onClick={() => setActiveTab('backlog')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'backlog'
                  ? 'bg-[#f5f3ff] text-[#501f92] border border-[#ddd6fe] shadow-2xs'
                  : 'text-[#64748b] hover:text-[#501f92] hover:bg-[#f8fafc] border border-transparent'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-current" />
              <span>Backlog</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 border ${
                  activeTab === 'backlog'
                    ? 'bg-[#ede9fe] text-[#501f92] border-[#ddd6fe]'
                    : 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]'
                }`}
              >
                {phasesBreakdown.length} fases
              </span>
            </button>
          )}
        </div>

        {/* TAB 0: RESUMEN EJECUTIVO (OVERVIEW) */}
        {activeTab === 'overview' && (
          <ProjectOverviewTab
            project={currentProject}
            deliverables={currentProject.deliverables || []}
            coreTeam={currentProject.coreTeam || []}
            allProjects={projectsList}
            allTasks={tasks}
            onSelectCycle={(key) => setSelectedCycleKey(key)}
            currentUser={currentUser}
            allUsers={users || initialUsers}
            onUpdateProject={onUpdateProject}
            onNavigateToDeliverables={() => {
              setActiveTab('overview');
            }}
            onNavigateToTasks={(frenteName) => {
              setActiveTab('tasks');
              if (frenteName) setSelectedFrenteFilter(frenteName);
            }}
            onNavigateToTeam={() => {
              setActiveTab('overview');
            }}
            onSelectClient={(cName) => {
              if (onNavigateToClient) onNavigateToClient(cName);
            }}
          />
        )}

        {/* TAB 1: TAREAS (NORMALIZADO PASO 4 - ATOMIC UNIT) */}
        {activeTab === "tasks" && (
          <ProjectTasksTab
            project={currentProject}
            tasks={currentProject.tasks}
            allProjects={projectsList}
            users={initialUsers}
            currentUser={currentUser}
            activeTimer={activeTimer}
            onStartTimer={onStartTimer}
            onPauseResumeTimer={onPauseResumeTimer}
            onOpenTaskDetail={onOpenTaskDetail}
            onUpdateTasks={(newTasks) => {
              // Fuente única: la lista global de tareas. Se reemplazan las tareas visibles del proyecto
              // (pueden estar filtradas por ciclo) sin tocar las demás.
              if (onUpdateAllTasks) {
                const visibleIds = new Set(currentProject.tasks.map((t) => t.id));
                onUpdateAllTasks([...tasks.filter((t) => !visibleIds.has(t.id)), ...newTasks]);
              }
              if (onUpdateProject) {
                const totalConsumed = newTasks.reduce((sum, t) => sum + (t.consumedSeconds || 0) / 3600, 0);
                const completedCount = newTasks.filter((t) => t.status === "Done" || t.completed || t.status === "completed").length;
                onUpdateProject({
                  ...currentProject,
                  tasks: newTasks,
                  consumedHours: totalConsumed,
                  completedTasksCount: completedCount,
                  totalTasksCount: newTasks.length
                });
              }
            }}
            onUpdateProject={onUpdateProject}
          />
        )}

        {/* TAB: BACKLOG & CRONOGRAMA (For Projects with Backlog & Phases) */}
        {activeTab === 'backlog' && (
          <div className="space-y-5">
            {/* Top Phase Lifecycle Stepper & Controls */}
            <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                <div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#501f92]" />
                    <h3 className="font-extrabold text-sm text-[#0f172a]">Gestión de Backlog & Fases</h3>
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Planifica el cronograma, asigna roles cotizados, controla el avance por hitos y preserva la línea base (Baseline).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsImportBacklogOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] text-xs font-bold border border-[#e2e8f0] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#501f92]" />
                    <span>Importar backlog</span>
                  </button>

                  <button
                    onClick={() => setIsManagePhasesOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Configurar fases</span>
                  </button>
                </div>
              </div>

              {/* Phase Lifecycle Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {phasesBreakdown.map((phase, idx) => {
                  const isSelected = selectedPhaseFilter === phase.name;
                  return (
                    <div
                      key={phase.id || phase.name}
                      onClick={() => setSelectedPhaseFilter(isSelected ? 'all' : phase.name)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#f5f3ff] border-[#501f92] ring-2 ring-[#501f92]/20 shadow-xs'
                          : phase.status === 'completed'
                          ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1]'
                          : phase.status === 'in_progress'
                          ? 'bg-white border-[#e9d5ff] hover:border-[#501f92]'
                          : 'bg-[#f8fafc]/60 border-[#f1f5f9] hover:border-[#e2e8f0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${
                          phase.status === 'completed'
                            ? 'bg-[#ecfdf5] text-[#065f46]'
                            : phase.status === 'in_progress'
                            ? 'bg-[#501f92] text-white'
                            : 'bg-[#e2e8f0] text-[#64748b]'
                        }`}>
                          Fase {idx + 1}
                        </span>
                        <span className="text-[10px] text-[#64748b] font-mono font-bold">
                          {phase.tasks.length} {phase.tasks.length === 1 ? 'tarea' : 'tareas'}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-[#0f172a] mt-2 line-clamp-1" title={phase.name}>
                        {phase.name}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-[#64748b] mt-1">
                        <span>{formatDateRange(phase.startDate, phase.endDate)}</span>
                        <span className="font-mono font-bold text-[#0f172a]">{phase.consumedHours.toFixed(0)}/{phase.budgetedHours}h</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1 bg-[#e2e8f0] rounded-full overflow-hidden mt-2">
                        <div
                          style={{
                            width: `${phase.totalCount > 0 ? Math.min(100, Math.round((phase.completedCount / phase.totalCount) * 100)) : 0}%`
                          }}
                          className={`h-full rounded-full ${
                            phase.status === 'completed' ? 'bg-[#10b981]' : 'bg-[#501f92]'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action / Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#e2e8f0] shadow-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={backlogSearch}
                    onChange={(e) => setBacklogSearch(e.target.value)}
                    placeholder="Buscar en el backlog..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#501f92]"
                  />
                </div>

                {/* Filter Phase */}
                <select
                  value={selectedPhaseFilter}
                  onChange={(e) => setSelectedPhaseFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#501f92] font-semibold text-[#0f172a]"
                >
                  <option value="all">Todas las fases ({phasesBreakdown.length})</option>
                  {phasesBreakdown.map((p) => (
                    <option key={p.id || p.name} value={p.name}>
                      {p.name} ({p.tasks.length})
                    </option>
                  ))}
                </select>

                {/* Filter Frente / Servicio */}
                <select
                  value={selectedFrenteFilter}
                  onChange={(e) => setSelectedFrenteFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#501f92] font-semibold text-[#0f172a]"
                >
                  <option value="all">Todos los servicios ({frentesBreakdown.length})</option>
                  {frentesBreakdown.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} ({f.tasks.length})
                    </option>
                  ))}
                </select>

                {(selectedPhaseFilter !== 'all' || selectedFrenteFilter !== 'all' || backlogSearch) && (
                  <button
                    onClick={() => {
                      setSelectedPhaseFilter('all');
                      setSelectedFrenteFilter('all');
                      setBacklogSearch('');
                    }}
                    className="text-xs text-[#501f92] hover:underline font-bold px-2"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isQuickAddOpen ? 'Cerrar formulario' : 'Nueva tarea'}</span>
              </button>
            </div>

            {/* Inline Quick Task Creator Form */}
            {isQuickAddOpen && (
              <form
                onSubmit={handleCreateQuickTask}
                className="bg-white rounded-2xl p-4 border-2 border-[#e9d5ff] shadow-sm space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
                  <span className="text-xs font-extrabold text-[#501f92] flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Agregar Tarea al Backlog
                  </span>
                  <span className="text-[11px] text-[#64748b]">Presiona Guardar para insertar en la fase</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  <div className="lg:col-span-2">
                    <label className="text-[11px] font-extrabold text-[#1e293b] block mb-1">Nombre de la tarea *</label>
                    <input
                      type="text"
                      required
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      placeholder="Ej: Integración pasarela de pagos Wompi"
                      className="w-full px-3 py-2 text-xs bg-white text-[#0f172a] font-medium border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#501f92] focus:ring-1 focus:ring-[#501f92] placeholder:text-[#7C8AA0] placeholder:font-normal"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-[#1e293b] block mb-1">Fase</label>
                    <select
                      value={quickFase}
                      onChange={(e) => setQuickFase(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white text-[#0f172a] font-semibold border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#501f92] focus:ring-1 focus:ring-[#501f92]"
                    >
                      {phasesBreakdown.map((p) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-[#1e293b] block mb-1">Servicio / Entregable</label>
                    <select
                      value={quickFrente}
                      onChange={(e) => setQuickFrente(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white text-[#0f172a] font-semibold border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#501f92] focus:ring-1 focus:ring-[#501f92]"
                    >
                      {frentesBreakdown.map((f) => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-[#1e293b] block mb-1">Rol & Horas</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <select
                        value={quickRole}
                        onChange={(e) => setQuickRole(e.target.value)}
                        className="px-2 py-2 text-xs bg-white text-[#0f172a] font-semibold border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#501f92] focus:ring-1 focus:ring-[#501f92]"
                      >
                        {STANDARD_UHURA_ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={quickHours}
                        onChange={(e) => setQuickHours(e.target.value)}
                        className="px-2 py-2 text-xs bg-white text-[#0f172a] font-medium border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#501f92] focus:ring-1 focus:ring-[#501f92]"
                      />
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="w-full py-2 px-3 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsQuickAddOpen(false)}
                      className="py-2 px-2.5 rounded-xl bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] text-xs font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Backlog Matrix Table */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3 bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-[#501f92]" />
                  <h3 className="font-extrabold text-sm text-[#0f172a]">Backlog del Proyecto</h3>
                  <span className="text-xs text-[#64748b]">
                    ({filteredBacklogTasks.length} de {currentProject.tasks.length} tareas)
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Completada
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" /> En revisión
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> En proceso
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs min-w-[760px]">
                  <thead>
                    <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-white">
                      <th className="py-3 px-4 min-w-[200px]">TAREA / DEPENDENCIAS</th>
                      <th className="py-3 px-3 min-w-[90px]">FASE</th>
                      <th className="py-3 px-3 min-w-[90px]">SERVICIO</th>
                      <th className="py-3 px-3 min-w-[100px]">ROL COTIZADO</th>
                      <th className="py-3 px-3 min-w-[110px]">RESPONSABLE</th>
                      <th className="py-3 px-3 min-w-[70px]">HORAS</th>
                      <th className="py-3 px-3 min-w-[130px]">CRONOGRAMA & BASELINE</th>
                      <th className="py-3 px-3 text-center w-14">TIMER</th>
                      <th className="py-3 px-4 text-right pr-5 min-w-[100px]">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredBacklogTasks.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-[#94a3b8]">
                          No se encontraron tareas con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredBacklogTasks.map((task) => {
                        const isRunning = activeTimer?.taskId === task.id;
                        const taskConsumedH = (task.consumedSeconds || 0) / 3600;
                        const hasBaselineShift = task.baselineDueDate && task.dueDate && task.baselineDueDate !== task.dueDate;

                        return (
                          <tr
                            key={task.id}
                            onClick={() => onOpenTaskDetail(task)}
                            className="hover:bg-[#f8fafc] cursor-pointer transition-colors group text-[#0f172a]"
                          >
                            {/* Actividad */}
                            <td className="py-3.5 px-4 max-w-[260px]">
                              <div className="flex items-start gap-2.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleTask(task.id);
                                  }}
                                  className="text-[#94a3b8] hover:text-[#501f92] transition-colors cursor-pointer mt-0.5"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-[#cbd5e1] hover:border-[#501f92]" />
                                  )}
                                </button>
                                <div>
                                  <span className={`font-bold text-xs group-hover:text-[#501f92] block ${task.completed ? 'line-through text-[#94a3b8]' : ''}`}>
                                    {task.title}
                                  </span>
                                  {task.dependencyTaskTitle && (
                                    <div className="flex items-center gap-1 text-[10px] text-[#64748b] mt-0.5">
                                      <Lock className="w-2.5 h-2.5 text-[#f59e0b]" />
                                      <span>Predecesora: <strong className="text-[#475569]">{task.dependencyTaskTitle}</strong></span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Fase */}
                            <td className="py-3.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe]">
                                {task.phase || task.fase || 'Discovery'}
                              </span>
                            </td>

                            {/* Frente */}
                            <td className="py-3.5 px-3">
                              <span className="text-xs text-[#64748b] font-medium">{task.frente || 'General'}</span>
                            </td>

                            {/* Rol Cotizado */}
                            <td className="py-3.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#f5f3ff] text-[#501f92] border border-[#e9d5ff]">
                                {task.budgetedRole || 'Especialista'}
                              </span>
                            </td>

                            {/* Responsable */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <UserAvatar
                                  user={task.assignee}
                                  size="custom"
                                  className="w-5 h-5 rounded-full text-[8px]"
                                />
                                <span className="text-xs text-[#334155] font-medium">{task.assignee.name}</span>
                              </div>
                            </td>

                            {/* Horas */}
                            <td className="py-3.5 px-3 font-mono font-bold text-xs">
                              <span className={taskConsumedH > task.budgetedHours ? 'text-[#ef4444]' : 'text-[#0f172a]'}>
                                {taskConsumedH.toFixed(1)} h
                              </span>
                              <span className="text-[10px] text-[#64748b] font-normal"> / {task.budgetedHours} h</span>
                            </td>

                            {/* Fechas & Baseline */}
                            <td className="py-3.5 px-3">
                              <div className="text-[11px] font-medium text-[#334155]">
                                {formatDateRange(task.startDate, task.dueDate)}
                              </div>
                              {hasBaselineShift && (
                                <div className="text-[9px] font-bold text-[#d97706] flex items-center gap-0.5 mt-0.5" title={`Línea base original: ${task.baselineDueDate}`}>
                                  <span>BL: {task.baselineDueDate?.slice(5)}</span>
                                  <span>⚠️</span>
                                </div>
                              )}
                            </td>

                            {/* Timer */}
                            <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              {isRunning ? (
                                <button
                                  onClick={onPauseResumeTimer}
                                  className={`p-1.5 rounded-lg text-white font-bold transition-all shadow-xs ${
                                    activeTimer?.isPaused ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                                  }`}
                                >
                                  {activeTimer?.isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                </button>
                              ) : (
                                <button
                                  onClick={() => onStartTimer(task)}
                                  className="p-1.5 rounded-lg bg-[#f8fafc] hover:bg-[#501f92] text-[#64748b] hover:text-white border border-[#e2e8f0] transition-colors cursor-pointer"
                                >
                                  <Play className="w-3 h-3" />
                                </button>
                              )}
                            </td>

                            {/* Estado */}
                            <td className="py-3.5 px-4 text-right pr-5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                task.status === 'Done' || task.completed
                                  ? 'bg-[#ecfdf5] text-[#065f46]'
                                  : task.status === 'Review'
                                  ? 'bg-[#f2ecfb] text-[#501f92]'
                                  : task.status === 'In Progress'
                                  ? 'bg-[#fffbeb] text-[#92400e]'
                                  : 'bg-[#f1f5f9] text-[#475569]'
                              }`}>
                                {task.status === 'Done' ? 'Completada' : task.status === 'Review' ? 'En revisión' : task.status === 'In Progress' ? 'En proceso' : 'Por hacer'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MATRIZ HORAS POR ROL */}
        {(activeTab === 'matrix' || activeTab === 'team') && !isCollaboratorView && (
          <div className="space-y-5">
                {/* Top Analysis Notice */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f5f3ff] to-[#f8fafc] border border-[#e9d5ff] flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#501f92] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-[#0f172a]">
                      Análisis Operativo: Horas Cotizadas vs. Horas Reales por Rol
                    </h4>
                    <p className="text-[11px] text-[#64748b] mt-0.5 leading-relaxed">
                      ECO compara la matriz de roles comercialmente cotizados contra las horas reales que el equipo ejecutó. 
                      Esta data nutre directamente el historial de estimaciones de Uhura para futuros proyectos y cotizaciones.
                    </p>
                  </div>
                </div>

                {/* 1. Matriz por Rol */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-[#f1f5f9] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#501f92]" />
                      <h3 className="font-extrabold text-sm text-[#0f172a]">Consolidado de Horas por Rol</h3>
                    </div>
                    <span className="text-xs text-[#64748b]">Total roles cotizados: {rolesBreakdown.length}</span>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs min-w-[680px]">
                      <thead>
                        <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                          <th className="py-3 px-5 min-w-[140px]">ROL COTIZADO</th>
                          <th className="py-3 px-4 text-right min-w-[100px]">HORAS COTIZADAS</th>
                          <th className="py-3 px-4 text-right min-w-[100px]">HORAS EJECUTADAS</th>
                          <th className="py-3 px-4 text-right min-w-[110px]">DESVIACIÓN (VAR)</th>
                          <th className="py-3 px-4 min-w-[140px]">RESPONSABLES REALES</th>
                          <th className="py-3 px-5 text-right pr-6 min-w-[120px]">SALUD / ALERTA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9]">
                        {rolesBreakdown.map((r) => {
                          return (
                            <tr key={r.role} className="hover:bg-[#f8fafc] transition-colors">
                              <td className="py-3.5 px-5 font-bold text-[#0f172a]">
                                <span className="text-xs">{r.role}</span>
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#501f92]">
                                {r.budgetedHours.toFixed(1)} h
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0f172a]">
                                {r.executedHours.toFixed(1)} h
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-bold">
                                {r.diff === 0 ? (
                                  <span className="text-[#64748b]">0.0 h</span>
                                ) : r.diff > 0 ? (
                                  <span className="text-[#ef4444]">+{r.diff.toFixed(1)} h ⚠️</span>
                                ) : (
                                  <span className="text-[#10b981]">{r.diff.toFixed(1)} h</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {r.assigneesList.map((name) => (
                                    <span key={name} className="px-2 py-0.5 rounded-lg bg-[#f1f5f9] text-[10px] font-semibold text-[#475569]">
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="py-3.5 px-5 text-right pr-6">
                                {r.isOverbudget ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Sobreconsumo</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                                    <Check className="w-3 h-3" />
                                    <span>En Presupuesto</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Matriz por Frente */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-[#f1f5f9] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-[#501f92]" />
                      <h3 className="font-extrabold text-sm text-[#0f172a]">Consolidado de Horas por Servicio</h3>
                    </div>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead>
                        <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                          <th className="py-3 px-5 min-w-[150px]">SERVICIO / ENTREGABLE</th>
                          <th className="py-3 px-4 text-right min-w-[100px]">HORAS COTIZADAS</th>
                          <th className="py-3 px-4 text-right min-w-[100px]">HORAS EJECUTADAS</th>
                          <th className="py-3 px-4 text-right min-w-[100px]">DESVIACIÓN</th>
                          <th className="py-3 px-4 text-center min-w-[80px]">AVANCE</th>
                          <th className="py-3 px-5 text-right pr-6 min-w-[110px]">ESTADO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9]">
                        {frentesBreakdown.map((f) => {
                          const diff = f.consumedHours - f.budgetedHours;
                          const percent = f.budgetedHours > 0 ? Math.round((f.consumedHours / f.budgetedHours) * 100) : 0;

                          return (
                            <tr key={f.name} className="hover:bg-[#f8fafc] transition-colors">
                              <td className="py-3.5 px-5 font-bold text-[#0f172a]">
                                <span className="text-xs">{f.name}</span>
                                <span className="text-[10px] text-[#64748b] block font-normal">{f.tasks.length} tareas asociadas</span>
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#501f92]">
                                {f.budgetedHours.toFixed(1)} h
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0f172a]">
                                {f.consumedHours.toFixed(1)} h
                              </td>

                              <td className="py-3.5 px-4 text-right font-mono font-bold">
                                {diff > 0 ? (
                                  <span className="text-[#ef4444]">+{diff.toFixed(1)} h ⚠️</span>
                                ) : (
                                  <span className="text-[#10b981]">{diff.toFixed(1)} h</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono">
                                <span className="font-bold text-xs">{percent}%</span>
                              </td>

                              <td className="py-3.5 px-5 text-right pr-6">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  f.completedCount === f.tasks.length && f.tasks.length > 0
                                    ? 'bg-[#ecfdf5] text-[#065f46]'
                                    : 'bg-[#f1f5f9] text-[#475569]'
                                }`}>
                                  {f.completedCount === f.tasks.length && f.tasks.length > 0 ? 'Entregado' : isProjectPendingToStart ? 'Por iniciar' : 'En Ejecución'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#f8fafc] border-t-2 border-[#e2e8f0] font-bold text-xs">
                          <td className="py-3.5 px-5 text-[#0f172a]">TOTAL PROYECTO</td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#501f92]">
                            {currentProject.budgetedHours.toFixed(1)} h
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-[#0f172a]">
                            {currentProject.consumedHours.toFixed(1)} h
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono">
                            {(currentProject.consumedHours - currentProject.budgetedHours) > 0 ? (
                              <span className="text-[#ef4444]">
                                +{(currentProject.consumedHours - currentProject.budgetedHours).toFixed(1)} h
                              </span>
                            ) : (
                              <span className="text-[#10b981]">
                                {(currentProject.consumedHours - currentProject.budgetedHours).toFixed(1)} h
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono">{percentHours}%</td>
                          <td className="py-3.5 px-5 text-right pr-6 text-[#501f92]">{isProjectPendingToStart ? 'Por iniciar' : currentProject.status}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

        {/* Manage Phases Modal */}
        <ManagePhasesModal
          isOpen={isManagePhasesOpen}
          onClose={() => setIsManagePhasesOpen(false)}
          projectName={currentProject.name}
          phases={phasesBreakdown}
          tasks={currentProject.tasks}
          onSavePhases={handleSavePhases}
        />

        {/* Import Backlog Modal */}
        <ImportBacklogModal
          isOpen={isImportBacklogOpen}
          onClose={() => setIsImportBacklogOpen(false)}
          projectName={currentProject.name}
          clientName={currentProject.clientName}
          phases={phasesBreakdown}
          onImportTasks={(imported) => {
            if (onImportTasksToProject) {
              onImportTasksToProject(imported);
            }
          }}
        />

        {/* Modal: Programar Inicio de Proyecto / Kick-off Operativo */}
        {isCloseProjectModalOpen && (
          <CloseProjectModal
            project={currentProject}
            tasks={((currentProject as any).allTasks || currentProject.tasks) as TaskItem[]}
            currentUser={currentUser}
            onClose={() => setIsCloseProjectModalOpen(false)}
            onGoToTasks={() => {
              setIsCloseProjectModalOpen(false);
              setActiveTab('tasks');
            }}
            onConfirm={(updated) => {
              onUpdateProject?.(updated);
              setIsCloseProjectModalOpen(false);
              setScheduleSuccessMessage(`🏁 Proyecto "${currentProject.name}" cerrado. El histórico de horas y tareas se conserva.`);
              setTimeout(() => setScheduleSuccessMessage(null), 6000);
            }}
          />
        )}

        {isNotificationsModalOpen && (
          <ProjectNotificationsModal
            project={currentProject}
            client={clients.find((c) => c.id === currentProject.clientId || c.name === currentProject.clientName) || null}
            currentUser={currentUser}
            onClose={() => setIsNotificationsModalOpen(false)}
            onUpdateProject={(updated) => onUpdateProject?.(updated)}
          />
        )}

        {isScheduleModalOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsScheduleModalOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div className="bg-white rounded-2xl max-w-lg w-full border border-[#e2e8f0] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center shrink-0">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-[#0f172a]">
                      Programar Inicio de Proyecto 🚀
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      {currentProject.clientName} · <strong>{currentProject.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* 1. Fecha de Inicio (Kick-off) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#334155] flex items-center justify-between">
                    <span>Fecha Oficial de Arranque / Kick-off:</span>
                    <span className="text-[10px] text-[#64748b]">Alineación del equipo</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={scheduleKickoffDate}
                      onChange={(e) => setScheduleKickoffDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-semibold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                    />
                  </div>
                </div>

                {/* 2a. Fee: vigencia del contrato */}
                {isCurrentProjectFee && (
                  <label className="space-y-1.5 block">
                    <span className="font-bold text-[#334155] block">Vigencia del contrato (meses)</span>
                    <input
                      type="number"
                      min="1"
                      max="36"
                      value={scheduleContractMonths}
                      onChange={(e) => setScheduleContractMonths(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-bold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                    />
                    <span className="font-bold text-[#334155] block pt-2">Horas no usadas del mes</span>
                    <select
                      value={scheduleRollover}
                      onChange={(e) => setScheduleRollover(e.target.value as 'none' | 'carry_over' | 'contractual_cap')}
                      className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-bold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                    >
                      <option value="none">No se acumulan (regla general)</option>
                      <option value="carry_over">Excepción: pasan al mes siguiente</option>
                      <option value="contractual_cap">Excepción: pasan hasta un 25 %</option>
                    </select>
                    {scheduleKickoffDate && (
                      <span className="text-[11px] text-[#64748b] block">
                        Contrato: {formatDateRange(scheduleBreakdown?.startDate || scheduleKickoffDate, computeContractEnd(scheduleBreakdown?.startDate || scheduleKickoffDate, scheduleContractMonths))} · {currentProject.budgetedHours}h por mes · las tareas del alcance son la plantilla del mes 1.
                      </span>
                    )}
                  </label>
                )}

                {/* 2. Semanas de producción (del Alcance) — solo proyecto único */}
                {!isCurrentProjectFee && (
                <label className="space-y-1.5 block">
                  <span className="font-bold text-[#334155] block">
                    Semanas de producción{currentProject.scheduleConfig?.productionWeeks ? ' (del alcance)' : ''}
                  </span>
                  <input
                      type="number"
                      min="1"
                      max="52"
                      value={scheduleDurationWeeks}
                      onChange={(e) => setScheduleDurationWeeks(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full p-2.5 rounded-xl border border-[#cbd5e1] font-bold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                    />
                </label>
                )}

                {/* 3. Tiempos del cliente (editables, sin valores ocultos) */}
                <div className="space-y-2">
                  <span className="font-bold text-[#334155] block">Tiempos del cliente</span>
                  <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 block col-span-2">
                    <span className="text-[11px] font-semibold text-[#475569] block">Entrega de insumos del cliente (días)</span>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={scheduleKickoffWaitDays}
                      onChange={(e) => setScheduleKickoffWaitDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full p-2 rounded-xl border border-[#cbd5e1] font-bold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                    />
                  </label>
                    {!isCurrentProjectFee && (
                      <>
                  <label className="space-y-1 block">
                    <span className="text-[11px] font-semibold text-[#475569] block">Rondas de ajuste incluidas</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={scheduleReworkRounds}
                      onChange={(e) => setScheduleReworkRounds(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full p-2 rounded-xl border border-[#cbd5e1] font-bold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[11px] font-semibold text-[#475569] block">Días hábiles por ronda</span>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={scheduleReworkRoundDays}
                      onChange={(e) => setScheduleReworkRoundDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full p-2 rounded-xl border border-[#cbd5e1] font-bold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                    />
                  </label>
                      </>
                    )}
                  </div>
                  <p className="text-[10.5px] text-[#64748b] leading-relaxed">
                    <strong>Insumos:</strong> lo que el cliente entrega tras el kickoff (accesos, contenidos, logos); usa 0 si no aplica.
                    {!isCurrentProjectFee && <> <strong>Ronda de ajuste:</strong> el cliente revisa una entrega, devuelve ajustes y aprueba. Las incluidas no son desvío; una adicional mueve la fecha.</>}
                  </p>
                </div>

                {/* Resultado: entrega calculada (proyecto único; el fee muestra la línea de contrato) */}
                {scheduleBreakdown && !isCurrentProjectFee && (
                  <div className="p-3 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#501f92] shrink-0" />
                        <div>
                          <span className="text-[10.5px] text-[#64748b] block">Entrega (línea base)</span>
                          <strong className="text-[#501f92] font-bold text-xs">{formatDate(scheduleBreakdown.endDate)}</strong>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#64748b] bg-white px-2 py-1 rounded-lg border border-[#e9d5ff]">
                        {scheduleBreakdown.totalBusinessDays} días hábiles
                      </span>
                    </div>
                    <p className="text-[10.5px] text-[#475569] border-t border-[#e9d5ff] pt-2">
                      Producción {scheduleBreakdown.productionDays} d · Insumos {scheduleBreakdown.kickoffWaitDays} d
                      {scheduleBreakdown.reworkRounds > 0 && (
                        <> · Rondas {scheduleBreakdown.reworkRounds} × {scheduleBreakdown.reworkRoundDays} d = {scheduleBreakdown.reworkDays} d</>
                      )}
                    </p>
                  </div>
                )}

                {/* 4. Recálculo automático de Deadlines */}
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleRecalculateTasks}
                      onChange={(e) => setScheduleRecalculateTasks(e.target.checked)}
                      className="mt-0.5 rounded text-[#501f92] focus:ring-[#501f92] cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#0f172a] block text-xs">
                        Recalcular y sugerir deadlines de entrega automáticamente
                      </span>
                      <p className="text-[10.5px] text-[#64748b] leading-relaxed">
                        Distribuye cronológicamente los {currentProject.deliverables?.length || 0} entregables y las actividades del backlog del alcance según la fecha de inicio seleccionada.
                      </p>
                    </div>
                  </label>
                </div>

                {/* 4. Equipo a alinear */}
                <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-1.5">
                  <span className="text-[10.5px] uppercase font-bold text-[#64748b] block">
                    Equipo Responsable Asignado:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {currentProject.coreTeam && currentProject.coreTeam.length > 0 ? (
                      currentProject.coreTeam.map((m, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#cbd5e1] text-[11px] font-semibold text-[#0f172a]"
                        >
                          <span className={`w-2 h-2 rounded-full ${m.isLead ? 'bg-[#501f92]' : 'bg-[#10b981]'}`} />
                          <span>{m.name}</span>
                          <span className="text-[9.5px] text-[#64748b]">({m.isLead ? 'Líder' : m.role})</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[#0f172a] font-semibold">{currentProject.leadName || 'Líder de Proyecto'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#64748b] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!scheduleKickoffDate}
                  onClick={handleConfirmKickoff}
                  className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#3d1572] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Confirmar Inicio & Sincronizar Cronograma 🚀</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Editar Información del Proyecto */}
        {isEditProjectModalOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsEditProjectModalOpen(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          >
            <div className="bg-white rounded-2xl max-w-lg w-full border border-[#e2e8f0] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center shrink-0">
                    <Pencil className="w-6 h-6 text-[#501f92]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-[#0f172a]">
                      Editar Proyecto
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      {currentProject.clientName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditProjectModalOpen(false)}
                  className="p-1 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onUpdateProject) {
                    onUpdateProject({
                      ...currentProject,
                      name: editProjectName.trim(),
                      code: editProjectCode.trim() || undefined,
                      leadName: editProjectLead.trim(),
                      status: editProjectStatus as any,
                      brief: editProjectBrief.trim() || undefined
                    });
                  }
                  setIsEditProjectModalOpen(false);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-[#475569] mb-1">Nombre del Proyecto *</label>
                  <input
                    type="text"
                    value={editProjectName}
                    onChange={(e) => setEditProjectName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#475569] mb-1">Código Operativo</label>
                    <input
                      type="text"
                      value={editProjectCode}
                      onChange={(e) => setEditProjectCode(e.target.value)}
                      placeholder="Ej: PRJ-01"
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs font-mono text-[#0f172a] placeholder:text-[#7C8AA0] focus:ring-2 focus:ring-[#501f92]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#475569] mb-1">Estado</label>
                    <select
                      value={editProjectStatus}
                      onChange={(e) => setEditProjectStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs font-semibold text-[#0f172a] bg-white focus:ring-2 focus:ring-[#501f92]"
                    >
                      <option value="Activo">Activo (En ejecución)</option>
                      <option value="Planificación">Planificación / Arranque</option>
                      <option value="En Pausa">En Pausa</option>
                      <option value="Cerrado">Cerrado (Completado)</option>
                      <option value="Archivado">Archivado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#475569] mb-1">Líder del Proyecto</label>
                  <input
                    type="text"
                    value={editProjectLead}
                    onChange={(e) => setEditProjectLead(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#475569] mb-1">Brief / Alcance General</label>
                  <textarea
                    value={editProjectBrief}
                    onChange={(e) => setEditProjectBrief(e.target.value)}
                    rows={3}
                    placeholder="Objetivo y contexto estratégico del proyecto..."
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#f1f5f9]">
                  <button
                    type="button"
                    onClick={() => setIsEditProjectModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#64748b] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- PORTFOLIO VIEW (List of all Projects) ---
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Proyectos"
        description={`${totalActiveProjects} ${totalActiveProjects === 1 ? 'proyecto en curso' : 'proyectos en curso'}`}
      />

      {/* Search, Filters & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Search className="w-4 h-4 text-[#94a3b8] shrink-0" />
          <input
            type="text"
            placeholder="Buscar por proyecto, cliente o marca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-[#0f172a] placeholder:text-[#7C8AA0] focus:outline-none bg-transparent min-w-0"
          />
        </div>

        {/* Filters dropdown & Reubicado Nuevo Proyecto */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full sm:w-auto bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold px-2.5 py-1.5 rounded-xl text-[#0f172a] cursor-pointer truncate"
          >
            <option value="all">Todos los tipos</option>
            <option value="fee_monthly">Fees mensuales</option>
            <option value="fixed_project">Proyectos únicos</option>
            <option value="internal_non_billable">Proyectos internos</option>
            <option value="risk">En riesgo / atención</option>
          </select>

          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="w-full sm:w-auto bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold px-2.5 py-1.5 rounded-xl text-[#0f172a] cursor-pointer truncate"
          >
            <option value="all">Todos los clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewProjectModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-2xs cursor-pointer transition-all shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo proyecto</span>
          </button>
        </div>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((prj) => {
          const percent = prj.budgetedHours > 0
            ? Math.round((prj.consumedHours / prj.budgetedHours) * 100)
            : 0;

          return (
            <div
              key={prj.id}
              onClick={() => handleCardClick(prj.id)}
              className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#8a4dff]/40 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        prj.projectType === 'fee_monthly'
                          ? 'bg-[#d4ff4a]/20 text-[#2e5e04]'
                          : 'bg-[#eff6ff] text-[#2563eb]'
                      }`}
                    >
                      {prj.projectType === 'fee_monthly' ? 'Fee mensual' : 'Proyecto único'}
                    </span>
                    {prj.status === 'Archivado' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#f1f5f9] text-[#64748b]">
                        Archivado
                      </span>
                    ) : ((prj.status as string) === 'completed' || (prj.status as string) === 'Cerrado' || (prj.status as string) === 'Completado') ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                        Cerrado
                      </span>
                    ) : !prj.startDate ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                        Por iniciar
                      </span>
                    ) : prj.startDate > todayStr ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                        Programado
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                        En ejecución
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick Menu Button */}
                    <div className="relative project-menu-container" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveProjectMenu(activeProjectMenu === prj.id ? null : prj.id)}
                        className="p-1 rounded-lg text-[#94a3b8] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
                        title="Opciones"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {activeProjectMenu === prj.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] py-1 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                          <button
                            onClick={() => {
                              if (onArchiveProject) {
                                onArchiveProject(prj.id);
                              }
                              setActiveProjectMenu(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs font-semibold text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Archive className="w-3.5 h-3.5 text-[#501f92]" />
                            <span>{prj.status === 'Archivado' ? 'Desarchivar' : 'Archivar'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setProjectPendingDelete(prj);
                              setActiveProjectMenu(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs font-semibold text-[#dc2626] hover:bg-[#fee2e2]/40 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#dc2626]" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-[#0f172a] group-hover:text-[#501f92] transition-colors line-clamp-1">
                  {prj.name}
                </h3>

                <p className="text-xs text-[#64748b] mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#94a3b8]" />
                  <span>{prj.clientName}</span>
                </p>
              </div>

              {/* Progress & Hours */}
              <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#64748b]">Consumo de horas:</span>
                  <span className="font-mono font-bold text-[#0f172a]">
                    {prj.consumedHours.toFixed(1)}h / {prj.budgetedHours}h ({percent}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(percent, 100)}%` }}
                    className={`h-full rounded-full transition-all ${
                      percent > 100
                        ? 'bg-[#ef4444]'
                        : percent > 85
                        ? 'bg-[#f59e0b]'
                        : 'bg-[#501f92]'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748b] pt-1">
                  <span>{prj.completedTasksCount} / {prj.totalTasksCount} tareas listas</span>
                  <span className="font-bold text-[#501f92] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Ver frentes & tareas →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* In-App Project Deletion Confirmation Modal */}
      {projectPendingDelete && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setProjectPendingDelete(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#e2e8f0] shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-[#0f172a]">¿Eliminar este proyecto?</h3>
              <p className="text-xs text-[#64748b]">
                Estás a punto de eliminar definitivamente el proyecto{' '}
                <strong className="text-[#0f172a]">"{projectPendingDelete.name}"</strong> y desvincular sus métricas.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[11px] text-[#991b1b]">
              ⚠️ Esta acción no se puede deshacer. Las tareas asociadas dejarán de estar vinculadas a este proyecto.
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProjectPendingDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-xs font-bold text-[#64748b] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteProject) {
                    onDeleteProject(projectPendingDelete.id);
                  }
                  if (selectedProjectId === projectPendingDelete.id) {
                    setSelectedProjectId(null);
                    if (onSelectProject) onSelectProject(null);
                  }
                  setProjectPendingDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Sí, eliminar proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
