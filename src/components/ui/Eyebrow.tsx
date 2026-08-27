import React, { ReactNode, ElementType } from 'react';
import { EyebrowVariant, EyebrowSize } from '../../types';

export interface EyebrowProps {
  children: ReactNode;
  icon?: ReactNode;
  variant?: EyebrowVariant;
  size?: EyebrowSize;
  as?: ElementType;
  contextTheme?: 'light' | 'dark';
  className?: string;
}

export const Eyebrow: React.FC<EyebrowProps> = ({
  children,
  icon,
  variant = 'default',
  size = 'sm',
  as: Component = 'span',
  contextTheme = 'light',
  className = '',
}) => {
  const isDark = contextTheme === 'dark';

  const sizeClasses: Record<EyebrowSize, string> = {
    xs: 'text-[10px] tracking-wider',
    sm: 'text-[11px] tracking-wider',
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'brand':
        return isDark ? 'text-[#c9b7ff]' : 'text-[#501f92]';
      case 'accent':
        return isDark ? 'text-[#d4ff4a]' : 'text-[#501f92]';
      case 'muted':
        return isDark ? 'text-white/50' : 'text-[#94a3b8]';
      case 'default':
      default:
        return isDark ? 'text-white/70' : 'text-[#64748b]';
    }
  };

  return (
    <Component
      className={`inline-flex items-center gap-1.5 font-extrabold uppercase select-none ${sizeClasses[size]} ${getVariantClasses()} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </Component>
  );
};
