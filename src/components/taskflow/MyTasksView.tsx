import React, { useState, useMemo } from 'react';
import { formatDate, formatDateRange } from '../../utils/formatters';
import { PageHeader } from './PageHeader';
import { TaskItem, ActiveTimerState, TaskStatus, TaskPriority, UserItem, ProjectSummaryItem } from './types';
import { getUserAccessLevel } from './auth/permissions';
import { makePersonMatcher, getTaskRelation, isProjectResponsible, makeTaskProjectResolver, makeTaskComparator } from './auth/taskVisibility';
import { UserAvatar } from './UserAvatar';
import {
  Button,
  Badge,
  TaskStatusBadge,
  Input,
  Tooltip
} from '../ui';
import {
  Circle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Calendar,
  Plus,
  Play,
  Pause,
  Square,
  Link2,
  ChevronRight,
  ShieldAlert,
  Building2,
  AlertTriangle,
  Users,
  User,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Bell
} from 'lucide-react';

interface MyTasksViewProps {
  tasks: TaskItem[];
  currentUserName?: string;
  currentUser?: UserItem;
  users?: UserItem[];
  projects?: ProjectSummaryItem[];
  onToggleTask: (taskId: string) => void;
  onOpenNewTaskModal?: () => void;
  activeTimer?: ActiveTimerState | null;
  onStartTimer?: (task: TaskItem) => void;
  onPauseResumeTimer?: () => void;
  onStopTimer?: () => void;
  onOpenTaskDetail?: (task: TaskItem) => void;
  onOpenManualLogModal?: (taskId?: string) => void;
  onUpdateTaskBudgetHours?: (taskId: string, newHours: number) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  currentUserName,
  currentUser,
  users = [],
  projects = [],
  onToggleTask,
  onOpenNewTaskModal,
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onStopTimer,
  onOpenTaskDetail,
  onOpenManualLogModal,
  onUpdateTaskBudgetHours,
  onUpdateTaskStatus
}) => {
  // Mode: "Mis Tareas" (focus personal) vs "Equipo" (lead overview)
  // «Siguiendo»: tareas donde soy seguidor (informativas). «Equipo»: solo para quien
  // responde por proyectos (sus proyectos) y Dirección / admin (todo). El colaborador no lo ve.
  const [viewMode, setViewMode] = useState<'my' | 'following' | 'team'>('my');
  const identity = useMemo(
    () => currentUser || (currentUserName ? users.find((u) => u.name === currentUserName) || ({ id: '', name: currentUserName } as UserItem) : undefined),
    [currentUser, currentUserName, users]
  );
  const accessLevel = currentUser ? getUserAccessLevel(currentUser) : 'collaborator';
  const isGlobalViewer = accessLevel === 'executive' || accessLevel === 'system_admin';
  const matchesMe = useMemo(() => makePersonMatcher(identity, users), [identity, users]);
  const projectOfTask = useMemo(() => makeTaskProjectResolver(projects), [projects]);
  const myProjectIds = useMemo(
    () => new Set(projects.filter((p) => isProjectResponsible(p, identity, matchesMe)).map((p) => p.id)),
    [projects, identity, matchesMe]
  );
  const canSeeTeam = accessLevel !== 'collaborator' && (isGlobalViewer || myProjectIds.size > 0);
  const inTeamScope = (t: TaskItem) => {
    if (isGlobalViewer) return true;
    const p = projectOfTask(t);
    return Boolean(p && myProjectIds.has(p.id));
  };
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'review' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'client' | 'internal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Extract unique project and team lists
  const availableProjects = Array.from(
    new Set(tasks.map((t) => t.projectName || t.board).filter(Boolean))
  );
  const availableAssignees = Array.from(
    new Set(tasks.filter((t) => canSeeTeam && inTeamScope(t)).map((t) => t.assignee?.name).filter(Boolean))
  );

  const filteredTasks = useMemo(() => {
    const list = tasks.filter((t) => {
      // Hide archived tasks
      if (t.isArchived) return false;

      const isCompleted = t.completed || t.status === 'Done';

      // Auto-hide rule: If completed and older than 7 days, hide from general/active list (viewable in 'completed' filter)
      if (isCompleted && filterTab !== 'completed') {
        const referenceDateStr = t.completedAt || t.dueDate || t.date;
        if (referenceDateStr) {
          const parsed = new Date(referenceDateStr).getTime();
          if (!isNaN(parsed)) {
            const daysDiff = (Date.now() - parsed) / (1000 * 60 * 60 * 24);
            if (daysDiff > 7) {
              return false; // Auto-archived from regular view after 7 days
            }
          }
        }
      }

      // Mis tareas (responsable o revisor) / Siguiendo (seguidor) / Equipo (proyectos a cargo)
      const relation = getTaskRelation(t, identity, matchesMe);
      if (viewMode === 'my') {
        if (relation !== 'owner' && relation !== 'reviewer') return false;
      } else if (viewMode === 'following') {
        if (relation !== 'follower') return false;
      } else {
        if (!canSeeTeam || !inTeamScope(t)) return false;
        if (selectedAssignee !== 'all' && t.assignee?.name !== selectedAssignee) return false;
      }

      // Status Tab filter
      if (filterTab === 'active' && isCompleted) return false;
      if (filterTab === 'review' && t.status !== 'Review') return false;
      if (filterTab === 'completed' && !isCompleted) return false;

      // Category Filter (Client vs Internal)
      if (categoryFilter === 'client' && t.categoryType === 'internal') return false;
      if (categoryFilter === 'internal' && t.categoryType !== 'internal') return false;

      // Client filter
      if (selectedClient !== 'all' && t.clientName !== selectedClient) return false;

      // Project filter
      if (selectedProject !== 'all' && t.projectName !== selectedProject && t.board !== selectedProject) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.clientName && t.clientName.toLowerCase().includes(q)) ||
          (t.projectName && t.projectName.toLowerCase().includes(q)) ||
          t.board.toLowerCase().includes(q) ||
          (viewMode === 'team' && t.assignee.name.toLowerCase().includes(q))
        );
      }

      return true;
    });

    // Orden por defecto: vencidas → urgentes con fecha hoy/mañana → fecha más cercana → prioridad.
    // La urgencia viene marcada en la tarea; ECO no la infiere.
    const byDate = makeTaskComparator();
    return sortDirection === 'asc' ? list.sort(byDate) : list.sort((a, b) => (Boolean(a.completed) !== Boolean(b.completed) ? (a.completed ? 1 : -1) : -byDate(a, b)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, viewMode, filterTab, categoryFilter, selectedClient, selectedProject, selectedAssignee, searchQuery, sortDirection, identity, matchesMe, myProjectIds, canSeeTeam]);

  // Mensaje vacío según el contexto, con la acción que tiene sentido
  const hasActiveFilters = filterTab !== 'all' || categoryFilter !== 'all' || selectedClient !== 'all' || selectedProject !== 'all' || selectedAssignee !== 'all' || searchQuery.trim() !== '';
  const clearFilters = () => {
    setFilterTab('all');
    setCategoryFilter('all');
    setSelectedClient('all');
    setSelectedProject('all');
    setSelectedAssignee('all');
    setSearchQuery('');
  };
  const renderEmpty = () => (
    <div className="space-y-2 text-center">
      <p className="text-sm font-semibold text-[#0f172a]">
        {hasActiveFilters
          ? 'Ninguna tarea coincide con los filtros'
          : viewMode === 'following'
          ? 'No estás siguiendo tareas'
          : viewMode === 'team'
          ? 'Tu equipo no tiene tareas abiertas'
          : 'No tienes tareas asignadas'}
      </p>
      <p className="text-xs text-[#64748b]">
        {hasActiveFilters
          ? 'Prueba quitando algún filtro.'
          : viewMode === 'following'
          ? 'Cuando te agreguen como seguidor de una tarea, aparecerá aquí.'
          : 'Cuando te asignen una tarea o crees una, aparecerá aquí ordenada por fecha.'}
      </p>
      {hasActiveFilters ? (
        <button type="button" onClick={clearFilters} className="mt-1 px-3.5 py-1.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer">
          Quitar filtros
        </button>
      ) : viewMode === 'my' && onOpenNewTaskModal ? (
        <button type="button" onClick={onOpenNewTaskModal} className="mt-1 px-3.5 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold cursor-pointer">
          Nueva tarea
        </button>
      ) : null}
    </div>
  );

  const getStatusBadge = (status: TaskStatus, completed: boolean) => {
    if (completed || status === 'Done') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
          <Check className="w-3 h-3" />
          Completada
        </span>
      );
    }
    if (status === 'Review') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/30">
          En revisión
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#fffbeb] text-[#92400e] border border-[#fde68a]">
          En proceso
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
        Por hacer
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader title="Tareas" description="Tus tareas por fecha y prioridad, las que sigues y, si lideras, las de tu equipo." />
      {/* Barra de Control Unificada: Modo, Acciones y Filtros en una sola tarjeta cohesiva */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3">
        {/* Fila 1: Selector de Modo (Mis Tareas vs Equipo) + Botón Nueva Tarea */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setViewMode('my')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'my'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Mis tareas</span>
            </button>
            <button
              onClick={() => setViewMode('following')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'following'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Bell className="w-3.5 h-3.5 shrink-0" />
              <span>Siguiendo</span>
            </button>
            {canSeeTeam && (
            <button
                onClick={() => setViewMode('team')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'team'
                    ? 'bg-white text-[#0f172a] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Equipo</span>
              </button>
            )}
          </div>

          {onOpenNewTaskModal && (
            <button
              onClick={onOpenNewTaskModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Nueva tarea</span>
            </button>
          )}
        </div>

        {/* Fila 2: Búsqueda Ancho Completo */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              viewMode !== 'team'
                ? 'Buscar en mis tareas, cliente o proyecto...'
                : 'Buscar por tarea, cliente, proyecto o responsable...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] pl-10 pr-4 py-2 rounded-xl text-xs text-[#0f172a] placeholder:text-[#7C8AA0] focus:outline-none focus:border-[#501f92] focus:bg-white transition-all"
          />
        </div>

        {/* Fila 3: Tabs de Estado + Selectores de Proyecto y Asignado */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'all' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'active' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Activas
            </button>
            <button
              onClick={() => setFilterTab('review')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'review' ? 'bg-white text-[#501f92] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              En revisión
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'completed' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Completadas
            </button>
          </div>

          {/* Right Selectors: Project Filter & Assignee */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Project Selector */}
            <div className="relative flex items-center min-w-0">
              <Filter className="w-3.5 h-3.5 text-[#501f92] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] pl-8.5 pr-8 py-1.5 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#501f92] cursor-pointer max-w-[200px] sm:max-w-xs transition-colors"
              >
                <option value="all">Todos los proyectos</option>
                {availableProjects.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Selector in Team Mode */}
            {viewMode === 'team' && (
              <div className="relative flex items-center min-w-0">
                <User className="w-3.5 h-3.5 text-[#501f92] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] pl-8.5 pr-8 py-1.5 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#501f92] cursor-pointer max-w-[170px] sm:max-w-xs transition-colors"
                >
                  <option value="all">Todo el equipo</option>
                  {availableAssignees.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Task Cards (Mobile View - md:hidden) */}
      <div className="block md:hidden space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#e2e8f0]">{renderEmpty()}</div>
        ) : (
          filteredTasks.map((task) => {
            const isRunning = activeTimer?.taskId === task.id;
            const consumedHours = (task.consumedSeconds || 0) / 3600;
            const budgetedHours = task.budgetedHours || 1;
            const percent = Math.round((consumedHours / budgetedHours) * 100);

            const isOverdue =
              !task.completed &&
              task.dueDate &&
              new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

            return (
              <div
                key={`mobile-${task.id}`}
                onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs active:scale-[0.99] ${
                  isRunning
                    ? 'border-[#8a4dff] ring-1 ring-[#8a4dff]/30 bg-[#faf5ff]/40'
                    : task.completed
                    ? 'border-[#e2e8f0] bg-[#f8fafc]/60 opacity-80'
                    : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
                }`}
              >
                {/* Top Context Breadcrumb & Badges */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748b] truncate">
                    <span className="text-[#501f92] font-bold truncate">
                      {task.clientName || 'ECO'}
                    </span>
                    <span>›</span>
                    <span className="truncate">{task.projectName || task.board}</span>
                  </div>

                  {/* Priority / Category badge */}
                  <div className="flex items-center gap-1 shrink-0">
                    {task.priority === 'High' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-lg bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                        Alta
                      </span>
                    )}
                    {task.categoryType === 'internal' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-lg bg-[#f1f5f9] text-[#64748b]">
                        Interno
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="flex items-start gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4
                        className={`text-xs font-bold leading-snug ${
                          task.completed
                            ? 'line-through text-[#94a3b8]'
                            : 'text-[#0f172a]'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {isRunning && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/30">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              activeTimer?.isPaused ? 'bg-[#f59e0b]' : 'bg-[#501f92] animate-pulse'
                            }`}
                          />
                          En curso
                        </span>
                      )}
                    </div>

                    {/* Due Date & Assignee */}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#64748b]">
                      {task.dueDate && (
                        <div
                          className={`flex items-center gap-1 font-medium ${
                            isOverdue
                              ? 'text-[#dc2626] font-bold'
                              : task.completed
                              ? 'text-[#94a3b8]'
                              : 'text-[#64748b]'
                          }`}
                        >
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{formatDate(task.dueDate)}</span>
                          {isOverdue && (
                            <span className="text-[9px] uppercase bg-[#fee2e2] text-[#dc2626] px-1 rounded font-bold">
                              Vencida
                            </span>
                          )}
                        </div>
                      )}

                      {viewMode === 'team' && task.assignee && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#475569]">
                          <UserAvatar
                            user={task.assignee}
                            size="custom"
                            className="w-4 h-4 rounded-full text-[7px]"
                          />
                          <span className="truncate">{task.assignee.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip (Timer, Hours, Status) */}
                <div className="pt-2 mt-2 border-t border-[#f1f5f9] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TaskStatusBadge
                      status={task.status}
                      completed={task.completed}
                      size="xs"
                    />

                    <span className={`font-mono text-xs font-bold ${consumedHours > budgetedHours ? 'text-[#ef4444]' : 'text-[#0f172a]'}`}>
                      {consumedHours.toFixed(1)}h / {budgetedHours}h
                    </span>
                  </div>

                  {/* Actions (Timer & Manual Log) */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Quick Manual Log */}
                    {onOpenManualLogModal && (
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => onOpenManualLogModal(task.id)}
                        icon={<Clock className="w-3 h-3 text-[#64748b]" />}
                        className="py-1 px-2 text-[10px]"
                      >
                        Cargar
                      </Button>
                    )}

                    {/* Timer Play / Pause / Stop (icon-only on active) */}
                    {isRunning ? (
                      <div className="flex items-center gap-1">
                        {onPauseResumeTimer && (
                          <button
                            type="button"
                            onClick={onPauseResumeTimer}
                            title={activeTimer?.isPaused ? 'Reanudar' : 'Pausar'}
                            aria-label={activeTimer?.isPaused ? 'Reanudar' : 'Pausar'}
                            className={`p-1.5 rounded-lg text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer ${
                              activeTimer?.isPaused
                                ? 'bg-[#10b981] hover:bg-[#059669]'
                                : 'bg-[#f59e0b] hover:bg-[#d97706]'
                            }`}
                          >
                            {activeTimer?.isPaused ? (
                              <Play className="w-3 h-3 fill-current" />
                            ) : (
                              <Pause className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={onStopTimer}
                          title="Detener y registrar"
                          aria-label="Detener y registrar"
                          className="p-1.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                        >
                          <Square className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => onStartTimer && onStartTimer(task)}
                        icon={<Play className="w-2.5 h-2.5 fill-current text-white" />}
                        className="py-1 px-2.5 text-[10px]"
                      >
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task List Table (Desktop View - hidden md:block) */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-[10px] font-bold text-[#64748b] uppercase tracking-wider bg-white">
                <th className="py-2.5 px-4 font-semibold">TAREA</th>
                <th
                  onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#501f92] transition-colors select-none group w-28"
                  title="Clic para ordenar por fecha de vencimiento"
                >
                  <div className="flex items-center gap-1">
                    <span>VENCE</span>
                    {sortDirection === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-[#501f92]" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-[#501f92]" />
                    )}
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold text-center w-16">TIMER</th>
                <th className="py-2.5 px-3 font-semibold w-32">HORAS</th>
                {viewMode === 'team' && (
                  <th className="py-2.5 px-3 font-semibold w-36">RESPONSABLE</th>
                )}
                <th className="py-2.5 px-4 font-semibold text-right pr-5 w-28">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={viewMode === 'team' ? 6 : 5}
                    className="py-12"
                  >
                    {renderEmpty()}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isRunning = activeTimer?.taskId === task.id;
                  const consumedHours = (task.consumedSeconds || 0) / 3600;
                  const budgetedHours = task.budgetedHours || 1;
                  const isInternal = task.categoryType === 'internal';

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                      className={`hover:bg-[#f8fafc] transition-colors group cursor-pointer ${
                        task.completed ? 'bg-[#f8fafc]/50 text-[#94a3b8]' : 'text-[#0f172a]'
                      } ${isRunning ? 'bg-[#faf5ff]/50' : ''}`}
                    >
                      {/* 1. TAREA + BREADCRUMB */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="min-w-0 flex-1">
                            {/* Breadcrumb: Cliente → Proyecto */}
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#64748b]">
                              {isInternal ? (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#f2ecfb] text-[#501f92] font-semibold text-[9px]">
                                  Interno
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#eff6ff] text-[#2563eb] font-semibold text-[9px]">
                                  {task.clientName || 'Cliente'}
                                </span>
                              )}
                              <span className="text-[#cbd5e1]">›</span>
                              <span className="text-[#475569] font-medium truncate max-w-[140px]">
                                {task.projectName || task.board}
                              </span>

                              {/* Priority High Exception */}
                              {task.priority === 'High' && (
                                <span className="text-[9px] font-bold px-1 rounded bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]">
                                  Alta
                                </span>
                              )}

                              {/* Blocker alert */}
                              {task.blockerInfo?.isBlocked && (
                                <Tooltip content={`Bloqueo: ${task.blockerInfo.reasonText || 'Insumos pendientes'}`}>
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 rounded bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    Bloqueada
                                  </span>
                                </Tooltip>
                              )}
                            </div>

                            {/* Task Title */}
                            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                              <span
                                className={`font-semibold text-xs block group-hover:text-[#501f92] transition-colors truncate ${
                                  task.completed ? 'line-through text-[#94a3b8]' : 'text-[#0f172a]'
                                }`}
                              >
                                {task.title}
                              </span>
                              {isRunning && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/30 shrink-0">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      activeTimer?.isPaused ? 'bg-[#f59e0b]' : 'bg-[#501f92] animate-pulse'
                                    }`}
                                  />
                                  En curso
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. VENCE (DEADLINE) */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className={`w-3 h-3 shrink-0 ${
                            task.dueStatus === 'overdue'
                              ? 'text-[#ef4444]'
                              : task.dueStatus === 'soon' || task.dueStatus === 'tomorrow'
                              ? 'text-[#f59e0b]'
                              : 'text-[#94a3b8]'
                          }`} />
                          <span className={`text-[11px] truncate ${
                            task.dueStatus === 'overdue'
                              ? 'text-[#ef4444] font-bold'
                              : task.dueStatus === 'soon' || task.dueStatus === 'tomorrow'
                              ? 'text-[#d97706] font-semibold'
                              : 'text-[#334155] font-medium'
                          }`}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </td>

                      {/* 3. UNIVERSAL PLAY / PAUSE / STOP BUTTONS (icon-only on active) */}
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {isRunning ? (
                          <div className="inline-flex items-center justify-center gap-1">
                            {onPauseResumeTimer && (
                              <button
                                type="button"
                                onClick={onPauseResumeTimer}
                                title={activeTimer?.isPaused ? 'Reanudar' : 'Pausar'}
                                aria-label={activeTimer?.isPaused ? 'Reanudar' : 'Pausar'}
                                className={`p-1 h-6 w-6 rounded-lg text-white flex items-center justify-center transition-colors cursor-pointer ${
                                  activeTimer?.isPaused
                                    ? 'bg-[#10b981] hover:bg-[#059669]'
                                    : 'bg-[#f59e0b] hover:bg-[#d97706]'
                                }`}
                              >
                                {activeTimer?.isPaused ? (
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                ) : (
                                  <Pause className="w-2.5 h-2.5" />
                                )}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={onStopTimer}
                              title="Detener y registrar"
                              aria-label="Detener y registrar"
                              className="p-1 h-6 w-6 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Square className="w-2.5 h-2.5 fill-current" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => onStartTimer && onStartTimer(task)}
                            icon={<Play className="w-2.5 h-2.5 fill-current text-[#64748b]" />}
                            className="p-1 h-6 w-6 border border-[#e2e8f0]"
                          />
                        )}
                      </td>

                      {/* 5. HORAS (CONSUMIDAS / ASIGNADAS) */}
                      <td className="py-2.5 px-3 font-mono text-xs font-bold">
                        <span className={consumedHours > budgetedHours ? 'text-[#ef4444]' : 'text-[#0f172a]'}>
                          {consumedHours.toFixed(1)}h
                        </span>
                        <span className="text-[10px] text-[#64748b] font-normal"> / {budgetedHours}h</span>
                      </td>

                      {/* 6. RESPONSABLE (ONLY IN TEAM MODE) */}
                      {viewMode === 'team' && (
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <UserAvatar
                              user={task.assignee}
                              size="custom"
                              className="w-4 h-4 rounded-full text-[7px]"
                            />
                            <span className="text-xs font-medium text-[#334155] truncate">
                              {task.assignee.name}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* 7. ESTADO */}
                      <td className="py-2.5 px-4 text-right pr-5">
                        <TaskStatusBadge
                          status={task.status}
                          completed={task.completed}
                          size="xs"
                        />
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
  );
};
