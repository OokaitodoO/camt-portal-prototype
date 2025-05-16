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
                // Add any other JS/CSS files you need to compile
            ],
            refresh: true,
        }),
    ],
    server: {
        hmr: {
            host: 'localhost',
        },
        host: '0.0.0.0',
        watch: {
            usePolling: true,
        },
    },
});
