import React, { useState } from 'react';
import { useMascotSkin } from './mascot/ecoMascot';
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
  Sparkles,
  Monitor,
  Sun,
  Moon,
  CalendarCheck,
  TreePine
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
    costos: false,
    sistema: false
  });

  // Modo del sidebar: oscuro (luna, por defecto) o claro (sol). Preferencia personal del navegador.
  const [sidebarTheme, setSidebarTheme] = useState<'dark' | 'light'>(() => {
    try {
      return localStorage.getItem('eco_sidebar_theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const toggleSidebarTheme = () => {
    const next = sidebarTheme === 'dark' ? 'light' : 'dark';
    setSidebarTheme(next);
    try {
      localStorage.setItem('eco_sidebar_theme', next);
    } catch {
      /* sin almacenamiento */
    }
  };
  const christmas = useMascotSkin().skin === 'christmas';
  const themeToggleLabel = sidebarTheme === 'dark' ? 'Cambiar menú a modo claro' : 'Cambiar menú a modo oscuro';

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
  const canFinanzas = canAccessModule(currentUser, 'finanzas');

  const canColonia = canAccessModule(currentUser, 'la-colonia');
  const canMuro = canAccessModule(currentUser, 'la-colonia');

  const canUsuarios = canAccessModule(currentUser, 'administracion');
  const canConfigRoles = canAccessModule(currentUser, 'administracion');
  const canPortalCliente = canAccessModule(currentUser, 'administracion');

  const hasOperacion = canMiDia || canProyectos || canTareas || canCapacidad;
  const hasComercial = canFinanzas || canNewBusiness || canClientes || canPlantillas;
  const hasExperiencia = canColonia;
  const hasSistema = canUsuarios;
  const canCostos = canAccessModule(currentUser, 'costos-operacion');

  return (
    <aside
      data-sidebar-theme={sidebarTheme}
      className={`bg-[#0d0718] border-r border-[#261845] text-white flex flex-col justify-between transition-all duration-200 h-full min-h-full flex-1 ${
        collapsed ? 'w-16 p-2' : 'w-64 p-3.5'
      }`}
    >
      <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-0">
        {/* Brand Header: ECO UHURA GROUP */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-1.5 mb-2 border-b border-[#261845]/70">
            <button
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8a4dff] via-[#501f92] to-[#140b24] p-0.5 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-[#8a4dff]/40 hover:scale-105 transition-transform cursor-pointer"
              title="Desplegar menú lateral (Sidebar)"
            >
              <img src="/brand/eco-icon-128.png" alt="ECO" className="w-full h-full rounded-[10px] object-cover" />
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
            <button
              type="button"
              onClick={toggleSidebarTheme}
              className="w-full flex items-center justify-center p-1.5 rounded-lg text-[#c9b7ff] hover:bg-[#2e1859] hover:text-white transition-colors cursor-pointer"
              title={themeToggleLabel}
              aria-label={themeToggleLabel}
            >
              {sidebarTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2.5 mb-2 border-b border-[#261845]/70 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/brand/eco-icon-128.png" alt="ECO" className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-sm ring-1 ring-[#8a4dff]/40" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">ECO</span>
                  {christmas && <span className="text-sm" title="Modo navideño">🎄</span>}
                </div>
                <span className="text-[11px] text-[#c9b7ff]/80 font-medium tracking-wide uppercase block truncate">
                  UHURA GROUP
                </span>
              </div>
            </div>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-[#c9b7ff]/70 hover:text-white hover:bg-[#241344] transition-colors cursor-pointer shrink-0"
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
                {/* Mi Día */}
                {canMiDia && (
                  <button
                    onClick={() => onSelectView('mi-dia')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'mi-dia' || currentView === 'dashboard'
                        ? 'bg-[#1e113a] text-white font-semibold'
                        : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                    }`}
                    title="Mi Día"
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-[#8a4dff]" />
                      {!collapsed && <span>Mi Día</span>}
                    </div>
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
                {/* Dirección y Finanzas */}
                {canFinanzas && (
                  <button
                    onClick={() => onSelectView('finanzas')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'finanzas'
                        ? 'bg-[#1e113a] text-white font-semibold'
                        : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                    }`}
                    title="Dirección y Finanzas · Salud comercial y operativa"
                  >
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#8a4dff]" />
                      {!collapsed && <span>Dirección y Finanzas</span>}
                    </div>
                  </button>
                )}

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
                      <Target className="w-3.5 h-3.5 text-[#8a4dff]" />
                      {!collapsed && <span>New Business</span>}
                    </div>
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'la-colonia'
                        ? 'bg-[#1e113a] text-white font-semibold'
                        : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                    }`}
                    title="La Colonia"
                  >
                    <div className="flex items-center gap-2.5">
                      <TreePine className="w-3.5 h-3.5 text-[#8a4dff]" />
                      {!collapsed && <span>La Colonia</span>}
                    </div>
                  </button>
                )}

              </div>
            )}
          </div>
        )}

        {/* COSTOS DE OPERACIÓN (Hardware y Licencias) */}
        {canCostos && (
          <div className="space-y-1 pt-1">
            {!collapsed ? (
              <button
                onClick={() => toggleSection('costos')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c9b7ff]/70 hover:text-white transition-colors"
              >
                <span>COSTOS DE OPERACIÓN</span>
                {openSections.costos ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-[#261845] my-2" />
            )}
            {(openSections.costos || collapsed) && (
              <div className="space-y-0.5 pl-0.5">
                <button
                  onClick={() => onSelectView('licencias')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentView === 'licencias' ? 'bg-[#1e113a] text-white font-semibold' : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                  }`}
                  title="Licencias y suscripciones de software"
                >
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#8a4dff]" />
                    {!collapsed && <span>Licencias</span>}
                  </div>
                </button>
                <button
                  onClick={() => onSelectView('hardware')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentView === 'hardware' ? 'bg-[#1e113a] text-white font-semibold' : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                  }`}
                  title="Hardware y equipos"
                >
                  <div className="flex items-center gap-2.5">
                    <Monitor className="w-3.5 h-3.5 text-[#8a4dff]" />
                    {!collapsed && <span>Hardware</span>}
                  </div>
                </button>
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
        <div className="pt-3 mt-2 border-t border-[#261845] text-[11px] text-[#c9b7ff]/60 flex items-center justify-between gap-2 px-2">
          <span>ECO · v2.6</span>
          <div
            role="radiogroup"
            aria-label="Modo del menú"
            className="flex items-center gap-0.5 p-0.5 rounded-full border border-[#261845]"
          >
            <button
              type="button"
              role="radio"
              aria-checked={sidebarTheme === 'light'}
              onClick={() => sidebarTheme !== 'light' && toggleSidebarTheme()}
              className={`p-1 rounded-full cursor-pointer transition-colors ${sidebarTheme === 'light' ? 'bg-[#f3eefe] text-[#501f92]' : 'text-[#c9b7ff]/60 hover:text-white'}`}
              title="Modo claro"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={sidebarTheme === 'dark'}
              onClick={() => sidebarTheme !== 'dark' && toggleSidebarTheme()}
              className={`p-1 rounded-full cursor-pointer transition-colors ${sidebarTheme === 'dark' ? 'bg-[#1e113a] text-[#d4ff4a]' : 'text-[#c9b7ff]/60 hover:text-white'}`}
              title="Modo oscuro"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
