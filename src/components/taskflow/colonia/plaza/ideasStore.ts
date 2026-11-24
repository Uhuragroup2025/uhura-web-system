/**
 * ============================================================================
 * CAFÉ DE IDEAS: RETOS Y «APRENDÍ ESTO» (BACKEND_REQUIREMENTS §32.19 y §32.20) — PROTOTIPO
 * ============================================================================
 * Todo es asíncrono: se lanza, se suma, se aporta y se vota a cualquier hora.
 *
 * RETOS
 * - Cualquiera lanza un reto: de trabajo («¿Quién propone 3 nombres para…?») o de
 *   aprendizaje («Comparte un atajo de Figma»). Define qué cuenta como hecho y la fecha de cierre.
 * - Los demás se suman y dejan un aporte (texto y, si quieren, un enlace). Todos pueden votar
 *   los aportes, menos el propio.
 * - Al cerrar: en los de trabajo, quien lanzó elige el podio (1º, 2º y 3º); en los de aprendizaje,
 *   el podio sale de los votos. Competencia solo dentro del reto: no hay ranking general (§32.16 #3).
 * - ECOINS (✅ 22 Nov 2026: ganan quien lanza y quien gana): 1º 30 · 2º 15 · 3º 10 · cada aporte que
 *   no queda en el podio 5 · quien lanzó 10 si aportaron 2 o más personas. Máximo 4 retos con premio
 *   lanzados por persona al mes. Quien lanza no puede ganar su propio reto.
 * - Si pasan 2 días hábiles de la fecha de cierre y nadie lo cierra, se cierra solo por votos.
 *
 * «APRENDÍ ESTO»
 * - Una cápsula corta: título, qué aprendiste y, si quieres, un video de Meet de 2 a 5 min (Drive).
 * - Los demás marcan «Me sirvió»: +3 ECOINS a quien la escribió por persona, máximo 30 por cápsula.
 *   Solo 2 cápsulas por semana dan ECOINS (se pueden publicar más).
 * - Una cápsula que le sirvió a 3 o más personas cuenta para el título «Mentor» (§32.4).
 *
 * Solo del prototipo: localStorage y eventos del navegador. En producción: tablas `challenges`,
 * `challenge_entries`, `challenge_votes`, `capsules`, `capsule_helps`.
 */
import { creditUser, registerReward } from './contributionsStore';
import { drivePreview } from '../../decisions/decisionStore';

export interface Person { id: string; name: string }
export type ChallengeKind = 'trabajo' | 'aprendizaje';
export interface ChallengeEntry { id: string; user: Person; text: string; url?: string; at: string; votes: string[] }
export interface Challenge {
  id: string;
  kind: ChallengeKind;
  title: string;
  doneWhen: string;
  projectName?: string;
  creator: Person;
  createdAt: string;
  closesOn: string; // YYYY-MM-DD
  joined: Person[];
  entries: ChallengeEntry[];
  status: 'abierto' | 'cerrado' | 'cancelado';
  podium?: string[]; // ids de aportes, en orden
  closedAt?: string;
  prized: boolean; // false si se lanzó pasado el tope del mes
}
/**
 * «Aprendí esto» tiene tres tipos (✅ 22 Nov 2026):
 * - tip: un truco, un video corto o un recurso → ECOINS por cada «Me sirvió» (pocos).
 * - curso: curso terminado con certificado → ECOINS por duración al publicarlo.
 * - especializacion: especialización o diplomado → Dirección lo valida; da ECOINS y desbloquea
 *   un premio tangible (almuerzo en familia).
 */
export type CapsuleKind = 'tip' | 'curso' | 'especializacion';
export interface Capsule {
  id: string; author: Person; title: string; body: string; videoUrl?: string; at: string; helped: string[];
  kind?: CapsuleKind; // sin valor = 'tip' (datos anteriores)
  platform?: string;
  hours?: number;
  certificateUrl?: string;
  /** Especialización: quién de Dirección la validó y cuándo. */
  validatedBy?: string;
  validatedAt?: string;
  /** Felicitaciones a un curso o especialización (no dan ECOINS). */
  cheers?: string[];
}
export const CAPSULE_KIND_LABEL: Record<CapsuleKind, string> = { tip: 'Tip o recurso', curso: 'Curso terminado', especializacion: 'Especialización o diplomado' };
export const capsuleKind = (c: Capsule): CapsuleKind => c.kind || 'tip';
/** ECOINS de un curso según su duración. */
export const courseCoins = (hours = 0) => (hours > 20 ? 50 : hours > 4 ? 25 : 10);
export const PAID_COURSES_PER_MONTH = 2;
export const SPECIALIZATION_COINS = 100;

