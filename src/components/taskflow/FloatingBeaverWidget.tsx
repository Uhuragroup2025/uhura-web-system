import React, { useState, useEffect, useRef } from 'react';
import beaverMascotImg from '../../assets/images/orbit_mascot_cutout.png';
import buckyHoodieHappyImg from '../../assets/images/bucky_hip_uhura_v3.png';
import buckyWavingImg from '../../assets/images/bucky_waving_cutout.png';
import buckyCelebratingImg from '../../assets/images/bucky_celebrating_cutout.png';
import buckyAlertImg from '../../assets/images/bucky_alert_cutout.png';
import buckyRestingImg from '../../assets/images/bucky_resting_cutout.png';
import buckyFocusImg from '../../assets/images/bucky_focus_cutout.png';
import {
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Heart,
  Coffee,
  CheckCircle2,
  ArrowRight,
  X,
  Award,
  GripHorizontal,
  Sparkles,
  Activity,
  Droplets,
  Copy,
  Download,
  Check,
  Compass,
  Move,
  Footprints,
  Play,
  Pause,
  Smile,
  AlertTriangle,
  Home,
  Shirt,
  AlertOctagon
} from 'lucide-react';
import { OrbitView, TaskItem, ActiveTimerState } from './types';
import { resolveBuckyState } from './buckyEngine';
import { BuckyLabModal } from './BuckyLabModal';
import { UhuraLogo } from '../ui/UhuraLogo';

interface FloatingBeaverWidgetProps {
  loggedHoursToday: number;
  targetDayHours?: number;
  onQuickLogHours: (hours: number, label: string, category?: 'client' | 'internal', projectName?: string) => void;
  onNavigateToView: (view: OrbitView) => void;
  streakDays?: number;
  tasks?: TaskItem[];
  activeTimer?: ActiveTimerState | null;
}

export type BuckyAction =
  | 'idle'
  | 'stand'
  | 'happy'
  | 'wave'
  | 'celebrate'
  | 'motivate'
  | 'jump'
  | 'stretch'
  | 'yawn'
  | 'walk'
  | 'alert'
  | 'point'
  | 'exercise'
  | 'hydrate'
  | 'rest'
  | 'focus'
  | 'clap'
  | 'sleep'
  | 'sad'
  | 'tired';

// Sound synthesizer using Web Audio API (Zero dependencies, gentle ambient sounds)
const playChime = (type: 'feed' | 'tickle' | 'pop' | 'celebrate' | 'wave' | 'yawn' | 'stretch' | 'exercise' | 'hydrate' | 'step' | 'alert' | 'jump' | 'rest' | 'focus' | 'stand' | 'happy' | 'clap' | 'sleep' | 'sad' | 'tired') => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'feed') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'tickle') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(750, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } else if (type === 'wave') {
      // Ascending gentle 3-tone greeting
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    } else if (type === 'yawn') {
      // Soft descending yawn glissando
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.55);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } else if (type === 'stretch') {
      // Warm chord relaxing stretch
      [392.0, 493.88, 587.33].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.75);
      });
    } else if (type === 'exercise') {
      // Rhythmic double bounce
      [587.33, 739.99, 587.33, 739.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.11);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.11 + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.11);
        osc.stop(ctx.currentTime + i * 0.11 + 0.1);
      });
    } else if (type === 'hydrate') {
      // Water droplet pluck
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
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
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.22);
      });
    } else if (type === 'step') {
      // Gentle soft step/footprint chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'jump') {
      // Springy bouncy jump sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    } else if (type === 'alert') {
      // Subtle 2-tone curious alert sound
      [440, 554.37].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.1 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.16);
      });
    } else if (type === 'rest') {
      // Gentle warm coffee chord
      [392, 493.88, 587.33].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.32);
      });
    } else if (type === 'focus') {
      // Calming low synth hum for concentration
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } else if (type === 'clap') {
      // 3 rhythmic cheerful applause pops
      [0, 0.1, 0.2].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime + offset);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + offset + 0.08);
        gain.gain.setValueAtTime(0.09, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + offset + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.1);
      });
    } else if (type === 'sleep') {
      // Gentle lullaby chime
      [523.25, 659.25, 587.33, 440].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.38);
      });
    } else if (type === 'sad') {
      // Empathetic descending sigh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.45);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.52);
    } else if (type === 'tired') {
      // Relaxed resting tone
      [330, 261.63].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.42);
      });
    }
  } catch {
    // AudioContext blocked or silent environment
  }
};

