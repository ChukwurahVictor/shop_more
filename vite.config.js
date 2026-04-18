import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/main.tsx",
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: "0.0.0.0",
        port: 5173,
        origin: "http://localhost:5175",
        cors: true,
        allowedHosts: true,
        hmr: {
            host: "localhost",
            port: 5175,
        },
    },
});
