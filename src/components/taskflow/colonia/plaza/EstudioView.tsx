/**
 * ============================================================================
 * EL ESTUDIO · LA OFICINA DE LA PLAZA (ECO BY UHURA) — PROTOTIPO
 * ============================================================================
 * Quien tiene el cronómetro corriendo está aquí, sentado en el escritorio de su
 * área, con la tarea y el proyecto. Quien está en reunión, en la sala de vidrio.
 * A la derecha, la Sala de reuniones y las entregas.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TaskItem, UserItem } from '../../types';
import { AREAS, AreaId, WorkInfo } from './plazaPresence';
import { PlazaCharacter, ESTUDIO_INTERIOR } from './plazaWorld';
import { X, Video, Hand, CalendarClock, PackageCheck, Coffee } from 'lucide-react';

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
  onClose: () => void;
  onKnock: (p: EstudioPerson) => void;
  onCoffeeLater: (p: EstudioPerson) => void;
  onJoinMeeting: () => void;
  t: number;
}

// Coordenadas sobre la imagen del interior (1672 × 941)
const IMG_W = 1672;
const IMG_H = 941;
type Seat = { x: number; y: number; sit: boolean };
const CLUSTERS: Record<AreaId, { label: { x: number; y: number }; seats: Seat[] }> = {
  creative: { label: { x: 750, y: 255 }, seats: [{ x: 645, y: 412, sit: true }, { x: 770, y: 437, sit: true }, { x: 945, y: 470, sit: false }, { x: 555, y: 470, sit: false }] },
  digital: { label: { x: 1270, y: 330 }, seats: [{ x: 1172, y: 462, sit: true }, { x: 1297, y: 487, sit: true }, { x: 1470, y: 545, sit: false }, { x: 1060, y: 540, sit: false }] },
  growth: { label: { x: 620, y: 470 }, seats: [{ x: 517, y: 630, sit: true }, { x: 645, y: 655, sit: true }, { x: 835, y: 650, sit: false }, { x: 430, y: 700, sit: false }] },
  direccion: { label: { x: 1160, y: 560 }, seats: [{ x: 1060, y: 712, sit: true }, { x: 1195, y: 737, sit: true }, { x: 925, y: 770, sit: false }, { x: 1370, y: 790, sit: false }] }
};
const MEETING_SEATS = [{ x: 405, y: 232 }, { x: 545, y: 226 }, { x: 448, y: 262 }, { x: 505, y: 258 }, { x: 430, y: 200 }, { x: 520, y: 196 }];
const PERSON_H = 132; // alto de una persona de pie, en px de la imagen

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const EstudioView: React.FC<Props> = ({ people, tasks, onClose, onKnock, onCoffeeLater, onJoinMeeting, t }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [sceneW, setSceneW] = useState(900);
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSceneW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const k = sceneW / IMG_W;

  const workers = people.filter((p) => p.kind === 'trabajando');
  const meeting = people.filter((p) => p.kind === 'reunion');
  const sel = people.find((p) => p.id === selected) || null;

  // Asientos: cada persona en el grupo de escritorios de su área
  const placed = useMemo(() => {
    const out: { p: EstudioPerson; seat: Seat }[] = [];
    AREAS.forEach((a) => {
      const here = workers.filter((w) => w.area === a.id);
      here.forEach((w, i) => {
        const seats = CLUSTERS[a.id].seats;
        const seat = seats[i % seats.length];
        const extra = Math.floor(i / seats.length);
        out.push({ p: w, seat: { ...seat, x: seat.x + extra * 46, y: seat.y + extra * 10 } });
      });
    });
    return out;
  }, [workers]);

  const deliveries = useMemo(() => {
    const today = todayIso();
    const sorted = tasks
      .filter((x) => !['Done', 'completed', 'cancelled'].includes(String(x.status)) && x.dueDate)
      .map((x) => ({ x, due: String(x.dueDate).slice(0, 10) }))
      .filter((d) => d.due >= today)
      .sort((a, b) => a.due.localeCompare(b.due));
    const forToday = sorted.filter((d) => d.due === today);
    return { label: forToday.length ? 'Entregas de hoy' : 'Próximas entregas', items: (forToday.length ? forToday : sorted).slice(0, 5) };
  }, [tasks]);

  const fmtDue = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const personNode = (p: EstudioPerson, x: number, y: number, opts: { sit: boolean; back: boolean; i: number; scale?: number; label?: boolean }) => {
    const h = PERSON_H * (opts.scale ?? 1) * k;
    const img = opts.back ? p.char.up || p.char.img : p.char.img;
    const visible = opts.sit ? 0.6 : 1; // sentado: solo se ve la parte de arriba
    const bob = Math.sin(t * 2.2 + opts.i) * 0.8;
    const on = selected === p.id;
    return (
      <button
        key={p.id}
        type="button"
        onClick={(e) => { e.stopPropagation(); setSelected(p.id); }}
        className="absolute cursor-pointer group"
        style={{ left: x * k, top: y * k, transform: 'translate(-50%, -100%)', zIndex: Math.round(y) }}
        aria-label={p.user.name}
      >
        <div className="relative overflow-hidden" style={{ height: h * visible, width: h * 0.5 }}>
          <img src={img} alt="" draggable={false} className="absolute left-1/2 top-0 max-w-none select-none transition-[filter] group-hover:brightness-125" style={{ height: h, transform: `translateX(-50%) translateY(${bob}px)`, filter: on ? 'drop-shadow(0 0 6px #d4ff3f)' : 'drop-shadow(0 2px 3px rgba(0,0,0,.5))' }} />
        </div>
        <span className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-[1px] text-[10px] font-bold transition-opacity ${opts.label === false && !on ? 'opacity-0 group-hover:opacity-100' : ''} ${on ? 'bg-[#d4ff3f] text-[#1a0f30]' : 'bg-[#0a0418]/75 text-white'}`} style={{ top: -16 }}>
          {p.first}
        </span>
      </button>
    );
  };

  return (
    <div className="absolute inset-0 z-40 overflow-hidden bg-[#0d0820] plaza-in" onClick={() => setSelected(null)}>
      <div className="relative h-full overflow-y-auto p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#d4ff3f]">La Plaza</p>
            <h3 className="text-2xl font-black tracking-tight text-white">El Estudio</h3>
            <p className="text-xs text-white/60">{workers.length} trabajando · {meeting.length} en reunión · toca a alguien para ver en qué está</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-black text-white cursor-pointer">
            <X className="w-4 h-4" /> Volver a La Plaza
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          {/* La oficina */}
          <div ref={sceneRef} className="relative w-full overflow-hidden rounded-[24px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,.45)] min-w-0" style={{ aspectRatio: `${IMG_W} / ${IMG_H}` }}>
            <img src={ESTUDIO_INTERIOR} alt="Interior de El Estudio" draggable={false} className="absolute inset-0 w-full h-full select-none" />
            {/* Nombre de cada área sobre su grupo de escritorios */}
            {AREAS.map((a) => (
              <span key={a.id} className="absolute -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-[#0a0418] pointer-events-none" style={{ left: CLUSTERS[a.id].label.x * k, top: CLUSTERS[a.id].label.y * k, background: a.color, boxShadow: `0 0 12px ${a.color}`, zIndex: 1000 }}>
                {a.name}
              </span>
            ))}
            <span className="absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-[#3dd9eb] px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-[#0a0418] pointer-events-none" style={{ left: 470 * k, top: 130 * k, zIndex: 1000, boxShadow: '0 0 12px #3dd9eb' }}>
              Sala de reuniones
            </span>
            {placed.map(({ p, seat }, i) => personNode(p, seat.x, seat.y, { sit: seat.sit, back: seat.sit, i }))}
            {meeting.map((m, i) => {
              const s = MEETING_SEATS[i % MEETING_SEATS.length];
              return personNode(m, s.x, s.y, { sit: true, back: false, i: i + 20, scale: 0.7, label: false });
            })}
          </div>

          <div className="space-y-4 min-w-0">
            <section className="rounded-[24px] border-2 border-[#3dd9eb]/40 bg-[#3dd9eb]/[.06] p-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2"><CalendarClock className="w-4 h-4 text-[#3dd9eb]" /> Sala de reuniones</h4>
              <div className="mt-3 space-y-2">
                {meeting.length === 0 && <p className="text-xs text-white/50">Sin reuniones en este momento.</p>}
                {meeting.map((m) => (
                  <button key={m.id} type="button" onClick={(e) => { e.stopPropagation(); setSelected(m.id); }} className={`w-full flex items-center gap-3 rounded-2xl px-2.5 py-2 text-left cursor-pointer ${selected === m.id ? 'bg-white/15 ring-2 ring-[#d4ff3f]' : 'bg-[#0d0820]/70 hover:bg-white/10'}`}>
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/10"><img src={m.char.img} alt="" className="h-16 max-w-none mx-auto" /></div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white truncate">{m.user.name}</p>
                      <p className="text-[10.5px] text-white/60">En reunión hasta las {m.until}</p>
                    </div>
                  </button>
                ))}
              </div>
              {meeting.length > 0 && (
                <button type="button" onClick={(e) => { e.stopPropagation(); onJoinMeeting(); }} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3dd9eb] text-[#0d0820] py-2 text-xs font-black hover:brightness-110 cursor-pointer">
                  <Video className="w-4 h-4" /> Unirse a la reunión
                </button>
              )}
            </section>

            <section className="rounded-[24px] border border-white/10 bg-white/[.035] p-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2"><PackageCheck className="w-4 h-4 text-[#d4ff3f]" /> {deliveries.label}</h4>
              <div className="mt-3 space-y-1.5">
                {deliveries.items.length === 0 && <p className="text-xs text-white/50">No hay entregas próximas.</p>}
                {deliveries.items.map(({ x, due }) => (
                  <div key={x.id} className="rounded-2xl bg-[#0d0820]/70 px-3 py-2">
                    <p className="text-xs font-bold text-white leading-snug line-clamp-2">{x.title}</p>
                    <p className="mt-0.5 text-[10.5px] text-white/55 flex justify-between gap-2"><span className="truncate">{x.projectName || x.clientName || x.board}</span><span className="shrink-0 capitalize">{fmtDue(due)}</span></p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Tarjeta de la persona */}
      {sel && (
        <div onClick={(e) => e.stopPropagation()} className="absolute left-1/2 bottom-5 -translate-x-1/2 z-10 w-[min(360px,calc(100%-32px))] rounded-3xl border border-white/15 bg-[#140a2b]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,.55)] backdrop-blur-md plaza-in">
          <button type="button" onClick={() => setSelected(null)} className="absolute right-3 top-3 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-3.5 h-3.5" /></button>
          <div className="flex items-center gap-3">
            {sel.user.avatarUrl ? <img src={sel.user.avatarUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border border-white/15" /> : <div className="w-12 h-12 rounded-2xl bg-[#501f92] flex items-center justify-center font-black text-white">{sel.user.initials}</div>}
            <div className="min-w-0">
              <p className="font-black text-[15px] text-white leading-tight truncate">{sel.user.name}</p>
              <p className="text-[11px] text-white/60 truncate">{sel.user.jobTitle || ''}</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-white/[.06] px-3 py-2.5">
            {sel.kind === 'trabajando' ? (
              <>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/50">{sel.work?.verb}</p>
                <p className="text-sm font-black text-white leading-snug">{sel.work?.task}</p>
                <p className="text-[11px] text-white/60">{sel.work?.project}{sel.work?.client ? ` · ${sel.work.client}` : ''}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-white">📅 En reunión hasta las {sel.until}</p>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { onKnock(sel); setSelected(null); }} className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#d4ff3f] text-[#1a0f30] py-2 text-xs font-black hover:brightness-110 cursor-pointer"><Hand className="w-4 h-4" /> Toc toc</button>
            <button type="button" onClick={() => { onCoffeeLater(sel); setSelected(null); }} className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white py-2 text-xs font-black cursor-pointer"><Coffee className="w-4 h-4 text-[#fbbf24]" /> Café al terminar</button>
          </div>
          <p className="mt-2 text-[10.5px] text-white/45 text-center">«Toc toc» le deja un aviso corto; lo ve cuando termine su bloque.</p>
        </div>
      )}
    </div>
  );
};
