import React, { useState, useEffect } from 'react';
import { UserItem, UserRole, UserStatus, OrbitAccessLevel } from './types';
import { UserProfileView } from './UserProfileView';
import { UserAvatar } from './UserAvatar';
import {
  User,
  UserCheck,
  Shield,
  Mail,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Calendar,
  Edit2,
  Trash2,
  MoreVertical,
  Key,
  Users as UsersIcon,
  CheckCircle2,
  XCircle,
  Lock
} from 'lucide-react';
import { ROLE_PERMISSIONS_MATRIX } from './auth/permissions';

interface UsersViewProps {
  users: UserItem[];
  currentUser?: UserItem;
  onInviteUser: () => void;
  onDeleteUser?: (id: string) => void;
  onUpdateUser?: (updatedUser: UserItem) => void;
  selectedUserId?: string | null;
  onSelectUser?: (userId: string | null) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onInviteUser,
  onDeleteUser,
  onUpdateUser,
  selectedUserId: initialSelectedUserId = null,
  onSelectUser
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialSelectedUserId);
  const [activeTab, setActiveTab] = useState<'directory' | 'roles'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sincronizar si cambia desde props
  useEffect(() => {
    if (initialSelectedUserId !== undefined) {
      setSelectedUserId(initialSelectedUserId);
    }
  }, [initialSelectedUserId]);

  const handleSelectUser = (id: string | null) => {
    setSelectedUserId(id);
    onSelectUser?.(id);
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Si hay un colaborador seleccionado, renderizar su Perfil
  if (selectedUser) {
    return (
      <UserProfileView
        user={selectedUser}
        allUsers={users}
        currentUser={currentUser}
        onBack={() => handleSelectUser(null)}
        onUpdateUser={onUpdateUser}
        onDeleteUser={(id) => {
          onDeleteUser?.(id);
          handleSelectUser(null);
        }}
      />
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const adminUsers = users.filter((u) => u.accessLevel === 'system_admin' || u.role === 'Admin').length;
  const invitedUsers = users.filter((u) => u.status === 'Invited').length;

  const accessLevelMeta: Record<
    OrbitAccessLevel,
    { label: string; color: string }
  > = {
    collaborator: { label: 'Colaborador', color: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]' },
    leader: { label: 'Líder de Área / PM', color: 'bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]' },
    client_relationship: { label: 'Client Relationship', color: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]' },
    commercial: { label: 'Comercial', color: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]' },
    administrative: { label: 'Administrativa / Fiscal', color: 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]' },
    executive: { label: 'Dirección Ejecutiva', color: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]' },
    system_admin: { label: 'Admin de Sistema', color: 'bg-[#fdf2f8] text-[#be185d] border-[#fbcfe8]' },
    pending: { label: 'Pendiente de Asignación', color: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]' }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all') {
      if (u.accessLevel) {
        if (u.accessLevel !== roleFilter && u.role !== roleFilter) return false;
      } else if (u.role !== roleFilter) {
        return false;
      }
    }
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.jobTitle && u.jobTitle.toLowerCase().includes(q)) ||
        (u.officialRole && u.officialRole.toLowerCase().includes(q)) ||
        (u.accessLevel && u.accessLevel.toLowerCase().includes(q)) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const rolesList: { level: OrbitAccessLevel; label: string; desc: string; color: string }[] = [
    { level: 'collaborator', label: 'Colaborador', desc: 'Producción operativa, tareas asignadas, timer personal y La Colonia', color: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]' },
    { level: 'leader', label: 'Líder de Área / PM', desc: 'Gestión de proyectos, tareas de equipo, capacidad y New Business del área', color: 'bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]' },
    { level: 'client_relationship', label: 'Client Relationship', desc: 'Supervisión de cuentas cliente, entregables y asignaciones comerciales', color: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]' },
    { level: 'commercial', label: 'Comercial', desc: 'New Business, formalizaciones, cotizaciones y catálogo de servicios', color: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]' },
    { level: 'administrative', label: 'Administrativa / Fiscal', desc: 'Auditoría de horas de toda la agencia, datos fiscales y facturación', color: 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]' },
    { level: 'executive', label: 'Dirección Ejecutiva', desc: 'Visión de negocio, excepciones críticas, autorizaciones de margen y rentabilidad', color: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]' },
    { level: 'system_admin', label: 'Administrador de Sistema', desc: 'Control total de la plataforma, roles, usuarios e integraciones', color: 'bg-[#fdf2f8] text-[#be185d] border-[#fbcfe8]' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Estandarizado (Benchmark Clientes) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] tracking-tight">
            Equipo & Accesos
          </h1>
          {/* Resumen ejecutivo en una sola línea */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-[#64748b] mt-1 font-medium">
            <span className="font-bold text-[#0f172a]">{totalUsers} colaboradores</span>
            <span className="text-[#cbd5e1]">·</span>
            <span className="text-emerald-700 font-semibold">{activeUsers} activos</span>
            <span className="text-[#cbd5e1]">·</span>
            <span>{adminUsers} administradores</span>
            {invitedUsers > 0 && (
              <>
                <span className="text-[#cbd5e1]">·</span>
                <span className="text-amber-700 font-semibold">{invitedUsers} invitados</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0 self-start sm:self-auto">
          {/* Tab Switcher */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <UsersIcon className="w-3.5 h-3.5" />
              <span>Directorio</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-white text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Matriz RBAC</span>
            </button>
          </div>

          {activeTab === 'directory' && (
            <button
              onClick={onInviteUser}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#501f92] text-white text-xs font-bold hover:bg-[#381566] shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Invitar Colaborador</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Filter Row */}
          <div className="bg-white p-4 rounded-2xl border border-[#e5e7eb] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-[#9ca3af] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, correo, cargo o rol..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#e5e7eb] rounded-xl text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#8a4dff]/30 focus:border-[#8a4dff]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-white border border-[#e5e7eb] text-[#374151] px-4 py-2 pr-9 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
                >
                  <option value="all">Todos los Niveles RBAC</option>
                  <option value="collaborator">Colaborador</option>
                  <option value="leader">Líder de Área / PM</option>
                  <option value="client_relationship">Client Relationship</option>
                  <option value="commercial">Comercial</option>
                  <option value="administrative">Administrativa / Fiscal</option>
                  <option value="executive">Dirección Ejecutiva</option>
                  <option value="system_admin">Administrador de Sistema</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#6b7280] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-white border border-[#e5e7eb] text-[#374151] px-4 py-2 pr-9 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#8a4dff]"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="Active">Activo</option>
                  <option value="Invited">Invitado</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#6b7280] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Users Data Table */}
          <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#f3f4f6] text-[11px] font-bold text-[#6b7280] uppercase tracking-wider bg-[#fafafa]">
                    <th className="py-3.5 px-6 font-semibold">COLABORADOR</th>
                    <th className="py-3.5 px-6 font-semibold">NIVEL RBAC / ROL</th>
                    <th className="py-3.5 px-6 font-semibold">ESTADO</th>
                    <th className="py-3.5 px-6 font-semibold">LÍDER DIRECTO</th>
                    <th className="py-3.5 px-6 font-semibold">FECHA DE INGRESO</th>
                    <th className="py-3.5 px-6 font-semibold text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6] text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#9ca3af] text-sm">
                        No se encontraron colaboradores con esos criterios.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        className="hover:bg-[#f8fafc] transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              user={user}
                              size="lg"
                              className="rounded-full"
                              imageClassName="rounded-full"
                              fallbackClassName="rounded-full"
                            />
                            <div>
                              <p className="font-semibold text-sm text-[#111827] group-hover:text-[#501f92] transition-colors">{user.name}</p>
                              <p className="text-xs text-[#6b7280]">
                                {user.email || <span className="italic text-[#94a3b8]">Sin correo</span>}
                              </p>
                              {user.jobTitle && (
                                <p className="text-[11px] font-medium text-[#501f92] mt-0.5">{user.jobTitle}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {user.accessLevel && accessLevelMeta[user.accessLevel] ? (
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${accessLevelMeta[user.accessLevel].color}`}
                            >
                              {user.accessLevel === 'system_admin' && <Shield className="w-3 h-3" />}
                              <span>{accessLevelMeta[user.accessLevel].label}</span>
                            </span>
                          ) : user.role === 'Admin' ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-[#faf5ff] text-[#9333ea] border border-[#f3e8ff]">
                              <Shield className="w-3 h-3" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#eff6ff] text-[#2563eb]">
                              {user.role}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium inline-block ${
                              user.status === 'Active'
                                ? 'bg-[#f0fdf4] text-[#16a34a]'
                                : 'bg-[#fffbeb] text-[#d97706]'
                            }`}
                          >
                            {user.status === 'Active' ? 'Activo' : 'Invitado'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-xs text-[#374151]">
                          {(() => {
                            const leaderObj = users.find(u => u.id === (user.leaderId || user.reportsTo));
                            if (leaderObj) {
                              return (
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full ${leaderObj.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}>
                                    {leaderObj.initials}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-xs text-[#111827] truncate">{leaderObj.name}</p>
                                    <p className="text-[10px] text-[#6b7280] truncate">{leaderObj.jobTitle || leaderObj.role}</p>
                                  </div>
                                </div>
                              );
                            }
                            if (user.leaderName && user.leaderName !== 'Dirección General (N/A)') {
                              return <span className="font-medium text-[#374151]">{user.leaderName}</span>;
                            }
                            return <span className="text-[#9ca3af] italic text-[11px]">Dirección General</span>;
                          })()}
                        </td>

                        <td className="py-4 px-6 text-xs text-[#6b7280]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#9ca3af]" />
                            <span>{user.joinedDate}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 text-[#9ca3af]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectUser(user.id);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#501f92] hover:bg-[#f3e8ff] transition-colors cursor-pointer"
                              title="Ver perfil completo del colaborador"
                            >
                              <span>Ver Perfil</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteUser && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteUser(user.id);
                                }}
                                className="p-1.5 hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-colors cursor-pointer"
                                title="Eliminar colaborador"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* TAB 2: MATRIZ DE ROLES & PERMISOS (RBAC) */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <p className="text-xs text-[#475569] leading-relaxed">
              La seguridad y navegación de Orbit se rigen por la <strong>Matriz Central RBAC</strong>. Cada nivel de acceso delimita estrictamente la visibilidad en el menú lateral y las acciones autorizadas (crear, editar, aprobar o auditar).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rolesList.map((r) => {
              const permissions = ROLE_PERMISSIONS_MATRIX[r.level] || {};
              const moduleKeys = Object.keys(permissions) as (keyof typeof permissions)[];

              return (
                <div key={r.level} className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.color}`}>
                        {r.label}
                      </span>
                      <p className="text-xs text-[#64748b] mt-1.5 leading-snug">{r.desc}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#f1f5f9]">
                    <span className="text-[10px] font-bold uppercase text-[#94a3b8] tracking-wider block mb-2">
                      Módulos & Alcance Autorizado ({moduleKeys.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {moduleKeys.map((mod) => {
                        const rule = permissions[mod];
                        return (
                          <span
                            key={String(mod)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f1f5f9] text-[11px] font-medium text-[#334155]"
                          >
                            <span className="capitalize">{String(mod).replace('-', ' ')}</span>
                            {rule?.scope && (
                              <span className="text-[9px] font-bold text-[#8a4dff] uppercase">
                                ({rule.scope})
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
