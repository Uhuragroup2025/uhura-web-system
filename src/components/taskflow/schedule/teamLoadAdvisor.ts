/**
 * Capacidad del equipo y sugerencias de colaborador (19 Nov 2026).
 *
 * POR QUÉ
 *   El alcance se cotiza por ROL, no por persona. Entre la cotización y la ejecución la persona
 *   propuesta puede llenarse con otros proyectos, salir a vacaciones o recibir más tareas. ECO mira la
 *   agenda real y, cuando alguien está lleno, propone a otra persona del mismo rol (o de un rol afín)
 *   con espacio. SIEMPRE ES UNA SUGERENCIA: el líder puede elegir a cualquier otra persona a mano.
 *
 * DÓNDE SE USA (una sola regla para todo ECO)
 *   1. Al «Iniciar proyecto»: el motor ubica cada tarea en el primer día con espacio
 *      (`placeByCapacity`) y reporta las que no caben, con «Asignar a…».
 *   2. Proyecto en curso: tarjeta «Carga del equipo» en el Resumen (`suggestLoadRebalance`).
 *   3. Al asignar o cambiar el colaborador de una tarea (nueva tarea y detalle de la tarea):
 *      `checkAssignment` avisa si la persona ya pasa el 85 % de su jornada en esos días y ofrece
 *      alternativas; se puede asignar igual.
 *   4. Alcance de New Business: `withUpcomingUtilization` da la ocupación real de las próximas
 *      4 semanas para proponer, entre varias personas del mismo rol, a la que tiene más espacio.
 *
 * REGLAS (en orden)
 *   1. Jornada: 8,4 h por día hábil (42 h / 5). Sin fines de semana ni festivos de Colombia.
 *      Las ausencias (vacaciones, incapacidades, permisos de Google Calendar) restan sus horas del
 *      día (`impactHoursPerDay`); un día de vacaciones completo deja 0 h.
 *   2. Carga del día de una persona = horas de TODAS sus tareas abiertas, en todos los proyectos.
 *      Cada tarea llena la jornada desde su día de trabajo (`scheduled_date`) hasta su fecha límite
 *      (`due_date`); lo que no cabe en el último día se queda en ese día (`allocateTaskHours`).
 *   3. Día ocupado: la carga ya es ≥ 85 % de la capacidad del día (el 15 % restante es para
 *      chats, correos y reuniones). Asignarle algo más ese día genera el aviso (`checkAssignment`).
 *   4. Tarea en sobrecarga (tarjeta del proyecto): en los días que ocupa desde hoy, la persona pasa
 *      el 100 % de su capacidad en más de 0,5 h en total. Las tareas de días pasados no cuentan.
 *   5. Solo se propone mover tareas SIN EMPEZAR (por hacer y sin horas registradas). Una tarea en
 *      curso suma a la carga, pero no se propone cambiarla de manos a mitad de camino.
 *   6. Candidatos sugeridos: personas activas cuyo rol oficial o profesional es el rol cotizado
 *      («mismo rol») o un rol afín (`AFFINE_ROLE_GROUPS`, hoy Digital Designer ↔ Front-End Dev).
 *      Para elegir a mano se listan todos; los de otro rol quedan marcados «otro rol».
 *   7. Espacio del candidato = Σ (capacidad del día − su carga del día) en la ventana de la tarea
 *      (desde hoy o su día de trabajo, lo que sea más tarde, hasta la fecha límite). Para sugerirlo
 *      debe ser ≥ horas de la tarea.
 *   8. Orden: mismo rol, luego rol afín, luego otro rol; dentro de cada grupo, más espacio primero
 *      (empate: orden alfabético).
 *   9. Al sugerirle una tarea a alguien, esas horas se le reservan antes de evaluar la siguiente:
 *      «Aplicar todas» nunca lo deja por encima de su jornada.
 *  10. Si nadie cumple: se muestra la sobrecarga sin sugerencia («mueve la fecha o habla con
 *      Dirección») y se puede elegir a alguien a mano.
 *
 * BACKEND (Indunova): mismo cálculo en `GET /api/projects/:id/load-suggestions` y
 * `GET /api/capacity/check?userId&start&due&hours&role` (para el aviso al asignar). Reasignar es un
 * PATCH de la tarea (cambia el colaborador; horas cotizadas y rol de la tarea no cambian). «Ignorar»
 * se guarda por tarea y líder, y la sugerencia vuelve si cambian las fechas o la carga.
 */
