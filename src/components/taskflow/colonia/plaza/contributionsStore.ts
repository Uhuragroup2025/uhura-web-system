/**
 * ============================================================================
 * CONTRIBUCIONES Y RECOMPENSAS REALES (BACKEND_REQUIREMENTS §32.9 y §32.10) — PROTOTIPO
 * ============================================================================
 * - Desbloqueos: al quitar el bloqueo de su tarea, la persona elige «¿Quién te
 *   ayudó?». Esa confirmación da 15 ECOINS a quien ayudó.
 * - Mentorías: el mentor la registra y quien aprende la confirma. Al confirmar,
 *   15 ECOINS al mentor (máx. 2 por semana).
 * - Recompensas reales: las registra Dirección (medio día, tarde o día libre).
 *   «Proyecto entregado» dispara la celebración y el cofre de cierre del equipo.
 * Los ECOINS se escriben en el libro de cada persona (idempotente por llave).
 * Solo del prototipo: localStorage. En producción: `task_unblocks`,
 * `mentorships`, `rewards`, `reward_recipients`.
 */

import { credit, loadRewards, saveRewards, weekStartIso, KUDOS, KudoId, KUDOS_PER_WEEK, kudosLeftThisWeek, kudoGivenThisWeekTo } from './plazaRewards';

export interface Unblock { id: string; taskId: string; taskTitle: string; blockedUser: { id: string; name: string }; helper: { id: string; name: string }; at: string }
export interface Mentorship { id: string; mentor: { id: string; name: string }; learner: { id: string; name: string }; topic: string; heldOn: string; confirmedAt?: string; createdAt: string }
export type RewardOccasion = 'project_delivered' | 'monthly_mission' | 'monthly_recognition' | 'specialization';
export type RewardKind = 'medio_dia' | 'tarde_libre' | 'dia_libre' | 'almuerzo_familia';
export interface RealReward {
  id: string;
  occasion: RewardOccasion;
  projectName?: string;
  kind: RewardKind;
  note?: string;
  decidedBy: string;
  decidedAt: string;
  recipients: { id: string; name: string; status: 'pendiente' | 'tomado'; takenOn?: string }[];
}

export const OCCASION_LABEL: Record<RewardOccasion, string> = {
  project_delivered: 'Proyecto entregado a tiempo y aprobado',
  monthly_mission: 'Misión del mes cumplida',
  monthly_recognition: 'Reconocimiento del mes',
  specialization: 'Especialización o diplomado terminado'
};
export const KIND_LABEL: Record<RewardKind, string> = { medio_dia: 'Medio día libre', tarde_libre: 'Tarde libre', dia_libre: 'Día libre', almuerzo_familia: 'Almuerzo en familia' };

const KEY = 'eco_contributions_v1';
export const CONTRIB_EVENT = 'eco:contributions-changed';
interface State { unblocks: Unblock[]; mentorships: Mentorship[]; rewards: RealReward[] }
const read = (): State => {
  try { const raw = localStorage.getItem(KEY); return raw ? { unblocks: [], mentorships: [], rewards: [], ...JSON.parse(raw) } : { unblocks: [], mentorships: [], rewards: [] }; } catch { return { unblocks: [], mentorships: [], rewards: [] }; }
};
const write = (s: State) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* solo prototipo */ }
  try { window.dispatchEvent(new CustomEvent(CONTRIB_EVENT)); } catch { /* sin navegador */ }
};
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/** Escribe ECOINS en el libro de otra persona (en el prototipo, su espacio del navegador). */
const creditUser = (userId: string, e: { key: string; amount: number; kind: string; label: string }) => {
  saveRewards(userId, credit(loadRewards(userId), e));
  try { window.dispatchEvent(new CustomEvent('eco:rewards-changed')); } catch { /* */ }
};
const grantChest = (userId: string, key: string) => {
  const r = loadRewards(userId);
  if (r.grants?.includes(key)) return;
  saveRewards(userId, { ...r, bonusChests: r.bonusChests + 1, grants: [...(r.grants || []), key] });
  try { window.dispatchEvent(new CustomEvent('eco:rewards-changed')); } catch { /* */ }
};
export { grantChest, creditUser };

export const loadContributions = read;

export const registerUnblock = (taskId: string, taskTitle: string, blockedUser: { id: string; name: string }, helper: { id: string; name: string }) => {
  if (blockedUser.id === helper.id) return;
  const s = read();
  const u: Unblock = { id: uid('unb'), taskId, taskTitle, blockedUser, helper, at: new Date().toISOString() };
  write({ ...s, unblocks: [u, ...s.unblocks] });
  creditUser(helper.id, { key: `unblock:${u.id}`, amount: 15, kind: 'unblock', label: `Desbloqueaste a ${blockedUser.name.split(' ')[0]} · ${taskTitle}` });
};

export const MENTORSHIPS_PER_WEEK = 2;
export const mentorshipsThisWeek = (mentorId: string) => read().mentorships.filter((m) => m.mentor.id === mentorId && m.confirmedAt && m.confirmedAt.slice(0, 10) >= weekStartIso()).length;

