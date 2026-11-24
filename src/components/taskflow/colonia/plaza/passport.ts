/**
 * ============================================================================
 * PASAPORTE DEL MES (BACKEND_REQUIREMENTS §32.21) — PROTOTIPO
 * ============================================================================
 * Cinco sellos que se ganan usando bien la plataforma durante el mes. Nadie compite
 * con nadie: cada persona contra sí misma, sin ranking ni cupo.
 *
 *   🕐 Transparencia  Días cargados (≥ 80 % de la jornada) en al menos el 80 % de los días
 *                     hábiles del mes (sin contar festivos ni ausencias). Noviembre 2026: 16 de 19.
 *   📦 Entrega clara  5 o más tareas propias entregadas con «¿Qué hiciste?» en el mes.
 *   🏁 Me atreví      Lanzar un reto o aportar a uno.
 *   💡 Compartí       Publicar un «Aprendí esto» o tener una mentoría confirmada como mentor.
 *   🤝 Buen equipo    Dar 2 o más reconocimientos, sin dejar vencer ningún toc toc
 *                     ni tener revisiones esperando más de 2 días hábiles.
 *
 * Niveles (✅ 22 Nov 2026): 3 sellos = premio pequeño, alcanzable; 5 sellos = premio mayor,
 * que pide constancia. Lo tangible lo define Dirección y se entrega al cierre del mes.
 * Los ECOINS siguen sin comprar nada: el premio sale de los sellos, no del saldo.
 */
import { TaskItem, TeamAbsenceEvent, TimeLog, UserItem } from '../../types';
import { hoursByDay, STREAK_MIN_RATIO, absencesByUserFrom, toIsoLocal } from '../../time/dayStreak';
import { isBusinessDay } from '../../health/projectHealthEngine';
import { makePersonMatcher, isTaskOwner, taskReviewers } from '../../auth/taskVisibility';
import { loadIdeas } from './ideasStore';
import { loadContributions } from './contributionsStore';
import { allKnocks, isExpired } from '../../knocks/knockStore';
import { loadRewards } from './plazaRewards';

export type StampId = 'transparencia' | 'entrega' | 'atrevi' | 'comparti' | 'equipo';
export interface Stamp { id: StampId; icon: string; name: string; rule: string; done: boolean; progress: string; tip: string }
export interface Passport { month: string; stamps: Stamp[]; count: number; level: 0 | 3 | 5 }

/** Lo tangible de cada nivel. En producción lo configura `executive` cada mes. */
export const PASSPORT_PRIZES: Record<3 | 5, string> = {
  3: 'Premio pequeño: desayuno o snack (lo define Dirección)',
  5: 'Premio mayor: almuerzo, libro o curso (lo define Dirección)'
};

const monthOf = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const businessDaysOfMonth = (month: string, absent: Set<string>) => {
  const [y, m] = month.split('-').map(Number);
  const out: string[] = [];
  const d = new Date(Date.UTC(y, m - 1, 1));
  while (d.getUTCMonth() === m - 1) {
    const iso = d.toISOString().slice(0, 10);
    if (isBusinessDay(d) && !absent.has(iso)) out.push(iso);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
};
const bizDaysBetween = (from: Date, to: Date) => {
  let n = 0;
  const d = new Date(from);
  while (d < to) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) n++; }
  return n;
};

