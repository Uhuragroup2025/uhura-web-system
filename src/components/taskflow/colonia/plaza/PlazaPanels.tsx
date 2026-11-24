/**
 * ============================================================================
 * LA PLAZA · PANELES: COFRE, COLECCIÓN Y ESCENARIO (ECO BY UHURA) — PROTOTIPO
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { Collectible, RARITY, COLLECTION, RewardsState } from './plazaRewards';
import { SharedMedia } from './plazaPresence';
import { PlazaCharacter } from './plazaWorld';
import { playTapSound, playScoreChime } from '../coloniaAudio';
import { X, ExternalLink, Copy, Link2, Headphones, Check } from 'lucide-react';

const PANEL_CSS = `
@keyframes chest-shake { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-7deg) } 40% { transform: rotate(7deg) } 60% { transform: rotate(-5deg) } 80% { transform: rotate(5deg) } }
@keyframes chest-burst { from { transform: scale(.2); opacity: 0 } 60% { transform: scale(1.15); opacity: 1 } to { transform: scale(1); opacity: 1 } }
@keyframes chest-rays { from { transform: rotate(0) } to { transform: rotate(360deg) } }
@keyframes chest-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
`;

// ── Cofre ────────────────────────────────────────────────────────────────
export const ChestModal: React.FC<{
  onOpen: () => { item: Collectible; duplicate: boolean; coins: number };
  onClose: () => void;
  onEquip: (id: string) => void;
}> = ({ onOpen, onClose, onEquip }) => {
  const [phase, setPhase] = useState<'closed' | 'shaking' | 'open'>('closed');
  const [result, setResult] = useState<{ item: Collectible; duplicate: boolean; coins: number } | null>(null);

  const open = () => {
    if (phase !== 'closed') return;
    playTapSound();
    setPhase('shaking');
    window.setTimeout(() => {
      setResult(onOpen());
      setPhase('open');
      playScoreChime();
    }, 1100);
  };

  const r = result ? RARITY[result.item.rarity] : null;
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#0a0418]/80 backdrop-blur-md p-4" onClick={phase === 'open' ? onClose : undefined}>
      <style>{PANEL_CSS}</style>
      <div onClick={(e) => e.stopPropagation()} className="plaza-in relative w-full max-w-sm overflow-hidden rounded-[30px] border border-white/15 bg-gradient-to-b from-[#24124a] to-[#120826] p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,.6)]">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-4 h-4" /></button>
        <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#d4ff3f]">Cofre de ECO</p>
        <h3 className="mt-1 text-xl font-black text-white">{phase === 'open' ? (result?.duplicate ? '¡Repetido! Te lo cambio por ECOINS' : '¡Nuevo para tu colección!') : '¿Qué habrá adentro?'}</h3>

        <div className="relative mx-auto mt-6 mb-4 h-40 w-40 flex items-center justify-center">
          {phase === 'open' && r && (
            <div className="absolute inset-[-40px] rounded-full pointer-events-none" style={{ background: `repeating-conic-gradient(from 0deg, ${r.color}33 0 10deg, transparent 10deg 30deg)`, animation: 'chest-rays 8s linear infinite', maskImage: 'radial-gradient(circle, black 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)' }} />
          )}
          {phase !== 'open' ? (
            <button type="button" onClick={open} className="relative text-[96px] leading-none cursor-pointer select-none" style={{ animation: phase === 'shaking' ? 'chest-shake .35s ease-in-out infinite' : 'chest-float 2s ease-in-out infinite', filter: 'drop-shadow(0 0 24px rgba(251,191,36,.6))' }} aria-label="Abrir cofre">
              🎁
            </button>
          ) : result && r ? (
            <div className="relative" style={{ animation: 'chest-burst .5s cubic-bezier(.2,1.4,.4,1) both' }}>
              <div className="text-[84px] leading-none" style={{ filter: `drop-shadow(0 0 22px ${r.color})` }}>{result.item.emoji}</div>
            </div>
          ) : null}
        </div>

        {phase === 'open' && result && r ? (
          <>
            <span className="inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider" style={{ background: `${r.color}26`, color: r.color, border: `1px solid ${r.color}66` }}>{r.label}</span>
            <p className="mt-2 text-lg font-black text-white">{result.item.name}</p>
            <p className="mt-1 text-sm text-white/70">+{result.coins} ECOINS 🪙</p>
            <div className="mt-5 flex gap-2">
              {!result.duplicate && (
                <button type="button" onClick={() => { onEquip(result.item.id); onClose(); }} className="flex-1 rounded-2xl bg-gradient-to-r from-[#d4ff3f] to-[#3dd9eb] py-3 text-sm font-black text-[#1a0f30] cursor-pointer hover:brightness-110">Ponérmelo</button>
              )}
              <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-white/10 hover:bg-white/20 py-3 text-sm font-black text-white cursor-pointer">Listo</button>
            </div>
          </>
        ) : (
          <p className="text-sm text-white/60">{phase === 'shaking' ? 'Abriendo…' : 'Toca el cofre para abrirlo.'}</p>
        )}
        <p className="mt-4 text-[10.5px] text-white/40">El cofre del día se gana con tu primera contribución del día. Si el equipo cumple la misión de la semana, todos ganan uno extra.</p>
      </div>
    </div>
  );
};

// ── Colección ────────────────────────────────────────────────────────────
export const CollectionPanel: React.FC<{
  rewards: RewardsState;
  title: string | null;
  onEquip: (id: string | null) => void;
}> = ({ rewards, title, onEquip }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Mi colección · {rewards.owned.length}/{COLLECTION.length}</p>
      {title && <span className="rounded-full bg-[#fbbf24]/15 border border-[#fbbf24]/40 px-2.5 py-0.5 text-[10.5px] font-black text-[#fbbf24]">🏅 {title}</span>}
    </div>
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-[#d4ff3f] to-[#3dd9eb]" style={{ width: `${(rewards.owned.length / COLLECTION.length) * 100}%` }} />
    </div>
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
      {COLLECTION.map((c) => {
        const have = rewards.owned.includes(c.id);
        const on = rewards.equipped === c.id;
        const col = RARITY[c.rarity].color;
        return (
          <button
            key={c.id}
            type="button"
            disabled={!have}
            onClick={() => { playTapSound(); onEquip(on ? null : c.id); }}
            title={have ? `${c.name} · ${RARITY[c.rarity].label}` : `??? · ${RARITY[c.rarity].label}`}
            className={`relative aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${have ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'} ${on ? 'ring-2 ring-[#d4ff3f]' : ''}`}
            style={{ background: have ? `${col}1f` : 'rgba(255,255,255,.04)', border: `1px solid ${have ? `${col}66` : 'rgba(255,255,255,.08)'}` }}
          >
            <span style={{ filter: have ? 'none' : 'grayscale(1) brightness(.25)' }}>{c.emoji}</span>
            {on && <Check className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4ff3f] text-[#1a0f30] p-0.5" />}
          </button>
        );
      })}
    </div>
    <p className="text-[10.5px] text-white/45">Toca un objeto para ponértelo o quitártelo. Los que faltan salen de los cofres.</p>
  </div>
);

// ── Escenario: lista del día (Spotify y YouTube) ─────────────────────────
/** `byId` y `likes` van por id de usuario (no por nombre: dos personas pueden llamarse igual). */
export interface StageShare { id: string; media: SharedMedia; byName: string; byId?: string; at: string; title?: string; thumb?: string; likes: string[] }

