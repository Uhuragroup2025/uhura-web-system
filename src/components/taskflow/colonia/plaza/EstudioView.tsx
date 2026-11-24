/**
 * ============================================================================
 * EL ESTUDIO · LA OFICINA DE LA PLAZA (ECO BY UHURA) — PROTOTIPO
 * ============================================================================
 * Escena a pantalla completa, como La Plaza: la cámara sigue a tu personaje.
 * Quien trabaja teclea en el escritorio de su área y de vez en cuando se
 * levanta (ping-pong, futbolín, arcade, sofá, pantalla) y vuelve. En la mesa
 * de reuniones se conversa. Encima flotan la Sala de reuniones y las entregas.
 * Visibilidad (BACKEND_REQUIREMENTS §32.3): quien no está en el proyecto ve
 * solo el proyecto, no el título de la tarea.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TaskItem, UserItem } from '../../types';
import { AREAS, AreaId, WorkInfo } from './plazaPresence';
import { PlazaCharacter, ESTUDIO_INTERIOR, makePathfinder } from './plazaWorld';
import { X, Video, Hand, CalendarClock, PackageCheck, ChevronDown, ChevronUp, Plus, Minus, Scale, ArrowLeft } from 'lucide-react';

export interface EstudioPerson {
  id: string;
  user: UserItem;
  first: string;
  char: PlazaCharacter;
  area: AreaId;
  kind: 'trabajando' | 'reunion';
  work?: WorkInfo;
  until?: string;
}

interface Props {
  people: EstudioPerson[];
  tasks: TaskItem[];
  me: PlazaCharacter;
  myAccessory?: string | null;
  onClose: () => void;
  onKnock: (p: EstudioPerson) => void;
  onJoinMeeting: () => void;
  /** Decisiones abiertas visibles para quien mira (§32.7). */
  decisions?: { id: string; title: string; projectName: string; taskId?: string; hoursLeft: number; waitingOnMe: boolean }[];
}

// ── Escena (coordenadas de la imagen, 1254 × 1254) ────────────────────────
const IMG = 1254;
const PERSON_H = 92;

type Pt = { x: number; y: number };
type Rect = { x0: number; y0: number; x1: number; y1: number };

