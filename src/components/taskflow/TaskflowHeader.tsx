import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, X, LogOut, ShieldAlert, Sparkles, Check, ChevronDown, ExternalLink, Clock, Play, Pause, Square, Building2, Search, ArrowRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { orbitOperationalAlerts } from './mockData';
import { ActiveTimerState, TaskItem, UserItem } from './types';

export function formatHeaderTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface TaskflowHeaderProps {
  currentViewTitle?: string;
  onToggleMobileMenu?: () => void;
  onSelectAlert?: (alertId: string) => void;
  activeTimer?: ActiveTimerState | null;
  onPauseResumeTimer?: () => void;
  onStopTimer?: () => void;
  onOpenTaskDetail?: (taskId: string) => void;
  tasks?: TaskItem[];
  onSelectTask?: (task: TaskItem) => void;
  loggedHoursToday?: number;
  targetDayHours?: number;
  onNavigateToDashboard?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  currentUser?: UserItem;
}

export const TaskflowHeader: React.FC<TaskflowHeaderProps> = ({
  currentViewTitle = 'Dashboard ejecutivo',
  onToggleMobileMenu,
  onSelectAlert,
  activeTimer,
  onPauseResumeTimer,
  onStopTimer,
  onOpenTaskDetail,
  tasks = [],
  onSelectTask,
  loggedHoursToday = 3.5,
  targetDayHours = 8.0,
  onNavigateToDashboard,
  sidebarCollapsed = false,
  onToggleSidebarCollapse,
  currentUser
}) => {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [dailyProgressOpen, setDailyProgressOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(orbitOperationalAlerts);

  // Global Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dailyProgressRef = useRef<HTMLDivElement>(null);
  const alertsContainerRef = useRef<HTMLDivElement>(null);

  const unreadCount = activeAlerts.filter((a) => !a.read).length;

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setDailyProgressOpen(false);
        setAlertsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search and popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (dailyProgressRef.current && !dailyProgressRef.current.contains(target)) {
        setDailyProgressOpen(false);
      }
      if (alertsContainerRef.current && !alertsContainerRef.current.contains(target)) {
        setAlertsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setActiveAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleDismissAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Filter tasks for global search
  const matchingTasks = globalSearchQuery.trim()
    ? tasks.filter((t) => {
        if (t.isArchived) return false;
        const q = globalSearchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.clientName && t.clientName.toLowerCase().includes(q)) ||
          (t.projectName && t.projectName.toLowerCase().includes(q)) ||
          t.board.toLowerCase().includes(q) ||
          t.assignee.name.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  const handleSelectSearchResult = (task: TaskItem) => {
    setIsSearchOpen(false);
    setGlobalSearchQuery('');
    if (onSelectTask) {
      onSelectTask(task);
    } else if (onOpenTaskDetail) {
      onOpenTaskDetail(task.id);
    }
  };

  const dailyPercent = Math.min(100, Math.round((loggedHoursToday / targetDayHours) * 100));
  const remainingHours = Math.max(0, targetDayHours - loggedHoursToday);

  return (
    <header className="bg-white border-b border-[#e5e7eb] px-3 sm:px-5 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs gap-2 sm:gap-3">
      {/* Left: Mobile Menu Trigger + View Title (on XL) */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-xl text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] transition-colors cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* View Title: Displayed on XL screens to prevent visual redundancy with page headers on tablet */}
        <h1 className="hidden xl:block text-base font-bold tracking-tight text-[#0f172a] whitespace-nowrap">
          {currentViewTitle}
        </h1>
      </div>

      {/* Center: Global Task Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 min-w-[120px] max-w-xs md:max-w-sm lg:max-w-md mx-1">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar..."
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-[#e2e8f0] focus:border-[#501f92] pl-8 pr-9 sm:pr-14 py-1.5 rounded-xl text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#94a3b8] bg-white border border-[#e2e8f0] px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* Global Search Results Dropdown */}
        {isSearchOpen && globalSearchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] z-50 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">
              <span className="font-semibold">Resultados de búsqueda ({matchingTasks.length})</span>
              <span className="text-[10px]">Presiona Esc para cerrar</span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#f1f5f9]">
              {matchingTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#94a3b8]">
                  No se encontraron tareas que coincidan con &ldquo;{globalSearchQuery}&rdquo;
                </div>
              ) : (
                matchingTasks.map((task) => {
                  const consumedHours = ((task.consumedSeconds || 0) / 3600).toFixed(1);
                  const budgetedHours = (task.budgetedHours || 1).toFixed(1);
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleSelectSearchResult(task)}
                      className="p-3 hover:bg-[#f8fafc] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#64748b]">
                          <span className="font-semibold text-[#2563eb] truncate max-w-[120px]">
                            {task.clientName || 'Uhura'}
                          </span>
                          <span>›</span>
                          <span className="truncate max-w-[140px]">{task.projectName || task.board}</span>
                        </div>
                        <p className="text-xs font-bold text-[#0f172a] group-hover:text-[#501f92] transition-colors truncate">
                          {task.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[11px] font-mono text-[#64748b]">
                          {consumedHours}/{budgetedHours}h
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.status === 'Done'
                              ? 'bg-[#ecfdf5] text-[#166534]'
                              : task.status === 'In Progress'
                              ? 'bg-[#fff7ed] text-[#c2410c]'
                              : 'bg-[#f1f5f9] text-[#475569]'
                          }`}
                        >
                          {task.status === 'Done'
                            ? 'Listo'
                            : task.status === 'In Progress'
                            ? 'En Proceso'
                            : 'Por Hacer'}
                        </span>

                        <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#501f92] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Daily Progress Capsule (Opción A), Active Timer Badge, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Cápsula de Actividad del Día (Enfoque saludable y balance de Orbit) */}
        <div ref={dailyProgressRef} className="relative shrink-0">
          <button
            onClick={() => setDailyProgressOpen(!dailyProgressOpen)}
            className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] hover:border-[#cbd5e1] shadow-2xs transition-all cursor-pointer text-left group shrink-0"
            title="Ver tiempo ejecutado hoy"
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="w-2 h-2 rounded-full shrink-0 bg-[#501f92]"
              />
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold text-[#64748b] leading-none uppercase tracking-wider">
                  Hoy
                </p>
                <p className="text-xs font-mono font-bold text-[#0f172a] leading-tight whitespace-nowrap">
                  {loggedHoursToday.toFixed(1)}h <span className="text-[#94a3b8] font-normal text-[10px]">registradas</span>
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-[#f2ecfb] text-[#501f92] border border-[#e9d5ff] shrink-0">
              Activo
            </span>
          </button>

          {/* Daily Activity Popover */}
          {dailyProgressOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] z-50 p-4 animate-in fade-in zoom-in-95 space-y-3">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#501f92]" />
                  <h4 className="text-xs font-bold text-[#0f172a]">Tiempo Registrado (Hoy)</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#059669]">
                  Lunes - Viernes
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#64748b]">
                <div className="flex justify-between">
                  <span>Horas Invertidas Hoy:</span>
                  <strong className="text-[#0f172a] font-mono">{loggedHoursToday.toFixed(1)}h</strong>
                </div>
                <div className="flex justify-between">
                  <span>Criterio Orbit:</span>
                  <span className="text-[#64748b] text-[11px]">Enfoque en avance real</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] text-[11px] text-[#64748b] leading-relaxed">
                Orbit registra el tiempo real ejecutado sobre tareas sin imponer cuotas de llenado artificial.
              </div>

              {onNavigateToDashboard && (
                <button
                  onClick={() => {
                    onNavigateToDashboard();
                    setDailyProgressOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#f8fafc] hover:bg-[#501f92] text-[#501f92] hover:text-white border border-[#e2e8f0] hover:border-[#501f92] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Ver Ritmo y Capacidad</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
        {/* Active Timer Capsule (Clean & Integrated) */}
        {activeTimer && (
          <div className="flex items-center bg-[#f8fafc] border border-[#501f92]/30 px-3 py-1.5 rounded-2xl shadow-xs gap-2.5 animate-in fade-in zoom-in-95">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  activeTimer.isPaused ? 'bg-[#f59e0b]' : 'bg-[#501f92]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  activeTimer.isPaused ? 'bg-[#f59e0b]' : 'bg-[#501f92]'
                }`}
              />
            </span>

            <button
              onClick={() => onOpenTaskDetail && onOpenTaskDetail(activeTimer.taskId)}
              className="text-left hidden lg:block hover:underline cursor-pointer"
            >
              <p className="text-[10px] font-bold uppercase text-[#501f92] leading-none truncate max-w-[140px]">
                {activeTimer.clientName}
              </p>
              <p className="text-xs font-bold text-[#0f172a] truncate max-w-[150px] leading-tight">
                {activeTimer.taskTitle}
              </p>
            </button>

            <span className="font-mono text-xs font-bold text-[#501f92] bg-[#f2ecfb] px-2 py-0.5 rounded-lg border border-[#8a4dff]/20">
              {formatHeaderTime(activeTimer.elapsedSeconds)}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={onStopTimer}
                className="p-1.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1 text-xs font-bold"
                title="Detener Timer y Registrar"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline text-[10px]">Detener</span>
              </button>
            </div>
          </div>
        )}

        {/* Operational Alerts Bell Dropdown */}
        <div ref={alertsContainerRef} className="relative">
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="p-2 rounded-xl text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] transition-colors relative cursor-pointer"
            aria-label="Ver alertas operativas"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-white" />
            )}
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#e5e7eb] z-50 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-3.5 bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#501f92]" />
                  <h4 className="font-bold text-xs text-[#111827]">Alertas Operativas & Desvíos</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#fee2e2] text-[#dc2626]">
                    {unreadCount}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-[#501f92] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Leídas</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#f3f4f6]">
                {activeAlerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#9ca3af]">
                    No hay alertas activas en este momento
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        if (onSelectAlert) onSelectAlert(alert.id);
                        setAlertsOpen(false);
                      }}
                      className={`p-3.5 hover:bg-[#f9fafb] transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        !alert.read ? 'bg-[#faf5ff]/40' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              alert.severity === 'critical'
                                ? 'bg-[#ef4444]'
                                : alert.severity === 'high'
                                ? 'bg-[#f59e0b]'
                                : 'bg-[#3b82f6]'
                            }`}
                          />
                          <p className="text-xs font-bold text-[#111827]">{alert.title}</p>
                        </div>
                        <p className="text-[11px] text-[#6b7280] line-clamp-2 leading-relaxed">
                          {alert.description}
                        </p>
                        <p className="text-[10px] text-[#9ca3af]">{alert.timeAgo}</p>
                      </div>

                      <button
                        onClick={(e) => handleDismissAlert(alert.id, e)}
                        className="text-[#9ca3af] hover:text-[#4b5563] p-1 rounded-lg hover:bg-[#e5e7eb] cursor-pointer"
                        title="Descartar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Badge (Read-only, no identity switcher here) */}
        <div
          className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#e5e7eb] shrink-0"
          title={`${currentUser?.name || 'Paola (Lead PM)'} · ${currentUser?.professionalRole || currentUser?.jobTitle || 'Product Lead'} (${currentUser?.accessLevel || 'leader'})`}
        >
          <div
            className={`w-8 h-8 rounded-full ${currentUser?.avatarBg || 'bg-[#501f92]'} text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#8a4dff]/20 shrink-0`}
          >
            {currentUser?.initials || 'PL'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-[#111827] leading-tight whitespace-nowrap">
              {currentUser?.name || 'Paola (Lead PM)'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-[#6b7280] font-medium leading-tight whitespace-nowrap">
                {currentUser?.professionalRole || currentUser?.jobTitle || 'Product Lead'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold uppercase tracking-wider bg-[#f3e8ff] text-[#6b21a8]">
                {currentUser?.accessLevel || 'leader'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

