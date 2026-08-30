import React, { useState } from 'react';
import { OrbitView } from './types';
import {
  CheckSquare,
  Briefcase,
  Plus,
  Clock,
  LayoutDashboard,
  Users2,
  DollarSign,
  Users,
  BrainCircuit,
  X,
  ChevronRight,
  TrendingUp,
  Folder
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: OrbitView;
  onSelectView: (view: OrbitView) => void;
  onOpenManualLogModal: () => void;
  onOpenNewTaskModal?: () => void;
  hasActiveTimer?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenManualLogModal,
  onOpenNewTaskModal,
  hasActiveTimer = false
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleNavClick = (view: OrbitView) => {
    onSelectView(view);
    setIsMoreMenuOpen(false);
  };

  const navItems = [
    {
      id: 'tareas' as OrbitView,
      label: 'Tareas',
      icon: CheckSquare,
      isActive: currentView === 'tareas'
    },
    {
      id: 'proyectos' as OrbitView,
      label: 'Proyectos',
      icon: Folder,
      isActive: currentView === 'proyectos'
    },
    // Center Action Button: Cargar Horas (Rápido)
    {
      id: 'cargar' as const,
      label: 'Cargar',
      icon: Plus,
      isAction: true
    },
    {
      id: 'timesheets' as OrbitView,
      label: 'Horas',
      icon: Clock,
      isActive: currentView === 'timesheets'
    },
    {
      id: 'more' as const,
      label: 'Más',
      icon: LayoutDashboard,
      isActive: ['dashboard', 'clientes', 'capacidad', 'finanzas', 'usuarios', 'el-muro', 'nova-ia'].includes(currentView)
    }
  ];

  return (
    <>
      {/* Drawer / Sheet de "Más Módulos" para Mobile */}
      {isMoreMenuOpen && (
        <div
          id="mobile-more-menu-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMoreMenuOpen(false);
          }}
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150"
        >
          <div
            id="mobile-more-menu-sheet"
            className="bg-[#0d0718] border-t border-[#261845] rounded-t-3xl p-5 pb-8 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 text-white"
          >
            {/* Sheet Handle & Header */}
            <div className="w-12 h-1 bg-[#332258] rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between pb-3 border-b border-[#261845] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#d4ff4a]" />
                <span className="font-extrabold text-sm text-white">Módulos Orbit</span>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 text-[#c9b7ff] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modules Grid */}
            <div className="space-y-4">
              {/* Estratégico & Finanzas */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9b7ff]/60 block mb-2">
                  Estratégico & Control
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentView === 'dashboard'
                        ? 'bg-[#241344] border-[#8a4dff] text-white'
                        : 'bg-[#140b24] border-[#261845] text-[#c9b7ff]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#d4ff4a] shrink-0" />
                    <div className="truncate">
                      <span className="block text-xs font-bold truncate">Dashboard</span>
                      <span className="text-[10px] text-[#c9b7ff]/60 block truncate">KPIs Ejecutivos</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('finanzas')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentView === 'finanzas'
                        ? 'bg-[#241344] border-[#8a4dff] text-white'
                        : 'bg-[#140b24] border-[#261845] text-[#c9b7ff]'
                    }`}
                  >
                    <DollarSign className="w-4 h-4 text-[#10b981] shrink-0" />
                    <div className="truncate">
                      <span className="block text-xs font-bold truncate">Finanzas</span>
                      <span className="text-[10px] text-[#c9b7ff]/60 block truncate">Margen y fees</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Clientes & Capacidad */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9b7ff]/60 block mb-2">
                  Operación & Relaciones
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick('clientes')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentView === 'clientes'
                        ? 'bg-[#241344] border-[#8a4dff] text-white'
                        : 'bg-[#140b24] border-[#261845] text-[#c9b7ff]'
                    }`}
                  >
                    <Users2 className="w-4 h-4 text-[#38bdf8] shrink-0" />
                    <div className="truncate">
                      <span className="block text-xs font-bold truncate">Clientes</span>
                      <span className="text-[10px] text-[#c9b7ff]/60 block truncate">Cuentas y marcas</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('capacidad')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentView === 'capacidad'
                        ? 'bg-[#241344] border-[#8a4dff] text-white'
                        : 'bg-[#140b24] border-[#261845] text-[#c9b7ff]'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-[#f59e0b] shrink-0" />
                    <div className="truncate">
                      <span className="block text-xs font-bold truncate">Capacidad</span>
                      <span className="text-[10px] text-[#c9b7ff]/60 block truncate">Carga del equipo</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Colaboración & IA */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9b7ff]/60 block mb-2">
                  Equipo & Asistente
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick('usuarios')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentView === 'usuarios'
                        ? 'bg-[#241344] border-[#8a4dff] text-white'
                        : 'bg-[#140b24] border-[#261845] text-[#c9b7ff]'
                    }`}
                  >
                    <Users className="w-4 h-4 text-[#cbd5e1] shrink-0" />
                    <div className="truncate">
                      <span className="block text-xs font-bold truncate">Equipo</span>
                      <span className="text-[10px] text-[#c9b7ff]/60 block truncate">Roles y accesos</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('nova-ia')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentView === 'nova-ia'
                        ? 'bg-[#241344] border-[#8a4dff] text-white'
                        : 'bg-[#140b24] border-[#261845] text-[#c9b7ff]'
                    }`}
                  >
                    <BrainCircuit className="w-4 h-4 text-[#d4ff4a] shrink-0" />
                    <div className="truncate">
                      <span className="block text-xs font-bold truncate">Nova IA</span>
                      <span className="text-[10px] text-[#c9b7ff]/60 block truncate">Copiloto predictivo</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        aria-label="Navegación principal móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0718]/95 backdrop-blur-lg border-t border-[#261845] px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            // Center Action: "Cargar"
            if (item.isAction) {
              return (
                <div key="action-cargar" className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={onOpenManualLogModal}
                    className="w-12 h-12 -mt-4 rounded-full bg-gradient-to-tr from-[#501f92] to-[#8a4dff] text-white flex items-center justify-center shadow-lg shadow-[#8a4dff]/30 active:scale-95 transition-transform border-2 border-[#0d0718] cursor-pointer"
                    title="Cargar horas manualmente"
                    aria-label="Cargar horas de trabajo"
                  >
                    <Clock className="w-5 h-5 text-white" />
                  </button>
                  <span className="text-[10px] font-bold text-[#d4ff4a] mt-0.5 select-none">
                    Cargar
                  </span>
                </div>
              );
            }

            // More Options Drawer Button
            if (item.id === 'more') {
              return (
                <button
                  key="nav-more"
                  type="button"
                  onClick={() => setIsMoreMenuOpen(true)}
                  className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] min-h-[44px] cursor-pointer transition-colors ${
                    item.isActive ? 'text-[#d4ff4a] font-bold' : 'text-[#c9b7ff]/70 hover:text-white'
                  }`}
                  aria-label="Más módulos"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">{item.label}</span>
                </button>
              );
            }

            // Standard Navigation Tabs
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id as OrbitView)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] min-h-[44px] cursor-pointer transition-colors relative ${
                  item.isActive ? 'text-white font-bold' : 'text-[#c9b7ff]/70 hover:text-white'
                }`}
                aria-label={`Ir a ${item.label}`}
              >
                <item.icon className={`w-5 h-5 ${item.isActive ? 'text-[#d4ff4a]' : ''}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
                {item.isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#d4ff4a] absolute bottom-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
