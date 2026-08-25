import React, { useState } from 'react';
import { TaskItem, ActiveTimerState } from './types';
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
  Link2,
  ChevronRight,
  ShieldAlert,
  Building2,
  Edit2,
  Check,
  X
} from 'lucide-react';

interface MyTasksViewProps {
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onOpenNewTaskModal?: () => void;
  activeTimer?: ActiveTimerState | null;
  onStartTimer?: (task: TaskItem) => void;
  onPauseResumeTimer?: () => void;
  onOpenTaskDetail?: (task: TaskItem) => void;
  onOpenManualLogModal?: (taskId?: string) => void;
  onUpdateTaskBudgetHours?: (taskId: string, newHours: number) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  onToggleTask,
  onOpenNewTaskModal,
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onOpenTaskDetail,
  onOpenManualLogModal,
  onUpdateTaskBudgetHours
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'client' | 'internal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Extract unique project list
  const availableProjects = Array.from(
    new Set(tasks.map((t) => t.projectName || t.board).filter(Boolean))
  );

  // Inline edit state for budget hours
  const [editingBudgetTaskId, setEditingBudgetTaskId] = useState<string | null>(null);
  const [editingBudgetValue, setEditingBudgetValue] = useState<string>('');

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const internalCount = tasks.filter((t) => t.categoryType === 'internal').length;

  const handleSaveBudget = (taskId: string) => {
    const num = parseFloat(editingBudgetValue);
    if (!isNaN(num) && num > 0 && onUpdateTaskBudgetHours) {
      onUpdateTaskBudgetHours(taskId, num);
    }
    setEditingBudgetTaskId(null);
  };