import type { TaskItem, TeamAbsenceEvent, UserItem } from '../types';
import { allocateTaskHours, businessDaysInRange, DEFAULT_DAILY_CAPACITY } from './scheduleEngine';
import { hasAffineRole, isEligibleTeamMember, matchesQuotedRole } from '../newbusiness/teamCandidates';
import { makeUserResolver } from '../projects/teamFromTasks';

export const OVERLOAD_TOLERANCE_HOURS = 0.5;
export const BUSY_DAY_RATIO = 0.85;

type Fit = 'own' | 'affine' | 'cover';

export interface CandidateOption {
  user: UserItem;
  fit: Fit;
  /** Horas libres en la ventana. */
  freeHours: number;
  /** Día más cargado de la ventana, en % de su capacidad (999 = ausente). */
  peakPct: number;
}

export interface LoadSuggestion {
  taskId: string;
  taskTitle: string;
  role: string;
  hours: number;
  from: string;
  overHours: number;
  peakPct: number;
  fromAbsent: boolean;
  windowStart: string;
  windowEnd: string;
  to?: { user: UserItem; freeHours: number; fit: 'own' | 'affine' };
  /** Todas las personas para elegir a mano (orden de la regla 8). */
  options: CandidateOption[];
}

const isOpen = (t: TaskItem) => !t.completed && t.status !== 'Done' && t.status !== 'completed';
const notStarted = (t: TaskItem) => isOpen(t) && (t.consumedSeconds || 0) === 0 && t.status !== 'In Progress' && t.status !== 'in_progress' && t.status !== 'Review' && t.status !== 'in_review';
const iso = (v?: string | null) => (v || '').slice(0, 10);
const isIso = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Reglas 1 y 2: capacidad y carga por persona y día. */
export function buildLoadContext(params: { allTasks: TaskItem[]; users: UserItem[]; absences?: TeamAbsenceEvent[]; dailyCapacity?: number; excludeTaskIds?: Set<string> }) {
  const cap = params.dailyCapacity || DEFAULT_DAILY_CAPACITY;
  const resolveId = makeUserResolver(params.users);
  const keyOf = (name?: string) => (name ? resolveId(name) || name : '');
  const absenceHours = new Map<string, Map<string, number>>();
  (params.absences || []).filter((a) => a.status !== 'cancelled').forEach((a) => {
    const perDay = absenceHours.get(a.userId) || new Map<string, number>();
    businessDaysInRange(a.startDate, a.endDate).forEach((d) => perDay.set(d, Math.min(cap, (perDay.get(d) || 0) + (a.allDay ? cap : a.impactHoursPerDay || 0))));
    absenceHours.set(a.userId, perDay);
  });
  const load = new Map<string, Map<string, number>>();
  params.allTasks.forEach((t) => {
    if (!isOpen(t) || params.excludeTaskIds?.has(t.id)) return;
    const key = keyOf(t.assignee?.name);
    const start = iso(t.scheduledDate);
    if (!key || t.assignee?.name === '-' || !isIso(start)) return;
    const perDay = load.get(key) || new Map<string, number>();
    allocateTaskHours(t.budgetedHours || 0, start, iso(t.dueDate) || start, cap).forEach((h, d) => perDay.set(d, (perDay.get(d) || 0) + h));
    load.set(key, perDay);
  });
  const reserved = new Map<string, Map<string, number>>();
  const capacityOf = (key: string, d: string) => Math.max(0, cap - (absenceHours.get(key)?.get(d) || 0));
  const used = (key: string, d: string) => (load.get(key)?.get(d) || 0) + (reserved.get(key)?.get(d) || 0);
  const isAbsent = (key: string, d: string) => (absenceHours.get(key)?.get(d) || 0) > 0;
  const reserve = (key: string, days: string[], hours: number) => {
    const perDay = reserved.get(key) || new Map<string, number>();
    let remaining = hours;
    days.forEach((d) => {
      if (remaining <= 0) return;
      const take = Math.min(remaining, Math.max(0, capacityOf(key, d) - used(key, d)));
      if (take > 0) perDay.set(d, (perDay.get(d) || 0) + take);
      remaining -= take;
    });
    reserved.set(key, perDay);
  };
  return { cap, keyOf, capacityOf, used, isAbsent, reserve };
}
export type LoadContext = ReturnType<typeof buildLoadContext>;

