module.exports = {
    // Diretório onde estão os arquivos estáticos
    globDirectory: 'public/',

    // Padrões de arquivos para cachear
    globPatterns: [
        '**/*.{html,js,css,svg,webp,jpg,png,json,woff2,woff,ttf}'
    ],

    // Arquivos a ignorar
    globIgnores: [
        '**/node_modules/**/*',
        '**/test/**/*',
        '**/*.map'
    ],

    // Onde gerar o Service Worker
    swDest: 'public/sw.js',

    // Ignorar revisão de arquivos dinâmicos
    dontCacheBustURLsMatching: /\.(js|css|png|jpg|webp|svg)$/,

    // Tamanho máximo de arquivo individual (2.5MB)
    maximumFileSizeToCacheInBytes: 2.5 * 1024 * 1024,

    // Runtime caching: recursos externos
    runtimeCaching: [
        // Google Fonts - CSS
        {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
                },
            },
        },
        // Google Fonts - Arquivos de fonte
        {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                    maxEntries: 30,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
                },
            },
        },
        // Firebase - Storage
        {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'firebase-storage',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
                },
            },
        },
        // Firebase - Firestore API
        {
            urlPattern: /^https:\/\/firestore\.googleapis\.com/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'firebase-firestore',
                networkTimeoutSeconds: 10,
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60, // 5 minutos
                },
            },
        },
        // CDN - EmailJS e outros scripts externos
        {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'cdn-scripts',
                expiration: {
                    maxEntries: 30,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
                },
            },
        },
        // Imagens externas (se houver)
        {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'images',
                expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
                },
            },
        },
        // API requests (JSON data)
        {
            urlPattern: /\/api\/.*\.json$/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-data',
                networkTimeoutSeconds: 5,
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60, // 5 minutos
                },
            },
        },
    ],

    // Configurações adicionais
    skipWaiting: true, // Ativar novo SW imediatamente
    clientsClaim: true, // Assumir controle de todas as páginas imediatamente

    // Modo de navegação
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [
        /^\/_/,
        /\/[^/?]+\.[^/]+$/,
    ],

    // Mensagens de log
    cleanupOutdatedCaches: true,

    // Incluir sourcemap
    sourcemap: false,
};
