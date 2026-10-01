import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Award,
  Calendar,
  Smile,
  Edit3,
  Star,
  Users,
  Sparkles,
  Gift,
  Check,
  MapPin,
  Heart,
  ChevronRight
} from 'lucide-react';
import { UserItem } from '../types';

interface TeamHumanProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserItem[];
  selectedUserId?: string;
  onUpdateUser?: (updatedUser: UserItem) => void;
}

/**
 * Calcula la edad en años en runtime a partir de la fecha de nacimiento (ISO 'YYYY-MM-DD').
 * Regla de Gobernanza: La edad NO se persiste como dato estático.
 */
function calculateAgeFromBirthDate(birthDate?: string): number | null {
  if (!birthDate) return null;
  const parts = birthDate.split('-');
  if (parts.length < 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }
  return age > 0 ? age : null;
}

/**
 * Formatea una fecha ISO 'YYYY-MM-DD' a formato legible '16 de Sep'
 */
function formatBirthDateHuman(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
    return `${day} de ${months[monthIdx]}`;
  }
  return dateStr;
}

/**
 * Calcula días restantes hasta el próximo aniversario o cumpleaños anual relativo a fecha de referencia
 */
function getDaysUntilAnnualEvent(
  dateStr?: string,
  refDate: Date = new Date(2026, 8, 16)
): { days: number; isToday: boolean; badgeText: string; isThisMonth: boolean } | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length < 3) return null;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return null;

  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth() + 1; // 1-12
  const currentDay = refDate.getDate();

  if (month === currentMonth && day === currentDay) {
    return { days: 0, isToday: true, badgeText: '¡Hoy!', isThisMonth: true };
  }

  let nextDate = new Date(currentYear, month - 1, day);
  if (nextDate.getTime() < refDate.getTime() && nextDate.toDateString() !== refDate.toDateString()) {
    nextDate = new Date(currentYear + 1, month - 1, day);
  }

  const diffTime = nextDate.getTime() - refDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isThisMonth = month === currentMonth;

  let badgeText = `En ${diffDays}d`;
  if (diffDays === 1) badgeText = 'Mañana';
  else if (diffDays <= 7) badgeText = `En ${diffDays} días`;
  else if (isThisMonth) badgeText = 'Este mes';

  return { days: diffDays, isToday: false, badgeText, isThisMonth };
}

