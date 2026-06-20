import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: [
        'favicon.svg',
        'maskable-icon.svg',
        'pwa-icon-192.svg',
        'pwa-icon-512.svg',
      ],
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'Trøndelag Ruteplanlegger',
        short_name: 'Ruteplanlegger',
        description: 'Lettvekts feltstyringssystem og ruteplanlegger for serviceteknikere.',
        theme_color: '#1f3a5f',
        background_color: '#f7f8fa',
        display: 'standalone',
        lang: 'nb-NO',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/pwa-icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/pwa-icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/maskable-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{css,html,ico,js,png,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 30,
                maxEntries: 500,
              },
            },
          },
          {
            urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nominatim-geocoding',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 7,
                maxEntries: 100,
              },
              networkTimeoutSeconds: 8,
            },
          },
          {
            urlPattern: /^https:\/\/router\.project-osrm\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'osrm-routing',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24,
                maxEntries: 50,
              },
              networkTimeoutSeconds: 8,
            },
          },
        ],
      },
    }),
  ],
})
