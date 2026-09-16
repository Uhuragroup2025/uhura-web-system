/**
 * ============================================================================
 * COLONIA MINIGAMES · MICRO-PAUSAS ULTRA RÁPIDAS (15 SEGUNDOS)
 * ============================================================================
 * 
 * Diseñados para ser inmediatos, directos y competitivos con los miembros reales
 * de Uhura Group (Catalina, Oscar, Laura, Camilo, Diego, etc.).
 * 
 * Reglas de diseño:
 * - Se entienden en 1 frase.
 * - Duran exactamente 15 segundos con reloj visual.
 * - Sin tutoriales pesados.
 * - Leaderboard del equipo real y opción directa de retar a un compañero real.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ColonyMinigameType } from './types';
import {
  X,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Trophy,
  Share2,
  Copy,
  Check,
  Flame,
  Clock,
  Play,
  ArrowRight,
  Send,
  Zap,
  Swords
} from 'lucide-react';
import buckyCelebratingImg from '../../../assets/images/bucky_celebrating_cutout.png';
import buckyHoodieHappyImg from '../../../assets/images/bucky_hip_uhura_v3.png';

export interface MinigameTeamScore {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  score: number;
  highlight?: boolean;
}

// RANKING CON EL EQUIPO REAL DE UHURA GROUP
export const REAL_UHURA_LEADERBOARDS: Record<ColonyMinigameType, MinigameTeamScore[]> = {
  vado: [
    { id: 'u-6', name: 'Catalina Tejada', role: 'Directora Comercial', initials: 'CT', avatarBg: 'bg-[#7c3aed]', score: 19 },
    { id: 'u-10', name: 'Oscar Cerpa', role: 'Desarrollador Web Front-End', initials: 'OC', avatarBg: 'bg-[#f59e0b]', score: 16 },
    { id: 'u-you', name: 'Paola Monsalve (Tú)', role: 'Product Lead', initials: 'PM', avatarBg: 'bg-[#501f92]', score: 14, highlight: true },
    { id: 'u-5', name: 'Laura Isabel Gómez', role: 'Digital Designer', initials: 'LG', avatarBg: 'bg-[#0284c7]', score: 12 },
    { id: 'u-14', name: 'Camilo Velez', role: 'Growth Manager', initials: 'CV', avatarBg: 'bg-[#059669]', score: 9 }
  ],
  respiracion: [
    { id: 'u-2', name: 'Diego Cadavid', role: 'Creative lead', initials: 'DC', avatarBg: 'bg-[#dc2626]', score: 120 },
    { id: 'u-you', name: 'Paola Monsalve (Tú)', role: 'Product Lead', initials: 'PM', avatarBg: 'bg-[#501f92]', score: 100, highlight: true },
    { id: 'u-6', name: 'Catalina Tejada', role: 'Directora Comercial', initials: 'CT', avatarBg: 'bg-[#7c3aed]', score: 95 },
    { id: 'u-10', name: 'Oscar Cerpa', role: 'Desarrollador Web Front-End', initials: 'OC', avatarBg: 'bg-[#f59e0b]', score: 85 },
    { id: 'u-11', name: 'Sara Rivera', role: 'Community Manager', initials: 'SR', avatarBg: 'bg-[#ec4899]', score: 75 }
  ],
  clasificador: [
    { id: 'u-5', name: 'Laura Isabel Gómez', role: 'Digital Designer', initials: 'LG', avatarBg: 'bg-[#0284c7]', score: 22 },
    { id: 'u-10', name: 'Oscar Cerpa', role: 'Desarrollador Web Front-End', initials: 'OC', avatarBg: 'bg-[#f59e0b]', score: 18 },
    { id: 'u-you', name: 'Paola Monsalve (Tú)', role: 'Product Lead', initials: 'PM', avatarBg: 'bg-[#501f92]', score: 15, highlight: true },
    { id: 'u-6', name: 'Catalina Tejada', role: 'Directora Comercial', initials: 'CT', avatarBg: 'bg-[#7c3aed]', score: 13 },
    { id: 'u-14', name: 'Camilo Velez', role: 'Growth Manager', initials: 'CV', avatarBg: 'bg-[#059669]', score: 11 }
  ]
};

interface ColoniaMinigamesProps {
  type: ColonyMinigameType | null;
  onClose: () => void;
  onComplete: (type: ColonyMinigameType) => void;
}

export const ColoniaMinigames: React.FC<ColoniaMinigamesProps> = ({
  type,
  onClose,
  onComplete
}) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#120822] border border-[#8a4dff]/50 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">
              {type === 'vado' ? '🪵' : type === 'respiracion' ? '🌿' : '⚡'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {type === 'vado'
                    ? 'El Río Rápido de Bucky'
                    : type === 'respiracion'
                    ? 'La Torre de Cedro'
                    : 'Reflejos de Nenúfar'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4ff4a]/20 text-[#d4ff4a] border border-[#d4ff4a]/40">
                  ⏱️ 15 SEGUNDOS
                </span>
              </div>
              <p className="text-[11px] text-[#c9b7ff]">Reto en equipo · Uhura Group</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Body */}
        {type === 'vado' && <RioRapidoMinigame onComplete={() => onComplete('vado')} onClose={onClose} />}
        {type === 'respiracion' && <TorreCedroMinigame onComplete={() => onComplete('respiracion')} onClose={onClose} />}
        {type === 'clasificador' && <ReflejosNenufarMinigame onComplete={() => onComplete('clasificador')} onClose={onClose} />}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE COMPARTIDO: PANTALLA INICIAL DE RETO Y REGLA ÚNICA
