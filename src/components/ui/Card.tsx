import React, { ReactNode } from 'react';
import { CardVariant } from '../../types';

export interface CardProps {
  variant?: CardVariant;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverable = false,
  padding = 'md',
  glow = false,
  children,
  className = '',
  onClick,
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-250 ease-out overflow-hidden';

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const variantClasses: Record<CardVariant, string> = {
    default: 'bg-white border border-[#e0e0e0] text-[#1a1a1a] shadow-[0_2px_4px_rgba(0,0,0,0.04)]',
    elevated: 'bg-white border border-[#e0e0e0]/60 text-[#1a1a1a] shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]',
    purple: 'bg-[#501f92] border border-[#8945f0]/40 text-white shadow-[0_12px_24px_-4px_rgba(48,16,139,0.3)]',
    gradient: 'bg-gradient-to-br from-[#8945f0] to-[#501f92] text-white border border-[#c1a1ff]/30 shadow-[0_12px_28px_rgba(137,69,240,0.25)]',
    glass: 'bg-white/70 backdrop-blur-md border border-white/50 text-[#1a1a1a] shadow-[0_8px_24px_rgba(0,0,0,0.06)]',
    'glass-dark': 'bg-[#30108b]/40 backdrop-blur-xl border border-[#8945f0]/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.25)]',
  };

  const hoverClasses = hoverable
    ? 'hover:scale-[1.02] hover:-translate-y-[4px] cursor-pointer hover:shadow-[0_16px_32px_rgba(137,69,240,0.15)]'
    : '';

  const glowClasses = glow
    ? 'shadow-[0_0_30px_rgba(137,69,240,0.35)] ring-1 ring-[#c1a1ff]/40'
    : '';

  return (
    <div
      className={`${baseClasses} ${paddingClasses[padding]} ${variantClasses[variant]} ${hoverClasses} ${glowClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
