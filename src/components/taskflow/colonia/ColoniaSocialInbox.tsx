/**
 * ============================================================================
 * COLONIA SOCIAL INBOX · RETOS COMO MENSAJES DE JUEGO (NO TABLA CORPORATIVA)
 * ============================================================================
 * Diseño tipo buzón social de retos:
 * 1. Retos recibidos (Oscar · Torre de Cedro · 85 pts -> [ Jugar ])
 * 2. Esperando respuesta (Cata · Torre · 100 pts -> ⏳)
 * 3. Historial mínimo de revanchas (Paola 106 vs Oscar 85 -> [ Revancha ])
 */

import React from 'react';
import { ColonyChallenge, TeammateOption } from './types';
import { Swords, X, RotateCcw, Clock, Plus, Play, CheckCircle2 } from 'lucide-react';
import { playTapSound } from './coloniaAudio';

interface ColoniaSocialInboxProps {
  isOpen: boolean;
  onClose: () => void;
  receivedChallenges: ColonyChallenge[];
  sentChallenges: ColonyChallenge[];
  historyChallenges: ColonyChallenge[];
  activeUserId: string;
  onPlayChallenge: (challenge: ColonyChallenge) => void;
  onRematch: (oldChallenge: ColonyChallenge) => void;
  onOpenNewChallenge: () => void;
}

export const ColoniaSocialInbox: React.FC<ColoniaSocialInboxProps> = ({
  isOpen,
  onClose,
  receivedChallenges,
  sentChallenges,
  historyChallenges,
  activeUserId,
  onPlayChallenge,
  onRematch,
  onOpenNewChallenge
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#120824] border border-[#8a4dff]/60 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#501f92] flex items-center justify-center text-sm shadow-sm">
              ⚔️
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Retos del Equipo</span>
                {receivedChallenges.length > 0 && (
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-[#d4ff4a] text-[#120822]">
                    {receivedChallenges.length} {receivedChallenges.length === 1 ? 'nuevo' : 'nuevos'}
                  </span>
                )}
              </h3>
              <span className="text-[11px] text-[#c9b7ff]">Micro-pausas de 15 segundos entre compañeros</span>
            </div>
          </div>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Cerrar retos"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-5 overflow-y-auto pr-1 flex-1">
          {/* SECCIÓN 1: RETOS RECIBIDOS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
              <span>⚔️ Retos por responder</span>
              <span className="text-[#d4ff4a] font-mono">{receivedChallenges.length}</span>
            </div>

            {receivedChallenges.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-white/5 border border-white/5 space-y-1.5 text-xs text-white/60">
                <p>No tienes retos pendientes por responder.</p>
                <button
                  onClick={() => {
                    playTapSound();
                    onOpenNewChallenge();
                  }}
                  className="text-[#d4ff4a] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>¡Toma la iniciativa y desafía a alguien!</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {receivedChallenges.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-[#501f92]/40 via-[#1c0e38] to-white/5 border border-[#d4ff4a]/60 flex items-center justify-between gap-3 animate-in fade-in"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${ch.challengerAvatarBg} flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md`}>
                        {ch.challengerInitials}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs sm:text-sm font-black text-white truncate">
                          {ch.challengerName}
                        </h4>
                        <div className="text-[11px] text-[#c9b7ff] flex items-center gap-1 font-medium">
                          <span>{ch.gameId === 'torre' ? '🌿 Torre de Cedro' : '⚡ Reflejos'}</span>
                          <span>·</span>
                          <strong className="text-[#d4ff4a] font-mono">{ch.challengerScore} pts</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playTapSound();
                        onPlayChallenge(ch);
                      }}
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#d4ff4a] to-[#4be5ff] text-[#120822] text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-[1.03] active:scale-95 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#120822]" />
                      <span>Jugar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: ESPERANDO RESPUESTA (ENVIADOS) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-white/80 uppercase tracking-wider">
              <span>⏳ Esperando respuesta</span>
              <span className="text-white/50 font-mono">{sentChallenges.length}</span>
            </div>

            {sentChallenges.length === 0 ? (
              <div className="p-3 text-center rounded-xl bg-white/5 text-xs text-white/50">
                No tienes retos esperando respuesta.
              </div>
            ) : (
              <div className="space-y-1.5">
                {sentChallenges.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-7 h-7 rounded-lg ${ch.challengedAvatarBg} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                        {ch.challengedInitials}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-white truncate block">{ch.challengedName}</span>
                        <span className="text-[10px] text-white/50">
                          {ch.gameId === 'torre' ? 'Torre de Cedro' : 'Reflejos'} · {ch.challengerScore} pts
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#c9b7ff] bg-white/5 px-2 py-0.5 rounded-md font-mono shrink-0">
                      Esperando
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN 3: HISTORIAL & REVANCHAS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-white/80 uppercase tracking-wider">
              <span>🏆 Retos recientes & Revanchas</span>
              <span className="text-white/50 font-mono">{historyChallenges.length}</span>
            </div>

            {historyChallenges.length === 0 ? (
              <div className="p-3 text-center rounded-xl bg-white/5 text-xs text-white/50">
                Aún no hay retos cerrados.
              </div>
            ) : (
              <div className="space-y-1.5">
                {historyChallenges.slice(0, 5).map((ch) => {
                  const isWinner = ch.winnerUserId === activeUserId;
                  const diff = Math.abs(ch.challengerScore - (ch.challengedScore || 0));

                  return (
                    <div
                      key={ch.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{isWinner ? '🏆' : '⚔️'}</span>
                          <span>{ch.challengerName.split(' ')[0]} vs {ch.challengedName.split(' ')[0]}</span>
                        </div>
                        <span className="text-[10px] text-white/50 font-mono">
                          {ch.challengerName.split(' ')[0]}: {ch.challengerScore} pts · {ch.challengedName.split(' ')[0]}: {ch.challengedScore} pts
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          playTapSound();
                          onRematch(ch);
                        }}
                        className="text-[11px] text-[#d4ff4a] hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revancha</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer con botón para enviar nuevo reto */}
        <div className="pt-2 border-t border-white/10 shrink-0">
          <button
            onClick={() => {
              playTapSound();
              onOpenNewChallenge();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#501f92] hover:bg-[#6027ae] text-white text-xs font-bold border border-[#8a4dff] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#d4ff4a]" />
            <span>Retar a un compañero del equipo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
