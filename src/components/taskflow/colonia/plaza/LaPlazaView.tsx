/**
 * ============================================================================
 * LA PLAZA · EL LUGAR DEL EQUIPO (ECO BY UHURA) — PROTOTIPO EXPERIMENTAL
 * ============================================================================
 * Un mapa 2D que refleja el día a día del equipo:
 * - El Estudio (oficina): quien tiene el cronómetro corriendo está en su
 *   escritorio, con la tarea y el proyecto. La Sala de reuniones muestra quién
 *   está en reunión y hasta qué hora.
 * - La plaza: quien está disponible camina, saluda, toma café o va al Arcade.
 * - Celebraciones: cuando alguien termina una tarea, ECO lo anuncia y se aplaude.
 * - Escenario: la playlist compartida del equipo en Spotify.
 *
 * Solo del prototipo:
 * - El resto del equipo está simulado (se mueve solo). En producción, la
 *   presencia llega en tiempo real desde el cronómetro, Google Calendar y las
 *   ausencias de ECO.
 * - El personaje elegido y la playlist se guardan en localStorage.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TaskItem, UserItem, TeamAbsenceEvent } from '../../types';
import {
  MAP_IMG, MAP_W, MAP_H, SKY_PAD, WORLD_W, WORLD_H, CHARACTERS, ECO_SPRITES, ZONES, Zone, ZoneId,
  DOOR_RADIUS, PROPS, WAYPOINTS, CAFE_SPOTS, STAGE_SPOTS, LIGHTS, isWalkable, findPath, PlazaCharacter
} from './plazaWorld';
import { WorkInfo, areaOf, workFor, meetingUntil, parseMedia, projectsVisibleTo, projectKeyOf } from './plazaPresence';
import { ChestModal, CollectionPanel, StagePanel, StageShare, fetchMediaInfo } from './PlazaPanels';
import {
  COLLECTION, KUDOS, KudoId, RewardsState, chestAvailable, loadRewards, openChest, saveRewards, titleFor, credit,
  balanceOf, lifetimeOf, rankOf, taskEarnings, teamMission, weekStartIso, kudosLeftThisWeek, kudoGivenThisWeekTo, KUDOS_PER_WEEK
} from './plazaRewards';
import { TimeLog } from '../../types';
import { hoursByDay, computeStreak, absencesByUserFrom } from '../../time/dayStreak';
import { EstudioView, EstudioPerson } from './EstudioView';
import { playTapSound } from '../coloniaAudio';
import { loadDecisions, businessHoursLeft } from '../../decisions/decisionStore';
import {
  CONTRIB_EVENT, KIND_LABEL, OCCASION_LABEL, RewardKind, RewardOccasion, confirmMentorship, grantChest, loadContributions,
  markRewardTaken, mentorshipsThisWeek, giveKudo as giveKudoTo, MENTORSHIPS_PER_WEEK, pendingMentorshipsFor, registerMentorship, registerReward
} from './contributionsStore';
import { makePersonMatcher, isTaskOwner } from '../../auth/taskVisibility';
import { isDocumented, syncTaskLedger, taskCounts } from './plazaRewards';
import { useDecisionsVersion } from '../../decisions/DecisionsSection';
import { openTaskDecisions } from '../../decisions/DecisionsWaiting';
import { KnockComposer, KnocksInbox } from '../../knocks/KnockUI';
import { IdeasBoard, useIdeasVersion } from './IdeasBoard';
import { PassportCard, PassportTeamSummary } from './PassportCard';
import { loadIdeas } from './ideasStore';
import {
  Users, X, Hand, Plus, Minus, Gamepad2, Coffee, Swords, Cake, PartyPopper, Headphones, CalendarClock,
  LayoutGrid, Music, Shirt, Link2, Briefcase, Sun, Sunset, Moon, Clock, AlignLeft, Gamepad
} from 'lucide-react';

interface LaPlazaViewProps {
  currentUser?: UserItem;
  teamUsers?: UserItem[];
  tasks?: TaskItem[];
  timeLogs?: TimeLog[];
  targetDayHours?: number;
  absenceEvents?: TeamAbsenceEvent[];
  onOpenArcade: () => void;
  onOpenTeam: () => void;
  /** Cronómetro corriendo: los toc tocs que te dejan esperan a que lo detengas (§32.18). */
  timerRunning?: boolean;
}

type Status = 'trabajando' | 'reunion' | 'disponible' | 'cumple';
type Mode = 'wander' | 'idle' | 'cafe' | 'listen' | 'enter';
type Dir = 'down' | 'up' | 'left' | 'right';
type Panel = 'cafe' | 'stage' | 'wall' | 'estudio' | 'eco';

interface Bubble { text: string; until: number }

interface Mover { x: number; y: number; tx: number | null; ty: number | null; moving: boolean; path?: { x: number; y: number }[]; dirAt?: number; stuckFor?: number }

interface Npc extends Mover {
  id: string;
  user: UserItem;
  first: string;
  char: number;
  status: Status;
  mode: Mode;
  inside: boolean;
  work?: WorkInfo;
  until?: string;
  waitUntil: number;
  dir: Dir;
  bubble: Bubble | null;
  nextChatter: number;
  phase: number;
}

interface Celebration { id: number; who: string; verb?: string; task: string; project: string; claps: number; clapped: boolean; until: number }

const CHAR_H = 88;
const ECO_H = 50;
const PLAYER_SPEED = 230;
const NPC_SPEED = 85;
const ECO_SPEED = 60;
/** Puesto de ECO: el anfitrión de La Plaza vive junto a la fuente y no sigue a nadie. */
const ECO_HOME = { x: 842, y: 528 };
const ECO_TALK_RADIUS = 300;
const EMOTES = ['👋', '❤️', '😂', '🎉', '☕', '🔥'];
const SHARE_KEY = 'eco_plaza_stage_list';

const STATUS_META: Record<Status, { label: string; dot: string; badge: string | null }> = {
  disponible: { label: 'Disponible', dot: '#a3e635', badge: null },
  trabajando: { label: 'En El Estudio', dot: '#f59e0b', badge: '💻' },
  reunion: { label: 'En reunión', dot: '#f43f5e', badge: '📅' },
  cumple: { label: '¡Cumpleaños hoy!', dot: '#e879f9', badge: '🎂' }
};

const ECO_LINES = [
  'Tócame cuando quieras: te cuento tus ECOINS, tu cofre y cómo va la misión de la semana.',
  'En El Estudio ves en qué está trabajando cada persona. ¡Pasa a mirar!',
  'Cuando alguien termina una tarea, te aviso para que le aplaudas. 👏',
  'En el Escenario puedes compartir música de Spotify o un video de YouTube para el equipo 🎬',
  'En el Arcade hay retos de 15 segundos. ¿Le ganas a alguien hoy?',
  'Invita a alguien a un café o reconócele algo: haz clic en su personaje.',
  'La misión del equipo se cumple entre todos. Si llegamos, cofre extra para cada uno 🎁',
  'El Muro tiene los cumpleaños y aniversarios del mes. 🎉',
  'Prueba los emojis de abajo, o las teclas 1 a 6.'
];

/** Fija un destino calculando el camino alrededor de los obstáculos. */
const goTo = (m: Mover, x: number, y: number) => {
  const path = findPath(m.x, m.y, x, y);
  const first = path.shift()!;
  m.tx = first.x; m.ty = first.y; m.path = path;
};

const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T,>(arr: T[], r = Math.random()) => arr[Math.floor(r * arr.length) % arr.length];
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
/** Nombre corto; si se repite el nombre, se agrega la inicial del apellido. */
const shortName = (u: UserItem, all: UserItem[]) => {
  const [first, ...rest] = u.name.split(' ');
  const dup = all.filter((o) => o.name.split(' ')[0] === first).length > 1;
  return dup && rest.length ? `${first} ${rest[rest.length > 1 ? rest.length - 2 : 0][0]}.` : first;
};
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dirFrom = (dx: number, dy: number, prev: Dir): Dir => {
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return prev;
  // Histéresis: en diagonal se mantiene el eje que ya tenía (evita alternar frente/perfil cuadro a cuadro)
  const ax = Math.abs(dx), ay = Math.abs(dy);
  const wasSide = prev === 'left' || prev === 'right';
  const side = wasSide ? ax >= ay * 0.6 : ax > ay * 1.6;
  return side ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
};
/** Gira solo si pasó un momento desde el último giro (sin parpadeo entre vistas). */
const turnTo = (m: Mover & { dir: Dir }, dx: number, dy: number, t: number, minGap = 0.3) => {
  const next = dirFrom(dx, dy, m.dir);
  if (next === m.dir) return;
  if (t - (m.dirAt || 0) < minGap) return;
  m.dir = next;
  m.dirAt = t;
};
/** Mira hacia un punto con margen: si está casi encima, no cambia de lado. */
const faceX = (m: Mover & { dir: Dir }, targetX: number, t: number) => {
  const dx = targetX - m.x;
  if (Math.abs(dx) < 14) return;
  const next: Dir = dx < 0 ? 'left' : 'right';
  if (next !== m.dir && t - (m.dirAt || 0) >= 0.3) { m.dir = next; m.dirAt = t; }
};
/** Imagen según hacia dónde mira; la izquierda es el espejo del perfil. */
const spriteFor = (c: PlazaCharacter, dir: Dir) => {
  if (dir === 'up') return { img: c.up || c.img, flip: false };
  if (dir === 'left' || dir === 'right') return c.side ? { img: c.side, flip: dir === 'left' } : { img: c.img, flip: dir === 'left' };
  return { img: c.img, flip: false };
};

/** Avanza hacia el destino deslizándose por los bordes de los obstáculos. */
const stepMover = (m: Mover, speed: number, dt: number): boolean => {
  if (m.tx === null || m.ty === null) { m.moving = false; return false; }
  const dx = m.tx - m.x;
  const dy = m.ty - m.y;
  const d = Math.hypot(dx, dy);
  if (d < 3) {
    if (m.path && m.path.length) { const n = m.path.shift()!; m.tx = n.x; m.ty = n.y; return false; }
    m.tx = null; m.ty = null; m.moving = false; return true;
  }
  const s = Math.min(d, speed * dt);
  const nx = m.x + (dx / d) * s;
  const ny = m.y + (dy / d) * s;
  if (isWalkable(nx, ny)) { m.x = nx; m.y = ny; }
  else if (Math.abs(nx - m.x) > 0.2 && isWalkable(nx, m.y)) { m.x = nx; }
  else if (Math.abs(ny - m.y) > 0.2 && isWalkable(m.x, ny)) { m.y = ny; }
  else {
    const base = Math.atan2(dy, dx);
    let moved = false;
    for (const off of [0.5, -0.5, 0.9, -0.9, 1.3, -1.3]) {
      const ax = m.x + Math.cos(base + off) * s;
      const ay = m.y + Math.sin(base + off) * s;
      if (isWalkable(ax, ay)) { m.x = ax; m.y = ay; moved = true; break; }
    }
    if (!moved) { m.tx = null; m.ty = null; m.path = []; m.moving = false; return true; }
  }
  m.moving = true;
  return false;
};

const nearestWalkable = (x: number, y: number) => {
  if (isWalkable(x, y)) return { x, y };
  for (let r = 10; r < 260; r += 10) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (isWalkable(px, py)) return { x: px, y: py };
    }
  }
  return { x: 745, y: 600 };
};

const loadPref = (key: string): string | null => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const savePref = (key: string, v: string) => {
  try { localStorage.setItem(key, v); } catch { /* solo prototipo */ }
};

// ── Día y noche ─────────────────────────────────────────────────────────────
type Ambient = 'dia' | 'atardecer' | 'noche';
type AmbientPref = 'auto' | Ambient;
const AMBIENT_KEY = 'eco_plaza_ambient';
/** Hora real de Colombia (UTC−5): 6–17 día, 17–19 atardecer, el resto noche. */
const ambientNow = (): Ambient => {
  const h = new Date(Date.now() - 5 * 3600 * 1000).getUTCHours();
  return h >= 6 && h < 17 ? 'dia' : h >= 17 && h < 19 ? 'atardecer' : 'noche';
};
const AMBIENT: Record<Ambient, { label: string; filter: string; sky: string; tint: string; tintBlend: 'soft-light' | 'multiply' | 'normal'; lights: number; stars: number; flies: number; vignette: string }> = {
  dia: {
    label: 'Día',
    filter: 'brightness(1.3) saturate(.92) contrast(1.04) hue-rotate(-16deg)',
    sky: 'linear-gradient(180deg, #5fb6ff 0%, #9fd6ff 60%, #d8efff 100%)',
    tint: 'linear-gradient(180deg, rgba(160,210,255,.38), rgba(255,250,225,.26))',
    tintBlend: 'soft-light',
    lights: 0,
    stars: 0,
    flies: 0,
    vignette: 'radial-gradient(ellipse at center, transparent 65%, rgba(40,30,80,.25) 100%)'
  },
  atardecer: {
    label: 'Atardecer',
    filter: 'brightness(1.08) saturate(1.12) sepia(.12)',
    sky: 'linear-gradient(180deg, #2e1a6b 0%, #b44a7a 55%, #ff9a5c 100%)',
    tint: 'linear-gradient(180deg, rgba(255,140,80,.22), rgba(180,60,120,.16))',
    tintBlend: 'soft-light',
    lights: 0.6,
    stars: 0.3,
    flies: 0.4,
    vignette: 'radial-gradient(ellipse at center, transparent 58%, rgba(40,10,40,.45) 100%)'
  },
  noche: {
    label: 'Noche',
    filter: 'none',
    sky: 'linear-gradient(180deg, #0b0420 0%, #24104a 60%, #3a1a55 100%)',
    tint: 'transparent',
    tintBlend: 'normal',
    lights: 1,
    stars: 1,
    flies: 1,
    vignette: 'radial-gradient(ellipse at center, transparent 55%, rgba(10,4,24,.55) 100%)'
  }
};

/** Accesorio del resto del equipo (simulado): algunas personas ya lucen lo que ganaron. */
const npcAccessory = (id: string) => {
  const h = hashStr(id + 'acc');
  return h % 5 < 2 ? COLLECTION[h % COLLECTION.length] : null;
};

/** Dónde estabas y si ECO ya te saludó (se conserva al ir al Arcade y volver). */
const session = { spot: null as { x: number; y: number } | null, greeted: false };

const PLAZA_CSS = `
@keyframes plaza-flicker { 0%,100% { opacity: .55 } 45% { opacity: .75 } 60% { opacity: .5 } 80% { opacity: .7 } }
@keyframes plaza-firefly { 0% { transform: translate(0,0); opacity: 0 } 15% { opacity: 1 } 50% { transform: translate(var(--fx), var(--fy)); opacity: .9 } 85% { opacity: 1 } 100% { transform: translate(0,0); opacity: 0 } }
@keyframes plaza-river { 0% { background-position: 0 0 } 100% { background-position: 0 240px } }
@keyframes plaza-note { 0% { transform: translate(0,0) scale(.6); opacity: 0 } 15% { opacity: 1 } 100% { transform: translate(var(--nx), -120px) scale(1.1); opacity: 0 } }
@keyframes plaza-pop { 0% { transform: translate(-50%, -100%) scale(.4); opacity: 0 } 60% { transform: translate(-50%, -100%) scale(1.08); opacity: 1 } 100% { transform: translate(-50%, -100%) scale(1); opacity: 1 } }
@keyframes plaza-pulse { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity: .9 } 50% { transform: translate(-50%,-50%) scale(1.15); opacity: .5 } }
@keyframes plaza-in { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: none } }
@keyframes plaza-drop { from { opacity: 0; transform: translate(-50%, -16px) } to { opacity: 1; transform: translate(-50%, 0) } }
@keyframes plaza-confetti { 0% { transform: translateY(-10px) rotate(0); opacity: 1 } 100% { transform: translateY(70px) rotate(540deg); opacity: 0 } }
.plaza-bubble { animation: plaza-pop .28s cubic-bezier(.2,1.4,.4,1) both }
.plaza-in { animation: plaza-in .22s ease-out both }
.plaza-drop { animation: plaza-drop .35s cubic-bezier(.2,1.3,.4,1) both }
`;

