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
  /** Días que forman la racha, del más reciente al más antiguo (ISO). */
  days: string[];
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

  const days: string[] = todayCounts ? [todayIso] : [];
  const cursor = new Date(today);
  for (let i = 0; i < maxLookbackDays; i++) {
    cursor.setDate(cursor.getDate() - 1);
    const iso = toIsoLocal(cursor);
    if (!isWorkday(iso)) continue;
    if (!counts(iso)) break;
    days.push(iso);
  }
  return { current: days.length, todayCounts, todayIsWorkday, days };
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

// ── Visible para todo el equipo: racha de equipo e hitos personales ──
/**
 * Pensado para motivar sin señalar: la racha de equipo nunca nombra a quien faltó (solo
 * «faltan 2») y los hitos solo celebran a quien llegó. No hay ranking de horas.
 */
export const STREAK_MILESTONES = [5, 10, 20, 50, 100];

export interface TeamMember {
  user: UserItem;
  targetDayHours: number;
  absentDays: Set<string>;
}

/** Personas que cuentan para el equipo: activas y con capacidad (horas semanales) configurada. */
export function teamMembersFrom(users: UserItem[], absencesByUser: Map<string, Set<string>>): TeamMember[] {
  return users
    .filter((u) => u.status !== 'Inactive' && (u.capacityHours || 0) > 0)
    .map((u) => ({ user: u, targetDayHours: (u.capacityHours || 0) / 5, absentDays: absencesByUser.get(u.id) || new Set() }));
}

export interface TeamStreakResult {
  /** Días hábiles seguidos en que todo el equipo esperado cargó su día. */
  current: number;
  /** Hoy: cuántos ya cargaron y cuántos se esperan (sin nombres). */
  todayLoaded: number;
  todayExpected: number;
  /** Semana en curso (lunes a hoy): % de días-persona cargados. */
  weekPct: number | null;
}

export function computeTeamStreak(members: TeamMember[], logs: TimeLog[], today: Date = new Date(), maxLookbackDays = 120): TeamStreakResult {
  const hours = members.map((m) => ({ m, h: hoursByDay(logs, m.user, today) }));
  const dayStats = (iso: string) => {
    if (!isBusinessDay(new Date(`${iso}T00:00:00Z`))) return null;
    let expected = 0;
    let loaded = 0;
    for (const { m, h } of hours) {
      if (m.absentDays.has(iso)) continue;
      expected++;
      if ((h.get(iso) || 0) >= Math.max(0.1, m.targetDayHours * STREAK_MIN_RATIO)) loaded++;
    }
    return expected > 0 ? { expected, loaded } : null;
  };

  const todayIso = toIsoLocal(today);
  const t = dayStats(todayIso);
  let current = t && t.loaded === t.expected ? 1 : 0;
  const cursor = new Date(today);
  for (let i = 0; i < maxLookbackDays; i++) {
    cursor.setDate(cursor.getDate() - 1);
    const st = dayStats(toIsoLocal(cursor));
    if (!st) continue;
    if (st.loaded < st.expected) break;
    current++;
  }

  // Semana en curso: lunes → hoy
  const monday = new Date(today);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  let exp = 0;
  let load = 0;
  for (const d = new Date(monday); d <= today; d.setDate(d.getDate() + 1)) {
    const st = dayStats(toIsoLocal(d));
    if (!st) continue;
    exp += st.expected;
    load += st.loaded;
  }
  return {
    current,
    todayLoaded: t?.loaded || 0,
    todayExpected: t?.expected || 0,
    weekPct: exp > 0 ? Math.round((load / exp) * 100) : null
  };
}

export interface StreakMilestone {
  key: string;
  user: UserItem;
  milestone: number;
  current: number;
  achievedOn: string;
}

/**
 * Hitos vigentes (5, 10, 20…) de cada persona, del más reciente al más antiguo.
 * Se publican solos, por comportamiento: no hay que activar nada.
 */
export function computeMilestones(members: TeamMember[], logs: TimeLog[], today: Date = new Date()): StreakMilestone[] {
  const out: StreakMilestone[] = [];
  for (const m of members) {
    const st = computeStreak({ hours: hoursByDay(logs, m.user, today), targetDayHours: m.targetDayHours, absentDays: m.absentDays, today });
    const reached = STREAK_MILESTONES.filter((x) => x <= st.current).pop();
    if (!reached) continue;
    const achievedOn = st.days[st.current - reached];
    out.push({ key: `${m.user.id}:${reached}:${st.days[st.current - 1]}`, user: m.user, milestone: reached, current: st.current, achievedOn });
  }
  return out.sort((a, b) => b.achievedOn.localeCompare(a.achievedOn));
}

// Aplausos (prototipo: navegador; producción: backend, ver BACKEND_REQUIREMENTS §25)
const CLAPS_KEY = 'eco_streak_claps_v1';
export const STREAK_SOCIAL_EVENT = 'eco:streak-social';
const readJson = <T,>(k: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(k) || '') ?? fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* sin almacenamiento */
  }
  window.dispatchEvent(new CustomEvent(STREAK_SOCIAL_EVENT));
};

export function getClaps(key: string): string[] {
  return readJson<Record<string, string[]>>(CLAPS_KEY, {})[key] || [];
}
export function toggleClap(key: string, userId: string) {
  const all = readJson<Record<string, string[]>>(CLAPS_KEY, {});
  const set = new Set(all[key] || []);
  if (set.has(userId)) set.delete(userId);
  else set.add(userId);
  all[key] = Array.from(set);
  writeJson(CLAPS_KEY, all);
}

export function absencesByUserFrom(events: { userId: string; status: string; startDate: string; endDate?: string }[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const a of events) {
    if (a.status !== 'active') continue;
    const set = map.get(a.userId) || new Set<string>();
    const d = new Date(`${a.startDate}T00:00:00`);
    const end = new Date(`${a.endDate || a.startDate}T00:00:00`);
    for (let i = 0; d <= end && i < 120; i++) {
      set.add(toIsoLocal(d));
      d.setDate(d.getDate() + 1);
    }
    map.set(a.userId, set);
  }
  return map;
}