export const registerMentorship = (mentor: { id: string; name: string }, learner: { id: string; name: string }, topic: string) => {
  const s = read();
  const m: Mentorship = { id: uid('men'), mentor, learner, topic, heldOn: new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() };
  write({ ...s, mentorships: [m, ...s.mentorships] });
  return m;
};

export const confirmMentorship = (id: string) => {
  const s = read();
  const m = s.mentorships.find((x) => x.id === id);
  if (!m || m.confirmedAt) return;
  const over = mentorshipsThisWeek(m.mentor.id) >= MENTORSHIPS_PER_WEEK;
  const confirmed = { ...m, confirmedAt: new Date().toISOString() };
  write({ ...s, mentorships: s.mentorships.map((x) => (x.id === id ? confirmed : x)) });
  if (!over) creditUser(m.mentor.id, { key: `mentorship:${m.id}`, amount: 15, kind: 'mentorship', label: `Mentoría a ${m.learner.name.split(' ')[0]} · ${m.topic}` });
};

export const pendingMentorshipsFor = (learnerId: string) => read().mentorships.filter((m) => m.learner.id === learnerId && !m.confirmedAt);

/** Dirección registra una recompensa real. «Proyecto entregado» da además el cofre de cierre (rareza mínima épica) y 50 ECOINS. */
export const registerReward = (r: Omit<RealReward, 'id' | 'decidedAt'>) => {
  const s = read();
  const reward: RealReward = { ...r, id: uid('rew'), decidedAt: new Date().toISOString() };
  write({ ...s, rewards: [reward, ...s.rewards] });
  if (r.occasion === 'project_delivered') {
    reward.recipients.forEach((p) => {
      grantChest(p.id, `closure:${reward.id}`);
      creditUser(p.id, { key: `project_delivered:${reward.id}`, amount: 50, kind: 'project_delivered', label: `Proyecto entregado · ${r.projectName || ''}` });
    });
  }
  const head = r.occasion === 'project_delivered'
    ? { who: 'El equipo', verb: 'entregó', task: r.projectName ? `«${r.projectName}»` : 'el proyecto' }
    : r.occasion === 'monthly_mission'
      ? { who: 'Uhura', verb: 'cumplió', task: 'la misión del mes' }
      : r.occasion === 'specialization'
      ? { who: reward.recipients.map((p) => p.name.split(' ')[0]).join(', '), verb: 'terminó', task: r.note ? `la especialización «${r.note}» 🏅` : 'una especialización 🏅' }
      : { who: reward.recipients.map((p) => p.name.split(' ')[0]).join(', '), verb: 'recibe', task: 'el reconocimiento del mes' };
  const prize = `${KIND_LABEL[r.kind]} para ${r.recipients.length} ${r.recipients.length === 1 ? 'persona' : 'personas'} 🎁`;
  try { window.dispatchEvent(new CustomEvent('eco:celebrate', { detail: { ...head, project: prize } })); } catch { /* */ }
  return reward;
};

/** Al tomar el día, se registra como ausencia `earned_day_off` (en el prototipo solo se marca). */
export const markRewardTaken = (rewardId: string, userId: string) => {
  const s = read();
  write({ ...s, rewards: s.rewards.map((r) => (r.id !== rewardId ? r : { ...r, recipients: r.recipients.map((p) => (p.id === userId ? { ...p, status: 'tomado', takenOn: new Date().toISOString().slice(0, 10) } : p)) })) });
};

/**
 * Reconocimiento (§32.9): máx. 3 por semana, no a uno mismo ni a la misma persona dos veces
 * en la semana. Quien lo recibe suma 5 ECOINS y el reconocimiento queda en su lista.
 * Lo usan La Plaza y «Hoy en Uhura» (Mi Día).
 */
export const giveKudo = (giver: { id: string; name: string }, receiver: { id: string; name: string }, kind: KudoId): { ok: true; msg: string } | { ok: false; msg: string } => {
  const first = receiver.name.split(' ')[0];
  if (giver.id === receiver.id) return { ok: false, msg: 'No puedes reconocerte a ti misma.' };
  const mine = loadRewards(giver.id);
  if (kudosLeftThisWeek(mine) <= 0) return { ok: false, msg: `Ya diste tus ${KUDOS_PER_WEEK} reconocimientos de esta semana. El lunes tienes más.` };
  if (kudoGivenThisWeekTo(mine, receiver.id)) return { ok: false, msg: `Ya reconociste a ${first} esta semana.` };
  const k = KUDOS.find((x) => x.id === kind)!;
  const at = new Date().toISOString();
  saveRewards(giver.id, { ...mine, kudosGiven: [...mine.kudosGiven, { to: receiver.id, at }] });
  const theirs = loadRewards(receiver.id);
  saveRewards(receiver.id, credit({ ...theirs, kudos: [{ from: giver.name.split(' ')[0], kind, at }, ...theirs.kudos].slice(0, 50) }, { key: `kudo:${giver.id}:${receiver.id}:${weekStartIso()}`, amount: 5, kind: 'kudo_received', label: `${k.emoji} ${k.label} de ${giver.name.split(' ')[0]}`, at }));
  try { window.dispatchEvent(new CustomEvent('eco:rewards-changed')); } catch { /* */ }
  return { ok: true, msg: `Reconociste a ${first}: ${k.emoji} ${k.label}. Le suma 5 ECOINS.` };
};
