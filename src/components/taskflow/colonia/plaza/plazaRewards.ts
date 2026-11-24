/**
 * ============================================================================
 * LA PLAZA · ECOINS, COFRES, RANGO Y MISIÓN DEL EQUIPO (ECO BY UHURA) — PROTOTIPO
 * ============================================================================
 * Implementa en el navegador las reglas de BACKEND_REQUIREMENTS.md §32:
 * - Se premian resultados, nunca tiempo: ECOINS por tareas que cuentan
 *   (§32.5: aprobadas por quien revisa, o terminadas con la línea «¿Qué hiciste?»
 *   si no tienen revisión) y por reconocimientos recibidos. Entrar, caminar,
 *   aplaudir o invitar a un café no dan ECOINS.
 * - El cofre del día se gana con la primera contribución del día, no al entrar.
 * - Una sola racha en ECO: la de días cargados (§24); se calcula afuera.
 * - Misión del equipo semanal y por resultados (§32.11).
 * Solo del prototipo: libro y cofres en localStorage. En producción el
 * servidor manda (§32.1.4).
 */

import { TaskItem, UserItem } from '../../types';
import { makePersonMatcher, isTaskOwner } from '../../auth/taskVisibility';

export type Rarity = 'comun' | 'rara' | 'epica' | 'legendaria';

export interface Collectible {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  slot: 'cabeza' | 'cara' | 'aura' | 'mano';
}

export const RARITY: Record<Rarity, { label: string; color: string; weight: number; dupCoins: number }> = {
  comun: { label: 'Común', color: '#a3e635', weight: 58, dupCoins: 10 },
  rara: { label: 'Rara', color: '#3dd9eb', weight: 28, dupCoins: 25 },
  epica: { label: 'Épica', color: '#c084fc', weight: 11, dupCoins: 60 },
  legendaria: { label: 'Legendaria', color: '#fbbf24', weight: 3, dupCoins: 150 }
};

export const COLLECTION: Collectible[] = [
  { id: 'gorra', name: 'Gorra', emoji: '🧢', rarity: 'comun', slot: 'cabeza' },
  { id: 'mono', name: 'Moño', emoji: '🎀', rarity: 'comun', slot: 'cabeza' },
  { id: 'flor', name: 'Flor', emoji: '🌼', rarity: 'comun', slot: 'cabeza' },
  { id: 'taza', name: 'Taza de café', emoji: '☕', rarity: 'comun', slot: 'mano' },
  { id: 'globo', name: 'Globo', emoji: '🎈', rarity: 'comun', slot: 'mano' },
  { id: 'libreta', name: 'Libreta', emoji: '📓', rarity: 'comun', slot: 'mano' },
  { id: 'gafas', name: 'Gafas neón', emoji: '🕶️', rarity: 'rara', slot: 'cara' },
  { id: 'audifonos', name: 'Audífonos', emoji: '🎧', rarity: 'rara', slot: 'cabeza' },
  { id: 'planta', name: 'Planta mascota', emoji: '🪴', rarity: 'rara', slot: 'mano' },
  { id: 'patineta', name: 'Patineta', emoji: '🛹', rarity: 'rara', slot: 'mano' },
  { id: 'corona', name: 'Corona', emoji: '👑', rarity: 'epica', slot: 'cabeza' },
  { id: 'copa', name: 'Sombrero de copa', emoji: '🎩', rarity: 'epica', slot: 'cabeza' },
  { id: 'mariposas', name: 'Mariposas', emoji: '🦋', rarity: 'epica', slot: 'aura' },
  { id: 'estrellas', name: 'Lluvia de estrellas', emoji: '✨', rarity: 'epica', slot: 'aura' },
  { id: 'arcoiris', name: 'Estela arcoíris', emoji: '🌈', rarity: 'legendaria', slot: 'aura' },
  { id: 'fuego', name: 'Aura de fuego', emoji: '🔥', rarity: 'legendaria', slot: 'aura' }
];

export const KUDOS = [
  { id: 'gran-trabajo', label: 'Gran trabajo', emoji: '🏆' },
  { id: 'salvo-el-dia', label: 'Me salvó el día', emoji: '🦸' },
  { id: 'creatividad', label: 'Pura creatividad', emoji: '💡' },
  { id: 'buena-onda', label: 'Buena onda', emoji: '🌞' }
] as const;
export type KudoId = (typeof KUDOS)[number]['id'];
export const KUDOS_PER_WEEK = 3;

