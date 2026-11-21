/**
 * Ventana de fechas en que se pueden cargar horas (regla aprobada con Dirección, 17 Nov 2026).
 *
 * - No se cargan horas a futuro (máximo: hoy).
 * - Un mes cerrado no recibe horas: «si no se cargó a tiempo, se perdió». El mes anterior
 *   queda abierto solo hasta el final del primer día hábil del mes nuevo, para cerrar el
 *   viernes o el último día del mes.
 */
import { isBusinessDay } from '../health/projectHealthEngine';

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Primer día hábil (lunes a viernes) del mes de `date`. */
export function firstBusinessDayOfMonth(date: Date): Date {
  // Lunes a viernes y sin festivos de Colombia (p. ej. el 1 de enero no cuenta)
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  while (!isBusinessDay(new Date(`${toIso(d)}T00:00:00Z`))) d.setDate(d.getDate() + 1);
  return d;
}

export function timeLogDateWindow(today: Date = new Date()): { min: string; max: string; graceOpen: boolean } {
  const firstBiz = firstBusinessDayOfMonth(today);
  const graceOpen = today.getDate() <= firstBiz.getDate();
  const min = graceOpen
    ? new Date(today.getFullYear(), today.getMonth() - 1, 1)
    : new Date(today.getFullYear(), today.getMonth(), 1);
  return { min: toIso(min), max: toIso(today), graceOpen };
}

/** Mensaje si la fecha está fuera de la ventana; null si se puede cargar. */
export function timeLogDateError(isoDate: string, today: Date = new Date()): string | null {
  const { min, max } = timeLogDateWindow(today);
  if (!isoDate) return 'Elige la fecha del trabajo.';
  if (isoDate > max) return 'No se pueden cargar horas a futuro.';
  if (isoDate < min) return 'Ese mes ya está cerrado: no se pueden cargar horas en él.';
  return null;
}