const pct = (ctx: LoadContext, key: string, d: string) => (ctx.capacityOf(key, d) > 0 ? Math.round((ctx.used(key, d) / ctx.capacityOf(key, d)) * 100) : 999);

/** Reglas 6–8: todas las personas activas para una ventana, en orden de sugerencia. */
export function rankCandidates(ctx: LoadContext, params: { users: UserItem[]; role: string; windowStart: string; windowEnd: string; excludeKey?: string }): CandidateOption[] {
  const window = businessDaysInRange(params.windowStart, params.windowEnd >= params.windowStart ? params.windowEnd : params.windowStart);
  const order: Record<Fit, number> = { own: 0, affine: 1, cover: 2 };
  return params.users
    .filter(isEligibleTeamMember)
    .filter((u) => u.id !== params.excludeKey)
    .map((u) => {
      const fit: Fit = params.role && matchesQuotedRole(u, params.role) ? 'own' : params.role && hasAffineRole(u, params.role) ? 'affine' : 'cover';
      const free = window.reduce((acc, d) => acc + Math.max(0, ctx.capacityOf(u.id, d) - ctx.used(u.id, d)), 0);
      const peakPct = window.length ? Math.max(...window.map((d) => pct(ctx, u.id, d))) : 0;
      return { user: u, fit, freeHours: Number(free.toFixed(1)), peakPct };
    })
    .sort((a, b) => order[a.fit] - order[b.fit] || b.freeHours - a.freeHours || a.user.name.localeCompare(b.user.name));
}

export interface AssignmentCheck {
  /** Días (de la tarea) en que la persona ya está ≥ 85 % antes de sumarle esta tarea. */
  busyDays: { date: string; pct: number }[];
  /** Día más cargado de la ventana contando esta tarea (%). */
  peakPctWithTask: number;
  absent: boolean;
  /** Alternativas del mismo rol o afín con espacio para toda la tarea (máximo 3). */
  alternatives: CandidateOption[];
}

/** Regla 3: aviso al asignar una tarea a alguien que ya tiene el día ocupado. */
export function checkAssignment(ctx: LoadContext, params: { users: UserItem[]; personName: string; role: string; start: string; due: string; hours: number; todayIso?: string }): AssignmentCheck | null {
  const key = ctx.keyOf(params.personName);
  const today = params.todayIso || new Date().toISOString().slice(0, 10);
  const start = isIso(params.start) ? (params.start > today ? params.start : today) : today;
  const due = isIso(params.due) && params.due >= start ? params.due : start;
  if (!key || !(params.hours > 0)) return null;
  const alloc = allocateTaskHours(params.hours, start, due, ctx.cap);
  const days = Array.from(alloc.keys());
  const busyDays = days
    .map((d) => ({ date: d, pct: pct(ctx, key, d) }))
    .filter((x) => x.pct >= BUSY_DAY_RATIO * 100);
  const peakPctWithTask = days.length ? Math.max(...days.map((d) => (ctx.capacityOf(key, d) > 0 ? Math.round(((ctx.used(key, d) + (alloc.get(d) || 0)) / ctx.capacityOf(key, d)) * 100) : 999))) : 0;
  const absent = days.some((d) => ctx.isAbsent(key, d));
  if (busyDays.length === 0 && peakPctWithTask <= 100 && !absent) return { busyDays, peakPctWithTask, absent, alternatives: [] };
  const alternatives = rankCandidates(ctx, { users: params.users, role: params.role, windowStart: start, windowEnd: due, excludeKey: key })
    .filter((c) => c.fit !== 'cover' && c.freeHours >= params.hours)
    .slice(0, 3);
  return { busyDays, peakPctWithTask, absent, alternatives };
}

