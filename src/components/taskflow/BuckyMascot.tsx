import React, { useState, useEffect, useRef } from 'react';
import { BuckyMascotState } from './types';
export type { BuckyMascotState };
import neutralMascotImg from '../../assets/images/orbit_mascot_cutout.png';
import celebrateRenderImg from '../../assets/images/bucky_celebrate_render_1788557761452.jpg';
import warningRenderImg from '../../assets/images/bucky_warning_render_1788557774378.jpg';
import sadRenderImg from '../../assets/images/bucky_sad_render_1788557787368.jpg';
import {
  Sparkles,
  AlertTriangle,
  Heart,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export interface BuckyMascotProps {
  state?: BuckyMascotState;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  speechText?: string | null;
  onStateChange?: (state: BuckyMascotState) => void;
  interactive?: boolean;
  showSelector?: boolean;
  soundEnabled?: boolean;
}

// Memory cache for background-cleared images
const transparentImageCache: Record<string, string> = {};

// Clean white background from 3D renders so they are 100% "solito, suelto"
function getTransparentRender(src: string): Promise<string> {
  if (transparentImageCache[src]) {
    return Promise.resolve(transparentImageCache[src]);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Tolerance for white background
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If very light / white background
          if (r > 238 && g > 238 && b > 238) {
            data[i + 3] = 0; // transparent
          } else if (r > 225 && g > 225 && b > 225) {
            // Smooth edge alpha feathering
            const avg = (r + g + b) / 3;
            const factor = (238 - avg) / (238 - 225);
            data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, factor)));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        transparentImageCache[src] = dataUrl;
        resolve(dataUrl);
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
  });
}

// Gentle Web Audio Sound Synthesizer for each mascot state
export const playMascotSound = (state: BuckyMascotState) => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    switch (state) {
      case 'wave':
        // 3-tone cheerful ascending greeting
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.08 + 0.16);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.18);
        });
        break;

      case 'clap':
        // Triple rhythmic clap impact
        [0, 0.14, 0.28].forEach((timeOffset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, ctx.currentTime + timeOffset);
          osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + timeOffset + 0.08);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + timeOffset);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + timeOffset + 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + timeOffset);
          osc.stop(ctx.currentTime + timeOffset + 0.1);
        });
        break;

      case 'celebrate':
        // Joyful fanfare arpeggio
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
        break;

      case 'letsGo':
        // Energetic power punch two-tone
        [440, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.16);
        });
        break;

      case 'stretch':
        // Warm relaxing chord
        [392.0, 493.88, 587.33].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.65);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.7);
        });
        break;

      case 'yawn':
        // Soft descending yawn glissando
        {
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
        }
        break;

      case 'tired':
      case 'sad':
        // Melancholy soft descending sigh
        {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(360, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5);
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
        }
        break;

      case 'warning':
        // Gentle caution alert pulse (two blips)
        [580, 520].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.14);
          gain.gain.setValueAtTime(0.09, ctx.currentTime + i * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.14 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.14);
          osc.stop(ctx.currentTime + i * 0.14 + 0.13);
        });
        break;

      case 'point':
        // High ping pointing to task
        {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.09, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.16);
        }
        break;

      case 'sleep':
        // Soft lullaby hum
        [329.63, 261.63].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.25);
          gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.25);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.25 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.25);
          osc.stop(ctx.currentTime + i * 0.25 + 0.45);
        });
        break;

      default:
        break;
    }
  } catch {
    // AudioContext silenced or not allowed
  }
};

export const BUCKY_STATE_META: Record<
  BuckyMascotState,
  {
    label: string;
    description: string;
    emoji: string;
    defaultSpeech: string;
    badgeColor: string;
    durationMs: number;
  }