export function passportFor(params: {
  user: UserItem;
  users: UserItem[];
  tasks: TaskItem[];
  timeLogs: TimeLog[];
  absenceEvents: TeamAbsenceEvent[];
  targetDayHours: number;
  today?: Date;
}): Passport {
  const { user, users, tasks, timeLogs, absenceEvents, targetDayHours, today = new Date() } = params;
  const month = monthOf(today);
  const inMonth = (iso?: string) => !!iso && iso.slice(0, 7) === month;
  const matches = makePersonMatcher(user, users);

  // 🕐 Transparencia
  const absent = absencesByUserFrom(absenceEvents).get(user.id) || new Set<string>();
  const workdays = businessDaysOfMonth(month, absent);
  const need = Math.max(1, Math.ceil(workdays.length * 0.8));
  const hours = hoursByDay(timeLogs, user, today);
  const min = Math.max(0.1, targetDayHours * STREAK_MIN_RATIO);
  const todayIso = toIsoLocal(today);
  const loaded = workdays.filter((iso) => iso <= todayIso && (hours.get(iso) || 0) >= min).length;

  // 📦 Entrega clara: tareas propias con «¿Qué hiciste?» entregadas este mes
  const delivered = new Set<string>();
  tasks.forEach((t) => {
    if (!isTaskOwner(t, user, matches)) return;
    (t.deliverables || []).forEach((d) => {
      if ((d.notes || '').trim() && inMonth(d.submittedIso || t.completedAt)) delivered.add(t.id);
    });
  });

  // 🏁 Me atreví · 💡 Compartí
  const ideas = loadIdeas();
  const launched = ideas.challenges.filter((c) => c.creator.id === user.id && c.status !== 'cancelado' && inMonth(c.createdAt)).length;
  const entries = ideas.challenges.reduce((n, c) => n + c.entries.filter((e) => e.user.id === user.id && inMonth(e.at)).length, 0);
  const capsules = ideas.capsules.filter((c) => c.author.id === user.id && inMonth(c.at)).length;
  const mentorships = loadContributions().mentorships.filter((m) => m.mentor.id === user.id && inMonth(m.confirmedAt)).length;

  // 🤝 Buen equipo
  const kudosGiven = loadRewards(user.id).kudosGiven.filter((k) => inMonth(k.at)).length;
  const expiredKnocks = allKnocks().filter((k) => k.to.id === user.id && isExpired(k, today) && inMonth(k.expiresAt)).length;
  const staleReviews = tasks.filter((t) => {
    if (!['Review', 'in_review'].includes(String(t.status))) return false;
    if (!taskReviewers(t).some((r) => matches(r))) return false;
    const last = t.deliverables?.[t.deliverables.length - 1];
    const at = new Date(last?.submittedIso || '');
    return !isNaN(at.getTime()) && bizDaysBetween(at, today) > 2;
  }).length;
  const teamOk = kudosGiven >= 2 && expiredKnocks === 0 && staleReviews === 0;

  const stamps: Stamp[] = [
    { id: 'transparencia', icon: '🕐', name: 'Transparencia', rule: `Cargar tu jornada ${need} de ${workdays.length} días hábiles`, done: loaded >= need, progress: `${Math.min(loaded, need)}/${need} días`, tip: 'Cierra cada día con tus horas cargadas.' },
    { id: 'entrega', icon: '📦', name: 'Entrega clara', rule: '5 tareas entregadas con «¿Qué hiciste?»', done: delivered.size >= 5, progress: `${Math.min(delivered.size, 5)}/5 tareas`, tip: 'Al entregar, cuenta en una línea qué hiciste.' },
    { id: 'atrevi', icon: '🏁', name: 'Me atreví', rule: 'Lanzar un reto o aportar a uno', done: launched + entries >= 1, progress: launched + entries >= 1 ? 'Listo' : 'Pendiente', tip: 'Entra al Café de ideas y súmate a un reto.' },
    { id: 'comparti', icon: '💡', name: 'Compartí', rule: 'Publicar un «Aprendí esto» (tip, curso o diploma) o dar una mentoría', done: capsules + mentorships >= 1, progress: capsules + mentorships >= 1 ? 'Listo' : 'Pendiente', tip: 'Comparte un tip, un curso que terminaste o una especialización.' },
    {
      id: 'equipo', icon: '🤝', name: 'Buen equipo', rule: '2 reconocimientos, sin toc tocs vencidos ni revisiones atrasadas', done: teamOk,
      progress: `${Math.min(kudosGiven, 2)}/2 reconocimientos${expiredKnocks ? ` · ${expiredKnocks} toc toc vencido` : ''}${staleReviews ? ` · ${staleReviews} revisión atrasada` : ''}`,
      tip: staleReviews ? 'Tienes revisiones esperando: apruébalas o pide ajustes.' : expiredKnocks ? 'Responde tus toc tocs a tiempo.' : 'Reconoce a alguien que te ayudó.'
    }
  ];
  const count = stamps.filter((s) => s.done).length;
  return { month, stamps, count, level: count >= 5 ? 5 : count >= 3 ? 3 : 0 };
}
