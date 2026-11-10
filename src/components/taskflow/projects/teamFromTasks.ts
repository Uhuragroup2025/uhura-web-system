/**
 * Equipo del proyecto derivado de las TAREAS (fuente única de verdad).
 *
 * Regla de negocio:
 *  - El rol lo define la actividad cotizada (task.budgetedRole), no la persona.
 *    Si un Product Lead ejecuta una tarea de Front-End, esas horas cuentan para
 *    el rol Front-End y la persona queda marcada como «cubre rol».
 *  - Las horas cotizadas de la actividad nunca cambian al reasignar la tarea.
 *  - Carga semanal = horas de tareas no completadas prorrateadas sobre su ventana
 *    programada (scheduledDate → dueDate) en días hábiles.
 *  - No existe un formulario de asignación manual: reasignar = cambiar el
 *    colaborador en la tarea.
 */
import type { TaskItem, UserItem } from '../types';
import { calculateBusinessDays, isBusinessDay } from '../health/projectHealthEngine';

export interface TeamRoleLine {
  role: string;
  assignedHours: number;   // Horas cotizadas de las tareas de ese rol asignadas a la persona
  executedHours: number;   // Horas registradas por la persona en tareas de ese rol
  isCoverage: boolean;     // La persona no tiene este rol como rol oficial
}

export interface TeamMemberRow {
  user: UserItem;
  isLead: boolean;
  roles: TeamRoleLine[];
  weekHours: number;       // Carga de esta semana en este proyecto
  pendingHours: number;    // Horas asignadas en tareas no completadas
  executedHours: number;
  tasksCount: number;
  hasCoverage: boolean;
}

const norm = (s?: string | null) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const isDone = (t: TaskItem) =>
  t.completed || t.status === 'completed' || t.status === 'Done';

/** Lunes y viernes (YYYY-MM-DD, UTC) de la semana de `todayIso`. */
export function currentWeekRange(todayIso = new Date().toISOString().slice(0, 10)) {
  const d = new Date(todayIso);
  const dow = d.getUTCDay(); // 0 = domingo
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - ((dow + 6) % 7));
  const friday = new Date(monday);
  friday.setUTCDate(monday.getUTCDate() + 4);
  return { start: monday.toISOString().slice(0, 10), end: friday.toISOString().slice(0, 10) };
}

/** Días hábiles inclusivos entre dos fechas. */
function businessDaysInclusive(start: string, end: string): number {
  if (!start || !end || start > end) return 0;
  return calculateBusinessDays(start, end) + (isBusinessDay(new Date(start)) ? 1 : 0);
}

type IdResolver = (name?: string | null) => string | undefined;

/**
 * Resuelve un nombre de asignado a un userId (compatibilidad con datos sin ID:
 * «Paola (Lead PM)», «Camilo Velez»). En backend siempre llega el userId.
 */
