/**
 * Motor de Cronograma (línea base) — ECO
 *
 * Regla de negocio:
 *  - La conversión de una oportunidad NO define fechas. El proyecto nace «Por iniciar».
 *  - Al pulsar «Iniciar proyecto 🚀» se calcula la línea base en DÍAS HÁBILES:
 *
 *      total = entrega_insumos_cliente          (tras el kickoff)
 *            + días_producción                   (semanas del alcance × 5)
 *            + rondas_ajuste × días_por_ronda    (revisión y aprobación del cliente)
 *
 *  - Ronda de ajuste = el cliente revisa una entrega, devuelve ajustes y aprueba.
 *    Es un solo concepto (antes «gates» y «tandas por gate»).
 *  - Las rondas incluidas contractualmente forman parte del plan: NO son desvío.
 *    Solo una ronda adicional (> incluidas) mueve el forecast y puede generar sobrecosto.
 *  - Los proyectos Fee mensual no tienen rondas (operación recurrente).
 */
import type { ProjectDeliverable, ProjectScheduleConfig, TaskItem } from '../types';
import { addBusinessDays, isBusinessDay } from '../health/projectHealthEngine';

/** Valores sugeridos: solo precargan los campos, siempre visibles y editables. */
export const DEFAULT_SCHEDULE_CONFIG = {
  clientKickoffWaitDays: 3,
  includedReworkRounds: 2,
  reworkRoundDays: 5
};

export interface ScheduleInput {
  startDate: string;            // Fecha de arranque (YYYY-MM-DD)
  productionWeeks: number;      // Semanas de producción del alcance
  config?: Partial<ProjectScheduleConfig>;
  isFee?: boolean;              // Fee mensual: sin rondas de ajuste
}

export interface ScheduleBreakdown {
  startDate: string;            // Primer día hábil del proyecto
  endDate: string;              // Último día hábil (línea base)
  kickoffWaitDays: number;      // Entrega de insumos del cliente tras el kickoff
  productionDays: number;
  reworkRounds: number;         // Rondas de ajuste incluidas
  reworkRoundDays: number;      // Días hábiles por ronda
  reworkDays: number;           // Total (rondas × días por ronda)
  totalBusinessDays: number;
}

/** Normaliza una fecha al primer día hábil igual o posterior. */
export function toBusinessDay(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  while (!isBusinessDay(d)) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Fecha del día hábil número `index` (0 = el mismo día de arranque). */
function businessDayAt(firstDay: string, index: number): string {
  return index <= 0 ? firstDay : addBusinessDays(firstDay, index);
}

export function resolveScheduleConfig(config?: Partial<ProjectScheduleConfig>, isFee = false) {
  const c = config || {};
  return {
    clientKickoffWaitDays: Math.max(0, c.clientKickoffWaitDays ?? DEFAULT_SCHEDULE_CONFIG.clientKickoffWaitDays),
    includedReworkRounds: isFee ? 0 : Math.max(0, c.includedReworkRounds ?? DEFAULT_SCHEDULE_CONFIG.includedReworkRounds),
    reworkRoundDays: isFee ? 0 : Math.max(0, c.reworkRoundDays ?? DEFAULT_SCHEDULE_CONFIG.reworkRoundDays)
  };
}

/** Calcula la línea base del proyecto (sin necesidad de entregables). */
export function computeScheduleBaseline(input: ScheduleInput): ScheduleBreakdown {
  const cfg = resolveScheduleConfig(input.config, input.isFee);
  const startDate = toBusinessDay(input.startDate);
  const productionDays = Math.max(1, Math.round(Math.max(0, input.productionWeeks) * 5));
  const reworkDays = cfg.includedReworkRounds * cfg.reworkRoundDays;
  const totalBusinessDays = cfg.clientKickoffWaitDays + productionDays + reworkDays;

  return {
    startDate,
    endDate: businessDayAt(startDate, totalBusinessDays - 1),
    kickoffWaitDays: cfg.clientKickoffWaitDays,
    productionDays,
    reworkRounds: cfg.includedReworkRounds,
    reworkRoundDays: cfg.reworkRoundDays,
    reworkDays,
    totalBusinessDays
  };
}

/** Reparte `total` en partes proporcionales a `weights` (método del mayor residuo). */
function allocate(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (weights.length === 0) return [];
  const safe = sum > 0 ? weights : weights.map(() => 1);
  const safeSum = safe.reduce((a, b) => a + b, 0);
  const raw = safe.map((w) => (w / safeSum) * total);
  const base = raw.map(Math.floor);
  let remainder = total - base.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac);
  for (let k = 0; remainder > 0; k = (k + 1) % order.length, remainder--) base[order[k].i]++;
  return base;
}

/**
 * Reparte las rondas de ajuste entre los entregables que el cliente revisa:
 * los que la plantilla marca como «Gate»; si no hay, al final del último entregable.
 */
