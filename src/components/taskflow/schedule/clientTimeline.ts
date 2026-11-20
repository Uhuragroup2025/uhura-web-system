/**
 * Fases editables del cronograma (kickoff, 19 Nov 2026).
 *
 * Cada fase se describe con pasos en DÍAS HÁBILES (festivos de Colombia incluidos):
 *   producción → QA interno → [ronda: presentación + QA del cliente (aprobación) → ajustes] × N
 * Las fases van una detrás de otra desde el arranque. Si el cliente pide un día más o se mueve
 * una presentación, se edita el paso y se recalcula TODO: fases, fecha de entrega y tareas.
 */
import { addBusinessDays } from '../health/projectHealthEngine';
import { businessDaysInRange, toBusinessDay, placeByCapacity, type CapacityContext, type CapacityConflict } from './scheduleEngine';
import type { TaskItem } from '../types';

export const ADJUST_WINDOW_DAYS = 2;

/**
 * Una presentación al cliente dentro de una fase.
 *  - kind 'checkpoint': revisión informal (p. ej. wireframe): el cliente comenta, ajustamos y seguimos,
 *    sin exigir aprobación por correo. kind 'approval': aprobación formal (p. ej. prototipo).
 *  - workDays/qaDays: trabajo y QA interno ANTES de esta presentación (desde la anterior). La primera
 *    presentación de la fase usa la producción y el QA de la fase.
 */
export interface PhaseRoundSteps {
  reviewDays: number;
  adjustDays: number;
  label?: string;
  kind?: 'checkpoint' | 'approval';
  workDays?: number;
  qaDays?: number;
}
export interface PhaseSteps { id: string; name: string; productionDays: number; qaDays: number; rounds: PhaseRoundSteps[] }

export interface TimelineRound {
  n: number;
  label: string;
  kind: 'checkpoint' | 'approval';
  /** Trabajo y QA interno previos a esta presentación (solo desde la 2.ª de la fase). */
  workStart?: string;
  workEnd?: string;
  workDays: number;
  preQaStart?: string;
  preQaEnd?: string;
  preQaDays: number;
  presentation: string;
  approvalStart: string;
  approvalEnd: string;
  approvalDays: number;
  adjustStart: string;
  adjustEnd: string;
  adjustDays: number;
}

export interface TimelinePhase {
  id: string;
  name: string;
  start: string;
  end: string;
  productionStart: string;
  productionEnd: string;
  productionDays: number;
  qaStart: string;
  qaEnd: string;
  qaDays: number;
  /** compatibilidad: último día de QA */
  qaDay: string;
  rounds: TimelineRound[];
}

const nextBiz = (iso: string) => addBusinessDays(iso, 1);
const plus = (iso: string, n: number) => (n <= 0 ? iso : addBusinessDays(iso, n));

/** Pasos por defecto a partir de las fechas del plan (mismo total de días). */
export function defaultPhaseSteps(
  phases: { id: string; name: string; startDate: string; endDate: string; reviewRounds: number }[],
  reworkRoundDays: number
): PhaseSteps[] {
  const D = Math.max(1, reworkRoundDays || 1);
  const adjust = D >= 3 ? ADJUST_WINDOW_DAYS : Math.max(0, D - 1);
  return phases.map((p) => {
    const total = p.startDate && p.endDate ? businessDaysInRange(p.startDate, p.endDate).length : 1;
    const qa = p.reviewRounds > 0 && total - p.reviewRounds * D > 1 ? 1 : 0;
    return {
      id: p.id,
      name: p.name,
      productionDays: Math.max(1, total - p.reviewRounds * D - qa),
      qaDays: qa,
      rounds: Array.from({ length: p.reviewRounds }, () => ({ reviewDays: Math.max(1, D - adjust), adjustDays: adjust }))
    };
  });
}

