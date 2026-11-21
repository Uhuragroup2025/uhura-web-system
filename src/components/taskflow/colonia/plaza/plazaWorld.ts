/**
 * ============================================================================
 * LA PLAZA · MUNDO (ECO BY UHURA) — PROTOTIPO EXPERIMENTAL
 * ============================================================================
 * Coordenadas en píxeles del mapa original (1672 × 941). La vista escala el
 * mundo; aquí solo viven el arte, los obstáculos, las puertas y los puntos
 * de paseo. Nada de esto se persiste: es solo del prototipo.
 */

import mapImg from '../../../../assets/images/plaza/plaza-map.webp';
import bldArcade from '../../../../assets/images/plaza/bld-arcade.webp';
import bldCafe from '../../../../assets/images/plaza/bld-cafe.webp';
import bldStage from '../../../../assets/images/plaza/bld-stage.webp';
import bldWall from '../../../../assets/images/plaza/bld-wall.webp';
import char1 from '../../../../assets/images/plaza/char-1.webp';
import char2 from '../../../../assets/images/plaza/char-2.webp';
import char3 from '../../../../assets/images/plaza/char-3.webp';
import char4 from '../../../../assets/images/plaza/char-4.webp';
import char5 from '../../../../assets/images/plaza/char-5.webp';
import char6 from '../../../../assets/images/plaza/char-6.webp';
import char7 from '../../../../assets/images/plaza/char-7.webp';
import ecoDown from '../../../../assets/images/plaza/eco-down.webp';
import ecoUp from '../../../../assets/images/plaza/eco-up.webp';
import ecoLeft from '../../../../assets/images/plaza/eco-left.webp';
import ecoRight from '../../../../assets/images/plaza/eco-right.webp';
import propArcadeCabinet from '../../../../assets/images/plaza/prop-arcade-cabinet.webp';
import propBalloons from '../../../../assets/images/plaza/prop-balloons.webp';
import propCoffee from '../../../../assets/images/plaza/prop-coffee.webp';
import propGift from '../../../../assets/images/plaza/prop-gift.webp';
import propGuitar from '../../../../assets/images/plaza/prop-guitar.webp';
import propSpeaker from '../../../../assets/images/plaza/prop-speaker.webp';
import propPlant from '../../../../assets/images/plaza/prop-plant.webp';

export const MAP_IMG = mapImg;
export const MAP_W = 1672;
export const MAP_H = 941;
/** Cielo sobre el mapa para que los techos del norte no se corten. */
export const SKY_PAD = 90;
export const WORLD_W = MAP_W;
export const WORLD_H = MAP_H + SKY_PAD;

export const CHARACTERS = [
  { id: 'c1', img: char1, name: 'Rizos' },
  { id: 'c2', img: char2, name: 'Bomber' },
  { id: 'c3', img: char3, name: 'Trenzas' },
  { id: 'c4', img: char4, name: 'Clásico' },
  { id: 'c5', img: char5, name: 'Blazer' },
  { id: 'c6', img: char6, name: 'Urbano' },
  { id: 'c7', img: char7, name: 'Lila' }
] as const;

export const ECO_SPRITES = { down: ecoDown, up: ecoUp, left: ecoLeft, right: ecoRight };

export type ZoneId = 'arcade' | 'cafe' | 'stage' | 'wall';

export interface Zone {
  id: ZoneId;
  name: string;
  verb: string;
  emoji: string;
  img: string;
  /** Centro inferior del edificio (en coordenadas del mapa). */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Punto frente a la puerta: al acercarse aparece «Entrar». */
  door: { x: number; y: number };
}

export const ZONES: Zone[] = [
  { id: 'arcade', name: 'Arcade', verb: 'Jugar', emoji: '🕹️', img: bldArcade, x: 742, y: 212, width: 300, height: 290, door: { x: 742, y: 240 } },
  { id: 'cafe', name: 'Café', verb: 'Entrar al café', emoji: '☕', img: bldCafe, x: 222, y: 608, width: 330, height: 333, door: { x: 222, y: 636 } },
  { id: 'stage', name: 'Escenario', verb: 'Poner música', emoji: '🎧', img: bldStage, x: 1242, y: 608, width: 320, height: 319, door: { x: 1242, y: 636 } },
  { id: 'wall', name: 'Muro', verb: 'Ver el muro', emoji: '🎉', img: bldWall, x: 747, y: 870, width: 236, height: 233, door: { x: 747, y: 640 } }
];

export const DOOR_RADIUS = 80;

