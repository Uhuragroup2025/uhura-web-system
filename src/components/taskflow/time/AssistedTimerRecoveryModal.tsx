import React, { useState } from 'react';
import { Clock, AlertTriangle, Check, X, RotateCcw, ShieldAlert, ArrowRight } from 'lucide-react';
import { ActiveTimerState, TaskItem } from '../types';
import { formatDurationCompact } from './timeTrackingEngine';

interface AssistedTimerRecoveryModalProps {
  isOpen: boolean;
  activeTimer: ActiveTimerState;
  task?: TaskItem;
  onConfirmRecovery: (action: 'keep' | 'adjust' | 'discard', adjustedSeconds?: number) => void;
  onClose: () => void;
}

export const AssistedTimerRecoveryModal: React.FC<AssistedTimerRecoveryModalProps> = ({
  isOpen,
  activeTimer,
  task,
  onConfirmRecovery,
  onClose
}) => {
  if (!isOpen) return null;

  const currentElapsedHours = (activeTimer.elapsedSeconds / 3600).toFixed(1);
  const [selectedAction, setSelectedAction] = useState<'adjust' | 'keep' | 'discard'>('adjust');

  // Valores para ajuste asistido
  const [adjustedHours, setAdjustedHours] = useState('3');
  const [adjustedMinutes, setAdjustedMinutes] = useState('30');
  const [adjustmentNote, setAdjustmentNote] = useState('Ajuste asistido: timer quedó encendido fuera de sesión.');

  const handleApply = () => {
    if (selectedAction === 'discard') {
      onConfirmRecovery('discard');
    } else if (selectedAction === 'keep') {
      onConfirmRecovery('keep');
    } else {
      const totalSecs = (parseInt(adjustedHours || '0', 10) * 3600) + (parseInt(adjustedMinutes || '0', 10) * 60);
      onConfirmRecovery('adjust', Math.max(60, totalSecs));
    }
  };

  return (
    <div
      id="assisted-timer-recovery-overlay"
      className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="assisted-timer-recovery-modal"
        className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header con advertencia clara */}
        <div className="px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Revisión Asistida de Timer</h3>
              <p className="text-[11px] text-[#94a3b8]">Protección de precisión en tiempo registrado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5">
          {/* Mensaje principal validado */}
          <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fde68a] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-[#92400e]">
              <p className="font-bold text-sm text-[#78350f]">
                Tu timer lleva {currentElapsedHours}h activo en &ldquo;{activeTimer.taskTitle}&rdquo;
              </p>
              <p className="leading-relaxed">
                Parece que pudo quedar encendido por error tras concluir tu sesión de trabajo. En Orbit protegemos la exactitud de los costos reales sin imponer cortes automáticos arbitrarios.
              </p>
            </div>
          </div>

          {/* Opciones de resolución */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-[#334155] uppercase tracking-wide block">
              ¿Cómo deseas resolver este registro?
            </label>

            {/* Opción 1: Ajustar a tiempo real trabajado */}
            <div
              onClick={() => setSelectedAction('adjust')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                selectedAction === 'adjust'
                  ? 'bg-[#f5f3ff] border-[#8a4dff] shadow-xs ring-1 ring-[#8a4dff]'
                  : 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-white'
              }`}
            >
              <input
                type="radio"
                name="recovery-action"
                checked={selectedAction === 'adjust'}
                onChange={() => setSelectedAction('adjust')}
                className="mt-0.5 text-[#501f92] focus:ring-[#8a4dff]"
              />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-[#0f172a] block">
                  Ajustar a la duración real trabajada (Recomendado)
                </span>
                <p className="text-[#64748b] leading-relaxed">
                  Indica cuánto tiempo le dedicaste efectivamente antes de interrumpir la labor.
                </p>

                {selectedAction === 'adjust' && (
                  <div className="pt-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">Horas</label>
                        <input
                          type="number"
                          min="0"
                          max="12"
                          value={adjustedHours}
                          onChange={(e) => setAdjustedHours(e.target.value)}
                          className="w-20 px-3 py-1.5 rounded-xl border border-[#cbd5e1] font-mono font-bold text-sm bg-white"
                        />
                      </div>
                      <span className="pt-4 font-bold text-slate-400">:</span>
                      <div>
                        <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">Minutos</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          step="5"
                          value={adjustedMinutes}
                          onChange={(e) => setAdjustedMinutes(e.target.value)}
                          className="w-20 px-3 py-1.5 rounded-xl border border-[#cbd5e1] font-mono font-bold text-sm bg-white"
                        />
                      </div>
                      <div className="pt-4 text-xs font-bold text-[#501f92]">
                        Total: {adjustedHours || 0}h {adjustedMinutes || 0}m
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#475569] uppercase block mb-1">
                        Nota de ajuste para auditoría
                      </label>
                      <input
                        type="text"
                        value={adjustmentNote}
                        onChange={(e) => setAdjustmentNote(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#cbd5e1] text-xs bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Opción 2: Conservar duración completa */}
            <div
              onClick={() => setSelectedAction('keep')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                selectedAction === 'keep'
                  ? 'bg-[#f5f3ff] border-[#8a4dff] shadow-xs ring-1 ring-[#8a4dff]'
                  : 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-white'
              }`}
            >
              <input
                type="radio"
                name="recovery-action"
                checked={selectedAction === 'keep'}
                onChange={() => setSelectedAction('keep')}
                className="mt-0.5 text-[#501f92] focus:ring-[#8a4dff]"
              />
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-[#0f172a] block">
                  Conservar la duración registrada ({currentElapsedHours}h)
                </span>
                <p className="text-[#64748b]">
                  El tiempo fue real (e.g. jornada extendida de despliegue, rodaje o guardia técnica).
                </p>
              </div>
            </div>

            {/* Opción 3: Descartar si fue error completo */}
            <div
              onClick={() => setSelectedAction('discard')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                selectedAction === 'discard'
                  ? 'bg-[#fef2f2] border-[#ef4444] shadow-xs ring-1 ring-[#ef4444]'
                  : 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-white'
              }`}
            >
              <input
                type="radio"
                name="recovery-action"
                checked={selectedAction === 'discard'}
                onChange={() => setSelectedAction('discard')}
                className="mt-0.5 text-[#dc2626] focus:ring-[#ef4444]"
              />
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-[#dc2626] block">
                  Descartar timer (Fue un error / no hubo trabajo)
                </span>
                <p className="text-[#64748b]">
                  El cronómetro quedó corriendo sin ejecución de tareas. No se guardará ningún registro en la base de datos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
          >
            Decidir luego
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#43197a] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#d4ff4a]" />
            <span>Confirmar y Guardar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
