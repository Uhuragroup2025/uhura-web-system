/**
 * ============================================================================
 * LA PLAZA · EL LUGAR DEL EQUIPO (ECO BY UHURA) — PROTOTIPO EXPERIMENTAL
 * ============================================================================
 * Un mapa 2D donde cada persona camina con su personaje, ve quién está,
 * saluda, invita a un café, pone música y entra al Arcade.
 *
 * Solo del prototipo:
 * - El resto del equipo está simulado (se mueve solo). En producción, la
 *   presencia y los saludos llegarían en tiempo real desde el backend.
 * - Los estados (en foco, en reunión, fuera hoy) se derivan aquí de forma
 *   determinística; en producción vienen del cronómetro, Google Calendar y
 *   las ausencias de ECO.
 * - El personaje elegido se guarda en localStorage.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UserItem, TeamAbsenceEvent } from '../../types';
import {
  MAP_IMG, MAP_W, MAP_H, SKY_PAD, WORLD_W, WORLD_H, CHARACTERS, ECO_SPRITES, ZONES, Zone, ZoneId,
  DOOR_RADIUS, PROPS, WAYPOINTS, BENCHES, CAFE_SPOTS, STAGE_SPOTS, LIGHTS, isWalkable, findPath
} from './plazaWorld';
import { plazaRadio } from './plazaRadio';
import { playTapSound } from '../coloniaAudio';
import {
  Users, Pause, Play, Shirt, X, Plus, Minus, Gamepad2, Volume2, Coffee, Swords, Cake, PartyPopper,
  Headphones, CalendarClock, LayoutGrid, Music
} from 'lucide-react';

interface LaPlazaViewProps {
  currentUser?: UserItem;
  teamUsers?: UserItem[];
  absenceEvents?: TeamAbsenceEvent[];
  onOpenArcade: () => void;
  onOpenTeam: () => void;
}

type Status = 'disponible' | 'foco' | 'reunion' | 'cumple';
type Mode = 'wander' | 'sit' | 'idle' | 'cafe' | 'dance';
type Facing = 'left' | 'right';
type Dir = 'down' | 'up' | 'left' | 'right';

interface Bubble { text: string; until: number }

interface Npc {
  id: string;
  user: UserItem;
  first: string;
  char: number;
  status: Status;
  mode: Mode;
  x: number;
  y: number;
  tx: number | null;
  ty: number | null;
  waitUntil: number;
  facing: Facing;
  moving: boolean;
  bubble: Bubble | null;
  nextChatter: number;
  phase: number;
}

interface Mover { x: number; y: number; tx: number | null; ty: number | null; moving: boolean; path?: { x: number; y: number }[] }

/** Fija un destino calculando el camino alrededor de los obstáculos. */
const goTo = (m: Mover, x: number, y: number) => {
  const path = findPath(m.x, m.y, x, y);
  const first = path.shift()!;
  m.tx = first.x; m.ty = first.y; m.path = path;
};

const CHAR_H = 88;
const ECO_H = 50;
const PLAYER_SPEED = 230;
const NPC_SPEED = 85;
const ECO_SPEED = 200;
const EMOTES = ['👋', '❤️', '😂', '🎉', '☕', '🔥'];

const STATUS_META: Record<Status, { label: string; dot: string; badge: string | null }> = {
  disponible: { label: 'Disponible', dot: '#a3e635', badge: null },
  foco: { label: 'En foco', dot: '#f59e0b', badge: '🎧' },
  reunion: { label: 'En reunión', dot: '#f43f5e', badge: '📅' },
  cumple: { label: '¡Cumpleaños hoy!', dot: '#e879f9', badge: '🎂' }
};

const ECO_LINES = [
  'Las bancas son para quien está en foco. Si ves 🎧, mejor un saludo corto.',
  'En el Escenario puedes poner música. ¡Quien esté libre se acerca a bailar!',
  'En el Arcade hay retos de 15 segundos. ¿Le ganas a alguien hoy?',
  'Invita a alguien a un café virtual: haz clic en su personaje.',
  'El Muro tiene los cumpleaños y aniversarios del mes. 🎉',
  'Prueba los emojis de abajo, o las teclas 1 a 6.'
];

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
    // Rodear el obstáculo: probar ángulos cada vez más abiertos hacia el destino
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

