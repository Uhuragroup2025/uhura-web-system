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

import buckyHoodieHappyImg from '../../../assets/images/eco/eco-thumbs-up.webp';
import buckyFocusImg from '../../../assets/images/eco/eco-focus.webp';
import buckyCelebratingImg from '../../../assets/images/eco/eco-celebrating.webp';

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
              src={buckyHoodieHappyImg}
              alt="ECO Uhura"
              className="w-24 h-24 object-contain drop-shadow-xl"
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VISTA 2: EL HÁBITAT Y MINIJUEGOS DE BUCKY (EXPERIENCIAL / LÚDICO) */}
      {/* ==================================================================== */}
      {activeTabMode === 'habitat' && (
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Bar Hábitat */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTabMode('fichas')}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                <span>Volver a Fichas Humanas</span>
              </button>
              <span className="text-xs text-white/60">•</span>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>🪵</span>
                <span>Jugar en La Colonia · Minijuegos</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInboxOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <span>⚔️ Retos</span>
                {myChallenges.received.length > 0 && (
                  <span className="px-1.5 rounded-full bg-[#d4ff4a] text-[#120822] text-[10px] font-black">{myChallenges.received.length}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsRankingOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>Ranking</span>
              </button>
              <button
                onClick={() => setSoundOn(!soundOn)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}
              >
                {soundOn ? <Volume2 className="w-4 h-4 text-[#d4ff4a]" /> : <VolumeX className="w-4 h-4 text-white/60" />}
              </button>
              <button
                onClick={handleToggleAmbient}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Cambiar iluminación del hábitat"
              >
                {ambientTime === 'night' ? <Moon className="w-4 h-4 text-[#c9b7ff]" /> : ambientTime === 'sunset' ? <Sunset className="w-4 h-4 text-[#f59e0b]" /> : <Sun className="w-4 h-4 text-[#fbbf24]" />}
              </button>
            </div>
          </div>

          {/* Contenido de Minijuegos y Retos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda: Retador y Minijuegos Activos */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1e113a] to-[#2e1859] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4ff4a] bg-white/10 px-2 py-0.5 rounded-full">
                      Pausa Saludable · 15 Segundos
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">
                      Minijuegos Rápidos de la Colonia
                    </h3>
                  </div>
                  <img
                    src={buckyFocusImg}
                    alt="ECO"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  Despeja la mente entre tareas: cada partida dura 15 segundos. Juega, reta a alguien del equipo y mira quién gana.
                </p>

                {/* Retos: lo pendiente y el último resultado, a la vista */}
                {(myChallenges.received.length > 0 || latestResult) && (
                  <div className="space-y-2">
                    {myChallenges.received.slice(0, 2).map((ch) => (
                      <div key={ch.id} className="p-3 rounded-2xl bg-[#501f92]/40 border border-[#d4ff4a]/60 flex items-center justify-between gap-3 text-xs">
                        <span className="text-white">
                          <strong>{ch.challengerName.split(' ')[0]}</strong> te retó en {COLONY_GAME_NAMES[ch.gameId]} con{' '}
                          <strong className="text-[#d4ff4a]">{ch.challengerScore} pts</strong>
                          <span className="text-white/50"> · {relativeTimeEs(ch.createdAt)}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChallenge(ch);
                            setActiveGame(ch.gameId);
                          }}
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-[#d4ff4a] text-[#120822] font-black cursor-pointer"
                        >
                          Aceptar reto
                        </button>
                      </div>
                    ))}
                    {latestResult && (() => {
                      const outcome = challengeOutcomeFor(latestResult, activeUserId);
                      const iAmChallenger = latestResult.challengerUserId === activeUserId;
                      const mine = iAmChallenger ? latestResult.challengerScore : latestResult.challengedScore ?? 0;
                      const theirs = iAmChallenger ? latestResult.challengedScore ?? 0 : latestResult.challengerScore;
                      const rival = (iAmChallenger ? latestResult.challengedName : latestResult.challengerName).split(' ')[0];
                      return (
                        <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${outcome === 'won' ? 'bg-[#d4ff4a]/10 border-[#d4ff4a]/50' : 'bg-white/5 border-white/10'}`}>
                          <span className="text-white">
                            {outcome === 'won' ? '🏆 ' : outcome === 'lost' ? '😅 ' : '🤝 '}
                            <strong>
                              {outcome === 'won'
                                ? `Ganaste ${mine} a ${theirs} contra ${rival}`
                                : outcome === 'lost'
                                ? `${rival} te ganó ${theirs} a ${mine}`
                                : `Empate ${mine} a ${theirs} con ${rival}`}
                            </strong>
                            <span className="text-white/50"> · {COLONY_GAME_NAMES[latestResult.gameId]} · {relativeTimeEs(latestResult.completedAt)}</span>
                          </span>
                          <button type="button" onClick={() => setActiveGame(latestResult.gameId)} className="shrink-0 text-[#d4ff4a] font-bold hover:underline cursor-pointer">
                            Revancha
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setActiveGame('torre')}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-2xl mb-2">🪵</div>
                    <h4 className="font-bold text-white text-sm group-hover:text-[#d4ff4a] transition-colors">
                      Torre de Troncos
                    </h4>
                    <p className="text-[11px] text-white/60 mt-1">
                      Suelta cada tronco alineado con la base y apila lo más alto posible.
                    </p>
                  </button>

                  <button
                    onClick={() => setActiveGame('nenufar')}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-2xl mb-2">🌿</div>
                    <h4 className="font-bold text-white text-sm group-hover:text-[#d4ff4a] transition-colors">
                      Salto de Nenúfares
                    </h4>
                    <p className="text-[11px] text-white/60 mt-1">
                      Toca el nenúfar donde aparezca ECO lo más rápido que puedas.
                    </p>
                  </button>
                </div>
              </div>

              {/* Si hay un juego activo */}
              {activeGame && (
                <div className="p-6 rounded-3xl bg-[#140b27] border border-[#8a4dff]/40 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-[#d4ff4a]" />
                      <span>Jugando: {activeGame === 'torre' ? 'Torre de Troncos' : 'Salto de Nenúfares'}</span>
                    </h4>
                    <button
                      onClick={() => setActiveGame(null)}
                      className="text-xs text-white/60 hover:text-white cursor-pointer"
                    >
                      Cerrar juego ×
                    </button>
                  </div>

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
                </div>
              )}
            </div>

            {/* Columna Derecha: Ranking semanal (mejor puntaje de cada persona; se reinicia el lunes) */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#180d32] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#fbbf24]" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ranking semanal</h4>
                  </div>
                  <span className="text-[10px] text-white/50">Se reinicia el lunes</span>
                </div>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 text-[11px] font-bold">
                  {(['torre', 'nenufar'] as ColonyGameId[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setRankingGame(g)}
                      className={`py-1.5 rounded-lg cursor-pointer ${rankingGame === g ? 'bg-[#d4ff4a] text-[#120822]' : 'text-white/70 hover:text-white'}`}
                    >
                      {COLONY_GAME_NAMES[g]}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {(weeklyBoards[rankingGame] || []).length === 0 && (
                    <p className="p-3 rounded-xl bg-white/5 text-xs text-white/60 text-center">
                      Nadie ha jugado esta semana. ¡Marca el primer puntaje!
                    </p>
                  )}
                  {(weeklyBoards[rankingGame] || []).slice(0, 5).map((entry, idx) => {
                    const isMe = entry.userId === activeUserId;
                    return (
                      <div
                        key={entry.userId}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${isMe ? 'bg-[#501f92]/40 border-[#d4ff4a]/60' : 'bg-white/5 border-white/5'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#d4ff4a] w-5">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                          <span className="font-medium text-white">{entry.name}</span>
                          {isMe && <span className="text-[9px] font-black px-1.5 rounded bg-[#d4ff4a] text-[#120822]">Tú</span>}
                        </div>
                        <span className="text-white/80 font-bold">{entry.score} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
