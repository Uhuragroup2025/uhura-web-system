import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ChevronRight, ChevronLeft, Droplets, Eye, Activity, Smile, Sparkles } from 'lucide-react';
import buckyCelebratingImg from '../../../assets/images/eco/eco-celebrating.webp';
import buckyRestingImg from '../../../assets/images/eco/eco-coffee.webp';

interface ActiveBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  /** Posición junto a la mascota (la misma del panel de ECO). Sin ella, se ancla abajo a la derecha. */
  style?: React.CSSProperties;
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
    title: 'Alivio de cuello',
    category: 'Cuello y trapecios',
    durationSec: 40,
    icon: <Smile className="w-5 h-5 text-[#c9b7ff]" />,
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
    title: 'Descanso visual 20-20-20',
    category: 'Ojos',
    durationSec: 30,
    icon: <Eye className="w-5 h-5 text-[#7dd3fc]" />,
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
    title: 'Abre pecho y hombros',
    category: 'Espalda alta',
    durationSec: 40,
    icon: <Activity className="w-5 h-5 text-[#fdba74]" />,
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
    title: 'Muñecas y dedos',
    category: 'Teclado y mouse',
    durationSec: 40,
    icon: <Sparkles className="w-5 h-5 text-[#6ee7b7]" />,
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
    title: 'Agua y respiración',
    category: 'Energía',
    durationSec: 30,
    icon: <Droplets className="w-5 h-5 text-[#93c5fd]" />,
    instructions: [
      'Toma un buen vaso o termo de agua fresca y bebe con calma.',
      'Inhala profundo en 4 tiempos inflando el abdomen.',
      'Sostén el aire 4 tiempos y exhala lentamente por la boca en 6 tiempos.',
      '¡Listo para retomar con mente fresca y cuerpo ligero!'
    ],
    benefit: 'Rehidrata neuronas, baja pulsaciones cardíacas y renueva la concentración.'
  }
];

/**
 * Pausa activa guiada por ECO: una tarjeta que sale de la mascota (no un modal que tapa la
 * pantalla). No bloquea nada, se puede cerrar con Esc y muestra un ejercicio a la vez.
 */
export const ActiveBreakModal: React.FC<ActiveBreakModalProps> = ({ isOpen, onClose, onComplete, style }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(EXERCISES_3MIN[0].durationSec);
  const [isCompleted, setIsCompleted] = useState(false);
  const completedRef = useRef(false);

  const currentExercise = EXERCISES_3MIN[currentStepIndex];

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

  const finish = () => {
    setIsCompleted(true);
    setIsRunning(false);
    if (!completedRef.current) {
      completedRef.current = true;
      playStepChime();
      onComplete?.();
    }
  };

  const goTo = (index: number) => {
    setCurrentStepIndex(index);
    setTimeLeft(EXERCISES_3MIN[index].durationSec);
  };

  // Reinicia al abrir
  useEffect(() => {
    if (isOpen) {
      completedRef.current = false;
      setCurrentStepIndex(0);
      setIsRunning(true);
      setIsCompleted(false);
      setTimeLeft(EXERCISES_3MIN[0].durationSec);
    }
  }, [isOpen]);

  // Cuenta regresiva
  useEffect(() => {
    if (!isOpen || !isRunning || isCompleted) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [isOpen, isRunning, isCompleted]);

  // Al llegar a cero, siguiente ejercicio o fin
  useEffect(() => {
    if (!isOpen || isCompleted || timeLeft > 0) return;
    if (currentStepIndex < EXERCISES_3MIN.length - 1) {
      playStepChime();
      goTo(currentStepIndex + 1);
    } else {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Esc cierra
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
  const stepProgress = 1 - timeLeft / currentExercise.durationSec;
  const R = 22;
  const C = 2 * Math.PI * R;

  const position: React.CSSProperties = style ?? { position: 'fixed', right: 24, bottom: 180, width: 340, zIndex: 55 };

  return (
    <div
      role="dialog"
      aria-label="Pausa activa con ECO"
      style={position}
      className="bg-[#140b24]/95 text-white rounded-2xl p-4 border border-[#8a4dff]/50 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150 font-sans select-none overflow-y-auto"
    >
      {/* Encabezado: ECO acompaña */}
      <div className="flex items-center gap-3">
        <img
          src={isCompleted ? buckyCelebratingImg : buckyRestingImg}
          alt=""
          className="w-12 h-12 object-contain drop-shadow-md shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-[#d4ff4a]">Pausa activa · 3 min</p>
          <p className="text-xs text-white/80 leading-snug">
            {isCompleted ? '¡Lo lograste! Volvemos con energía.' : 'Hazlo conmigo, yo llevo el tiempo.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white cursor-pointer self-start"
          title="Cerrar (Esc)"
          aria-label="Cerrar pausa activa"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progreso por ejercicio */}
      <div className="flex gap-1 mt-3" aria-hidden="true">
        {EXERCISES_3MIN.map((ex, i) => (
          <div key={ex.id} className="h-1 flex-1 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full bg-[#d4ff4a] transition-all duration-1000 ease-linear"
              style={{ width: `${isCompleted || i < currentStepIndex ? 100 : i === currentStepIndex ? stepProgress * 100 : 0}%` }}
            />
          </div>
        ))}
      </div>

      {isCompleted ? (
        <div className="pt-4 space-y-3 text-center">
          <p className="text-sm font-bold">Cuello, ojos y muñecas te lo agradecen 💜</p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#d4ff4a] hover:bg-[#c5f03a] text-[#140b24] text-xs font-bold cursor-pointer"
          >
            Volver a lo mío
          </button>
        </div>
      ) : (
        <div className="pt-3 space-y-3">
          {/* Ejercicio actual + tiempo */}
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-white/60 flex items-center gap-1.5">
                <span className="shrink-0">{currentExercise.icon}</span>
                {currentStepIndex + 1} de {EXERCISES_3MIN.length} · {currentExercise.category}
              </p>
              <h4 className="text-sm font-bold mt-0.5">{currentExercise.title}</h4>
            </div>
            <div className="relative w-14 h-14 shrink-0" aria-label={`Quedan ${formatSeconds(timeLeft)}`}>
              <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
                <circle
                  cx="28"
                  cy="28"
                  r={R}
                  fill="none"
                  stroke="#d4ff4a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - stepProgress)}
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold">
                {formatSeconds(timeLeft)}
              </span>
            </div>
          </div>

          <ol className="space-y-1.5 text-xs text-white/85 leading-relaxed">
            {currentExercise.instructions.map((inst, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-4 h-4 mt-0.5 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span>{inst}</span>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-[#c9b7ff]">{currentExercise.benefit}</p>

          {/* Controles */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={currentStepIndex === 0}
              onClick={() => goTo(Math.max(0, currentStepIndex - 1))}
              className="p-2 rounded-xl border border-white/15 text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Ejercicio anterior"
              aria-label="Ejercicio anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 py-2 rounded-xl bg-[#d4ff4a] hover:bg-[#c5f03a] text-[#140b24] text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Pausar' : 'Reanudar'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentStepIndex < EXERCISES_3MIN.length - 1) {
                  playStepChime();
                  goTo(currentStepIndex + 1);
                } else {
                  finish();
                }
              }}
              className="px-3 py-2 rounded-xl border border-white/15 text-white text-xs font-bold hover:bg-white/10 cursor-pointer flex items-center gap-1"
            >
              {currentStepIndex === EXERCISES_3MIN.length - 1 ? 'Terminar' : 'Siguiente'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
