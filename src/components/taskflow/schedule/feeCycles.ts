/**
 * Fee mensual — contrato por vigencia con ciclos mensuales.
 *
 * Reglas:
 *  - Un fee es UN proyecto. Cada mes de la vigencia es un ciclo con la bolsa mensual
 *    de horas cotizadas (por rol, según el alcance).
 *  - Las tareas pertenecen a un ciclo (`cycleKey` = 'YYYY-MM'; si falta, se deriva de su fecha).
 *  - Política de horas no usadas (`rolloverPolicy`):
 *      none            → no se trasladan.
 *      carry_over      → el saldo no usado pasa completo al mes siguiente.
 *      contractual_cap → pasa al mes siguiente hasta un tope del 25 % de la bolsa mensual.
 *  - Renovación: añade meses a la vigencia (nuevo periodo) con la bolsa mensual acordada.
 *  - Aviso de renovación: 30 días antes del fin del contrato.
 */
import type { FeeRolloverPolicy, ProjectMonthlyCycle, TaskItem } from '../types';

export const ROLLOVER_CAP_RATIO = 0.25;
export const RENEWAL_NOTICE_DAYS = 30;

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const monthKeyOf = (iso?: string | null) => (iso ? iso.slice(0, 7) : '');

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS_ES[(m || 1) - 1]} ${y}`;
}

export function addMonthsToKey(key: string, n: number): string {
  const [y, m] = key.split('-').map(Number);
  const idx = y * 12 + (m - 1) + n;
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

/** Último día del contrato: inicio + N meses − 1 día (YYYY-MM-DD, UTC). */
export function contractEndDate(startIso: string, months: number): string {
  const d = new Date(startIso);
  d.setUTCMonth(d.getUTCMonth() + months);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function taskCycleKey(t: Pick<TaskItem, 'cycleKey' | 'scheduledDate' | 'dueDate' | 'date'>): string {
  return t.cycleKey || monthKeyOf(t.scheduledDate || t.dueDate || t.date);
}


/**
 * Construye los ciclos de la vigencia con horas ejecutadas reales y traslado de saldo.
 * `periods` permite renovaciones con bolsas distintas: [{ months, monthlyHours }].
 */
export function buildFeeCycles(params: {
  contractStartDate: string;
  periods: Array<{ months: number; monthlyHours: number }>;
  rolloverPolicy?: FeeRolloverPolicy;
  tasks: TaskItem[];
  generatedKeys?: string[];
  todayIso?: string;
}): ProjectMonthlyCycle[] {
  const todayKey = monthKeyOf(params.todayIso || new Date().toISOString());
  const startKey = monthKeyOf(params.contractStartDate);
  const executedBy = new Map<string, number>();
  params.tasks.forEach((t) => {
    const k = taskCycleKey(t);
    executedBy.set(k, (executedBy.get(k) || 0) + (t.consumedSeconds || 0) / 3600);
  });

  const cycles: ProjectMonthlyCycle[] = [];
  let carry = 0;
  let offset = 0;
  params.periods.forEach((period, pIdx) => {
    for (let i = 0; i < period.months; i++, offset++) {
      const key = addMonthsToKey(startKey, offset);
      const status: ProjectMonthlyCycle['status'] = key < todayKey ? 'closed' : key === todayKey ? 'active' : 'upcoming';
      const executed = Number((executedBy.get(key) || 0).toFixed(1));
      const rolloverIn = params.rolloverPolicy && params.rolloverPolicy !== 'none' ? carry : 0;
      cycles.push({
        monthKey: key,
        monthLabel: monthLabel(key),
        quotedHours: period.monthlyHours,
        rolloverHoursIn: rolloverIn > 0 ? Number(rolloverIn.toFixed(1)) : undefined,
        executedHours: executed,
        status,
        periodNumber: pIdx + 1,
        tasksGenerated: (params.generatedKeys || []).includes(key) || executedBy.has(key)
      });
      // Saldo que pasa al siguiente mes (solo meses cerrados)
      const available = period.monthlyHours + rolloverIn;
      const unused = status === 'closed' ? Math.max(0, available - executed) : 0;
      carry = params.rolloverPolicy === 'carry_over'
        ? unused
        : params.rolloverPolicy === 'contractual_cap'
          ? Math.min(unused, period.monthlyHours * ROLLOVER_CAP_RATIO)
          : 0;
    }
  });
  return cycles;
}

/**
 * Tareas recurrentes de un mes: copia las tareas del primer ciclo (plantilla mensual)
 * desplazando sus fechas al mes destino. No copia tiempo, estado ni registros.
 */
export function generateCycleTasks(templateTasks: TaskItem[], fromKey: string, toKey: string): TaskItem[] {
  const shift = (iso?: string | null) => {
    if (!iso) return iso;
    const [fy, fm] = fromKey.split('-').map(Number);
    const [ty, tm] = toKey.split('-').map(Number);
    if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return undefined; // Fechas no ISO (texto legado) no se desplazan
    const d = new Date(iso);
    if (isNaN(d.getTime())) return undefined;
    d.setUTCMonth(d.getUTCMonth() + (ty * 12 + tm) - (fy * 12 + fm));
    return d.toISOString().slice(0, 10);
  };
  return templateTasks.map((t, i) => ({
    ...t,
    id: `${t.id.split('@')[0]}@${toKey}-${i}`,
    cycleKey: toKey,
    status: 'todo',
    completed: false,
    completedAt: undefined,
    consumedSeconds: 0,
    executionSeconds: 0,
    managementSeconds: 0,
    timeLogs: [],
    reworks: [],
    isBlocked: false,
    isRework: false,
    scheduledDate: shift(t.scheduledDate) || `${toKey}-01`,
    date: shift(t.date) || `${toKey}-01`,
    dueDate: shift(t.dueDate) || t.dueDate,
    targetDate: shift(t.targetDate) || null,
    dueText: t.dueDate ? `Deadline: ${shift(t.dueDate)}` : t.dueText
  }));
}

export function daysUntil(isoDate: string, todayIso = new Date().toISOString().slice(0, 10)): number {
  return Math.round((new Date(isoDate).getTime() - new Date(todayIso).getTime()) / 86400000);
}