export const FloatingBeaverWidget: React.FC<FloatingBeaverWidgetProps> = ({
  loggedHoursToday,
  targetDayHours = 8.0,
  onQuickLogHours,
  onNavigateToView,
  streakDays = 6,
  tasks = [],
  activeTimer = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(null);
  const [isBuckyLabOpen, setIsBuckyLabOpen] = useState(false);

  // Position state (Draggable coordinates)
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; origX: number; origY: number; moved: boolean } | null>(null);

  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [orbsEarned, setOrbsEarned] = useState(420);
  const [isWiggling, setIsWiggling] = useState(false);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lifelike Living Actions (Vida Propia) & Locomotion
  const [currentAction, setCurrentAction] = useState<BuckyAction>('idle');
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Locomotion & Free Movement states (preserved intact)
  const [isWalking, setIsWalking] = useState(false);
  const [walkDuration, setWalkDuration] = useState(2.0);
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
  const [isFreeRoamActive, setIsFreeRoamActive] = useState(false);
  const walkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Guided Active Break (Pausa Activa)
  const [activeBreakActive, setActiveBreakActive] = useState(false);
  const [breakStep, setBreakStep] = useState<number>(1);
  const [breakTimer, setBreakTimer] = useState<number>(30);

  // Cooldown and sound deduplication
  const hasAlertedOvertimeRef = useRef(false);

  // Resolved central Bucky state
  const criticalOvertimeTasks = tasks.filter(
    (t) => (t.consumedSeconds || 0) > (t.budgetedHours || 0) * 3600
  );
  const allTasksDone = tasks.length > 0 && tasks.every((t) => t.status === 'Done' || t.completed);

  const buckyState = resolveBuckyState({
    loggedHoursToday,
    targetDayHours,
    criticalOvertimeTasks,
    activeTimer,
    allTasksCompleted: allTasksDone,
    hasTasks: tasks.length > 0,
    recentTaskCompleted: currentAction === 'clap',
    isBreakRecommended: activeBreakActive ? false : undefined
  });

  /**
   * ⚠️ MECANISMOS TEMPORALES DE DESARROLLO / PROTOTIPADO:
   * Los atajos 'Shift + Alt + B' y '?buckyLab=true' son exclusivamente provisionales.
   * En producción, BuckyLabModal DEBE protegerse con autenticación y permisos reales
   * de usuario/administrador (RBAC: e.g. user.role === 'admin' o permiso 'taskflow:bucky_lab').
   * En el build final de producción, estos listeners públicos deben quedar desactivados.
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.altKey && (e.key === 'B' || e.key === 'b')) {
        setIsBuckyLabOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('buckyLab') === 'true' || urlParams.get('dev') === 'true') {
        setIsBuckyLabOpen(true);
      }
    } catch {}

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const percent = Math.min(100, Math.round((loggedHoursToday / targetDayHours) * 100));

  // Initialize and load saved position
  useEffect(() => {
    try {
      const saved = localStorage.getItem('orbit_bucky_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const clampedX = Math.max(12, Math.min(window.innerWidth - 160, parsed.x));
          const clampedY = Math.max(12, Math.min(window.innerHeight - 220, parsed.y));
          setCoords({ x: clampedX, y: clampedY });
          return;
        }
      }
    } catch {
      // Ignore
    }

    // Default: Bottom Right
    const defaultX = Math.max(12, window.innerWidth - 175);
    const defaultY = Math.max(12, window.innerHeight - 240);
    setCoords({ x: defaultX, y: defaultY });
  }, []);

  // Window resize handler to keep within bounds
  useEffect(() => {
    const handleResize = () => {
      setCoords((prev) => {
        if (!prev) return null;
        return {
          x: Math.max(12, Math.min(window.innerWidth - 160, prev.x)),
          y: Math.max(12, Math.min(window.innerHeight - 220, prev.y))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger specific living action (Vida Propia & 10 Poses)
  const triggerLivingAction = (action: BuckyAction, customText?: string) => {
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);

    setCurrentAction(action);
    if (soundEnabled && action !== 'idle') {
      if (action === 'jump') playChime('jump');
      else if (action === 'alert') playChime('alert');
      else if (action === 'walk') playChime('step');
      else playChime(action as any);
    }

    let phrase = customText;
    let duration = 3000;

    switch (action) {
      case 'wave':
        phrase = phrase || '¡Hola Pao! 👋 ¡Qué gusto verte! ¿En qué construimos hoy?';
        duration = 2600;
        break;
      case 'celebrate':
        phrase = phrase || '¡Bravo! 👏 ¡Gran avance en el sprint! ¡La colonia Uhura celebra!';
        duration = 3000;
        break;
      case 'motivate':
        phrase = phrase || '¡Vamos con todo! 💪 ¡Un último esfuerzo y dejamos la represa sólida!';
        duration = 2800;
        break;
      case 'jump':
        phrase = phrase || '¡Yuuuupi! 🦫✨ ¡Salto de alegría por el buen ritmo de trabajo!';
        duration = 2400;
        break;
      case 'yawn':
        phrase = phrase || '*Uaaaah*... ¡Qué rico bostezo! 🥱 Un sorbito de café y listos ☕';
        duration = 2600;
        break;
      case 'stretch':
        phrase = phrase || '¡Uff, qué delicia de estirón! 🧘‍♀️ Estira los brazos hacia el cielo tú también.';
        duration = 2400;
        break;
      case 'exercise':
        phrase = phrase || '¡Pausa activa relámpago! 🏃‍♂️ Mueve los hombros en círculos 3 veces hacia atrás.';
        duration = 3200;
        break;
      case 'hydrate':
        phrase = phrase || '¡Hora de un trago de agua fresca! 💧 La mente hidratada rinde un 30% más.';
        duration = 3000;
        break;
      case 'walk':
        phrase = phrase || '¡De paseo por el sistema Orbit! 🚶‍♂️ Caminando con energía.';
        duration = 2600;
        break;
      case 'alert':
        phrase = phrase || '¡Atención Pao! ⚠️ Revisemos que todas las horas queden bien registradas.';
        duration = 3200;
        break;
      case 'point':
        phrase = phrase || '¡Mira esa tarea importante! 👉 ¡Completémosla juntos!';
        duration = 2800;
        break;
      default:
        phrase = phrase || '¡Todo listo en la nave Orbit!';
        duration = 2000;
    }

    setSpeechBubbleText(phrase);

    actionTimeoutRef.current = setTimeout(() => {
      setCurrentAction('idle');
    }, duration);

    speechTimeoutRef.current = setTimeout(() => {
      setSpeechBubbleText(null);
    }, 7000);
  };

  // Autonomous / Free Locomotion walking function
  const walkTo = (targetX: number, targetY: number, customText?: string, nextAction?: BuckyAction) => {
    if (!coords) return;
    if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);

    const clampedX = Math.max(16, Math.min(window.innerWidth - 150, targetX));
    const clampedY = Math.max(16, Math.min(window.innerHeight - 210, targetY));

    const dx = clampedX - coords.x;
    const dy = clampedY - coords.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 15) {
      if (customText) setSpeechBubbleText(customText);
      return;
    }

    // Orient facing direction
    if (dx < -8) {
      setFacingDirection('left');
    } else if (dx > 8) {
      setFacingDirection('right');
    }

    // Dynamic duration based on distance
    const durationSec = Math.max(1.3, Math.min(3.2, distance / 220));
    setWalkDuration(durationSec);
    setIsWalking(true);
    setCurrentAction('walk');
    if (soundEnabled) playChime('step');

    setSpeechBubbleText(customText || '¡En marcha! Explorando libremente la pantalla... 🐾');

    // Initiate CSS transition movement
    setCoords({ x: clampedX, y: clampedY });

    walkTimeoutRef.current = setTimeout(() => {
      setIsWalking(false);
      const arrivalAction = nextAction || 'wave';
      setCurrentAction(arrivalAction);
      if (soundEnabled) playChime(arrivalAction === 'wave' ? 'wave' : 'celebrate');
      setSpeechBubbleText(customText || '¡Llegué a explorar este rincón! 🗺️✨');

      localStorage.setItem('orbit_bucky_position', JSON.stringify({ x: clampedX, y: clampedY }));

      actionTimeoutRef.current = setTimeout(() => {
        setCurrentAction('idle');
      }, 2600);
    }, durationSec * 1000);
  };

  // Fast locomotion triggers
  const handleRandomRoam = () => {
    const marginX = 50;
    const maxX = window.innerWidth - 180;
    const minY = Math.max(70, window.innerHeight - 340);
    const maxY = Math.max(90, window.innerHeight - 210);

    const randomX = Math.floor(Math.random() * (maxX - marginX)) + marginX;
    const randomY = Math.floor(Math.random() * (maxY - minY)) + minY;
    walkTo(randomX, randomY, '¡Saliendo a explorar la pantalla! 🦫🐾', 'celebrate');
  };

  const handleWalkToCenter = () => {
    const centerX = Math.max(20, Math.floor(window.innerWidth / 2 - 65));
    const centerY = Math.max(50, Math.floor(window.innerHeight - 240));
    walkTo(centerX, centerY, '¡Aquí en el centro listo para construir contigo! 🚀', 'motivate');
  };

  const handleReturnHome = () => {
    const defaultX = Math.max(12, window.innerWidth - 175);
    const defaultY = Math.max(12, window.innerHeight - 240);
    walkTo(defaultX, defaultY, '¡De vuelta a mi estación base! 🏠', 'wave');
  };

  // Autonomous Free Roam Loop (Paseo libre periódico si el usuario lo activa)
  useEffect(() => {
    if (!isFreeRoamActive) return;

    const roamInterval = setInterval(() => {
      if (isDragging || isWalking || isOpen || activeBreakActive) return;

      const marginX = 50;
      const maxX = window.innerWidth - 180;
      const minY = Math.max(70, window.innerHeight - 340);
      const maxY = Math.max(90, window.innerHeight - 210);

      const randomX = Math.floor(Math.random() * (maxX - marginX)) + marginX;
      const randomY = Math.floor(Math.random() * (maxY - minY)) + minY;

      const roamPhrases = [
        '¡Explorando la nave Orbit! 🚀',
        '¡Paseo libre para estirar las patitas! 🐾',
        '¡Supervisando el flujo de trabajo en Uhura! 🦫',
        '¡Qué buen ritmo llevamos hoy! 🌟',
        '¡Caminando con energía por el sistema! 🚶‍♂️'
      ];
      const phrase = roamPhrases[Math.floor(Math.random() * roamPhrases.length)];

      walkTo(randomX, randomY, phrase, 'wave');
    }, 19000);

    return () => clearInterval(roamInterval);
  }, [isFreeRoamActive, isDragging, isWalking, isOpen, activeBreakActive, coords]);

  // Event listener for global Orbit Habitat reactions
  useEffect(() => {
    const handleMascotReaction = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: BuckyAction; phrase: string }>;
      if (customEvent.detail?.action) {
        triggerLivingAction(customEvent.detail.action, customEvent.detail.phrase);
      }
    };
    window.addEventListener('orbit-mascot-reaction', handleMascotReaction);
    return () => window.removeEventListener('orbit-mascot-reaction', handleMascotReaction);
  }, []);

  // Initial cheerful greeting when component mounts (with once-per-session cooldown)
  useEffect(() => {
    const hasGreeted = sessionStorage.getItem('orbit_bucky_greeted');
    if (!hasGreeted) {
      sessionStorage.setItem('orbit_bucky_greeted', 'true');
      const timer = setTimeout(() => {
        triggerLivingAction('wave', '¡Hola Pao! 👋 Aquí Bucky. Cuidando que construyamos con calma y sin sobrecarga.');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Autonomous Living Cycle (Spaced out, no spammy actions)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen && !isMinimized && !isDragging && !activeBreakActive && currentAction === 'idle') {
        const livingBehaviors: BuckyAction[] = ['wave', 'yawn', 'stretch', 'exercise', 'hydrate'];
        const randomAction = livingBehaviors[Math.floor(Math.random() * livingBehaviors.length)];
        triggerLivingAction(randomAction);
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [isOpen, isMinimized, isDragging, activeBreakActive, currentAction]);

  // Guided Active Break (Pausa Activa) countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeBreakActive && breakTimer > 0) {
      timer = setTimeout(() => {
        setBreakTimer((prev) => prev - 1);

        if (breakTimer === 21) {
          setBreakStep(2);
          triggerLivingAction('stretch', 'Paso 2: Gira el cuello suavemente de lado a lado 🧘');
        } else if (breakTimer === 11) {
          setBreakStep(3);
          triggerLivingAction('wave', 'Paso 3: Parpadea y mira un punto lejano 20 seg para descansar la vista 👀');
        }
      }, 1000);
    } else if (activeBreakActive && breakTimer === 0) {
      setActiveBreakActive(false);
      setOrbsEarned((prev) => prev + 25);
      if (soundEnabled) playChime('celebrate');
      setSpeechBubbleText('🎉 ¡Pausa activa completada! Regresamos con la mente al 100% (+25 Orbs ✨)');
    }
    return () => clearTimeout(timer);
  }, [activeBreakActive, breakTimer]);

  const startActiveBreak = () => {
    setActiveBreakActive(true);
    setBreakTimer(30);
    setBreakStep(1);
    triggerLivingAction('exercise', 'Paso 1: Mueve los hombros en círculos hacia atrás 3 veces 🙆‍♀️');
  };

  // Check balance and state: deduplicated alert and celebrate
  useEffect(() => {
    if (criticalOvertimeTasks.length > 0 || loggedHoursToday > 8.5) {
      if (!hasAlertedOvertimeRef.current) {
        hasAlertedOvertimeRef.current = true;
        triggerLivingAction('alert', buckyState.speech);
      }
    } else {
      hasAlertedOvertimeRef.current = false;
    }
  }, [criticalOvertimeTasks.length, loggedHoursToday, buckyState.speech]);

  const handleTickle = () => {
    if (soundEnabled) playChime('tickle');
    setIsWiggling(true);
    setOrbsEarned((prev) => prev + 1);
    const newHeart = { id: Date.now(), x: Math.random() * 40 - 20, y: -20 };
    setHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
    setTimeout(() => setIsWiggling(false), 600);
    setSpeechBubbleText('¡Gracias Pao! Me da ánimo para seguir acompañándote en la colonia.');
  };

  const handleFeedHours = (hours: number, label: string) => {
    if (soundEnabled) playChime('feed');
    onQuickLogHours(hours, label, 'internal', 'Uhura Group');
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);
    triggerLivingAction('stretch', `Acomodando pieza en el hábitat... +${hours}h de recurso registrado 🪵`);
  };

  // Drag handlers (Pointer events)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!coords) return;
    if (isWalking) {
      if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
      setIsWalking(false);
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      origX: coords.x,
      origY: coords.y,
      moved: false
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStartRef.current.moved = true;
      setIsDragging(true);
      setCurrentAction('jump');

      if (dx < -4) setFacingDirection('left');
      else if (dx > 4) setFacingDirection('right');

      const nextX = Math.max(10, Math.min(window.innerWidth - 145, dragStartRef.current.origX + dx));
      const nextY = Math.max(10, Math.min(window.innerHeight - 200, dragStartRef.current.origY + dy));
      setCoords({ x: nextX, y: nextY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const wasMoved = dragStartRef.current.moved;
    dragStartRef.current = null;
    setIsDragging(false);

    if (wasMoved && coords) {
      triggerLivingAction('jump', '¡Aterrizaje en nueva coordenada! 🐾✨');
      localStorage.setItem('orbit_bucky_position', JSON.stringify(coords));
    } else {
      // Normal click -> toggle HUD
      setIsOpen((prev) => !prev);
      if (speechBubbleText && !activeBreakActive) setSpeechBubbleText(null);
    }
  };

  const handleResetPosition = () => {
    const defaultX = Math.max(12, window.innerWidth - 175);
    const defaultY = Math.max(12, window.innerHeight - 240);
    const newPos = { x: defaultX, y: defaultY };
    setCoords(newPos);
    localStorage.setItem('orbit_bucky_position', JSON.stringify(newPos));
  };

  // SMART NON-OVERLAPPING PLACEMENT FOR THE HUD:
  // Ensures Bucky is NEVER covered by the HUD window!
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const isNearRight = coords ? coords.x > window.innerWidth / 2 : true;
  const isNearBottom = coords ? coords.y > window.innerHeight - 380 : true;

  let hudContainerStyle: React.CSSProperties = {};
  if (isMobile) {
    if (coords && coords.y > 380) {
      hudContainerStyle = { bottom: 'calc(100% + 16px)', left: '50%', transform: 'translateX(-50%)' };
    } else {
      hudContainerStyle = { top: 'calc(100% + 16px)', left: '50%', transform: 'translateX(-50%)' };
    }
  } else {
    // Desktop / Tablet: Placed side-by-side with Bucky (never overlapping him)
    if (isNearRight) {
      // Bucky is to the right -> place HUD to Bucky's LEFT
      hudContainerStyle = {
        right: 'calc(100% + 16px)',
        bottom: isNearBottom ? '0px' : undefined,
        top: !isNearBottom ? '0px' : undefined,
      };
    } else {
      // Bucky is to the left -> place HUD to Bucky's RIGHT
      hudContainerStyle = {
        left: 'calc(100% + 16px)',
        bottom: isNearBottom ? '0px' : undefined,
        top: !isNearBottom ? '0px' : undefined,
      };
    }
  }

  // Active cutout image based on state and poses
  const getCurrentBeaverImage = () => {
    if (isDragging) return buckyCelebratingImg;
    if (isWalking || currentAction === 'walk') return buckyHoodieHappyImg;

    // Transient lifelike reaction (active for the duration of the reaction)
    if (currentAction !== 'idle') {
      switch (currentAction) {
        case 'stand':
        case 'happy':
          return buckyHoodieHappyImg;
        case 'wave':
          return buckyWavingImg;
        case 'celebrate':
        case 'jump':
        case 'motivate':
        case 'clap':
          return buckyCelebratingImg;
        case 'alert':
        case 'sad':
          return buckyAlertImg;
        case 'rest':
        case 'sleep':
        case 'tired':
          return buckyRestingImg;
        case 'point':
        case 'focus':
          return buckyFocusImg;
        default:
          break;
      }
    }

    // After transient reaction (clap, celebrate, etc.), return strictly to the
    // contextual state resolved by resolveBuckyState(context)
    return buckyState.image;
  };

  // Animation class based on current lifelike action
  const getActionAnimationClass = () => {
    if (isDragging) return 'scale-110';
    if (isWalking) return 'animate-beaver-walk';
    if (isWiggling) return 'animate-bounce';

    if (currentAction !== 'idle') {
      switch (currentAction) {
        case 'walk':
          return 'animate-beaver-walk';
        case 'wave':
          return 'animate-beaver-wave';
        case 'jump':
        case 'celebrate':
        case 'clap':
          return 'animate-beaver-jump';
        case 'alert':
        case 'sad':
          return 'animate-beaver-alert';
        case 'point':
          return 'animate-beaver-point';
        case 'yawn':
        case 'tired':
        case 'sleep':
          return 'animate-beaver-yawn';
        case 'stretch':
          return 'animate-beaver-stretch';
        case 'exercise':
          return 'animate-beaver-exercise';
        default:
          return 'animate-float';
      }
    }

    // Contextual animation when returning to idle
    if (buckyState.pose === 'alert') return 'animate-beaver-alert';
    return 'animate-float';
  };

  // Status emoji badge floating beside his ear during actions
  const getActionEmojiBadge = () => {
    if (isWalking) return '🐾';
    if (isDragging) return '🪂';
    switch (currentAction) {
      case 'walk':
        return '🚶‍♂️';
      case 'jump':
        return '✨';
      case 'celebrate':
        return '🎉';
      case 'clap':
        return '👏';
      case 'motivate':
        return '💪';
      case 'wave':
        return '👋';
      case 'alert':
        return '⚠️';
      case 'sad':
        return '🥺';
      case 'point':
        return '👉';
      case 'yawn':
        return '🥱';
      case 'tired':
        return '😮‍💨';
      case 'sleep':
        return '💤';
      case 'stretch':
        return '🧘';
      case 'exercise':
        return '🏃';
      case 'hydrate':
        return '💧';
      default:
        return null;
    }
  };

  if (!coords) return null;

  return (
    <div
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        touchAction: 'none',
        transition: isWalking
          ? `left ${walkDuration}s cubic-bezier(0.25, 1, 0.5, 1), top ${walkDuration}s cubic-bezier(0.25, 1, 0.5, 1)`
          : isDragging
          ? 'none'
          : 'transform 0.1s ease'
      }}
      className="fixed z-50 font-sans pointer-events-none select-none"
    >
      {/* Container: Re-enable pointer events inside */}
      <div className="relative pointer-events-auto flex flex-col items-center">
        {/* HEARTS PARTICLES ON TICKLE */}
        {hearts.map((h) => (
          <div
            key={h.id}
            style={{ transform: `translate(${h.x}px, ${h.y}px)` }}
            className="absolute -top-6 right-8 text-[#ec4899] animate-out fade-out slide-out-to-top-8 duration-1000 z-50 flex items-center gap-1 font-bold text-xs pointer-events-none"
          >
            <Heart className="w-4 h-4 fill-[#ec4899]" />
            <span>+5</span>
          </div>
        ))}

        {/* 1. FLOATING SPEECH BUBBLE (VIDA PROPIA) */}
        {speechBubbleText && !isDragging && (
          <div className="mb-2 max-w-[250px] bg-[#140b24] text-white p-3 rounded-2xl shadow-2xl border border-[#8a4dff]/50 text-xs animate-in zoom-in-95 duration-200 relative">
            <div className="flex items-start justify-between gap-2">
              <span className="leading-snug font-medium text-[#f1f5f9]">
                {speechBubbleText}
              </span>
              <button
                onClick={() => setSpeechBubbleText(null)}
                className="text-white/40 hover:text-white cursor-pointer -mt-1 -mr-1 p-0.5"
                title="Cerrar mensaje"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Speech bubble tail pointer pointing down to Bucky */}
            <div className="absolute -bottom-1.5 left-10 w-3 h-3 bg-[#140b24] border-r border-b border-[#8a4dff]/50 transform rotate-45" />
          </div>
        )}

        {/* 2. THE DRAGGABLE & FREELY MOVING COMPANION (SOLITO Y CON VIDA PROPIA) */}
        {!isMinimized && (
          <div className="relative group flex flex-col items-center">
            {/* Draggable Bucky Character */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={handleTickle}
              title="Arrastra libremente · Clic para abrir panel de control · Doble clic para cosquillas"
              className={`relative select-none flex flex-col items-center transition-transform duration-200 ${
                isDragging
                  ? 'cursor-grabbing scale-110'
                  : 'cursor-grab hover:scale-105 active:scale-95'
              } ${getActionAnimationClass()}`}
            >
              {/* Flame Badge / Streak Indicator - Stays non-flipped beside shoulder */}
              <div className="absolute top-2 -right-1 z-20 bg-[#140b24]/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-[#8a4dff]/60 shadow-lg flex items-center gap-1 backdrop-blur-xs">
                <Flame className="w-3 h-3 text-[#f97316] fill-[#f97316]" />
                <span>{streakDays}d</span>
              </div>

              {/* Real-Time Action Mood Badge */}
              {getActionEmojiBadge() && (
                <div className="absolute top-1 -left-2 z-20 bg-[#501f92] text-white text-xs px-2 py-0.5 rounded-full border border-[#d4ff4a] shadow-xl animate-bounce">
                  {getActionEmojiBadge()}
                </div>
              )}

              {/* Solito suelto: Clean Cutout with Orientation Mirroring on Walk/Direction */}
              <div
                style={{
                  transform: facingDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
                  transition: 'transform 0.22s ease-out'
                }}
                className="flex flex-col items-center"
              >
                <img
                  src={getCurrentBeaverImage()}
                  alt="Bucky el Castor de Orbit"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="w-36 sm:w-42 h-48 sm:h-56 object-contain select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Micro Fuel Indicator Pill under Bucky */}
            <div className="mt-1 flex items-center gap-1.5 bg-[#140b24]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#8a4dff]/40 text-[10px] font-bold text-white shadow-md">
              <span
                className={`w-2 h-2 rounded-full ${
                  percent >= 100
                    ? 'bg-[#10b981]'
                    : percent >= 50
                    ? 'bg-[#d4ff4a]'
                    : 'bg-[#f59e0b]'
                } animate-pulse`}
              />
              <span>{loggedHoursToday.toFixed(1)} / {targetDayHours}h</span>
            </div>

            {/* Quick Free Roam / Walk Buttons floating directly under Bucky */}
            <div className="mt-1.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRandomRoam();
                }}
                disabled={isWalking}
                className="flex items-center gap-1 bg-[#140b24]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[#d4ff4a]/70 text-[10px] font-black text-[#d4ff4a] shadow-md hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 transition-transform"
                title="Hacer que Bucky camine libremente hacia otro rincón de la pantalla"
              >
                <span className="text-xs">🚶‍♂️</span>
                <span>{isWalking ? 'Paseando...' : 'Pasear libre'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReturnHome();
                }}
                disabled={isWalking}
                className="flex items-center gap-0.5 bg-[#140b24]/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-[10px] font-medium text-white/80 hover:text-white shadow-xs hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 transition-transform"
                title="Regresar a la esquina base"
              >
                <Home className="w-3 h-3 text-[#c9b7ff]" />
                <span>Base</span>
              </button>
            </div>
          </div>
        )}

        {/* Minimized Pill state (if user collapsed it) */}
        {isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#140b24] text-white border border-[#8a4dff] shadow-xl hover:scale-105 transition-transform cursor-pointer"
          >
            <span className="text-base">🦫</span>
            <span className="text-xs font-bold text-[#c9b7ff]">Bucky {loggedHoursToday.toFixed(1)}h</span>
            <Maximize2 className="w-3.5 h-3.5 text-[#d4ff4a]" />
          </button>
        )}

        {/* 3. MINIMALIST BUCKY POPOVER (USER RUNTIME) */}
        {isOpen && (
          <div
            style={hudContainerStyle}
            className="absolute w-[290px] sm:w-[320px] bg-[#140b24] text-white rounded-3xl p-4 sm:p-5 border border-[#8a4dff]/50 shadow-2xl animate-in zoom-in-95 duration-150 backdrop-blur-xl z-50 space-y-3"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🦫</span>
                <div>
                  <h4 className="text-xs font-black text-white tracking-wide uppercase">
                    Bucky
                  </h4>
                  <p className="text-[10px] text-[#c9b7ff]">Orbit Companion</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                  title={soundEnabled ? 'Silenciar efectos' : 'Activar efectos'}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#d4ff4a]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-white/40" />
                  )}
                </button>

                {/* Reset position */}
                <button
                  onClick={handleResetPosition}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                  title="Restablecer a la esquina base"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Human status badge + Headline */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                  Estado actual
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#501f92] text-[#d4ff4a] border border-[#8a4dff]/50">
                  {buckyState.humanBadge}
                </span>
              </div>
              <h5 className="text-xs font-bold text-white leading-tight">
                {buckyState.headline}
              </h5>
            </div>

            {/* Contextual speech */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-xs text-white/90 leading-relaxed font-medium">
              "{buckyState.speech}"
            </div>

            {/* Active Break section (when in progress or starting) */}
            {activeBreakActive ? (
              <div className="p-3 bg-[#501f92]/40 rounded-2xl border border-[#d4ff4a]/50 text-center space-y-1">
                <div className="text-xs font-bold text-[#d4ff4a] flex items-center justify-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Pausa Activa en curso ({breakTimer}s)</span>
                </div>
                <p className="text-[11px] text-white/80 leading-tight">
                  Paso {breakStep}:{' '}
                  {breakStep === 1
                    ? 'Mueve los hombros en círculos 🙆‍♀️'
                    : breakStep === 2
                    ? 'Gira el cuello suavemente 🧘'
                    : 'Descansa la vista 20s en un punto lejano 👀'}
                </p>
              </div>
            ) : (
              <button
                onClick={startActiveBreak}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-[#8a4dff]/30 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10 hover:border-[#8a4dff]/50"
              >
                <Coffee className="w-3.5 h-3.5 text-[#d4ff4a]" />
                <span>Pausa activa (30s)</span>
              </button>
            )}

            {/* Contextual action CTA if applicable */}
            {buckyState.cta && (
              <button
                onClick={() => {
                  onNavigateToView('mi-dia');
                  setIsOpen(false);
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                  buckyState.cta.actionType === 'notify_overtime'
                    ? 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
                    : 'bg-[#d4ff4a] hover:bg-[#b5e035] text-[#140b24]'
                }`}
              >
                {buckyState.cta.actionType === 'notify_overtime' ? (
                  <AlertOctagon className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{buckyState.cta.label}</span>
              </button>
            )}

            {/* Navigation link to Mi Día */}
            <button
              onClick={() => {
                onNavigateToView('mi-dia');
                setIsOpen(false);
              }}
              className="w-full py-1.5 px-3 rounded-xl text-white/60 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer hover:bg-white/5"
            >
              <span>Ver Hábitat en Mi Día</span>
              <ArrowRight className="w-3 h-3 text-[#d4ff4a]" />
            </button>
          </div>
        )}

        {/* PROTECTED BUCKY LAB MODAL (Accessible via Shift+Alt+B or ?buckyLab=true) */}
        <BuckyLabModal
          isOpen={isBuckyLabOpen}
          onClose={() => setIsBuckyLabOpen(false)}
        />

      </div>
    </div>
  );
};


