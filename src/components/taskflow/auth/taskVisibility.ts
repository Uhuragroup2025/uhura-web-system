import type { ProjectSummaryItem, TaskItem, UserItem } from '../types';

/**
 * Regla única de visibilidad de tareas (Mi Día, Tareas y bandeja de atención).
 *
 * - Responsable de ejecución (`owner`): `assignee`, `collaborators`, `assigneeIds` o
 *   `assigneeAllocations`. Solo estas tareas son «mis tareas» y entran en prioridades.
 * - Revisión (`reviewer`): la tarea está en Review y el usuario es el revisor
 *   (o el líder del proyecto cuando la tarea no tiene revisor).
 * - Seguidor (`follower`): está para enterarse. Ve la tarea en «Siguiendo», sin urgencia,
 *   sin sumar a prioridades, contadores ni capacidad.
 * - Nadie ve en sus prioridades tareas de otra persona por compartir rol o primer nombre.
 *
 * En producción la comparación es siempre por ID de usuario. La comparación por nombre
 * existe solo para datos de demostración del prototipo que no traen ID.
 */

export type TaskRelation = 'owner' | 'reviewer' | 'follower' | null;

type PersonRef = { id?: string; name?: string } | null | undefined;

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

/**
 * Devuelve una función que dice si una persona referenciada en una tarea es el usuario.
 * Prioriza ID. Sin ID: todos los nombres de la referencia deben estar en el nombre del
 * usuario («Laura Salazar» ⇒ «Laura Viviana Salazar Perez»). Un solo nombre («Paola»)
 * solo cuenta si ningún otro usuario comparte ese nombre.
 */
export function makePersonMatcher(user: Pick<UserItem, 'id' | 'name'> | null | undefined, users: Pick<UserItem, 'id' | 'name'>[] = []) {
  if (!user) return (_p: PersonRef) => false;
  const myId = user.id?.toLowerCase();
  const myTokens = normalize(user.name || '');
  const otherFirstNames = new Set(
    users.filter((u) => u.id !== user.id).map((u) => normalize(u.name || '')[0]).filter(Boolean)
  );

  return (person: PersonRef): boolean => {
    if (!person) return false;
    if (person.id) return person.id.toLowerCase() === myId;
    const tokens = normalize(person.name || '');
    if (tokens.length === 0 || myTokens.length === 0) return false;
    if (tokens.length === 1) return tokens[0] === myTokens[0] && !otherFirstNames.has(tokens[0]);
    return tokens.every((t) => myTokens.includes(t));
  };
}

export function isTaskOwner(task: TaskItem, user: Pick<UserItem, 'id' | 'name'> | null | undefined, matches: (p: PersonRef) => boolean): boolean {
  if (!user) return false;
  if (matches(task.assignee)) return true;
  if ((task.collaborators || []).some((c) => matches(c))) return true;
  if ((task.assigneeIds || []).includes(user.id)) return true;
  if ((task.assigneeAllocations || []).some((a) => a.userId === user.id || matches({ name: a.userName }))) return true;
  return false;
}

const isInReview = (t: TaskItem) => t.status === 'Review' || t.status === 'in_review';

export function getTaskRelation(task: TaskItem, user: Pick<UserItem, 'id' | 'name'> | null | undefined, matches: (p: PersonRef) => boolean): TaskRelation {
  if (!user) return null;
  if (isTaskOwner(task, user, matches)) return 'owner';
  if (isInReview(task) && (task.reviewer ? matches(task.reviewer) : matches(task.projectLead))) return 'reviewer';
  if ((task.followers || []).some((f) => matches(f))) return 'follower';
  return null;
}

/** Proyectos de los que el usuario es responsable: líder del proyecto o responsable de cuenta (comercial). */
export function isProjectResponsible(project: ProjectSummaryItem, user: Pick<UserItem, 'id' | 'name'> | null | undefined, matches: (p: PersonRef) => boolean): boolean {
  if (!user) return false;
  if (project.accountManagerId && project.accountManagerId === user.id) return true;
  if (matches({ name: project.leadName })) return true;
  if (!project.accountManagerId && matches({ name: project.accountManagerName })) return true;
  // Comercial responsable del proyecto (ronda 2)
  if (project.commercialOwnerId && project.commercialOwnerId === user.id) return true;
  if (!project.commercialOwnerId && matches({ name: project.commercialOwnerName })) return true;
  return false;
}

