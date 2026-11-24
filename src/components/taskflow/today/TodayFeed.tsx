/**
 * «Hoy en Uhura» (§32.22): columna derecha de Mi Día. Solo lo de hoy y con una acción.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { TaskItem, TeamAbsenceEvent, UserItem } from '../types';
import { useIdeasVersion, IdeasBoard } from '../colonia/plaza/IdeasBoard';
import { loadIdeas, joinChallenge, markHelped, capsuleKind, cheerCapsule, validateSpecialization } from '../colonia/plaza/ideasStore';
import { loadContributions, markRewardTaken, giveKudo, CONTRIB_EVENT, KIND_LABEL } from '../colonia/plaza/contributionsStore';
import { taskCounts } from '../colonia/plaza/plazaRewards';
import { projectsVisibleTo, projectKeyOf } from '../colonia/plaza/plazaPresence';
import { makePersonMatcher, isTaskOwner, taskReviewers } from '../auth/taskVisibility';
import { nextColombianHoliday } from '../health/projectHealthEngine';
import { TODAY_EVENT, doneToday, markDone, markAllSeen, todayIso, localDay } from './todayFeed';

type Action = { label: string; primary?: boolean; run: () => void };
interface Item { key: string; group: 1 | 2 | 3; icon: string; text: React.ReactNode; actions: Action[]; at?: string }

const first = (n: string) => n.split(' ')[0];
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-CO', opts); };

const useVersion = () => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const on = () => setV((x) => x + 1);
    const evs = [TODAY_EVENT, CONTRIB_EVENT, 'eco:rewards-changed'];
    evs.forEach((e) => window.addEventListener(e, on));
    return () => evs.forEach((e) => window.removeEventListener(e, on));
  }, []);
  return v;
};

export const TodayFeed: React.FC<{ me?: UserItem; users: UserItem[]; tasks: TaskItem[]; absenceEvents: TeamAbsenceEvent[] }> = ({ me, users, tasks, absenceEvents }) => {
  const v1 = useVersion();
  const v2 = useIdeasVersion();
  const [modal, setModal] = useState<null | 'retos' | 'aprendi'>(null);
  const [all, setAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const say = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2600); };
  useEffect(() => { if (me) markAllSeen(me.id); }, [me, v1, v2]);
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const items = useMemo<Item[]>(() => {
    if (!me) return [];
    const uid = me.id;
    const today = todayIso();
    const done = doneToday(uid);
    const person = { id: uid, name: me.name };
    const matches = makePersonMatcher(me, users);
    const visible = projectsVisibleTo(me, tasks, users);
    const canSee = (t: TaskItem) => visible === 'all' || visible.has(projectKeyOf(t));
    const ideas = loadIdeas();
    const out: Item[] = [];
    const act = (key: string, fn?: () => void) => () => { fn?.(); markDone(uid, key); };

    // ── 1. Lo que te toca hoy ──
    ideas.challenges.filter((c) => c.status === 'abierto').forEach((c) => {
      const joined = c.joined.some((p) => p.id === uid);
      const mineEntry = c.entries.some((e) => e.user.id === uid);
      if (joined && !mineEntry && c.closesOn <= today) {
        out.push({ key: `reto-cierra:${c.id}`, group: 1, icon: '🏁', text: <>Te sumaste a <strong>«{c.title}»</strong> y <strong>cierra hoy</strong>.</>, actions: [{ label: 'Enviar mi aporte', primary: true, run: () => setModal('retos') }] });
      }
      if (c.creator.id === uid && c.entries.length) {
        const key = `reto-aportes:${c.id}:${c.entries.length}`;
        out.push({ key, group: 1, icon: '🏁', text: <>Tu reto <strong>«{c.title}»</strong> tiene {c.entries.length} {c.entries.length === 1 ? 'aporte' : 'aportes'}.</>, actions: [{ label: 'Ver y votar', primary: true, run: act(key, () => setModal('retos')) }] });
      }
    });
    loadContributions().rewards.forEach((r) => r.recipients.forEach((p) => {
      if (p.id !== uid || p.status !== 'pendiente') return;
      out.push({ key: `dia-libre:${r.id}`, group: 1, icon: '🎁', text: <>Tienes <strong>{KIND_LABEL[r.kind].toLowerCase()}</strong> {r.kind === 'almuerzo_familia' ? 'ganado' : 'ganado'} sin tomar{r.occasion === 'specialization' && r.note ? ` (por «${r.note}»)` : ''}.</>, actions: [{ label: 'Tomarlo', primary: true, run: () => { markRewardTaken(r.id, uid); say(r.kind === 'almuerzo_familia' ? 'Listo. Dirección coordina contigo la fecha de tu almuerzo en familia.' : 'Listo. Coordínalo con tu líder y queda registrado como ausencia.'); } }] });
    }));
    // Revisor ausente hoy en una de mis tareas
    const absentToday = absenceEvents.filter((a) => a.status !== 'cancelled' && a.startDate <= today && a.endDate >= today && a.userId !== uid);
    const absentIds = new Set(absentToday.map((a) => a.userId));
    tasks.filter((t) => isTaskOwner(t, me, matches) && !t.completed && t.status !== 'Done' && t.requiresReview !== false).forEach((t) => {
      const revs = taskReviewers(t).filter(Boolean).map((r) => r!.name || '').filter(Boolean);
      const userOf = (name: string) => users.find((x) => x.name === name || name.startsWith(first(x.name)));
      const absentRev = revs.length > 0 && revs.every((name) => { const u = userOf(name); return !!u && absentIds.has(u.id); });
      if (!absentRev) return;
      const u = userOf(revs[0]);
      const until = absentToday.find((a) => a.userId === u?.id)?.endDate;
      out.push({ key: `revisor-ausente:${t.id}`, group: 1, icon: '🌴', text: <><strong>{first(revs[0])}</strong> revisa «{t.title}» y no está{until ? ` hasta el ${fmt(until, { day: 'numeric', month: 'short' })}` : ''}.</>, actions: [{ label: 'Cambiar quién revisa', primary: true, run: () => window.dispatchEvent(new CustomEvent('eco:open-task', { detail: { taskId: t.id } })) }] });
    });

    // ── 2. Lo nuevo del equipo hoy ──
    ideas.challenges.forEach((c) => {
      if (c.status === 'abierto' && localDay(c.createdAt) === today && c.creator.id !== uid && !c.joined.some((p) => p.id === uid)) {
        const key = `reto-nuevo:${c.id}`;
        out.push({ key, group: 2, at: c.createdAt, icon: '🏁', text: <><strong>{first(c.creator.name)}</strong> lanzó un reto: «{c.title}» · cierra {fmt(c.closesOn, { weekday: 'short', day: 'numeric' })}</>, actions: [{ label: 'Me uno', primary: true, run: act(key, () => { joinChallenge(c.id, person); say('Te sumaste. Deja tu aporte cuando puedas.'); setModal('retos'); }) }] });
      }
      if (c.status === 'cerrado' && localDay(c.closedAt) === today && c.podium?.length) {
        const w = c.entries.find((e) => e.id === c.podium![0]);
        const key = `reto-ganado:${c.id}`;
        if (w) out.push({ key, group: 2, at: c.closedAt, icon: '🏆', text: w.user.id === uid ? <><strong>¡Ganaste el reto</strong> «{c.title}»!</> : <><strong>{first(w.user.name)}</strong> ganó el reto «{c.title}»</>, actions: [{ label: 'Ver el podio', run: act(key, () => setModal('retos')) }] });
      }
    });
    ideas.capsules.forEach((cap) => {
      const k = capsuleKind(cap);
      // Dirección: especializaciones por validar (lo tangible depende de su validación)
      if (k === 'especializacion' && !cap.validatedAt && ['executive', 'system_admin'].includes(String(me.accessLevel || '')) && cap.author.id !== uid) {
        out.push({ key: `validar:${cap.id}`, group: 1, icon: '🏅', text: <><strong>{first(cap.author.name)}</strong> terminó la especialización «{cap.title}» ({cap.platform}). Revisa el diploma y valídala.</>, actions: [
          ...(cap.certificateUrl ? [{ label: 'Ver diploma', run: () => window.open(cap.certificateUrl, '_blank', 'noopener') }] : []),
          { label: 'Validar', primary: true, run: () => { validateSpecialization(cap.id, person); say(`Validada. ${first(cap.author.name)} suma 100 ECOINS y su almuerzo en familia.`); } }
        ] });
      }
      if (localDay(cap.at) !== today || cap.author.id === uid) return;
      if (k === 'especializacion' && !cap.validatedAt && ['executive', 'system_admin'].includes(String(me.accessLevel || ''))) return; // ya sale arriba para validar
      const key = `capsula:${cap.id}`;
      if (k === 'tip') {
        if (cap.helped.includes(uid)) return;
        out.push({ key, group: 2, at: cap.at, icon: '💡', text: <><strong>{first(cap.author.name)}</strong> aprendió: «{cap.title}»</>, actions: [{ label: 'Ver', run: act(key, () => setModal('aprendi')) }, { label: 'Me sirvió', primary: true, run: act(key, () => { markHelped(cap.id, person); say(`Gracias. A ${first(cap.author.name)} le suma ECOINS.`); }) }] });
      } else {
        if ((cap.cheers || []).includes(uid)) return;
        out.push({ key, group: 2, at: cap.at, icon: k === 'curso' ? '🎓' : '🏅', text: <><strong>{first(cap.author.name)}</strong> terminó {k === 'curso' ? 'el curso' : 'la especialización'} «{cap.title}» · {cap.platform}</>, actions: [{ label: 'Ver', run: act(key, () => setModal('aprendi')) }, { label: '👏 Felicitar', primary: true, run: act(key, () => { cheerCapsule(cap.id, person); say(`Le llegó tu felicitación a ${first(cap.author.name)}.`); }) }] });
      }
    });
    tasks.filter((t) => taskCounts(t) && localDay(t.completedAt) === today && !isTaskOwner(t, me, matches)).forEach((t) => {
      const key = `termino:${t.id}`;
      out.push({ key, group: 2, at: t.completedAt, icon: '🎉', text: <><strong>{first(t.assignee?.name || 'Alguien')}</strong> terminó {canSee(t) ? `«${t.title}»` : `una tarea de ${t.projectName}`}</>, actions: [{ label: '👏 Aplaudir', run: act(key, () => say(`Le llegó tu aplauso a ${first(t.assignee?.name || '')}.`)) }] });
    });

    // ── 3. Contexto que cambia tu día ──
    if (absentToday.length) {
      const names = absentToday.map((a) => { const u = users.find((x) => x.id === a.userId); return `${first(u?.name || a.userName || '')} (vuelve el ${fmt(addDay(a.endDate), { day: 'numeric', month: 'short' })})`; });
      out.push({ key: `ausentes:${today}`, group: 3, icon: '🌴', text: <>Hoy no están: {names.join(', ')}.</>, actions: [{ label: 'Entendido', run: act(`ausentes:${today}`) }] });
    }
    const mmdd = today.slice(5);
    users.filter((u) => u.id !== uid && u.status !== 'Inactive').forEach((u) => {
      if ((u.birthDate || '').slice(5, 10) === mmdd) {
        const key = `cumple:${u.id}:${today}`;
        out.push({ key, group: 3, icon: '🎂', text: <>Hoy cumple años <strong>{first(u.name)}</strong>.</>, actions: [{ label: 'Reconocer', primary: true, run: act(key, () => { const r = giveKudo(person, { id: u.id, name: u.name }, 'buena-onda'); say(r.msg); }) }] });
      }
      const ann = (u as UserItem & { anniversaryDate?: string }).anniversaryDate || '';
      if (ann.slice(5, 10) === mmdd && ann.slice(0, 4) < today.slice(0, 4)) {
        const years = Number(today.slice(0, 4)) - Number(ann.slice(0, 4));
        const key = `aniversario:${u.id}:${today}`;
        out.push({ key, group: 3, icon: '🎊', text: <><strong>{first(u.name)}</strong> cumple {years} {years === 1 ? 'año' : 'años'} en Uhura.</>, actions: [{ label: 'Reconocer', primary: true, run: act(key, () => { const r = giveKudo(person, { id: u.id, name: u.name }, 'gran-trabajo'); say(r.msg); }) }] });
      }
    });
    // Festivo: se avisa desde 7 días antes (✅ 22 Nov 2026), para que nadie se entere un sábado
    const next = nextColombianHoliday(addDay(today));
    if (next) {
      const daysTo = Math.round((Date.parse(`${next}T12:00:00`) - Date.parse(`${today}T12:00:00`)) / 86400000);
      if (daysTo >= 1 && daysTo <= 7) {
        const weekStart = mondayOf(next), weekEnd = addDays(weekStart, 4);
        const mine = tasks.filter((t) => isTaskOwner(t, me, matches) && !t.completed && t.status !== 'Done' && (t.dueDate || '').slice(0, 10) >= weekStart && (t.dueDate || '').slice(0, 10) <= weekEnd).length;
        const key = `festivo:${next}`;
        out.push({ key, group: 3, icon: '📅', text: <>El <strong>{fmt(next, { weekday: 'long', day: 'numeric', month: 'long' })}</strong> es festivo{daysTo <= 1 ? ' (mañana)' : ` (en ${daysTo} días)`}. {mine ? `Tienes ${mine} ${mine === 1 ? 'entrega' : 'entregas'} esa semana: planéalas.` : 'Planea tus entregas de esa semana.'}</>, actions: [{ label: 'Entendido', run: act(key) }] });
      }
    }

    return out
      .filter((i) => !done.has(i.key))
      .sort((a, b) => a.group - b.group || (b.at || '').localeCompare(a.at || ''));
  }, [me, users, tasks, absenceEvents, v1, v2]);

  if (!me) return null;
  const shown = all ? items : items.slice(0, 6);
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-xs">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-black text-[#0f172a]">☀️ Hoy en Uhura</p>
        <span className="text-[11px] text-[#94a3b8] capitalize">{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-[11px] text-[#64748b]">Nada nuevo por ahora. Cuando alguien lance un reto, comparta lo que aprendió o termine algo, aparece aquí.</p>
      ) : (
        <div className="mt-2.5 space-y-2">
          {shown.map((i) => (
            <div key={i.key} className={`rounded-xl px-3 py-2 text-[11.5px] leading-snug ${i.group === 1 ? 'bg-[#f5f3ff] border border-[#ddd6fe]' : 'bg-[#f8fafc] border border-[#f1f5f9]'}`}>
              <p className="text-[#334155]"><span className="mr-1">{i.icon}</span>{i.text}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {i.actions.map((a) => (
                  <button key={a.label} type="button" onClick={a.run} className={`rounded-lg px-2 py-1 text-[11px] font-bold cursor-pointer ${a.primary ? 'bg-[#501f92] text-white hover:bg-[#381566]' : 'bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f1f5f9]'}`}>{a.label}</button>
                ))}
              </div>
            </div>
          ))}
          {items.length > 6 && <button type="button" onClick={() => setAll((x) => !x)} className="w-full text-[11px] font-bold text-[#501f92] hover:underline cursor-pointer">{all ? 'Ver menos' : `Ver todo (${items.length})`}</button>}
        </div>
      )}
      {toast && <p className="mt-2 rounded-lg bg-[#0f172a] px-3 py-1.5 text-[11px] font-bold text-white">{toast}</p>}
      {modal && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 p-3" onClick={() => setModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#140a2b] p-4 shadow-2xl">
            <button type="button" onClick={() => setModal(null)} className="absolute right-3 top-3 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer" aria-label="Cerrar"><X className="w-4 h-4" /></button>
            <p className="mb-3 text-lg font-black text-white">☕ Café de ideas</p>
            <IdeasBoard me={me} initialTab={modal} onToast={say} projectNames={[...new Set(tasks.filter((t) => { const vis = projectsVisibleTo(me, tasks, users); return vis === 'all' || vis.has(projectKeyOf(t)); }).map((t) => t.projectName).filter(Boolean) as string[])]} />
          </div>
        </div>
      )}
    </div>
  );
};

function addDays(iso: string, n: number) { const [y, m, d] = iso.split('-').map(Number); const dt = new Date(y, m - 1, d + n); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; }
function addDay(iso: string) { return addDays(iso, 1); }
function mondayOf(iso: string) { const [y, m, d] = iso.split('-').map(Number); const dt = new Date(y, m - 1, d); const back = (dt.getDay() + 6) % 7; return addDays(iso, -back); }