/** Calcula las fechas de cada fase y paso desde el arranque. */
export function computePhaseSchedule(
  startDate: string,
  steps: PhaseSteps[],
  notBefore: Record<string, string> = {}
): { phases: TimelinePhase[]; endDate: string } {
  let cursor = toBusinessDay(startDate);
  let first = true;
  const phases: TimelinePhase[] = steps.map((s) => {
    let start = first ? cursor : nextBiz(cursor);
    first = false;
    const nb = notBefore[s.id];
    if (nb && start < toBusinessDay(nb)) start = toBusinessDay(nb);
    const prodDays = Math.max(1, Math.round(s.productionDays));
    const productionEnd = plus(start, prodDays - 1);
    let last = productionEnd;
    const qaDays = Math.max(0, Math.round(s.qaDays));
    const qaStart = qaDays > 0 ? nextBiz(last) : last;
    const qaEnd = qaDays > 0 ? plus(qaStart, qaDays - 1) : last;
    last = qaEnd;
    const rounds: TimelineRound[] = s.rounds.map((r, k) => {
      const review = Math.max(1, Math.round(r.reviewDays));
      const adjust = Math.max(0, Math.round(r.adjustDays));
      // Desde la 2.ª presentación de la fase: trabajo y QA interno propios antes de presentar
      const work = Math.max(0, Math.round(r.workDays || 0));
      const preQa = Math.max(0, Math.round(r.qaDays || 0));
      let workStart: string | undefined; let workEnd: string | undefined;
      let preQaStart: string | undefined; let preQaEnd: string | undefined;
      if (work > 0) { workStart = nextBiz(last); workEnd = plus(workStart, work - 1); last = workEnd; }
      if (preQa > 0) { preQaStart = nextBiz(last); preQaEnd = plus(preQaStart, preQa - 1); last = preQaEnd; }
      const presentation = nextBiz(last);
      const approvalEnd = plus(presentation, review - 1);
      const adjustStart = adjust > 0 ? nextBiz(approvalEnd) : approvalEnd;
      const adjustEnd = adjust > 0 ? plus(adjustStart, adjust - 1) : approvalEnd;
      last = adjustEnd;
      return {
        n: k + 1,
        label: r.label || s.name,
        kind: r.kind || 'approval',
        workStart, workEnd, workDays: work,
        preQaStart, preQaEnd, preQaDays: preQa,
        presentation, approvalStart: presentation, approvalEnd, approvalDays: review, adjustStart, adjustEnd, adjustDays: adjust
      };
    });
    cursor = last;
    return { id: s.id, name: s.name, start, end: last, productionStart: start, productionEnd, productionDays: prodDays, qaStart, qaEnd, qaDays, qaDay: qaEnd, rounds };
  });
  return { phases, endDate: cursor };
}


/** Días de TRABAJO de una fase: su producción y el trabajo/QA previo a cada presentación (sin QA del cliente). */
export function phaseWorkDays(ph: TimelinePhase): string[] {
  const days = new Set<string>(businessDaysInRange(ph.productionStart, ph.productionEnd));
  if (ph.qaDays > 0) businessDaysInRange(ph.qaStart, ph.qaEnd).forEach((d) => days.add(d));
  ph.rounds.forEach((r) => {
    if (r.workDays > 0 && r.workStart && r.workEnd) businessDaysInRange(r.workStart, r.workEnd).forEach((d) => days.add(d));
    if (r.preQaDays > 0 && r.preQaStart && r.preQaEnd) businessDaysInRange(r.preQaStart, r.preQaEnd).forEach((d) => days.add(d));
  });
  return Array.from(days).sort();
}

/**
 * Tareas dentro de la PRODUCCIÓN de su fase: turnos proporcionales a sus horas (como el motor) y,
 * con capacidad, el día de trabajo según la agenda del colaborador.
 */
