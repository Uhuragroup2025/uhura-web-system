import React, { useState, useEffect } from 'react';
import { Clock, X, AlertTriangle, Play, Check, ChevronDown, ChevronUp, RotateCcw, Building2 } from 'lucide-react';
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
  const taskBudgetedHours = task?.budgetedHours || 2;
  const budgetedSeconds = Math.round(taskBudgetedHours * 3600);
  const previousConsumedSeconds = task?.consumedSeconds || 0;
  const projectedConsumedSeconds = previousConsumedSeconds + currentSessionSeconds;
  const availableSeconds = budgetedSeconds - projectedConsumedSeconds;

  const isOverBudget = availableSeconds < 0;
  const absAvailableSeconds = Math.abs(availableSeconds);
  const absAvailTotalMin = Math.floor(absAvailableSeconds / 60);
  const availHours = Math.floor(absAvailTotalMin / 60);
  const availRemainderMin = absAvailTotalMin % 60;

  let availableFormatted = '';
  if (availHours > 0) {
    availableFormatted = `${availHours} h ${availRemainderMin > 0 ? `${availRemainderMin} min` : ''}`.trim();
  } else if (absAvailTotalMin > 0) {
    availableFormatted = `${absAvailTotalMin} min`;
  } else {
    availableFormatted = '0 min';
  }

  const percent = budgetedSeconds > 0
    ? Math.round((projectedConsumedSeconds / budgetedSeconds) * 100)
    : 100;

  let indicatorColorClass = 'text-emerald-600';
  let barColorClass = 'bg-emerald-500';
  if (percent >= 100) {
    indicatorColorClass = 'text-rose-600';
    barColorClass = 'bg-rose-500';
  } else if (percent >= 80) {
    indicatorColorClass = 'text-amber-500';
    barColorClass = 'bg-amber-500';
  }

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stop-timer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090513]/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] w-full max-w-md overflow-hidden text-[#0f172a] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-between border-b border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#501f92] text-[#c084fc] border border-[#a855f7]/30 flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="stop-timer-modal-title" className="font-bold text-sm text-white">
                Registrar tiempo
              </h3>
              <p className="text-[11px] text-[#94a3b8] truncate max-w-[240px]">
                {clientName} &middot; {projectName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDiscardConfirm(true)}
            aria-label="Descartar tiempo"
            title="Descartar tiempo"
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X className="w-5 h-5 text-white" strokeWidth={2.25} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Subtle breadcrumb context for task */}
          <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
              <Building2 className="w-3.5 h-3.5 text-[#501f92] shrink-0" />
              <span className="font-bold text-[#0f172a] truncate">{clientName}</span>
              <span>/</span>
              <span className="truncate">{projectName}</span>
            </div>
            <p className="text-xs font-semibold text-[#0f172a] leading-snug line-clamp-1">
              {taskTitle}
            </p>
          </div>

          {/* Confirmation screen for discard */}
          {showDiscardConfirm ? (
            <div className="p-4 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#e11d48] text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#9f1239]">
                    &iquest;Descartar este tiempo?
                  </h4>
                  <p className="text-xs text-[#be123c] leading-relaxed">
                    El tiempo medido en esta sesi&oacute;n no se registrar&aacute;.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#fecdd3]/60">
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
                  className="py-2 px-3.5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Descartar sesi&oacute;n
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Highlight measured time */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#f2ecfb] to-[#faf7fd] border border-[#8a4dff]/30 text-center space-y-0.5">
                <span className="text-xs font-bold text-[#501f92] block">
                  Tiempo medido
                </span>
                <div className="font-mono text-3xl font-black text-[#501f92] tracking-tight">
                  {formatFriendlyDuration(activeTimer.elapsedSeconds)}
                </div>
              </div>

              {/* Secondary action: Ajustar duración */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsAdjusting(!isAdjusting)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f1f5f9] text-xs font-semibold text-[#334155] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#501f92]" />
                    <span>Ajustar duraci&oacute;n</span>
                  </span>
                  <span className="text-[#64748b] text-[11px] font-normal flex items-center gap-1">
                    {isAdjusting ? (
                      <>
                        <span>Ocultar ajuste</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Editar horas y minutos</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </span>
                </button>

                {isAdjusting && (
                  <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-3 animate-in fade-in duration-150">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-[#475569]">
                          Horas y minutos
                        </span>
                        <button
                          type="button"
                          onClick={handleResetToMeasured}
                          className="text-[11px] font-semibold text-[#501f92] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restablecer
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={hoursInput}
                            onChange={handleHoursChange}
                            placeholder="0"
                            aria-label="Horas (sin decimales)"
                            className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-[#cbd5e1] bg-white focus:outline-none focus:ring-2 focus:ring-[#8a4dff] text-[#0f172a]"
                          />
                          <span className="text-[11px] text-[#64748b] block mt-1">Horas (sin decimales)</span>
                        </div>
                        <div>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={minutesInput}
                            onChange={handleMinutesChange}
                            placeholder="0"
                            aria-label="Minutos (0 - 59)"
                            className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-[#cbd5e1] bg-white focus:outline-none focus:ring-2 focus:ring-[#8a4dff] text-[#0f172a]"
                          />
                          <span className="text-[11px] text-[#64748b] block mt-1">Minutos (0 - 59)</span>
                        </div>
                      </div>
                    </div>

                    {/* Resumen dinámico en el ajuste: Registrado ahora & Tiempo disponible */}
                    <div className="pt-2.5 border-t border-[#e2e8f0] space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Registrado ahora */}
                        <div className="p-3 rounded-xl bg-white border border-[#e2e8f0] text-center space-y-0.5">
                          <span className="text-[11px] font-bold text-[#501f92] block">
                            Registrado ahora
                          </span>
                          <div className="font-mono text-base font-black text-[#501f92]">
                            {formatFriendlyDuration(currentSessionSeconds)}
                          </div>
                          <span className="text-[10px] text-[#64748b] block">en esta sesi&oacute;n</span>
                        </div>

                        {/* Tiempo disponible */}
                        <div
                          className={`p-3 rounded-xl border text-center space-y-0.5 ${
                            isOverBudget
                              ? 'bg-[#fff1f2] border-[#fecdd3]'
                              : 'bg-white border-[#e2e8f0]'
                          }`}
                        >
                          <span
                            className={`text-[11px] font-bold block ${
                              isOverBudget ? 'text-[#be123c]' : 'text-[#64748b]'
                            }`}
                          >
                            Tiempo disponible
                          </span>
                          <div
                            className={`font-mono text-base font-black ${
                              isOverBudget ? 'text-[#e11d48]' : 'text-[#0f172a]'
                            }`}
                          >
                            {isOverBudget ? `-${availableFormatted}` : availableFormatted}
                          </div>
                          <span
                            className={`text-[10px] font-medium block ${
                              isOverBudget ? 'text-[#be123c]' : 'text-[#64748b]'
                            }`}
                          >
                            {isOverBudget ? 'exceso de horas' : `de ${taskBudgetedHours} h estimadas`}
                          </span>
                        </div>
                      </div>

                      {/* Barrita de uso de horas */}
                      <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#475569] font-medium">Uso de horas estimadas</span>
                          <span className={`font-mono text-xs font-bold ${indicatorColorClass}`}>
                            {percent} % de las horas utilizadas
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2.5 pt-2.5 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={onCloseAndResume}
                  className="py-2 px-3.5 rounded-xl border border-[#cbd5e1] hover:bg-[#f1f5f9] text-xs font-semibold text-[#334155] transition-colors cursor-pointer"
                >
                  Seguir trabajando
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDiscardConfirm(true)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold text-[#dc2626] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                  >
                    Descartar tiempo
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleAccept}
                    className="py-2 px-4 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Aceptar
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
