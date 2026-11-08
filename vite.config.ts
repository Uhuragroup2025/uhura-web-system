import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    /**
     * ECO como PWA instalable (07 Nov 2026).
     * - Se instala desde el navegador y abre directo en ECO (start_url con ?app=eco).
     * - Actualización con aviso: «Hay una versión nueva de ECO · Actualizar» (registerType 'prompt').
     * - Sin modo offline de datos ni notificaciones push (fase 2, requieren backend).
     */
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'pwa/apple-touch-icon.png'],
      manifest: {
        id: '/?app=eco',
        name: 'ECO · Uhura Group',
        short_name: 'ECO',
        description: 'ECO, el espacio de creación y operaciones de Uhura Group.',
        lang: 'es-CO',
        start_url: '/?app=eco',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0d0718',
        theme_color: '#140b24',
        icons: [
          { src: '/pwa/eco-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa/eco-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa/eco-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // El bundle del prototipo pesa más que el límite por defecto (2 MB).
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        // Solo la app: código, estilos, íconos y las imágenes de ECO. Las fotos del equipo y los
        // logos grandes de marca no se precargan.
        globPatterns: ['**/*.{js,css,html}', 'favicon.svg', 'pwa/*.png', 'assets/*.{webp,png,svg}'],
        globIgnores: ['brand/**', 'assets/team/**'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'eco-google-fonts', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
