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
  Shirt
} from 'lucide-react';
import { OrbitView } from './types';
import { UhuraLogo } from '../ui/UhuraLogo';

interface FloatingBeaverWidgetProps {
  loggedHoursToday: number;
  targetDayHours?: number;
  onQuickLogHours: (hours: number, label: string, category?: 'client' | 'internal', projectName?: string) => void;
  onNavigateToView: (view: OrbitView) => void;
  streakDays?: number;
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
  | 'focus';

// Sound synthesizer using Web Audio API (Zero dependencies, gentle ambient sounds)
const playChime = (type: 'feed' | 'tickle' | 'pop' | 'celebrate' | 'wave' | 'yawn' | 'stretch' | 'exercise' | 'hydrate' | 'step' | 'alert' | 'jump' | 'rest' | 'focus' | 'stand' | 'happy') => {
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
  streakDays = 6
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(
    '¡Hola Pao! Soy Bucky. ¿Cómo va esa represa hoy?'
  );

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

  // Locomotion & Free Movement states
  const [isWalking, setIsWalking] = useState(false);
  const [walkDuration, setWalkDuration] = useState(2.0);
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
  const [isFreeRoamActive, setIsFreeRoamActive] = useState(false);
  const walkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Guided Active Break (Pausa Activa)
  const [activeBreakActive, setActiveBreakActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePoseTab, setActivePoseTab] = useState<'movement' | 'moods' | 'poses' | 'actions'>('moods');
  const [useUhuraHoodie, setUseUhuraHoodie] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('orbit_bucky_hoodie');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleUhuraHoodie = () => {
    setUseUhuraHoodie((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('orbit_bucky_hoodie', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const [selectedRenderPose, setSelectedRenderPose] = useState<'stand' | 'wave' | 'alert' | 'celebrate' | 'rest' | 'focus' | 'master'>('stand');

  const getRenderPath = (pose: string) => {
    switch (pose) {
      case 'stand':
      case 'happy': return '/bucky_hip_uhura_v3.png';
      case 'wave': return '/bucky_waving_cutout.png';
      case 'alert': return '/bucky_alert_cutout.png';
      case 'celebrate': return '/bucky_celebrating_cutout.png';
      case 'rest': return '/bucky_resting_cutout.png';
      case 'focus': return '/bucky_focus_cutout.png';
      case 'master': return '/orbit_mascot_cutout.png';
      default: return '/bucky_hip_uhura_v3.png';
    }
  };

  const handleCopyRender = async (poseOverride?: typeof selectedRenderPose) => {
    try {
      const path = getRenderPath(poseOverride || selectedRenderPose);
      const response = await fetch(path);
      const blob = await response.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        handleDownloadRender(poseOverride);
      }
    } catch {
      handleDownloadRender(poseOverride);
    }
  };

  const handleDownloadRender = (poseOverride?: typeof selectedRenderPose) => {
    const chosenPose = poseOverride || selectedRenderPose;
    const link = document.createElement('a');
    link.href = getRenderPath(chosenPose);
    link.download = `bucky_${chosenPose}_cutout.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  const [breakStep, setBreakStep] = useState<number>(1);
  const [breakTimer, setBreakTimer] = useState<number>(30);

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

  // Initial cheerful greeting when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerLivingAction('wave', '¡Hola Pao! 👋 Aquí Bucky. Cuidando que construyamos con calma y sin sobrecarga.');
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Autonomous Living Cycle (Cada 35s realiza una acción de vida si no está ocupado)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen && !isMinimized && !isDragging && !activeBreakActive && currentAction === 'idle') {
        const livingBehaviors: BuckyAction[] = ['wave', 'yawn', 'stretch', 'exercise', 'hydrate'];
        const randomAction = livingBehaviors[Math.floor(Math.random() * livingBehaviors.length)];
        triggerLivingAction(randomAction);
      }
    }, 38000);

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

  // Check balance and state: not gamifying 8h, but healthy system
  useEffect(() => {
    if (loggedHoursToday > 8.5) {
      triggerLivingAction('alert', 'Hoy está pesado 👀 Cuidado con sobrecargarte; si una pieza requiere más recurso, avisa al equipo.');
    } else if (loggedHoursToday >= targetDayHours && soundEnabled) {
      playChime('celebrate');
      triggerLivingAction('celebrate', 'Tu día está sincronizado. Estructura estable en la colonia ✨ Listo por hoy, cierra Orbit y ve a descansar.');
    }
  }, [loggedHoursToday, targetDayHours, soundEnabled]);

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
    switch (currentAction) {
      case 'stand':
      case 'happy':
        return buckyHoodieHappyImg;
      case 'wave':
        return buckyWavingImg;
      case 'celebrate':
      case 'jump':
      case 'motivate':
        return buckyCelebratingImg;
      case 'alert':
        return buckyAlertImg;
      case 'rest':
        return buckyRestingImg;
      case 'point':
      case 'focus':
        return buckyFocusImg;
      default:
        return useUhuraHoodie ? buckyHoodieHappyImg : beaverMascotImg;
    }
  };

  // Animation class based on current lifelike action
  const getActionAnimationClass = () => {
    if (isDragging) return 'scale-110';
    if (isWalking) return 'animate-beaver-walk';
    if (isWiggling) return 'animate-bounce';
    switch (currentAction) {
      case 'walk':
        return 'animate-beaver-walk';
      case 'wave':
        return 'animate-beaver-wave';
      case 'jump':
      case 'celebrate':
        return 'animate-beaver-jump';
      case 'alert':
        return 'animate-beaver-alert';
      case 'point':
        return 'animate-beaver-point';
      case 'yawn':
        return 'animate-beaver-yawn';
      case 'stretch':
        return 'animate-beaver-stretch';
      case 'exercise':
        return 'animate-beaver-exercise';
      default:
        return 'animate-float';
    }
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
      case 'motivate':
        return '💪';
      case 'wave':
        return '👋';
      case 'alert':
        return '⚠️';
      case 'point':
        return '👉';
      case 'yawn':
        return '🥱';
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

        {/* 3. ADJACENT INTERACTIVE HUD MODAL (NEVER COVERS BUCKY!) */}
        {isOpen && (
          <div
            style={hudContainerStyle}
            className="absolute w-[315px] sm:w-[345px] bg-[#140b24] text-white rounded-3xl p-4 sm:p-5 border border-[#8a4dff]/60 shadow-2xl animate-in zoom-in-95 duration-200 backdrop-blur-xl z-50 max-h-[85vh] overflow-y-auto"
          >
            {/* Header controls */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🦫</span>
                <div>
                  <h4 className="text-xs font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                    <span>Bucky · Orbit Companion</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#d4ff4a]/20 text-[#d4ff4a] font-mono font-bold">
                      Vivo ✨
                    </span>
                  </h4>
                  <p className="text-[10px] text-[#c9b7ff]">Tu compañero de equipo en Uhura</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                  title={soundEnabled ? 'Silenciar efectos' : 'Activar efectos'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#d4ff4a]" /> : <VolumeX className="w-3.5 h-3.5 text-white/40" />}
                </button>

                {/* Reset position */}
                <button
                  onClick={handleResetPosition}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                  title="Restablecer a la esquina inferior"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Minimize */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(true);
                  }}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                  title="Minimizar"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                {/* Close HUD */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                  title="Cerrar panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Beaver Status & Live Stats */}
            <div className="space-y-3">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c9b7ff]">
                    Recurso Registrado
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-white font-mono">
                      {loggedHoursToday.toFixed(1)}h
                    </span>
                    <span className="text-xs text-white/60">energía hoy</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#d4ff4a] flex items-center gap-1 justify-end">
                    <Sparkles className="w-3 h-3 text-[#d4ff4a]" />
                    {loggedHoursToday > 8.5 ? 'Sobrecarga' : 'Equilibrio'}
                  </span>
                  <span className="text-[10px] text-[#fdba74] font-bold block mt-0.5">
                    Consistencia: {streakDays}d
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-white/80">Estabilidad del Hábitat</span>
                  <span className="text-[#d4ff4a] font-mono">
                    {loggedHoursToday > 8.5 ? 'Demasiado peso' : percent >= 100 ? 'Sincronizado' : `${percent}% balance`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    style={{ width: `${Math.min(100, percent)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      loggedHoursToday > 8.5
                        ? 'bg-[#ef4444]'
                        : percent >= 90
                        ? 'bg-gradient-to-r from-[#10b981] to-[#d4ff4a]'
                        : 'bg-gradient-to-r from-[#8a4dff] to-[#3b82f6]'
                    }`}
                  />
                </div>
              </div>

              {/* TAB NAVIGATION: BUZO & MOODS / PASEO / 10 POSES / RUTINAS */}
              <div className="flex items-center gap-1 p-1 bg-black/40 rounded-2xl border border-white/10 text-[11px] font-bold">
                <button
                  onClick={() => setActivePoseTab('moods')}
                  className={`flex-1 py-1.5 px-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activePoseTab === 'moods'
                      ? 'bg-[#8a4dff] text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shirt className="w-3.5 h-3.5 text-[#d4ff4a]" />
                  <span>Buzo & Moods</span>
                </button>

                <button
                  onClick={() => setActivePoseTab('movement')}
                  className={`flex-1 py-1.5 px-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activePoseTab === 'movement'
                      ? 'bg-[#8a4dff] text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5 text-[#d4ff4a]" />
                  <span>Paseo</span>
                </button>

                <button
                  onClick={() => setActivePoseTab('actions')}
                  className={`flex-1 py-1.5 px-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activePoseTab === 'actions'
                      ? 'bg-[#8a4dff] text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4ff4a]" />
                  <span>Rutinas</span>
                </button>
              </div>

              {/* TAB 0: BUZO OFICIAL UHURA Y ESTADOS DE ÁNIMO */}
              {activePoseTab === 'moods' && (
                <div className="bg-[#1f103b]/90 p-3.5 rounded-2xl border border-[#8a4dff]/50 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#d4ff4a] flex items-center gap-1.5">
                        <Shirt className="w-3.5 h-3.5 text-[#d4ff4a]" />
                        Buzo Oficial Uhura & Moods
                      </span>
                      <p className="text-[10px] text-white/70 mt-0.5">
                        {useUhuraHoodie ? '✨ Bucky viste el buzo morado con el favicon Uhura' : '🪵 Bucky en edición clásica sin indumentaria'}
                      </p>
                    </div>

                    <button
                      onClick={toggleUhuraHoodie}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                        useUhuraHoodie
                          ? 'bg-[#d4ff4a] text-[#140b24] border-[#d4ff4a] shadow-md shadow-[#d4ff4a]/20'
                          : 'bg-white/10 text-white/60 border-white/20 hover:text-white'
                      }`}
                      title="Activar o desactivar el buzo con favicon Uhura"
                    >
                      <span>{useUhuraHoodie ? 'Buzo: ACTIVO 🚀' : 'Buzo: OFF'}</span>
                    </button>
                  </div>

                  {/* Showcase preview card: Galería de los 5 Estados Auténticos */}
                  <div className="p-3 bg-black/40 rounded-xl border border-[#8a4dff]/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-wider text-[#d4ff4a]">
                        5 Estados Oficiales (Base en el Principal)
                      </span>
                      <span className="text-[8px] bg-[#d4ff4a] text-[#140b24] font-black px-1.5 py-0.5 rounded-full uppercase">
                        Colección Completa
                      </span>
                    </div>

                    {/* Preview interactivo grande del estado seleccionado */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#501f92]/40 via-[#140b24] to-black/80 border border-[#8a4dff]/40 flex items-center gap-3">
                      <div className="w-20 h-20 shrink-0 rounded-xl bg-black/40 p-1 border border-[#d4ff4a]/40 flex items-center justify-center relative shadow-lg">
                        <img
                          src={getRenderPath(selectedRenderPose)}
                          alt={`Bucky ${selectedRenderPose}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain filter drop-shadow-md"
                        />
                        <span className="absolute -top-1.5 -right-1.5 bg-[#d4ff4a] text-[#140b24] text-[8px] font-black px-1 rounded-full">
                          ✓
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-white">
                            {selectedRenderPose === 'stand' && '1. Mano en Cintura 💜'}
                            {selectedRenderPose === 'wave' && '2. Saludando 👋'}
                            {selectedRenderPose === 'alert' && '3. Alerta / Sobrecarga 👀'}
                            {selectedRenderPose === 'celebrate' && '4. Celebrando Cierre 🎉'}
                            {selectedRenderPose === 'rest' && '5. Modo Descanso ☕'}
                            {selectedRenderPose === 'focus' && '6. Foco Profundo 🎧'}
                            {selectedRenderPose === 'master' && '0. Modelo Principal Clásico 🪵'}
                          </span>
                          <span className="text-[8px] bg-[#8a4dff]/60 text-[#d4ff4a] font-bold px-1.5 py-0.2 rounded-full">
                            {selectedRenderPose === 'alert' ? 'Buzo liso #501f92' : selectedRenderPose === 'master' ? 'Canónico 3D' : 'Buzo #501f92 + Favicon'}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/75 leading-tight">
                          {selectedRenderPose === 'stand' && 'Pose icónica con mano en la cintura y sonrisa cordial. Buzo morado con el logo blanco oficial de Uhura.'}
                          {selectedRenderPose === 'wave' && 'Gesto enérgico de bienvenida con pata alzada. Idéntico al rostro y proporciones del modelo principal.'}
                          {selectedRenderPose === 'alert' && 'Expresión atenta con ceja alzada y pata gesticulando alerta. Con buzo morado liso y limpio.'}
                          {selectedRenderPose === 'celebrate' && 'Brazos en alto con confeti festejando el cierre exitoso de la jornada y tareas del día.'}
                          {selectedRenderPose === 'rest' && 'Postura relajada y serena sosteniendo una taza humeante para pausas activas y mindfulness.'}
                          {selectedRenderPose === 'focus' && 'Con audífonos de estudio y tableta digital en modo de concentración y flujo profundo.'}
                          {selectedRenderPose === 'master' && 'Personaje canónico original de Orbit sin indumentaria. Base referencial de toda la colección.'}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              triggerLivingAction(
                                selectedRenderPose === 'stand' ? 'stand' :
                                selectedRenderPose === 'alert' ? 'alert' :
                                selectedRenderPose === 'celebrate' ? 'celebrate' :
                                selectedRenderPose === 'rest' ? 'rest' :
                                selectedRenderPose === 'focus' ? 'focus' : 'wave',
                                selectedRenderPose === 'stand' ? '¡Aquí Bucky, cuidando tu ritmo! 💜' :
                                selectedRenderPose === 'alert' ? '¡Ojo con las horas! Cuidemos el ritmo ⚠️' :
                                selectedRenderPose === 'celebrate' ? '¡Objetivos cumplidos! ¡A celebrar! 🎉' :
                                selectedRenderPose === 'rest' ? 'Momento de pausa activa y recarga ☕' :
                                selectedRenderPose === 'focus' ? 'Enfocado al 100% en la tarea actual 🎧' :
                                '¡Hola! Construyendo juntos en Orbit 👋'
                              );
                            }}
                            className="px-2 py-1 rounded-lg bg-[#d4ff4a] hover:bg-[#bceb36] text-[#140b24] text-[9px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Probar en Bucky</span>
                          </button>

                          <button
                            onClick={() => handleCopyRender(selectedRenderPose)}
                            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-white/10"
                          >
                            <Copy className="w-2.5 h-2.5 text-[#d4ff4a]" />
                            <span>{copied ? '¡Copiado!' : 'Copiar PNG'}</span>
                          </button>

                          <button
                            onClick={() => handleDownloadRender(selectedRenderPose)}
                            className="px-2 py-1 rounded-lg bg-[#8a4dff]/40 hover:bg-[#8a4dff]/60 text-white text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-[#8a4dff]/50"
                          >
                            <Download className="w-2.5 h-2.5 text-[#d4ff4a]" />
                            <span>Descargar</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Selector en miniatura de los 6 estados + principal */}
                    <div className="grid grid-cols-7 gap-1">
                      {[
                        { id: 'stand', label: 'Cintura', icon: '💜', path: '/bucky_hip_uhura_v3.png' },
                        { id: 'wave', label: 'Saludo', icon: '👋', path: '/bucky_waving_cutout.png' },
                        { id: 'alert', label: 'Alerta', icon: '👀', path: '/bucky_alert_cutout.png' },
                        { id: 'celebrate', label: 'Cierre', icon: '🎉', path: '/bucky_celebrating_cutout.png' },
                        { id: 'rest', label: 'Descanso', icon: '☕', path: '/bucky_resting_cutout.png' },
                        { id: 'focus', label: 'Foco', icon: '🎧', path: '/bucky_focus_cutout.png' },
                        { id: 'master', label: 'Base', icon: '🪵', path: '/orbit_mascot_cutout.png' },
                      ].map((item) => {
                        const isSelected = selectedRenderPose === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setSelectedRenderPose(item.id as any)}
                            className={`p-1 rounded-xl flex flex-col items-center transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#8a4dff]/40 border-[#d4ff4a] shadow-md shadow-[#8a4dff]/30 scale-105'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="w-9 h-9 flex items-center justify-center p-0.5">
                              <img
                                src={item.path}
                                alt={item.label}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain filter drop-shadow-xs"
                              />
                            </div>
                            <span className={`text-[8px] font-bold mt-0.5 leading-none ${isSelected ? 'text-[#d4ff4a]' : 'text-white/70'}`}>
                              {item.icon} {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Badge de Fidelidad de Marca */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#501f92]/30 border border-[#8a4dff]/30 text-[10px]">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-white flex items-center justify-center p-0.5 shadow-xs">
                          <UhuraLogo size={15} color="#501f92" />
                        </div>
                        <span className="text-white font-medium">Favicon Oficial Uhura (SVG Exacto)</span>
                      </div>
                      <span className="text-[#d4ff4a] font-bold text-[9px] flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#d4ff4a]" /> 100% Consistencia con el Principal
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: MOVIMIENTO LIBRE Y LOCOMOCIÓN */}
              {activePoseTab === 'movement' && (
                <div className="bg-[#1f103b]/90 p-3.5 rounded-2xl border border-[#8a4dff]/50 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#d4ff4a] flex items-center gap-1.5">
                        <Footprints className="w-3.5 h-3.5 text-[#d4ff4a]" />
                        Locomoción Libre de Bucky
                      </span>
                      <p className="text-[10px] text-white/70 mt-0.5">
                        {isWalking
                          ? '🚶‍♂️ Caminando activamente hacia nuevo punto...'
                          : '✨ Esperando orden de marcha o arrastre libre'}
                      </p>
                    </div>

                    {/* Toggle Paseo Autónomo */}
                    <button
                      onClick={() => {
                        const next = !isFreeRoamActive;
                        setIsFreeRoamActive(next);
                        if (next) {
                          setSpeechBubbleText('¡Paseo autónomo encendido! Exploraré la pantalla libremente 🐾');
                          if (soundEnabled) playChime('celebrate');
                        } else {
                          setSpeechBubbleText('Paseo pausado. Me quedaré atento aquí 🦫');
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isFreeRoamActive
                          ? 'bg-[#d4ff4a] text-[#140b24] border-[#d4ff4a] shadow-md shadow-[#d4ff4a]/20'
                          : 'bg-white/10 text-white/60 border-white/20 hover:text-white'
                      }`}
                      title="Activar o pausar paseo continuo cada 19s"
                    >
                      <span className={`w-2 h-2 rounded-full ${isFreeRoamActive ? 'bg-[#140b24] animate-ping' : 'bg-white/40'}`} />
                      <span>{isFreeRoamActive ? 'Auto: ACTIVO' : 'Auto: OFF'}</span>
                    </button>
                  </div>

                  {/* Quick Walk Control Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRandomRoam}
                      disabled={isWalking}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-[#8a4dff] to-[#501f92] hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#8a4dff]/80 shadow-md"
                    >
                      <Footprints className="w-4 h-4 text-[#d4ff4a]" />
                      <span>{isWalking ? 'Caminando...' : 'Explorar rincón'}</span>
                    </button>

                    <button
                      onClick={handleWalkToCenter}
                      disabled={isWalking}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-[#8a4dff]/40 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
                    >
                      <Compass className="w-4 h-4 text-[#d4ff4a]" />
                      <span>Ir al centro</span>
                    </button>

                    <button
                      onClick={handleReturnHome}
                      disabled={isWalking}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-[#8a4dff]/40 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
                    >
                      <Home className="w-4 h-4 text-[#c9b7ff]" />
                      <span>Volver a base</span>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('jump', '¡Salto alegre de victoria! 🦫✨')}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-[#8a4dff]/40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
                    >
                      <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                      <span>Dar un salto</span>
                    </button>
                  </div>

                  <div className="p-2 bg-black/30 rounded-xl border border-white/5 text-[10px] text-white/70 flex items-center gap-2">
                    <Move className="w-3.5 h-3.5 text-[#d4ff4a] shrink-0" />
                    <span>Arrastra a Bucky con el cursor hacia cualquier parte de tu pantalla; recordará su posición.</span>
                  </div>
                </div>
              )}

              {/* TAB 2: CATÁLOGO DE LAS 10 POSES DE BUCKY */}
              {activePoseTab === 'poses' && (
                <div className="bg-[#1f103b]/90 p-3 rounded-2xl border border-[#8a4dff]/50 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#d4ff4a] flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5 text-[#d4ff4a]" />
                      Las 10 Poses Oficiales de Bucky
                    </span>
                    <span className="text-[9px] text-[#c9b7ff]">Clic para adoptar</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                    <button
                      onClick={() => triggerLivingAction('idle', '¡Bucky atento y listo para la acción! 🦫')}
                      className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-2 ${
                        currentAction === 'idle'
                          ? 'bg-[#8a4dff] text-white border-[#d4ff4a]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span className="text-base">1️⃣</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">Neutral / Atento</div>
                        <div className="text-[9px] text-white/60">Pose clásica</div>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('wave', '¡Hola Pao! 👋 ¿Qué construimos hoy?')}
                      className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-2 ${
                        currentAction === 'wave'
                          ? 'bg-[#8a4dff] text-white border-[#d4ff4a]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span className="text-base">2️⃣</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">Saludo amable</div>
                        <div className="text-[9px] text-white/60">Mano alzada 👋</div>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('celebrate', '¡Bravo! 👏 ¡Celebramos el avance del equipo!')}
                      className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-2 ${
                        currentAction === 'celebrate'
                          ? 'bg-[#8a4dff] text-white border-[#d4ff4a]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span className="text-base">3️⃣</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">Celebración</div>
                        <div className="text-[9px] text-white/60">Aplauso alegre 🎉</div>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('motivate', '¡Vamos con todo! 💪 ¡La represa queda sólida!')}
                      className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-2 ${
                        currentAction === 'motivate'
                          ? 'bg-[#8a4dff] text-white border-[#d4ff4a]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span className="text-base">4️⃣</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">Motivador</div>
                        <div className="text-[9px] text-white/60">¡Vamos equipo! 💪</div>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('jump', '¡Yuuupi! 🦫✨ ¡Salto de felicidad!')}
                      className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-2 ${
                        currentAction === 'jump'
                          ? 'bg-[#8a4dff] text-white border-[#d4ff4a]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span className="text-base">5️⃣</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">Pequeño salto</div>
                        <div className="text-[9px] text-white/60">Patitas arriba ✨</div>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('stretch', '¡Qué delicia de estirón! 🧘‍♀️')}
                      className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-2 ${
                        currentAction === 'stretch'
                          ? 'bg-[#8a4dff] text-white border-[#d4ff4a]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span className="text-base">6️⃣</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">Estiramiento</div>
                        <div className="text-[9px] text-white/60">Brazos al cielo 🧘</div>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('yawn', '*Uaaah*... 🥱 Un sorbito de café y listos ☕')}
                      className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-2 ${
                        currentAction === 'yawn'
                          ? 'bg-[#8a4dff] text-white border-[#d4ff4a]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span className="text-base">7️⃣</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">Bostezo</div>
                        <div className="text-[9px] text-white/60">Tierno y dormilón ☕</div>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('walk', '¡Caminando con energía por Orbit! 🚶‍♂️')}
                      className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-2 ${
                        currentAction === 'walk'
                          ? 'bg-[#8a4dff] text-white border-[#d4ff4a]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span className="text-base">8️⃣</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">Caminando</div>
                        <div className="text-[9px] text-white/60">Zancada activa 🚶‍♂️</div>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('alert', '¡Atención Pao! ⚠️ Cuidado con sobretiempos.')}
                      className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-2 ${
                        currentAction === 'alert'
                          ? 'bg-[#8a4dff] text-white border-[#d4ff4a]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span className="text-base">9️⃣</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">Preocupado / Alerta</div>
                        <div className="text-[9px] text-white/60">Ojo con los límites ⚠️</div>
                      </div>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('point', '¡Mira esa tarea importante! 👉')}
                      className={`p-2 rounded-xl text-left transition-all border cursor-pointer flex items-center gap-2 ${
                        currentAction === 'point'
                          ? 'bg-[#8a4dff] text-white border-[#d4ff4a]'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      <span className="text-base">🔟</span>
                      <div>
                        <div className="text-[11px] font-bold text-white">Señalando CTA</div>
                        <div className="text-[9px] text-white/60">Dedo al objetivo 👉</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: RUTINAS DE COMPAÑERO & PAUSA ACTIVA */}
              {activePoseTab === 'actions' && (
                <div className="bg-[#1f103b]/80 p-3 rounded-2xl border border-[#8a4dff]/40 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d4ff4a] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#d4ff4a]" />
                      Rutinas & Salud Laboral
                    </span>
                    <span className="text-[9px] text-[#c9b7ff]">Interactúa</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => triggerLivingAction('stretch')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-[#8a4dff]/40 border border-white/10 hover:border-[#8a4dff] transition-all flex flex-col items-center gap-1 cursor-pointer text-center"
                    >
                      <span className="text-sm">🧘</span>
                      <span className="text-[9px] font-bold text-white/80">Estirar</span>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('exercise')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-[#8a4dff]/40 border border-white/10 hover:border-[#8a4dff] transition-all flex flex-col items-center gap-1 cursor-pointer text-center"
                    >
                      <span className="text-sm">🏃</span>
                      <span className="text-[9px] font-bold text-white/80">Moverse</span>
                    </button>

                    <button
                      onClick={() => triggerLivingAction('hydrate')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-[#8a4dff]/40 border border-white/10 hover:border-[#8a4dff] transition-all flex flex-col items-center gap-1 cursor-pointer text-center"
                    >
                      <span className="text-sm">💧</span>
                      <span className="text-[9px] font-bold text-white/80">Agua</span>
                    </button>
                  </div>

                  {/* Interactive Active Break Banner */}
                  {!activeBreakActive ? (
                    <button
                      onClick={startActiveBreak}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#501f92] to-[#8a4dff] hover:brightness-110 text-white text-xs font-bold flex items-center justify-between transition-all cursor-pointer border border-[#8a4dff]/60 shadow-md"
                    >
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#d4ff4a]" />
                        <span>Pausa Activa Guiada (30s)</span>
                      </span>
                      <span className="text-[10px] text-[#d4ff4a] font-mono">+25 Orbs</span>
                    </button>
                  ) : (
                    <div className="bg-[#140b24] p-2.5 rounded-xl border border-[#d4ff4a] text-center space-y-1 animate-pulse">
                      <div className="flex items-center justify-between text-xs font-bold text-[#d4ff4a]">
                        <span>Paso {breakStep} de 3 en curso</span>
                        <span className="font-mono text-sm">{breakTimer}s</span>
                      </div>
                      <p className="text-[11px] text-white font-medium">
                        {breakStep === 1 && '🙆‍♂️ Mueve los hombros en círculos amplios'}
                        {breakStep === 2 && '🧘 Gira suavemente el cuello de lado a lado'}
                        {breakStep === 3 && '👀 Mira a un punto lejano y parpadea'}
                      </p>
                    </div>
                  )}

                  {/* Quick Feed Actions */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-[#c9b7ff] uppercase tracking-wider">
                        🪵 Madera:
                      </span>
                      <button
                        onClick={handleTickle}
                        className="text-[10px] font-bold text-[#ec4899] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3 fill-[#ec4899]" />
                        Cosquillas (+5)
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleFeedHours(1.0, '1h Sprint de Trabajo')}
                        className="py-1.5 px-1 rounded-xl bg-white/10 hover:bg-[#8a4dff] text-white text-xs font-bold transition-all cursor-pointer flex flex-col items-center border border-white/10"
                      >
                        <span>+1.0h</span>
                        <span className="text-[9px] text-white/60">1 Tronco</span>
                      </button>

                      <button
                        onClick={() => handleFeedHours(2.0, '2h Diseño')}
                        className="py-1.5 px-1 rounded-xl bg-white/10 hover:bg-[#8a4dff] text-white text-xs font-bold transition-all cursor-pointer flex flex-col items-center border border-white/10"
                      >
                        <span>+2.0h</span>
                        <span className="text-[9px] text-white/60">2 Troncos</span>
                      </button>

                      <button
                        onClick={() => {
                          const needed = Math.max(0.5, targetDayHours - loggedHoursToday);
                          handleFeedHours(needed, 'Jornada Completa');
                        }}
                        className="py-1.5 px-1 rounded-xl bg-gradient-to-r from-[#8a4dff] to-[#501f92] hover:opacity-95 text-white text-xs font-bold transition-all cursor-pointer flex flex-col items-center border border-[#8a4dff]"
                      >
                        <span className="text-[#d4ff4a]">Llenar</span>
                        <span className="text-[9px] text-white/80">a 8h</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER EXPORT BAR: SELECTOR DE POSE PARA COPIAR O DESCARGAR PNG */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c9b7ff] flex items-center gap-1">
                    <Download className="w-3 h-3 text-[#d4ff4a]" />
                    Exportar Render PNG Transparente:
                  </span>
                  <select
                    value={selectedRenderPose}
                    onChange={(e) => setSelectedRenderPose(e.target.value as any)}
                    className="bg-[#1f103b] text-white text-[10px] font-bold py-1 px-2 rounded-lg border border-[#8a4dff]/40 outline-none cursor-pointer"
                  >
                    <option value="wave">👋 1. Saludando (Buzo Uhura)</option>
                    <option value="alert">👀 2. Alerta / Sobrecarga</option>
                    <option value="celebrate">🎉 3. Celebrando Cierre</option>
                    <option value="rest">☕ 4. Modo Descanso / Pausa Activa</option>
                    <option value="focus">🎧 5. Foco Profundo / Concentrado</option>
                    <option value="master">🪵 Modelo Principal Clásico</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyRender()}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-[#8a4dff] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10 shadow-xs"
                    title="Copiar imagen PNG transparente seleccionada al portapapeles"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#d4ff4a]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#d4ff4a]" />
                    )}
                    <span>{copied ? '¡Copiado!' : 'Copiar PNG'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadRender()}
                    className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-white/10"
                    title="Descargar archivo PNG transparente seleccionado"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>

              {/* Navigation Shortlink to Mi Día */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => {
                    onNavigateToView('mi-dia');
                    setIsOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#2e1859] hover:bg-[#3d2075] text-[#d4ff4a] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#8a4dff]/40"
                >
                  <span>Ir al Ecosistema Mi Día & La Colonia</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