export const PRIZES = [30, 15, 10];
export const PARTICIPATION = 5;
export const LAUNCHER_BONUS = 10;
export const MAX_PRIZED_PER_MONTH = 4;
export const HELP_COINS = 3;
export const MAX_HELPS_PAID = 10;
export const PAID_CAPSULES_PER_WEEK = 2;

const KEY = 'eco_ideas_v1';
export const IDEAS_EVENT = 'eco:ideas-changed';
interface State { challenges: Challenge[]; capsules: Capsule[] }
const read = (): State => {
  try { const raw = localStorage.getItem(KEY); return raw ? { challenges: [], capsules: [], ...JSON.parse(raw) } : { challenges: [], capsules: [] }; } catch { return { challenges: [], capsules: [] }; }
};
const write = (s: State) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* solo prototipo */ }
  try { window.dispatchEvent(new CustomEvent(IDEAS_EVENT)); } catch { /* */ }
};
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const first = (n: string) => n.split(' ')[0];
const addBusinessDaysIso = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  let left = days;
  while (left > 0) { dt.setDate(dt.getDate() + 1); if (dt.getDay() !== 0 && dt.getDay() !== 6) left--; }
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};
export const defaultClosesOn = () => addBusinessDaysIso(todayIso(), 5);

// ── Retos ────────────────────────────────────────────────────────────────
export const prizedThisMonth = (userId: string) => {
  const month = todayIso().slice(0, 7);
  return read().challenges.filter((c) => c.creator.id === userId && c.prized && c.createdAt.slice(0, 7) === month && c.status !== 'cancelado').length;
};

export const launchChallenge = (
  me: Person,
  input: { kind: ChallengeKind; title: string; doneWhen: string; closesOn: string; projectName?: string }
): { ok: true; challenge: Challenge } | { ok: false; error: string } => {
  const title = input.title.trim();
  const doneWhen = input.doneWhen.trim();
  if (title.length < 10) return { ok: false, error: 'Escribe el reto (mínimo 10 caracteres).' };
  if (doneWhen.length < 10) return { ok: false, error: 'Explica qué cuenta como hecho (mínimo 10 caracteres).' };
  const today = todayIso();
  if (!input.closesOn || input.closesOn < today) return { ok: false, error: 'La fecha de cierre debe ser hoy o después.' };
  const max = addBusinessDaysIso(today, 22);
  if (input.closesOn > max) return { ok: false, error: 'Un reto dura máximo un mes.' };
  const prized = prizedThisMonth(me.id) < MAX_PRIZED_PER_MONTH;
  const c: Challenge = {
    id: uid('reto'), kind: input.kind, title, doneWhen, projectName: input.projectName || undefined, creator: me,
    createdAt: new Date().toISOString(), closesOn: input.closesOn, joined: [], entries: [], status: 'abierto', prized
  };
  const s = read();
  write({ ...s, challenges: [c, ...s.challenges] });
  return { ok: true, challenge: c };
};

const updateChallenge = (id: string, fn: (c: Challenge) => Challenge) => {
  const s = read();
  write({ ...s, challenges: s.challenges.map((c) => (c.id === id ? fn(c) : c)) });
};

export const joinChallenge = (id: string, me: Person) =>
  updateChallenge(id, (c) => (c.creator.id === me.id || c.joined.some((p) => p.id === me.id) || c.status !== 'abierto' ? c : { ...c, joined: [...c.joined, me] }));

export const submitEntry = (id: string, me: Person, text: string, url?: string): string | null => {
  const s = read();
  const c = s.challenges.find((x) => x.id === id);
  if (!c || c.status !== 'abierto') return 'El reto ya cerró.';
  if (c.creator.id === me.id) return 'No puedes aportar a tu propio reto.';
  if (text.trim().length < 5) return 'Cuenta tu aporte (mínimo 5 caracteres).';
  if (c.entries.some((e) => e.user.id === me.id)) return 'Ya enviaste tu aporte a este reto.';
  const entry: ChallengeEntry = { id: uid('aporte'), user: me, text: text.trim(), url: url?.trim() || undefined, at: new Date().toISOString(), votes: [] };
  updateChallenge(id, (x) => ({ ...x, joined: x.joined.some((p) => p.id === me.id) ? x.joined : [...x.joined, me], entries: [...x.entries, entry] }));
  return null;
};