const FLOOR: Pt[] = [
  { x: 70, y: 640 }, { x: 200, y: 625 }, { x: 445, y: 445 }, { x: 445, y: 335 }, { x: 760, y: 330 },
  { x: 1000, y: 470 }, { x: 1180, y: 570 }, { x: 1240, y: 600 }, { x: 1240, y: 1180 }, { x: 40, y: 1180 }, { x: 40, y: 660 }
];
const BLOCKS: Rect[] = [
  { x0: 200, y0: 380, x1: 435, y1: 600 },   // Escritorios de la ventana
  { x0: 585, y0: 445, x1: 860, y1: 575 },   // Escritorios de arriba
  { x0: 430, y0: 555, x1: 725, y1: 690 },   // Escritorios del centro
  { x0: 470, y0: 335, x1: 690, y1: 425 },   // Mesa de reuniones
  { x0: 790, y0: 330, x1: 1000, y1: 455 },  // Pantalla y mueble
  { x0: 1035, y0: 430, x1: 1110, y1: 550 }, // Arcade
  { x0: 895, y0: 560, x1: 1100, y1: 665 },  // Ping-pong
  { x0: 790, y0: 660, x1: 895, y1: 745 },   // Futbolín
  { x0: 180, y0: 700, x1: 480, y1: 990 },   // Rincón de lectura
  { x0: 700, y0: 780, x1: 1035, y1: 975 },  // Sala de estar
  { x0: 1000, y0: 380, x1: 1160, y1: 470 }  // Muro verde
];
const inPoly = (x: number, y: number) => {
  let inside = false;
  for (let i = 0, j = FLOOR.length - 1; i < FLOOR.length; j = i++) {
    const a = FLOOR[i], b = FLOOR[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
};
const walkable = (x: number, y: number) => inPoly(x, y) && !BLOCKS.some((r) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1);
const findPath = makePathfinder(IMG, IMG, walkable);

type Seat = Pt & { sit: boolean; dir: 'up' | 'down' };
/** Grupo de escritorios por área: asientos y punto del pasillo por donde se entra y sale. */
const CLUSTERS: Record<AreaId, { label: Pt; aisle: Pt; seats: Seat[] }> = {
  creative: { label: { x: 720, y: 420 }, aisle: { x: 760, y: 610 }, seats: [{ x: 636, y: 528, sit: true, dir: 'up' }, { x: 738, y: 568, sit: true, dir: 'up' }, { x: 875, y: 575, sit: false, dir: 'down' }, { x: 575, y: 560, sit: false, dir: 'down' }] },
  digital: { label: { x: 300, y: 395 }, aisle: { x: 420, y: 640 }, seats: [{ x: 268, y: 598, sit: true, dir: 'up' }, { x: 318, y: 552, sit: true, dir: 'up' }, { x: 380, y: 515, sit: true, dir: 'up' }, { x: 175, y: 640, sit: false, dir: 'down' }] },
  growth: { label: { x: 565, y: 530 }, aisle: { x: 560, y: 745 }, seats: [{ x: 495, y: 672, sit: true, dir: 'up' }, { x: 606, y: 708, sit: true, dir: 'up' }, { x: 735, y: 700, sit: false, dir: 'down' }, { x: 420, y: 700, sit: false, dir: 'down' }] },
  direccion: { label: { x: 330, y: 690 }, aisle: { x: 500, y: 1010 }, seats: [{ x: 300, y: 878, sit: true, dir: 'down' }, { x: 372, y: 910, sit: true, dir: 'down' }, { x: 520, y: 980, sit: false, dir: 'down' }, { x: 230, y: 1030, sit: false, dir: 'down' }] }
};
const MEETING_SEATS: Pt[] = [{ x: 512, y: 402 }, { x: 560, y: 414 }, { x: 606, y: 406 }, { x: 645, y: 386 }, { x: 520, y: 352 }, { x: 628, y: 346 }];
const SPOTS: { p: Pt; lines: string[] }[] = [
  { p: { x: 1000, y: 700 }, lines: ['🏓 ¿Una partida?', '¡Punto!', '🏓'] },
  { p: { x: 830, y: 770 }, lines: ['⚽ ¡Gol!', '¿Futbolín?', '🎯'] },
  { p: { x: 1070, y: 580 }, lines: ['🕹️', '¡Récord en el arcade!'] },
  { p: { x: 870, y: 1000 }, lines: ['☕ Una pausa corta', '😌', '☀️ Qué buena luz'] },
  { p: { x: 900, y: 500 }, lines: ['🎬 Revisando la presentación', '👀', '✨'] },
  { p: { x: 140, y: 690 }, lines: ['🌿 Un respiro', '☕'] }
];
const MONITORS: Pt[] = [{ x: 695, y: 470 }, { x: 770, y: 500 }, { x: 345, y: 452 }, { x: 280, y: 490 }, { x: 222, y: 525 }, { x: 545, y: 595 }, { x: 630, y: 622 }];

type Dir = 'down' | 'up' | 'left' | 'right';
interface Actor {
  id: string; x: number; y: number; path: Pt[]; moving: boolean; dir: Dir;
  mode: 'seat' | 'going' | 'away' | 'back' | 'meeting';
  seat?: Seat; aisle?: Pt; until: number; bubble: { text: string; until: number } | null; spot?: (typeof SPOTS)[number]; phase: number;
}

const dirFrom = (dx: number, dy: number, prev: Dir): Dir => {
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return prev;
  // Histéresis: en diagonal mantiene el eje que ya tenía (sin parpadeo frente/perfil)
  const ax = Math.abs(dx), ay = Math.abs(dy);
  const wasSide = prev === 'left' || prev === 'right';
  const side = wasSide ? ax >= ay * 0.6 : ax > ay * 1.6;
  return side ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
};
const spriteFor = (c: PlazaCharacter, dir: Dir) => {
  if (dir === 'up') return { img: c.up || c.img, flip: false };
  if (dir === 'left' || dir === 'right') return { img: c.side || c.img, flip: dir === 'left' };
  return { img: c.img, flip: false };
};
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const nearestWalkable = (x: number, y: number): Pt => {
  if (walkable(x, y)) return { x, y };
  for (let r = 8; r < 300; r += 8) for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    if (walkable(px, py)) return { x: px, y: py };
  }
  return { x: 640, y: 1080 };
};
const step = (a: { x: number; y: number; path: Pt[]; moving: boolean; dir: Dir }, speed: number, dt: number): boolean => {
  const target = a.path[0];
  if (!target) { a.moving = false; return true; }
  const dx = target.x - a.x, dy = target.y - a.y, d = Math.hypot(dx, dy);
  if (d < 3) { a.path.shift(); if (!a.path.length) { a.moving = false; return true; } return false; }
  const s = Math.min(d, speed * dt);
  a.x += (dx / d) * s;
  a.y += (dy / d) * s;
  a.dir = dirFrom(dx, dy, a.dir);
  a.moving = true;
  return false;
};
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const EstudioView: React.FC<Props> = ({ people, tasks, me, myAccessory, onClose, onKnock, onJoinMeeting, decisions = [] }) => {
  const [selected, setSelected] = useState<string | null>(null);
  // En celular el panel empieza plegado como una barra abajo; en computador, abierto a la derecha
  const [sideOpen, setSideOpen] = useState(() => { try { return window.innerWidth >= 768; } catch { return true; } });
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 640 });
  const [zoom, setZoom] = useState(1.15);
  const [, setTick] = useState(0);
  const timeRef = useRef(0);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.max(size.w / IMG, size.h / IMG) * zoom;

  const workers = people.filter((p) => p.kind === 'trabajando');
  const meeting = people.filter((p) => p.kind === 'reunion');
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const sel = selected ? byId.get(selected) || null : null;
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selected;

  // ── Actores ──────────────────────────────────────────────────────────────
  const actors = useRef<Map<string, Actor>>(new Map());
  const player = useRef({ x: 640, y: 1100, path: [] as Pt[], moving: false, dir: 'up' as Dir });
  const keys = useRef<Set<string>>(new Set());
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) => { const el = e.target as HTMLElement | null; return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable); };
    const MOVE = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
    const down = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); if (isTyping(e) || !MOVE.includes(k)) return; e.preventDefault(); e.stopPropagation(); keys.current.add(k); };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const blur = () => keys.current.clear();
    // En captura: dentro de El Estudio las flechas mueven a la persona aquí, no en La Plaza de fondo
    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up, true);
    window.addEventListener('blur', blur);
    return () => { window.removeEventListener('keydown', down, true); window.removeEventListener('keyup', up, true); window.removeEventListener('blur', blur); };
  }, []);
  // free: la persona movió la vista con el dedo o el mouse; vuelve a seguir al personaje cuando camina
  const cam = useRef({ x: 0, y: 0, ready: false, free: false });
  const drag = useRef<{ id: number; sx: number; sy: number; cx: number; cy: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  useEffect(() => {
    const map = actors.current;
    const counts: Partial<Record<AreaId, number>> = {};
    workers.forEach((w) => {
      if (map.has(w.id)) return;
      const i = (counts[w.area] = (counts[w.area] ?? -1) + 1);
      const c = CLUSTERS[w.area];
      const base = c.seats[i % c.seats.length];
      const extra = Math.floor(i / c.seats.length);
      const seat = { ...base, x: base.x + extra * 40, y: base.y + extra * 12 };
      map.set(w.id, { id: w.id, x: seat.x, y: seat.y, path: [], moving: false, dir: seat.dir, mode: 'seat', seat, aisle: nearestWalkable(c.aisle.x + extra * 30, c.aisle.y), until: 0, bubble: null, phase: Math.random() * 10 });
    });
    meeting.forEach((m, i) => {
      if (map.has(m.id)) return;
      const s = MEETING_SEATS[i % MEETING_SEATS.length];
      map.set(m.id, { id: m.id, x: s.x, y: s.y, path: [], moving: false, dir: 'down', mode: 'meeting', until: 3 + Math.random() * 8, bubble: null, phase: Math.random() * 10 });
    });
    [...map.keys()].forEach((id) => { if (!byId.has(id)) map.delete(id); });
  }, [workers, meeting, byId]);

  // ── Bucle ────────────────────────────────────────────────────────────────
  const nextOuting = useRef(4);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      const t = (timeRef.current += dt);
      // Flechas o WASD (como en La Plaza): avanza mientras la tecla está presionada
      {
        const k = keys.current;
        const vx = (k.has('arrowright') || k.has('d') ? 1 : 0) - (k.has('arrowleft') || k.has('a') ? 1 : 0);
        const vy = (k.has('arrowdown') || k.has('s') ? 1 : 0) - (k.has('arrowup') || k.has('w') ? 1 : 0);
        if (vx || vy) {
          const p = player.current;
          const len = Math.hypot(vx, vy);
          const sp = 240 * dt;
          const nx = p.x + (vx / len) * sp, ny = p.y + (vy / len) * sp;
          p.path = [];
          if (walkable(nx, ny)) { p.x = nx; p.y = ny; }
          else if (walkable(nx, p.y)) p.x = nx;
          else if (walkable(p.x, ny)) p.y = ny;
          p.dir = dirFrom(vx, vy, p.dir);
          p.moving = true;
          cam.current.free = false;
        }
      }
      step(player.current, 240, dt);
      if (t > nextOuting.current) {
        nextOuting.current = t + 6 + Math.random() * 7;
        const seated = [...actors.current.values()].filter((a) => a.mode === 'seat' && a.id !== selectedRef.current);
        const out = [...actors.current.values()].filter((a) => a.mode === 'going' || a.mode === 'away').length;
        if (seated.length && out < 2) {
          const a = pick(seated);
          const spot = pick(SPOTS);
          a.spot = spot;
          a.mode = 'going';
          a.path = [a.aisle!, ...findPath(a.aisle!.x, a.aisle!.y, spot.p.x, spot.p.y)];
        }
      }
      actors.current.forEach((a) => {
        if (a.bubble && a.bubble.until < t) a.bubble = null;
        if (a.id === selectedRef.current && a.mode !== 'meeting') { a.moving = false; return; }
        if (a.mode === 'going') {
          if (step(a, 80, dt)) { a.mode = 'away'; a.until = t + 5 + Math.random() * 4; a.dir = 'down'; a.bubble = { text: pick(a.spot!.lines), until: t + 3.5 }; }
        } else if (a.mode === 'away' && t > a.until) {
          a.mode = 'back';
          a.path = [...findPath(a.x, a.y, a.aisle!.x, a.aisle!.y), { x: a.seat!.x, y: a.seat!.y }];
        } else if (a.mode === 'back') {
          if (step(a, 80, dt)) { a.mode = 'seat'; a.dir = a.seat!.dir; }
        } else if (a.mode === 'meeting' && t > a.until) {
          a.until = t + 4 + Math.random() * 7;
          a.bubble = { text: pick(['💬', '¡Me gusta la idea!', '📊', '¿Y si probamos…?', '👍', '😂']), until: t + 2.6 };
        }
      });
      setTick((n) => (n + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Cámara ───────────────────────────────────────────────────────────────
  const worldPx = IMG * scale;
  const clampCam = (x: number, y: number) => ({ x: Math.max(0, Math.min(worldPx - size.w, x)), y: Math.max(0, Math.min(worldPx - size.h, y)) });
  {
    const target = clampCam(player.current.x * scale - size.w / 2, player.current.y * scale - size.h * 0.55);
    if (!cam.current.ready) { cam.current = { ...target, ready: true, free: false }; }
    if (!cam.current.free) {
      cam.current.x += (target.x - cam.current.x) * 0.1;
      cam.current.y += (target.y - cam.current.y) * 0.1;
    }
    const c = clampCam(cam.current.x, cam.current.y);
    cam.current.x = c.x; cam.current.y = c.y;
  }
  const t = timeRef.current;

  // Arrastrar con el dedo (o el mouse) mueve la vista; un toque corto sigue siendo «caminar aquí»
  const onDown = (e: React.PointerEvent) => { drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, cx: cam.current.x, cy: cam.current.y, moved: false }; };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 8) return;
    d.moved = true;
    cam.current.free = true;
    const c = clampCam(d.cx - dx, d.cy - dy);
    cam.current.x = c.x; cam.current.y = c.y;
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.moved) suppressClick.current = true;
    drag.current = null;
  };
  const consumeDragClick = () => { if (!suppressClick.current) return false; suppressClick.current = false; return true; };

  const onFloor = (e: React.MouseEvent) => {
    if (consumeDragClick()) return;
    cam.current.free = false;
    setSelected(null);
    const r = wrapRef.current!.getBoundingClientRect();
    const x = (e.clientX - r.left + cam.current.x) / scale, y = (e.clientY - r.top + cam.current.y) / scale;
    const target = nearestWalkable(x, y);
    const p = player.current;
    p.path = findPath(p.x, p.y, target.x, target.y);
  };
  const onPerson = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (consumeDragClick()) return;
    setSelected(id);
    const a = actors.current.get(id);
    if (a && a.mode !== 'meeting') {
      const near = a.mode === 'seat' ? a.aisle! : nearestWalkable(a.x + 50, a.y + 10);
      const p = player.current;
      p.path = findPath(p.x, p.y, near.x, near.y);
    }
  };

  const deliveries = useMemo(() => {
    const today = todayIso();
    const sorted = tasks
      .filter((x) => !['Done', 'completed', 'cancelled'].includes(String(x.status)) && x.dueDate)
      .map((x) => ({ x, due: String(x.dueDate).slice(0, 10) }))
      .filter((d) => d.due >= today)
      .sort((a, b) => a.due.localeCompare(b.due));
    const forToday = sorted.filter((d) => d.due === today);
    return { label: forToday.length ? 'Entregas de hoy' : 'Próximas entregas', items: (forToday.length ? forToday : sorted).slice(0, 4) };
  }, [tasks]);
  const fmtDue = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // ── Pintar personas (en coordenadas del mundo) ───────────────────────────
  type Drawn = { key: string; y: number; node: React.ReactNode };
  const drawn: Drawn[] = [];
  const personNode = (key: string, x: number, y: number, c: PlazaCharacter, dir: Dir, moving: boolean, o: { sit?: boolean; phase: number; scale?: number; label?: string; on?: boolean; onClick?: (e: React.MouseEvent) => void; acc?: string | null; ring?: string; bubble?: string | null }) => {
    const h = PERSON_H * (o.scale ?? 1);
    const s = spriteFor(c, dir);
    const typing = o.sit && !moving;
    const bob = moving ? Math.abs(Math.sin(t * 9 + o.phase)) * 2.2 : typing ? Math.abs(Math.sin(t * 9 + o.phase)) * 1 : Math.sin(t * 2 + o.phase) * 0.6;
    const tilt = moving ? Math.sin(t * 9 + o.phase) * 1.2 : 0;
    const visible = o.sit ? 0.66 : 1;
    return (
      <div key={key} onClick={o.onClick} className={`absolute ${o.onClick ? 'cursor-pointer group' : 'pointer-events-none'}`} style={{ left: x, top: y, transform: 'translate(-50%, -100%)', zIndex: Math.round(y) }}>
        {!o.sit && <div className="absolute left-1/2 rounded-[50%]" style={{ bottom: -h * 0.04, width: h * 0.42, height: h * 0.09, transform: 'translateX(-50%)', background: 'radial-gradient(closest-side, rgba(60,40,20,.35), transparent)' }} />}
        {o.ring && <div className="absolute left-1/2 rounded-[50%]" style={{ bottom: -h * 0.06, width: h * 0.55, height: h * 0.14, transform: 'translateX(-50%)', border: `2px solid ${o.ring}`, boxShadow: `0 0 10px ${o.ring}` }} />}
        <div className="relative overflow-hidden" style={{ height: h * visible, width: h * 0.55 }}>
          <img src={s.img} alt="" draggable={false} className="absolute left-1/2 top-0 max-w-none select-none transition-[filter] group-hover:brightness-110" style={{ height: h, transformOrigin: '50% 100%', transform: `translateX(-50%) translateY(${-bob}px) rotate(${tilt}deg) scaleX(${s.flip ? -1 : 1})`, filter: o.on ? 'drop-shadow(0 0 6px #84cc16)' : 'drop-shadow(0 2px 3px rgba(60,40,20,.35))' }} />
        </div>
        {o.acc && <span className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ top: -h * 0.12 - bob, fontSize: h * 0.2 }}>{o.acc}</span>}
      </div>
    );
  };
  type Label = { key: string; x: number; y: number; h: number; text?: string; on?: boolean; me?: boolean; bubble?: string | null };
  const labels: Label[] = [];

  actors.current.forEach((a) => {
    const p = byId.get(a.id);
    if (!p) return;
    const sitting = (a.mode === 'seat' && a.seat?.sit) || a.mode === 'meeting';
    const sc = a.mode === 'meeting' ? 0.8 : 1;
    drawn.push({ key: a.id, y: a.y, node: personNode(a.id, a.x, a.y, p.char, a.mode === 'meeting' ? 'down' : a.dir, a.moving, { sit: sitting, phase: a.phase, scale: sc, on: selected === a.id, onClick: (e) => onPerson(e, a.id) }) });
    labels.push({ key: a.id, x: a.x, y: a.y, h: PERSON_H * sc * (sitting ? 0.66 : 1), text: a.mode === 'meeting' && selected !== a.id ? undefined : p.first, on: selected === a.id, bubble: a.bubble?.text });
  });
  const pl = player.current;
  drawn.push({ key: 'me', y: pl.y, node: personNode('me', pl.x, pl.y, me, pl.dir, pl.moving, { phase: 0, acc: myAccessory, ring: '#06b6d4' }) });
  labels.push({ key: 'me', x: pl.x, y: pl.y, h: PERSON_H, text: 'Tú', me: true });
  drawn.sort((a, b) => a.y - b.y);
  const toScreen = (x: number, y: number) => ({ x: x * scale - cam.current.x, y: y * scale - cam.current.y });

  return (
    <div className="absolute inset-0 z-40 overflow-hidden bg-[#f3e9df] plaza-in">
      <style>{`
        @keyframes estudio-sun { 0%,100% { opacity: .55 } 50% { opacity: .8 } }
        @keyframes estudio-leaf { 0% { transform: translate(0,0) rotate(0) } 50% { transform: translate(12px, 6px) rotate(8deg) } 100% { transform: translate(0,0) rotate(0) } }
      `}</style>
      {/* Mundo */}
      <div ref={wrapRef} className="absolute inset-0 overflow-hidden cursor-crosshair touch-none select-none" onClick={onFloor} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: IMG, height: IMG, transform: `translate(${-cam.current.x}px, ${-cam.current.y}px) scale(${scale})` }}>
          <img src={ESTUDIO_INTERIOR} alt="Interior de El Estudio" draggable={false} className="absolute inset-0 w-full h-full select-none pointer-events-none" />
          {/* Pantalla con brillo que se mueve */}
          <div className="absolute pointer-events-none mix-blend-screen" style={{ left: 818, top: 232, width: 170, height: 105, transform: 'skewY(11deg)', opacity: 0.5, background: `linear-gradient(${100 + Math.sin(t * 0.6) * 40}deg, rgba(56,189,248,.0), rgba(56,189,248,.55), rgba(217,249,157,.5), rgba(244,114,182,.0))` }} />
          {/* Monitores encendidos */}
          {MONITORS.map((m, i) => (
            <span key={i} className="absolute rounded-full pointer-events-none mix-blend-screen" style={{ left: m.x - 28, top: m.y - 20, width: 56, height: 40, background: 'radial-gradient(closest-side, rgba(103,232,249,.75), transparent)', opacity: 0.3 + 0.35 * Math.abs(Math.sin(t * 1.6 + i * 1.3)) }} />
          ))}
          {/* Luz de la ventana que respira */}
          <div className="absolute pointer-events-none mix-blend-soft-light" style={{ left: 60, top: 150, width: 700, height: 520, background: 'radial-gradient(ellipse at 30% 40%, rgba(255,236,190,.7), transparent 65%)', animation: 'estudio-sun 7s ease-in-out infinite' }} />
          {drawn.map((d) => d.node)}
        </div>
        {/* Nombres de las áreas */}
        {AREAS.map((a) => {
          const s = toScreen(CLUSTERS[a.id].label.x, CLUSTERS[a.id].label.y);
          return <span key={a.id} className="absolute -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-black text-[#1a0f30] pointer-events-none shadow" style={{ left: s.x, top: s.y, background: a.color, zIndex: 2 }}>{a.name}</span>;
        })}
        {(() => { const s = toScreen(580, 300); return <span className="absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-[#06b6d4] px-2 py-0.5 text-[11px] font-black text-white pointer-events-none shadow" style={{ left: s.x, top: s.y, zIndex: 2 }}>Sala de reuniones</span>; })()}
        {/* Nombres y burbujas */}
        {labels.map((l) => {
          const s = toScreen(l.x, l.y);
          const top = s.y - l.h * scale;
          return (
            <React.Fragment key={`l-${l.key}`}>
              {l.text && <span className={`absolute -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-[1px] text-[10.5px] font-bold pointer-events-none ${l.me ? 'bg-[#06b6d4] text-white' : l.on ? 'bg-[#d4ff3f] text-[#1a0f30]' : 'bg-[#1a0f30]/80 text-white'}`} style={{ left: s.x, top: s.y + 4, zIndex: 3 }}>{l.text}</span>}
              {l.bubble && <span className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-white px-2 py-0.5 text-[11px] font-bold text-[#1a0f30] shadow-lg plaza-bubble pointer-events-none" style={{ left: s.x, top: top - 4, zIndex: 4 }}>{l.bubble}</span>}
            </React.Fragment>
          );
        })}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(70,40,20,.25) 100%)' }} />
      </div>

      {/* Volver a La Plaza: flecha atrás arriba a la izquierda */}
      <button type="button" onClick={onClose} aria-label="Volver a La Plaza" title="Volver a La Plaza" className="absolute left-3 top-3 sm:left-5 sm:top-5 z-10 h-10 w-10 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[#0a0418]/75 text-white backdrop-blur-md shadow-lg hover:bg-[#0a0418]/90 cursor-pointer">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="absolute right-3 top-3 sm:right-5 sm:top-5 z-10 flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0a0418]/75 p-1.5 backdrop-blur-md shadow-lg text-white">
        <div className="flex items-center rounded-xl bg-white/10">
          <button type="button" onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))} className="h-9 w-8 inline-flex items-center justify-center hover:bg-white/10 rounded-l-xl cursor-pointer" aria-label="Alejar"><Minus className="w-3.5 h-3.5" /></button>
          <button type="button" onClick={() => setZoom((z) => Math.min(2.2, +(z + 0.2).toFixed(2)))} className="h-9 w-8 inline-flex items-center justify-center hover:bg-white/10 rounded-r-xl cursor-pointer" aria-label="Acercar"><Plus className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Panel flotante: reuniones y entregas */}
      <div className={`absolute z-10 overflow-y-auto border border-white/10 bg-[#0a0418]/85 backdrop-blur-md shadow-xl text-white left-3 right-3 bottom-3 rounded-[20px] ${sideOpen ? 'max-h-[45%]' : ''} md:left-auto md:bottom-auto md:right-5 md:top-[76px] md:w-[300px] md:max-h-[calc(100%-150px)] md:rounded-[22px] ${sel ? 'hidden md:block' : ''}`}>
        <button type="button" onClick={() => setSideOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-black cursor-pointer">
          <span className="flex items-center gap-3 whitespace-nowrap text-[13px]"><span className="inline-flex items-center gap-1.5"><CalendarClock className="w-4 h-4 text-[#67e8f9]" /> Reuniones {meeting.length}</span><span className="inline-flex items-center gap-1.5"><PackageCheck className="w-4 h-4 text-[#d4ff3f]" /> Entregas {deliveries.items.length}</span>{decisions.length > 0 && <span className="inline-flex items-center gap-1.5"><Scale className="w-4 h-4 text-[#c4b5fd]" /> {decisions.length}</span>}</span>
          {sideOpen ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
        </button>
        {sideOpen && (
          <div className="px-3 pb-3 space-y-3">
            <div className="space-y-1.5">
              {meeting.length === 0 && <p className="px-1 text-xs text-white/50">Sin reuniones en este momento.</p>}
              {meeting.map((m) => (
                <button key={m.id} type="button" onClick={() => setSelected(m.id)} className={`w-full flex items-center gap-2.5 rounded-2xl px-2 py-1.5 text-left cursor-pointer ${selected === m.id ? 'bg-white/15 ring-1 ring-[#d4ff3f]' : 'bg-white/[.05] hover:bg-white/10'}`}>
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white/10"><img src={m.char.img} alt="" className="h-14 max-w-none mx-auto" /></div>
                  <div className="min-w-0"><p className="text-xs font-bold truncate text-white">{m.user.name}</p><p className="text-[10.5px] text-white/55">Hasta las {m.until}</p></div>
                </button>
              ))}
              {meeting.length > 0 && (
                <button type="button" onClick={onJoinMeeting} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#06b6d4] text-white py-2 text-xs font-black hover:brightness-110 cursor-pointer"><Video className="w-4 h-4" /> Unirse a la reunión</button>
              )}
            </div>
            {decisions.length > 0 && (
              <div>
                <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-[#c4b5fd]" /> Decisiones abiertas</p>
                <div className="mt-1.5 space-y-1.5">
                  {decisions.map((d) => (
                    <button key={d.id} type="button" onClick={() => d.taskId && window.dispatchEvent(new CustomEvent('eco:open-task', { detail: { taskId: d.taskId, focus: 'decisiones' } }))} className={`w-full text-left rounded-xl px-2.5 py-1.5 cursor-pointer ${d.waitingOnMe ? 'bg-[#7c3aed]/30 ring-1 ring-[#c4b5fd]/50 hover:bg-[#7c3aed]/40' : 'bg-white/[.05] hover:bg-white/10'}`}>
                      <p className="text-xs font-bold leading-snug line-clamp-2 text-white">{d.title}</p>
                      <p className="text-[10.5px] text-white/55">{d.projectName} · cierra en {d.hoursLeft} h{d.waitingOnMe ? ' · te espera' : ''}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5"><PackageCheck className="w-3.5 h-3.5 text-[#d4ff3f]" /> {deliveries.label}</p>
              <div className="mt-1.5 space-y-1.5">
                {deliveries.items.length === 0 && <p className="px-1 text-xs text-white/50">No hay entregas próximas.</p>}
                {deliveries.items.map(({ x, due }) => (
                  <button type="button" key={x.id} onClick={() => window.dispatchEvent(new CustomEvent('eco:open-task', { detail: { taskId: x.id } }))} className="block w-full text-left rounded-xl bg-white/[.05] hover:bg-white/10 px-2.5 py-1.5 cursor-pointer">
                    <p className="text-xs font-bold leading-snug line-clamp-1 text-white">{x.title}</p>
                    <p className="text-[10.5px] text-white/55 flex justify-between gap-2"><span className="truncate">{x.projectName || x.clientName || x.board}</span><span className="shrink-0 capitalize">{fmtDue(due)}</span></p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {sel && (
        <div onClick={(e) => e.stopPropagation()} className="absolute left-1/2 bottom-5 -translate-x-1/2 z-20 w-[min(360px,calc(100%-32px))] rounded-3xl border border-white/15 bg-[#140a2b]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,.45)] backdrop-blur-md plaza-in text-white">
          <button type="button" onClick={() => setSelected(null)} className="absolute right-3 top-3 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-3.5 h-3.5" /></button>
          <div className="flex items-center gap-3">
            {sel.user.avatarUrl ? <img src={sel.user.avatarUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border border-white/15" /> : <div className="w-12 h-12 rounded-2xl bg-[#501f92] flex items-center justify-center font-black">{sel.user.initials}</div>}
            <div className="min-w-0">
              <p className="font-black text-[15px] leading-tight truncate text-white">{sel.user.name}</p>
              <p className="text-[11px] text-white/60 truncate">{sel.user.jobTitle || ''}</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-white/[.06] px-3 py-2.5">
            {sel.kind === 'trabajando' ? (
              <>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/50">{sel.work?.verb}</p>
                {sel.work?.taskVisible ? <p className="text-sm font-black leading-snug text-white">{sel.work.task}</p> : null}
                <p className={sel.work?.taskVisible ? 'text-[11px] text-white/60' : 'text-sm font-black text-white'}>{sel.work?.project}{sel.work?.client ? ` · ${sel.work.client}` : ''}</p>
                {!sel.work?.taskVisible && <p className="mt-0.5 text-[10.5px] text-white/45">El detalle de la tarea lo ve quien está en el proyecto.</p>}
              </>
            ) : (
              <p className="text-sm font-bold text-white">📅 En reunión hasta las {sel.until}</p>
            )}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <button type="button" onClick={() => { onKnock(sel); setSelected(null); }} className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#d4ff3f] text-[#1a0f30] py-2 text-xs font-black hover:brightness-110 cursor-pointer"><Hand className="w-4 h-4" /> Toc toc</button>
          </div>
          <p className="mt-2 text-[10.5px] text-white/45 text-center">«Toc toc» le deja una pregunta corta: le llega cuando termine su bloque, sin interrumpirle.</p>
        </div>
      )}
    </div>
  );
};
