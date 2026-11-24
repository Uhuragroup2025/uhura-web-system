/**
 * ============================================================================
 * DECISIONES ESCRITAS (BACKEND_REQUIREMENTS §32.7) — PROTOTIPO
 * ============================================================================
 * Antes de pedir una reunión, quien tiene la duda escribe una decisión en la
 * tarea (o en el proyecto): problema, opciones, recomendación y preguntas.
 * Los revisores responden dentro de una ventana de 24 o 48 horas hábiles:
 * «De acuerdo», «Tengo una objeción» o «Sin comentarios».
 *
 * Cierre (decidido el 21 Nov 2026):
 * - Si nadie objeta (o las objeciones quedan atendidas), queda **aprobada**.
 *   El silencio cuenta como acuerdo.
 * - Si queda alguna objeción abierta: **«Hay objeciones: hablen 15 min»**,
 *   solo con quien objetó.
 * - Se cierra antes si todos respondieron sin objeciones abiertas.
 *
 * Solo del prototipo: vive en localStorage y avisa con un evento del navegador.
 * En producción: tablas `decisions`, `decision_reviewers`, `decision_comments`.
 */

export type DecisionStatus = 'en_revision' | 'aprobada' | 'objeciones' | 'descartada';
export type DecisionResponse = 'agree' | 'objection' | 'no_comment';
export type DecisionAnchor = 'problema' | 'recomendacion' | 'preguntas' | `opcion-${number}`;

export interface DecisionPerson { id: string; name: string }
export interface DecisionComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  isObjection: boolean;
  anchor?: DecisionAnchor;
  resolvedAt?: string;
  resolvedNote?: string;
  at: string;
}
export interface MeetVideo {
  id: string;
  url: string;
  title: string;
  byName: string;
  at: string;
  comments: { id: string; at: string; minute: string; text: string; byName: string }[];
}
export interface Decision {
  id: string;
  taskId?: string;
  taskTitle?: string;
  projectKey: string;
  projectName: string;
  title: string;
  problem: string;
  options: string[];
  recommendation: string;
  questions: string[];
  author: DecisionPerson;
  reviewers: DecisionPerson[];
  windowHours: 24 | 48;
  blocksTask: boolean;
  status: DecisionStatus;
  publishedAt: string;
  closesAt: string;
  closedAt?: string;
  responses: Record<string, { response: DecisionResponse; at: string }>;
  comments: DecisionComment[];
  videos: MeetVideo[];
}

const KEY = 'eco_decisions_v1';
export const DECISIONS_EVENT = 'eco:decisions-changed';

// ── Horas hábiles (lunes a viernes) ──────────────────────────────────────
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
export const addBusinessHours = (from: Date, hours: number): Date => {
  const d = new Date(from);
  let left = hours;
  // Si se publica en fin de semana, el reloj arranca el lunes a la misma hora
  while (isWeekend(d)) d.setDate(d.getDate() + 1);
  while (left > 0) {
    d.setHours(d.getHours() + 1);
    if (!isWeekend(d)) left--;
  }
  return d;
};
/** Horas hábiles que faltan para el cierre (para «Cierra en 18 h»). */
export const businessHoursLeft = (closesAt: string, now = new Date()): number => {
  const end = new Date(closesAt);
  if (now >= end) return 0;
  let h = 0;
  const d = new Date(now);
  while (d < end && h < 500) { d.setHours(d.getHours() + 1); if (!isWeekend(d)) h++; }
  return h;
};

// ── Lectura y escritura ──────────────────────────────────────────────────
const read = (): Decision[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Decision[]) : [];
  } catch {
    return [];
  }
};
const write = (list: Decision[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* solo prototipo */ }
  try { window.dispatchEvent(new CustomEvent(DECISIONS_EVENT)); } catch { /* sin navegador */ }
};

export const openObjections = (d: Decision) => d.comments.filter((c) => c.isObjection && !c.resolvedAt);

/** Aplica la regla de cierre a una decisión. */
export const evaluate = (d: Decision, now = new Date()): Decision => {
  if (d.status !== 'en_revision') return d;
  const allAnswered = d.reviewers.length > 0 && d.reviewers.every((r) => d.responses[r.id]);
  const expired = now >= new Date(d.closesAt);
  if (!expired && !(allAnswered && openObjections(d).length === 0)) return d;
  return { ...d, status: openObjections(d).length ? 'objeciones' : 'aprobada', closedAt: now.toISOString() };
};

/** Todas las decisiones, ya evaluadas (las vencidas se cierran solas). */
export const loadDecisions = (): Decision[] => {
  const list = read();
  const now = new Date();
  let changed = false;
  const next = list.map((d) => {
    const e = evaluate(d, now);
    if (e !== d) changed = true;
    return e;
  });
  if (changed) write(next);
  return next;
};

const update = (id: string, fn: (d: Decision) => Decision): Decision | null => {
  const list = read();
  let out: Decision | null = null;
  const next = list.map((d) => {
    if (d.id !== id) return d;
    out = evaluate(fn(d));
    return out;
  });
  write(next);
  return out;
};

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const createDecision = (input: Omit<Decision, 'id' | 'status' | 'publishedAt' | 'closesAt' | 'responses' | 'comments' | 'videos'>): Decision => {
  const now = new Date();
  const d: Decision = {
    ...input,
    id: uid('dec'),
    status: 'en_revision',
    publishedAt: now.toISOString(),
    closesAt: addBusinessHours(now, input.windowHours).toISOString(),
    responses: {},
    comments: [],
    videos: []
  };
  write([d, ...read()]);
  return d;
};