export const TeamHumanProfileModal: React.FC<TeamHumanProfileModalProps> = ({
  isOpen,
  onClose,
  users,
  selectedUserId,
  onUpdateUser
}) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'birthdays' | 'anniversaries'>('all');
  const [filterScope, setFilterScope] = useState<'upcoming' | 'all_year'>('upcoming');
  const [activeUserId, setActiveUserId] = useState<string>(selectedUserId || users[0]?.id || 'u-8');
  
  // Modo edición de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [editHobbies, setEditHobbies] = useState('');
  const [editPersonalDream, setEditPersonalDream] = useState('');
  const [editPetNames, setEditPetNames] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Si cambia selectedUserId externamente, actualizar selección
  React.useEffect(() => {
    if (selectedUserId) {
      setActiveUserId(selectedUserId);
      setIsEditing(false);
    }
  }, [selectedUserId]);

  const activeUser = useMemo(() => {
    return users.find((u) => u.id === activeUserId) || users[0];
  }, [users, activeUserId]);

  const activeUserAge = useMemo(() => {
    return calculateAgeFromBirthDate(activeUser?.birthDate);
  }, [activeUser?.birthDate]);

  // Al iniciar edición, precargar datos canónicos
  const handleStartEdit = () => {
    if (!activeUser) return;
    setEditHobbies(activeUser.hobbies || '');
    setEditPersonalDream(activeUser.personalDream || '');
    setEditPetNames(activeUser.petNames || '');
    setEditCity(activeUser.city || '');
    setEditBirthDate(activeUser.birthDate || '');
    setIsEditing(true);
    setSaveSuccessNotice(false);
  };

  // Guardar cambios en el perfil (actualiza la fuente canónica de la app)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    const trimmedBirthDate = editBirthDate.trim();
    const formattedBday = trimmedBirthDate ? formatBirthDateHuman(trimmedBirthDate) : activeUser.birthDateFormatted;

    const updatedUser: UserItem = {
      ...activeUser,
      hobbies: editHobbies.trim() || undefined,
      personalDream: editPersonalDream.trim() || undefined,
      petNames: editPetNames.trim() || undefined,
      city: editCity.trim() || undefined,
      birthDate: trimmedBirthDate || activeUser.birthDate,
      birthDateFormatted: formattedBday
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    setIsEditing(false);
    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
    }, 4000);
  };

  // Enriquecer usuarios con proximidad de fechas para filtros inteligentes
  const usersWithMetrics = useMemo(() => {
    return users.map((u) => {
      const bdayInfo = getDaysUntilAnnualEvent(u.birthDate);
      const anniInfo = getDaysUntilAnnualEvent(u.anniversaryDate);
      return {
        ...u,
        bdayInfo,
        anniInfo
      };
    });
  }, [users]);

  // Contadores para pestañas
  const counts = useMemo(() => {
    const upcomingBdays = usersWithMetrics.filter(
      (u) => u.bdayInfo && (u.bdayInfo.isToday || u.bdayInfo.days <= 45)
    ).length;
    const upcomingAnnis = usersWithMetrics.filter(
      (u) => u.anniInfo && (u.anniInfo.isToday || u.anniInfo.days <= 60)
    ).length;

    return {
      all: users.length,
      birthdaysUpcoming: upcomingBdays,
      anniversariesUpcoming: upcomingAnnis
    };
  }, [usersWithMetrics, users.length]);

  // Lista filtrada y ordenada según el filtro seleccionado
  const filteredUsers = useMemo(() => {
    let list = [...usersWithMetrics];

    // 1. Filtrado por texto
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.jobTitle && u.jobTitle.toLowerCase().includes(q)) ||
          (u.department && u.department.toLowerCase().includes(q)) ||
          (u.city && u.city.toLowerCase().includes(q))
      );
    }

    // 2. Filtro por categoría y orden inteligente
    if (activeFilter === 'birthdays') {
      if (filterScope === 'upcoming') {
        // Muestra próximos 45 días o del mes
        list = list.filter((u) => u.bdayInfo && (u.bdayInfo.isToday || u.bdayInfo.days <= 45));
      }
      // Ordenar por cercanía cronológica del próximo cumpleaños
      list.sort((a, b) => (a.bdayInfo?.days ?? 999) - (b.bdayInfo?.days ?? 999));
    } else if (activeFilter === 'anniversaries') {
      if (filterScope === 'upcoming') {
        // Muestra hoy y próximos 60 días
        list = list.filter((u) => u.anniInfo && (u.anniInfo.isToday || u.anniInfo.days <= 60));
      }
      // Ordenar por cercanía cronológica del aniversario
      list.sort((a, b) => (a.anniInfo?.days ?? 999) - (b.anniInfo?.days ?? 999));
    }

    return list;
  }, [usersWithMetrics, search, activeFilter, filterScope]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#2e1859] via-[#501f92] to-[#7c3aed] text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
              <Users className="w-5 h-5 text-[#d4ff4a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Ficha Humana del Equipo</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Cultura Uhura
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Conoce, conecta y mantén actualizada la dimensión humana de la colonia.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Decorative background glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#d4ff4a]/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* NOTIFICACIÓN DE GUARDADO EXITOSO */}
        {saveSuccessNotice && (
          <div className="bg-[#ecfdf5] border-b border-[#a7f3d0] px-5 py-2.5 flex items-center justify-between text-xs text-[#065f46] animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#10b981]" />
              <span className="font-semibold">¡Ficha humana actualizada! Los cambios se sincronizaron en Orbit.</span>
            </div>
            <button
              onClick={() => setSaveSuccessNotice(false)}
              className="text-[#059669] hover:text-[#047857] text-[11px] font-bold"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* BODY (TWO COLUMNS) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-[#fafafa]">
          {/* LEFT COLUMN: TEAM MEMBERS LIST */}
          <div className="w-full md:w-80 border-r border-[#e2e8f0] bg-white flex flex-col shrink-0">
            {/* Search & Main Filter Tabs */}
            <div className="p-3.5 border-b border-[#f1f5f9] space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, cargo o ciudad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-[#7c3aed]"
                />
              </div>

              {/* Main Category Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-[#f1f5f9] p-1 rounded-xl text-[11px]">
                <button
                  onClick={() => {
                    setActiveFilter('all');
                    setIsEditing(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-white text-[#501f92] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                >
                  Todos ({counts.all})
                </button>

                <button
                  onClick={() => {
                    setActiveFilter('birthdays');
                    setIsEditing(false);
                  }}
                  className={`py-1.5 px-1.5 rounded-lg font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activeFilter === 'birthdays'
                      ? 'bg-white text-[#db2777] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                  title="Ver colaboradores con próximos cumpleaños"
                >
                  <span>🎂 Cumples</span>
                  <span className="text-[10px] bg-[#fdf2f8] text-[#db2777] px-1 rounded-full font-black">
                    {counts.birthdaysUpcoming}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveFilter('anniversaries');
                    setIsEditing(false);
                  }}
                  className={`py-1.5 px-1.5 rounded-lg font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activeFilter === 'anniversaries'
                      ? 'bg-white text-[#7c3aed] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                  }`}
                  title="Ver aniversarios de la colonia"
                >
                  <span>🎉 Aniversarios</span>
                  <span className="text-[10px] bg-[#f5f3ff] text-[#7c3aed] px-1 rounded-full font-black">
                    {counts.anniversariesUpcoming}
                  </span>
                </button>
              </div>

              {/* Scope Selector when filtering by Birthdays or Anniversaries */}
              {activeFilter !== 'all' && (
                <div className="flex items-center justify-between pt-1 text-[11px] text-[#64748b]">
                  <span className="text-[10px] font-medium">Ventana de tiempo:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setFilterScope('upcoming')}
                      className={`px-2 py-0.5 rounded-md font-semibold text-[10px] cursor-pointer transition-colors ${
                        filterScope === 'upcoming'
                          ? 'bg-[#501f92] text-white'
                          : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#e2e8f0]'
                      }`}
                    >
                      Próximos
                    </button>
                    <button
                      onClick={() => setFilterScope('all_year')}
                      className={`px-2 py-0.5 rounded-md font-semibold text-[10px] cursor-pointer transition-colors ${
                        filterScope === 'all_year'
                          ? 'bg-[#501f92] text-white'
                          : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#e2e8f0]'
                      }`}
                    >
                      Todo el año ({users.length})
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Members Scroll List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#f8fafc] p-2 space-y-1">
              {filteredUsers.map((user) => {
                const isSelected = user.id === activeUser?.id;

                // Badge descriptivo según pestaña activa
                let dynamicBadge: React.ReactNode = null;
                if (activeFilter === 'birthdays') {
                  const bday = user.bdayInfo;
                  if (bday) {
                    dynamicBadge = (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                          bday.isToday
                            ? 'bg-[#fdf2f8] text-[#db2777] border border-[#fbcfe8] animate-pulse'
                            : 'bg-[#fdf2f8] text-[#db2777]'
                        }`}
                      >
                        <span>🎂 {user.birthDateFormatted}</span>
                        <span className="opacity-75">· {bday.badgeText}</span>
                      </span>
                    );
                  }
                } else if (activeFilter === 'anniversaries') {
                  const anni = user.anniInfo;
                  if (anni) {
                    dynamicBadge = (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                          anni.isToday
                            ? 'bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe] animate-pulse'
                            : 'bg-[#f5f3ff] text-[#7c3aed]'
                        }`}
                      >
                        <span>🎉 {user.anniversaryYears ? `${user.anniversaryYears}a` : 'Ingreso'}</span>
                        <span className="opacity-75">· {anni.badgeText}</span>
                      </span>
                    );
                  }
                } else if (user.birthDateFormatted) {
                  dynamicBadge = (
                    <span className="text-[10px] font-medium text-[#7c3aed] bg-[#f5f3ff] px-2 py-0.5 rounded-full shrink-0">
                      {user.birthDateFormatted}
                    </span>
                  );
                }

                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      setActiveUserId(user.id);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#f5f3ff] border border-[#ddd6fe] shadow-2xs'
                        : 'hover:bg-[#f8fafc] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl ${
                          user.avatarBg || 'bg-[#501f92]'
                        } text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs`}
                      >
                        {user.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0f172a] truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-[#64748b] truncate">
                          {user.jobTitle || user.role}
                        </p>
                      </div>
                    </div>

                    {dynamicBadge}
                  </button>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="p-6 text-center text-[#64748b] text-xs space-y-2">
                  <p>No se encontraron colaboradores en este criterio.</p>
                  {activeFilter !== 'all' && filterScope === 'upcoming' && (
                    <button
                      onClick={() => setFilterScope('all_year')}
                      className="text-[11px] font-bold text-[#7c3aed] hover:underline"
                    >
                      Ver todo el año ({users.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILED HUMAN PROFILE (READ / EDIT MODE) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {activeUser ? (
              <>
                {/* Profile Card Header */}
                <div className="bg-white p-5 rounded-3xl border border-[#e2e8f0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-3xl ${
                        activeUser.avatarBg || 'bg-[#501f92]'
                      } text-white flex items-center justify-center text-xl font-black shadow-md shrink-0`}
                    >
                      {activeUser.initials}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#0f172a]">
                        {activeUser.name}
                      </h2>
                      <p className="text-xs font-medium text-[#64748b] mt-0.5">
                        {activeUser.jobTitle || activeUser.role} • {activeUser.department || 'Uhura Group'}
                        {activeUser.city ? ` • ${activeUser.city}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* CTA Editar / Cancelar */}
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#501f92] hover:text-white bg-[#f5f3ff] hover:bg-[#501f92] border border-[#ddd6fe] hover:border-[#501f92] transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
                      title="Actualizar datos humanos y pasatiempos"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar ficha</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancelar edición</span>
                    </button>
                  )}
                </div>

                {/* FORMULARIO DE EDICIÓN O VISTA DE DETALLE */}
                {isEditing ? (
                  <form
                    onSubmit={handleSaveProfile}
                    className="bg-white p-5 rounded-3xl border border-[#cbd5e1] shadow-sm space-y-4 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#7c3aed]" />
                        <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                          Actualizar Ficha Humana de {activeUser.name.split(' ')[0]}
                        </h4>
                      </div>
                      <span className="text-[11px] text-[#64748b]">
                        Actualiza tu perfil y comparte tus pasiones
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Ciudad de residencia */}
                      <div>
                        <label className="font-bold text-[#334155] block mb-1">
                          Ciudad de residencia
                        </label>
                        <input
                          type="text"
                          placeholder="ej. Medellín, Cali, Bogotá, Barranquilla..."
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs focus:outline-[#7c3aed] bg-[#f8fafc]"
                        />
                      </div>

                      {/* Fecha de nacimiento */}
                      <div>
                        <label className="font-bold text-[#334155] block mb-1">
                          Fecha de nacimiento
                        </label>
                        <input
                          type="date"
                          value={editBirthDate}
                          onChange={(e) => setEditBirthDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs focus:outline-[#7c3aed] bg-[#f8fafc]"
                        />
                      </div>
                    </div>

                    {/* Pasatiempos e intereses */}
                    <div className="text-xs space-y-1">
                      <label className="font-bold text-[#334155] block">
                        ⚽ Pasatiempos e intereses fuera del trabajo
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Comparte qué te gusta hacer en tu tiempo libre (música, deportes, lectura, arte, cocinar...)"
                        value={editHobbies}
                        onChange={(e) => setEditHobbies(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs focus:outline-[#7c3aed] bg-[#f8fafc] leading-relaxed"
                      />
                    </div>

                    {/* Su sueño es... */}
                    <div className="text-xs space-y-1">
                      <label className="font-bold text-[#334155] block">
                        ⭐ Su sueño o meta personal
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Cuéntanos un sueño personal o proyecto que te inspire (ej. viajar a un lugar especial, aprender algo nuevo...)"
                        value={editPersonalDream}
                        onChange={(e) => setEditPersonalDream(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs focus:outline-[#7c3aed] bg-[#f8fafc] leading-relaxed"
                      />
                    </div>

                    {/* Mascotas */}
                    <div className="text-xs space-y-1">
                      <label className="font-bold text-[#334155] block">
                        🐾 Mascotas de la familia (si tienes)
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Zeus, Kaiser, Cocoa (o dejar vacío si no tienes)"
                        value={editPetNames}
                        onChange={(e) => setEditPetNames(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#cbd5e1] text-xs focus:outline-[#7c3aed] bg-[#f8fafc]"
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f1f5f9]">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#501f92] hover:bg-[#381566] text-white cursor-pointer shadow-xs transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Guardar cambios</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* VISTA DE DETALLE EN MODO LECTURA */
                  <div className="space-y-4">
                    {/* KEY DATES STRIP */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Birthday Card */}
                      <div className="p-4 rounded-2xl bg-white border border-[#fbcfe8] shadow-xs flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#fdf2f8] text-[#db2777] flex items-center justify-center shrink-0">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#be185d] uppercase tracking-wider block">
                            Cumpleaños
                          </span>
                          <p className="text-sm font-black text-[#0f172a]">
                            {activeUser.birthDateFormatted || 'Aún no registrado'}
                            {activeUserAge ? ` · ${activeUserAge} años` : ''}
                          </p>
                          <span className="text-[11px] text-[#64748b] block">
                            {activeUser.birthDate ? `Fecha de nacimiento: ${activeUser.birthDate}` : 'Fecha no configurada'}
                          </span>
                        </div>
                      </div>

                      {/* Work Anniversary Card */}
                      <div className="p-4 rounded-2xl bg-white border border-[#ddd6fe] shadow-xs flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#f5f3ff] text-[#7c3aed] flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wider block">
                            Aniversario en Uhura
                          </span>
                          <p className="text-sm font-black text-[#0f172a]">
                            {activeUser.anniversaryYears
                              ? `Celebra ${activeUser.anniversaryYears} años con nosotros`
                              : 'Miembro del equipo'}
                          </p>
                          <span className="text-[11px] text-[#64748b] block">
                            Ingresó: {activeUser.joinedDate || activeUser.anniversaryDate || 'Fecha pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DETAILED CARDS */}
                    <div className="bg-white p-5 rounded-3xl border border-[#e2e8f0] shadow-xs space-y-4">
                      {/* 1. Pasatiempos y Hobbies (Reales declarados) */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                          <Smile className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                            Pasatiempos e Intereses
                          </h4>
                          {activeUser.hobbies ? (
                            <p className="text-xs text-[#334155] leading-relaxed mt-1">
                              {activeUser.hobbies}
                            </p>
                          ) : (
                            <p className="text-xs text-[#94a3b8] italic mt-1">
                              Aún no registrado — Haz clic en "Editar ficha" para registrar tus intereses.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-[#f1f5f9]" />

                      {/* 2. Su Sueño es... (Real o Vacío Elegante sin inventar) */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-[#f5f3ff] text-[#7c3aed] flex items-center justify-center shrink-0 mt-0.5">
                          <Star className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                            Su Sueño es...
                          </h4>
                          {activeUser.personalDream ? (
                            <p className="text-xs text-[#334155] leading-relaxed mt-1 font-medium italic">
                              "{activeUser.personalDream}"
                            </p>
                          ) : (
                            <p className="text-xs text-[#94a3b8] leading-relaxed mt-1 italic">
                              Aún no registrado — Cuéntanos algo que te gustaría lograr 💜
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 3. Mascotas de la familia (ÚNICAMENTE cuando existan registradas) */}
                      {activeUser.petNames && (
                        <>
                          <div className="border-t border-[#f1f5f9]" />
                          <div className="flex items-start gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-[#f1f5f9] text-[#475569] flex items-center justify-center shrink-0 mt-0.5 text-base">
                              🐾
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                                Mascotas
                              </h4>
                              <p className="text-xs text-[#334155] leading-relaxed mt-1">
                                {activeUser.petNames}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Human connection card */}
                    <div className="p-3.5 rounded-2xl bg-[#faf5ff] border border-[#ddd6fe] text-xs text-[#6d28d9] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#7c3aed] shrink-0" />
                        <span>
                          Cada persona suma su calidez a Uhura Group. ¡Mantén tu ficha al día para celebrar juntos cada logro!
                        </span>
                      </div>
                      <button
                        onClick={handleStartEdit}
                        className="text-xs font-bold text-[#501f92] hover:underline shrink-0 cursor-pointer"
                      >
                        Actualizar mi ficha →
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-[#64748b]">
                Selecciona un compañero para ver su ficha humana.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
