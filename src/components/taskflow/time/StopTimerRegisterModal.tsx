import React, { useState, useEffect } from 'react';
import { Clock, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { ActiveTimerState, TaskItem } from '../types';

interface StopTimerRegisterModalProps {
  isOpen: boolean;
  activeTimer: ActiveTimerState | null;
  task?: TaskItem | null;
  onCloseAndResume: () => void;
  onDiscardSession: () => void;
  onConfirmRegistration: (finalSeconds: number, isAdjusted: boolean) => void;
}

export const formatFriendlyDuration = (seconds: number): string => {
  const safeSec = Math.max(0, Math.floor(seconds));
  const totalMin = Math.floor(safeSec / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const s = safeSec % 60;

  if (h > 0) {
    return m > 0 ? `${h} h ${m} min` : `${h} h`;
  }
  if (m > 0) {
    return s > 0 ? `${m} min ${s} s` : `${m} min`;
  }
  return `${s} s`;
};

export const StopTimerRegisterModal: React.FC<StopTimerRegisterModalProps> = ({
  isOpen,
  activeTimer,
  task,
  onCloseAndResume,
  onDiscardSession,
  onConfirmRegistration
}) => {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [hoursInput, setHoursInput] = useState('0');
  const [minutesInput, setMinutesInput] = useState('0');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset input values whenever modal opens or timer changes
  useEffect(() => {
    if (isOpen && activeTimer) {
      const totalSec = activeTimer.elapsedSeconds;
      const totalMin = Math.floor(totalSec / 60);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      setHoursInput(String(h));
      setMinutesInput(String(m).padStart(2, '0'));
      setIsAdjusting(false);
      setShowDiscardConfirm(false);
      setIsSubmitting(false);
    }
  }, [isOpen, activeTimer?.taskId, activeTimer?.startTime]);

  // Esc = cerrar y seguir trabajando (nunca descarta el tiempo)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseAndResume();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCloseAndResume]);

  if (!isOpen || !activeTimer) return null;

  const clientName = activeTimer.clientName || task?.clientName || 'Cliente';
  const projectName = activeTimer.projectName || task?.projectName || task?.board || 'Proyecto';
  const taskTitle = activeTimer.taskTitle || task?.title || 'Tarea';

  // Sanitized integer hours and minutes (strictly no decimals in hours)
  const parsedHours = Math.max(0, parseInt(hoursInput || '0', 10) || 0);
  const parsedMinutes = Math.min(59, Math.max(0, parseInt(minutesInput || '0', 10) || 0));
  const adjustedTotalSeconds = (parsedHours * 3600) + (parsedMinutes * 60);

  // Dynamic calculation of projected budget metrics for the adjustment panel
  const currentSessionSeconds = isAdjusting
    ? Math.max(60, adjustedTotalSeconds)
    : activeTimer.elapsedSeconds;
  // Solo se muestra el uso de horas si la tarea tiene horas estimadas reales (no se inventan).
  const taskBudgetedHours = task?.budgetedHours || 0;
  const hasBudget = taskBudgetedHours > 0;
  const budgetedSeconds = Math.round(taskBudgetedHours * 3600);
  const previousConsumedSeconds = task?.consumedSeconds || 0;
  const projectedConsumedSeconds = previousConsumedSeconds + currentSessionSeconds;
  const availableSeconds = budgetedSeconds - projectedConsumedSeconds;
  const isOverBudget = availableSeconds < 0;
  // Lo usado se redondea hacia abajo y lo restante hacia arriba, para que ambos sumen lo estimado.
  const availableFormatted = formatFriendlyDuration(
    (isOverBudget ? Math.floor(-availableSeconds / 60) : Math.ceil(availableSeconds / 60)) * 60
  );
  const percent = hasBudget ? Math.round((projectedConsumedSeconds / budgetedSeconds) * 100) : 0;
  const barColorClass = percent >= 100 ? 'bg-[#e11d48]' : percent >= 80 ? 'bg-[#f59e0b]' : 'bg-[#10b981]';
  const budgetTextClass = percent >= 100 ? 'text-[#be123c]' : percent >= 80 ? 'text-[#b45309]' : 'text-[#64748b]';

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digit characters to strictly prevent decimals (no '.' or ',')
    const sanitized = e.target.value.replace(/[^0-9]/g, '');
    setHoursInput(sanitized);
    setIsAdjusting(true);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^0-9]/g, '');
    setIsAdjusting(true);
    if (!sanitized) {
      setMinutesInput('');
      return;
    }
    const num = parseInt(sanitized, 10);
    setMinutesInput(String(Math.min(59, Math.max(0, num))));
  };

  const handleAccept = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (isAdjusting) {
      const finalSec = Math.max(60, adjustedTotalSeconds);
      onConfirmRegistration(finalSec, true);
    } else {
      onConfirmRegistration(activeTimer.elapsedSeconds, false);
    }
  };

  const handleResetToMeasured = () => {
    const totalSec = activeTimer.elapsedSeconds;
    const totalMin = Math.floor(totalSec / 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    setHoursInput(String(h));
    setMinutesInput(String(m).padStart(2, '0'));
    setIsAdjusting(false);
  };

  const registerLabel = formatFriendlyDuration(currentSessionSeconds);
  const measuredLabel = formatFriendlyDuration(activeTimer.elapsedSeconds);

  // Misma estructura visual que «Cargar horas» (registro manual): encabezado oscuro, banda de
  // tarea seleccionada, campos de horas y minutos con sufijo y pie con la acción principal.
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stop-timer-modal-title"
      className="fixed inset-0 z-60 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white sm:rounded-2xl shadow-2xl border-0 sm:border sm:border-[#e2e8f0] w-full max-w-lg h-full sm:h-auto overflow-hidden flex flex-col sm:max-h-[92vh] text-[#0f172a] animate-in zoom-in-95 duration-150">
        {/* Encabezado (igual a Cargar horas). La X cierra y el cronómetro sigue. */}
        <div className="px-5 sm:px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between border-b border-[#334155] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#d4ff4a]" />
            </div>
            <div>
              <h3 id="stop-timer-modal-title" className="font-bold text-sm text-white">Registrar tiempo</h3>
              <p className="text-[11px] text-[#94a3b8]">Tiempo medido con el cronómetro</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseAndResume}
            aria-label="Cerrar y seguir trabajando"
            title="Cerrar y seguir trabajando (el cronómetro sigue)"
            className="text-[#94a3b8] hover:text-white p-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarea seleccionada (igual a Cargar horas) */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] shrink-0">
          <span className="text-[10px] font-bold uppercase text-[#64748b] block mb-1">Tarea seleccionada</span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#64748b]">
            <span className="font-bold text-[#501f92]">{clientName}</span>
            <span className="text-[#94a3b8] font-bold">›</span>
            <span className="font-semibold text-[#334155]">{projectName}</span>
            <span className="text-[#94a3b8] font-bold">›</span>
            <span className="font-bold text-[#0f172a]">{taskTitle}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {showDiscardConfirm ? (
            <div className="p-4 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#e11d48] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#9f1239]">&iquest;Descartar este tiempo?</h4>
                  <p className="text-xs text-[#be123c] leading-relaxed">
                    Los {measuredLabel} medidos en esta sesi&oacute;n no se registrar&aacute;n.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-white cursor-pointer transition-colors"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={onDiscardSession}
                  className="px-5 py-2.5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Descartar sesi&oacute;n
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Duración: siempre visible y editable directamente */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-xs text-[#0f172a]">Duraci&oacute;n del trabajo *</label>
                  <span className="px-2 py-0.5 rounded-lg bg-[#f2ecfb] text-[10px] font-bold text-[#501f92]">
                    Cron&oacute;metro: {measuredLabel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl focus-within:border-[#501f92] focus-within:bg-white">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={hoursInput}
                      onChange={handleHoursChange}
                      placeholder="0"
                      aria-label="Horas (sin decimales)"
                      className="w-full text-sm font-mono font-bold text-[#0f172a] bg-transparent focus:outline-none"
                    />
                    <span className="text-xs font-bold text-[#64748b] select-none">horas</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-2 rounded-xl focus-within:border-[#501f92] focus-within:bg-white">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={minutesInput}
                      onChange={handleMinutesChange}
                      placeholder="00"
                      aria-label="Minutos (0 - 59)"
                      className="w-full text-sm font-mono font-bold text-[#0f172a] bg-transparent focus:outline-none"
                    />
                    <span className="text-xs font-bold text-[#64748b] select-none">minutos</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#64748b] mt-1.5">
                  {isAdjusting ? (
                    <>
                      Ajustado a mano (m&iacute;nimo 1 min).{' '}
                      <button
                        type="button"
                        onClick={handleResetToMeasured}
                        className="font-bold text-[#501f92] hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Usar lo medido ({measuredLabel})
                      </button>
                    </>
                  ) : (
                    <>Se registra lo medido. Si necesitas corregirlo, cambia las horas o los minutos.</>
                  )}
                </p>
              </div>

              {/* Uso de horas de la tarea (solo si tiene horas estimadas reales) */}
              {hasBudget && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-[#475569]">
                      Con este registro: <strong className="text-[#0f172a]">{formatFriendlyDuration(Math.floor(projectedConsumedSeconds / 60) * 60)}</strong> de {taskBudgetedHours} h estimadas
                    </span>
                    <span className={`font-semibold shrink-0 ${budgetTextClass}`}>
                      {isOverBudget ? `Se pasa ${availableFormatted}` : `Quedan ${availableFormatted}`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Uso de horas estimadas">
                    <div className={`h-full rounded-full transition-all duration-300 ${barColorClass}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pie (igual a Cargar horas, con Descartar aparte a la izquierda) */}
        {!showDiscardConfirm && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#f1f5f9] flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowDiscardConfirm(true)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold text-[#dc2626] hover:bg-[#fef2f2] cursor-pointer transition-colors"
            >
              Descartar
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCloseAndResume}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer transition-colors"
              >
                Seguir trabajando
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAccept}
                className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Registrar {registerLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
