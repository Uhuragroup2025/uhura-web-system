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
  projectKey: string;
  client?: string;
  /** Regla §32.3: el título de la tarea solo lo ve quien está en el proyecto. */
  taskVisible?: boolean;
}

export const projectKeyOf = (t: TaskItem | null) => (t ? t.projectId || t.projectName || t.board || 'interno' : 'interno');

/**
 * Proyectos en los que está quien mira (§32.3): tiene tareas en él, lo lidera,
 * o es `executive` / `system_admin` (ven todo).
 */
export const projectsVisibleTo = (viewer: UserItem | undefined, tasks: TaskItem[], users: UserItem[]): Set<string> | 'all' => {
  if (!viewer) return new Set();
  const level = String(viewer.accessLevel || '');
  if (level === 'executive' || level === 'system_admin') return 'all';
  const matches = makePersonMatcher(viewer, users);
  const set = new Set<string>();
  tasks.forEach((t) => {
    const lead = !!t.projectLead && matches({ name: t.projectLead.name });
    if (isTaskOwner(t, viewer, matches) || lead) set.add(projectKeyOf(t));
  });
  return set;
};

const isOpen = (t: TaskItem) => !['Done', 'completed', 'cancelled'].includes(String(t.status));

/** La tarea en la que estaría trabajando (prototipo: una de sus tareas abiertas). */
export const workFor = (u: UserItem, tasks: TaskItem[], users: UserItem[], pickIdx: number): WorkInfo => {
  const matches = makePersonMatcher(u, users);
  // Solo tareas propias: la presencia simulada no le asigna a nadie una tarea ajena (QA 22 Nov 2026)
  const own = tasks.filter((t) => isOpen(t) && isTaskOwner(t, u, matches));
  const t = own.length ? own[pickIdx % own.length] : null;
  return {
    verb: verbOf(u),
    task: t?.title || 'Pendientes del día',
    project: t?.projectName || t?.board || 'Proyecto interno',
    projectKey: projectKeyOf(t),
    client: t?.clientName
  };
};

/** Fin de la reunión simulada: siempre en el futuro (entre 15 y 60 min desde ahora), en hora de Colombia. */
export const meetingUntil = (seed: number) => {
  const d = new Date(Date.now() + (15 + (seed % 4) * 15) * 60000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return d.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
};

export type MediaKind = 'spotify' | 'youtube';
export interface SharedMedia {
  kind: MediaKind;
  /** Enlace original, para abrirlo en la app de cada persona. */
  url: string;
  /** Versión para insertar en ECO. */
  embed: string;
  /** Qué es: playlist, álbum, canción, video o lista de videos. */
  label: string;
}

/** Reconoce enlaces de Spotify (playlist, álbum, canción) y YouTube (video, lista, short). */
export const parseMedia = (raw: string): SharedMedia | null => {
  const link = raw.trim();
  const sp = link.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track)\/([A-Za-z0-9]+)/);
  if (sp) {
    const label = sp[1] === 'playlist' ? 'Playlist' : sp[1] === 'album' ? 'Álbum' : 'Canción';
    return { kind: 'spotify', url: link, embed: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}?utm_source=generator&theme=0`, label };
  }
  const list = link.match(/[?&]list=([A-Za-z0-9_-]+)/);
  const vid = link.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (/youtu\.?be/.test(link) && (vid || list)) {
    if (vid) return { kind: 'youtube', url: link, embed: `https://www.youtube-nocookie.com/embed/${vid[1]}?rel=0${list ? `&list=${list[1]}` : ''}`, label: list ? 'Lista de videos' : 'Video' };
    return { kind: 'youtube', url: link, embed: `https://www.youtube-nocookie.com/embed/videoseries?list=${list![1]}`, label: 'Lista de videos' };
  }
  return null;
};
