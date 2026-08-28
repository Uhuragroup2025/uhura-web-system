import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Check, AlertCircle, Folder, Layers, CheckSquare } from 'lucide-react';
import { TaskItem, TimeLog } from './types';

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

  const [selectedTaskId, setSelectedTaskId] = useState(defaultTaskId || tasks[0]?.id || '');
  const [logDate, setLogDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('30');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [note, setNote] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');

  // Update selectedTaskId when defaultTaskId changes
  useEffect(() => {
    if (defaultTaskId) {
      setSelectedTaskId(defaultTaskId);
    } else if (tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [defaultTaskId, tasks]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks.find((t) => t.id === defaultTaskId) || tasks[0];
  const isDirectTaskMode = Boolean(defaultTaskId && selectedTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = (parseInt(hours || '0', 10) * 3600) + (parseInt(minutes || '0', 10) * 60);
    if (totalSeconds <= 0 || !selectedTask) return;

    // Format date string for human display (e.g. "22 Ago 2026")
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
      startTime,
      endTime,
      isLiveTimer: false,
      date: formattedDate,
      note: note.trim() || 'Carga manual de horas reportadas.',
      deliverableUrl: deliverableUrl.trim()
    });

    onClose();
  };

  return (
    <div
      id="manual-time-log-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="manual-time-log-container"
        className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between border-b border-[#334155] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold shrink-0">
              <Clock className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Carga Manual de Horas</h3>
              <p className="text-[11px] text-[#94a3b8]">Registrar tiempo de ejecución en la tarea</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Miga de pan contextual (Proyecto › Frente › Tarea) - Sin pills ni bordes */}
        {isDirectTaskMode && selectedTask && (
          <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] shrink-0">
            <nav aria-label="Miga de pan" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed">
              <span className="text-[#64748b] font-medium inline-flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                <span>{selectedTask.projectName || selectedTask.board}</span>
              </span>
              <span className="text-[#94a3b8] font-bold select-none">›</span>
              <span className="text-[#501f92] font-semibold">
                {selectedTask.frente || selectedTask.department || 'General'}
              </span>
              <span className="text-[#94a3b8] font-bold select-none">›</span>
              <span className="text-[#0f172a] font-bold">
                {selectedTask.title}
              </span>
            </nav>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 text-xs overflow-y-auto flex-1">
          {/* Only show task selector if NOT in direct task mode */}
          {!isDirectTaskMode && (
            <div>
              <label className="block font-bold text-[#0f172a] mb-1.5">
                Seleccionar Tarea & Cuenta *
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff] cursor-pointer"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.categoryType === 'internal' ? '🏢 Interno' : t.clientName || 'Cliente'}] {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Picker (permite cargar tiempos de ayer, la semana pasada, etc.) */}
          <div>
            <label className="block font-bold text-[#0f172a] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#501f92]" />
              <span>Fecha del trabajo ejecutado *</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-[#64748b] mt-1">
              Puedes registrar horas de hoy o retroactivas de días anteriores.
            </p>
          </div>

          {/* Time Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Horas *</label>
              <input
                type="number"
                min="0"
                max="24"
                required
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Minutos *</label>
              <input
                type="number"
                min="0"
                max="59"
                step="5"
                required
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
              />
            </div>
          </div>

          {/* Time Range (Opcional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#64748b] mb-1">Hora Inicio (opcional)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs font-mono text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#64748b] mb-1">Hora Fin (opcional)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs font-mono text-[#0f172a] focus:outline-none focus:border-[#501f92] focus:bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-[#0f172a] mb-1">
              Descripción de lo realizado
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Detalle de las actividades ejecutadas o entregables..."
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#501f92] focus:bg-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
