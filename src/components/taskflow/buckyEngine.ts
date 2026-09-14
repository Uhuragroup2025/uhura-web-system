import buckyHoodieHappyImg from '../../assets/images/bucky_hip_uhura_v3.png';
import buckyCelebratingImg from '../../assets/images/bucky_celebrating_cutout.png';
import buckyAlertImg from '../../assets/images/bucky_alert_cutout.png';
import buckyFocusImg from '../../assets/images/bucky_focus_cutout.png';
import buckyRestingImg from '../../assets/images/bucky_resting_cutout.png';
import buckyWavingImg from '../../assets/images/bucky_waving_cutout.png';
import { ActiveTimerState, TaskItem } from './types';

// ==========================================
// 1. TIPOS INTERNOS Y VISUALES DE BUCKY
// ==========================================
//
// ⚠️ NOTA DE SEGURIDAD Y ARQUITECTURA (PRODUCCIÓN):
// El simulador BuckyLabModal y sus atajos (?buckyLab=true, Shift+Alt+B) son
// EXCLUSIVAMENTE mecanismos provisionales de desarrollo / prototipado.
// En producción, el acceso a pruebas de estados y catálogo interno DEBE
// protegerse mediante permisos reales de usuario/administrador (RBAC: e.g.
// user.role === 'admin' o permiso de sistema 'bucky_lab').
// ==========================================

export type BuckyInternalStateKey =
  | 'CRITICAL_OVERTIME'      // 1. Alerta / Desvío de horas en riesgo
  | 'ACTIVE_TIMER'           // 2. Cronómetro corriendo en tarea activa
  | 'DAY_CLOSED_SUCCESS'     // 3. Cierre exitoso de jornada / todas las tareas listas
  | 'RECENT_TASK_COMPLETED'  // 4. Micro-celebración / aplauso transitorio por tarea completada
  | 'BREAK_RECOMMENDED'      // 5. Sugerencia de bienestar y ergonomía física (no evaluación de productividad)
  | 'FIRST_VISIT_TODAY'      // 6. Saludo inicial del día
  | 'INACTIVITY_IDLE'        // 7. Pausa / estiramiento por inactividad
  | 'NORMAL_EQUILIBRIUM'     // 8. Estado base con Buzo Uhura oficial
  | 'SAD';                   // Preservado para el laboratorio / casos excepcionales

export type BuckyPose =
  | 'alert'
  | 'focus'
  | 'celebrate'
  | 'clap'
  | 'rest'
  | 'tired'
  | 'wave'
  | 'yawn'
  | 'stretch'
  | 'happy'
  | 'idle'
  | 'sad';

export interface BuckyResolvedState {
  internalKey: BuckyInternalStateKey;
  pose: BuckyPose;
  image: string;
  humanBadge: string;
  badgeText: string;
  badgeColor: string;
  headline: string;
  speech: string;
  description: string;
  isAlert: boolean;
  cta?: {
    label: string;
    actionType: 'notify_overtime' | 'start_break' | 'review_day';
    task?: TaskItem;
  };
  soundType?: 'alert' | 'celebrate' | 'clap' | 'focus' | 'wave' | 'yawn' | 'rest' | 'pop' | 'happy';
}

export interface BuckyContext {
  loggedHoursToday: number;
  targetDayHours?: number;
  criticalOvertimeTasks?: TaskItem[];
  activeTimer?: ActiveTimerState | null;
  allTasksCompleted?: boolean;
  hasTasks?: boolean;
  recentTaskCompleted?: boolean;
  isBreakRecommended?: boolean;
  isFirstVisitToday?: boolean;
  isInactiveIdle?: boolean;
  hasNotifiedOvertime?: boolean;
}

// ==========================================
// 2. SINTETIZADOR WEB AUDIO PROCEDURAL
// ==========================================

export const playBuckySound = (
  type: 'feed' | 'tickle' | 'pop' | 'celebrate' | 'wave' | 'yawn' | 'stretch' | 'exercise' | 'hydrate' | 'step' | 'alert' | 'jump' | 'rest' | 'focus' | 'stand' | 'happy' | 'clap' | 'sleep' | 'sad' | 'tired'
) => {
  try {
    const isMuted = localStorage.getItem('orbit_bucky_muted') === 'true';
    if (isMuted) return;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'feed' || type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'celebrate') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.08 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.3);
      });
    } else if (type === 'clap') {
      [0, 0.09, 0.18].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, ctx.currentTime + offset);
        osc.frequency.exponentialRampToValueAtTime(190, ctx.currentTime + offset + 0.07);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + offset + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.09);
      });
    } else if (type === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(260, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'focus') {
      [440, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.32);
      });
    } else if (type === 'wave' || type === 'happy') {
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.22);
      });
    } else if (type === 'rest' || type === 'tired') {
      [349.23, 261.63].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.15 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.38);
      });
    } else if (type === 'yawn' || type === 'stretch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.25);
      osc.frequency.exponentialRampToValueAtTime(290, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.58);
    }
  } catch {
    // Silent fail if AudioContext is blocked by browser policy
  }
};

