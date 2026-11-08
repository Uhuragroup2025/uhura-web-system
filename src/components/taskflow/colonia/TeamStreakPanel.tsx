import React, { useEffect, useMemo, useState } from 'react';
import { Flame } from 'lucide-react';
import type { TimeLog, UserItem, TeamAbsenceEvent } from '../types';
import {
  absencesByUserFrom,
  computeMilestones,
  computeTeamStreak,
  getClaps,
  STREAK_SOCIAL_EVENT,
  teamMembersFrom,
  toggleClap,
  DAY_CLOSED_EVENT,
  type StreakMilestone
} from '../time/dayStreak';
import { formatDate } from '../../../utils/formatters';

/**
 * Racha de equipo y personas en racha, visibles para todo el equipo (07 Nov 2026).
 * - Se activa sola, por comportamiento: no hay interruptor para «compartir».
 * - Racha de equipo: logro de todos; nunca nombra a quien faltó (solo «faltan 2»).
 * - Personas en racha: solo quien llega a 5, 10, 20, 50 o 100 días seguidos. Se puede aplaudir.
 * - No hay ranking de horas ni comparación de posiciones.
 *
 * variant 'card' (Mi Día, columna derecha): aparece solo si alguien está en racha o el equipo
 * tiene racha. variant 'full' (La Colonia): siempre visible, con estado vacío.
 */

interface Props {
  users: UserItem[];
  timeLogs: TimeLog[];
  absenceEvents: TeamAbsenceEvent[];
  currentUser?: UserItem;
  variant?: 'card' | 'full';
}

const useStreakData = (users: UserItem[], timeLogs: TimeLog[], absenceEvents: TeamAbsenceEvent[]) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const h = () => setTick((n) => n + 1);
    window.addEventListener(STREAK_SOCIAL_EVENT, h);
    window.addEventListener(DAY_CLOSED_EVENT, h);
    return () => {
      window.removeEventListener(STREAK_SOCIAL_EVENT, h);
      window.removeEventListener(DAY_CLOSED_EVENT, h);
    };
  }, []);
  const members = useMemo(() => teamMembersFrom(users, absencesByUserFrom(absenceEvents)), [users, absenceEvents]);
  const team = useMemo(() => computeTeamStreak(members, timeLogs), [members, timeLogs]);
  const milestones = useMemo(() => computeMilestones(members, timeLogs), [members, timeLogs]);
  return { team, milestones, tick };
};

const MilestoneRow: React.FC<{ m: StreakMilestone; currentUser?: UserItem; compact?: boolean }> = ({ m, currentUser, compact }) => {
  const claps = getClaps(m.key);
  const isMe = m.user.id === currentUser?.id;
  const clapped = Boolean(currentUser && claps.includes(currentUser.id));
  const first = (m.user.name || '').split(' ')[0];
  return (
    <li className="flex items-center gap-2.5 py-2">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
        style={{ background: m.user.avatarBg || '#501f92' }}
        aria-hidden="true"
      >
        {m.user.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#0f172a] truncate">
          <strong>{isMe ? 'Tú' : first}</strong> · {m.current} días seguidos 🔥
        </p>
        {!compact && <p className="text-[11px] text-[#94a3b8]">Llegó a {m.milestone} días el {formatDate(m.achievedOn)}</p>}
      </div>
      <button
        type="button"
        disabled={isMe || !currentUser}
        onClick={() => currentUser && toggleClap(m.key, currentUser.id)}
        aria-pressed={clapped}
        aria-label={isMe ? `${claps.length} aplausos` : clapped ? `Quitar aplauso a ${first}` : `Aplaudir a ${first}`}
        className={`px-2 py-1 rounded-lg text-[11px] font-bold border shrink-0 transition-colors ${
          clapped ? 'bg-[#f5f3ff] border-[#c4b5fd] text-[#501f92]' : 'bg-white border-[#e2e8f0] text-[#475569] hover:border-[#c4b5fd]'
        } ${isMe ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
      >
        👏{claps.length > 0 ? ` ${claps.length}` : ''}
      </button>
    </li>
  );
};

export const TeamStreakPanel: React.FC<Props> = ({ users, timeLogs, absenceEvents, currentUser, variant = 'full' }) => {
  const { team, milestones } = useStreakData(users, timeLogs, absenceEvents);
  const missingToday = Math.max(0, team.todayExpected - team.todayLoaded);
  const teamLine = team.current > 0 ? `🔥 El equipo lleva ${team.current === 1 ? '1 día' : `${team.current} días`} con todos los días cargados` : null;

  if (variant === 'card') {
    if (milestones.length === 0 && !teamLine) return null;
    return (
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#ea580c]" aria-hidden="true" />
          <h3 className="text-sm font-bold text-[#0f172a]">En racha</h3>
        </div>
        {teamLine && <p className="text-xs text-[#475569]">{teamLine}.</p>}
        {milestones.length > 0 && (
          <ul className="divide-y divide-[#f1f5f9]">
            {milestones.slice(0, 5).map((m) => (
              <MilestoneRow key={m.key} m={m} currentUser={currentUser} compact />
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <section aria-label="Racha del equipo" className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4">
      <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#ea580c]" aria-hidden="true" />
          <h3 className="text-sm font-bold text-[#0f172a]">Racha del equipo</h3>
        </div>
        <p className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
          🔥 {team.current} <span className="text-sm font-semibold text-[#64748b]">{team.current === 1 ? 'día' : 'días'}</span>
        </p>
        <p className="text-xs text-[#475569]">{team.current > 0 ? 'Con todos los días cargados.' : 'Empecemos la racha del equipo.'}</p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {team.todayExpected > 0 && (
            <span className={`px-2 py-1 rounded-lg border ${missingToday === 0 ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#047857]' : 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569]'}`}>
              {missingToday === 0 ? 'Hoy: ¡todos cargaron! 🎉' : `Hoy: faltan ${missingToday} ${missingToday === 1 ? 'persona' : 'personas'}`}
            </span>
          )}
          {team.weekPct !== null && (
            <span className="px-2 py-1 rounded-lg border bg-[#f8fafc] border-[#e2e8f0] text-[#475569]">Esta semana: {team.weekPct} % de los días cargados</span>
          )}
        </div>
        <p className="text-[10px] text-[#94a3b8]">
          Cuenta un día cuando cada persona registra al menos el 80 % de su jornada. Ausencias, fines de semana y festivos no cuentan.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-2">
        <h3 className="text-sm font-bold text-[#0f172a]">En racha</h3>
        {milestones.length === 0 ? (
          <p className="text-xs text-[#64748b] py-4 text-center rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            Aún nadie llega a 5 días seguidos. Quien lo logre aparece aquí y en Mi Día 🔥
          </p>
        ) : (
          <ul className="divide-y divide-[#f1f5f9]">
            {milestones.slice(0, 8).map((m) => (
              <MilestoneRow key={m.key} m={m} currentUser={currentUser} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