export const toggleVote = (id: string, entryId: string, me: Person) =>
  updateChallenge(id, (c) => (c.status !== 'abierto' ? c : {
    ...c,
    entries: c.entries.map((e) => (e.id !== entryId || e.user.id === me.id ? e : { ...e, votes: e.votes.includes(me.id) ? e.votes.filter((v) => v !== me.id) : [...e.votes, me.id] }))
  }));

const byVotes = (c: Challenge) => [...c.entries].sort((a, b) => b.votes.length - a.votes.length || a.at.localeCompare(b.at)).slice(0, 3).map((e) => e.id);

/** Cierra el reto, entrega ECOINS y anuncia al ganador en La Plaza. */
export const closeChallenge = (id: string, podiumIds?: string[]) => {
  const s = read();
  const c = s.challenges.find((x) => x.id === id);
  if (!c || c.status !== 'abierto') return;
  const podium = (c.kind === 'trabajo' && podiumIds && podiumIds.length ? podiumIds : byVotes(c)).filter((pid, i, arr) => c.entries.some((e) => e.id === pid) && arr.indexOf(pid) === i).slice(0, 3);
  const closed: Challenge = { ...c, status: 'cerrado', podium, closedAt: new Date().toISOString() };
  write({ ...s, challenges: s.challenges.map((x) => (x.id === id ? closed : x)) });
  if (c.prized) {
    podium.forEach((pid, i) => {
      const e = c.entries.find((x) => x.id === pid)!;
      creditUser(e.user.id, { key: `challenge_prize:${c.id}:${e.user.id}`, amount: PRIZES[i], kind: 'challenge_prize', label: `${i + 1}º lugar · reto «${c.title}»` });
    });
    c.entries.filter((e) => !podium.includes(e.id)).forEach((e) => {
      creditUser(e.user.id, { key: `challenge_entry:${c.id}:${e.user.id}`, amount: PARTICIPATION, kind: 'challenge_entry', label: `Aportaste al reto «${c.title}»` });
    });
    if (new Set(c.entries.map((e) => e.user.id)).size >= 2) {
      creditUser(c.creator.id, { key: `challenge_launch:${c.id}`, amount: LAUNCHER_BONUS, kind: 'challenge_launch', label: `Tu reto «${c.title}» movió al equipo` });
    }
  }
  const winner = podium[0] ? c.entries.find((e) => e.id === podium[0]) : null;
  try {
    window.dispatchEvent(new CustomEvent('eco:celebrate', {
      detail: winner
        ? { who: first(winner.user.name), verb: 'ganó el reto', task: `«${c.title}»`, project: `Lanzado por ${first(c.creator.name)} · ${c.entries.length} ${c.entries.length === 1 ? 'aporte' : 'aportes'}` }
        : { who: first(c.creator.name), verb: 'cerró el reto', task: `«${c.title}»`, project: 'Sin aportes esta vez' }
    }));
  } catch { /* */ }
};

export const cancelChallenge = (id: string) => updateChallenge(id, (c) => (c.entries.length ? c : { ...c, status: 'cancelado', closedAt: new Date().toISOString() }));

/** Retos vencidos hace más de 2 días hábiles sin cerrar: se cierran solos por votos. */
const autoClose = () => {
  const today = todayIso();
  read().challenges.filter((c) => c.status === 'abierto' && addBusinessDaysIso(c.closesOn, 2) < today).forEach((c) => closeChallenge(c.id));
};

export const loadIdeas = (): State => { autoClose(); return read(); };

