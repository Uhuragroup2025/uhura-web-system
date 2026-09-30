import React, { useState } from 'react';
import {
  UserItem,
  OrbitAccessLevel,
  UserRole,
  UserStatus,
  STANDARD_UHURA_ROLES,
  StandardUhuraRole
} from './types';
import { ROLE_PERMISSIONS_MATRIX } from './auth/permissions';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  Cake,
  Shield,
  Key,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  Save,
  Trash2,
  UserCheck,
  UserX,
  Sparkles,
  Info,
  Briefcase,
  ChevronDown,
  Layers,
  History,
  Lock,
  UserPlus,
  ChevronRight
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
    return `${anniversaryYears} ${anniversaryYears === 1 ? 'año' : 'años'}`;
  }
  if (!joinedDate) return 'Sin fecha';

  const match = joinedDate.match(/\b(20\d{2})\b/);
  if (match) {
    const year = parseInt(match[1], 10);
    const currentYear = 2026;
    const diff = Math.max(0, currentYear - year);
    if (diff === 0) return 'Menos de 1 año';
    return `${diff} ${diff === 1 ? 'año' : 'años'}`;
  }
  return '1 año';
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  allUsers = [],
  onBack,
  onUpdateUser,
  onDeleteUser,
  currentUser
}) => {
  // Estado de edición global del perfil
  const [isEditing, setIsEditing] = useState(false);

  // Permisos según el usuario autenticado actual (currentUser)
  const isSystemAdmin = currentUser
    ? currentUser.accessLevel === 'system_admin' || currentUser.role === 'Admin'
    : false;

  const canEditHireDate = currentUser
    ? (
        currentUser.accessLevel === 'administrative' ||
        currentUser.accessLevel === 'system_admin' ||
        currentUser.accessLevel === 'executive' ||
        currentUser.role === 'Admin'
      )
    : true; // Por defecto permitir si no se ha inyectado contexto explícito

  // 1. Identidad profesional y cargo
  const [jobTitle, setJobTitle] = useState<string>(user.jobTitle || '');
  const [officialRole, setOfficialRole] = useState<StandardUhuraRole | 'none'>(
    user.officialRole || 'none'
  );
  const [department, setDepartment] = useState<string>(user.department || '');
  const [leaderId, setLeaderId] = useState<string>(user.leaderId || '');
  const [city, setCity] = useState<string>(user.city || '');
  const [birthDate, setBirthDate] = useState<string>(user.birthDateFormatted || user.birthDate || '');
  const [joinedDate, setJoinedDate] = useState<string>(user.joinedDate || '');

  // 2. Nivel de acceso funcional RBAC
  const [accessLevel, setAccessLevel] = useState<OrbitAccessLevel>(user.accessLevel || 'collaborator');

  // 3. Atributo técnico secundario de compatibilidad (oculto para usuarios estándar)
  const [systemRole, setSystemRole] = useState<UserRole>(user.role || 'Member');
  const [showTechnicalSettings, setShowTechnicalSettings] = useState(false);

  // 4. Estado activo / inactivo
  const [status, setStatus] = useState<UserStatus>(user.status || 'Active');

  // UI feedback states
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Opciones de niveles RBAC canónicos (Única fuente de autorización funcional)
  const accessLevels: { level: OrbitAccessLevel; label: string; desc: string }[] = [
    { level: 'collaborator', label: 'Colaborador', desc: 'Producción operativa, tareas asignadas, timer personal y La Colonia' },
    { level: 'leader', label: 'Líder de Área / PM', desc: 'Gestión de proyectos, tareas de equipo, capacidad y New Business del área' },
    { level: 'client_relationship', label: 'Client Relationship', desc: 'Supervisión de cuentas cliente, entregables y asignaciones comerciales' },
    { level: 'commercial', label: 'Comercial', desc: 'New Business, formalizaciones, cotizaciones y catálogo de servicios' },
    { level: 'administrative', label: 'Administrativa / Fiscal', desc: 'Auditoría de horas de toda la agencia, datos fiscales y facturación' },
    { level: 'executive', label: 'Dirección Ejecutiva', desc: 'Visión de negocio transversal, excepciones críticas y autorizaciones' },
    { level: 'system_admin', label: 'Administrador de Sistema', desc: 'Control total de la plataforma, roles, usuarios e integraciones' }
  ];

  // Matriz de permisos reactiva según el nivel seleccionado
  const permissions = ROLE_PERMISSIONS_MATRIX[accessLevel] || {};
  const authorizedModules = Object.keys(permissions) as (keyof typeof permissions)[];

  // Lista de posibles líderes (usuarios excluyendo a la persona actual)
  const potentialLeaders = allUsers.filter((u) => u.id !== user.id);

  // Resolver nombre del líder actual
  const currentLeaderUser = allUsers.find((u) => u.id === leaderId || u.name === user.leaderName);
  const leaderDisplayName = currentLeaderUser
    ? currentLeaderUser.name
    : user.leaderName || 'Dirección General (N/A)';

  // Detección de cambios sensibles para preparar auditoría (valor anterior → valor nuevo → fecha → usuario)
  const currentOperatorName = currentUser?.name || currentUser?.email || 'Administrador (Sesión Activa)';
  const currentChangeDateFormatted = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  interface AuditEntryItem {
    field: string;
    from: string;
    to: string;
    date: string;
    operator: string;
    isSensitive: boolean;
  }

  const auditChanges: AuditEntryItem[] = [];

  // 1. Rol Profesional (Sensible)
  const currentOfficialRole = user.officialRole || 'none';
  if (officialRole !== currentOfficialRole) {
    auditChanges.push({
      field: 'Rol Profesional (Catálogo)',
      from: currentOfficialRole === 'none' ? 'Sin rol comercial' : currentOfficialRole,
      to: officialRole === 'none' ? 'Sin rol comercial' : officialRole,
      date: currentChangeDateFormatted,
      operator: currentOperatorName,
      isSensitive: true
    });
  }

  // 2. Nivel RBAC (Sensible)
  if (accessLevel !== (user.accessLevel || 'collaborator')) {
    auditChanges.push({
      field: 'Nivel de Acceso RBAC',
      from: user.accessLevel || 'collaborator',
      to: accessLevel,
      date: currentChangeDateFormatted,
      operator: currentOperatorName,
      isSensitive: true
    });
  }

  // 3. Líder Directo (Sensible)
  if (leaderId !== (user.leaderId || '')) {
    const prevLeader = allUsers.find(u => u.id === user.leaderId)?.name || user.leaderName || 'Dirección General';
    const newLeader = allUsers.find(u => u.id === leaderId)?.name || 'Dirección General (N/A)';
    auditChanges.push({
      field: 'Líder Directo (Reporta a)',
      from: prevLeader,
      to: newLeader,
      date: currentChangeDateFormatted,
      operator: currentOperatorName,
      isSensitive: true
    });
  }

  // 4. Estado de Cuenta (Sensible)
  if (status !== (user.status || 'Active')) {
    auditChanges.push({
      field: 'Estado de Cuenta',
      from: user.status || 'Active',
      to: status,
      date: currentChangeDateFormatted,
      operator: currentOperatorName,
      isSensitive: true
    });
  }

  // 5. Fecha de Ingreso Contractual (Sensible)
  if (joinedDate.trim() && joinedDate.trim() !== user.joinedDate) {
    auditChanges.push({
      field: 'Fecha de Ingreso (Hire Date)',
      from: user.joinedDate || 'No definida',
      to: joinedDate.trim(),
      date: currentChangeDateFormatted,
      operator: currentOperatorName,
      isSensitive: true
    });
  }

  // 6. Otros campos operativos
  if (jobTitle !== (user.jobTitle || '')) {
    auditChanges.push({
      field: 'Cargo Visible (jobTitle)',
      from: user.jobTitle || 'Sin cargo',
      to: jobTitle || 'Sin cargo',
      date: currentChangeDateFormatted,
      operator: currentOperatorName,
      isSensitive: false
    });
  }

  if (department.trim() !== (user.department || '')) {
    auditChanges.push({
      field: 'Departamento',
      from: user.department || 'Sin área',
      to: department.trim() || 'Sin área',
      date: currentChangeDateFormatted,
      operator: currentOperatorName,
      isSensitive: false
    });
  }

  if (city.trim() !== (user.city || '')) {
    auditChanges.push({
      field: 'Ciudad',
      from: user.city || 'Sin ciudad',
      to: city.trim() || 'Sin ciudad',
      date: currentChangeDateFormatted,
      operator: currentOperatorName,
      isSensitive: false
    });
  }

  // Copia de correo al portapapeles
  const handleCopyEmail = () => {
    if (!user.email) return;
    navigator.clipboard.writeText(user.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Guardar cambios
  const handleSaveChanges = () => {
    if (!onUpdateUser) return;

    const resolvedLeader = allUsers.find((u) => u.id === leaderId);
    const updatedLeaderName = leaderId ? resolvedLeader?.name : (user.leaderName || 'Dirección General (N/A)');

    const updatedJoinedDate = canEditHireDate
      ? (joinedDate.trim() || user.joinedDate)
      : user.joinedDate;

    const updated: UserItem = {
      ...user,
      jobTitle: jobTitle.trim() || undefined,
      officialRole: officialRole === 'none' ? undefined : officialRole,
      professionalRole: officialRole === 'none' ? undefined : officialRole,
      department: department.trim() || undefined,
      leaderId: leaderId || undefined,
      reportsTo: leaderId || undefined,
      leaderName: updatedLeaderName,
      city: city.trim() || undefined,
      birthDate: birthDate.trim() || user.birthDate,
      birthDateFormatted: birthDate.trim() || user.birthDateFormatted,
      accessLevel,
      role: systemRole,
      status,
      joinedDate: updatedJoinedDate
    };

    onUpdateUser(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Alternar estado activo / inactivo
  const handleToggleStatus = () => {
    const nextStatus: UserStatus = status === 'Active' ? 'Inactive' : 'Active';
    setStatus(nextStatus);
    if (!isEditing && onUpdateUser) {
      onUpdateUser({
        ...user,
        status: nextStatus
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const seniorityText = calculateSeniority(user.joinedDate, user.anniversaryYears);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-150">
      {/* 1. Header con Breadcrumb Estandarizado */}
      <div className="flex items-center gap-2 text-xs text-[#64748b] border-b border-[#e2e8f0] pb-4">
        <button
          onClick={onBack}
          className="font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
        >
          Equipo & Accesos
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8]" />
        <span className="font-bold text-[#0f172a] truncate max-w-xs sm:max-w-md">{user.name}</span>
      </div>

      {/* Alerta de guardado exitoso */}
      {saveSuccess && (
        <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-xs font-medium flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
            <span>Los cambios de perfil y permisos fueron guardados. Contrato de auditoría preparado.</span>
          </div>
        </div>
      )}

      {/* 2. CARD 1: Identidad y Contexto Laboral */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-7 shadow-xs space-y-6">
        {/* Cabecera del Perfil */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            {/* Foto / Avatar */}
            <div className="relative shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#e2e8f0] shadow-xs"
                />
              ) : (
                <div
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl ${user.avatarBg || 'bg-[#501f92]'} text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xs`}
                >
                  {user.initials}
                </div>
              )}
              {/* Indicador de estado */}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  status === 'Active' ? 'bg-[#16a34a]' : 'bg-[#94a3b8]'
                }`}
                title={status === 'Active' ? 'Colaborador Activo' : 'Colaborador Inactivo'}
              />
            </div>

            {/* Datos Principales */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
                  {user.name}
                </h1>
              </div>

              {/* Cargo y Área (Sin píldoras, lectura fluida) */}
              <div className="text-sm font-medium text-[#475569] flex flex-wrap items-center gap-1.5">
                <span>{jobTitle || 'Colaborador'}</span>
                {department && (
                  <>
                    <span className="text-[#cbd5e1]">·</span>
                    <span className="text-[#64748b]">{department}</span>
                  </>
                )}
              </div>

              {/* Líder y Estado Operativo */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748b] pt-0.5">
                <span>Líder directo: <strong className="text-[#334155] font-semibold">{leaderDisplayName}</strong></span>
                <span className="text-[#cbd5e1]">·</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${
                  status === 'Active' ? 'text-[#16a34a]' : 'text-[#64748b]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-[#16a34a]' : 'bg-[#94a3b8]'}`} />
                  {status === 'Active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Botón de alternar edición del perfil */}
          <div className="self-end sm:self-center">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancelar Edición' : 'Editar Perfil'}</span>
            </button>
          </div>
        </div>

        {/* Separador */}
        <div className="h-px bg-[#f1f5f9]" />

        {/* MODO EDICIÓN COMPLETO: Campos de Identidad Profesional y Contexto */}
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1 animate-in fade-in duration-150">
            {/* Cargo Visible (jobTitle) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Cargo Visible (jobTitle)
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="ej. Product Lead, Front-End Dev"
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
              />
              <p className="text-[10px] text-[#94a3b8]">Denominación funcional visible en la plataforma</p>
            </div>

            {/* Rol Profesional Canónico (officialRole) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center justify-between">
                <span>Rol Oficial (Cotizable)</span>
                <span className="text-[9px] text-[#501f92] font-semibold">12 Roles Canónicos</span>
              </label>
              <select
                value={officialRole}
                onChange={(e) => setOfficialRole(e.target.value as StandardUhuraRole | 'none')}
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
              >
                <option value="none">(Sin rol comercial / Perfil Interno)</option>
                {STANDARD_UHURA_ROLES.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#94a3b8]">Rol del Catálogo de Servicios para costeo y horas</p>
            </div>

            {/* Área / Departamento */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Área / Departamento
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="ej. Dirección de Producto, Creatividad"
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
              />
              <p className="text-[10px] text-[#94a3b8]">Unidad operativa de pertenencia</p>
            </div>

            {/* Líder Directo (Selector de usuarios existentes) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Líder Directo (reportsTo)
              </label>
              <select
                value={leaderId}
                onChange={(e) => setLeaderId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
              >
                <option value="">Sin líder directo / Dirección General</option>
                {potentialLeaders.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.jobTitle || u.role}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#94a3b8]">Relación canónica almacenada por ID</p>
            </div>

            {/* Ciudad */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Ciudad de Residencia
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="ej. Cali, Medellín, Bogotá"
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
              />
              <p className="text-[10px] text-[#94a3b8]">Sede operativa o residencia</p>
            </div>

            {/* Fecha de Cumpleaños */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Fecha de Cumpleaños
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="ej. 9 de Ene o 1992-01-09"
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
              />
              <p className="text-[10px] text-[#94a3b8]">Consumido por Mi Día y Bucky</p>
            </div>

            {/* Nivel de Acceso Funcional RBAC */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center justify-between">
                <span>Nivel de Acceso (RBAC)</span>
                <span className="text-[9px] text-[#501f92] font-semibold">7 Niveles Canónicos</span>
              </label>
              <select
                value={accessLevel}
                onChange={(e) => {
                  const nextLevel = e.target.value as OrbitAccessLevel;
                  setAccessLevel(nextLevel);
                  if (nextLevel === 'system_admin') {
                    setSystemRole('Admin');
                  } else if (systemRole === 'Admin') {
                    setSystemRole('Member');
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
              >
                {accessLevels.map((lvl) => (
                  <option key={lvl.level} value={lvl.level}>
                    {lvl.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#94a3b8]">Matriz RBAC centralizada de seguridad funcional</p>
            </div>

            {/* Fecha de Ingreso (Dato Contractual Protegido) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center justify-between">
                <span>Fecha de Ingreso</span>
                {canEditHireDate ? (
                  <span className="text-[9px] text-[#047857] font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Editable (Admin/RRHH)
                  </span>
                ) : (
                  <span className="text-[9px] text-[#b45309] font-medium flex items-center gap-0.5" title="Edición restringida a perfiles administrativos autorizados">
                    <Lock className="w-2.5 h-2.5" /> Protegido (Solo Admin/RRHH)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={joinedDate}
                onChange={(e) => canEditHireDate && setJoinedDate(e.target.value)}
                disabled={!canEditHireDate}
                placeholder="ej. 05 Jul 2022 o 2022-07-05"
                className={`w-full px-3 py-2 border rounded-xl text-xs text-[#0f172a] focus:outline-none ${
                  canEditHireDate
                    ? 'bg-white border-[#cbd5e1] focus:ring-2 focus:ring-[#8a4dff]'
                    : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#64748b] cursor-not-allowed'
                }`}
              />
              <p className="text-[10px] text-[#64748b]">
                {canEditHireDate
                  ? 'Base única para cómputo de aniversarios y antigüedad'
                  : 'Edición restringida a perfiles administrativos autorizados'}
              </p>
            </div>

            {/* Estado de Cuenta */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Estado de la Cuenta
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
              >
                <option value="Active">Activo (Habilitado para operar)</option>
                <option value="Inactive">Inactivo (Acceso suspendido)</option>
                <option value="Invited">Invitado (Pendiente de activación)</option>
              </select>
              <p className="text-[10px] text-[#94a3b8]">Control de inicio de sesión</p>
            </div>

            {/* Acciones de edición en línea */}
            <div className="col-span-full pt-2 flex flex-wrap items-center gap-2 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={handleSaveChanges}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#501f92] hover:bg-[#381566] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios del Perfil</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 text-xs font-medium text-[#64748b] hover:text-[#0f172a] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          /* MODO LECTURA COMPACTO */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Ingreso y Antigüedad */}
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] space-y-1">
              <div className="flex items-center gap-1.5 text-[#94a3b8] font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#64748b]">Ingreso & Trayectoria</span>
              </div>
              <p className="font-semibold text-[#0f172a] text-sm">
                {user.joinedDate || 'No registrado'}
              </p>
              <p className="text-[11px] text-[#64748b]">
                Antigüedad: <span className="font-medium text-[#334155]">{seniorityText}</span>
              </p>
            </div>

            {/* Rol Profesional Canónico */}
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] space-y-1">
              <div className="flex items-center gap-1.5 text-[#94a3b8] font-medium">
                <Briefcase className="w-3.5 h-3.5 text-[#64748b]" />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#64748b]">Rol Oficial (Catálogo)</span>
              </div>
              <p className="font-semibold text-[#0f172a] text-sm truncate" title={user.officialRole || 'Sin rol comercial'}>
                {user.officialRole || <span className="italic text-[#94a3b8] font-normal">Sin rol comercial</span>}
              </p>
              <p className="text-[11px] text-[#64748b]">
                Costeo y asignación técnica
              </p>
            </div>

            {/* Cumpleaños */}
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] space-y-1">
              <div className="flex items-center gap-1.5 text-[#94a3b8] font-medium">
                <Cake className="w-3.5 h-3.5 text-[#64748b]" />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#64748b]">Fecha de Cumpleaños</span>
              </div>
              <p className="font-semibold text-[#0f172a] text-sm">
                {birthDate || <span className="italic text-[#94a3b8] font-normal">Sin registrar</span>}
              </p>
              <p className="text-[11px] text-[#64748b]">
                Gestionado en perfil · Visible en Mi Día
              </p>
            </div>

            {/* Ciudad y Correo */}
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] space-y-1">
              <div className="flex items-center gap-1.5 text-[#94a3b8] font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#64748b]" />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#64748b]">Ciudad / Contacto</span>
              </div>
              <p className="font-semibold text-[#0f172a] text-sm">
                {city || <span className="italic text-[#94a3b8] font-normal">No especificada</span>}
              </p>
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <a
                  href={`mailto:${user.email}`}
                  className="text-[11px] text-[#501f92] hover:underline truncate max-w-[130px]"
                  title={user.email}
                >
                  {user.email || 'Sin correo'}
                </a>
                {user.email && (
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 text-[#94a3b8] hover:text-[#0f172a] rounded transition-colors cursor-pointer shrink-0"
                    title="Copiar correo"
                  >
                    {copiedEmail ? (
                      <Check className="w-3 h-3 text-[#16a34a]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hobbies / Mascotas (Contexto Bucky) */}
        {(user.hobbies || user.petNames) && !isEditing && (
          <div className="pt-2 border-t border-[#f1f5f9] text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-[#64748b] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#8a4dff]" />
              <span className="font-semibold text-[#334155]">Contexto Personal & Mascotas</span>
              <span className="text-[11px] text-[#94a3b8]">(consumido por Bucky)</span>
            </div>
            {user.hobbies && (
              <p className="text-[#64748b] leading-relaxed">
                <strong className="text-[#475569] font-medium">Hobbies & Pasiones:</strong> {user.hobbies}
              </p>
            )}
            {user.petNames && (
              <p className="text-[#64748b] leading-relaxed">
                <strong className="text-[#475569] font-medium">Mascotas:</strong> {user.petNames}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. CARD 2: Nivel de Acceso Funcional Orbit (RBAC) */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#501f92]" />
              <h2 className="text-base font-bold text-[#0f172a] tracking-tight">
                Nivel de Acceso & Autorización (Matriz RBAC)
              </h2>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Única fuente de verdad de seguridad funcional en Orbit. Define módulos visibles y permisos.
            </p>
          </div>

          {/* Quick status toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStatus}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                status === 'Active'
                  ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] hover:bg-[#dcfce7]'
                  : 'border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9]'
              }`}
            >
              {status === 'Active' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-[#16a34a]" />
                  <span>Cuenta Activa</span>
                </>
              ) : (
                <>
                  <UserX className="w-3.5 h-3.5 text-[#94a3b8]" />
                  <span>Cuenta Inactiva</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selector del Nivel de Acceso RBAC */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-[#334155] flex items-center justify-between">
            <span>Nivel de Acceso Canónico</span>
            <span className="text-[10px] font-normal text-[#64748b]">7 Niveles Canónicos Cerrados</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={accessLevel}
              onChange={(e) => {
                const nextLevel = e.target.value as OrbitAccessLevel;
                setAccessLevel(nextLevel);
                if (nextLevel === 'system_admin') {
                  setSystemRole('Admin');
                } else if (systemRole === 'Admin') {
                  setSystemRole('Member');
                }
              }}
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
            >
              {accessLevels.map((lvl) => (
                <option key={lvl.level} value={lvl.level}>
                  {lvl.label}
                </option>
              ))}
            </select>

            <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#475569] flex items-center">
              <p className="leading-snug">
                {accessLevels.find((l) => l.level === accessLevel)?.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de Módulos Autorizados según la Matriz RBAC */}
        <div className="pt-3 border-t border-[#f1f5f9] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#334155] uppercase tracking-wider">
              Módulos Autorizados para este Nivel ({authorizedModules.length})
            </span>
            <span className="text-[11px] text-[#64748b]">
              Gobernado por <code className="text-[#501f92] font-mono text-[10px]">ROLE_PERMISSIONS_MATRIX</code>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {authorizedModules.length === 0 ? (
              <span className="text-xs text-[#94a3b8] italic">Sin módulos asignados (Deny-by-default).</span>
            ) : (
              authorizedModules.map((modKey) => {
                const rule = permissions[modKey];
                return (
                  <div
                    key={String(modKey)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#334155]"
                  >
                    <span className="font-semibold capitalize">{String(modKey).replace('-', ' ')}</span>
                    {rule?.scope && (
                      <span className="text-[10px] font-bold text-[#501f92] uppercase bg-[#f3e8ff] px-1.5 py-0.5 rounded">
                        {rule.scope}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sección Técnica Secundaria: Flag UserRole de Compatibilidad (Solo visible para Administradores de Sistema) */}
        {isSystemAdmin && (
          <div className="pt-3 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={() => setShowTechnicalSettings(!showTechnicalSettings)}
              className="flex items-center gap-1.5 text-xs font-medium text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTechnicalSettings ? 'rotate-180' : ''}`} />
              <span>Ajustes Técnicos de Compatibilidad (Flag UserRole heredado)</span>
            </button>

            {showTechnicalSettings && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#334155] block">
                      Flag Técnico de Plataforma (<code className="font-mono text-[11px] text-[#501f92]">UserRole</code>)
                    </label>
                    <p className="text-[11px] text-[#64748b]">
                      Atributo técnico secundario mantenido para compatibilidad de código legado. <strong>NO</strong> gobierna permisos funcionales; toda autorización se rige por el Nivel RBAC.
                    </p>
                  </div>
                  <select
                    value={systemRole}
                    onChange={(e) => setSystemRole(e.target.value as UserRole)}
                    className="bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#8a4dff]"
                  >
                    <option value="Admin">Admin (Control de configuración técnica)</option>
                    <option value="Member">Member (Operación estándar)</option>
                    <option value="Viewer">Viewer (Solo lectura técnica)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resumen de Auditoría preparado antes de guardar (Previsualización en UI) */}
        {auditChanges.length > 0 && (
          <div className="p-4 rounded-xl bg-[#fffbeb] border border-[#fef3c7] text-xs space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#b45309] font-bold">
                <History className="w-4 h-4" />
                <span>Previsualización de Auditoría (Representación Frontend)</span>
              </div>
              <span className="text-[10px] bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-md font-semibold border border-[#fde68a]">
                {auditChanges.filter(c => c.isSensitive).length} sensibles
              </span>
            </div>
            <p className="text-[11px] text-[#78350f]">
              <strong>Gobernanza:</strong> La auditoría autoritativa se genera y persiste en backend al guardar el cambio; el frontend no es fuente de verdad del historial. Contrato canónico: <code className="font-mono text-[10px] bg-[#fef9c3] px-1 py-0.5 rounded">userId, field, previousValue, newValue, changedAt, changedByUserId, reason?</code>
            </p>
            <div className="space-y-1.5 pt-1">
              {auditChanges.map((ch, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${
                    ch.isSensitive
                      ? 'bg-white border-[#fed7aa] text-[#7c2d12]'
                      : 'bg-[#fefce8] border-[#fef08a] text-[#713f12]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {ch.isSensitive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] shrink-0" title="Cambio sensible" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ca8a04] shrink-0" />
                    )}
                    <strong className="font-semibold">{ch.field}:</strong>
                    <span className="line-through opacity-60 ml-1">{ch.from}</span>
                    <span className="font-bold text-[#0f172a]">→ {ch.to}</span>
                  </div>
                  <div className="text-[10px] text-[#64748b] flex items-center gap-2 self-end sm:self-auto">
                    <span>📅 {ch.date}</span>
                    <span>👤 {ch.operator}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones de Guardado y Gestión */}
        <div className="pt-4 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveChanges}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#501f92] hover:bg-[#381566] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración de Perfil & Acceso</span>
            </button>
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-2.5 text-xs font-medium text-[#64748b] hover:text-[#0f172a] rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>

          {/* Zona de peligro / eliminación */}
          {onDeleteUser && (
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 animate-in fade-in duration-150">
                  <span className="text-xs text-[#dc2626] font-medium">¿Eliminar colaborador?</span>
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="px-2.5 py-1 bg-[#dc2626] text-white rounded-lg text-xs font-semibold hover:bg-[#b91c1c] transition-colors cursor-pointer"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 bg-[#f1f5f9] text-[#475569] rounded-lg text-xs font-semibold hover:bg-[#e2e8f0] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#dc2626] hover:text-[#991b1b] p-1.5 rounded-lg hover:bg-[#fef2f2] transition-colors cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar del Directorio</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Nota de Evolutivos Futuros y Regla de Compensación */}
      <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs text-[#64748b] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#94a3b8] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#334155] font-semibold">Compensación & Evolutivos de Talento (Fases Posteriores):</strong> La compensación económica no es un campo plano editable en el perfil, sino que se gestionará en backend como un <strong>historial de vigencias temporales</strong> (<code className="font-mono text-[10px] text-[#501f92]">effectiveFrom, effectiveTo, baseSalaryCop, benefitFactor, changeReason</code>). Los módulos de contratos laborales, inventario de herramientas/licencias, formación y offboarding ya se encuentran especificados en el roadmap funcional y serán desplegados cuando Indunova habilite la persistencia relacional con los controles de seguridad correspondientes.
        </p>
      </div>
    </div>
  );
};
