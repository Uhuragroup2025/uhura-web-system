/**
 * Toc toc (§32.18): ventana para escribir la pregunta y bandeja de entrada/respuestas.
 * Se usan en La Plaza, El Estudio, «ECO informa» y Mi Día.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Hand, X } from 'lucide-react';
import { TaskItem, UserItem } from '../types';
import {
  KNOCKS_EVENT, Knock, KnockReplyKind, MAX_OPEN_SENT, REPLY_LABEL, closeForSender, deliverPendingFor, heldFor,
  inboxFor, isExpired, openSentCount, outcomesFor, replyKnock, sendKnock, waitingSentBy
} from './knockStore';

export const useKnocksVersion = () => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const on = () => setV((x) => x + 1);
    window.addEventListener(KNOCKS_EVENT, on);
    window.addEventListener('storage', on);
    return () => { window.removeEventListener(KNOCKS_EVENT, on); window.removeEventListener('storage', on); };
  }, []);
  return v;
};

const openTask = (taskId?: string) => {
  if (taskId) window.dispatchEvent(new CustomEvent('eco:open-task', { detail: { taskId } }));
};

// ── Escribir un toc toc ────────────────────────────────────────────────────
export const KnockComposer: React.FC<{
  me: UserItem;
  to: UserItem;
  /** Tareas de la otra persona que quien escribe puede ver (para citar una, opcional). */
  sharedTasks: TaskItem[];
  busyLabel?: string | null;
  onClose: () => void;
  onSent: (msg: string) => void;
}> = ({ me, to, sharedTasks, busyLabel, onClose, onSent }) => {
  const [text, setText] = useState('');
  const [taskId, setTaskId] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const first = to.name.split(' ')[0];
  const left = MAX_OPEN_SENT - openSentCount(me.id);
  const send = () => {
    const task = sharedTasks.find((t) => t.id === taskId);
    const r = sendKnock({ id: me.id, name: me.name }, { id: to.id, name: to.name }, text, task ? { id: task.id, title: task.title, projectName: task.projectName } : undefined);
    if (!r.ok) { setErr(r.error); return; }
    onSent(busyLabel ? `Listo. ${first} lo verá cuando termine (${busyLabel}).` : `Listo. ${first} lo verá cuando termine su bloque, o ya mismo si está libre.`);
  };
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 p-3" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-white/15 bg-[#140a2b] p-4 text-white shadow-2xl plaza-in">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-black"><Hand className="w-4 h-4 text-[#d4ff3f]" /> Toc toc a {first}</p>
            <p className="mt-0.5 text-[11px] text-white/60">
              {busyLabel ? `${first} está ${busyLabel}: le llega cuando termine, sin interrumpirle.` : `Le llega cuando ${first} termine su bloque (sin cronómetro corriendo ni reunión); si está libre, enseguida.`} Si es urgente, escríbele por Google Chat.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-4 h-4" /></button>
        </div>
        <label className="mt-3 block text-[11px] font-bold text-white/80">¿Qué le quieres preguntar? <span className="text-[#fda4af]">*</span></label>
        <textarea
          autoFocus
          rows={3}
          maxLength={280}
          value={text}
          onChange={(e) => { setText(e.target.value); setErr(null); }}
          placeholder="Ej.: ¿El logo del home va en blanco o en negro?"
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/[.07] p-2.5 text-xs text-white placeholder:text-white/35 outline-none focus:border-[#d4ff3f] resize-none"
        />
        <div className="mt-0.5 flex justify-between text-[10px] text-white/40"><span>Corto y concreto. Si necesitas un sí o un no con fecha, usa una decisión.</span><span>{text.trim().length}/280</span></div>
        {sharedTasks.length > 0 && (
          <>
            <label className="mt-2 block text-[11px] font-bold text-white/80">Sobre una tarea (opcional)</label>
            <select value={taskId} onChange={(e) => setTaskId(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-[#1c1036] px-2.5 py-2 text-xs text-white outline-none">
              <option value="">Ninguna</option>
              {sharedTasks.map((t) => <option key={t.id} value={t.id}>{t.title} · {t.projectName}</option>)}
            </select>
          </>
        )}
        {err && <p className="mt-2 text-[11px] text-[#fda4af]">{err}</p>}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] text-white/40">Te quedan {Math.max(0, left)} de {MAX_OPEN_SENT} sin respuesta</span>
          <button type="button" onClick={send} className="rounded-xl bg-[#d4ff3f] px-4 py-2 text-xs font-black text-[#1a0f30] hover:brightness-110 cursor-pointer">Dejar toc toc</button>
        </div>
      </div>
    </div>
  );
};

// ── Bandeja: lo que me preguntan y lo que me respondieron ─────────────────
export const KnocksInbox: React.FC<{ me?: UserItem; timerRunning: boolean; variant?: 'light' | 'dark' }> = ({ me, timerRunning, variant = 'light' }) => {
  const v = useKnocksVersion();
  // Entrega: si la persona no está en un bloque de trabajo, le llegan los toc tocs en espera
  useEffect(() => { if (me && !timerRunning) deliverPendingFor(me.id); }, [me, timerRunning, v]);
  const inbox = useMemo(() => (me ? inboxFor(me.id) : []), [me, v]);
  const outcomes = useMemo(() => (me ? outcomesFor(me.id) : []), [me, v]);
  const held = useMemo(() => (me ? heldFor(me.id).length : 0), [me, v]);
  const waiting = useMemo(() => (me ? waitingSentBy(me.id).length : 0), [me, v]);
  const [answering, setAnswering] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  if (!me || (!inbox.length && !outcomes.length && !held)) return null;

  const dark = variant === 'dark';
  const box = dark ? 'rounded-2xl bg-white/[.06] px-3 py-2.5 text-white' : 'rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-xs';
  const sub = dark ? 'text-white/60' : 'text-[#64748b]';
  const item = dark ? 'rounded-xl bg-white/[.06] p-2.5' : 'rounded-xl border border-[#f1f5f9] bg-[#f8fafc] p-3';
  const chip = dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white border border-[#e2e8f0] hover:bg-[#f1f5f9] text-[#0f172a]';
  const reply = (k: Knock, kind: KnockReplyKind) => { replyKnock(k.id, kind, kind === 'texto' ? answer : undefined); setAnswering(null); setAnswer(''); };

  return (
    <div className={box}>
      <p className={`flex items-center gap-1.5 text-sm font-black ${dark ? 'text-white' : 'text-[#0f172a]'}`}>
        <Hand className={`w-4 h-4 ${dark ? 'text-[#d4ff3f]' : 'text-[#501f92]'}`} /> Toc toc {inbox.length > 0 && <span className="rounded-full bg-[#501f92] px-1.5 text-[10px] text-white">{inbox.length}</span>}
      </p>
      {held > 0 && timerRunning && <p className={`mt-1 text-[11px] ${sub}`}>🔕 {held} {held === 1 ? 'pregunta espera' : 'preguntas esperan'} a que detengas el cronómetro.</p>}
      <div className="mt-2 space-y-2">
        {inbox.map((k) => (
          <div key={k.id} className={item}>
            <p className={`text-[11px] ${sub}`}><strong className={dark ? 'text-white' : 'text-[#0f172a]'}>{k.from.name.split(' ')[0]}</strong> te pregunta{k.taskTitle ? <> · <button type="button" onClick={() => openTask(k.taskId)} className="font-semibold underline cursor-pointer">{k.taskTitle}</button></> : ''}</p>
            <p className={`mt-0.5 text-xs font-semibold ${dark ? 'text-white' : 'text-[#0f172a]'}`}>«{k.text}»</p>
            {answering === k.id ? (
              <div className="mt-2 flex gap-1.5">
                <input autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && answer.trim() && reply(k, 'texto')} placeholder="Tu respuesta…" className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-xs outline-none ${dark ? 'bg-white/10 text-white placeholder:text-white/40' : 'border border-[#e2e8f0] bg-white text-[#0f172a]'}`} />
                <button type="button" disabled={!answer.trim()} onClick={() => reply(k, 'texto')} className="rounded-lg bg-[#501f92] px-2.5 py-1.5 text-[11px] font-bold text-white disabled:opacity-40 cursor-pointer">Enviar</button>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(['voy', 'te_escribo', 'en_30'] as KnockReplyKind[]).map((kind) => (
                  <button key={kind} type="button" onClick={() => reply(k, kind)} className={`rounded-lg px-2 py-1 text-[11px] font-bold cursor-pointer ${chip}`}>{REPLY_LABEL[kind]}</button>
                ))}
                <button type="button" onClick={() => { setAnswering(k.id); setAnswer(''); }} className="rounded-lg bg-[#501f92] px-2 py-1 text-[11px] font-bold text-white cursor-pointer">Responder</button>
              </div>
            )}
          </div>
        ))}
        {outcomes.map((k) => (
          <div key={k.id} className={`${item} flex items-start justify-between gap-2`}>
            <div className="min-w-0">
              {isExpired(k) ? (
                <p className={`text-[11px] ${sub}`}><strong className={dark ? 'text-white' : 'text-[#0f172a]'}>{k.to.name.split(' ')[0]}</strong> no respondió «{k.text}». Escríbele por Google Chat.</p>
              ) : (
                <>
                  <p className={`text-[11px] ${sub}`}><strong className={dark ? 'text-white' : 'text-[#0f172a]'}>{k.to.name.split(' ')[0]}</strong> respondió a «{k.text}»</p>
                  <p className={`mt-0.5 text-xs font-semibold ${dark ? 'text-white' : 'text-[#0f172a]'}`}>{k.reply!.kind === 'texto' ? `«${k.reply!.text}»` : REPLY_LABEL[k.reply!.kind]}</p>
                </>
              )}
            </div>
            <button type="button" onClick={() => closeForSender(k.id)} className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold cursor-pointer ${chip}`}>Listo</button>
          </div>
        ))}
      </div>
      {waiting > 0 && <p className={`mt-2 text-[10.5px] ${sub}`}>Tienes {waiting} {waiting === 1 ? 'toc toc enviado' : 'toc tocs enviados'} esperando respuesta.</p>}
    </div>
  );
};