  const filteredTasks = tasks.filter((t) => {
    // Hide archived tasks
    if (t.isArchived) return false;

    // Tab filter
    if (filterTab === 'active' && t.completed) return false;
    if (filterTab === 'completed' && !t.completed) return false;

    // Category Filter (Client vs Internal)
    if (categoryFilter === 'client' && t.categoryType === 'internal') return false;
    if (categoryFilter === 'internal' && t.categoryType !== 'internal') return false;

    // Client filter
    if (selectedClient !== 'all' && t.clientName !== selectedClient) return false;

    // Project filter
    if (selectedProject !== 'all' && (t.projectName !== selectedProject && t.board !== selectedProject)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.clientName && t.clientName.toLowerCase().includes(q)) ||
        (t.projectName && t.projectName.toLowerCase().includes(q)) ||
        t.board.toLowerCase().includes(q) ||
        t.assignee.name.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls & Quick Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e7eb] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold text-[#475569]">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>{activeCount} activas</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold text-[#475569]">
            <span className="text-[#64748b]">Completadas:</span>
            <span className="font-bold text-[#0f172a]">{completedCount}</span>
          </div>
          <div className="text-xs text-[#64748b] hidden xl:inline">
            Estructura: Cliente → Proyecto / Fee → Tareas
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {onOpenManualLogModal && (
            <button
              onClick={() => onOpenManualLogModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#334155] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#64748b]" />
              <span>Carga Manual</span>
            </button>
          )}

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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#e5e7eb] shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, proyecto, tarea o responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] pl-9 pr-4 py-1.5 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff] transition-all"
          />
        </div>

        {/* Filter Tabs & Category Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Todas ({tasks.length})
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'active'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Activas ({activeCount})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'completed'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Completadas ({completedCount})
            </button>
          </div>

          {/* Category Filter: Clientes vs Internos */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setCategoryFilter('client')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'client'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Clientes Fee
            </button>
            <button
              onClick={() => setCategoryFilter('internal')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'internal'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Interno ({internalCount})
            </button>
          </div>

          {/* Project Filter Dropdown */}
          <div className="flex items-center gap-1 bg-[#f8fafc] px-2.5 py-1.5 rounded-xl border border-[#e2e8f0]">
            <Filter className="w-3.5 h-3.5 text-[#501f92]" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0f172a] focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">Filtrar por Proyecto ({availableProjects.length})</option>
              {availableProjects.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List Table with 3-Level Hierarchy & Universal Play */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-[11px] font-bold text-[#64748b] uppercase tracking-wider bg-[#f8fafc]">
                <th className="py-3.5 px-5 font-semibold">CLIENTE / PROYECTO / TAREA</th>
                <th className="py-3.5 px-4 font-semibold text-center w-28">TIMER</th>
                <th className="py-3.5 px-4 font-semibold">HORAS (CONSUMIDAS / ASIGNADAS)</th>
                <th className="py-3.5 px-4 font-semibold">RESPONSABLE</th>
                <th className="py-3.5 px-4 font-semibold text-right pr-6">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-sm">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#94a3b8] text-sm">
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

                  const isEditingThis = editingBudgetTaskId === task.id;

                  // Bar color: Red if exceeded (>100%), Green if completed/on-track (completed or 100%), Orange when in progress (<100%)
                  const progressBarColor =
                    percent > 100
                      ? 'bg-[#ef4444]'
                      : task.completed || percent === 100
                      ? 'bg-[#10b981]'
                      : 'bg-[#f59e0b]';

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-[#f8fafc] transition-colors group ${
                        task.completed ? 'bg-[#f8fafc]/50 text-[#94a3b8]' : 'text-[#0f172a]'
                      } ${isRunning ? 'bg-[#faf5ff]/40' : ''}`}
                    >
                      {/* 1. CLIENTE / PROYECTO / TAREA */}
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onToggleTask(task.id)}
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
                            </div>

                            {/* Task Title (click to open detail modal) */}
                            <button
                              onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                              className={`font-semibold text-sm text-left hover:text-[#501f92] hover:underline transition-colors block cursor-pointer ${
                                task.completed ? 'line-through text-[#94a3b8]' : 'text-[#0f172a]'
                              }`}
                            >
                              {task.title}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 2. UNIVERSAL PLAY / PAUSE BUTTON */}
                      <td className="py-4 px-4 text-center">
                        {isRunning ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={onPauseResumeTimer}
                              className={`p-2 rounded-xl text-white font-bold transition-all shadow-xs cursor-pointer ${
                                activeTimer?.isPaused
                                  ? 'bg-[#f59e0b] hover:bg-[#d97706]'
                                  : 'bg-[#501f92] hover:bg-[#381566] ring-2 ring-[#8a4dff]/40 animate-pulse'
                              }`}
                              title={activeTimer?.isPaused ? 'Reanudar Timer' : 'Pausar Timer'}
                            >
                              {activeTimer?.isPaused ? (
                                <Play className="w-4 h-4 fill-current" />
                              ) : (
                                <Pause className="w-4 h-4 fill-current" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onStartTimer && onStartTimer(task)}
                            className="p-2 rounded-xl bg-[#f1f5f9] hover:bg-[#501f92] text-[#475569] hover:text-white transition-all cursor-pointer shadow-2xs group/btn"
                            title="Iniciar Timer para esta tarea"
                          >
                            <Play className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
                          </button>
                        )}
                      </td>

                      {/* 3. HORAS ASIGNADAS & CONSUMIDAS (ESTANDARIZADO: NARANJA EN PROCESO, VERDE AL DÍA, ROJO DESVÍO) */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 min-w-[160px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-[#0f172a]">
                              {consumedHours.toFixed(1)}h
                            </span>

                            {/* Budget Hours with 1-click edit */}
                            {isEditingThis ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0.5"
                                  value={editingBudgetValue}
                                  onChange={(e) => setEditingBudgetValue(e.target.value)}
                                  className="w-14 px-1.5 py-0.5 text-xs font-mono font-bold bg-white border border-[#501f92] rounded text-[#0f172a] focus:outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveBudget(task.id);
                                    if (e.key === 'Escape') setEditingBudgetTaskId(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleSaveBudget(task.id)}
                                  className="p-0.5 text-[#166534] hover:bg-[#ecfdf5] rounded cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingBudgetTaskId(null)}
                                  className="p-0.5 text-[#dc2626] hover:bg-[#fee2e2] rounded cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingBudgetTaskId(task.id);
                                  setEditingBudgetValue(task.budgetedHours.toString());
                                }}
                                className="inline-flex items-center gap-1 font-mono text-[#64748b] hover:text-[#501f92] hover:bg-[#f2ecfb] px-1.5 py-0.5 rounded transition-colors group/edit cursor-pointer"
                                title="Clic para editar horas asignadas por el líder"
                              >
                                <span>/ {budgetedHours.toFixed(1)}h</span>
                                <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                              </button>
                            )}
                          </div>

                          {/* Standardized Progress Bar: Orange when in-progress, Green when completed/on-track */}
                          <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(percent, 100)}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-[#64748b]">
                            <span>{percent}% consumido</span>
                            {percent > 100 ? (
                              <span className="font-bold text-[#ef4444] flex items-center gap-0.5">
                                <ShieldAlert className="w-2.5 h-2.5" /> Desvío
                              </span>
                            ) : task.completed || percent === 100 ? (
                              <span className="font-bold text-[#10b981] flex items-center gap-0.5">
                                Al día
                              </span>
                            ) : (
                              <span className="font-medium text-[#f59e0b]">
                                En proceso
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. RESPONSABLE */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg ${task.assignee.avatarBg} text-white flex items-center justify-center font-bold text-[11px] shadow-2xs`}
                          >
                            {task.assignee.initials}
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-xs font-semibold text-[#0f172a] leading-tight">
                              {task.assignee.name}
                            </p>
                            <p className="text-[10px] text-[#64748b] leading-tight">
                              {task.assignee.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 5. ESTADO (CLICKABLE TO OPEN TASK DETAIL) */}
                      <td className="py-4 px-4 text-right pr-6">
                        <button
                          onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer hover:shadow-2xs transition-all ${
                            task.status === 'Done'
                              ? 'bg-[#ecfdf5] text-[#166534] border border-[#a7f3d0]/60'
                              : task.status === 'In Progress'
                              ? 'bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]'
                              : task.status === 'Review'
                              ? 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]'
                              : 'bg-[#f1f5f9] text-[#475569]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              task.status === 'Done'
                                ? 'bg-[#10b981]'
                                : task.status === 'In Progress'
                                ? 'bg-[#ea580c]'
                                : task.status === 'Review'
                                ? 'bg-[#f59e0b]'
                                : 'bg-[#94a3b8]'
                            }`}
                          />
                          {task.status === 'Done'
                            ? 'Listo'
                            : task.status === 'In Progress'
                            ? 'En Proceso'
                            : task.status === 'Review'
                            ? 'Revisión'
                            : 'Por Hacer'}
                        </button>
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
