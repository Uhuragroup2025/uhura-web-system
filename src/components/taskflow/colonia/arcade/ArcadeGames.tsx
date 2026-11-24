/**
 * ============================================================================
 * ARCADE DE LA PLAZA · JUEGOS EN CANVAS (ECO BY UHURA) — PROTOTIPO
 * ============================================================================
 * Dos juegos de 15 segundos con el mismo estilo de La Plaza (noche, neón):
 * 1. Torre de Troncos: el tronco se desliza; al tocar cae y lo que sobresale
 *    se corta. Perfecto = +3 y el tronco crece un poco. Encaja = +1.
 * 2. Salto de Nenúfares: ECO salta entre nenúfares; tócalo antes de que salte.
 *    Cada acierto = +1. Con racha, ECO salta más rápido.
 * Los puntajes alimentan el mismo ranking semanal y los retos de siempre.
 */

import React, { useEffect, useRef, useState } from 'react';
import ecoDown from '../../../../assets/images/plaza/eco-down.webp';
import { playTapSound, playScoreChime } from '../coloniaAudio';

const GAME_SECONDS = 15;

interface GameProps {
  onFinish: (score: number) => void;
}

/** Canvas nítido: ajusta su tamaño al contenedor y a la densidad de pantalla. */
const useCanvas = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useRef({ w: 360, h: 420, dpr: 1 });
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const fit = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size.current = { w: r.width, h: r.height, dpr };
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);
  return { wrapRef, canvasRef, size };
};

/** Cuenta regresiva de 15 s compartida por los dos juegos. */
const useCountdown = (running: boolean, onEnd: () => void) => {
  const [left, setLeft] = useState(GAME_SECONDS);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const l = Math.max(0, GAME_SECONDS - (performance.now() - start) / 1000);
      setLeft(l);
      if (l <= 0) { window.clearInterval(id); endRef.current(); }
    }, 100);
    return () => window.clearInterval(id);
  }, [running]);
  return left;
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number };
type Floater = { x: number; y: number; text: string; life: number; color: string };

const drawParticles = (ctx: CanvasRenderingContext2D, ps: Particle[], dt: number, gravity = 600) => {
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.life -= dt;
    if (p.life <= 0) { ps.splice(i, 1); continue; }
    p.vy += gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
};

