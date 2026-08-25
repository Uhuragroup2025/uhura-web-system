import React, { ReactNode } from 'react';
import { GlassVariant, GlassBlur, GlassGlow } from '../../types';

export interface GlassCardProps {
  variant?: GlassVariant;
  blur?: GlassBlur;
  glow?: GlassGlow;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'light',
  blur = 'md',
  glow = 'none',
  hover = false,
  padding = 'md',
  children,
  className = '',
  onClick,
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-250 ease-out relative overflow-hidden';

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const blurClasses: Record<GlassBlur, string> = {
    sm: 'backdrop-blur-[8px]',
    md: 'backdrop-blur-[16px]',
    lg: 'backdrop-blur-[24px]',
    xl: 'backdrop-blur-[32px]',
  };

  const variantClasses: Record<GlassVariant, string> = {
    light: 'bg-white/80 border border-white/50 text-[#17131f] shadow-xs',
    medium: 'bg-white/60 border border-white/40 text-[#17131f] shadow-sm',
    dark: 'bg-[#140b24]/85 border border-[#8a4dff]/25 text-white shadow-md',
    purple: 'bg-[#501f92]/50 border border-[#c9b7ff]/30 text-white shadow-md',
  };

  const glowClasses: Record<GlassGlow, string> = {
    none: 'shadow-[0_8px_32px_0_rgba(9,5,19,0.2)]',
    purple: 'shadow-[0_0_30px_rgba(138,77,255,0.35)] border-[#8a4dff]/40',
    cyan: 'shadow-[0_0_30px_rgba(75,229,255,0.35)] border-[#4be5ff]/40',
    neon: 'shadow-[0_0_30px_rgba(212,255,74,0.35)] border-[#d4ff4a]/40',
  };

  const hoverClasses = hover
    ? 'hover:scale-[1.02] hover:-translate-y-[4px] cursor-pointer hover:shadow-[0_16px_36px_rgba(0,0,0,0.2)]'
    : '';

  return (
    <div
      className={`${baseClasses} ${paddingClasses[padding]} ${blurClasses[blur]} ${variantClasses[variant]} ${glowClasses[glow]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