// ── «Aprendí esto» ───────────────────────────────────────────────────────
const isUrl = (v?: string) => !!v && /^https?:\/\/\S+\.\S+/.test(v.trim());
export const publishCapsule = (
  me: Person,
  title: string,
  body: string,
  videoUrl?: string,
  extra: { kind?: CapsuleKind; platform?: string; hours?: number; certificateUrl?: string } = {}
): string | null => {
  const kind = extra.kind || 'tip';
  if (title.trim().length < 5) return kind === 'tip' ? 'Ponle un título (mínimo 5 caracteres).' : 'Escribe el nombre del curso o programa.';
  if (kind === 'tip' && body.trim().length < 30) return 'Cuenta qué aprendiste (mínimo 30 caracteres).';
  if (kind !== 'tip') {
    if (!extra.platform?.trim()) return kind === 'curso' ? '¿Dónde lo hiciste? (Platzi, Coursera, Domestika…)' : '¿Qué institución lo dio?';
    if (!extra.hours || extra.hours <= 0) return 'Escribe cuántas horas duró.';
    if (!isUrl(extra.certificateUrl)) return 'Pega el enlace del certificado o diploma: es obligatorio.';
    if (body.trim().length < 15) return 'Cuenta en una o dos líneas qué te llevas (mínimo 15 caracteres).';
  }
  if (videoUrl && videoUrl.trim() && !drivePreview(videoUrl)) return 'El video debe ser el enlace de Drive de la grabación de Meet (drive.google.com/file/d/…).';
  const s = read();
  const cap: Capsule = {
    id: uid('cap'), author: me, title: title.trim(), body: body.trim(), videoUrl: videoUrl?.trim() || undefined, at: new Date().toISOString(), helped: [],
    kind, platform: extra.platform?.trim() || undefined, hours: extra.hours, certificateUrl: extra.certificateUrl?.trim() || undefined, cheers: []
  };
  write({ ...s, capsules: [cap, ...s.capsules] });
  // Curso: ECOINS por duración al publicar (máx. 2 cursos con ECOINS al mes)
  if (kind === 'curso') {
    const month = cap.at.slice(0, 7);
    const paidThisMonth = s.capsules.filter((c) => c.author.id === me.id && capsuleKind(c) === 'curso' && c.at.slice(0, 7) === month).length;
    if (paidThisMonth < PAID_COURSES_PER_MONTH) {
      creditUser(me.id, { key: `capsule_course:${cap.id}`, amount: courseCoins(cap.hours), kind: 'capsule_course', label: `Curso terminado · «${cap.title}» (${cap.hours} h)` });
    }
  }
  return null;
};

/** Especialización: la valida Dirección. Da ECOINS y desbloquea el almuerzo en familia (§32.20). */
export const validateSpecialization = (id: string, by: Person) => {
  const s = read();
  const cap = s.capsules.find((c) => c.id === id);
  if (!cap || capsuleKind(cap) !== 'especializacion' || cap.validatedAt || cap.author.id === by.id) return;
  const at = new Date().toISOString();
  write({ ...s, capsules: s.capsules.map((c) => (c.id === id ? { ...c, validatedBy: by.name, validatedAt: at } : c)) });
  creditUser(cap.author.id, { key: `capsule_specialization:${cap.id}`, amount: SPECIALIZATION_COINS, kind: 'capsule_specialization', label: `Especialización · «${cap.title}»` });
  registerReward({ occasion: 'specialization', kind: 'almuerzo_familia', note: cap.title, decidedBy: by.name, recipients: [{ id: cap.author.id, name: cap.author.name, status: 'pendiente' }] });
};
export const pendingSpecializations = () => read().capsules.filter((c) => capsuleKind(c) === 'especializacion' && !c.validatedAt);

export const cheerCapsule = (id: string, me: Person) => {
  const s = read();
  const cap = s.capsules.find((c) => c.id === id);
  if (!cap || cap.author.id === me.id || (cap.cheers || []).includes(me.id)) return;
  write({ ...s, capsules: s.capsules.map((c) => (c.id === id ? { ...c, cheers: [...(c.cheers || []), me.id] } : c)) });
};

/** ¿Esta cápsula da ECOINS? Solo las 2 primeras de la semana de cada persona. */
export const capsulePays = (cap: Capsule, all: Capsule[]) => {
  if (capsuleKind(cap) !== 'tip') return false;
  const sameWeek = all
    .filter((c) => c.author.id === cap.author.id && capsuleKind(c) === 'tip' && weekOf(c.at) === weekOf(cap.at))
    .sort((a, b) => a.at.localeCompare(b.at));
  return sameWeek.findIndex((c) => c.id === cap.id) < PAID_CAPSULES_PER_WEEK;
};
const weekOf = (iso: string) => {
  const d = new Date(iso);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const markHelped = (id: string, me: Person) => {
  const s = read();
  const cap = s.capsules.find((c) => c.id === id);
  if (!cap || cap.author.id === me.id || cap.helped.includes(me.id)) return;
  const next = { ...cap, helped: [...cap.helped, me.id] };
  write({ ...s, capsules: s.capsules.map((c) => (c.id === id ? next : c)) });
  if (capsulePays(cap, s.capsules) && cap.helped.length < MAX_HELPS_PAID) {
    creditUser(cap.author.id, { key: `capsule_help:${cap.id}:${me.id}`, amount: HELP_COINS, kind: 'capsule_help', label: `A ${first(me.name)} le sirvió «${cap.title}»` });
  }
};
