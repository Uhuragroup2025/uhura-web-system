import React from 'react';
import { CalendarClock } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import type { PhaseOverflow } from '../schedule/clientTimeline';

/**
 * Tarea → cronograma (19 Nov 2026): la nueva fecha de una tarea pasa el fin de la producción de su
 * fase. El cambio no se aplica en silencio: se muestra qué se corre (presentaciones, entrega) y el
 * líder decide si extiende la fase o deja solo la tarea movida (queda en riesgo).
 */
export const PhaseOverflowModal: React.FC<{
  taskTitle: string;
  overflow: PhaseOverflow;
  onExtend: () => void;
  onKeepTaskOnly: () => void;
  /** Textos opcionales para otros motivos (p. ej. un insumo que llegó tarde). */
  title?: string;
  description?: React.ReactNode;
  hint?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}> = ({ taskTitle, overflow, onExtend, onKeepTaskOnly, title, description, hint, confirmLabel, cancelLabel }) => {
  const { before, after, phaseIndex, phaseName, extraDays } = overflow;
  // Hitos que cambian: presentaciones y fines de fase desde la fase afectada
  const changes = after.phases.slice(phaseIndex).flatMap((ph, k) => {
    const prev = before.phases[phaseIndex + k];
    const rows: { label: string; from: string; to: string }[] = [];
    ph.rounds.forEach((r, j) => {
      const was = prev?.rounds[j]?.presentation;
      if (was && was !== r.presentation) rows.push({ label: `Presentación · ${ph.name}`, from: was, to: r.presentation });
    });
    return rows;
  });
  const endChanged = before.endDate !== after.endDate;

  return (
    <div className="fixed inset-0 z-[90] bg-[#0f172a]/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="phase-overflow-title">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#e2e8f0] shadow-2xl p-5 space-y-4 text-[13px]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fef3c7] text-[#92400e] flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h3 id="phase-overflow-title" className="font-extrabold text-base text-[#0f172a]">{title || 'Esta fecha corre el cronograma'}</h3>
            {description ? <p className="text-[#475569] mt-0.5">{description}</p> : <p className="text-[#475569] mt-0.5">
              «{taskTitle}» termina después de la producción de <strong>{phaseName}</strong> ({formatDate(overflow.productionEnd)}).
              Extender la fase son <strong>{extraDays} día{extraDays === 1 ? '' : 's'} hábil{extraDays === 1 ? '' : 'es'}</strong> más.
            </p>}
          </div>
        </div>

        {(changes.length > 0 || endChanged) && (
          <ul className="rounded-xl border border-[#e2e8f0] divide-y divide-[#f1f5f9]">
            {changes.map((c) => (
              <li key={`${c.label}-${c.from}`} className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="text-[#334155]">{c.label}</span>
                <span className="font-mono whitespace-nowrap"><s className="text-[#94a3b8]">{formatDate(c.from)}</s> → <strong className="text-[#501f92]">{formatDate(c.to)}</strong></span>
              </li>
            ))}
            {endChanged && (
              <li className="flex items-center justify-between gap-2 px-3 py-2 bg-[#faf5ff]">
                <span className="font-bold text-[#0f172a]">Entrega final</span>
                <span className="font-mono whitespace-nowrap"><s className="text-[#94a3b8]">{formatDate(before.endDate)}</s> → <strong className="text-[#501f92]">{formatDate(after.endDate)}</strong></span>
              </li>
            )}
          </ul>
        )}

        <p className="text-[#64748b]">{hint || 'Si el cambio lo pidió el cliente, avísale la nueva fecha. Si es interno, revisa si alguien del mismo rol puede apoyar para no correr la entrega.'}</p>

        <div className="flex items-center justify-end gap-2 flex-wrap">
          <button type="button" onClick={onKeepTaskOnly} className="h-9 px-4 rounded-full border border-[#cbd5e1] bg-white text-[#475569] font-semibold cursor-pointer hover:bg-[#f8fafc]" title="La tarea queda con la nueva fecha y el cronograma no cambia: la fase queda en riesgo">
            {cancelLabel || 'Solo mover la tarea'}
          </button>
          <button type="button" onClick={onExtend} className="h-9 px-4 rounded-full bg-[#501f92] hover:bg-[#3d1572] text-white font-semibold cursor-pointer">
            {confirmLabel || 'Extender la fase'}
          </button>
        </div>
      </div>
    </div>
  );
};
