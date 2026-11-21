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
  // Fases que el cliente revisa (18 Nov 2026): cada una se presenta, tiene su ventana de aprobación y
  // sus ajustes. Prioridad: fases marcadas «gate/aprobación»; si no, todas menos las de arranque o
  // cierre (Onboarding, Insumos, Kickoff, Entrega, Cierre). Antes todas las rondas caían en la última fase.
  const named = deliverables.map((d, i) => (/gate|aprobaci/i.test(d.name) ? i : -1)).filter((i) => i >= 0);
  const reviewable = deliverables
    .map((d, i) => (/onboarding|insumo|kick\s*-?\s*off|^\s*entrega|cierre/i.test(d.name) ? -1 : i))
    .filter((i) => i >= 0);
  const targets = named.length > 0 ? named : reviewable.length > 0 ? reviewable : [deliverables.length - 1];
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
  /** Tareas que no caben en la agenda de su colaborador dentro de su ventana (agenda por capacidad). */
  conflicts: CapacityConflict[];
}

// ── Agenda por capacidad (17 Nov 2026) ──────────────────────────────────────────
// Cada tarea tiene una VENTANA dentro del cronograma: desde que puede empezar hasta su fecha
// límite (`dueDate`, protege la entrega). Con capacidad, ECO elige el DÍA DE TRABAJO
// (`scheduledDate`): el primer día de la ventana en que al colaborador le cabe la tarea según lo
// que ya tiene agendado en todos sus proyectos. Si no cabe en ningún día, queda el día con más
// espacio y se reporta un conflicto para que el líder reasigne o mueva fechas.

export const DEFAULT_DAILY_CAPACITY = 8.4; // 42 h / 5

export interface CapacityContext {
  /** Persona que ejecuta cada tarea (clave usada en `existingLoad`, p. ej. el nombre). */
  assigneeOf: (taskId: string) => string | undefined;
  /** Horas ya agendadas por persona y día (YYYY-MM-DD), de sus otras tareas. Se actualiza al planear. */
  existingLoad: Map<string, Map<string, number>>;
  dailyCapacity?: number;
}

export interface CapacityConflict {
  taskId: string;
  person: string;
  hours: number;
  windowStart: string;
  windowEnd: string;
  freeInWindow: number;
}

/** Días hábiles desde `from` hasta `to` (inclusive). */
export function businessDaysInRange(from: string, to: string): string[] {
  const out: string[] = [];
  let cur = toBusinessDay(from);
  let guard = 0;
  while (cur <= to && guard < 400) {
    out.push(cur);
    cur = addBusinessDays(cur, 1);
    guard++;
  }
  return out.length > 0 ? out : [toBusinessDay(from)];
}

/**
 * Reparte las horas de una tarea desde su día de trabajo, llenando hasta la capacidad diaria
 * (sin pasar de su fecha límite; lo que sobra va al último día). Base de «Plan» en Capacidad.
 */
export function allocateTaskHours(hours: number, workDay: string, dueDate: string, dailyCapacity = DEFAULT_DAILY_CAPACITY): Map<string, number> {
  const out = new Map<string, number>();
  if (!(hours > 0) || !workDay) return out;
  const days = businessDaysInRange(workDay, dueDate && dueDate >= workDay ? dueDate : workDay);
  let remaining = hours;
  days.forEach((d, i) => {
    if (remaining <= 0) return;
    const take = i === days.length - 1 ? remaining : Math.min(remaining, dailyCapacity);
    out.set(d, (out.get(d) || 0) + take);
    remaining -= take;
  });
  return out;
}

/** Carga agendada por persona y día a partir de tareas abiertas (clave = nombre del colaborador). */
export function buildExistingLoad(
  tasks: Pick<TaskItem, 'id' | 'budgetedHours' | 'scheduledDate' | 'dueDate' | 'completed' | 'status' | 'assignee'>[],
  excludeIds: Set<string>,
  dailyCapacity = DEFAULT_DAILY_CAPACITY
): Map<string, Map<string, number>> {
  const load = new Map<string, Map<string, number>>();
  tasks.forEach((t) => {
    if (excludeIds.has(t.id) || t.completed || t.status === 'Done') return;
    const person = t.assignee?.name;
    const start = (t.scheduledDate || '').slice(0, 10);
    if (!person || person === '-' || !/^\d{4}-\d{2}-\d{2}$/.test(start)) return;
    const perDay = load.get(person) || new Map<string, number>();
    allocateTaskHours(t.budgetedHours || 0, start, (t.dueDate || start).slice(0, 10), dailyCapacity).forEach((h, d) => {
      perDay.set(d, (perDay.get(d) || 0) + h);
    });
    load.set(person, perDay);
  });
  return load;
}