export function planTasksFromPhases(
  phases: TimelinePhase[],
  tasks: (Pick<TaskItem, 'id' | 'deliverableId' | 'budgetedHours'> & { title?: string })[],
  capacity?: CapacityContext
): { tasks: Record<string, { scheduledDate: string; dueDate: string }>; conflicts: CapacityConflict[] } {
  const out: Record<string, { scheduledDate: string; dueDate: string }> = {};
  const conflicts: CapacityConflict[] = [];
  phases.forEach((ph) => {
    // Todos los días de trabajo de la fase (con wireframe: su producción + el trabajo del prototipo)
    const days = phaseWorkDays(ph);
    const phaseTasks = tasks.filter((t) => t.deliverableId === ph.id);
    // Tareas de ajustes de cliente («Ajustes», «Ronda post-entrega», «Aplicación de ajustes»): van en la
    // ventana de ajustes de las rondas de su fase, no en la producción (si la fase tiene rondas).
    const isAdjust = (title?: string) => /ajustes? (de|del) cliente|aplicaci[oó]n de ajustes|ronda|retrabajo|post-?entrega/i.test(title || '');
    const adjustTasks = ph.rounds.length > 0 ? phaseTasks.filter((t) => isAdjust((t as { title?: string }).title)) : [];
    // Ajustes del cliente: en la ventana de ajustes de la aprobación formal (la última de la fase)
    const formal = [...ph.rounds].reverse().find((r) => r.kind === 'approval' && r.adjustDays > 0) || ph.rounds[ph.rounds.length - 1];
    adjustTasks.forEach((t) => {
      const windowStart = formal.adjustStart;
      const dueDate = formal.adjustEnd;
      const scheduledDate = capacity ? placeByCapacity(t.id, t.budgetedHours || 0, windowStart, dueDate, capacity, conflicts) : windowStart;
      out[t.id] = { scheduledDate, dueDate };
    });
    const delTasks = phaseTasks.filter((t) => !adjustTasks.includes(t));
    const hours = delTasks.map((t) => t.budgetedHours || 0);
    const total = hours.reduce((a, b) => a + b, 0) || delTasks.length || 1;
    let acc = 0;
    delTasks.forEach((t, k) => {
      const h = total === delTasks.length ? 1 : hours[k];
      const startOff = Math.floor((acc / total) * days.length);
      acc += h;
      const endOff = Math.max(startOff, Math.ceil((acc / total) * days.length) - 1);
      const windowStart = days[Math.min(days.length - 1, startOff)];
      const dueDate = days[Math.min(days.length - 1, endOff)];
      const scheduledDate = capacity ? placeByCapacity(t.id, t.budgetedHours || 0, windowStart, dueDate, capacity, conflicts) : windowStart;
      out[t.id] = { scheduledDate, dueDate };
    });
  });
  // Tareas sin fase: todo el proyecto
  const first = phases[0]?.start;
  const last = phases[phases.length - 1]?.end;
  tasks.forEach((t) => {
    if (!out[t.id] && first && last) out[t.id] = { scheduledDate: first, dueDate: last };
  });
  return { tasks: out, conflicts };
}

/** Compatibilidad con la vista anterior. */
export function buildClientTimeline(
  phases: { id: string; name: string; startDate: string; endDate: string; reviewRounds: number }[],
  reworkRoundDays: number
): TimelinePhase[] {
  const steps = defaultPhaseSteps(phases, reworkRoundDays);
  const start = phases.find((p) => p.startDate)?.startDate;
  return start ? computePhaseSchedule(start, steps).phases : [];
}

/** Fases que el cliente revisa (tienen presentación + QA del cliente + ajustes). */
export const isClientReviewedPhase = (name: string) => !/onboarding|insumo|kick\s*-?\s*off|^\s*entrega|cierre/i.test(name);

/**
 * Pasos por defecto de un proyecto único (modelo único, 19 Nov 2026):
 *  - Producción: las semanas del alcance (× 5 días hábiles) repartidas entre fases según sus horas.
 *  - Cada fase que revisa el cliente: QA interno + UNA presentación con su QA del cliente y sus ajustes.
 *  - Las «rondas incluidas» del contrato NO son posiciones del cronograma: son cuántas veces el cliente
 *    puede pedir cambios en cada presentación. Una ronda extra agrega otra ventana y corre el forecast.
 */
export const DEFAULT_FIRST_APPROVAL_DAYS = 5;
export const DEFAULT_LATER_APPROVAL_DAYS = 3;
export const DEFAULT_ADJUST_DAYS = 2;

