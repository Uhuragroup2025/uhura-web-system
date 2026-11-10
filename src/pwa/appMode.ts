/**
 * «Modo app»: ECO instalado como PWA (o abierto con ?app=eco).
 * En este modo se abre directo en ECO y se ocultan el menú del design system y la barra de
 * navegador simulada del prototipo, para que se vea como una app y no como una demo.
 */
export function isEcoAppMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(window.location.search).get('app') === 'eco') return true;
    if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone) return true;
  } catch {
    /* sin acceso a window */
  }
  return false;
}
