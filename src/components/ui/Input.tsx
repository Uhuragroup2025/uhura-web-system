import React, { InputHTMLAttributes, ReactNode } from 'react';
import { InputVariant } from '../../types';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: InputVariant;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
  isLoading?: boolean;
  contextTheme?: 'dark' | 'light';
  sizeVariant?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
  label,
  variant = 'default',
  helperText,
  error,
  leftIcon,
  rightIcon,
  required = false,
  isLoading = false,
  contextTheme = 'light',
  sizeVariant = 'md',
  id,
  className = '',
  disabled,
  ...props
}) => {
  const isDark = contextTheme === 'dark' || variant === 'glass';

  // Stable ID generation for WCAG label associations
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs rounded-md',
    md: 'h-9 px-3.5 text-xs sm:text-sm rounded-lg',
    lg: 'h-10 px-4 text-sm rounded-xl',
  };

  const baseInputClasses =
    'w-full transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#501f92] focus-visible:ring-offset-1';

  const getVariantClasses = (): string => {
    if (variant === 'glass') {
      return error
        ? 'bg-white/20 backdrop-blur-md border border-rose-400 text-white placeholder-white/70 focus-visible:ring-rose-400'
        : 'bg-white/15 backdrop-blur-md border border-white/30 text-white placeholder-white/70 hover:border-white/50 focus-visible:ring-[#8a4dff] shadow-2xs';
    }

    // Default variant
    if (isDark) {
      return error
        ? 'bg-[#140b24] border border-rose-500 text-white placeholder-white/50 focus-visible:ring-rose-500'
        : 'bg-[#140b24] border border-white/15 text-white placeholder-white/40 hover:border-white/30 focus-visible:ring-[#8a4dff] shadow-2xs';
    }

    return error
      ? 'bg-white border border-rose-500 text-[#0f172a] placeholder-[#94a3b8] focus-visible:ring-rose-500 focus-visible:border-rose-500 shadow-2xs'
      : 'bg-white border border-[#e2e8f0] text-[#0f172a] placeholder-[#94a3b8] hover:border-[#cbd5e1] focus:border-[#501f92] shadow-2xs';
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed bg-[#f8fafc] dark:bg-white/5'
    : '';

  const labelColor = isDark ? 'text-white' : 'text-[#0f172a]';

  return (
    <div className="w-full flex flex-col gap-1">
      {/* Accessible Label (WCAG 3.3.2) */}
      {label && (
        <label
          htmlFor={inputId}
          className={`text-xs font-semibold tracking-tight flex items-center gap-1 ${labelColor}`}
        >
          {label}
          {required && (
            <span className="text-rose-500 font-bold" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only">(obligatorio)</span>}
        </label>
      )}

      {/* Input Field Wrapper */}
      <div className="relative flex items-center">
        {leftIcon && (
          <span
            className={`absolute left-3 pointer-events-none ${
              isDark ? 'text-white/60' : 'text-[#94a3b8]'
            }`}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled || isLoading}
          aria-disabled={disabled || isLoading}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={describedBy}
          className={`${baseInputClasses} ${sizeClasses[sizeVariant]} ${getVariantClasses()} ${disabledClasses} ${
            leftIcon ? 'pl-9' : ''
          } ${rightIcon || isLoading ? 'pr-9' : ''} ${className}`}
          {...props}
        />

        {/* Loading Spinner or Right Icon */}
        {isLoading ? (
          <span className={`absolute right-3 ${isDark ? 'text-[#c9b7ff]' : 'text-[#501f92]'}`} role="status">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="sr-only">Validando...</span>
          </span>
        ) : rightIcon ? (
          <span
            className={`absolute right-3 ${
              isDark ? 'text-white/60' : 'text-[#94a3b8]'
            }`}
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        ) : null}
      </div>

      {/* Error Message with Icon & role="alert" (WCAG 3.3.1) */}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className={`text-xs font-medium flex items-center gap-1.5 ${
            isDark ? 'text-rose-300' : 'text-rose-600'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p
          id={helperId}
          className={`text-xs ${
            isDark ? 'text-white/60' : 'text-[#64748b]'
          }`}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