// ==========================================
// 3. MOTOR CENTRAL DE RESOLUCIÓN EMOCIONAL
// ==========================================
// Jerarquía estricta:
// 1. CRITICAL_OVERTIME      -> alert
// 2. ACTIVE_TIMER           -> focus
// 3. DAY_CLOSED_SUCCESS     -> celebrate
// 4. RECENT_TASK_COMPLETED  -> clap (cooldown 3.5s)
// 5. BREAK_RECOMMENDED      -> tired / rest
// 6. FIRST_VISIT_TODAY      -> wave (max 1 vez por sesión)
// 7. INACTIVITY_IDLE        -> yawn / stretch
// 8. NORMAL_EQUILIBRIUM     -> idle / happy (buzo Uhura siempre por defecto)
// *sad existe en el sistema pero NO como castigo por productividad o errores*

export function resolveBuckyState(ctx: BuckyContext): BuckyResolvedState {
  const critical = ctx.criticalOvertimeTasks && ctx.criticalOvertimeTasks.length > 0
    ? ctx.criticalOvertimeTasks[0]
    : null;

  // 1. CRITICAL_OVERTIME (Máxima prioridad: riesgo de sobrecarga / desvío en horas)
  if (critical) {
    const consumedHrs = ((critical.consumedSeconds || 0) / 3600).toFixed(1);
    const budgetedHrs = (critical.budgetedHours || 1).toFixed(1);
    const diff = (parseFloat(consumedHrs) - parseFloat(budgetedHrs)).toFixed(1);

    return {
      internalKey: 'CRITICAL_OVERTIME',
      pose: 'alert',
      image: buckyAlertImg,
      humanBadge: 'Demasiado peso',
      badgeText: 'Demasiado peso',
      badgeColor: 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]',
      headline: 'Hoy está pesado 👀',
      speech: 'Hoy está pesado 👀 Cuidado con sobrecargarte; si una pieza requiere más recurso, avisa al equipo.',
      description: `En "${critical.title.slice(0, 30)}..." llevas ${consumedHrs}h de ${budgetedHrs}h (+${diff}h). Para proteger el equilibrio, avisa al líder comercial.`,
      isAlert: true,
      cta: {
        label: 'Avisar extensión al equipo',
        actionType: 'notify_overtime',
        task: critical
      },
      soundType: 'alert'
    };
  }

  // 2. ACTIVE_TIMER (Foco profundo: cronómetro activo corriendo en una tarea)
  if (ctx.activeTimer && !ctx.activeTimer.isPaused) {
    const taskName = ctx.activeTimer.taskTitle.slice(0, 28);
    return {
      internalKey: 'ACTIVE_TIMER',
      pose: 'focus',
      image: buckyFocusImg,
      humanBadge: 'En foco',
      badgeText: 'En foco',
      badgeColor: 'bg-[#f5f3ff] text-[#501f92] border-[#ddd6fe]',
      headline: 'En concentración total 🎧',
      speech: `Construyendo con ritmo constante en "${taskName}...". ¡Cada minuto suma a la colonia!`,
      description: 'Sesión activa de cronometraje para registrar con exactitud cada avance.',
      isAlert: false,
      soundType: 'focus'
    };
  }

  // 3. DAY_CLOSED_SUCCESS (Todas las tareas del día listas con éxito)
  if (ctx.allTasksCompleted && (ctx.hasTasks ?? true)) {
    return {
      internalKey: 'DAY_CLOSED_SUCCESS',
      pose: 'celebrate',
      image: buckyCelebratingImg,
      humanBadge: 'Día completo',
      badgeText: 'Día completo',
      badgeColor: 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]',
      headline: '¡Listo por hoy! 🎉',
      speech: '¡Todas las metas encajadas! Cierra Orbit con orgullo y ve a descansar 🛋️✨',
      description: 'Todas las piezas de hoy fueron encajadas a tiempo y con precisión.',
      isAlert: false,
      cta: {
        label: 'Revisar resumen del día',
        actionType: 'review_day'
      },
      soundType: 'celebrate'
    };
  }

  // 4. RECENT_TASK_COMPLETED (Micro-celebración transitoria tras completar una tarea)
  if (ctx.recentTaskCompleted) {
    return {
      internalKey: 'RECENT_TASK_COMPLETED',
      pose: 'clap',
      image: buckyCelebratingImg,
      humanBadge: '¡Buen avance!',
      badgeText: '¡Buen avance!',
      badgeColor: 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]',
      headline: '¡Pieza encajada! 👏',
      speech: '¡Excelente ritmo! Cada entrega acerca a la colonia a su meta 🪵💪',
      description: 'Acabas de completar una tarea clave de la jornada.',
      isAlert: false,
      soundType: 'clap'
    };
  }

  // 5. BREAK_RECOMMENDED (Sugerencia de bienestar, hidratación y ergonomía física, nunca evaluación de productividad)
  if (ctx.isBreakRecommended) {
    return {
      internalKey: 'BREAK_RECOMMENDED',
      pose: 'rest',
      image: buckyRestingImg,
      humanBadge: 'Pausa de bienestar',
      badgeText: 'Pausa de bienestar',
      badgeColor: 'bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]',
      headline: 'Cuidemos tu bienestar ☕',
      speech: 'Tu salud y energía son lo primero. Tómate 2 minutos para estirar el cuerpo, descansar la vista y tomar agua 🌿💧',
      description: 'Sugerencia de bienestar, ergonomía física y descanso saludable. En Orbit priorizamos tu salud antes que cualquier métrica.',
      isAlert: false,
      cta: {
        label: 'Iniciar pausa activa (2 min)',
        actionType: 'start_break'
      },
      soundType: 'rest'
    };
  }

  // 6. FIRST_VISIT_TODAY (Saludo cordial la primera vez que entra en la sesión)
  if (ctx.isFirstVisitToday) {
    return {
      internalKey: 'FIRST_VISIT_TODAY',
      pose: 'wave',
      image: buckyWavingImg,
      humanBadge: '¡Hola!',
      badgeText: '¡Hola!',
      badgeColor: 'bg-[#f5f3ff] text-[#501f92] border-[#ddd6fe]',
      headline: '¡Hola de nuevo! 👋',
      speech: '¡Hola! Aquí Bucky. Cuidando que construyamos con calma y sin sobrecarga 🚀🪵',
      description: 'Listo para coordinar y medir el avance de tus proyectos hoy.',
      isAlert: false,
      soundType: 'wave'
    };
  }

  // 7. INACTIVITY_IDLE (Orbit en reposo prolongado)
  if (ctx.isInactiveIdle) {
    return {
      internalKey: 'INACTIVITY_IDLE',
      pose: 'yawn',
      image: buckyHoodieHappyImg, // Buzo Uhura oficial
      humanBadge: 'Tomando aire',
      badgeText: 'Tomando aire',
      badgeColor: 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1]',
      headline: 'Tomando aire 🥱',
      speech: 'Un buen castor sabe cuándo bajar el ritmo para retomar con energía 🪵✨',
      description: 'En espera de la siguiente pieza a construir.',
      isAlert: false,
      soundType: 'yawn'
    };
  }

  // 8. NORMAL_EQUILIBRIUM (Estado base por defecto: buzo oficial morado Uhura, sereno y en guardia)
  const logged = ctx.loggedHoursToday.toFixed(1);
  const target = (ctx.targetDayHours || 8.0).toFixed(1);

  return {
    internalKey: 'NORMAL_EQUILIBRIUM',
    pose: 'happy',
    image: buckyHoodieHappyImg, // Buzo Uhura oficial como identidad visual permanente
    humanBadge: 'En equilibrio',
    badgeText: 'En equilibrio',
    badgeColor: 'bg-[#f5f3ff] text-[#501f92] border-[#ddd6fe]',
    headline: 'Tu día está sincronizado 💜',
    speech: ctx.hasNotifiedOvertime
      ? 'Avisaste a tiempo. Tómate un respiro, el proyecto está protegido y el equipo coordinado 🛡️☕'
      : '¡Hola! Tu día está sincronizado. Con el buzo morado Uhura construyendo la colonia en armonía 🚀🪵',
    description: `Llevas ${logged}h registradas de ${target}h planeadas. Los recursos se encuentran en equilibrio.`,
    isAlert: false,
    soundType: 'happy'
  };
}

// ==========================================
// 4. CONTROL DE ACCESO A BUCKY LAB (DEV/ADMIN)
// ==========================================
// Protegido detrás de devMode, rol admin, feature flag o atajo Shift+Alt+B.
// Nunca expuesto visiblemente al usuario final.

export const isBuckyLabAuthorized = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true' || urlParams.get('lab') === 'true') return true;
    if (localStorage.getItem('orbit_dev_mode') === 'true') return true;
    if ((window as unknown as { __ORBIT_DEV_MODE__?: boolean }).__ORBIT_DEV_MODE__ === true) return true;
    return false;
  } catch {
    return false;
  }
};