export function buildDefaultSteps(
  phases: { id: string; name: string; hours: number }[],
  productionWeeks: number,
  clientReviewDays = DEFAULT_FIRST_APPROVAL_DAYS,
  adjustDays = DEFAULT_ADJUST_DAYS,
  qaDays = 1,
  laterReviewDays = DEFAULT_LATER_APPROVAL_DAYS,
  options?: { area?: 'producto' | 'creativo' | 'growth' | null; serviceName?: string }
): PhaseSteps[] {
  if (phases.length === 0) return [];
  const total = Math.max(phases.length, Math.round(productionWeeks * 5));
  const weights = phases.map((p) => Math.max(0.01, p.hours || 0));
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sum) * total);
  const alloc = raw.map((r) => Math.max(1, Math.floor(r)));
  let left = total - alloc.reduce((a, b) => a + b, 0);
  raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac).forEach(({ i }) => { if (left > 0) { alloc[i]++; left--; } });
  const reviewed = phases.map((p) => isClientReviewedPhase(p.name));
  if (!reviewed.some(Boolean)) reviewed[reviewed.length - 1] = true;
  // Por defecto: una aprobación formal por fase revisada; la primera con más días (p. ej. prototipo 5 d),
  // las siguientes con menos (p. ej. implementación 3 d).
  // Presentaciones según el área y las fases del servicio (Producto, Creativo, Growth). Si ninguna regla
  // aplica, una aprobación por fase revisada (lógica genérica de abajo).
  const byArea = options?.area ? presetPresentations(options.area, phases.map((p) => p.name), options.serviceName || '') : null;
  if (byArea && byArea.some((r) => r.length > 0)) {
    let preset: PhaseSteps[] = phases.map((p, i) => {
      const rounds = byArea[i];
      const hasOwnQa = phases.some((x) => /calidad|^qa\b|qa t[eé]cnico/i.test(x.name));
      const first = rounds[0];
      return {
        id: p.id,
        name: p.name,
        productionDays: alloc[i],
        qaDays: first && first.kind === 'approval' && !hasOwnQa ? qaDays : 0,
        rounds
      };
    });
    const wireIdx = phases.findIndex((p, i) => options?.area === 'producto' && /^ux|ux y|wireframe/i.test(p.name) && preset[i].productionDays >= 2);
    if (wireIdx >= 0) preset = addWireframeCheckpoint(preset, wireIdx);
    return fitShortScope(fitAdjustmentsInsideProduction(preset, total), total);
  }

  const firstReviewed = reviewed.indexOf(true);
  const label = (name: string, first: boolean) =>
    /implement|desarroll|funcional/i.test(name) ? 'Funcionalidad' : first && /ux|dise|prototip|wireframe|contenido/i.test(name) ? 'Prototipo' : name;
  let steps: PhaseSteps[] = phases.map((p, i) => ({
    id: p.id,
    name: p.name,
    productionDays: alloc[i],
    qaDays: reviewed[i] ? qaDays : 0,
    rounds: reviewed[i]
      ? [{ label: label(p.name, i === firstReviewed), kind: 'approval' as const, reviewDays: Math.max(1, i === firstReviewed ? clientReviewDays : laterReviewDays), adjustDays: Math.max(0, adjustDays) }]
      : []
  }));
  // Proyectos con fase de UX/diseño: por defecto también el checkpoint de wireframe (informal)
  if (firstReviewed >= 0 && /ux|dise|prototip|wireframe|contenido/i.test(phases[firstReviewed].name) && steps[firstReviewed].productionDays >= 2) {
    steps = addWireframeCheckpoint(steps, firstReviewed);
  }
  return fitShortScope(fitAdjustmentsInsideProduction(steps, total), total);
}

/**
 * Alcance corto: si las presentaciones sugeridas no caben en las semanas (p. ej. landing de 1 semana),
 * se deja solo la presentación final (como cuando se presenta sobre la implementación) con 1 día de
 * ajustes; si aun así no cabe, sin días de ajustes. Luego se ajusta a semanas × 5.
 */
