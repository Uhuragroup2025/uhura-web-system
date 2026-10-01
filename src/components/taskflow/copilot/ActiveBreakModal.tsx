import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Heart,
  Droplets,
  Eye,
  Activity,
  Wind,
  Smile,
  Sparkles
} from 'lucide-react';
import buckyCelebratingImg from '../../../assets/images/bucky_celebrating_cutout.png';
import buckyFocusImg from '../../../assets/images/bucky_focus_cutout.png';
import buckyRestingImg from '../../../assets/images/bucky_resting_cutout.png';

interface ActiveBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface BreakExercise {
  id: number;
  title: string;
  category: string;
  durationSec: number;
  icon: React.ReactNode;
  instructions: string[];
  benefit: string;
}

const EXERCISES_3MIN: BreakExercise[] = [
  {
    id: 1,
    title: 'Alivio Cervical y Cuello',
    category: 'Cervical & Trapecios',
    durationSec: 40,
    icon: <Smile className="w-5 h-5 text-[#8a4dff]" />,
    instructions: [
      'Siéntate con la espalda recta y los pies firmes en el suelo.',
      'Inclina la cabeza lentamente hacia el hombro derecho durante 15 segundos.',
      'Regresa al centro y repite suavemente hacia el hombro izquierdo.',
      'No fuerces el movimiento; siente cómo se libera la tensión acumulada.'
    ],
    benefit: 'Reduce dolores de cabeza tensionales y rigidez en la nuca.'
  },
  {
    id: 2,
    title: 'Descanso Visual (Regla 20-20-20)',
    category: 'Salud Ocular',
    durationSec: 30,
    icon: <Eye className="w-5 h-5 text-[#0284c7]" />,
    instructions: [
      'Aparta la mirada de la pantalla por completo.',
      'Enfoca un objeto, ventana o punto lejano a más de 6 metros.',
      'Parpadea lentamente 5 veces para rehidratar la superficie ocular.',
      'Respira con calma mientras tus ojos descansan del brillo digital.'
    ],
    benefit: 'Previene fatiga ocular, resequedad y visión borrosa al final del día.'
  },
  {
    id: 3,
    title: 'Apertura de Pecho y Hombros',
    category: 'Movilidad Escapular',
    durationSec: 40,
    icon: <Activity className="w-5 h-5 text-[#ea580c]" />,
    instructions: [
      'Entrelaza las manos detrás de la espalda si te es cómodo.',
      'Gira los hombros hacia atrás y hacia abajo en círculos lentos 5 veces.',
      'Abre el pecho hacia adelante sintiendo la expansión torácica.',
      'Mantén la barbilla paralela al suelo.'
    ],
    benefit: 'Contrarresta la postura encorvada del teclado y abre la caja torácica.'
  },
  {
    id: 4,
    title: 'Extensión de Muñecas y Dedos',
    category: 'Ergonomía de Teclado & Mouse',
    durationSec: 40,
    icon: <Sparkles className="w-5 h-5 text-[#10b981]" />,
    instructions: [
      'Extiende el brazo derecho al frente con la palma hacia afuera y dedos hacia arriba.',
      'Con la mano izquierda, presiona suavemente los dedos hacia atrás 15 segundos.',
      'Baja la mano con los dedos hacia el suelo y repite el estiramiento.',
      'Cambia de brazo y repite el mismo ciclo.'
    ],
    benefit: 'Previene síndrome de túnel carpiano y tendinitis en diseñadores y programadores.'
  },
  {
    id: 5,
    title: 'Hidratación y Respiración Profunda',
    category: 'Energía & Oxigenación',
    durationSec: 30,
    icon: <Droplets className="w-5 h-5 text-[#2563eb]" />,
    instructions: [
      'Toma un buen vaso o termo de agua fresca y bebe con calma.',
      'Inhala profundo en 4 tiempos inflando el abdomen.',
      'Sostén el aire 4 tiempos y exhala lentamente por la boca en 6 tiempos.',
      '¡Listo para retomar con mente fresca y cuerpo ligero!'
    ],
    benefit: 'Rehidrata neuronas, baja pulsaciones cardíacas y renueva la concentración.'
  }
];