/** Decoración que suma vida al mapa (centro inferior, alto en px del mundo). */
export const PROPS: { img: string; x: number; y: number; h: number }[] = [
  { img: propArcadeCabinet, x: 560, y: 214, h: 78 },
  { img: propArcadeCabinet, x: 925, y: 214, h: 78 },
  { img: propSpeaker, x: 1088, y: 612, h: 60 },
  { img: propGuitar, x: 1395, y: 600, h: 58 },
  { img: propCoffee, x: 392, y: 600, h: 30 },
  { img: propPlant, x: 46, y: 612, h: 46 },
  { img: propBalloons, x: 590, y: 862, h: 88 },
  { img: propGift, x: 905, y: 868, h: 42 }
];

type Rect = { x0: number; y0: number; x1: number; y1: number };
type Circle = { cx: number; cy: number; r: number };

const BLOCK_RECTS: Rect[] = [
  { x0: 520, y0: 0, x1: 965, y1: 214 },     // Arcade (lote norte)
  { x0: 58, y0: 285, x1: 388, y1: 606 },    // Café (lote oeste)
  { x0: 1094, y0: 285, x1: 1400, y1: 606 }, // Escenario (lote este)
  { x0: 488, y0: 662, x1: 1006, y1: 878 },  // Muro (lote sur)
  { x0: 0, y0: 690, x1: 466, y1: 941 },     // Jardín suroeste
  { x0: 1030, y0: 690, x1: 1672, y1: 941 }, // Jardín sureste
  { x0: 1398, y0: 0, x1: 1672, y1: 941 }    // Río
];
const BLOCK_CIRCLES: Circle[] = [
  { cx: 745, cy: 448, r: 72 }, // fuente de flores
  { cx: 490, cy: 378, r: 46 }, // árbol izquierdo
  { cx: 995, cy: 378, r: 46 }  // árbol derecho
];
const BOUNDS = { x0: 18, y0: 226, x1: 1395, y1: 928 };

export const isWalkable = (x: number, y: number): boolean => {
  if (x < BOUNDS.x0 || x > BOUNDS.x1 || y < BOUNDS.y0 || y > BOUNDS.y1) return false;
  for (const r of BLOCK_RECTS) if (x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1) return false;
  for (const c of BLOCK_CIRCLES) if ((x - c.cx) ** 2 + (y - c.cy) ** 2 < c.r * c.r) return false;
  return true;
};

/** Puntos de paseo sobre los caminos (para el equipo y para ECO). */
export const WAYPOINTS: { x: number; y: number }[] = [
  { x: 742, y: 262 }, { x: 600, y: 255 }, { x: 890, y: 255 }, { x: 440, y: 300 },
  { x: 1050, y: 300 }, { x: 440, y: 500 }, { x: 1050, y: 500 }, { x: 620, y: 420 },
  { x: 870, y: 420 }, { x: 745, y: 580 }, { x: 650, y: 630 }, { x: 840, y: 630 },
  { x: 222, y: 650 }, { x: 330, y: 640 }, { x: 1242, y: 650 }, { x: 1140, y: 640 },
  { x: 40, y: 450 }, { x: 1080, y: 250 }, { x: 400, y: 250 }, { x: 745, y: 905 },
  { x: 480, y: 900 }, { x: 1015, y: 900 }
];

/** Bancas del mapa: aquí se sienta quien está en foco. */
export const BENCHES: { x: number; y: number }[] = [
  { x: 578, y: 352 }, { x: 910, y: 352 }, { x: 610, y: 588 }, { x: 884, y: 588 }
];

/** Terraza del café: invitados a un café. */
export const CAFE_SPOTS: { x: number; y: number }[] = [
  { x: 120, y: 650 }, { x: 330, y: 652 }, { x: 80, y: 640 }, { x: 368, y: 646 }
];

/** Frente al escenario: aquí se baila cuando suena la música. */
export const STAGE_SPOTS: { x: number; y: number }[] = [
  { x: 1180, y: 664 }, { x: 1300, y: 664 }, { x: 1240, y: 690 }, { x: 1130, y: 680 }
];

/** Luces del mapa (faroles y lámparas) para el brillo ambiental. */
export const LIGHTS: { x: number; y: number; r: number }[] = [
  { x: 627, y: 255, r: 70 }, { x: 862, y: 255, r: 70 }, { x: 552, y: 440, r: 70 },
  { x: 940, y: 440, r: 70 }, { x: 407, y: 615, r: 60 }, { x: 1085, y: 615, r: 60 },
  { x: 1430, y: 350, r: 50 }, { x: 1440, y: 440, r: 50 }, { x: 1430, y: 525, r: 50 },
  { x: 1628, y: 715, r: 50 }, { x: 1555, y: 855, r: 50 }, { x: 1265, y: 835, r: 50 },
  { x: 320, y: 750, r: 45 }, { x: 1395, y: 228, r: 45 }, { x: 35, y: 315, r: 40 }
];

