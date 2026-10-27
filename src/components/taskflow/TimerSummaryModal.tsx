import React from 'react';
import { Clock, CheckCircle2, Building2, ChevronRight, X, AlertTriangle } from 'lucide-react';

export interface TimerSummaryData {
  taskId: string;
  taskTitle: string;
  clientName: string;
  projectName: string;
  sessionSeconds: number;
  totalConsumedSeconds: number;
  budgetedHours: number;
}

interface TimerSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TimerSummaryData | null;
  onOpenTaskDetail?: (taskId: string) => void;
}

const formatFriendlyTime = (seconds: number): string => {
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

export const TimerSummaryModal: React.FC<TimerSummaryModalProps> = ({
  isOpen,
  onClose,
  data,
  onOpenTaskDetail
}) => {
  if (!isOpen || !data) return null;

  // 1. Session formatted (friendly label: "Registrado ahora")
  const sessionFormatted = formatFriendlyTime(data.sessionSeconds);

  // 2. Budgeted seconds vs Total registered
  const budgetedSeconds = Math.round(data.budgetedHours * 3600);
  const totalConsumedSeconds = data.totalConsumedSeconds;
  const availableSeconds = budgetedSeconds - totalConsumedSeconds;

  // Total registered formatted
  const totalTotalMin = Math.floor(totalConsumedSeconds / 60);
  const totalHours = Math.floor(totalTotalMin / 60);
  const totalRemainderMin = totalTotalMin % 60;
  const totalConsumedFormatted = totalHours > 0
    ? `${totalHours} h ${totalRemainderMin > 0 ? `${totalRemainderMin} min` : ''}`.trim()
    : `${totalRemainderMin} min`;

  // Available hours calculation: horas estimadas - total registrado
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

  // 3. Indicador: Uso de horas estimadas (consumo, no avance)
  const percent = budgetedSeconds > 0
    ? Math.round((totalConsumedSeconds / budgetedSeconds) * 100)
    : 100;

  // Regla visual:
  // - menor al 80 %: verde
  // - desde 80 % y menor al 100 %: amarillo/advertencia
  // - 100 % o más: rojo/riesgo
  let indicatorColorClass = 'text-emerald-600';
  let barColorClass = 'bg-emerald-500';
  if (percent >= 100) {
    indicatorColorClass = 'text-rose-600';
    barColorClass = 'bg-rose-500';
  } else if (percent >= 80) {
    indicatorColorClass = 'text-amber-500';
    barColorClass = 'bg-amber-500';
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-summary-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090513]/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-md overflow-hidden text-[#0f172a] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-between border-b border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#10b981] text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="timer-summary-title" className="font-bold text-sm text-white">
                Tiempo registrado
              </h3>
              <p className="text-[11px] text-[#94a3b8]">
                El tiempo ya se sum&oacute; a esta tarea.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X className="w-5 h-5 text-white" strokeWidth={2.25} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Contexto: cliente, proyecto, tarea */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
              <Building2 className="w-3.5 h-3.5 text-[#501f92] shrink-0" />
              <span className="font-bold text-[#0f172a] truncate">{data.clientName}</span>
              <span>/</span>
              <span className="truncate">{data.projectName}</span>
            </div>
            <p className="text-xs font-bold text-[#0f172a] leading-snug line-clamp-2">
              {data.taskTitle}
            </p>
          </div>

          {/* Resumen: Registrado ahora & Tiempo disponible */}
          <div className="grid grid-cols-2 gap-3">
            {/* Registrado ahora */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#f2ecfb] to-[#faf7fd] border border-[#8a4dff]/30 text-center space-y-1">
              <span className="text-xs font-bold text-[#501f92] block">
                Registrado ahora
              </span>
              <div className="font-mono text-xl font-black text-[#501f92] tracking-tight">
                {sessionFormatted}
              </div>
              <span className="text-[10px] text-[#64748b] block">en esta sesi&oacute;n</span>
            </div>

            {/* Tiempo disponible (horas estimadas − total registrado) */}
            <div
              className={`p-3.5 rounded-2xl border text-center space-y-1 ${
                isOverBudget
                  ? 'bg-[#fff1f2] border-[#fecdd3]'
                  : 'bg-[#f8fafc] border-[#e2e8f0]'
              }`}
            >
              <span
                className={`text-xs font-bold block ${
                  isOverBudget ? 'text-[#be123c]' : 'text-[#64748b]'
                }`}
              >
                Tiempo disponible
              </span>
              <div
                className={`font-mono text-xl font-black tracking-tight ${
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
                {isOverBudget ? 'exceso de horas' : `de ${data.budgetedHours} h estimadas`}
              </span>
            </div>
          </div>

          {/* Indicador: Uso de horas estimadas */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#475569] text-xs">Uso de horas estimadas</span>
              <span className={`font-mono text-xs font-bold ${indicatorColorClass}`}>
                {percent} % de las horas utilizadas
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#e2e8f0] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            {isOverBudget && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#be123c] pt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#e11d48]" />
                <span>Esta tarea super&oacute; las horas estimadas inicialmente ({percent} %).</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9]">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
            >
              Aceptar
            </button>
            {onOpenTaskDetail && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTaskDetail(data.taskId);
                }}
                className="py-2.5 px-3.5 rounded-xl border border-[#cbd5e1] hover:bg-[#f8fafc] text-xs font-semibold text-[#0f172a] transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>Ver tarea</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
