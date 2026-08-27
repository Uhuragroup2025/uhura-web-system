import React, { useState, useMemo, useEffect } from 'react';
import { TaskItem, ActiveTimerState, ClientProfile, ProjectType, ProjectPhaseItem, ProjectSummaryItem } from './types';
export type { ProjectSummaryItem };
import { BoardView } from './BoardView';
import { ManagePhasesModal } from './ManagePhasesModal';
import { ImportBacklogModal } from './ImportBacklogModal';
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
  Upload,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Table as TableIcon
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
  onOpenTaskDetail: (task: TaskItem) => void;
  onToggleTask: (taskId: string) => void;
  onNavigateToClient?: (clientName: string) => void;
  onUpdateProject?: (updatedProject: ProjectSummaryItem) => void;
  onAddTaskToProject?: (newTask: Partial<TaskItem>) => void;
  onImportTasksToProject?: (importedTasks: Partial<TaskItem>[]) => void;
}

type ProjectDetailTab = 'tasks' | 'backlog' | 'budget' | 'team' | 'activity';
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
  onOpenTaskDetail,
  onToggleTask,
  onNavigateToClient,
  onUpdateProject,
  onAddTaskToProject,
  onImportTasksToProject
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialSelectedProjectId);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'fee_monthly' | 'fixed_milestones' | 'risk'>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  
  // Sync selected project ID if prop changes from outside (e.g. breadcrumb navigation)
  useEffect(() => {
    setSelectedProjectId(initialSelectedProjectId);
  }, [initialSelectedProjectId]);
  
  // Project Detail Tab & Grouping
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>('tasks');
  const [tasksGroupBy, setTasksGroupBy] = useState<TasksGroupBy>('frente');
  const [collapsedFrentes, setCollapsedFrentes] = useState<Record<string, boolean>>({});
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});

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
  const [quickRole, setQuickRole] = useState('Front End');
  const [quickHours, setQuickHours] = useState('4');
  const [quickAssignee, setQuickAssignee] = useState('Catalina Tejada');

  // Compute metrics for each project based on tasks (dynamic calculation)
  const enrichedProjects = useMemo(() => {
    return projectsList.map((prj) => {
      const projectTasks = tasks.filter(
        (t) =>
          t.projectName?.toLowerCase() === prj.name.toLowerCase() ||
          t.board?.toLowerCase() === prj.name.toLowerCase()
      );

      const tasksAssignedHours = projectTasks.reduce((acc, t) => acc + (t.budgetedHours || 0), 0);
      const projectSoldHours = prj.soldHours || prj.budgetedHours || 0;
      const effectiveBudgetedHours = projectSoldHours > 0 ? projectSoldHours : tasksAssignedHours;

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
        healthNote = `Desvío: +${(consumedHours - effectiveBudgetedHours).toFixed(1)}h sobre lo vendido`;
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
        tasks: projectTasks
      };
    });
  }, [projectsList, tasks]);

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
      if (filterType === 'fee_monthly') matchType = p.projectType === 'fee_monthly';
      else if (filterType === 'fixed_milestones') matchType = p.projectType === 'fixed_milestones';
      else if (filterType === 'risk') matchType = p.healthStatus === 'rojo' || p.healthStatus === 'amarillo';

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
  const isFeeProject = currentProject?.projectType === 'fee_monthly';

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

    return Object.values(frentesMap);
  }, [currentProject]);

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

      const budgetedHours = phaseTasks.reduce((acc, t) => acc + (t.budgetedHours || 0), 0);
      const consumedHours = phaseTasks.reduce((acc, t) => acc + ((t.consumedSeconds || 0) / 3600), 0);
      const completedCount = phaseTasks.filter((t) => t.completed || t.status === 'Done').length;

      return {
        ...phase,
        tasks: phaseTasks,
        budgetedHours,
        consumedHours,
        completedCount,
        totalCount: phaseTasks.length
      };
    });
  }, [currentProject]);

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

  const toggleCollapseFrente = (frenteName: string) => {
    setCollapsedFrentes((prev) => ({
      ...prev,
      [frenteName]: !prev[frenteName]
    }));
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
      startDate: currentProject.startDate || '2026-08-15',
      dueDate: currentProject.endDate || '2026-12-31',
      baselineStartDate: currentProject.startDate || '2026-08-15',
      baselineDueDate: currentProject.endDate || '2026-12-31',
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

  // --- PROJECT DETAIL VIEW ---
  if (currentProject) {
    const percentHours = currentProject.budgetedHours > 0
      ? Math.round((currentProject.consumedHours / currentProject.budgetedHours) * 100)
      : 0;

    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToPortfolio}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#501f92] hover:text-[#381566] cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-[#e2e8f0] shadow-2xs hover:bg-[#f8fafc] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Portafolio</span>
          </button>

          {onOpenNewTaskModalWithProject && (
            <button
              onClick={() => onOpenNewTaskModalWithProject(currentProject.name, currentProject.clientName)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear tarea</span>
            </button>
          )}
        </div>

        {/* Project Header Banner */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] shadow-xs space-y-4">
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
                      : currentProject.projectType === 'fixed_milestones'
                      ? 'bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]'
                      : 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]'
                  }`}
                >
                  {currentProject.projectType === 'fee_monthly'
                    ? 'Fee mensual'
                    : currentProject.projectType === 'fixed_milestones'
                    ? 'Proyecto único'
                    : 'Interno / No facturable'}
                </span>
                <span className="text-xs font-semibold text-[#64748b]">· {currentProject.serviceBase}</span>
              </div>
              
              <h1 className="text-2xl font-extrabold text-[#0f172a] pt-0.5 tracking-tight">{currentProject.name}</h1>
              
              <p className="text-xs text-[#64748b]">
                Project Lead: <strong className="text-[#0f172a]">{currentProject.leadName}</strong>
              </p>
            </div>

            {/* Health Box (Clean, without verbose frentes list) */}
            <div className="flex items-center gap-3 bg-[#f8fafc] p-3 rounded-2xl border border-[#e2e8f0] shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-[#64748b] block">Salud</span>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      currentProject.healthStatus === 'verde'
                        ? 'bg-[#10b981]'
                        : currentProject.healthStatus === 'amarillo'
                        ? 'bg-[#f59e0b]'
                        : 'bg-[#ef4444]'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      currentProject.healthStatus === 'verde'
                        ? 'text-[#16a34a]'
                        : currentProject.healthStatus === 'amarillo'
                        ? 'text-[#d97706]'
                        : 'text-[#dc2626]'
                    }`}
                  >
                    {currentProject.healthStatus === 'verde'
                      ? 'Saludable'
                      : currentProject.healthStatus === 'amarillo'
                      ? 'Atención'
                      : 'En Riesgo'}
                  </span>
                </div>
                {currentProject.healthNote && (
                  <span className="text-[10px] text-[#64748b] block mt-0.5 max-w-[150px] truncate" title={currentProject.healthNote}>
                    {currentProject.healthNote}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick 4 KPIs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#f1f5f9] text-xs">
            {/* 1. Horas cotizadas */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Horas cotizadas</span>
              <span className="text-base font-extrabold text-[#501f92] font-mono">
                {currentProject.budgetedHours % 1 === 0 ? currentProject.budgetedHours : currentProject.budgetedHours.toFixed(1)}h
              </span>
              <span className="text-[10px] text-[#64748b] block mt-0.5">
                {currentProject.tasksAssignedHours && currentProject.budgetedHours > currentProject.tasksAssignedHours
                  ? `${currentProject.tasksAssignedHours}h tareas · ${(currentProject.budgetedHours - currentProject.tasksAssignedHours).toFixed(0)}h disp.`
                  : 'Total cotizado'}
              </span>
            </div>

            {/* 2. Horas ejecutadas */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Horas ejecutadas</span>
              <span className="text-base font-extrabold text-[#0f172a] font-mono">
                {currentProject.consumedHours.toFixed(0)}h{' '}
                <span className="text-xs font-normal text-[#64748b]">· {percentHours}%</span>
              </span>
              <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden mt-1.5">
                <div
                  style={{ width: `${Math.min(percentHours, 100)}%` }}
                  className={`h-full rounded-full ${
                    percentHours > 100
                      ? 'bg-[#ef4444]'
                      : percentHours > 85
                      ? 'bg-[#f59e0b]'
                      : 'bg-[#10b981]'
                  }`}
                />
              </div>
            </div>

            {/* 3. Tareas */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Tareas</span>
              <span className="text-base font-extrabold text-[#0f172a]">
                {currentProject.completedTasksCount}/{currentProject.totalTasksCount}{' '}
                <span className="text-xs font-normal text-[#64748b]">
                  · {currentProject.totalTasksCount > 0 ? Math.round((currentProject.completedTasksCount / currentProject.totalTasksCount) * 100) : 0}%
                </span>
              </span>
              <span className="text-[10px] text-[#16a34a] font-bold block mt-0.5">
                {currentProject.completedTasksCount} listas de {currentProject.totalTasksCount}
              </span>
            </div>

            {/* 4. Cronograma */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">Cronograma</span>
              <span className="text-xs font-bold text-[#0f172a] block truncate">
                {currentProject.startDate || '15 Ago'} → {currentProject.endDate || '31 Dic'}
              </span>
              <span className="text-[10px] text-[#64748b] block mt-0.5">{currentProject.status}</span>
            </div>
          </div>
        </div>

        {/* Main Tabs: Tareas | Backlog (if unique project) | Horas | Equipo | Actividad */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tasks'
                ? 'bg-[#501f92] text-white shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Tareas ({currentProject.tasks.length})</span>
          </button>

          {!isFeeProject && (
            <button
              onClick={() => setActiveTab('backlog')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'backlog'
                  ? 'bg-[#501f92] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4ff4a]" />
              <span>Backlog</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold ml-0.5">
                {phasesBreakdown.length} fases
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('budget')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'budget'
                ? 'bg-[#501f92] text-white shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Horas</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'team'
                ? 'bg-[#501f92] text-white shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Equipo</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'activity'
                ? 'bg-[#501f92] text-white shadow-xs'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Actividad</span>
          </button>
        </div>

        {/* TAB 1: TAREAS */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* Sub-bar: Group by selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#64748b]">Agrupar por:</span>
                <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl text-xs font-semibold gap-1">
                  <button
                    onClick={() => setTasksGroupBy('frente')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      tasksGroupBy === 'frente' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b]'
                    }`}
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-[#501f92]" />
                    <span>Frente</span>
                  </button>

                  {!isFeeProject && (
                    <button
                      onClick={() => setTasksGroupBy('fase')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        tasksGroupBy === 'fase' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-[#501f92]" />
                      <span>Fase</span>
                    </button>
                  )}

                  <button
                    onClick={() => setTasksGroupBy('kanban')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      tasksGroupBy === 'kanban' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kanban</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isFeeProject && (
                  <button
                    onClick={() => setIsManagePhasesOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-[#501f92] hover:bg-[#f5f3ff] rounded-lg border border-[#e9d5ff] transition-colors cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Configurar Fases</span>
                  </button>
                )}
                <span className="text-xs text-[#64748b]">
                  {currentProject.tasks.length} tareas totales ·{' '}
                  <strong className="text-[#0f172a]">
                    {currentProject.tasks.filter((t) => t.completed || t.status === 'Done').length} listas
                  </strong>
                </span>
              </div>
            </div>

            {/* A. VIEW BY FRENTE (The Core Model: Proyecto -> Frente -> Tareas) */}
            {tasksGroupBy === 'frente' && (
              <div className="space-y-4">
                {frentesBreakdown.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl border border-[#e2e8f0] text-[#94a3b8]">
                    No hay tareas con frentes creadas aún.
                  </div>
                ) : (
                  frentesBreakdown.map((frenteGroup) => {
                    const isCollapsed = collapsedFrentes[frenteGroup.name];
                    const frentePercent = frenteGroup.budgetedHours > 0
                      ? Math.round((frenteGroup.consumedHours / frenteGroup.budgetedHours) * 100)
                      : 0;
                    const isFrenteOver = frenteGroup.consumedHours > frenteGroup.budgetedHours;

                    return (
                      <div
                        key={frenteGroup.name}
                        className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden"
                      >
                        {/* Frente Header Banner */}
                        <div
                          onClick={() => toggleCollapseFrente(frenteGroup.name)}
                          className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#f1f5f9] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#501f92]/10 border border-[#501f92]/20 flex items-center justify-center text-[#501f92]">
                              <FolderKanban className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-sm text-[#0f172a]">{frenteGroup.name}</h3>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                                  {frenteGroup.tasks.length} tareas
                                </span>
                              </div>
                              <span className="text-[11px] text-[#64748b]">
                                {frenteGroup.completedCount} de {frenteGroup.tasks.length} tareas completadas
                              </span>
                            </div>
                          </div>

                          {/* Frente Hours Progress */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-[#0f172a]">
                                {frenteGroup.consumedHours.toFixed(1)} h / {frenteGroup.budgetedHours.toFixed(1)} h cotizadas
                              </span>
                              <span className={`text-[11px] font-bold block ${isFrenteOver ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
                                ({frentePercent}%) {isFrenteOver ? '⚠️ Desvío' : ''}
                              </span>
                            </div>

                            <button className="text-[#94a3b8] p-1 rounded-lg">
                              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Frente Tasks Table */}
                        {!isCollapsed && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-white">
                                  <th className="py-2.5 px-4">TAREA & DEPENDENCIAS</th>
                                  <th className="py-2.5 px-3">FASE</th>
                                  <th className="py-2.5 px-3">ROL COTIZADO</th>
                                  <th className="py-2.5 px-3">RESPONSABLE</th>
                                  <th className="py-2.5 px-3">HORAS</th>
                                  <th className="py-2.5 px-3 text-center w-16">TIMER</th>
                                  <th className="py-2.5 px-4 text-right pr-5">ESTADO</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#f1f5f9]">
                                {frenteGroup.tasks.map((task) => {
                                  const isRunning = activeTimer?.taskId === task.id;
                                  const taskConsumedH = (task.consumedSeconds || 0) / 3600;

                                  return (
                                    <tr
                                      key={task.id}
                                      onClick={() => onOpenTaskDetail(task)}
                                      className={`hover:bg-[#f8fafc] cursor-pointer transition-colors group ${
                                        task.completed ? 'bg-[#f8fafc]/40 text-[#94a3b8]' : 'text-[#0f172a]'
                                      }`}
                                    >
                                      {/* Tarea & Predecesora */}
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2.5">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onToggleTask(task.id);
                                            }}
                                            className="text-[#94a3b8] hover:text-[#501f92] transition-colors cursor-pointer"
                                          >
                                            {task.completed ? (
                                              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                                            ) : (
                                              <div className="w-4 h-4 rounded-full border border-[#cbd5e1] hover:border-[#501f92]" />
                                            )}
                                          </button>
                                          <div>
                                            <span className={`font-bold text-xs group-hover:text-[#501f92] ${task.completed ? 'line-through' : ''}`}>
                                              {task.title}
                                            </span>
                                            {task.dependencyTaskTitle && (
                                              <div className="flex items-center gap-1 text-[10px] text-[#64748b] mt-0.5">
                                                <Lock className="w-2.5 h-2.5 text-[#f59e0b]" />
                                                <span>Depende de: <strong className="text-[#475569]">{task.dependencyTaskTitle}</strong></span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>

                                      {/* Fase */}
                                      <td className="py-3 px-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe]">
                                          {task.phase || task.fase || 'Discovery'}
                                        </span>
                                      </td>

                                      {/* Rol Cotizado */}
                                      <td className="py-3 px-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f5f3ff] text-[#501f92] border border-[#e9d5ff]">
                                          {task.budgetedRole || 'Especialista'}
                                        </span>
                                      </td>

                                      {/* Responsable Real */}
                                      <td className="py-3 px-3">
                                        <div className="flex items-center gap-1.5">
                                          <div className={`w-5 h-5 rounded-full ${task.assignee.avatarBg} text-white flex items-center justify-center text-[8px] font-bold`}>
                                            {task.assignee.initials}
                                          </div>
                                          <span className="text-xs text-[#334155] font-medium">{task.assignee.name}</span>
                                        </div>
                                      </td>

                                      {/* Horas Cotizadas vs Ejecutadas */}
                                      <td className="py-3 px-3 font-mono font-bold text-xs">
                                        <span className={taskConsumedH > task.budgetedHours ? 'text-[#ef4444]' : 'text-[#0f172a]'}>
                                          {taskConsumedH.toFixed(1)} h
                                        </span>
                                        <span className="text-[10px] text-[#64748b] font-normal"> / {task.budgetedHours} h</span>
                                      </td>

                                      {/* Timer Play / Pause */}
                                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
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

                                      {/* Status */}
                                      <td className="py-3 px-4 text-right pr-5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          task.status === 'Done' || task.completed
                                            ? 'bg-[#ecfdf5] text-[#065f46]'
                                            : task.status === 'Review'
                                            ? 'bg-[#f2ecfb] text-[#501f92]'
                                            : task.status === 'In Progress'
                                            ? 'bg-[#fffbeb] text-[#92400e]'
                                            : 'bg-[#f1f5f9] text-[#475569]'
                                        }`}>
                                          {task.status === 'Done' ? 'Listo' : task.status === 'Review' ? 'En revisión' : task.status === 'In Progress' ? 'En proceso' : 'Por hacer'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* B. VIEW BY FASE (Discovery -> Prototipo -> Dev -> QA -> Cierre) */}
            {tasksGroupBy === 'fase' && (
              <div className="space-y-4">
                {phasesBreakdown.map((phaseGroup) => {
                  const isCollapsed = collapsedPhases[phaseGroup.name];
                  const phasePercent = phaseGroup.budgetedHours > 0
                    ? Math.round((phaseGroup.consumedHours / phaseGroup.budgetedHours) * 100)
                    : 0;
                  const isPhaseOver = phaseGroup.consumedHours > phaseGroup.budgetedHours;

                  return (
                    <div
                      key={phaseGroup.id || phaseGroup.name}
                      className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden"
                    >
                      {/* Phase Header Banner */}
                      <div
                        onClick={() => toggleCollapsePhase(phaseGroup.name)}
                        className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#f1f5f9] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            phaseGroup.status === 'completed'
                              ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30'
                              : phaseGroup.status === 'in_progress'
                              ? 'bg-[#501f92] text-white shadow-xs'
                              : 'bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]'
                          }`}>
                            {phaseGroup.order || 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-sm text-[#0f172a]">{phaseGroup.name}</h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                phaseGroup.status === 'completed'
                                  ? 'bg-[#ecfdf5] text-[#065f46]'
                                  : phaseGroup.status === 'in_progress'
                                  ? 'bg-[#f2ecfb] text-[#501f92] border border-[#e9d5ff]'
                                  : 'bg-[#f1f5f9] text-[#64748b]'
                              }`}>
                                {phaseGroup.status === 'completed' ? 'Completada' : phaseGroup.status === 'in_progress' ? 'En curso' : 'Pendiente'}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#64748b]">
                              {phaseGroup.startDate || 'Inicio'} → {phaseGroup.endDate || 'Fin'} · {phaseGroup.completedCount} de {phaseGroup.tasks.length} actividades listas
                            </span>
                          </div>
                        </div>

                        {/* Phase Hours Progress */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-[#0f172a]">
                              {phaseGroup.consumedHours.toFixed(1)} h / {phaseGroup.budgetedHours.toFixed(1)} h
                            </span>
                            <span className={`text-[11px] font-bold block ${isPhaseOver ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
                              ({phasePercent}%) {isPhaseOver ? '⚠️ Desvío' : ''}
                            </span>
                          </div>

                          <button className="text-[#94a3b8] p-1 rounded-lg">
                            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Phase Tasks Table */}
                      {!isCollapsed && (
                        <div className="overflow-x-auto">
                          {phaseGroup.tasks.length === 0 ? (
                            <div className="p-6 text-center text-xs text-[#94a3b8]">
                              No hay tareas asociadas a esta fase todavía.{' '}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickFase(phaseGroup.name);
                                  setIsQuickAddOpen(true);
                                  setActiveTab('backlog');
                                }}
                                className="text-[#501f92] font-bold hover:underline ml-1"
                              >
                                + Agregar desde el Backlog
                              </button>
                            </div>
                          ) : (
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-white">
                                  <th className="py-2.5 px-4">ACTIVIDAD</th>
                                  <th className="py-2.5 px-3">FRENTE</th>
                                  <th className="py-2.5 px-3">ROL COTIZADO</th>
                                  <th className="py-2.5 px-3">RESPONSABLE</th>
                                  <th className="py-2.5 px-3">HORAS</th>
                                  <th className="py-2.5 px-3 text-center w-16">TIMER</th>
                                  <th className="py-2.5 px-4 text-right pr-5">ESTADO</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#f1f5f9]">
                                {phaseGroup.tasks.map((task) => {
                                  const isRunning = activeTimer?.taskId === task.id;
                                  const taskConsumedH = (task.consumedSeconds || 0) / 3600;

                                  return (
                                    <tr
                                      key={task.id}
                                      onClick={() => onOpenTaskDetail(task)}
                                      className="hover:bg-[#f8fafc] cursor-pointer transition-colors group text-[#0f172a]"
                                    >
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2.5">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onToggleTask(task.id);
                                            }}
                                            className="text-[#94a3b8] hover:text-[#501f92] transition-colors cursor-pointer"
                                          >
                                            {task.completed ? (
                                              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                                            ) : (
                                              <div className="w-4 h-4 rounded-full border border-[#cbd5e1] hover:border-[#501f92]" />
                                            )}
                                          </button>
                                          <span className={`font-bold text-xs group-hover:text-[#501f92] ${task.completed ? 'line-through text-[#94a3b8]' : ''}`}>
                                            {task.title}
                                          </span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-3">
                                        <span className="text-xs text-[#64748b] font-medium">{task.frente || 'General'}</span>
                                      </td>

                                      <td className="py-3 px-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f5f3ff] text-[#501f92] border border-[#e9d5ff]">
                                          {task.budgetedRole || 'Especialista'}
                                        </span>
                                      </td>

                                      <td className="py-3 px-3">
                                        <div className="flex items-center gap-1.5">
                                          <div className={`w-5 h-5 rounded-full ${task.assignee.avatarBg} text-white flex items-center justify-center text-[8px] font-bold`}>
                                            {task.assignee.initials}
                                          </div>
                                          <span className="text-xs text-[#334155] font-medium">{task.assignee.name}</span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-3 font-mono font-bold text-xs">
                                        <span className={taskConsumedH > task.budgetedHours ? 'text-[#ef4444]' : 'text-[#0f172a]'}>
                                          {taskConsumedH.toFixed(1)} h
                                        </span>
                                        <span className="text-[10px] text-[#64748b] font-normal"> / {task.budgetedHours} h</span>
                                      </td>

                                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
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

                                      <td className="py-3 px-4 text-right pr-5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          task.status === 'Done' || task.completed
                                            ? 'bg-[#ecfdf5] text-[#065f46]'
                                            : task.status === 'Review'
                                            ? 'bg-[#f2ecfb] text-[#501f92]'
                                            : task.status === 'In Progress'
                                            ? 'bg-[#fffbeb] text-[#92400e]'
                                            : 'bg-[#f1f5f9] text-[#475569]'
                                        }`}>
                                          {task.status === 'Done' ? 'Listo' : task.status === 'Review' ? 'En revisión' : task.status === 'In Progress' ? 'En proceso' : 'Por hacer'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* C. VIEW KANBAN */}
            {tasksGroupBy === 'kanban' && (
              <BoardView
                tasks={currentProject.tasks}
                isProjectDetail={true}
                onToggleTask={onToggleTask}
                onOpenNewTaskModal={() => {
                  if (onOpenNewTaskModalWithProject) {
                    onOpenNewTaskModalWithProject(currentProject.name, currentProject.clientName);
                  }
                }}
                activeTimer={activeTimer}
                onStartTimer={onStartTimer}
                onPauseResumeTimer={onPauseResumeTimer}
                onOpenTaskDetail={onOpenTaskDetail}
              />
            )}
          </div>
        )}

        {/* TAB: BACKLOG & CRONOGRAMA (For Projects with Backlog & Phases) */}
        {activeTab === 'backlog' && (
          <div className="space-y-5">
            {/* Top Phase Lifecycle Stepper & Controls */}
            <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                <div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#501f92]" />
                    <h3 className="font-extrabold text-sm text-[#0f172a]">Gestión de Backlog & Fases</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                      Metodología Flexible
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Planifica el cronograma, asigna roles cotizados, controla el avance por hitos y preserva la línea base (Baseline).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsImportBacklogOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] text-xs font-bold border border-[#e2e8f0] transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#501f92]" />
                    <span>Importar Backlog</span>
                  </button>

                  <button
                    onClick={() => setIsManagePhasesOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Configurar Fases</span>
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
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
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
                        <span>{phase.startDate ? phase.startDate.slice(5) : '15 Ago'} → {phase.endDate ? phase.endDate.slice(5) : '31 Dic'}</span>
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

                {/* Filter Frente */}
                <select
                  value={selectedFrenteFilter}
                  onChange={(e) => setSelectedFrenteFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#501f92] font-semibold text-[#0f172a]"
                >
                  <option value="all">Todos los frentes ({frentesBreakdown.length})</option>
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
                      placeholder="Ej. Integración pasarela de pagos Wompi"
                      className="w-full px-3 py-2 text-xs bg-white text-[#0f172a] font-medium border border-[#cbd5e1] rounded-xl focus:outline-none focus:border-[#501f92] focus:ring-1 focus:ring-[#501f92] placeholder-[#94a3b8]"
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
                    <label className="text-[11px] font-extrabold text-[#1e293b] block mb-1">Frente</label>
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
                        <option value="Front End">Front End</option>
                        <option value="Back End">Back End</option>
                        <option value="UI/UX Designer">UI/UX</option>
                        <option value="QA Tester">QA Tester</option>
                        <option value="Tech Lead">Tech Lead</option>
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
            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs overflow-hidden">
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
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Listo
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#501f92]" /> En revisión
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> En proceso
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-white">
                      <th className="py-3 px-4">TAREA / DEPENDENCIAS</th>
                      <th className="py-3 px-3">FASE</th>
                      <th className="py-3 px-3">FRENTE</th>
                      <th className="py-3 px-3">ROL COTIZADO</th>
                      <th className="py-3 px-3">RESPONSABLE</th>
                      <th className="py-3 px-3">HORAS</th>
                      <th className="py-3 px-3">CRONOGRAMA & BASELINE</th>
                      <th className="py-3 px-3 text-center w-14">TIMER</th>
                      <th className="py-3 px-4 text-right pr-5">ESTADO</th>
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
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe]">
                                {task.phase || task.fase || 'Discovery'}
                              </span>
                            </td>

                            {/* Frente */}
                            <td className="py-3.5 px-3">
                              <span className="text-xs text-[#64748b] font-medium">{task.frente || 'General'}</span>
                            </td>

                            {/* Rol Cotizado */}
                            <td className="py-3.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f5f3ff] text-[#501f92] border border-[#e9d5ff]">
                                {task.budgetedRole || 'Especialista'}
                              </span>
                            </td>

                            {/* Responsable */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-5 h-5 rounded-full ${task.assignee.avatarBg} text-white flex items-center justify-center text-[8px] font-bold`}>
                                  {task.assignee.initials}
                                </div>
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
                                {task.startDate ? task.startDate.slice(5) : '15 Ago'} → {task.dueDate ? task.dueDate.slice(5) : '31 Dic'}
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
                                {task.status === 'Done' ? 'Listo' : task.status === 'Review' ? 'En revisión' : task.status === 'In Progress' ? 'En proceso' : 'Por hacer'}
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

        {/* TAB 3: HORAS & PRESUPUESTO (La vista analítica y de rentabilidad) */}
        {activeTab === 'budget' && (
          <div className="space-y-5">
            {/* Top Analysis Notice */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#f5f3ff] to-[#f8fafc] border border-[#e9d5ff] flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#501f92] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-[#0f172a]">
                  Análisis Operativo: Horas Cotizadas vs. Horas Reales por Rol
                </h4>
                <p className="text-[11px] text-[#64748b] mt-0.5 leading-relaxed">
                  Orbit compara la matriz de roles comercialmente cotizados contra las horas reales que el equipo ejecutó. 
                  Esta data nutre directamente el historial de estimaciones de Uhura para futuros proyectos y cotizaciones.
                </p>
              </div>
            </div>

            {/* 1. Matriz por Rol */}
            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#f1f5f9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#501f92]" />
                  <h3 className="font-extrabold text-sm text-[#0f172a]">Consolidado de Horas por Rol</h3>
                </div>
                <span className="text-xs text-[#64748b]">Total roles cotizados: {rolesBreakdown.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                      <th className="py-3 px-5">ROL COTIZADO</th>
                      <th className="py-3 px-4 text-right">HORAS COTIZADAS</th>
                      <th className="py-3 px-4 text-right">HORAS EJECUTADAS</th>
                      <th className="py-3 px-4 text-right">DESVIACIÓN (VAR)</th>
                      <th className="py-3 px-4">RESPONSABLES REALES</th>
                      <th className="py-3 px-5 text-right pr-6">SALUD / ALERTA</th>
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
                                <span key={name} className="px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[10px] font-semibold text-[#475569]">
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
            <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="p-4 border-b border-[#f1f5f9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-[#501f92]" />
                  <h3 className="font-extrabold text-sm text-[#0f172a]">Consolidado de Horas por Frente de Trabajo</h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                      <th className="py-3 px-5">FRENTE / ENTREGABLE</th>
                      <th className="py-3 px-4 text-right">HORAS COTIZADAS</th>
                      <th className="py-3 px-4 text-right">HORAS EJECUTADAS</th>
                      <th className="py-3 px-4 text-right">DESVIACIÓN</th>
                      <th className="py-3 px-4 text-center">AVANCE</th>
                      <th className="py-3 px-5 text-right pr-6">ESTADO</th>
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
                              {f.completedCount === f.tasks.length && f.tasks.length > 0 ? 'Entregado' : 'En Ejecución'}
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
                      <td className="py-3.5 px-5 text-right pr-6 text-[#501f92]">{currentProject.status}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EQUIPO */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] space-y-4">
            <h3 className="font-extrabold text-sm text-[#0f172a]">Equipo y Asignaciones</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {rolesBreakdown.map((r) => (
                <div key={r.role} className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                  <span className="text-xs font-bold text-[#501f92] block">{r.role}</span>
                  <div className="flex items-center justify-between text-xs text-[#64748b]">
                    <span>Asignado: {r.assigneesList.join(', ')}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-[#0f172a]">
                    {r.executedHours.toFixed(1)} h ejecutadas / {r.budgetedHours.toFixed(1)} h cotizadas
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ACTIVIDAD */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] space-y-3">
            <h3 className="font-extrabold text-sm text-[#0f172a]">Historial de Entregables y Actividad</h3>
            <p className="text-xs text-[#64748b]">
              Registro cronológico de tareas movidas de estado, aprobaciones y carga de tiempo en este proyecto.
            </p>
            <div className="space-y-2 pt-2">
              {currentProject.tasks.slice(0, 5).map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#0f172a]">{t.title}</strong>
                    <span className="text-[10px] text-[#64748b] block mt-0.5">Asignada a {t.assignee.name} · Frente: {t.frente}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#e2e8f0]">
                    {t.status}
                  </span>
                </div>
              ))}
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
      </div>
    );
  }

  // --- PORTFOLIO VIEW (List of all Projects) ---
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <span className="w-2 h-2 rounded-full bg-[#501f92]" />
            <span>Portafolio de Proyectos · Frentes, Horas por Rol y Trazabilidad</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] mt-1 tracking-tight">
            Proyectos en Ejecución ({projectsList.length})
          </h2>
        </div>

        <button
          onClick={onOpenNewProjectModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs cursor-pointer self-start sm:self-auto transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo proyecto</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#f2ecfb] text-[#501f92] flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase">Proyectos Activos</span>
            <div className="text-xl font-extrabold text-[#0f172a]">{totalActiveProjects} en curso</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase">Horas Presupuestadas</span>
            <div className="text-xl font-extrabold text-[#0f172a]">
              {totalConsumedHours.toFixed(0)}h / {totalBudgetedHours}h
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase">Salud Operativa</span>
            <div className="text-xl font-extrabold text-[#0f172a]">
              {Math.round((onTrackCount / (enrichedProjects.length || 1)) * 100)}% en fecha y horas
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-2xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Buscar por proyecto, cliente o marca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold px-2.5 py-1.5 rounded-xl text-[#0f172a] cursor-pointer"
          >
            <option value="all">Todos los tipos</option>
            <option value="fee_monthly">Fees mensuales</option>
            <option value="fixed_milestones">Proyectos únicos</option>
            <option value="risk">En riesgo / atención</option>
          </select>

          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold px-2.5 py-1.5 rounded-xl text-[#0f172a] cursor-pointer"
          >
            <option value="all">Todos los clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((prj) => {
          const percent = prj.budgetedHours > 0
            ? Math.round((prj.consumedHours / prj.budgetedHours) * 100)
            : 0;

          return (
            <div
              key={prj.id}
              onClick={() => handleCardClick(prj.id)}
              className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#8a4dff]/40 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      prj.projectType === 'fee_monthly'
                        ? 'bg-[#d4ff4a]/20 text-[#2e5e04]'
                        : 'bg-[#eff6ff] text-[#2563eb]'
                    }`}
                  >
                    {prj.projectType === 'fee_monthly' ? 'Fee mensual' : 'Proyecto único'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        prj.healthStatus === 'verde'
                          ? 'bg-[#10b981]'
                          : prj.healthStatus === 'amarillo'
                          ? 'bg-[#f59e0b]'
                          : 'bg-[#ef4444]'
                      }`}
                    />
                    <span className="text-[10px] font-bold text-[#64748b]">
                      {prj.healthStatus === 'verde' ? 'Saludable' : prj.healthStatus === 'amarillo' ? 'Atención' : 'Riesgo'}
                    </span>
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
    </div>
  );
};
