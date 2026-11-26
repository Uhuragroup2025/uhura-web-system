/**
 * Quién puede eliminar tareas e insumos (26 Nov 2026, decisión de Uhura).
 *
 * - Comité operativo (líderes, Comercial, Dirección) y system_admin: siempre (con confirmación).
 * - Quien la creó: solo mientras NO tenga horas cargadas ni esté entregada. Así un colaborador puede
 *   borrar su propio duplicado (p. ej. un doble clic), pero nunca trabajo con horas.
 * - Insumos, la misma regla: el comité siempre; quien lo creó, solo mientras no esté recibido.
 * - Nadie más.
 */
import type { ProjectDependency, TaskItem, TimeLog, UserItem } from './types';

export const OPERATING_COMMITTEE_LEVELS = ['leader', 'commercial', 'executive', 'system_admin'];

type Who = Pick<UserItem, 'id' | 'accessLevel'> | null | undefined;

export const isOperatingCommittee = (user: Who) => OPERATING_COMMITTEE_LEVELS.includes(user?.accessLevel || '');

const DELIVERED = ['Review', 'in_review', 'Done', 'completed'];

/** Horas registradas en la tarea (sin anuladas), en segundos. */
export function loggedSecondsForTask(task: Pick<TaskItem, 'id' | 'timeLogs'>, allLogs: TimeLog[] = []): number {
  const logs = [...(task.timeLogs || []), ...allLogs.filter((l) => l.taskId === task.id)];
  const seen = new Set<string>();
  return logs.reduce((sum, l) => {
    if (seen.has(l.id)) return sum;
    seen.add(l.id);
    if (l.isDeleted) return sum;
    return sum + (Number(l.durationSeconds) || 0);
  }, 0);
}

/**
 * ¿Puede eliminar esta tarea? `null` = sí. Si no, el motivo en palabras simples (para mostrarlo junto al
 * botón deshabilitado). `undefined` = ni siquiera se le muestra la opción (no es comité ni creador).
 */
export function taskDeleteBlock(task: TaskItem, user: Who, allLogs: TimeLog[] = []): string | null | undefined {
  if (!user) return null;
  if (isOperatingCommittee(user)) return null;
  if (!task.createdByUserId || task.createdByUserId !== user.id) return undefined;
  if (DELIVERED.includes(String(task.status))) return 'Ya está entregada: pídele a tu líder que la elimine.';
  if (loggedSecondsForTask(task, allLogs) > 0 || Number(task.consumedSeconds) > 0) return 'Ya tiene horas cargadas: pídele a tu líder que la elimine.';
  return null;
}

/** Igual para un insumo del cliente: el creador solo mientras no esté recibido. */
export function dependencyDeleteBlock(dep: ProjectDependency, user: Who): string | null | undefined {
  if (!user) return null;
  if (isOperatingCommittee(user)) return null;
  if (!dep.createdByUserId || dep.createdByUserId !== user.id) return undefined;
  if (dep.status === 'received') return 'Ya se recibió: pídele a tu líder que lo elimine.';
  return null;
}