/** Reglas 4–10: tarjeta «Carga del equipo» de un proyecto en curso. */
export function suggestLoadRebalance(params: {
  projectTasks: TaskItem[];
  allTasks: TaskItem[];
  users: UserItem[];
  absences?: TeamAbsenceEvent[];
  todayIso?: string;
  dailyCapacity?: number;
}): LoadSuggestion[] {
  const today = params.todayIso || new Date().toISOString().slice(0, 10);
  const ctx = buildLoadContext({ allTasks: params.allTasks, users: params.users, absences: params.absences, dailyCapacity: params.dailyCapacity });
  const out: LoadSuggestion[] = [];

  [...params.projectTasks]
    .filter(notStarted)
    .sort((a, b) => iso(a.scheduledDate).localeCompare(iso(b.scheduledDate)) || a.id.localeCompare(b.id))
    .forEach((t) => {
      const name = t.assignee?.name;
      const key = ctx.keyOf(name);
      const start = iso(t.scheduledDate);
      const hours = t.budgetedHours || 0;
      if (!key || name === '-' || !isIso(start) || hours <= 0) return;
      const due = iso(t.dueDate) || start;
      const days = Array.from(allocateTaskHours(hours, start, due, ctx.cap).keys()).filter((d) => d >= today);
      if (days.length === 0) return;
      const overHours = days.reduce((acc, d) => acc + Math.max(0, ctx.used(key, d) - ctx.capacityOf(key, d)), 0);
      if (overHours <= OVERLOAD_TOLERANCE_HOURS) return;
      const peakPct = Math.max(...days.map((d) => pct(ctx, key, d)));
      const fromAbsent = days.some((d) => ctx.isAbsent(key, d));

      const role = t.budgetedRole || t.assignee?.role || '';
      const windowStart = start > today ? start : today;
      const windowEnd = due >= windowStart ? due : windowStart;
      const options = rankCandidates(ctx, { users: params.users, role, windowStart, windowEnd, excludeKey: key });
      const best = options.find((o) => o.fit !== 'cover' && o.freeHours >= hours);
      if (best) ctx.reserve(best.user.id, businessDaysInRange(windowStart, windowEnd), hours);
      out.push({
        taskId: t.id,
        taskTitle: t.title,
        role,
        hours,
        from: params.users.find((u) => u.id === key)?.name || name || '',
        overHours: Number(overHours.toFixed(1)),
        peakPct,
        fromAbsent,
        windowStart,
        windowEnd,
        to: best ? { user: best.user, freeHours: best.freeHours, fit: best.fit as 'own' | 'affine' } : undefined,
        options
      });
    });
  return out;
}

/**
 * Ocupación real próxima de cada persona (para sugerir colaboradores en el Alcance de New Business).
 * `utilizedPercent` = (horas de sus tareas abiertas que caen en las próximas `weeks` semanas + horas
 * de ausencias en ese periodo) / (8,4 h × días hábiles del periodo). Reemplaza el % fijo del perfil:
 * entre dos personas del mismo rol, el Alcance propone a la que tiene más espacio de verdad.
 */
export function withUpcomingUtilization(
  users: UserItem[],
  tasks: TaskItem[],
  absences: TeamAbsenceEvent[] = [],
  todayIso = new Date().toISOString().slice(0, 10),
  weeks = 4,
  dailyCapacity = DEFAULT_DAILY_CAPACITY
): UserItem[] {
  const end = new Date(todayIso);
  end.setUTCDate(end.getUTCDate() + weeks * 7 - 1);
  const endIso = end.toISOString().slice(0, 10);
  const days = businessDaysInRange(todayIso, endIso);
  if (days.length === 0) return users;
  const inRange = (d: string) => d >= todayIso && d <= endIso;
  const resolveId = makeUserResolver(users);
  const hours = new Map<string, number>();
  tasks.forEach((t) => {
    if (!isOpen(t)) return;
    const id = resolveId(t.assignee?.name) || t.assignee?.id;
    const start = iso(t.scheduledDate);
    if (!id || !isIso(start)) return;
    allocateTaskHours(t.budgetedHours || 0, start, iso(t.dueDate) || start, dailyCapacity).forEach((h, d) => {
      if (inRange(d)) hours.set(id, (hours.get(id) || 0) + h);
    });
  });
  absences.filter((a) => a.status !== 'cancelled').forEach((a) => {
    businessDaysInRange(a.startDate, a.endDate).filter(inRange).forEach(() => {
      hours.set(a.userId, (hours.get(a.userId) || 0) + (a.allDay ? dailyCapacity : a.impactHoursPerDay || 0));
    });
  });
  const capacity = days.length * dailyCapacity;
  return users.map((u) => ({ ...u, utilizedPercent: Math.round(((hours.get(u.id) || 0) / capacity) * 100) }));
}
