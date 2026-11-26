import { makePersonMatcher } from './auth/taskVisibility';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { formatDate, formatDateRange } from '../../utils/formatters';
import { PageHeader } from './PageHeader';
import { TaskItem, ActiveTimerState, ClientProfile, ProjectType, ProjectPhaseItem, ProjectSummaryItem, TaskPriority, UserItem, normalizeProjectType, isInternalProject, STANDARD_UHURA_ROLES } from './types';
export type { ProjectSummaryItem };
import { BoardView } from './BoardView';
import { ManagePhasesModal } from './ManagePhasesModal';
import { ImportBacklogModal } from './ImportBacklogModal';
import { ProjectOverviewTab } from './projects/ProjectOverviewTab';
import { ProjectTeamTab } from './projects/ProjectTeamTab';
import { ProjectTasksTab } from './projects/ProjectTasksTab';
import { initialUsers, initialAbsenceEvents } from './mockData';
import { computeScheduleBaseline, planProjectSchedule, buildExistingLoad, businessDaysInRange, DEFAULT_DAILY_CAPACITY, type CapacityContext } from './schedule/scheduleEngine';
import { matchesQuotedRole, isEligibleTeamMember, resolveServiceArea, hasAffineRole } from './newbusiness/teamCandidates';
import { CATALOG_2026 } from './templates/catalog2026';
import { ClientKickoffView, defaultClientAgreements, type ClientKickoffViewProps } from './projects/ClientKickoffView';
import { computePhaseSchedule, defaultPhaseSteps, planTasksFromPhases, buildDefaultSteps, isClientReviewedPhase, notBeforeFromDependencies, removeRound, appendRound, rebalanceToTarget, productionTotal, productionMinimum, type PhaseSteps, type PhaseOverflow } from './schedule/clientTimeline';
import { PhaseOverflowModal } from './projects/PhaseOverflowModal';
import { openBridge, saveSnapshot, toClientViewData, clientScheduleUrl } from './projects/clientScheduleBridge';
import { suggestLoadRebalance } from './schedule/teamLoadAdvisor';
import { makeUserResolver, roleFit } from './projects/teamFromTasks';
import { distributeReviewRounds } from './schedule/scheduleEngine';
import { buildFeeCycles, contractEndDate as computeContractEnd, monthKeyOf, taskCycleKey, generateCycleTasks, daysUntil, RENEWAL_NOTICE_DAYS } from './schedule/feeCycles';
import { ProjectNotificationsModal } from './integrations/ProjectNotificationsModal';
import { CloseProjectModal } from './projects/CloseProjectModal';
import { canViewProjectNotifications } from './integrations/googleChat';
import { calculateBusinessDays } from './health/projectHealthEngine';
import { can } from './auth/permissions';
import { suggestedClientInputs, pickPhaseId, inputsToDependencies, type ClientInputTemplate } from './schedule/clientInputs';
import { UserAvatar } from './UserAvatar';
import { InfoTip } from './ui/InfoTip';
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
  Info,
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
  /** Cambia quién revisa por defecto las tareas abiertas del proyecto (§33.4). */
  onChangeProjectReviewer?: (projectName: string, person: NonNullable<TaskItem['reviewer']>) => void;
  onUpdateClient?: (updatedClient: ClientProfile) => void;
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

/** En curso (activo, por iniciar, programado, en pausa), cerrado o archivado. */
const projectStatusBucket = (status?: string): 'active' | 'closed' | 'archived' => {
  if (status === 'Archivado') return 'archived';
  if (status === 'Cerrado' || status === 'completed' || status === 'Completado') return 'closed';
  return 'active';
};

