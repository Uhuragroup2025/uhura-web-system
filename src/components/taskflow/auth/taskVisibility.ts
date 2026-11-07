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
