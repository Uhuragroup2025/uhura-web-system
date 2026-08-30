import React, { ReactNode } from 'react';
import { BadgeVariant, BadgeSize } from '../../types';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  isDot?: boolean;
  contextTheme?: 'dark' | 'light';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  icon,
  children,
  className = '',
  isDot = false,
  contextTheme = 'light',
}) => {
  const isDark = contextTheme === 'dark';

  const baseClasses =
    'inline-flex items-center justify-center font-medium select-none whitespace-nowrap transition-colors duration-150 rounded-md';

  const sizeClasses: Record<BadgeSize, string> = {
    xs: 'h-5 px-1.5 text-[10px] gap-1 font-semibold',
    sm: 'h-6 px-2 text-xs gap-1.5 font-semibold',
    md: 'h-7 px-2.5 text-xs gap-1.5 font-bold',
  };

  const getVariantClasses = (): string => {
    switch (variant) {
      // 1. NEUTRAL: Default quiet metadata tag
      case 'neutral':
      case 'subtle':
        return isDark
          ? 'bg-white/10 text-white/90 border border-white/15'
          : 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]';

      // 2. BRAND: Solid or soft purple brand
      case 'brand':
        return isDark
          ? 'bg-[#8a4dff] text-white border border-[#8a4dff]/40 shadow-2xs'
          : 'bg-[#501f92] text-white border border-[#501f92] shadow-2xs';

      // 3. PURPLE: Soft brand tint
      case 'purple':
        return isDark
          ? 'bg-[#501f92]/30 text-[#c9b7ff] border border-[#8a4dff]/30'
          : 'bg-[#f5f3ff] text-[#501f92] border border-[#ddd6fe]';

      // 4. SUCCESS: Semantic green
      case 'success':
        return isDark
          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
          : 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]';

      // 5. WARNING: Semantic amber
      case 'warning':
        return isDark
          ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
          : 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]';

      // 6. ERROR: Semantic red
      case 'error':
        return isDark
          ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
          : 'bg-[#ffe4e6] text-[#9f1239] border border-[#fecdd3]';

      // 7. INFO / CYAN: Controlled blue/sky
      case 'info':
      case 'cyan':
        return isDark
          ? 'bg-sky-950/40 text-sky-300 border border-sky-800/40'
          : 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]';

      // 8. OUTLINE: Minimal hairline border
      case 'outline':
        return isDark
          ? 'border border-white/30 text-white bg-transparent'
          : 'border border-[#cbd5e1] text-[#334155] bg-transparent';

      default:
        return isDark
          ? 'bg-white/10 text-white/90 border border-white/15'
          : 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]';
    }
  };

  const getDotColor = (): string => {
    if (variant === 'brand') return 'bg-white';
    if (variant === 'purple') return isDark ? 'bg-[#c9b7ff]' : 'bg-[#9333ea]';
    if (variant === 'success') return isDark ? 'bg-emerald-400' : 'bg-[#10b981]';
    if (variant === 'warning') return isDark ? 'bg-amber-400' : 'bg-[#f59e0b]';
    if (variant === 'error') return isDark ? 'bg-rose-400' : 'bg-[#e11d48]';
    if (variant === 'info' || variant === 'cyan') return isDark ? 'bg-sky-400' : 'bg-[#0284c7]';
    return isDark ? 'bg-white/60' : 'bg-[#94a3b8]';
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${getVariantClasses()} ${className}`}>
      {isDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor()}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="inline-flex shrink-0 text-current" aria-hidden="true">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