function fitShortScope(steps: PhaseSteps[], total: number): PhaseSteps[] {
  if (productionMinimum(steps) <= total) return steps;
  const lastIdx = steps.map((st) => st.rounds.length > 0).lastIndexOf(true);
  if (lastIdx < 0) return steps;
  let next = steps.map((st, i) => {
    let cur = st;
    const keep = i === lastIdx ? cur.rounds.length - 1 : -1;
    for (let k = cur.rounds.length - 1; k >= 0; k--) if (k !== keep) cur = removeRound(cur, k);
    return cur;
  });
  const shrink = (adjust: number) => next.map((st, i) => (i === lastIdx
    ? { ...st, productionDays: st.productionDays + Math.max(0, (st.rounds[0].adjustDays || 0) - adjust), rounds: [{ ...st.rounds[0], adjustDays: Math.min(st.rounds[0].adjustDays || 0, adjust) }] }
    : st));
  next = shrink(1);
  if (productionMinimum(next) > total) next = shrink(0);
  return rebalanceToTarget(next, total);
}

/**
 * Agrega un checkpoint de wireframe al inicio de una fase: la producción se parte (wireframe primero,
 * luego el resto antes de la presentación formal), con revisión informal corta.
 */
export function addWireframeCheckpoint(steps: PhaseSteps[], phaseIdx: number): PhaseSteps[] {
  return steps.map((s, i) => {
    if (i !== phaseIdx) return s;
    const wire = Math.max(1, Math.ceil(s.productionDays / 2));
    const rest = Math.max(0, s.productionDays - wire);
    const [first, ...others] = s.rounds;
    const formal = first ? { ...first, workDays: rest, qaDays: s.qaDays } : { label: s.name, kind: 'approval' as const, reviewDays: DEFAULT_FIRST_APPROVAL_DAYS, adjustDays: DEFAULT_ADJUST_DAYS, workDays: rest, qaDays: s.qaDays };
    return {
      ...s,
      productionDays: wire,
      qaDays: 0,
      rounds: [{ label: 'Wireframe', kind: 'checkpoint' as const, reviewDays: 2, adjustDays: 1 }, formal, ...others]
    };
  });
}

/** Insumos bloqueantes pendientes con fecha: la fase no empieza antes de esa fecha. */
export function notBeforeFromDependencies(
  deps: { deliverableId?: string | null; blocking?: boolean; status?: string; expectedDate?: string; receivedAt?: string | null; shiftsSchedule?: boolean }[] = []
): Record<string, string> {
  const out: Record<string, string> = {};
  const put = (id: string, date: string) => { if (!out[id] || date > out[id]) out[id] = date; };
  deps.forEach((d) => {
    if (!d.blocking || !d.deliverableId) return;
    if (d.status === 'received') {
      // Recibido tarde y se decidió correr: la fase arranca el día hábil siguiente a la recepción
      if (d.shiftsSchedule && d.receivedAt) put(d.deliverableId, addBusinessDays(d.receivedAt.slice(0, 10), 1));
      return;
    }
    if (d.expectedDate) put(d.deliverableId, d.expectedDate);
  });
  return out;
}

export interface PhaseOverflow {
  phaseIndex: number;
  phaseName: string;
  productionEnd: string;
  extraDays: number;
  /** Pasos con la fase extendida y el cronograma resultante (para previsualizar y aplicar). */
  nextSteps: PhaseSteps[];
  before: { phases: TimelinePhase[]; endDate: string };
  after: { phases: TimelinePhase[]; endDate: string };
}

/**
 * Tarea → cronograma (19 Nov 2026): si la nueva fecha límite de una tarea de producción pasa el fin
 * de la producción de su fase, calcula cuántos días hábiles habría que extender la fase y cómo quedan
 * presentaciones y entrega. Null si cabe (o si es una tarea de ajustes del cliente).
 */
