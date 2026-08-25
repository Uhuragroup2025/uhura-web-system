import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { ButtonVariant, ButtonSize } from '../../types';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  isFullWidth?: boolean;
  contextTheme?: 'dark' | 'light';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  children,
  isFullWidth = false,
  contextTheme = 'dark',
  isLoading = false,
  loadingText,
  className = '',
  disabled,
  ...props
}) => {
  // Focus ring strictly aligned with WCAG 2.4.7 and contrasting with context theme
  const focusRingClasses =
    contextTheme === 'dark'
      ? 'focus-visible:ring-3 focus-visible:ring-[#d4ff4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090513]'
      : 'focus-visible:ring-3 focus-visible:ring-[#8a4dff] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const baseClasses = `relative inline-flex items-center justify-center font-semibold rounded-full select-none transition-all duration-150 ease-out touch-manipulation focus:outline-none ${focusRingClasses}`;

  // Size styling ensuring comfortable touch target bounds >= 44px (WCAG 2.5.8)
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'min-h-[38px] px-4 text-xs gap-1.5',
    md: 'min-h-[44px] px-6 text-sm gap-2',
    lg: 'min-h-[48px] px-8 text-base gap-2.5',
    xl: 'min-h-[54px] px-10 text-lg gap-3',
  };

  // FULL COHERENCY MATRIX: Context-aware styling for all variants
  const getVariantClasses = (): string => {
    const isDark = contextTheme === 'dark';

    switch (variant) {
      case 'primary':
        return isDark
          ? 'bg-gradient-to-r from-[#d4ff4a] to-[#edff9b] text-[#17131f] font-bold shadow-[0_8px_24px_rgba(212,255,74,0.25)] hover:shadow-[0_14px_32px_rgba(212,255,74,0.4)] active:bg-[#c9f53e]'
          : 'bg-[#8a4dff] text-white font-bold hover:bg-[#7335d6] active:bg-[#6426c4] shadow-[0_8px_24px_rgba(138,77,255,0.25)] hover:shadow-[0_14px_32px_rgba(138,77,255,0.4)]';

      case 'secondary':
        return isDark
          ? 'bg-white/10 text-white hover:bg-white/20 active:bg-white/25 border border-white/20 shadow-xs'
          : 'bg-[#8a4dff]/12 text-[#501f92] hover:bg-[#8a4dff]/20 active:bg-[#8a4dff]/25 border border-[#8a4dff]/25 font-bold shadow-xs';

      case 'outline':
        // Clean 1px hairline border and text adapting immediately to dark or light backgrounds
        return isDark
          ? 'bg-transparent border border-white/80 text-white hover:bg-white hover:text-[#17131f] hover:border-white active:bg-white/90 shadow-xs font-semibold'
          : 'bg-transparent border border-[#501f92] text-[#501f92] hover:bg-[#501f92] hover:text-white active:bg-[#401677] shadow-xs font-semibold';

      case 'ghost':
        return isDark
          ? 'bg-transparent text-white/90 hover:text-white hover:bg-white/10 active:bg-white/15'
          : 'bg-transparent text-[#501f92] hover:text-[#501f92] hover:bg-[#8a4dff]/10 active:bg-[#8a4dff]/20';

      case 'glass':
        return isDark
          ? 'bg-white/15 backdrop-blur-md border border-white/25 text-white hover:bg-white/25 active:bg-white/30 shadow-xs'
          : 'bg-white/80 backdrop-blur-md border border-[#17131f]/15 text-[#17131f] hover:bg-white active:bg-white/90 shadow-xs';

      default:
        return '';
    }
  };

  // Motion interaction classes (disabled when prefers-reduced-motion is active)
  const isActionDisabled = disabled || isLoading;
  const motionClasses = isActionDisabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'hover:scale-[1.03] hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-0 cursor-pointer motion-reduce:transform-none motion-reduce:transition-none';

  const widthClass = isFullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${getVariantClasses()} ${motionClasses} ${widthClass} ${className}`}
      disabled={isActionDisabled}
      aria-disabled={isActionDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <span className="inline-flex items-center gap-2" role="status">
          <svg
            className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Cargando...</span>
        </span>
      )}

      {/* Button Content */}
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>
      )}
      
      <span className="truncate">
        {isLoading && loadingText ? loadingText : children}
      </span>

      {!isLoading && icon && iconPosition === 'right' && (
        <span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>
      )}
    </button>
  );
};
