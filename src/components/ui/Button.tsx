import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { ButtonVariant, ButtonSize } from '../../types';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
  isFullWidth?: boolean;
  contextTheme?: 'dark' | 'light';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  isFullWidth = false,
  contextTheme = 'light',
  isLoading = false,
  loadingText,
  className = '',
  disabled,
  ...props
}) => {
  // Focus ring strictly aligned with WCAG 2.4.7 and contrasting with context theme
  const focusRingClasses =
    contextTheme === 'dark'
      ? 'focus-visible:ring-2 focus-visible:ring-[#c9b7ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]'
      : 'focus-visible:ring-2 focus-visible:ring-[#501f92] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const baseClasses = `relative inline-flex items-center justify-center font-semibold select-none transition-all duration-150 ease-out touch-manipulation focus:outline-none ${focusRingClasses}`;

  // Size styling ensuring comfortable touch target bounds
  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'h-7 px-2.5 text-xs gap-1 rounded-md',
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    md: 'h-9 px-3.5 sm:px-4 text-xs sm:text-sm gap-2 rounded-lg',
    lg: 'h-10 px-5 text-sm gap-2.5 rounded-xl',
    xl: 'h-12 px-6 text-base gap-3 rounded-xl',
  };

  // FULL COHERENCY MATRIX: Clean, SaaS-mature styling
  const getVariantClasses = (): string => {
    const isDark = contextTheme === 'dark';

    switch (variant) {
      // 1. PRIMARY: Single Solid Purple Brand CTA (#501f92) with clean white text
      case 'primary':
        return isDark
          ? 'bg-[#8a4dff] text-white font-bold hover:bg-[#7839ee] active:bg-[#6829de] shadow-2xs'
          : 'bg-[#501f92] text-white font-bold hover:bg-[#401677] active:bg-[#341163] shadow-2xs';

      // 2. SECONDARY: Neutral SaaS White/Slate with subtle border
      case 'secondary':
        return isDark
          ? 'bg-white/10 text-white hover:bg-white/15 active:bg-white/20 border border-white/15 shadow-2xs'
          : 'bg-white text-[#0f172a] hover:bg-[#f8fafc] active:bg-[#f1f5f9] border border-[#e2e8f0] hover:border-[#cbd5e1] shadow-2xs font-semibold';

      // 3. BRAND-SUBTLE: Soft brand tint for secondary actions
      case 'brand-subtle':
        return isDark
          ? 'bg-[#501f92]/30 text-[#c9b7ff] hover:bg-[#501f92]/45 border border-[#8a4dff]/30 font-semibold'
          : 'bg-[#f5f3ff] text-[#501f92] hover:bg-[#ede9fe] active:bg-[#e0e7ff] border border-[#ddd6fe] font-semibold';

      // 4. OUTLINE: Clean 1px border
      case 'outline':
        return isDark
          ? 'bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/50 active:bg-white/15 shadow-2xs font-medium'
          : 'bg-transparent border border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc] hover:border-[#94a3b8] active:bg-[#f1f5f9] shadow-2xs font-medium';

      // 5. GHOST: Borderless neutral button
      case 'ghost':
        return isDark
          ? 'bg-transparent text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15 font-medium'
          : 'bg-transparent text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] active:bg-[#e2e8f0] font-medium';

      // 6. DANGER: Semantic destructive action
      case 'danger':
        return isDark
          ? 'bg-rose-900/30 text-rose-300 hover:bg-rose-900/50 border border-rose-800/40 font-semibold'
          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 font-semibold';

      // 7. GLASS: Translucent backdrop
      case 'glass':
        return isDark
          ? 'bg-white/10 backdrop-blur-md border border-white/15 text-white hover:bg-white/20 shadow-2xs'
          : 'bg-white/80 backdrop-blur-md border border-[#e2e8f0] text-[#0f172a] hover:bg-white shadow-2xs';

      default:
        return '';
    }
  };

  const isActionDisabled = disabled || isLoading;
  const motionClasses = isActionDisabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer active:scale-[0.99] transition-transform';

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
        <span className="inline-flex items-center gap-1.5" role="status">
          <svg
            className="animate-spin h-3.5 w-3.5 text-current"
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
        <span className="inline-flex shrink-0 text-current" aria-hidden="true">{icon}</span>
      )}
      
      {children && (
        <span className="truncate">
          {isLoading && loadingText ? loadingText : children}
        </span>
      )}

      {!isLoading && icon && iconPosition === 'right' && (
        <span className="inline-flex shrink-0 text-current" aria-hidden="true">{icon}</span>
      )}
    </button>
  );
};