const loadAvatar = (userId: string): number | null => {
  try {
    const v = localStorage.getItem(`eco_plaza_avatar_${userId}`);
    return v === null ? null : Number(v);
  } catch { return null; }
};
const saveAvatar = (userId: string, idx: number) => {
  try { localStorage.setItem(`eco_plaza_avatar_${userId}`, String(idx)); } catch { /* solo prototipo */ }
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
.plaza-bubble { animation: plaza-pop .28s cubic-bezier(.2,1.4,.4,1) both }
.plaza-in { animation: plaza-in .22s ease-out both }
`;

export const LaPlazaView: React.FC<LaPlazaViewProps> = ({
  currentUser,
  teamUsers = [],
  absenceEvents = [],
  onOpenArcade,
  onOpenTeam
}) => {
  const userId = currentUser?.id || 'anon';
  const myFirst = (currentUser?.name || 'Tú').split(' ')[0];

  // ── Personaje ────────────────────────────────────────────────────────────
  const [avatarIdx, setAvatarIdx] = useState<number | null>(() => loadAvatar(userId));
  const [pickerOpen, setPickerOpen] = useState<boolean>(() => loadAvatar(userId) === null);
  const [pickerChoice, setPickerChoice] = useState<number>(() => loadAvatar(userId) ?? 0);

  // ── Equipo presente (simulado, determinístico por día) ───────────────────
  const today = todayIso();
  const { npcSeed, awayCount } = useMemo(() => {
    const md = today.slice(5);
    const absentIds = new Set(
      absenceEvents
        .filter((a) => a.status !== 'cancelled' && a.startDate <= today && a.endDate >= today)
        .map((a) => a.userId)
    );
    const pool = teamUsers.filter((u) => u.status !== 'Inactive' && u.id !== userId);
    const present: { user: UserItem; status: Status }[] = [];
    let away = 0;
    pool.forEach((u) => {
      if (absentIds.has(u.id) || u.vacationStatus?.onVacation) { away++; return; }
      const r = seeded(hashStr(u.id + today))();
      if (r < 0.14) { away++; return; } // desconectado hoy (simulado)
      const status: Status = u.birthDate?.slice(5) === md ? 'cumple' : r < 0.32 ? 'foco' : r < 0.44 ? 'reunion' : 'disponible';
      present.push({ user: u, status });
    });
    return { npcSeed: present.slice(0, 12), awayCount: away + Math.max(0, present.length - 12) };
  }, [teamUsers, absenceEvents, userId, today]);

  // ── Estado del mundo (mutable, se pinta por frame) ───────────────────────
  const player = useRef<Mover & { facing: Facing; bubble: Bubble | null; arriveZone: ZoneId | null }>({
    x: session.spot?.x ?? 745, y: session.spot?.y ?? 548, tx: null, ty: null, moving: false, facing: 'right', bubble: null, arriveZone: null
  });
  const eco = useRef<Mover & { dir: Dir; bubble: Bubble | null; nextLine: number; lineIdx: number }>({
    x: (session.spot?.x ?? 745) + 60, y: (session.spot?.y ?? 548) + 12, tx: null, ty: null, moving: false, dir: 'down', bubble: null, nextLine: 0, lineIdx: 0
  });
  const npcs = useRef<Npc[]>([]);
  const keys = useRef<Set<string>>(new Set());
  const cam = useRef({ x: 0, y: 0, ready: false });
  const timeRef = useRef(0);

  useEffect(() => {
    const benchFree = [...BENCHES];
    npcs.current = npcSeed.map(({ user, status }, i) => {
      const rnd = seeded(hashStr(user.id));
      let pos = WAYPOINTS[(i * 5 + 3) % WAYPOINTS.length];
      let mode: Mode = 'wander';
      if (status === 'foco' && benchFree.length) { pos = benchFree.shift()!; mode = 'sit'; }
      else if (status === 'foco' || status === 'reunion') mode = 'idle';
      const jitter = { x: pos.x + (rnd() - 0.5) * 30, y: pos.y + (rnd() - 0.5) * 16 };
      const p = mode === 'sit' ? pos : nearestWalkable(jitter.x, jitter.y);
      return {
        id: user.id, user, first: shortName(user, npcSeed.map((x) => x.user)), char: hashStr(user.id) % CHARACTERS.length,
        status, mode, x: p.x, y: p.y, tx: null, ty: null, waitUntil: rnd() * 4, facing: rnd() < 0.5 ? 'left' : 'right',
        moving: false, bubble: null, nextChatter: 6 + rnd() * 20, phase: rnd() * 10
      };
    });
  }, [npcSeed]);

  // ── UI ───────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 640 });
  const [zoom, setZoom] = useState(1.25);
  const [, setFrame] = useState(0);
  const [panel, setPanel] = useState<Exclude<ZoneId, 'arcade'> | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<string | null>(null);
  const [radioOn, setRadioOn] = useState(plazaRadio.playing);
  const [volume, setVolume] = useState(plazaRadio.getVolume());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
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

  // Saludo inicial de ECO
  useEffect(() => {
    eco.current.bubble = session.greeted
      ? { text: pick([`¡De vuelta, ${myFirst}! 🎉`, '¿Cómo te fue en el Arcade? 🕹️', '¡Qué bueno verte otra vez!']), until: 3.5 }
      : { text: `¡Hola, ${myFirst}! Esta es La Plaza. Camina con las flechas o con un clic.`, until: 7 };
    session.greeted = true;
    eco.current.nextLine = 22;
  }, [myFirst]);

  // Al salir: se guarda dónde estabas y se apaga la música
  useEffect(() => () => {
    session.spot = { x: player.current.x, y: player.current.y };
    plazaRadio.stop();
  }, []);

  const stateRefs = useRef({ panel, pickerOpen, radioOn, selectedNpc });
  stateRefs.current = { panel, pickerOpen, radioOn, selectedNpc };

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
    const p = nearestWalkable(x, y);
    goTo(player.current, p.x, p.y);
    player.current.arriveZone = arriveZone;
  };

  const sendEmote = useCallback((e: string) => {
    say(player.current, e, 2.4);
    // Quien esté cerca y disponible responde
    npcs.current
      .filter((n) => dist(n, player.current) < 170 && n.status !== 'reunion')
      .slice(0, 2)
      .forEach((n, i) => {
        window.setTimeout(() => say(n, e === '👋' ? '👋' : pick(['😄', '🙌', e, '✨'])), 500 + i * 350);
      });
  }, []);

  const greet = (n: Npc) => {
    playTapSound();
    say(player.current, `¡Hola, ${n.first}! 👋`);
    n.facing = n.x > player.current.x ? 'left' : 'right';
    const reply =
      n.status === 'foco' ? '🎧 En foco, ¡hablamos en un rato!' :
      n.status === 'reunion' ? '📅 En reunión, ¡ya vuelvo!' :
      n.status === 'cumple' ? '🎂 ¡Gracias! Hoy hay torta 🎉' :
      pick([`¡Hola, ${myFirst}! 👋`, '¡Qué más! 😄', '¡Holaaa! ✨', '¡Buenas! ¿Cómo va el día?']);
    window.setTimeout(() => say(n, reply), 900);
    setSelectedNpc(null);
  };

  const inviteCoffee = (n: Npc) => {
    playTapSound();
    setSelectedNpc(null);
    say(player.current, `${n.first}, ¿un café? ☕`);
    if (n.status === 'foco' || n.status === 'reunion') {
      window.setTimeout(() => say(n, n.status === 'foco' ? '¡Cuando termine este bloque! ☕' : '¡Después de mi reunión! 😉'), 900);
      return;
    }
    const taken = npcs.current.filter((o) => o.mode === 'cafe').length;
    const spot = CAFE_SPOTS[taken % CAFE_SPOTS.length];
    window.setTimeout(() => {
      say(n, '¡Vamos! ☕');
      n.mode = 'cafe';
      goTo(n, spot.x, spot.y);
      walkTo(CAFE_SPOTS[(taken + 1) % CAFE_SPOTS.length].x, CAFE_SPOTS[(taken + 1) % CAFE_SPOTS.length].y);
      showToast(`${n.first} va camino al café ☕`);
    }, 800);
  };

  const toggleRadio = () => {
    if (plazaRadio.playing) {
      plazaRadio.stop();
      setRadioOn(false);
      npcs.current.forEach((n) => { if (n.mode === 'dance') { n.mode = 'wander'; n.waitUntil = timeRef.current + Math.random() * 3; } });
    } else {
      plazaRadio.start();
      setRadioOn(true);
      let k = 0;
      npcs.current.forEach((n) => {
        if ((n.status === 'disponible' || n.status === 'cumple') && n.mode !== 'cafe' && k < STAGE_SPOTS.length && Math.random() < 0.75) {
          const s = STAGE_SPOTS[k++];
          n.mode = 'dance'; goTo(n, s.x + (Math.random() - 0.5) * 20, s.y);
          window.setTimeout(() => say(n, pick(['🎵', '¡Temazo! 🔥', '🕺', '💃'])), 600 + k * 400);
        }
      });
      eco.current.bubble = { text: '¡Música! 🎶 Mira quién se acerca a bailar.', until: timeRef.current + 4 };
    }
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

  // ── Bucle del juego ──────────────────────────────────────────────────────
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (timeRef.current += dt);
      const p = player.current;

      // Jugador: teclado o clic
      const k = keys.current;
      const vx = (k.has('arrowright') || k.has('d') ? 1 : 0) - (k.has('arrowleft') || k.has('a') ? 1 : 0);
      const vy = (k.has('arrowdown') || k.has('s') ? 1 : 0) - (k.has('arrowup') || k.has('w') ? 1 : 0);
      if (vx || vy) {
        const len = Math.hypot(vx, vy);
        p.tx = p.x + (vx / len) * 40;
        p.ty = p.y + (vy / len) * 40;
        p.arriveZone = null;
        stepMover(p, PLAYER_SPEED, dt);
        p.tx = null; p.ty = null; p.path = [];
        p.moving = true;
        if (vx) p.facing = vx < 0 ? 'left' : 'right';
      } else {
        const ox = p.x;
        const arrived = stepMover(p, PLAYER_SPEED, dt);
        if (p.x !== ox) p.facing = p.x < ox ? 'left' : 'right';
        if (arrived && p.arriveZone) {
          const z = p.arriveZone;
          p.arriveZone = null;
          if (ZONES.find((zz) => zz.id === z && dist(zz.door, p) < DOOR_RADIUS + 30)) enterZone(z);
        }
      }

      // ECO: acompaña sin estorbar
      const e = eco.current;
      const de = dist(e, p);
      if (de > 120 && e.tx === null) {
        const a = Math.atan2(e.y - p.y, e.x - p.x);
        const target = nearestWalkable(p.x + Math.cos(a) * 70, p.y + Math.sin(a) * 40);
        goTo(e, target.x, target.y);
      }
      const ex = e.x, ey = e.y;
      stepMover(e, de > 300 ? ECO_SPEED * 1.6 : ECO_SPEED, dt);
      if (e.moving) {
        const mx = e.x - ex, my = e.y - ey;
        e.dir = Math.abs(mx) > Math.abs(my) ? (mx < 0 ? 'left' : 'right') : (my < 0 ? 'up' : 'down');
      } else e.dir = 'down';
      if (t > e.nextLine && !stateRefs.current.panel) {
        e.bubble = { text: ECO_LINES[e.lineIdx % ECO_LINES.length], until: t + 6 };
        e.lineIdx++;
        e.nextLine = t + 32;
      }

      // Equipo
      for (const n of npcs.current) {
        const ox = n.x;
        if (n.id === stateRefs.current.selectedNpc && n.mode !== 'cafe') {
          // Con su tarjeta abierta, la persona se detiene y te mira
          n.moving = false;
          n.facing = n.x > p.x ? 'left' : 'right';
          n.waitUntil = Math.max(n.waitUntil, t + 1.5);
          if (n.bubble && n.bubble.until < t) n.bubble = null;
          continue;
        }
        if (n.tx !== null) {
          const arrived = stepMover(n, n.mode === 'dance' ? NPC_SPEED * 1.4 : NPC_SPEED, dt);
          if (n.x !== ox) n.facing = n.x < ox ? 'left' : 'right';
          if (arrived) {
            n.waitUntil = t + 2 + Math.random() * 5;
            if (n.mode === 'cafe' || n.mode === 'dance') n.facing = n.mode === 'dance' ? (Math.random() < 0.5 ? 'left' : 'right') : n.facing;
          }
        } else if (n.mode === 'wander' && t > n.waitUntil) {
          const w = pick(WAYPOINTS);
          const target = nearestWalkable(w.x + (Math.random() - 0.5) * 40, w.y + (Math.random() - 0.5) * 20);
          goTo(n, target.x, target.y);
        } else if (n.mode === 'cafe' && t > n.waitUntil + 25) {
          n.mode = 'wander'; // después del café vuelven a pasear
        }
        if (t > n.nextChatter && n.status === 'disponible' && !n.bubble) {
          say(n, pick(n.mode === 'cafe' ? ['☕', '¡Qué rico este café!', '😂'] : n.mode === 'dance' ? ['🎵', '🕺', '💃', '🔥'] : ['👋', '😄', '✨', '🙌', '¿Alguien al Arcade? 🕹️']), 2.6);
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
  }, [enterZone]);

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
    cam.current.x += (target.x - cam.current.x) * 0.12;
    cam.current.y += (target.y - cam.current.y) * 0.12;
    const c = clampCam(cam.current.x, cam.current.y);
    cam.current.x = c.x; cam.current.y = c.y;
  }
  const toScreen = (x: number, y: number) => ({ x: x * scale - cam.current.x, y: (y + SKY_PAD) * scale - cam.current.y });

  const onWorldClick = (ev: React.MouseEvent) => {
    if (pickerOpen || panel) return;
    setSelectedNpc(null);
    const r = containerRef.current!.getBoundingClientRect();
    const wx = (ev.clientX - r.left + cam.current.x) / scale;
    const wy = (ev.clientY - r.top + cam.current.y) / scale - SKY_PAD;
    walkTo(wx, wy);
  };

  const clickZone = (ev: React.MouseEvent, z: Zone) => {
    ev.stopPropagation();
    if (pickerOpen || panel) return;
    setSelectedNpc(null);
    if (dist(z.door, player.current) < DOOR_RADIUS) enterZone(z.id);
    else walkTo(z.door.x, z.door.y, z.id);
  };

  const clickNpc = (ev: React.MouseEvent, n: Npc) => {
    ev.stopPropagation();
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
    playTapSound();
    const e = eco.current;
    e.bubble = { text: ECO_LINES[e.lineIdx % ECO_LINES.length], until: timeRef.current + 6 };
    e.lineIdx++;
    e.nextLine = timeRef.current + 32;
  };

  // ── Datos derivados para pintar ──────────────────────────────────────────
  const t = timeRef.current;
  const p = player.current;
  const levels = radioOn ? plazaRadio.levels(8) : Array(8).fill(0);
  const energy = levels.reduce((a, b) => a + b, 0) / 8;
  const nearZone = !panel && !pickerOpen ? ZONES.find((z) => dist(z.door, p) < DOOR_RADIUS) || null : null;
  const selected = selectedNpc ? npcs.current.find((n) => n.id === selectedNpc) || null : null;
  const presentCount = npcs.current.length + 1;
  const myChar = CHARACTERS[avatarIdx ?? pickerChoice];

  type Sprite = { key: string; y: number; node: React.ReactNode };
  const sprites: Sprite[] = [];

  ZONES.forEach((z) => {
    const behind = p.y < z.y && p.y > z.y - z.height * 0.9 && Math.abs(p.x - z.x) < z.width * 0.45;
    const glow = z.id === 'stage' && radioOn;
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
          {glow && (
            <div
              className="absolute left-1/2 top-[45%] rounded-full pointer-events-none"
              style={{ width: z.width * 1.2, height: z.height * 0.9, transform: 'translate(-50%,-50%)', background: `radial-gradient(closest-side, rgba(236,72,153,${0.25 + energy * 0.6}), rgba(61,217,235,${0.1 + energy * 0.3}) 55%, transparent)`, filter: 'blur(6px)' }}
            />
          )}
          <img
            src={z.img}
            alt={z.name}
            draggable={false}
            className="relative w-full h-full object-contain select-none transition-[filter] duration-200 group-hover:brightness-125"
            style={{ filter: nearZone?.id === z.id ? 'brightness(1.18) drop-shadow(0 0 14px rgba(212,255,63,.55))' : 'drop-shadow(0 10px 12px rgba(10,4,24,.55))' }}
          />
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
    key: string, x: number, y: number, img: string, moving: boolean, facing: Facing, phase: number,
    opts: { dance?: boolean; sit?: boolean; onClick?: (e: React.MouseEvent) => void; ring?: string; height?: number } = {}
  ) => {
    const h = opts.height ?? CHAR_H;
    const w = t * 11 + phase;
    const bob = moving ? Math.abs(Math.sin(w)) * 6 : opts.dance ? Math.abs(Math.sin(t * 7 + phase)) * (8 + energy * 14) : Math.sin(t * 2 + phase) * 0.8;
    const tilt = moving ? Math.sin(w) * 4 : opts.dance ? Math.sin(t * 3.5 + phase) * 7 : 0;
    const squash = opts.dance ? 1 + Math.sin(t * 14 + phase) * 0.03 : 1 + Math.sin(t * 2 + phase) * 0.012;
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
          src={img}
          alt=""
          draggable={false}
          className="absolute left-1/2 bottom-0 select-none max-w-none"
          style={{
            height: opts.sit ? h * 0.92 : h,
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) translateY(${-bob}px) rotate(${tilt}deg) scaleX(${facing === 'left' ? -1 : 1}) scaleY(${squash})`,
            filter: 'drop-shadow(0 2px 2px rgba(10,4,24,.45))'
          }}
        />
      </div>
    );
  };

  npcs.current.forEach((n) => {
    sprites.push({
      key: n.id,
      y: n.y,
      node: charNode(n.id, n.x, n.y, CHARACTERS[n.char].img, n.moving, n.facing, n.phase, {
        dance: n.mode === 'dance' && !n.moving,
        sit: n.mode === 'sit',
        onClick: (ev) => clickNpc(ev, n),
        ring: selectedNpc === n.id ? '#d4ff3f' : undefined
      })
    });
  });

  sprites.push({ key: 'me', y: p.y, node: charNode('me', p.x, p.y, myChar.img, p.moving, p.facing, 0, { ring: '#3dd9eb' }) });

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

  // Etiquetas y burbujas en pantalla (texto nítido a cualquier zoom)
  type Label = { key: string; x: number; y: number; name: string; dot?: string; badge?: string | null; bubble: Bubble | null; me?: boolean; eco?: boolean; h: number };
  const labels: Label[] = [
    ...npcs.current.map((n) => ({ key: n.id, x: n.x, y: n.y, name: n.first, dot: STATUS_META[n.status].dot, badge: STATUS_META[n.status].badge, bubble: n.bubble, h: CHAR_H })),
    { key: 'me', x: p.x, y: p.y, name: 'Tú', dot: '#3dd9eb', bubble: p.bubble, me: true, h: CHAR_H },
    { key: 'eco', x: eco.current.x, y: eco.current.y, name: 'ECO', bubble: eco.current.bubble, eco: true, h: ECO_H }
  ];

  const notes = radioOn ? Array.from({ length: 6 }, (_, i) => i) : [];
  const stageZone = ZONES.find((z) => z.id === 'stage')!;
  const stageScreen = toScreen(stageZone.x, stageZone.y - stageZone.height * 0.55);

  const upcomingBirthdays = useMemo(() => {
    const now = new Date();
    return teamUsers
      .filter((u) => u.status !== 'Inactive' && u.birthDate)
      .map((u) => {
        const [, m, d] = u.birthDate!.split('-').map(Number);
        let next = new Date(now.getFullYear(), m - 1, d);
        if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next = new Date(now.getFullYear() + 1, m - 1, d);
        const days = Math.round((next.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000);
        return { u, next, days };
      })
      .sort((a, b) => a.days - b.days)
      .slice(0, 5);
  }, [teamUsers]);

  const anniversaries = useMemo(() => {
    const mm = String(new Date().getMonth() + 1).padStart(2, '0');
    return teamUsers.filter((u) => u.status !== 'Inactive' && u.anniversaryDate?.slice(5, 7) === mm);
  }, [teamUsers]);

  const cafeGoers = npcs.current.filter((n) => n.mode === 'cafe');
  const invitable = npcs.current.filter((n) => n.mode !== 'cafe');
  const monthName = new Date().toLocaleDateString('es-CO', { month: 'long' });

  return (
    <div className="relative w-full h-[calc(100dvh-125px)] lg:h-[calc(100dvh-61px)] min-h-[480px] overflow-hidden bg-[#0a0418] text-white select-none">
      <style>{PLAZA_CSS}</style>

      {/* ── MUNDO ─────────────────────────────────────────────────────── */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden cursor-crosshair" onClick={onWorldClick}>
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: WORLD_W, height: WORLD_H, transform: `translate(${-cam.current.x}px, ${-cam.current.y}px) scale(${scale})` }}
        >
          {/* Cielo */}
          <div className="absolute left-0 top-0 w-full" style={{ height: SKY_PAD + 40, background: 'linear-gradient(180deg, #0b0420 0%, #24104a 60%, #3a1a55 100%)' }}>
            {Array.from({ length: 40 }, (_, i) => (
              <span key={i} className="absolute rounded-full bg-white" style={{ left: `${(i * 61) % 100}%`, top: `${(i * 29) % 80}%`, width: 1 + (i % 3), height: 1 + (i % 3), opacity: 0.3 + 0.5 * Math.abs(Math.sin(t * 0.8 + i)) }} />
            ))}
          </div>
          <img src={MAP_IMG} alt="" draggable={false} className="absolute left-0 select-none max-w-none" style={{ top: SKY_PAD, width: MAP_W, height: MAP_H }} />
          <div className="absolute left-0 w-full pointer-events-none" style={{ top: SKY_PAD - 30, height: 60, background: 'linear-gradient(180deg, transparent, rgba(11,4,32,.0) 40%, rgba(11,4,32,0))' }} />

          {/* Brillo del río */}
          <div
            className="absolute pointer-events-none mix-blend-screen"
            style={{ left: 1400, top: SKY_PAD, width: 272, height: MAP_H, opacity: 0.35, backgroundImage: 'repeating-linear-gradient(170deg, transparent 0 18px, rgba(125,249,255,.35) 20px, transparent 24px 60px)', backgroundSize: '100% 240px', animation: 'plaza-river 6s linear infinite' }}
          />

          {/* Luces de los faroles */}
          {LIGHTS.map((l, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none mix-blend-screen"
              style={{ left: l.x - l.r, top: l.y + SKY_PAD - l.r, width: l.r * 2, height: l.r * 2, background: 'radial-gradient(closest-side, rgba(255,196,100,.45), rgba(255,140,60,.12) 60%, transparent)', animation: `plaza-flicker ${3 + (i % 4)}s ease-in-out ${i * 0.37}s infinite`, zIndex: 2000 }}
            />
          ))}

          {/* Puertas: anillo cuando estás cerca */}
          {ZONES.map((z) => (
            <div key={`door-${z.id}`} className="absolute pointer-events-none" style={{ left: z.door.x, top: z.door.y + SKY_PAD, opacity: nearZone?.id === z.id ? 1 : 0.28, transition: 'opacity .25s', zIndex: 1 }}>
              <div
                className="absolute left-0 top-0 rounded-[50%]"
                style={{ width: 90, height: 30, border: '2px solid rgba(212,255,63,.8)', boxShadow: '0 0 18px rgba(212,255,63,.6), inset 0 0 12px rgba(212,255,63,.4)', animation: 'plaza-pulse 1.6s ease-in-out infinite' }}
              />
            </div>
          ))}

          {sprites.map((s) => s.node)}

          {/* Luciérnagas */}
          {Array.from({ length: 26 }, (_, i) => (
            <span
              key={`ff-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: (i * 263) % 1380 + 20, top: ((i * 151) % 700) + 240 + SKY_PAD, width: 4, height: 4,
                background: i % 3 ? '#e9ff8a' : '#7df9ff', boxShadow: `0 0 8px 2px ${i % 3 ? 'rgba(212,255,63,.8)' : 'rgba(61,217,235,.8)'}`,
                animation: `plaza-firefly ${7 + (i % 5)}s ease-in-out ${i * 0.6}s infinite`,
                ['--fx' as string]: `${((i * 37) % 60) - 30}px`, ['--fy' as string]: `${((i * 53) % 50) - 35}px`, zIndex: 3000
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Viñeta */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(10,4,24,.55) 100%)' }} />

        {/* Notas musicales desde el escenario */}
        {notes.map((i) => (
          <span
            key={`n-${i}`}
            className="absolute pointer-events-none text-xl font-black"
            style={{ left: stageScreen.x + (i - 2.5) * 22, top: stageScreen.y, color: i % 2 ? '#d4ff3f' : '#3dd9eb', textShadow: '0 0 10px currentColor', animation: `plaza-note ${2.4 + (i % 3) * 0.5}s ease-out ${i * 0.45}s infinite`, ['--nx' as string]: `${(i % 2 ? 1 : -1) * (10 + i * 6)}px` } as React.CSSProperties}
          >
            {i % 3 === 0 ? '♪' : i % 3 === 1 ? '♫' : '♬'}
          </span>
        ))}

        {/* Nombres y burbujas */}
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

        {/* Aviso de puerta */}
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

        {/* Tarjeta de la persona */}
        {selected && (() => {
          const s = toScreen(selected.x, selected.y);
          const meta = STATUS_META[selected.status];
          const left = Math.max(150, Math.min(size.w - 150, s.x));
          const top = Math.max(12, s.y - CHAR_H * scale - 190);
          return (
            <div onClick={(ev) => ev.stopPropagation()} className="absolute plaza-in z-[9] w-[280px] -translate-x-1/2 rounded-3xl border border-white/15 bg-[#140a2b]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,.55)] backdrop-blur-md cursor-default" style={{ left, top }}>
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
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-bold"><span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />{meta.label}</span>
                </div>
              </div>
              {selected.user.hobbies && <p className="mt-3 text-[11px] leading-snug text-white/70 line-clamp-2"><span className="font-bold text-white/90">Le gusta:</span> {selected.user.hobbies}</p>}
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <button type="button" onClick={() => greet(selected)} className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 hover:bg-white/20 py-2 text-[11px] font-bold cursor-pointer transition-colors"><span className="text-lg leading-none">👋</span>Saludar</button>
                <button type="button" onClick={() => inviteCoffee(selected)} className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 hover:bg-white/20 py-2 text-[11px] font-bold cursor-pointer transition-colors"><Coffee className="w-[18px] h-[18px] text-[#fbbf24]" />Un café</button>
                <button type="button" onClick={() => { setSelectedNpc(null); onOpenArcade(); }} className="flex flex-col items-center gap-1 rounded-2xl bg-[#d4ff3f] hover:brightness-110 text-[#1a0f30] py-2 text-[11px] font-black cursor-pointer"><Swords className="w-[18px] h-[18px]" />Retar</button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── HUD ───────────────────────────────────────────────────────── */}
      <div className="absolute left-3 top-3 sm:left-5 sm:top-5 z-20 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0a0418]/70 px-3.5 py-2.5 backdrop-blur-md shadow-lg">
        <div>
          <p className="text-[15px] font-black tracking-tight leading-none">La Plaza</p>
          <p className="mt-1 text-[11px] text-white/70 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_6px_#a3e635]" />
            {presentCount} aquí{awayCount > 0 ? ` · ${awayCount} fuera hoy` : ''}
          </p>
        </div>
      </div>

      <div className="absolute right-3 top-3 sm:right-5 sm:top-5 z-20 flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0a0418]/70 p-1.5 backdrop-blur-md shadow-lg">
        <button type="button" onClick={toggleRadio} title={radioOn ? 'Pausar música' : 'Poner música'} className={`h-9 px-3 rounded-xl inline-flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${radioOn ? 'bg-[#d4ff3f] text-[#1a0f30]' : 'bg-white/10 hover:bg-white/20'}`}>
          {radioOn ? (
            <span className="flex items-end gap-[2px] h-3.5">{levels.slice(0, 4).map((v, i) => <span key={i} className="w-[3px] rounded-full bg-[#1a0f30]" style={{ height: `${25 + v * 75}%` }} />)}</span>
          ) : <Music className="w-4 h-4" />}
          <span className="hidden sm:inline">{radioOn ? 'Lo-fi Uhura' : 'Música'}</span>
        </button>
        <button type="button" onClick={() => { setPickerChoice(avatarIdx ?? 0); setPickerOpen(true); }} title="Cambiar personaje" className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 inline-flex items-center justify-center cursor-pointer overflow-hidden">
          <img src={myChar.img} alt="" className="h-8 object-contain object-top translate-y-1" />
        </button>
        <button type="button" onClick={onOpenTeam} title="Fichas del equipo" className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
          <LayoutGrid className="w-4 h-4" /><span className="hidden md:inline">Equipo</span>
        </button>
        <div className="hidden sm:flex items-center rounded-xl bg-white/10">
          <button type="button" onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))} className="h-9 w-8 inline-flex items-center justify-center hover:bg-white/10 rounded-l-xl cursor-pointer" aria-label="Alejar"><Minus className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => setZoom((z) => Math.min(2.25, +(z + 0.25).toFixed(2)))} className="h-9 w-8 inline-flex items-center justify-center hover:bg-white/10 rounded-r-xl cursor-pointer" aria-label="Acercar"><Plus className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Emojis */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-[#0a0418]/75 p-1.5 backdrop-blur-md shadow-lg">
          {EMOTES.map((em, i) => (
            <button key={em} type="button" onClick={(ev) => { ev.stopPropagation(); sendEmote(em); }} title={`Tecla ${i + 1}`} className="w-10 h-10 rounded-xl text-xl hover:bg-white/15 hover:-translate-y-0.5 transition-all cursor-pointer">{em}</button>
          ))}
        </div>
        <p className="hidden sm:block text-[11px] text-white/55">Flechas o WASD para caminar · Clic para ir · <kbd className="font-bold text-white/80">E</kbd> para entrar</p>
      </div>

      {toast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 plaza-in rounded-full bg-white text-[#1a0f30] px-4 py-2 text-xs font-bold shadow-xl">{toast}</div>
      )}

      {/* ── PANELES DE ZONA ───────────────────────────────────────────── */}
      {panel && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0a0418]/60 backdrop-blur-sm p-4" onClick={() => setPanel(null)}>
          <div onClick={(ev) => ev.stopPropagation()} className="plaza-in relative w-full max-w-md rounded-[28px] border border-white/15 bg-gradient-to-b from-[#1c0f3a] to-[#120826] p-5 shadow-[0_30px_80px_rgba(0,0,0,.6)]">
            <button type="button" onClick={() => setPanel(null)} className="absolute right-4 top-4 p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-4 h-4" /></button>

            {panel === 'stage' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#ec4899]/20 border border-[#ec4899]/40 flex items-center justify-center"><Headphones className="w-5 h-5 text-[#f9a8d4]" /></div>
                  <div><h3 className="font-black text-lg leading-tight">Escenario</h3><p className="text-xs text-white/60">Radio de La Plaza · lo-fi para concentrarse</p></div>
                </div>
                <div className="mt-5 rounded-3xl bg-[#0a0418]/70 border border-white/10 p-5">
                  <div className="flex items-end justify-center gap-1.5 h-20">
                    {levels.map((v, i) => (
                      <span key={i} className="w-4 rounded-t-md transition-[height] duration-75" style={{ height: `${radioOn ? 12 + v * 88 : 10}%`, background: i % 2 ? 'linear-gradient(#d4ff3f,#84cc16)' : 'linear-gradient(#3dd9eb,#0891b2)', boxShadow: radioOn ? '0 0 12px rgba(212,255,63,.35)' : 'none' }} />
                    ))}
                  </div>
                  <p className="mt-4 text-center font-black">Lo-fi Uhura</p>
                  <p className="text-center text-[11px] text-white/50">Música original generada en vivo · nunca se repite igual</p>
                  <div className="mt-4 flex items-center gap-3">
                    <button type="button" onClick={toggleRadio} className="w-12 h-12 shrink-0 rounded-full bg-[#d4ff3f] text-[#1a0f30] inline-flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-[0_0_20px_rgba(212,255,63,.4)]" aria-label={radioOn ? 'Pausar' : 'Reproducir'}>
                      {radioOn ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-[1px]" />}
                    </button>
                    <Volume2 className="w-4 h-4 text-white/60 shrink-0" />
                    <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(ev) => { const v = Number(ev.target.value); setVolume(v); plazaRadio.setVolume(v); }} className="w-full accent-[#d4ff3f]" aria-label="Volumen" />
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-white/50 text-center">Al poner música, quien esté disponible se acerca a bailar 🕺</p>
              </>
            )}

            {panel === 'cafe' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 flex items-center justify-center"><Coffee className="w-5 h-5 text-[#fcd34d]" /></div>
                  <div><h3 className="font-black text-lg leading-tight">Café de La Plaza</h3><p className="text-xs text-white/60">Una pausa corta con alguien del equipo</p></div>
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-white/50">En la terraza</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cafeGoers.length === 0 && <p className="text-xs text-white/60">Nadie todavía. ¡Invita a alguien!</p>}
                  {cafeGoers.map((n) => (
                    <span key={n.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 pl-1 pr-3 py-1 text-xs font-bold"><img src={CHARACTERS[n.char].img} alt="" className="h-6 w-6 object-cover object-top rounded-full bg-white/10" />{n.first}</span>
                  ))}
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-white/50">Invitar a un café</p>
                <div className="mt-2 max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {invitable.map((n) => (
                    <div key={n.id} className="flex items-center justify-between gap-2 rounded-2xl bg-white/5 border border-white/5 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={CHARACTERS[n.char].img} alt="" className="h-8 w-8 object-cover object-top rounded-xl bg-white/10" />
                        <div className="min-w-0"><p className="text-xs font-bold truncate">{n.user.name}</p><p className="text-[10.5px] text-white/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[n.status].dot }} />{STATUS_META[n.status].label}</p></div>
                      </div>
                      <button type="button" onClick={() => { setPanel(null); inviteCoffee(n); }} className="shrink-0 rounded-xl bg-[#fbbf24] text-[#1a0f30] px-3 py-1.5 text-[11px] font-black hover:brightness-110 cursor-pointer">☕ Invitar</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {panel === 'wall' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#d946ef]/20 border border-[#d946ef]/40 flex items-center justify-center"><PartyPopper className="w-5 h-5 text-[#f0abfc]" /></div>
                  <div><h3 className="font-black text-lg leading-tight">Muro del equipo</h3><p className="text-xs text-white/60">Lo que celebramos en {monthName}</p></div>
                </div>
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
                <button type="button" onClick={() => { setPanel(null); onOpenTeam(); }} className="mt-5 w-full rounded-2xl bg-white/10 hover:bg-white/20 py-2.5 text-xs font-black inline-flex items-center justify-center gap-2 cursor-pointer"><Users className="w-4 h-4" /> Ver las fichas del equipo</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── ELIGE TU PERSONAJE ────────────────────────────────────────── */}
      {pickerOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0418]/75 backdrop-blur-md p-4">
          <div className="plaza-in w-full max-w-3xl rounded-[32px] border border-white/15 bg-gradient-to-b from-[#1f1040] to-[#120826] p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,.65)]">
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
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { playTapSound(); setPickerChoice(i); }}
                    className={`group relative flex flex-col items-center rounded-3xl pt-3 pb-2 transition-all cursor-pointer ${on ? 'bg-[#d4ff3f]/15 ring-2 ring-[#d4ff3f] shadow-[0_0_30px_rgba(212,255,63,.25)]' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    <img
                      src={c.img}
                      alt={c.name}
                      className="h-28 sm:h-36 object-contain transition-transform duration-300 group-hover:-translate-y-1"
                      style={on ? { transform: `translateY(${-Math.abs(Math.sin(t * 6)) * 5}px)` } : undefined}
                    />
                    <span className={`mt-1 text-[11px] font-bold ${on ? 'text-[#d4ff3f]' : 'text-white/60'}`}>{c.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-xs text-white/50 hidden sm:block">ECO te acompaña en La Plaza 🦫</p>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setAvatarIdx(pickerChoice);
                  saveAvatar(userId, pickerChoice);
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

      {/* Acceso rápido al Arcade en móvil */}
      <button type="button" onClick={onOpenArcade} className="sm:hidden absolute right-3 bottom-24 z-20 h-12 w-12 rounded-2xl bg-[#d4ff3f] text-[#1a0f30] inline-flex items-center justify-center shadow-lg cursor-pointer" aria-label="Arcade"><Gamepad2 className="w-5 h-5" /></button>
    </div>
  );
};
