import React from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';

/**
 * Controles del timer, iguales en toda ECO (10 Nov 2026, ronda 2):
 * - Detenido: ▶ Iniciar y 🕒 Cargar tiempo manual.
 * - Corriendo: punto rojo que parpadea (está grabando), ⏸ Pausar / ▶ Reanudar y ⏹ Detener.
 * Solo íconos, sin textos ni contadores en cero: el nombre de cada acción va en el
 * tooltip y en aria-label. El tiempo transcurrido se ve en el timer del encabezado.
 */

interface Props {
  isRunning: boolean;
  isPaused?: boolean;
  onStart: () => void;
  onStop?: () => void;
  onPauseResume?: () => void;
  onManualLog?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

const Tip: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="relative group">
    {children}
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex px-2.5 py-1 rounded-lg bg-[#0f172a] text-white text-[10px] font-semibold whitespace-nowrap z-50 pointer-events-none shadow-lg">
      {label}
    </div>
  </div>
);

export const TimerControls: React.FC<Props> = ({
  isRunning,
  isPaused = false,
  onStart,
  onStop,
  onPauseResume,
  onManualLog,
  size = 'md',
  className = ''
}) => {
  const pad = size === 'sm' ? 'p-1.5' : 'p-2';
  const icon = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const base = `${pad} rounded-xl border shadow-2xs transition-colors cursor-pointer flex items-center justify-center`;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {isRunning ? (
        <>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${isPaused ? 'bg-[#f59e0b]' : 'bg-[#dc2626] animate-pulse'}`}
            title={isPaused ? 'Timer en pausa' : 'Timer corriendo'}
            aria-hidden="true"
          />
          {onPauseResume && (
            <Tip label={isPaused ? 'Reanudar timer' : 'Pausar timer'}>
              <button
                type="button"
                onClick={onPauseResume}
                aria-label={isPaused ? 'Reanudar timer' : 'Pausar timer'}
                className={`${base} ${isPaused ? 'bg-[#10b981] hover:bg-[#059669] border-[#059669] text-white' : 'bg-[#f59e0b] hover:bg-[#d97706] border-[#d97706] text-white'}`}
              >
                {isPaused ? <Play className={`${icon} fill-current`} /> : <Pause className={`${icon} fill-current`} />}
              </button>
            </Tip>
          )}
          {onStop && (
            <Tip label="Detener y registrar tiempo">
              <button
                type="button"
                onClick={onStop}
                aria-label="Detener timer"
                className={`${base} bg-[#dc2626] hover:bg-[#b91c1c] border-[#b91c1c] text-white`}
              >
                <Square className={`${icon} fill-current`} />
              </button>
            </Tip>
          )}
        </>
      ) : (
        <Tip label="Iniciar timer">
          <button
            type="button"
            onClick={onStart}
            aria-label="Iniciar timer"
            className={`${base} bg-[#501f92] hover:bg-[#381566] border-[#501f92] text-white`}
          >
            <Play className={`${icon} fill-current`} />
          </button>
        </Tip>
      )}
      {onManualLog && (
        <Tip label="Cargar tiempo manual">
          <button
            type="button"
            onClick={onManualLog}
            aria-label="Cargar tiempo manual"
            className={`${base} bg-white hover:bg-[#f8fafc] border-[#e2e8f0] hover:border-[#8a4dff]/40 text-[#501f92]`}
          >
            <Clock className={icon} />
          </button>
        </Tip>
      )}
    </div>
  );
};
