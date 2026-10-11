import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read local config safely if file exists on disk (will not fail if file is missing in Git)
let localConfig: any = {};
const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
if (fs.existsSync(configPath)) {
  try {
    localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    localConfig = {};
  }
}

export default defineConfig(({ command }) => {
  // Determine base path:
  // - In local dev server ('serve'): '/'
  // - In GitHub Actions / Pages or production build: '/Suivi-Patrimoine/' or process.env.BASE_PATH or './'
  const isDev = command === 'serve';
  const isGitHub = Boolean(process.env.GITHUB_ACTIONS || process.env.GITHUB_REPOSITORY);
  const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/Suivi-Patrimoine/';
  const base = isDev ? '/' : (process.env.BASE_PATH || (isGitHub ? repoName : './'));

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
        manifest: {
          id: './',
          name: 'Patrimoine & Wealth Tracker',
          short_name: 'Patrimoine',
          description: 'Application de suivi et gestion de patrimoine net et brut, PEA, CTO, Bitcoin, Immobilier et PEE.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: './',
          scope: './',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false, // Prevents iframe service worker conflicts in AI Studio preview
        },
      }),
    ],
    define: {
      '__FIREBASE_DEFAULTS__': JSON.stringify({
        apiKey: localConfig.apiKey || '',
        authDomain: localConfig.authDomain || 'temporal-charge-thl8x.firebaseapp.com',
        projectId: localConfig.projectId || 'temporal-charge-thl8x',
        storageBucket: localConfig.storageBucket || 'temporal-charge-thl8x.firebasestorage.app',
        messagingSenderId: localConfig.messagingSenderId || '660117405427',
        appId: localConfig.appId || '1:660117405427:web:069094c7c60e7fdebe8186',
        databaseId: localConfig.firestoreDatabaseId || 'ai-studio-3bcb2e47-829c-4de3-9232-9495856b0309'
      })
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
