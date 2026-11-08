import React, { useEffect, useMemo, useState } from 'react';
import { Flame } from 'lucide-react';
import type { TimeLog, UserItem, TeamAbsenceEvent } from '../types';
import {
  absencesByUserFrom,
  computeMilestones,
  computeTeamStreak,
  getClaps,
  isSharingMilestones,
  setSharingMilestones,
  STREAK_SOCIAL_EVENT,
  teamMembersFrom,
  toggleClap,
  DAY_CLOSED_EVENT
} from '../time/dayStreak';
import { formatDate } from '../../../utils/formatters';

/**
 * Racha de equipo y logros de racha, visibles para todo el equipo en La Colonia (07 Nov 2026).
 * - Racha de equipo: logro de todos; nunca nombra a quien faltó (solo «faltan 2»).
 * - Logros: solo celebran a quien llega a 5, 10, 20, 50 o 100 días seguidos. Cada persona puede
 *   dejar de compartir los suyos. Los compañeros pueden aplaudir.
 * - No hay ranking de horas ni comparación de posiciones.
 */

interface Props {
  users: UserItem[];
  timeLogs: TimeLog[];
  absenceEvents: TeamAbsenceEvent[];
  currentUser?: UserItem;
}

export const TeamStreakPanel: React.FC<Props> = ({ users, timeLogs, absenceEvents, currentUser }) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const milestones = useMemo(() => computeMilestones(members, timeLogs).slice(0, 6), [members, timeLogs, tick]);
  const sharing = currentUser ? isSharingMilestones(currentUser.id) : true;
  const missingToday = Math.max(0, team.todayExpected - team.todayLoaded);

  const teamLine =
    team.current > 0
      ? `El equipo lleva ${team.current === 1 ? '1 día' : `${team.current} días`} con todos los días cargados`
      : 'Empecemos la racha del equipo';

  return (
    <section aria-label="Racha del equipo" className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4">
      {/* Racha del equipo */}
      <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#ea580c]" aria-hidden="true" />
          <h3 className="text-sm font-bold text-[#0f172a]">Racha del equipo</h3>
        </div>
        <p className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
          🔥 {team.current} <span className="text-sm font-semibold text-[#64748b]">{team.current === 1 ? 'día' : 'días'}</span>
        </p>
        <p className="text-xs text-[#475569]">{teamLine}.</p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {team.todayExpected > 0 && (
            <span className={`px-2 py-1 rounded-lg border ${missingToday === 0 ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#047857]' : 'bg-[#f8fafc] border-[#e2e8f0] text-[#475569]'}`}>
              {missingToday === 0 ? 'Hoy: ¡todos cargaron! 🎉' : `Hoy: faltan ${missingToday} ${missingToday === 1 ? 'persona' : 'personas'}`}
            </span>
          )}
          {team.weekPct !== null && (
            <span className="px-2 py-1 rounded-lg border bg-[#f8fafc] border-[#e2e8f0] text-[#475569]">
              Esta semana: {team.weekPct} % de los días cargados
            </span>
          )}
        </div>
        <p className="text-[10px] text-[#94a3b8]">
          Cuenta un día cuando cada persona registra al menos el 70 % de su jornada. Ausencias, fines de semana y festivos no cuentan.
        </p>
      </div>

      {/* Logros de racha */}
      <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#0f172a]">Logros de racha</h3>
          {currentUser && (
            <button
              type="button"
              role="switch"
              aria-checked={sharing}
              onClick={() => setSharingMilestones(currentUser.id, !sharing)}
              className="flex items-center gap-2 text-[11px] font-semibold text-[#475569] cursor-pointer"
              title="Si lo apagas, tus logros no se publican aquí. Tu racha sigue contando para ti y para el equipo."
            >
              <span>Compartir mis logros</span>
              <span className={`w-8 h-4 rounded-full relative transition-colors ${sharing ? 'bg-[#501f92]' : 'bg-[#cbd5e1]'}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${sharing ? 'left-4' : 'left-0.5'}`} />
              </span>
            </button>
          )}
        </div>

        {milestones.length === 0 ? (
          <p className="text-xs text-[#64748b] py-4 text-center rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            Aún no hay logros. Al cumplir 5 días seguidos con tu día cargado, lo celebramos aquí 🔥
          </p>
        ) : (
          <ul className="divide-y divide-[#f1f5f9]">
            {milestones.map((m) => {
              const claps = getClaps(m.key);
              const isMe = m.user.id === currentUser?.id;
              const clapped = Boolean(currentUser && claps.includes(currentUser.id));
              const first = (m.user.name || '').split(' ')[0];
              return (
                <li key={m.key} className="flex items-center gap-3 py-2.5">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ background: m.user.avatarBg || '#501f92' }}
                    aria-hidden="true"
                  >
                    {m.user.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#0f172a]">
                      🔥 <strong>{isMe ? 'Llegaste' : `${first} llegó`}</strong> a {m.milestone} días seguidos con su día cargado
                    </p>
                    <p className="text-[11px] text-[#94a3b8]">{formatDate(m.achievedOn)}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isMe || !currentUser}
                    onClick={() => currentUser && toggleClap(m.key, currentUser.id)}
                    aria-pressed={clapped}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border shrink-0 transition-colors ${
                      clapped ? 'bg-[#f5f3ff] border-[#c4b5fd] text-[#501f92]' : 'bg-white border-[#e2e8f0] text-[#475569] hover:border-[#c4b5fd]'
                    } ${isMe ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
                    title={isMe ? 'Aplausos que recibiste' : clapped ? 'Quitar aplauso' : 'Aplaudir'}
                  >
                    👏 {claps.length > 0 ? claps.length : isMe ? 0 : 'Aplaudir'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};
