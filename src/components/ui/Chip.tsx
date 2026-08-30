import React, { ReactNode, MouseEvent } from 'react';
import { X, Check } from 'lucide-react';
import { ChipVariant, ChipSize } from '../../types';

export interface ChipProps {
  label: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: (e: MouseEvent) => void;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ReactNode;
  count?: number | string;
  disabled?: boolean;
  contextTheme?: 'light' | 'dark';
  className?: string;
  showCheckOnSelect?: boolean;
  ariaLabel?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onSelect,
  onRemove,
  variant = 'filter',
  size = 'sm',
  icon,
  count,
  disabled = false,
  contextTheme = 'light',
  className = '',
  showCheckOnSelect = false,
  ariaLabel,
}) => {
  const isDark = contextTheme === 'dark';

  const sizeClasses: Record<ChipSize, { chip: string; icon: string; text: string }> = {
    xs: {
      chip: 'h-6 px-2 text-[11px] gap-1 rounded-md',
      icon: 'w-3 h-3',
      text: 'text-[11px]',
    },
    sm: {
      chip: 'h-7 px-2.5 text-xs gap-1.5 rounded-lg',
      icon: 'w-3.5 h-3.5',
      text: 'text-xs',
    },
    md: {
      chip: 'h-8 px-3 text-xs sm:text-sm gap-2 rounded-lg',
      icon: 'w-4 h-4',
      text: 'text-xs sm:text-sm',
    },
  };

  const focusRingClasses = isDark
    ? 'focus-visible:ring-2 focus-visible:ring-[#c9b7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]'
    : 'focus-visible:ring-2 focus-visible:ring-[#501f92] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const getVariantClasses = () => {
    if (disabled) {
      return isDark
        ? 'opacity-40 bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
        : 'opacity-40 bg-[#f1f5f9] text-[#94a3b8] border border-[#e2e8f0] cursor-not-allowed';
    }

    if (selected) {
      return isDark
        ? 'bg-[#8a4dff] text-white font-semibold border border-[#8a4dff] shadow-2xs'
        : 'bg-[#501f92] text-white font-semibold border border-[#501f92] shadow-2xs';
    }

    // Default / Unselected states:
    return isDark
      ? 'bg-white/10 text-[#c9b7ff] border border-white/15 hover:bg-white/15 hover:text-white'
      : 'bg-white text-[#334155] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] shadow-2xs';
  };

  const handleChipClick = () => {
    if (!disabled && onSelect) {
      onSelect();
    }
  };

  return (
    <div
      role={onSelect ? 'button' : undefined}
      aria-pressed={onSelect ? selected : undefined}
      aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
      tabIndex={onSelect && !disabled ? 0 : undefined}
      onClick={handleChipClick}
      onKeyDown={(e) => {
        if (onSelect && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`inline-flex items-center justify-center font-medium select-none whitespace-nowrap transition-all duration-150 ease-out focus:outline-none ${focusRingClasses} ${
        sizeClasses[size].chip
      } ${getVariantClasses()} ${onSelect && !disabled ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Leading Icon or Selection Checkmark */}
      {selected && showCheckOnSelect ? (
        <Check className={`${sizeClasses[size].icon} shrink-0 stroke-[2.5]`} />
      ) : (
        icon && <span className={`${sizeClasses[size].icon} shrink-0 flex items-center justify-center`}>{icon}</span>
      )}

      {/* Label */}
      <span className={`leading-none ${sizeClasses[size].text}`}>{label}</span>

      {/* Optional Counter badge */}
      {count !== undefined && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold leading-tight ${
            selected
              ? isDark
                ? 'bg-black/20 text-white'
                : 'bg-white/20 text-white'
              : isDark
              ? 'bg-white/10 text-white/80'
              : 'bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]'
          }`}
        >
          {count}
        </span>
      )}

      {/* Trailing Remove Button for Removable Variant */}
      {onRemove && (
        <button
          type="button"
          aria-label="Remover filtro"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onRemove(e);
          }}
          className="p-0.5 -mr-1 rounded-md hover:bg-black/10 transition-colors cursor-pointer focus:outline-none"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
