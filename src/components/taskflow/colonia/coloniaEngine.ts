/**
 * ============================================================================
 * LA COLONIA · ENGINE & REPUTATION SYSTEM (ORBIT BY UHURA)
 * ============================================================================
 * 
 * Reglas Fundamentales:
 * 1. NUNCA premia trabajar 8 horas ni castiga la capacidad libre.
 * 2. 🪵 Madera: Higiene de tareas asignadas con avance claro y certero.
 * 3. ⚡ Energía: Cumplimiento de lo planificado (sean 3h, 4h u 8h).
 * 4. ✨ Orbes: Alerta temprana de riesgos/desvíos antes de vencer.
 * 5. La capacidad libre es información positiva para líderes/directores.
 */

import { ColonyState, ColonyStructure, BuckyAccessory, ColonyHabitEvent, ColonyResources } from './types';
import { TaskItem } from '../types';

const STORAGE_KEY = 'orbit_colonia_state_v1';

export const INITIAL_STRUCTURES: ColonyStructure[] = [
  // NIVEL 1: El Remanso (Estructuras de inicio)
  {
    id: 'represa_1',
    name: 'Represa de Piedra y Cedro',
    description: 'Estabiliza el cauce del río y asegura el suministro de agua cristalina para la colonia.',
    level: 1,
    category: 'base',
    cost: { wood: 0, energy: 0, orbs: 0 },
    icon: '🪨',
    unlocked: true,
    builtAt: '2026-09-01',
    gridSlot: 'river_bed',
    tooltipAction: 'El agua corre serena gracias al cauce regulado.'
  },
  {
    id: 'muelle_troncos',
    name: 'Muelle de Troncos Pulidos',
    description: 'Punto de reunión ribereño donde Bucky revisa los planos y toma café al sol.',
    level: 1,
    category: 'base',
    cost: { wood: 10, energy: 4, orbs: 0 },
    icon: '🪵',
    unlocked: true,
    builtAt: '2026-09-03',
    gridSlot: 'dock_main',
    tooltipAction: 'Un muelle firme para observar los barcos de proyectos.'
  },
  {
    id: 'banco_descanso',
    name: 'Banco de Descanso Bajo el Sauce',
    description: 'Espacio ergonómico para pausar 2 minutos, respirar y estirar la vista.',
    level: 1,
    category: 'vitalidad',
    cost: { wood: 15, energy: 6, orbs: 0 },
    icon: '🪑',
    unlocked: true,
    builtAt: '2026-09-06',
    gridSlot: 'shore_left',
    tooltipAction: 'Bucky se sienta aquí durante las pausas de bienestar.'
  },
  {
    id: 'jardin_ribereno',
    name: 'Jardín de Juncos y Helechos',
    description: 'Vegetación autóctona que filtra el agua y atrae fauna amigable.',
    level: 1,
    category: 'vitalidad',
    cost: { wood: 20, energy: 8, orbs: 1 },
    icon: '🌿',
    unlocked: false,
    gridSlot: 'shore_right',
    tooltipAction: 'Aromatiza el hábitat y reduce el estrés del entorno.'
  },

  // NIVEL 2: La Cabaña Taller
  {
    id: 'cabana_taller',
    name: 'Cabaña Taller de Bucky',
    description: 'Estructura principal de diseño y carpintería con mesa de corte y estanterías.',
    level: 2,
    category: 'arquitectura',
    cost: { wood: 35, energy: 15, orbs: 2 },
    icon: '🏡',
    unlocked: false,
    gridSlot: 'center_high',
    tooltipAction: 'Centro neurálgico donde se conciben los ensambles de la colonia.'
  },
  {
    id: 'puente_madera',
    name: 'Puente de Ensambles Precisos',
    description: 'Conecta ambas orillas del río sin alterar la corriente natural.',
    level: 2,
    category: 'arquitectura',
    cost: { wood: 25, energy: 12, orbs: 1 },
    icon: '🌉',
    unlocked: false,
    gridSlot: 'river_cross',
    tooltipAction: 'Facilita el paso continuo de Bucky con materiales secos.'
  },
  {
    id: 'faroles_solares',
    name: 'Faroles Solares Uhura',
    description: 'Luminarias fotovoltaicas que proyectan un cálido resplandor morado al caer la tarde.',
    level: 2,
    category: 'orbital',
    cost: { wood: 20, energy: 18, orbs: 2 },
    icon: '🏮',
    unlocked: false,
    gridSlot: 'path_lights',
    tooltipAction: 'Guían el regreso seguro al finalizar la jornada planificada.'
  },
  {
    id: 'rueda_hidraulica',
    name: 'Rueda Hidráulica de Flujo Suave',
    description: 'Genera energía limpia utilizando la corriente moderada del río.',
    level: 2,
    category: 'orbital',
    cost: { wood: 40, energy: 20, orbs: 2 },
    icon: '⚙️',
    unlocked: false,
    gridSlot: 'water_wheel',
    tooltipAction: 'Gira con cadencia tranquila al ritmo del avance en equipo.'
  },

  // NIVEL 3: El Observatorio Fluvial Orbital
  {
    id: 'observatorio',
    name: 'Observatorio Fluvial de Constelaciones',
    description: 'Cúpula geodésica de madera curvada y cristal templado para divisar metas lejanas.',
    level: 3,
    category: 'orbital',
    cost: { wood: 60, energy: 30, orbs: 5 },
    icon: '🔭',
    unlocked: false,
    gridSlot: 'summit_peak',
    tooltipAction: 'Permite a Bucky otear proyectos en el horizonte con semanas de anticipación.'
  },
  {
    id: 'baliza_estelar',
    name: 'Baliza de Sincronización Uhura',
    description: 'Emisor de frecuencias suaves que mantiene a La Colonia en sintonía con el núcleo de Orbit.',
    level: 3,
    category: 'orbital',
    cost: { wood: 70, energy: 35, orbs: 6 },
    icon: '📡',
    unlocked: false,
    gridSlot: 'orbit_beacon',
    tooltipAction: 'Destella en tono lima-morado cuando la capacidad del equipo es transparente.'
  }
];

