import React, { useState } from 'react';
import { OrbitView, UserItem } from './types';
import { canAccessModule } from './auth/permissions';
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
  Folder,
  BookOpen,
  Gamepad2,
  KeyRound,
  Monitor,
  Globe,
  type LucideIcon
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: OrbitView;
  onSelectView: (view: OrbitView) => void;
  onOpenManualLogModal: () => void;
  onOpenNewTaskModal?: () => void;
  hasActiveTimer?: boolean;
  /** Para mostrar solo los módulos permitidos (misma regla que el menú lateral). */
  currentUser?: UserItem;
}

type MoreItem = { view: OrbitView; label: string; icon: LucideIcon };

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenManualLogModal,
  onOpenNewTaskModal,
  hasActiveTimer = false,
  currentUser
}) => {
  // En móvil «Más» es la única puerta a los módulos (no hay menú hamburguesa): debe tener todo
  // lo del menú lateral y respetar los mismos permisos.
  const can = (m: string) => canAccessModule(currentUser, m);
  const moreGroups: { title: string; items: MoreItem[] }[] = [
    {
      title: 'Operación',
      items: [
        ...(can('proyectos') ? [{ view: 'proyectos' as OrbitView, label: 'Proyectos', icon: Folder }] : []),
        ...(can('capacidad') ? [{ view: 'capacidad' as OrbitView, label: 'Capacidad', icon: TrendingUp }] : [])
      ]
    },
    {
      title: 'Comercial',
      items: [
        ...(can('clientes') ? [{ view: 'clientes' as OrbitView, label: 'Clientes', icon: Users2 }] : []),
        ...(can('plantillas-producto') ? [{ view: 'plantillas-producto' as OrbitView, label: 'Servicios', icon: BookOpen }] : []),
        ...(can('new-business') ? [{ view: 'new-business' as OrbitView, label: 'New Business', icon: Briefcase }] : []),
        ...(can('finanzas') ? [{ view: 'finanzas' as OrbitView, label: 'Dirección y Finanzas', icon: DollarSign }] : [])
      ]
    },
    {
      title: 'Experiencia',
      items: can('la-colonia')
        ? [
            { view: 'la-colonia' as OrbitView, label: 'La Colonia', icon: Gamepad2 }
          ]
        : []
    },
    {
      title: 'Costos de operación',
      items: can('costos-operacion')
        ? [
            { view: 'licencias' as OrbitView, label: 'Licencias', icon: KeyRound },
            { view: 'hardware' as OrbitView, label: 'Hardware', icon: Monitor }
          ]
        : []
    },
    {
      title: 'Sistema',
      items: can('administracion')
        ? [
            { view: 'usuarios' as OrbitView, label: 'Equipo & Accesos', icon: Users },
            { view: 'portal-cliente' as OrbitView, label: 'Portal cliente', icon: Globe }
          ]
        : []
    }
  ].filter((g) => g.items.length > 0);

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleNavClick = (view: OrbitView) => {
    onSelectView(view);
    setIsMoreMenuOpen(false);
  };

  const navItems = [
    {
      id: 'mi-dia' as OrbitView,
      label: 'Mi Día',
      icon: CheckSquare,
      isActive: currentView === 'mi-dia' || currentView === 'dashboard'
    },
    {
      id: 'tareas' as OrbitView,
      label: 'Tareas',
      icon: Folder,
      isActive: currentView === 'tareas'
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
      isActive: ['proyectos', 'clientes', 'capacidad', 'plantillas-producto', 'new-business', 'finanzas', 'usuarios', 'la-colonia', 'licencias', 'hardware', 'portal-cliente'].includes(currentView)
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
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150"
        >
          <div
            id="mobile-more-menu-sheet"
            className="bg-[#0d0718] border-t border-[#261845] rounded-t-3xl p-5 pb-8 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 text-white"
          >
            {/* Sheet Handle & Header */}
            <div className="w-12 h-1 bg-[#332258] rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between pb-3 border-b border-[#261845] mb-3">
              <span className="font-bold text-sm text-white">Más</span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 text-[#c9b7ff] hover:text-white cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Módulos: solo título e ícono; mismos permisos que el menú lateral */}
            <div className="space-y-4">
              {moreGroups.map((group) => (
                <div key={group.title}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9b7ff]/60 block mb-2">{group.title}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = currentView === item.view;
                      return (
                        <button
                          key={item.view}
                          onClick={() => handleNavClick(item.view)}
                          aria-current={active ? 'page' : undefined}
                          className={`px-3 py-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                            active ? 'bg-[#241344] border-[#8a4dff] text-white' : 'bg-[#140b24] border-[#261845] text-[#e9e2fb] hover:border-[#3a2766]'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-[#c9b7ff] shrink-0" aria-hidden="true" />
                          <span className="text-xs font-semibold truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        aria-label="Navegación principal móvil"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0718]/95 backdrop-blur-lg border-t border-[#261845] px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
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
