import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { TaskItem, TeamAbsenceEvent, UserItem } from './types';
import { buildLoadContext, checkAssignment, BUSY_DAY_RATIO } from './schedule/teamLoadAdvisor';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const short = (iso: string) => { const d = new Date(`${iso}T12:00:00`); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };

/**
 * Aviso al asignar o cambiar el colaborador de una tarea (regla 3 de `teamLoadAdvisor`).
 * Si la persona ya tiene ≥ 85 % de su jornada ocupada en los días de la tarea (en todos sus
 * proyectos), o está ausente, ECO lo dice y sugiere hasta 3 personas del mismo rol (o afín) con
 * espacio. No bloquea: el líder puede dejar a la persona elegida o tomar otra del selector.
 */
export const CapacityAssignWarning: React.FC<{
  personName?: string;
  role: string;
  start?: string;
  due?: string;
  hours: number;
  tasks: TaskItem[];
  users: UserItem[];
  absences?: TeamAbsenceEvent[];
  /** La tarea que se está editando (no se cuenta dos veces). */
  excludeTaskId?: string;
  onPick: (user: UserItem) => void;
}> = ({ personName, role, start, due, hours, tasks, users, absences, excludeTaskId, onPick }) => {
  const check = useMemo(() => {
    if (!personName || personName === '-' || !(hours > 0)) return null;
    const ctx = buildLoadContext({ allTasks: tasks, users, absences, excludeTaskIds: excludeTaskId ? new Set([excludeTaskId]) : undefined });
    return checkAssignment(ctx, { users, personName, role, start: (start || '').slice(0, 10), due: (due || '').slice(0, 10), hours });
  }, [personName, role, start, due, hours, tasks, users, absences, excludeTaskId]);

  if (!check || (check.busyDays.length === 0 && check.peakPctWithTask <= 100 && !check.absent)) return null;
  const first = personName!.replace(/\s*\(.*?\)/, '').split(' ')[0];
  const reason = check.absent
    ? `${first} tiene una ausencia en esos días`
    : check.busyDays.length > 0
      ? `${first} ya tiene ocupado ${check.busyDays.slice(0, 2).map((b) => `el ${b.pct} % del ${short(b.date)}`).join(' y ')}${check.busyDays.length > 2 ? ` y ${check.busyDays.length - 2} día(s) más` : ''}`
      : `con esta tarea ${first} llega al ${check.peakPctWithTask} % de su jornada`;

  const detail = `${reason} (en todos sus proyectos; lleno desde el ${Math.round(BUSY_DAY_RATIO * 100)} %).`;

  return (
    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-[11px] text-[#92400e]" role="status">
      <span className="group relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fffbeb] border border-[#fde68a] font-semibold cursor-help" tabIndex={0} aria-label={`Agenda llena: ${detail}`}>
        <AlertTriangle className="w-3 h-3" />
        Agenda llena
        <span className="pointer-events-none absolute left-0 top-full mt-1 z-50 w-56 p-2 rounded-lg bg-[#0f172a] text-white text-[11px] font-normal leading-snug shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
          {detail}
        </span>
      </span>
      {check.alternatives.length > 0 ? (
        check.alternatives.map((a) => (
          <button
            key={a.user.id}
            type="button"
            onClick={() => onPick(a.user)}
            className="px-2 py-0.5 rounded-full bg-white border border-[#e2e8f0] hover:border-[#501f92] text-[#501f92] font-semibold cursor-pointer"
            title={`Asignar a ${a.user.name} (${a.fit === 'affine' ? 'rol afín' : 'mismo rol'})`}
          >
            {a.user.name.split(' ').slice(0, 2).join(' ')} ·{a.freeHours}h libres
          </button>
        ))
      ) : (
        <span className="text-[#92400e]/80">Nadie del rol tiene espacio</span>
      )}
    </div>
  );
};
