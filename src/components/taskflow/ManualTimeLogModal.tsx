import React, { useState, useMemo } from 'react';
import { TaskItem, TimeLog } from './types';
import {
  X,
  Clock,
  Calendar,
  Search,
  Folder,
  CheckSquare,
  Building2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ManualTimeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  defaultTaskId?: string;
  onSaveManualLog: (log: Omit<TimeLog, 'id'>) => void;
}

export const ManualTimeLogModal: React.FC<ManualTimeLogModalProps> = ({
  isOpen,
  onClose,
  tasks,
  defaultTaskId,
  onSaveManualLog
}) => {
  if (!isOpen) return null;

  // Selected task state
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    defaultTaskId || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(!defaultTaskId);

  // Form Fields (Duration only: Hours & Minutes; Date; Description)
  const [logDate, setLogDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('00');
  const [note, setNote] = useState('');

  // Find currently selected task object
  const selectedTask = useMemo(() => {
    if (selectedTaskId) {
      return tasks.find((t) => t.id === selectedTaskId) || null;
    }
    return null;
  }, [tasks, selectedTaskId]);

  // Is direct task mode: opened specifically from a task (defaultTaskId provided)
  const isDirectTaskMode = Boolean(defaultTaskId && selectedTask);

  // Filter tasks for the search selector
  const { recentTasks, activeTasks, searchResults } = useMemo(() => {
    const active = tasks.filter((t) => !t.completed && !t.isArchived && t.status !== 'Done');
    // Simulate recent tasks: in progress, with logged time, or first active tasks
    const recent = active.filter((t) => (t.consumedSeconds || 0) > 0 || t.status === 'In Progress').slice(0, 5);

    if (!searchQuery.trim()) {
      return {
        recentTasks: recent.length > 0 ? recent : active.slice(0, 4),
        activeTasks: active,
        searchResults: []
      };
    }

    const query = searchQuery.toLowerCase().trim();
    const results = tasks.filter((t) => {
      const matchTitle = t.title.toLowerCase().includes(query);
      const matchClient = (t.clientName || '').toLowerCase().includes(query);
      const matchProject = (t.projectName || t.board || '').toLowerCase().includes(query);
      const matchFrente = (t.frente || '').toLowerCase().includes(query);
      return matchTitle || matchClient || matchProject || matchFrente;
    });

    return {
      recentTasks: recent,
      activeTasks: active,
      searchResults: results
    };
  }, [tasks, searchQuery]);

  const handleSelectTask = (task: TaskItem) => {
    setSelectedTaskId(task.id);
    setIsTaskSelectorOpen(false);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    const totalSeconds = (parseInt(hours || '0', 10) * 3600) + (parseInt(minutes || '0', 10) * 60);
    if (totalSeconds <= 0) return;

    // Format date string for human display (e.g. "29 Ago 2026")
    let formattedDate = 'Hoy';
    if (logDate) {
      const parts = logDate.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthStr = months[monthNum - 1] || 'Mes';
        formattedDate = `${day} ${monthStr} ${year}`;
      }
    }

    onSaveManualLog({
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      clientName: selectedTask.clientName || 'Cliente',
      projectName: selectedTask.projectName || selectedTask.board,
      categoryType: selectedTask.categoryType,
      userName: selectedTask.assignee?.name || 'Usuario',
      userInitials: selectedTask.assignee?.initials || 'US',
      userAvatarBg: selectedTask.assignee?.avatarBg || 'bg-[#501f92]',
      durationSeconds: totalSeconds,
      startTime: '',
      endTime: '',
      isLiveTimer: false,
      date: formattedDate,
      note: note.trim() || 'Carga manual de horas reportadas.',
      deliverableUrl: ''
    });

    onClose();
  };

  return (
    <div
      id="manual-time-log-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-60 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="manual-time-log-container"
        className="bg-white sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-[#e2e8f0] w-full max-w-lg h-full sm:h-auto overflow-hidden flex flex-col sm:max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between border-b border-[#334155] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold shrink-0">
              <Clock className="w-4 h-4 text-[#d4ff4a]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Cargar Horas</h3>
              <p className="text-[11px] text-[#94a3b8]">Registro manual de tiempo de trabajo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Direct Task Mode: Header Context (Cliente > Proyecto > Tarea) */}
        {isDirectTaskMode && selectedTask && (
          <div className="px-5 sm:px-6 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] shrink-0">
            <span className="text-[10px] font-bold uppercase text-[#64748b] block mb-1">
              Tarea Seleccionada
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#64748b]">
              <span className="font-bold text-[#501f92]">{selectedTask.clientName || 'Cliente'}</span>
              <span className="text-[#94a3b8] font-bold">›</span>
              <span className="font-semibold text-[#334155]">{selectedTask.projectName || selectedTask.board}</span>
              <span className="text-[#94a3b8] font-bold">›</span>
              <span className="font-bold text-[#0f172a]">{selectedTask.title}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4.5">
          {/* 2. Global Mode: Task Selector ("¿En qué tarea trabajaste?") */}
          {!isDirectTaskMode && (
            <div>
              <label className="block font-bold text-xs text-[#0f172a] mb-1.5">
                ¿En qué tarea trabajaste? *
              </label>

              {/* Display Chosen Task or Selection Button */}
              {selectedTask && !isTaskSelectorOpen ? (
                <div className="p-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-0.5">
                      <span className="font-bold text-[#501f92] truncate">{selectedTask.clientName || 'Cliente'}</span>
                      <span>›</span>
                      <span className="font-semibold truncate">{selectedTask.projectName || selectedTask.board}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0f172a] truncate">{selectedTask.title}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTaskSelectorOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold text-[#501f92] hover:bg-[#f5f3ff] rounded-xl border border-[#e9d5ff] shrink-0 cursor-pointer transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                /* Searchable Selector Box / Panel */
                <div className="border border-[#cbd5e1] rounded-2xl bg-white p-3 space-y-3 shadow-xs">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Buscar por tarea, proyecto o cliente..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] pl-9 pr-3 py-2 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#501f92] focus:bg-white"
                    />
                  </div>

                  {/* Tasks List */}
                  <div className="max-h-56 overflow-y-auto space-y-3 divide-y divide-[#f1f5f9] pr-1">
                    {/* Search Results */}
                    {searchQuery.trim() ? (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#64748b] block mb-1.5">
                          Resultados ({searchResults.length})
                        </span>
                        {searchResults.length === 0 ? (
                          <p className="text-xs text-[#94a3b8] py-4 text-center">
                            No se encontraron tareas con "{searchQuery}"
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {searchResults.map((task) => (
                              <button
                                key={task.id}
                                type="button"
                                onClick={() => handleSelectTask(task)}
                                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  selectedTaskId === task.id
                                    ? 'bg-[#f5f3ff] border-[#8a4dff] text-[#0f172a]'
                                    : 'bg-[#f8fafc] border-[#f1f5f9] hover:border-[#cbd5e1] text-[#334155]'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-xs text-[#0f172a] truncate">{task.title}</h5>
                                  <span className="text-[10px] text-[#64748b] block truncate mt-0.5">
                                    <strong className="text-[#501f92]">{task.clientName || 'Cliente'}</strong> · {task.projectName || task.board}
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#94a3b8] shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* 1. Mis tareas recientes */}
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#64748b] mb-1.5">
                            <Sparkles className="w-3 h-3 text-[#501f92]" />
                            <span>Mis Tareas Recientes</span>
                          </div>
                          <div className="space-y-1.5">
                            {recentTasks.map((task) => (
                              <button
                                key={`rec-${task.id}`}
                                type="button"
                                onClick={() => handleSelectTask(task)}
                                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  selectedTaskId === task.id
                                    ? 'bg-[#f5f3ff] border-[#8a4dff]'
                                    : 'bg-[#f8fafc] border-[#f1f5f9] hover:border-[#cbd5e1]'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-xs text-[#0f172a] truncate">{task.title}</h5>
                                  <span className="text-[10px] text-[#64748b] block truncate mt-0.5">
                                    <strong className="text-[#501f92]">{task.clientName || 'Cliente'}</strong> · {task.projectName || task.board}
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#94a3b8] shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Mis tareas activas */}
                        <div className="pt-2">
                          <span className="text-[10px] font-bold uppercase text-[#64748b] block mb-1.5">
                            Mis Tareas Activas ({activeTasks.length})
                          </span>
                          <div className="space-y-1.5">
                            {activeTasks.slice(0, 8).map((task) => (
                              <button
                                key={`act-${task.id}`}
                                type="button"
                                onClick={() => handleSelectTask(task)}
                                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                  selectedTaskId === task.id
                                    ? 'bg-[#f5f3ff] border-[#8a4dff]'
                                    : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1]'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-xs text-[#0f172a] truncate">{task.title}</h5>
                                  <span className="text-[10px] text-[#64748b] block truncate mt-0.5">
                                    <strong className="text-[#501f92]">{task.clientName || 'Cliente'}</strong> · {task.projectName || task.board}
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#94a3b8] shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Fields: Date, Duration (Horas & Minutos), Description */}
          <form id="manual-log-form" onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Fecha del trabajo ejecutado */}
            <div>
              <label className="block font-bold text-xs text-[#0f172a] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#501f92]" />
                <span>Fecha del trabajo ejecutado *</span>
              </label>
              <input
                type="date"
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white cursor-pointer"
              />
            </div>

            {/* Duración (Solo Horas y Minutos) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-xs text-[#0f172a]">
                  Duración del trabajo *
                </label>
                {/* Presets rápidos */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setHours('1'); setMinutes('0'); }}
                    className="px-2 py-0.5 rounded-md bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[10px] font-bold text-[#475569] cursor-pointer"
                  >
                    1h
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHours('2'); setMinutes('0'); }}
                    className="px-2 py-0.5 rounded-md bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[10px] font-bold text-[#475569] cursor-pointer"
                  >
                    2h
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHours('4'); setMinutes('0'); }}
                    className="px-2 py-0.5 rounded-md bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[10px] font-bold text-[#475569] cursor-pointer"
                  >
                    4h
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHours('8'); setMinutes('0'); }}
                    className="px-2 py-0.5 rounded-md bg-[#f2ecfb] hover:bg-[#e9d5ff] text-[10px] font-bold text-[#501f92] cursor-pointer"
                    title="Jornada completa"
                  >
                    8h
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl focus-within:border-[#501f92] focus-within:bg-white">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      required
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-full text-sm font-mono font-bold text-[#0f172a] bg-transparent focus:outline-none"
                    />
                    <span className="text-xs font-bold text-[#64748b] select-none">horas</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl focus-within:border-[#501f92] focus-within:bg-white">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="5"
                      required
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      className="w-full text-sm font-mono font-bold text-[#0f172a] bg-transparent focus:outline-none"
                    />
                    <span className="text-xs font-bold text-[#64748b] select-none">minutos</span>
                  </div>
                </div>
              </div>

              {/* Advertencia si la carga supera el presupuesto estimado de la tarea */}
              {selectedTask && (
                (() => {
                  const inputHours = (parseInt(hours, 10) || 0) + (parseInt(minutes, 10) || 0) / 60;
                  const currentConsumedHours = (selectedTask.consumedSeconds || 0) / 3600;
                  const newTotalHours = currentConsumedHours + inputHours;
                  const budgeted = selectedTask.budgetedHours || 0;
                  const isExceeding = budgeted > 0 && newTotalHours > budgeted;

                  if (isExceeding) {
                    return (
                      <div className="mt-2 p-2.5 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-[11px] text-[#92400e] flex items-center gap-2">
                        <span className="font-bold text-[#b45309]">⚠️ Advertencia:</span>
                        <span>
                          Con este registro acumularás <strong>{newTotalHours.toFixed(1)}h</strong>, superando el estimado de <strong>{budgeted}h</strong> en la tarea.
                        </span>
                      </div>
                    );
                  }
                  return (
                    <p className="text-[10px] text-[#64748b] mt-1">
                      Registra el tiempo exacto trabajado en esta sesión.
                    </p>
                  );
                })()
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block font-bold text-xs text-[#0f172a] mb-1.5">
                Descripción de lo realizado
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Detalle de actividades o entregable avanzado..."
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#501f92] focus:bg-white resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#f1f5f9] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="manual-log-form"
            disabled={!selectedTask}
            className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            Cargar Horas
          </button>
        </div>
      </div>
    </div>
  );
};
