/**
 * Evita el doble guardado (26 Nov 2026). En producción, un doble clic en «Crear tarea» creó la tarea dos veces.
 *
 * Uso: después de validar, `if (!claim()) return;`. El primer clic «toma» el envío; los siguientes se ignoran
 * mientras `busy` es true. El botón usa `busy` para bloquearse y decir «Guardando…».
 * Se libera solo a los 1,5 s, por si la ventana sigue abierta (p. ej. un error del servidor en producción).
 *
 * En producción esto no basta: el servidor también debe rechazar el duplicado (ver BACKEND §34.17).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export function useSubmitOnce(releaseMs = 1500) {
  const busyRef = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const claim = useCallback(() => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    timer.current = window.setTimeout(() => {
      busyRef.current = false;
      setBusy(false);
    }, releaseMs);
    return true;
  }, [releaseMs]);

  return { busy, claim };
}