export const respond = (id: string, user: DecisionPerson, response: DecisionResponse, objection?: { text: string; anchor?: DecisionAnchor }) =>
  update(id, (d) => ({
    ...d,
    responses: { ...d.responses, [user.id]: { response, at: new Date().toISOString() } },
    comments: response === 'objection' && objection
      ? [...d.comments, { id: uid('obj'), authorId: user.id, authorName: user.name, text: objection.text, isObjection: true, anchor: objection.anchor, at: new Date().toISOString() }]
      : d.comments
  }));

export const addComment = (id: string, user: DecisionPerson, text: string, anchor?: DecisionAnchor) =>
  update(id, (d) => ({ ...d, comments: [...d.comments, { id: uid('com'), authorId: user.id, authorName: user.name, text, isObjection: false, anchor, at: new Date().toISOString() }] }));

/** Quien creó la decisión marca una objeción como atendida, citando el cambio. */
export const resolveObjection = (id: string, commentId: string, note: string) =>
  update(id, (d) => ({ ...d, comments: d.comments.map((c) => (c.id === commentId ? { ...c, resolvedAt: new Date().toISOString(), resolvedNote: note } : c)) }));

export const discardDecision = (id: string) => update(id, (d) => ({ ...d, status: 'descartada', closedAt: new Date().toISOString() }));

export const addVideo = (id: string, url: string, title: string, byName: string) =>
  update(id, (d) => ({ ...d, videos: [...d.videos, { id: uid('vid'), url, title, byName, at: new Date().toISOString(), comments: [] }] }));

export const addVideoComment = (id: string, videoId: string, minute: string, text: string, byName: string) =>
  update(id, (d) => ({ ...d, videos: d.videos.map((v) => (v.id === videoId ? { ...v, comments: [...v.comments, { id: uid('vc'), at: new Date().toISOString(), minute, text, byName }] } : v)) }));

// ── Consultas ────────────────────────────────────────────────────────────
export const decisionsForTask = (taskId: string) => loadDecisions().filter((d) => d.taskId === taskId);
/** Decisiones en revisión donde la persona es revisora y no ha respondido. */
export const waitingFor = (userId: string) => loadDecisions().filter((d) => d.status === 'en_revision' && d.reviewers.some((r) => r.id === userId) && !d.responses[userId]);
export const openDecisions = () => loadDecisions().filter((d) => d.status === 'en_revision');

// ── Video de Meet (Google Drive) ─────────────────────────────────────────
/** Acepta enlaces de grabaciones de Meet en Drive y devuelve la vista previa para insertar. */
export const drivePreview = (url: string): string | null => {
  const m = url.trim().match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([A-Za-z0-9_-]{10,})/);
  return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
};
export const isMinute = (v: string) => /^\d{1,2}:[0-5]\d$/.test(v.trim());

// ── Datos de prueba (solo prototipo) ─────────────────────────────────────
const SEED_FLAG = 'eco_decisions_seed_v1';
/** Siembra una decisión de ejemplo en BattSaver, para ver el flujo completo. */
export const seedDecisionsIfEmpty = () => {
  try {
    if (localStorage.getItem(SEED_FLAG)) return;
    localStorage.setItem(SEED_FLAG, '1');
  } catch { return; }
  if (read().length) return;
  const published = new Date();
  published.setHours(published.getHours() - 30);
  const d: Decision = {
    id: 'dec-seed-1',
    taskId: 't-bs-4',
    taskTitle: 'UI kit y vistas en Figma',
    projectKey: 'Tienda Online BattSaver',
    projectName: 'Tienda Online BattSaver',
    title: '¿Menú por categorías o buscador destacado en el inicio de la tienda?',
    problem: 'BattSaver vende más de 300 referencias de baterías. En el inicio solo cabe una forma principal de encontrar productos, y el cliente no lo definió en el brief.',
    options: [
      'Menú por categorías (motos, carros, solares) con buscador pequeño arriba.',
      'Buscador grande por placa o referencia, con categorías debajo.'
    ],
    recommendation: 'Opción 2: el 70 % de las búsquedas del sitio actual son por referencia. El menú de categorías queda debajo para quien explora.',
    questions: ['¿Shopify permite buscar por placa con el tema elegido sin una app paga?', '¿Lo presentamos así en el prototipo del 24 de noviembre?'],
    author: { id: 'u-7', name: 'Laura Isabel Gómez' },
    reviewers: [{ id: 'u-2', name: 'Paola Monsalve' }, { id: 'u-10', name: 'Oscar Cerpa' }],
    windowHours: 48,
    blocksTask: false,
    status: 'en_revision',
    publishedAt: published.toISOString(),
    closesAt: addBusinessHours(published, 48).toISOString(),
    responses: { 'u-10': { response: 'agree', at: new Date(published.getTime() + 3 * 3600e3).toISOString() } },
    comments: [{ id: 'com-seed-1', authorId: 'u-10', authorName: 'Oscar Cerpa', text: 'Sí se puede con el buscador del tema; la búsqueda por placa la resolvemos con una colección por modelo.', isObjection: false, anchor: 'preguntas', at: new Date(published.getTime() + 3 * 3600e3).toISOString() }],
    videos: []
  };
  write([d, ...read()]);
};