/** Rondas de ajuste incluidas = número de presentaciones al cliente (cada una trae su ronda). */
const roundsFromSteps = (steps?: Array<{ rounds: unknown[] }> | null): number | undefined =>
  steps && steps.length ? steps.reduce((n, st) => n + st.rounds.length, 0) : undefined;

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  tasks,
  clients,
  onUpdateClient,
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
  onChangeProjectReviewer,
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
  // Borradores de la vista «Cronograma y acuerdos» (kickoff: se guardan al iniciar; proyecto: con «Aplicar»)
  const [phaseStepsDraft, setPhaseStepsDraft] = useState<PhaseSteps[] | null>(null);
  const [clientContactsDraft, setClientContactsDraft] = useState<{ approver: string; backup: string } | null>(null);
  const [agreementsDraft, setAgreementsDraft] = useState<string[] | null>(null);
  const [approvalDraft, setApprovalDraft] = useState<{ name: string; date: string } | null | undefined>(undefined);
  const [projectStepsDraft, setProjectStepsDraft] = useState<PhaseSteps[] | null>(null);
  // Vista amplia para el cliente: 'kickoff' (desde Iniciar proyecto) o 'project' (proyecto ya iniciado)
  const [clientViewMode, setClientViewMode] = useState<null | 'kickoff' | 'project'>(null);
  // El cronograma se abre en una pestaña propia (?app=eco&cronograma=1) conectada a ECO por un canal entre
  // pestañas; si el navegador la bloquea, se muestra como modal aquí mismo.
  const [clientViewExternal, setClientViewExternal] = useState(false);
  // Sugerencias de carga que el líder decidió ignorar (por tarea)
  const [dismissedLoadTasks, setDismissedLoadTasks] = useState<string[]>([]);
  const clientViewPropsRef = useRef<ClientKickoffViewProps | null>(null);
  const clientBridgeRef = useRef<ReturnType<typeof openBridge> | null>(null);
  const lastClientSnapshotRef = useRef('');
  const clientCloseTimerRef = useRef<number | undefined>(undefined);
  // «Cronograma cliente» / «Ver cronograma y acuerdos» se abre dentro de ECO (siempre conectado).
  // Desde ahí, «Pestaña nueva» abre la vista aparte; si el navegador la abre en otra pestaña, queda
  // conectada en vivo y la vista de ECO se cierra.
  const openClientView = (mode: 'kickoff' | 'project') => {
    setClientViewExternal(false);
    setClientViewMode(mode);
  };
  const openClientViewInNewTab = (viewProps: ClientKickoffViewProps) => {
    const data = toClientViewData(viewProps);
    saveSnapshot(data);
    const w = window.open(clientScheduleUrl(data), '_blank');
    if (w) setClientViewExternal(true);
  };
  const [scheduleDurationWeeks, setScheduleDurationWeeks] = useState<number>(4);
  const [scheduleReworkRounds, setScheduleReworkRounds] = useState<number>(2);
  const [scheduleReworkRoundDays, setScheduleReworkRoundDays] = useState<number>(5);
  const [scheduleKickoffWaitDays, setScheduleKickoffWaitDays] = useState<number>(3);
  const [scheduleContractMonths, setScheduleContractMonths] = useState<number>(6); // Fee: vigencia
  const [scheduleRollover, setScheduleRollover] = useState<'none' | 'carry_over' | 'contractual_cap'>('none'); // Fee: horas no usadas
  // Ronda 2: insumos a solicitar al cliente (precargados por servicio; se crean como Dependencias)
  const [scheduleInputs, setScheduleInputs] = useState<(ClientInputTemplate & { selected: boolean; deliverableId?: string; committedDate?: string })[]>([]);
  const [scheduleInputsLabel, setScheduleInputsLabel] = useState('');
  const [newInputTitle, setNewInputTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fee_monthly' | 'fixed_project' | 'internal_non_billable' | 'risk'>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  // Estado del proyecto en la lista: por defecto solo los que están en curso (ronda 2).
  const [filterStatus, setFilterStatus] = useState<'active' | 'closed' | 'archived' | 'all'>('active');
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
  // Menú de la tarjeta = mismo menú que dentro del proyecto (ronda 2). Las opciones que abren un
  // modal entran al proyecto y lo abren allí.
  const [pendingProjectAction, setPendingProjectAction] = useState<'edit' | 'notifications' | 'close' | null>(null);
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
          rolloverOverrides: prj.rolloverOverrides,
          tasks: allProjectTasks,
          generatedKeys: (prj.monthlyCycles || []).filter((c) => c.tasksGenerated).map((c) => c.monthKey)
        });
      }
      const activeCycleKey = cycles.find((c) => c.status === 'active')?.monthKey || prj.currentMonthCycle || cycles[cycles.length - 1]?.monthKey || null;
      // Antes de «Iniciar proyecto» las tareas convertidas aún no tienen mes: se muestran todas (#18).
      const feeKickedOff = Boolean(prj.contractStartDate) && prj.isKickedOff !== false;
      const viewCycleKey = isFeePrj && feeKickedOff && cycles.length > 0 && prj.id === selectedProjectId
        ? (selectedCycleKey === 'all' ? null : (selectedCycleKey || activeCycleKey))
        : null;
      const viewCycle = cycles.find((c) => c.monthKey === viewCycleKey) || null;
      const projectTasks = viewCycleKey ? allProjectTasks.filter((t) => taskCycleKey(t, prj.contractStartDate) === viewCycleKey) : allProjectTasks;

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
      else if (filterType === 'internal_non_billable') matchType = isInternalProject(p);
      else if (filterType === 'risk') matchType = p.healthStatus === 'rojo' || p.healthStatus === 'amarillo' || p.consumedHours > p.budgetedHours;

      const bucket = projectStatusBucket(p.status as string);
      const matchStatus = filterStatus === 'all' || bucket === filterStatus;

      return matchSearch && matchClient && matchType && matchStatus;
    });
  }, [enrichedProjects, searchQuery, filterClient, filterType, filterStatus]);
  const statusCounts = useMemo(() => {
    const c = { active: 0, closed: 0, archived: 0 };
    enrichedProjects.forEach((p) => c[projectStatusBucket(p.status as string)]++);
    return c;
  }, [enrichedProjects]);

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
  // Ronda 2: «Iniciar proyecto» lo hacen Comercial y Relación con clientes (saben cuándo se firma y
  // agendan el kickoff), además de líderes, Dirección y administración.
  const canStartProject =
    canEditProject ||
    ['commercial', 'client_relationship', 'executive', 'leader', 'system_admin'].includes(currentUser?.accessLevel || '');

  useEffect(() => {
    if (!pendingProjectAction || !currentProject) return;
    if (pendingProjectAction === 'edit') {
      setEditProjectName(currentProject.name);
      setEditProjectCode(currentProject.code || '');
      setEditProjectLead(currentProject.leadName || '');
      setEditProjectStatus(currentProject.status || 'Activo');
      setEditProjectBrief(currentProject.brief || '');
      setIsEditProjectModalOpen(true);
    } else if (pendingProjectAction === 'notifications') {
      setIsNotificationsModalOpen(true);
    } else if (pendingProjectAction === 'close') {
      setIsCloseProjectModalOpen(true);
    }
    setPendingProjectAction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingProjectAction, currentProject?.id]);
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
    const pool = users && users.length > 0 ? users : initialUsers;
    const resolveId = makeUserResolver(pool);
    const userOf = (name?: string, id?: string) => pool.find((u) => u.id === (id || resolveId(name)));
    const displayName = (name?: string, id?: string) => userOf(name, id)?.name || name || 'Sin asignar';

    const rolesMap: Record<string, {
      role: string;
      budgetedHours: number;
      executedHours: number;
      tasksCount: number;
      assignees: Set<string>;
      // Por persona: horas asignadas (tareas a su nombre) y horas que registró de verdad
      people: Map<string, { assigned: number; executed: number }>;
    }> = {};

    currentProject.tasks.forEach((task) => {
      const roleName = task.budgetedRole || task.assignee.role || 'Especialista';
      if (!rolesMap[roleName]) {
        rolesMap[roleName] = {
          role: roleName,
          budgetedHours: 0,
          executedHours: 0,
          tasksCount: 0,
          assignees: new Set<string>(),
          people: new Map()
        };
      }
      const r = rolesMap[roleName];
      const bump = (name: string, k: 'assigned' | 'executed', h: number) => {
        const row = r.people.get(name) || { assigned: 0, executed: 0 };
        row[k] += h;
        r.people.set(name, row);
      };

      r.budgetedHours += task.budgetedHours || 0;
      r.executedHours += (task.consumedSeconds || 0) / 3600;
      r.tasksCount += 1;
      const assigneeName = task.assignee?.name && task.assignee.name !== '-' ? displayName(task.assignee.name, task.assignee.id) : '';
      if (assigneeName) {
        r.assignees.add(assigneeName);
        bump(assigneeName, 'assigned', task.budgetedHours || 0);
      }
      // Quién ejecutó: los registros de tiempo; lo que no tenga registro se atribuye al asignado
      const logs = (task.timeLogs || []).filter((l) => !l.isDeleted && l.durationSeconds > 0);
      const logged = logs.reduce((acc, l) => acc + l.durationSeconds, 0);
      logs.forEach((l) => bump(displayName(l.userName, l.userId), 'executed', l.durationSeconds / 3600));
      const rest = Math.max(0, (task.consumedSeconds || 0) - logged) / 3600;
      if (rest > 0 && assigneeName) bump(assigneeName, 'executed', rest);
    });

    return Object.values(rolesMap).map((r) => {
      const diff = r.executedHours - r.budgetedHours;
      return {
        ...r,
        diff,
        isOverbudget: diff > 0.05,
        percent: r.budgetedHours > 0 ? Math.round((r.executedHours / r.budgetedHours) * 100) : 100,
        peopleList: Array.from(r.people.entries()).map(([name, h]) => {
          const u = userOf(name);
          return { name, assigned: h.assigned, executed: h.executed, fit: u ? roleFit(u, r.role) : 'own' as const };
        }).sort((a, b) => b.assigned - a.assigned || b.executed - a.executed),
        assigneesList: Array.from(r.assignees)
      };
    });
  }, [currentProject, users]);

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
      createdAt: new Date().toISOString(),
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
      // Revisa por defecto: el del proyecto (§33.4); si no hay, el líder del proyecto
      reviewers: currentProject.defaultReviewer ? [currentProject.defaultReviewer] : undefined,
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
      setScheduleReworkRounds(currentProject.scheduleConfig?.includedReworkRounds ?? (isInternalProject(currentProject) ? 0 : 2));
      setScheduleReworkRoundDays(currentProject.scheduleConfig?.reworkRoundDays ?? 5);
      setScheduleKickoffWaitDays(currentProject.scheduleConfig?.clientKickoffWaitDays ?? 3);
      setScheduleContractMonths(currentProject.contractMonths ?? 6);
      setScheduleRollover((currentProject.rolloverPolicy as 'none' | 'carry_over' | 'contractual_cap') || 'none');
      // La sugerencia sale del servicio y de los entregables del proyecto, para cualquier área.
      const sugg = suggestedClientInputs(
        [currentProject.serviceBase, currentProject.name, ...(currentProject.deliverables || []).map((d) => d.name)].filter(Boolean).join(' ')
      );
      setScheduleInputsLabel(sugg.label);
      const phases = (currentProject.deliverables || []).map((d) => ({ id: d.id, name: d.name }));
      // Sugerencias SIN marcar (26 Nov 2026): el líder marca los que necesita; nada se pide solo.
      setScheduleInputs(sugg.inputs.map((i) => ({ ...i, selected: false, deliverableId: pickPhaseId(i, phases) })));
      setNewInputTitle('');
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

  // Los insumos se piden solo en el primer arranque (si el proyecto aún no tiene dependencias).
  const isCurrentProjectInternal = isInternalProject(currentProject);
  // Un proyecto interno no tiene cliente que entregue insumos: no se piden al iniciar.
  const askClientInputs = Boolean(currentProject && !isCurrentProjectInternal && !currentProject.isKickedOff && (currentProject.dependencies || []).length === 0);
  const selectedScheduleInputs = scheduleInputs.filter((i) => i.selected);
  // Ronda 2: los insumos NO suman días al cronograma. Cada uno se necesita para una fase y su
  // fecha esperada es el inicio de esa fase (se gestionan con anticipación durante las anteriores).
  const effectiveKickoffWaitDays = askClientInputs ? 0 : scheduleKickoffWaitDays;

  const scheduleConfigDraft = useMemo(() => ({
    clientKickoffWaitDays: effectiveKickoffWaitDays,
    includedReworkRounds: scheduleReworkRounds,
    reworkRoundDays: scheduleReworkRoundDays,
    productionWeeks: scheduleDurationWeeks
  }), [effectiveKickoffWaitDays, scheduleReworkRounds, scheduleReworkRoundDays, scheduleDurationWeeks]);

  // Compromisos del cliente: un insumo BLOQUEANTE con fecha comprometida posterior al inicio de
  // su fase corre esa fase (y las siguientes) hasta esa fecha.
  const deliverableNotBefore = useMemo(() => {
    const map: Record<string, string> = {};
    if (!askClientInputs) return map;
    selectedScheduleInputs.forEach((i) => {
      if (!i.blocking || !i.committedDate || !i.deliverableId) return;
      if (!map[i.deliverableId] || i.committedDate > map[i.deliverableId]) map[i.deliverableId] = i.committedDate;
    });
    return map;
  }, [askClientInputs, selectedScheduleInputs]);

  // Agenda por capacidad: carga ya agendada de cada persona en sus OTROS proyectos (nueva en cada plan,
  // porque el motor la va llenando al ubicar las tareas).
  // Una sola regla con el resto de ECO (teamLoadAdvisor): las ausencias (vacaciones, incapacidades,
  // permisos) ocupan esos días. QA 22 Nov 2026: «Iniciar proyecto» ponía tareas en plenas vacaciones.
  const withAbsences = (load: Map<string, Map<string, number>>) => {
    const pool = users && users.length > 0 ? users : initialUsers;
    initialAbsenceEvents.filter((a) => a.status !== 'cancelled').forEach((a) => {
      const u = pool.find((x) => x.id === a.userId);
      if (!u) return;
      const perDay = load.get(u.name) || new Map<string, number>();
      // Ausencia de día completo: el día queda sin espacio (no se le acomodan tareas en «sobrantes» de 0,4 h)
      businessDaysInRange(a.startDate, a.endDate).forEach((d) => perDay.set(d, (perDay.get(d) || 0) + (a.allDay ? DEFAULT_DAILY_CAPACITY : Math.min(DEFAULT_DAILY_CAPACITY, a.impactHoursPerDay || DEFAULT_DAILY_CAPACITY))));
      load.set(u.name, perDay);
    });
    return load;
  };
  const buildCapacityContext = (projectTasks: TaskItem[]): CapacityContext => {
    const ids = new Set(projectTasks.map((t) => t.id));
    const assigneeById = new Map(projectTasks.map((t) => [t.id, t.assignee?.name && t.assignee.name !== '-' ? t.assignee.name : undefined]));
    return {
      assigneeOf: (taskId) => assigneeById.get(taskId),
      existingLoad: withAbsences(buildExistingLoad(tasks, ids)),
      dailyCapacity: DEFAULT_DAILY_CAPACITY
    };
  };

  // Plan que se va a crear (mismo motor que «Confirmar inicio»): la vista previa usa este plan
  // para que la entrega mostrada sea la misma que queda en el proyecto (ronda 3).
  // Pasos por defecto del arranque (los mismos para el modal, la vista del cliente y el proyecto)
  const kickoffDefaultSteps = useMemo((): PhaseSteps[] => {
    if (!currentProject || isCurrentProjectFee) return [];
    const projectTasks = (((currentProject as any).allTasks || currentProject.tasks) || []) as TaskItem[];
    const dels = currentProject.deliverables || [];
    const built = buildDefaultSteps(
      dels.map((d) => ({
        id: d.id,
        name: d.name,
        hours: d.totalQuotedHours || projectTasks.filter((t) => t.deliverableId === d.id || t.frente === d.name).reduce((a, t) => a + (t.budgetedHours || 0), 0)
      })),
      scheduleDurationWeeks,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        // Nombres de las presentaciones según el área del servicio (Producto, Creativo, Growth)
        area: resolveServiceArea({
          serviceName: currentProject.name.split(' — ')[0],
          catalog: CATALOG_2026,
          activities: projectTasks.map((t) => ({ roleName: t.budgetedRole || t.assignee?.role || '', estimatedHours: t.budgetedHours || 0 }))
        }),
        serviceName: currentProject.name
      }
    );
    // Proyecto interno: no hay cliente que revise. Sin presentaciones ni rondas; todo el tiempo es producción.
    return isCurrentProjectInternal
      ? rebalanceToTarget(built.map((st) => ({ ...st, rounds: [] })), scheduleDurationWeeks * 5)
      : built;
  }, [currentProject, isCurrentProjectFee, isCurrentProjectInternal, scheduleDurationWeeks]);

  const kickoffPlan = useMemo(() => {
    if (!currentProject || !scheduleKickoffDate || !isScheduleModalOpen) return null;
    const projectTasks = (((currentProject as any).allTasks || currentProject.tasks) || []) as TaskItem[];
    const dels = currentProject.deliverables || [];
    // Respaldo para datos legados: asociar por nombre del frente si el id no coincide
    const taskInputs = projectTasks.map((t) => {
      const delId = dels.some((d) => d.id === t.deliverableId) ? t.deliverableId : dels.find((d) => d.name === t.frente)?.id || t.deliverableId;
      return { id: t.id, deliverableId: delId, budgetedHours: t.budgetedHours, title: t.title };
    });
    const enginePlan = planProjectSchedule({
      startDate: scheduleKickoffDate,
      productionWeeks: isCurrentProjectFee ? 4 : scheduleDurationWeeks,
      config: scheduleConfigDraft,
      isFee: isCurrentProjectFee,
      deliverables: dels.map((d) => ({ id: d.id, name: d.name, totalQuotedHours: d.totalQuotedHours })),
      tasks: taskInputs,
      capacity: buildCapacityContext(projectTasks),
      deliverableNotBefore
    });
    if (isCurrentProjectFee || dels.length === 0) return enginePlan;
    // Proyecto único: siempre por fases (producción → QA → rondas con ajustes). Sin edición, los pasos
    // salen del reparto automático; si se editaron en «Cronograma y acuerdos», mandan esos.
    const steps = phaseStepsDraft || kickoffDefaultSteps;
    const sched = computePhaseSchedule(scheduleKickoffDate, steps, deliverableNotBefore);
    const planned = planTasksFromPhases(sched.phases, taskInputs, buildCapacityContext(projectTasks));
    const start = sched.phases[0]?.start || enginePlan.baseline.startDate;
    return {
      baseline: { ...enginePlan.baseline, startDate: start, endDate: sched.endDate, totalBusinessDays: businessDaysInRange(start, sched.endDate).length },
      deliverables: sched.phases.map((ph) => ({ id: ph.id, startDate: ph.start, endDate: ph.end, reviewRounds: ph.rounds.length })),
      tasks: planned.tasks,
      conflicts: planned.conflicts,
      phases: sched.phases
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject, scheduleKickoffDate, isScheduleModalOpen, isCurrentProjectFee, scheduleDurationWeeks, scheduleConfigDraft, deliverableNotBefore, tasks, phaseStepsDraft, kickoffDefaultSteps]);

  // Si cambian semanas, rondas o la fecha de arranque, las fases editadas se vuelven a sugerir
  useEffect(() => { setPhaseStepsDraft(null); }, [scheduleDurationWeeks, scheduleKickoffDate, currentProject?.id]);


  // Tareas que no caben en la agenda de su colaborador: ECO sugiere a alguien del MISMO ROL con espacio
  // en esa ventana (la persona propuesta en el alcance pudo ocuparse desde entonces).
  const capacitySuggestions = useMemo(() => {
    if (!kickoffPlan || !currentProject) return [];
    const projectTasks = (((currentProject as any).allTasks || currentProject.tasks) || []) as TaskItem[];
    const baseLoad = withAbsences(buildExistingLoad(tasks, new Set(projectTasks.map((t) => t.id))));
    const pool = (users && users.length > 0 ? users : initialUsers).filter(isEligibleTeamMember);
    return kickoffPlan.conflicts.map((c) => {
      const task = projectTasks.find((t) => t.id === c.taskId);
      const role = task?.budgetedRole || task?.assignee?.role || '';
      const days = businessDaysInRange(c.windowStart, c.windowEnd);
      // Mismo rol primero; si nadie tiene espacio, un rol afín (como en el resto de ECO)
      const rank = (sameRole: boolean) => pool
        .filter((u) => u.name !== c.person && role && (sameRole ? matchesQuotedRole(u, role) : !matchesQuotedRole(u, role) && hasAffineRole(u, role)))
        .map((u) => {
          const perDay = baseLoad.get(u.name) || new Map<string, number>();
          const free = days.reduce((acc, d) => acc + Math.max(0, DEFAULT_DAILY_CAPACITY - (perDay.get(d) || 0)), 0);
          return { user: u, free: Number(free.toFixed(1)) };
        })
        .filter((x) => x.free >= c.hours)
        .sort((a, b) => b.free - a.free)[0];
      const best = rank(true) || rank(false);
      return { conflict: c, task, role, suggestion: best };
    });
  }, [kickoffPlan, currentProject, tasks, users]);

  // Datos de la vista «Cronograma y acuerdos» (cliente). Sin horas internas.
  const buildClientViewProps = (mode: 'kickoff' | 'project'): ClientKickoffViewProps | null => {
    if (!currentProject) return null;
    const projectTasks = (((currentProject as any).allTasks || currentProject.tasks) || []) as TaskItem[];
    const dels = currentProject.deliverables || [];
    const isFee = isCurrentProjectFee;
    const cfg = currentProject.scheduleConfig;
    const rounds = mode === 'kickoff' ? scheduleReworkRounds : (cfg?.includedReworkRounds ?? 0);
    const roundDays = mode === 'kickoff' ? scheduleReworkRoundDays : (cfg?.reworkRoundDays ?? 5);
    const roundsAt = distributeReviewRounds(dels, isFee ? 0 : rounds);
    const phaseInput = dels.map((d, i) => {
      const planned = mode === 'kickoff' ? kickoffPlan?.deliverables.find((x) => x.id === d.id) : undefined;
      return {
        id: d.id,
        name: d.name,
        startDate: (planned?.startDate || d.startDate || '') as string,
        endDate: (planned?.endDate || (d as { endDate?: string }).endDate || d.dueDate || '') as string,
        reviewRounds: planned?.reviewRounds ?? (roundsAt.get(i) || 0)
      };
    });
    const suggestedSteps = defaultPhaseSteps(phaseInput, roundDays);
    const steps = mode === 'kickoff'
      ? (phaseStepsDraft || kickoffDefaultSteps)
      : (projectStepsDraft || currentProject.phaseSteps || suggestedSteps);

    // Equipo líder: quienes ejecutan (más horas asignadas), sin el líder ni Comercial
    const hoursByPerson = new Map<string, number>();
    projectTasks.forEach((t) => {
      const n = t.assignee?.name;
      if (!n || n === '-' || n === currentProject.leadName || n === currentProject.commercialOwnerName) return;
      if (/client relationship|comercial/i.test(t.budgetedRole || t.assignee?.role || '')) return;
      hoursByPerson.set(n, (hoursByPerson.get(n) || 0) + (t.budgetedHours || 0));
    });
    // Nombres del perfil (no alias como «Paola (Lead PM)») y sin repetir al líder en «Equipo líder»
    const peoplePool = users && users.length > 0 ? users : initialUsers;
    const resolvePerson = makeUserResolver(peoplePool);
    const fullName = (n?: string) => peoplePool.find((u) => u.id === resolvePerson(n))?.name || n || '';
    const leaderFull = fullName(currentProject.leadName);
    const teamLeads = Array.from(hoursByPerson.entries())
      .map(([n, h]) => [fullName(n), h] as const)
      .filter(([n]) => n && n !== leaderFull)
      .reduce((acc, [n, h]) => acc.set(n, (acc.get(n) || 0) + h), new Map<string, number>());
    const teamLeadNames = Array.from(teamLeads.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);

    const clientContact = clients?.find((c) => c.name === currentProject.clientName)?.commercialInfo?.contactName || '';
    const approver = mode === 'kickoff' ? (clientContactsDraft?.approver ?? currentProject.clientApproverName ?? clientContact) : (currentProject.clientApproverName ?? clientContact);
    const backup = mode === 'kickoff' ? (clientContactsDraft?.backup ?? currentProject.clientApproverBackupName ?? '') : (currentProject.clientApproverBackupName ?? '');

    const commitments = mode === 'kickoff'
      ? (askClientInputs ? scheduleInputs.map((i, idx) => ({ i, idx })).filter(({ i }) => i.selected).map(({ i, idx }) => ({
          key: String(idx),
          title: i.title,
          date: i.committedDate || inputExpectedDate(i.deliverableId) || '',
          blocking: Boolean(i.blocking),
          phase: dels.find((d) => d.id === i.deliverableId)?.name || ''
        })) : [])
      : (currentProject.dependencies || []).map((dep) => ({
          key: dep.id,
          title: dep.title,
          date: dep.expectedDate,
          blocking: Boolean(dep.blocking),
          phase: dels.find((d) => d.id === dep.deliverableId)?.name || ''
        }));

    // Proyecto iniciado: insumos bloqueantes pendientes con fecha posterior al inicio de su fase corren la fase
    const projectNotBefore: Record<string, string> = mode === 'project' ? notBeforeFromDependencies(currentProject.dependencies) : {};

    const rolloverLabel = { none: 'no se acumulan', carry_over: 'pasan al mes siguiente', contractual_cap: 'pasan hasta un 25 % al mes siguiente' }[currentProject.rolloverPolicy || 'none'];
    const approvalDays = steps.find((st) => st.rounds.length > 0)?.rounds[0]?.reviewDays ?? Math.max(1, roundDays - 2);
    const agreements = (mode === 'kickoff' ? agreementsDraft : null) ?? currentProject.clientAgreements ?? defaultClientAgreements(isFee, rounds, approvalDays, rolloverLabel);

    const startDate = mode === 'kickoff' ? (kickoffPlan?.baseline.startDate || scheduleKickoffDate) : (currentProject.startDate || '');

    const viewProps: ClientKickoffViewProps = {
      projectName: currentProject.name,
      clientName: currentProject.clientName,
      isFee,
      startDate,
      leaderName: leaderFull || currentProject.leadName,
      teamLeads: teamLeadNames,
      commercialName: currentProject.commercialOwnerName,
      clientApprover: approver,
      clientApproverBackup: backup,
      onChangeClientContacts: (a, b) => {
        if (mode === 'kickoff') setClientContactsDraft({ approver: a, backup: b });
        else onUpdateProject?.({ ...currentProject, clientApproverName: a, clientApproverBackupName: b });
      },
      steps,
      onChangeSteps: (next) => (mode === 'kickoff' ? setPhaseStepsDraft(next) : setProjectStepsDraft(next)),
      notBefore: mode === 'kickoff' ? deliverableNotBefore : projectNotBefore,
      commitments,
      onChangeCommitmentDate: (key, date) => {
        if (mode === 'kickoff') {
          setScheduleInputs((prev) => prev.map((x, i) => (String(i) === key ? { ...x, committedDate: date || undefined } : x)));
        } else {
          onUpdateProject?.({ ...currentProject, dependencies: (currentProject.dependencies || []).map((d) => (d.id === key ? { ...d, expectedDate: date } : d)) });
          setProjectStepsDraft((prev) => prev || steps); // un insumo bloqueante puede correr fases: permite aplicar
        }
      },
      agreements,
      clientApproval: mode === 'kickoff' ? (approvalDraft === undefined ? currentProject.clientScheduleApproval ?? null : approvalDraft) : currentProject.clientScheduleApproval ?? null,
      onClientApproval: (approval) => (mode === 'kickoff' ? setApprovalDraft(approval) : onUpdateProject?.({ ...currentProject, clientScheduleApproval: approval })),
      onChangeAgreements: (list) => (mode === 'kickoff' ? setAgreementsDraft(list) : onUpdateProject?.({ ...currentProject, clientAgreements: list })),
      monthPlan: isFee ? (() => {
        const firstKey = (currentProject.monthlyCycles || [])[0]?.monthKey;
        const template = firstKey ? projectTasks.filter((t) => !t.cycleKey || t.cycleKey === firstKey) : projectTasks;
        const groups = new Map<string, Set<string>>();
        template.forEach((t) => {
          const phase = dels.find((d) => d.id === t.deliverableId)?.name || t.frente || 'Plan del mes';
          groups.set(phase, (groups.get(phase) || new Set<string>()).add(t.title.replace(/\s*\(\d+\)$/, '')));
        });
        return Array.from(groups.entries()).map(([phase, items]) => ({ phase, items: Array.from(items) }));
      })() : undefined,
      // Qué incluye cada fase (títulos de sus tareas, sin horas)
      phaseSummaries: Object.fromEntries(dels.map((d) => [d.id, Array.from(new Set(projectTasks
        .filter((t) => t.deliverableId === d.id || t.frente === d.name)
        .map((t) => t.title.replace(/\s*\(\d+\)$/, ''))))])),
      contractMonths: mode === 'kickoff' ? scheduleContractMonths : (currentProject.contractMonths ?? undefined),
      onApply: mode === 'project' ? () => handleApplyPhaseSteps(steps, projectNotBefore) : undefined,
      applyPending: mode === 'project' && projectStepsDraft !== null,
      onClose: () => { setClientViewMode(null); setClientViewExternal(false); }
    };
    viewProps.onOpenInNewTab = () => openClientViewInNewTab(viewProps);
    return viewProps;
  };

  // Canal con la pestaña «Cronograma y acuerdos»: aplica sus ediciones aquí y le devuelve la versión nueva
  useEffect(() => {
    if (!clientViewMode || !clientViewExternal) return;
    const bridge = openBridge((msg) => {
      if (msg.kind !== 'command') return;
      const cmd = msg.cmd;
      const p = clientViewPropsRef.current;
      if (cmd.type === 'hello') {
        window.clearTimeout(clientCloseTimerRef.current); // recargó la pestaña: sigue conectada
        if (p) bridge.post({ kind: 'snapshot', data: toClientViewData(p) });
        return;
      }
      if (cmd.type === 'closed') {
        clientCloseTimerRef.current = window.setTimeout(() => { setClientViewMode(null); setClientViewExternal(false); }, 2000);
        return;
      }
      if (!p) return;
      if (cmd.type === 'contacts') p.onChangeClientContacts(cmd.approver, cmd.backup);
      else if (cmd.type === 'steps') p.onChangeSteps(cmd.steps);
      else if (cmd.type === 'commitmentDate') p.onChangeCommitmentDate(cmd.key, cmd.date);
      else if (cmd.type === 'agreements') p.onChangeAgreements(cmd.list);
      else if (cmd.type === 'approval') p.onClientApproval(cmd.approval);
      else if (cmd.type === 'apply') p.onApply?.();
    });
    clientBridgeRef.current = bridge;
    return () => {
      bridge.post({ kind: 'snapshot', data: null }); // la pestaña queda en «no conectada»
      bridge.close();
      clientBridgeRef.current = null;
      lastClientSnapshotRef.current = '';
    };
  }, [clientViewMode, clientViewExternal]);

  // Después de cada render, si los datos cambiaron, se publican a la pestaña
  useEffect(() => {
    const p = clientViewPropsRef.current;
    if (!clientViewMode || !clientViewExternal || !p || !clientBridgeRef.current) return;
    const data = toClientViewData(p);
    const json = JSON.stringify(data);
    if (json === lastClientSnapshotRef.current) return;
    lastClientSnapshotRef.current = json;
    saveSnapshot(data);
    clientBridgeRef.current.post({ kind: 'snapshot', data });
  });

  // Proyecto iniciado: reprograma fases y tareas abiertas con los pasos editados (no toca la línea base)
  const handleApplyPhaseSteps = (steps: PhaseSteps[], notBefore: Record<string, string>, baseProject?: ProjectSummaryItem) => {
    if (!currentProject || !currentProject.startDate) return;
    const base = baseProject || currentProject;
    const projectTasks = (((currentProject as any).allTasks || currentProject.tasks) || []) as TaskItem[];
    const sched = computePhaseSchedule(currentProject.startDate, steps, notBefore);
    const openTasks = projectTasks.filter((t) => !t.completed && t.status !== 'Done');
    const planned = planTasksFromPhases(sched.phases, openTasks.map((t) => ({ id: t.id, deliverableId: t.deliverableId, budgetedHours: t.budgetedHours, title: t.title })), buildCapacityContext(openTasks));
    const byId = new Map(sched.phases.map((ph) => [ph.id, ph]));
    onUpdateProject?.({
      ...base,
      phaseSteps: steps,
      scheduleConfig: { ...(base.scheduleConfig || {}), includedReworkRounds: roundsFromSteps(steps) ?? base.scheduleConfig?.includedReworkRounds } as typeof base.scheduleConfig,
      deliverables: (base.deliverables || []).map((d) => {
        const ph = byId.get(d.id);
        return ph ? { ...d, startDate: ph.start, dueDate: ph.end, endDate: ph.end } as typeof d : d;
      }),
      endDate: sched.endDate,
      forecastEndDate: sched.endDate
    });
    if (onUpdateAllTasks) {
      onUpdateAllTasks(tasks.map((t) => {
        const slot = planned.tasks[t.id];
        return slot ? { ...t, date: slot.scheduledDate, startDate: slot.scheduledDate, scheduledDate: slot.scheduledDate, dueDate: slot.dueDate, dueText: `Deadline: ${formatDate(slot.dueDate)}` } : t;
      }));
    }
    setProjectStepsDraft(null);
    setScheduleSuccessMessage(`Cronograma actualizado: entrega final ${formatDate(sched.endDate)}.`);
    setTimeout(() => setScheduleSuccessMessage(null), 5000);
  };

  // Insumo recibido DESPUÉS de su fecha: ¿corre el cronograma? Se pregunta antes de mover hitos.
  const [lateInputPrompt, setLateInputPrompt] = useState<{ depId: string; title: string; receivedDate: string; daysLate: number; overflow: PhaseOverflow } | null>(null);
  const handleDependencyReceived = (depId: string, updatedProject: ProjectSummaryItem) => {
    const steps = updatedProject.phaseSteps;
    const dep = (updatedProject.dependencies || []).find((d) => d.id === depId);
    if (!dep || !dep.blocking || !dep.deliverableId || !steps?.length || !updatedProject.startDate || isCurrentProjectFee) return;
    const receivedDate = (dep.receivedAt || new Date().toISOString()).slice(0, 10);
    if (!dep.expectedDate || receivedDate <= dep.expectedDate) return;
    const before = computePhaseSchedule(updatedProject.startDate, steps, notBeforeFromDependencies(updatedProject.dependencies));
    const shifted = (updatedProject.dependencies || []).map((d) => (d.id === depId ? { ...d, shiftsSchedule: true } : d));
    const after = computePhaseSchedule(updatedProject.startDate, steps, notBeforeFromDependencies(shifted));
    if (after.endDate === before.endDate) return; // llegó tarde pero la fase aún no empezaba: no corre nada
    const idx = Math.max(0, steps.findIndex((st) => st.id === dep.deliverableId));
    const daysLate = businessDaysInRange(dep.expectedDate, receivedDate).filter((d) => d > dep.expectedDate).length;
    setLateInputPrompt({
      depId,
      title: dep.title,
      receivedDate,
      daysLate,
      overflow: { phaseIndex: idx, phaseName: steps[idx]?.name || '', productionEnd: before.phases[idx]?.productionEnd || '', extraDays: daysLate, nextSteps: steps, before, after }
    });
  };
  const confirmLateInputShift = (shift: boolean) => {
    if (!lateInputPrompt || !currentProject) { setLateInputPrompt(null); return; }
    const deps = (currentProject.dependencies || []).map((d) => (d.id === lateInputPrompt.depId ? { ...d, shiftsSchedule: shift } : d));
    const base = { ...currentProject, dependencies: deps };
    if (shift && currentProject.phaseSteps) handleApplyPhaseSteps(currentProject.phaseSteps, notBeforeFromDependencies(deps), base);
    else onUpdateProject?.(base);
    setLateInputPrompt(null);
  };

  const handleReassignForCapacity = (taskId: string, user: UserItem) => {
    if (!onUpdateAllTasks) return;
    const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    onUpdateAllTasks(tasks.map((t) => (t.id === taskId
      ? { ...t, assignee: { ...t.assignee, id: user.id, name: user.name, initials, role: user.officialRole || t.budgetedRole || t.assignee?.role }, collaborators: [] }
      : t)));
  };

  const scheduleBreakdown = useMemo(() => {
    if (!scheduleKickoffDate) return null;
    if (kickoffPlan && (currentProject?.deliverables || []).length > 0) return kickoffPlan.baseline;
    return computeScheduleBaseline({
      startDate: scheduleKickoffDate,
      productionWeeks: scheduleDurationWeeks,
      config: scheduleConfigDraft,
      isFee: isCurrentProjectFee
    });
  }, [kickoffPlan, currentProject, scheduleKickoffDate, scheduleDurationWeeks, scheduleConfigDraft, isCurrentProjectFee]);

  const calculatedEndDate = scheduleBreakdown?.endDate || '';

  // Inicio de cada fase según el cronograma que se va a crear (para la fecha de cada insumo).
  const phaseStartById = useMemo(() => {
    const map = new Map<string, string>();
    kickoffPlan?.deliverables.forEach((d) => map.set(d.id, d.startDate));
    return map;
  }, [kickoffPlan]);
  const inputExpectedDate = (deliverableId?: string) =>
    (deliverableId && phaseStartById.get(deliverableId)) || scheduleKickoffDate;

  const handleConfirmKickoff = () => {
    if (!currentProject || !scheduleKickoffDate) return;
    // Todas las tareas del proyecto (por id o, en datos legados, por nombre), sin filtro de ciclo
    const projectTasks = ((currentProject as any).allTasks || currentProject.tasks) as TaskItem[];
    const projectTaskIds = new Set(projectTasks.map((t) => t.id));
    // Mismo plan que la vista previa (incluye fases editadas en «Cronograma y acuerdos»)
    const plan = kickoffPlan;
    if (!plan) return;
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
      dependencies:
        askClientInputs && selectedScheduleInputs.length > 0
          ? [
              ...(currentProject.dependencies || []),
              ...inputsToDependencies({
                projectId: currentProject.id,
                kickoffDate: finalStartDate,
                inputs: selectedScheduleInputs.map((i) => {
                  const planned = plan.deliverables.find((d) => d.id === i.deliverableId);
                  // Fecha que el cliente se comprometió en el kickoff; si no, el inicio de la fase
                  return { ...i, expectedDate: i.committedDate || planned?.startDate || finalStartDate };
                }),
                followUpOwnerUserId:
                  users?.find((u) => u.name === currentProject.leadName)?.id || currentUser?.id || '',
                followUpOwnerName: currentProject.leadName
              })
            ]
          : currentProject.dependencies,
      isKickedOff: true,
      phaseSteps: isCurrentProjectFee ? currentProject.phaseSteps : (phaseStepsDraft || kickoffDefaultSteps),
      clientApproverName: clientContactsDraft?.approver ?? currentProject.clientApproverName,
      clientApproverBackupName: clientContactsDraft?.backup ?? currentProject.clientApproverBackupName,
      clientAgreements: agreementsDraft ?? currentProject.clientAgreements,
      clientScheduleApproval: approvalDraft === undefined ? currentProject.clientScheduleApproval : approvalDraft,
      // Cada presentación al cliente incluye una ronda de ajustes: las rondas del proyecto = presentaciones (23 Nov 2026)
      scheduleConfig: isCurrentProjectFee
        ? { ...scheduleConfigDraft, includedReworkRounds: 0 }
        : { ...scheduleConfigDraft, includedReworkRounds: roundsFromSteps(phaseStepsDraft || kickoffDefaultSteps) ?? scheduleConfigDraft.includedReworkRounds },
      healthNote: `Proyecto iniciado formalmente el ${finalStartDate} con cronograma alineado.`
    };

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }

    if (onUpdateAllTasks && projectTasks.length > 0) {
      const updatedAllTasks = tasks.map((t) => {
        const slot = projectTaskIds.has(t.id) ? plan.tasks[t.id] : undefined;
        if (!slot) return t;
        // Reajuste de un proyecto ya iniciado: lo terminado conserva sus fechas reales
        if (!isFirstKickoff && (t.completed || t.status === 'Done')) return t;
        return {
          ...t,
          ...(isCurrentProjectFee ? { cycleKey: t.cycleKey || feeStartKey } : {}),
          date: slot.scheduledDate,
          startDate: slot.scheduledDate,
          scheduledDate: slot.scheduledDate,
          dueDate: slot.dueDate,
          dueText: `Deadline: ${formatDate(slot.dueDate)}`,
          dueStatus: 'normal' as const
        };
      });
      onUpdateAllTasks(updatedAllTasks);
    }

    setIsScheduleModalOpen(false);
    setScheduleSuccessMessage(
      `🚀 ¡Proyecto "${currentProject.name}" iniciado formalmente el ${formatDate(finalStartDate)}! Cronograma alineado y deadlines sincronizados.`
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
    // Un solo nombre de estado en toda la ficha (23 Nov 2026): Por iniciar · Programado · En ejecución · En pausa · Cerrado · Archivado
    const projectStageLabel = isProjectArchived ? 'Archivado'
      : isProjectCompleted ? 'Cerrado'
      : currentProject.status === 'En Pausa' ? 'En pausa'
      : isProjectPendingToStart ? 'Por iniciar'
      : isProjectScheduled ? 'Programado'
      : 'En ejecución';

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
          {/* Fila 1: cliente y tipo a la izquierda, acciones a la derecha (misma línea, también en tablet).
              Debajo, el título a todo el ancho con corte equilibrado. */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5 items-start">
            <div className="contents">
              <div className="flex flex-wrap items-center gap-2 col-start-1 row-start-1 self-center">
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
                {currentProject.nonBillable && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]" title="Proyecto de UHURA Group: no se cobra">
                    Interno · no facturable
                  </span>
                )}
              </div>
              
              <h1 className="col-span-2 text-xl sm:text-2xl font-extrabold text-[#0f172a] pt-0.5 tracking-tight [text-wrap:balance] max-w-4xl">{currentProject.name}</h1>
              
              <p className="col-span-2 text-xs text-[#64748b] flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Líder del proyecto: <strong className="text-[#0f172a]">{currentProject.leadName}</strong></span>
                <span className="text-[#cbd5e1]">·</span>
                <span>Revisa por defecto:</span>
                {onChangeProjectReviewer && (currentUser?.accessLevel === 'executive' || currentUser?.accessLevel === 'system_admin' || (!!currentUser && makePersonMatcher(currentUser, users || [])({ name: currentProject.leadName }))) ? (
                  <select
                    id="project-default-reviewer"
                    value={currentProject.defaultReviewer?.name || currentProject.leadName}
                    title="Se aplica a las tareas abiertas que siguen con el revisor por defecto. Las que alguien cambió a mano no se tocan."
                    onChange={(e) => {
                      const u = (users || []).find((x) => x.name === e.target.value);
                      const person = u
                        ? { name: u.name, initials: u.initials, avatarBg: u.avatarBg, role: u.jobTitle || String(u.role) }
                        : { name: currentProject.leadName, initials: currentProject.leadName.split(' ').map((w) => w[0]).slice(0, 2).join(''), avatarBg: currentProject.leadAvatarBg, role: currentProject.leadRole };
                      onChangeProjectReviewer(currentProject.name, person);
                    }}
                    className="rounded-lg border border-[#e2e8f0] bg-white px-2 py-0.5 text-xs font-bold text-[#0f172a] cursor-pointer"
                  >
                    {!(users || []).some((u) => u.name === currentProject.leadName) && <option value={currentProject.leadName}>{currentProject.leadName}</option>}
                    {(users || []).filter((u) => u.status === 'Active').map((u) => (
                      <option key={u.id} value={u.name}>{u.name}{u.name === currentProject.leadName ? ' (líder)' : ''}</option>
                    ))}
                  </select>
                ) : (
                  <strong className="text-[#0f172a]">{currentProject.defaultReviewer?.name || currentProject.leadName}</strong>
                )}
              </p>
              {/* Badges de Estado, Gates y Tandas */}
              <div className="col-span-2 flex items-center gap-2 flex-wrap pt-1.5">
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
                    Estado: {isProjectScheduled ? `Programado · inicia ${formatDate(currentProject.startDate)}` : projectStageLabel}
                  </span>
                </span>

                {!isFeeProject && !isInternalProject(currentProject) && (
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
            <div className="col-start-2 row-start-1 flex items-center justify-end gap-2 flex-wrap min-w-0">
              {isProjectCompleted ? (
                <span className="px-4 py-2 rounded-2xl bg-[#f1f5f9] border border-[#e2e8f0] text-[#334155] text-xs font-bold">
                  🏁 Cerrado · Fin real: {formatDate(currentProject.actualEndDate || currentProject.closure?.actualEndDate)}
                </span>
              ) : isProjectPendingToStart && !canStartProject ? (
                <span className="px-4 py-2 rounded-2xl bg-[#faf5ff] border border-[#e9d5ff] text-[#501f92] text-xs font-bold">
                  Por iniciar
                </span>
              ) : isProjectPendingToStart ? (
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#501f92] hover:bg-[#3d1572] text-white text-xs font-semibold whitespace-nowrap shrink-0 shadow-sm transition-colors cursor-pointer"
                  title="Fijar fecha oficial de arranque y sincronizar automáticamente los deadlines de las actividades del equipo"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#d4ff4a]" />
                  <span>Iniciar proyecto</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canEditProject}
                  onClick={() => canEditProject && setIsScheduleModalOpen(true)}
                  className="disabled:cursor-default inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full whitespace-nowrap shrink-0 bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] hover:border-[#501f92] text-[#0f172a] text-xs font-semibold transition-colors cursor-pointer group"
                  title="Proyecto iniciado. Clic para ajustar el arranque o recalcular el cronograma (las fechas están en la tarjeta «Cronograma»)"
                >
                  <span className={`w-2 h-2 rounded-full ${isProjectScheduled ? 'bg-[#8a4dff]' : 'bg-[#16a34a]'}`} aria-hidden="true" />
                  <span className="text-xs text-[#334155] font-semibold">{projectStageLabel}</span>
                  {canEditProject && (
                    <span className="text-[11px] text-[#64748b] group-hover:text-[#501f92] underline ml-1">
                      Ajustar
                    </span>
                  )}
                </button>
              )}
              {!isProjectPendingToStart && (isCurrentProjectFee || (currentProject.deliverables || []).length > 0) && (
                <button
                  type="button"
                  onClick={() => openClientView('project')}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-[#cbd5e1] bg-white hover:bg-[#faf5ff] hover:border-[#501f92] text-[#501f92] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  title="Cronograma, reuniones y acuerdos para mostrar al cliente (se corrige con «Ajustar»)"
                >
                  <Calendar className="w-3.5 h-3.5" /> Cronograma cliente
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
            const templateTasks = allTasks.filter((t) => taskCycleKey(t, currentProject.contractStartDate) === firstKey);
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
                {/* Al abrir cada mes: decidir qué pasa con las horas no usadas del mes anterior
                    (excepción puntual; por defecto aplica la regla del contrato). */}
                {(() => {
                  if (!viewCycle || viewCycle.monthKey === firstKey) return null;
                  const prevIdx = cycles.findIndex((c) => c.monthKey === viewCycle.monthKey) - 1;
                  const prev = prevIdx >= 0 ? cycles[prevIdx] : null;
                  if (!prev || prev.status !== 'closed') return null;
                  const unused = Math.max(0, prev.quotedHours + (prev.rolloverHoursIn || 0) - prev.executedHours);
                  const override = currentProject.rolloverOverrides?.[viewCycle.monthKey];
                  const ruleLabel = { none: 'no se acumulan', carry_over: 'pasan todas', contractual_cap: 'pasan hasta 25 %' }[currentProject.rolloverPolicy || 'none'];
                  return (
                    <label className="flex items-center gap-2 text-[#475569]">
                      <span>Horas no usadas del ciclo anterior ({prev.monthLabel}: {unused.toFixed(1)}h):</span>
                      <select
                        value={override || ''}
                        disabled={!canEditProject || unused <= 0}
                        onChange={(e) => {
                          const value = e.target.value as '' | 'none' | 'carry_over' | 'contractual_cap';
                          const next = { ...(currentProject.rolloverOverrides || {}) };
                          if (value) next[viewCycle.monthKey] = value; else delete next[viewCycle.monthKey];
                          onUpdateProject?.({ ...currentProject, rolloverOverrides: next });
                        }}
                        className="px-2 py-1 rounded-lg border border-[#cbd5e1] bg-white text-[#0f172a] font-semibold disabled:opacity-50"
                        title="Excepción solo para este mes. Sin excepción aplica la regla del contrato."
                      >
                        <option value="">Regla del contrato ({ruleLabel})</option>
                        <option value="none">Excepción: no pasan</option>
                        <option value="carry_over">Excepción: pasan todas</option>
                        <option value="contractual_cap">Excepción: pasan hasta 25 %</option>
                      </select>
                    </label>
                  );
                })()}
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
                    title="Crea las tareas recurrentes del mes a partir de la plantilla del primer mes (en producción lo hace ECO automáticamente el primer día del ciclo)"
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
                  {projectStageLabel}
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

        {/* Carga del equipo (proyecto en curso): personas por encima de su jornada en los días de sus
            tareas, con una persona del mismo rol que tiene espacio. El líder decide; nada cambia solo. */}
        {activeTab === 'overview' && !isProjectPendingToStart && !isProjectCompleted && !isProjectArchived && (() => {
          const projectTasks = (((currentProject as any).allTasks || currentProject.tasks) || []) as TaskItem[];
          const pool = users && users.length > 0 ? users : initialUsers;
          const list = suggestLoadRebalance({ projectTasks, allTasks: tasks, users: pool, absences: initialAbsenceEvents, todayIso: todayStr })
            .filter((x) => !dismissedLoadTasks.includes(x.taskId));
          if (list.length === 0) return null;
          const people = Array.from(new Set(list.map((x) => x.from)));
          const applicable = list.filter((x) => x.to);
          return (
            <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fde68a] text-xs space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-extrabold text-sm text-[#92400e]">Carga del equipo: {list.length} tarea{list.length === 1 ? '' : 's'} con la agenda llena</p>
                  <p className="text-[#92400e]/80 mt-0.5">El alcance se cotizó por rol. Según todos sus proyectos, estas personas pasan su jornada en los días de estas tareas; ECO sugiere a alguien del mismo rol con espacio.</p>
                </div>
                {applicable.length > 1 && canEditProject && (
                  <button type="button" onClick={() => applicable.forEach((x) => handleReassignForCapacity(x.taskId, x.to!.user))} className="shrink-0 px-3 py-1.5 rounded-lg bg-[#501f92] hover:bg-[#3d1572] text-white font-bold cursor-pointer">
                    Aplicar las {applicable.length} sugerencias
                  </button>
                )}
              </div>
              {people.map((person) => {
                const rows = list.filter((x) => x.from === person);
                const peak = Math.max(...rows.map((x) => x.peakPct));
                const roles = Array.from(new Set(rows.map((x) => x.role))).join(', ');
                return (
                  <div key={person} className="space-y-1.5">
                    <p className="text-[#0f172a]"><strong>{person}</strong> {peak >= 999 ? 'está ausente esos días' : `llega al ${peak} % de su jornada`}{rows.some((x) => x.fromAbsent) && peak < 999 ? ' (tiene una ausencia esos días)' : ''} · {rows.length} tarea{rows.length === 1 ? '' : 's'} sin empezar de {roles}</p>
                    <ul className="space-y-1.5">
                      {rows.map((x) => (
                        <li key={x.taskId} className="flex items-center justify-between gap-2 bg-white rounded-lg border border-[#fde68a] px-2.5 py-1.5 flex-wrap">
                          <span className="min-w-0">
                            <button
                              type="button"
                              onClick={() => { const task = projectTasks.find((t) => t.id === x.taskId); if (task) onOpenTaskDetail(task); }}
                              className="block font-semibold text-[#0f172a] truncate hover:text-[#501f92] hover:underline cursor-pointer text-left"
                              title="Abrir la tarea"
                            >
                              {x.taskTitle}
                            </button>
                            <span className="block text-[10.5px] text-[#64748b]">{x.hours}h · {formatDate(x.windowStart)} → {formatDate(x.windowEnd)} · {x.overHours}h por encima de su jornada</span>
                          </span>
                          {!canEditProject ? (
                            <span className="shrink-0 text-[10.5px] text-[#475569] font-semibold" title="Comercial no reasigna personas (#145): lo decide el líder del proyecto">
                              {x.to ? `Sugerido: ${x.to.user.name.split(' ')[0]} (${x.to.freeHours}h libres) · lo decide el líder` : 'Nadie más del rol tiene espacio · lo decide el líder'}
                            </span>
                          ) : (
                          <span className="flex items-center gap-2 shrink-0">
                            {x.to ? (
                              <button
                                type="button"
                                disabled={!canEditProject}
                                onClick={() => handleReassignForCapacity(x.taskId, x.to!.user)}
                                className="px-2.5 py-1 rounded-lg bg-[#501f92] hover:bg-[#3d1572] text-white text-[10.5px] font-bold cursor-pointer disabled:opacity-50"
                                title={`${x.to.user.name} (${x.to.fit === 'affine' ? `rol afín a ${x.role}` : x.role}) tiene ${x.to.freeHours}h libres en esa ventana`}
                              >
                                Asignar a {x.to.user.name.split(' ')[0]}{x.to.user.name.split(' ')[1] ? ` ${x.to.user.name.split(' ')[1]}` : ''} · {x.to.freeHours}h libres
                              </button>
                            ) : (
                              <span className="text-[10.5px] text-[#92400e] font-semibold">Nadie más del rol tiene espacio: mueve la fecha o habla con Dirección</span>
                            )}
                            {/* Elegir a mano: todas las personas activas, primero las del rol y con más espacio */}
                            <select
                              value=""
                              disabled={!canEditProject}
                              onChange={(e) => { const opt = x.options.find((o) => o.user.id === e.target.value); if (opt) handleReassignForCapacity(x.taskId, opt.user); }}
                              className="h-7 max-w-[190px] px-2 rounded-lg border border-[#cbd5e1] bg-white text-[10.5px] font-semibold text-[#334155] cursor-pointer"
                              aria-label={`Elegir otra persona para ${x.taskTitle}`}
                            >
                              <option value="">Otra persona…</option>
                              {(['own', 'affine', 'cover'] as const).map((fit) => {
                                const group = x.options.filter((o) => o.fit === fit);
                                if (group.length === 0) return null;
                                return (
                                  <optgroup key={fit} label={fit === 'own' ? `Mismo rol (${x.role})` : fit === 'affine' ? 'Rol afín' : 'Otro rol (queda «cubre rol»)'}>
                                    {group.map((o) => (
                                      <option key={o.user.id} value={o.user.id}>
                                        {o.user.name} · {o.peakPct >= 999 ? 'ausente' : `${o.freeHours}h libres`}
                                      </option>
                                    ))}
                                  </optgroup>
                                );
                              })}
                            </select>
                            <button type="button" onClick={() => setDismissedLoadTasks((prev) => [...prev, x.taskId])} className="text-[10.5px] text-[#64748b] hover:text-[#0f172a] underline cursor-pointer">Ignorar</button>
                          </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        })()}

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
            onDependencyReceived={handleDependencyReceived}
            project={currentProject}
            tasks={currentProject.tasks}
            allProjects={projectsList}
            users={initialUsers}
            currentUser={currentUser}
            activeTimer={activeTimer}
            onStartTimer={onStartTimer}
            onPauseResumeTimer={onPauseResumeTimer}
            onStopTimer={onStopTimer}
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
                  <option value="all">Todos los entregables ({frentesBreakdown.length})</option>
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
                          <th className="py-3 px-4 min-w-[220px]" title="Horas asignadas a la persona y horas que registró. Si alguien registró horas sin estar asignado o en un rol que no es el suyo, se marca">ASIGNADO · EJECUTÓ</th>
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
                                <div className="flex flex-col gap-1">
                                  {r.peopleList.map((p) => {
                                    const notAssigned = p.assigned === 0 && p.executed > 0;
                                    const cover = p.fit === 'cover';
                                    return (
                                      <span
                                        key={p.name}
                                        className={`inline-flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-lg text-[10px] font-semibold ${cover || notAssigned ? 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]' : 'bg-[#f1f5f9] text-[#475569]'}`}
                                        title={notAssigned ? `${p.name} registró horas en tareas de ${r.role} sin estar asignado` : cover ? `${p.name} cubre ${r.role}: no es su rol` : undefined}
                                      >
                                        <span className="text-[#0f172a]">{p.name}</span>
                                        <span className="font-mono">{p.assigned > 0 ? `${p.assigned.toFixed(1)}h asig.` : 'no asignado'} · {p.executed.toFixed(1)}h ejec.</span>
                                        {cover && <span className="font-bold">cubre rol</span>}
                                      </span>
                                    );
                                  })}
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
                                  {f.completedCount === f.tasks.length && f.tasks.length > 0 ? 'Entregado' : isProjectPendingToStart ? 'Por iniciar' : isProjectScheduled ? 'Programado' : 'En ejecución'}
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
                          <td className="py-3.5 px-5 text-right pr-6 text-[#501f92]">{projectStageLabel}</td>
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
            onUpdateClient={onUpdateClient}
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
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#e2e8f0] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#501f92]/10 text-[#501f92] flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#0f172a]">
                      Iniciar proyecto 🚀
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
                {/* 1. Kickoff + semanas (o vigencia) en una sola fila */}
                {/* Campos del arranque en una grilla simétrica: misma altura y etiqueta arriba */}
                <div className={`grid grid-cols-1 gap-3 ${isCurrentProjectFee ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  <label className="space-y-1 block">
                    <span className="font-bold text-[#334155] block">Fecha del kickoff</span>
                    <input
                      type="date"
                      value={scheduleKickoffDate}
                      onChange={(e) => setScheduleKickoffDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#cbd5e1] font-semibold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                    />
                  </label>
                  {isCurrentProjectFee ? (
                    <>
                      <label className="space-y-1 block">
                        <span className="font-bold text-[#334155] block">Vigencia (meses)</span>
                        <input
                          type="number"
                          min="1"
                          max="36"
                          value={scheduleContractMonths}
                          onChange={(e) => setScheduleContractMonths(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full h-10 px-3 rounded-xl border border-[#cbd5e1] font-semibold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                          aria-label="Vigencia del contrato en meses"
                        />
                      </label>
                      <label className="space-y-1 block">
                        <span className="font-bold text-[#334155] block">Horas no usadas del mes</span>
                        <select
                          value={scheduleRollover}
                          onChange={(e) => setScheduleRollover(e.target.value as 'none' | 'carry_over' | 'contractual_cap')}
                          className="w-full h-10 px-3 rounded-xl border border-[#cbd5e1] font-semibold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                        >
                          <option value="none">No se acumulan</option>
                          <option value="carry_over">Pasan al mes siguiente</option>
                          <option value="contractual_cap">Pasan hasta un 25 %</option>
                        </select>
                      </label>
                    </>
                  ) : (
                    <label className="space-y-1 block">
                      <span className="font-bold text-[#334155] block" title="Vienen del Alcance; cámbialas solo si hace falta">
                        Semanas de producción
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="52"
                        value={scheduleDurationWeeks}
                        onChange={(e) => setScheduleDurationWeeks(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full h-10 px-3 rounded-xl border border-[#cbd5e1] font-semibold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#501f92] bg-white"
                        aria-label="Semanas de producción"
                      />
                    </label>
                  )}
                </div>

                {/* Presentaciones al cliente (misma fuente que «Ver cronograma y acuerdos»): una fila por
                    presentación con su fase, tipo y días. Por defecto: wireframe (checkpoint), prototipo y
                    funcionalidad; se agregan más con «Añadir». */}
                {!isCurrentProjectFee && !isCurrentProjectInternal && (() => {
                  const steps = phaseStepsDraft || kickoffDefaultSteps;
                  // Cambiar presentaciones no cambia la producción: siempre = semanas del alcance × 5 (si cabe)
                  const setSteps = (next: PhaseSteps[]) => setPhaseStepsDraft(rebalanceToTarget(next, scheduleDurationWeeks * 5));
                  const rows = steps.flatMap((st, i) => st.rounds.map((r, k) => ({ st, i, r, k })));
                  const patchRound = (i: number, k: number, patch: Partial<PhaseSteps['rounds'][number]>) =>
                    setSteps(steps.map((st, j) => {
                      if (j !== i) return st;
                      // Los ajustes son tareas dentro de la producción: subir sus días los toma de la producción
                      const delta = patch.adjustDays !== undefined ? patch.adjustDays - (st.rounds[k].adjustDays || 0) : 0;
                      return {
                        ...st,
                        productionDays: Math.max(1, st.productionDays - delta),
                        rounds: st.rounds.map((r, m) => (m === k ? { ...r, ...patch } : r))
                      };
                    }));
                  const moveToPhase = (i: number, k: number, target: number) => {
                    if (target === i) return;
                    const round = steps[i].rounds[k];
                    setSteps(steps.map((st, j) => {
                      if (j === i) return removeRound(st, k);
                      if (j === target) return appendRound(st, round);
                      return st;
                    }));
                  };
                  const addRow = () => {
                    const target = Math.max(0, steps.map((st) => isClientReviewedPhase(st.name)).lastIndexOf(true));
                    setSteps(steps.map((st, j) => (j === target
                      ? appendRound(st, { label: 'Nueva presentación', kind: 'approval', reviewDays: 3, adjustDays: 2 })
                      : st)));
                  };
                  return (
                    <div className="space-y-2">
                      <span className="font-bold text-[#334155] block">Presentaciones al cliente<InfoTip label="Presentación al cliente">Cada vez que le mostramos al cliente un avance para que lo revise y apruebe: un concepto, un diseño, una estrategia, una parrilla… Cada una incluye una ronda: el cliente manda sus comentarios en un solo envío y nosotros ajustamos. Si vuelve a pedir cambios sobre lo mismo, es una ronda adicional.</InfoTip></span>
                      <div className="overflow-x-auto rounded-xl border border-[#e2e8f0]">
                        <table className="w-full text-xs">
                          <thead className="bg-[#f8fafc] text-[#64748b] text-left">
                            <tr>
                              <th className="px-2 py-1.5 font-semibold whitespace-nowrap">Presentación<InfoTip label="Presentación al cliente">Cada vez que le mostramos al cliente un avance para que lo revise y apruebe: un concepto, un diseño, una estrategia, una parrilla… Cada una incluye una ronda: el cliente manda sus comentarios en un solo envío y nosotros ajustamos. Si vuelve a pedir cambios sobre lo mismo, es una ronda adicional.</InfoTip></th>
                              <th className="px-2 py-1.5 font-semibold">Fase</th>
                              <th className="px-2 py-1.5 font-semibold whitespace-nowrap">Tipo<InfoTip label="Tipo"><b>Avance:</b> el cliente ve cómo va y valida el rumbo, sin aprobación formal. <b>Aprobación:</b> el cliente aprueba formalmente y se pasa a lo siguiente.</InfoTip></th>
                              <th className="px-2 py-1.5 font-semibold text-center text-[#92400e]">Revisión del cliente<InfoTip label="Revisión del cliente">Días hábiles que tiene el cliente para revisar la presentación y mandar todos sus comentarios en un solo envío. <b>Suman días a la entrega.</b> Si responde tarde, la entrega se corre.</InfoTip></th>
                              <th className="px-2 py-1.5 font-semibold text-center">Nuestros ajustes<InfoTip label="Nuestros ajustes">Días hábiles que tiene el equipo para aplicar los comentarios del cliente, después de su revisión. Son tareas dentro de la producción: <b>no suman días a la entrega.</b> Incluye una ronda; una segunda se cotiza o mueve la entrega.</InfoTip></th>
                              <th className="px-1 py-1.5" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f1f5f9]">
                            {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-2 text-[#94a3b8]">Sin presentaciones: el cliente solo recibe la entrega final.</td></tr>}
                            {rows.map(({ st, i, r, k }) => (
                              <tr key={`${st.id}-${k}`}>
                                <td className="px-2 py-1"><input value={r.label || st.name} onChange={(e) => patchRound(i, k, { label: e.target.value })} className="w-full min-w-[110px] h-8 px-2 rounded-lg border border-[#e2e8f0] font-semibold" aria-label="Nombre de la presentación" /></td>
                                <td className="px-2 py-1">
                                  <select value={i} onChange={(e) => moveToPhase(i, k, Number(e.target.value))} className="h-8 px-1 rounded-lg border border-[#e2e8f0] bg-white max-w-[130px]" aria-label="Fase de la presentación">
                                    {steps.map((x, j) => <option key={x.id} value={j}>{x.name}</option>)}
                                  </select>
                                </td>
                                <td className="px-2 py-1">
                                  <select value={r.kind || 'approval'} onChange={(e) => patchRound(i, k, { kind: e.target.value as 'checkpoint' | 'approval' })} className="h-8 px-1 rounded-lg border border-[#e2e8f0] bg-white" aria-label="Tipo" title="Avance: el cliente valida el rumbo, sin aprobación formal. Aprobación: el cliente aprueba formalmente y se pasa a lo siguiente.">
                                    <option value="checkpoint">Avance</option>
                                    <option value="approval">Aprobación</option>
                                  </select>
                                </td>
                                <td className="px-2 py-1 text-center bg-[#fffbeb]/60"><span className="inline-flex items-center gap-1"><input type="number" min="1" max="20" value={r.reviewDays} onChange={(e) => patchRound(i, k, { reviewDays: Math.max(1, parseInt(e.target.value, 10) || 1) })} className="w-11 h-8 px-1 rounded-lg border border-[#cbd5e1] font-bold text-xs bg-white text-center" aria-label="Días de revisión del cliente" /><span className="text-[11px] text-[#64748b]">{r.reviewDays === 1 ? 'día' : 'días'}</span></span></td>
                                <td className="px-2 py-1 text-center"><span className="inline-flex items-center gap-1"><input type="number" min="0" max="20" value={r.adjustDays} onChange={(e) => patchRound(i, k, { adjustDays: Math.max(0, parseInt(e.target.value, 10) || 0) })} className="w-11 h-8 px-1 rounded-lg border border-[#cbd5e1] font-bold text-xs bg-white text-center" aria-label="Días de nuestros ajustes" /><span className="text-[11px] text-[#64748b]">{r.adjustDays === 1 ? 'día' : 'días'}</span></span></td>
                                <td className="px-1 py-1"><button type="button" onClick={() => setSteps(steps.map((x, j) => (j === i ? removeRound(x, k) : x)))} className="p-1 rounded-md text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] cursor-pointer" aria-label="Quitar presentación"><Trash2 className="w-3.5 h-3.5" /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button type="button" onClick={addRow} className="w-full inline-flex items-center justify-center gap-1 h-8 rounded-xl border border-dashed border-[#c4b5fd] text-[#501f92] font-semibold hover:bg-[#faf5ff] cursor-pointer">
                        <Plus className="w-3.5 h-3.5" /> Añadir presentación
                      </button>
                      <p className="text-[11px] text-[#64748b]">Días hábiles (sin fines de semana ni festivos). Cada presentación incluye una ronda: el cliente revisa y nosotros ajustamos. Solo la revisión del cliente suma días; el QA interno y nuestros ajustes ya están dentro de la producción. Una segunda ronda de comentarios, o una respuesta tarde del cliente, mueve la entrega o se cotiza.</p>
                    </div>
                  );
                })()}

                {/* 2. Insumos a solicitar al cliente (solo primer arranque): se crean como Dependencias */}
                {askClientInputs && (
                  <div className="space-y-2 pt-3 border-t border-[#f1f5f9]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#334155] inline-flex items-center gap-1">
                        Insumos a solicitar al cliente
                        <span className="relative group inline-flex">
                          <Info className="w-3.5 h-3.5 text-[#94a3b8] hover:text-[#501f92] cursor-help" aria-label="Cómo funcionan los insumos" />
                          <span className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block z-30 w-80 p-2.5 bg-[#0f172a] text-white text-[11px] font-normal rounded-xl shadow-xl leading-relaxed pointer-events-none">
                            Cada insumo se pide en el kickoff y se necesita para una fase: debe estar antes de que esa fase empiece. No suma días al cronograma; mientras tanto se gestiona con anticipación. Quedan en Dependencias con esa fecha. Si la fase llega sin el insumo y «Bloquea», la fase se detiene y el desvío es del cliente.
                          </span>
                        </span>
                      </span>
                      <span className="text-[10px] text-[#64748b]">Sugeridos para {scheduleInputsLabel} · marca los que necesites</span>
                    </div>
                    <ul className="rounded-xl border border-[#e2e8f0] divide-y divide-[#f1f5f9] max-h-48 overflow-y-auto">
                      {scheduleInputs.map((inp, idx) => (
                        <li key={idx} className="flex items-center gap-2 px-2.5 py-1.5">
                          <input
                            type="checkbox"
                            checked={inp.selected}
                            onChange={(e) =>
                              setScheduleInputs((prev) => prev.map((x, i) => (i === idx ? { ...x, selected: e.target.checked } : x)))
                            }
                            className="rounded text-[#501f92] cursor-pointer shrink-0"
                            aria-label={`Solicitar ${inp.title}`}
                          />
                          <span className={`flex-1 min-w-0 truncate ${inp.selected ? 'text-[#0f172a]' : 'text-[#94a3b8] line-through'}`} title={inp.title}>
                            {inp.title}
                          </span>
                          <button
                            type="button"
                            disabled={!inp.selected}
                            onClick={() =>
                              setScheduleInputs((prev) => prev.map((x, i) => (i === idx ? { ...x, blocking: !x.blocking } : x)))
                            }
                            className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border cursor-pointer disabled:opacity-40 ${
                              inp.blocking ? 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]' : 'bg-white text-[#64748b] border-[#e2e8f0]'
                            }`}
                            title="Clic para cambiar si bloquea el arranque de producción"
                          >
                            {inp.blocking ? 'Bloquea' : 'No bloquea'}
                          </button>
                          {(currentProject.deliverables || []).length > 0 ? (
                            <select
                              value={inp.deliverableId || ''}
                              disabled={!inp.selected}
                              onChange={(e) =>
                                setScheduleInputs((prev) => prev.map((x, i) => (i === idx ? { ...x, deliverableId: e.target.value || undefined } : x)))
                              }
                              className="shrink-0 w-32 p-1 rounded-lg border border-[#e2e8f0] text-[10px] bg-white disabled:opacity-40"
                              title={`Se necesita para esta fase: debe estar antes del ${formatDate(inputExpectedDate(inp.deliverableId))}`}
                              aria-label={`Fase para la que se necesita ${inp.title}`}
                            >
                              {(currentProject.deliverables || []).map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          ) : null}
                          {/* Fecha que se acuerda con el cliente en vivo (por defecto: inicio de la fase) */}
                          <input
                            type="date"
                            disabled={!inp.selected}
                            value={inp.committedDate || inputExpectedDate(inp.deliverableId) || ''}
                            onChange={(e) =>
                              setScheduleInputs((prev) => prev.map((x, i) => (i === idx ? { ...x, committedDate: e.target.value || undefined } : x)))
                            }
                            className={`shrink-0 w-[118px] p-1 rounded-lg border text-[10px] bg-white disabled:opacity-40 ${
                              inp.committedDate && inp.committedDate > (inputExpectedDate(inp.deliverableId) || '') ? 'border-[#f59e0b] text-[#b45309] font-bold' : 'border-[#e2e8f0]'
                            }`}
                            title={`Fecha en que el cliente lo entrega. Debe estar antes del ${formatDate(inputExpectedDate(inp.deliverableId))}; si es «Bloquea» y llega después, la fase se corre.`}
                            aria-label={`Fecha comprometida por el cliente para ${inp.title}`}
                          />
                          <button
                            type="button"
                            onClick={() => setScheduleInputs((prev) => prev.filter((_, i) => i !== idx))}
                            className="shrink-0 p-1 rounded-md text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] cursor-pointer"
                            title="Quitar este insumo de la lista"
                            aria-label={`Quitar ${inp.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newInputTitle}
                        onChange={(e) => setNewInputTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newInputTitle.trim()) {
                            setScheduleInputs((prev) => [...prev, { title: newInputTitle.trim(), type: 'client_input', blocking: false, selected: true, deliverableId: currentProject.deliverables?.[0]?.id }]);
                            setNewInputTitle('');
                          }
                        }}
                        placeholder="Otro insumo (ej. compra de hosting, script de GTM)…"
                        className="flex-1 p-2 rounded-xl border border-[#cbd5e1] text-xs bg-white"
                      />
                      <button
                        type="button"
                        disabled={!newInputTitle.trim()}
                        onClick={() => {
                          setScheduleInputs((prev) => [...prev, { title: newInputTitle.trim(), type: 'client_input', blocking: false, selected: true, deliverableId: currentProject.deliverables?.[0]?.id }]);
                          setNewInputTitle('');
                        }}
                        className="px-3 py-2 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] text-[#501f92] text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                )}

                {/* Resultado: entrega calculada (proyecto único; el fee muestra la línea de contrato) */}
                {scheduleBreakdown && !isCurrentProjectFee && (
                  <div className="p-3 rounded-xl bg-[#faf5ff] border border-[#e9d5ff] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#501f92] shrink-0" />
                        <div>
                          <span className="text-xs text-[#64748b] block">Entrega final</span>
                          <strong className="text-[#501f92] font-bold text-xs">{formatDate(scheduleBreakdown.endDate)}</strong>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#64748b] bg-white px-2 py-1 rounded-lg border border-[#e9d5ff]">
                        {scheduleBreakdown.totalBusinessDays} días hábiles
                      </span>
                    </div>
                    {(() => {
                      const phs = (kickoffPlan as { phases?: { productionDays: number; qaDays: number; rounds: { approvalDays: number; adjustDays: number; workDays: number; preQaDays: number }[] }[] } | null)?.phases || [];
                      const prod = phs.reduce((a, p) => a + p.productionDays + p.qaDays + p.rounds.reduce((x, r) => x + r.workDays + r.preQaDays + r.adjustDays, 0), 0);
                      const client = phs.reduce((a, p) => a + p.rounds.reduce((x, r) => x + r.approvalDays, 0), 0);
                      const target = scheduleDurationWeeks * 5;
                      const steps = phaseStepsDraft || kickoffDefaultSteps;
                      const min = productionMinimum(steps);
                      return (
                        <div className="border-t border-[#e9d5ff] pt-2 space-y-1.5">
                          <p className="text-xs text-[#475569]">
                            Producción <strong>{prod}</strong> de {target} ({scheduleDurationWeeks} semana{scheduleDurationWeeks === 1 ? '' : 's'}, incluye QA interno y nuestros ajustes) + revisión del cliente <strong>{client}</strong> = <strong>{prod + client} días hábiles</strong>
                          </p>
                          {prod > target && (
                            <p className="text-xs font-semibold text-[#b45309] bg-[#fffbeb] border border-[#fde68a] rounded-lg px-2.5 py-1.5">
                              No cabe en {scheduleDurationWeeks} semana{scheduleDurationWeeks === 1 ? '' : 's'}: {steps.length} fases (mínimo 1 día cada una) y sus ajustes necesitan al menos {min} días. Sube las semanas o quita presentaciones.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Agenda por capacidad: tareas que no caben en la agenda de su colaborador */}
                {capacitySuggestions.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-xs space-y-2">
                    <p className="font-bold text-[#92400e]">
                      {capacitySuggestions.length} tarea(s) no caben en la agenda de su colaborador
                    </p>
                    <p className="text-[10.5px] text-[#92400e]/80 leading-snug">
                      ECO ubica cada tarea en el primer día de su ventana en que la persona tiene espacio (según todos sus proyectos). Estas no caben antes de su fecha límite: reasigna a alguien del mismo rol o ajusta el arranque.
                    </p>
                    <ul className="space-y-1.5">
                      {capacitySuggestions.map(({ conflict, task, role, suggestion }) => (
                        <li key={conflict.taskId} className="flex items-center justify-between gap-2 bg-white rounded-lg border border-[#fde68a] px-2.5 py-1.5">
                          <span className="min-w-0">
                            <span className="block font-semibold text-[#0f172a] truncate">{task?.title || 'Tarea'}</span>
                            <span className="block text-[10px] text-[#64748b]">
                              {conflict.person} · {conflict.hours}h · libre {conflict.freeInWindow}h entre {formatDate(conflict.windowStart)} y {formatDate(conflict.windowEnd)}
                            </span>
                          </span>
                          {suggestion && !canEditProject ? (
                            <span className="shrink-0 text-[10.5px] text-[#475569] font-semibold" title="Comercial no reasigna personas (#145): lo decide el líder del proyecto en «Carga del equipo»">
                              Sugerido: {suggestion.user.name.split(' ')[0]} · lo decide el líder
                            </span>
                          ) : suggestion ? (
                            <button
                              type="button"
                              onClick={() => handleReassignForCapacity(conflict.taskId, suggestion.user)}
                              className="shrink-0 px-2 py-1 rounded-lg bg-[#501f92] text-white text-[10.5px] font-bold cursor-pointer hover:bg-[#3d1572]"
                              title={`${suggestion.user.name} (${role}) tiene ${suggestion.free}h libres en esa ventana`}
                            >
                              Asignar a {suggestion.user.name.split(' ')[0]}
                            </button>
                          ) : (
                            <span className="shrink-0 text-[10px] text-[#92400e] font-semibold">Sin otra persona del rol con espacio</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}


                {kickoffPlan && (isCurrentProjectFee || (currentProject.deliverables || []).length > 0) && (
                  <button
                    type="button"
                    onClick={() => openClientView('kickoff')}
                    className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-full border border-[#501f92] text-[#501f92] bg-white hover:bg-[#faf5ff] text-xs font-semibold cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Ver cronograma y acuerdos
                  </button>
                )}


                {/* Al reajustar un proyecto iniciado se reprograman siempre las tareas abiertas desde el
                    nuevo arranque; las terminadas conservan sus fechas (antes había un check opcional). */}
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
                  <span>Iniciar proyecto</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {lateInputPrompt && (
          <PhaseOverflowModal
            taskTitle={lateInputPrompt.title}
            overflow={lateInputPrompt.overflow}
            title="Este insumo llegó tarde"
            description={<>«{lateInputPrompt.title}» llegó el <strong>{formatDate(lateInputPrompt.receivedDate)}</strong>, {lateInputPrompt.daysLate} día{lateInputPrompt.daysLate === 1 ? '' : 's'} hábil{lateInputPrompt.daysLate === 1 ? '' : 'es'} después de lo acordado. Como bloquea «{lateInputPrompt.overflow.phaseName}», el cronograma se corre así:</>}
            hint="Es un retraso del cliente: avísale la nueva fecha. Según los acuerdos, el segundo pago se mantiene en la fecha original si el corrimiento supera 15 días hábiles."
            confirmLabel="Recalcular cronograma"
            cancelLabel="Mantener fechas"
            onExtend={() => confirmLateInputShift(true)}
            onKeepTaskOnly={() => confirmLateInputShift(false)}
          />
        )}

        {clientViewMode && (() => {
          const viewProps = buildClientViewProps(clientViewMode);
          clientViewPropsRef.current = viewProps;
          if (!viewProps || clientViewExternal) return null; // en pestaña propia: se publica por el canal
          return <ClientKickoffView {...viewProps} />;
        })()}

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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'active' | 'closed' | 'archived' | 'all')}
            aria-label="Estado de los proyectos"
            className="w-full sm:w-auto bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold px-2.5 py-1.5 rounded-xl text-[#0f172a] cursor-pointer truncate"
          >
            <option value="active">En curso ({statusCounts.active})</option>
            <option value="closed">Cerrados ({statusCounts.closed})</option>
            <option value="archived">Archivados ({statusCounts.archived})</option>
            <option value="all">Todos los estados</option>
          </select>

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

      {filteredProjects.length === 0 && (
        <div className="p-8 rounded-2xl border border-dashed border-[#cbd5e1] bg-white text-center text-xs text-[#64748b]">
          {filterStatus === 'closed'
            ? 'No hay proyectos cerrados con estos filtros.'
            : filterStatus === 'archived'
              ? 'No hay proyectos archivados con estos filtros.'
              : 'No hay proyectos con estos filtros.'}
        </div>
      )}

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
                    {isInternalProject(prj) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#ecfdf5] text-[#047857]">Interno</span>
                    )}
                    {prj.status === 'Archivado' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#f1f5f9] text-[#64748b]">
                        Archivado
                      </span>
                    ) : ((prj.status as string) === 'completed' || (prj.status as string) === 'Cerrado' || (prj.status as string) === 'Completado') ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                        Cerrado
                      </span>
                    ) : prj.status === 'En Pausa' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                        En pausa
                      </span>
                    ) : (!prj.startDate || !prj.isKickedOff || prj.status === 'Planificación') ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#faf5ff] text-[#501f92] border border-[#e9d5ff]">
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
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] py-1 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                          {(() => {
                            const prjClosed = ['completed', 'Cerrado', 'Completado'].includes(prj.status as string);
                            const prjArchived = prj.status === 'Archivado';
                            const prjPending = !prj.isKickedOff || !prj.startDate || prj.status === 'Planificación' || (prj.status as string) === 'Por empezar';
                            const openIn = (action: 'edit' | 'notifications' | 'close') => {
                              setActiveProjectMenu(null);
                              setPendingProjectAction(action);
                              handleCardClick(prj.id);
                            };
                            const item = 'w-full px-3 py-1.5 text-left text-xs font-semibold text-[#334155] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer transition-colors';
                            return (
                              <>
                                {canEditProject && (
                                  <button onClick={() => openIn('edit')} className={item}>
                                    <Pencil className="w-3.5 h-3.5 text-[#501f92]" />
                                    <span>Editar proyecto</span>
                                  </button>
                                )}
                                {canViewProjectNotifications(currentUser?.accessLevel) && (
                                  <button onClick={() => openIn('notifications')} className={item}>
                                    <Bell className="w-3.5 h-3.5 text-[#501f92]" />
                                    <span>Notificaciones</span>
                                  </button>
                                )}
                                {canEditProject && !prjPending && !prjClosed && !prjArchived && (
                                  <button onClick={() => openIn('close')} className={item}>
                                    <Flag className="w-3.5 h-3.5 text-[#501f92]" />
                                    <span>Cerrar proyecto</span>
                                  </button>
                                )}
                              </>
                            );
                          })()}
                          {canEditProject && (
                          <>
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
                            <span>{prj.status === 'Archivado' ? 'Desarchivar proyecto' : 'Archivar proyecto'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setProjectPendingDelete(prj);
                              setActiveProjectMenu(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs font-semibold text-[#dc2626] hover:bg-[#fee2e2]/40 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#dc2626]" />
                            <span>Eliminar proyecto</span>
                          </button>
                          </>
                          )}
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
                    Ver entregables y tareas →
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
