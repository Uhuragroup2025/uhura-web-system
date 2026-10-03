import React, { useState } from 'react';
import { UserItem } from './types';

export interface UserAvatarProps {
  user?: (Pick<UserItem, 'name' | 'initials' | 'avatarBg'> & { avatarUrl?: string | null }) | null;
  name?: string;
  initials?: string;
  avatarBg?: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  badge?: React.ReactNode;
  alt?: string;
}

const sizeConfig: Record<
  'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl',
  { container: string; text: string; radius: string }
> = {
  xs: { container: 'w-5 h-5', text: 'text-[9px]', radius: 'rounded-md' },
  sm: { container: 'w-7 h-7', text: 'text-[10px]', radius: 'rounded-xl' },
  md: { container: 'w-8 h-8', text: 'text-xs', radius: 'rounded-xl' },
  lg: { container: 'w-10 h-10', text: 'text-sm', radius: 'rounded-2xl' },
  xl: { container: 'w-12 h-12', text: 'text-base', radius: 'rounded-2xl' },
  '2xl': { container: 'w-16 h-16', text: 'text-xl', radius: 'rounded-3xl' }
};

/**
 * Componente unificado y transversal de Avatar para colaboradores de Uhura Group (Orbit).
 * 
 * Reglas de resolución canónicas:
 * 1. Si `avatarUrl` (o `user.avatarUrl`) existe y carga sin errores → muestra la fotografía con object-cover.
 * 2. Si `avatarUrl` no existe o falla la carga (error 404, red, etc.) → fallback automático de iniciales + `avatarBg`.
 * 3. Admite insignia/badge contextual (emojis de hitos, estados de conexión, etc.).
 * 4. Tratamiento visual: object-cover, relación 1:1, centrado, sin deformar el ratio original.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  name,
  initials,
  avatarBg,
  avatarUrl,
  size = 'md',
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  badge,
  alt
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  const isCustomSize = size === 'custom';
  const currentConfig = !isCustomSize ? sizeConfig[size] : null;

  const containerSizeClasses = currentConfig ? currentConfig.container : '';
  const radiusClass = currentConfig ? currentConfig.radius : 'rounded-xl';
  const textClass = currentConfig ? currentConfig.text : 'text-xs';

  const effectiveName = user?.name || name || '';
  const effectiveInitials =
    user?.initials ||
    initials ||
    (effectiveName
      ? effectiveName
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U');
  const bgClass = user?.avatarBg || avatarBg || 'bg-[#501f92]';
  const effectiveUrl = user?.avatarUrl ?? avatarUrl;

  const shouldRenderImage = Boolean(effectiveUrl && effectiveUrl.trim()) && !hasImageError;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden ${radiusClass} ${containerSizeClasses} ${className}`}
    >
      {shouldRenderImage ? (
        <img
          src={effectiveUrl!}
          alt={alt || effectiveName || 'Avatar de colaborador'}
          onError={() => setHasImageError(true)}
          className={`w-full h-full object-cover ${radiusClass} shadow-2xs ${imageClassName}`}
          loading="lazy"
        />
      ) : (
        <div
          className={`w-full h-full ${bgClass} text-white font-bold flex items-center justify-center ${radiusClass} ${textClass} shadow-2xs ${fallbackClassName}`}
          aria-label={effectiveName || effectiveInitials}
        >
          {effectiveInitials}
        </div>
      )}

      {badge && (
        <span className="absolute -bottom-1 -right-1 flex items-center justify-center pointer-events-none">
          {badge}
        </span>
      )}
    </div>
  );
};
