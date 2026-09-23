import React, { useState } from 'react';
import { OrbitView, UserItem } from './types';
import { canAccessModule } from './auth/permissions';
import {
  Briefcase,
  Layers,
  Clock,
  Users2,
  Users,
  Calculator,
  Wallet,
  Shield,
  KeyRound,
  UserCheck,
  Globe,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  Target,
  Sparkles
} from 'lucide-react';

interface TaskflowSidebarProps {
  currentView: string;
  onSelectView: (view: OrbitView) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  currentUser?: UserItem;
}

export const TaskflowSidebar: React.FC<TaskflowSidebarProps> = ({
  currentView,
  onSelectView,
  collapsed = false,
  onToggleCollapse,
  currentUser
}) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    operacion: true,
    comercial: true,
    experiencia: true,
    sistema: false
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Verificaciones de permisos por módulo
  const canMiDia = canAccessModule(currentUser, 'mi-dia');
  const canProyectos = canAccessModule(currentUser, 'proyectos');
  const canTareas = canAccessModule(currentUser, 'tareas');
  const canTimesheets = canAccessModule(currentUser, 'timesheets');
  const canCapacidad = canAccessModule(currentUser, 'capacidad');

  const canNewBusiness = canAccessModule(currentUser, 'new-business');
  const canClientes = canAccessModule(currentUser, 'clientes');
  const canPlantillas = canAccessModule(currentUser, 'plantillas-producto');
  const canFinanzas = canAccessModule(currentUser, 'administracion');

  const canColonia = canAccessModule(currentUser, 'la-colonia');
  const canMuro = canAccessModule(currentUser, 'la-colonia');

  const canUsuarios = canAccessModule(currentUser, 'administracion');
  const canConfigRoles = canAccessModule(currentUser, 'administracion');
  const canPortalCliente = canAccessModule(currentUser, 'administracion');

  const hasOperacion = canMiDia || canProyectos || canTareas || canCapacidad;
  const hasComercial = canNewBusiness || canClientes || canPlantillas;
  const hasExperiencia = canColonia;
  const hasSistema = canUsuarios;

  return (
    <aside
      className={`bg-[#0d0718] border-r border-[#261845] text-white flex flex-col justify-between transition-all duration-200 h-full min-h-full flex-1 ${
        collapsed ? 'w-16 p-2' : 'w-64 p-3.5'
      }`}
    >
      <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-0">
        {/* Brand Header: Orbit UHURA GROUP */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-1.5 mb-2 border-b border-[#261845]/70">
            <button
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8a4dff] via-[#501f92] to-[#140b24] p-0.5 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-[#8a4dff]/40 hover:scale-105 transition-transform cursor-pointer"
              title="Desplegar menú lateral (Sidebar)"
            >
              <div className="w-full h-full bg-[#0d0718] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <div className="w-5 h-5 rounded-full border-2 border-t-[#d4ff4a] border-r-[#8a4dff] border-b-[#4be5ff] border-l-transparent animate-spin-slow" />
                <div className="w-2 h-2 rounded-full bg-[#d4ff4a] absolute" />
              </div>
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-full flex items-center justify-center p-1.5 rounded-lg text-[#c9b7ff] bg-[#1e113a] hover:bg-[#2e1859] hover:text-white transition-colors cursor-pointer"
                title="Desplegar menú lateral"
              >
                <PanelLeftOpen className="w-4 h-4 text-[#d4ff4a]" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2.5 mb-2 border-b border-[#261845]/70 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8a4dff] via-[#501f92] to-[#140b24] p-0.5 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-[#8a4dff]/40">
                <div className="w-full h-full bg-[#0d0718] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                  <div className="w-5 h-5 rounded-full border-2 border-t-[#d4ff4a] border-r-[#8a4dff] border-b-[#4be5ff] border-l-transparent animate-spin-slow" />
                  <div className="w-2 h-2 rounded-full bg-[#d4ff4a] absolute" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">Orbit</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#8a4dff]/30 text-[#c9b7ff]">
                    v2.6
                  </span>
                </div>
                <span className="text-[11px] text-[#c9b7ff]/80 font-medium tracking-wide uppercase block truncate">
                  UHURA GROUP
                </span>
              </div>
            </div>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-[#c9b7ff]/70 hover:text-white hover:bg-[#241344] transition-colors cursor-pointer shrink-0"
                title="Ocultar menú lateral"
              >
                <PanelLeftClose className="w-4 h-4 text-[#c9b7ff]/70" />
              </button>
            )}
          </div>
        )}

        {/* 1. OPERACIÓN */}
        {hasOperacion && (
          <div className="space-y-1">
            {!collapsed ? (
              <button
                onClick={() => toggleSection('operacion')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c9b7ff]/70 hover:text-white transition-colors"
              >
                <span>OPERACIÓN</span>
                {openSections.operacion ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <div className="h-px bg-[#261845] my-2" />
            )}

            {(openSections.operacion || collapsed) && (
              <div className="space-y-0.5 pl-0.5">
                {/* Mi Día · Home Contextual de Orbit */}
                {canMiDia && (
                  <button
                    onClick={() => onSelectView('mi-dia')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentView === 'mi-dia' || currentView === 'dashboard'
                        ? 'bg-gradient-to-r from-[#2e1859] to-[#1e113a] text-white shadow-sm border-l-2 border-[#d4ff4a]'
                        : 'text-[#c9b7ff] hover:bg-[#1a0f30] hover:text-white'
                    }`}
                    title="Mi Día · Home Contextual con perspectivas de rol"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">🦫</span>
                      {!collapsed && <span className="font-bold">Mi Día</span>}
                    </div>
                    {!collapsed && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#d4ff4a]/20 text-[#d4ff4a] border border-[#d4ff4a]/30">
                        Home
                      </span>
                    )}
                  </button>
                )}

                {canProyectos && (
                  <button
                    onClick={() => onSelectView('proyectos')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'proyectos'
                        ? 'bg-[#1e113a] text-white font-semibold'
                        : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                    }`}
                    title="Proyectos"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#8a4dff]" />
                      {!collapsed && <span>Proyectos</span>}
                    </div>
                    {!collapsed && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#ef4444]/20 text-[#fca5a5]">
                        5 riesgo
                      </span>
                    )}
                  </button>
                )}

                {canTareas && (
                  <button
                    onClick={() => onSelectView('tareas')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'tareas'
                        ? 'bg-[#1e113a] text-white font-semibold'
                        : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                    }`}
                    title="Tareas y Entregas"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-3.5 h-3.5 text-[#8a4dff]" />
                      {!collapsed && <span>Tareas</span>}
                    </div>
                  </button>
                )}


                {canCapacidad && (
                  <button
                    onClick={() => onSelectView('capacidad')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'capacidad'
                        ? 'bg-[#1e113a] text-white font-semibold'
                        : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                    }`}
                    title="Capacidad de Equipo"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users2 className="w-3.5 h-3.5 text-[#8a4dff]" />
                      {!collapsed && <span>Capacidad</span>}
                    </div>
                    {!collapsed && (
                      <span className="text-[10px] font-semibold text-[#c9b7ff]/60">25 pers</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. COMERCIAL */}
        {hasComercial && (
          <div className="space-y-1 pt-1">
            {!collapsed ? (
              <button
                onClick={() => toggleSection('comercial')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c9b7ff]/70 hover:text-white transition-colors"
              >
                <span>COMERCIAL</span>
                {openSections.comercial ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <div className="h-px bg-[#261845] my-2" />
            )}

            {(openSections.comercial || collapsed) && (
              <div className="space-y-0.5 pl-0.5">
                {/* New Business */}
                {canNewBusiness && (
                  <button
                    onClick={() => onSelectView('new-business')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'new-business'
                        ? 'bg-[#1e113a] text-white font-semibold'
                        : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                    }`}
                    title="New Business · Scoping, cotización y SOW"
                  >
                    <div className="flex items-center gap-2.5">
                      <Target className="w-3.5 h-3.5 text-[#4be5ff]" />
                      {!collapsed && <span>New Business</span>}
                    </div>
                    {!collapsed && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#4be5ff]/15 text-[#4be5ff]">
                        Brief
                      </span>
                    )}
                  </button>
                )}

                {/* Clientes */}
                {canClientes && (
                  <button
                    onClick={() => onSelectView('clientes')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'clientes'
                        ? 'bg-[#1e113a] text-white font-semibold'
                        : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                    }`}
                    title="Clientes de Uhura"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-3.5 h-3.5 text-[#8a4dff]" />
                      {!collapsed && <span>Clientes</span>}
                    </div>
                  </button>
                )}

                {/* Catálogo de Servicios */}
                {canPlantillas && (
                  <button
                    onClick={() => onSelectView('plantillas-producto')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'plantillas-producto'
                        ? 'bg-[#1e113a] text-white font-semibold'
                        : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                    }`}
                    title="Catálogo de Servicios de Uhura (Plantillas Maestras)"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#8a4dff]" />
                      {!collapsed && <span>Servicios</span>}
                    </div>
                    {!collapsed && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#8a4dff]/25 text-[#d4ff4a]">
                        Catálogo
                      </span>
                    )}
                  </button>
                )}


              </div>
            )}
          </div>
        )}

        {/* 3. EXPERIENCIA */}
        {hasExperiencia && (
          <div className="space-y-1 pt-1">
            {!collapsed ? (
              <button
                onClick={() => toggleSection('experiencia')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c9b7ff]/70 hover:text-white transition-colors"
              >
                <span>EXPERIENCIA</span>
                {openSections.experiencia ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <div className="h-px bg-[#261845] my-2" />
            )}

            {(openSections.experiencia || collapsed) && (
              <div className="space-y-0.5 pl-0.5">
                {/* La Colonia */}
                {canColonia && (
                  <button
                    onClick={() => onSelectView('la-colonia')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentView === 'la-colonia'
                        ? 'bg-gradient-to-r from-[#2e1859] to-[#1e113a] text-white shadow-sm border-l-2 border-[#d4ff4a]'
                        : 'text-[#c9b7ff] hover:bg-[#1a0f30] hover:text-white'
                    }`}
                    title="La Colonia · Hábitat de Bucky, logros y pasear libre"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">🪵</span>
                      {!collapsed && <span>La Colonia</span>}
                    </div>
                    {!collapsed && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#501f92] text-[#d4ff4a] border border-[#8a4dff]/40">
                        Nivel 1
                      </span>
                    )}
                  </button>
                )}

              </div>
            )}
          </div>
        )}

        {/* 4. SISTEMA */}
        {hasSistema && (
          <div className="space-y-1 pt-1">
            {!collapsed ? (
              <button
                onClick={() => toggleSection('sistema')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c9b7ff]/70 hover:text-white transition-colors"
              >
                <span>SISTEMA</span>
                {openSections.sistema ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <div className="h-px bg-[#261845] my-2" />
            )}

            {(openSections.sistema || collapsed) && (
              <div className="space-y-0.5 pl-0.5">
                {canUsuarios && (
                  <button
                    onClick={() => onSelectView('usuarios')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'usuarios' || currentView === 'config-roles' || currentView === 'config-permisos'
                        ? 'bg-[#1e113a] text-white font-semibold'
                        : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                    }`}
                    title="Equipo & Accesos · Directorio de colaboradores, roles y permisos"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#8a4dff]" />
                      {!collapsed && <span>Equipo & Accesos</span>}
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="pt-3 mt-2 border-t border-[#261845] text-[11px] text-[#c9b7ff]/60 flex items-center justify-between px-2">
          <span>Uhura OS · Orbit</span>
          <span className="font-mono text-[10px]">v2.6</span>
        </div>
      )}
    </aside>
  );
};
