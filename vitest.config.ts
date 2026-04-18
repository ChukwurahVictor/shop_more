import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./resources/js/__tests__/setup.ts'],
        include: ['resources/js/__tests__/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            include: ['resources/js/**/*.{ts,tsx}'],
            exclude: ['resources/js/__tests__/**', 'resources/js/vite-env.d.ts'],
        },
    },
});
