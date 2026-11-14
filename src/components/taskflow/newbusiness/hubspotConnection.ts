import { useSyncExternalStore } from 'react';

/**
 * ¿ECO tiene HubSpot conectado? (prototipo)
 *
 * En producción sale de la integración: hay credencial válida de la app privada de HubSpot.
 * En el prototipo se cambia desde el Simulador QA para probar los dos flujos:
 *  - Conectado: primero «Crear negocios en HubSpot»; «Marcar como ganada» solo después de crearlos.
 *  - No conectado (hoy, falta la credencial): solo «Marcar como ganada» (modo manual, §12.4).
 */
const STORAGE_KEY = 'eco:hubspot-connected';
const EVENT = 'eco:hubspot-connection';

const read = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export function setHubSpotConnected(connected: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(connected));
  } catch {
    /* sin almacenamiento: el cambio dura hasta recargar */
  }
  current = connected;
  window.dispatchEvent(new Event(EVENT));
}

let current = typeof window !== 'undefined' ? read() : false;

const subscribe = (onChange: () => void) => {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
};

export function useHubSpotConnected(): boolean {
  return useSyncExternalStore(subscribe, () => current, () => false);
}
