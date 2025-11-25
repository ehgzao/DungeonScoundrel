/**
 * Mobile Optimization Module
 * Detecta dispositivos mobile e ajusta performance/animaÃ§Ãµes
 *
 * @module MobileOptimization
 * @version 1.0.0
 */

class MobileOptimization {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isLowEndDevice = this.detectLowEndDevice();
        this.originalSettings = {};
    }

    /**
     * Detecta se Ã© um dispositivo mobile
     * @returns {boolean}
     */
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Verifica mÃºltiplos padrÃµes
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;

        return mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen);
    }

    /**
     * Detecta dispositivos de baixo desempenho
     * @returns {boolean}
     */
    detectLowEndDevice() {
        // Verifica specs do dispositivo
        const cpuCores = navigator.hardwareConcurrency || 2;
        const memory = navigator.deviceMemory || 2; // GB
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        // Low-end se:
        // - Menos de 4 cores
        // - Menos de 4GB RAM
        // - ConexÃ£o lenta (2G/3G)
        const isLowCpu = cpuCores < 4;
        const isLowMemory = memory < 4;
        const isSlowConnection = connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g');

        return isLowCpu || isLowMemory || isSlowConnection;
    }

    /**
     * Aplica otimizaÃ§Ãµes mobile
     * @param {Object} gameConfig - ConfiguraÃ§Ãµes do jogo
     */
    applyOptimizations(gameConfig) {
        if (!this.isMobile) {
            return;
        }


        // Salvar configuraÃ§Ãµes originais
        this.originalSettings = {
            maxParticles: gameConfig.maxParticles || 50,
            screenShakeIntensity: gameConfig.screenShakeIntensity || 5,
            animationDuration: gameConfig.animationDuration || 400,
            enableBlur: gameConfig.enableBlur !== false,
            enableShadows: gameConfig.enableShadows !== false
        };

        // Aplicar otimizaÃ§Ãµes
        this.optimizeParticles(gameConfig);
        this.optimizeAnimations(gameConfig);
        this.optimizeEffects(gameConfig);

        // Se for low-end, aplicar otimizaÃ§Ãµes agressivas
        if (this.isLowEndDevice) {
            this.applyAggressiveOptimizations(gameConfig);
        }

    }

    /**
     * Otimiza sistema de partÃ­culas
     * @param {Object} config
     */
    optimizeParticles(config) {
        const reduction = this.isLowEndDevice ? 0.2 : 0.4; // 80% ou 60% de reduÃ§Ã£o
        config.maxParticles = Math.floor(this.originalSettings.maxParticles * reduction);

    }

    /**
     * Otimiza animaÃ§Ãµes
     * @param {Object} config
     */
    optimizeAnimations(config) {
        // Reduzir duraÃ§Ã£o das animaÃ§Ãµes (mais rÃ¡pido = menos frames)
        config.animationDuration = this.isLowEndDevice ? 150 : 250;

        // Reduzir screen shake
        config.screenShakeIntensity = this.isLowEndDevice ? 1 : 2;

    }

    /**
     * Otimiza efeitos visuais
     * @param {Object} config
     */
    optimizeEffects(config) {
        // Desabilitar efeitos pesados em mobile
        config.enableBlur = false; // Blur Ã© muito pesado
        config.enableShadows = !this.isLowEndDevice; // Sombras apenas em devices melhores

    }

    /**
     * Aplicar otimizaÃ§Ãµes agressivas para low-end devices
     * @param {Object} config
     */
    applyAggressiveOptimizations(config) {

        // Reduzir ainda mais partÃ­culas
        config.maxParticles = Math.max(5, config.maxParticles);

        // Desabilitar todos os efeitos visuais nÃ£o-essenciais
        config.enableShadows = false;
        config.enableGlow = false;
        config.enableTransitions = false;

        // Simplificar CSS
        document.body.classList.add('low-end-device');

    }

    /**
     * Ajustar CSS para mobile
     */
    adjustCSS() {
        if (!this.isMobile) return;

        const style = document.createElement('style');
        style.id = 'mobile-optimizations';
        style.textContent = `
            /* Mobile Performance Optimizations */
            * {
                -webkit-tap-highlight-color: transparent;
            }

            /* Desabilitar animaÃ§Ãµes pesadas em mobile */
            @media (max-width: 768px) {
                * {
                    animation-duration: 0.2s !important;
                    transition-duration: 0.2s !important;
                }

                /* Simplificar gradientes */
                .card, .button, .modal {
                    background-image: none !important;
                }

                /* Desabilitar blur */
                .blur, .backdrop-blur {
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                }

                /* Otimizar scrolling */
                * {
                    -webkit-overflow-scrolling: touch;
                    scroll-behavior: auto;
                }
            }

            /* Low-end device: desabilitar tudo */
            .low-end-device * {
                animation: none !important;
                transition: none !important;
                transform: none !important;
                filter: none !important;
                box-shadow: none !important;
            }

            /* Touch-friendly: aumentar Ã¡rea de toque */
            @media (max-width: 768px) {
                button, .card, .clickable, a {
                    min-width: 44px;
                    min-height: 44px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Preload crÃ­tico: apenas imagens essenciais
     */
    optimizeImageLoading() {
        if (!this.isMobile) return;

        // Desabilitar preload de imagens nÃ£o-essenciais
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');


        // Implementar intersection observer para lazy load mais agressivo
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;

                        // Carregar imagem
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }

                        // Parar de observar
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px', // ComeÃ§ar a carregar 50px antes de entrar na tela
                threshold: 0.01
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    /**
     * Monitorar performance
     */
    monitorPerformance() {
        if (!this.isMobile) return;

        let fps = 0;
        let lastTime = performance.now();
        let frames = 0;

        const checkFPS = () => {
            frames++;
            const currentTime = performance.now();

            if (currentTime >= lastTime + 1000) {
                fps = Math.round(frames * 1000 / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;

                // Se FPS < 30, alertar
                if (fps < 30) {
                    console.warn(`⚠️ Low FPS detected: ${fps} fps`);

                    // Aplicar otimizações ainda mais agressivas
                    if (window.game && !this._emergencyModeApplied) {
                        window.game.maxParticles = 0;
                        window.game.enableAnimations = false;
                        this._emergencyModeApplied = true;
                    }
                }
            }

            requestAnimationFrame(checkFPS);
        };

        requestAnimationFrame(checkFPS);
    }

    /**
     * Inicializar todas as otimizações
     */
    init() {

        this.adjustCSS();
        this.optimizeImageLoading();

        // Monitorar performance apenas em modo debug
        if (localStorage.getItem('debugMode') === 'true') {
            this.monitorPerformance();
        }

    }

    /**
     * Restaurar configurações originais
     * @param {Object} config
     */
    restore(config) {
        if (Object.keys(this.originalSettings).length === 0) {
            console.warn('⚠️ No settings to restore');
            return;
        }

        Object.assign(config, this.originalSettings);
    }

    /**
     * Obter informaÃ§Ãµes do dispositivo
     * @returns {Object}
     */
    getDeviceInfo() {
        return {
            isMobile: this.isMobile,
            isLowEndDevice: this.isLowEndDevice,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            cpuCores: navigator.hardwareConcurrency || 'unknown',
            memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'unknown',
            connection: navigator.connection ? navigator.connection.effectiveType : 'unknown',
            userAgent: navigator.userAgent
        };
    }
}

// Criar instÃ¢ncia global
window.mobileOptimization = new MobileOptimization();

// Auto-inicializar
window.addEventListener('DOMContentLoaded', () => {
    window.mobileOptimization.init();
});

// Exportar para uso em outros mÃ³dulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileOptimization;
}
