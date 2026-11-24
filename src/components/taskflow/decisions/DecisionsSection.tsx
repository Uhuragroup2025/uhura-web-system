/**
 * ============================================================================
 * DECISIONES EN LA TAREA (BACKEND_REQUIREMENTS §32.7) — PROTOTIPO
 * ============================================================================
 * Sección del detalle de la tarea: crear una decisión, responder como revisor,
 * objetar (anclado a una parte), atender objeciones, comentar y adjuntar un
 * video de Meet (2 a 5 min, enlace de Drive) con comentarios por minuto.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { TaskItem, UserItem } from '../types';
import {
  Decision, DecisionAnchor, DecisionPerson, DECISIONS_EVENT, addComment, addVideo, addVideoComment, businessHoursLeft,
  createDecision, decisionsForTask, discardDecision, drivePreview, isMinute, openObjections, resolveObjection, respond
} from './decisionStore';
import { Scale, Plus, X, Check, AlertTriangle, MessageSquare, Video, Clock, Trash2, Lock } from 'lucide-react';

/** Se vuelve a pintar cuando cambia cualquier decisión. */
export const useDecisionsVersion = () => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const on = () => setV((x) => x + 1);
    window.addEventListener(DECISIONS_EVENT, on);
    const id = window.setInterval(on, 60_000); // las ventanas vencen solas
    return () => { window.removeEventListener(DECISIONS_EVENT, on); window.clearInterval(id); };
  }, []);
  return v;
};

export const STATUS_META: Record<Decision['status'], { label: string; cls: string }> = {
  en_revision: { label: 'En revisión', cls: 'bg-[#ede9fe] text-[#5b21b6]' },
  aprobada: { label: 'Aprobada', cls: 'bg-[#dcfce7] text-[#166534]' },
  objeciones: { label: 'Hay objeciones: hablen 15 min', cls: 'bg-[#ffedd5] text-[#9a3412]' },
  descartada: { label: 'Descartada', cls: 'bg-[#f1f5f9] text-[#64748b]' }
};
const RESPONSE_LABEL = { agree: 'De acuerdo', objection: 'Objeción', no_comment: 'Sin comentarios' } as const;
const anchorLabel = (a?: DecisionAnchor) => (!a ? '' : a === 'problema' ? 'Problema' : a === 'recomendacion' ? 'Recomendación' : a === 'preguntas' ? 'Preguntas' : `Opción ${a.split('-')[1]}`);

interface Props {
  task: TaskItem;
  currentUser?: UserItem;
  users: UserItem[];
  /** Revisores por defecto: los de la tarea (por defecto, el Project Lead). */
  defaultReviewers: DecisionPerson[];
  onBlockTask?: (blocked: boolean, reasonText: string) => void;
  focus?: boolean;
}

