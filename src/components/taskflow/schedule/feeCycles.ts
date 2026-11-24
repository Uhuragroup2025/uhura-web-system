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

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const shortDate = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS_SHORT[(m || 1) - 1]}`; };

/**
 * Inicio del ciclo N (0 = primero): el ciclo va de «día del contrato» a «día del contrato − 1» del mes
 * siguiente (23 Nov – 22 Dic). Si el día no existe en ese mes (31), se usa el último día del mes.
 */
export function cycleStartDate(contractStartIso: string, offset: number): string {
  const [y, m, d] = contractStartIso.slice(0, 10).split('-').map(Number);
  const idx = y * 12 + (m - 1) + offset;
  const ty = Math.floor(idx / 12);
  const tm = idx % 12;
  const last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  return `${ty}-${String(tm + 1).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`;
}
const dayBefore = (iso: string) => { const dt = new Date(`${iso}T00:00:00Z`); dt.setUTCDate(dt.getUTCDate() - 1); return dt.toISOString().slice(0, 10); };

/**
 * Nombre del ciclo (23 Nov 2026): si el contrato empieza el día 1, el ciclo es el mes calendario
 * («Noviembre 2026»); si empieza otro día, se nombra por sus fechas reales («23 Nov – 22 Dic»), para que
 * nunca haya tareas de un «Noviembre» que terminan en diciembre.
 */
export function cycleLabel(startIso: string, endIso: string): string {
  if (startIso.endsWith('-01')) return monthLabel(startIso.slice(0, 7));
  return `${shortDate(startIso)} – ${shortDate(endIso)}${startIso.slice(0, 4) !== endIso.slice(0, 4) ? ` ${endIso.slice(0, 4)}` : ''}`;
}

/**
 * Ciclo al que pertenece una tarea. Primero su `cycleKey`; si no lo tiene, se deriva de su fecha:
 * con el inicio del contrato, por el ciclo real (23 Nov – 22 Dic → '2026-11'); sin él, por el mes.
 */
export function taskCycleKey(t: Pick<TaskItem, 'cycleKey' | 'scheduledDate' | 'dueDate' | 'date'>, contractStartIso?: string | null): string {
  if (t.cycleKey) return t.cycleKey;
  const iso = (t.scheduledDate || t.dueDate || t.date || '').slice(0, 10);
  if (!contractStartIso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return monthKeyOf(iso);
  const startDay = Number(contractStartIso.slice(8, 10));
  const day = Number(iso.slice(8, 10));
  // Antes del día del contrato, la fecha pertenece al ciclo que empezó el mes anterior
  return day >= startDay || startDay === 1 ? monthKeyOf(iso) : addMonthsToKey(monthKeyOf(iso), -1);
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
  /**
   * Excepción por mes (17 Nov 2026): al abrir un mes, el líder decide qué pasa con las horas no
   * usadas del mes anterior. Clave = mes que RECIBE las horas (YYYY-MM). Sin excepción, aplica la
   * política del contrato.
   */
  rolloverOverrides?: Record<string, FeeRolloverPolicy>;
}): ProjectMonthlyCycle[] {
  const policyFor = (key: string): FeeRolloverPolicy | undefined => params.rolloverOverrides?.[key] ?? params.rolloverPolicy;
  const today = (params.todayIso || new Date().toISOString()).slice(0, 10);
  const startKey = monthKeyOf(params.contractStartDate);
  const executedBy = new Map<string, number>();
  params.tasks.forEach((t) => {
    const k = taskCycleKey(t, params.contractStartDate);
    executedBy.set(k, (executedBy.get(k) || 0) + (t.consumedSeconds || 0) / 3600);
  });

  const cycles: ProjectMonthlyCycle[] = [];
  let carry = 0;
  let offset = 0;
  params.periods.forEach((period, pIdx) => {
    for (let i = 0; i < period.months; i++, offset++) {
      const key = addMonthsToKey(startKey, offset);
      const startDate = cycleStartDate(params.contractStartDate, offset);
      const endDate = dayBefore(cycleStartDate(params.contractStartDate, offset + 1));
      const status: ProjectMonthlyCycle['status'] = endDate < today ? 'closed' : startDate <= today ? 'active' : 'upcoming';
      const executed = Number((executedBy.get(key) || 0).toFixed(1));
      const policyIn = policyFor(key);
      const rolloverIn = policyIn && policyIn !== 'none' ? carry : 0;
      cycles.push({
        monthKey: key,
        monthLabel: cycleLabel(startDate, endDate),
        startDate,
        endDate,
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
      const nextPolicy = policyFor(addMonthsToKey(key, 1));
      carry = nextPolicy === 'carry_over'
        ? unused
        : nextPolicy === 'contractual_cap'
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
    createdAt: new Date().toISOString(),
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