export const INITIAL_ACCESSORIES: BuckyAccessory[] = [
  {
    id: 'taza_cafe_uhura',
    name: 'Taza Cerámica Uhura',
    description: 'Taza morada oficial para el café de la mañana y las pausas de respiración.',
    type: 'hand',
    cost: { wood: 5, energy: 4 },
    icon: '☕',
    equipped: true,
    unlocked: true
  },
  {
    id: 'plano_enrollado',
    name: 'Plano Arquitectónico de Cedro',
    description: 'Contiene las cotas y el cronograma de ensamble de la represa.',
    type: 'hand',
    cost: { wood: 15, orbs: 1 },
    icon: '📜',
    equipped: false,
    unlocked: true
  },
  {
    id: 'gorro_tejido_morado',
    name: 'Gorro Tejido Morado Uhura',
    description: 'Gorro de lana suave para mañanas frescas junto al río.',
    type: 'head',
    cost: { energy: 10, orbs: 1 },
    icon: '🧢',
    equipped: false,
    unlocked: false
  },
  {
    id: 'lentes_presicion',
    name: 'Lentes de Precisión de Carpintero',
    description: 'Montura delgada de latón para inspeccionar encastres y uniones de madera.',
    type: 'head',
    cost: { wood: 20, orbs: 2 },
    icon: '👓',
    equipped: false,
    unlocked: false
  },
  {
    id: 'mochila_cuero',
    name: 'Mochila de Cuero para Herramientas',
    description: 'Espacio compacto y resistente para transportar calibradores y lápices.',
    type: 'back',
    cost: { wood: 25, energy: 12 },
    icon: '🎒',
    equipped: false,
    unlocked: false
  },
  {
    id: 'luciernagas_orbitales',
    name: 'Enjambre de Luciérnagas Moradas',
    description: 'Pequeños puntos de bioluminiscencia orbital que flotan con delicadeza alrededor de Bucky.',
    type: 'ambient',
    cost: { orbs: 4 },
    icon: '✨',
    equipped: false,
    unlocked: false
  }
];

export const INITIAL_HABIT_HISTORY: ColonyHabitEvent[] = [
  {
    id: 'ev-init-1',
    timestamp: 'Hoy, 09:30',
    title: 'Plan del día definido con precisión',
    description: '4h asignadas identificadas y priorizadas sin sobrecarga.',
    rewardType: 'energy',
    amount: 2,
    source: 'plan_completed'
  },
  {
    id: 'ev-init-2',
    timestamp: 'Hoy, 11:15',
    title: 'Alerta preventiva de alcance',
    description: 'Riesgo de render 3D comunicado con 4h de margen al director.',
    rewardType: 'orbs',
    amount: 1,
    source: 'early_risk_alert'
  },
  {
    id: 'ev-init-3',
    timestamp: 'Ayer, 18:00',
    title: 'Higiene prolija de tareas',
    description: 'Todas las asignaciones activas registradas con avance claro.',
    rewardType: 'wood',
    amount: 4,
    source: 'tasks_hygiene'
  }
];