export const ActiveBreakModal: React.FC<ActiveBreakModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(EXERCISES_3MIN[0].durationSec);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentExercise = EXERCISES_3MIN[currentStepIndex];

  // Sound chime helper
  const playStepChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.28);
      });
    } catch {}
  };

  // Reset timer on step change
  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(currentExercise.durationSec);
  }, [currentStepIndex, isOpen]);

  // Main countdown loop
  useEffect(() => {
    if (!isOpen || !isRunning || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Advance to next step
          if (currentStepIndex < EXERCISES_3MIN.length - 1) {
            setCurrentStepIndex((s) => s + 1);
            playStepChime();
            return EXERCISES_3MIN[currentStepIndex + 1].durationSec;
          } else {
            // All exercises finished!
            setIsCompleted(true);
            setIsRunning(false);
            playStepChime();
            onComplete?.();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isRunning, currentStepIndex, isCompleted]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsRunning(true);
      setIsCompleted(false);
      setTimeLeft(EXERCISES_3MIN[0].durationSec);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalDuration = EXERCISES_3MIN.reduce((acc, e) => acc + e.durationSec, 0);
  const elapsedSeconds =
    EXERCISES_3MIN.slice(0, currentStepIndex).reduce((acc, e) => acc + e.durationSec, 0) +
    (currentExercise.durationSec - timeLeft);
  const overallProgress = Math.min(100, Math.round((elapsedSeconds / totalDuration) * 100));

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#e2e8f0] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2e1859] via-[#501f92] to-[#7c3aed] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">☕</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#d4ff4a] text-[#0f172a] px-2 py-0.5 rounded-full">
                  Pausa Activa Humana
                </span>
                <span className="text-xs text-white/80">3 minutos guiados</span>
              </div>
              <h3 className="text-sm font-black text-white mt-0.5">
                Bienestar & Ergonomía en Orbit
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-[#f1f5f9] h-1.5">
          <div
            className="h-full bg-gradient-to-r from-[#8a4dff] to-[#d4ff4a] transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {isCompleted ? (
          /* COMPLETION CELEBRATION VIEW */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <img
              src={buckyCelebratingImg}
              alt="Bucky Celebrando"
              className="w-24 h-24 mx-auto object-contain drop-shadow-md"
            />
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#10b981] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full uppercase tracking-wider">
                ✓ ¡Pausa Completada con Éxito!
              </span>
              <h3 className="text-lg font-black text-[#0f172a] mt-2">
                Cuerpo relajado, mente oxigenada
              </h3>
              <p className="text-xs text-[#64748b] max-w-sm mx-auto leading-relaxed">
                Tus ojos, cuello y muñecas te lo agradecen. ¡Regresas a Orbit con mejor ritmo y energía saludable!
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              >
                Volver a mis actividades
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE EXERCISE VIEW */
          <div className="p-5 sm:p-6 space-y-5">
            {/* Step header + category */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#f5f3ff] text-[#501f92] font-black text-xs flex items-center justify-center border border-[#ddd6fe]">
                  {currentStepIndex + 1}
                </span>
                <span className="text-xs font-bold text-[#64748b]">
                  de {EXERCISES_3MIN.length} · {currentExercise.category}
                </span>
              </div>

              {/* Step Countdown */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                <span className="text-xs font-mono font-black text-[#0f172a]">
                  {formatSeconds(timeLeft)}
                </span>
              </div>
            </div>

            {/* Exercise Title Card */}
            <div className="p-4 rounded-2xl bg-[#fbf9ff] border border-[#ddd6fe] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 shadow-xs">
                {currentExercise.icon}
              </div>
              <div>
                <h4 className="text-sm font-black text-[#0f172a]">
                  {currentExercise.title}
                </h4>
                <p className="text-[11px] text-[#7c3aed] font-medium mt-0.5">
                  Beneficio: {currentExercise.benefit}
                </p>
              </div>
            </div>

            {/* Step Instructions */}
            <div className="space-y-2 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                Cómo realizar este ejercicio:
              </span>
              <ul className="space-y-1.5 text-xs text-[#334155] leading-relaxed">
                {currentExercise.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#8a4dff] font-bold">•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONTROLS BAR */}
            <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
              <button
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((s) => Math.max(0, s - 1))}
                className="px-3 py-1.5 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="px-4 py-2 rounded-xl bg-[#501f92] hover:bg-[#381566] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Reanudar</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  if (currentStepIndex < EXERCISES_3MIN.length - 1) {
                    setCurrentStepIndex((s) => s + 1);
                    playStepChime();
                  } else {
                    setIsCompleted(true);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#f5f3ff] hover:bg-[#ede9fe] text-[#501f92] text-xs font-bold border border-[#ddd6fe] cursor-pointer flex items-center gap-1"
              >
                <span>{currentStepIndex === EXERCISES_3MIN.length - 1 ? 'Finalizar' : 'Siguiente'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
