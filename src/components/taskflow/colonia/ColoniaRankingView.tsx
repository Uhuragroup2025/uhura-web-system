/**
 * ============================================================================
 * COLONIA RANKING VIEW · RANKING VISUAL, ASPIRACIONAL Y HUMANO
 * ============================================================================
 * Clasificación semanal simple, sin tablas corporativas pesadas:
 * - Podio visual limpio (🥇 Diego 120, 🥈 Paola 100, 🥉 Cata 95)
 * - Posición del usuario si está más abajo (#8 · 62 pts)
 * - Toggle simple entre Torre de Cedro y Reflejos de Nenúfar
 */

import React, { useState } from 'react';
import { ColonyGameId, WeeklyLeaderboardEntry } from './types';
import { Trophy, X, Play } from 'lucide-react';
import { playTapSound } from './coloniaAudio';

interface ColoniaRankingViewProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyBoards: Record<ColonyGameId, WeeklyLeaderboardEntry[]>;
  initialGame?: ColonyGameId;
  onPlayGame: (gameId: ColonyGameId) => void;
  activeUserId: string;
}

export const ColoniaRankingView: React.FC<ColoniaRankingViewProps> = ({
  isOpen,
  onClose,
  weeklyBoards,
  initialGame = 'torre',
  onPlayGame,
  activeUserId
}) => {
  const [selectedGame, setSelectedGame] = useState<ColonyGameId>(initialGame);

  if (!isOpen) return null;

  const currentBoard = weeklyBoards[selectedGame] || [];
  const top1 = currentBoard[0];
  const top2 = currentBoard[1];
  const top3 = currentBoard[2];

  // Encuentra la posición del usuario
  const userIndex = currentBoard.findIndex(
    (e) => e.userId === activeUserId || e.highlight
  );
  const userEntry = userIndex !== -1 ? currentBoard[userIndex] : null;
  const isUserInTop3 = userIndex >= 0 && userIndex < 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#120824] border border-[#8a4dff]/60 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#501f92] flex items-center justify-center text-sm shadow-sm">
              🏆
            </div>
            <div>
              <h3 className="text-base font-black text-white">Esta Semana en La Colonia</h3>
              <span className="text-[11px] text-[#c9b7ff]">Récords semanales sin acumulación</span>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ranking"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Juego */}
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => {
              playTapSound();
              setSelectedGame('torre');
            }}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedGame === 'torre'
                ? 'bg-[#501f92] text-[#d4ff4a] shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>🌿 Torre de Cedro</span>
          </button>
          <button
            onClick={() => {
              playTapSound();
              setSelectedGame('nenufar');
            }}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedGame === 'nenufar'
                ? 'bg-[#501f92] text-[#4be5ff] shadow-xs'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <span>⚡ Reflejos Nenúfar</span>
          </button>
        </div>

        {/* Visual Podio Top 3 */}
        <div className="grid grid-cols-3 gap-2 pt-2 items-end">
          {/* #2 PUESTO */}
          <div className="flex flex-col items-center">
            {top2 ? (
              <div className={`w-full p-2.5 rounded-2xl flex flex-col items-center border transition-all ${top2.highlight ? 'bg-[#501f92]/50 border-[#d4ff4a]' : 'bg-white/5 border-white/10'}`}>
                <span className="text-base mb-1">🥈</span>
                <span className="text-xs font-bold text-white truncate max-w-full">
                  {top2.name.split(' ')[0]}
                </span>
                <span className="text-sm font-mono font-black text-[#d4ff4a]">
                  {top2.score}
                </span>
              </div>
            ) : (
              <div className="w-full h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xs text-white/30">
                -
              </div>
            )}
          </div>

          {/* #1 PUESTO (Centro más alto) */}
          <div className="flex flex-col items-center">
            {top1 ? (
              <div className={`w-full p-3 rounded-2xl flex flex-col items-center border transition-all -translate-y-2 shadow-lg ${top1.highlight ? 'bg-[#501f92]/70 border-[#d4ff4a]' : 'bg-gradient-to-b from-[#501f92]/40 to-white/5 border-[#d4ff4a]/60'}`}>
                <span className="text-xl mb-1">🥇</span>
                <span className="text-xs font-black text-white truncate max-w-full">
                  {top1.name.split(' ')[0]}
                </span>
                <span className="text-base font-mono font-black text-[#d4ff4a]">
                  {top1.score}
                </span>
              </div>
            ) : (
              <div className="w-full h-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xs text-white/30">
                -
              </div>
            )}
          </div>

          {/* #3 PUESTO */}
          <div className="flex flex-col items-center">
            {top3 ? (
              <div className={`w-full p-2.5 rounded-2xl flex flex-col items-center border transition-all ${top3.highlight ? 'bg-[#501f92]/50 border-[#d4ff4a]' : 'bg-white/5 border-white/10'}`}>
                <span className="text-base mb-1">🥉</span>
                <span className="text-xs font-bold text-white truncate max-w-full">
                  {top3.name.split(' ')[0]}
                </span>
                <span className="text-sm font-mono font-black text-[#d4ff4a]">
                  {top3.score}
                </span>
              </div>
            ) : (
              <div className="w-full h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xs text-white/30">
                -
              </div>
            )}
          </div>
        </div>

        {/* Lista visual siguiente (#4 en adelante) */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {currentBoard.slice(3).map((entry, idx) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                entry.highlight
                  ? 'bg-[#501f92]/40 border-[#d4ff4a]/60 text-white font-bold'
                  : 'bg-white/5 border-white/5 text-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-white/50 w-5">#{idx + 4}</span>
                <span>{entry.name.split(' ')[0]}</span>
                {entry.highlight && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#d4ff4a] text-[#120822]">
                    Tú
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-[#d4ff4a]">{entry.score} pts</span>
            </div>
          ))}

          {/* Si el usuario no está en el top visible ni en el top 3, mostrar su pin */}
          {userEntry && !isUserInTop3 && userIndex >= 3 + currentBoard.slice(3).length && (
            <div className="flex items-center justify-between p-2 rounded-xl text-xs border bg-[#501f92]/40 border-[#d4ff4a] text-white font-bold mt-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#d4ff4a]">#{userIndex + 1}</span>
                <span>Tú</span>
              </div>
              <span className="font-mono text-[#d4ff4a]">{userEntry.score} pts</span>
            </div>
          )}
        </div>

        {/* Acción para jugar directamente */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => {
              playTapSound();
              onClose();
              onPlayGame(selectedGame);
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4ff4a] to-[#4be5ff] text-[#120822] text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
          >
            <Play className="w-3.5 h-3.5 fill-[#120822]" />
            <span>Jugar para mejorar mi marca ({selectedGame === 'torre' ? 'Torre' : 'Nenúfar'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
