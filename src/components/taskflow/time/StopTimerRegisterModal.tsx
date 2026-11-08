import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, RotateCcw } from 'lucide-react';
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
      // If elapsed is less than 1 min, default to at least 1 min for adjusted editor
      setMinutesInput(String(Math.max(1, m)));
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
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^0-9]/g, '');
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
    setMinutesInput(String(Math.max(1, m)));
  };

  const registerLabel = formatFriendlyDuration(currentSessionSeconds);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stop-timer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090513]/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-md overflow-hidden text-[#0f172a] animate-in zoom-in-95 duration-150">
        {/* Encabezado: título + una sola línea de contexto. La X cierra y sigue midiendo (no descarta). */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="stop-timer-modal-title" className="font-bold text-base text-[#0f172a]">
              Registrar tiempo
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5 truncate" title={`${taskTitle} · ${clientName} · ${projectName}`}>
              <span className="font-semibold text-[#334155]">{taskTitle}</span> · {clientName}
            </p>
          </div>
          <button
            type="button"
            onClick={onCloseAndResume}
            aria-label="Cerrar y seguir trabajando"
            title="Cerrar y seguir trabajando"
            className="w-8 h-8 shrink-0 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a] flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {showDiscardConfirm ? (
            <div className="p-4 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#e11d48] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#9f1239]">&iquest;Descartar este tiempo?</h4>
                  <p className="text-xs text-[#be123c] leading-relaxed">
                    Los {formatFriendlyDuration(activeTimer.elapsedSeconds)} medidos en esta sesi&oacute;n no se registrar&aacute;n.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="py-2 px-3.5 rounded-xl border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#334155] transition-colors cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={onDiscardSession}
                  className="py-2 px-3.5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Descartar sesi&oacute;n
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Lo que se va a guardar, en grande */}
              <div className="text-center py-2">
                <span className="text-xs font-semibold text-[#64748b] block">Se registrar&aacute;n</span>
                <div className="font-mono text-4xl font-black text-[#501f92] tracking-tight mt-1">{registerLabel}</div>
                <div className="text-[11px] text-[#64748b] mt-1.5 flex items-center justify-center gap-1.5">
                  {isAdjusting ? (
                    <>
                      <span>Medido {formatFriendlyDuration(activeTimer.elapsedSeconds)} &middot; ajustado a mano</span>
                      <span aria-hidden="true">&middot;</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleResetToMeasured();
                          setIsAdjusting(false);
                        }}
                        className="font-semibold text-[#501f92] hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Usar lo medido
                      </button>
                    </>
                  ) : (
                    <>
                      <span>Tiempo medido con el cron&oacute;metro</span>
                      <span aria-hidden="true">&middot;</span>
                      <button
                        type="button"
                        onClick={() => setIsAdjusting(true)}
                        className="font-semibold text-[#501f92] hover:underline cursor-pointer"
                      >
                        Ajustar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Ajuste: una sola fila, sin cajas anidadas */}
              {isAdjusting && (
                <div className="flex items-end gap-3 animate-in fade-in duration-150">
                  <label className="flex-1">
                    <span className="text-[11px] font-semibold text-[#475569] block mb-1">Horas</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={hoursInput}
                      onChange={handleHoursChange}
                      placeholder="0"
                      aria-label="Horas (sin decimales)"
                      className="w-full px-3 py-2.5 text-sm font-mono font-bold rounded-xl border border-[#cbd5e1] bg-white focus:outline-none focus:ring-2 focus:ring-[#8a4dff] text-[#0f172a]"
                    />
                  </label>
                  <label className="flex-1">
                    <span className="text-[11px] font-semibold text-[#475569] block mb-1">Minutos (0&ndash;59)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={minutesInput}
                      onChange={handleMinutesChange}
                      placeholder="0"
                      aria-label="Minutos (0 - 59)"
                      className="w-full px-3 py-2.5 text-sm font-mono font-bold rounded-xl border border-[#cbd5e1] bg-white focus:outline-none focus:ring-2 focus:ring-[#8a4dff] text-[#0f172a]"
                    />
                  </label>
                </div>
              )}

              {/* Uso de horas de la tarea: una sola barra (solo si tiene horas estimadas) */}
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

              {/* Acciones: destructiva aparte, a la izquierda */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(true)}
                  className="py-2 px-2 -ml-2 rounded-lg text-xs font-semibold text-[#dc2626] hover:bg-[#fef2f2] transition-colors cursor-pointer"
                >
                  Descartar
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onCloseAndResume}
                    className="py-2 px-3.5 rounded-xl border border-[#cbd5e1] hover:bg-[#f8fafc] text-xs font-semibold text-[#334155] transition-colors cursor-pointer"
                  >
                    Seguir trabajando
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleAccept}
                    className="py-2 px-4 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Registrar {registerLabel}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
