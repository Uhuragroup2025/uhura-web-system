import React, { useState, useMemo } from 'react';
import { TaskItem, ActiveTimerState, TaskStatus, TaskPriority } from './types';
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
      if (filterTab === 'active' && (t.completed || t.status === 'Done')) return false;
      if (filterTab === 'review' && t.status !== 'Review') return false;
      if (filterTab === 'completed' && (!t.completed && t.status !== 'Done')) return false;

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
          Listo
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
      {/* Top Header Controls: Mode Toggle & Action Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: View Mode Toggle (Mis Tareas vs Equipo) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('my')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'my'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Mis Tareas</span>
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'team'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Equipo</span>
            </button>
          </div>

          <span className="text-xs text-[#64748b] hidden sm:inline">
            {viewMode === 'my'
              ? 'Enfoque personal · Tareas asignadas a ti'
              : 'Vista de gestión · Monitoreo y asignación para Leads'}
          </span>
        </div>

        {/* Right: Primary CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 self-start md:self-auto">
          {onOpenNewTaskModal && (
            <button
              onClick={onOpenNewTaskModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Tarea</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#e2e8f0] shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              viewMode === 'my'
                ? 'Buscar en mis tareas, cliente o proyecto...'
                : 'Buscar por tarea, cliente, proyecto o responsable...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] pl-9 pr-4 py-1.5 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#501f92] focus:bg-white transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'all' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b]'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'active' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b]'
              }`}
            >
              Activas
            </button>
            <button
              onClick={() => setFilterTab('review')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'review' ? 'bg-white text-[#501f92] shadow-xs' : 'text-[#64748b]'
              }`}
            >
              En revisión
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'completed' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b]'
              }`}
            >
              Listas
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'all' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b]'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setCategoryFilter('client')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'client' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b]'
              }`}
            >
              Clientes Fee
            </button>
            <button
              onClick={() => setCategoryFilter('internal')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'internal' ? 'bg-white text-[#0f172a] shadow-xs' : 'text-[#64748b]'
              }`}
            >
              Interno
            </button>
          </div>

          {/* Project Selector */}
          <div className="flex items-center gap-1 bg-[#f8fafc] px-2.5 py-1 rounded-xl border border-[#e2e8f0]">
            <Filter className="w-3.5 h-3.5 text-[#501f92]" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0f172a] focus:outline-none cursor-pointer"
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
            <div className="flex items-center gap-1 bg-[#f8fafc] px-2.5 py-1 rounded-xl border border-[#e2e8f0]">
              <User className="w-3.5 h-3.5 text-[#501f92]" />
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#0f172a] focus:outline-none cursor-pointer"
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

      {/* Task List Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-[11px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                <th className="py-3.5 px-5 font-semibold">CLIENTE / PROYECTO / TAREA</th>
                <th
                  onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-[#501f92] transition-colors select-none group"
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
                <th className="py-3.5 px-4 font-semibold text-center w-24">TIMER</th>
                <th className="py-3.5 px-4 font-semibold">HORAS (CONSUMIDAS / ASIGNADAS)</th>
                {viewMode === 'team' && (
                  <th className="py-3.5 px-4 font-semibold">RESPONSABLE</th>
                )}
                <th className="py-3.5 px-4 font-semibold text-right pr-6">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={viewMode === 'team' ? 6 : 5}
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
                  const percent = Math.round((consumedHours / budgetedHours) * 100);
                  const isInternal = task.categoryType === 'internal';

                  // Semantic progress bar color
                  const progressBarColor =
                    percent > 100
                      ? 'bg-[#ef4444]'
                      : percent > 85
                      ? 'bg-[#f59e0b]'
                      : task.completed || percent === 100
                      ? 'bg-[#10b981]'
                      : 'bg-[#501f92]';

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                      className={`hover:bg-[#f8fafc] transition-colors group cursor-pointer ${
                        task.completed ? 'bg-[#f8fafc]/50 text-[#94a3b8]' : 'text-[#0f172a]'
                      } ${isRunning ? 'bg-[#faf5ff]/50' : ''}`}
                    >
                      {/* 1. CLIENTE / PROYECTO / TAREA */}
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            className="mt-0.5 text-[#94a3b8] hover:text-[#501f92] transition-colors cursor-pointer"
                            aria-label={task.completed ? 'Marcar incompleta' : 'Marcar completada'}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#10b981] fill-[#10b981]/10" />
                            ) : (
                              <Circle className="w-5 h-5 hover:scale-105 transition-transform" />
                            )}
                          </button>

                          <div className="space-y-1">
                            {/* Breadcrumb: Cliente → Proyecto */}
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748b]">
                              {isInternal ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f2ecfb] text-[#501f92] font-bold text-[10px]">
                                  🏢 Uhura Interno
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#2563eb] font-bold text-[10px]">
                                  <Building2 className="w-2.5 h-2.5" />
                                  {task.clientName || 'Cliente'}
                                </span>
                              )}
                              <ChevronRight className="w-3 h-3 text-[#94a3b8]" />
                              <span className="text-[#334155] font-medium truncate max-w-[180px]">
                                {task.projectName || task.board}
                              </span>

                              {/* Priority: Exception visible pattern (only if High) */}
                              {task.priority === 'High' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]">
                                  Alta
                                </span>
                              )}

                              {/* Blocker alert icon: Exception visible pattern */}
                              {task.blockerInfo?.isBlocked && (
                                <span
                                  className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#fef3c7] text-[#b45309] border border-[#fde68a]"
                                  title={`Bloqueo activo: ${task.blockerInfo.reasonText || 'Insumos pendientes'}`}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Bloqueada
                                </span>
                              )}
                            </div>

                            {/* Task Title */}
                            <span
                              className={`font-semibold text-sm block group-hover:text-[#501f92] transition-colors ${
                                task.completed ? 'line-through text-[#94a3b8]' : 'text-[#0f172a]'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. VENCE (DEADLINE) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className={`w-3.5 h-3.5 shrink-0 ${
                            task.dueStatus === 'overdue'
                              ? 'text-[#ef4444]'
                              : task.dueStatus === 'soon' || task.dueStatus === 'tomorrow'
                              ? 'text-[#f59e0b]'
                              : 'text-[#64748b]'
                          }`} />
                          <div className="flex flex-col">
                            <span className={`text-xs font-semibold ${
                              task.dueStatus === 'overdue'
                                ? 'text-[#ef4444] font-bold'
                                : task.dueStatus === 'soon' || task.dueStatus === 'tomorrow'
                                ? 'text-[#d97706] font-bold'
                                : 'text-[#334155]'
                            }`}>
                              {task.dueDate || 'Sin fecha'}
                            </span>
                            {task.dueText && (
                              <span className={`text-[10px] ${
                                task.dueStatus === 'overdue'
                                  ? 'text-[#dc2626] font-bold'
                                  : task.dueStatus === 'soon' || task.dueStatus === 'tomorrow'
                                  ? 'text-[#b45309]'
                                  : 'text-[#94a3b8]'
                              }`}>
                                {task.dueText}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. UNIVERSAL PLAY / STOP BUTTON */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {isRunning ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={onStopTimer}
                              className="p-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold transition-all shadow-xs cursor-pointer animate-pulse"
                              title="Detener timer"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onStartTimer && onStartTimer(task)}
                            className="p-2 rounded-xl bg-[#f8fafc] hover:bg-[#501f92] text-[#64748b] hover:text-white border border-[#e2e8f0] transition-colors cursor-pointer"
                            title="Iniciar timer"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>

                      {/* 3. HORAS (CONSUMIDAS / ASIGNADAS) */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 max-w-[150px]">
                          <div className="flex items-center justify-between text-xs font-mono font-bold">
                            <span className="text-[#0f172a]">{consumedHours.toFixed(1)}h</span>
                            <span className="text-[#64748b]">/ {budgetedHours}h</span>
                            <span
                              className={`text-[10px] ${
                                percent > 100 ? 'text-[#dc2626]' : 'text-[#64748b]'
                              }`}
                            >
                              ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(percent, 100)}%` }}
                              className={`h-full rounded-full ${progressBarColor}`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 4. RESPONSABLE (ONLY IN TEAM MODE) */}
                      {viewMode === 'team' && (
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-lg ${task.assignee.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}
                            >
                              {task.assignee.initials}
                            </div>
                            <span className="text-xs font-medium text-[#334155]">
                              {task.assignee.name}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* 5. ESTADO */}
                      <td className="py-4 px-4 text-right pr-6">
                        {getStatusBadge(task.status, task.completed)}
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
