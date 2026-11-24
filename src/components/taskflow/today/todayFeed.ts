/**
 * ============================================================================
 * «HOY EN UHURA» (BACKEND_REQUIREMENTS §32.22) — columna derecha de Mi Día
 * ============================================================================
 * Solo cosas de HOY, cada una con una acción. Máximo 6 a la vista, en este orden:
 *   1. Lo que te toca hoy (retos que cierran hoy sin tu aporte, aportes nuevos a tu reto,
 *      días libres ganados sin tomar, revisores ausentes en tus tareas).
 *   2. Lo nuevo del equipo hoy (retos lanzados, «Aprendí esto», tareas terminadas, retos ganados).
 *   3. Contexto que cambia tu día (quién no está hoy, cumpleaños y aniversarios de hoy,
 *      festivo que viene: se avisa desde 7 días antes).
 * Reglas (✅ 22 Nov 2026): cada aviso desaparece al actuar o al terminar el día; el punto en
 * «Mi Día» del menú marca novedades desde tu última visita; nada de esto da ECOINS por verlo.
 *
 * Solo del prototipo: lo hecho y lo visto se guarda por persona y por día en localStorage.
 * En producción: `GET /api/me/today` y `POST /api/me/today/{key}/done`.
 */
import { loadIdeas } from '../colonia/plaza/ideasStore';
import { loadContributions, KIND_LABEL } from '../colonia/plaza/contributionsStore';

export const TODAY_EVENT = 'eco:today-changed';
export const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const localDay = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

const doneKey = (uid: string) => `eco_today_done_${uid}_${todayIso()}`;
const seenKey = (uid: string) => `eco_today_seen_${uid}`;
const readList = (k: string): string[] => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
const writeList = (k: string, v: string[]) => {
  try { localStorage.setItem(k, JSON.stringify(v.slice(-300))); } catch { /* */ }
  try { window.dispatchEvent(new CustomEvent(TODAY_EVENT)); } catch { /* */ }
};

/** Lo que la persona ya hizo hoy (se reinicia cada día: «desaparece al terminar el día»). */
export const doneToday = (uid: string) => new Set(readList(doneKey(uid)));
export const markDone = (uid: string, key: string) => { const s = readList(doneKey(uid)); if (!s.includes(key)) writeList(doneKey(uid), [...s, key]); };

/**
 * Novedades del equipo que se pueden calcular sin las tareas (retos, cápsulas, podios,
 * días libres): alimentan el punto de «Mi Día» en el menú.
 */
export const noveltyKeys = (uid: string): string[] => {
  const today = todayIso();
  const ideas = loadIdeas();
  const keys: string[] = [];
  ideas.challenges.forEach((c) => {
    if (c.status === 'abierto' && localDay(c.createdAt) === today && c.creator.id !== uid && !c.joined.some((p) => p.id === uid)) keys.push(`reto-nuevo:${c.id}`);
    if (c.status === 'cerrado' && localDay(c.closedAt) === today) keys.push(`reto-ganado:${c.id}`);
  });
  ideas.capsules.forEach((cap) => { if (localDay(cap.at) === today && cap.author.id !== uid && !cap.helped.includes(uid) && !(cap.cheers || []).includes(uid)) keys.push(`capsula:${cap.id}`); });
  loadContributions().rewards.forEach((r) => r.recipients.forEach((p) => { if (p.id === uid && p.status === 'pendiente') keys.push(`dia-libre:${r.id}`); }));
  const done = doneToday(uid);
  return keys.filter((k) => !done.has(k));
};
export const unseenCount = (uid: string) => {
  const seen = new Set(readList(seenKey(uid)));
  return noveltyKeys(uid).filter((k) => !seen.has(k)).length;
};
/** Al abrir Mi Día, lo que hay queda visto (el punto del menú se apaga). */
export const markAllSeen = (uid: string) => {
  const keys = noveltyKeys(uid);
  const seen = readList(seenKey(uid));
  const next = [...new Set([...seen, ...keys])];
  if (next.length !== seen.length) writeList(seenKey(uid), next);
};

export const rewardLabel = (kind: keyof typeof KIND_LABEL) => KIND_LABEL[kind].toLowerCase();
