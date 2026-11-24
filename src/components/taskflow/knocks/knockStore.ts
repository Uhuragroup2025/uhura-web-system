/**
 * ============================================================================
 * TOC TOC: LA PREGUNTA QUE NO INTERRUMPE (BACKEND_REQUIREMENTS §32.18) — PROTOTIPO
 * ============================================================================
 * Una pregunta corta para alguien del equipo que se entrega cuando esa persona
 * termina su bloque de trabajo (detiene el cronómetro o sale de una reunión).
 * Si no está trabajando, le llega enseguida. Responde con un toque o con texto.
 * Si es urgente, se usa Google Chat: el toc toc es para lo que puede esperar.
 *
 * Reglas:
 * - Texto obligatorio, de 5 a 280 caracteres. Tarea relacionada, opcional.
 * - Máximo 5 toc tocs abiertos enviados por persona (sin respuesta y sin vencer).
 * - Vence a los 2 días hábiles sin respuesta: a quien lo envió le aparece
 *   «Sin respuesta · escríbele por Google Chat».
 * - No da ECOINS (no se premia la cantidad de mensajes).
 *
 * Solo del prototipo: localStorage y un evento del navegador. En producción:
 * tabla `knocks` y entrega al detener el cronómetro (§14) o al terminar el evento
 * «ocupado» del calendario (§32.3).
 */

export type KnockReplyKind = 'voy' | 'te_escribo' | 'en_30' | 'texto';
export const REPLY_LABEL: Record<KnockReplyKind, string> = {
  voy: 'Voy 👍',
  te_escribo: 'Te escribo por Chat',
  en_30: 'En 30 min',
  texto: 'Respondió'
};

export interface KnockPerson { id: string; name: string }
export interface Knock {
  id: string;
  from: KnockPerson;
  to: KnockPerson;
  text: string;
  taskId?: string;
  taskTitle?: string;
  projectName?: string;
  createdAt: string;
  /** Cuándo le llegó a quien recibe (al terminar su bloque, o enseguida si no estaba trabajando). */
  deliveredAt?: string;
  reply?: { kind: KnockReplyKind; text?: string; at: string };
  /** Quien envió ya vio la respuesta (o el vencimiento) y la archivó. */
  closedBySenderAt?: string;
  expiresAt: string;
}

const KEY = 'eco_knocks_v1';
export const KNOCKS_EVENT = 'eco:knocks-changed';
export const MAX_OPEN_SENT = 5;

const read = (): Knock[] => {
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as Knock[]) : []; } catch { return []; }
};
const write = (list: Knock[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* solo prototipo */ }
  try { window.dispatchEvent(new CustomEvent(KNOCKS_EVENT)); } catch { /* sin navegador */ }
};
const uid = () => `knock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const addBusinessDays = (from: Date, days: number) => {
  const d = new Date(from);
  let left = days;
  while (left > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) left--; }
  return d;
};
export const isExpired = (k: Knock, now = new Date()) => !k.reply && now >= new Date(k.expiresAt);
const isOpen = (k: Knock) => !k.reply && !isExpired(k);

export const openSentCount = (userId: string) => read().filter((k) => k.from.id === userId && isOpen(k)).length;

export const sendKnock = (
  from: KnockPerson,
  to: KnockPerson,
  text: string,
  task?: { id: string; title: string; projectName?: string }
): { ok: true; knock: Knock } | { ok: false; error: string } => {
  const t = text.trim();
  if (from.id === to.id) return { ok: false, error: 'No puedes dejarte un toc toc a ti misma.' };
  if (t.length < 5) return { ok: false, error: 'Escribe la pregunta (mínimo 5 caracteres).' };
  if (t.length > 280) return { ok: false, error: 'Máximo 280 caracteres: si es largo, mejor una decisión escrita.' };
  if (openSentCount(from.id) >= MAX_OPEN_SENT) return { ok: false, error: `Ya tienes ${MAX_OPEN_SENT} toc tocs sin respuesta. Espera a que te respondan.` };
  const now = new Date();
  const knock: Knock = {
    id: uid(),
    from,
    to,
    text: t,
    taskId: task?.id,
    taskTitle: task?.title,
    projectName: task?.projectName,
    createdAt: now.toISOString(),
    expiresAt: addBusinessDays(now, 2).toISOString()
  };
  write([knock, ...read()]);
  return { ok: true, knock };
};

/**
 * Entrega los toc tocs pendientes de una persona. Se llama cuando NO está en un bloque
 * de trabajo (sin cronómetro corriendo). En producción: al detener el cronómetro o al
 * terminar la reunión, o enseguida si la persona está disponible.
 */
export const deliverPendingFor = (userId: string) => {
  const list = read();
  let changed = false;
  const now = new Date().toISOString();
  const next = list.map((k) => {
    if (k.to.id === userId && !k.deliveredAt && isOpen(k)) { changed = true; return { ...k, deliveredAt: now }; }
    return k;
  });
  if (changed) write(next);
};

export const replyKnock = (id: string, kind: KnockReplyKind, text?: string) =>
  write(read().map((k) => (k.id === id ? { ...k, reply: { kind, text: text?.trim() || undefined, at: new Date().toISOString() } } : k)));

export const closeForSender = (id: string) =>
  write(read().map((k) => (k.id === id ? { ...k, closedBySenderAt: new Date().toISOString() } : k)));

/** Lo que le llegó a la persona y aún no responde. */
export const inboxFor = (userId: string) => read().filter((k) => k.to.id === userId && k.deliveredAt && isOpen(k));
/** Toc tocs en espera de que la persona termine su bloque (no se muestran: solo se cuentan). */
export const heldFor = (userId: string) => read().filter((k) => k.to.id === userId && !k.deliveredAt && isOpen(k));
/** Respuestas (o vencimientos) de lo que la persona envió, que aún no archiva. */
export const outcomesFor = (userId: string) => read().filter((k) => k.from.id === userId && !k.closedBySenderAt && (k.reply || isExpired(k)));
/** Lo que la persona envió y sigue esperando. */
export const waitingSentBy = (userId: string) => read().filter((k) => k.from.id === userId && isOpen(k));

/** Todos los toc tocs (para el Pasaporte del mes, §32.21). */
export const allKnocks = () => read();
