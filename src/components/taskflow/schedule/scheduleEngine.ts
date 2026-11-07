/**
 * Motor de Cronograma (línea base) — Orbit
 *
 * Regla de negocio:
 *  - La conversión de una oportunidad NO define fechas. El proyecto nace «Por iniciar».
 *  - Al pulsar «Iniciar proyecto 🚀» se calcula la línea base en DÍAS HÁBILES:
 *
 *      total = espera_kickoff
 *            + días_producción               (semanas del alcance × 5)
 *            + gates × días_aprobación_gate
 *            + gates × tandas_incluidas × días_por_tanda
 *
 *  - Las tandas incluidas contractualmente forman parte del plan: NO son desvío.
 *    Solo una tanda adicional (> incluidas) mueve el forecast.
 *  - Los proyectos Fee mensual no tienen gates ni tandas (operación recurrente).
 */
import type { ProjectDeliverable, ProjectScheduleConfig, TaskItem } from '../types';
import { addBusinessDays, isBusinessDay } from '../health/projectHealthEngine';

export const DEFAULT_SCHEDULE_CONFIG: Required<Omit<ProjectScheduleConfig, 'productionWeeks'>> = {
  clientKickoffWaitDays: 3,
  gateApprovalWaitDays: 5,
  gateCount: 2,
  includedReworkRounds: 2,
  reworkRoundDays: 3
};

export interface ScheduleInput {
  startDate: string;            // Fecha de arranque (YYYY-MM-DD)
  productionWeeks: number;      // Semanas de producción del alcance
  config?: Partial<ProjectScheduleConfig>;
  isFee?: boolean;              // Fee mensual: sin gates ni tandas
}

export interface ScheduleBreakdown {
  startDate: string;            // Primer día hábil del proyecto
  endDate: string;              // Último día hábil (línea base)
  kickoffWaitDays: number;
  productionDays: number;
  gateCount: number;
  gateApprovalDays: number;     // Total (gates × días de aprobación)
  reworkRounds: number;
  reworkRoundDays: number;
  reworkDays: number;           // Total (gates × tandas × días por tanda)
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
  const merged = { ...DEFAULT_SCHEDULE_CONFIG, ...(config || {}) };
  return {
    clientKickoffWaitDays: Math.max(0, merged.clientKickoffWaitDays ?? 3),
    gateApprovalWaitDays: isFee ? 0 : Math.max(0, merged.gateApprovalWaitDays ?? 5),
    gateCount: isFee ? 0 : Math.max(0, merged.gateCount ?? 2),
    includedReworkRounds: isFee ? 0 : Math.max(0, merged.includedReworkRounds ?? 2),
    reworkRoundDays: isFee ? 0 : Math.max(0, merged.reworkRoundDays ?? 3)
  };
}

/** Calcula la línea base del proyecto (sin necesidad de entregables). */
export function computeScheduleBaseline(input: ScheduleInput): ScheduleBreakdown {
  const cfg = resolveScheduleConfig(input.config, input.isFee);
  const startDate = toBusinessDay(input.startDate);
  const productionDays = Math.max(1, Math.round(Math.max(0, input.productionWeeks) * 5));
  const gateApprovalDays = cfg.gateCount * cfg.gateApprovalWaitDays;
  const reworkDays = cfg.gateCount * cfg.includedReworkRounds * cfg.reworkRoundDays;
  const totalBusinessDays = cfg.clientKickoffWaitDays + productionDays + gateApprovalDays + reworkDays;

  return {
    startDate,
    endDate: businessDayAt(startDate, totalBusinessDays - 1),
    kickoffWaitDays: cfg.clientKickoffWaitDays,
    productionDays,
    gateCount: cfg.gateCount,
    gateApprovalDays,
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

/** Índices de entregables que cierran con un gate de aprobación del cliente. */
export function detectGateDeliverables(deliverables: Pick<ProjectDeliverable, 'name'>[], gateCount: number): number[] {
  if (gateCount <= 0 || deliverables.length === 0) return [];
  const named = deliverables.map((d, i) => (/gate/i.test(d.name) ? i : -1)).filter((i) => i >= 0);
  const chosen = named.slice(0, gateCount);
  // Si la plantilla no nombra suficientes gates, se asignan a los últimos entregables restantes
  for (let i = deliverables.length - 1; chosen.length < Math.min(gateCount, deliverables.length) && i >= 0; i--) {
    if (!chosen.includes(i)) chosen.push(i);
  }
  return chosen.sort((a, b) => a - b);
}

export interface PlannedSchedule {
  baseline: ScheduleBreakdown;
  deliverables: Array<{ id: string; startDate: string; endDate: string; hasGate: boolean }>;
  tasks: Record<string, { scheduledDate: string; dueDate: string }>;
}

/**
 * Planifica entregables y tareas en días hábiles:
 *  - Producción repartida por horas cotizadas de cada entregable.
 *  - Espera de kickoff después del primer entregable.
 *  - Tras cada entregable con gate: días de aprobación + tandas incluidas.
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
  // Gates por entregable: si hay más gates que entregables, los sobrantes se acumulan en el último
  const gateIdxList = detectGateDeliverables(dels, cfg.gateCount);
  const gatesAt = new Map<number, number>();
  gateIdxList.forEach((i) => gatesAt.set(i, 1));
  const extraGates = Math.max(0, cfg.gateCount - gateIdxList.length);
  if (extraGates > 0) gatesAt.set(dels.length - 1, (gatesAt.get(dels.length - 1) || 0) + extraGates);
  const gateTailDays = cfg.gateApprovalWaitDays + cfg.includedReworkRounds * cfg.reworkRoundDays;

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
    const gatesHere = gatesAt.get(i) || 0;
    const hasGate = gatesHere > 0;
    cursor += gatesHere * gateTailDays;
    if (i === 0) cursor += cfg.clientKickoffWaitDays;

    plannedDels.push({
      id: d.id,
      startDate: businessDayAt(baseline.startDate, delStart),
      endDate: businessDayAt(baseline.startDate, cursor - 1),
      hasGate
    });
  });

  // Tareas sin entregable: abarcan todo el proyecto
  params.tasks.forEach((t) => {
    if (!tasks[t.id]) tasks[t.id] = { scheduledDate: baseline.startDate, dueDate: baseline.endDate };
  });

  // El fin real del plan (puede crecer si algún entregable necesitó el mínimo de 1 día)
  const planEnd = businessDayAt(baseline.startDate, cursor - 1);
  const finalBaseline = planEnd > baseline.endDate
    ? { ...baseline, endDate: planEnd, totalBusinessDays: cursor }
    : baseline;

  return { baseline: finalBaseline, deliverables: plannedDels, tasks };
}
