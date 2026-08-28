import React, { useState } from 'react';
import { TaskItem, TaskStatus, ActiveTimerState, ProjectType } from './types';
import {
  Plus,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Square,
  Link2,
  Building2,
  ChevronRight,
  AlertTriangle,
  Layers,
  Repeat,
  RotateCcw,
  Sparkles,
  Filter,
  Archive
} from 'lucide-react';

interface BoardViewProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onOpenNewTaskModal?: () => void;
  activeTimer?: ActiveTimerState | null;
  onStartTimer?: (task: TaskItem) => void;
  onPauseResumeTimer?: () => void;
  onStopTimer?: () => void;
  onOpenTaskDetail?: (task: TaskItem) => void;
  isProjectDetail?: boolean;
}

export const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  onToggleTask,
  onOpenNewTaskModal,
  activeTimer,
  onStartTimer,
  onPauseResumeTimer,
  onStopTimer,
  onOpenTaskDetail,
  isProjectDetail = false
}) => {
  // Status filter inside project detail vs global type filter
  const [detailStatusFilter, setDetailStatusFilter] = useState<'all' | TaskStatus>('all');
  const [filterType, setFilterType] = useState<'all' | 'fee_monthly' | 'fixed_milestones' | 'internal' | 'blocked' | 'archived'>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Extract unique project list
  const availableProjects = Array.from(
    new Set(tasks.map((t) => t.projectName || t.board).filter(Boolean))
  );

  const archivedCount = tasks.filter((t) => t.isArchived).length;

  const filteredTasks = tasks.filter((t) => {
    if (isProjectDetail) {
      if (t.isArchived) return false;
      if (detailStatusFilter !== 'all' && t.status !== detailStatusFilter) return false;
      return true;
    }

    // Handle archive filter
    if (filterType === 'archived') {
      if (!t.isArchived) return false;
    } else {
      if (t.isArchived) return false;
    }

    if (filterType === 'fee_monthly' && t.projectType !== 'fee_monthly') return false;
    if (filterType === 'fixed_milestones' && t.projectType !== 'fixed_milestones') return false;
    if (filterType === 'internal' && t.categoryType !== 'internal' && t.projectType !== 'internal') return false;
    if (filterType === 'blocked' && !t.blockerInfo?.isBlocked) return false;
    if (selectedProject !== 'all' && (t.projectName !== selectedProject && t.board !== selectedProject)) return false;
    return true;
  });

  const allColumns: { id: TaskStatus; title: string; badgeBg: string; count: number }[] = [
    { id: 'To Do', title: 'Por Hacer', badgeBg: 'bg-[#f3f4f6] text-[#4b5563]', count: tasks.filter(t => !t.isArchived && t.status === 'To Do').length },
    { id: 'In Progress', title: 'En Proceso', badgeBg: 'bg-[#f2ecfb] text-[#501f92]', count: tasks.filter(t => !t.isArchived && t.status === 'In Progress').length },
    { id: 'Review', title: 'En Revisión', badgeBg: 'bg-[#fef3c7] text-[#92400e]', count: tasks.filter(t => !t.isArchived && t.status === 'Review').length },
    { id: 'Done', title: 'Completadas', badgeBg: 'bg-[#ecfdf5] text-[#166534]', count: tasks.filter(t => !t.isArchived && t.status === 'Done').length },
  ];

  const columns = isProjectDetail && detailStatusFilter !== 'all'
    ? allColumns.filter(c => c.id === detailStatusFilter)
    : allColumns;

  const blockedCount = tasks.filter((t) => t.blockerInfo?.isBlocked).length;
  const feesCount = tasks.filter((t) => t.projectType === 'fee_monthly').length;
  const devCount = tasks.filter((t) => t.projectType === 'fixed_milestones').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Filter Bar: Distinct and clean for Project Detail vs Global Board */}
      {isProjectDetail ? (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs">
          {/* Status Quick-Filter for Project Detail: Todas | Por hacer | En proceso | En revisión | Completadas */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setDetailStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                detailStatusFilter === 'all'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
              }`}
            >
              Todas ({tasks.filter(t => !t.isArchived).length})
            </button>
            <button
              onClick={() => setDetailStatusFilter('To Do')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                detailStatusFilter === 'To Do'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
              }`}
            >
              Por hacer ({tasks.filter(t => !t.isArchived && t.status === 'To Do').length})
            </button>
            <button
              onClick={() => setDetailStatusFilter('In Progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                detailStatusFilter === 'In Progress'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
              }`}
            >
              En proceso ({tasks.filter(t => !t.isArchived && t.status === 'In Progress').length})
            </button>
            <button
              onClick={() => setDetailStatusFilter('Review')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                detailStatusFilter === 'Review'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
              }`}
            >
              En revisión ({tasks.filter(t => !t.isArchived && t.status === 'Review').length})
            </button>
            <button
              onClick={() => setDetailStatusFilter('Done')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                detailStatusFilter === 'Done'
                  ? 'bg-[#501f92] text-white shadow-2xs'
                  : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
              }`}
            >
              Completadas ({tasks.filter(t => !t.isArchived && t.status === 'Done').length})
            </button>
          </div>

          {onOpenNewTaskModal && (
            <button
              onClick={onOpenNewTaskModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Tarea</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white rounded-2xl border border-[#e2e8f0] shadow-2xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'all'
                  ? 'bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] shadow-2xs'
                  : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
              }`}
            >
              <span>Todas las tareas</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filterType === 'all' ? 'bg-[#e2e8f0] text-[#0f172a]' : 'bg-[#f1f5f9] text-[#64748b]'
              }`}>
                {tasks.length}
              </span>
            </button>

            <button
              onClick={() => setFilterType('fee_monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'fee_monthly'
                  ? 'bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] shadow-2xs'
                  : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
              }`}
            >
              <Repeat className="w-3 h-3 text-[#501f92]" />
              <span>Fee mensual</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filterType === 'fee_monthly' ? 'bg-[#e2e8f0] text-[#0f172a]' : 'bg-[#f1f5f9] text-[#64748b]'
              }`}>
                {feesCount}
              </span>
            </button>

            <button
              onClick={() => setFilterType('fixed_milestones')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'fixed_milestones'
                  ? 'bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] shadow-2xs'
                  : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
              }`}
            >
              <Layers className="w-3 h-3 text-[#2563eb]" />
              <span>Proyecto único</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                filterType === 'fixed_milestones' ? 'bg-[#e2e8f0] text-[#0f172a]' : 'bg-[#f1f5f9] text-[#64748b]'
              }`}>
                {devCount}
              </span>
            </button>

            {blockedCount > 0 && (
              <button
                onClick={() => setFilterType('blocked')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'blocked'
                    ? 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] shadow-2xs'
                    : 'text-[#64748b] hover:bg-[#fef2f2] hover:text-[#991b1b]'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-[#ef4444]" />
                <span>En Standby / Bloqueadas</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  filterType === 'blocked' ? 'bg-[#fca5a5] text-[#7f1d1d]' : 'bg-[#fee2e2] text-[#991b1b]'
                }`}>
                  {blockedCount}
                </span>
              </button>
            )}

            {archivedCount > 0 && (
              <button
                onClick={() => setFilterType('archived')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === 'archived'
                    ? 'bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/40 shadow-2xs'
                    : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'
                }`}
              >
                <Archive className="w-3 h-3 text-[#8a4dff]" />
                <span>Archivadas</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#f2ecfb] text-[#501f92]">
                  {archivedCount}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Project Filter Dropdown */}
            <div className="flex items-center gap-1 bg-[#f8fafc] px-2.5 py-1 rounded-xl border border-[#e2e8f0]">
              <Filter className="w-3.5 h-3.5 text-[#501f92]" />
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#0f172a] focus:outline-none cursor-pointer pr-1"
              >
                <option value="all">Todos los proyectos ({tasks.length})</option>
                {availableProjects.map((proj) => (
                  <option key={proj} value={proj}>
                    {proj}
                  </option>
                ))}
              </select>
            </div>

            {onOpenNewTaskModal && (
              <button
                onClick={onOpenNewTaskModal}
                className="px-3.5 py-1.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Tarea</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-[#f8fafc] p-3.5 rounded-2xl border border-[#e2e8f0] flex flex-col gap-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${col.badgeBg}`}>
                    {col.title}
                  </span>
                  <span className="text-xs font-semibold text-[#64748b] bg-white px-2 py-0.5 rounded-full border border-[#e2e8f0]">
                    {col.count}
                  </span>
                </div>
                {onOpenNewTaskModal && (
                  <button
                    onClick={onOpenNewTaskModal}
                    className="p-1 rounded-lg text-[#64748b] hover:text-[#0f172a] hover:bg-white transition-colors cursor-pointer"
                    title="Añadir tarea a esta columna"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Column Cards */}
              <div className="flex flex-col gap-2.5 flex-1">
                {colTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#e2e8f0] rounded-xl p-4 text-center">
                    <p className="text-xs text-[#94a3b8]">Sin tareas en esta etapa</p>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isRunning = activeTimer?.taskId === task.id;
                    const consumedHours = (task.consumedSeconds || 0) / 3600;
                    const budgetedHours = task.budgetedHours || 1;
                    const percent = Math.round((consumedHours / budgetedHours) * 100);
                    const isInternal = task.categoryType === 'internal';
                    const isBlocked = task.blockerInfo?.isBlocked;

                    return (
                      <div
                        key={task.id}
                        className={`bg-white p-3.5 rounded-xl border transition-all duration-150 shadow-2xs hover:shadow-xs space-y-2.5 ${
                          isRunning
                            ? 'border-[#501f92] ring-2 ring-[#8a4dff]/20 bg-[#faf5ff]/40'
                            : isBlocked
                            ? 'border-[#fca5a5] bg-[#fff5f5]/50'
                            : 'border-[#e2e8f0] hover:border-[#8a4dff]/40'
                        }`}
                      >
                        {/* 1. Miga de pan Cliente / Proyecto */}
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#64748b] flex-wrap">
                          {isInternal ? (
                            <span className="text-[#501f92] font-bold bg-[#f2ecfb] px-1.5 py-0.2 rounded">
                              🏢 Uhura Interno
                            </span>
                          ) : (
                            <span className="text-[#2563eb] font-bold bg-[#eff6ff] px-1.5 py-0.2 rounded flex items-center gap-1">
                              <Building2 className="w-2.5 h-2.5" />
                              {task.clientName || 'Cliente'}
                            </span>
                          )}
                          <ChevronRight className="w-2.5 h-2.5 text-[#94a3b8]" />
                          <span className="truncate max-w-[110px] text-[#334155]">
                            {task.projectName || task.board}
                          </span>
                        </div>

                        {/* 2. Nature Badges: Fee Category OR Project Phase / Frente */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {task.projectType === 'fee_monthly' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/20">
                              <Repeat className="w-2.5 h-2.5" />
                              <span>{task.feeCategory || 'Fee Mensual'}</span>
                            </span>
                          )}

                          {(task.phase || task.fase || task.frente) && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]">
                              {(task.phase || task.fase) && <span>{task.phase || task.fase}</span>}
                              {(task.phase || task.fase) && task.frente && <span className="text-[#cbd5e1]">·</span>}
                              {task.frente && <span className="text-[#501f92]">{task.frente}</span>}
                            </span>
                          )}

                          {task.isRecalibrated && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Recalibrada (+{task.recalibrationDays || 4}d)</span>
                            </span>
                          )}
                        </div>

                        {/* 3. Blocker Warning Banner if Blocked */}
                        {isBlocked && (
                          <div className="p-2 rounded-lg bg-[#fee2e2] border border-[#fca5a5] text-[10px] text-[#991b1b] space-y-0.5">
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-[#ef4444]" />
                                En Espera: {task.blockerInfo?.responsibleParty || 'Cliente'}
                              </span>
                              <span className="font-mono bg-white px-1 rounded text-[#dc2626]">
                                +{task.blockerInfo?.blockedDays || 4}d desfase
                              </span>
                            </div>
                            <p className="text-[#7f1d1d] text-[9px] line-clamp-1">
                              {task.blockerInfo?.reasonText}
                            </p>
                          </div>
                        )}

                        {/* Title & Checkbox */}
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className="mt-0.5 text-[#94a3b8] hover:text-[#501f92] transition-colors shrink-0 cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#10b981] fill-[#10b981]/10" />
                            ) : (
                              <Circle className="w-4 h-4 hover:scale-105" />
                            )}
                          </button>
                          <button
                            onClick={() => onOpenTaskDetail && onOpenTaskDetail(task)}
                            className="text-left font-semibold text-xs text-[#0f172a] hover:text-[#501f92] hover:underline line-clamp-2 leading-snug cursor-pointer"
                          >
                            {task.title}
                          </button>
                        </div>

                        {/* Deliverables link pill if attached */}
                        {task.deliverables && task.deliverables.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ecfdf5] text-[#166534] border border-[#a7f3d0]/60">
                              <Link2 className="w-2.5 h-2.5" />
                              {task.deliverables.length} {task.deliverables.length === 1 ? 'entregable' : 'entregables'}
                            </span>
                          </div>
                        )}

                        {/* Hours progress bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-[#0f172a]">
                              {consumedHours.toFixed(1)}h / {budgetedHours.toFixed(1)}h
                            </span>
                            <span className="text-[10px] text-[#64748b]">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(percent, 100)}%` }}
                              className={`h-full rounded-full ${
                                percent > 100 ? 'bg-[#dc2626]' : isInternal ? 'bg-[#8a4dff]' : 'bg-[#501f92]'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Card Footer: Assignee & Single Play Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-6 h-6 rounded-lg ${task.assignee.avatarBg} text-white flex items-center justify-center font-bold text-[10px]`}
                            >
                              {task.assignee.initials}
                            </div>
                            <span className="text-[11px] text-[#64748b] font-medium truncate max-w-[85px]">
                              {task.assignee.name.split(' ')[0]}
                            </span>
                          </div>

                          {/* Universal Play / Stop */}
                          {isRunning ? (
                            <button
                              onClick={onStopTimer}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] flex items-center gap-1 cursor-pointer animate-pulse shadow-xs"
                              title="Detener timer"
                            >
                              <Square className="w-3 h-3 fill-current" />
                              <span>Detener</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onStartTimer && onStartTimer(task)}
                              className="p-1.5 rounded-lg bg-[#f1f5f9] hover:bg-[#501f92] text-[#475569] hover:text-white transition-colors cursor-pointer"
                              title="Iniciar Timer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
