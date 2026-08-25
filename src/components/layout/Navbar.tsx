import React from 'react';
import { NavigationSection } from '../../types';
import { Badge } from '../ui/Badge';
import { Layers, Sparkles, Box, Activity, Palette, FileCode, CheckCircle2, LayoutGrid } from 'lucide-react';

export interface NavbarProps {
  activeSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onSelectSection }) => {
  const navItems: { id: NavigationSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
    { id: 'taskflow-prototype', label: '✨ TaskFlow SaaS', icon: <LayoutGrid className="w-4 h-4 text-[#d4ff4a]" /> },
    { id: 'foundations', label: 'Foundations', icon: <Palette className="w-4 h-4" /> },
    { id: 'liquid-glass', label: 'Liquid Glass', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'components', label: 'Components', icon: <Box className="w-4 h-4" /> },
    { id: 'motion', label: 'Motion', icon: <Activity className="w-4 h-4" /> },
    { id: 'tokens', label: 'Tokens & Export', icon: <FileCode className="w-4 h-4" /> },
    { id: 'prompt-guide', label: 'AI Rules & Prompts', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090513]/95 backdrop-blur-xl border-b border-[#140b24] shadow-xs text-white">
      <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title with Keyboard Focus */}
        <button
          onClick={() => onSelectSection('overview')}
          aria-label="Uhura Group Design System 2026 - Inicio"
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090513] rounded-xl p-1 -ml-1 transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8a4dff] to-[#501f92] flex items-center justify-center shadow-[0_0_15px_rgba(138,77,255,0.4)]">
            <span className="text-white font-extrabold text-base tracking-tighter">U</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">UHURA GROUP</span>
              <Badge variant="accent" size="xs">2026</Badge>
            </div>
            <span className="text-[11px] font-medium text-[#c9b7ff] tracking-wide block">CANONICAL DESIGN SYSTEM</span>
          </div>
        </button>

        {/* Navigation Tabs with proper A11y Tablist */}
        <nav
          role="tablist"
          aria-label="Navegación principal del sistema de diseño"
          className="hidden lg:flex items-center gap-1 bg-[#140b24] p-1 rounded-full border border-[#8a4dff]/25"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${item.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelectSection(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff4a] focus-visible:ring-offset-1 focus-visible:ring-offset-[#140b24] cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#d4ff4a] to-[#edff9b] text-[#17131f] shadow-[0_0_15px_rgba(212,255,74,0.3)] font-bold'
                    : 'text-[#c9b7ff] hover:text-white hover:bg-white/10'
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status */}
        <div className="flex items-center gap-2">
          <Badge variant="glass" size="sm" isDot>
            WCAG 2.2 AA Standard
          </Badge>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div
        role="tablist"
        aria-label="Navegación móvil"
        className="lg:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 border-t border-[#140b24] bg-[#090513] scrollbar-none"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectSection(item.id)}
              className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff4a] touch-manipulation ${
                isActive
                  ? 'bg-gradient-to-r from-[#d4ff4a] to-[#edff9b] text-[#17131f] font-bold'
                  : 'text-[#c9b7ff] hover:bg-white/10'
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
