/**
 * Plazo del alcance en el encabezado del negocio (26 Nov 2026).
 *
 * Texto corto, como lo pidió Uhura sobre lo que ya existe en producción:
 *   «Plazo: 28 h · quedan ~12 h»   (antes «Plazo del alcance: 28 h hábiles · quedan ~12 h hábiles (Editar)»)
 *
 * Editar sin trampas: al elegir la fecha se guarda sola. Antes había que pulsar «Guardar plazo», pero el
 * calendario del navegador tapaba ese botón; la gente hacía clic por fuera, la ventana se cerraba y el cambio
 * se perdía («parece que no funciona»). Ahora clic por fuera, Escape o «Listo» solo cierran: lo elegido ya
 * quedó guardado. «Deshacer» vuelve a la fecha que había al abrir.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Clock, Pencil, Check } from 'lucide-react';
import { NewBusinessOpportunity } from '../types';
import { businessHoursBetween, scopeTimeLeft, SCOPE_TONE_CLASS } from './scopeDeadline';

const CO_OFFSET_MS = -5 * 3600_000;

/** ISO → valor de `<input type="datetime-local">` en hora Colombia. */
const toCoInput = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() + CO_OFFSET_MS).toISOString().slice(0, 16);
};
/** Valor del input (hora Colombia) → ISO. */
const fromCoInput = (value: string) => {
  const d = new Date(`${value}:00-05:00`);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

interface ScopeDeadlineChipProps {
  opp: NewBusinessOpportunity;
  now: Date;
  canEdit: boolean;
  onChange: (patch: Pick<NewBusinessOpportunity, 'handoffDeadline' | 'handoffHours'>) => void;
}

export const ScopeDeadlineChip: React.FC<ScopeDeadlineChipProps> = ({ opp, now, canEdit, onChange }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState<number | null>(null);
  const [error, setError] = useState('');
  const original = useRef<Pick<NewBusinessOpportunity, 'handoffDeadline' | 'handoffHours'>>({});
  const boxRef = useRef<HTMLDivElement>(null);

  const left = scopeTimeLeft(opp, now);
  const total = opp.handoffHours || 36;
  const done = left.tone === 'done';
  // «quedan ~12 h» / «vencido hace ~3 h» / «entregado»: misma cuenta que Mi Día, en corto
  const shortLeft = left.label.replace(' hábiles', '').replace('Quedan', 'quedan').replace('Vencido', 'vencido').replace('Alcance entregado', 'entregado');
  const hasDeadline = !!opp.handoffDeadline && !isNaN(new Date(opp.handoffDeadline).getTime());

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const start = () => {
    original.current = { handoffDeadline: opp.handoffDeadline, handoffHours: opp.handoffHours };
    setValue(toCoInput(opp.handoffDeadline));
    setSaved(null);
    setError('');
    setOpen(true);
  };

  /** Se guarda en cuanto la fecha es válida: no hay botón que el calendario pueda tapar. */
  const apply = (v: string) => {
    setValue(v);
    const iso = fromCoInput(v);
    if (!iso) return;
    const from = opp.createdAt ? new Date(opp.createdAt) : now;
    const hours = Math.max(1, Math.round(businessHoursBetween(from, new Date(iso))));
    if (new Date(iso) <= now) { setError('Elige una fecha y hora que no haya pasado.'); setSaved(null); return; }
    setError('');
    onChange({ handoffDeadline: iso, handoffHours: hours });
    setSaved(hours);
  };

  const undo = () => {
    onChange(original.current);
    setValue(toCoInput(original.current.handoffDeadline));
    setSaved(null);
    setError('');
  };

  return (
    <div ref={boxRef} className="relative flex items-center gap-1.5" title={left.title}>
      <Clock className="w-3.5 h-3.5 text-[#501f92]" />
      <span>
        Plazo: <strong className="text-[#0f172a] font-semibold">{total} h</strong>
        {(hasDeadline || done) && <> · <span className={`font-semibold ${SCOPE_TONE_CLASS[left.tone]}`}>{shortLeft}</span></>}
      </span>
      {canEdit && !done && (
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : start())}
          className="p-0.5 rounded text-[#501f92] hover:bg-[#501f92]/10 cursor-pointer"
          aria-label="Editar el plazo del alcance"
          aria-expanded={open}
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
      {open && (
        <div className="absolute top-6 left-0 z-30 bg-white rounded-xl shadow-xl border border-[#cbd5e1] p-3 w-72 space-y-2" role="dialog" aria-label="Plazo del alcance">
          <label className="text-[11px] font-bold text-[#0f172a] block" htmlFor="scope-deadline-input">
            Fecha máx. de entrega del alcance
          </label>
          <input
            id="scope-deadline-input"
            type="datetime-local"
            value={value}
            onChange={(e) => apply(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg border border-[#cbd5e1] text-xs text-[#0f172a]"
          />
          <p className="text-[10.5px] text-[#64748b] leading-snug">
            Hora de Colombia. Cuenta solo tiempo hábil (lun–vie, 8–12 y 2–6). <strong className="text-[#334155]">Se guarda al elegirla.</strong>
          </p>
          {error && <p className="text-[11px] font-semibold text-[#dc2626]">{error}</p>}
          {saved !== null && !error && (
            <p className="text-[11px] font-semibold text-[#059669] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Guardado · plazo de {saved} h hábiles
            </p>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
            <button type="button" onClick={undo} disabled={saved === null} className="text-[11px] font-semibold text-[#64748b] hover:text-[#0f172a] disabled:opacity-40 cursor-pointer disabled:cursor-default">
              Deshacer
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1 rounded-lg bg-[#501f92] text-white text-[11px] font-bold cursor-pointer">
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
