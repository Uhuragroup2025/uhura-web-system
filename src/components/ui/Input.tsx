import React, { InputHTMLAttributes, ReactNode } from 'react';
import { InputVariant } from '../../types';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  variant?: InputVariant;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
  isLoading?: boolean;
  contextTheme?: 'dark' | 'light';
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
  id,
  className = '',
  disabled,
  ...props
}) => {
  const isDark = contextTheme === 'dark' || variant === 'glass';

  // Stable ID generation for WCAG label associations
  const inputId = id || `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const baseInputClasses =
    'w-full min-h-[44px] h-11 px-3.5 rounded-xl text-sm transition-all duration-200 ease-out focus:outline-none focus-visible:ring-3';

  const getVariantClasses = (): string => {
    if (variant === 'glass') {
      return error
        ? 'bg-white/20 backdrop-blur-md border border-rose-400 text-white placeholder-white/70 focus-visible:ring-rose-400/40'
        : 'bg-white/15 backdrop-blur-md border border-white/30 text-white placeholder-white/70 hover:border-white/50 focus-visible:border-[#c9b7ff] focus-visible:ring-[#8a4dff]/40 shadow-inner';
    }

    // Default variant
    if (isDark) {
      return error
        ? 'bg-[#140b24] border border-rose-500 text-white placeholder-white/60 focus-visible:ring-rose-500/40'
        : 'bg-[#140b24] border border-[#8a4dff]/35 text-white placeholder-white/50 hover:border-[#8a4dff]/60 focus-visible:border-[#c9b7ff] focus-visible:ring-[#8a4dff]/40 shadow-inner';
    }

    return error
      ? 'bg-white border border-rose-600 text-[#17131f] focus-visible:ring-rose-500/30 focus-visible:border-rose-600 shadow-xs'
      : 'bg-white border border-[#bdbdbd] text-[#17131f] placeholder-[#757575] hover:border-[#8a4dff] focus-visible:border-[#501f92] focus-visible:ring-[#8a4dff]/30 shadow-xs';
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed bg-[#eeeeee] dark:bg-white/5'
    : '';

  const labelColor = isDark ? 'text-white' : 'text-[#17131f]';

  return (
    <div className="w-full flex flex-col gap-1.5">
      {/* Accessible Label (WCAG 3.3.2) */}
      <label
        htmlFor={inputId}
        className={`text-xs font-bold tracking-tight flex items-center gap-1 ${labelColor}`}
      >
        {label}
        {required && (
          <span className="text-rose-500 font-bold" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">(obligatorio)</span>}
      </label>

      {/* Input Field Wrapper */}
      <div className="relative flex items-center">
        {leftIcon && (
          <span
            className={`absolute left-3.5 pointer-events-none ${
              isDark ? 'text-white/80' : 'text-[#616161]'
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
          className={`${baseInputClasses} ${getVariantClasses()} ${disabledClasses} ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon || isLoading ? 'pr-10' : ''} ${className}`}
          {...props}
        />

        {/* Loading Spinner or Right Icon */}
        {isLoading ? (
          <span className={`absolute right-3.5 ${isDark ? 'text-[#d4ff4a]' : 'text-[#501f92]'}`} role="status">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="sr-only">Validando...</span>
          </span>
        ) : rightIcon ? (
          <span
            className={`absolute right-3.5 ${
              isDark ? 'text-white/80' : 'text-[#616161]'
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
          className={`text-xs font-semibold flex items-center gap-1.5 ${
            isDark ? 'text-rose-300' : 'text-rose-700'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p
          id={helperId}
          className={`text-xs ${
            isDark ? 'text-[#c9b7ff]' : 'text-[#616161]'
          }`}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