/** Elige el día de trabajo dentro de la ventana y reserva las horas en la carga de la persona. */
export function placeByCapacity(
  taskId: string,
  hours: number,
  windowStart: string,
  windowEnd: string,
  ctx: CapacityContext,
  conflicts: CapacityConflict[]
): string {
  const person = ctx.assigneeOf(taskId);
  if (!person || !(hours > 0)) return windowStart;
  const cap = ctx.dailyCapacity || DEFAULT_DAILY_CAPACITY;
  const days = businessDaysInRange(windowStart, windowEnd);
  const perDay = ctx.existingLoad.get(person) || new Map<string, number>();
  const free = days.map((d) => Math.max(0, cap - (perDay.get(d) || 0)));

  // Primer día desde el que la tarea cabe completa antes de su fecha límite
  let chosen = -1;
  for (let i = 0; i < days.length; i++) {
    const fitsToday = free[i] >= Math.min(hours, cap) - 0.01;
    const restFree = free.slice(i).reduce((a, b) => a + b, 0);
    if (fitsToday && restFree >= hours - 0.01) { chosen = i; break; }
  }
  if (chosen < 0) {
    const maxFree = Math.max(...free);
    chosen = Math.max(0, free.indexOf(maxFree));
    conflicts.push({ taskId, person, hours, windowStart: days[0], windowEnd: days[days.length - 1], freeInWindow: Number(free.reduce((a, b) => a + b, 0).toFixed(1)) });
  }

  // Reservar: llena desde el día elegido según el espacio libre; lo que no quepa va al último día
  let remaining = hours;
  for (let i = chosen; i < days.length && remaining > 0.001; i++) {
    const take = i === days.length - 1 ? remaining : Math.min(remaining, Math.max(free[i], 0));
    if (take <= 0) continue;
    perDay.set(days[i], (perDay.get(days[i]) || 0) + take);
    remaining -= take;
  }
  ctx.existingLoad.set(person, perDay);
  return days[chosen];
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
  /** Agenda por capacidad: si viene, cada tarea se ubica en un día en que a su colaborador le cabe. */
  capacity?: CapacityContext;
  /**
   * Fecha mínima de inicio por entregable (YYYY-MM-DD): p. ej. el cliente se compromete a entregar
   * un insumo bloqueante después del inicio planeado. El entregable y los siguientes se corren.
   */
  deliverableNotBefore?: Record<string, string>;
}): PlannedSchedule {
  const baseline = computeScheduleBaseline(params);
  const cfg = resolveScheduleConfig(params.config, params.isFee);
  const dels = params.deliverables;
  const tasks: PlannedSchedule['tasks'] = {};
  const conflicts: CapacityConflict[] = [];

  if (dels.length === 0) {
    params.tasks.forEach((t) => {
      const scheduledDate = params.capacity
        ? placeByCapacity(t.id, t.budgetedHours || 0, baseline.startDate, baseline.endDate, params.capacity, conflicts)
        : baseline.startDate;
      tasks[t.id] = { scheduledDate, dueDate: baseline.endDate };
    });
    return { baseline, deliverables: [], tasks, conflicts };
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
    // Compromiso del cliente: el entregable no empieza antes de que llegue su insumo bloqueante
    const notBefore = params.deliverableNotBefore?.[d.id];
    if (notBefore && businessDayAt(baseline.startDate, cursor) < notBefore) {
      while (businessDayAt(baseline.startDate, cursor) < toBusinessDay(notBefore) && cursor < 1000) cursor++;
    }
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
      const windowStart = businessDayAt(baseline.startDate, delStart + startOff);
      const dueDate = businessDayAt(baseline.startDate, delStart + Math.min(endOff, prodDays - 1));
      const scheduledDate = params.capacity
        ? placeByCapacity(t.id, t.budgetedHours || 0, windowStart, dueDate, params.capacity, conflicts)
        : windowStart;
      tasks[t.id] = { scheduledDate, dueDate };
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
    if (!tasks[t.id]) {
      const scheduledDate = params.capacity
        ? placeByCapacity(t.id, t.budgetedHours || 0, baseline.startDate, baseline.endDate, params.capacity, conflicts)
        : baseline.startDate;
      tasks[t.id] = { scheduledDate, dueDate: baseline.endDate };
    }
  });

  // El fin real del plan (puede crecer si algún entregable necesitó el mínimo de 1 día)
  const planEnd = businessDayAt(baseline.startDate, cursor - 1);
  // Ronda 3: la producción real también crece, para que la vista previa del «Iniciar proyecto»
  // muestre exactamente la misma entrega que queda en el proyecto.
  const finalBaseline = planEnd > baseline.endDate
    ? { ...baseline, endDate: planEnd, totalBusinessDays: cursor, productionDays: baseline.productionDays + (cursor - baseline.totalBusinessDays) }
    : baseline;

  return { baseline: finalBaseline, deliverables: plannedDels, tasks, conflicts };
}
