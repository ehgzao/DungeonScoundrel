/**
 * Mobile Optimization Module
 * Detecta dispositivos mobile e ajusta performance/animações
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
     * Detecta se é um dispositivo mobile
     * @returns {boolean}
     */
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Verifica múltiplos padrões
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
        // - Conexão lenta (2G/3G)
        const isLowCpu = cpuCores < 4;
        const isLowMemory = memory < 4;
        const isSlowConnection = connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g');

        return isLowCpu || isLowMemory || isSlowConnection;
    }

    /**
     * Aplica otimizações mobile
     * @param {Object} gameConfig - Configurações do jogo
     */
    applyOptimizations(gameConfig) {
        if (!this.isMobile) {
            console.log('✅ Desktop detected - No mobile optimizations needed');
            return;
        }

        console.log('📱 Mobile device detected - Applying optimizations');
        console.log(`   ├─ Is low-end device: ${this.isLowEndDevice}`);
        console.log(`   ├─ Screen width: ${window.innerWidth}px`);
        console.log(`   └─ CPU cores: ${navigator.hardwareConcurrency || 'unknown'}`);

        // Salvar configurações originais
        this.originalSettings = {
            maxParticles: gameConfig.maxParticles || 50,
            screenShakeIntensity: gameConfig.screenShakeIntensity || 5,
            animationDuration: gameConfig.animationDuration || 400,
            enableBlur: gameConfig.enableBlur !== false,
            enableShadows: gameConfig.enableShadows !== false
        };

        // Aplicar otimizações
        this.optimizeParticles(gameConfig);
        this.optimizeAnimations(gameConfig);
        this.optimizeEffects(gameConfig);

        // Se for low-end, aplicar otimizações agressivas
        if (this.isLowEndDevice) {
            this.applyAggressiveOptimizations(gameConfig);
        }

        console.log('✅ Mobile optimizations applied successfully');
    }

    /**
     * Otimiza sistema de partículas
     * @param {Object} config
     */
    optimizeParticles(config) {
        const reduction = this.isLowEndDevice ? 0.2 : 0.4; // 80% ou 60% de redução
        config.maxParticles = Math.floor(this.originalSettings.maxParticles * reduction);

        console.log(`   ├─ Particles: ${this.originalSettings.maxParticles} → ${config.maxParticles}`);
    }

    /**
     * Otimiza animações
     * @param {Object} config
     */
    optimizeAnimations(config) {
        // Reduzir duração das animações (mais rápido = menos frames)
        config.animationDuration = this.isLowEndDevice ? 150 : 250;

        // Reduzir screen shake
        config.screenShakeIntensity = this.isLowEndDevice ? 1 : 2;

        console.log(`   ├─ Animation duration: ${this.originalSettings.animationDuration}ms → ${config.animationDuration}ms`);
        console.log(`   ├─ Screen shake: ${this.originalSettings.screenShakeIntensity} → ${config.screenShakeIntensity}`);
    }

    /**
     * Otimiza efeitos visuais
     * @param {Object} config
     */
    optimizeEffects(config) {
        // Desabilitar efeitos pesados em mobile
        config.enableBlur = false; // Blur é muito pesado
        config.enableShadows = !this.isLowEndDevice; // Sombras apenas em devices melhores

        console.log(`   ├─ Blur effects: ${this.originalSettings.enableBlur} → ${config.enableBlur}`);
        console.log(`   └─ Shadows: ${this.originalSettings.enableShadows} → ${config.enableShadows}`);
    }

    /**
     * Aplicar otimizações agressivas para low-end devices
     * @param {Object} config
     */
    applyAggressiveOptimizations(config) {
        console.log('⚠️  Low-end device - Applying aggressive optimizations');

        // Reduzir ainda mais partículas
        config.maxParticles = Math.max(5, config.maxParticles);

        // Desabilitar todos os efeitos visuais não-essenciais
        config.enableShadows = false;
        config.enableGlow = false;
        config.enableTransitions = false;

        // Simplificar CSS
        document.body.classList.add('low-end-device');

        console.log('   └─ Aggressive mode: Particles=5, Effects=OFF');
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

            /* Desabilitar animações pesadas em mobile */
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

            /* Touch-friendly: aumentar área de toque */
            @media (max-width: 768px) {
                button, .card, .clickable, a {
                    min-width: 44px;
                    min-height: 44px;
                }
            }
        `;

        document.head.appendChild(style);
        console.log('✅ Mobile CSS optimizations applied');
    }

    /**
     * Preload crítico: apenas imagens essenciais
     */
    optimizeImageLoading() {
        if (!this.isMobile) return;

        // Desabilitar preload de imagens não-essenciais
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');

        console.log(`📱 Lazy loading ${lazyImages.length} images`);

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
                rootMargin: '50px', // Começar a carregar 50px antes de entrar na tela
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
                        console.log('🆘 Emergency mode: Disabling all effects');
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
        console.log('🚀 Initializing Mobile Optimization Module');

        this.adjustCSS();
        this.optimizeImageLoading();

        // Monitorar performance apenas em modo debug
        if (localStorage.getItem('debugMode') === 'true') {
            this.monitorPerformance();
        }

        console.log('✅ Mobile Optimization Module initialized');
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
        console.log('✅ Original settings restored');
    }

    /**
     * Obter informações do dispositivo
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

// Criar instância global
window.mobileOptimization = new MobileOptimization();

// Auto-inicializar
window.addEventListener('DOMContentLoaded', () => {
    window.mobileOptimization.init();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileOptimization;
}
