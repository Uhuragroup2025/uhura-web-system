/**
 * ============================================================================
 * LA COLONIA & FICHAS HUMANAS (ECO CULTURA UHURA)
 * ============================================================================
 * 
 * Réplica fiel de la vista de Staging (Captura #1):
 * - Banner "Conoce a la colonia" (Cumpleaños, aniversarios, gustos y mascotas del equipo)
 * - Filtros: [ Todos ] [ Cumpleaños del mes ] [ Aniversarios del mes ]
 * - Buscador rápido con atajo de teclado
 * - Cuadrícula de 3 columnas de tarjetas humanas de colaboradores
 * - Integración con TeamHumanProfileModal para editar o ver detalles
 * - Acceso directo a "Mi Ficha"
 * - Toggle para disfrutar del Hábitat interactivo y minijuegos de ECO
 */

import React, { useState, useMemo, useEffect } from 'react';
import { OrbitView, TaskItem, UserItem } from '../types';
import { ColonyGameId, ColonyChallenge, WeeklyLeaderboardEntry, TeammateOption } from './types';
import {
  loadColonyChallenges,
  saveColonyChallenges,
  loadWeeklyLeaderboards,
  resolveColonyChallenge,
  createColonyChallenge,
  getUserChallenges,
  challengeOutcomeFor,
  relativeTimeEs,
  COLONY_GAME_NAMES
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

import { mascotImage, useMascotSkin } from '../mascot/ecoMascot';

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
  X,
  Search,
  Users,
  Gamepad2,
  Heart,
  Calendar,
  Gift,
  ArrowRight,
  Filter
} from 'lucide-react';

interface LaColoniaViewProps {
  tasks?: TaskItem[];
  loggedHoursToday?: number;
  targetDayHours?: number;
  plannedHoursToday?: number;
  currentUser?: UserItem;
  teamUsers?: UserItem[];
  onNavigateToView: (view: OrbitView) => void;
  onUpdateUser?: (updatedUser: UserItem) => void;
}

type AmbientTime = 'night' | 'sunset' | 'day';
type ColoniaTabMode = 'fichas' | 'habitat';
type FilterCategory = 'todos' | 'cumples' | 'aniversarios';