export function loadColonyState(): ColonyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validar integridad mínima
      if (parsed && parsed.resources && Array.isArray(parsed.structures)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error loading colony state from localStorage:', err);
  }

  // Estado inicial por defecto
  return {
    level: 1,
    resources: {
      wood: 28,
      energy: 14,
      orbs: 3
    },
    structures: INITIAL_STRUCTURES,
    accessories: INITIAL_ACCESSORIES,
    history: INITIAL_HABIT_HISTORY,
    lastVisited: new Date().toISOString(),
    consecutiveHealthyDays: 6,
    availableCapacityHoursToday: 4.0
  };
}

export function saveColonyState(state: ColonyState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Error saving colony state to localStorage:', err);
  }
}

/**
 * Evalúa hábitos reales de Orbit para otorgar recursos sin penalizar capacidad libre:
 */
export function evaluateOrbitHabitsForColony(
  currentState: ColonyState,
  tasks: TaskItem[],
  loggedHoursToday: number,
  plannedHoursToday: number = 4.0
): { updatedState: ColonyState; newEvents: ColonyHabitEvent[] } {
  let { resources, structures, level, history, consecutiveHealthyDays } = currentState;
  const newEvents: ColonyHabitEvent[] = [];

  const nowStr = 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Tareas asignadas con avance claro (Higiene)
  const activeTasks = tasks.filter(t => t.status === 'In Progress');
  const tasksWithProgress = activeTasks.filter(t => (t.consumedSeconds || 0) > 0);
  
  // Si al menos 1 tarea activa tiene avance o todas las asignadas están prolijas
  const todayKey = new Date().toISOString().slice(0, 10);
  const alreadyLoggedHygiene = history.some(
    h => h.source === 'tasks_hygiene' && h.timestamp.includes('Hoy')
  );

  if (!alreadyLoggedHygiene && tasksWithProgress.length > 0) {
    const woodAward = 3;
    resources = { ...resources, wood: resources.wood + woodAward };
    const ev: ColonyHabitEvent = {
      id: 'hygiene-' + Date.now(),
      timestamp: nowStr,
      title: 'Higiene de tareas confirmada',
      description: `${tasksWithProgress.length} tarea(s) con avance fidedigno y sin items en el limbo.`,
      rewardType: 'wood',
      amount: woodAward,
      source: 'tasks_hygiene'
    };
    newEvents.push(ev);
    history = [ev, ...history.slice(0, 25)];
  }

  // 2. Cumplimiento de lo planificado (sean 3h, 4h u 8h)
  const alreadyLoggedPlan = history.some(
    h => h.source === 'plan_completed' && h.timestamp.includes('Hoy')
  );

  if (!alreadyLoggedPlan && loggedHoursToday >= plannedHoursToday && plannedHoursToday > 0) {
    const energyAward = 2;
    resources = { ...resources, energy: resources.energy + energyAward };
    const ev: ColonyHabitEvent = {
      id: 'plan-' + Date.now(),
      timestamp: nowStr,
      title: 'Plan asignado cumplido al 100%',
      description: `Completadas las ${plannedHoursToday.toFixed(1)}h planificadas con precisión y serenidad.`,
      rewardType: 'energy',
      amount: energyAward,
      source: 'plan_completed'
    };
    newEvents.push(ev);
    history = [ev, ...history.slice(0, 25)];
  }

  // 3. Capacidad disponible calculada (información pura, 0 penalización)
  const targetDayTotal = 8.0;
  const availableCapacity = Math.max(0, targetDayTotal - loggedHoursToday);

  // Recalcular nivel de colonia según estructuras construidas
  const builtCount = structures.filter(s => s.unlocked).length;
  if (builtCount >= 7) {
    level = 3;
  } else if (builtCount >= 4) {
    level = 2;
  } else {
    level = 1;
  }

  const updatedState: ColonyState = {
    ...currentState,
    level,
    resources,
    structures,
    history,
    availableCapacityHoursToday: availableCapacity,
    lastVisited: new Date().toISOString()
  };

  saveColonyState(updatedState);
  return { updatedState, newEvents };
}

