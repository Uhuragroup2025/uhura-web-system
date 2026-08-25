import React, { useState } from 'react';
import { OrbitView } from './types';
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Clock,
  Users2,
  DollarSign,
  Users,
  Calculator,
  Wallet,
  Sparkles,
  BarChart3,
  BrainCircuit,
  Shield,
  KeyRound,
  UserCheck,
  Globe,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface TaskflowSidebarProps {
  currentView: string;
  onSelectView: (view: OrbitView) => void;
  collapsed?: boolean;
}

export const TaskflowSidebar: React.FC<TaskflowSidebarProps> = ({
  currentView,
  onSelectView,
  collapsed = false
}) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    operacion: true,
    comercial: true,
    inteligencia: false,
    configuracion: false,
    portal: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside
      className={`bg-[#0d0718] border-r border-[#261845] text-white flex flex-col justify-between transition-all duration-200 h-full ${
        collapsed ? 'w-16 p-2' : 'w-64 p-3.5'
      }`}
    >
      <div className="space-y-4 overflow-y-auto pr-1 custom-scrollbar">
        {/* Brand Header: Orbit UHURA GROUP */}
        <div className="flex items-center gap-3 px-2 py-2.5 mb-2 border-b border-[#261845]/70">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8a4dff] via-[#501f92] to-[#140b24] p-0.5 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-[#8a4dff]/40">
            <div className="w-full h-full bg-[#0d0718] rounded-[10px] flex items-center justify-center relative overflow-hidden">
              {/* Orbit Logo Spiral */}
              <div className="w-5 h-5 rounded-full border-2 border-t-[#d4ff4a] border-r-[#8a4dff] border-b-[#4be5ff] border-l-transparent animate-spin-slow" />
              <div className="w-2 h-2 rounded-full bg-[#d4ff4a] absolute" />
            </div>
          </div>
          {!collapsed && (
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
          )}
        </div>

        {/* 1. Dashboard Principal Item */}
        <div>
          <button
            onClick={() => onSelectView('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-[#241344] text-white shadow-2xs border-l-2 border-[#8a4dff]'
                : 'text-[#c9b7ff] hover:bg-[#1a0f30] hover:text-white'
            }`}
            title="Dashboard Ejecutivo"
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-[#d4ff4a]' : 'text-[#8a4dff]'}`} />
              {!collapsed && <span>Dashboard</span>}
            </div>
            {!collapsed && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff4a]" />
            )}
          </button>
        </div>

        {/* 2. OPERACIÓN */}
        <div className="space-y-1 pt-1">
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
            <div className="space-y-0.5 pl-1">
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

              <button
                onClick={() => onSelectView('timesheets')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'timesheets'
                    ? 'bg-[#1e113a] text-white font-semibold'
                    : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                }`}
                title="Time-Tracking & Timesheets"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-[#8a4dff]" />
                  {!collapsed && <span>Time-Tracking</span>}
                </div>
              </button>

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
            </div>
          )}
        </div>

        {/* 3. COMERCIAL */}
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
            <div className="space-y-0.5 pl-1">
              <button
                onClick={() => onSelectView('clientes')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'clientes'
                    ? 'bg-[#1e113a] text-white font-semibold'
                    : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                }`}
                title="Clientes"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-3.5 h-3.5 text-[#8a4dff]" />
                  {!collapsed && <span>Clientes</span>}
                </div>
              </button>

              <button
                onClick={() => onSelectView('cotizador')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'cotizador'
                    ? 'bg-[#1e113a] text-white font-semibold'
                    : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                }`}
                title="Cotizador"
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-3.5 h-3.5 text-[#8a4dff]" />
                  {!collapsed && <span>Cotizador</span>}
                </div>
              </button>

              <button
                onClick={() => onSelectView('finanzas')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'finanzas'
                    ? 'bg-[#1e113a] text-white font-semibold'
                    : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                }`}
                title="Finanzas y Metas"
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-3.5 h-3.5 text-[#8a4dff]" />
                  {!collapsed && <span>Finanzas</span>}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 4. INTELIGENCIA */}
        <div className="space-y-1 pt-1">
          {!collapsed ? (
            <button
              onClick={() => toggleSection('inteligencia')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c9b7ff]/70 hover:text-white transition-colors"
            >
              <span>INTELIGENCIA</span>
              {openSections.inteligencia ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <div className="h-px bg-[#261845] my-2" />
          )}

          {(openSections.inteligencia || collapsed) && (
            <div className="space-y-0.5 pl-1">
              <button
                onClick={() => onSelectView('el-muro')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'el-muro'
                    ? 'bg-[#1e113a] text-white font-semibold'
                    : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                }`}
                title="El Muro"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#4be5ff]" />
                  {!collapsed && <span>El Muro</span>}
                </div>
              </button>

              <button
                onClick={() => onSelectView('reportes')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'reportes'
                    ? 'bg-[#1e113a] text-white font-semibold'
                    : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                }`}
                title="Reportes Ejecutivos"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[#4be5ff]" />
                  {!collapsed && <span>Reportes</span>}
                </div>
              </button>

              <button
                onClick={() => onSelectView('nova-ia')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'nova-ia'
                    ? 'bg-[#1e113a] text-white font-semibold'
                    : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                }`}
                title="NOVA IA Asistente"
              >
                <div className="flex items-center gap-2.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#d4ff4a]" />
                  {!collapsed && <span>NOVA IA</span>}
                </div>
                {!collapsed && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#d4ff4a]/20 text-[#d4ff4a] border border-[#d4ff4a]/30">
                    AI PRO
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 5. CONFIGURACIÓN */}
        <div className="space-y-1 pt-1">
          {!collapsed ? (
            <button
              onClick={() => toggleSection('configuracion')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c9b7ff]/70 hover:text-white transition-colors"
            >
              <span>CONFIGURACIÓN</span>
              {openSections.configuracion ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <div className="h-px bg-[#261845] my-2" />
          )}

          {(openSections.configuracion || collapsed) && (
            <div className="space-y-0.5 pl-1">
              <button
                onClick={() => onSelectView('config-roles')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white"
                title="Configuración de roles"
              >
                <Shield className="w-3.5 h-3.5 text-[#8a4dff]" />
                {!collapsed && <span className="truncate">Config. de roles</span>}
              </button>

              <button
                onClick={() => onSelectView('config-permisos')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white"
                title="Configuración de permisos"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#8a4dff]" />
                {!collapsed && <span className="truncate">Config. permisos</span>}
              </button>

              <button
                onClick={() => onSelectView('usuarios')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'usuarios'
                    ? 'bg-[#1e113a] text-white font-semibold'
                    : 'text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white'
                }`}
                title="Usuarios del sistema"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#8a4dff]" />
                  {!collapsed && <span>Usuarios</span>}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* 6. PORTAL */}
        <div className="space-y-1 pt-1">
          {!collapsed ? (
            <button
              onClick={() => toggleSection('portal')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c9b7ff]/70 hover:text-white transition-colors"
            >
              <span>PORTAL</span>
              {openSections.portal ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <div className="h-px bg-[#261845] my-2" />
          )}

          {(openSections.portal || collapsed) && (
            <div className="space-y-0.5 pl-1">
              <button
                onClick={() => onSelectView('portal-cliente')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#c9b7ff]/80 hover:bg-[#160c2b] hover:text-white"
                title="Portal de cliente"
              >
                <Globe className="w-3.5 h-3.5 text-[#4be5ff]" />
                {!collapsed && <span>Portal de cliente</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Quick Status */}
      {!collapsed && (
        <div className="pt-3 mt-2 border-t border-[#261845] text-[11px] text-[#c9b7ff]/60 flex items-center justify-between px-2">
          <span>Fase 0 · Fundación</span>
          <span className="font-mono text-[10px]">v0.1.0</span>
        </div>
      )}
    </aside>
  );
};