export function detectPhaseOverflow(params: {
  startDate: string;
  steps: PhaseSteps[];
  notBefore?: Record<string, string>;
  phaseId: string;
  newDueDate: string;
  taskTitle?: string;
}): PhaseOverflow | null {
  const { startDate, steps, phaseId, newDueDate } = params;
  if (!startDate || !newDueDate || steps.length === 0) return null;
  if (/ajustes? (de|del) cliente|aplicaci[oó]n de ajustes|ronda|retrabajo|post-?entrega/i.test(params.taskTitle || '')) return null;
  const idx = steps.findIndex((s) => s.id === phaseId);
  if (idx < 0) return null;
  const before = computePhaseSchedule(startDate, steps, params.notBefore);
  const ph = before.phases[idx];
  if (!ph) return null;
  // Último día de trabajo de la fase (con wireframe, el fin del trabajo del prototipo)
  const work = phaseWorkDays(ph);
  const lastWork = work[work.length - 1] || ph.productionEnd;
  if (newDueDate <= lastWork) return null;
  const extraDays = businessDaysInRange(lastWork, newDueDate).filter((d) => d > lastWork).length;
  if (extraDays <= 0) return null;
  // Se extiende el último tramo de trabajo (el previo a la última presentación con trabajo, o la producción)
  const lastWithWork = steps[idx].rounds.map((r, k) => ((r.workDays || 0) > 0 ? k : -1)).filter((k) => k >= 0).pop();
  const nextSteps = steps.map((s, i) => {
    if (i !== idx) return s;
    if (lastWithWork !== undefined) return { ...s, rounds: s.rounds.map((r, k) => (k === lastWithWork ? { ...r, workDays: (r.workDays || 0) + extraDays } : r)) };
    return { ...s, productionDays: s.productionDays + extraDays };
  });
  return {
    phaseIndex: idx,
    phaseName: ph.name,
    productionEnd: lastWork,
    extraDays,
    nextSteps,
    before,
    after: computePhaseSchedule(startDate, nextSteps, params.notBefore)
  };
}


// ── Presentaciones por área (19 Nov 2026) ───────────────────────────────────────
// Misma lógica (presentación → QA del cliente → ajustes), distintos nombres según lo que se revisa.
// Creativo: el catálogo ya trae «Calidad» (QA interno) y «Ajustes de cliente» (trabajo de ajustes) como
// fases, así que la presentación va en «Entrega de material» sin días extra de QA ni de ajustes.
type Preset = { re: RegExp; label: string | ((service: string) => string); kind: 'checkpoint' | 'approval'; review: number; adjust: number };

const PRESETS: Record<'producto' | 'creativo' | 'growth', Preset[]> = {
  producto: [
    { re: /^ux|ux y|wireframe/i, label: 'Prototipo', kind: 'approval', review: 5, adjust: 2 },
    { re: /template|^ui\b|& ui/i, label: 'Diseño de la tienda', kind: 'approval', review: 5, adjust: 2 },
    { re: /dise[nñ]o de flujo/i, label: 'Flujo conversacional', kind: 'approval', review: 3, adjust: 2 },
    { re: /qa funcional|^implementaci[oó]n$|configuraci[oó]n de manychat/i, label: 'Funcionalidad', kind: 'approval', review: 3, adjust: 2 },
    { re: /publicaci[oó]n y validaci/i, label: 'Publicaciones', kind: 'approval', review: 3, adjust: 2 },
    { re: /optimizaci[oó]n de contenido/i, label: 'Contenido de PDP', kind: 'approval', review: 3, adjust: 2 },
    { re: /optimizaci[oó]n de im/i, label: 'Imágenes de PDP', kind: 'approval', review: 3, adjust: 2 }
  ],
  creativo: [
    { re: /^naming/i, label: 'Naming', kind: 'approval', review: 3, adjust: 1 },
    { re: /conceptualizaci/i, label: 'Concepto creativo', kind: 'checkpoint', review: 2, adjust: 1 },
    { re: /presentaci[oó]n de marca/i, label: 'Marca', kind: 'approval', review: 5, adjust: 0 },
    { re: /entrega de material/i, label: (svc) => (/key visual|campa/i.test(svc) ? 'Propuestas de key visual' : /mailing|mail/i.test(svc) ? 'Mailing para aprobación' : /pauta/i.test(svc) ? 'Creativos para aprobación' : 'Piezas para aprobación'), kind: 'approval', review: 3, adjust: 0 }
  ],
  growth: [
    { re: /keyword/i, label: 'Keywords', kind: 'checkpoint', review: 2, adjust: 1 },
    { re: /estrategia (seo|geo)|^estrategia/i, label: 'Estrategia SEO / GEO', kind: 'approval', review: 5, adjust: 2 },
    { re: /l[ií]nea base y objetivos/i, label: 'Objetivos', kind: 'approval', review: 3, adjust: 1 },
    { re: /qa de medici/i, label: 'Validación de la medición', kind: 'approval', review: 3, adjust: 2 },
    { re: /^dashboard/i, label: 'Dashboard', kind: 'approval', review: 3, adjust: 2 },
    { re: /^planeaci[oó]n/i, label: 'Plan de medios', kind: 'approval', review: 3, adjust: 1 },
    { re: /construcci[oó]n de contenido/i, label: 'Anuncios', kind: 'approval', review: 3, adjust: 2 },
    { re: /calendario editorial/i, label: 'Calendario editorial', kind: 'approval', review: 3, adjust: 1 },
    { re: /contenido de lanzamiento/i, label: 'Artículos', kind: 'approval', review: 5, adjust: 2 },
    { re: /^dise[nñ]o$/i, label: 'Diseño de correos', kind: 'approval', review: 3, adjust: 2 },
    { re: /^backlog/i, label: 'Backlog de experimentos', kind: 'approval', review: 3, adjust: 1 },
    { re: /^an[aá]lisis/i, label: 'Resultados', kind: 'checkpoint', review: 2, adjust: 0 }
  ]
};

