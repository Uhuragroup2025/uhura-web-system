import React, { ReactNode, KeyboardEvent, useRef } from 'react';
import { TabsVariant, TabsSize } from '../../types';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number | ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  contextTheme?: 'light' | 'dark';
  className?: string;
  fullWidth?: boolean;
  ariaLabel?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  contextTheme = 'light',
  className = '',
  fullWidth = false,
  ariaLabel = 'Pestañas de navegación',
}) => {
  const isDark = contextTheme === 'dark';
  const tabListRef = useRef<HTMLDivElement>(null);

  // Size styling for tabs
  const sizeClasses: Record<TabsSize, { tab: string; icon: string; text: string }> = {
    sm: {
      tab: 'py-1.5 px-3 text-xs gap-1.5',
      icon: 'w-3.5 h-3.5',
      text: 'text-xs',
    },
    md: {
      tab: 'py-2 px-3.5 text-xs sm:text-sm gap-2',
      icon: 'w-4 h-4',
      text: 'text-xs sm:text-sm',
    },
    lg: {
      tab: 'py-2.5 px-4 text-sm gap-2.5',
      icon: 'w-4.5 h-4.5',
      text: 'text-sm font-medium',
    },
  };

  // Keyboard navigation for accessibility (WCAG 2.1.1)
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const enabledCurrentIndex = enabledTabs.findIndex((t) => t.id === tabs[currentIndex].id);

    let nextTabId: string | null = null;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (enabledCurrentIndex + 1) % enabledTabs.length;
      nextTabId = enabledTabs[nextIndex].id;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (enabledCurrentIndex - 1 + enabledTabs.length) % enabledTabs.length;
      nextTabId = enabledTabs[prevIndex].id;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextTabId = enabledTabs[0].id;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextTabId = enabledTabs[enabledTabs.length - 1].id;
    }

    if (nextTabId) {
      onChange(nextTabId);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
      const targetBtn = Array.from(buttons || []).find((btn) => btn.getAttribute('data-tab-id') === nextTabId);
      targetBtn?.focus();
    }
  };

  // Container styling based on variant
  const getContainerClasses = () => {
    switch (variant) {
      case 'underline':
        return `flex items-center border-b ${
          isDark ? 'border-white/10' : 'border-[#e2e8f0]'
        } overflow-x-auto ${fullWidth ? 'w-full justify-between' : 'gap-1 sm:gap-2'}`;

      case 'segmented':
        return `inline-flex items-center p-0.5 rounded-lg border ${
          isDark
            ? 'bg-black/40 border-white/10'
            : 'bg-[#f1f5f9] border-[#e2e8f0]'
        } overflow-x-auto ${fullWidth ? 'w-full justify-between' : 'gap-1'}`;

      case 'subtle-pill':
        return `flex items-center p-1 rounded-xl ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-[#f8fafc] border border-[#e2e8f0]'
        } overflow-x-auto ${fullWidth ? 'w-full justify-between' : 'gap-1.5'}`;

      case 'capsule':
        return `flex items-center overflow-x-auto ${
          fullWidth ? 'w-full justify-between' : 'gap-1.5'
        }`;
    }
  };

  // Tab button styling based on state & variant
  const getTabClasses = (isActive: boolean, isDisabled?: boolean) => {
    if (isDisabled) {
      return `opacity-40 cursor-not-allowed ${
        isDark ? 'text-white/40' : 'text-[#94a3b8]'
      }`;
    }

    switch (variant) {
      // 1. UNDERLINE (Canonical Default for Views):
      // Clean high-contrast text with a subtle 2px bottom indicator. NEVER looks like a solid button.
      case 'underline':
        if (isActive) {
          return isDark
            ? 'text-[#c9b7ff] font-bold border-b-2 border-[#8a4dff] -mb-px bg-transparent'
            : 'text-[#0f172a] font-bold border-b-2 border-[#501f92] -mb-px bg-transparent';
        }
        return isDark
          ? 'text-white/60 hover:text-white hover:border-b-2 hover:border-white/30 font-medium border-b-2 border-transparent -mb-px transition-colors'
          : 'text-[#64748b] hover:text-[#0f172a] hover:border-b-2 hover:border-[#cbd5e1] font-medium border-b-2 border-transparent -mb-px transition-colors';

      // 2. SEGMENTED (Compact Controls):
      case 'segmented':
        if (isActive) {
          return isDark
            ? 'bg-[#8a4dff] text-white font-bold shadow-2xs rounded-md'
            : 'bg-white text-[#0f172a] font-bold shadow-2xs rounded-md border border-[#e2e8f0]';
        }
        return isDark
          ? 'text-[#c9b7ff] hover:text-white hover:bg-white/5 rounded-md transition-colors font-medium'
          : 'text-[#64748b] hover:text-[#0f172a] hover:bg-white/60 rounded-md transition-colors font-medium';

      // 3. SUBTLE PILL (Soft background tint):
      case 'subtle-pill':
        if (isActive) {
          return isDark
            ? 'bg-white/15 text-white font-bold rounded-lg shadow-2xs border border-white/20'
            : 'bg-white text-[#0f172a] font-bold rounded-lg shadow-2xs border border-[#e2e8f0]';
        }
        return isDark
          ? 'text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors'
          : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-lg transition-colors';

      // 4. CAPSULE:
      case 'capsule':
        if (isActive) {
          return isDark
            ? 'bg-white/20 text-white font-bold rounded-lg border border-white/30 shadow-2xs'
            : 'bg-[#f1f5f9] text-[#0f172a] font-bold rounded-lg border border-[#cbd5e1] shadow-2xs';
        }
        return isDark
          ? 'text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors'
          : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] rounded-lg transition-colors';
    }
  };

  // Badge styling inside active/inactive tabs
  const getBadgeClasses = (isActive: boolean) => {
    if (variant === 'underline') {
      if (isActive) {
        return isDark
          ? 'bg-[#501f92]/40 text-[#c9b7ff] border border-[#8a4dff]/40 font-bold'
          : 'bg-[#f5f3ff] text-[#501f92] border border-[#ddd6fe] font-bold';
      }
      return isDark
        ? 'bg-white/10 text-white/70 border border-white/10'
        : 'bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]';
    }

    if (isActive) {
      return isDark
        ? 'bg-black/20 text-current font-bold'
        : 'bg-[#501f92]/10 text-[#501f92] font-bold';
    }
    return isDark
      ? 'bg-white/10 text-white/70'
      : 'bg-[#e2e8f0] text-[#64748b]';
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label={ariaLabel}
      className={`${getContainerClasses()} ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            data-tab-id={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative inline-flex items-center justify-center font-medium select-none whitespace-nowrap transition-all duration-150 focus:outline-none focus-visible:ring-2 ${
              isDark ? 'focus-visible:ring-[#c9b7ff]' : 'focus-visible:ring-[#501f92]'
            } ${sizeClasses[size].tab} ${getTabClasses(isActive, isDisabled)} ${
              fullWidth ? 'flex-1' : ''
            } cursor-pointer`}
          >
            {tab.icon && (
              <span className={`shrink-0 ${sizeClasses[size].icon} flex items-center justify-center`}>
                {tab.icon}
              </span>
            )}
            <span className={sizeClasses[size].text}>{tab.label}</span>

            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md leading-none tracking-tight ml-1 ${getBadgeClasses(
                  isActive
                )}`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
