/**
 * ============================================================================
 * LA COLONIA · TYPES & DATA STRUCTURES (ORBIT BY UHURA)
 * ============================================================================
 * 
 * Principio de Producto:
 * "Orbit no mide compromiso por cantidad de horas trabajadas. Mide claridad
 *  operativa, cumplimiento de lo asignado y capacidad de anticipar riesgos."
 */

export interface ColonyResources {
  wood: number;    // 🪵 Madera Fina: Tareas/proyectos asignados actualizados y con avance claro
  energy: number;  // ⚡ Energía Vital: Cumplir lo planificado (sin importar si fueron 3h, 4h u 8h)
  orbs: number;    // ✨ Orbes de Claridad: Alertar un riesgo antes de que se convierta en desvío
}

export type ColonyLevel = 1 | 2 | 3;

export interface ColonyStructure {
  id: string;
  name: string;
  description: string;
  level: ColonyLevel;
  category: 'base' | 'vitalidad' | 'arquitectura' | 'orbital';
  cost: {
    wood: number;
    energy: number;
    orbs: number;
  };
  icon: string;
  unlocked: boolean;
  builtAt?: string;
  gridSlot: string; // posición en el diorama
  tooltipAction?: string;
}

export interface BuckyAccessory {
  id: string;
  name: string;
  description: string;
  type: 'hand' | 'head' | 'back' | 'ambient';
  cost: {
    wood?: number;
    energy?: number;
    orbs?: number;
  };
  icon: string;
  equipped: boolean;
  unlocked: boolean;
}

export interface ColonyHabitEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  rewardType: 'wood' | 'energy' | 'orbs';
  amount: number;
  source: 'plan_completed' | 'early_risk_alert' | 'tasks_hygiene' | 'available_capacity_declared' | 'week_closed';
}

export type ColonyGameId = 'torre' | 'nenufar';

/**
 * ============================================================================
 * CONTRATOS MÍNIMOS DE BACKEND & PERSISTENCIA (CHECKPOINT LA COLONIA)
 * ============================================================================
 * 
 * 1. Persistencia de Prototipo:
 *    La persistencia actual en localStorage (GameResult, ColonyChallenge y ranking)
 *    es EXCLUSIVAMENTE para prototipado y validación de interacción en frontend.
 *    En producción, el backend (Django REST Framework / PostgreSQL) será la fuente
 *    de verdad autoritativa para registrar puntuaciones, orquestar retos asíncronos
 *    entre usuarios reales y consolidar el ranking unificado.
 * 
 * 2. Contratos Mínimos de Backend:
 *    - GameResult: Registra el intento/partida individual del colaborador.
 *    - ColonyChallenge: Orquesta el reto asíncrono 1-a-1 entre dos colaboradores.
 * 
 * 3. WeeklyLeaderboardEntry como Read Model Derivado:
 *    WeeklyLeaderboardEntry es una proyección / estructura derivada calculada a partir
 *    de los GameResult de la semana activa (MAX(score) agrupado por userId).
 *    NO se debe asumir que requiere una tabla física propia en base de datos.
 * 
 * 4. Notificaciones del Sistema:
 *    El sistema central de notificaciones de Orbit (in-app / campana) es el requisito
 *    funcional para conectar los avisos de reto (recibido, superado o completado) una vez
 *    el backend esté disponible. Las notificaciones push quedan como capacidad evolutiva
 *    futura, no como dependencia actual.
 * 
 * 5. Historial Mínimo Estricto:
 *    El historial se limita a retos recientes/completados con acción de revancha.
 *    No se contemplan ligas acumulativas, temporadas, ni estadísticas históricas.
 */

export interface TeammateOption {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarUrl?: string | null;
  score?: number;
}

/** Contrato mínimo de resultado individual de partida */
export interface GameResult {
  id: string;
  userId: string;
  userName: string;
  gameId: ColonyGameId;
  score: number;
  createdAt: string;
}

/** Contrato mínimo de reto asíncrono 1-a-1 entre colaboradores */
export interface ColonyChallenge {
  id: string;
  gameId: ColonyGameId;
  challengerUserId: string;
  challengerName: string;
  challengerInitials: string;
  challengerRole: string;
  challengerAvatarBg: string;
  challengerScore: number;
  challengedUserId: string;
  challengedName: string;
  challengedInitials: string;
  challengedRole: string;
  challengedAvatarBg: string;
  challengedScore?: number;
  status: 'pending' | 'completed';
  winnerUserId?: string; // Derivado a partir de las puntuaciones (no requiere persistencia redundante obligatoria en backend)
  createdAt: string;
  completedAt?: string;
}

/**
 * Read Model / Proyección derivada del ranking semanal.
 * No requiere persistencia física propia; se deriva de GameResult de la semana en curso.
 */
export interface WeeklyLeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  score: number;
  highlight?: boolean;
}

export type ColonyMinigameType = 'vado' | 'respiracion' | 'clasificador' | 'torre' | 'nenufar';

export interface ColonyState {
  level: ColonyLevel;
  resources: ColonyResources;
  structures: ColonyStructure[];
  accessories: BuckyAccessory[];
  history: ColonyHabitEvent[];
  lastVisited?: string;
  consecutiveHealthyDays: number;
  availableCapacityHoursToday: number;
}
