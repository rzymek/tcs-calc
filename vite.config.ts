import {defineConfig} from 'vitest/config'
import preact from '@preact/preset-vite'
import {VitePWA} from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/tcs-calc',
    build: {
        assetsInlineLimit: 8 * 1024,
    },
    test: {
        environment: "node",
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
