/**
 * ============================================================================
 * COLONIA MINIGAMES · MICRO-PAUSAS ULTRA RÁPIDAS (15 SEGUNDOS)
 * ============================================================================
 * 
 * Dos microjuegos de 15 segundos enfocados en desconexión ágil y retos de equipo:
 * 1. 🌿 La Torre de Cedro (timing / precisión)
 * 2. ⚡ Reflejos de Nenúfar (reflejos / velocidad)
 * 
 * Flujo de retos nativo en Orbit: Juegas -> Puntuación -> Retar compañero -> Comparación.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ColonyGameId, ColonyChallenge, WeeklyLeaderboardEntry, TeammateOption } from './types';
import { UserItem } from '../types';
import buckyCelebratingImg from '../../../assets/images/bucky_celebrating_cutout.png';
import buckyFocusImg from '../../../assets/images/bucky_focus_cutout.png';
import {
  loadWeeklyLeaderboards,
  recordWeeklyScore,
  createColonyChallenge,
  resolveColonyChallenge
} from './coloniaEngine';
import { playScoreChime, playWinFanfare, playTapSound } from './coloniaAudio';
import {
  X,
  Trophy,
  RotateCcw,
  Clock,
  Play,
  Swords,
  Check,
  CheckCircle2,
  Copy,
  Users,
  Send,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export type { TeammateOption };

interface ColoniaMinigamesProps {
  type: 'torre' | 'nenufar' | 'respiracion' | 'clasificador' | null;
  activeChallenge?: ColonyChallenge | null;
  teammates?: TeammateOption[];
  currentUser?: UserItem;
  onClose: () => void;
  onComplete: (gameId: ColonyGameId, score: number) => void;
  onChallengeCreated?: (newChallenge: ColonyChallenge) => void;
}

export const ColoniaMinigames: React.FC<ColoniaMinigamesProps> = ({
  type,
  activeChallenge = null,
  teammates = [],
  currentUser,
  onClose,
  onComplete,
  onChallengeCreated
}) => {
  if (!type) return null;

  // Normalizar id del juego: 'respiracion' -> 'torre', 'clasificador' -> 'nenufar'
  const normalizedGameId: ColonyGameId =
    type === 'torre' || type === 'respiracion' ? 'torre' : 'nenufar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#120822] border border-[#8a4dff]/50 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-4 max-h-[94vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">
              {normalizedGameId === 'torre' ? '🌿' : '⚡'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {normalizedGameId === 'torre' ? 'La Torre de Cedro' : 'Reflejos de Nenúfar'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4ff4a]/20 text-[#d4ff4a] border border-[#d4ff4a]/40">
                  ⏱️ 15 SEGUNDOS
                </span>
              </div>
              <p className="text-[11px] text-[#c9b7ff]">
                {activeChallenge
                  ? `⚔️ Desafío activo contra ${activeChallenge.challengerName}`
                  : normalizedGameId === 'torre'
                  ? 'Timing y precisión · 15 segundos'
                  : 'Reflejos y velocidad · 15 segundos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del juego */}
        {normalizedGameId === 'torre' ? (
          <TorreCedroMinigame
            activeChallenge={activeChallenge}
            teammates={teammates}
            currentUser={currentUser}
            onComplete={(score) => onComplete('torre', score)}
            onChallengeCreated={onChallengeCreated}
            onClose={onClose}
          />
        ) : (
          <ReflejosNenufarMinigame
            activeChallenge={activeChallenge}
            teammates={teammates}
            currentUser={currentUser}
            onComplete={(score) => onComplete('nenufar', score)}
            onChallengeCreated={onChallengeCreated}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// PANTALLA INTRODUCCIÓN DE JUEGO (1 FRASE + RANKING SEMANAL)
// ============================================================================
interface GameIntroScreenProps {
  title: string;
  oneRule: string;
  gameId: ColonyGameId;
  activeChallenge?: ColonyChallenge | null;
  onStart: () => void;
}

const GameIntroScreen: React.FC<GameIntroScreenProps> = ({
  title,
  oneRule,
  gameId,
  activeChallenge,
  onStart
}) => {
  const leaderboards = loadWeeklyLeaderboards();
  const ranking = leaderboards[gameId] || [];
  const top1 = ranking[0] || { name: 'Diego', score: 120 };
  const userEntry = ranking.find(e => e.highlight);
  const userBest = userEntry ? userEntry.score : 0;
  const leaderScore = top1.score;

  return (
    <div className="space-y-4 py-2 text-center select-none animate-in zoom-in-95 duration-200">
      {/* Banner de reto si viene de un desafío */}
      {activeChallenge && (
        <div className="p-3 rounded-2xl bg-[#501f92]/70 border border-[#d4ff4a] text-center space-y-0.5 animate-in fade-in">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#d4ff4a]">
            ⚔️ Reto activo de {activeChallenge.challengerName}
          </span>
          <p className="text-xs text-white">
            Dejó una marca de <strong className="text-[#d4ff4a] font-mono text-sm">{activeChallenge.challengerScore} pts</strong>. ¿Lo superas?
          </p>
        </div>
      )}

      {/* Título & 1 sola regla estilo mobile limpio */}
      <div className="space-y-1.5 pt-1">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center justify-center gap-2">
          <span>{gameId === 'torre' ? '🌿' : '⚡'}</span>
          <span>{gameId === 'torre' ? 'TORRE DE CEDRO' : 'REFLEJOS DE NENÚFAR'}</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#c9b7ff] max-w-xs mx-auto font-medium leading-relaxed">
          {oneRule}
        </p>
      </div>

      {/* 15 s grande & destacado */}
      <div className="py-1">
        <span className="inline-block font-mono text-3xl font-black text-[#d4ff4a] px-4 py-1 rounded-2xl bg-[#d4ff4a]/10 border border-[#d4ff4a]/30 shadow-inner">
          15 s
        </span>
      </div>

      {/* Récords de referencia rápida */}
      <div className="flex items-center justify-center gap-3 py-1.5 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono max-w-xs mx-auto text-white/80">
        <span>
          Tu récord: <strong className="text-white font-bold">{userBest}</strong>
        </span>
        <span className="text-white/20">·</span>
        <span className="text-[#d4ff4a]">
          Semana: <strong className="text-[#d4ff4a] font-bold">{leaderScore}</strong>
        </span>
      </div>

      {/* Botón Jugar grande tipo mobile */}
      <button
        onClick={() => {
          playTapSound();
          onStart();
        }}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d4ff4a] via-[#4be5ff] to-[#38d4ee] text-[#120822] text-sm sm:text-base font-black tracking-wider uppercase shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5 fill-[#120822]" />
        <span>JUGAR</span>
      </button>

      {/* Mini podio Top 3 discreto al pie */}
      {ranking.length > 0 && (
        <div className="flex items-center justify-center gap-3 text-[11px] text-white/60 pt-1 flex-wrap font-mono">
          {ranking.slice(0, 3).map((r, i) => (
            <span key={r.id} className="flex items-center gap-1">
              <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
              <span className={r.highlight ? 'text-[#d4ff4a] font-bold' : 'text-white/80'}>
                {r.highlight ? 'Tú' : r.name.split(' ')[0]} {r.score}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PANTALLA RESULTADO / GAME OVER: PUNTUACIÓN + RECOMPENSA + RETAR COMPAÑERO
// ============================================================================
interface GameOverScreenProps {
  score: number;
  gameId: ColonyGameId;
  gameName: string;
  activeChallenge?: ColonyChallenge | null;
  teammates?: TeammateOption[];
  currentUser?: UserItem;
  onPlayAgain: () => void;
  onChallengeCreated?: (newChallenge: ColonyChallenge) => void;
  onClaimAndClose: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  gameId,
  gameName,
  activeChallenge,
  teammates = [],
  currentUser,
  onPlayAgain,
  onChallengeCreated,
  onClaimAndClose
}) => {
  const [isChallenging, setIsChallenging] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState<TeammateOption | null>(null);
  const [challengeSentSuccess, setChallengeSentSuccess] = useState<string | null>(null);
  const [copiedSlack, setCopiedSlack] = useState(false);

  // Guardar puntuación semanal y obtener posición
  const activeUserId = currentUser?.id || 'u-2';
  const { rank, isBest, leaderboards } = recordWeeklyScore(
    gameId,
    score,
    activeUserId,
    currentUser?.name ? `${currentUser.name} (Tú)` : 'Paola Monsalve (Tú)',
    currentUser?.jobTitle || currentUser?.officialRole || currentUser?.role || 'Product Lead',
    currentUser?.initials || 'PM',
    currentUser?.avatarBg || 'bg-[#501f92]'
  );
  const userEntry = leaderboards[gameId]?.find(e => e.userId === activeUserId || e.highlight);
  const weeklyBest = userEntry ? userEntry.score : score;
  const top1 = leaderboards[gameId]?.[0] || { name: 'Diego', score: 120 };
  const leaderName = top1.name.split(' ')[0];
  const leaderScore = top1.score;

  // Comparación contra reto si venía de un desafío
  const rivalScore = activeChallenge?.challengerScore ?? null;
  const wonChallenge = rivalScore !== null && score > rivalScore;
  const tiedChallenge = rivalScore !== null && score === rivalScore;
  const lostChallenge = rivalScore !== null && score < rivalScore;
  const diff = rivalScore !== null ? Math.abs(score - rivalScore) : 0;

  // Si se jugó como respuesta a un desafío existente, resolverlo
  useEffect(() => {
    if (activeChallenge && activeChallenge.status === 'pending') {
      resolveColonyChallenge(activeChallenge.id, score);
    }
    // Sonido festivo de recompensa
    if (wonChallenge || isBest || score >= 80) {
      playWinFanfare();
    } else {
      playScoreChime();
    }
  }, []);

  const handleSendChallenge = (teammate: TeammateOption) => {
    setSelectedTeammate(teammate);
    const challengerData = {
      id: activeUserId,
      name: currentUser?.name || 'Paola Monsalve',
      initials: currentUser?.initials || 'PM',
      role: currentUser?.jobTitle || currentUser?.officialRole || currentUser?.role || 'Product Lead',
      avatarBg: currentUser?.avatarBg || 'bg-[#501f92]'
    };

    const { newChallenge } = createColonyChallenge(
      gameId,
      challengerData,
      score,
      {
        id: teammate.id,
        name: teammate.name,
        initials: teammate.initials,
        role: teammate.role,
        avatarBg: teammate.avatarBg
      }
    );

    if (onChallengeCreated) onChallengeCreated(newChallenge);

    setChallengeSentSuccess(`¡Reto enviado a ${teammate.name}! (${score} pts).`);
    setTimeout(() => {
      setIsChallenging(false);
    }, 2000);
  };

  const handleCopySlack = () => {
    const text = `🌿 Reto en Orbit (La Colonia Uhura): ¡Hice ${score} puntos en "${gameName}"! ¿Quién del equipo me supera en 15 segundos? 🦫⚡ Entra a La Colonia y descúbrelo.`;
    navigator.clipboard.writeText(text);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 3000);
  };

  return (
    <div className="relative space-y-4 py-1 text-center animate-in zoom-in-95 duration-200 select-none">
      {/* Confetti festivo sutil */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-2 left-6 w-2 h-2 rounded-full bg-[#d4ff4a] animate-ping opacity-75" />
        <div className="absolute top-4 right-10 w-2.5 h-2.5 rounded-full bg-[#4be5ff] animate-pulse" />
        <div className="absolute top-12 left-1/4 w-1.5 h-1.5 rounded-full bg-[#c9b7ff] animate-bounce" />
        <div className="absolute top-8 right-1/4 w-2 h-2 rounded-full bg-[#f472b6] animate-ping" />
        <div className="absolute top-16 right-8 w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse" />
      </div>

      {/* Si viene de un reto completado */}
      {activeChallenge && rivalScore !== null ? (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4ff4a]/20 text-[#d4ff4a] text-xs font-black border border-[#d4ff4a]/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>RETO COMPLETADO</span>
          </div>

          <div className="flex items-center justify-center gap-6 py-2">
            <div className="text-center">
              <span className="text-xs text-white/70 block">{currentUser?.name?.split(' ')[0] || 'Tú'}</span>
              <span className="text-3xl font-mono font-black text-[#d4ff4a]">{score}</span>
            </div>
            <span className="text-lg font-black text-white/30">vs</span>
            <div className="text-center">
              <span className="text-xs text-white/70 block">{activeChallenge.challengerName.split(' ')[0]}</span>
              <span className="text-3xl font-mono font-black text-white/80">{rivalScore}</span>
            </div>
          </div>

          <p className="text-sm font-bold text-white">
            {wonChallenge
              ? `¡Ganaste por ${diff} ${diff === 1 ? 'punto' : 'puntos'}! 🎉`
              : tiedChallenge
              ? '¡Empate exacto! Misma destreza 🤝'
              : `${activeChallenge.challengerName.split(' ')[0]} ganó por ${diff} ${diff === 1 ? 'punto' : 'puntos'}.`}
          </p>
        </div>
      ) : (
        /* Pantalla de resultado estándar cuidada */
        <div className="space-y-2.5">
          <div className="text-3xl animate-bounce">
            {gameId === 'torre' ? '🌿' : '⚡'}
          </div>

          <div className="text-5xl font-mono font-black text-[#d4ff4a] tracking-tight">
            {score}
          </div>

          {isBest ? (
            <div className="inline-block px-3 py-1 rounded-full bg-[#d4ff4a]/20 border border-[#d4ff4a] text-[#d4ff4a] text-xs font-black tracking-wider uppercase animate-pulse">
              ¡NUEVA MEJOR MARCA!
            </div>
          ) : (
            <div className="text-xs text-white/60 font-medium">
              Tu récord: <strong className="text-white font-mono">{weeklyBest}</strong>
            </div>
          )}

          {/* Posición semanal */}
          <div className="text-xs text-[#c9b7ff]">
            Semana: <strong className="text-[#d4ff4a] font-bold font-mono">#{rank}</strong>
          </div>

          {/* Bucky como host narrativo */}
          <div className="max-w-xs mx-auto pt-1 flex items-center justify-center gap-2.5 bg-black/30 p-2.5 rounded-2xl border border-white/5">
            <img
              src={buckyCelebratingImg}
              alt="Bucky celebrando"
              className="w-10 h-10 object-contain shrink-0"
            />
            <p className="text-xs text-white/90 text-left font-medium leading-snug">
              {score >= leaderScore
                ? '¡Eres la marca número 1 de la semana! Bucky está orgulloso 🦫👑'
                : `Te faltaron ${leaderScore - score} pts para superar a ${leaderName} 👀`}
            </p>
          </div>
        </div>
      )}

      {/* Selector de compañeros para retar */}
      {!isChallenging ? (
        <div className="pt-2 space-y-2">
          {/* Botón Primario: Retar a alguien */}
          <button
            onClick={() => {
              playTapSound();
              setIsChallenging(true);
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d4ff4a] via-[#4be5ff] to-[#38d4ee] text-[#120822] text-sm font-black tracking-wider uppercase shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Swords className="w-4 h-4 text-[#120822]" />
            <span>{activeChallenge ? 'PEDIR REVANCHA / RETAR' : 'RETAR A ALGUIEN'}</span>
          </button>

          {/* Botón Secundario: Revancha / Otra ronda */}
          <button
            onClick={() => {
              playTapSound();
              onPlayAgain();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-white/80 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 hover:bg-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revancha / Jugar de nuevo</span>
          </button>
        </div>
      ) : (
        /* Grilla limpia de compañeros canónicos para retar */
        <div className="p-4 rounded-2xl bg-[#140b24] border border-[#d4ff4a]/60 space-y-3 animate-in fade-in text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-[#d4ff4a]" />
              <h4 className="text-xs font-bold text-white">¿A quién quieres retar con tus {score} pts?</h4>
            </div>
            <button
              onClick={() => setIsChallenging(false)}
              className="text-white/60 hover:text-white text-xs cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          {challengeSentSuccess ? (
            <div className="p-3 rounded-xl bg-[#166534]/50 border border-[#d4ff4a] text-center text-xs text-white font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d4ff4a]" />
              <span>{challengeSentSuccess}</span>
            </div>
          ) : teammates.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-white/5 border border-white/5 text-xs text-white/60">
              No hay otros colaboradores activos disponibles en Equipo & Accesos para retar.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {teammates.map((mate) => (
                <button
                  key={mate.id}
                  onClick={() => {
                    playTapSound();
                    handleSendChallenge(mate);
                  }}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-[#501f92]/40 border border-white/10 hover:border-[#d4ff4a] text-left transition-all cursor-pointer group flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md ${mate.avatarBg} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                      {mate.initials}
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-[#d4ff4a] truncate">
                      {mate.name.split(' ')[0]}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50 truncate">{mate.role}</span>
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono text-[#d4ff4a]">
                    <span>Retar</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enlace discreto para volver al hábitat */}
      <div className="pt-1 flex items-center justify-center gap-4 text-xs">
        <button
          onClick={handleCopySlack}
          className="text-white/50 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Copy className="w-3 h-3 text-[#c9b7ff]" />
          <span>{copiedSlack ? '¡Copiado!' : 'Copiar para Slack'}</span>
        </button>
        <span className="text-white/20">·</span>
        <button
          onClick={() => {
            playTapSound();
            onClaimAndClose();
          }}
          className="text-[#d4ff4a] hover:underline font-bold transition-colors cursor-pointer"
        >
          Volver a La Colonia
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 1. MINIJUEGO: LA TORRE DE CEDRO (15s)
// ============================================================================
interface MinigameSubProps {
  activeChallenge?: ColonyChallenge | null;
  teammates?: TeammateOption[];
  currentUser?: UserItem;
  onComplete: (score: number) => void;
  onChallengeCreated?: (newChallenge: ColonyChallenge) => void;
  onClose: () => void;
}

const TorreCedroMinigame: React.FC<MinigameSubProps> = ({
  activeChallenge,
  teammates = [],
  currentUser,
  onComplete,
  onChallengeCreated,
  onClose
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [movingPos, setMovingPos] = useState(50);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [tower, setTower] = useState<number[]>([50]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Timer de 15 segundos
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Movimiento oscilante del tronco
  useEffect(() => {
    if (gameState !== 'playing') return;

    const speed = 25;
    const interval = setInterval(() => {
      setMovingPos((prev) => {
        let next = prev + direction * 2.5;
        if (next >= 85) {
          setDirection(-1);
          next = 85;
        } else if (next <= 15) {
          setDirection(1);
          next = 15;
        }
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [gameState, direction]);

  const handleDrop = () => {
    if (gameState !== 'playing') return;

    const lastBlock = tower[tower.length - 1];
    const diff = Math.abs(movingPos - lastBlock);

    if (diff < 15) {
      const perfect = diff < 5;
      const pts = perfect ? 3 : 1;
      setScore((s) => s + pts);
      setTower((prev) => [...prev.slice(-6), movingPos]);
      setFeedback(perfect ? '¡PERFECTO! +3' : '¡ENCAJÓ! +1');
    } else {
      setFeedback('¡Ups, tambaleó!');
    }

    setTimeout(() => setFeedback(null), 600);
  };

  if (gameState === 'intro') {
    return (
      <GameIntroScreen
        title="La Torre de Cedro"
        oneRule="Toca la pantalla cuando el tronco esté alineado con la base para soltarlo y apilarlo lo más alto posible."
        gameId="torre"
        activeChallenge={activeChallenge}
        onStart={() => {
          setScore(0);
          setTimeLeft(15);
          setTower([50]);
          setGameState('playing');
        }}
      />
    );
  }

  if (gameState === 'gameover') {
    return (
      <GameOverScreen
        score={score}
        gameId="torre"
        gameName="La Torre de Cedro"
        activeChallenge={activeChallenge}
        teammates={teammates}
        currentUser={currentUser}
        onPlayAgain={() => {
          setScore(0);
          setTimeLeft(15);
          setTower([50]);
          setGameState('playing');
        }}
        onChallengeCreated={onChallengeCreated}
        onClaimAndClose={() => {
          onComplete(score);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="space-y-3 select-none" onClick={handleDrop}>
      {/* HUD del juego */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#d4ff4a] animate-pulse" />
          <span className="font-mono font-bold text-white">
            Tiempo: <strong className="text-[#d4ff4a] text-sm">{timeLeft}s</strong>
          </span>
        </div>
        <div className="font-mono font-black text-white text-sm">
          Pisos: <strong className="text-[#d4ff4a]">{score}</strong>
        </div>
      </div>

      {/* Área de la Torre */}
      <div className="relative h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-[#1b0d33] via-[#140b24] to-[#0a0414] border-2 border-[#8a4dff]/40 overflow-hidden flex flex-col justify-between p-4 cursor-pointer shadow-inner">
        {/* Tronco móvil superior */}
        <div className="relative h-10 w-full">
          <div
            style={{ left: `${movingPos}%` }}
            className="absolute -translate-x-1/2 top-0 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] border-2 border-[#fde68a] text-white font-mono text-xs font-black shadow-lg"
          >
            🪵 CEDRO
          </div>
        </div>

        {/* Feedback visual */}
        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="text-xl sm:text-2xl font-black text-[#d4ff4a] bg-black/70 px-4 py-2 rounded-2xl border border-[#d4ff4a] animate-in zoom-in-50">
              {feedback}
            </span>
          </div>
        )}

        {/* Base de la torre */}
        <div className="relative h-40 w-full flex flex-col-reverse items-center justify-start pb-2">
          {tower.map((pos, idx) => (
            <div
              key={idx}
              className="absolute -translate-x-1/2 px-4 py-1.5 rounded-xl bg-[#78350f] border border-[#d97706] text-white font-mono text-[10px] font-bold shadow-md"
              style={{
                left: `${pos}%`,
                bottom: `${idx * 24}px`
              }}
            >
              🪵 PISO {idx + 1}
            </div>
          ))}
          <div className="absolute bottom-0 w-3/4 h-2 bg-[#501f92] rounded-full" />
        </div>
      </div>

      <p className="text-[11px] text-center text-[#c9b7ff]">
        👆 Toca cualquier parte de la pantalla para soltar el tronco
      </p>
    </div>
  );
};

// ============================================================================
// 2. MINIJUEGO: REFLEJOS DE NENÚFAR (15s)
// ============================================================================
const ReflejosNenufarMinigame: React.FC<MinigameSubProps> = ({
  activeChallenge,
  teammates = [],
  currentUser,
  onComplete,
  onChallengeCreated,
  onClose
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [activePad, setActivePad] = useState<number>(0);

  // Timer de 15 segundos
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Cambiar nenúfar activo
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setActivePad((prev) => {
        let next = Math.floor(Math.random() * 4);
        while (next === prev) {
          next = Math.floor(Math.random() * 4);
        }
        return next;
      });
    }, 750);

    return () => clearInterval(interval);
  }, [gameState]);

  const handlePadClick = (index: number) => {
    if (gameState !== 'playing') return;

    if (index === activePad) {
      setScore((s) => s + 1);
      let next = Math.floor(Math.random() * 4);
      while (next === index) {
        next = Math.floor(Math.random() * 4);
      }
      setActivePad(next);
    }
  };

  if (gameState === 'intro') {
    return (
      <GameIntroScreen
        title="Reflejos de Nenúfar"
        oneRule="Toca la hoja donde aparezca Bucky 🦫 tan rápido como puedas antes de que salte a otra."
        gameId="nenufar"
        activeChallenge={activeChallenge}
        onStart={() => {
          setScore(0);
          setTimeLeft(15);
          setActivePad(Math.floor(Math.random() * 4));
          setGameState('playing');
        }}
      />
    );
  }

  if (gameState === 'gameover') {
    return (
      <GameOverScreen
        score={score}
        gameId="nenufar"
        gameName="Reflejos de Nenúfar"
        activeChallenge={activeChallenge}
        teammates={teammates}
        currentUser={currentUser}
        onPlayAgain={() => {
          setScore(0);
          setTimeLeft(15);
          setActivePad(Math.floor(Math.random() * 4));
          setGameState('playing');
        }}
        onChallengeCreated={onChallengeCreated}
        onClaimAndClose={() => {
          onComplete(score);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="space-y-3 select-none">
      {/* HUD del juego */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#d4ff4a] animate-pulse" />
          <span className="font-mono font-bold text-white">
            Tiempo: <strong className="text-[#d4ff4a] text-sm">{timeLeft}s</strong>
          </span>
        </div>
        <div className="font-mono font-black text-white text-sm">
          Aciertos: <strong className="text-[#4be5ff]">{score}</strong>
        </div>
      </div>

      {/* Cuadrante de Nenúfares (2x2) */}
      <div className="h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-[#0a2f44] to-[#041724] border-2 border-[#38bdf8]/40 p-4 grid grid-cols-2 gap-3.5 shadow-inner">
        {[0, 1, 2, 3].map((idx) => {
          const isActive = idx === activePad;
          return (
            <button
              key={idx}
              onPointerDown={() => handlePadClick(idx)}
              className={`rounded-2xl flex flex-col items-center justify-center p-3 transition-all transform cursor-pointer border-2 select-none ${
                isActive
                  ? 'bg-gradient-to-br from-[#166534] to-[#14532d] border-[#d4ff4a] scale-105 shadow-xl shadow-[#d4ff4a]/20 animate-pulse'
                  : 'bg-[#0f3b2e]/60 border-[#10b981]/20 hover:border-[#10b981]/40'
              }`}
            >
              <span className="text-3xl sm:text-4xl">
                {isActive ? '🦫' : '🪷'}
              </span>
              <span
                className={`text-[10px] font-black uppercase mt-1 ${
                  isActive ? 'text-[#d4ff4a]' : 'text-white/40'
                }`}
              >
                {isActive ? '¡TOCA AQUÍ!' : 'Nenúfar'}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-center text-[#c9b7ff]">
        👆 Reacciona tocando el nenúfar donde salta Bucky
      </p>
    </div>
  );
};
