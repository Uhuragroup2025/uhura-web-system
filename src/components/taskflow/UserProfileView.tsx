import { RoleMultiSelect } from '../ui/RoleMultiSelect';
import { UserAccessCard } from './auth/UserAccessCard';
import React, { useState } from 'react';
import {
  UserItem,
  OrbitAccessLevel,
  UserRole,
  UserStatus,
  STANDARD_UHURA_ROLES,
  StandardUhuraRole
} from './types';
import {
  ChevronRight,
  ChevronDown,
  Camera,
  Key,
  Lock,
  Mail,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  X,
  Shield,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface UserProfileViewProps {
  user: UserItem;
  allUsers?: UserItem[];
  onBack: () => void;
  onUpdateUser?: (updatedUser: UserItem) => void;
  onDeleteUser?: (userId: string) => void;
  currentUser?: UserItem;
}

/**
 * Calcula la antigüedad a partir de joinedDate o anniversaryYears
 */
function calculateSeniority(joinedDate?: string, anniversaryYears?: number): string {
  if (anniversaryYears !== undefined && anniversaryYears > 0) {
    return `${anniversaryYears} ${anniversaryYears === 1 ? 'año' : 'años'} en Uhura`;
  }
  if (!joinedDate) return 'Sin fecha';

  const match = joinedDate.match(/\b(20\d{2})\b/);
  if (match) {
    const year = parseInt(match[1], 10);
    const currentYear = 2026;
    const diff = Math.max(0, currentYear - year);
    if (diff === 0) return 'Menos de 1 año en Uhura';
    return `${diff} ${diff === 1 ? 'año' : 'años'} en Uhura`;
  }
  return '2 años en Uhura';
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  allUsers = [],
  onBack,
  onUpdateUser,
  onDeleteUser,
  currentUser
}) => {
  // Form fields
  const [email, setEmail] = useState<string>(user.email || '');
  const [officialRoleName, setOfficialRoleName] = useState<string>(
    user.officialRole || user.jobTitle || ''
  );
  // Roles profesionales (uno o varios; el primero es el principal). Solo catálogo oficial.
  const [professionalRoles, setProfessionalRoles] = useState<string[]>(() => {
    const fromUser = (user.officialRoles && user.officialRoles.length > 0 ? user.officialRoles : [user.officialRole || user.professionalRole])
      .filter((r): r is StandardUhuraRole => Boolean(r) && (STANDARD_UHURA_ROLES as readonly string[]).includes(r as string));
    return fromUser.length > 0 ? fromUser : [];
  });
  const [accessLevel, setAccessLevel] = useState<OrbitAccessLevel>(user.accessLevel || 'leader');
  const [leaderId, setLeaderId] = useState<string>(user.leaderId || '');
  const [department, setDepartment] = useState<string>(user.department || 'Operativo (Medios)');
  const [workCalendar, setWorkCalendar] = useState<'CO' | 'MX'>(user.workCalendar || 'CO');
  const [workCalendarSince, setWorkCalendarSince] = useState<string>(user.workCalendarSince || '');
  const [capacityHours, setCapacityHours] = useState<string>(
    user.capacityHours !== undefined ? Number(user.capacityHours).toFixed(2) : '42.00'
  );
  const [joinedDate, setJoinedDate] = useState<string>(user.joinedDate || '');
  const [birthDate, setBirthDate] = useState<string>(
    user.birthDate || user.birthDateFormatted || '26 / 10 / 1993'
  );
  const [city, setCity] = useState<string>(user.city || 'Medellín');
  const [petNames, setPetNames] = useState<string>(user.petNames || '');
  const [hobbies, setHobbies] = useState<string>(
    user.hobbies ||
      'Videojuegos, la playa, viajar, comer,deporte muy enfocado en triatlon. Regalos que me ayuden o lleven a mejorar mi rendimiento deportivo'
  );
  const [personalDream, setPersonalDream] = useState<string>(user.personalDream || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modales
  const [showChangePhotoModal, setShowChangePhotoModal] = useState(false);

  // Estados del modal de Restablecer acceso

  // Estados del modal de Cambiar foto
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>(user.avatarUrl || '');

  // Lista de posibles líderes
  const potentialLeaders = allUsers.filter((u) => u.id !== user.id);
  const currentLeaderUser = allUsers.find((u) => u.id === leaderId || u.name === user.leaderName);
  const leaderDisplayName = currentLeaderUser
    ? currentLeaderUser.name
    : user.leaderName || 'Ana María Giraldo';

  // Label de nivel de acceso
  const accessLevelLabelMap: Record<OrbitAccessLevel, string> = {
    leader: 'Líder',
    collaborator: 'Colaborador',
    client_relationship: 'Client Relationship',
    commercial: 'Comercial',
    administrative: 'Administrativa / Fiscal',
    executive: 'Dirección Ejecutiva',
    system_admin: 'Admin de Sistema',
    pending: 'Pendiente'
  };

  const seniorityText = calculateSeniority(joinedDate, user.anniversaryYears);

  // Guardar cambios del perfil
  const handleSaveChanges = () => {
    if (!onUpdateUser) return;

    const resolvedLeader = allUsers.find((u) => u.id === leaderId);
    const updatedLeaderName = leaderId
      ? resolvedLeader?.name || leaderDisplayName
      : leaderDisplayName;

    const updated: UserItem = {
      ...user,
      email: email.trim(),
      jobTitle: professionalRoles[0] || officialRoleName.trim(),
      officialRole: (professionalRoles[0] || officialRoleName) as StandardUhuraRole,
      professionalRole: (professionalRoles[0] || officialRoleName) as StandardUhuraRole,
      officialRoles: professionalRoles as StandardUhuraRole[],
      professionalRoles: professionalRoles as StandardUhuraRole[],
      department: department.trim(),
      leaderId: leaderId || undefined,
      reportsTo: leaderId || undefined,
      leaderName: updatedLeaderName,
      capacityHours: parseFloat(capacityHours) || 42,
      joinedDate: joinedDate.trim(),
      birthDate: birthDate.trim(),
      birthDateFormatted: birthDate.trim(),
      city: city.trim(),
      petNames: petNames.trim() || undefined,
      hobbies: hobbies.trim() || undefined,
      personalDream: personalDream.trim() || undefined,
      accessLevel,
      avatarUrl,
      workCalendar,
      workCalendarSince: workCalendarSince || null
    };

    // Historial de cambios (previsualización; en producción lo genera el backend)
    const nowIso = new Date().toISOString();
    const tracked: Array<[string, string | null | undefined, string | null | undefined]> = [
      ['Rol profesional', (user.officialRoles || [user.officialRole]).filter(Boolean).join(', '), professionalRoles.join(', ')],
      ['Nivel de acceso', user.accessLevel, accessLevel],
      ['Líder directo', user.leaderName, updatedLeaderName],
      ['Área', user.department, department.trim()],
      ['Capacidad semanal', String(user.capacityHours ?? ''), String(parseFloat(capacityHours) || 42)],
      ['Calendario laboral', user.workCalendar || 'CO', workCalendar + (workCalendarSince ? ` desde ${workCalendarSince}` : '')]
    ];
    const newEntries = tracked
      .filter(([, prev, next]) => (prev || '') !== (next || ''))
      .map(([field, prev, next], i) => ({
        id: `audit-${Date.now()}-${i}`,
        userId: user.id,
        field,
        previousValue: prev || null,
        newValue: next || null,
        changedAt: nowIso,
        changedByUserId: 'current-user',
        changedByUserName: 'Tú'
      }));
    updated.profileHistory = [...newEntries, ...(user.profileHistory || [])];

    onUpdateUser(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Guardar foto
  const handleSavePhoto = () => {
    setAvatarUrl(newPhotoUrl.trim() || null);
    setShowChangePhotoModal(false);
  };

  // Definición de tarjetas "Qué puede hacer en ECO" según el rol
  const getPermissionScopeDescription = (moduleKey: string): string => {
    if (accessLevel === 'system_admin' || accessLevel === 'executive') {
      return 'ver, crear, editar, administrar · toda la organización';
    }
    if (accessLevel === 'leader') {
      switch (moduleKey) {
        case 'mi-dia':
          return 'ver, editar · sobre su equipo';
        case 'proyectos':
          return 'ver, crear, editar · sobre su equipo';
        case 'tareas':
          return 'ver, crear, editar, aprobar · sobre su equipo';
        case 'horas':
          return 'ver, editar · sobre su equipo';
        case 'capacidad':
          return 'ver · sobre su equipo';
        case 'clientes':
          return 'ver · sobre su equipo';
        default:
          return 'ver, editar · sobre su equipo';
      }
    }
    if (accessLevel === 'collaborator') {
      switch (moduleKey) {
        case 'mi-dia':
          return 'ver, editar · sus propias tareas';
        case 'proyectos':
          return 'ver · proyectos asignados';
        case 'tareas':
          return 'ver, editar · tareas asignadas';
        case 'horas':
          return 'ver, registrar · horas propias';
        case 'capacidad':
          return 'ver · disponibilidad personal';
        case 'clientes':
          return 'sin acceso directo';
        default:
          return 'acceso restringido';
      }
    }
    if (accessLevel === 'commercial') {
      switch (moduleKey) {
        case 'mi-dia':
          return 'ver, editar · oportunidades y briefs';
        case 'proyectos':
          return 'ver · toda la cartera';
        case 'tareas':
          return 'ver · tareas asignadas';
        case 'horas':
          return 'ver, registrar · horas propias';
        case 'capacidad':
          return 'ver · disponibilidad global';
        case 'clientes':
          return 'ver, crear, editar · toda la organización';
        default:
          return 'acceso comercial';
      }
    }
    return 'ver, editar · sobre su equipo';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-150">
      {/* 1. Header con Breadcrumb Estandarizado (Benchmark Staging) */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <button
          onClick={onBack}
          className="font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
        >
          Equipo & Accesos
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
        <span className="font-bold text-[#0f172a] truncate">{user.name}</span>
      </div>

      {/* Alerta de guardado exitoso */}
      {saveSuccess && (
        <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-xs font-medium flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
            <span>Los cambios de perfil fueron guardados correctamente.</span>
          </div>
        </div>
      )}

      {/* 2. CARD PRINCIPAL: Identidad, Datos de Colaborador y Acceso */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Cabecera del Perfil */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-4">
            {/* Avatar Circle */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#3b186b] text-white flex items-center justify-center text-xl font-bold font-serif shrink-0 shadow-sm overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarUrl(null)}
                  />
                ) : (
                  <span>{user.initials || 'CV'}</span>
                )}
              </div>
            </div>

            {/* Nombre y Rol */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
                {user.name}
              </h1>
              <p className="text-xs text-[#64748b] font-medium">
                {(professionalRoles.length > 0 ? professionalRoles.join(' · ') : officialRoleName)} · {department}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#f3e8ff] text-[#6b21a8] border border-[#e9d5ff]">
                  {accessLevelLabelMap[accessLevel] || 'Líder'}
                </span>
                <span className="text-xs text-[#475569]">
                  Líder directo: <strong className="font-semibold text-[#0f172a]">{leaderDisplayName}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Botón de cabecera: Cambiar foto (el acceso se gestiona en «Acceso a ECO») */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Botón Cambiar foto */}
            <button
              type="button"
              onClick={() => setShowChangePhotoModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-xs font-semibold text-[#334155] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-all shadow-2xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-[#64748b]" />
              <span>Cambiar foto</span>
            </button>
          </div>
        </div>

        {/* Separador sutil */}
        <div className="h-px bg-[#f1f5f9]" />

        {/* Formulario de Campos (2 Columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-1">
          {/* Row 1: CORREO | ROL PROFESIONAL */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              CORREO
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              ROL PROFESIONAL
            </label>
            <RoleMultiSelect
              options={STANDARD_UHURA_ROLES}
              selected={professionalRoles}
              onChange={(roles) => {
                setProfessionalRoles(roles);
                if (roles[0]) setOfficialRoleName(roles[0]);
              }}
            />
            <span className="text-[10.5px] text-[#64748b] mt-1 block">Uno o varios. El primero es el principal. Distinto del nivel de acceso.</span>
          </div>

          {/* Row 2: NIVEL DE ACCESO | LÍDER DIRECTO */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              NIVEL DE ACCESO
            </label>
            <div className="relative">
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as OrbitAccessLevel)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] appearance-none focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all pr-8 cursor-pointer"
              >
                <option value="leader">Líder</option>
                <option value="collaborator">Colaborador</option>
                <option value="client_relationship">Client Relationship</option>
                <option value="commercial">Comercial</option>
                <option value="administrative">Administrativa / Fiscal</option>
                <option value="executive">Dirección Ejecutiva</option>
                <option value="system_admin">Admin de Sistema</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#94a3b8] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              LÍDER DIRECTO
            </label>
            <div className="relative">
              <select
                value={leaderId}
                onChange={(e) => setLeaderId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] appearance-none focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all pr-8 cursor-pointer"
              >
                <option value="">{user.leaderName || 'Ana María Giraldo'}</option>
                {potentialLeaders.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#94a3b8] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Row 3: ÁREA | CAPACIDAD SEMANAL (HORAS) */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              ÁREA
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] appearance-none focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all pr-8 cursor-pointer"
              >
                <option value="Operativo (Medios)">Operativo (Medios)</option>
                <option value="Dirección de Producto">Dirección de Producto</option>
                <option value="Diseño & Creatividad">Diseño & Creatividad</option>
                <option value="Desarrollo & Tecnología">Desarrollo & Tecnología</option>
                <option value="Comercial & Cuentas">Comercial & Cuentas</option>
                <option value="Administración & Finanzas">Administración & Finanzas</option>
                <option value="Dirección General">Dirección General</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#94a3b8] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              CAPACIDAD SEMANAL (HORAS)
            </label>
            <input
              type="text"
              value={capacityHours}
              onChange={(e) => setCapacityHours(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all"
            />
          </div>

          {/* Calendario laboral (festivos que descuentan capacidad) */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              CALENDARIO LABORAL
            </label>
            <select
              value={workCalendar}
              onChange={(e) => setWorkCalendar(e.target.value as 'CO' | 'MX')}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
            >
              <option value="CO">Colombia</option>
              <option value="MX">México</option>
            </select>
            <span className="text-[10.5px] text-[#64748b] mt-1 block">Define qué festivos descuentan su capacidad.</span>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              CALENDARIO VIGENTE DESDE
            </label>
            <input
              type="date"
              value={workCalendarSince}
              onChange={(e) => setWorkCalendarSince(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
            />
            <span className="text-[10.5px] text-[#64748b] mt-1 block">Las semanas anteriores no se recalculan.</span>
          </div>

          {/* Row 4: FECHA DE INGRESO | CUMPLEAÑOS */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              FECHA DE INGRESO
            </label>
            <div className="relative">
              <input
                type="text"
                value={joinedDate}
                onChange={(e) => setJoinedDate(e.target.value)}
                placeholder="01 / 07 / 2024"
                className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all pr-9"
              />
              <Calendar className="w-4 h-4 text-[#64748b] absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-[#64748b] mt-1 font-medium">{seniorityText}</p>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              CUMPLEAÑOS
            </label>
            <div className="relative">
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="26 / 10 / 1993"
                className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all pr-9"
              />
              <Calendar className="w-4 h-4 text-[#64748b] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Row 5: CIUDAD | MASCOTAS */}
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              CIUDAD
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ej: Medellín"
              className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              MASCOTAS
            </label>
            <input
              type="text"
              value={petNames}
              onChange={(e) => setPetNames(e.target.value)}
              placeholder="Ej: Max y Luna"
              className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all"
            />
          </div>

          {/* Row 6: GUSTOS Y PASATIEMPOS (col-span-full) */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              GUSTOS Y PASATIEMPOS
            </label>
            <input
              type="text"
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
              placeholder="Ej: Videojuegos, la playa, viajar..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all"
            />
          </div>

          {/* Row 7: SU SUEÑO ES... (col-span-full) */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1.5">
              SU SUEÑO ES...
            </label>
            <input
              type="text"
              value={personalDream}
              onChange={(e) => setPersonalDream(e.target.value)}
              placeholder=""
              className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all"
            />
          </div>
        </div>

        {/* Botón Guardar cambios al final */}
        <div className="pt-4 border-t border-[#f1f5f9] flex justify-end">
          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-6 py-2.5 bg-[#4c1d95] hover:bg-[#3b1277] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            Guardar cambios
          </button>
        </div>
      </div>

      {/* 3. SECCIÓN INFERIOR: Qué puede hacer en ECO */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
          Qué puede hacer en ECO
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Card Mi Día */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-0.5">
            <p className="text-sm font-bold text-[#0f172a]">Mi Día</p>
            <p className="text-xs text-[#64748b]">
              {getPermissionScopeDescription('mi-dia')}
            </p>
          </div>

          {/* Card Proyectos */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-0.5">
            <p className="text-sm font-bold text-[#0f172a]">Proyectos</p>
            <p className="text-xs text-[#64748b]">
              {getPermissionScopeDescription('proyectos')}
            </p>
          </div>

          {/* Card Tareas */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-0.5">
            <p className="text-sm font-bold text-[#0f172a]">Tareas</p>
            <p className="text-xs text-[#64748b]">
              {getPermissionScopeDescription('tareas')}
            </p>
          </div>

          {/* Card Horas */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-0.5">
            <p className="text-sm font-bold text-[#0f172a]">Horas</p>
            <p className="text-xs text-[#64748b]">
              {getPermissionScopeDescription('horas')}
            </p>
          </div>

          {/* Card Capacidad */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-0.5">
            <p className="text-sm font-bold text-[#0f172a]">Capacidad</p>
            <p className="text-xs text-[#64748b]">
              {getPermissionScopeDescription('capacidad')}
            </p>
          </div>

          {/* Card Clientes */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xs space-y-0.5">
            <p className="text-sm font-bold text-[#0f172a]">Clientes</p>
            <p className="text-xs text-[#64748b]">
              {getPermissionScopeDescription('clientes')}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Acceso a ECO: usuario de ingreso, contraseña temporal y desactivación (solo system_admin, igual a producción) */}
      {onUpdateUser && currentUser?.accessLevel === 'system_admin' && (
        <UserAccessCard user={user} allUsers={allUsers} adminName={currentUser.name} onUpdateUser={onUpdateUser} />
      )}

      {/* Historial de cambios del perfil (previsualización) */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs space-y-2">
        <h2 className="text-base font-bold text-[#0f172a] tracking-tight">Historial de cambios del perfil</h2>
        {(user.profileHistory || []).length === 0 ? (
          <p className="text-xs text-[#94a3b8]">Sin cambios registrados.</p>
        ) : (
          <ul className="space-y-1.5">
            {(user.profileHistory || []).slice(0, 12).map((h) => (
              <li key={h.id || `${h.field}-${h.changedAt}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl border border-[#f1f5f9] text-xs">
                <span>
                  <strong className="text-[#0f172a]">{h.field}:</strong>{' '}
                  <span className="text-[#94a3b8]">{h.previousValue || 'vacío'}</span> → <strong className="text-[#0f172a]">{h.newValue || 'vacío'}</strong>
                </span>
                <span className="text-[10.5px] text-[#94a3b8]">{h.changedByUserName || h.changedByUserId} · {new Date(h.changedAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 4. MODAL: RESTABLECER ACCESO / ASIGNAR CONTRASEÑA (AJUSTE SOLICITADO)      */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 5. MODAL: CAMBIAR FOTO DE PERFIL                                          */}
      {/* ========================================================================= */}
      {showChangePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-[#501f92]" />
                <h3 className="text-base font-bold text-[#0f172a]">Cambiar foto de perfil</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePhotoModal(false)}
                className="w-7 h-7 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#64748b] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center py-2">
                <div className="w-20 h-20 rounded-full bg-[#3b186b] text-white flex items-center justify-center text-2xl font-bold font-serif overflow-hidden shadow-inner">
                  {newPhotoUrl ? (
                    <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    user.initials || 'CV'
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-1">
                  URL de la Fotografía
                </label>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://... o /assets/team/..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
                />
              </div>

              {/* Sugerencias de avatares disponibles en la app */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-[#64748b]">Opciones rápidas de avatar:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPhotoUrl('')}
                    className="px-2.5 py-1 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#475569] hover:bg-[#f8fafc] cursor-pointer"
                  >
                    Iniciales {user.initials || 'CV'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPhotoUrl('/assets/team/camilo-velez.webp')}
                    className="px-2.5 py-1 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#475569] hover:bg-[#f8fafc] cursor-pointer"
                  >
                    Foto oficial Camilo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80')}
                    className="px-2.5 py-1 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#475569] hover:bg-[#f8fafc] cursor-pointer"
                  >
                    Foto profesional
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowChangePhotoModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-[#64748b] hover:text-[#0f172a] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                className="px-4 py-2 bg-[#4c1d95] hover:bg-[#3b1277] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                Aplicar foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