> = {
  idle: {
    label: 'Neutral / Atento',
    description: 'Respira con cadencia, parpadea y mueve ligeramente la cola.',
    emoji: '🦫',
    defaultSpeech: '¡Hola Pao! Todo en orden por aquí. ¿Qué misión abordamos?',
    badgeColor: 'bg-[#501f92] text-white border-[#8a4dff]',
    durationMs: 0
  },
  wave: {
    label: 'Saludo',
    description: 'Saluda alegremente con una mano al colaborador.',
    emoji: '👋',
    defaultSpeech: '¡Hola, Pao! 👋 ¡Qué bueno verte por aquí en Uhura!',
    badgeColor: 'bg-[#3b82f6] text-white border-[#60a5fa]',
    durationMs: 2500
  },
  clap: {
    label: 'Aplauso',
    description: 'Aplaude 3 veces animando un avance o tarea lista.',
    emoji: '👏',
    defaultSpeech: '¡Excelente ritmo! 👏 ¡Tres aplausos por esa entrega!',
    badgeColor: 'bg-[#10b981] text-white border-[#34d399]',
    durationMs: 2200
  },
  celebrate: {
    label: 'Celebración',
    description: 'Pequeño salto con brazos arriba y sonrisa radiante.',
    emoji: '🎉',
    defaultSpeech: '¡SIII! 🎉 ¡Misión cumplida con honores! ¡Bravo!',
    badgeColor: 'bg-[#8a4dff] text-white border-[#d4ff4a]',
    durationMs: 3000
  },
  letsGo: {
    label: '¡Vamos!',
    description: 'Puño arriba con gesto enérgico de motivación pura.',
    emoji: '✊',
    defaultSpeech: '¡Vamos con toda la energía! 🚀 ¡A romperla hoy!',
    badgeColor: 'bg-[#f97316] text-white border-[#fdba74]',
    durationMs: 2400
  },
  stretch: {
    label: 'Estiramiento',
    description: 'Se estira suavemente hacia un lado y luego al otro.',
    emoji: '🧘',
    defaultSpeech: '¡Ufff, qué rico estirón! 🧘‍♀️ Estira los brazos hacia el cielo tú también.',
    badgeColor: 'bg-[#06b6d4] text-white border-[#67e8f9]',
    durationMs: 2800
  },
  yawn: {
    label: 'Bostezo',
    description: 'Bostezo relajado con ojos cerrados recordando tomar un café.',
    emoji: '🥱',
    defaultSpeech: '*Uaaaah*... 🥱 Un sorbito de café caliente y quedamos al 100% ☕',
    badgeColor: 'bg-[#8b5cf6] text-white border-[#c4b5fd]',
    durationMs: 2800
  },
  tired: {
    label: 'Cansado',
    description: 'Hombros caídos y parpadeo lento sugiriendo pausa activa.',
    emoji: '😮‍💨',
    defaultSpeech: 'Fiuu... hombros tensos. Una pausa de 2 minutos nos renovará.',
    badgeColor: 'bg-[#64748b] text-white border-[#94a3b8]',
    durationMs: 3200
  },
  warning: {
    label: 'Preocupado / Alerta',
    description: 'Expresión preocupada mirando hacia el indicador de horas.',
    emoji: '⚠️',
    defaultSpeech: '¡Pao! Nos estamos pasando de horas. ¡Avisemos en el chat para proteger el margen!',
    badgeColor: 'bg-[#dc2626] text-white border-[#f87171]',
    durationMs: 3500
  },
  sad: {
    label: 'Triste Suave',
    description: 'Baja la cabeza suavemente si algo se desvió.',
    emoji: '🥺',
    defaultSpeech: 'Se nos escapó el presupuesto... pero si avisamos al PM todo se arregla.',
    badgeColor: 'bg-[#b91c1c] text-white border-[#fca5a5]',
    durationMs: 3000
  },
  point: {
    label: 'Señalar CTA',
    description: 'Señala hacia la tarea o botón prioritario a accionar.',
    emoji: '👉',
    defaultSpeech: '¡Mira aquí! Esta es la misión prioritaria para cerrar hoy.',
    badgeColor: 'bg-[#2563eb] text-white border-[#93c5fd]',
    durationMs: 2500
  },
  sleep: {
    label: 'Durmiendo',
    description: 'Se duerme plácidamente con Zzz flotando en modo descanso.',
    emoji: '😴',
    defaultSpeech: 'Zzz... Modo hibernación activado. Descansa bien, equipo.',
    badgeColor: 'bg-[#1e1b4b] text-[#c9b7ff] border-[#6366f1]',
    durationMs: 0
  }
};

