import React, { useState, useRef, useEffect, ReactNode, useId } from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  shortcut?: string;
  contextTheme?: 'light' | 'dark';
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 150,
  shortcut,
  contextTheme = 'light',
  disabled = false,
  className = '',
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = useId();
  const isDark = contextTheme === 'dark';

  const showTooltip = () => {
    if (disabled || !content) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  // Keyboard accessibility: dismiss on Escape (WCAG 1.4.13)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        hideTooltip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible]);

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
    }
  };

  // Arrow classes
  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-t-[#0f172a] border-x-transparent border-b-transparent border-4';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-[#0f172a] border-x-transparent border-t-transparent border-4';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-[#0f172a] border-y-transparent border-r-transparent border-4';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-[#0f172a] border-y-transparent border-l-transparent border-4';
    }
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}

      {isVisible && !disabled && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 pointer-events-none whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded-lg shadow-lg border animate-in fade-in zoom-in-95 duration-150 ${getPositionClasses()} ${
            isDark
              ? 'bg-[#1e172e] text-[#f2ecfb] border-[#8a4dff]/30 shadow-black/40'
              : 'bg-[#0f172a] text-white border-[#334155] shadow-slate-900/30'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span>{content}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-white/20 text-white/90 border border-white/10">
                {shortcut}
              </kbd>
            )}
          </div>
          {/* Arrow */}
          <div className={`absolute w-0 h-0 ${getArrowClasses()}`} />
        </div>
      )}
    </div>
  );
};
