import React, { useEffect } from 'react';
import { X, Flame, Plus, CheckCircle2 } from 'lucide-react';
import type { TaskItem, TimeLog } from '../types';
import { useMascotImage } from '../mascot/ecoMascot';
import { formatFriendlyDuration } from './StopTimerRegisterModal';
import { STREAK_MIN_RATIO, streakLabel } from './dayStreak';

/**
 * «Cerrar mi día» con ECO: convierte «llenar horas» en «revisar y confirmar un resumen».
 * Muestra lo registrado hoy por tarea, sugiere las tareas de hoy que no tienen tiempo (sin
 * inventar horas: «Cargar» abre el registro manual con la tarea elegida) y al confirmar marca
 * el día como cerrado. La racha se calcula con las horas reales (dayStreak.ts).
 * Misma estructura visual que «Cargar horas» y «Registrar tiempo».
 */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  todayLabel: string;
  todayLogs: TimeLog[];
  suggestedTasks: TaskItem[];
  loggedHours: number;
  targetDayHours: number;
  streak: number;
  todayCounts: boolean;
  /** Fin de semana, festivo o ausencia: hoy no cuenta ni rompe la racha. */
  todayIsWorkday?: boolean;
  alreadyClosed: boolean;
  onAddTime: (taskId?: string) => void;
  onConfirm: () => void;
}

export const DayCloseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  todayLabel,
  todayLogs,
  suggestedTasks,
  loggedHours,
  targetDayHours,
  streak,
  todayCounts,
  todayIsWorkday = true,
  alreadyClosed,
  onAddTime,
  onConfirm
}) => {
  const ratio = targetDayHours > 0 ? loggedHours / targetDayHours : 0;
  const ecoImg = useMascotImage(!todayIsWorkday ? 'coffee' : ratio >= 1 ? 'celebrating' : ratio >= STREAK_MIN_RATIO ? 'ok' : 'sad');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Agrupa lo registrado hoy por tarea
  const byTask = new Map<string, { title: string; client?: string; seconds: number }>();
  for (const log of todayLogs) {
    const key = log.taskId || log.id;
    const prev = byTask.get(key);
    const title = (log as TimeLog & { taskTitle?: string }).taskTitle || 'Tarea';
    const client = (log as TimeLog & { clientName?: string }).clientName;
    byTask.set(key, { title: prev?.title || title, client: prev?.client || client, seconds: (prev?.seconds || 0) + (log.durationSeconds || 0) });
  }
  const rows = Array.from(byTask.values()).sort((a, b) => b.seconds - a.seconds);

  const missingHours = Math.max(0, targetDayHours * STREAK_MIN_RATIO - loggedHours);
  const ecoLine = !todayIsWorkday
    ? 'Hoy es día libre para tu racha. Si trabajaste algo, regístralo igual 💜'
    : ratio >= 1
      ? '¡Día completo! Revisa que todo esté y lo cerramos 🎉'
      : ratio >= STREAK_MIN_RATIO
      ? 'Vas muy bien. ¿Falta algo antes de cerrar?'
      : `Tu día está a medio cargar 🥺 Te faltan ${missingHours.toFixed(1)} h para que cuente en tu racha.`;
  const nextStreak = todayCounts ? streak : streak + 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-close-title"
      className="fixed inset-0 z-60 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white sm:rounded-2xl shadow-2xl border-0 sm:border sm:border-[#e2e8f0] w-full max-w-lg h-full sm:h-auto overflow-hidden flex flex-col sm:max-h-[92vh] text-[#0f172a] animate-in zoom-in-95 duration-150">
        {/* Encabezado (igual a Cargar horas) */}
        <div className="px-5 sm:px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between border-b border-[#334155] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#d4ff4a]" />
            </div>
            <div>
              <h3 id="day-close-title" className="font-bold text-sm text-white">Cerrar mi día</h3>
              <p className="text-[11px] text-[#94a3b8] first-letter:uppercase">{todayLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-[#94a3b8] hover:text-white p-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ECO + progreso + racha */}
          <div className="flex items-center gap-3">
            <img src={ecoImg} alt="" className="w-16 h-16 object-contain shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-semibold text-[#0f172a] leading-snug">{ecoLine}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ratio >= 1 ? 'bg-[#10b981]' : ratio >= STREAK_MIN_RATIO ? 'bg-[#8a4dff]' : 'bg-[#f59e0b]'}`}
                    style={{ width: `${Math.min(100, ratio * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#334155] shrink-0">
                  {loggedHours.toFixed(1)} / {targetDayHours.toFixed(1)} h
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#fff7ed] border border-[#fed7aa] text-xs text-[#9a3412]">
            <Flame className="w-4 h-4 text-[#ea580c] shrink-0" aria-hidden="true" />
            {!todayIsWorkday ? (
              <span>
                Hoy no cuenta para la racha (fin de semana, festivo o ausencia), y tampoco la rompe.
                {streak > 0 && <> Sigues con <strong>{streakLabel(streak)}</strong>.</>}
              </span>
            ) : todayCounts ? (
              <span>
                <strong>{streakLabel(streak)}</strong> con tu día cargado. ¡Sigue así!
              </span>
            ) : (
              <span>
                {streak > 0 ? (
                  <>
                    Llevas <strong>{streakLabel(streak)}</strong>. Al cargar el 80 % de hoy llegas a <strong>{nextStreak}</strong>.
                  </>
                ) : (
                  <>Carga el 80 % de tu jornada y empiezas tu racha 🔥</>
                )}
              </span>
            )}
          </div>

          {/* Lo registrado hoy */}
          <div>
            <h4 className="font-bold text-xs text-[#0f172a] mb-2">Lo que registraste hoy</h4>
            {rows.length === 0 ? (
              <p className="text-xs text-[#94a3b8] py-3 px-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-center">
                Aún no hay tiempo registrado hoy.
              </p>
            ) : (
              <ul className="divide-y divide-[#f1f5f9] rounded-xl border border-[#e2e8f0] overflow-hidden">
                {rows.map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0f172a] truncate">{r.title}</p>
                      {r.client && <p className="text-[11px] text-[#64748b] truncate">{r.client}</p>}
                    </div>
                    <span className="font-mono font-bold text-[#501f92] shrink-0">{formatFriendlyDuration(r.seconds)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tareas de hoy sin tiempo */}
          {suggestedTasks.length > 0 && (
            <div>
              <h4 className="font-bold text-xs text-[#0f172a] mb-2">¿Trabajaste en alguna de estas?</h4>
              <ul className="space-y-1.5">
                {suggestedTasks.slice(0, 4).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0f172a] truncate">{t.title}</p>
                      <p className="text-[11px] text-[#64748b] truncate">{t.clientName || t.projectName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddTime(t.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#501f92] hover:bg-[#f5f3ff] border border-[#e9d5ff] cursor-pointer shrink-0"
                    >
                      Cargar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Pie (igual a Cargar horas) */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#f1f5f9] flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onAddTime()}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold text-[#501f92] hover:bg-[#f5f3ff] cursor-pointer transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar tiempo
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={alreadyClosed}
            className="px-5 py-2.5 rounded-xl bg-[#501f92] hover:bg-[#381566] disabled:opacity-60 disabled:cursor-default text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            {alreadyClosed ? 'Día cerrado ✓' : 'Confirmar y cerrar el día'}
          </button>
        </div>
      </div>
    </div>
  );
};
