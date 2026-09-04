import React, { useState, useEffect, useRef } from 'react';
import beaverMascotImg from '../../assets/images/orbit_mascot_cutout.png';
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
  Check
} from 'lucide-react';
import { OrbitView } from './types';

interface FloatingBeaverWidgetProps {
  loggedHoursToday: number;
  targetDayHours?: number;
  onQuickLogHours: (hours: number, label: string, category?: 'client' | 'internal', projectName?: string) => void;
  onNavigateToView: (view: OrbitView) => void;
  streakDays?: number;
}

export type BuckyAction = 'idle' | 'wave' | 'yawn' | 'stretch' | 'exercise' | 'hydrate';

// Sound synthesizer using Web Audio API (Zero dependencies, gentle ambient sounds)
const playChime = (type: 'feed' | 'tickle' | 'pop' | 'celebrate' | 'wave' | 'yawn' | 'stretch' | 'exercise' | 'hydrate') => {
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

  // Lifelike Living Actions (Vida Propia)
  const [currentAction, setCurrentAction] = useState<BuckyAction>('idle');
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Guided Active Break (Pausa Activa)
  const [activeBreakActive, setActiveBreakActive] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyRender = async () => {
    try {
      const response = await fetch('/orbit_bucky_render.png');
      const blob = await response.blob();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        handleDownloadRender();
      }
    } catch {
      handleDownloadRender();
    }
  };

  const handleDownloadRender = () => {
    const link = document.createElement('a');
    link.href = '/orbit_bucky_render.png';
    link.download = 'bucky_orbit_render.png';
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

  // Trigger specific living action (Vida Propia)
  const triggerLivingAction = (action: BuckyAction, customText?: string) => {
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);

    setCurrentAction(action);
    if (soundEnabled && action !== 'idle') playChime(action);

    let phrase = customText;
    let duration = 3000;

    switch (action) {
      case 'wave':
        phrase = phrase || '¡Hola Pao! 👋 ¡Qué gusto verte! ¿En qué construimos hoy?';
        duration = 2600;
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

  // Initial cheerful greeting when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerLivingAction('wave', '¡Hola Pao! 👋 Soy Bucky. ¡Aquí estoy contigo para construir hoy!');
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

  // Trigger celebration sound if reached 8h
  useEffect(() => {
    if (loggedHoursToday >= targetDayHours && soundEnabled) {
      playChime('celebrate');
      setSpeechBubbleText('🎉 ¡REPRESA AL 100%! Eres la mejor, Pao.');
    }
  }, [loggedHoursToday, targetDayHours, soundEnabled]);

  const handleTickle = () => {
    if (soundEnabled) playChime('tickle');
    setIsWiggling(true);
    setOrbsEarned((prev) => prev + 5);
    const newHeart = { id: Date.now(), x: Math.random() * 40 - 20, y: -20 };
    setHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
    setTimeout(() => setIsWiggling(false), 600);
    setSpeechBubbleText('¡Jajaja! ¡Eso da cosquillas! (+5 Orbs ✨)');
  };

  const handleFeedHours = (hours: number, label: string) => {
    if (soundEnabled) playChime('feed');
    onQuickLogHours(hours, label, 'internal', 'Uhura Group');
    setOrbsEarned((prev) => prev + hours * 10);
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);
    setSpeechBubbleText(`¡Ñam! Bucky devoró +${hours}h de madera 🪵 (+${hours * 10} Orbs)`);
  };

  // Drag handlers (Pointer events)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!coords) return;
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

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragStartRef.current.moved = true;
      setIsDragging(true);
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

  // Animation class based on current lifelike action
  const getActionAnimationClass = () => {
    if (isDragging) return '';
    if (isWiggling) return 'animate-bounce';
    switch (currentAction) {
      case 'wave':
        return 'animate-beaver-wave';
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
    switch (currentAction) {
      case 'wave':
        return '👋';
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
        touchAction: 'none'
      }}
      className="fixed z-50 font-sans pointer-events-none select-none transition-transform duration-75"
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
          <div className="mb-2 max-w-[240px] bg-[#140b24] text-white p-3 rounded-2xl shadow-2xl border border-[#8a4dff]/50 text-xs animate-in zoom-in-95 duration-200 relative">
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

        {/* 2. THE DRAGGABLE FREE-STANDING COMPANION (SOLITO Y CON VIDA PROPIA) */}
        {!isMinimized && (
          <div className="relative group flex flex-col items-center">
            {/* Draggable Bucky Character */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={handleTickle}
              title="Arrastra a Bucky · Clic para ver panel lateral · Doble clic para cosquillas"
              className={`relative select-none flex flex-col items-center transition-transform duration-200 ${
                isDragging
                  ? 'cursor-grabbing scale-110'
                  : 'cursor-grab hover:scale-105 active:scale-95'
              } ${getActionAnimationClass()}`}
            >
              {/* Flame Badge / Streak Indicator - Floating naturally beside shoulder */}
              <div className="absolute top-2 -right-1 z-20 bg-[#140b24]/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-[#8a4dff]/60 shadow-lg flex items-center gap-1 backdrop-blur-xs">
                <Flame className="w-3 h-3 text-[#f97316] fill-[#f97316]" />
                <span>{streakDays}d</span>
              </div>

              {/* Real-Time Action Mood Badge (e.g. 👋, 🥱, 🧘, 🏃) */}
              {getActionEmojiBadge() && (
                <div className="absolute top-1 -left-2 z-20 bg-[#501f92] text-white text-xs px-2 py-0.5 rounded-full border border-[#d4ff4a] shadow-xl animate-bounce">
                  {getActionEmojiBadge()}
                </div>
              )}

              {/* Solito suelto: Clean Full-Body Cutout of the Cute Lovable Mascot without any box */}
              <img
                src={beaverMascotImg}
                alt="Bucky el Castor de Orbit"
                referrerPolicy="no-referrer"
                draggable={false}
                className="w-28 sm:w-32 h-36 sm:h-44 object-contain filter drop-shadow-[0_12px_22px_rgba(20,11,36,0.35)] select-none pointer-events-none"
              />
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

            {/* Drag helper hint on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1 text-[9px] text-[#501f92] font-black bg-white/90 px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <GripHorizontal className="w-3 h-3 text-[#8a4dff]" />
              <span>Arrastrar</span>
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
                    Combustible de Hoy
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-white font-mono">
                      {loggedHoursToday.toFixed(1)}h
                    </span>
                    <span className="text-xs text-white/60">/ {targetDayHours}h</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#d4ff4a] flex items-center gap-1 justify-end">
                    <Award className="w-3 h-3 text-[#d4ff4a]" />
                    {orbsEarned} Orbs
                  </span>
                  <span className="text-[10px] text-[#f97316] font-bold block mt-0.5">
                    🔥 Racha: {streakDays}d
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-white/80">Salud de la Represa</span>
                  <span className="text-[#d4ff4a] font-mono">{percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      percent >= 90
                        ? 'bg-gradient-to-r from-[#10b981] to-[#d4ff4a]'
                        : percent >= 50
                        ? 'bg-gradient-to-r from-[#8a4dff] to-[#3b82f6]'
                        : 'bg-gradient-to-r from-[#ef4444] to-[#f59e0b]'
                    }`}
                  />
                </div>
              </div>

              {/* VIDA PROPIA & RUTINAS DE COMPAÑERO */}
              <div className="bg-[#1f103b]/80 p-3 rounded-2xl border border-[#8a4dff]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d4ff4a] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#d4ff4a]" />
                    Rutinas de Vida con Bucky
                  </span>
                  <span className="text-[9px] text-[#c9b7ff]">Haz clic para interactuar</span>
                </div>

                {/* Living action trigger buttons */}
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    onClick={() => triggerLivingAction('wave')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-[#8a4dff]/40 border border-white/10 hover:border-[#8a4dff] transition-all flex flex-col items-center gap-1 cursor-pointer text-center"
                    title="Saludar a Bucky"
                  >
                    <span className="text-sm">👋</span>
                    <span className="text-[9px] font-bold text-white/80">Hola</span>
                  </button>

                  <button
                    onClick={() => triggerLivingAction('yawn')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-[#8a4dff]/40 border border-white/10 hover:border-[#8a4dff] transition-all flex flex-col items-center gap-1 cursor-pointer text-center"
                    title="Bostezar y despabilar"
                  >
                    <span className="text-sm">🥱</span>
                    <span className="text-[9px] font-bold text-white/80">Bostezo</span>
                  </button>

                  <button
                    onClick={() => triggerLivingAction('stretch')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-[#8a4dff]/40 border border-white/10 hover:border-[#8a4dff] transition-all flex flex-col items-center gap-1 cursor-pointer text-center"
                    title="Estirar la espalda"
                  >
                    <span className="text-sm">🧘</span>
                    <span className="text-[9px] font-bold text-white/80">Estirón</span>
                  </button>

                  <button
                    onClick={() => triggerLivingAction('exercise')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-[#8a4dff]/40 border border-white/10 hover:border-[#8a4dff] transition-all flex flex-col items-center gap-1 cursor-pointer text-center"
                    title="Ejercicio rápido"
                  >
                    <span className="text-sm">🏃</span>
                    <span className="text-[9px] font-bold text-white/80">Moverse</span>
                  </button>

                  <button
                    onClick={() => triggerLivingAction('hydrate')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-[#8a4dff]/40 border border-white/10 hover:border-[#8a4dff] transition-all flex flex-col items-center gap-1 cursor-pointer text-center"
                    title="Tomar agua"
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
                      <span>Hacer Pausa Activa Guiada (30s)</span>
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
              </div>

              {/* Quick Feed Actions */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-[#c9b7ff] uppercase tracking-wider">
                    🪵 Alimentar con madera:
                  </span>
                  <button
                    onClick={handleTickle}
                    className="text-[10px] font-bold text-[#ec4899] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3 fill-[#ec4899]" />
                    Hacer cosquillas
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleFeedHours(1.0, '1h Sprint de Trabajo')}
                    className="py-2 px-1 rounded-xl bg-white/10 hover:bg-[#8a4dff] text-white text-xs font-bold transition-all hover:scale-102 cursor-pointer flex flex-col items-center gap-0.5 border border-white/10"
                  >
                    <span>+1.0h</span>
                    <span className="text-[9px] text-white/60">1 Tronco</span>
                  </button>

                  <button
                    onClick={() => handleFeedHours(2.0, '2h Diseño & Desarrollo')}
                    className="py-2 px-1 rounded-xl bg-white/10 hover:bg-[#8a4dff] text-white text-xs font-bold transition-all hover:scale-102 cursor-pointer flex flex-col items-center gap-0.5 border border-white/10"
                  >
                    <span>+2.0h</span>
                    <span className="text-[9px] text-white/60">2 Troncos</span>
                  </button>

                  <button
                    onClick={() => {
                      const needed = Math.max(0.5, targetDayHours - loggedHoursToday);
                      handleFeedHours(needed, 'Jornada Completa');
                    }}
                    className="py-2 px-1 rounded-xl bg-gradient-to-r from-[#8a4dff] to-[#501f92] hover:opacity-95 text-white text-xs font-bold transition-all hover:scale-102 cursor-pointer flex flex-col items-center gap-0.5 border border-[#8a4dff]"
                  >
                    <span className="text-[#d4ff4a]">Llenar</span>
                    <span className="text-[9px] text-white/80">a 8.0h</span>
                  </button>
                </div>
              </div>

              {/* Render Export Bar (PNG Sin Fondo) */}
              <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={handleCopyRender}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-[#8a4dff] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10 shadow-xs"
                  title="Copiar imagen PNG transparente de Bucky"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#d4ff4a]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#d4ff4a]" />
                  )}
                  <span>{copied ? '¡Render Copiado!' : 'Copiar PNG'}</span>
                </button>

                <button
                  onClick={handleDownloadRender}
                  className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-white/10"
                  title="Descargar archivo PNG transparente"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
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