export function distributeReviewRounds(deliverables: Pick<ProjectDeliverable, 'name'>[], rounds: number): Map<number, number> {
  const out = new Map<number, number>();
  if (rounds <= 0 || deliverables.length === 0) return out;
  const named = deliverables.map((d, i) => (/gate|aprobaci/i.test(d.name) ? i : -1)).filter((i) => i >= 0);
  const targets = named.length > 0 ? named : [deliverables.length - 1];
  for (let r = 0; r < rounds; r++) {
    const idx = targets[Math.min(targets.length - 1, Math.floor((r * targets.length) / rounds))];
    out.set(idx, (out.get(idx) || 0) + 1);
  }
  return out;
}

export interface PlannedSchedule {
  baseline: ScheduleBreakdown;
  deliverables: Array<{ id: string; startDate: string; endDate: string; reviewRounds: number }>;
  tasks: Record<string, { scheduledDate: string; dueDate: string }>;
}

/**
 * Planifica entregables y tareas en días hábiles:
 *  - Producción repartida por horas cotizadas de cada entregable.
 *  - Entrega de insumos del cliente después del primer entregable (kickoff).
 *  - Tras los entregables que revisa el cliente: rondas × días por ronda.
 *  - Cada tarea recibe `scheduledDate` (inicio) y `dueDate` (vencimiento).
 */
export function planProjectSchedule(params: ScheduleInput & {
  deliverables: Pick<ProjectDeliverable, 'id' | 'name' | 'totalQuotedHours'>[];
  tasks: Pick<TaskItem, 'id' | 'deliverableId' | 'budgetedHours'>[];
}): PlannedSchedule {
  const baseline = computeScheduleBaseline(params);
  const cfg = resolveScheduleConfig(params.config, params.isFee);
  const dels = params.deliverables;
  const tasks: PlannedSchedule['tasks'] = {};

  if (dels.length === 0) {
    params.tasks.forEach((t) => {
      tasks[t.id] = { scheduledDate: baseline.startDate, dueDate: baseline.endDate };
    });
    return { baseline, deliverables: [], tasks };
  }

  const tasksByDel = new Map<string, typeof params.tasks>();
  params.tasks.forEach((t) => {
    const key = t.deliverableId || '';
    tasksByDel.set(key, [...(tasksByDel.get(key) || []), t]);
  });

  const delHours = dels.map((d) => {
    const fromTasks = (tasksByDel.get(d.id) || []).reduce((acc, t) => acc + (t.budgetedHours || 0), 0);
    return d.totalQuotedHours || fromTasks || 1;
  });
  const delDays = allocate(baseline.productionDays, delHours).map((n) => Math.max(1, n));
  const roundsAt = distributeReviewRounds(dels, cfg.includedReworkRounds);

  let cursor = 0; // índice de día hábil desde el arranque
  const plannedDels: PlannedSchedule['deliverables'] = [];

  dels.forEach((d, i) => {
    const prodDays = delDays[i];
    const delStart = cursor;
    const delTasks = tasksByDel.get(d.id) || [];
    const taskHours = delTasks.map((t) => t.budgetedHours || 0);
    const totalTaskHours = taskHours.reduce((a, b) => a + b, 0) || delTasks.length || 1;

    let acc = 0;
    delTasks.forEach((t, k) => {
      const h = totalTaskHours === delTasks.length ? 1 : taskHours[k];
      const startOff = Math.floor((acc / totalTaskHours) * prodDays);
      acc += h;
      const endOff = Math.max(startOff, Math.ceil((acc / totalTaskHours) * prodDays) - 1);
      tasks[t.id] = {
        scheduledDate: businessDayAt(baseline.startDate, delStart + startOff),
        dueDate: businessDayAt(baseline.startDate, delStart + Math.min(endOff, prodDays - 1))
      };
    });

    cursor += prodDays;
    const reviewRounds = roundsAt.get(i) || 0;
    cursor += reviewRounds * cfg.reworkRoundDays;
    if (i === 0) cursor += cfg.clientKickoffWaitDays;

    plannedDels.push({
      id: d.id,
      startDate: businessDayAt(baseline.startDate, delStart),
      endDate: businessDayAt(baseline.startDate, cursor - 1),
      reviewRounds
    });
  });

  // Tareas sin entregable: abarcan todo el proyecto
  params.tasks.forEach((t) => {
    if (!tasks[t.id]) tasks[t.id] = { scheduledDate: baseline.startDate, dueDate: baseline.endDate };
  });

  // El fin real del plan (puede crecer si algún entregable necesitó el mínimo de 1 día)
  const planEnd = businessDayAt(baseline.startDate, cursor - 1);
  // Ronda 3: la producción real también crece, para que la vista previa del «Iniciar proyecto»
  // muestre exactamente la misma entrega que queda en el proyecto.
  const finalBaseline = planEnd > baseline.endDate
    ? { ...baseline, endDate: planEnd, totalBusinessDays: cursor, productionDays: baseline.productionDays + (cursor - baseline.totalBusinessDays) }
    : baseline;

  return { baseline: finalBaseline, deliverables: plannedDels, tasks };
}