/** Busca el proyecto de una tarea por ID y, en datos de demostración, por nombre. */
export function makeTaskProjectResolver(projects: ProjectSummaryItem[]) {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const byName = new Map(projects.map((p) => [p.name.toLowerCase(), p]));
  return (task: TaskItem): ProjectSummaryItem | undefined =>
    (task.projectId && byId.get(task.projectId)) ||
    byName.get((task.projectName || task.board || '').toLowerCase());
}

// ── Orden y agenda del día ────────────────────────────────────────────────────
// La urgencia no la decide ECO: viene en la tarea (prioridad «urgente» puesta por quien la pide).
// Lo que ECO ordena es la cercanía de la fecha del cronograma.

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const addDaysIso = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDay(d);
};
const isIso = (s?: string | null) => Boolean(s && /^\d{4}-\d{2}-\d{2}/.test(s));

export const isUrgentTask = (t: TaskItem) => String(t.priority).toLowerCase() === 'urgent';

/** Fecha de referencia del cronograma: vencimiento, si no, inicio programado. */
export const taskScheduleDate = (t: TaskItem): string | null =>
  (isIso(t.dueDate) ? t.dueDate!.slice(0, 10) : null) || (isIso(t.scheduledDate) ? t.scheduledDate!.slice(0, 10) : null);

/**
 * ¿Está en el cronograma de hoy? Inicio o vencimiento hoy, ventana en curso que incluye hoy,
 * o vencida sin completar (sigue siendo trabajo de hoy). La prioridad no cuenta aquí.
 */
export function isScheduledForDay(t: TaskItem, todayIso: string = isoDay(new Date())): boolean {
  if (t.completed) return t.scheduledDate === todayIso || t.dueDate === todayIso;
  const start = isIso(t.scheduledDate) ? t.scheduledDate!.slice(0, 10) : null;
  const due = isIso(t.dueDate) ? t.dueDate!.slice(0, 10) : null;
  if (start === todayIso || due === todayIso) return true;
  if (start && due && start <= todayIso && todayIso <= due) return true;
  if (due && due < todayIso) return true; // vencida
  if (!start && !due) {
    // Datos de demostración sin fecha ISO: se usa el texto de vencimiento
    const txt = (t.dueText || '').toLowerCase();
    return txt.includes('hoy') || txt.includes('vencid');
  }
  return false;
}

/**
 * Rango de orden: 0 vencidas · 1 urgentes con fecha hoy o mañana · 2 el resto.
 * Dentro de cada rango: fecha más cercana primero y, a igual fecha, la urgente/alta primero.
 */
export function makeTaskComparator(todayIso: string = isoDay(new Date())) {
  const tomorrow = addDaysIso(todayIso, 1);
  const prio: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
  const rank = (t: TaskItem) => {
    const d = taskScheduleDate(t);
    if (d && d < todayIso && !t.completed) return 0;
    const start = isIso(t.scheduledDate) ? t.scheduledDate!.slice(0, 10) : d;
    if (isUrgentTask(t) && ((d && d <= tomorrow) || (start && start <= tomorrow))) return 1;
    return 2;
  };
  return (a: TaskItem, b: TaskItem) => {
    if (Boolean(a.completed) !== Boolean(b.completed)) return a.completed ? 1 : -1;
    const r = rank(a) - rank(b);
    if (r !== 0) return r;
    const da = taskScheduleDate(a) || '9999-12-31';
    const db = taskScheduleDate(b) || '9999-12-31';
    if (da !== db) return da < db ? -1 : 1;
    return (prio[String(b.priority).toLowerCase()] || 2) - (prio[String(a.priority).toLowerCase()] || 2);
  };
}
