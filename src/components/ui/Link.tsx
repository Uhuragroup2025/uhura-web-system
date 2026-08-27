import React, { AnchorHTMLAttributes, ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { LinkVariant } from '../../types';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  isExternal?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  showExternalIcon?: boolean;
  contextTheme?: 'light' | 'dark';
  underline?: 'always' | 'hover' | 'none';
  disabled?: boolean;
  children: ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  variant = 'brand',
  isExternal = false,
  icon,
  iconPosition = 'left',
  showExternalIcon = true,
  contextTheme = 'light',
  underline = 'hover',
  disabled = false,
  children,
  className = '',
  href,
  onClick,
  ...props
}) => {
  const isDark = contextTheme === 'dark';

  // Focus ring adhering strictly to WCAG 2.4.7
  const focusRingClasses = isDark
    ? 'focus-visible:ring-2 focus-visible:ring-[#d4ff4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090513]'
    : 'focus-visible:ring-2 focus-visible:ring-[#501f92] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const baseClasses = `inline-flex items-center gap-1 font-semibold rounded-md transition-colors duration-150 focus:outline-none ${focusRingClasses}`;

  const getUnderlineClasses = () => {
    switch (underline) {
      case 'always':
        return 'underline underline-offset-4';
      case 'hover':
        return 'hover:underline underline-offset-4';
      case 'none':
        return 'no-underline';
    }
  };

  const getVariantClasses = () => {
    if (disabled) {
      return isDark ? 'text-white/40 cursor-not-allowed pointer-events-none' : 'text-[#94a3b8] cursor-not-allowed pointer-events-none';
    }

    switch (variant) {
      case 'brand':
        return isDark
          ? 'text-[#c9b7ff] hover:text-[#d4ff4a] active:text-white'
          : 'text-[#501f92] hover:text-[#381566] active:text-[#1e0a38]';

      case 'accent':
        return isDark
          ? 'text-[#d4ff4a] hover:text-[#edff9b] active:text-white'
          : 'text-[#501f92] hover:text-[#8a4dff] active:text-[#381566]';

      case 'subtle':
      case 'neutral':
        return isDark
          ? 'text-white/70 hover:text-white active:text-[#d4ff4a]'
          : 'text-[#64748b] hover:text-[#0f172a] active:text-[#501f92]';

      case 'nav':
        return isDark
          ? 'text-[#c9b7ff] hover:text-white font-medium'
          : 'text-[#475569] hover:text-[#0f172a] font-medium';

      case 'inline':
        return isDark
          ? 'text-[#c9b7ff] hover:text-[#d4ff4a] font-semibold underline underline-offset-2'
          : 'text-[#501f92] hover:text-[#381566] font-semibold underline underline-offset-2';
    }
  };

  const externalProps = isExternal
    ? {
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    : {};

  return (
    <a
      href={disabled ? undefined : href}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      aria-disabled={disabled}
      className={`${baseClasses} ${getUnderlineClasses()} ${getVariantClasses()} ${className} cursor-pointer`}
      {...externalProps}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      {isExternal && showExternalIcon && (
        <ExternalLink className="w-3.5 h-3.5 inline-block shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
      )}
    </a>
  );
};
