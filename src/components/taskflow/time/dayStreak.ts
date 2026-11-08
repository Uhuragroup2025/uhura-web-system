import type { TimeLog, UserItem } from '../types';
import { isBusinessDay } from '../health/projectHealthEngine';

/**
 * Racha de días cargados y cierre del día (07 Nov 2026).
 *
 * - Un día hábil cuenta para la racha cuando la persona registró al menos el 70 % de su
 *   jornada (misma meta mínima que el recordatorio de horas de producción).
 * - Fines de semana, festivos y días con ausencia registrada no cuentan ni rompen la racha.
 * - Hoy suma apenas se alcance la meta; si todavía no, no rompe la racha (el día no ha terminado).
 * - Se premia la constancia, nunca la cantidad de horas: no hay ranking de horas.
 *
 * Todo se calcula con los registros de tiempo que ya existen; no requiere backend nuevo.
 */

export const STREAK_MIN_RATIO = 0.7;

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const toIsoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Fecha ISO del registro. Acepta ISO, «Hoy, 10:30 hs» y «15 nov» (del año en curso). */
export function logIsoDate(log: Pick<TimeLog, 'date'>, today: Date = new Date()): string | null {
  const raw = (log.date || '').toLowerCase().trim();
  if (!raw) return null;
  const iso = raw.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  if (raw.startsWith('hoy')) return toIsoLocal(today);
  if (raw.startsWith('ayer')) {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return toIsoLocal(y);
  }
  const short = raw.match(/(\d{1,2})\s+([a-z]{3})/);
  if (short) {
    const m = MONTHS_SHORT.indexOf(short[2]);
    if (m >= 0) return `${today.getFullYear()}-${String(m + 1).padStart(2, '0')}-${String(Number(short[1])).padStart(2, '0')}`;
  }
  return null;
}

/** ¿El registro es de esta persona? Por ID; por nombre solo como respaldo de los datos de prueba. */
export function isOwnLog(log: TimeLog, user?: UserItem | null): boolean {
  if (!user) return false;
  if (log.userId && user.id && log.userId.toLowerCase() === user.id.toLowerCase()) return true;
  const name = (user.name || '').toLowerCase();
  return Boolean(!log.userId && log.userName && name && log.userName.toLowerCase() === name);
}

export function hoursByDay(logs: TimeLog[], user?: UserItem | null, today: Date = new Date()): Map<string, number> {
  const map = new Map<string, number>();
  for (const log of logs) {
    if (!isOwnLog(log, user)) continue;
    const iso = logIsoDate(log, today);
    if (!iso) continue;
    map.set(iso, (map.get(iso) || 0) + (log.durationSeconds || 0) / 3600);
  }
  return map;
}

export interface StreakResult {
  /** Días hábiles seguidos con el día cargado (incluye hoy si ya alcanzó la meta). */
  current: number;
  /** ¿Hoy ya cuenta para la racha? */
  todayCounts: boolean;
  /** ¿Hoy es un día que cuenta (hábil y sin ausencia)? */
  todayIsWorkday: boolean;
}

export function computeStreak(params: {
  hours: Map<string, number>;
  targetDayHours: number;
  absentDays?: Set<string>;
  today?: Date;
  maxLookbackDays?: number;
}): StreakResult {
  const { hours, targetDayHours, absentDays = new Set(), today = new Date(), maxLookbackDays = 180 } = params;
  const min = Math.max(0.1, targetDayHours * STREAK_MIN_RATIO);
  const counts = (iso: string) => (hours.get(iso) || 0) >= min;
  const isWorkday = (iso: string) => isBusinessDay(new Date(`${iso}T00:00:00Z`)) && !absentDays.has(iso);

  const todayIso = toIsoLocal(today);
  const todayIsWorkday = isWorkday(todayIso);
  const todayCounts = todayIsWorkday && counts(todayIso);

  let current = todayCounts ? 1 : 0;
  const cursor = new Date(today);
  for (let i = 0; i < maxLookbackDays; i++) {
    cursor.setDate(cursor.getDate() - 1);
    const iso = toIsoLocal(cursor);
    if (!isWorkday(iso)) continue;
    if (!counts(iso)) break;
    current++;
  }
  return { current, todayCounts, todayIsWorkday };
}

// ── Día cerrado (prototipo: navegador; producción: backend, ver BACKEND_REQUIREMENTS §24) ──
const CLOSED_KEY = 'eco_day_closed_v1';
export const DAY_CLOSED_EVENT = 'eco:day-closed';

const readClosed = (): Record<string, string[]> => {
  try {
    return JSON.parse(localStorage.getItem(CLOSED_KEY) || '{}') || {};
  } catch {
    return {};
  }
};

export function isDayClosed(userId: string | undefined, iso: string): boolean {
  if (!userId) return false;
  return (readClosed()[userId] || []).includes(iso);
}

export function markDayClosed(userId: string | undefined, iso: string) {
  if (!userId) return;
  const all = readClosed();
  const days = new Set(all[userId] || []);
  days.add(iso);
  all[userId] = Array.from(days).sort().slice(-120);
  try {
    localStorage.setItem(CLOSED_KEY, JSON.stringify(all));
  } catch {
    /* sin almacenamiento */
  }
  window.dispatchEvent(new CustomEvent(DAY_CLOSED_EVENT, { detail: { userId, iso } }));
}

/** Texto corto de la racha, siempre en positivo. */
export function streakLabel(n: number): string {
  if (n <= 0) return 'Empieza tu racha hoy';
  return n === 1 ? '1 día seguido' : `${n} días seguidos`;
}