/** Reconocimiento recibido. */
export interface Kudo { from: string; kind: KudoId; at: string }
/** Movimiento del libro (§32.4). Solo se agrega. */
export interface LedgerEntry { key: string; amount: number; kind: string; label: string; at: string }

export interface RewardsState {
  ledger: LedgerEntry[];
  owned: string[];
  equipped: string | null;
  lastChest: string | null;      // día del último cofre del día abierto
  bonusChests: number;           // cofres extra (misión del equipo)
  missionRewardedWeek: string | null;
  kudos: Kudo[];                 // recibidos
  kudosGiven: { to: string; at: string }[];
  /** Llaves de cofres ya otorgados (hito, cierre), para no repetirlos. */
  grants?: string[];
}

// v3: todos empiezan en 0 (ECOINS no retroactivos, decisión del 21 Nov 2026)
const KEY = (userId: string) => `eco_plaza_rewards_v3_${userId}`;
export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const weekStartIso = (d = new Date()) => {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7; // lunes = 0
  x.setDate(x.getDate() - dow);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

export const loadRewards = (userId: string): RewardsState => {
  const base: RewardsState = { ledger: [], owned: [], equipped: null, lastChest: null, bonusChests: 0, missionRewardedWeek: null, kudos: [], kudosGiven: [] };
  try {
    const raw = localStorage.getItem(KEY(userId));
    return raw ? { ...base, ...JSON.parse(raw) } : base;
  } catch {
    return base;
  }
};
export const saveRewards = (userId: string, s: RewardsState) => {
  try { localStorage.setItem(KEY(userId), JSON.stringify(s)); } catch { /* solo prototipo */ }
};

/** Agrega al libro si la llave no existe (idempotente, como `idempotency_key` de §32.4). */
export const credit = (s: RewardsState, e: Omit<LedgerEntry, 'at'> & { at?: string }): RewardsState =>
  s.ledger.some((x) => x.key === e.key) ? s : { ...s, ledger: [...s.ledger, { ...e, at: e.at || new Date().toISOString() }] };

export const balanceOf = (s: RewardsState) => s.ledger.reduce((a, e) => a + e.amount, 0);
/** Acumulado (define el rango): todos los movimientos, reversos incluidos. Sin tienda, es igual al saldo; así reabrir y cerrar no infla el rango. */
export const lifetimeOf = (s: RewardsState) => balanceOf(s);

export const RANKS = [
  { name: 'Aprendiz', from: 0 },
  { name: 'Artesano', from: 1000 },
  { name: 'Experto', from: 4000 },
  { name: 'Maestro', from: 10000 },
  { name: 'Leyenda', from: 20000 }
];
export const rankOf = (lifetime: number) => {
  const idx = RANKS.reduce((acc, r, i) => (lifetime >= r.from ? i : acc), 0);
  return { name: RANKS[idx].name, next: RANKS[idx + 1] || null };
};

// ── Cuándo cuenta una tarea (§32.5, decidido el 21 Nov 2026) ─────────────
// Con revisión (lo normal): cuenta al aprobarse; la aprobación es la prueba de calidad, haya enlace o no.
// En ECO una tarea con revisión solo llega a terminada cuando alguien la aprueba.
// Sin revisión: cuenta si se terminó con la línea «¿Qué hiciste?» (el formulario la pide).
// El enlace y el archivo son opcionales.
const isDone = (t: TaskItem) => t.completed || ['Done', 'completed'].includes(String(t.status));
const hasWhatLine = (t: TaskItem) => (t.deliverables || []).some((d) => (d.notes || '').trim().length > 0);
export const taskCounts = (t: TaskItem) => isDone(t) && (t.requiresReview !== false || hasWhatLine(t));

/**
 * ECOINS no retroactivos (✅ decidido el 21 Nov 2026): solo cuentan las tareas cerradas desde el día en
 * que se activa La Plaza. Todos empiezan en 0. En producción: `plaza_settings.launched_on`.
 */
export const PLAZA_LAUNCH_DATE = '2026-11-21';
const closedSinceLaunch = (t: TaskItem) => !!t.completedAt && t.completedAt.slice(0, 10) >= PLAZA_LAUNCH_DATE;
export const earnsCoins = (t: TaskItem) => taskCounts(t) && closedSinceLaunch(t);
/** @deprecated Nombre anterior; usa `taskCounts`. */
export const isDocumented = taskCounts;
const sizeCoins = (h?: number) => (!h ? 10 : h <= 4 ? 10 : h <= 16 ? 20 : 40);

/** Tareas propias terminadas: las que cuentan dan ECOINS; las demás (sin revisión y sin la línea) quedan pendientes. */
export const taskEarnings = (me: UserItem | undefined, tasks: TaskItem[], users: UserItem[]) => {
  if (!me) return { entries: [] as Omit<LedgerEntry, 'at'>[], undocumented: [] as TaskItem[], owned: [] as TaskItem[] };
  const matches = makePersonMatcher(me, users);
  const owned = tasks.filter((t) => isTaskOwner(t, me, matches));
  const mine = owned.filter(isDone);
  const entries = mine.filter(earnsCoins).map((t) => ({
    key: `task_done:${t.id}`,
    amount: sizeCoins(t.budgetedHours || t.estimatedHours),
    kind: 'task_done',
    label: `Tarea terminada · ${t.title}`,
    at: t.completedAt
  }));
  return { entries, undocumented: mine.filter((t) => !taskCounts(t)), owned };
};

/**
 * Libro solo-agregar (§32.4): si una tarea que ya dio ECOINS se reabre, se escribe un reverso
 * negativo; si vuelve a cerrarse, se otorga de nuevo con una llave nueva (`#n`).
 */
export const syncTaskLedger = (s: RewardsState, owned: TaskItem[]): RewardsState => {
  let next = s;
  owned.forEach((t) => {
    const base = `task_done:${t.id}`;
    const credits = next.ledger.filter((e) => e.kind === 'task_done' && (e.key === base || e.key.startsWith(`${base}#`)));
    const reversals = next.ledger.filter((e) => e.kind === 'reverse_task_done' && e.key.startsWith(`reverse_${base}#`));
    const net = credits.length - reversals.length;
    const amount = sizeCoins(t.budgetedHours || t.estimatedHours); // horas cotizadas (§32.4)
    if (earnsCoins(t) && net <= 0) {
      next = credit(next, { key: credits.length ? `${base}#${credits.length}` : base, amount, kind: 'task_done', label: `Tarea terminada · ${t.title}`, at: credits.length ? undefined : t.completedAt });
    } else if (!taskCounts(t) && net > 0) {
      const last = credits[credits.length - 1];
      next = credit(next, { key: `reverse_${base}#${reversals.length}`, amount: -(last?.amount || amount), kind: 'reverse_task_done', label: `Tarea reabierta · ${t.title}` });
    }
  });
  return next;
};

// ── Cofres (§32.6) ───────────────────────────────────────────────────────
/** El cofre del día se gana con la primera contribución del día (un movimiento que dé ECOINS hoy). */
export const contributedToday = (s: RewardsState) => s.ledger.some((e) => e.amount > 0 && e.at.slice(0, 10) === todayIso() && e.kind !== 'chest');
export const dailyChestReady = (s: RewardsState) => s.lastChest !== todayIso() && contributedToday(s);
export const chestAvailable = (s: RewardsState) => dailyChestReady(s) || s.bonusChests > 0;

/** Abre un cofre (en producción el sorteo es del servidor). */
export const openChest = (s: RewardsState): { next: RewardsState; item: Collectible; duplicate: boolean; coins: number } => {
  const useBonus = !dailyChestReady(s);
  const minRarity: Rarity = useBonus ? 'rara' : 'comun';
  const order: Rarity[] = ['comun', 'rara', 'epica', 'legendaria'];
  const pool = order.slice(order.indexOf(minRarity));
  const total = pool.reduce((a, r) => a + RARITY[r].weight, 0);
  let roll = Math.random() * total;
  let rarity: Rarity = pool[0];
  for (const r of pool) { if (roll < RARITY[r].weight) { rarity = r; break; } roll -= RARITY[r].weight; }
  const items = COLLECTION.filter((c) => c.rarity === rarity);
  const item = items[Math.floor(Math.random() * items.length)];
  const duplicate = s.owned.includes(item.id);
  const coins = 5 + (duplicate ? RARITY[rarity].dupCoins : 0);
  const stamp = Date.now();
  let next: RewardsState = {
    ...s,
    owned: duplicate ? s.owned : [...s.owned, item.id],
    equipped: s.equipped ?? (duplicate ? s.equipped : item.id),
    lastChest: useBonus ? s.lastChest : todayIso(),
    bonusChests: useBonus ? Math.max(0, s.bonusChests - 1) : s.bonusChests
  };
  next = credit(next, { key: `chest:${stamp}`, amount: coins, kind: 'chest', label: duplicate ? `Cofre: ${item.name} repetido` : `Cofre: ${item.name}` });
  return { next, item, duplicate, coins };
};

// ── Reconocimientos (§32.9) ──────────────────────────────────────────────
export const kudosLeftThisWeek = (s: RewardsState) => KUDOS_PER_WEEK - s.kudosGiven.filter((k) => k.at.slice(0, 10) >= weekStartIso()).length;
export const kudoGivenThisWeekTo = (s: RewardsState, to: string) => s.kudosGiven.some((k) => k.to === to && k.at.slice(0, 10) >= weekStartIso());

// ── Títulos (§32.4: por logros, no por saldo) ────────────────────────────
export const titleFor = (s: RewardsState): string | null => {
  if (s.owned.some((id) => COLLECTION.find((c) => c.id === id)?.rarity === 'legendaria')) return 'Leyenda de La Plaza';
  if (s.kudos.length >= 10) return 'Alma del equipo';
  // «Mentor» (§32.4): 5 entre mentorías confirmadas y cápsulas «Aprendí esto» que le sirvieron a 3 o más personas
  const mentorships = s.ledger.filter((e) => e.kind === 'mentorship').length;
  const helpsByCapsule = new Map<string, number>();
  s.ledger.filter((e) => e.kind === 'capsule_help').forEach((e) => { const id = e.key.split(':')[1]; helpsByCapsule.set(id, (helpsByCapsule.get(id) || 0) + 1); });
  const usefulCapsules = [...helpsByCapsule.values()].filter((n) => n >= 3).length;
  if (mentorships + usefulCapsules >= 5) return 'Mentor';
  if (s.owned.length >= 8) return 'Coleccionista';
  return null;
};

// ── Misión del equipo (§32.11): semanal y por resultados ────────────────
export interface MissionGoal { key: string; label: string; icon: string; current: number; target: number; inverse?: boolean }
const businessDaysBetween = (from: Date, to: Date) => {
  let n = 0;
  const d = new Date(from);
  while (d < to) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) n++; }
  return n;
};
export const teamMission = (tasks: TaskItem[]): { goals: MissionGoal[]; done: boolean; progress: number } => {
  const week = weekStartIso();
  const documented = tasks.filter((t) => isDone(t) && isDocumented(t) && (t.completedAt || '').slice(0, 10) >= week).length;
  const now = new Date();
  // Desde la última entrega (fecha real); si no hay fecha válida, no se cuenta como atrasada
  const deliveredAt = (t: TaskItem) => { const d = t.deliverables?.[t.deliverables.length - 1]; const v = new Date(d?.submittedIso || d?.submittedAt || ''); return isNaN(v.getTime()) ? null : v; };
  const staleReviews = tasks.filter((t) => { if (!['Review', 'in_review'].includes(String(t.status))) return false; const at = deliveredAt(t); return !!at && businessDaysBetween(at, now) > 2; }).length;
  const goals: MissionGoal[] = [
    { key: 'documented', label: 'tareas terminadas (aprobadas o con «¿Qué hiciste?»)', icon: '✅', current: documented, target: 12 },
    { key: 'reviews', label: 'revisiones con más de 2 días de espera', icon: '⏱️', current: staleReviews, target: 0, inverse: true }
  ];
  const parts = goals.map((g) => (g.inverse ? (g.current <= g.target ? 1 : 0) : Math.min(1, g.current / g.target)));
  const progress = parts.reduce((a, b) => a + b, 0) / parts.length;
  return { goals, done: progress >= 1, progress };
};
