import React, { TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  isSuggested?: boolean;
  isReadOnly?: boolean;
  contextTheme?: 'dark' | 'light';
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  error,
  required = false,
  isSuggested = false,
  isReadOnly = false,
  contextTheme = 'light',
  id,
  className = '',
  disabled,
  readOnly,
  rows = 3,
  ...props
}) => {
  const isDark = contextTheme === 'dark';
  const effectiveReadOnly = isReadOnly || readOnly;
  const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
  const helperId = helperText && inputId ? `${inputId}-helper` : undefined;
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const baseTextareaClasses =
    'w-full p-3 rounded-xl text-xs transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#501f92] focus-visible:ring-offset-1 resize-y';

  const getColorClasses = (): string => {
    if (disabled) {
      return 'cursor-not-allowed bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1]';
    }

    if (error) {
      return 'bg-white border border-rose-500 text-[#0f172a] focus-visible:ring-rose-500 shadow-2xs';
    }

    if (effectiveReadOnly) {
      return 'bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] cursor-default';
    }

    if (isSuggested) {
      return 'bg-[#faf5ff] border border-[#d8b4fe] text-[#475569] placeholder:text-[#7C8AA0] placeholder:font-normal shadow-2xs';
    }

    if (isDark) {
      return 'bg-[#140b24] border border-white/15 text-white placeholder-white/50 focus:border-[#8a4dff] shadow-2xs';
    }

    return 'bg-white border border-[#cbd5e1] text-[#0f172a] placeholder:text-[#7C8AA0] placeholder:font-normal hover:border-[#94a3b8] focus:border-[#501f92] shadow-2xs';
  };

  const labelColor = isDark ? 'text-white' : 'text-[#0f172a]';

  return (
    <div className="w-full flex flex-col gap-1">
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
          {isSuggested && (
            <span className="ml-1 text-[10px] font-semibold text-[#501f92] bg-[#f2ecfb] px-1.5 py-0.2 rounded">
              Sugerido
            </span>
          )}
        </label>
      )}

      <textarea
        id={inputId}
        rows={rows}
        disabled={disabled}
        readOnly={effectiveReadOnly}
        aria-disabled={disabled}
        aria-invalid={!!error}
        aria-required={required}
        aria-describedby={describedBy}
        className={`${baseTextareaClasses} ${getColorClasses()} ${className}`}
        {...props}
      />

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