/** Título y portada con el oEmbed público (sin cuenta). Si falla, se usa el texto genérico. */
export const fetchMediaInfo = async (m: SharedMedia): Promise<{ title?: string; thumb?: string }> => {
  try {
    const endpoint = m.kind === 'spotify'
      ? `https://open.spotify.com/oembed?url=${encodeURIComponent(m.url)}`
      : `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(m.url)}`;
    const ctrl = new AbortController();
    const id = window.setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(endpoint, { signal: ctrl.signal });
    window.clearTimeout(id);
    if (!r.ok) return {};
    const j = await r.json();
    return { title: j.title, thumb: j.thumbnail_url };
  } catch {
    return {};
  }
};

const genericTitle = (m: SharedMedia) => (m.kind === 'spotify' ? `${m.label} de Spotify` : `${m.label} de YouTube`);
const article = (m: SharedMedia) => (['Canción', 'Playlist', 'Lista de videos'].includes(m.label) ? 'compartida' : 'compartido');

export const StagePanel: React.FC<{
  list: StageShare[];
  me: string;
  audience: PlazaCharacter[];
  draft: string;
  error: string | null;
  onDraft: (v: string) => void;
  onSave: () => void;
  onLike: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}> = ({ list, me, audience, draft, error, onDraft, onSave, onLike, onRemove, onClose }) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const current = list.find((x) => x.id === playing) || null;
  const isVideo = current?.media.kind === 'youtube';
  const isTouch = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
  const copy = async (x: StageShare) => {
    try { await navigator.clipboard.writeText(x.media.url); setCopied(x.id); window.setTimeout(() => setCopied(null), 1600); } catch { /* sin portapapeles */ }
  };
  const time = (iso: string) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0a0418]/70 backdrop-blur-sm p-3 sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`plaza-in relative w-full ${isVideo ? 'max-w-3xl' : 'max-w-md'} max-h-full overflow-y-auto rounded-[28px] border border-white/15 bg-gradient-to-b from-[#1c0f3a] to-[#120826] p-4 sm:p-5 shadow-[0_30px_80px_rgba(0,0,0,.6)]`}>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-3 pr-8">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center border bg-[#1db954]/20 border-[#1db954]/40"><Headphones className="w-5 h-5 text-[#4ade80]" /></div>
          <div className="min-w-0">
            <h3 className="font-black text-lg leading-tight text-white">Escenario</h3>
            <p className="text-xs text-white/60">La lista del equipo de hoy · {list.length} {list.length === 1 ? 'enlace' : 'enlaces'}</p>
          </div>
        </div>

        {/* Agregar */}
        <div className="mt-4">
          <label htmlFor="plaza-playlist" className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Agrega una canción o un video</label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="plaza-playlist"
              value={draft}
              onChange={(e) => onDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSave(); }}
              placeholder="Enlace de Spotify o YouTube"
              className="min-w-0 flex-1 rounded-xl border border-white/10 px-3 py-2 text-xs placeholder:text-white/35 outline-none focus:border-[#d4ff3f]"
              style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }}
            />
            <button type="button" onClick={onSave} className="shrink-0 rounded-xl bg-[#d4ff3f] text-[#0a0418] px-3 py-2 text-xs font-black hover:brightness-110 cursor-pointer">Agregar</button>
          </div>
          {error && <p className="mt-1.5 text-[11px] text-[#fda4af]">{error}</p>}
        </div>

        {/* Reproductor bajo demanda */}
        {current && (
          isVideo ? (
            <div className="mt-4 relative rounded-[22px] overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 0%, #3b1260 0%, #140826 70%)' }}>
              <div className="absolute inset-x-0 top-0 h-5 z-10" style={{ background: 'repeating-linear-gradient(90deg, #7f1d1d 0 14px, #991b1b 14px 28px)', boxShadow: '0 4px 12px rgba(0,0,0,.5)' }} />
              <div className="absolute left-0 top-0 bottom-16 w-6 z-10" style={{ background: 'linear-gradient(90deg, #7f1d1d, #b91c1c 60%, transparent)' }} />
              <div className="absolute right-0 top-0 bottom-16 w-6 z-10" style={{ background: 'linear-gradient(270deg, #7f1d1d, #b91c1c 60%, transparent)' }} />
              <div className="relative mx-6 mt-8 aspect-video rounded-lg overflow-hidden bg-[#140826]" style={{ boxShadow: '0 0 50px rgba(255,255,255,.15)' }}>
                {/* En celular no se reproduce solo: iOS/Android bloquean la reproducción automática dentro de otra página
                    y el video quedaba en negro. Se carga con playsinline y la persona toca ▶. */}
                <iframe
                  key={current.media.embed}
                  title="Video del equipo"
                  src={`${current.media.embed}${current.media.embed.includes('?') ? '&' : '?'}playsinline=1&modestbranding=1${isTouch ? '' : '&autoplay=1'}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <p className="relative mt-2 text-center text-[11px] text-white/60">
                {isTouch ? 'Toca ▶ para verlo. ' : ''}¿No carga? <a href={current.media.url} target="_blank" rel="noreferrer" className="font-bold text-[#d4ff3f] underline">Ábrelo en YouTube</a>
              </p>
              <div className="relative mt-3 pb-3 flex flex-col items-center gap-0.5">
                {[0, 1].map((row) => (
                  <div key={row} className="flex justify-center gap-1.5" style={{ transform: `scale(${1 + row * 0.08})` }}>
                    {Array.from({ length: 7 + row }, (_, i) => {
                      const who = audience[row * 7 + i];
                      return (
                        <div key={i} className="relative w-9 h-9">
                          {who && <img src={who.up || who.img} alt="" className="absolute left-1/2 -top-3 h-11 max-w-none -translate-x-1/2" />}
                          <div className="absolute inset-x-0 bottom-0 h-5 rounded-t-lg" style={{ background: 'linear-gradient(#9f1239, #6b0f2a)' }} />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl" style={{ background: '#1db95422' }}>
              <iframe title="Música del equipo en Spotify" src={current.media.embed} width="100%" height={current.media.label === 'Canción' ? 80 : 152} frameBorder={0} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="block" />
            </div>
          )
        )}

        {/* Lista del día */}
        <div className="mt-4 space-y-2">
          {list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/15 p-5 text-center">
              <p className="text-2xl">🎶</p>
              <p className="mt-1 text-sm font-bold text-white">La lista de hoy está vacía</p>
              <p className="text-xs text-white/55">Pega una canción, una playlist o un video y arranca la lista del equipo.</p>
            </div>
          )}
          {list.map((x) => {
            const on = playing === x.id;
            const liked = x.likes.includes(me);
            return (
              <div key={x.id} className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors ${on ? 'border-[#d4ff3f]/60 bg-white/[.08]' : 'border-white/5 bg-white/[.04]'}`}>
                <div className="relative w-11 h-11 shrink-0 overflow-hidden rounded-xl flex items-center justify-center" style={{ background: x.media.kind === 'spotify' ? '#1db95433' : '#ef444433' }}>
                  {x.thumb ? <img src={x.thumb} alt="" className="w-full h-full object-cover" /> : <span className="text-xl">{x.media.kind === 'spotify' ? '🎧' : '🎬'}</span>}
                  {on && <span className="absolute inset-0 flex items-end justify-center gap-[2px] pb-1 bg-black/35">{[0, 1, 2].map((b) => <span key={b} className="w-[3px] rounded-full bg-[#d4ff3f] animate-pulse" style={{ height: 6 + b * 4, animationDelay: `${b * 0.15}s` }} />)}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-white truncate">{x.title || genericTitle(x.media)}</p>
                  <p className="text-[11px] text-white/50 truncate">{x.media.label} {article(x.media)} por {x.byName} · {time(x.at)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => onLike(x.id)} title="Me gusta" className={`h-8 min-w-8 px-1.5 rounded-lg text-xs font-black cursor-pointer ${liked ? 'bg-[#f472b6]/25 text-[#f9a8d4]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>❤ {x.likes.length || ''}</button>
                  <button type="button" onClick={() => setPlaying(on ? null : x.id)} title={on ? 'Cerrar el reproductor' : 'Escuchar aquí'} className={`h-8 w-8 rounded-lg inline-flex items-center justify-center cursor-pointer ${on ? 'bg-[#d4ff3f] text-[#0a0418]' : 'bg-white/10 text-white hover:bg-white/20'}`}>{on ? <X className="w-4 h-4" /> : '▶'}</button>
                  <a href={x.media.url} target="_blank" rel="noopener noreferrer" title={`Abrir en ${x.media.kind === 'spotify' ? 'Spotify' : 'YouTube'}`} className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/10 text-white hover:bg-white/20"><ExternalLink className="w-4 h-4" /></a>
                  <button type="button" onClick={() => copy(x)} title="Copiar enlace" className="h-8 w-8 rounded-lg inline-flex items-center justify-center bg-white/10 text-white hover:bg-white/20 cursor-pointer">{copied === x.id ? <Check className="w-4 h-4 text-[#d4ff3f]" /> : <Copy className="w-4 h-4" />}</button>
                  {x.byId === me && <button type="button" onClick={() => { if (playing === x.id) setPlaying(null); onRemove(x.id); }} title="Quitar de la lista" className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 cursor-pointer"><X className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[10.5px] text-white/45 leading-snug">
          La lista se reinicia cada día. Cada persona escucha en su propio Spotify o YouTube: «▶» abre un reproductor pequeño aquí y «↗» lo abre en la app. Sin sesión de Spotify solo suenan 30 segundos.
        </p>
      </div>
    </div>
  );
};