// ── Búsqueda de camino (A* sobre una grilla de 16 px) ───────────────────────
const CELL = 16;
const GW = Math.ceil(MAP_W / CELL);
const GH = Math.ceil(MAP_H / CELL);
let grid: Uint8Array | null = null;
const getGrid = () => {
  if (grid) return grid;
  grid = new Uint8Array(GW * GH);
  for (let gy = 0; gy < GH; gy++)
    for (let gx = 0; gx < GW; gx++)
      grid[gy * GW + gx] = isWalkable(gx * CELL + CELL / 2, gy * CELL + CELL / 2) ? 1 : 0;
  return grid;
};

const lineClear = (ax: number, ay: number, bx: number, by: number) => {
  const d = Math.hypot(bx - ax, by - ay);
  const n = Math.ceil(d / 6);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    if (!isWalkable(ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
  }
  return true;
};

/** Devuelve los puntos para ir de A a B rodeando obstáculos (sin incluir A). */
export const findPath = (ax: number, ay: number, bx: number, by: number): { x: number; y: number }[] => {
  if (lineClear(ax, ay, bx, by)) return [{ x: bx, y: by }];
  const g = getGrid();
  const toCell = (x: number, y: number) => {
    let cx = Math.max(0, Math.min(GW - 1, Math.floor(x / CELL)));
    let cy = Math.max(0, Math.min(GH - 1, Math.floor(y / CELL)));
    if (!g[cy * GW + cx]) {
      // celda caminable más cercana
      let best = -1, bd = Infinity;
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || !g[ny * GW + nx]) continue;
        const dd = dx * dx + dy * dy;
        if (dd < bd) { bd = dd; best = ny * GW + nx; }
      }
      if (best >= 0) { cx = best % GW; cy = Math.floor(best / GW); }
    }
    return cy * GW + cx;
  };
  const start = toCell(ax, ay);
  const goal = toCell(bx, by);
  const gxg = goal % GW, gyg = Math.floor(goal / GW);
  const h = (i: number) => Math.hypot((i % GW) - gxg, Math.floor(i / GW) - gyg);
  const gScore = new Float32Array(GW * GH).fill(Infinity);
  const came = new Int32Array(GW * GH).fill(-1);
  const closed = new Uint8Array(GW * GH);
  gScore[start] = 0;
  const open: number[] = [start];
  const f = new Float32Array(GW * GH).fill(Infinity);
  f[start] = h(start);
  let found = false;
  let iter = 0;
  while (open.length && iter++ < 6000) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (f[open[i]] < f[open[bi]]) bi = i;
    const cur = open[bi];
    open[bi] = open[open.length - 1];
    open.pop();
    if (cur === goal) { found = true; break; }
    closed[cur] = 1;
    const cx = cur % GW, cy = Math.floor(cur / GW);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const ni = ny * GW + nx;
      if (!g[ni] || closed[ni]) continue;
      if (dx && dy && (!g[cy * GW + nx] || !g[ny * GW + cx])) continue; // sin cortar esquinas
      const tg = gScore[cur] + (dx && dy ? 1.414 : 1);
      if (tg < gScore[ni]) {
        if (gScore[ni] === Infinity) open.push(ni);
        gScore[ni] = tg; came[ni] = cur; f[ni] = tg + h(ni);
      }
    }
  }
  if (!found) return [{ x: bx, y: by }];
  const cells: { x: number; y: number }[] = [];
  for (let c = goal; c !== -1 && c !== start; c = came[c]) cells.push({ x: (c % GW) * CELL + CELL / 2, y: Math.floor(c / GW) * CELL + CELL / 2 });
  cells.reverse();
  cells.push({ x: bx, y: by });
  // Suavizado: saltar puntos con línea directa
  const out: { x: number; y: number }[] = [];
  let from = { x: ax, y: ay };
  let i = 0;
  while (i < cells.length) {
    let j = cells.length - 1;
    while (j > i && !lineClear(from.x, from.y, cells[j].x, cells[j].y)) j--;
    out.push(cells[j]);
    from = cells[j];
    i = j + 1;
  }
  return out;
};
