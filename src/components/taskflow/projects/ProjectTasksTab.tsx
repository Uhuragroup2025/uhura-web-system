import React, { useState, useMemo } from 'react';
import {
  ProjectSummaryItem,
  TaskItem,
  TaskStatus,
  ProjectDeliverable,
  TaskPriority,
  UserItem,
  TaskAssigneeAllocation,
  ActiveTimerState
} from '../types';
import {
  normalizeTaskStatus,
  getTaskStatusLabel,
  getTaskStatusBadgeClass,
  calculateTaskEstimatedHours,
  getTaskConsumedHours,
  checkRoleBudgetWarning,
  getTaskRiskAnalysis,
  createTaskBuckyEvent
} from '../tasks/taskEngine';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  Layers,
  Calendar,
  User,
  Users,
  AlertCircle,
  X,
  ChevronDown,
  ChevronRight,
  Shield,
  Eye,
  RotateCcw,
  Sparkles,
  Edit2,
  Trash2,
  ArrowRight,
  Flag
} from 'lucide-react';
import { initialUsers } from '../mockData';

interface ProjectTasksTabProps {
  project: ProjectSummaryItem;
  tasks: TaskItem[];
  allProjects?: ProjectSummaryItem[];
  users?: UserItem[];
  activeTimer?: ActiveTimerState | null;
  onStartTimer?: (task: TaskItem) => void;
  onPauseResumeTimer?: () => void;
  onOpenTaskDetail?: (task: TaskItem) => void;
  onUpdateTasks?: (tasks: TaskItem[]) => void;
  onUpdateProject?: (project: ProjectSummaryItem) => void;
}

