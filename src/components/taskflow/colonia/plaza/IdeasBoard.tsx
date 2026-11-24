/**
 * Café de ideas (§32.19 y §32.20): el edificio del Café es el tablero de retos y de «Aprendí esto».
 * Asíncrono: se lanza, se suma, se aporta y se vota a cualquier hora.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Flag, Lightbulb, Plus, ThumbsUp, Trophy, Video } from 'lucide-react';
import { UserItem } from '../../types';
import {
  IDEAS_EVENT, Challenge, ChallengeKind, LAUNCHER_BONUS, MAX_PRIZED_PER_MONTH, PARTICIPATION, PRIZES, HELP_COINS,
  cancelChallenge, capsulePays, closeChallenge, defaultClosesOn, joinChallenge, launchChallenge, loadIdeas, markHelped,
  prizedThisMonth, publishCapsule, submitEntry, toggleVote, CapsuleKind, CAPSULE_KIND_LABEL, capsuleKind, courseCoins,
  SPECIALIZATION_COINS, validateSpecialization, cheerCapsule
} from './ideasStore';
import { drivePreview } from '../../decisions/decisionStore';

export const useIdeasVersion = () => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const on = () => setV((x) => x + 1);
    window.addEventListener(IDEAS_EVENT, on);
    return () => window.removeEventListener(IDEAS_EVENT, on);
  }, []);
  return v;
};

const field = 'w-full rounded-xl border border-white/15 bg-white/[.07] px-2.5 py-2 text-xs text-white placeholder:text-white/35 outline-none focus:border-[#d4ff3f]';
const first = (n: string) => n.split(' ')[0];
const fmtDay = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }); };

export const IdeasBoard: React.FC<{ me: UserItem; projectNames: string[]; onToast: (m: string) => void; initialTab?: 'retos' | 'aprendi' }> = ({ me, projectNames, onToast, initialTab = 'retos' }) => {
  const v = useIdeasVersion();
  const ideas = useMemo(() => loadIdeas(), [v]);
  const [tab, setTab] = useState<'retos' | 'aprendi'>(initialTab);
  const person = { id: me.id, name: me.name };
  const open = ideas.challenges.filter((c) => c.status === 'abierto');
  const closed = ideas.challenges.filter((c) => c.status === 'cerrado').slice(0, 3);

  return (
    <div className="text-white">
      <div className="flex items-center gap-1 rounded-2xl bg-white/[.06] p-1">
        <button type="button" onClick={() => setTab('retos')} className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black cursor-pointer ${tab === 'retos' ? 'bg-[#d4ff3f] text-[#1a0f30]' : 'text-white/75 hover:bg-white/10'}`}><Flag className="w-3.5 h-3.5" /> Retos {open.length > 0 && `· ${open.length}`}</button>
        <button type="button" onClick={() => setTab('aprendi')} className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black cursor-pointer ${tab === 'aprendi' ? 'bg-[#d4ff3f] text-[#1a0f30]' : 'text-white/75 hover:bg-white/10'}`}><Lightbulb className="w-3.5 h-3.5" /> Aprendí esto {ideas.capsules.length > 0 && `· ${ideas.capsules.length}`}</button>
      </div>
      {tab === 'retos' ? (
        <div className="mt-3 space-y-2.5">
          <NewChallenge me={person} projectNames={projectNames} onToast={onToast} />
          {open.length === 0 && <p className="rounded-2xl border border-dashed border-white/15 p-4 text-center text-xs text-white/60">No hay retos abiertos. ¿Tienes una idea? Lánzala: cualquiera puede sumarse cuando quiera.</p>}
          {open.map((c) => <ChallengeCard key={c.id} c={c} me={person} onToast={onToast} />)}
          {closed.length > 0 && <p className="pt-1 text-[11px] font-bold uppercase tracking-wider text-white/45">Cerrados hace poco</p>}
          {closed.map((c) => <ChallengeCard key={c.id} c={c} me={person} onToast={onToast} />)}
        </div>
      ) : (
        <Capsules me={person} isDirection={['executive', 'system_admin'].includes(String(me.accessLevel || ''))} capsules={ideas.capsules} onToast={onToast} />
      )}
    </div>
  );
};

// ── Lanzar un reto ───────────────────────────────────────────────────────
const NewChallenge: React.FC<{ me: { id: string; name: string }; projectNames: string[]; onToast: (m: string) => void }> = ({ me, projectNames, onToast }) => {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ChallengeKind>('trabajo');
  const [title, setTitle] = useState('');
  const [doneWhen, setDoneWhen] = useState('');
  const [closesOn, setClosesOn] = useState(defaultClosesOn());
  const [project, setProject] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const left = MAX_PRIZED_PER_MONTH - prizedThisMonth(me.id);
  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 py-2.5 text-xs font-black cursor-pointer"><Plus className="w-4 h-4" /> Lanzar un reto</button>;
  }
  const send = () => {
    const r = launchChallenge(me, { kind, title, doneWhen, closesOn, projectName: project });
    if (!r.ok) { setErr(r.error); return; }
    setOpen(false); setTitle(''); setDoneWhen(''); setProject(''); setErr(null);
    onToast(r.challenge.prized ? 'Reto lanzado. Ya aparece en el Café para todo el equipo.' : 'Reto lanzado sin premio: ya usaste tus 4 retos con premio de este mes.');
  };
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[.05] p-3 space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        {(['trabajo', 'aprendizaje'] as ChallengeKind[]).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} className={`rounded-xl py-1.5 text-[11px] font-bold cursor-pointer ${kind === k ? 'bg-white text-[#1a0f30]' : 'bg-white/10 text-white/80'}`}>{k === 'trabajo' ? '🛠️ De trabajo' : '📚 De aprendizaje'}</button>
        ))}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === 'trabajo' ? '¿Quién propone 3 nombres para la campaña de BattSaver?' : 'Comparte un atajo de Figma que nadie conozca'} className={field} />
      <textarea rows={2} value={doneWhen} onChange={(e) => setDoneWhen(e.target.value)} placeholder="¿Qué cuenta como hecho? Ej.: 3 nombres con una frase de por qué." className={`${field} resize-none`} />
      <div className="grid grid-cols-2 gap-1.5">
        <label className="text-[10.5px] text-white/60">Cierra el
          <input type="date" value={closesOn} onChange={(e) => setClosesOn(e.target.value)} className={`${field} mt-0.5 [color-scheme:dark]`} />
        </label>
        <label className="text-[10.5px] text-white/60">Proyecto (opcional)
          <select value={project} onChange={(e) => setProject(e.target.value)} className={`${field} mt-0.5 bg-[#1c1036]`}>
            <option value="">Ninguno</option>
            {projectNames.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
      </div>
      <p className="text-[10.5px] text-white/55 leading-snug">
        Premio: 1º {PRIZES[0]} · 2º {PRIZES[1]} · 3º {PRIZES[2]} ECOINS · cada aporte {PARTICIPATION}. Tú ganas {LAUNCHER_BONUS} si se suman 2 o más personas.{' '}
        {kind === 'trabajo' ? 'Al cerrar, tú eliges el podio.' : 'El podio sale de los votos.'} Te quedan {Math.max(0, left)} de {MAX_PRIZED_PER_MONTH} retos con premio este mes.
      </p>
      {err && <p className="text-[11px] text-[#fda4af]">{err}</p>}
      <div className="flex justify-end gap-1.5">
        <button type="button" onClick={() => { setOpen(false); setErr(null); }} className="rounded-xl px-3 py-1.5 text-[11px] font-bold text-white/70 hover:bg-white/10 cursor-pointer">Cancelar</button>
        <button type="button" onClick={send} className="rounded-xl bg-[#d4ff3f] px-3 py-1.5 text-[11px] font-black text-[#1a0f30] cursor-pointer">Lanzar reto</button>
      </div>
    </div>
  );
};

// ── Tarjeta de un reto ───────────────────────────────────────────────────
const ChallengeCard: React.FC<{ c: Challenge; me: { id: string; name: string }; onToast: (m: string) => void }> = ({ c, me, onToast }) => {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [podium, setPodium] = useState<string[]>(['', '', '']);
  const mine = c.creator.id === me.id;
  const joined = c.joined.some((p) => p.id === me.id);
  const myEntry = c.entries.find((e) => e.user.id === me.id);
  const isOpen = c.status === 'abierto';
  const overdue = isOpen && c.closesOn < new Date().toISOString().slice(0, 10);
  const send = () => {
    const e = submitEntry(c.id, me, text, url);
    if (e) { setErr(e); return; }
    setText(''); setUrl(''); setErr(null);
    onToast(`Aporte enviado. ${first(c.creator.name)} lo verá en el Café.`);
  };
  const doClose = () => {
    if (c.kind === 'trabajo' && c.entries.length && !podium[0]) { setErr('Elige al menos el 1er lugar.'); return; }
    closeChallenge(c.id, podium.filter(Boolean));
    setClosing(false);
    onToast('Reto cerrado. Los ECOINS ya están en el libro de cada persona.');
  };
  const place = (id: string) => (c.podium || []).indexOf(id);
  return (
    <div className={`rounded-2xl border p-3 ${isOpen ? 'border-white/15 bg-white/[.05]' : 'border-white/5 bg-white/[.03]'}`}>
      <button type="button" onClick={() => setExpanded((x) => !x)} className="w-full text-left text-white cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-black leading-snug text-white">{c.kind === 'trabajo' ? '🛠️' : '📚'} {c.title}</p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${isOpen ? (overdue ? 'bg-[#f59e0b]/25 text-[#fcd34d]' : 'bg-[#d4ff3f]/15 text-[#d4ff3f]') : 'bg-white/10 text-white/60'}`}>{isOpen ? (overdue ? 'Por cerrar' : `Cierra ${fmtDay(c.closesOn)}`) : 'Cerrado'}</span>
        </div>
        <p className="mt-0.5 text-[10.5px] text-white/55">{first(c.creator.name)}{c.projectName ? ` · ${c.projectName}` : ''} · {c.joined.length} {c.joined.length === 1 ? 'se sumó' : 'se sumaron'} · {c.entries.length} {c.entries.length === 1 ? 'aporte' : 'aportes'}{!c.prized ? ' · sin premio' : ''}</p>
      </button>
      {!isOpen && c.podium && c.podium.length > 0 && (
        <p className="mt-1.5 text-[11px] text-white/80"><Trophy className="inline w-3.5 h-3.5 text-[#fbbf24]" /> {c.podium.map((pid, i) => `${i + 1}º ${first(c.entries.find((e) => e.id === pid)?.user.name || '')}`).join(' · ')}</p>
      )}
      {(expanded || (isOpen && joined && !myEntry)) && (
        <div className="mt-2 space-y-2">
          <p className="text-[11px] text-white/70"><span className="font-bold text-white/90">Cuenta como hecho:</span> {c.doneWhen}</p>
          {c.entries.map((e) => (
            <div key={e.id} className="rounded-xl bg-white/[.06] px-2.5 py-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-white/85 leading-snug"><span className="font-bold">{first(e.user.name)}{place(e.id) >= 0 ? ` · ${place(e.id) + 1}º` : ''}:</span> {e.text}</p>
                <button type="button" disabled={!isOpen || e.user.id === me.id} onClick={() => toggleVote(c.id, e.id, me)} className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10.5px] font-bold ${e.votes.includes(me.id) ? 'bg-[#d4ff3f] text-[#1a0f30]' : 'bg-white/10 text-white/80'} disabled:opacity-50 cursor-pointer`} title={e.user.id === me.id ? 'No puedes votar tu aporte' : 'Votar'}><ThumbsUp className="w-3 h-3" /> {e.votes.length}</button>
              </div>
              {e.url && <a href={e.url} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-[10.5px] font-semibold text-[#d4ff3f] underline">{e.url}</a>}
            </div>
          ))}
          {isOpen && !mine && !myEntry && (
            joined ? (
              <div className="space-y-1.5">
                <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tu aporte" className={`${field} resize-none`} />
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enlace (opcional): Figma, Drive, video de Meet…" className={field} />
                {err && <p className="text-[11px] text-[#fda4af]">{err}</p>}
                <button type="button" onClick={send} className="w-full rounded-xl bg-[#d4ff3f] py-1.5 text-[11px] font-black text-[#1a0f30] cursor-pointer">Enviar mi aporte</button>
              </div>
            ) : (
              <button type="button" onClick={() => { joinChallenge(c.id, me); onToast(`Te sumaste. Envía tu aporte antes del ${fmtDay(c.closesOn)}.`); }} className="w-full rounded-xl bg-[#d4ff3f] py-1.5 text-[11px] font-black text-[#1a0f30] cursor-pointer">Me uno al reto</button>
            )
          )}
          {isOpen && mine && (
            closing ? (
              <div className="space-y-1.5 rounded-xl bg-white/[.06] p-2">
                {c.kind === 'trabajo' && c.entries.length > 0 ? (
                  [0, 1, 2].slice(0, Math.min(3, c.entries.length)).map((i) => (
                    <select key={i} value={podium[i]} onChange={(e) => setPodium((p) => p.map((x, j) => (j === i ? e.target.value : x)))} className={`${field} bg-[#1c1036]`}>
                      <option value="">{i + 1}º lugar{i > 0 ? ' (opcional)' : ''}</option>
                      {c.entries.map((e) => <option key={e.id} value={e.id}>{first(e.user.name)}: {e.text.slice(0, 40)}</option>)}
                    </select>
                  ))
                ) : (
                  <p className="text-[11px] text-white/70">{c.entries.length ? 'El podio sale de los votos.' : 'No hubo aportes.'}</p>
                )}
                {err && <p className="text-[11px] text-[#fda4af]">{err}</p>}
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setClosing(false)} className="flex-1 rounded-xl bg-white/10 py-1.5 text-[11px] font-bold cursor-pointer">Volver</button>
                  <button type="button" onClick={doClose} className="flex-1 rounded-xl bg-[#d4ff3f] py-1.5 text-[11px] font-black text-[#1a0f30] cursor-pointer">Cerrar y premiar</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setClosing(true)} className="flex-1 rounded-xl bg-white/10 hover:bg-white/20 py-1.5 text-[11px] font-black cursor-pointer">Cerrar el reto</button>
                {c.entries.length === 0 && <button type="button" onClick={() => { cancelChallenge(c.id); onToast('Reto cancelado.'); }} className="rounded-xl px-3 py-1.5 text-[11px] font-bold text-white/60 hover:bg-white/10 cursor-pointer">Cancelar</button>}
              </div>
            )
          )}
          {myEntry && isOpen && <p className="text-[10.5px] text-white/55">Ya enviaste tu aporte. Puedes votar los de los demás.</p>}
        </div>
      )}
    </div>
  );
};

// ── «Aprendí esto»: tips, cursos y especializaciones ─────────────────────
const KIND_ICON: Record<CapsuleKind, string> = { tip: '💡', curso: '🎓', especializacion: '🏅' };
const KIND_HELP: Record<CapsuleKind, string> = {
  tip: `Un truco, un video corto o un recurso. Cada persona a la que le sirva te da ${HELP_COINS} ECOINS (máx. 30 por tip; 2 tips por semana dan ECOINS).`,
  curso: `Con certificado. Al publicarlo ganas ECOINS por duración: hasta 4 h 10 · hasta 20 h 25 · más de 20 h 50 (2 cursos al mes dan ECOINS).`,
  especializacion: `Con diploma. Dirección lo valida: ${SPECIALIZATION_COINS} ECOINS y desbloqueas un almuerzo en familia 🍽️.`
};
const Capsules: React.FC<{ me: { id: string; name: string }; isDirection: boolean; capsules: ReturnType<typeof loadIdeas>['capsules']; onToast: (m: string) => void }> = ({ me, isDirection, capsules, onToast }) => {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<CapsuleKind>('tip');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [video, setVideo] = useState('');
  const [platform, setPlatform] = useState('');
  const [hours, setHours] = useState('');
  const [cert, setCert] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [watch, setWatch] = useState<string | null>(null);
  const [filter, setFilter] = useState<'todo' | 'tips' | 'diplomas'>('todo');
  const reset = () => { setOpen(false); setTitle(''); setBody(''); setVideo(''); setPlatform(''); setHours(''); setCert(''); setErr(null); };
  const send = () => {
    const e = publishCapsule(me, title, body, video, { kind, platform, hours: Number(hours) || undefined, certificateUrl: cert });
    if (e) { setErr(e); return; }
    reset();
    onToast(kind === 'tip' ? 'Publicado. Cada «Me sirvió» te da ECOINS.' : kind === 'curso' ? `¡Felicitaciones! Ya está en el muro de diplomas y sumaste ${courseCoins(Number(hours))} ECOINS.` : 'Publicado. Dirección lo valida y desbloqueas tu almuerzo en familia.');
  };
  const list = capsules.filter((c) => filter === 'todo' || (filter === 'tips' ? capsuleKind(c) === 'tip' : capsuleKind(c) !== 'tip'));
  return (
    <div className="mt-3 space-y-2.5">
      {open ? (
        <div className="rounded-2xl border border-white/15 bg-white/[.05] p-3 space-y-2">
          <div className="grid grid-cols-3 gap-1">
            {(['tip', 'curso', 'especializacion'] as CapsuleKind[]).map((k) => (
              <button key={k} type="button" onClick={() => { setKind(k); setErr(null); }} className={`rounded-xl px-1 py-1.5 text-[10.5px] font-bold cursor-pointer ${kind === k ? 'bg-white text-[#1a0f30]' : 'bg-white/10 text-white/80'}`}>{KIND_ICON[k]} {k === 'tip' ? 'Tip o recurso' : k === 'curso' ? 'Curso' : 'Especialización'}</button>
            ))}
          </div>
          <p className="text-[10.5px] text-white/55">{KIND_HELP[kind]}</p>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === 'tip' ? 'Título. Ej.: Cómo exportar desde Figma sin perder calidad' : kind === 'curso' ? 'Nombre del curso. Ej.: Figma avanzado: sistemas de diseño' : 'Nombre del programa. Ej.: Especialización en Gerencia de Proyectos'} className={field} />
          {kind !== 'tip' && (
            <div className="grid grid-cols-[1fr_88px] gap-1.5">
              <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder={kind === 'curso' ? 'Dónde: Platzi, Coursera…' : 'Institución'} className={field} />
              <input value={hours} onChange={(e) => setHours(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder="Horas" className={field} />
            </div>
          )}
          {kind !== 'tip' && <input value={cert} onChange={(e) => setCert(e.target.value)} placeholder="Enlace del certificado o diploma (obligatorio)" className={field} />}
          <textarea rows={kind === 'tip' ? 4 : 2} value={body} onChange={(e) => setBody(e.target.value)} placeholder={kind === 'tip' ? 'Qué aprendiste y cómo se hace, en tus palabras.' : 'Qué te llevas y cómo lo vas a usar en Uhura.'} className={`${field} resize-none`} />
          {kind === 'tip' && <input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="Video de Meet de 2 a 5 min (enlace de Drive, opcional)" className={field} />}
          {err && <p className="text-[11px] text-[#fda4af]">{err}</p>}
          <div className="flex justify-end gap-1.5">
            <button type="button" onClick={reset} className="rounded-xl px-3 py-1.5 text-[11px] font-bold text-white/70 hover:bg-white/10 cursor-pointer">Cancelar</button>
            <button type="button" onClick={send} className="rounded-xl bg-[#d4ff3f] px-3 py-1.5 text-[11px] font-black text-[#1a0f30] cursor-pointer">Publicar</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 py-2.5 text-xs font-black cursor-pointer"><Plus className="w-4 h-4" /> Compartir lo que aprendí</button>
      )}
      {capsules.length > 0 && (
        <div className="flex gap-1">
          {([['todo', 'Todo'], ['tips', '💡 Tips'], ['diplomas', '🎓 Cursos y diplomas']] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold cursor-pointer ${filter === k ? 'bg-[#d4ff3f] text-[#1a0f30]' : 'bg-white/10 text-white/75'}`}>{l}</button>
          ))}
        </div>
      )}
      {capsules.length === 0 && !open && <p className="rounded-2xl border border-dashed border-white/15 p-4 text-center text-xs text-white/60">Nadie ha compartido todavía. Un tip, un curso o un diploma: lo que aprendiste le sirve a todo el equipo.</p>}
      {list.map((cap) => {
        const k = capsuleKind(cap);
        const mineCap = cap.author.id === me.id;
        const helped = cap.helped.includes(me.id);
        const cheered = (cap.cheers || []).includes(me.id);
        const preview = cap.videoUrl ? drivePreview(cap.videoUrl) : null;
        const pending = k === 'especializacion' && !cap.validatedAt;
        return (
          <div key={cap.id} className={`rounded-2xl border p-3 ${k === 'tip' ? 'border-white/10 bg-white/[.05]' : 'border-[#fbbf24]/30 bg-[#fbbf24]/[.07]'}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-black leading-snug text-white">{KIND_ICON[k]} {cap.title}</p>
              {k !== 'tip' && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${pending ? 'bg-white/10 text-white/70' : 'bg-[#fbbf24]/25 text-[#fcd34d]'}`}>{pending ? 'Por validar' : CAPSULE_KIND_LABEL[k]}</span>}
            </div>
            <p className="mt-0.5 text-[10.5px] text-white/55">
              {first(cap.author.name)} · {new Date(cap.at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
              {k !== 'tip' && ` · ${cap.platform} · ${cap.hours} h`}
              {k === 'tip' && !capsulePays(cap, capsules) ? ' · no suma ECOINS (tope semanal)' : ''}
              {cap.validatedBy ? ` · validó ${first(cap.validatedBy)}` : ''}
            </p>
            <p className="mt-1.5 text-[11.5px] text-white/85 leading-snug whitespace-pre-line">{cap.body}</p>
            {cap.certificateUrl && <a href={cap.certificateUrl} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-[11px] font-bold text-[#d4ff3f] underline">Ver certificado</a>}
            {preview && (watch === cap.id ? (
              <div className="mt-2 aspect-video overflow-hidden rounded-xl bg-black"><iframe title={cap.title} src={preview} className="h-full w-full" allow="autoplay; fullscreen" allowFullScreen /></div>
            ) : (
              <button type="button" onClick={() => setWatch(cap.id)} className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-2.5 py-1.5 text-[11px] font-bold cursor-pointer"><Video className="w-3.5 h-3.5" /> Ver el video</button>
            ))}
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[10.5px] text-white/55">
                {k === 'tip' ? `${cap.helped.length} ${cap.helped.length === 1 ? 'persona dice' : 'personas dicen'} que le sirvió` : `${(cap.cheers || []).length} ${(cap.cheers || []).length === 1 ? 'felicitación' : 'felicitaciones'}`}
              </span>
              <div className="flex gap-1.5">
                {pending && isDirection && !mineCap && (
                  <button type="button" onClick={() => { validateSpecialization(cap.id, me); onToast(`Validada. ${first(cap.author.name)} suma ${SPECIALIZATION_COINS} ECOINS y su almuerzo en familia.`); }} className="rounded-xl bg-[#fbbf24] px-2.5 py-1 text-[11px] font-black text-[#1a0f30] cursor-pointer">Validar</button>
                )}
                {!mineCap && k === 'tip' && (
                  <button type="button" disabled={helped} onClick={() => { markHelped(cap.id, me); onToast(`Gracias. ${first(cap.author.name)} lo verá en su libro de ECOINS.`); }} className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-black cursor-pointer ${helped ? 'bg-white/10 text-white/60' : 'bg-[#d4ff3f] text-[#1a0f30]'}`}><ThumbsUp className="w-3.5 h-3.5" /> {helped ? 'Te sirvió' : 'Me sirvió'}</button>
                )}
                {!mineCap && k !== 'tip' && (
                  <button type="button" disabled={cheered} onClick={() => { cheerCapsule(cap.id, me); onToast(`Le llegó tu felicitación a ${first(cap.author.name)} 👏`); }} className={`rounded-xl px-2.5 py-1 text-[11px] font-black cursor-pointer ${cheered ? 'bg-white/10 text-white/60' : 'bg-[#d4ff3f] text-[#1a0f30]'}`}>{cheered ? 'Felicitaste' : '👏 Felicitar'}</button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
