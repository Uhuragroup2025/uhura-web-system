import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { UserItem, OrbitModule } from '../types';

interface AccessDeniedCardProps {
  currentUser: UserItem;
  targetModule: OrbitModule;
  onReturnHome: () => void;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  currentUser,
  targetModule,
  onReturnHome
}) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl bg-white border border-[#e2e8f0] p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-3">
          <Lock className="w-3 h-3 text-slate-500" />
          Control de Acceso RBAC
        </span>

        <h2 className="text-xl font-bold text-[#0f172a] mb-2">
          Acceso Restringido
        </h2>

        <p className="text-sm text-[#64748b] mb-4 leading-relaxed">
          El perfil de <strong className="text-[#0f172a]">{currentUser.name}</strong> con nivel de acceso{' '}
          <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
            {currentUser.accessLevel || 'pending'}
          </span>{' '}
          no cuenta con permisos de lectura para el módulo de{' '}
          <strong className="text-[#0f172a] capitalize">{targetModule}</strong>.
        </p>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 mb-6 space-y-1">
          <p className="font-medium text-slate-800">Directiva de seguridad Orbit:</p>
          <p className="text-[11px] text-slate-500">
            La visibilidad en el frontend acompaña las políticas de seguridad del backend. Toda petición HTTP a este recurso es rechazada con código 403 Forbidden.
          </p>
        </div>

        <button
          onClick={onReturnHome}
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#501f92] text-white text-sm font-semibold hover:bg-[#3d1573] transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mi Día
        </button>
      </div>
    </div>
  );
};