/** Presentaciones por fase (una lista por fase; vacía si esa fase no se presenta). */
export function presetPresentations(area: 'producto' | 'creativo' | 'growth', phaseNames: string[], serviceName: string): PhaseRoundSteps[][] {
  const rules = PRESETS[area];
  const hasBrandPresentation = phaseNames.some((n) => /presentaci[oó]n de marca/i.test(n));
  return phaseNames.map((name) => {
    if (hasBrandPresentation && /entrega de material/i.test(name)) return [];
    const rule = rules.find((r) => r.re.test(name));
    if (!rule) return [];
    const label = typeof rule.label === 'function' ? rule.label(serviceName) : rule.label;
    return [{ label, kind: rule.kind, reviewDays: rule.review, adjustDays: rule.adjust }];
  });
}


/**
 * Modelo acordado (19 Nov 2026): el QA interno y los ajustes internos son TAREAS con horas, así que ya
 * están dentro de las semanas de producción. Solo el QA del cliente (tiempo del cliente, sin tareas)
 * suma días al cronograma. Por eso los días de ajustes de cada presentación se descuentan de la
 * producción de su fase (las tareas de ajustes se agendan en esa ventana) y el QA interno va dentro de
 * la producción (qa = 0).
 */
const phaseWorkTotal = (st: PhaseSteps) =>
  st.productionDays + (st.qaDays || 0) + st.rounds.reduce((a, r) => a + (r.workDays || 0) + (r.qaDays || 0) + (r.adjustDays || 0), 0);

export function fitAdjustmentsInsideProduction(steps: PhaseSteps[], targetTotal?: number): PhaseSteps[] {
  const fitted = fitEachPhase(steps);
  if (!targetTotal) return fitted;
  // Si alguna fase no alcanzó a absorber sus ajustes, el excedente sale de las fases con más producción
  // (respetando mínimo 1 día): así se cumplen las semanas del alcance.
  let excess = fitted.reduce((a, st) => a + phaseWorkTotal(st), 0) - targetTotal;
  const out = fitted.map((st) => ({ ...st, rounds: st.rounds.map((r) => ({ ...r })) }));
  let guard = 0;
  while (excess > 0 && guard++ < 500) {
    let best = -1; let bestDays = 1;
    out.forEach((st, i) => { if (st.productionDays > bestDays) { best = i; bestDays = st.productionDays; } });
    if (best < 0) break;
    out[best].productionDays -= 1;
    excess -= 1;
  }
  return out;
}

