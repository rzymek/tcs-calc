import {defineConfig} from 'vitest/config'
import preact from '@preact/preset-vite'
import {VitePWA} from 'vite-plugin-pwa'
import {playwright} from '@vitest/browser-playwright'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/tcs-calc',
    build: {
        assetsInlineLimit: 8 * 1024,
    },
    test: {
        projects: [{
            extends: true,
            test: {
                name: 'unit',
                environment: 'node',
                include: ['src/**/*.{spec,test}.{ts,tsx}'],
                exclude: ['src/**/*.browser.test.tsx'],
            },
        }, {
            extends: true,
            test: {
                name: 'browser',
                include: ['src/**/*.browser.test.tsx'],
                browser: {
                    enabled: true,
                    headless: true,
                    provider: playwright(),
                    instances: [{browser: 'chromium', viewport: {width: 412, height: 915}}],
                },
            },
        }],
    },
    plugins: [
        preact(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: "TCS Calculator",
                short_name: 'tcs-calc',
                description: "TCS Calculator",
                theme_color: "#FFFFE0",
                icons: [{
                    src: "pwa-64x64.png",
                    sizes: "64x64",
                    type: "image/png"
                }, {
                    src: "pwa-192x192.png",
                    sizes: "192x192",
                    type: "image/png"
                }, {
                    src: "pwa-512x512.png",
                    sizes: "512x512",
                    type: "image/png"
                }, {
                    src: "maskable-icon-512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "maskable"
                }]
            }
        })
    ],
})