export const LaPlazaView: React.FC<LaPlazaViewProps> = ({
  currentUser,
  teamUsers = [],
  tasks = [],
  timeLogs = [],
  targetDayHours = 8.4,
  absenceEvents = [],
  onOpenArcade,
  onOpenTeam,
  timerRunning = false
}) => {
  const userId = currentUser?.id || 'anon';
  const myFirst = (currentUser?.name || 'Tú').split(' ')[0];

  // ── Personaje ────────────────────────────────────────────────────────────
  const avatarKey = `eco_plaza_avatar_${userId}`;
  const [avatarIdx, setAvatarIdx] = useState<number | null>(() => { const v = loadPref(avatarKey); return v === null ? null : Number(v); });
  const [pickerOpen, setPickerOpen] = useState<boolean>(() => loadPref(avatarKey) === null);
  const [pickerChoice, setPickerChoice] = useState<number>(() => Number(loadPref(avatarKey) ?? 0));

  // ── Día y noche ──────────────────────────────────────────────────────────
  const [ambientPref, setAmbientPref] = useState<AmbientPref>(() => (loadPref(AMBIENT_KEY) as AmbientPref) || 'auto');
  const [clockAmbient, setClockAmbient] = useState<Ambient>(ambientNow);
  useEffect(() => {
    const id = window.setInterval(() => setClockAmbient(ambientNow()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const ambient: Ambient = ambientPref === 'auto' ? clockAmbient : ambientPref;
  const A = AMBIENT[ambient];
  const cycleAmbient = () => {
    const order: AmbientPref[] = ['auto', 'dia', 'atardecer', 'noche'];
    const next = order[(order.indexOf(ambientPref) + 1) % order.length];
    setAmbientPref(next);
    savePref(AMBIENT_KEY, next);
    playTapSound();
  };

  // ── Escenario: lo que el equipo comparte (Spotify o YouTube) ─────────────
  // Lista del día: se reinicia cada día (solo del prototipo: vive en el navegador)
  const [stageList, setStageListState] = useState<StageShare[]>(() => {
    try {
      const v = loadPref(SHARE_KEY);
      const parsed = v ? (JSON.parse(v) as { date: string; items: StageShare[] }) : null;
      return parsed && parsed.date === todayIso() ? parsed.items : [];
    } catch { return []; }
  });
  const setStageList = (fn: (l: StageShare[]) => StageShare[]) => {
    setStageListState((prev) => {
      const next = fn(prev);
      savePref(SHARE_KEY, JSON.stringify({ date: todayIso(), items: next }));
      return next;
    });
  };
  const share = stageList[0] || null;
  const [playlistDraft, setPlaylistDraft] = useState('');
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const embedUrl = share?.media.embed || null;

  // ── ECOINS, cofres, racha y misión (BACKEND_REQUIREMENTS §32) ──────────
  const [rewards, setRewardsState] = useState<RewardsState>(() => loadRewards(userId));
  const rewardsRef = useRef(rewards);
  rewardsRef.current = rewards;
  const setRewards = useCallback((fn: (r: RewardsState) => RewardsState) => {
    setRewardsState((prev) => {
      const next = fn(prev);
      saveRewards(userId, next);
      return next;
    });
  }, [userId]);
  const [chestOpen, setChestOpen] = useState(false);
  const [kudoFor, setKudoFor] = useState<string | null>(null);
  const myTitle = titleFor(rewards);
  const equippedItem = COLLECTION.find((c) => c.id === rewards.equipped) || null;
  const balance = balanceOf(rewards);
  const rank = rankOf(lifetimeOf(rewards));
  // Tareas propias que cuentan (§32.5) → ECOINS (idempotente por tarea)
  const earnings = useMemo(() => taskEarnings(currentUser, tasks, teamUsers), [currentUser, tasks, teamUsers]);
  // Otros módulos (desbloqueos, mentorías, cofres de cierre) escriben en el libro: se recarga
  const [contribVersion, setContribVersion] = useState(0);
  useEffect(() => {
    const reload = () => setRewardsState(loadRewards(userId));
    const bump = () => setContribVersion((v) => v + 1);
    window.addEventListener('eco:rewards-changed', reload);
    window.addEventListener(CONTRIB_EVENT, bump);
    return () => { window.removeEventListener('eco:rewards-changed', reload); window.removeEventListener(CONTRIB_EVENT, bump); };
  }, [userId]);
  const contributions = useMemo(() => loadContributions(), [contribVersion]);
  const myPendingMentorships = useMemo(() => pendingMentorshipsFor(userId), [userId, contribVersion]);
  const [mentorForm, setMentorForm] = useState({ open: false, learner: '', topic: '' });
  const isDirection = ['executive', 'system_admin'].includes(String(currentUser?.accessLevel || ''));
  const [rewardForm, setRewardForm] = useState<{ open: boolean; occasion: RewardOccasion; kind: RewardKind; project: string; recipients: string[]; note: string }>({ open: false, occasion: 'project_delivered', kind: 'medio_dia', project: '', recipients: [], note: '' });

  // Expediciones (§32.6): proyectos en los que estoy, fase en curso y cofre del hito
  const expeditions = useMemo(() => {
    if (!currentUser) return [];
    const matches = makePersonMatcher(currentUser, teamUsers);
    const keyOf = (t: TaskItem) => t.projectId || t.projectName || t.board || 'interno';
    const myKeys = new Set(tasks.filter((t) => isTaskOwner(t, currentUser, matches)).map(keyOf));
    const done = (t: TaskItem) => t.completed || ['Done', 'completed'].includes(String(t.status));
    return [...myKeys].map((key) => {
      const pts = tasks.filter((t) => keyOf(t) === key);
      const phases = new Map<string, TaskItem[]>();
      pts.forEach((t) => { const k = t.deliverableId || 'general'; phases.set(k, [...(phases.get(k) || []), t]); });
      const ordered = [...phases.entries()].sort((a, b) => String(a[1][0]?.dueDate || '').localeCompare(String(b[1][0]?.dueDate || '')));
      const reached = ordered.filter(([, ts]) => ts.every(done));
      const current = ordered.find(([, ts]) => ts.some((t) => !done(t)));
      const curTasks = current ? current[1] : [];
      const progress = curTasks.length ? curTasks.filter((t) => done(t) && isDocumented(t)).length / curTasks.length : 1;
      const milestonesMine = reached.filter(([, ts]) => ts.some((t) => isTaskOwner(t, currentUser, matches))).map(([k]) => `milestone:${key}:${k}`);
      return { key, name: pts[0]?.projectName || pts[0]?.board || 'Proyecto', phaseName: current ? (current[1][0] as TaskItem & { frente?: string }).department || 'Fase en curso' : 'Todas las fases listas', progress, reached: reached.length, total: ordered.length, milestonesMine };
    });
  }, [tasks, currentUser, teamUsers]);
  useEffect(() => {
    // El hito alcanzado entrega el cofre del hito a quien aportó (en producción: al aprobar el cliente la presentación)
    expeditions.forEach((e) => e.milestonesMine.forEach((k) => { if (!rewardsRef.current.grants?.includes(k)) grantChest(userId, k); }));
  }, [expeditions, userId]);

  // Celebraciones de otros módulos (recompensas, retos): salen de los datos en `dayItems`, no de un evento.
  useEffect(() => {
    if (!earnings.owned.length) return;
    setRewards((r) => syncTaskLedger(r, earnings.owned));
  }, [earnings, setRewards]);
  // Una sola racha en ECO: días cargados (§24)
  const streak = useMemo(() => {
    const absent = absencesByUserFrom(absenceEvents).get(userId) || new Set<string>();
    return computeStreak({ hours: hoursByDay(timeLogs, currentUser), targetDayHours, absentDays: absent });
  }, [timeLogs, currentUser, targetDayHours, absenceEvents, userId]);
  // Misión semanal del equipo, con resultados reales
  const mission = useMemo(() => teamMission(tasks), [tasks]);
  useEffect(() => {
    const wk = weekStartIso();
    if (mission.done && rewardsRef.current.missionRewardedWeek !== wk) {
      setRewards((r) => ({ ...r, bonusChests: r.bonusChests + 1, missionRewardedWeek: wk }));
      window.setTimeout(() => missionDoneRef.current(), 600);
    }
  }, [mission.done, setRewards]);
  const missionDoneRef = useRef<() => void>(() => {});
  // Decisiones escritas (§32.7): tablero en El Estudio, «ECO informa» y ECOINS
  const decisionsVersion = useDecisionsVersion();
  const allDecisions = useMemo(() => loadDecisions(), [decisionsVersion]);
  const decisionsWaiting = allDecisions.filter((d) => d.status === 'en_revision' && d.reviewers.some((r) => r.id === userId) && !d.responses[userId]);
  useEffect(() => {
    setRewards((r) => allDecisions.reduce((acc, d) => {
      let next = acc;
      if (d.author.id === userId && d.status === 'aprobada') next = credit(next, { key: `decision_approved:${d.id}`, amount: 20, kind: 'decision_approved', label: `Decisión aprobada · ${d.title}`, at: d.closedAt });
      const mine = d.responses[userId];
      if (mine && new Date(mine.at) <= new Date(d.closesAt)) next = credit(next, { key: `decision_response:${d.id}`, amount: 3, kind: 'decision_response', label: `Respondiste una decisión · ${d.title}`, at: mine.at });
      return next;
    }, r));
  }, [allDecisions, userId, setRewards]);

  // Visibilidad §32.3: el título de la tarea solo para quien está en el proyecto
  const visibleProjects = useMemo(() => projectsVisibleTo(currentUser, tasks, teamUsers), [currentUser, tasks, teamUsers]);
  const canSeeTask = useCallback((w?: WorkInfo) => !!w && (visibleProjects === 'all' || visibleProjects.has(w.projectKey)), [visibleProjects]);

  // Celebraciones reales (§32.10): tareas que cuentan y se cerraron hoy. La presencia simulada no inventa cierres.
  // Quien no está en el proyecto ve «una tarea de {proyecto}» (§32.3).
  const realCelebs = useMemo(() => {
    const localDay = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    return tasks
      .filter((t) => taskCounts(t) && t.completedAt && localDay(t.completedAt) === todayIso())
      .map((t) => {
        const see = visibleProjects === 'all' || visibleProjects.has(projectKeyOf(t));
        const who = (t.assignee?.name || 'Alguien').split(' ')[0];
        const what = see ? `«${t.title}»` : `una tarea de ${t.projectName || 'un proyecto'}`;
        return { id: t.id, who, assignee: t.assignee?.name || '', see, what, project: t.projectName || '', at: t.completedAt as string, text: `${who} terminó ${what}` };
      })
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [tasks, visibleProjects]);

  // ── Equipo de hoy (simulado, determinístico por día) ─────────────────────
  const today = todayIso();
  const { roster, awayCount } = useMemo(() => {
    const md = today.slice(5);
    const absentIds = new Set(
      absenceEvents
        .filter((a) => a.status !== 'cancelled' && a.startDate <= today && a.endDate >= today)
        .map((a) => a.userId)
    );
    const pool = teamUsers.filter((u) => u.status !== 'Inactive' && u.id !== userId);
    const present: { user: UserItem; status: Status; seed: number }[] = [];
    let away = 0;
    pool.forEach((u) => {
      if (absentIds.has(u.id) || u.vacationStatus?.onVacation) { away++; return; }
      const seed = hashStr(u.id + today);
      const r = seeded(seed)();
      if (r < 0.12) { away++; return; } // desconectado hoy (simulado)
      const status: Status = u.birthDate?.slice(5) === md ? 'cumple' : r < 0.42 ? 'trabajando' : r < 0.52 ? 'reunion' : 'disponible';
      present.push({ user: u, status, seed });
    });
    return { roster: present, awayCount: away };
  }, [teamUsers, absenceEvents, userId, today]);

  // ── Estado del mundo (mutable, se pinta por frame) ───────────────────────
  const player = useRef<Mover & { dir: Dir; bubble: Bubble | null; arriveZone: ZoneId | null }>({
    x: session.spot?.x ?? 745, y: session.spot?.y ?? 560, tx: null, ty: null, moving: false, dir: 'down', bubble: null, arriveZone: null
  });
  const eco = useRef<Mover & { dir: Dir; bubble: Bubble | null; nextLine: number; lineIdx: number; wanderAt: number }>({
    x: ECO_HOME.x, y: ECO_HOME.y, tx: null, ty: null, moving: false, dir: 'down', bubble: null, nextLine: 0, lineIdx: 0, wanderAt: 4
  });
  const npcs = useRef<Npc[]>([]);
  const keys = useRef<Set<string>>(new Set());
  // free: la persona movió la vista con el dedo o el mouse; vuelve a seguir al personaje cuando camina
  const cam = useRef({ x: 0, y: 0, ready: false, free: false });
  const drag = useRef<{ id: number; sx: number; sy: number; cx: number; cy: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const timeRef = useRef(0);
  const nextEvent = useRef(14);
  const celebId = useRef(0);

  const sendToStage = useCallback(() => {
    let k = 0;
    npcs.current.forEach((n) => {
      if (!n.inside && (n.status === 'disponible' || n.status === 'cumple') && n.mode === 'wander' && k < 3 && Math.random() < 0.6) {
        const s = STAGE_SPOTS[k++];
        n.mode = 'listen';
        goTo(n, s.x + (Math.random() - 0.5) * 20, s.y);
      }
    });
  }, []);

  useEffect(() => {
    const users = roster.map((x) => x.user);
    npcs.current = roster.map(({ user, status, seed }, i) => {
      const rnd = seeded(hashStr(user.id));
      const inside = status === 'trabajando' || status === 'reunion';
      const pos = WAYPOINTS[(i * 5 + 3) % WAYPOINTS.length];
      const p = nearestWalkable(pos.x + (rnd() - 0.5) * 30, pos.y + (rnd() - 0.5) * 16);
      return {
        id: user.id, user, first: shortName(user, users), char: hashStr(user.id) % CHARACTERS.length,
        status, mode: 'wander' as Mode, inside, x: p.x, y: p.y, tx: null, ty: null, moving: false,
        work: status === 'trabajando' ? workFor(user, tasks, teamUsers, seed) : undefined,
        until: status === 'reunion' ? meetingUntil(seed) : undefined,
        waitUntil: rnd() * 4, dir: 'down' as Dir, bubble: null, nextChatter: 6 + rnd() * 20, phase: rnd() * 10
      };
    });
    if (loadPref(SHARE_KEY)) sendToStage();
  }, [roster, tasks, teamUsers, sendToStage]);

  // ── UI ───────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 640 });
  const [zoom, setZoom] = useState(1.25);
  const [, setFrame] = useState(0);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [celebLog, setCelebLog] = useState<{ text: string; at: string }[]>([]);
  const [emotesOpen, setEmotesOpen] = useState(false);
  // Vista simple (§32.12): las mismas acciones que en la vista de juego
  const [simpleKudoFor, setSimpleKudoFor] = useState<string | null>(null);
  // Café de ideas (§32.19): retos abiertos y cápsulas de la semana
  const ideasV = useIdeasVersion();
  const ideas = useMemo(() => loadIdeas(), [ideasV]);
  const openChallenges = ideas.challenges.filter((c) => c.status === 'abierto');
  // Toc toc (§32.18): a quién le escribo y si está en un bloque (trabajando o en reunión)
  const [knockFor, setKnockFor] = useState<{ user: UserItem; busy: string | null } | null>(null);
  // Lo de hoy (§32.10): tareas que cuentan, retos ganados y recompensas registradas hoy, salidos de los
  // datos (no de un evento en memoria), para que todos lo vean igual y sobreviva a recargar la página.
  const contribForCelebs = useMemo(() => loadContributions(), [contribVersion]);
  const dayItems = useMemo(() => {
    const localDay = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    const today = todayIso();
    const items: { id: string; who: string; what: string; verb: string; project: string; at: string; text: string }[] = realCelebs.map((c) => ({ ...c, verb: 'terminó' }));
    ideas.challenges.filter((c) => c.status === 'cerrado' && localDay(c.closedAt) === today && c.podium?.length).forEach((c) => {
      const w = c.entries.find((e) => e.id === c.podium![0]);
      if (!w) return;
      const mine = w.user.id === userId;
      items.push({ id: `reto:${c.id}`, who: mine ? 'Tú' : w.user.name.split(' ')[0], verb: mine ? 'ganaste el reto' : 'ganó el reto', what: `«${c.title}»`, project: `Lanzado por ${c.creator.name.split(' ')[0]} · ${c.entries.length} ${c.entries.length === 1 ? 'aporte' : 'aportes'}`, at: c.closedAt!, text: mine ? `¡Ganaste el reto «${c.title}»!` : `${w.user.name.split(' ')[0]} ganó el reto «${c.title}»` });
    });
    contribForCelebs.rewards.filter((r) => localDay(r.decidedAt) === today).forEach((r) => {
      const who = r.occasion === 'project_delivered' ? 'El equipo' : r.occasion === 'monthly_mission' ? 'Uhura' : r.recipients.map((p) => p.name.split(' ')[0]).join(', ');
      const what = r.occasion === 'project_delivered' ? `entregó «${r.projectName || 'el proyecto'}»` : r.occasion === 'monthly_mission' ? 'cumplió la misión del mes' : r.occasion === 'specialization' ? `terminó «${r.note || 'una especialización'}» 🏅` : 'recibe el reconocimiento del mes';
      items.push({ id: `premio:${r.id}`, who, verb: '', what, project: `${KIND_LABEL[r.kind]} 🎁`, at: r.decidedAt, text: `${who} ${what}` });
    });
    return items.sort((a, b) => b.at.localeCompare(a.at));
  }, [realCelebs, ideas, contribForCelebs, userId]);
  const todayCelebs = useMemo(() => dayItems.map((c) => ({ text: c.text, at: c.at })).slice(0, 8), [dayItems]);
  // Anuncio al entrar (o en vivo): lo de hoy que esta persona aún no ha visto en La Plaza
  const seenCelebs = useRef<Set<string> | null>(null);
  useEffect(() => {
    const key = `eco_celeb_seen_${userId}_${todayIso()}`;
    if (!seenCelebs.current) {
      try { seenCelebs.current = new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch { seenCelebs.current = new Set(); }
    }
    const fresh = dayItems.filter((c) => !seenCelebs.current!.has(c.id));
    fresh.forEach((c) => seenCelebs.current!.add(c.id));
    try { localStorage.setItem(key, JSON.stringify([...seenCelebs.current!])); } catch { /* */ }
    if (!fresh.length) return;
    const c = fresh[0];
    celebId.current++;
    setCelebration({ id: celebId.current, who: c.who, verb: c.verb, task: c.what, project: c.project, claps: 0, clapped: false, until: timeRef.current + 11 });
  }, [dayItems, userId]);
  // Vista de juego o vista simple (§32.12). Con «reducir movimiento» empieza en simple.
  const [mode, setMode] = useState<'juego' | 'simple'>(() => {
    const v = loadPref('eco_plaza_mode');
    if (v === 'juego' || v === 'simple') return v;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'simple' : 'juego'; } catch { return 'juego'; }
  });
  const switchMode = (m: 'juego' | 'simple') => { setMode(m); savePref('eco_plaza_mode', m); playTapSound(); };
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const baseScale = Math.max(size.w / WORLD_W, size.h / WORLD_H);
  const scale = baseScale * zoom;

  useEffect(() => {
    eco.current.bubble = session.greeted
      ? { text: pick([`¡De vuelta, ${myFirst}! 🎉`, '¿Cómo te fue en el Arcade? 🕹️', '¡Qué bueno verte otra vez!']), until: 3.5 }
      : { text: `¡${ambientNow() === 'dia' ? 'Buenos días' : ambientNow() === 'atardecer' ? 'Buenas tardes' : 'Buenas noches'}, ${myFirst}! Esta es La Plaza. Camina con las flechas o con un clic.`, until: 7 };
    session.greeted = true;
    eco.current.nextLine = 22;
    if (chestAvailable(rewardsRef.current)) {
      window.setTimeout(() => { if (chestAvailable(rewardsRef.current)) eco.current.bubble = { text: 'Tu cofre del día está listo 🎁 Tócalo arriba a la derecha.', until: timeRef.current + 6 }; }, 7500);
    }
  }, [myFirst]);

  useEffect(() => () => { session.spot = { x: player.current.x, y: player.current.y }; }, []);

  const stateRefs = useRef({ panel, pickerOpen, selectedNpc });
  stateRefs.current = { panel, pickerOpen, selectedNpc };

  // ── Acciones ─────────────────────────────────────────────────────────────
  const say = (target: { bubble: Bubble | null }, text: string, secs = 3.2) => {
    target.bubble = { text, until: timeRef.current + secs };
  };

  const enterZone = useCallback((id: ZoneId) => {
    playTapSound();
    if (id === 'arcade') { onOpenArcade(); return; }
    setPanel(id);
  }, [onOpenArcade]);

  const walkTo = (x: number, y: number, arriveZone: ZoneId | null = null) => {
    cam.current.free = false;
    const p = nearestWalkable(x, y);
    goTo(player.current, p.x, p.y);
    player.current.arriveZone = arriveZone;
  };

  const sendEmote = useCallback((e: string) => {
    say(player.current, e, 2.4);
    npcs.current
      .filter((n) => !n.inside && dist(n, player.current) < 170)
      .slice(0, 2)
      .forEach((n, i) => {
        window.setTimeout(() => say(n, e === '👋' ? '👋' : pick(['😄', '🙌', e, '✨'])), 500 + i * 350);
      });
  }, []);


  const savePlaylist = () => {
    const media = parseMedia(playlistDraft);
    if (!media) { setPlaylistError('Pega un enlace de Spotify (playlist, álbum o canción) o de YouTube (video o lista).'); return; }
    if (stageList.some((x) => x.media.url === media.url)) { setPlaylistError('Ese enlace ya está en la lista de hoy.'); return; }
    const id = `s-${Date.now()}`;
    const next: StageShare = { id, media, byName: myFirst, byId: userId, at: new Date().toISOString(), likes: [] };
    setStageList((l) => [next, ...l]);
    fetchMediaInfo(media).then((info) => {
      if (info.title || info.thumb) setStageList((l) => l.map((x) => (x.id === id ? { ...x, ...info } : x)));
    });
    setPlaylistDraft('');
    setPlaylistError(null);
    sendToStage();
    showToast(media.kind === 'youtube' ? 'Video agregado a la lista de hoy 🎬' : 'Canción agregada a la lista de hoy 🎧');
  };

  const simpleActions = (n: Npc, busy: string | null) => (
    <span className="flex gap-1">
      <button type="button" onClick={() => setKnockFor({ user: n.user, busy })} className="rounded-lg border border-[#e2e8f0] bg-white px-2 py-0.5 text-[11px] font-bold text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer">✋ Toc toc</button>
      <button type="button" onClick={() => setSimpleKudoFor(simpleKudoFor === n.id ? null : n.id)} className="rounded-lg border border-[#e2e8f0] bg-white px-2 py-0.5 text-[11px] font-bold text-[#0f172a] hover:bg-[#f1f5f9] cursor-pointer">🏆 Reconocer</button>
    </span>
  );
  const giveKudo = (n: Npc, kind: KudoId) => {
    if (!currentUser) return;
    const k = KUDOS.find((x) => x.id === kind)!;
    // Un solo lugar para la regla (§32.9): también le suma los 5 ECOINS a quien lo recibe
    const r = giveKudoTo({ id: currentUser.id, name: currentUser.name }, { id: n.user.id, name: n.user.name }, kind);
    if (!r.ok) { showToast(r.msg); return; }
    playTapSound();
    setKudoFor(null);
    setSelectedNpc(null);
    say(player.current, `${k.emoji} ¡${k.label}, ${n.first}!`, 3);
    window.setTimeout(() => say(n, pick(['¡Gracias! 🥹', '¡Uy, gracias! 💜', '¡Me alegraste el día! ✨'])), 900);
    setRewardsState(loadRewards(userId));
    showToast(r.msg);
  };

  const clap = () => {
    if (!celebration || celebration.clapped) return;
    playTapSound();
    setCelebration({ ...celebration, claps: celebration.claps + 1, clapped: true, until: timeRef.current + 4 });
    sendEmote('👏');
  };

  missionDoneRef.current = () => {
    celebId.current++;
    setCelebration({ id: celebId.current, who: 'El equipo', task: 'cumplió la misión de la semana', project: 'Cofre extra para todos 🎁', claps: 12, clapped: false, until: timeRef.current + 9 });
    eco.current.bubble = { text: '¡Misión de la semana cumplida! Hay un cofre extra para ti 🎁', until: timeRef.current + 6 };
  };

  // ── Teclado ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    };
    const down = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const k = e.key.toLowerCase();
      if (k === 'escape') { setPanel(null); setSelectedNpc(null); return; }
      if (stateRefs.current.panel || stateRefs.current.pickerOpen) return;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        keys.current.add(k);
        player.current.tx = null; player.current.ty = null; player.current.path = []; player.current.arriveZone = null;
        e.preventDefault();
      }
      if (k === 'e' || k === 'enter') {
        const z = ZONES.find((zz) => dist(zz.door, player.current) < DOOR_RADIUS);
        if (z) { e.preventDefault(); enterZone(z.id); }
      }
      const n = Number(k);
      if (n >= 1 && n <= EMOTES.length) sendEmote(EMOTES[n - 1]);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const blur = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); };
  }, [enterZone, sendEmote]);

  // ── Eventos del día: alguien termina una tarea o entra a trabajar ────────
  const runEvent = useCallback((t: number) => {
    const estudio = ZONES.find((z) => z.id === 'estudio')!;
    const working = npcs.current.filter((n) => n.inside && n.status === 'trabajando' && n.work);
    const free = npcs.current.filter((n) => !n.inside && n.status === 'disponible' && n.mode === 'wander' && n.id !== stateRefs.current.selectedNpc);
    const finish = working.length > 2 || !free.length ? true : Math.random() < 0.55;
    if (finish && working.length) {
      // Sale del Estudio a una pausa. La presencia es simulada: no inventa que terminó una tarea
      // (las celebraciones salen solo de cierres reales, ver `realCelebs`).
      const n = pick(working);
      n.inside = false;
      n.status = 'disponible';
      n.work = undefined;
      n.x = estudio.door.x + (Math.random() - 0.5) * 30;
      n.y = estudio.door.y + 4;
      n.mode = 'wander';
      n.waitUntil = t + 2;
      say(n, pick(['☕ Pausa', '🚶 Estiro las piernas', '💧 Agua']), 3);
    } else if (free.length) {
      // Alguien entra a trabajar: camina hasta la puerta del Estudio
      const n = pick(free);
      n.mode = 'enter';
      goTo(n, estudio.door.x, estudio.door.y);
      n.work = workFor(n.user, tasks, teamUsers, Math.floor(Math.random() * 50));
      say(n, '💻 ¡A trabajar!', 2.5);
    }
    // Recompensa social impredecible: a veces alguien te aplaude o te reconoce
    if (Math.random() < 0.35) {
      const giver = pick(npcs.current.filter((x) => !x.inside));
      if (giver) {
        // Solo un saludo de la presencia simulada: nunca da ECOINS ni cuenta como reconocimiento
        // (los reconocimientos son de personas reales, máx. 3 por semana, §32.9)
        say(giver, pick(['👋', '😄', '☕']), 2.5);
      }
    }
  }, [tasks, teamUsers, setRewards, showToast, myFirst, canSeeTask]);

  // ── Bucle del juego ──────────────────────────────────────────────────────
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      const t = (timeRef.current += dt);
      const p = player.current;

      // Jugador: teclado o clic
      const k = keys.current;
      const vx = (k.has('arrowright') || k.has('d') ? 1 : 0) - (k.has('arrowleft') || k.has('a') ? 1 : 0);
      const vy = (k.has('arrowdown') || k.has('s') ? 1 : 0) - (k.has('arrowup') || k.has('w') ? 1 : 0);
      if (vx || vy) {
        cam.current.free = false;
        const len = Math.hypot(vx, vy);
        p.tx = p.x + (vx / len) * 40;
        p.ty = p.y + (vy / len) * 40;
        p.arriveZone = null;
        p.path = [];
        stepMover(p, PLAYER_SPEED, dt);
        p.tx = null; p.ty = null;
        p.moving = true;
        p.dir = dirFrom(vx, vy, p.dir);
      } else {
        const ox = p.x, oy = p.y;
        const arrived = stepMover(p, PLAYER_SPEED, dt);
        if (p.moving) turnTo(p, p.tx !== null ? p.tx - p.x : p.x - ox, p.ty !== null ? p.ty - p.y : p.y - oy, t, 0.15);
        if (arrived && p.arriveZone) {
          const z = p.arriveZone;
          p.arriveZone = null;
          if (ZONES.find((zz) => zz.id === z && dist(zz.door, p) < DOOR_RADIUS + 30)) enterZone(z);
        }
      }

      // ECO: anfitrión con puesto fijo junto a la fuente. Pasea cerca de su puesto y no sigue a nadie.
      const e = eco.current;
      const de = dist(e, p);
      if (e.tx === null && t > e.wanderAt) {
        const a = Math.random() * Math.PI * 2;
        const target = nearestWalkable(ECO_HOME.x + Math.cos(a) * 45, ECO_HOME.y + Math.sin(a) * 22);
        goTo(e, target.x, target.y);
        e.wanderAt = t + 5 + Math.random() * 5;
      }
      const ex = e.x, ey = e.y;
      stepMover(e, ECO_SPEED, dt);
      if (e.moving) turnTo(e, e.tx !== null ? e.tx - e.x : e.x - ex, e.ty !== null ? e.ty - e.y : e.y - ey, t);
      else if (de < 220) faceX(e, p.x, t);
      else if (e.dir !== 'down' && t - (e.dirAt || 0) > 0.3) { e.dir = 'down'; e.dirAt = t; }
      if (t > e.nextLine && de < ECO_TALK_RADIUS && !stateRefs.current.panel) {
        e.bubble = { text: ECO_LINES[e.lineIdx % ECO_LINES.length], until: t + 6 };
        e.lineIdx++;
        e.nextLine = t + 32;
      }

      // Eventos del día
      if (t > nextEvent.current) {
        nextEvent.current = t + 30 + Math.random() * 20;
        runEvent(t);
      }

      // Equipo
      for (const n of npcs.current) {
        if (n.inside) continue;
        if (n.id === stateRefs.current.selectedNpc && n.mode !== 'cafe') {
          n.moving = false;
          faceX(n, p.x, t);
          n.waitUntil = Math.max(n.waitUntil, t + 1.5);
          if (n.bubble && n.bubble.until < t) n.bubble = null;
          continue;
        }
        const ox = n.x, oy = n.y;
        if (n.tx !== null) {
          const arrived = stepMover(n, NPC_SPEED, dt);
          if (n.moving) turnTo(n, n.tx !== null ? n.tx - n.x : n.x - ox, n.ty !== null ? n.ty - n.y : n.y - oy, t);
          // Atascado contra un borde: se detiene en vez de temblar en el sitio
          if (n.moving && Math.hypot(n.x - ox, n.y - oy) < NPC_SPEED * dt * 0.25) {
            n.stuckFor = (n.stuckFor || 0) + dt;
            if (n.stuckFor > 0.5) { n.tx = null; n.ty = null; n.path = []; n.moving = false; n.stuckFor = 0; n.waitUntil = t + 1 + Math.random() * 2; }
          } else n.stuckFor = 0;
          if (arrived) {
            n.waitUntil = t + 2 + Math.random() * 5;
            n.dir = 'down';
            if (n.mode === 'enter') {
              n.inside = true;
              n.status = 'trabajando';
              n.mode = 'wander';
            }
          }
        } else if (n.mode === 'wander' && t > n.waitUntil) {
          const w = pick(WAYPOINTS);
          const target = nearestWalkable(w.x + (Math.random() - 0.5) * 40, w.y + (Math.random() - 0.5) * 20);
          goTo(n, target.x, target.y);
        } else if (n.mode === 'cafe' && t > n.waitUntil + 25) {
          n.mode = 'wander';
        }
        if (t > n.nextChatter && n.status === 'disponible' && !n.bubble) {
          say(n, pick(n.mode === 'cafe' ? ['☕', '¡Qué rico este café!', '😂'] : n.mode === 'listen' ? ['🎧', '🎵', '¡Temazo! 🔥'] : ['👋', '😄', '✨', '🙌', '¿Alguien al Arcade? 🕹️']), 2.6);
          n.nextChatter = t + 14 + Math.random() * 22;
        }
        if (n.bubble && n.bubble.until < t) n.bubble = null;
      }
      if (p.bubble && p.bubble.until < t) p.bubble = null;
      if (e.bubble && e.bubble.until < t) e.bubble = null;

      setFrame((f) => (f + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enterZone, runEvent]);

  // La celebración se cierra sola
  useEffect(() => {
    if (!celebration) return;
    const id = window.setInterval(() => {
      if (timeRef.current > celebration.until) setCelebration(null);
    }, 500);
    return () => window.clearInterval(id);
  }, [celebration]);

  // ── Cámara ───────────────────────────────────────────────────────────────
  const worldPxW = WORLD_W * scale;
  const worldPxH = WORLD_H * scale;
  const clampCam = (x: number, y: number) => ({
    x: Math.max(0, Math.min(worldPxW - size.w, x)),
    y: Math.max(0, Math.min(worldPxH - size.h, y))
  });
  {
    const target = clampCam(player.current.x * scale - size.w / 2, (player.current.y + SKY_PAD) * scale - size.h / 2);
    if (!cam.current.ready) { cam.current.x = target.x; cam.current.y = target.y; cam.current.ready = true; }
    if (!cam.current.free) {
      cam.current.x += (target.x - cam.current.x) * 0.12;
      cam.current.y += (target.y - cam.current.y) * 0.12;
    }
    const c = clampCam(cam.current.x, cam.current.y);
    cam.current.x = c.x; cam.current.y = c.y;
  }
  const toScreen = (x: number, y: number) => ({ x: x * scale - cam.current.x, y: (y + SKY_PAD) * scale - cam.current.y });

  // Arrastrar con el dedo (o el mouse) mueve la vista; un toque corto sigue siendo «caminar aquí»
  const onWorldPointerDown = (ev: React.PointerEvent) => {
    if (pickerOpen || panel) return;
    drag.current = { id: ev.pointerId, sx: ev.clientX, sy: ev.clientY, cx: cam.current.x, cy: cam.current.y, moved: false };
  };
  const onWorldPointerMove = (ev: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== ev.pointerId) return;
    const dx = ev.clientX - d.sx, dy = ev.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 8) return;
    d.moved = true;
    cam.current.free = true;
    const c = clampCam(d.cx - dx, d.cy - dy);
    cam.current.x = c.x; cam.current.y = c.y;
  };
  const onWorldPointerUp = (ev: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== ev.pointerId) return;
    if (d.moved) suppressClick.current = true;
    drag.current = null;
  };
  /** Después de arrastrar, el clic que dispara el navegador no cuenta como «caminar» ni «abrir». */
  const consumeDragClick = () => {
    if (!suppressClick.current) return false;
    suppressClick.current = false;
    return true;
  };

  const onWorldClick = (ev: React.MouseEvent) => {
    if (consumeDragClick()) return;
    if (pickerOpen || panel) return;
    setSelectedNpc(null);
    const r = containerRef.current!.getBoundingClientRect();
    const wx = (ev.clientX - r.left + cam.current.x) / scale;
    const wy = (ev.clientY - r.top + cam.current.y) / scale - SKY_PAD;
    walkTo(wx, wy);
  };

  const clickZone = (ev: React.MouseEvent, z: Zone) => {
    ev.stopPropagation();
    if (consumeDragClick()) return;
    if (pickerOpen || panel) return;
    setSelectedNpc(null);
    if (dist(z.door, player.current) < DOOR_RADIUS) enterZone(z.id);
    else walkTo(z.door.x, z.door.y, z.id);
  };

  const clickNpc = (ev: React.MouseEvent, n: Npc) => {
    ev.stopPropagation();
    if (consumeDragClick()) return;
    if (pickerOpen || panel) return;
    playTapSound();
    setSelectedNpc(n.id);
    if (dist(n, player.current) > 110) {
      const a = Math.atan2(player.current.y - n.y, player.current.x - n.x);
      walkTo(n.x + Math.cos(a) * 60, n.y + Math.sin(a) * 30);
    }
  };

  const clickEco = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    if (consumeDragClick()) return;
    playTapSound();
    setPanel('eco');
  };

  // ── Datos derivados para pintar ──────────────────────────────────────────
  const t = timeRef.current;
  const p = player.current;
  const outside = npcs.current.filter((n) => !n.inside);
  const workingCount = npcs.current.filter((n) => n.inside && n.status === 'trabajando').length;
  const meetingCount = npcs.current.filter((n) => n.inside && n.status === 'reunion').length;
  const nearZone = !panel && !pickerOpen ? ZONES.find((z) => dist(z.door, p) < DOOR_RADIUS) || null : null;
  const selected = selectedNpc ? outside.find((n) => n.id === selectedNpc) || null : null;
  const myChar = CHARACTERS[avatarIdx ?? pickerChoice];
  const stageGlow = embedUrl ? 0.35 + 0.15 * Math.sin(t * 2.2) : 0;

  type Sprite = { key: string; y: number; node: React.ReactNode };
  const sprites: Sprite[] = [];

  ZONES.forEach((z) => {
    const behind = p.y < z.y && p.y > z.y - z.height * 0.9 && Math.abs(p.x - z.x) < z.width * 0.45;
    const highlighted = nearZone?.id === z.id;
    sprites.push({
      key: `z-${z.id}`,
      y: z.y,
      node: (
        <div
          key={`z-${z.id}`}
          onClick={(ev) => clickZone(ev, z)}
          className="absolute cursor-pointer group"
          style={{ left: z.x - z.width / 2, top: z.y + SKY_PAD - z.height, width: z.width, height: z.height, zIndex: Math.round(z.y), opacity: behind ? 0.55 : 1, transition: 'opacity .25s' }}
        >
          {z.id === 'stage' && stageGlow > 0 && (
            <div
              className="absolute left-1/2 top-[45%] rounded-full pointer-events-none"
              style={{ width: z.width * 1.2, height: z.height * 0.9, transform: 'translate(-50%,-50%)', background: `radial-gradient(closest-side, rgba(29,185,84,${stageGlow}), rgba(61,217,235,${stageGlow * 0.4}) 55%, transparent)`, filter: 'blur(6px)' }}
            />
          )}
          <img
            src={z.img}
            alt={z.name}
            draggable={false}
            className="relative w-full h-full object-contain select-none transition-[filter] duration-200 group-hover:brightness-125"
            style={{ filter: highlighted ? 'brightness(1.18) drop-shadow(0 0 14px rgba(212,255,63,.55))' : 'drop-shadow(0 10px 12px rgba(10,4,24,.55))' }}
          />
          {z.id === 'cafe' && openChallenges.length > 0 && (
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#fbbf24] bg-[#140a2b]/90 px-3 py-1 text-[15px] font-black text-white" style={{ boxShadow: '0 0 16px rgba(251,191,36,.5)' }}>
              🏁 {openChallenges.length} {openChallenges.length === 1 ? 'reto' : 'retos'}
            </div>
          )}
          {z.id === 'estudio' && (
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#d4ff3f] bg-[#140a2b]/90 px-3 py-1 text-[15px] font-black text-white" style={{ boxShadow: '0 0 16px rgba(212,255,63,.45)' }}>
              💻 {workingCount} · 📅 {meetingCount}
            </div>
          )}
        </div>
      )
    });
  });

  PROPS.forEach((pr, i) => {
    sprites.push({
      key: `p-${i}`,
      y: pr.y,
      node: (
        <img
          key={`p-${i}`}
          src={pr.img}
          alt=""
          draggable={false}
          className="absolute pointer-events-none select-none"
          style={{ left: pr.x, top: pr.y + SKY_PAD, height: pr.h, transform: 'translate(-50%,-100%)', zIndex: Math.round(pr.y), filter: 'drop-shadow(0 4px 4px rgba(10,4,24,.5))' }}
        />
      )
    });
  });

  const charNode = (
    key: string, x: number, y: number, c: PlazaCharacter, dir: Dir, moving: boolean, phase: number,
    opts: { listen?: boolean; onClick?: (e: React.MouseEvent) => void; ring?: string; acc?: (typeof COLLECTION)[number] | null } = {}
  ) => {
    const h = CHAR_H;
    const w = t * 11 + phase;
    // Paso suave: rebote corto y poca inclinación (antes 6 px y 3°, se veía como si vibrara)
    const bob = moving ? Math.abs(Math.sin(w * 0.8)) * 2.5 : opts.listen ? Math.abs(Math.sin(t * 4 + phase)) * 3 : Math.sin(t * 2 + phase) * 0.6;
    const tilt = moving ? Math.sin(w * 0.8) * 1.2 : opts.listen ? Math.sin(t * 2.5 + phase) * 2.5 : 0;
    const squash = 1 + Math.sin(t * 2 + phase) * 0.012;
    const s = spriteFor(c, dir);
    return (
      <div
        key={key}
        onClick={opts.onClick}
        className={`absolute ${opts.onClick ? 'cursor-pointer' : 'pointer-events-none'}`}
        style={{ left: x, top: y + SKY_PAD, zIndex: Math.round(y) + 1, transform: 'translate(-50%,-100%)', width: h * 0.62, height: h + 6 }}
      >
        <div className="absolute left-1/2 bottom-0 rounded-[50%]" style={{ width: h * 0.48 * (1 - bob / 60), height: h * 0.1, transform: 'translate(-50%, 40%)', background: 'radial-gradient(closest-side, rgba(10,4,24,.55), transparent)' }} />
        {opts.ring && (
          <div className="absolute left-1/2 bottom-0 rounded-[50%]" style={{ width: h * 0.62, height: h * 0.16, transform: 'translate(-50%, 45%)', border: `2px solid ${opts.ring}`, boxShadow: `0 0 12px ${opts.ring}`, opacity: 0.85 }} />
        )}
        <img
          src={s.img}
          alt=""
          draggable={false}
          className="absolute left-1/2 bottom-0 select-none max-w-none"
          style={{
            height: h,
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) translateY(${-bob}px) rotate(${tilt}deg) scaleX(${s.flip ? -1 : 1}) scaleY(${squash})`,
            filter: 'drop-shadow(0 2px 2px rgba(10,4,24,.45))'
          }}
        />
        {opts.acc && (() => {
          const a = opts.acc;
          if (a.slot === 'aura') {
            return [0, 1, 2].map((k) => {
              const ang = t * 1.6 + k * 2.1;
              return <span key={k} className="absolute pointer-events-none" style={{ left: '50%', bottom: h * 0.45 - bob, fontSize: 15, transform: `translate(calc(-50% + ${Math.cos(ang) * h * 0.38}px), ${Math.sin(ang) * h * 0.18}px)`, filter: 'drop-shadow(0 0 6px rgba(255,255,255,.6))' }}>{a.emoji}</span>;
            });
          }
          const pos = a.slot === 'cabeza' ? { bottom: h * 0.9 - bob, size: 22 } : a.slot === 'cara' ? { bottom: h * 0.68 - bob, size: 17 } : { bottom: h * 0.32 - bob, size: 17 };
          const dx = a.slot === 'mano' ? (s.flip ? -h * 0.24 : h * 0.24) : 0;
          return <span className="absolute pointer-events-none" style={{ left: '50%', bottom: pos.bottom, fontSize: pos.size, transform: `translateX(calc(-50% + ${dx}px)) rotate(${tilt}deg)`, filter: 'drop-shadow(0 2px 2px rgba(10,4,24,.5))' }}>{a.emoji}</span>;
        })()}
      </div>
    );
  };

  outside.forEach((n) => {
    sprites.push({
      key: n.id,
      y: n.y,
      node: charNode(n.id, n.x, n.y, CHARACTERS[n.char], n.dir, n.moving, n.phase, {
        listen: n.mode === 'listen' && !n.moving,
        onClick: (ev) => clickNpc(ev, n),
        ring: selectedNpc === n.id ? '#d4ff3f' : undefined,
        acc: npcAccessory(n.id)
      })
    });
  });

  sprites.push({ key: 'me', y: p.y, node: charNode('me', p.x, p.y, myChar, p.dir, p.moving, 0, { ring: '#3dd9eb', acc: equippedItem }) });

  {
    const e = eco.current;
    const hop = e.moving ? Math.abs(Math.sin(t * 13)) * 5 : 0;
    sprites.push({
      key: 'eco',
      y: e.y,
      node: (
        <div
          key="eco"
          onClick={clickEco}
          className="absolute cursor-pointer"
          style={{ left: e.x, top: e.y + SKY_PAD, zIndex: Math.round(e.y) + 1, transform: 'translate(-50%,-100%)', height: ECO_H + 6, width: ECO_H * 0.7 }}
        >
          <div className="absolute left-1/2 bottom-0 rounded-[50%]" style={{ width: ECO_H * 0.5, height: ECO_H * 0.1, transform: 'translate(-50%, 40%)', background: 'radial-gradient(closest-side, rgba(10,4,24,.5), transparent)' }} />
          <img
            src={ECO_SPRITES[e.dir]}
            alt="ECO"
            draggable={false}
            className="absolute left-1/2 bottom-0 select-none max-w-none"
            style={{ height: ECO_H, transform: `translateX(-50%) translateY(${-hop}px) scaleY(${1 + Math.sin(t * 2.4) * 0.015})`, transformOrigin: '50% 100%', filter: 'drop-shadow(0 2px 2px rgba(10,4,24,.45))' }}
          />
        </div>
      )
    });
  }

  sprites.sort((a, b) => a.y - b.y);

  type Label = { key: string; x: number; y: number; name: string; dot?: string; badge?: string | null; bubble: Bubble | null; me?: boolean; eco?: boolean; h: number };
  const ecoHasNews = chestAvailable(rewards) || earnings.undocumented.length > 0 || decisionsWaiting.length > 0;
  const labels: Label[] = [
    ...outside.map((n) => ({ key: n.id, x: n.x, y: n.y, name: n.first, dot: STATUS_META[n.status].dot, badge: n.mode === 'listen' ? '🎧' : STATUS_META[n.status].badge, bubble: n.bubble, h: CHAR_H })),
    { key: 'me', x: p.x, y: p.y, name: 'Tú', dot: '#3dd9eb', bubble: p.bubble, me: true, h: CHAR_H },
    { key: 'eco', x: eco.current.x, y: eco.current.y, name: ecoHasNews ? 'ECO informa 💬' : 'ECO', bubble: dist(eco.current, p) < ECO_TALK_RADIUS ? eco.current.bubble : null, eco: true, h: ECO_H }
  ];

  const stageZone = ZONES.find((z) => z.id === 'stage')!;
  const stageScreen = toScreen(stageZone.x, stageZone.y - stageZone.height * 0.55);
  const notes = embedUrl ? [0, 1, 2, 3] : [];

  const estudioPeople: EstudioPerson[] = npcs.current
    .filter((n) => n.inside)
    .map((n) => ({
      id: n.id, user: n.user, first: n.first, char: CHARACTERS[n.char], area: areaOf(n.user),
      kind: n.status === 'reunion' ? 'reunion' : 'trabajando', work: n.work ? { ...n.work, taskVisible: canSeeTask(n.work) } : undefined, until: n.until
    }));

  const upcomingBirthdays = useMemo(() => {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return teamUsers
      .filter((u) => u.status !== 'Inactive' && u.birthDate)
      .map((u) => {
        const [, m, d] = u.birthDate!.split('-').map(Number);
        let next = new Date(now.getFullYear(), m - 1, d);
        if (next < base) next = new Date(now.getFullYear() + 1, m - 1, d);
        const days = Math.round((next.getTime() - base.getTime()) / 86400000);
        return { u, next, days };
      })
      .sort((a, b) => a.days - b.days)
      .slice(0, 5);
  }, [teamUsers]);

  const anniversaries = useMemo(() => {
    const mm = String(new Date().getMonth() + 1).padStart(2, '0');
    return teamUsers.filter((u) => u.status !== 'Inactive' && u.anniversaryDate?.slice(5, 7) === mm);
  }, [teamUsers]);

  const monthName = new Date().toLocaleDateString('es-CO', { month: 'long' });

  return (
    <div className="relative w-full h-[calc(100dvh-125px)] lg:h-[calc(100dvh-61px)] min-h-[480px] overflow-hidden bg-[#0a0418] text-white select-none">
      <style>{PLAZA_CSS}</style>

      {/* ── MUNDO ─────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden cursor-crosshair touch-none select-none"
        onClick={onWorldClick}
        onPointerDown={onWorldPointerDown}
        onPointerMove={onWorldPointerMove}
        onPointerUp={onWorldPointerUp}
        onPointerCancel={onWorldPointerUp}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: WORLD_W, height: WORLD_H, transform: `translate(${-cam.current.x}px, ${-cam.current.y}px) scale(${scale})` }}
        >
          <div className="absolute left-0 top-0 w-full" style={{ height: SKY_PAD + 40, background: A.sky, transition: 'background 1s' }}>
            {Array.from({ length: 40 }, (_, i) => (
              <span key={i} className="absolute rounded-full bg-white" style={{ left: `${(i * 61) % 100}%`, top: `${(i * 29) % 80}%`, width: 1 + (i % 3), height: 1 + (i % 3), opacity: (0.3 + 0.5 * Math.abs(Math.sin(t * 0.8 + i))) * A.stars }} />
            ))}
            {ambient === 'dia' && <div className="absolute rounded-full" style={{ right: 120, top: 18, width: 54, height: 54, background: 'radial-gradient(circle, #fff7c2 0%, #ffd55c 60%, rgba(255,213,92,0) 72%)', boxShadow: '0 0 60px 20px rgba(255,220,120,.55)' }} />}
          </div>
          <img src={MAP_IMG} alt="" draggable={false} className="absolute left-0 select-none max-w-none" style={{ top: SKY_PAD, width: MAP_W, height: MAP_H, filter: A.filter, transition: 'filter 1s' }} />

          <div
            className="absolute pointer-events-none mix-blend-screen"
            style={{ left: 1400, top: SKY_PAD, width: 272, height: MAP_H, opacity: 0.35, backgroundImage: 'repeating-linear-gradient(170deg, transparent 0 18px, rgba(125,249,255,.35) 20px, transparent 24px 60px)', backgroundSize: '100% 240px', animation: 'plaza-river 6s linear infinite' }}
          />

          {LIGHTS.map((l, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none mix-blend-screen"
              style={{ left: l.x - l.r, top: l.y + SKY_PAD - l.r, width: l.r * 2, height: l.r * 2, background: 'radial-gradient(closest-side, rgba(255,196,100,.45), rgba(255,140,60,.12) 60%, transparent)', animation: `plaza-flicker ${3 + (i % 4)}s ease-in-out ${i * 0.37}s infinite`, zIndex: 2000, display: A.lights ? undefined : 'none', filter: `opacity(${A.lights})` }}
            />
          ))}

          {ZONES.map((z) => (
            <div key={`door-${z.id}`} className="absolute pointer-events-none" style={{ left: z.door.x, top: z.door.y + SKY_PAD, opacity: nearZone?.id === z.id ? 1 : 0.28, transition: 'opacity .25s', zIndex: 1 }}>
              <div
                className="absolute left-0 top-0 rounded-[50%]"
                style={{ width: 90, height: 30, border: '2px solid rgba(212,255,63,.8)', boxShadow: '0 0 18px rgba(212,255,63,.6), inset 0 0 12px rgba(212,255,63,.4)', animation: 'plaza-pulse 1.6s ease-in-out infinite' }}
              />
            </div>
          ))}

          {/* Edificios, objetos y personas con la luz del momento */}
          <div className="absolute inset-0" style={{ filter: A.filter, transition: 'filter 1s' }}>
            {sprites.map((s) => s.node)}
          </div>
          {/* Tinte de la hora del día */}
          <div className="absolute left-0 w-full pointer-events-none" style={{ top: SKY_PAD, height: MAP_H, background: A.tint, mixBlendMode: A.tintBlend, zIndex: 2500, transition: 'background 1s' }} />

          {Array.from({ length: 26 }, (_, i) => (
            <span
              key={`ff-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: (i * 263) % 1380 + 20, top: ((i * 151) % 700) + 240 + SKY_PAD, width: 4, height: 4,
                background: i % 3 ? '#e9ff8a' : '#7df9ff', boxShadow: `0 0 8px 2px ${i % 3 ? 'rgba(212,255,63,.8)' : 'rgba(61,217,235,.8)'}`,
                animation: `plaza-firefly ${7 + (i % 5)}s ease-in-out ${i * 0.6}s infinite`, display: A.flies ? undefined : 'none', filter: `opacity(${A.flies})`,
                ['--fx' as string]: `${((i * 37) % 60) - 30}px`, ['--fy' as string]: `${((i * 53) % 50) - 35}px`, zIndex: 3000
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none" style={{ background: A.vignette, transition: 'background 1s' }} />

        {notes.map((i) => (
          <span
            key={`n-${i}`}
            className="absolute pointer-events-none text-xl font-black"
            style={{ left: stageScreen.x + (i - 1.5) * 24, top: stageScreen.y, color: i % 2 ? '#1db954' : '#3dd9eb', textShadow: '0 0 10px currentColor', animation: `plaza-note ${2.6 + (i % 3) * 0.5}s ease-out ${i * 0.6}s infinite`, ['--nx' as string]: `${(i % 2 ? 1 : -1) * (10 + i * 6)}px` } as React.CSSProperties}
          >
            {i % 2 ? '♪' : '♫'}
          </span>
        ))}

        {labels.map((l) => {
          const s = toScreen(l.x, l.y);
          const top = s.y - l.h * scale - 6;
          if (s.x < -80 || s.x > size.w + 80 || s.y < -40 || s.y > size.h + 120) return null;
          return (
            <React.Fragment key={`lbl-${l.key}`}>
              <div className="absolute pointer-events-none" style={{ left: s.x, top: s.y + 8, transform: 'translateX(-50%)', zIndex: 5 }}>
                <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[2px] text-[10.5px] font-bold backdrop-blur-sm ${l.me ? 'bg-[#3dd9eb]/90 text-[#0a0418]' : l.eco ? 'bg-[#7c3aed]/90 text-white' : 'bg-[#0a0418]/70 text-white border border-white/10'}`}>
                  {l.dot && !l.me && <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.dot }} />}
                  {l.name}
                  {l.badge && <span className="text-[10px]">{l.badge}</span>}
                </span>
              </div>
              {l.bubble && (
                <div key={l.bubble.text + l.bubble.until} className="absolute plaza-bubble pointer-events-none" style={{ left: s.x, top, zIndex: l.eco ? 7 : 6 }}>
                  <div className={`relative max-w-[230px] w-max rounded-2xl px-3 py-1.5 text-[12px] font-semibold leading-snug shadow-[0_8px_24px_rgba(10,4,24,.45)] ${l.eco ? 'bg-[#f5f0ff] text-[#2e1859] border-2 border-[#8a4dff]' : 'bg-white text-[#1a0f30]'} ${l.bubble.text.length <= 3 ? 'text-[20px] px-2.5 py-1' : ''}`}>
                    {l.bubble.text}
                    <span className={`absolute left-1/2 -bottom-1.5 w-3 h-3 -translate-x-1/2 rotate-45 ${l.eco ? 'bg-[#f5f0ff] border-r-2 border-b-2 border-[#8a4dff]' : 'bg-white'}`} />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {nearZone && (() => {
          const s = toScreen(nearZone.door.x, nearZone.door.y);
          return (
            <button
              type="button"
              onClick={(ev) => { ev.stopPropagation(); enterZone(nearZone.id); }}
              className="absolute plaza-in z-[8] -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-[#d4ff3f] pl-1.5 pr-4 py-1.5 text-[13px] font-black text-[#1a0f30] shadow-[0_0_24px_rgba(212,255,63,.55)] hover:scale-105 transition-transform cursor-pointer"
              style={{ left: s.x, top: s.y + 40 }}
            >
              <kbd className="rounded-full bg-[#1a0f30] text-[#d4ff3f] w-6 h-6 inline-flex items-center justify-center text-[11px]">E</kbd>
              {nearZone.emoji} {nearZone.verb}
            </button>
          );
        })()}

        {selected && (() => {
          const s = toScreen(selected.x, selected.y);
          const meta = STATUS_META[selected.status];
          const left = Math.max(150, Math.min(size.w - 150, s.x));
          const top = Math.max(12, s.y - CHAR_H * scale - 190);
          return (
            <div onClick={(ev) => ev.stopPropagation()} className="absolute plaza-in z-[9] w-[300px] -translate-x-1/2 rounded-3xl border border-white/15 bg-[#140a2b]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,.55)] backdrop-blur-md cursor-default" style={{ left, top }}>
              <button type="button" onClick={() => setSelectedNpc(null)} className="absolute right-3 top-3 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-3.5 h-3.5" /></button>
              <div className="flex items-center gap-3">
                {selected.user.avatarUrl ? (
                  <img src={selected.user.avatarUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border border-white/15" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#501f92] flex items-center justify-center font-black">{selected.user.initials}</div>
                )}
                <div className="min-w-0">
                  <p className="font-black text-[15px] leading-tight truncate">{selected.user.name}</p>
                  <p className="text-[11px] text-white/60 truncate">{selected.user.jobTitle || selected.user.officialRole || ''}{selected.user.city ? ` · ${selected.user.city}` : ''}</p>
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-bold"><span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />{selected.mode === 'listen' ? 'Escuchando la playlist 🎧' : meta.label}</span>
                </div>
              </div>
              {selected.user.hobbies && <p className="mt-3 text-[11px] leading-snug text-white/70 line-clamp-2"><span className="font-bold text-white/90">Le gusta:</span> {selected.user.hobbies}</p>}
              {/* Qué está haciendo y cómo le quedó lo de hoy (tareas reales; título solo si estás en el proyecto, §32.3) */}
              {(() => {
                const sameName = (a: string) => { const x = a.toLowerCase().split(' ').slice(0, 2).join(' '); const y = selected.user.name.toLowerCase().split(' ').slice(0, 2).join(' '); return !!x && (x === y || y.startsWith(x) || x.startsWith(y)); };
                const doneToday = realCelebs.filter((c) => sameName(c.assignee)).slice(0, 2);
                const inProgress = tasks.find((t) => sameName(t.assignee?.name || '') && ['In Progress', 'in_progress', 'Review', 'in_review'].includes(String(t.status)) && !t.isArchived);
                const seeProg = inProgress && (visibleProjects === 'all' || visibleProjects.has(projectKeyOf(inProgress)));
                if (!doneToday.length && !inProgress) return null;
                return (
                  <div className="mt-3 rounded-2xl bg-white/[.06] px-3 py-2 space-y-1.5 text-[11px]">
                    {inProgress && (
                      <p className="text-white/75 leading-snug">
                        <span className="font-bold text-white/90">{['Review', 'in_review'].includes(String(inProgress.status)) ? 'Entregó, en revisión:' : 'En curso:'}</span>{' '}
                        {seeProg ? `«${inProgress.title}» · ` : 'una tarea de '}{inProgress.projectName}
                      </p>
                    )}
                    {doneToday.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-2">
                        <p className="min-w-0 text-white/75 leading-snug"><span className="font-bold text-[#a3e635]">✓ Hoy terminó:</span> {c.what}</p>
                        {c.see && (
                          <button type="button" onClick={() => { setSelectedNpc(null); window.dispatchEvent(new CustomEvent('eco:open-task', { detail: { taskId: c.id, focus: 'entregables' } })); }} className="shrink-0 rounded-lg bg-[#d4ff3f] text-[#1a0f30] hover:brightness-110 px-2 py-1 font-black cursor-pointer">Ver cómo quedó</button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <button type="button" onClick={() => { setKnockFor({ user: selected.user, busy: null }); setSelectedNpc(null); }} title="Una pregunta corta que le llega sin interrumpir" className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 hover:bg-white/20 py-2 text-[11px] font-bold cursor-pointer transition-colors"><Hand className="w-[18px] h-[18px] text-[#d4ff3f]" />Toc toc</button>
                <button type="button" onClick={() => setKudoFor(kudoFor === selected.id ? null : selected.id)} className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-bold cursor-pointer transition-colors ${kudoFor === selected.id ? 'bg-[#fbbf24] text-[#1a0f30]' : 'bg-white/10 hover:bg-white/20'}`}><span className="text-lg leading-none">🏆</span>Reconocer</button>
                <button type="button" onClick={() => { setSelectedNpc(null); onOpenArcade(); }} className="flex flex-col items-center gap-1 rounded-2xl bg-[#d4ff3f] hover:brightness-110 text-[#1a0f30] py-2 text-[11px] font-black cursor-pointer"><Swords className="w-[18px] h-[18px]" />Retar</button>
              </div>
              {kudoFor === selected.id && (
                <div className="mt-2 grid grid-cols-2 gap-1.5 plaza-in">
                  {KUDOS.map((k) => (
                    <button key={k.id} type="button" onClick={() => giveKudo(selected, k.id)} className="rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 hover:bg-[#fbbf24]/25 px-2 py-1.5 text-[11px] font-bold text-white cursor-pointer text-left">{k.emoji} {k.label}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── HUD ───────────────────────────────────────────────────────── */}
      {/* Celular: una sola píldora (ECOINS · racha · misión); al tocarla abre «ECO informa» */}
      <button
        type="button"
        onClick={() => setPanel('eco')}
        className="sm:hidden absolute left-3 top-[58px] z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0418]/75 px-3 py-1.5 text-[11px] font-black backdrop-blur-md shadow-lg cursor-pointer"
        aria-label="Ver ECO informa"
      >
        <span className="text-[#d4ff3f]">🪙 {balance}</span>
        <span className="text-[#fdba74]">🔥 {streak.current}</span>
        <span className="text-white/80">🤝 {Math.round(mission.progress * 100)}%</span>
      </button>
      <div className="hidden sm:block absolute left-3 top-[62px] sm:left-5 sm:top-5 z-20 max-w-[calc(100%-24px)] rounded-2xl border border-white/10 bg-[#0a0418]/70 px-3 py-2 sm:px-3.5 sm:py-2.5 backdrop-blur-md shadow-lg">
        <p className="text-[15px] font-black tracking-tight leading-none">La Plaza</p>
        <p className="hidden sm:flex mt-1.5 text-[11px] text-white/75 flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_6px_#a3e635]" />{outside.length + 1} en la plaza</span>
          <span>💻 {workingCount} en El Estudio</span>
          <span>📅 {meetingCount} en reunión</span>
          {awayCount > 0 && <span className="text-white/50">{awayCount} fuera hoy</span>}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-black">
          <span className="rounded-full bg-[#f97316]/15 border border-[#f97316]/40 px-2 py-0.5 text-[#fdba74]" title="Racha de días cargados: días hábiles seguidos con al menos el 80 % de la jornada registrada. Fines de semana, festivos y ausencias no la rompen.">🔥 {streak.current > 0 ? `${streak.current} ${streak.current === 1 ? 'día' : 'días'}` : 'Sin racha'}</span>
          <span className="rounded-full bg-[#d4ff3f]/10 border border-[#d4ff3f]/40 px-2 py-0.5 text-[#d4ff3f]" title="ECOINS: se ganan con tareas aprobadas (o terminadas con «¿Qué hiciste?» si no tienen revisión) y con los reconocimientos que recibes. Nunca por tiempo conectado.">🪙 {balance} ECOINS</span>
          <span className="hidden sm:inline rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-white/85" title={rank.next ? `Faltan ${rank.next.from - lifetimeOf(rewards)} ECOINS acumulados para ${rank.next.name}` : 'Rango máximo'}>⭐ {rank.name}</span>
          {myTitle && <span className="hidden sm:inline rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/40 px-2 py-0.5 text-[#fbbf24]">🏅 {myTitle}</span>}
        </div>
        {/* Misión del equipo (semanal, por resultados) */}
        <div className="mt-2 w-[190px] sm:w-[240px] max-w-full" title="Meta de todo Uhura esta semana. Solo se ve el avance del equipo, nunca quién aportó. Si se cumple, cada persona gana un cofre extra.">
          <div className="flex items-center justify-between text-[10.5px] font-bold text-white/70">
            <span>{mission.done ? '✅ Misión de la semana cumplida' : '🤝 Misión de la semana'}</span>
            <span className="tabular-nums">{Math.round(mission.progress * 100)}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${mission.progress * 100}%`, background: mission.done ? '#22c55e' : 'linear-gradient(90deg,#f472b6,#d4ff3f)' }} />
          </div>
          <div className="hidden sm:block mt-1 space-y-0.5">
            {mission.goals.map((g) => (
              <p key={g.key} className="text-[10px] text-white/55 tabular-nums">{g.icon} {g.inverse ? `${g.current} ${g.label} (meta: ${g.target})` : `${Math.min(g.current, g.target)}/${g.target} ${g.label}`}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-3 sm:right-5 sm:top-5 z-20 flex items-center gap-1 sm:gap-1.5 rounded-2xl border border-white/10 bg-[#0a0418]/70 p-1 sm:p-1.5 backdrop-blur-md shadow-lg [&>button]:h-8 sm:[&>button]:h-9">
        <button type="button" onClick={() => switchMode('simple')} title="Vista simple: solo texto, para concentrarte" className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
          <AlignLeft className="w-4 h-4" /><span className="hidden lg:inline">Vista simple</span>
        </button>
        <button type="button" onClick={() => setPanel('estudio')} title="Entrar a El Estudio" className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
          <Briefcase className="w-4 h-4" /><span className="hidden md:inline">El Estudio</span>
        </button>
        <button type="button" onClick={() => setPanel('stage')} title="Música y videos del equipo" className={`h-9 px-3 rounded-xl inline-flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${share ? (share.media.kind === 'youtube' ? 'bg-[#ef4444] text-white' : 'bg-[#1db954] text-[#0a0418]') : 'bg-white/10 hover:bg-white/20'}`}>
          <Music className="w-4 h-4" /><span className="hidden sm:inline">Escenario</span>
        </button>
        <button type="button" onClick={() => chestAvailable(rewards) ? setChestOpen(true) : showToast(rewards.lastChest === todayIso() ? 'Ya abriste el cofre de hoy. Mañana hay otro.' : earnings.undocumented.length ? `El cofre de hoy se abre con tu primera contribución: cuenta en una línea qué hiciste en «${earnings.undocumented[0].title}».` : 'El cofre de hoy se abre con tu primera contribución del día: una tarea aprobada o terminada, o un reconocimiento recibido.')} title="Cofre de ECO" className={`relative h-9 w-9 rounded-xl inline-flex items-center justify-center text-lg cursor-pointer ${chestAvailable(rewards) ? 'bg-[#fbbf24]/25 hover:bg-[#fbbf24]/40' : 'bg-white/10 hover:bg-white/20 grayscale opacity-70'}`}>
          🎁
          {chestAvailable(rewards) && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#f43f5e] border-2 border-[#0a0418] animate-pulse" />}
        </button>
        <button type="button" onClick={() => { setPickerChoice(avatarIdx ?? 0); setPickerOpen(true); }} title="Cambiar personaje" className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 inline-flex items-center justify-center cursor-pointer overflow-hidden">
          <img src={myChar.img} alt="" className="h-8 object-contain object-top translate-y-1" />
        </button>
        <button type="button" onClick={cycleAmbient} title={ambientPref === 'auto' ? `Luz automática según la hora (${A.label.toLowerCase()})` : `Luz fija: ${A.label.toLowerCase()} · toca para cambiar`} className="h-9 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer">
          {ambient === 'dia' ? <Sun className="w-4 h-4 text-[#fde047]" /> : ambient === 'atardecer' ? <Sunset className="w-4 h-4 text-[#fb923c]" /> : <Moon className="w-4 h-4 text-[#c4b5fd]" />}
          <span className="hidden xl:inline">{ambientPref === 'auto' ? 'Auto' : A.label}</span>
          {ambientPref === 'auto' && <Clock className="w-3 h-3 text-white/50" />}
        </button>
        <div className="hidden sm:flex items-center rounded-xl bg-white/10">
          <button type="button" onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))} className="h-9 w-8 inline-flex items-center justify-center hover:bg-white/10 rounded-l-xl cursor-pointer" aria-label="Alejar"><Minus className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => setZoom((z) => Math.min(2.25, +(z + 0.25).toFixed(2)))} className="h-9 w-8 inline-flex items-center justify-center hover:bg-white/10 rounded-r-xl cursor-pointer" aria-label="Acercar"><Plus className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Celebración */}
      {celebration && !panel && (
        <div key={celebration.id} className="absolute left-1/2 top-24 sm:top-24 z-30 plaza-drop w-[min(440px,calc(100%-24px))]" style={{ transform: 'translateX(-50%)' }}>
          <div className="relative overflow-hidden rounded-3xl border border-[#d4ff3f]/40 bg-[#140a2b]/95 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,.5),0_0_30px_rgba(212,255,63,.15)] backdrop-blur-md flex items-center gap-3">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="absolute top-0 w-1.5 h-2.5 rounded-sm pointer-events-none" style={{ left: `${8 + i * 9}%`, background: ['#d4ff3f', '#3dd9eb', '#f472b6', '#fbbf24'][i % 4], animation: `plaza-confetti ${1.4 + (i % 3) * 0.3}s ease-in ${i * 0.08}s both` }} />
            ))}
            <span className="text-2xl">🎉</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-black leading-snug"><span className="text-[#d4ff3f]">{celebration.who}</span> {celebration.verb ?? 'terminó'} {celebration.task}</p>
              <p className="text-[11px] text-white/60 truncate">{celebration.project}</p>
            </div>
            <button type="button" onClick={clap} disabled={celebration.clapped} className={`shrink-0 inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-black cursor-pointer transition-transform ${celebration.clapped ? 'bg-white/10 text-white/70' : 'bg-[#d4ff3f] text-[#1a0f30] hover:scale-105'}`}>
              👏 {celebration.claps}
            </button>
          </div>
        </div>
      )}

      {/* Celular: los emojis van detrás de un botón para no tapar la plaza */}
      <button
        type="button"
        onClick={(ev) => { ev.stopPropagation(); setEmotesOpen((v) => !v); }}
        className={`sm:hidden absolute bottom-4 left-3 z-20 h-11 w-11 rounded-full border border-white/10 backdrop-blur-md shadow-lg text-xl cursor-pointer ${emotesOpen ? 'bg-white/25' : 'bg-[#0a0418]/75'}`}
        aria-label="Emojis"
      >
        {emotesOpen ? '✕' : '😊'}
      </button>
      <div className={`${emotesOpen ? 'flex' : 'hidden'} sm:flex absolute bottom-4 left-16 sm:left-1/2 sm:-translate-x-1/2 z-20 flex-col items-center gap-2`}>
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-[#0a0418]/75 p-1 sm:p-1.5 backdrop-blur-md shadow-lg">
          {EMOTES.map((em, i) => (
            <button key={em} type="button" onClick={(ev) => { ev.stopPropagation(); sendEmote(em); setEmotesOpen(false); }} title={`Tecla ${i + 1}`} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xl hover:bg-white/15 hover:-translate-y-0.5 transition-all cursor-pointer">{em}</button>
          ))}
        </div>
        <p className="hidden sm:block text-[11px] text-white/55">Flechas o WASD para caminar · Clic para ir · <kbd className="font-bold text-white/80">E</kbd> para entrar</p>
      </div>

      {knockFor && currentUser && (
        <KnockComposer
          me={currentUser}
          to={knockFor.user}
          busyLabel={knockFor.busy}
          sharedTasks={(() => {
            const m = makePersonMatcher(knockFor.user, teamUsers);
            return tasks
              .filter((t) => isTaskOwner(t, knockFor.user, m) && !t.completed && t.status !== 'Done' && !t.isArchived)
              .filter((t) => visibleProjects === 'all' || visibleProjects.has(projectKeyOf(t)))
              .slice(0, 12);
          })()}
          onClose={() => setKnockFor(null)}
          onSent={(msg) => { setKnockFor(null); showToast(msg); }}
        />
      )}

      {toast && (
        <div className={`absolute ${panel || chestOpen ? 'top-3' : 'bottom-24'} left-1/2 -translate-x-1/2 z-[70] plaza-in rounded-full bg-white text-[#1a0f30] px-4 py-2 text-xs font-bold shadow-xl max-w-[90%] text-center`}>{toast}</div>
      )}

      {chestOpen && (
        <ChestModal
          onOpen={() => {
            const res = openChest(rewardsRef.current);
            setRewards(() => res.next);
            return { item: res.item, duplicate: res.duplicate, coins: res.coins };
          }}
          onEquip={(id) => setRewards((r) => ({ ...r, equipped: id }))}
          onClose={() => setChestOpen(false)}
        />
      )}

      {/* ── VISTA SIMPLE (§32.12) ────────────────────────────────────── */}
      {mode === 'simple' && (() => {
        const working = npcs.current.filter((n) => n.inside && n.status === 'trabajando');
        const inMeeting = npcs.current.filter((n) => n.inside && n.status === 'reunion');
        const available = npcs.current.filter((n) => !n.inside);
        return (
          <div className="absolute inset-0 z-[55] overflow-y-auto bg-[#f8fafc] text-[#0f172a]">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black tracking-tight">La Plaza · vista simple</h2>
                  <p className="text-xs text-[#64748b]">Lo mismo que en el juego, en texto. Sin animaciones ni sonido.</p>
                </div>
                <button type="button" onClick={() => switchMode('juego')} className="inline-flex items-center gap-2 rounded-xl bg-[#2e1859] hover:bg-[#1a0f30] px-3.5 py-2 text-xs font-bold text-white cursor-pointer"><Gamepad className="w-4 h-4 text-[#d4ff4a]" /> Vista de juego</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded-2xl bg-white border border-[#e2e8f0] p-3"><p className="text-[#64748b]">Mis ECOINS</p><p className="text-lg font-black">🪙 {balance}</p></div>
                <div className="rounded-2xl bg-white border border-[#e2e8f0] p-3"><p className="text-[#64748b]">Rango</p><p className="text-lg font-black">⭐ {rank.name}</p></div>
                <div className="rounded-2xl bg-white border border-[#e2e8f0] p-3"><p className="text-[#64748b]">Racha de días cargados</p><p className="text-lg font-black">🔥 {streak.current}</p></div>
                <button type="button" onClick={() => (chestAvailable(rewards) ? setChestOpen(true) : showToast('El cofre de hoy se abre con tu primera contribución del día.'))} className="rounded-2xl bg-white border border-[#e2e8f0] p-3 text-left cursor-pointer hover:border-[#8a4dff]"><p className="text-[#64748b]">Cofre del día</p><p className="text-lg font-black">{chestAvailable(rewards) ? '🎁 Abrir' : rewards.lastChest === todayIso() ? '✅ Abierto' : '🔒 Por ganar'}</p></button>
              </div>
              {earnings.undocumented.length > 0 && (
                <p className="rounded-2xl bg-[#fffbeb] border border-[#fde68a] px-3 py-2 text-xs text-[#92400e]">Tienes {earnings.undocumented.length} {earnings.undocumented.length === 1 ? 'tarea terminada' : 'tareas terminadas'} sin la línea «¿Qué hiciste?». Agrégala en la tarea para que cuenten.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="rounded-2xl bg-white border border-[#e2e8f0] p-4">
                  <h3 className="text-sm font-black">💻 Trabajando · {working.length}</h3>
                  <ul className="mt-2 space-y-1.5 text-xs">
                    {working.map((n) => <li key={n.id} className="flex flex-wrap items-center justify-between gap-1"><span><span className="font-bold">{n.user.name}</span> · {n.work?.verb} · {canSeeTask(n.work) ? `${n.work?.task} · ` : ''}<span className="text-[#64748b]">{n.work?.project}</span></span>{simpleActions(n, 'trabajando')}</li>)}
                    {working.length === 0 && <li className="text-[#64748b]">Nadie con el cronómetro corriendo.</li>}
                  </ul>
                </section>
                <section className="rounded-2xl bg-white border border-[#e2e8f0] p-4">
                  <h3 className="text-sm font-black">📅 En reunión · {inMeeting.length}</h3>
                  <ul className="mt-2 space-y-1.5 text-xs">
                    {inMeeting.map((n) => <li key={n.id} className="flex flex-wrap items-center justify-between gap-1"><span><span className="font-bold">{n.user.name}</span> · hasta las {n.until}</span>{simpleActions(n, `en reunión hasta las ${n.until}`)}</li>)}
                    {inMeeting.length === 0 && <li className="text-[#64748b]">Sin reuniones ahora.</li>}
                  </ul>
                  <h3 className="mt-4 text-sm font-black">🟢 Disponibles · {available.length}</h3>
                  <ul className="mt-1 space-y-1 text-xs text-[#475569]">
                    {available.map((n) => <li key={n.id} className="flex flex-wrap items-center justify-between gap-1"><span className="font-bold text-[#0f172a]">{n.user.name}</span>{simpleActions(n, null)}</li>)}
                    {available.length === 0 && <li>—</li>}
                  </ul>
                  {simpleKudoFor && (() => {
                    const n = npcs.current.find((x) => x.id === simpleKudoFor);
                    if (!n) return null;
                    return (
                      <div className="mt-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] p-2.5">
                        <p className="text-[11px] font-bold text-[#92400e]">Reconocer a {n.first} ({kudosLeftThisWeek(rewards)} de {KUDOS_PER_WEEK} esta semana)</p>
                        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                          {KUDOS.map((k) => <button key={k.id} type="button" onClick={() => { giveKudo(n, k.id); setSimpleKudoFor(null); }} className="rounded-lg bg-white border border-[#fde68a] px-2 py-1 text-[11px] font-bold text-[#0f172a] cursor-pointer">{k.emoji} {k.label}</button>)}
                        </div>
                      </div>
                    );
                  })()}
                </section>
                <section className="rounded-2xl bg-white border border-[#e2e8f0] p-4">
                  <h3 className="text-sm font-black">🤝 Misión de la semana · {Math.round(mission.progress * 100)}%</h3>
                  <ul className="mt-2 space-y-1 text-xs">
                    {mission.goals.map((g) => <li key={g.key}>{g.icon} {g.inverse ? `${g.current} ${g.label} (meta: ${g.target})` : `${Math.min(g.current, g.target)}/${g.target} ${g.label}`}</li>)}
                  </ul>
                </section>
                <section className="rounded-2xl bg-white border border-[#e2e8f0] p-4">
                  <h3 className="text-sm font-black">🎉 Celebraciones de hoy</h3>
                  <ul className="mt-2 space-y-1 text-xs">
                    {todayCelebs.map((c, i) => <li key={i}>{c.text} <span className="text-[#94a3b8]">· {new Date(c.at).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}</span></li>)}
                    {todayCelebs.length === 0 && <li className="text-[#64748b]">Aún no hay celebraciones hoy.</li>}
                  </ul>
                  <h3 className="mt-4 text-sm font-black">🎧 Lista del día · {stageList.length}</h3>
                  <button type="button" onClick={() => { switchMode('juego'); setPanel('stage'); }} className="mt-1 text-xs font-bold text-[#7c3aed] hover:underline cursor-pointer">Ver la lista</button>
                </section>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── EL ESTUDIO ────────────────────────────────────────────────── */}
      {panel === 'estudio' && (
        <EstudioView
          people={estudioPeople}
          // Próximas entregas: solo de los proyectos que la persona puede ver (§32.3)
          tasks={tasks.filter((t) => visibleProjects === 'all' || visibleProjects.has(projectKeyOf(t)))}
          me={myChar}
          myAccessory={equippedItem?.emoji || null}
          decisions={allDecisions
            .filter((d) => d.status === 'en_revision' && (d.author.id === userId || d.reviewers.some((r) => r.id === userId) || visibleProjects === 'all' || visibleProjects.has(d.projectKey)))
            .map((d) => ({ id: d.id, title: d.title, projectName: d.projectName, taskId: d.taskId, hoursLeft: businessHoursLeft(d.closesAt), waitingOnMe: d.reviewers.some((r) => r.id === userId) && !d.responses[userId] }))}
          onClose={() => setPanel(null)}
          onKnock={(per) => setKnockFor({ user: per.user, busy: per.kind === 'reunion' ? `en reunión hasta las ${per.until}` : 'trabajando' })}
          onJoinMeeting={() => showToast('En ECO real, aquí se abre el enlace de Meet de la reunión.')}
        />
      )}

      {/* ── PANELES DE ZONA ───────────────────────────────────────────── */}
      {panel === 'stage' && (
        <StagePanel
          list={stageList}
          me={userId}
          onLike={(id) => setStageList((l) => l.map((x) => (x.id === id ? { ...x, likes: x.likes.includes(userId) ? x.likes.filter((n) => n !== userId) : [...x.likes, userId] } : x)))}
          onRemove={(id) => setStageList((l) => l.filter((x) => x.id !== id))}
          audience={npcs.current.filter((n) => !n.inside).map((n) => CHARACTERS[n.char])}
          draft={playlistDraft}
          error={playlistError}
          onDraft={(v) => { setPlaylistDraft(v); setPlaylistError(null); }}
          onSave={savePlaylist}
          onClose={() => setPanel(null)}
        />
      )}

      {panel && panel !== 'estudio' && panel !== 'stage' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0a0418]/60 backdrop-blur-sm p-4" onClick={() => setPanel(null)}>
          <div onClick={(ev) => ev.stopPropagation()} className="plaza-in relative w-full max-w-md max-h-full overflow-y-auto rounded-[28px] border border-white/15 bg-gradient-to-b from-[#1c0f3a] to-[#120826] p-5 shadow-[0_30px_80px_rgba(0,0,0,.6)]">
            <button type="button" onClick={() => setPanel(null)} className="absolute right-4 top-4 p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-4 h-4" /></button>

            {panel === 'eco' && (
              <>
                <div className="flex items-center gap-3">
                  <img src={ECO_SPRITES.down} alt="ECO" className="w-12 h-12 object-contain" />
                  <div><h3 className="font-black text-lg leading-tight">ECO informa</h3><p className="text-xs text-white/60">Lo tuyo y lo del equipo, hoy</p></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-white/[.06] px-2 py-2.5"><p className="text-[10.5px] text-white/55">ECOINS</p><p className="text-base font-black text-[#d4ff3f]">🪙 {balance}</p></div>
                  <div className="rounded-2xl bg-white/[.06] px-2 py-2.5"><p className="text-[10.5px] text-white/55">Rango</p><p className="text-base font-black text-white">⭐ {rank.name}</p></div>
                  <div className="rounded-2xl bg-white/[.06] px-2 py-2.5"><p className="text-[10.5px] text-white/55">Racha</p><p className="text-base font-black text-[#fdba74]">🔥 {streak.current}</p></div>
                </div>
                {rank.next && <p className="mt-2 text-[11px] text-white/55">Te faltan {rank.next.from - lifetimeOf(rewards)} ECOINS acumulados para {rank.next.name}.</p>}
                <div className="mt-4 space-y-2">
                  {chestAvailable(rewards) ? (
                    <button type="button" onClick={() => { setPanel(null); setChestOpen(true); }} className="w-full flex items-center gap-3 rounded-2xl bg-[#fbbf24]/15 border border-[#fbbf24]/40 px-3 py-2.5 text-left cursor-pointer hover:bg-[#fbbf24]/25">
                      <span className="text-2xl">🎁</span><span className="text-sm font-bold text-white">Tu cofre está listo. Ábrelo.</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl bg-white/[.05] px-3 py-2.5">
                      <span className="text-2xl">{rewards.lastChest === todayIso() ? '✅' : '🔒'}</span>
                      <span className="text-xs text-white/75">{rewards.lastChest === todayIso() ? 'Ya abriste el cofre de hoy.' : 'Tu cofre de hoy se abre con tu primera contribución: una tarea aprobada o terminada, o un reconocimiento recibido.'}</span>
                    </div>
                  )}
                  {decisionsWaiting.length > 0 && (
                    <div className="rounded-2xl bg-[#7c3aed]/20 border border-[#c4b5fd]/30 px-3 py-2.5">
                      <p className="text-xs font-bold text-white">⚖️ Decisiones que te esperan ({decisionsWaiting.length})</p>
                      {decisionsWaiting.slice(0, 3).map((d) => (
                        <button key={d.id} type="button" onClick={() => { setPanel(null); openTaskDecisions(d.taskId); }} className="mt-1 block w-full text-left text-[11px] text-white/80 hover:text-white cursor-pointer truncate">· {d.title} <span className="text-white/45">· cierra en {businessHoursLeft(d.closesAt)} h</span></button>
                      ))}
                      <p className="mt-1 text-[10.5px] text-white/45">Si no respondes antes del cierre, cuenta como acuerdo.</p>
                    </div>
                  )}
                  {earnings.undocumented.length > 0 && (
                    <div className="rounded-2xl bg-white/[.05] px-3 py-2.5">
                      <p className="text-xs font-bold text-white">📝 Falta «¿Qué hiciste?» ({earnings.undocumented.length})</p>
                      <ul className="mt-1 space-y-0.5">
                        {earnings.undocumented.slice(0, 3).map((t) => <li key={t.id} className="text-[11px] text-white/65 truncate">· {t.title}</li>)}
                      </ul>
                      <p className="mt-1 text-[10.5px] text-white/45">Son tareas sin revisión: cuenta en una línea qué hiciste para que cuenten.</p>
                    </div>
                  )}
                  {expeditions.length > 0 && (
                    <div className="rounded-2xl bg-white/[.05] px-3 py-2.5">
                      <p className="text-xs font-bold text-white">🗺️ Tus proyectos</p>
                      {expeditions.map((e) => (
                        <div key={e.key} className="mt-1.5">
                          <div className="flex items-center justify-between text-[11px]"><span className="font-semibold text-white/85 truncate">{e.name}</span><span className="shrink-0 text-white/50">Hitos {e.reached}/{e.total}</span></div>
                          <div className="mt-0.5 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[#3dd9eb] to-[#d4ff3f]" style={{ width: `${e.progress * 100}%` }} /></div>
                          <p className="text-[10.5px] text-white/45">{e.phaseName} · {Math.round(e.progress * 100)}% terminado. El cofre del hito se abre cuando el cliente aprueba.</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <KnocksInbox me={currentUser} timerRunning={timerRunning} variant="dark" />
                  <PassportCard me={currentUser} users={teamUsers} tasks={tasks} timeLogs={timeLogs} absenceEvents={absenceEvents} targetDayHours={targetDayHours} variant="dark" />
                  {isDirection && <PassportTeamSummary users={teamUsers} tasks={tasks} timeLogs={timeLogs} absenceEvents={absenceEvents} targetDayHours={targetDayHours} />}
                  {(openChallenges.length > 0 || ideas.capsules.length > 0) && (
                    <button type="button" onClick={() => setPanel('cafe')} className="w-full text-left rounded-2xl bg-[#fbbf24]/10 border border-[#fbbf24]/30 px-3 py-2.5 hover:bg-[#fbbf24]/20 cursor-pointer">
                      <p className="text-xs font-bold text-white">☕ Café de ideas</p>
                      {openChallenges.slice(0, 2).map((c) => <p key={c.id} className="text-[11px] text-white/70 truncate">🏁 {c.title} · {c.entries.length} {c.entries.length === 1 ? 'aporte' : 'aportes'}</p>)}
                      {ideas.capsules[0] && <p className="text-[11px] text-white/70 truncate">💡 {ideas.capsules[0].author.name.split(' ')[0]} aprendió: {ideas.capsules[0].title}</p>}
                      <p className="mt-0.5 text-[10.5px] font-bold text-[#fcd34d]">Ir al Café →</p>
                    </button>
                  )}
                  {myPendingMentorships.length > 0 && (
                    <div className="rounded-2xl bg-[#14b8a6]/15 border border-[#5eead4]/30 px-3 py-2.5">
                      <p className="text-xs font-bold text-white">🎓 Confirma lo que aprendiste</p>
                      {myPendingMentorships.map((m) => (
                        <div key={m.id} className="mt-1 flex items-center justify-between gap-2 text-[11px] text-white/80"><span className="truncate">{m.mentor.name.split(' ')[0]} te enseñó: {m.topic}</span><button type="button" onClick={() => { confirmMentorship(m.id); showToast(`Confirmado. ${m.mentor.name.split(' ')[0]} recibe 15 ECOINS.`); }} className="shrink-0 rounded-lg bg-[#14b8a6] px-2 py-0.5 font-bold text-[#0a0418] cursor-pointer">Confirmar</button></div>
                      ))}
                    </div>
                  )}
                  <div className="rounded-2xl bg-white/[.05] px-3 py-2.5">
                    {mentorForm.open ? (
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-white">🎓 Registrar una mentoría</p>
                        <select className="w-full rounded-lg px-2 py-1 text-xs" style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }} value={mentorForm.learner} onChange={(e) => setMentorForm((f) => ({ ...f, learner: e.target.value }))}>
                          <option value="" style={{ color: '#000' }}>¿A quién le enseñaste?</option>
                          {teamUsers.filter((u) => u.status !== 'Inactive' && u.id !== userId).map((u) => <option key={u.id} value={u.id} style={{ color: '#000' }}>{u.name}</option>)}
                        </select>
                        <input className="w-full rounded-lg px-2 py-1 text-xs" style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }} placeholder="¿Qué le enseñaste?" value={mentorForm.topic} onChange={(e) => setMentorForm((f) => ({ ...f, topic: e.target.value }))} />
                        <div className="flex justify-end gap-1.5 text-[11px] font-bold">
                          <button type="button" onClick={() => setMentorForm({ open: false, learner: '', topic: '' })} className="px-2 py-1 text-white/60 cursor-pointer">Cancelar</button>
                          <button type="button" onClick={() => { const l = teamUsers.find((u) => u.id === mentorForm.learner); if (!l || !mentorForm.topic.trim() || !currentUser) return; registerMentorship({ id: currentUser.id, name: currentUser.name }, { id: l.id, name: l.name }, mentorForm.topic.trim()); setMentorForm({ open: false, learner: '', topic: '' }); showToast(`Listo. Cuando ${l.name.split(' ')[0]} lo confirme, recibes 15 ECOINS.`); }} className="rounded-lg bg-[#14b8a6] px-2.5 py-1 text-[#0a0418] cursor-pointer">Registrar</button>
                        </div>
                        <p className="text-[10.5px] text-white/45">Cuenta cuando quien aprendió lo confirma. Máximo {MENTORSHIPS_PER_WEEK} por semana ({mentorshipsThisWeek(userId)} esta semana).</p>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setMentorForm((f) => ({ ...f, open: true }))} className="text-xs font-bold text-[#5eead4] cursor-pointer">🎓 Le enseñé algo a alguien</button>
                    )}
                  </div>
                  <div className="rounded-2xl bg-white/[.05] px-3 py-2.5">
                    <p className="text-xs font-bold text-white">🤝 Misión de la semana · {Math.round(mission.progress * 100)}%</p>
                    {mission.goals.map((g) => <p key={g.key} className="text-[11px] text-white/65">{g.icon} {g.inverse ? `${g.current} ${g.label} (meta: ${g.target})` : `${Math.min(g.current, g.target)}/${g.target} ${g.label}`}</p>)}
                  </div>
                  <div className="rounded-2xl bg-white/[.05] px-3 py-2.5">
                    <p className="text-xs font-bold text-white">🎉 Hoy en La Plaza</p>
                    {todayCelebs.length === 0 ? <p className="text-[11px] text-white/55">Aún no hay celebraciones. Te aviso cuando alguien termine algo.</p> : todayCelebs.slice(0, 4).map((c, i) => <p key={i} className="text-[11px] text-white/65">· {c.text}</p>)}
                  </div>
                </div>
              </>
            )}

            {panel === 'cafe' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 flex items-center justify-center"><Coffee className="w-5 h-5 text-[#fcd34d]" /></div>
                  <div><h3 className="font-black text-lg leading-tight">Café de ideas</h3><p className="text-xs text-white/60">Retos y lo que aprendimos. Te sumas cuando quieras.</p></div>
                </div>
                <div className="mt-4">
                  {currentUser && (
                    <IdeasBoard
                      me={currentUser}
                      projectNames={[...new Set(tasks.filter((t) => visibleProjects === 'all' || visibleProjects.has(projectKeyOf(t))).map((t) => t.projectName).filter(Boolean) as string[])]}
                      onToast={showToast}
                    />
                  )}
                </div>
              </>
            )}

            {panel === 'wall' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#d946ef]/20 border border-[#d946ef]/40 flex items-center justify-center"><PartyPopper className="w-5 h-5 text-[#f0abfc]" /></div>
                  <div><h3 className="font-black text-lg leading-tight">Muro del equipo</h3><p className="text-xs text-white/60">Lo que celebramos en {monthName}</p></div>
                </div>
                {/* Muro de diplomas (§32.20): cursos y especializaciones del mes */}
                {(() => {
                  const month = new Date().toISOString().slice(0, 7);
                  const diplomas = ideas.capsules.filter((c) => (c.kind === 'curso' || c.kind === 'especializacion') && c.at.slice(0, 7) === month);
                  return (
                    <>
                      <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-white/50">🎓 Diplomas de {monthName}</p>
                      <div className="mt-2 space-y-1.5">
                        {diplomas.length === 0 && <p className="text-xs text-white/55">Aún nadie ha subido un curso este mes. Súbelo en el Café de ideas → «Aprendí esto».</p>}
                        {diplomas.map((c) => (
                          <div key={c.id} className="flex items-center justify-between gap-2 rounded-2xl bg-white/5 border border-white/5 px-3 py-2">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{c.kind === 'curso' ? '🎓' : '🏅'} {c.title}</p>
                              <p className="text-[10.5px] text-white/55 truncate">{c.author.name.split(' ')[0]} · {c.platform} · {c.hours} h{c.kind === 'especializacion' && !c.validatedAt ? ' · por validar' : ''}</p>
                            </div>
                            {c.certificateUrl && <a href={c.certificateUrl} target="_blank" rel="noreferrer" className="shrink-0 text-[11px] font-bold text-[#d4ff3f] underline">Diploma</a>}
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
                <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5"><Cake className="w-3.5 h-3.5" /> Próximos cumpleaños</p>
                <div className="mt-2 space-y-1.5">
                  {upcomingBirthdays.map(({ u, next, days }) => (
                    <div key={u.id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 px-3 py-2">
                      <span className="text-xs font-bold">{u.name}</span>
                      <span className={`text-[11px] font-bold ${days === 0 ? 'text-[#f0abfc]' : 'text-white/60'}`}>{days === 0 ? '¡Hoy! 🎂' : `${next.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · en ${days} d`}</span>
                    </div>
                  ))}
                </div>
                {anniversaries.length > 0 && (
                  <>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Aniversarios del mes</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {anniversaries.map((u) => <span key={u.id} className="rounded-full bg-[#7c3aed]/30 border border-[#a78bfa]/30 px-3 py-1 text-xs font-bold">🎉 {u.name.split(' ')[0]}</span>)}
                    </div>
                  </>
                )}
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-white/50">🏆 Reconocimientos que recibiste</p>
                <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {rewards.kudos.length === 0 && <p className="text-xs text-white/50">Aún no hay. Reconocer a otros es la mejor forma de empezar.</p>}
                  {rewards.kudos.slice(0, 6).map((k, i) => {
                    const meta = KUDOS.find((x) => x.id === k.kind)!;
                    return <div key={i} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/5 px-3 py-2 text-xs"><span><span className="font-bold">{k.from}</span> · {meta.emoji} {meta.label}</span><span className="text-white/40">{new Date(k.at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span></div>;
                  })}
                </div>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-white/50">🎁 Recompensas</p>
                <div className="mt-2 space-y-1.5">
                  {contributions.rewards.length === 0 && <p className="text-xs text-white/50">Aún no hay. Las da Dirección: medio día por proyecto entregado, tarde libre por la misión del mes y día libre por el reconocimiento del mes.</p>}
                  {contributions.rewards.slice(0, 5).map((r) => {
                    const mine = r.recipients.find((p) => p.id === userId);
                    return (
                      <div key={r.id} className="rounded-2xl bg-white/5 border border-white/5 px-3 py-2 text-xs">
                        <p className="font-bold text-white">{KIND_LABEL[r.kind]} · {OCCASION_LABEL[r.occasion]}{r.projectName ? ` · ${r.projectName}` : ''}</p>
                        <p className="text-[10.5px] text-white/55">{r.recipients.map((p) => p.name.split(' ')[0]).join(', ')}</p>
                        {mine && mine.status === 'pendiente' && <button type="button" onClick={() => { markRewardTaken(r.id, userId); showToast('Registrado. Se descuenta de tu capacidad como ausencia «Día libre ganado».'); }} className="mt-1 rounded-lg bg-[#d4ff3f] px-2 py-0.5 text-[11px] font-black text-[#1a0f30] cursor-pointer">Tomar mi {KIND_LABEL[r.kind].toLowerCase()}</button>}
                        {mine && mine.status === 'tomado' && <p className="mt-1 text-[10.5px] text-[#86efac]">Tomado el {mine.takenOn}</p>}
                      </div>
                    );
                  })}
                </div>
                {isDirection && (rewardForm.open ? (
                  <div className="mt-2 rounded-2xl border border-white/10 p-3 space-y-1.5 text-xs">
                    <p className="font-bold text-white">Registrar recompensa (Dirección)</p>
                    <select className="w-full rounded-lg px-2 py-1" style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }} value={rewardForm.occasion} onChange={(e) => { const occ = e.target.value as RewardOccasion; setRewardForm((f) => ({ ...f, occasion: occ, kind: occ === 'project_delivered' ? 'medio_dia' : occ === 'monthly_mission' ? 'tarde_libre' : 'dia_libre', recipients: occ === 'monthly_mission' ? teamUsers.filter((u) => u.status !== 'Inactive').map((u) => u.id) : [] })); }}>
                      {(Object.keys(OCCASION_LABEL) as RewardOccasion[]).map((k) => <option key={k} value={k} style={{ color: '#000' }}>{OCCASION_LABEL[k]}</option>)}
                    </select>
                    {rewardForm.occasion === 'project_delivered' && (
                      <select className="w-full rounded-lg px-2 py-1" style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }} value={rewardForm.project} onChange={(e) => {
                        const name = e.target.value;
                        const team = teamUsers.filter((u) => tasks.some((t) => (t.projectName || t.board) === name && isTaskOwner(t, u, makePersonMatcher(u, teamUsers)))).map((u) => u.id);
                        setRewardForm((f) => ({ ...f, project: name, recipients: team }));
                      }}>
                        <option value="" style={{ color: '#000' }}>Proyecto entregado</option>
                        {[...new Set(tasks.map((t) => t.projectName || t.board).filter(Boolean))].map((n) => <option key={n} value={n} style={{ color: '#000' }}>{n}</option>)}
                      </select>
                    )}
                    <select className="w-full rounded-lg px-2 py-1" style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }} value={rewardForm.kind} onChange={(e) => setRewardForm((f) => ({ ...f, kind: e.target.value as RewardKind }))}>
                      {(Object.keys(KIND_LABEL) as RewardKind[]).map((k) => <option key={k} value={k} style={{ color: '#000' }}>{KIND_LABEL[k]}</option>)}
                    </select>
                    <div className="max-h-28 overflow-y-auto rounded-lg bg-white/5 p-1.5 grid grid-cols-2 gap-1">
                      {teamUsers.filter((u) => u.status !== 'Inactive').map((u) => (
                        <label key={u.id} className="flex items-center gap-1 text-[11px] text-white/80 cursor-pointer"><input type="checkbox" checked={rewardForm.recipients.includes(u.id)} onChange={(e) => setRewardForm((f) => ({ ...f, recipients: e.target.checked ? [...f.recipients, u.id] : f.recipients.filter((x) => x !== u.id) }))} />{u.name.split(' ').slice(0, 2).join(' ')}</label>
                      ))}
                    </div>
                    <p className="text-[10.5px] text-white/45">{rewardForm.occasion === 'project_delivered' ? 'Se reparte igual a todo el equipo del proyecto.' : rewardForm.occasion === 'monthly_mission' ? 'Para todo Uhura.' : 'Elige de 1 a 3 personas con la evidencia de ECO: reconocimientos, desbloqueos y mentorías.'}</p>
                    <div className="flex justify-end gap-1.5 font-bold">
                      <button type="button" onClick={() => setRewardForm((f) => ({ ...f, open: false }))} className="px-2 py-1 text-white/60 cursor-pointer">Cancelar</button>
                      <button type="button" onClick={() => {
                        if (!rewardForm.recipients.length || (rewardForm.occasion === 'project_delivered' && !rewardForm.project)) { showToast('Elige el proyecto y quiénes la reciben.'); return; }
                        if (rewardForm.occasion === 'monthly_recognition' && rewardForm.recipients.length > 3) { showToast('El reconocimiento del mes es para 1 a 3 personas.'); return; }
                        registerReward({ occasion: rewardForm.occasion, kind: rewardForm.kind, projectName: rewardForm.project || undefined, note: rewardForm.note, decidedBy: currentUser?.name || 'Dirección', recipients: teamUsers.filter((u) => rewardForm.recipients.includes(u.id)).map((u) => ({ id: u.id, name: u.name, status: 'pendiente' as const })) });
                        setRewardForm((f) => ({ ...f, open: false, recipients: [], project: '' }));
                        setPanel(null);
                      }} className="rounded-lg bg-[#d4ff3f] px-2.5 py-1 text-[#1a0f30] cursor-pointer">Registrar y anunciar</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setRewardForm((f) => ({ ...f, open: true }))} className="mt-2 text-xs font-bold text-[#d4ff3f] cursor-pointer">+ Registrar recompensa</button>
                ))}
                <button type="button" onClick={() => { setPanel(null); onOpenTeam(); }} className="mt-5 w-full rounded-2xl bg-white/10 hover:bg-white/20 py-2.5 text-xs font-black inline-flex items-center justify-center gap-2 cursor-pointer"><Users className="w-4 h-4" /> Ver las fichas del equipo</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── ELIGE TU PERSONAJE ────────────────────────────────────────── */}
      {pickerOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0418]/75 backdrop-blur-md p-4">
          <div className="plaza-in w-full max-w-3xl max-h-full overflow-y-auto rounded-[32px] border border-white/15 bg-gradient-to-b from-[#1f1040] to-[#120826] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,.65)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#d4ff3f]">La Plaza</p>
                <h3 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">Elige tu personaje</h3>
                <p className="mt-1 text-sm text-white/60">Así te verá el equipo. Puedes cambiarlo cuando quieras.</p>
              </div>
              {avatarIdx !== null && (
                <button type="button" onClick={() => setPickerOpen(false)} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-5 h-5" /></button>
              )}
            </div>
            <div className="mt-6 grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
              {CHARACTERS.map((c, i) => {
                const on = pickerChoice === i;
                // El elegido gira para mostrar sus vistas
                const views: { img: string; flip: boolean }[] = [{ img: c.img, flip: false }];
                if (c.side) views.push({ img: c.side, flip: false });
                if (c.up) views.push({ img: c.up, flip: false });
                if (c.side) views.push({ img: c.side, flip: true });
                // Gira despacio (una vista cada ~1,2 s); índice siempre válido aunque el reloj arranque raro
                const view = on ? views[((Math.floor(Math.max(0, t) / 1.2) % views.length) + views.length) % views.length] || views[0] : views[0];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { playTapSound(); setPickerChoice(i); }}
                    className={`group relative flex flex-col items-center rounded-3xl pt-3 pb-2 transition-all cursor-pointer ${on ? 'bg-[#d4ff3f]/15 ring-2 ring-[#d4ff3f] shadow-[0_0_30px_rgba(212,255,63,.25)]' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    <img
                      src={view.img}
                      alt={c.name}
                      className={`h-28 sm:h-36 object-contain ${on ? '' : 'transition-transform duration-300 group-hover:-translate-y-1'}`}
                      style={on ? { transform: `translateY(${-Math.abs(Math.sin(t * 2.5)) * 2}px) scaleX(${view.flip ? -1 : 1})` } : undefined}
                    />
                    <span className={`mt-1 text-[11px] font-bold ${on ? 'text-[#d4ff3f]' : 'text-white/60'}`}>{c.name}</span>
                  </button>
                );
              })}
            </div>
            {avatarIdx !== null && (
              <div className="mt-6 rounded-3xl bg-white/[.04] border border-white/10 p-4">
                <CollectionPanel rewards={rewards} title={myTitle} onEquip={(id) => setRewards((r) => ({ ...r, equipped: id }))} />
              </div>
            )}
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-xs text-white/50 hidden sm:block">ECO te acompaña en La Plaza 🦫</p>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setAvatarIdx(pickerChoice);
                  savePref(avatarKey, String(pickerChoice));
                  setPickerOpen(false);
                  say(player.current, '¡Hola, equipo! 👋', 3);
                }}
                className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4ff3f] to-[#3dd9eb] px-6 py-3 text-sm font-black text-[#1a0f30] hover:brightness-110 cursor-pointer shadow-[0_0_24px_rgba(212,255,63,.35)]"
              >
                <Shirt className="w-4 h-4" /> Entrar a La Plaza
              </button>
            </div>
          </div>
        </div>
      )}

      <button type="button" onClick={onOpenArcade} className="sm:hidden absolute right-3 bottom-24 z-20 h-12 w-12 rounded-2xl bg-[#d4ff3f] text-[#1a0f30] inline-flex items-center justify-center shadow-lg cursor-pointer" aria-label="Arcade"><Gamepad2 className="w-5 h-5" /></button>
    </div>
  );
};