export const ProjectTasksTab: React.FC<ProjectTasksTabProps> = ({
  project,
  tasks = [],
  allProjects = [],
  users = initialUsers,
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onOpenTaskDetail,
  onUpdateTasks,
  onUpdateProject
}) => {
  // Modo de visualización: 'deliverables' (por frente), 'kanban' o 'list'
  const [viewMode, setViewMode] = useState<'deliverables' | 'kanban' | 'list'>('deliverables');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBlockedOnly, setFilterBlockedOnly] = useState(false);

  // Estados de acordeón para entregables
  const [expandedDeliverables, setExpandedDeliverables] = useState<Record<string, boolean>>({
    all: true
  });

  // Modal para Crear / Editar Tarea
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Estado del Formulario
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDeliverableId, setFormDeliverableId] = useState('');
  const [formRoleId, setFormRoleId] = useState('');
  const [formPriority, setFormPriority] = useState<TaskPriority>('Medium');
  const [formTargetDate, setFormTargetDate] = useState('');
  const [formIsDeadlineStrict, setFormIsDeadlineStrict] = useState(false);
  const [formRequiresReview, setFormRequiresReview] = useState(true);
  const [formIsBlocked, setFormIsBlocked] = useState(false);
  const [formBlockedReason, setFormBlockedReason] = useState('');
  const [formIsRework, setFormIsRework] = useState(false);
  const [formReworkReason, setFormReworkReason] = useState<'client_feedback' | 'internal_qa' | 'brief_change'>('client_feedback');

  // Asignación de colaboradores: Simple vs Multi-colaborador
  const [isMultiAssignee, setIsMultiAssignee] = useState(false);
  const [formSingleUserId, setFormSingleUserId] = useState('');
  const [formSingleHours, setFormSingleHours] = useState(4);
  const [formAllocations, setFormAllocations] = useState<TaskAssigneeAllocation[]>([]);

  // Modal rápido de bloqueo
  const [blockingTask, setBlockingTask] = useState<TaskItem | null>(null);
  const [quickBlockReason, setQuickBlockReason] = useState('');

  // Entregables del proyecto
  const deliverables = useMemo(() => {
    return project.deliverables || [];
  }, [project.deliverables]);

  // Lista de entregables seleccionable (incluye opción por defecto si no existen)
  const selectableDeliverables = useMemo(() => {
    if (deliverables.length > 0) return deliverables;
    return [
      {
        id: 'del-general',
        projectId: project.id,
        name: 'Ejecución General',
        description: 'Frente principal de trabajo',
        order: 1,
        status: 'in_progress' as const,
        roleBudgets: [
          { id: 'rb-gen-1', roleId: 'Product Lead', roleName: 'Product Lead', quotedHours: 10 },
          { id: 'rb-gen-2', roleId: 'Diseñador Gráfico', roleName: 'Diseñador Gráfico', quotedHours: 20 },
          { id: 'rb-gen-3', roleId: 'Front End', roleName: 'Front End', quotedHours: 20 }
        ]
      }
    ];
  }, [deliverables, project.id]);

  // Entregable actualmente seleccionado en el formulario
  const currentSelectedDeliverable = useMemo(() => {
    return selectableDeliverables.find((d) => d.id === formDeliverableId) || selectableDeliverables[0];
  }, [selectableDeliverables, formDeliverableId]);

  // Roles cotizados disponibles en el entregable seleccionado
  const availableRolesForDeliverable = useMemo(() => {
    if (currentSelectedDeliverable && currentSelectedDeliverable.roleBudgets) {
      return currentSelectedDeliverable.roleBudgets.map((rb) => ({
        id: rb.roleId,
        name: rb.roleName || rb.roleId,
        quotedHours: rb.quotedHours
      }));
    }
    return [
      { id: 'Product Lead', name: 'Product Lead', quotedHours: 10 },
      { id: 'Diseñador Gráfico', name: 'Diseñador Gráfico', quotedHours: 20 },
      { id: 'Front End', name: 'Front End', quotedHours: 20 }
    ];
  }, [currentSelectedDeliverable]);

  // Horas totales estimadas para el formulario actual
  const currentFormTotalHours = useMemo(() => {
    if (!isMultiAssignee) {
      return Number(formSingleHours) || 0;
    }
    return formAllocations.reduce((sum, a) => sum + (Number(a.estimatedHours) || 0), 0);
  }, [isMultiAssignee, formSingleHours, formAllocations]);

  // Decisión 2: Validación en tiempo real del presupuesto cotizado (alerta informativa, nunca bloqueo)
  const roleBudgetWarning = useMemo(() => {
    if (!formRoleId || !currentSelectedDeliverable) return null;
    return checkRoleBudgetWarning(
      currentSelectedDeliverable,
      formRoleId,
      currentFormTotalHours,
      tasks,
      editingTask ? editingTask.id : undefined
    );
  }, [formRoleId, currentSelectedDeliverable, currentFormTotalHours, tasks, editingTask]);

  // Métricas de rollup del proyecto
  const totalEstimatedHours = useMemo(() => {
    return tasks.reduce((sum, t) => sum + calculateTaskEstimatedHours(t), 0);
  }, [tasks]);

  const totalConsumedHours = useMemo(() => {
    return tasks.reduce((sum, t) => sum + getTaskConsumedHours(t), 0);
  }, [tasks]);

  const statusCounts = useMemo(() => {
    const counts = { todo: 0, in_progress: 0, in_review: 0, completed: 0, blocked: 0, rework: 0 };
    tasks.forEach((t) => {
      const canonical = normalizeTaskStatus(t.status);
      counts[canonical]++;
      if (t.isBlocked || t.blockerInfo?.isBlocked) counts.blocked++;
      if (t.isRework) counts.rework++;
    });
    return counts;
  }, [tasks]);

  // Filtrado de tareas
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Búsqueda por texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchRole = (task.budgetedRoleId || task.budgetedRole || '').toLowerCase().includes(q);
        const matchAssignee = task.assignee?.name.toLowerCase().includes(q);
        if (!matchTitle && !matchRole && !matchAssignee) return false;
      }
      // Filtro por rol
      if (filterRole !== 'all') {
        const role = task.budgetedRoleId || task.budgetedRole;
        if (role !== filterRole) return false;
      }
      // Filtro por estado
      if (filterStatus !== 'all') {
        const canonical = normalizeTaskStatus(task.status);
        if (canonical !== filterStatus) return false;
      }
      // Filtro de bloqueadas
      if (filterBlockedOnly) {
        if (!task.isBlocked && !task.blockerInfo?.isBlocked) return false;
      }
      return true;
    });
  }, [tasks, searchTerm, filterRole, filterStatus, filterBlockedOnly]);

  // Abrir modal de creación
  const handleOpenCreateModal = (preselectedDelId?: string) => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    const defaultDelId = preselectedDelId || (selectableDeliverables[0]?.id || 'del-general');
    setFormDeliverableId(defaultDelId);

    const del = selectableDeliverables.find((d) => d.id === defaultDelId);
    const defaultRole = del?.roleBudgets?.[0]?.roleId || 'Diseñador Gráfico';
    setFormRoleId(defaultRole);

    setFormPriority('Medium');
    setFormTargetDate(project.endDate || '');
    setFormIsDeadlineStrict(false);
    setFormRequiresReview(true);
    setFormIsBlocked(false);
    setFormBlockedReason('');
    setFormIsRework(false);
    setFormReworkReason('client_feedback');

    // Default 1 asignado
    setIsMultiAssignee(false);
    const firstUser = users[0]?.id || 'u-2';
    setFormSingleUserId(firstUser);
    setFormSingleHours(4);
    setFormAllocations([
      {
        userId: firstUser,
        estimatedHours: 4
      }
    ]);

    setIsTaskModalOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormDeliverableId(task.deliverableId || selectableDeliverables[0]?.id || '');
    setFormRoleId(task.budgetedRoleId || task.budgetedRole || 'Diseñador Gráfico');
    setFormPriority(task.priority || 'Medium');
    setFormTargetDate(task.targetDate || task.dueDate || '');
    setFormIsDeadlineStrict(!!task.isDeadlineStrict);
    setFormRequiresReview(task.requiresReview !== false);
    setFormIsBlocked(!!(task.isBlocked || task.blockerInfo?.isBlocked));
    setFormBlockedReason(task.blockedReason || task.blockerInfo?.reasonText || '');
    setFormIsRework(!!task.isRework);
    setFormReworkReason(
      (task.reworkReason as 'client_feedback' | 'internal_qa' | 'brief_change') || 'client_feedback'
    );

    if (task.assigneeAllocations && task.assigneeAllocations.length > 1) {
      setIsMultiAssignee(true);
      setFormAllocations(task.assigneeAllocations);
    } else {
      setIsMultiAssignee(false);
      const singleUserId = task.assigneeAllocations?.[0]?.userId || users.find((u) => u.name === task.assignee?.name)?.id || users[0]?.id;
      const singleHours = calculateTaskEstimatedHours(task);
      setFormSingleUserId(singleUserId);
      setFormSingleHours(singleHours);
      setFormAllocations([
        {
          userId: singleUserId,
          estimatedHours: singleHours
        }
      ]);
    }

    setIsTaskModalOpen(true);
  };

  // Guardar tarea (creación o edición)
  const handleSaveTask = () => {
    if (!formTitle.trim() || !formDeliverableId || !formRoleId) return;

    // Resolver asignaciones y horas estimadas
    let resolvedAllocations: TaskAssigneeAllocation[] = [];
    if (!isMultiAssignee) {
      const u = users.find((item) => item.id === formSingleUserId);
      resolvedAllocations = [
        {
          userId: formSingleUserId,
          userName: u?.name || 'Colaborador',
          userAvatarBg: u?.avatarBg || 'bg-[#501f92]',
          userInitials: u?.initials || 'CO',
          estimatedHours: Number(formSingleHours) || 1
        }
      ];
    } else {
      resolvedAllocations = formAllocations.map((a) => {
        const u = users.find((item) => item.id === a.userId);
        return {
          ...a,
          userName: u?.name || a.userName || 'Colaborador',
          userAvatarBg: u?.avatarBg || a.userAvatarBg || 'bg-[#501f92]',
          userInitials: u?.initials || a.userInitials || 'CO',
          estimatedHours: Number(a.estimatedHours) || 0
        };
      });
    }

    const totalHours = resolvedAllocations.reduce((sum, a) => sum + a.estimatedHours, 0);
    const primaryAssigneeUser = users.find((u) => u.id === resolvedAllocations[0]?.userId) || users[0];

    const isEdit = !!editingTask;
    const nowIso = new Date().toISOString();

    const savedTask: TaskItem = {
      id: isEdit ? editingTask!.id : `tsk-${Date.now()}`,
      title: formTitle.trim(),
      description: formDescription.trim(),
      department: 'Operaciones',
      board: 'General',
      projectId: project.id,
      projectName: project.name,
      clientId: project.clientId,
      clientName: project.clientName,
      deliverableId: formDeliverableId,
      frente: selectableDeliverables.find((d) => d.id === formDeliverableId)?.name,
      budgetedRoleId: formRoleId,
      budgetedRole: formRoleId,
      priority: formPriority,
      status: isEdit ? editingTask!.status : 'To Do',
      completed: isEdit ? editingTask!.completed : false,
      date: isEdit ? editingTask!.date : nowIso.split('T')[0],
      dueDate: formTargetDate || project.endDate || nowIso.split('T')[0],
      targetDate: formTargetDate || null,
      isDeadlineStrict: formIsDeadlineStrict,
      dueStatus: 'normal',
      dueText: formTargetDate ? `Para ${formTargetDate}` : 'Ciclo mensual',
      requiresReview: formRequiresReview,
      isBlocked: formIsBlocked,
      blockedReason: formIsBlocked ? formBlockedReason : null,
      blockedAt: formIsBlocked ? (editingTask?.blockedAt || nowIso) : null,
      isRework: formIsRework,
      reworkReason: formIsRework ? formReworkReason : null,
      budgetedHours: totalHours,
      estimatedHours: totalHours,
      consumedSeconds: isEdit ? editingTask!.consumedSeconds : 0,
      assigneeAllocations: resolvedAllocations,
      assigneeIds: resolvedAllocations.map((a) => a.userId),
      assignee: {
        name: primaryAssigneeUser.name,
        initials: primaryAssigneeUser.initials,
        avatarBg: primaryAssigneeUser.avatarBg,
        role: formRoleId
      },
      collaborators: resolvedAllocations.slice(1).map((a) => {
        const u = users.find((item) => item.id === a.userId);
        return {
          name: u?.name || a.userName || 'Colaborador',
          initials: u?.initials || a.userInitials || 'CO',
          avatarBg: u?.avatarBg || a.userAvatarBg || 'bg-[#501f92]',
          role: formRoleId
        };
      })
    };

    let updatedTasksList: TaskItem[] = [];
    if (isEdit) {
      updatedTasksList = tasks.map((t) => (t.id === editingTask!.id ? savedTask : t));
    } else {
      updatedTasksList = [savedTask, ...tasks];
    }

    if (onUpdateTasks) {
      onUpdateTasks(updatedTasksList);
    }

    // Evento para Bucky
    createTaskBuckyEvent(isEdit ? 'TASK_STATUS_CHANGED' : 'TASK_CREATED', savedTask);

    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  // Cambio de estado directo (respetando si requiresReview)
  const handleQuickStatusChange = (task: TaskItem, newCanonicalStatus: TaskStatus) => {
    const isCompleted = newCanonicalStatus === 'completed' || newCanonicalStatus === 'Done';
    const nowIso = new Date().toISOString();

    const updatedTask: TaskItem = {
      ...task,
      status: newCanonicalStatus,
      completed: isCompleted,
      completedAt: isCompleted ? nowIso : undefined
    };

    const updatedList = tasks.map((t) => (t.id === task.id ? updatedTask : t));
    if (onUpdateTasks) {
      onUpdateTasks(updatedList);
    }
  };

  // Marcar / Desmarcar bloqueo rápido
  const handleConfirmQuickBlock = () => {
    if (!blockingTask) return;
    const nowBlocked = !blockingTask.isBlocked;
    const nowIso = new Date().toISOString();

    const updatedTask: TaskItem = {
      ...blockingTask,
      isBlocked: nowBlocked,
      blockedReason: nowBlocked ? quickBlockReason : null,
      blockedAt: nowBlocked ? nowIso : null,
      blockerInfo: nowBlocked
        ? {
            isBlocked: true,
            reasonText: quickBlockReason,
            blockedAt: nowIso
          }
        : undefined
    };

    const updatedList = tasks.map((t) => (t.id === blockingTask.id ? updatedTask : t));
    if (onUpdateTasks) {
      onUpdateTasks(updatedList);
    }

    createTaskBuckyEvent(nowBlocked ? 'TASK_BLOCKED' : 'TASK_UNBLOCKED', updatedTask);
    setBlockingTask(null);
    setQuickBlockReason('');
  };

  // Helper para eliminar tarea
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    if (onUpdateTasks) {
      onUpdateTasks(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. BARRA SUPERIOR DE MÉTRICAS OPERATIVAS DE TAREAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-3xl p-4 border border-[#e2e8f0] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#64748b]">Total Tareas</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-[#0f172a]">{tasks.length}</span>
            <span className="text-[10px] text-[#64748b]">unidades</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#e2e8f0] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#64748b]">Horas Estimadas</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-[#501f92]">
              {totalEstimatedHours.toFixed(1)}h
            </span>
            <span className="text-[10px] text-[#64748b]">/ {project.budgetedHours}h cot.</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#e2e8f0] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#64748b]">Horas Reales</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-[#0f172a]">
              {totalConsumedHours.toFixed(1)}h
            </span>
            <span className="text-[10px] text-[#64748b]">consumidas</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#e2e8f0] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#b45309]">En Proceso / Rev.</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-[#b45309]">
              {statusCounts.in_progress + statusCounts.in_review}
            </span>
            <span className="text-[10px] text-[#64748b]">activas</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#e2e8f0] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#15803d]">Completadas</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-[#15803d]">
              {statusCounts.completed}
            </span>
            <span className="text-[10px] text-[#64748b]">
              ({tasks.length > 0 ? Math.round((statusCounts.completed / tasks.length) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#e2e8f0] shadow-2xs">
          <div className="text-[11px] font-semibold text-[#dc2626]">Bloqueos / Ajustes</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-[#dc2626]">
              {statusCounts.blocked}
            </span>
            <span className="text-[10px] text-[#64748b]">bloq · {statusCounts.rework} rew</span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE CONTROL, VISTAS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#e2e8f0] shadow-2xs">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tarea, rol o colaborador..."
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={() => setFilterBlockedOnly(!filterBlockedOnly)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              filterBlockedOnly
                ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
                : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0] hover:bg-[#f1f5f9]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bloqueadas</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Switch de Vistas */}
          <div className="bg-[#f1f5f9] p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('deliverables')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'deliverables' ? 'bg-white text-[#501f92] shadow-2xs' : 'text-[#64748b]'
              }`}
            >
              Frentes
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-[#501f92] shadow-2xs' : 'text-[#64748b]'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-[#501f92] shadow-2xs' : 'text-[#64748b]'
              }`}
            >
              Lista
            </button>
          </div>

          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3f1675] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* 3. VISTA 1: AGRUPADA POR ENTREGABLE (MODO RECOMENDADO ORBIT) */}
      {viewMode === 'deliverables' && (
        <div className="space-y-4">
          {selectableDeliverables.map((del) => {
            const delTasks = filteredTasks.filter((t) => t.deliverableId === del.id);
            const delEstimated = delTasks.reduce((sum, t) => sum + calculateTaskEstimatedHours(t), 0);
            const delConsumed = delTasks.reduce((sum, t) => sum + getTaskConsumedHours(t), 0);
            const delQuotedTotal = del.roleBudgets?.reduce((sum, rb) => sum + rb.quotedHours, 0) || 0;
            const completedCount = delTasks.filter((t) => normalizeTaskStatus(t.status) === 'completed').length;
            const progressPercent = delTasks.length > 0 ? Math.round((completedCount / delTasks.length) * 100) : 0;
            const isExpanded = expandedDeliverables[del.id] !== false;

            return (
              <div key={del.id} className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs overflow-hidden">
                {/* Cabecera del Entregable */}
                <div
                  onClick={() =>
                    setExpandedDeliverables((prev) => ({ ...prev, [del.id]: !isExpanded }))
                  }
                  className="p-4 bg-[#f8fafc] border-b border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#f1f5f9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-[#64748b]">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#501f92]" />
                      <h3 className="font-extrabold text-sm text-[#0f172a]">{del.name}</h3>
                      <span className="text-xs text-[#64748b]">
                        ({delTasks.length} tareas · {completedCount} completadas)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-[#64748b]">
                      <span>Est: </span>
                      <span className="font-bold text-[#501f92]">{delEstimated.toFixed(1)}h</span>
                      {delQuotedTotal > 0 && (
                        <span> / Cot: {delQuotedTotal.toFixed(1)}h</span>
                      )}
                    </div>
                    <div className="text-[#0f172a]">
                      <span>Real: </span>
                      <span className="font-bold">{delConsumed.toFixed(1)}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#e2e8f0] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#10b981] rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-[#15803d]">{progressPercent}%</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCreateModal(del.id);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#501f92] hover:bg-[#ede9fe] bg-white border border-[#ddd6fe] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tarea</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Tareas dentro de este Entregable */}
                {isExpanded && (
                  <div className="divide-y divide-[#f1f5f9]">
                    {delTasks.map((task) => {
                      const canonicalStatus = normalizeTaskStatus(task.status);
                      const risk = getTaskRiskAnalysis(task);
                      const estHours = calculateTaskEstimatedHours(task);
                      const conHours = getTaskConsumedHours(task);
                      const isRunning = activeTimer?.taskId === task.id;

                      return (
                        <div
                          key={task.id}
                          onClick={() => onOpenTaskDetail?.(task)}
                          className="p-3.5 px-5 hover:bg-[#fbfcfe] transition-colors flex flex-wrap items-center justify-between gap-3 cursor-pointer group"
                        >
                          {/* Col 1: Título, Flags y Rol Presupuestado */}
                          <div className="flex items-start gap-3 min-w-[280px] flex-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus =
                                  canonicalStatus === 'completed'
                                    ? 'todo'
                                    : task.requiresReview
                                    ? 'in_review'
                                    : 'completed';
                                handleQuickStatusChange(task, nextStatus);
                              }}
                              className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-colors ${
                                canonicalStatus === 'completed'
                                  ? 'bg-[#10b981] border-[#10b981] text-white'
                                  : 'border-[#cbd5e1] hover:border-[#501f92] text-transparent'
                              }`}
                              title={
                                canonicalStatus === 'completed'
                                  ? 'Reabrir tarea'
                                  : task.requiresReview
                                  ? 'Enviar a revisión (requiresReview activo)'
                                  : 'Completar directamente'
                              }
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-xs font-bold ${
                                    canonicalStatus === 'completed'
                                      ? 'line-through text-[#94a3b8]'
                                      : 'text-[#0f172a]'
                                  }`}
                                >
                                  {task.title}
                                </span>

                                {/* Rol Cotizado de Imputación */}
                                <span className="px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#475569] text-[10px] font-bold border border-[#e2e8f0]">
                                  {task.budgetedRoleId || task.budgetedRole || 'Rol'}
                                </span>

                                {/* Flag de Bloqueo */}
                                {task.isBlocked && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#fef2f2] text-[#dc2626] text-[10px] font-bold border border-[#fecaca]">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Bloqueada</span>
                                  </span>
                                )}

                                {/* Flag de Retrabajo */}
                                {task.isRework && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#fff7ed] text-[#c2410c] text-[10px] font-bold border border-[#ffedd5]">
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Ajuste Cliente</span>
                                  </span>
                                )}
                              </div>

                              {task.blockedReason && (
                                <p className="text-[11px] text-[#dc2626]">
                                  Motivo: {task.blockedReason}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Col 2: Colaboradores */}
                          <div className="flex items-center gap-1.5 min-w-[140px]">
                            {task.assigneeAllocations && task.assigneeAllocations.length > 0 ? (
                              <div className="flex items-center -space-x-1.5">
                                {task.assigneeAllocations.map((a, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-6 h-6 rounded-full ${a.userAvatarBg || 'bg-[#501f92]'} text-white border-2 border-white flex items-center justify-center text-[9px] font-bold`}
                                    title={`${a.userName || 'Colaborador'}: ${a.estimatedHours}h estimadas`}
                                  >
                                    {a.userInitials || 'CO'}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`w-6 h-6 rounded-full ${
                                    task.assignee?.avatarBg || 'bg-[#501f92]'
                                  } text-white flex items-center justify-center text-[9px] font-bold`}
                                >
                                  {task.assignee?.initials || 'CO'}
                                </div>
                                <span className="text-[11px] text-[#475569]">{task.assignee?.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Col 3: Horas Estimadas vs. Reales */}
                          <div className="text-right font-mono min-w-[110px]">
                            <div className="text-xs font-bold text-[#0f172a]">
                              {conHours.toFixed(1)}h{' '}
                              <span className="text-[#64748b] font-normal">/ {estHours.toFixed(1)}h</span>
                            </div>
                            <span className="text-[10px] text-[#64748b]">
                              {estHours > 0 ? Math.round((conHours / estHours) * 100) : 0}% ejecutado
                            </span>
                          </div>

                          {/* Col 4: Fecha Objetivo */}
                          <div className="text-xs text-[#64748b] min-w-[90px]">
                            {task.targetDate || task.dueDate ? (
                              <span className="text-[11px] font-medium text-[#334155]">
                                {task.targetDate || task.dueDate}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#94a3b8]">Ciclo</span>
                            )}
                          </div>

                          {/* Col 5: Timer y Estado */}
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {onStartTimer && (
                              <button
                                onClick={() => {
                                  if (isRunning && onPauseResumeTimer) {
                                    onPauseResumeTimer();
                                  } else {
                                    onStartTimer(task);
                                  }
                                }}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  isRunning
                                    ? 'bg-[#10b981] text-white border-[#10b981]'
                                    : 'bg-[#f8fafc] text-[#64748b] hover:text-[#501f92] border-[#e2e8f0]'
                                }`}
                                title={isRunning ? 'Pausar temporizador' : 'Iniciar temporizador sobre esta tarea'}
                              >
                                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {/* Selector de Estado Canónico */}
                            <select
                              value={canonicalStatus}
                              onChange={(e) => handleQuickStatusChange(task, e.target.value as TaskStatus)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${getTaskStatusBadgeClass(
                                canonicalStatus
                              )}`}
                            >
                              <option value="todo">Por hacer</option>
                              <option value="in_progress">En proceso</option>
                              <option value="in_review">En revisión</option>
                              <option value="completed">Completada</option>
                            </select>

                            {/* Botón rápido de Bloqueo */}
                            <button
                              onClick={() => {
                                setBlockingTask(task);
                                setQuickBlockReason(task.blockedReason || '');
                              }}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                task.isBlocked
                                  ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
                                  : 'text-[#94a3b8] hover:text-[#dc2626] border-transparent hover:border-[#fecaca]'
                              }`}
                              title={task.isBlocked ? 'Ver/editar bloqueo' : 'Marcar tarea como bloqueada'}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(task)}
                              className="p-1.5 text-[#94a3b8] hover:text-[#501f92] rounded-lg cursor-pointer"
                              title="Editar tarea"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {delTasks.length === 0 && (
                      <div className="p-6 text-center text-xs text-[#64748b]">
                        No hay tareas creadas para este entregable. Haz clic en "+ Tarea" para agregar una.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. VISTA 2: KANBAN CANÓNICO (4 COLUMNAS) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['todo', 'in_progress', 'in_review', 'completed'] as const).map((columnKey) => {
            const colTasks = filteredTasks.filter((t) => normalizeTaskStatus(t.status) === columnKey);
            const colHours = colTasks.reduce((sum, t) => sum + calculateTaskEstimatedHours(t), 0);

            return (
              <div key={columnKey} className="bg-[#f8fafc] rounded-3xl p-3.5 border border-[#e2e8f0] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-[#0f172a]">
                      {getTaskStatusLabel(columnKey)}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#e2e8f0] text-[10px] font-bold text-[#475569]">
                      {colTasks.length}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#64748b]">{colHours.toFixed(1)}h</span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.map((task) => {
                    const est = calculateTaskEstimatedHours(task);
                    const con = getTaskConsumedHours(task);
                    return (
                      <div
                        key={task.id}
                        onClick={() => onOpenTaskDetail?.(task)}
                        className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-2xs space-y-2 cursor-pointer hover:border-[#501f92] transition-all"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-bold text-[#0f172a] line-clamp-2">{task.title}</span>
                          {task.isBlocked && <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626] shrink-0" />}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#64748b]">
                          <span className="px-1.5 py-0.5 rounded bg-[#f1f5f9] font-semibold text-[#475569]">
                            {task.budgetedRoleId || task.budgetedRole || 'Rol'}
                          </span>
                          <span className="font-mono font-bold text-[#0f172a]">
                            {con.toFixed(1)}h / {est.toFixed(1)}h
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9] text-[10px]">
                          <div className="flex items-center gap-1">
                            <div className={`w-4 h-4 rounded-full ${task.assignee?.avatarBg || 'bg-[#501f92]'} text-white flex items-center justify-center text-[7px] font-bold`}>
                              {task.assignee?.initials || 'CO'}
                            </div>
                            <span className="text-[#64748b] truncate max-w-[80px]">{task.assignee?.name}</span>
                          </div>

                          <span className="text-[#94a3b8]">{task.targetDate || 'Ciclo'}</span>
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div className="py-6 text-center text-[11px] text-[#94a3b8] italic">Sin tareas</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. VISTA 3: LISTA TABULAR PLANA */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                  <th className="py-3 px-5">TAREA</th>
                  <th className="py-3 px-4">ENTREGABLE</th>
                  <th className="py-3 px-4">ROL COTIZADO</th>
                  <th className="py-3 px-4">COLABORADORES</th>
                  <th className="py-3 px-4 text-right">HORAS (REAL / EST)</th>
                  <th className="py-3 px-4 text-center">ESTADO</th>
                  <th className="py-3 px-5 text-right pr-6">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredTasks.map((task) => {
                  const canonical = normalizeTaskStatus(task.status);
                  const est = calculateTaskEstimatedHours(task);
                  const con = getTaskConsumedHours(task);
                  return (
                    <tr key={task.id} className="hover:bg-[#fbfcfe] transition-colors cursor-pointer" onClick={() => onOpenTaskDetail?.(task)}>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#0f172a] text-xs flex items-center gap-1.5">
                          {task.title}
                          {task.isBlocked && <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#64748b]">
                        {selectableDeliverables.find((d) => d.id === task.deliverableId)?.name || 'General'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#501f92]">
                        {task.budgetedRoleId || task.budgetedRole}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <div className={`w-5 h-5 rounded-full ${task.assignee?.avatarBg || 'bg-[#501f92]'} text-white flex items-center justify-center text-[8px] font-bold`}>
                            {task.assignee?.initials || 'CO'}
                          </div>
                          <span className="text-xs text-[#334155]">{task.assignee?.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        {con.toFixed(1)}h <span className="text-[#64748b] font-normal">/ {est.toFixed(1)}h</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTaskStatusBadgeClass(canonical)}`}>
                          {getTaskStatusLabel(canonical)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          className="p-1 hover:bg-[#f1f5f9] text-[#64748b] rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL: CREAR O EDITAR TAREA CON VALIDACIÓN DE ROL Y MÚLTIPLES COLABORADORES */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#0f172a]">
                  {editingTask ? 'Editar Tarea' : 'Nueva Tarea Operativa'}
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Unidad atómica de ejecución. Descuenta horas del rol cotizado del entregable.
                </p>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Título de la Tarea */}
              <div>
                <label className="block font-bold text-[#334155] mb-1">
                  ¿Qué hay que hacer? (Título) <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="ej. Diseñar 6 carruseles de producto para campaña de Navidad"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] font-medium focus:outline-none focus:border-[#501f92]"
                />
              </div>

              {/* Entregable y Rol Cotizado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Entregable / Frente <span className="text-[#ef4444]">*</span>
                  </label>
                  <select
                    value={formDeliverableId}
                    onChange={(e) => setFormDeliverableId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                  >
                    {selectableDeliverables.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Rol Cotizado (Consume Horas) <span className="text-[#ef4444]">*</span>
                  </label>
                  <select
                    value={formRoleId}
                    onChange={(e) => setFormRoleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a] focus:outline-none focus:border-[#501f92]"
                  >
                    {availableRolesForDeliverable.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.quotedHours}h cotizadas)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Decisión 2: Advertencia visible informativa si supera las horas cotizadas del rol (NUNCA bloqueo) */}
              {roleBudgetWarning && roleBudgetWarning.hasWarning && (
                <div className="p-3 rounded-2xl bg-[#fffbeb] border border-[#fde68a] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#b45309]">
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0" />
                    <span>Aviso de Presupuesto de Rol</span>
                  </div>
                  <p className="text-[11px] text-[#92400e] leading-relaxed">
                    {roleBudgetWarning.warningMessage}
                  </p>
                </div>
              )}

              {/* Decisión 3: Asignación de colaboradores (Simple vs Multi) */}
              <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#334155]">Colaborador(es) y Estimación</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isMultiAssignee) {
                        setIsMultiAssignee(true);
                        if (formAllocations.length === 0) {
                          setFormAllocations([{ userId: formSingleUserId, estimatedHours: formSingleHours }]);
                        }
                      } else {
                        setIsMultiAssignee(false);
                      }
                    }}
                    className="text-[11px] font-bold text-[#501f92] hover:underline cursor-pointer"
                  >
                    {isMultiAssignee ? 'Cambiar a 1 solo asignado' : '+ Asignar múltiples personas'}
                  </button>
                </div>

                {!isMultiAssignee ? (
                  // Caso 1: Un solo colaborador (UX simple y limpia)
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
                    <div className="sm:col-span-2">
                      <select
                        value={formSingleUserId}
                        onChange={(e) => setFormSingleUserId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#cbd5e1] text-[#0f172a]"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.jobTitle || u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0.25"
                          max="80"
                          step="0.25"
                          value={formSingleHours}
                          onChange={(e) => setFormSingleHours(Number(e.target.value))}
                          className="w-20 px-2.5 py-2 rounded-xl bg-white border border-[#cbd5e1] text-[#0f172a] font-mono font-bold"
                        />
                        <span className="text-[#64748b] text-[11px]">horas</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Caso 2: Múltiples colaboradores con assigneeAllocations
                  <div className="space-y-2">
                    {formAllocations.map((alloc, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={alloc.userId}
                          onChange={(e) => {
                            const updated = [...formAllocations];
                            updated[idx].userId = e.target.value;
                            setFormAllocations(updated);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#cbd5e1] text-[#0f172a]"
                        >
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="0.25"
                          step="0.25"
                          value={alloc.estimatedHours}
                          onChange={(e) => {
                            const updated = [...formAllocations];
                            updated[idx].estimatedHours = Number(e.target.value);
                            setFormAllocations(updated);
                          }}
                          className="w-20 px-2 py-1.5 rounded-xl bg-white border border-[#cbd5e1] font-mono font-bold text-xs"
                        />
                        <span className="text-[11px] text-[#64748b]">h</span>
                        {formAllocations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormAllocations(formAllocations.filter((_, i) => i !== idx))}
                            className="p-1 text-[#94a3b8] hover:text-[#dc2626]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setFormAllocations([
                            ...formAllocations,
                            { userId: users[0].id, estimatedHours: 2 }
                          ])
                        }
                        className="text-[11px] font-bold text-[#501f92] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Añadir otro colaborador
                      </button>
                      <span className="font-mono font-bold text-xs text-[#0f172a]">
                        Total estimado: {currentFormTotalHours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fecha objetivo (opcional) & Prioridad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Fecha Objetivo (Opcional)
                  </label>
                  <input
                    type="date"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#334155] mb-1">Prioridad</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a]"
                  >
                    <option value="Low">Baja</option>
                    <option value="Medium">Media</option>
                    <option value="High">Alta</option>
                  </select>
                </div>
              </div>

              {/* Decisión 1: requiresReview Checkbox */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <input
                  type="checkbox"
                  id="reqReview"
                  checked={formRequiresReview}
                  onChange={(e) => setFormRequiresReview(e.target.checked)}
                  className="w-4 h-4 text-[#501f92] rounded accent-[#501f92]"
                />
                <label htmlFor="reqReview" className="cursor-pointer font-bold text-[#334155]">
                  Requiere validación / revisión antes de completarse
                </label>
                <span className="text-[11px] text-[#64748b]">
                  (Si se desmarca, el colaborador puede completarla directamente)
                </span>
              </div>

              {/* Decisión 5: Flag de Bloqueo y Retrabajo */}
              <div className="space-y-2 pt-1 border-t border-[#f1f5f9]">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#334155]">
                    <input
                      type="checkbox"
                      checked={formIsBlocked}
                      onChange={(e) => setFormIsBlocked(e.target.checked)}
                      className="w-4 h-4 text-[#dc2626] rounded accent-[#dc2626]"
                    />
                    <span>Tarea Bloqueada (Flag)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#334155]">
                    <input
                      type="checkbox"
                      checked={formIsRework}
                      onChange={(e) => setFormIsRework(e.target.checked)}
                      className="w-4 h-4 text-[#c2410c] rounded accent-[#c2410c]"
                    />
                    <span>Ajuste / Retrabajo de Cliente</span>
                  </label>
                </div>

                {formIsBlocked && (
                  <input
                    type="text"
                    value={formBlockedReason}
                    onChange={(e) => setFormBlockedReason(e.target.value)}
                    placeholder="Motivo del bloqueo (ej. esperando insumos o accesos del cliente)"
                    className="w-full px-3.5 py-1.5 rounded-xl bg-[#fff5f5] border border-[#fecaca] text-[#dc2626]"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTask}
                disabled={!formTitle.trim() || !formDeliverableId || !formRoleId}
                className="px-4 py-2 text-xs font-bold text-white bg-[#501f92] hover:bg-[#3f1675] disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
              >
                {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL RÁPIDO PARA BLOQUEAR / DESBLOQUEAR TAREA */}
      {blockingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-[#e2e8f0] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
                <h3 className="font-extrabold text-sm text-[#0f172a]">
                  {blockingTask.isBlocked ? 'Resolver Bloqueo de Tarea' : 'Bloquear Tarea'}
                </h3>
              </div>
              <button onClick={() => setBlockingTask(null)} className="p-1 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748b]">
              {blockingTask.isBlocked
                ? '¿Deseas desmarcar el bloqueo de esta tarea para reactivar su flujo de trabajo?'
                : 'Indica el motivo por el cual la tarea está detenida (espera de insumos, feedback de cliente o dependencia técnica):'}
            </p>

            {!blockingTask.isBlocked && (
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Motivo del Bloqueo</label>
                <input
                  type="text"
                  value={quickBlockReason}
                  onChange={(e) => setQuickBlockReason(e.target.value)}
                  placeholder="ej. El cliente no ha compartido credenciales de la pasarela"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#0f172a]"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <button onClick={() => setBlockingTask(null)} className="px-3.5 py-1.5 text-xs font-bold text-[#64748b]">
                Cancelar
              </button>
              <button
                onClick={handleConfirmQuickBlock}
                className={`px-4 py-1.5 text-xs font-bold text-white rounded-xl ${
                  blockingTask.isBlocked ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-[#dc2626] hover:bg-[#b91c1c]'
                }`}
              >
                {blockingTask.isBlocked ? 'Desbloquear Tarea' : 'Confirmar Bloqueo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