export function makeUserResolver(users: UserItem[]): IdResolver {
  return (name) => {
    const key = norm(name);
    if (!key) return undefined;
    const exact = users.find((u) => norm(u.name) === key) || users.find((u) => key.includes(norm(u.name)));
    if (exact) return exact.id;
    const first = key.split(/[\s(]/)[0];
    const byFirst = users.filter((u) => norm(u.name).split(' ')[0] === first);
    if (byFirst.length === 1) return byFirst[0].id;
    const keyParts = key.split(/[\s()]+/).filter(Boolean);
    return byFirst.find((u) => norm(u.name).split(' ').some((part, i) => i > 0 && keyParts.includes(part)))?.id;
  };
}

/** Reparto de horas de una tarea por persona (allocations > assigneeIds > assignee). */
export function getTaskHoursByUser(t: TaskItem, resolveId?: IdResolver): Map<string, number> {
  const out = new Map<string, number>();
  const total = t.budgetedHours || t.estimatedHours || 0;
  if (t.assigneeAllocations && t.assigneeAllocations.length > 0) {
    t.assigneeAllocations.forEach((a) => {
      const id = a.userId || resolveId?.(a.userName);
      if (id) out.set(id, (out.get(id) || 0) + (a.estimatedHours || 0));
    });
    return out;
  }
  const assigneeId = t.assignee?.id || resolveId?.(t.assignee?.name);
  const ids = (t.assigneeIds && t.assigneeIds.length > 0)
    ? t.assigneeIds
    : assigneeId ? [assigneeId] : [];
  ids.forEach((id) => out.set(id, (out.get(id) || 0) + total / ids.length));
  return out;
}

/** Horas ejecutadas por persona en una tarea (timeLogs; si no hay, consumo repartido). */
function getExecutedByUser(t: TaskItem, resolveId?: IdResolver): Map<string, number> {
  const out = new Map<string, number>();
  const logs = (t.timeLogs || []).filter((l) => l.userId);
  if (logs.length > 0) {
    logs.forEach((l) => out.set(l.userId!, (out.get(l.userId!) || 0) + (l.durationSeconds || 0) / 3600));
    return out;
  }
  const consumed = (t.consumedSeconds || 0) / 3600;
  if (consumed <= 0) return out;
  const owners = Array.from(getTaskHoursByUser(t, resolveId).keys());
  owners.forEach((id) => out.set(id, consumed / owners.length));
  return out;
}

/** Horas de la tarea que caen en la semana [weekStart, weekEnd] para cada persona. */
export function getTaskWeekHoursByUser(t: TaskItem, weekStart: string, weekEnd: string, resolveId?: IdResolver): Map<string, number> {
  const out = new Map<string, number>();
  if (isDone(t)) return out;
  const byUser = getTaskHoursByUser(t, resolveId);
  const winStart = t.scheduledDate || '';
  const winEnd = t.dueDate || '';

  let fraction = 0;
  if (winStart && winEnd && winStart <= winEnd) {
    const total = businessDaysInclusive(winStart, winEnd);
    const overlapStart = winStart > weekStart ? winStart : weekStart;
    const overlapEnd = winEnd < weekEnd ? winEnd : weekEnd;
    const overlap = businessDaysInclusive(overlapStart, overlapEnd);
    fraction = total > 0 ? overlap / total : 0;
  } else if (winEnd && winEnd >= weekStart && winEnd <= weekEnd) {
    fraction = 1; // Tareas sin ventana: cuentan en la semana de su vencimiento
  }
  if (fraction <= 0) return out;
  byUser.forEach((h, id) => out.set(id, h * fraction));
  return out;
}

export function userHasRole(user: UserItem, role: string): boolean {
  const r = norm(role);
  if (!r) return true;
  const candidates = [
    user.officialRole,
    ...(user.officialRoles || []),
    user.professionalRole,
    ...(user.professionalRoles || [])
  ].map((x) => norm(x as string)).filter(Boolean);
  return candidates.includes(r);
}

export function buildTeamFromTasks(params: {
  projectTasks: TaskItem[];
  users: UserItem[];
  leadName?: string;
  todayIso?: string;
}): TeamMemberRow[] {
  const { projectTasks, users } = params;
  const week = currentWeekRange(params.todayIso);
  const rows = new Map<string, TeamMemberRow>();
  const roleMaps = new Map<string, Map<string, TeamRoleLine>>();
  const resolveId = makeUserResolver(users);

  const resolveUser = (id: string, fallbackName?: string): UserItem =>
    users.find((u) => u.id === id) || ({
      id,
      name: fallbackName || id,
      email: '',
      initials: (fallbackName || id).slice(0, 2).toUpperCase(),
      avatarBg: 'bg-[#64748b]',
      role: 'Member',
      status: 'Active',
      tasksCount: 0,
      joinedDate: '',
      capacityHours: 42
    } as UserItem);

  const ensure = (id: string, fallbackName?: string) => {
    if (!rows.has(id)) {
      const user = resolveUser(id, fallbackName);
      rows.set(id, {
        user,
        isLead: false,
        roles: [],
        weekHours: 0,
        pendingHours: 0,
        executedHours: 0,
        tasksCount: 0,
        hasCoverage: false
      });
      roleMaps.set(id, new Map());
    }
    return rows.get(id)!;
  };

  projectTasks.forEach((t) => {
    const role = t.budgetedRole || t.assignee?.role || 'Sin rol cotizado';
    const hoursByUser = getTaskHoursByUser(t, resolveId);
    const execByUser = getExecutedByUser(t, resolveId);
    const weekByUser = getTaskWeekHoursByUser(t, week.start, week.end, resolveId);
    const ids = new Set([...hoursByUser.keys(), ...execByUser.keys()]);

    ids.forEach((id) => {
      const row = ensure(id, t.assignee?.name);
      const roles = roleMaps.get(id)!;
      const line = roles.get(role) || {
        role,
        assignedHours: 0,
        executedHours: 0,
        isCoverage: !userHasRole(row.user, role)
      };
      line.assignedHours += hoursByUser.get(id) || 0;
      line.executedHours += execByUser.get(id) || 0;
      roles.set(role, line);

      row.tasksCount += hoursByUser.has(id) ? 1 : 0;
      row.executedHours += execByUser.get(id) || 0;
      row.weekHours += weekByUser.get(id) || 0;
      if (!isDone(t)) row.pendingHours += hoursByUser.get(id) || 0;
    });
  });

  // El líder siempre aparece, aunque aún no tenga tareas
  if (params.leadName) {
    const leadId = resolveId(params.leadName);
    if (leadId) ensure(leadId).isLead = true;
  }

  rows.forEach((row, id) => {
    row.roles = Array.from(roleMaps.get(id)!.values()).sort((a, b) => b.assignedHours - a.assignedHours);
    row.hasCoverage = row.roles.some((r) => r.isCoverage);
  });

  return Array.from(rows.values()).sort((a, b) => {
    if (a.isLead !== b.isLead) return a.isLead ? -1 : 1;
    return b.pendingHours - a.pendingHours;
  });
}

/** Carga semanal de cada persona sumando TODOS los proyectos (para capacidad global). */
export function buildGlobalWeekLoad(allTasks: TaskItem[], users: UserItem[], todayIso?: string): Map<string, number> {
  const week = currentWeekRange(todayIso);
  const out = new Map<string, number>();
  const resolveId = makeUserResolver(users);
  allTasks.forEach((t) => {
    getTaskWeekHoursByUser(t, week.start, week.end, resolveId).forEach((h, id) => out.set(id, (out.get(id) || 0) + h));
  });
  return out;
}
