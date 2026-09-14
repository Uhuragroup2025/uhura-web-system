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

export type ColonyMinigameType = 'vado' | 'respiracion' | 'clasificador';

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
