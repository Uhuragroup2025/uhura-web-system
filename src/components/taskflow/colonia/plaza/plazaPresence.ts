/**
 * ============================================================================
 * LA PLAZA · PRESENCIA DE TRABAJO (ECO BY UHURA) — PROTOTIPO
 * ============================================================================
 * Traduce lo que ECO ya sabe en lo que se ve en La Plaza:
 * - Cronómetro corriendo → en El Estudio, en el escritorio de su área,
 *   con la tarea y el proyecto («Diseñando · Key visual · BattSaver»).
 * - Evento en Google Calendar → en la Sala de reuniones («hasta las 3:00 p. m.»).
 * - Ausencia → no aparece; cuenta en «Fuera hoy».
 * - Conectado sin cronómetro → en la plaza, disponible.
 *
 * Solo del prototipo: quién trabaja y quién está en reunión se simula a partir
 * de las tareas de prueba. En producción viene del cronómetro, del calendario y
 * de las ausencias. Nunca se muestran horas acumuladas ni tiempo en La Plaza.
 */

import { TaskItem, UserItem } from '../../types';
import { makePersonMatcher, isTaskOwner } from '../../auth/taskVisibility';

export type AreaId = 'creative' | 'digital' | 'growth' | 'direccion';

export const AREAS: { id: AreaId; name: string; color: string }[] = [
  { id: 'creative', name: 'Creative', color: '#f472b6' },
  { id: 'digital', name: 'Digital y Producto', color: '#3dd9eb' },
  { id: 'growth', name: 'Growth', color: '#d4ff3f' },
  { id: 'direccion', name: 'Dirección y Comercial', color: '#fbbf24' }
];

const textOf = (u: UserItem) => `${u.department || ''} ${u.jobTitle || ''} ${u.officialRole || ''}`.toLowerCase();

export const areaOf = (u: UserItem): AreaId => {
  const t = textOf(u);
  if (/growth|tráfico|trafico|performance|medios|digiops|trafficker/.test(t)) return 'growth';
  if (/tecnolog|producto|front|digital designer|product/.test(t)) return 'digital';
  if (/creativ|diseño|design|contenid|content|community|copy|multimedia/.test(t)) return 'creative';
  return 'direccion';
};

export const verbOf = (u: UserItem): string => {
  // Primero el cargo; el área solo desempata
  const job = `${u.jobTitle || ''} ${u.officialRole || ''}`.toLowerCase();
  const all = textOf(u);
  if (/front|desarroll|developer/.test(job)) return 'Desarrollando';
  if (/product lead/.test(job)) return 'Definiendo';
  if (/design|diseñ|multimedia/.test(job)) return 'Diseñando';
  if (/copy|content|contenid|community/.test(job)) return 'Escribiendo';
  if (/growth|tráfico|trafico|traffic|performance|medios|digiops|trafficker/.test(job)) return 'Optimizando';
  if (/comercial|new business/.test(job)) return 'Preparando propuesta';
  if (/design|diseñ/.test(all)) return 'Diseñando';
  return 'Gestionando';
};

export interface WorkInfo {
  verb: string;
  task: string;
  project: string;
  client?: string;
}

const isOpen = (t: TaskItem) => !['Done', 'completed', 'cancelled'].includes(String(t.status));

/** La tarea en la que estaría trabajando (prototipo: una de sus tareas abiertas). */
export const workFor = (u: UserItem, tasks: TaskItem[], users: UserItem[], pickIdx: number): WorkInfo => {
  const matches = makePersonMatcher(u, users);
  const own = tasks.filter((t) => isOpen(t) && isTaskOwner(t, u, matches));
  const pool = own.length ? own : tasks.filter(isOpen);
  const t = pool.length ? pool[pickIdx % pool.length] : null;
  return {
    verb: verbOf(u),
    task: t?.title || 'Pendientes del día',
    project: t?.projectName || t?.board || 'Proyecto interno',
    client: t?.clientName
  };
};

const MEETING_ENDS = ['10:30 a. m.', '11:00 a. m.', '12:00 m.', '2:30 p. m.', '3:00 p. m.', '4:00 p. m.'];
export const meetingUntil = (seed: number) => MEETING_ENDS[seed % MEETING_ENDS.length];

/** DJ de la semana: rota por el equipo cada semana. */
export const djOfWeek = (users: UserItem[]): UserItem | null => {
  const active = users.filter((u) => u.status !== 'Inactive');
  if (!active.length) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor(((now.getTime() - start.getTime()) / 86400000 + start.getDay()) / 7);
  return active[week % active.length];
};

/** Convierte un enlace de Spotify en su versión para insertar. */
export const spotifyEmbedUrl = (link: string): string | null => {
  const m = link.trim().match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : null;
};
