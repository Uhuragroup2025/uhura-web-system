import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LoginScreen } from './LoginScreen';

/**
 * Cerrar sesión (ronda 2): disponible en el menú de perfil (computador, tablet y celular) y en
 * «Más» del menú inferior del celular. Cierra la sesión y muestra la pantalla de ingreso.
 * En el prototipo también se abre con `?login=1`.
 */
export const LOGOUT_EVENT = 'eco:logout';
export const requestLogout = () => window.dispatchEvent(new CustomEvent(LOGOUT_EVENT));

export const SessionClosedOverlay: React.FC = () => {
  const [closed, setClosed] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('login') === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const on = () => setClosed(true);
    window.addEventListener(LOGOUT_EVENT, on);
    return () => window.removeEventListener(LOGOUT_EVENT, on);
  }, []);
  // Sin barra de desplazamiento de la app detrás: la pantalla de ingreso ocupa toda la ventana
  useEffect(() => {
    if (!closed) return;
    const html = document.documentElement;
    const prev = [html.style.overflow, document.body.style.overflow];
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev[0];
      document.body.style.overflow = prev[1];
    };
  }, [closed]);
  if (!closed) return null;
  // Portal al body: el encabezado crea su propio contexto de apilamiento.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Ingresar a ECO" className="fixed inset-0 z-[9999] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <LoginScreen onSignedIn={() => setClosed(false)} />
    </div>,
    document.body
  );
};