export const BuckyMascot: React.FC<BuckyMascotProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
  speechText,
  onStateChange,
  interactive = true,
  showSelector = false,
  soundEnabled = true
}) => {
  const [activeState, setActiveState] = useState<BuckyMascotState>(state);
  const [processedImages, setProcessedImages] = useState<Record<string, string>>({
    neutral: neutralMascotImg
  });
  const [blink, setBlink] = useState(false);
  const [clapStep, setClapStep] = useState(0);
  const [sleepZzz, setSleepZzz] = useState<number[]>([1, 2, 3]);

  // Sync external state changes
  useEffect(() => {
    setActiveState(state);
  }, [state]);

  // Pre-process white background removal for 3D JPG renders
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getTransparentRender(celebrateRenderImg),
      getTransparentRender(warningRenderImg),
      getTransparentRender(sadRenderImg)
    ]).then(([celebrateUrl, warningUrl, sadUrl]) => {
      if (!isMounted) return;
      setProcessedImages((prev) => ({
        ...prev,
        celebrate: celebrateUrl,
        warning: warningUrl,
        sad: sadUrl
      }));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Idle blinking cadence (every ~3.5 seconds)
  useEffect(() => {
    if (activeState !== 'idle' && activeState !== 'tired') return;
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), activeState === 'tired' ? 380 : 180);
    }, activeState === 'tired' ? 2400 : 3600);
    return () => clearInterval(interval);
  }, [activeState]);

  // Clap animation 3-step cadence
  useEffect(() => {
    if (activeState !== 'clap') {
      setClapStep(0);
      return;
    }
    const t1 = setTimeout(() => setClapStep(1), 100);
    const t2 = setTimeout(() => setClapStep(2), 300);
    const t3 = setTimeout(() => setClapStep(3), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeState]);

  // Play sound when action triggers
  useEffect(() => {
    if (soundEnabled && activeState !== 'idle') {
      playMascotSound(activeState);
    }
  }, [activeState, soundEnabled]);

  // Choose the best matching 3D render image according to current state
  const getImageSrc = () => {
    switch (activeState) {
      case 'celebrate':
        return processedImages.celebrate || neutralMascotImg;
      case 'warning':
        return processedImages.warning || neutralMascotImg;
      case 'sad':
        return processedImages.sad || neutralMascotImg;
      default:
        return neutralMascotImg;
    }
  };

  // Dimension sizes mapping
  const sizeClasses = {
    sm: 'w-20 h-24 sm:w-24 sm:h-28',
    md: 'w-28 h-36 sm:w-32 sm:h-44',
    lg: 'w-40 h-52 sm:w-48 sm:h-60',
    xl: 'w-56 h-72 sm:w-64 sm:h-80',
    custom: ''
  }[size];

  // Micro-motion CSS classes tailored specifically to each of the 12 states
  const getMotionAnimationClass = () => {
    switch (activeState) {
      case 'idle':
        return 'animate-float';
      case 'wave':
        return 'animate-beaver-wave';
      case 'clap':
        return 'scale-105 transition-transform duration-150';
      case 'celebrate':
        return 'animate-bounce';
      case 'letsGo':
        return 'scale-110 -translate-y-2 transition-all duration-300';
      case 'stretch':
        return 'animate-beaver-stretch';
      case 'yawn':
        return 'animate-beaver-yawn';
      case 'tired':
        return 'translate-y-2 opacity-95 transition-transform duration-500';
      case 'warning':
        return 'animate-pulse';
      case 'sad':
        return 'translate-y-1.5 grayscale-15 transition-all duration-400';
      case 'point':
        return 'translate-x-2 -translate-y-1 transition-transform duration-250';
      case 'sleep':
        return 'translate-y-3 opacity-90 transition-transform duration-700';
      default:
        return 'animate-float';
    }
  };

  const handleStateClick = (newState: BuckyMascotState) => {
    setActiveState(newState);
    if (onStateChange) onStateChange(newState);
  };

  const meta = BUCKY_STATE_META[activeState];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 1. FLOATING SPEECH BUBBLE */}
      {(speechText || (activeState !== 'idle' && meta.defaultSpeech)) && (
        <div className="mb-2 max-w-[260px] bg-[#140b24] text-white p-3 rounded-2xl shadow-2xl border border-[#8a4dff]/50 text-xs animate-in zoom-in-95 duration-200 relative z-30 pointer-events-auto">
          <div className="flex items-start justify-between gap-2">
            <span className="leading-snug font-medium text-[#f1f5f9]">
              {speechText || meta.defaultSpeech}
            </span>
          </div>
          {/* Speech bubble tail pointing directly down to Bucky */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#140b24] border-r border-b border-[#8a4dff]/50 transform rotate-45" />
        </div>
      )}

      {/* 2. MASCOT CHARACTER WRAPPER (SOLITO, SUELTO, 100% SIN CAJA) */}
      <div
        onClick={() => {
          if (!interactive) return;
          // Toggle playful wave on click if idle
          if (activeState === 'idle') {
            handleStateClick('wave');
            setTimeout(() => handleStateClick('idle'), 2600);
          }
        }}
        className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
          interactive ? 'cursor-pointer hover:scale-103 active:scale-97' : ''
        }`}
      >
        {/* State Badge Top-Left */}
        {activeState !== 'idle' && (
          <div
            className={`absolute -top-3 -left-3 z-30 px-2.5 py-1 rounded-full text-xs font-black shadow-xl flex items-center gap-1 border animate-in zoom-in duration-200 ${meta.badgeColor}`}
          >
            <span>{meta.emoji}</span>
            <span className="text-[10px] font-bold">{meta.label}</span>
          </div>
        )}

        {/* Action-specific Particle Overlays */}
        {/* Sleep Zzz */}
        {activeState === 'sleep' && (
          <div className="absolute -top-6 right-2 z-30 font-black text-sm text-[#c9b7ff] flex flex-col items-end pointer-events-none animate-pulse">
            <span className="text-xs">z</span>
            <span className="text-sm">Z</span>
            <span className="text-base font-bold text-[#d4ff4a]">Zzz</span>
          </div>
        )}

        {/* Clap Sparks */}
        {activeState === 'clap' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-center">
            <span className="text-2xl animate-ping">👏</span>
          </div>
        )}

        {/* Celebrate Confetti Sparks */}
        {activeState === 'celebrate' && (
          <div className="absolute -top-4 inset-x-0 z-30 flex justify-between pointer-events-none px-2">
            <Sparkles className="w-5 h-5 text-[#d4ff4a] animate-spin-slow" />
            <Sparkles className="w-4 h-4 text-[#4be5ff] animate-bounce" />
            <Sparkles className="w-5 h-5 text-[#f59e0b] animate-pulse" />
          </div>
        )}

        {/* Warning Indicator Overlay */}
        {activeState === 'warning' && (
          <div className="absolute -top-2 right-0 z-30 bg-[#ef4444] text-white p-1 rounded-full animate-ping pointer-events-none">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}

        {/* Pointing Hand Directive Indicator */}
        {activeState === 'point' && (
          <div className="absolute top-1/2 -right-6 z-30 bg-[#2563eb] text-white px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce pointer-events-none text-xs font-bold">
            <span>¡Aquí!</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Main 3D Cutout Render */}
        <div className={`relative ${getMotionAnimationClass()}`}>
          <img
            src={getImageSrc()}
            alt={`Bucky el Castor de Orbit - ${meta.label}`}
            referrerPolicy="no-referrer"
            draggable={false}
            className={`${sizeClasses} object-contain filter drop-shadow-[0_14px_24px_rgba(20,11,36,0.28)] select-none pointer-events-none transition-all duration-300`}
          />

          {/* Micro Eyes Blink Overlay for Idle & Tired */}
          {(blink || activeState === 'sleep' || activeState === 'yawn') && (
            <div className="absolute top-[28%] left-[34%] w-[32%] h-[6%] bg-[#4a2e12] rounded-full opacity-85 transition-opacity duration-100 pointer-events-none" />
          )}
        </div>
      </div>

      {/* 3. OPTIONAL INTERACTIVE 12-STATE SELECTOR BAR (For testing & showcase) */}
      {showSelector && (
        <div className="mt-4 w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-[#e2e8f0] shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8a4dff]" />
              <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">
                Selector de Estados y Expresiones (12 Renders & Poses)
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#501f92]">
              Estado actual: {meta.label}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {(Object.keys(BUCKY_STATE_META) as BuckyMascotState[]).map((st) => {
              const item = BUCKY_STATE_META[st];
              const isCurrent = activeState === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStateClick(st)}
                  className={`p-2 rounded-2xl border text-left transition-all flex flex-col items-center text-center gap-1 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#501f92] text-white border-[#8a4dff] shadow-sm scale-105'
                      : 'bg-[#f8fafc] text-[#0f172a] border-[#e2e8f0] hover:bg-[#ede9fe] hover:border-[#8a4dff]'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-[10px] font-black leading-tight line-clamp-1">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-[#64748b] text-center italic">
            &ldquo;{meta.description}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};
