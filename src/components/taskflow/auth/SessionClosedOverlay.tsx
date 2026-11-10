import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';

/**
 * Cerrar sesión (ronda 2): disponible en el menú de perfil (computador, tablet y celular) y en
 * «Más» del menú inferior del celular. En el prototipo muestra la pantalla de sesión cerrada;
 * en producción cierra la sesión de Google y vuelve a la pantalla de ingreso.
 */
export const LOGOUT_EVENT = 'eco:logout';
export const requestLogout = () => window.dispatchEvent(new CustomEvent(LOGOUT_EVENT));

export const SessionClosedOverlay: React.FC = () => {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    const on = () => setClosed(true);
    window.addEventListener(LOGOUT_EVENT, on);
    return () => window.removeEventListener(LOGOUT_EVENT, on);
  }, []);
  if (!closed) return null;
  // Portal al body: el encabezado crea su propio contexto de apilamiento.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Sesión cerrada" className="fixed inset-0 z-[9999] bg-[#0f0820] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 flex items-center justify-center">
          <LogOut className="w-6 h-6 text-[#d4ff4a]" />
        </div>
        <h2 className="text-lg font-extrabold text-white">Cerraste sesión</h2>
        <p className="text-xs text-[#c9b7ff]">En ECO real vuelves a la pantalla de ingreso con tu cuenta de Google de Uhura.</p>
        <button
          type="button"
          onClick={() => setClosed(false)}
          className="px-5 py-2.5 rounded-xl bg-[#d4ff4a] text-[#140b24] text-xs font-bold cursor-pointer"
        >
          Volver a entrar (prototipo)
        </button>
      </div>
    </div>,
    document.body
  );
};