/**
 * Construir una estructura en La Colonia
 */
export function buildStructure(
  state: ColonyState,
  structureId: string
): { success: boolean; state: ColonyState; message: string } {
  const structure = state.structures.find(s => s.id === structureId);
  if (!structure) {
    return { success: false, state, message: 'Estructura no encontrada.' };
  }
  if (structure.unlocked) {
    return { success: false, state, message: 'Esta estructura ya fue ensamblada.' };
  }

  // Verificar recursos suficientes
  const { wood, energy, orbs } = state.resources;
  const cost = structure.cost;

  if (wood < cost.wood || energy < cost.energy || orbs < cost.orbs) {
    return {
      success: false,
      state,
      message: `Recursos insuficientes. Requiere: ${cost.wood ? cost.wood + ' 🪵 ' : ''}${cost.energy ? cost.energy + ' ⚡ ' : ''}${cost.orbs ? cost.orbs + ' ✨' : ''}`
    };
  }

  // Deducir recursos y desbloquear
  const updatedResources: ColonyResources = {
    wood: wood - cost.wood,
    energy: energy - cost.energy,
    orbs: orbs - cost.orbs
  };

  const updatedStructures = state.structures.map(s =>
    s.id === structureId
      ? { ...s, unlocked: true, builtAt: new Date().toISOString().slice(0, 10) }
      : s
  );

  const builtCount = updatedStructures.filter(s => s.unlocked).length;
  let newLevel = state.level;
  if (builtCount >= 7) newLevel = 3;
  else if (builtCount >= 4) newLevel = 2;

  const ev: ColonyHabitEvent = {
    id: 'build-' + Date.now(),
    timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    title: `Ensamble completado: ${structure.name}`,
    description: structure.description,
    rewardType: 'wood',
    amount: 0,
    source: 'plan_completed'
  };

  const newState: ColonyState = {
    ...state,
    level: newLevel,
    resources: updatedResources,
    structures: updatedStructures,
    history: [ev, ...state.history.slice(0, 25)]
  };

  saveColonyState(newState);
  return {
    success: true,
    state: newState,
    message: `¡${structure.name} ensamblado con éxito en La Colonia! 🪵✨`
  };
}

/**
 * Recompensar una alerta temprana de riesgo disparada en Orbit
 */
export function recordEarlyRiskAlertReward(state: ColonyState, taskTitle: string): ColonyState {
  const orbsReward = 1;
  const ev: ColonyHabitEvent = {
    id: 'risk-' + Date.now(),
    timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    title: 'Alerta temprana de riesgo reconocida',
    description: `Avisaste con antelación el desvío en "${taskTitle.slice(0, 30)}...". Equipo protegido.`,
    rewardType: 'orbs',
    amount: orbsReward,
    source: 'early_risk_alert'
  };

  const newState: ColonyState = {
    ...state,
    resources: {
      ...state.resources,
      orbs: state.resources.orbs + orbsReward
    },
    history: [ev, ...state.history.slice(0, 25)]
  };

  saveColonyState(newState);
  return newState;
}

/**
 * Recompensa por minijuego de micro-pausa (15 a 30s)
 */
export function rewardMinigameCompletion(
  state: ColonyState,
  minigame: 'vado' | 'respiracion' | 'clasificador'
): ColonyState {
  let rewardWood = 0;
  let rewardEnergy = 0;
  let title = '';

  if (minigame === 'vado') {
    rewardWood = 2;
    title = 'Vado del río cruzado con éxito 🪵';
  } else if (minigame === 'respiracion') {
    rewardEnergy = 2;
    title = 'Pausa de respiración y calma completada 🌿';
  } else {
    rewardWood = 1;
    rewardEnergy = 1;
    title = 'Maderas ribereñas clasificadas ⚙️';
  }

  const ev: ColonyHabitEvent = {
    id: 'mini-' + Date.now(),
    timestamp: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    title,
    description: 'Micro-pausa activa de 20s. Bucky y tu mente descansaron.',
    rewardType: rewardEnergy ? 'energy' : 'wood',
    amount: rewardEnergy || rewardWood,
    source: 'plan_completed'
  };

  const newState: ColonyState = {
    ...state,
    resources: {
      wood: state.resources.wood + rewardWood,
      energy: state.resources.energy + rewardEnergy,
      orbs: state.resources.orbs
    },
    history: [ev, ...state.history.slice(0, 25)]
  };

  saveColonyState(newState);
  return newState;
}
