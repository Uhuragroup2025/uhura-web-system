/**
 * Pasaporte del mes (§32.21): 5 sellos por usar bien la plataforma. 3 sellos = premio pequeño,
 * 5 sellos = premio mayor. Se muestra en Mi Día (columna derecha) y en «ECO informa».
 * Dirección ve además quién lo lleva completo, para preparar los premios del cierre del mes.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { TaskItem, TeamAbsenceEvent, TimeLog, UserItem } from '../../types';
import { PASSPORT_PRIZES, passportFor } from './passport';

const EVENTS = ['eco:ideas-changed', 'eco:knocks-changed', 'eco:contributions-changed', 'eco:rewards-changed', 'storage'];
const usePassportVersion = () => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const on = () => setV((x) => x + 1);
    EVENTS.forEach((e) => window.addEventListener(e, on));
    return () => EVENTS.forEach((e) => window.removeEventListener(e, on));
  }, []);
  return v;
};
const monthName = (m: string) => {
  const [y, mm] = m.split('-').map(Number);
  return new Date(y, mm - 1, 1).toLocaleDateString('es-CO', { month: 'long' });
};

interface Props {
  me?: UserItem;
  users: UserItem[];
  tasks: TaskItem[];
  timeLogs: TimeLog[];
  absenceEvents: TeamAbsenceEvent[];
  targetDayHours: number;
  variant?: 'light' | 'dark';
}

export const PassportCard: React.FC<Props> = ({ me, users, tasks, timeLogs, absenceEvents, targetDayHours, variant = 'light' }) => {
  const v = usePassportVersion();
  const pass = useMemo(() => (me ? passportFor({ user: me, users, tasks, timeLogs, absenceEvents, targetDayHours }) : null), [me, users, tasks, timeLogs, absenceEvents, targetDayHours, v]);
  const [open, setOpen] = useState<string | null>(null);
  if (!me || !pass) return null;
  const dark = variant === 'dark';
  const pct = (pass.count / 5) * 100;
  const next = pass.count < 3 ? 3 - pass.count : pass.count < 5 ? 5 - pass.count : 0;
  return (
    <div className={dark ? 'rounded-2xl bg-white/[.06] px-3 py-3 text-white' : 'rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-xs'}>
      <div className="flex items-center justify-between">
        <p className={`text-sm font-black ${dark ? 'text-white' : 'text-[#0f172a]'}`}>🎫 Pasaporte de {monthName(pass.month)}</p>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${pass.level === 5 ? 'bg-[#d4ff3f] text-[#1a0f30]' : pass.level === 3 ? 'bg-[#fbbf24]/25 text-[#b45309]' : dark ? 'bg-white/10 text-white/80' : 'bg-[#f1f5f9] text-[#475569]'}`}>{pass.count}/5 sellos</span>
      </div>
      {/* Barra con las metas de 3 y 5 sellos */}
      <div className={`relative mt-2.5 h-2 rounded-full ${dark ? 'bg-white/10' : 'bg-[#f1f5f9]'}`}>
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#a3e635] transition-[width] duration-500" style={{ width: `${pct}%` }} />
        <span className="absolute -top-1 h-4 w-0.5 bg-[#b45309]" style={{ left: '60%' }} title="3 sellos: premio pequeño" />
      </div>
      <div className={`relative mt-1 h-3.5 text-[10px] font-bold ${dark ? 'text-white/55' : 'text-[#64748b]'}`}><span className="absolute left-0">0</span><span className="absolute -translate-x-1/2" style={{ left: '60%' }}>3 · 🎁</span><span className="absolute right-0">5 · 🏆</span></div>

      <div className="mt-2.5 grid grid-cols-5 gap-1.5">
        {pass.stamps.map((s) => (
          <button key={s.id} type="button" onClick={() => setOpen(open === s.id ? null : s.id)} title={s.rule} className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 cursor-pointer transition-colors ${s.done ? (dark ? 'bg-[#a3e635]/20 ring-1 ring-[#a3e635]/50' : 'bg-[#ecfccb] ring-1 ring-[#a3e635]') : dark ? 'bg-white/[.05] hover:bg-white/10' : 'bg-[#f8fafc] hover:bg-[#f1f5f9]'} ${open === s.id ? 'ring-2 ring-[#501f92]' : ''}`}>
            <span className={`text-lg leading-none ${s.done ? '' : 'grayscale opacity-40'}`}>{s.icon}</span>
            <span className={`text-[9px] font-bold leading-tight text-center ${dark ? 'text-white/75' : 'text-[#334155]'}`}>{s.name}</span>
          </button>
        ))}
      </div>
      {open && (() => {
        const s = pass.stamps.find((x) => x.id === open)!;
        return (
          <div className={`mt-2 rounded-xl px-2.5 py-2 text-[11px] ${dark ? 'bg-white/[.06] text-white/80' : 'bg-[#f8fafc] text-[#334155]'}`}>
            <p className="font-bold">{s.icon} {s.name} · {s.done ? '✅ Listo' : s.progress}</p>
            <p className={dark ? 'text-white/60' : 'text-[#64748b]'}>{s.rule}.{!s.done && ` ${s.tip}`}</p>
          </div>
        );
      })()}

      <p className={`mt-2.5 text-[11px] leading-snug ${dark ? 'text-white/70' : 'text-[#475569]'}`}>
        {pass.level === 5 ? `🏆 ¡Completo! ${PASSPORT_PRIZES[5]}.` : pass.level === 3 ? `🎁 Ya tienes el premio pequeño. Te faltan ${next} para el mayor.` : `Te ${next === 1 ? 'falta 1 sello' : `faltan ${next} sellos`} para el premio pequeño.`}
      </p>
      <p className={`mt-0.5 text-[10px] ${dark ? 'text-white/45' : 'text-[#94a3b8]'}`}>3 sellos: {PASSPORT_PRIZES[3].replace('Premio pequeño: ', '')} · 5 sellos: {PASSPORT_PRIZES[5].replace('Premio mayor: ', '')}. Se entrega al cierre del mes.</p>
    </div>
  );
};

/** Dirección: quién lleva 3 o 5 sellos este mes (para preparar los premios). Nadie más lo ve. */
export const PassportTeamSummary: React.FC<Omit<Props, 'me' | 'variant'>> = ({ users, tasks, timeLogs, absenceEvents, targetDayHours }) => {
  const v = usePassportVersion();
  const rows = useMemo(() => users
    .filter((u) => u.status === 'Active')
    .map((u) => ({ u, p: passportFor({ user: u, users, tasks, timeLogs, absenceEvents, targetDayHours: u.capacityHours ? Number((u.capacityHours / 5).toFixed(1)) : targetDayHours }) }))
    .sort((a, b) => b.p.count - a.p.count), [users, tasks, timeLogs, absenceEvents, targetDayHours, v]);
  const five = rows.filter((r) => r.p.level === 5);
  const three = rows.filter((r) => r.p.level === 3);
  return (
    <div className="rounded-2xl bg-white/[.06] px-3 py-2.5 text-white">
      <p className="text-xs font-bold">🎫 Pasaportes del mes · Dirección</p>
      <p className="mt-0.5 text-[11px] text-white/65">🏆 5 sellos: {five.length ? five.map((r) => r.u.name.split(' ')[0]).join(', ') : 'nadie aún'}</p>
      <p className="text-[11px] text-white/65">🎁 3 o 4 sellos: {three.length ? three.map((r) => r.u.name.split(' ')[0]).join(', ') : 'nadie aún'}</p>
      <p className="mt-0.5 text-[10px] text-white/40">Solo lo ve Dirección, para preparar los premios. No es un ranking: se muestra quién llegó, no quién va atrás.</p>
    </div>
  );
};
