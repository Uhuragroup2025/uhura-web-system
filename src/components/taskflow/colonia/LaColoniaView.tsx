/**
 * ============================================================================
 * LA COLONIA · WORLD AS INTERFACE (ORBIT SPATIAL & DIEGETIC UI)
 * ============================================================================
 * 
 * Filosofía: "El mundo es la interfaz".
 * 
 * Principios de Diseño:
 * 1. Low Chrome & Scene-First: El hábitat ribereño es el canvas completo de borde a borde.
 * 2. Cero lenguaje SaaS: Eliminado el header interno, tarjetas contenedoras, docks pesados y borders rectangulares.
 * 3. Diegetic UI: Los datos viven dentro de las estructuras (Observatorio muestra el ranking, Taller/Nenúfares muestran los juegos y records).
 * 4. Hotspots Espaciales: Cabaña de Cedro, Estanque de Nenúfares y Observatorio son puntos de entrada orgánicos con feedback ambiental.
 * 5. Bucky como Host Vivo: Centro narrativo con micro-diálogo contextual y UNA SOLA acción primaria heroica.
 * 6. Mucho Espacio Negativo: Composición visual cinematográfica que respira.
 * 7. Ambient Micro-Motion: Río en movimiento, luciérnagas, polvo estelar, transiciones suaves día/atardecer/noche.
 */

import React, { useState, useEffect } from 'react';
import { OrbitView, TaskItem, UserItem } from '../types';
import { ColonyGameId, ColonyChallenge, WeeklyLeaderboardEntry, TeammateOption } from './types';
import {
  loadColonyChallenges,
  saveColonyChallenges,
  loadWeeklyLeaderboards,
  resolveColonyChallenge,
  createColonyChallenge
} from './coloniaEngine';
import { ColoniaMinigames } from './ColoniaMinigames';
import { ColoniaSocialInbox } from './ColoniaSocialInbox';
import { ColoniaRankingView } from './ColoniaRankingView';
import { UserAvatar } from '../UserAvatar';
import {
  isSoundEnabled,
  setSoundEnabled,
  playTapSound
} from './coloniaAudio';

import buckyHoodieHappyImg from '../../../assets/images/bucky_hip_uhura_v3.png';
import buckyFocusImg from '../../../assets/images/bucky_focus_cutout.png';
import buckyCelebratingImg from '../../../assets/images/bucky_celebrating_cutout.png';

import {
  Swords,
  Trophy,
  Play,
  RotateCcw,
  Sparkles,
  Plus,
  Volume2,
  VolumeX,
  Moon,
  Sunset,
  Sun,
  X
} from 'lucide-react';

interface LaColoniaViewProps {
  tasks?: TaskItem[];
  loggedHoursToday?: number;
  targetDayHours?: number;
  plannedHoursToday?: number;
  currentUser?: UserItem;
  teamUsers?: UserItem[];
  onNavigateToView: (view: OrbitView) => void;
}

type AmbientTime = 'night' | 'sunset' | 'day';