export const LaColoniaView: React.FC<LaColoniaViewProps> = ({
  currentUser,
  teamUsers = [],
  onNavigateToView,
  onUpdateUser
}) => {
  // Pestaña principal: 'fichas' (Grid canónico de Staging) o 'habitat' (Minijuegos y diorama 3D)
  const [activeTabMode, setActiveTabMode] = useState<ColoniaTabMode>('fichas');

  // Filtros de Fichas Humanas
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados para el hábitat de ECO y minijuegos
  const [activeGame, setActiveGame] = useState<ColonyGameId | null>(null);
  const [activeChallengeToPlay, setActiveChallengeToPlay] = useState<ColonyChallenge | null>(null);
  const [challenges, setChallenges] = useState<ColonyChallenge[]>(loadColonyChallenges);
  const [weeklyBoards, setWeeklyBoards] = useState<Record<ColonyGameId, WeeklyLeaderboardEntry[]>>(loadWeeklyLeaderboards);

  // Modales ligeros de Hábitat
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [rankingGame, setRankingGame] = useState<ColonyGameId>('torre');
  const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false);
  const [newChallengeGame, setNewChallengeGame] = useState<ColonyGameId>('torre');

  // Estado del host ECO
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

  const activeUserId = currentUser?.id || 'anon';
  const { skin: mascotSkin } = useMascotSkin();
  const [activeChallenge, setActiveChallenge] = useState<ColonyChallenge | null>(null);
  // Compañeros para retar: Equipo & Accesos, activos, sin la persona que juega
  const teammates: TeammateOption[] = useMemo(
    () =>
      teamUsers
        .filter((u) => u.status !== 'Inactive' && u.id !== activeUserId)
        .map((u) => ({
          id: u.id,
          name: u.name,
          role: u.jobTitle || u.officialRole || u.role || '',
          initials: u.initials || u.name.split(' ').map((n) => n[0]).join('').slice(0, 2),
          avatarBg: u.avatarBg || 'bg-[#501f92]',
          avatarUrl: u.avatarUrl
        })),
    [teamUsers, activeUserId]
  );
  const myChallenges = useMemo(() => getUserChallenges(challenges, activeUserId), [challenges, activeUserId]);
  const latestResult = myChallenges.results[0];

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

  // Filtrado de colaboradores para Fichas Humanas
  const filteredUsers = useMemo(() => {
    const list = teamUsers.filter((u) => u.status !== 'Inactive');
    const query = searchQuery.trim().toLowerCase();

    return list.filter((user) => {
      // 1. Filtro de búsqueda
      if (query) {
        const matchesName = user.name.toLowerCase().includes(query);
        const matchesRole = (user.jobTitle || user.officialRole || '').toLowerCase().includes(query);
        const matchesCity = (user.city || '').toLowerCase().includes(query);
        const matchesHobbies = (user.hobbies || '').toLowerCase().includes(query);
        const matchesPets = (user.petNames || '').toLowerCase().includes(query);
        if (!matchesName && !matchesRole && !matchesCity && !matchesHobbies && !matchesPets) {
          return false;
        }
      }

      // 2. Filtro de categoría: Todos / Cumpleaños del mes / Aniversarios del mes
      // Octubre (mes 10) es el mes actual del contexto
      if (selectedFilter === 'cumples') {
        if (!user.birthDate) return false;
        const parts = user.birthDate.split('-');
        const month = parseInt(parts[1], 10);
        return month === new Date().getMonth() + 1; // mes en curso
      }

      if (selectedFilter === 'aniversarios') {
        if (!user.joinedDate && !user.anniversaryDate) return false;
        const joined = (user.joinedDate || user.anniversaryDate || '').toLowerCase();
        const mIdx = new Date().getMonth();
        const short = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][mIdx];
        const mm = String(mIdx + 1).padStart(2, '0');
        return joined.includes(short) || joined.includes(`/ ${mm} /`) || joined.includes(`-${mm}-`);
      }

      return true;
    });
  }, [teamUsers, searchQuery, selectedFilter]);

  // Formateador amigable de Fecha de Ingreso y Antigüedad
  const formatJoinedInfo = (user: UserItem) => {
    if (user.joinedDate) {
      if (user.joinedDate.includes('·')) return user.joinedDate;
      const years = user.anniversaryYears || 2;
      return `${user.joinedDate} · ${years} años`;
    }
    if (user.anniversaryDate) {
      const parts = user.anniversaryDate.split('-');
      const year = parts[0];
      const years = 2026 - parseInt(year, 10);
      return `${user.anniversaryDate} · ${years > 0 ? years : 1} años`;
    }
    return 'Sin registrar';
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

  return (
    <div className={`min-h-full flex flex-col ${activeTabMode === 'habitat' ? 'bg-[#0a0418] text-white' : 'bg-[#f8fafc] text-[#0f172a]'}`}>
      {/* Toast efímero */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0f172a] text-white text-xs font-semibold shadow-xl border border-white/10 animate-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-[#d4ff4a]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VISTA 1: FICHAS HUMANAS (RÉPLICA FIEL DE STAGING) */}
      {/* ==================================================================== */}
      {activeTabMode === 'fichas' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Banner Superior "Conoce La Colonia" */}
          <div className="bg-white rounded-3xl p-5 border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#faf5ff] border border-[#ede9fe] flex items-center justify-center text-2xl shadow-2xs shrink-0">
                🦫
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#0f172a] tracking-tight">
                  Conoce La Colonia
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Cumpleaños, aniversarios, gustos y mascotas del equipo.
                </p>
              </div>
            </div>

            {/* Filtros: [ Todos ] [ Cumpleaños del mes ] [ Aniversarios del mes ] + [ Mi Ficha ] */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
              <div className="inline-flex items-center p-1 bg-[#f1f5f9] rounded-xl text-xs font-bold text-[#64748b]">
                <button
                  type="button"
                  onClick={() => setSelectedFilter('todos')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedFilter === 'todos'
                      ? 'bg-white text-[#0f172a] shadow-xs'
                      : 'hover:text-[#0f172a]'
                  }`}
                >
                  Todos ({teamUsers.filter((u) => u.status !== 'Inactive').length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('cumples')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    selectedFilter === 'cumples'
                      ? 'bg-white text-[#db2777] shadow-xs'
                      : 'hover:text-[#0f172a]'
                  }`}
                >
                  <span>🎂 Cumpleaños del mes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('aniversarios')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    selectedFilter === 'aniversarios'
                      ? 'bg-white text-[#7c3aed] shadow-xs'
                      : 'hover:text-[#0f172a]'
                  }`}
                >
                  <span>🎉 Aniversarios del mes</span>
                </button>
              </div>

              {/* Toggle a Jugar en La Colonia */}
              <button
                type="button"
                onClick={() => setActiveTabMode('habitat')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#2e1859] hover:bg-[#1a0f30] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 ml-1"
                title="Jugar en La Colonia · Minijuegos de ECO"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-[#d4ff4a]" />
                <span>Jugar en La Colonia</span>
              </button>
            </div>
          </div>

          {/* Cuadrícula de Tarjetas de Colaboradores (3 Columnas, Exacto a Staging) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUsers.map((user) => {
              const birthdayDisplay = user.birthDateFormatted || (user.birthDate ? user.birthDate.split('-').slice(1).join('/') : 'Sin registrar');
              const joinedDisplay = formatJoinedInfo(user);
              const isCurrentUserCard = currentUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  className={`bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-2xs ${
                    isCurrentUserCard
                      ? 'border-[#8a4dff] ring-1 ring-[#8a4dff]/20'
                      : 'border-[#e2e8f0]'
                  }`}
                >
                  <div>
                    {/* Header de la Tarjeta: Avatar + Nombre + Cargo · Ciudad */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-2xs overflow-hidden ${
                          user.avatarBg || 'bg-[#3b186b]'
                        }`}
                      >
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user.initials || user.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-[#0f172a] text-sm group-hover:text-[#501f92] transition-colors truncate">
                            {user.name}
                          </h3>
                          {isCurrentUserCard && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#ede9fe] text-[#7c3aed]">
                              Tú
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748b] truncate mt-0.5">
                          {user.jobTitle || user.officialRole || 'Equipo Uhura'}
                          {user.city ? ` · ${user.city}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Dos Badges en Fila: Cumpleaños & En Uhura Desde */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {/* Badge 1: 🎂 CUMPLEAÑOS */}
                      <div className="p-2.5 rounded-2xl bg-[#fff1f2] border border-[#ffe4e6] text-xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e11d48] flex items-center gap-1">
                          <span>🎂</span>
                          <span>CUMPLEAÑOS</span>
                        </span>
                        <p className="font-bold text-[#0f172a] text-xs mt-1 truncate">
                          {birthdayDisplay}
                        </p>
                      </div>

                      {/* Badge 2: 🎉 EN UHURA DESDE */}
                      <div className="p-2.5 rounded-2xl bg-[#f5f3ff] border border-[#ede9fe] text-xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7c3aed] flex items-center gap-1">
                          <span>🎉</span>
                          <span>EN UHURA DESDE</span>
                        </span>
                        <p className="font-bold text-[#0f172a] text-xs mt-1 truncate">
                          {joinedDisplay}
                        </p>
                      </div>
                    </div>

                    {/* Contenido Cultural: Le gusta & Mascotas */}
                    <div className="mt-4 space-y-2 text-xs">
                      {user.hobbies ? (
                        <p className="text-[#334155] leading-relaxed line-clamp-3">
                          <strong className="text-[#0f172a] font-bold">Le gusta: </strong>
                          <span className="text-[#475569]">{user.hobbies}</span>
                        </p>
                      ) : (
                        <p className="text-[#94a3b8] italic text-[11px]">
                          Sin pasatiempos registrados aún
                        </p>
                      )}

                      {user.petNames && (
                        <p className="text-[#334155] leading-relaxed text-xs">
                          <strong className="text-[#0f172a] font-bold">Mascotas: </strong>
                          <span className="text-[#475569]">{user.petNames}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State si no hay resultados */}
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#e2e8f0] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <h3 className="text-sm font-bold text-[#0f172a]">
                No se encontraron compañeros
              </h3>
              <p className="text-xs text-[#64748b] max-w-sm mx-auto">
                No hay resultados para tu búsqueda o filtro actual. Intenta con otro término o selecciona "Todos".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('todos');
                }}
                className="px-4 py-2 rounded-xl bg-[#501f92] text-white text-xs font-bold cursor-pointer"
              >
                Restablecer filtros
              </button>
            </div>
          )}

          {/* Sticker de ECO flotante en la esquina inferior derecha (Fiel a Staging) */}
          <div className="fixed bottom-6 right-8 pointer-events-none z-30 hidden sm:block">
            <img
              src={mascotImage('ok', mascotSkin)}
              alt="ECO Uhura"
              className="w-24 h-24 object-contain drop-shadow-xl"
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VISTA 2: EL HÁBITAT Y MINIJUEGOS DE BUCKY (EXPERIENCIAL / LÚDICO) */}
      {/* ==================================================================== */}
      {activeTabMode === 'habitat' && (() => {
        // ── Datos reales para el universo de juegos ──
        const GAMES: { id: ColonyGameId; emoji: string; tagline: string; planet: string; ring: string; glow: string }[] = [
          { id: 'torre', emoji: '🪵', tagline: 'Suelta cada tronco alineado y apila lo más alto posible.', planet: 'radial-gradient(circle at 30% 30%, #fde68a, #f59e0b 45%, #92400e 100%)', ring: 'border-[#fbbf24]/60', glow: 'shadow-[0_0_60px_rgba(245,158,11,0.45)]' },
          { id: 'nenufar', emoji: '🪷', tagline: 'Toca el nenúfar donde aparezca ECO lo más rápido que puedas.', planet: 'radial-gradient(circle at 30% 30%, #a7f3d0, #10b981 45%, #065f46 100%)', ring: 'border-[#34d399]/60', glow: 'shadow-[0_0_60px_rgba(16,185,129,0.45)]' }
        ];
        const statsFor = (g: ColonyGameId) => {
          const board = weeklyBoards[g] || [];
          const idx = board.findIndex((e) => e.userId === activeUserId);
          return { best: idx >= 0 ? board[idx].score : null, rank: idx >= 0 ? idx + 1 : null, leader: board[0] || null };
        };
        const nobodyPlayed = GAMES.every((g) => (weeklyBoards[g.id] || []).length === 0);
        const pending = myChallenges.received[0];
        const outcome = latestResult ? challengeOutcomeFor(latestResult, activeUserId) : null;
        const rivalOf = (c: ColonyChallenge) => (c.challengerUserId === activeUserId ? c.challengedName : c.challengerName).split(' ')[0];
        const hostLine = pending
          ? `${pending.challengerName.split(' ')[0]} te retó en ${COLONY_GAME_NAMES[pending.gameId]} con ${pending.challengerScore} pts. ¿Lo superas?`
          : latestResult && outcome === 'won'
          ? `¡Le ganaste a ${rivalOf(latestResult)}! ¿Otra partida?`
          : latestResult && outcome === 'lost'
          ? `${rivalOf(latestResult)} te ganó esta vez. ¿Revancha?`
          : nobodyPlayed
          ? 'Nadie ha jugado esta semana. ¡Estrena el ranking!'
          : '¿Jugamos una partida rápida? Son 15 segundos.';
        const hostImg = mascotImage(pending ? 'surprised' : outcome === 'won' ? 'celebrating' : 'ok', mascotSkin);
        const sky =
          ambientTime === 'night'
            ? 'linear-gradient(180deg, #05010f 0%, #140733 45%, #2a0f5c 100%)'
            : ambientTime === 'sunset'
            ? 'linear-gradient(180deg, #12052b 0%, #4a1460 45%, #b4532a 100%)'
            : 'linear-gradient(180deg, #1e1b6b 0%, #4c3bb8 50%, #8b7cf6 100%)';
        const board = weeklyBoards[rankingGame] || [];
        const podium = [board[1], board[0], board[2]];

        return (
          <div className="relative overflow-hidden flex-1" style={{ background: sky }}>
            {/* Estrellas */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 46 }, (_, i) => (
                <span
                  key={i}
                  className="eco-star"
                  style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 70}%`, width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`, animationDelay: `${(i % 7) * 0.4}s` }}
                />
              ))}
              <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[140%] h-72 rounded-[50%] bg-[#0b0420]/70 blur-sm" />
            </div>

            <div className="relative p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
              {/* HUD */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTabMode('fichas')}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    aria-label="Volver a La Colonia"
                    title="Volver a La Colonia"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Universo de juegos</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setIsInboxOpen(true)}
                    className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Swords className="w-3.5 h-3.5 text-[#d4ff4a]" />
                    <span>Retos</span>
                    {myChallenges.received.length > 0 && (
                      <span className="px-1.5 rounded-full bg-[#d4ff4a] text-[#120822] text-[10px] font-black">{myChallenges.received.length}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRankingOpen(true)}
                    className="px-3 py-1.5 rounded-xl hover:bg-white/10 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>Ranking</span>
                    {statsFor(rankingGame).rank && <span className="text-[#fbbf24]">· vas #{statsFor(rankingGame).rank}</span>}
                  </button>
                  <span className="w-px h-5 bg-white/15" />
                  <button
                    onClick={() => setSoundOn(!soundOn)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-white cursor-pointer"
                    title={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}
                    aria-label={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}
                  >
                    {soundOn ? <Volume2 className="w-4 h-4 text-[#d4ff4a]" /> : <VolumeX className="w-4 h-4 text-white/60" />}
                  </button>
                  <button
                    onClick={handleToggleAmbient}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-white cursor-pointer"
                    title="Cambiar el cielo"
                    aria-label="Cambiar el cielo"
                  >
                    {ambientTime === 'night' ? <Moon className="w-4 h-4 text-[#c9b7ff]" /> : ambientTime === 'sunset' ? <Sunset className="w-4 h-4 text-[#f59e0b]" /> : <Sun className="w-4 h-4 text-[#fde68a]" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Escena: ECO anfitrión + planetas */}
                <div className="lg:col-span-2 space-y-6">
                  {/* ECO anfitrión */}
                  <div className="flex items-end gap-3">
                    <img src={hostImg} alt="ECO" className="w-20 sm:w-24 h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] eco-float" />
                    <div className="relative mb-6 px-4 py-3 rounded-2xl rounded-bl-sm bg-white text-[#120822] text-sm font-bold shadow-xl max-w-md">
                      {hostLine}
                      {pending && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChallenge(pending);
                            setActiveGame(pending.gameId);
                          }}
                          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92] text-white text-xs font-black cursor-pointer"
                        >
                          <Swords className="w-3.5 h-3.5" /> Aceptar reto
                        </button>
                      )}
                      {!pending && latestResult && (
                        <button
                          type="button"
                          onClick={() => setActiveGame(latestResult.gameId)}
                          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#501f92] text-white text-xs font-black cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> {outcome === 'lost' ? 'Revancha' : 'Jugar otra'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Planetas: un juego por planeta */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
                    {GAMES.map((g, i) => {
                      const st = statsFor(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setActiveGame(g.id)}
                          className="group text-center cursor-pointer focus:outline-none"
                          aria-label={`Jugar ${COLONY_GAME_NAMES[g.id]}`}
                        >
                          <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 eco-float" style={{ animationDelay: `${i * 1.2}s` }}>
                            <div className={`absolute -inset-3 rounded-full border-2 border-dashed ${g.ring} eco-orbit-ring`} />
                            <div
                              className={`absolute inset-0 rounded-full ${g.glow} transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110 flex items-center justify-center`}
                              style={{ background: g.planet }}
                            >
                              <span className="text-5xl drop-shadow">{g.emoji}</span>
                            </div>
                            <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-[#d4ff4a] text-[#120822] text-[10px] font-black">15 s</span>
                          </div>
                          <h3 className="mt-4 text-base font-black text-white group-hover:text-[#d4ff4a] transition-colors">{COLONY_GAME_NAMES[g.id]}</h3>
                          <p className="text-[11px] text-white/70 mt-1 px-2">{g.tagline}</p>
                          <p className="mt-2 text-[11px] text-white/80">
                            {st.best !== null ? (
                              <>Tu mejor: <strong className="text-[#d4ff4a]">{st.best}</strong> · #{st.rank}</>
                            ) : (
                              'Aún no juegas esta semana'
                            )}
                          </p>
                          {st.leader && (
                            <p className="text-[10px] text-white/50">Récord: {st.leader.score} · {st.leader.name.split(' ')[0]}</p>
                          )}
                          <span className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-[#d4ff4a] text-[#120822] text-sm font-black shadow-lg group-hover:shadow-[0_0_24px_rgba(212,255,74,0.6)] transition-shadow">
                            <Play className="w-4 h-4 fill-[#120822]" /> Jugar
                          </span>
                        </button>
                      );
                    })}
                    {/* Próximamente */}
                    <div className="text-center opacity-60" aria-label="Próximamente un juego nuevo">
                      <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 eco-float" style={{ animationDelay: '2.4s' }}>
                        <div
                          className="absolute inset-0 rounded-full flex items-center justify-center"
                          style={{ background: 'radial-gradient(circle at 30% 30%, #e2e8f0, #64748b 50%, #1e293b 100%)' }}
                        >
                          <span className="text-3xl">🔒</span>
                        </div>
                      </div>
                      <h3 className="mt-4 text-sm font-black text-white">Próximamente</h3>
                      <p className="text-[11px] text-white/60 mt-1">Un juego nuevo para retar al equipo.</p>
                    </div>
                  </div>

                  {/* Retos recibidos (si hay más de uno) */}
                  {myChallenges.received.length > 1 && (
                    <div className="p-3 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md text-xs text-white flex items-center justify-between gap-3">
                      <span>Tienes {myChallenges.received.length} retos por responder.</span>
                      <button type="button" onClick={() => setIsInboxOpen(true)} className="text-[#d4ff4a] font-bold hover:underline cursor-pointer">
                        Ver retos
                      </button>
                    </div>
                  )}
                </div>

                {/* Ranking con podio */}
                <div className="p-5 rounded-2xl bg-black/35 border border-white/10 backdrop-blur-md space-y-4 h-fit">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#fbbf24]" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Ranking semanal</h4>
                    </div>
                    <span className="text-[10px] text-white/50">Se reinicia el lunes</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 text-[11px] font-bold">
                    {GAMES.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setRankingGame(g.id)}
                        className={`py-1.5 rounded-lg cursor-pointer ${rankingGame === g.id ? 'bg-[#d4ff4a] text-[#120822]' : 'text-white/70 hover:text-white'}`}
                      >
                        {COLONY_GAME_NAMES[g.id]}
                      </button>
                    ))}
                  </div>
                  {board.length === 0 ? (
                    <p className="p-4 rounded-xl bg-white/5 text-xs text-white/70 text-center">Nadie ha jugado esta semana. ¡Marca el primer puntaje!</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 items-end gap-2 pt-2">
                        {podium.map((e, i) => {
                          const place = i === 1 ? 1 : i === 0 ? 2 : 3;
                          const h = place === 1 ? 'h-20' : place === 2 ? 'h-14' : 'h-10';
                          const medal = place === 1 ? 'from-[#fde68a] to-[#f59e0b]' : place === 2 ? 'from-[#e2e8f0] to-[#94a3b8]' : 'from-[#fdba74] to-[#c2410c]';
                          return (
                            <div key={place} className="flex flex-col items-center">
                              {e ? (
                                <>
                                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${medal} p-0.5 ${e.userId === activeUserId ? 'ring-2 ring-[#d4ff4a]' : ''}`}>
                                    <div className={`w-full h-full rounded-full ${e.avatarBg} flex items-center justify-center text-[11px] font-black text-white`}>{e.initials}</div>
                                  </div>
                                  <span className="mt-1 text-[11px] font-bold text-white truncate max-w-full">{e.userId === activeUserId ? 'Tú' : e.name.split(' ')[0]}</span>
                                  <span className="text-[10px] text-[#d4ff4a] font-black">{e.score} pts</span>
                                </>
                              ) : (
                                <span className="text-[10px] text-white/30 mb-1">—</span>
                              )}
                              <div className={`mt-1 w-full ${h} rounded-t-xl bg-gradient-to-b ${medal} opacity-80 flex items-start justify-center pt-1 text-sm font-black text-[#120822]`}>{place}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="space-y-1.5">
                        {board.slice(3, 6).map((entry, idx) => (
                          <div
                            key={entry.userId}
                            className={`p-2 rounded-xl border flex items-center justify-between text-xs ${entry.userId === activeUserId ? 'bg-[#501f92]/40 border-[#d4ff4a]/60' : 'bg-white/5 border-white/5'}`}
                          >
                            <span className="text-white"><span className="text-white/50 mr-2">#{idx + 4}</span>{entry.userId === activeUserId ? 'Tú' : entry.name}</span>
                            <span className="text-[#d4ff4a] font-bold">{entry.score} pts</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {activeGame && (
              <ColoniaMinigames
                type={activeGame}
                activeChallenge={activeChallenge}
                teammates={teammates}
                currentUser={currentUser}
                onChallengeCreated={(ch) => {
                  refreshColonyData();
                  showToast(`Reto enviado a ${ch.challengedName.split(' ')[0]} ⚔️`);
                }}
                onComplete={(gameId: ColonyGameId, score: number) => {
                  setLastGameResult({ gameId, score });
                  setActiveChallenge(null);
                  refreshColonyData();
                  setActiveGame(null);
                }}
                onClose={() => {
                  setActiveChallenge(null);
                  refreshColonyData();
                  setActiveGame(null);
                }}
              />
            )}
          </div>
        );
      })()}

      <ColoniaSocialInbox
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        receivedChallenges={myChallenges.received}
        sentChallenges={myChallenges.sent}
        historyChallenges={myChallenges.results}
        activeUserId={activeUserId}
        onPlayChallenge={(ch) => {
          setIsInboxOpen(false);
          setActiveChallenge(ch);
          setActiveGame(ch.gameId);
        }}
        onRematch={(ch) => {
          setIsInboxOpen(false);
          setActiveChallenge(null);
          setActiveGame(ch.gameId);
        }}
        onOpenNewChallenge={() => {
          setIsInboxOpen(false);
          showToast('Juega una partida y al final elige a quién retar ⚔️');
        }}
      />
      <ColoniaRankingView
        isOpen={isRankingOpen}
        onClose={() => setIsRankingOpen(false)}
        weeklyBoards={weeklyBoards}
        initialGame={rankingGame}
        activeUserId={activeUserId}
        onPlayGame={(g) => {
          setIsRankingOpen(false);
          setActiveGame(g);
        }}
      />
    </div>
  );
};