export const DecisionsSection: React.FC<Props> = ({ task, currentUser, users, defaultReviewers, onBlockTask, focus }) => {
  useDecisionsVersion();
  const list = decisionsForTask(task.id);
  const [creating, setCreating] = useState(false);
  const me: DecisionPerson | null = currentUser ? { id: currentUser.id, name: currentUser.name } : null;
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => { if (focus) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [focus]);

  return (
    <div ref={ref} className="space-y-2 pt-1" id="task-decisions">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[#0f172a] text-xs flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-[#501f92]" /> Decisiones</span>
        {!creating && me && (
          <button type="button" onClick={() => setCreating(true)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-[#501f92] hover:bg-[#f5f3ff] cursor-pointer"><Plus className="w-3.5 h-3.5" /> Nueva decisión</button>
        )}
      </div>
      {list.length === 0 && !creating && (
        <p className="rounded-xl border border-dashed border-[#e2e8f0] px-3 py-2.5 text-[11px] text-[#64748b]">
          ¿Una duda o una propuesta? Escríbela aquí en vez de pedir una reunión. Los revisores responden en 24 o 48 horas hábiles; si nadie objeta, queda aprobada.
        </p>
      )}
      {creating && me && (
        <NewDecisionForm
          task={task}
          me={me}
          users={users}
          defaultReviewers={defaultReviewers}
          onCancel={() => setCreating(false)}
          onCreated={(d) => {
            setCreating(false);
            if (d.blocksTask) onBlockTask?.(true, `Esperando decisión: ${d.title}`);
          }}
        />
      )}
      {list.map((d) => <DecisionCard key={d.id} d={d} me={me} startOpen={!!me && d.status === 'en_revision' && d.reviewers.some((r) => r.id === me.id) && !d.responses[me.id]} />)}
    </div>
  );
};

const NewDecisionForm: React.FC<{ task: TaskItem; me: DecisionPerson; users: UserItem[]; defaultReviewers: DecisionPerson[]; onCancel: () => void; onCreated: (d: Decision) => void }> = ({ task, me, users, defaultReviewers, onCancel, onCreated }) => {
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [recommendation, setRecommendation] = useState('');
  const [questions, setQuestions] = useState('');
  const [reviewers, setReviewers] = useState<DecisionPerson[]>(defaultReviewers.filter((r) => r.id !== me.id));
  const [windowHours, setWindowHours] = useState<24 | 48>(48);
  const [blocksTask, setBlocksTask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const candidates = useMemo(() => users.filter((u) => u.status !== 'Inactive' && u.id !== me.id && !reviewers.some((r) => r.id === u.id)), [users, reviewers, me.id]);

  const submit = () => {
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (!title.trim() || !problem.trim() || opts.length < 2 || !recommendation.trim()) { setError('Completa el título, el problema, al menos 2 opciones y tu recomendación.'); return; }
    if (!reviewers.length) { setError('Agrega al menos un revisor.'); return; }
    const d = createDecision({
      taskId: task.id, taskTitle: task.title,
      projectKey: task.projectId || task.projectName || task.board || 'interno', projectName: task.projectName || task.board || 'Proyecto interno',
      title: title.trim(), problem: problem.trim(), options: opts, recommendation: recommendation.trim(),
      questions: questions.split('\n').map((q) => q.trim()).filter(Boolean),
      author: me, reviewers, windowHours, blocksTask
    });
    onCreated(d);
  };
  const field = 'w-full rounded-xl border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-xs text-[#0f172a] outline-none focus:border-[#8a4dff]';
  return (
    <div className="rounded-2xl border border-[#ddd6fe] bg-[#faf5ff] p-3 space-y-2 text-xs">
      <input className={field} placeholder="Título: ¿qué hay que decidir?" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className={field} rows={2} placeholder="Problema y contexto" value={problem} onChange={(e) => setProblem(e.target.value)} />
      {options.map((o, i) => (
        <div key={i} className="flex gap-1.5">
          <input className={field} placeholder={`Opción ${i + 1}`} value={o} onChange={(e) => setOptions((l) => l.map((x, j) => (j === i ? e.target.value : x)))} />
          {options.length > 2 && <button type="button" onClick={() => setOptions((l) => l.filter((_, j) => j !== i))} className="px-1.5 text-[#94a3b8] hover:text-[#ef4444] cursor-pointer" aria-label="Quitar opción"><X className="w-3.5 h-3.5" /></button>}
        </div>
      ))}
      {options.length < 4 && <button type="button" onClick={() => setOptions((l) => [...l, ''])} className="text-[11px] font-bold text-[#501f92] cursor-pointer">+ Otra opción</button>}
      <textarea className={field} rows={2} placeholder="Tu recomendación y por qué" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} />
      <textarea className={field} rows={2} placeholder="Preguntas concretas para el equipo (una por línea)" value={questions} onChange={(e) => setQuestions(e.target.value)} />
      <div>
        <p className="font-bold text-[#334155] mb-1">Revisores</p>
        <div className="flex flex-wrap gap-1.5">
          {reviewers.map((r) => (
            <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-white border border-[#e2e8f0] pl-2 pr-1 py-0.5 text-[11px] font-semibold text-[#0f172a]">{r.name.split(' ').slice(0, 2).join(' ')}<button type="button" onClick={() => setReviewers((l) => l.filter((x) => x.id !== r.id))} className="text-[#94a3b8] hover:text-[#ef4444] cursor-pointer" aria-label={`Quitar a ${r.name}`}><X className="w-3 h-3" /></button></span>
          ))}
          <select className="rounded-full border border-dashed border-[#c4b5fd] bg-white px-2 py-0.5 text-[11px] text-[#501f92] cursor-pointer" value="" onChange={(e) => { const u = users.find((x) => x.id === e.target.value); if (u) setReviewers((l) => [...l, { id: u.id, name: u.name }]); }}>
            <option value="">+ Agregar revisor</option>
            {candidates.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <p className="mt-1 text-[10.5px] text-[#64748b]">Por defecto, los revisores de la tarea.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold text-[#334155]">Plazo para responder</span>
        {[24, 48].map((h) => (
          <label key={h} className="inline-flex items-center gap-1 cursor-pointer"><input type="radio" checked={windowHours === h} onChange={() => setWindowHours(h as 24 | 48)} /> {h} h hábiles</label>
        ))}
      </div>
      <label className="flex items-center gap-1.5 cursor-pointer text-[#334155]"><input type="checkbox" checked={blocksTask} onChange={(e) => setBlocksTask(e.target.checked)} /> <Lock className="w-3 h-3" /> La tarea no puede avanzar sin esta decisión (bloquearla mientras tanto)</label>
      {error && <p className="text-[11px] font-semibold text-[#dc2626]">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-xl px-3 py-1.5 font-bold text-[#64748b] hover:bg-white cursor-pointer">Cancelar</button>
        <button type="button" onClick={submit} className="rounded-xl bg-[#501f92] px-3 py-1.5 font-bold text-white hover:bg-[#3b1670] cursor-pointer">Publicar decisión</button>
      </div>
    </div>
  );
};

export const DecisionCard: React.FC<{ d: Decision; me: DecisionPerson | null; compact?: boolean; startOpen?: boolean }> = ({ d, me, compact, startOpen }) => {
  const [open, setOpen] = useState(startOpen ?? false);
  const [mode, setMode] = useState<null | 'objection' | 'comment' | 'video'>(null);
  const [text, setText] = useState('');
  const [anchor, setAnchor] = useState<DecisionAnchor | ''>('');
  const [resolveFor, setResolveFor] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const isAuthor = me?.id === d.author.id;
  const isReviewer = !!me && d.reviewers.some((r) => r.id === me.id);
  const myResponse = me ? d.responses[me.id] : undefined;
  const meta = STATUS_META[d.status];
  const hoursLeft = businessHoursLeft(d.closesAt);
  const objections = openObjections(d);

  const sendObjection = () => {
    if (!me) return;
    if (text.trim().length < 10) { setErr('Explica la objeción (mínimo 10 caracteres).'); return; }
    respond(d.id, me, 'objection', { text: text.trim(), anchor: anchor || undefined });
    setMode(null); setText(''); setAnchor(''); setErr(null);
  };
  const sendComment = () => {
    if (!me || !text.trim()) return;
    addComment(d.id, me, text.trim(), anchor || undefined);
    setMode(null); setText(''); setAnchor('');
  };
  const sendVideo = () => {
    if (!me) return;
    if (!drivePreview(videoUrl)) { setErr('Pega el enlace de Drive de la grabación de Meet (drive.google.com/file/d/…).'); return; }
    addVideo(d.id, videoUrl.trim(), videoTitle.trim() || 'Video de avance', me.name);
    setMode(null); setVideoUrl(''); setVideoTitle(''); setErr(null);
  };

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white text-xs">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-start justify-between gap-2 p-3 text-left cursor-pointer">
        <div className="min-w-0">
          <p className="font-bold text-[#0f172a] leading-snug">{d.title}</p>
          <p className="mt-0.5 text-[10.5px] text-[#64748b]">{d.author.name.split(' ')[0]} · {d.reviewers.length} {d.reviewers.length === 1 ? 'revisor' : 'revisores'}{d.status === 'en_revision' ? ` · cierra en ${hoursLeft} h hábiles` : ''}{compact && d.taskTitle ? ` · ${d.taskTitle}` : ''}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.cls}`}>{meta.label}</span>
      </button>
      {open && (
        <div className="border-t border-[#f1f5f9] p-3 space-y-2.5">
          <Block label="Problema" text={d.problem} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Opciones</p>
            <ol className="mt-0.5 space-y-0.5 list-decimal list-inside text-[#334155]">{d.options.map((o, i) => <li key={i}>{o}</li>)}</ol>
          </div>
          <Block label="Recomendación" text={d.recommendation} />
          {d.questions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Preguntas</p>
              <ul className="mt-0.5 space-y-0.5 text-[#334155]">{d.questions.map((q, i) => <li key={i}>· {q}</li>)}</ul>
            </div>
          )}

          {/* Revisores y respuestas */}
          <div className="flex flex-wrap gap-1.5">
            {d.reviewers.map((r) => {
              const resp = d.responses[r.id];
              return (
                <span key={r.id} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${!resp ? 'bg-[#f1f5f9] text-[#64748b]' : resp.response === 'objection' ? 'bg-[#ffedd5] text-[#9a3412]' : 'bg-[#dcfce7] text-[#166534]'}`}>
                  {resp ? (resp.response === 'objection' ? <AlertTriangle className="w-3 h-3" /> : <Check className="w-3 h-3" />) : <Clock className="w-3 h-3" />}
                  {r.name.split(' ')[0]} · {resp ? RESPONSE_LABEL[resp.response] : 'Sin responder'}
                </span>
              );
            })}
          </div>
          {d.status === 'en_revision' && <p className="text-[10.5px] text-[#64748b]">Si nadie objeta antes del cierre, queda aprobada.</p>}
          {d.status === 'objeciones' && <p className="rounded-xl bg-[#fff7ed] px-2.5 py-1.5 text-[11px] text-[#9a3412]">Quedaron objeciones sin atender. Agenden 15 minutos solo {d.author.name.split(' ')[0]} y quien objetó: {[...new Set(objections.map((o) => o.authorName.split(' ')[0]))].join(', ')}.</p>}

          {/* Comentarios y objeciones */}
          {d.comments.length > 0 && (
            <div className="space-y-1.5">
              {d.comments.map((c) => (
                <div key={c.id} className={`rounded-xl px-2.5 py-1.5 ${c.isObjection ? (c.resolvedAt ? 'bg-[#f0fdf4]' : 'bg-[#fff7ed]') : 'bg-[#f8fafc]'}`}>
                  <p className="text-[10.5px] font-bold text-[#334155]">
                    {c.isObjection ? (c.resolvedAt ? '✅ Objeción atendida' : '⚠ Objeción') : <MessageSquare className="inline w-3 h-3" />} · {c.authorName.split(' ')[0]}{c.anchor ? ` · sobre ${anchorLabel(c.anchor)}` : ''}
                  </p>
                  <p className="text-[#0f172a]">{c.text}</p>
                  {c.resolvedNote && <p className="mt-0.5 text-[10.5px] text-[#166534]">{d.author.name.split(' ')[0]}: {c.resolvedNote}</p>}
                  {isAuthor && c.isObjection && !c.resolvedAt && d.status === 'en_revision' && (
                    resolveFor === c.id ? (
                      <div className="mt-1 flex gap-1.5">
                        <input className="flex-1 rounded-lg border border-[#e2e8f0] px-2 py-1 text-[11px]" placeholder="¿Qué cambiaste para atenderla?" value={text} onChange={(e) => setText(e.target.value)} />
                        <button type="button" onClick={() => { if (text.trim()) { resolveObjection(d.id, c.id, text.trim()); setResolveFor(null); setText(''); } }} className="rounded-lg bg-[#166534] px-2 text-[11px] font-bold text-white cursor-pointer">Marcar atendida</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => { setResolveFor(c.id); setText(''); }} className="mt-1 text-[11px] font-bold text-[#166534] cursor-pointer">Atender objeción</button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Videos de Meet */}
          {d.videos.map((v) => <MeetVideoCard key={v.id} decisionId={d.id} v={v} me={me} />)}

          {/* Acciones */}
          {d.status === 'en_revision' && me && (
            <div className="space-y-1.5">
              {isReviewer && !myResponse && mode === null && (
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => respond(d.id, me, 'agree')} className="rounded-xl bg-[#166534] px-3 py-1.5 font-bold text-white cursor-pointer">De acuerdo</button>
                  <button type="button" onClick={() => setMode('objection')} className="rounded-xl bg-[#ea580c] px-3 py-1.5 font-bold text-white cursor-pointer">Tengo una objeción</button>
                  <button type="button" onClick={() => respond(d.id, me, 'no_comment')} className="rounded-xl bg-[#f1f5f9] px-3 py-1.5 font-bold text-[#334155] cursor-pointer">Sin comentarios</button>
                </div>
              )}
              {mode === 'objection' || mode === 'comment' ? (
                <div className="space-y-1.5 rounded-xl border border-[#e2e8f0] p-2">
                  <select className="w-full rounded-lg border border-[#e2e8f0] px-2 py-1 text-[11px]" value={anchor} onChange={(e) => setAnchor(e.target.value as DecisionAnchor)}>
                    <option value="">¿Sobre qué parte? (opcional)</option>
                    <option value="problema">Problema</option>
                    {d.options.map((_, i) => <option key={i} value={`opcion-${i + 1}`}>Opción {i + 1}</option>)}
                    <option value="recomendacion">Recomendación</option>
                    <option value="preguntas">Preguntas</option>
                  </select>
                  <textarea className="w-full rounded-lg border border-[#e2e8f0] px-2 py-1 text-[11px]" rows={2} placeholder={mode === 'objection' ? 'Cuál es la objeción y qué propones' : 'Tu comentario'} value={text} onChange={(e) => setText(e.target.value)} />
                  {err && <p className="text-[11px] text-[#dc2626]">{err}</p>}
                  <div className="flex justify-end gap-1.5">
                    <button type="button" onClick={() => { setMode(null); setErr(null); }} className="rounded-lg px-2 py-1 text-[11px] font-bold text-[#64748b] cursor-pointer">Cancelar</button>
                    <button type="button" onClick={mode === 'objection' ? sendObjection : sendComment} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer ${mode === 'objection' ? 'bg-[#ea580c]' : 'bg-[#501f92]'}`}>{mode === 'objection' ? 'Enviar objeción' : 'Comentar'}</button>
                  </div>
                </div>
              ) : mode === 'video' ? (
                <div className="space-y-1.5 rounded-xl border border-[#e2e8f0] p-2">
                  <input className="w-full rounded-lg border border-[#e2e8f0] px-2 py-1 text-[11px]" placeholder="Enlace de Drive de la grabación de Meet" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                  <input className="w-full rounded-lg border border-[#e2e8f0] px-2 py-1 text-[11px]" placeholder="Título (opcional)" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
                  <p className="text-[10.5px] text-[#64748b]">Graba de 2 a 5 minutos en Meet compartiendo pantalla. Comparte el archivo con «cualquiera de Uhura con el enlace».</p>
                  {err && <p className="text-[11px] text-[#dc2626]">{err}</p>}
                  <div className="flex justify-end gap-1.5">
                    <button type="button" onClick={() => { setMode(null); setErr(null); }} className="rounded-lg px-2 py-1 text-[11px] font-bold text-[#64748b] cursor-pointer">Cancelar</button>
                    <button type="button" onClick={sendVideo} className="rounded-lg bg-[#501f92] px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer">Adjuntar video</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 text-[11px] font-bold">
                  <button type="button" onClick={() => { setMode('comment'); setText(''); }} className="text-[#501f92] cursor-pointer">Comentar</button>
                  <button type="button" onClick={() => setMode('video')} className="text-[#501f92] cursor-pointer inline-flex items-center gap-1"><Video className="w-3 h-3" /> Adjuntar video de Meet</button>
                  {isAuthor && <button type="button" onClick={() => discardDecision(d.id)} className="text-[#94a3b8] hover:text-[#ef4444] cursor-pointer inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Descartar</button>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Block: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">{label}</p>
    <p className="mt-0.5 text-[#334155] whitespace-pre-line">{text}</p>
  </div>
);

/** Video de Meet (Drive) con comentarios por minuto. */
export const MeetVideoCard: React.FC<{ decisionId: string; v: Decision['videos'][number]; me: DecisionPerson | null }> = ({ decisionId, v, me }) => {
  const [show, setShow] = useState(false);
  const [minute, setMinute] = useState('');
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const preview = drivePreview(v.url);
  const send = () => {
    if (!me) return;
    if (!isMinute(minute)) { setErr('Escribe el minuto como 2:10.'); return; }
    if (!text.trim()) return;
    addVideoComment(decisionId, v.id, minute.trim(), text.trim(), me.name);
    setMinute(''); setText(''); setErr(null);
  };
  return (
    <div className="rounded-xl border border-[#e2e8f0] p-2 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-[#0f172a] flex items-center gap-1.5 min-w-0"><Video className="w-3.5 h-3.5 text-[#501f92] shrink-0" /><span className="truncate">{v.title}</span><span className="font-normal text-[#64748b] shrink-0">· {v.byName.split(' ')[0]}</span></p>
        <div className="flex gap-2 shrink-0 text-[11px] font-bold">
          <button type="button" onClick={() => setShow((s) => !s)} className="text-[#501f92] cursor-pointer">{show ? 'Ocultar' : 'Ver aquí'}</button>
          <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-[#501f92]">Abrir en Drive</a>
        </div>
      </div>
      {show && preview && (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-[#0f172a]">
          <iframe title={v.title} src={preview} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
        </div>
      )}
      {v.comments.length > 0 && (
        <ul className="space-y-0.5">
          {v.comments.slice().sort((a, b) => a.minute.localeCompare(b.minute, undefined, { numeric: true })).map((c) => (
            <li key={c.id} className="text-[11px] text-[#334155]"><span className="rounded bg-[#ede9fe] px-1 font-mono font-bold text-[#5b21b6]">{c.minute}</span> {c.byName.split(' ')[0]}: {c.text}</li>
          ))}
        </ul>
      )}
      {me && (
        <div className="flex gap-1.5">
          <input className="w-14 rounded-lg border border-[#e2e8f0] px-1.5 py-1 text-[11px] font-mono" placeholder="2:10" value={minute} onChange={(e) => setMinute(e.target.value)} aria-label="Minuto" />
          <input className="flex-1 rounded-lg border border-[#e2e8f0] px-2 py-1 text-[11px]" placeholder="Comentario en ese minuto" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
          <button type="button" onClick={send} className="rounded-lg bg-[#501f92] px-2 text-[11px] font-bold text-white cursor-pointer">Enviar</button>
        </div>
      )}
      {err && <p className="text-[11px] text-[#dc2626]">{err}</p>}
    </div>
  );
};