const drawFloaters = (ctx: CanvasRenderingContext2D, fs: Floater[], dt: number) => {
  ctx.textAlign = 'center';
  for (let i = fs.length - 1; i >= 0; i--) {
    const f = fs[i];
    f.life -= dt;
    if (f.life <= 0) { fs.splice(i, 1); continue; }
    f.y -= 50 * dt;
    ctx.globalAlpha = Math.min(1, f.life * 2);
    ctx.font = '900 20px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(10,4,24,.85)';
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
};

/** Barra superior: tiempo y puntaje. */
const Hud: React.FC<{ left: number; score: number; label: string; combo?: number }> = ({ left, score, label, combo = 0 }) => (
  <div className="absolute inset-x-0 top-0 z-10 p-3 pointer-events-none">
    <div className="flex items-center justify-between gap-3">
      <div className="rounded-2xl bg-[#0a0418]/70 backdrop-blur px-3 py-1.5 border border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">{label}</p>
        <p className="text-2xl font-black leading-none text-[#d4ff3f] tabular-nums" style={{ textShadow: '0 0 12px rgba(212,255,63,.6)' }}>{score}</p>
      </div>
      {combo >= 3 && (
        <div className="rounded-full bg-[#f472b6] px-3 py-1 text-xs font-black text-[#1a0f30] shadow-[0_0_18px_rgba(244,114,182,.6)] animate-pulse">🔥 Racha x{combo}</div>
      )}
      <div className={`rounded-2xl bg-[#0a0418]/70 backdrop-blur px-3 py-1.5 border ${left < 4 ? 'border-[#f43f5e]' : 'border-white/10'}`}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 text-right">Tiempo</p>
        <p className={`text-2xl font-black leading-none tabular-nums text-right ${left < 4 ? 'text-[#fb7185]' : 'text-white'}`}>{Math.ceil(left)}s</p>
      </div>
    </div>
    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${(left / GAME_SECONDS) * 100}%`, background: left < 4 ? '#fb7185' : 'linear-gradient(90deg,#3dd9eb,#d4ff3f)', transition: 'width .1s linear' }} />
    </div>
  </div>
);

/** Cuenta 3-2-1 antes de empezar. */
const useStartCountdown = () => {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n <= 0) return;
    const id = window.setTimeout(() => { setN((v) => v - 1); playTapSound(); }, 650);
    return () => window.clearTimeout(id);
  }, [n]);
  return n;
};

const StartOverlay: React.FC<{ n: number; hint: string }> = ({ n, hint }) =>
  n > 0 ? (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0418]/55 backdrop-blur-[2px] pointer-events-none">
      <span key={n} className="text-7xl font-black text-[#d4ff3f] animate-in zoom-in-50 duration-300" style={{ textShadow: '0 0 30px rgba(212,255,63,.7)' }}>{n}</span>
      <p className="mt-3 text-sm font-bold text-white/80">{hint}</p>
    </div>
  ) : null;

// ============================================================================
// TORRE DE TRONCOS
// ============================================================================
type Log = { x: number; w: number; perfect?: boolean };
type Chunk = { x: number; y: number; w: number; vy: number; vr: number; r: number };

export const TorreDeTroncos: React.FC<GameProps> = ({ onFinish }) => {
  const { wrapRef, canvasRef, size } = useCanvas();
  const pre = useStartCountdown();
  const running = pre <= 0;
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const scoreRef = useRef(0);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    window.setTimeout(() => onFinish(scoreRef.current), 600);
  };
  const left = useCountdown(running, finish);

  // Estado del juego en coordenadas lógicas (ancho 360)
  const g = useRef({
    logs: [{ x: 180, w: 150 }] as Log[],
    cur: { x: 40, w: 150, dir: 1 },
    speed: 170,
    camY: 0,
    chunks: [] as Chunk[],
    particles: [] as Particle[],
    floaters: [] as Floater[],
    flash: 0,
    combo: 0,
    t: 0
  });
  const LOG_H = 26;
  const W = 360;

  const drop = () => {
    if (!running || finished.current) return;
    const s = g.current;
    const last = s.logs[s.logs.length - 1];
    const c = s.cur;
    const dx = c.x - last.x;
    const overlap = c.w / 2 + last.w / 2 - Math.abs(dx);
    const level = s.logs.length;
    const yTop = level * LOG_H;
    if (overlap <= 4) {
      // Se cae entero
      s.chunks.push({ x: c.x, y: yTop, w: c.w, vy: 0, vr: (dx > 0 ? 1 : -1) * 3, r: 0 });
      s.floaters.push({ x: W / 2, y: 120, text: '¡Se cayó!', life: 0.9, color: '#fb7185' });
      s.combo = 0;
      setCombo(0);
      s.cur = { x: dx > 0 ? 40 : W - 40, w: last.w, dir: dx > 0 ? 1 : -1 };
      return;
    }
    let pts = 1;
    let nx = c.x;
    let nw = c.w;
    if (Math.abs(dx) < 5) {
      // Perfecto: se alinea y crece un poco
      nx = last.x;
      nw = Math.min(170, c.w + 6);
      pts = 3;
      s.combo++;
      s.flash = 1;
      s.floaters.push({ x: W / 2, y: 120, text: s.combo >= 3 ? `¡PERFECTO! x${s.combo}` : '¡PERFECTO! +3', life: 1, color: '#d4ff3f' });
      playScoreChime();
    } else {
      // Se corta lo que sobresale
      const leftEdge = Math.max(c.x - c.w / 2, last.x - last.w / 2);
      const rightEdge = Math.min(c.x + c.w / 2, last.x + last.w / 2);
      nw = rightEdge - leftEdge;
      nx = (leftEdge + rightEdge) / 2;
      const cutW = c.w - nw;
      const cutX = dx > 0 ? rightEdge + cutW / 2 : leftEdge - cutW / 2;
      s.chunks.push({ x: cutX, y: yTop, w: cutW, vy: 0, vr: (dx > 0 ? 1 : -1) * 2.5, r: 0 });
      s.combo = 0;
      s.floaters.push({ x: W / 2, y: 120, text: '+1', life: 0.7, color: '#ffffff' });
      playTapSound();
    }
    setCombo(s.combo);
    s.logs.push({ x: nx, w: nw, perfect: pts === 3 });
    for (let i = 0; i < 14; i++) {
      s.particles.push({ x: nx + (Math.random() - 0.5) * nw, y: 0, vx: (Math.random() - 0.5) * 220, vy: -Math.random() * 220 - 60, life: 0.7, max: 0.7, color: pts === 3 ? (i % 2 ? '#d4ff3f' : '#3dd9eb') : (i % 2 ? '#f59e0b' : '#fde68a'), size: 3 + Math.random() * 3 });
    }
    scoreRef.current += pts;
    setScore(scoreRef.current);
    s.speed = Math.min(330, s.speed + 9);
    const fromLeft = s.logs.length % 2 === 0;
    s.cur = { x: fromLeft ? 30 : W - 30, w: Math.max(26, nw), dir: fromLeft ? 1 : -1 };
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); drop(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const stars = Array.from({ length: 50 }, (_, i) => ({ x: (i * 73) % 360, y: (i * 41) % 260, r: 0.6 + (i % 3) * 0.5, p: i }));
    const loop = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) { raf = requestAnimationFrame(loop); return; }
      const { w, h, dpr } = size.current;
      const s = g.current;
      s.t += dt;
      const k = w / W; // escala lógica → pantalla
      ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
      const H = h / k; // alto lógico

      // Movimiento del tronco actual
      if (running && !finished.current) {
        s.cur.x += s.cur.dir * s.speed * dt;
        if (s.cur.x > W - s.cur.w / 2 + 30) s.cur.dir = -1;
        if (s.cur.x < s.cur.w / 2 - 30) s.cur.dir = 1;
      }
      // Cámara: sube con la torre
      const targetCam = Math.max(0, s.logs.length * LOG_H - H * 0.45);
      s.camY += (targetCam - s.camY) * Math.min(1, dt * 6);
      const baseY = H - 70 + s.camY; // y de pantalla del piso 0 (borde inferior)
      const yOf = (level: number) => baseY - level * LOG_H;

      // Cielo
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0b0420');
      sky.addColorStop(0.55, '#2a1258');
      sky.addColorStop(1, '#4a1d5e');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      stars.forEach((st) => {
        ctx.globalAlpha = 0.3 + 0.6 * Math.abs(Math.sin(s.t * 0.9 + st.p));
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(st.x, (st.y + s.camY * 0.15) % H, st.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      // Luna
      ctx.fillStyle = 'rgba(255,240,200,.9)';
      ctx.shadowColor = 'rgba(255,220,150,.8)';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(292, 70 + s.camY * 0.1, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Ciudad lejana
      const cityY = H - 60 + s.camY * 0.5;
      ctx.fillStyle = '#1d0c3d';
      for (let i = 0; i < 12; i++) {
        const bw = 26 + (i * 13) % 20;
        const bh = 40 + (i * 37) % 70;
        ctx.fillRect(i * 32 - 8, cityY - bh, bw, bh + 200);
        ctx.fillStyle = 'rgba(251,191,36,.55)';
        for (let wy = cityY - bh + 8; wy < cityY - 6; wy += 12) for (let wx = i * 32 - 2; wx < i * 32 - 8 + bw - 6; wx += 9) if ((wx + wy + i) % 3 === 0) ctx.fillRect(wx, wy, 4, 5);
        ctx.fillStyle = '#1d0c3d';
      }
      // Río y orilla
      const riverY = baseY + 26;
      const river = ctx.createLinearGradient(0, riverY, 0, riverY + 80);
      river.addColorStop(0, '#0e4a5c');
      river.addColorStop(1, '#06202c');
      ctx.fillStyle = river;
      ctx.fillRect(0, riverY, W, 200);
      ctx.strokeStyle = 'rgba(125,249,255,.35)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const ry = riverY + 12 + i * 10;
        const off = ((s.t * 30 + i * 40) % 80);
        ctx.beginPath();
        ctx.moveTo(-80 + off + i * 20, ry);
        ctx.lineTo(-40 + off + i * 20, ry);
        ctx.moveTo(140 + off - i * 10, ry);
        ctx.lineTo(180 + off - i * 10, ry);
        ctx.stroke();
      }
      // Base de piedra
      ctx.fillStyle = '#3a2160';
      roundRect(ctx, 180 - 95, baseY, 190, 30, 8);
      ctx.fill();
      ctx.strokeStyle = '#d4ff3f';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(212,255,63,.7)';
      ctx.shadowBlur = 10;
      roundRect(ctx, 180 - 95, baseY, 190, 30, 8);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Troncos apilados (el primero es la base de la torre)
      s.logs.forEach((lg, i) => {
        drawLog(ctx, lg.x, yOf(i) - LOG_H, lg.w, LOG_H, i, lg.perfect && i === s.logs.length - 1 ? s.flash : 0);
      });
      s.flash = Math.max(0, s.flash - dt * 2);

      // Trozos que caen
      for (let i = s.chunks.length - 1; i >= 0; i--) {
        const c = s.chunks[i];
        c.vy += 900 * dt;
        c.y -= c.vy * dt;
        c.r += c.vr * dt;
        const sy = baseY - c.y - LOG_H;
        if (sy > H + 100) { s.chunks.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(c.x, sy + LOG_H / 2);
        ctx.rotate(c.r);
        drawLog(ctx, 0, -LOG_H / 2, c.w, LOG_H, 3, 0, 0.85);
        ctx.restore();
      }

      // Tronco en movimiento + guía
      if (!finished.current) {
        const level = s.logs.length;
        const cy = yOf(level) - LOG_H - 18 + Math.sin(s.t * 6) * 1.5;
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = 'rgba(212,255,63,.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.cur.x, cy + LOG_H);
        ctx.lineTo(s.cur.x, yOf(level));
        ctx.stroke();
        ctx.setLineDash([]);
        drawLog(ctx, s.cur.x, cy, s.cur.w, LOG_H, level, 0.35);
      }

      // Partículas en coordenadas de la torre
      ctx.save();
      ctx.translate(0, yOf(s.logs.length) );
      drawParticles(ctx, s.particles, dt);
      ctx.restore();
      drawFloaters(ctx, s.floaters, dt);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div ref={wrapRef} className="relative w-full h-[min(62vh,460px)] overflow-hidden rounded-[22px] border-2 border-[#8a4dff]/50 shadow-[0_0_40px_rgba(138,77,255,.25)] cursor-pointer select-none touch-none" onPointerDown={drop}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <Hud left={left} score={score} label="Puntos" combo={combo} />
      <StartOverlay n={pre} hint="Toca (o barra espaciadora) para soltar el tronco" />
      {running && !finished.current && <p className="absolute bottom-2 inset-x-0 text-center text-[11px] font-bold text-white/60 pointer-events-none">Toca para soltar · alinea para «Perfecto» (+3)</p>}
    </div>
  );
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Tronco con corteza, vetas y cortes de madera en los extremos. */
function drawLog(ctx: CanvasRenderingContext2D, cx: number, y: number, w: number, h: number, seed: number, glow: number, alpha = 1) {
  const x = cx - w / 2;
  ctx.globalAlpha = alpha;
  if (glow > 0) {
    ctx.shadowColor = `rgba(212,255,63,${0.9 * glow})`;
    ctx.shadowBlur = 22 * glow;
  }
  const bark = ctx.createLinearGradient(0, y, 0, y + h);
  bark.addColorStop(0, '#c2722b');
  bark.addColorStop(0.45, '#8a4a1c');
  bark.addColorStop(1, '#4e2810');
  ctx.fillStyle = bark;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Vetas
  ctx.strokeStyle = 'rgba(40,18,6,.45)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < Math.max(2, w / 26); i++) {
    const vx = x + 12 + ((i * 29 + seed * 11) % Math.max(1, w - 24));
    ctx.beginPath();
    ctx.moveTo(vx, y + 5);
    ctx.quadraticCurveTo(vx + 6, y + h / 2, vx - 2, y + h - 5);
    ctx.stroke();
  }
  // Brillo superior
  ctx.fillStyle = 'rgba(255,220,160,.22)';
  roundRect(ctx, x + h / 2, y + 3, Math.max(0, w - h), 4, 2);
  ctx.fill();
  // Cortes (anillos) en los extremos
  [x + h / 2 - 1, x + w - h / 2 + 1].forEach((ex, side) => {
    if (w < h * 1.4 && side === 1) return;
    ctx.fillStyle = '#e9b779';
    ctx.beginPath();
    ctx.ellipse(ex, y + h / 2, h * 0.32, h * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,60,20,.6)';
    ctx.lineWidth = 1;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.ellipse(ex, y + h / 2, h * 0.09 * r, h * 0.13 * r, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  if (glow > 0) {
    ctx.strokeStyle = `rgba(212,255,63,${glow})`;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ============================================================================
// SALTO DE NENÚFARES
// ============================================================================
type Pad = { x: number; y: number; r: number; rot: number; flower: boolean; bounce: number };
type Ripple = { x: number; y: number; r: number; life: number; color: string };

export const SaltoDeNenufares: React.FC<GameProps> = ({ onFinish }) => {
  const { wrapRef, canvasRef, size } = useCanvas();
  const pre = useStartCountdown();
  const running = pre <= 0;
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const scoreRef = useRef(0);
  const finished = useRef(false);
  const ecoImg = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const im = new Image();
    im.src = ecoDown;
    ecoImg.current = im;
  }, []);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    window.setTimeout(() => onFinish(scoreRef.current), 600);
  };
  const left = useCountdown(running, finish);

  const W = 360;
  const H = 420;
  const g = useRef({
    pads: [
      { x: 80, y: 150, r: 46, rot: 0.3, flower: true, bounce: 0 },
      { x: 190, y: 120, r: 42, rot: 2.1, flower: false, bounce: 0 },
      { x: 290, y: 165, r: 44, rot: 4.0, flower: false, bounce: 0 },
      { x: 120, y: 270, r: 48, rot: 1.2, flower: false, bounce: 0 },
      { x: 245, y: 262, r: 46, rot: 5.2, flower: true, bounce: 0 },
      { x: 180, y: 370, r: 44, rot: 3.3, flower: false, bounce: 0 }
    ] as Pad[],
    at: 0,
    from: 0,
    jumpT: 1,
    stayUntil: 1.2,
    ripples: [] as Ripple[],
    particles: [] as Particle[],
    floaters: [] as Floater[],
    combo: 0,
    t: 0
  });

  const nextPad = () => {
    const s = g.current;
    let n = Math.floor(Math.random() * s.pads.length);
    if (n === s.at) n = (n + 1 + Math.floor(Math.random() * (s.pads.length - 1))) % s.pads.length;
    s.from = s.at;
    s.at = n;
    s.jumpT = 0;
    const stay = Math.max(0.5, 0.95 - s.combo * 0.04);
    s.stayUntil = s.t + 0.22 + stay;
  };

  const tap = (clientX: number, clientY: number) => {
    if (!running || finished.current) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const { w, h } = size.current;
    const k = Math.min(w / W, h / H);
    const ox = (w - W * k) / 2;
    const oy = (h - H * k) / 2;
    const x = (clientX - r.left - ox) / k;
    const y = (clientY - r.top - oy) / k;
    const s = g.current;
    const hit = s.pads.findIndex((p) => Math.hypot(x - p.x, (y - p.y) * 1.6) < p.r + 8);
    if (hit < 0) return;
    const p = s.pads[hit];
    if (hit === s.at && s.jumpT >= 0.7) {
      s.combo++;
      setCombo(s.combo);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      p.bounce = 1;
      s.ripples.push({ x: p.x, y: p.y, r: p.r * 0.6, life: 1, color: '212,255,63' });
      for (let i = 0; i < 16; i++) s.particles.push({ x: p.x, y: p.y - 10, vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 260 - 80, life: 0.6, max: 0.6, color: i % 2 ? '#7df9ff' : '#d4ff3f', size: 3 + Math.random() * 3 });
      s.floaters.push({ x: p.x, y: p.y - 60, text: s.combo >= 3 ? `+1 · x${s.combo}` : '+1', life: 0.8, color: '#d4ff3f' });
      playScoreChime();
      nextPad();
    } else {
      s.combo = 0;
      setCombo(0);
      p.bounce = 0.5;
      s.ripples.push({ x: p.x, y: p.y, r: p.r * 0.6, life: 1, color: '251,113,133' });
      s.floaters.push({ x: p.x, y: p.y - 50, text: '¡Ahí no!', life: 0.6, color: '#fb7185' });
      playTapSound();
    }
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const reeds = Array.from({ length: 9 }, (_, i) => ({ x: i < 5 ? 6 + i * 9 : W - 6 - (i - 5) * 9, h: 50 + (i * 17) % 40, p: i }));
    const flies = Array.from({ length: 14 }, (_, i) => ({ x: (i * 97) % W, y: (i * 53) % H, p: i }));
    const loop = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) { raf = requestAnimationFrame(loop); return; }
      const { w, h, dpr } = size.current;
      const s = g.current;
      s.t += dt;
      const k = Math.min(w / W, h / H);
      const ox = (w - W * k) / 2;
      const oy = (h - H * k) / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Agua (llena todo el lienzo)
      const water = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.max(w, h) * 0.75);
      water.addColorStop(0, '#0f5a6b');
      water.addColorStop(0.6, '#0a3346');
      water.addColorStop(1, '#071a2a');
      ctx.fillStyle = water;
      ctx.fillRect(0, 0, w, h);
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);

      // Reflejo de luna y brillos del agua
      ctx.fillStyle = 'rgba(255,240,200,.08)';
      ctx.beginPath();
      ctx.ellipse(300, 60, 60, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(125,249,255,.18)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 10; i++) {
        const yy = 30 + i * 40;
        const xx = ((s.t * 18 + i * 57) % (W + 80)) - 40;
        ctx.beginPath();
        ctx.moveTo(xx, yy);
        ctx.lineTo(xx + 26, yy);
        ctx.stroke();
      }

      // Juncos en los bordes
      reeds.forEach((rd) => {
        const sway = Math.sin(s.t * 1.4 + rd.p) * 4;
        ctx.strokeStyle = '#2f6b3a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rd.x, H + 10);
        ctx.quadraticCurveTo(rd.x + sway / 2, H - rd.h / 2, rd.x + sway, H - rd.h);
        ctx.stroke();
        ctx.fillStyle = '#7a4a22';
        ctx.beginPath();
        ctx.ellipse(rd.x + sway, H - rd.h, 3, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ondas
      for (let i = s.ripples.length - 1; i >= 0; i--) {
        const rp = s.ripples[i];
        rp.life -= dt * 1.4;
        rp.r += 90 * dt;
        if (rp.life <= 0) { s.ripples.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(${rp.color},${rp.life * 0.8})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ECO: salto entre nenúfares
      if (running && !finished.current && s.t > s.stayUntil) {
        s.combo = 0;
        setCombo(0);
        nextPad();
      }
      s.jumpT = Math.min(1, s.jumpT + dt / 0.22);

      // Nenúfares
      s.pads.forEach((p, i) => {
        p.bounce = Math.max(0, p.bounce - dt * 3);
        const bob = Math.sin(s.t * 1.6 + i) * 2 + p.bounce * 6;
        const active = i === s.at && s.jumpT >= 0.7 && running;
        // Sombra en el agua
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        ctx.beginPath();
        ctx.ellipse(p.x + 4, p.y + 8, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        if (active) {
          ctx.shadowColor = 'rgba(212,255,63,.9)';
          ctx.shadowBlur = 24;
        }
        const leaf = ctx.createRadialGradient(p.x - p.r * 0.3, p.y + bob - p.r * 0.2, 4, p.x, p.y + bob, p.r);
        leaf.addColorStop(0, active ? '#8ff06b' : '#4fbf5a');
        leaf.addColorStop(1, active ? '#2f9a3a' : '#1f6e34');
        ctx.fillStyle = leaf;
        ctx.beginPath();
        const notch = 0.35;
        ctx.moveTo(p.x, p.y + bob);
        ctx.ellipse(p.x, p.y + bob, p.r, p.r * 0.55, 0, p.rot + notch, p.rot + Math.PI * 2 - notch);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // Venas
        ctx.strokeStyle = 'rgba(200,255,180,.25)';
        ctx.lineWidth = 1;
        for (let v = 0; v < 6; v++) {
          const a = p.rot + notch + (v + 0.5) * ((Math.PI * 2 - notch * 2) / 6);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + bob);
          ctx.lineTo(p.x + Math.cos(a) * p.r * 0.85, p.y + bob + Math.sin(a) * p.r * 0.47);
          ctx.stroke();
        }
        if (active) {
          ctx.strokeStyle = `rgba(212,255,63,${0.6 + 0.4 * Math.sin(s.t * 10)})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + bob, p.r + 4, p.r * 0.55 + 3, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (p.flower) {
          // Flor de loto
          for (let f = 0; f < 6; f++) {
            const a = (f / 6) * Math.PI * 2 + s.t * 0.2;
            ctx.fillStyle = f % 2 ? '#f9a8d4' : '#f472b6';
            ctx.beginPath();
            ctx.ellipse(p.x + p.r * 0.45 + Math.cos(a) * 6, p.y + bob - 6 + Math.sin(a) * 3, 6, 3.5, a, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#fde68a';
          ctx.beginPath();
          ctx.arc(p.x + p.r * 0.45, p.y + bob - 6, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // ECO
      if (running && ecoImg.current?.complete) {
        const a = s.pads[s.from];
        const b = s.pads[s.at];
        const tt = s.jumpT;
        const ease = tt < 0.5 ? 2 * tt * tt : 1 - Math.pow(-2 * tt + 2, 2) / 2;
        const ex = a.x + (b.x - a.x) * ease;
        const ey = a.y + (b.y - a.y) * ease - Math.sin(tt * Math.PI) * 50 - 8;
        const ih = 62;
        const iw = (ecoImg.current.naturalWidth / ecoImg.current.naturalHeight) * ih || 40;
        ctx.fillStyle = 'rgba(0,0,0,.3)';
        ctx.beginPath();
        ctx.ellipse(ex, a.y + (b.y - a.y) * ease, 16 * (1 - Math.sin(tt * Math.PI) * 0.4), 6, 0, 0, Math.PI * 2);
        ctx.fill();
        const squash = tt >= 1 ? 1 + Math.sin(s.t * 8) * 0.03 : 1;
        ctx.drawImage(ecoImg.current, ex - iw / 2, ey - ih * squash, iw, ih * squash);
      }

      // Luciérnagas
      flies.forEach((f) => {
        const fx = f.x + Math.sin(s.t * 0.7 + f.p) * 18;
        const fy = f.y + Math.cos(s.t * 0.9 + f.p) * 14;
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(s.t * 1.5 + f.p));
        ctx.fillStyle = f.p % 3 ? '#e9ff8a' : '#7df9ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      drawParticles(ctx, s.particles, dt, 500);
      drawFloaters(ctx, s.floaters, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (running) { g.current.t = 0; g.current.stayUntil = 1.1; g.current.jumpT = 1; }
  }, [running]);

  return (
    <div ref={wrapRef} className="relative w-full h-[min(62vh,460px)] overflow-hidden rounded-[22px] border-2 border-[#3dd9eb]/50 shadow-[0_0_40px_rgba(61,217,235,.2)] cursor-pointer select-none touch-none" onPointerDown={(e) => tap(e.clientX, e.clientY)}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <Hud left={left} score={score} label="Aciertos" combo={combo} />
      <StartOverlay n={pre} hint="Toca a ECO antes de que salte" />
    </div>
  );
};