export const LaColoniaView: React.FC<LaColoniaViewProps> = ({
  currentUser,
  teamUsers = [],
  onNavigateToView
}) => {
  const [activeGame, setActiveGame] = useState<ColonyGameId | null>(null);
  const [activeChallengeToPlay, setActiveChallengeToPlay] = useState<ColonyChallenge | null>(null);
  const [challenges, setChallenges] = useState<ColonyChallenge[]>(loadColonyChallenges);
  const [weeklyBoards, setWeeklyBoards] = useState<Record<ColonyGameId, WeeklyLeaderboardEntry[]>>(loadWeeklyLeaderboards);

  // Modales ligeros (Progressive Disclosure)
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [rankingGame, setRankingGame] = useState<ColonyGameId>('torre');
  const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false);
  const [newChallengeGame, setNewChallengeGame] = useState<ColonyGameId>('torre');

  // Estado del host Bucky
  const [lastGameResult, setLastGameResult] = useState<{ gameId: ColonyGameId; score: number } | null>(null);
  const [buckyMood, setBuckyMood] = useState<'happy' | 'focus' | 'celebrating'>('happy');
  const [buckyPhraseIndex, setBuckyPhraseIndex] = useState(0);

  // Toast efímero
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Preferencias ambientales y de audio
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled);
  const [ambientTime, setAmbientTime] = useState<AmbientTime>(() => {
    try {
      return (localStorage.getItem('orbit_colonia_ambient') as AmbientTime) || 'night';
    } catch {
      return 'night';
    }
  });

  const activeUserId = currentUser?.id || 'u-2';

  // Fuente canónica de colaboradores activos desde Equipo & Accesos (excluye al usuario actual e inactivos)
  const activeTeammates: TeammateOption[] = (teamUsers || [])
    .filter((u) => u.id !== activeUserId && u.status !== 'Inactive')
    .map((u) => ({
      id: u.id,
      name: u.name,
      role: u.officialRole || u.jobTitle || u.role || 'Colaborador',
      initials: u.initials || u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      avatarBg: u.avatarBg || 'bg-[#501f92]',
      avatarUrl: u.avatarUrl
    }));

  const refreshColonyData = () => {
    setChallenges(loadColonyChallenges());
    setWeeklyBoards(loadWeeklyLeaderboards());
  };

  useEffect(() => {
    refreshColonyData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Alternador sutil de ambientación (Noche -> Atardecer -> Día)
  const handleToggleAmbient = () => {
    playTapSound();
    const next: AmbientTime = ambientTime === 'night' ? 'sunset' : ambientTime === 'sunset' ? 'day' : 'night';
    setAmbientTime(next);
    try {
      localStorage.setItem('orbit_colonia_ambient', next);
    } catch {}
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playTapSound();
  };

  // Clasificación de retos
  const receivedChallenges = challenges.filter(
    (c) => c.status === 'pending' && c.challengedUserId === activeUserId
  );
  const sentChallenges = challenges.filter(
    (c) => c.status === 'pending' && c.challengerUserId === activeUserId
  );
  const historyChallenges = challenges.filter((c) => c.status === 'completed');

  // Datos del Ranking semanal
  const torreBoard = weeklyBoards['torre'] || [];
  const top1Torre = torreBoard[0] || { name: 'Diego', score: 120 };
  const userTorreIndex = torreBoard.findIndex((e) => e.userId === activeUserId || e.highlight);
  const userTorreBest = userTorreIndex !== -1 ? torreBoard[userTorreIndex].score : 100;
  const userTorreRank = userTorreIndex !== -1 ? userTorreIndex + 1 : 2;

  const nenufarBoard = weeklyBoards['nenufar'] || [];
  const top1Nenufar = nenufarBoard[0] || { name: 'Laura', score: 22 };

  // Reto prioritario activo
  const pendingChallenge = receivedChallenges[0] || null;

  // Aceptar y jugar reto
  const handleAcceptChallenge = (challenge: ColonyChallenge) => {
    playTapSound();
    setActiveChallengeToPlay(challenge);
    setActiveGame(challenge.gameId);
    setIsInboxOpen(false);
  };

  // Revancha
  const handleRematch = (oldChallenge: ColonyChallenge) => {
    playTapSound();
    setActiveChallengeToPlay(null);
    setActiveGame(oldChallenge.gameId);
    setIsInboxOpen(false);
  };

  // Completar partida
  const handleCompleteGame = (gameId: ColonyGameId, score: number) => {
    refreshColonyData();
    setLastGameResult({ gameId, score });
    setBuckyMood('celebrating');
    setActiveGame(null);
    setActiveChallengeToPlay(null);
  };

  const handleChallengeCreatedFromGame = (newChallenge: ColonyChallenge) => {
    refreshColonyData();
    showToast(`Reto enviado a ${newChallenge.challengedName} (${newChallenge.challengerScore} pts) ⚔️`);
  };

  // Crear reto directo
  const handleCreateDirectChallenge = (teammate: TeammateOption) => {
    playTapSound();
    const userBest =
      weeklyBoards[newChallengeGame]?.find((e) => e.userId === activeUserId || e.highlight)?.score ||
      (newChallengeGame === 'torre' ? userTorreBest : 15);

    const challengerData = {
      id: activeUserId,
      name: currentUser?.name || 'Paola Monsalve',
      initials: currentUser?.initials || 'PM',
      role: currentUser?.jobTitle || currentUser?.officialRole || currentUser?.role || 'Product Lead',
      avatarBg: currentUser?.avatarBg || 'bg-[#501f92]'
    };

    createColonyChallenge(
      newChallengeGame,
      challengerData,
      userBest,
      {
        id: teammate.id,
        name: teammate.name,
        initials: teammate.initials,
        role: teammate.role,
        avatarBg: teammate.avatarBg
      }
    );

    refreshColonyData();
    setIsNewChallengeModalOpen(false);
    showToast(`Reto enviado a ${teammate.name} ⚔️`);
  };

  // Click en Bucky (reacción viva y orgánica)
  const handleBuckyClick = () => {
    playTapSound();
    setBuckyPhraseIndex((prev) => prev + 1);
    setBuckyMood((prev) => (prev === 'happy' ? 'celebrating' : prev === 'celebrating' ? 'focus' : 'happy'));
    const idleRemarks = [
      '“Respira hondo y relaja los hombros 🌿”',
      '“El río corre tranquilo hoy con Uhura 🪵”',
      '“15 segundos bastan para despejar la mente ✨”',
      '“¿Probamos una partida rápida?”'
    ];
    showToast(idleRemarks[buckyPhraseIndex % idleRemarks.length]);
  };

  // =========================================================================
  // BUCKY COMO HOST: DIÁLOGO DIEGÉTICO & ACCIÓN PRIMARIA ÚNICA
  // =========================================================================
  let buckyDialogue = '';
  let primaryActionLabel = '';
  let primaryActionHandler = () => {};
  let secondaryActionNode: React.ReactNode = null;

  if (pendingChallenge) {
    const rivalName = pendingChallenge.challengerName.split(' ')[0];
    const gameName = pendingChallenge.gameId === 'torre' ? 'Torre de Cedro' : 'Reflejos';
    buckyDialogue = `${rivalName} te dejó ${pendingChallenge.challengerScore} pts en ${gameName} 👀 ¿Lo superas?`;
    primaryActionLabel = `SUPERAR A ${rivalName.toUpperCase()} · 15s`;
    primaryActionHandler = () => handleAcceptChallenge(pendingChallenge);
  } else if (lastGameResult) {
    const leaderName = top1Torre.name.split(' ')[0];
    const diff = Math.max(0, top1Torre.score - lastGameResult.score);
    if (lastGameResult.score >= top1Torre.score) {
      buckyDialogue = `${lastGameResult.score} pts 👀 ¡Estás arriba esta semana! 👑`;
      primaryActionLabel = 'RETAR A ALGUIEN';
      primaryActionHandler = () => setIsNewChallengeModalOpen(true);
      secondaryActionNode = (
        <button
          onClick={() => {
            playTapSound();
            setActiveChallengeToPlay(null);
            setActiveGame(lastGameResult.gameId);
          }}
          className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Otra ronda</span>
        </button>
      );
    } else {
      buckyDialogue = `${lastGameResult.score} pts 👀 Te faltaron ${diff} para alcanzar a ${leaderName}.`;
      primaryActionLabel = 'REVANCHA · 15s';
      primaryActionHandler = () => {
        playTapSound();
        setActiveChallengeToPlay(null);
        setActiveGame(lastGameResult.gameId);
      };
      secondaryActionNode = (
        <button
          onClick={() => {
            playTapSound();
            setIsNewChallengeModalOpen(true);
          }}
          className="text-xs text-[#d4ff4a] hover:underline transition-colors cursor-pointer flex items-center gap-1 focus-visible:outline-none"
        >
          <Swords className="w-3 h-3 text-[#d4ff4a]" />
          <span>Retar con mis {lastGameResult.score} pts</span>
        </button>
      );
    }
  } else {
    const leaderName = top1Torre.name.split(' ')[0];
    buckyDialogue = `${leaderName} sigue arriba con ${top1Torre.score}. ¿Probamos una?`;
    primaryActionLabel = 'JUGAR TORRE DE CEDRO · 15s';
    primaryActionHandler = () => {
      playTapSound();
      setActiveChallengeToPlay(null);
      setActiveGame('torre');
    };
  }

  // Fondos atmosféricos cinematográficos de borde a borde
  const ambientBackgrounds: Record<AmbientTime, string> = {
    night: 'from-[#0d051f] via-[#090317] to-[#04010b]',
    sunset: 'from-[#2b0c36] via-[#1a0624] to-[#0a0210]',
    day: 'from-[#1c1240] via-[#120a2c] to-[#070314]'
  };

  return (
    <div
      className={`relative w-full min-h-[calc(100vh-62px)] bg-gradient-to-b ${ambientBackgrounds[ambientTime]} text-white select-none transition-colors duration-1000 flex flex-col justify-between overflow-hidden`}
    >
      {/* ================================================================= */}
      {/* CAPA DE AMBIENTE: ESTRELLAS, LUCIÉRNAGAS Y POLVO CÓSMICO */}
      {/* ================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Estrellas distantes fijas y pulsantes */}
        <div className="absolute top-10 left-1/4 w-1.5 h-1.5 rounded-full bg-white/70 motion-safe:animate-pulse" />
        <div className="absolute top-24 left-16 w-1 h-1 rounded-full bg-[#d4ff4a]/60" />
        <div className="absolute top-16 right-1/3 w-1.5 h-1.5 rounded-full bg-[#4be5ff]/60 motion-safe:animate-ping opacity-60" />
        <div className="absolute top-36 right-20 w-1 h-1 rounded-full bg-white/50" />
        <div className="absolute top-8 right-1/4 w-2 h-2 rounded-full bg-[#c9b7ff]/30 motion-safe:animate-pulse" />

        {/* Luciérnagas flotantes con movimiento sutil */}
        <div className="absolute bottom-40 left-1/3 w-1.5 h-1.5 rounded-full bg-[#d4ff4a] blur-[1px] motion-safe:animate-bounce duration-1000 opacity-75" />
        <div className="absolute bottom-56 right-1/4 w-2 h-2 rounded-full bg-[#4be5ff] blur-[1.5px] motion-safe:animate-pulse duration-700 opacity-60" />
        <div className="absolute bottom-28 right-1/3 w-1 h-1 rounded-full bg-[#d4ff4a] blur-[0.5px] motion-safe:animate-ping duration-1000 opacity-50" />

        {/* Constelación orbital integrada en el cielo */}
        <svg className="absolute top-6 right-24 w-52 h-32 stroke-[#8a4dff]/20 stroke-[1] fill-none">
          <polyline points="15,30 65,15 120,45 170,25" />
          <circle cx="15" cy="30" r="2" fill="#8a4dff" />
          <circle cx="65" cy="15" r="2.5" fill="#d4ff4a" />
          <circle cx="120" cy="45" r="2" fill="#8a4dff" />
          <circle cx="170" cy="25" r="3" fill="#c9b7ff" />
        </svg>

        {/* Relieve natural del valle: Colinas orgánicas sin bordes de card */}
        <div className="absolute -bottom-28 -left-24 w-[520px] h-[400px] rounded-[200px] bg-gradient-to-tr from-[#120722] via-[#1a0c32] to-transparent opacity-85 transform -rotate-6 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[540px] h-[420px] rounded-[220px] bg-gradient-to-tl from-[#0f051e] via-[#17092d] to-transparent opacity-85 transform rotate-3 pointer-events-none" />

        {/* Río ribereño vivo que atraviesa el horizonte */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 800 300" className="w-full h-full preserve-3d">
            <defs>
              <linearGradient id="riverStreamDiegetic" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.75" />
              </linearGradient>
            </defs>
            <path
              d="M 80,300 C 240,210 340,160 400,100 C 450,45 500,20 600,0 L 710,0 C 630,35 550,85 500,140 C 440,205 340,255 180,300 Z"
              fill="url(#riverStreamDiegetic)"
            />
            <path
              d="M 160,285 Q 270,215 380,140"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeOpacity="0.45"
              strokeDasharray="14 18"
              className="motion-safe:animate-pulse"
            />
            <path
              d="M 280,265 Q 380,185 480,115"
              fill="none"
              stroke="#d4ff4a"
              strokeWidth="1.5"
              strokeOpacity="0.3"
              strokeDasharray="8 14"
            />
          </svg>
        </div>
      </div>

      {/* Toast flotante discreto */}
      {toastMessage && (
        <div className="fixed top-5 right-6 z-50 bg-[#120824]/95 border border-[#d4ff4a]/60 text-white px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in duration-150 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#d4ff4a] shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. SECTOR SUPERIOR / CÓSMICO: DIEGETIC OBSERVATORIO */}
      {/* ================================================================= */}
      <header className="relative z-20 w-full pt-4 sm:pt-6 px-6 sm:px-12 flex items-start justify-between">
        {/* Espacio izquierdo para equilibrio visual */}
        <div className="w-24 sm:w-32" />

        {/* Hotspot Diegético: Observatorio Orbital (Ranking Semanal Integrado) */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => {
              playTapSound();
              setRankingGame('torre');
              setIsRankingOpen(true);
            }}
            className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105 focus-visible:outline-none"
            title="Mirar por el Observatorio · Ranking semanal"
            aria-label={`Observatorio: Puesto #${userTorreRank} esta semana, ${userTorreBest} puntos`}
          >
            {/* Halo estelar suave al interactuar */}
            <div className="absolute -inset-3 bg-[#d4ff4a]/15 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Icono del telescopio cósmico */}
            <div className="text-3xl sm:text-4xl filter drop-shadow-[0_0_16px_rgba(212,255,74,0.45)] group-hover:rotate-6 transition-transform duration-300">
              🔭
            </div>

            {/* Readout diegético sobre el cielo (sin caja ni bordes) */}
            <div className="mt-1 text-center font-mono">
              <span className="text-[11px] sm:text-xs font-bold text-[#d4ff4a] tracking-tight block">
                #{userTorreRank} esta semana
              </span>
              <span className="text-[10px] text-white/50 tracking-normal font-sans">
                {userTorreBest} pts
              </span>
            </div>
          </button>
        </div>

        {/* Controles sutiles del horizonte cósmico (derecha) */}
        <div className="w-24 sm:w-32 flex items-center justify-end gap-2 text-white/40">
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl hover:text-white transition-colors cursor-pointer focus-visible:outline-none"
            title={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}
            aria-label="Alternar sonido"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#d4ff4a]" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleToggleAmbient}
            className="p-2 rounded-xl hover:text-white transition-colors cursor-pointer focus-visible:outline-none"
            title="Cambiar atmósfera (Noche · Atardecer · Día)"
            aria-label="Cambiar iluminación del hábitat"
          >
            {ambientTime === 'night' ? (
              <Moon className="w-3.5 h-3.5 text-[#d4ff4a]" />
            ) : ambientTime === 'sunset' ? (
              <Sunset className="w-3.5 h-3.5 text-[#fdba74]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#38bdf8]" />
            )}
          </button>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. SECTOR CENTRAL: EL HÁBITAT VIVO (HOTSPOTS + BUCKY PROTAGONISTA) */}
      {/* ================================================================= */}
      <main className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-8 py-2 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 my-auto">
        {/* =============================================================== */}
        {/* HOTSPOT 1: TALLER DE CEDRO (Portal a Torre de Cedro) */}
        {/* =============================================================== */}
        <div className="flex flex-col items-center md:items-start order-2 md:order-1">
          <button
            onClick={() => {
              playTapSound();
              setActiveChallengeToPlay(null);
              setActiveGame('torre');
            }}
            className="group relative flex flex-col items-center md:items-start cursor-pointer transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none text-left"
            title="Entrar al Taller de Cedro · Jugar Torre de Cedro (15s)"
            aria-label="Taller de Cedro, juega Torre de Cedro, micro-pausa de 15 segundos"
          >
            {/* Brillo ambiental suave al aproximarse */}
            <div className="absolute -inset-4 bg-[#8a4dff]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Arquitectura del taller */}
            <div className="flex items-center gap-1.5 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300">
              <span className="text-5xl sm:text-6xl">🏡</span>
              <span className="text-2xl sm:text-3xl -ml-2 mb-2">🪵</span>
            </div>

            {/* Label diegético limpio (sin card ni background de contenedor) */}
            <div className="mt-2 text-center md:text-left space-y-0.5">
              <div className="flex items-center gap-1.5 justify-center md:justify-start">
                <span className="text-xs sm:text-sm font-black text-white group-hover:text-[#d4ff4a] transition-colors">
                  Taller de Cedro
                </span>
                <span className="text-[10px] text-[#d4ff4a] font-mono">15s</span>
              </div>
              <p className="text-[11px] text-white/50">Apila troncos en eje</p>
              <p className="text-[10px] font-mono text-[#c9b7ff]/80">
                Récord semanal: <strong className="text-white">{top1Torre.score} pts</strong>
              </p>
            </div>
          </button>
        </div>

        {/* =============================================================== */}
        {/* BUCKY EN EL CENTRO: HOST NARRATIVO & ACCIÓN PRIMARIA ÚNICA */}
        {/* =============================================================== */}
        <div className="flex flex-col items-center text-center order-1 md:order-2 space-y-3 max-w-sm sm:max-w-md mx-auto">
          {/* Diálogo diegético conversacional (sin componentes de plástico pesados) */}
          <div
            onClick={handleBuckyClick}
            className="cursor-pointer group px-4 py-2 rounded-2xl bg-black/40 border border-white/10 hover:border-[#d4ff4a]/60 backdrop-blur-md transition-all duration-200"
            title="Toca a Bucky para charlar"
          >
            <p className="text-xs sm:text-sm font-semibold text-white/95 leading-snug group-hover:text-[#d4ff4a] transition-colors">
              {buckyDialogue}
            </p>
          </div>

          {/* Sprite protagónico de Bucky con micro-animación orgánica */}
          <div
            onClick={handleBuckyClick}
            className="relative cursor-pointer group py-1"
            title="Bucky el Castor"
          >
            {/* Halo suave de presencia */}
            <div className="absolute inset-0 bg-[#8a4dff]/25 rounded-full blur-2xl transform group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <img
              src={
                buckyMood === 'celebrating'
                  ? buckyCelebratingImg
                  : buckyMood === 'focus'
                  ? buckyFocusImg
                  : buckyHoodieHappyImg
              }
              alt="Bucky, anfitrión de La Colonia"
              className="w-32 h-32 sm:w-36 sm:h-36 object-contain filter drop-shadow-[0_16px_28px_rgba(0,0,0,0.7)] transform group-hover:scale-105 active:scale-95 transition-all duration-300"
            />
            {/* Sombra de contacto sobre el muelle */}
            <div className="w-24 h-3.5 bg-black/60 rounded-full blur-xs mx-auto mt-1" />
          </div>

          {/* =========================================================== */}
          {/* LA ÚNICA ACCIÓN PRIMARIA HEROICA DE TODA LA PANTALLA */}
          {/* =========================================================== */}
          <div className="w-full pt-1 space-y-2 flex flex-col items-center">
            <button
              onClick={() => {
                playTapSound();
                primaryActionHandler();
              }}
              className="w-full sm:w-80 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d4ff4a] via-[#4be5ff] to-[#38d4ee] text-[#120822] text-xs sm:text-sm font-black tracking-wider uppercase shadow-[0_0_28px_rgba(212,255,74,0.35)] transition-all transform hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff4a]"
            >
              <Play className="w-4 h-4 fill-[#120822]" />
              <span>{primaryActionLabel}</span>
            </button>

            {/* Acción secundaria o indicador sutil */}
            <div className="h-6 flex items-center justify-center">
              {secondaryActionNode ? (
                secondaryActionNode
              ) : pendingChallenge ? (
                <button
                  onClick={() => {
                    playTapSound();
                    setIsInboxOpen(true);
                  }}
                  className="text-[11px] text-[#d4ff4a] hover:underline transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-none"
                >
                  <Swords className="w-3 h-3 text-[#d4ff4a]" />
                  <span>
                    {receivedChallenges.length} {receivedChallenges.length === 1 ? 'reto recibido pendiente' : 'retos recibidos pendientes'}
                  </span>
                </button>
              ) : (
                <span className="text-[11px] text-white/40 font-mono">
                  Tu récord: <strong className="text-white/70">{userTorreBest}</strong> · Récord semanal: <strong className="text-[#d4ff4a]">{top1Torre.score}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* HOTSPOT 2: JARDÍN DE NENÚFARES (Portal a Reflejos de Nenúfar) */}
        {/* =============================================================== */}
        <div className="flex flex-col items-center md:items-end order-3">
          <button
            onClick={() => {
              playTapSound();
              setActiveChallengeToPlay(null);
              setActiveGame('nenufar');
            }}
            className="group relative flex flex-col items-center md:items-end cursor-pointer transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none text-right"
            title="Entrar al Estanque · Jugar Reflejos de Nenúfar (15s)"
            aria-label="Estanque de Nenúfares, juega Reflejos de Nenúfar, micro-pausa de 15 segundos"
          >
            {/* Brillo acuático sutil */}
            <div className="absolute -inset-4 bg-[#38bdf8]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Vegetación y nenúfares acuáticos */}
            <div className="flex items-center gap-1.5 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300">
              <span className="text-5xl sm:text-6xl">🌸</span>
              <span className="text-2xl sm:text-3xl -ml-2 mb-2">⚡</span>
            </div>

            {/* Label diegético limpio */}
            <div className="mt-2 text-center md:text-right space-y-0.5">
              <div className="flex items-center gap-1.5 justify-center md:justify-end">
                <span className="text-xs sm:text-sm font-black text-white group-hover:text-[#4be5ff] transition-colors">
                  Nenúfares
                </span>
                <span className="text-[10px] text-[#4be5ff] font-mono">15s</span>
              </div>
              <p className="text-[11px] text-white/50">Toca el nenúfar ágil</p>
              <p className="text-[10px] font-mono text-[#c9b7ff]/80">
                Récord semanal: <strong className="text-white">{top1Nenufar.score} pts</strong>
              </p>
            </div>
          </button>
        </div>
      </main>

      {/* ================================================================= */}
      {/* 3. SECTOR INFERIOR / HUD SILENCIOSO: NAVEGACIÓN SECUNDARIA DISCRETA */}
      {/* ================================================================= */}
      <footer className="relative z-20 w-full px-6 sm:px-12 pb-5 sm:pb-7 flex items-center justify-between text-xs text-white/60">
        {/* Retos sociales */}
        <button
          onClick={() => {
            playTapSound();
            setIsInboxOpen(true);
          }}
          className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
        >
          <Swords className="w-3.5 h-3.5 text-[#d4ff4a]" />
          <span>Tus retos</span>
          {receivedChallenges.length > 0 && (
            <span className="text-[10px] font-mono font-bold text-[#d4ff4a]">
              ({receivedChallenges.length})
            </span>
          )}
        </button>

        {/* Retar a alguien */}
        <button
          onClick={() => {
            playTapSound();
            setIsNewChallengeModalOpen(true);
          }}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
        >
          <Plus className="w-3.5 h-3.5 text-[#d4ff4a]" />
          <span>Retar a alguien</span>
        </button>

        {/* Atmósfera */}
        <button
          onClick={handleToggleAmbient}
          className="hover:text-white transition-colors cursor-pointer capitalize focus-visible:outline-none hidden sm:inline"
        >
          <span>Ambiente: </span>
          <span className="text-white/80 font-medium">{ambientTime}</span>
        </button>
      </footer>

      {/* ================================================================= */}
      {/* VENTANAS MODALES LIGERAS (PROGRESSIVE DISCLOSURE) */}
      {/* ================================================================= */}

      {/* 1. Inbox Social de Retos */}
      <ColoniaSocialInbox
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        receivedChallenges={receivedChallenges}
        sentChallenges={sentChallenges}
        historyChallenges={historyChallenges}
        activeUserId={activeUserId}
        onPlayChallenge={handleAcceptChallenge}
        onRematch={handleRematch}
        onOpenNewChallenge={() => {
          setIsInboxOpen(false);
          setIsNewChallengeModalOpen(true);
        }}
      />

      {/* 2. Ranking Semanal */}
      <ColoniaRankingView
        isOpen={isRankingOpen}
        onClose={() => setIsRankingOpen(false)}
        weeklyBoards={weeklyBoards}
        initialGame={rankingGame}
        activeUserId={activeUserId}
        onPlayGame={(gameId) => {
          setActiveChallengeToPlay(null);
          setActiveGame(gameId);
        }}
      />

      {/* 3. Selector de rival para Retar (fuente canónica de Equipo & Accesos) */}
      {isNewChallengeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#120822] border border-[#8a4dff]/60 rounded-3xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-[#d4ff4a]" />
                <h3 className="text-base font-black text-white">Retar a un compañero</h3>
              </div>
              <button
                onClick={() => setIsNewChallengeModalOpen(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#c9b7ff]">
              Selecciona el juego y a quién desafiar con tu marca semanal:
            </p>

            {/* Selector de Juego */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white uppercase tracking-wider block">
                1. Elige el juego
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setNewChallengeGame('torre')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    newChallengeGame === 'torre'
                      ? 'bg-[#501f92] border-[#d4ff4a] text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg block mb-0.5">🌿</span>
                  <div className="text-xs font-bold text-white">Torre de Cedro</div>
                  <span className="text-[10px] text-white/50">Timing · 15s</span>
                </button>

                <button
                  onClick={() => setNewChallengeGame('nenufar')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    newChallengeGame === 'nenufar'
                      ? 'bg-[#501f92] border-[#d4ff4a] text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg block mb-0.5">⚡</span>
                  <div className="text-xs font-bold text-white">Reflejos Nenúfar</div>
                  <span className="text-[10px] text-white/50">Velocidad · 15s</span>
                </button>
              </div>
            </div>

            {/* Selector de Compañero (Fuente Canónica Equipo & Accesos) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white uppercase tracking-wider block">
                2. Elige a quién retar
              </label>
              {activeTeammates.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-white/5 border border-white/5 text-xs text-white/60">
                  No hay otros colaboradores activos disponibles en Equipo & Accesos para retar.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {activeTeammates.map((teammate) => (
                    <button
                      key={teammate.id}
                      onClick={() => handleCreateDirectChallenge(teammate)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-[#501f92]/40 border border-white/10 hover:border-[#d4ff4a] text-left transition-all cursor-pointer group flex items-center gap-2"
                    >
                      <UserAvatar
                        user={teammate}
                        size="sm"
                        className="w-7 h-7 rounded-lg text-[10px]"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white group-hover:text-[#d4ff4a] truncate">
                          {teammate.name.split(' ')[0]}
                        </div>
                        <span className="text-[9px] text-white/50 block truncate">{teammate.role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Minijuegos de 15 segundos */}
      <ColoniaMinigames
        type={activeGame}
        activeChallenge={activeChallengeToPlay}
        teammates={activeTeammates}
        currentUser={currentUser}
        onClose={() => {
          setActiveGame(null);
          setActiveChallengeToPlay(null);
        }}
        onComplete={handleCompleteGame}
        onChallengeCreated={handleChallengeCreatedFromGame}
      />
    </div>
  );
};
