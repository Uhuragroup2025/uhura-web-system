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
  children,
  className = '',
  onClick,
}) => {
  const baseClasses = 'rounded-xl transition-all duration-150 ease-out';

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-7',
    xl: 'p-8',
  };

  const variantClasses: Record<CardVariant, string> = {
    default: 'bg-white border border-[#e2e8f0] text-[#0f172a] shadow-2xs',
    elevated: 'bg-white border border-[#e2e8f0] text-[#0f172a] shadow-xs',
    purple: 'bg-[#501f92] border border-[#501f92] text-white shadow-xs',
    gradient: 'bg-[#501f92] text-white border border-[#501f92] shadow-xs',
    glass: 'bg-white/80 backdrop-blur-md border border-[#e2e8f0] text-[#0f172a] shadow-2xs',
    'glass-dark': 'bg-[#140b24]/90 backdrop-blur-md border border-white/10 text-white shadow-xs',
  };

  const hoverClasses = hoverable
    ? 'hover:border-[#cbd5e1] hover:shadow-xs cursor-pointer active:scale-[0.995]'
    : '';

  return (
    <div
      className={`${baseClasses} ${paddingClasses[padding]} ${variantClasses[variant]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
