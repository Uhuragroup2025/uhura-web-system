import React, { useState } from 'react';
import { X, Clock, FileText, Check } from 'lucide-react';
import { TaskItem, TimeLog } from './types';

interface ManualTimeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  defaultTaskId?: string;
  onSaveManualLog: (log: Omit<TimeLog, 'id' | 'date'>) => void;
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
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('30');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [note, setNote] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = (parseInt(hours || '0', 10) * 3600) + (parseInt(minutes || '0', 10) * 60);
    if (totalSeconds <= 0 || !selectedTask) return;

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
      note: note.trim() || 'Carga manual de horas reportadas.',
      deliverableUrl: deliverableUrl.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090513]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-between border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#d4ff4a]" />
            <div>
              <h3 className="font-bold text-sm">Carga Manual de Horas</h3>
              <p className="text-[11px] text-[#94a3b8]">Registrar bloques de tiempo completados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Task Select */}
          <div>
            <label className="block font-bold text-[#0f172a] mb-1">
              Seleccionar Tarea & Cuenta *
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff]"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.categoryType === 'internal' ? '🏢 Interno' : t.clientName || 'Cliente'}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Time Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Horas</label>
              <input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-[#0f172a]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Minutos</label>
              <input
                type="number"
                min="0"
                max="59"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-[#0f172a]"
              />
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Hora Inicio</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs font-mono text-[#0f172a]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Hora Fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl text-xs font-mono text-[#0f172a]"
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
              placeholder="Detalle de las actividades ejecutadas..."
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/20 focus:border-[#8a4dff]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Guardar en la Bandeja del Día
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