function fitEachPhase(steps: PhaseSteps[]): PhaseSteps[] {
  return steps.map((st) => {
    let prod = st.productionDays + (st.qaDays || 0);
    // El QA interno previo a cada presentación pasa a ser parte del trabajo (es una tarea)
    const rounds = st.rounds.map((r, k) => ({ ...r, workDays: k > 0 ? (r.workDays || 0) + (r.qaDays || 0) : r.workDays, qaDays: 0 }));
    let toTake = rounds.reduce((a, r) => a + (r.adjustDays || 0), 0);
    // primero de la producción de la fase (mínimo 1 día), luego del trabajo previo de las siguientes
    const fromProd = Math.min(toTake, Math.max(0, prod - 1));
    prod -= fromProd; toTake -= fromProd;
    for (let k = rounds.length - 1; k >= 1 && toTake > 0; k--) {
      const w = rounds[k].workDays || 0;
      const take = Math.min(w, toTake);
      rounds[k] = { ...rounds[k], workDays: w - take };
      toTake -= take;
    }
    return { ...st, productionDays: prod, qaDays: 0, rounds };
  });
}


/**
 * Quitar una presentación sin perder días de trabajo: su ventana de ajustes y su trabajo previo vuelven
 * a la producción de la fase (antes se perdían y el total quedaba por debajo de las semanas del alcance).
 */
export function removeRound(st: PhaseSteps, k: number): PhaseSteps {
  const r = st.rounds[k];
  if (!r) return st;
  const rest = st.rounds.filter((_, m) => m !== k);
  let prod = st.productionDays + (r.adjustDays || 0) + (r.workDays || 0) + (r.qaDays || 0);
  if (k === 0 && rest.length > 0) {
    prod += (rest[0].workDays || 0) + (rest[0].qaDays || 0);
    rest[0] = { ...rest[0], workDays: 0, qaDays: 0 };
  }
  return { ...st, productionDays: prod, rounds: rest };
}

/** Agregar una presentación dentro de la producción de la fase (sus ajustes se descuentan de la producción). */
export function appendRound(st: PhaseSteps, round: PhaseRoundSteps): PhaseSteps {
  const take = Math.min(round.adjustDays || 0, Math.max(0, st.productionDays - 1));
  return { ...st, productionDays: st.productionDays - take, rounds: [...st.rounds, { ...round, workDays: 0, qaDays: 0 }] };
}


/** Días de producción de un proyecto (trabajo + QA interno + ajustes; sin QA del cliente). */
export const productionTotal = (steps: PhaseSteps[]) => steps.reduce((a, st) => a + phaseWorkTotal(st), 0);

/** Mínimo posible: 1 día por fase + los ajustes de cada presentación. */
export const productionMinimum = (steps: PhaseSteps[]) =>
  steps.reduce((a, st) => a + 1 + st.rounds.reduce((x, r) => x + (r.adjustDays || 0), 0), 0);

/**
 * Las semanas del alcance mandan (19 Nov 2026): la producción total es SIEMPRE semanas × 5 cuando cabe.
 * Si sobra, se quita a la fase con más producción; si falta (p. ej. al quitar una presentación), se le
 * suma a la fase con más horas de trabajo. Si ni con el mínimo cabe, se deja en el mínimo y se avisa.
 */
export function rebalanceToTarget(steps: PhaseSteps[], target: number): PhaseSteps[] {
  const out = steps.map((st) => ({ ...st, rounds: st.rounds.map((r) => ({ ...r })) }));
  let diff = productionTotal(out) - target;
  let guard = 0;
  while (diff !== 0 && guard++ < 1000) {
    let best = -1; let bestDays = diff > 0 ? 1 : -1;
    out.forEach((st, i) => {
      if (diff > 0 ? st.productionDays > bestDays : st.productionDays > bestDays) { best = i; bestDays = st.productionDays; }
    });
    if (best < 0) break;
    out[best].productionDays += diff > 0 ? -1 : 1;
    diff += diff > 0 ? -1 : 1;
  }
  return out;
}
