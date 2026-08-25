import React from 'react';
import { Clock, CheckCircle2, Building2, ChevronRight, X, Sparkles, AlertTriangle } from 'lucide-react';

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

export const TimerSummaryModal: React.FC<TimerSummaryModalProps> = ({
  isOpen,
  onClose,
  data,
  onOpenTaskDetail
}) => {
  if (!isOpen || !data) return null;

  // Calculate session time format
  const sessionTotalMin = Math.floor(data.sessionSeconds / 60);
  const sessionSecs = data.sessionSeconds % 60;
  const sessionHours = Math.floor(sessionTotalMin / 60);
  const sessionRemainderMin = sessionTotalMin % 60;

  let sessionFormatted = '';
  if (sessionHours > 0) {
    sessionFormatted = `${sessionHours}h ${sessionRemainderMin}m ${sessionSecs}s`;
  } else if (sessionTotalMin > 0) {
    sessionFormatted = `${sessionTotalMin}m ${sessionSecs}s`;
  } else {
    sessionFormatted = `${sessionSecs}s`;
  }

  // Calculate total consumed format
  const totalTotalMin = Math.floor(data.totalConsumedSeconds / 60);
  const totalHours = Math.floor(totalTotalMin / 60);
  const totalRemainderMin = totalTotalMin % 60;
  const totalConsumedFormatted = `${totalHours}h ${totalRemainderMin}m`;

  const budgetedTotalMin = Math.round(data.budgetedHours * 60);
  const budgetHours = Math.floor(budgetedTotalMin / 60);
  const budgetRemainderMin = budgetedTotalMin % 60;
  const budgetFormatted = `${budgetHours}h ${budgetRemainderMin > 0 ? `${budgetRemainderMin}m` : ''}`;

  const percent = Math.round(
    (data.totalConsumedSeconds / (data.budgetedHours * 3600)) * 100
  );
  const isOverBudget = percent > 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090513]/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#e2e8f0] w-full max-w-md overflow-hidden text-[#0f172a] animate-in zoom-in-95 duration-150">
        {/* Header with Neutral Slate Tone */}
        <div className="p-5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-between border-b border-[#334155]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4ff4a] text-[#140b24] flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Tiempo Registrado con Éxito</h3>
              <p className="text-[11px] text-[#94a3b8]">Resumen de la sesión cargada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Task & Client Info Pill */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
              <Building2 className="w-3.5 h-3.5 text-[#501f92]" />
              <span className="font-bold text-[#0f172a]">{data.clientName}</span>
              <span>/</span>
              <span className="truncate">{data.projectName}</span>
            </div>
            <p className="text-xs font-bold text-[#0f172a] leading-snug">
              {data.taskTitle}
            </p>
          </div>

          {/* Big Session Time Highlight */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-[#f2ecfb] to-[#faf7fd] border border-[#8a4dff]/30 text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-[#501f92] tracking-wider">
              TIEMPO CARGADO EN ESTA SESIÓN
            </span>
            <div className="font-mono text-2xl font-black text-[#501f92] tracking-tight">
              +{sessionFormatted}
            </div>
            <p className="text-[11px] text-[#64748b]">
              Horas sumadas al cómputo de la tarea y timesheet general
            </p>
          </div>

          {/* Total Accumulated vs Budget Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-center space-y-0.5">
              <span className="text-[9px] font-bold text-[#64748b] uppercase block">
                TOTAL CONSUMIDO
              </span>
              <span className="font-mono text-sm font-black text-[#0f172a]">
                {totalConsumedFormatted}
              </span>
              <span className="text-[10px] text-[#64748b] block">acumulado</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-center space-y-0.5">
              <span className="text-[9px] font-bold text-[#64748b] uppercase block">
                PRESUPUESTO
              </span>
              <span className="font-mono text-sm font-black text-[#501f92]">
                {budgetFormatted}
              </span>
              <span className="text-[10px] text-[#64748b] block">pactado</span>
            </div>
          </div>

          {/* Progress Bar & Status */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#64748b] text-[11px]">Avance de Horas:</span>
              <span className={`font-mono ${isOverBudget ? 'text-[#dc2626]' : 'text-[#16a34a]'}`}>
                {percent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#e2e8f0] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverBudget ? 'bg-[#ef4444]' : 'bg-[#10b981]'
                }`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            {isOverBudget && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#dc2626] pt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Esta tarea superó el presupuesto inicial ({percent}%).</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9]">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
            >
              Entendido
            </button>
            {onOpenTaskDetail && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTaskDetail(data.taskId);
                }}
                className="py-2.5 px-3 rounded-xl border border-[#e2e8f0] hover:bg-[#f8fafc] text-xs font-semibold text-[#0f172a] transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>Ver Tarea</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
