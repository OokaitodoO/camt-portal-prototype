import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    // server: {
    //     host: '0.0.0.0',
    //     port: 5173,
    //     cors: {
    //         origin: '*', // or use your specific zrok URL for more security
    //         methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    //         allowedHeaders: ['Content-Type', 'Authorization'],
    //     },
    //     hmr: {
    //         protocol: 'ws',
    //         host: 's9xpm10f2yz7.share.zrok.io',            
    //         clientPort: 443,
    //     }, 
    //     https: false,               
    // },
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/department.js',
                'resources/js/member.js',
                'resources/js/task.js',
                'resources/js/individual.js',
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
    resolve: {
        alias: {
            '@': '/resources/js'
        }
    }
});