// ============================================================================
interface GameIntroScreenProps {
  title: string;
  oneRule: string;
  gameType: ColonyMinigameType;
  onStart: () => void;
}

const GameIntroScreen: React.FC<GameIntroScreenProps> = ({
  title,
  oneRule,
  gameType,
  onStart
}) => {
  const leaderboard = REAL_UHURA_LEADERBOARDS[gameType];

  return (
    <div className="space-y-4 py-1">
      {/* ¿CÓMO JUGAMOS? EN 1 FRASE */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#501f92]/40 via-[#8a4dff]/20 to-transparent border border-[#8a4dff]/40 space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#d4ff4a] block">
          ¿CÓMO JUGAMOS? (1 SOLA REGLA)
        </span>
        <p className="text-sm sm:text-base font-bold text-white leading-snug">
          {oneRule}
        </p>
        <span className="text-[11px] text-[#c9b7ff] block pt-1">
          Dura exactamente <strong>15 segundos</strong>. Toca la pantalla tan rápido y preciso como puedas.
        </span>
      </div>

      {/* RANKING ACTUAL DEL EQUIPO REAL */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#c9b7ff]">
            <Trophy className="w-4 h-4 text-[#d4ff4a]" />
            <span>Ranking actual de Uhura Group</span>
          </div>
          <span className="text-[10px] text-white/50">Top 5</span>
        </div>

        <div className="space-y-1.5">
          {leaderboard.map((member, idx) => (
            <div
              key={member.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                member.highlight
                  ? 'bg-[#501f92]/40 border-[#d4ff4a]/60 text-white'
                  : 'bg-white/5 border-white/5 text-white/90'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`font-mono text-xs font-bold w-4 text-center ${idx === 0 ? 'text-[#d4ff4a]' : 'text-white/40'}`}>
                  #{idx + 1}
                </span>
                <div className={`w-7 h-7 rounded-lg ${member.avatarBg} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                  {member.initials}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold truncate flex items-center gap-1">
                    <span>{member.name}</span>
                    {member.highlight && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#d4ff4a] text-[#120822]">
                        Tú
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/50 block truncate">{member.role}</span>
                </div>
              </div>

              <div className="font-mono text-xs font-black text-[#d4ff4a] shrink-0 pl-2">
                {member.score} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTÓN GIGANTE JUGAR AHORA */}
      <button
        onClick={onStart}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d4ff4a] to-[#4be5ff] hover:from-[#c2f331] hover:to-[#38d4ee] text-[#120822] text-sm font-black tracking-wide shadow-xl transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4 fill-[#120822]" />
        <span>¡JUGAR AHORA (15 SEGUNDOS)!</span>
      </button>
    </div>
  );
};

// ============================================================================
// COMPONENTE COMPARTIDO: PANTALLA FINAL CON DESAFÍO AL EQUIPO
// ============================================================================
interface GameOverScreenProps {
  score: number;
  gameType: ColonyMinigameType;
  gameName: string;
  onPlayAgain: () => void;
  onClaimAndClose: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  gameType,
  gameName,
  onPlayAgain,
  onClaimAndClose
}) => {
  const leaderboard = REAL_UHURA_LEADERBOARDS[gameType];
  const otherTeammates = leaderboard.filter(m => !m.highlight);
  const [selectedRival, setSelectedRival] = useState<string>(otherTeammates[0]?.name || 'Catalina Tejada');
  const [copied, setCopied] = useState(false);

  const rivalObj = otherTeammates.find(t => t.name === selectedRival) || otherTeammates[0];
  const beatRival = rivalObj && score > rivalObj.score;

  const handleCopyChallenge = () => {
    const text = `🪵 Reto en Orbit (La Colonia Uhura): ¡Hice ${score} puntos en "${gameName}"! @${selectedRival}, ¿crees que puedes superarme en 15 segundos? 🦫⚡ Entra a La Colonia y pruébalo.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-4 py-1 animate-in zoom-in-95 duration-200">
      {/* Puntuación y Recursos Ganados */}
      <div className="text-center p-4 rounded-2xl bg-gradient-to-b from-[#501f92]/60 to-[#1e0e38] border border-[#d4ff4a]/50 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4ff4a]/20 text-[#d4ff4a] text-xs font-bold border border-[#d4ff4a]/30">
          <Trophy className="w-3.5 h-3.5" />
          <span>¡Partida Terminada!</span>
        </div>

        <div className="text-4xl font-mono font-black text-white">
          {score} <span className="text-base text-[#d4ff4a] font-sans font-bold">puntos</span>
        </div>

        <p className="text-xs text-[#c9b7ff]">
          ¡Gran agilidad! Recursos sumados a La Colonia: <strong className="text-white">+2 🪵 Madera</strong> y <strong className="text-white">+1 ⚡ Energía</strong>
        </p>
      </div>

      {/* CAJA DE RETO AL EQUIPO REAL */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Swords className="w-4 h-4 text-[#d4ff4a]" />
          <span>Desafiar a alguien de Uhura Group</span>
        </div>

        <p className="text-[11px] text-white/70">
          Elige a quién retar para defender tu récord en el canal de Slack / chat de equipo:
        </p>

        {/* Botones para seleccionar rival */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {otherTeammates.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedRival(member.name)}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 text-center border ${
                selectedRival === member.name
                  ? 'bg-[#501f92] text-white border-[#d4ff4a] shadow-md scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
              }`}
            >
              <div className={`w-6 h-6 rounded-md ${member.avatarBg} flex items-center justify-center text-[9px] text-white font-bold`}>
                {member.initials}
              </div>
              <span className="truncate w-full text-[11px]">{member.name.split(' ')[0]}</span>
              <span className="text-[9px] text-[#d4ff4a] font-mono">{member.score} pts</span>
            </button>
          ))}
        </div>

        {/* Estado del reto */}
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
          <span className="text-[#c9b7ff]">
            {beatRival
              ? `🔥 ¡Superaste los ${rivalObj.score} pts de ${rivalObj.name}!`
              : `🎯 ${rivalObj.name} tiene ${rivalObj.score} pts. ¿Lo retas a revancha?`}
          </span>
          <span className="text-base">{beatRival ? '👑' : '⚔️'}</span>
        </div>

        {/* Botón Copiar Mensaje para Slack / Chat */}
        <button
          onClick={handleCopyChallenge}
          className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#d4ff4a]" />
              <span className="text-[#d4ff4a]">¡Mensaje de reto copiado al portapapeles!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#d4ff4a]" />
              <span>Copiar reto para {selectedRival} ("¿Puedes superar mis {score} pts?")</span>
            </>
          )}
        </button>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-2.5 pt-1">
        <button
          onClick={onPlayAgain}
          className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Jugar otra vez</span>
        </button>
        <button
          onClick={onClaimAndClose}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4ff4a] to-[#4be5ff] text-[#120822] text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#120822]" />
          <span>Guardar recursos y volver</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 1. JUEGO 1: EL RÍO RÁPIDO DE BUCKY (15s)
// Troncos y orbes bajan flotando. Toca antes de que escapen.
// ============================================================================
const RioRapidoMinigame: React.FC<{ onComplete: () => void; onClose: () => void }> = ({ onComplete, onClose }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<{ id: number; x: number; y: number; type: 'tronco' | 'orbe'; speed: number }[]>([]);
  const nextId = useRef(1);

  // Timer de 15 segundos
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  // Generador de troncos flotando
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawner = setInterval(() => {
      const isOrbe = Math.random() > 0.75;
      setItems(prev => [
        ...prev.slice(-10),
        {
          id: nextId.current++,
          x: Math.floor(Math.random() * 80) + 10,
          y: 0,
          type: isOrbe ? 'orbe' : 'tronco',
          speed: Math.random() * 1.5 + 2
        }
      ]);
    }, 650);

    // Motor de movimiento
    const mover = setInterval(() => {
      setItems(prev =>
        prev
          .map(it => ({ ...it, y: it.y + it.speed }))
          .filter(it => it.y < 95)
      );
    }, 50);

    return () => {
      clearInterval(spawner);
      clearInterval(mover);
    };
  }, [gameState]);

  const handleCatch = (id: number, type: 'tronco' | 'orbe') => {
    setItems(prev => prev.filter(i => i.id !== id));
    setScore(s => s + (type === 'orbe' ? 3 : 1));
  };

  if (gameState === 'intro') {
    return (
      <GameIntroScreen
        title="El Río Rápido de Bucky"
        oneRule="Toca los troncos (🪵 +1 pt) y los orbes dorados (✨ +3 pts) que flotan en el agua antes de que se escapen."
        gameType="vado"
        onStart={() => {
          setScore(0);
          setTimeLeft(15);
          setGameState('playing');
        }}
      />
    );
  }

  if (gameState === 'gameover') {
    return (
      <GameOverScreen
        score={score}
        gameType="vado"
        gameName="El Río Rápido"
        onPlayAgain={() => {
          setScore(0);
          setTimeLeft(15);
          setGameState('playing');
        }}
        onClaimAndClose={() => {
          onComplete();
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
          <span className="font-mono font-bold text-white">Tiempo: <strong className="text-[#d4ff4a] text-sm">{timeLeft}s</strong></span>
        </div>
        <div className="font-mono font-black text-white text-sm">
          Puntos: <strong className="text-[#4be5ff]">{score}</strong>
        </div>
      </div>

      {/* Río de juego */}
      <div className="relative h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-[#0e3b5e] via-[#082a47] to-[#051c30] border-2 border-[#38bdf8]/40 overflow-hidden shadow-inner cursor-crosshair">
        {/* Oleaje animado sutil */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Items flotando */}
        {items.map(item => (
          <button
            key={item.id}
            onPointerDown={() => handleCatch(item.id, item.type)}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`
            }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl cursor-pointer transition-transform active:scale-75 select-none shadow-lg ${
              item.type === 'orbe'
                ? 'bg-[#d4ff4a]/20 border border-[#d4ff4a] animate-bounce'
                : 'bg-[#78350f] border border-[#f59e0b]'
            }`}
          >
            <span className="text-2xl sm:text-3xl block">
              {item.type === 'orbe' ? '✨' : '🪵'}
            </span>
          </button>
        ))}

        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[#c9b7ff]/60 pointer-events-none">
            ¡Prepárate! Van saliendo por la corriente...
          </div>
        )}
      </div>

      <p className="text-[11px] text-center text-[#c9b7ff]">
        👆 Toca los troncos tan rápido como aparezcan
      </p>
    </div>
  );
};

// ============================================================================
// 2. JUEGO 2: LA TORRE DE CEDRO (15s)
// Un tronco se mueve de lado a lado. Haces clic para soltarlo y apilarlo.
// ============================================================================
const TorreCedroMinigame: React.FC<{ onComplete: () => void; onClose: () => void }> = ({ onComplete, onClose }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [movingPos, setMovingPos] = useState(50);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [tower, setTower] = useState<number[]>([50]); // base fija en 50%
  const [feedback, setFeedback] = useState<string | null>(null);

  // Timer de 15 segundos
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  // Movimiento horizontal del tronco oscilante
  useEffect(() => {
    if (gameState !== 'playing') return;

    const speed = 25; // ms por frame
    const interval = setInterval(() => {
      setMovingPos(prev => {
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
      // Éxito: apilado
      const perfect = diff < 5;
      const pts = perfect ? 3 : 1;
      setScore(s => s + pts);
      setTower(prev => [...prev.slice(-6), movingPos]);
      setFeedback(perfect ? '¡PERFECTO! +3' : '¡ENCAJÓ! +1');
    } else {
      // Cayó chueco
      setFeedback('¡Ups, tambaleó!');
    }

    setTimeout(() => setFeedback(null), 600);
  };

  if (gameState === 'intro') {
    return (
      <GameIntroScreen
        title="La Torre de Cedro"
        oneRule="Toca la pantalla cuando el tronco esté alineado con la base para soltarlo y apilarlo lo más alto posible."
        gameType="respiracion"
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
        gameType="respiracion"
        gameName="La Torre de Cedro"
        onPlayAgain={() => {
          setScore(0);
          setTimeLeft(15);
          setTower([50]);
          setGameState('playing');
        }}
        onClaimAndClose={() => {
          onComplete();
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
          <span className="font-mono font-bold text-white">Tiempo: <strong className="text-[#d4ff4a] text-sm">{timeLeft}s</strong></span>
        </div>
        <div className="font-mono font-black text-white text-sm">
          Pisos Apilados: <strong className="text-[#d4ff4a]">{score}</strong>
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

        {/* Base de la torre abajo */}
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
// 3. JUEGO 3: REFLEJOS DE NENÚFAR (15s)
// 4 hojas en el estanque; toca la que se ilumine con Bucky antes de 1s.
// ============================================================================
const ReflejosNenufarMinigame: React.FC<{ onComplete: () => void; onClose: () => void }> = ({ onComplete, onClose }) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [activePad, setActivePad] = useState<number>(0);

  // Timer de 15 segundos
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
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

  // Cambiar nenúfar activo rápidamente
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setActivePad(prev => {
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
      setScore(s => s + 1);
      // Cambiar inmediatamente
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
        gameType="clasificador"
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
        gameType="clasificador"
        gameName="Reflejos de Nenúfar"
        onPlayAgain={() => {
          setScore(0);
          setTimeLeft(15);
          setActivePad(Math.floor(Math.random() * 4));
          setGameState('playing');
        }}
        onClaimAndClose={() => {
          onComplete();
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
          <span className="font-mono font-bold text-white">Tiempo: <strong className="text-[#d4ff4a] text-sm">{timeLeft}s</strong></span>
        </div>
        <div className="font-mono font-black text-white text-sm">
          Aciertos: <strong className="text-[#4be5ff]">{score}</strong>
        </div>
      </div>

      {/* Cuadrante de Nenúfares (2x2) */}
      <div className="h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-[#0a2f44] to-[#041724] border-2 border-[#38bdf8]/40 p-4 grid grid-cols-2 gap-3.5 shadow-inner">
        {[0, 1, 2, 3].map(idx => {
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
              <span className={`text-[10px] font-black uppercase mt-1 ${isActive ? 'text-[#d4ff4a]' : 'text-white/40'}`}>
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
