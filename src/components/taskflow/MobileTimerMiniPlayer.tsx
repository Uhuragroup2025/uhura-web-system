import React, { useState, useEffect } from 'react';
import { ActiveTimerState } from './types';
import { Square, ChevronRight, Clock } from 'lucide-react';

interface MobileTimerMiniPlayerProps {
  activeTimer: ActiveTimerState | null;
  onPauseResumeTimer?: () => void;
  onStopTimer: () => void;
  onOpenTaskDetail?: (taskId: string) => void;
}

export const MobileTimerMiniPlayer: React.FC<MobileTimerMiniPlayerProps> = ({
  activeTimer,
  onStopTimer,
  onOpenTaskDetail
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!activeTimer) {
      setSeconds(0);
      return;
    }

    setSeconds(activeTimer.elapsedSeconds || 0);

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  if (!activeTimer) return null;

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside
      id="mobile-timer-mini-player"
      aria-label="Cronómetro activo"
      className="md:hidden fixed bottom-[66px] left-3 right-3 z-35 bg-[#140b24] border border-[#8a4dff]/40 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Indicator & Task Info (Clickable) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenTaskDetail && activeTimer.taskId) {
              onOpenTaskDetail(activeTimer.taskId);
            }
          }}
          className="flex-1 min-w-0 text-left flex items-center gap-2.5 cursor-pointer group"
          title="Ver detalle de la tarea"
        >
          {/* Animated Pulse indicator */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#10b981] animate-ping opacity-75" />
            <div className="w-2.5 h-2.5 rounded-full absolute bg-[#10b981]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#c9b7ff] truncate">
                {activeTimer.clientName || 'Orbit'} · {activeTimer.projectName || 'Proyecto'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white truncate group-hover:text-[#d4ff4a] transition-colors">
              {activeTimer.taskTitle}
            </h4>
          </div>
        </button>

        {/* Center: Live Counter */}
        <div className="shrink-0 font-mono text-xs font-extrabold text-[#d4ff4a] bg-[#241344] px-2.5 py-1.5 rounded-xl border border-[#8a4dff]/30 tracking-wider">
          {formatTimer(seconds)}
        </div>

        {/* Right: Controls (Start / Stop model - No Pause) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStopTimer();
            }}
            className="px-3 py-1.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs text-xs font-bold"
            title="Detener y guardar tiempo"
            aria-label="Detener timer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Detener</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
