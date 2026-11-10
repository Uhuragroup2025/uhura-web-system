import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

/**
 * Aviso de nueva versión de ECO (PWA). Cuando Indunova publica, el service worker descarga la
 * versión nueva y aquí se le ofrece a la persona actualizar; nunca recarga sin preguntar,
 * para no perder un cronómetro o un formulario a medias.
 */
export const PwaUpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Revisa si hay versión nueva cada hora mientras la app está abierta.
      if (registration) setInterval(() => registration.update().catch(() => undefined), 60 * 60 * 1000);
    }
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed z-[90] left-1/2 -translate-x-1/2 bottom-[calc(16px+env(safe-area-inset-bottom))] w-[calc(100%-32px)] max-w-sm bg-[#140b24] text-white rounded-2xl border border-[#8a4dff]/50 shadow-2xl px-4 py-3 flex items-center gap-3"
    >
      <RefreshCw className="w-4 h-4 text-[#d4ff4a] shrink-0" aria-hidden="true" />
      <p className="text-xs flex-1">Hay una versión nueva de ECO.</p>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="px-3 py-1.5 rounded-xl bg-[#d4ff4a] text-[#140b24] text-xs font-bold cursor-pointer"
      >
        Actualizar
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        className="p-1 rounded-lg text-white/60 hover:text-white cursor-pointer"
        aria-label="Más tarde"
        title="Más tarde"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
