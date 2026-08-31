import React, { useState, useMemo } from 'react';
import { TaskItem, ActiveTimerState, TaskStatus, TaskPriority } from './types';
import {
  Button,
  Badge,
  TaskStatusBadge,
  RoleChip,
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
  ArrowDown
} from 'lucide-react';

interface MyTasksViewProps {
  tasks: TaskItem[];
  currentUserName?: string;
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
  currentUserName = 'Catalina Tejada',
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
  const [viewMode, setViewMode] = useState<'my' | 'team'>('my');
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
    new Set(tasks.map((t) => t.assignee?.name).filter(Boolean))
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

      // Mis Tareas vs Equipo
      if (viewMode === 'my') {
        // In My Tasks, match current user (or if assignee matches or user is collaborator)
        const isMine =
          t.assignee?.name?.toLowerCase().includes('catalina') ||
          t.assignee?.name?.toLowerCase().includes('yo') ||
          (t.collaborators && t.collaborators.some((c) => c.name.toLowerCase().includes('catalina')));
        if (!isMine) return false;
      } else {
        // In Team view, filter by selected assignee if chosen
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

    // Automatic default sorting by due date (nearest first), leaving overdue and today on top
    return list.sort((a, b) => {
      const aDone = a.completed || a.status === 'Done';
      const bDone = b.completed || b.status === 'Done';
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;

      const getTimestamp = (t: TaskItem) => {
        if (!t.dueDate) return 9999999999999;
        const d = new Date(t.dueDate).getTime();
        return isNaN(d) ? 9999999999999 : d;
      };

      const timeA = getTimestamp(a);
      const timeB = getTimestamp(b);

      if (timeA !== timeB) {
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      const prioWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      const weightA = prioWeight[a.priority] || 2;
      const weightB = prioWeight[b.priority] || 2;
      return weightB - weightA;
    });
  }, [tasks, viewMode, filterTab, categoryFilter, selectedClient, selectedProject, selectedAssignee, searchQuery, sortDirection]);

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
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Controls: Mode Toggle & Action Buttons in a Clean Single Line */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#e2e8f0] shadow-xs flex items-center justify-between gap-3">
        {/* Left: View Mode Toggle (Mis Tareas vs Equipo) */}
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
            <span>Mis Tareas</span>
          </button>
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
        </div>

        {/* Right: Primary CTA */}
        {onOpenNewTaskModal && (
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Nueva Tarea</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar - Search full width, chips and dropdowns on the second line */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-2.5">
        {/* Search - Full Width */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              viewMode === 'my'
                ? 'Buscar en mis tareas, cliente o proyecto...'
                : 'Buscar por tarea, cliente, proyecto o responsable...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] pl-10 pr-4 py-2 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#501f92] focus:bg-white transition-all"
          />
        </div>

        {/* Second Line: Status Tabs + Selectors */}
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
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-[#94a3b8] border border-[#e2e8f0]">
            No se encontraron tareas con los filtros seleccionados.
          </div>
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
                      {task.clientName || 'Orbit'}
                    </span>
                    <span>›</span>
                    <span className="truncate">{task.projectName || task.board}</span>
                  </div>

                  {/* Priority / Category badge */}
                  <div className="flex items-center gap-1 shrink-0">
                    {task.priority === 'High' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                        Alta
                      </span>
                    )}
                    {task.categoryType === 'internal' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-[#f1f5f9] text-[#64748b]">
                        Interno
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Checkbox */}
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className="mt-0.5 text-[#94a3b8] hover:text-[#501f92] transition-colors cursor-pointer shrink-0"
                    aria-label={task.completed ? 'Marcar incompleta' : 'Marcar completada'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#cbd5e1] hover:border-[#501f92]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-xs font-bold leading-snug ${
                        task.completed
                          ? 'line-through text-[#94a3b8]'
                          : 'text-[#0f172a]'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {/* Due Date & Assignee & Role */}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#64748b]">
                      {task.budgetedRole && (
                        <RoleChip role={task.budgetedRole} size="xs" />
                      )}

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
                          <span>{task.dueDate}</span>
                          {isOverdue && (
                            <span className="text-[9px] uppercase bg-[#fee2e2] text-[#dc2626] px-1 rounded font-bold">
                              Vencida
                            </span>
                          )}
                        </div>
                      )}

                      {viewMode === 'team' && task.assignee && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-[#475569]">
                          <div
                            className={`w-4 h-4 rounded-full ${task.assignee.avatarBg} text-white flex items-center justify-center text-[7px] font-bold`}
                          >
                            {task.assignee.initials}
                          </div>
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

                    {/* Timer Play / Stop */}
                    {isRunning ? (
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={onStopTimer}
                        icon={<Square className="w-2.5 h-2.5 fill-current" />}
                        className="animate-pulse py-1 px-2.5 text-[10px]"
                      >
                        Parar
                      </Button>
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
                <th className="py-2.5 px-3 font-semibold w-28">ROL COTIZADO</th>
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
                    colSpan={viewMode === 'team' ? 7 : 6}
                    className="py-12 text-center text-[#94a3b8]"
                  >
                    No se encontraron tareas con los filtros seleccionados.
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            className="mt-0.5 text-[#94a3b8] hover:text-[#501f92] transition-colors cursor-pointer shrink-0"
                            aria-label={task.completed ? 'Marcar incompleta' : 'Marcar completada'}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-[#cbd5e1] hover:border-[#501f92]" />
                            )}
                          </button>

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
                            <span
                              className={`font-semibold text-xs block group-hover:text-[#501f92] transition-colors truncate mt-0.5 ${
                                task.completed ? 'line-through text-[#94a3b8]' : 'text-[#0f172a]'
                              }`}
                            >
                              {task.title}
                            </span>
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
                            {task.dueDate || 'Sin fecha'}
                          </span>
                        </div>
                      </td>

                      {/* 3. ROL COTIZADO */}
                      <td className="py-2.5 px-3">
                        <RoleChip role={task.budgetedRole || 'Especialista'} size="xs" />
                      </td>

                      {/* 4. UNIVERSAL PLAY / STOP BUTTON */}
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {isRunning ? (
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={onStopTimer}
                            icon={<Square className="w-2.5 h-2.5 fill-current" />}
                            className="p-1 h-6 w-6 animate-pulse"
                          />
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
                            <div
                              className={`w-4 h-4 rounded-full ${task.assignee.avatarBg} text-white flex items-center justify-center text-[7px] font-bold shrink-0`}
                            >
                              {task.assignee.initials}
                            </div>
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
