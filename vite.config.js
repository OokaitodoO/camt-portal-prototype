import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/sass/app.scss',
                'resources/js/app.js',
                'resources/js/department.js',
                'resources/js/task.js',
                'resources/js/member.js',
                'resources/js/individual.js',
                // Add any other JS/CSS files you need to compile
            ],
            refresh: true,
        }),
    ],
    build: {
        // Ensure proper build output
        outDir: 'public/build',
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
    server: {
        hmr: {
            host: 'localhost',
        },
        host: '0.0.0.0',
        watch: {
            usePolling: true,
        },
    },
    resolve: {
        alias: {
            '@': '/resources/js'
        }
    }
});
