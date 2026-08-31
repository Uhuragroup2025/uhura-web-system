import React from 'react';
import { Clock, Plus, Building2, Trash2, Link2 } from 'lucide-react';
import { TimeLog } from './types';

interface BandejaDelDiaWidgetProps {
  timeLogs: TimeLog[];
  onOpenManualModal: () => void;
  onDeleteLog?: (id: string) => void;
  onOpenTaskDetail?: (taskId: string) => void;
}

export const BandejaDelDiaWidget: React.FC<BandejaDelDiaWidgetProps> = ({
  timeLogs,
  onOpenManualModal,
  onDeleteLog,
  onOpenTaskDetail
}) => {
  const targetDaySeconds = 8 * 3600; // 8 hours standard day (28,800 seconds)

  const totalLoggedSeconds = timeLogs.reduce((acc, log) => acc + log.durationSeconds, 0);
  const clientSeconds = timeLogs
    .filter((l) => l.categoryType !== 'internal')
    .reduce((acc, log) => acc + log.durationSeconds, 0);
  const internalSeconds = timeLogs
    .filter((l) => l.categoryType === 'internal')
    .reduce((acc, log) => acc + log.durationSeconds, 0);

  const totalHours = totalLoggedSeconds / 3600;
  const clientHours = clientSeconds / 3600;
  const internalHours = internalSeconds / 3600;

  const percentFilled = Math.min(100, (totalLoggedSeconds / targetDaySeconds) * 100);
  const remainingHours = Math.max(0, 8.0 - totalHours);

  // Semáforo de avance:
  // - Verde (>= 90%): Carga óptima o completa
  // - Naranja (60% - 89%): En proceso
  // - Rojo (< 60%): Carga muy baja
  const progressColor = percentFilled >= 90
    ? 'bg-[#10b981]'
    : percentFilled >= 60
    ? 'bg-[#f59e0b]'
    : 'bg-[#ef4444]';

  const badgeBg = percentFilled >= 90
    ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
    : percentFilled >= 60
    ? 'bg-[#fffbeb] text-[#d97706] border-[#fde68a]'
    : 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';

  const badgeText = percentFilled >= 90
    ? '✓ Jornada Óptima (≥90%)'
    : percentFilled >= 60
    ? '⚡ En Progreso (60% - 89%)'
    : '⏳ Carga Pendiente (<60%)';

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e2e8f0] shadow-xs space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f2ecfb] text-[#501f92] border border-[#8a4dff]/20">
              Bandeja del Día · Jornada de 8 Horas
            </span>
            <span className="text-xs text-[#64748b]">• Hoy, 22 Agosto 2026</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#0f172a] mt-1 tracking-tight">
            Timeline de Horas Cargadas vs. Capacidad Diaria (8.0h)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManualModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cargar horas</span>
          </button>
        </div>
      </div>

      {/* Progress Bar with Semaphoring (>90% Verde, 60-89% Naranja, <60% Rojo) */}
      <div className="space-y-2 bg-[#f8fafc] p-3.5 sm:p-4 rounded-2xl border border-[#e2e8f0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#0f172a]">
              Total Cargado: <strong className="font-mono text-sm">{totalHours.toFixed(1)}h / 8.0h</strong>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
              {badgeText}
            </span>
          </div>
          <span className="text-[#64748b] text-[11px] sm:text-xs font-medium">
            {remainingHours > 0 ? `Restante para 8h: ${remainingHours.toFixed(1)}h` : '¡Jornada de 8h completada!'}
          </span>
        </div>

        {/* Barra de Progreso Unificada con Lógica Semafórica */}
        <div className="w-full h-3 bg-[#e2e8f0] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${percentFilled}%` }}
            className={`h-full transition-all duration-500 rounded-full ${progressColor}`}
            title={`Avance: ${Math.round(percentFilled)}% (${totalHours.toFixed(1)}h / 8.0h)`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#64748b] pt-0.5">
          <span className="font-medium">Meta diaria requerida: <strong>≥ 5.6h (70%)</strong></span>
          <span className="font-bold font-mono text-[#0f172a]">{Math.round(percentFilled)}%</span>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
          Registros de Hoy ({timeLogs.length})
        </h4>

        {timeLogs.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-[#e2e8f0] rounded-2xl">
            <Clock className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
            <p className="text-xs font-medium text-[#64748b]">Aún no has registrado horas hoy.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeLogs.map((log) => {
              const hours = log.durationSeconds / 3600;
              const isInternal = log.categoryType === 'internal';

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#8a4dff]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isInternal ? 'bg-[#f2ecfb] text-[#501f92]' : 'bg-[#eff6ff] text-[#2563eb]'
                      }`}>
                        {isInternal ? '🏢 Uhura Interno' : log.clientName}
                      </span>
                      <span className="text-xs font-bold text-[#0f172a]">
                        {log.taskTitle}
                      </span>
                    </div>

                    {log.note && (
                      <p className="text-xs text-[#64748b]">{log.note}</p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-[#94a3b8]">
                      <span>{log.date}</span>
                      {log.startTime && log.endTime && (
                        <span>• {log.startTime} - {log.endTime}</span>
                      )}
                      <span>• {log.userName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="font-mono text-sm font-black text-[#501f92] bg-[#f2ecfb] px-2.5 py-1 rounded-lg">
                      {hours.toFixed(2)}h
                    </span>

                    {onDeleteLog && (
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
