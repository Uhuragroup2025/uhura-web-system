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

/**
 * Generador de contraseñas temporales seguras para UAT / Onboarding
 */
function generateSecurePassword(name: string): string {
  const cleanName = name.split(' ')[0].replace(/[^a-zA-Z]/g, '');
  const randomDigits = Math.floor(100 + Math.random() * 900);
  const symbols = ['!', '#', '$', '%', '*'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return `Uhura2026!${cleanName}${symbol}${randomDigits}`;
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
    user.officialRole || user.jobTitle || 'Growth Manager'
  );
  const [accessLevel, setAccessLevel] = useState<OrbitAccessLevel>(user.accessLevel || 'leader');
  const [leaderId, setLeaderId] = useState<string>(user.leaderId || '');
  const [department, setDepartment] = useState<string>(user.department || 'Operativo (Medios)');
  const [capacityHours, setCapacityHours] = useState<string>(
    user.capacityHours !== undefined ? Number(user.capacityHours).toFixed(2) : '40.00'
  );
  const [joinedDate, setJoinedDate] = useState<string>(user.joinedDate || '01 / 07 / 2024');
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
  const [showResetAccessModal, setShowResetAccessModal] = useState(false);
  const [showChangePhotoModal, setShowChangePhotoModal] = useState(false);

  // Estados del modal de Restablecer acceso
  const [accessMethodTab, setAccessMethodTab] = useState<'email' | 'temp_password'>('temp_password');
  const [emailSentStatus, setEmailSentStatus] = useState<boolean>(false);
  const [tempPassword, setTempPassword] = useState<string>(() => generateSecurePassword(user.name));
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [requirePasswordChange, setRequirePasswordChange] = useState(true);
  const [tempPasswordAssigned, setTempPasswordAssigned] = useState(false);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

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
      jobTitle: officialRoleName.trim(),
      officialRole: officialRoleName as StandardUhuraRole,
      professionalRole: officialRoleName as StandardUhuraRole,
      department: department.trim(),
      leaderId: leaderId || undefined,
      reportsTo: leaderId || undefined,
      leaderName: updatedLeaderName,
      capacityHours: parseFloat(capacityHours) || 40,
      joinedDate: joinedDate.trim(),
      birthDate: birthDate.trim(),
      birthDateFormatted: birthDate.trim(),
      city: city.trim(),
      petNames: petNames.trim() || undefined,
      hobbies: hobbies.trim() || undefined,
      personalDream: personalDream.trim() || undefined,
      accessLevel,
      avatarUrl
    };

    onUpdateUser(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Enviar enlace de restablecimiento por correo
  const handleSendResetEmail = () => {
    setEmailSentStatus(true);
  };

  // Asignar contraseña temporal
  const handleAssignTempPassword = () => {
    setTempPasswordAssigned(true);
  };

  // Copiar credenciales
  const handleCopyCredentials = () => {
    const text = `Acceso a Orbit Uhura Group:\nUsuario: ${email}\nContraseña temporal: ${tempPassword}\nEnlace: https://orbit-rvfp6uj2va-uc.a.run.app/app/`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  // Guardar foto
  const handleSavePhoto = () => {
    setAvatarUrl(newPhotoUrl.trim() || null);
    setShowChangePhotoModal(false);
  };

  // Definición de tarjetas "Qué puede hacer en Orbit" según el rol
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
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-8 shadow-xs space-y-6">
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
                {officialRoleName} · {department}
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

          {/* Botones de Cabecera: Restablecer acceso (NUEVO) y Cambiar foto */}
          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {/* Botón NUEVO de Gestión / Restablecimiento de Contraseña */}
            <button
              type="button"
              onClick={() => {
                setShowResetAccessModal(true);
                setEmailSentStatus(false);
                setTempPasswordAssigned(false);
                setTempPassword(generateSecurePassword(user.name));
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#cbd5e1] bg-white text-xs font-semibold text-[#334155] hover:bg-[#f8fafc] hover:border-[#8a4dff] hover:text-[#501f92] transition-all shadow-2xs cursor-pointer"
              title="Restablecer o asignar contraseña de acceso"
            >
              <Key className="w-3.5 h-3.5 text-[#501f92]" />
              <span>Restablecer acceso</span>
            </button>

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
            <input
              type="text"
              value={officialRoleName}
              onChange={(e) => setOfficialRoleName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] transition-all"
            />
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

      {/* 3. SECCIÓN INFERIOR: Qué puede hacer en Orbit */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
          Qué puede hacer en Orbit
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
      {/* 4. MODAL: RESTABLECER ACCESO / ASIGNAR CONTRASEÑA (AJUSTE SOLICITADO)      */}
      {/* ========================================================================= */}
      {showResetAccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Cabecera del modal */}
            <div className="px-6 py-5 border-b border-[#f1f5f9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f3e8ff] text-[#6b21a8] flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a]">Restablecer acceso</h3>
                  <p className="text-xs text-[#64748b]">
                    Gestiona las credenciales de <strong className="text-[#334155]">{user.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetAccessModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#64748b] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pestañas de método */}
            <div className="flex border-b border-[#f1f5f9] px-6 bg-[#f8fafc]">
              <button
                type="button"
                onClick={() => {
                  setAccessMethodTab('temp_password');
                  setTempPasswordAssigned(false);
                }}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  accessMethodTab === 'temp_password'
                    ? 'border-[#501f92] text-[#501f92]'
                    : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Asignar contraseña temporal (UAT / Rápido)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccessMethodTab('email');
                  setEmailSentStatus(false);
                }}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  accessMethodTab === 'email'
                    ? 'border-[#501f92] text-[#501f92]'
                    : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar enlace por correo</span>
              </button>
            </div>

            {/* Cuerpo del modal */}
            <div className="p-6 space-y-4">
              {/* OPCIÓN 1: Asignar Contraseña Temporal */}
              {accessMethodTab === 'temp_password' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#475569] space-y-1">
                    <p className="font-semibold text-[#0f172a]">
                      Activación inmediata sin depender de servidores de correo
                    </p>
                    <p className="text-[11px] text-[#64748b] leading-relaxed">
                      Define o genera una contraseña para que el colaborador pueda entrar a Orbit ahora mismo durante pruebas UAT o inducción.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                        Contraseña Temporal
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTempPassword(generateSecurePassword(user.name));
                          setTempPasswordAssigned(false);
                        }}
                        className="text-[11px] font-semibold text-[#501f92] hover:text-[#3b1277] flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generar otra</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPasswordText ? 'text' : 'password'}
                        value={tempPassword}
                        onChange={(e) => {
                          setTempPassword(e.target.value);
                          setTempPasswordAssigned(false);
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-xs font-mono text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff] pr-20"
                      />
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPasswordText(!showPasswordText)}
                          className="p-1 text-[#64748b] hover:text-[#0f172a] rounded cursor-pointer"
                          title={showPasswordText ? 'Ocultar' : 'Mostrar'}
                        >
                          {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(tempPassword);
                            setCopiedCredentials(true);
                            setTimeout(() => setCopiedCredentials(false), 2000);
                          }}
                          className="p-1 text-[#64748b] hover:text-[#0f172a] rounded cursor-pointer"
                          title="Copiar contraseña"
                        >
                          {copiedCredentials ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox de seguridad */}
                  <label className="flex items-center gap-2.5 text-xs text-[#334155] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={requirePasswordChange}
                      onChange={(e) => setRequirePasswordChange(e.target.checked)}
                      className="w-4 h-4 rounded border-[#cbd5e1] text-[#501f92] focus:ring-[#8a4dff]"
                    />
                    <span>Requerir cambio de contraseña en el primer inicio de sesión</span>
                  </label>

                  {/* Estado de contraseña asignada */}
                  {tempPasswordAssigned && (
                    <div className="p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs text-[#166534] space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                        <span>Contraseña temporal asignada y activa en el sistema</span>
                      </div>
                      <p className="text-[11px] text-[#15803d]">
                        El usuario ya puede iniciar sesión con su correo <strong>{email}</strong> y la contraseña configurada.
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyCredentials}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#86efac] text-emerald-800 rounded-lg text-xs font-semibold hover:bg-[#f0fdf4] transition-colors cursor-pointer"
                      >
                        {copiedCredentials ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCredentials ? '¡Copiado al portapapeles!' : 'Copiar credenciales completas'}</span>
                      </button>
                    </div>
                  )}

                  {!tempPasswordAssigned && (
                    <button
                      type="button"
                      onClick={handleAssignTempPassword}
                      className="w-full py-2.5 bg-[#4c1d95] hover:bg-[#3b1277] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Guardar y activar contraseña</span>
                    </button>
                  )}
                </div>
              )}

              {/* OPCIÓN 2: Enviar enlace por correo */}
              {accessMethodTab === 'email' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#475569] space-y-1">
                    <p className="font-semibold text-[#0f172a]">
                      Enlace de autoservicio para el usuario
                    </p>
                    <p className="text-[11px] text-[#64748b] leading-relaxed">
                      Se enviará un correo a <strong className="text-[#334155]">{email}</strong> con un enlace seguro de restablecimiento de Django que expira en 24 horas.
                    </p>
                  </div>

                  {emailSentStatus ? (
                    <div className="p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs text-[#166534] space-y-1.5 animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                        <span>Enlace de restablecimiento enviado exitosamente</span>
                      </div>
                      <p className="text-[11px] text-[#15803d]">
                        El correo fue remitido a <strong>{email}</strong>. Indícale al colaborador que revise su bandeja de entrada o spam.
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      className="w-full py-2.5 bg-[#4c1d95] hover:bg-[#3b1277] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Enviar enlace a {email}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#f1f5f9] flex justify-end">
              <button
                type="button"
                onClick={() => setShowResetAccessModal(false)}
                className="px-4 py-2 bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#334155] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: CAMBIAR FOTO DE PERFIL                                          */}
      {/* ========================================================================= */}
      {showChangePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4">
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
