import React from 'react';
import { AlertCircle, Play, Square, X } from 'lucide-react';
import { ActiveTimerState, TaskItem } from '../types';
import { formatDurationCompact } from './timeTrackingEngine';

interface ConflictTimerModalProps {
  isOpen: boolean;
  activeTimer: ActiveTimerState | null;
  pendingTask: TaskItem | null;
  onConfirmSwitch: () => void;
  onCancel: () => void;
}

/**
 * Modal interactivo de resolución de conflicto de Timer.
 * En Orbit solo puede existir un único timer global activo.
 * Si el usuario intenta iniciar un timer en otra tarea mientras ya hay uno corriendo,
 * esta interfaz explícita le permite:
 * 1. Detener y registrar la sesión del timer actual para luego iniciar el nuevo.
 * 2. Cancelar la acción para continuar en la tarea actual sin transferencias silenciosas.
 */
export const ConflictTimerModal: React.FC<ConflictTimerModalProps> = ({
  isOpen,
  activeTimer,
  pendingTask,
  onConfirmSwitch,
  onCancel
}) => {
  if (!isOpen || !activeTimer || !pendingTask) return null;

  return (
    <div
      id="conflict-timer-modal-overlay"
      className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="conflict-timer-modal"
        className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#0f172a] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Timer Activo en Curso</h3>
              <p className="text-[11px] text-[#94a3b8]">Solo puede existir un timer global activo</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-[#334155] leading-relaxed">
            Ya tienes un cronómetro activo corriendo en otra tarea. Orbit no reasigna ni transfiere tiempo silenciosamente entre tareas para proteger la exactitud de los costos reales.
          </p>

          {/* Tarea actualmente cronometrada */}
          <div className="p-3.5 rounded-2xl bg-[#fffbeb] border border-[#fde68a] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b45309]">Timer en curso</span>
              <span className="font-mono font-bold text-xs text-[#b45309]">
                {formatDurationCompact(activeTimer.elapsedSeconds)}
              </span>
            </div>
            <p className="font-bold text-sm text-[#0f172a] truncate">{activeTimer.taskTitle}</p>
            <p className="text-[11px] text-[#64748b]">
              {activeTimer.clientName} {activeTimer.projectName ? `· ${activeTimer.projectName}` : ''}
            </p>
          </div>

          {/* Nueva tarea solicitada */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Nueva tarea a iniciar</span>
            <p className="font-bold text-sm text-[#0f172a] truncate">{pendingTask.title}</p>
            <p className="text-[11px] text-[#64748b]">
              {pendingTask.clientName || 'Cliente'} {pendingTask.projectName ? `· ${pendingTask.projectName}` : ''}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-bold text-[#64748b] hover:text-[#0f172a] rounded-xl hover:bg-[#e2e8f0]/60 transition-colors cursor-pointer"
          >
            Continuar timer actual
          </button>
          <button
            type="button"
            onClick={onConfirmSwitch}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#43197a] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 text-[#d4ff4a] fill-[#d4ff4a]" />
            <span>Detener, registrar e iniciar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
