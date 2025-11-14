# 📱 ROADMAP DE IMPLANTAÇÃO MOBILE - DUNGEON SCOUNDREL

**Data:** 2025-11-12
**Versão Atual:** 1.6.24
**Objetivo:** Expandir o jogo para plataformas mobile (Android/iOS)

---

## 📊 ANÁLISE DO ESTADO ATUAL

### ✅ O que já existe:
- **PWA Manifest** configurado (`site.webmanifest`)
- **Meta tags mobile** (viewport, theme-color)
- **Modal de waitlist** para usuários mobile
- **Layout responsivo** básico com CSS
- **Haptic feedback** implementado
- **Touch events** configurados (long-press)
- **JavaScript Vanilla** modular (fácil de portar)
- **Firebase** como backend (multiplataforma)
- **100% Frontend** (sem servidor próprio)

### ⚠️ Desafios atuais:
- Performance de animações em mobile
- Tooltips não otimizados para touch
- Assets pesados (~12MB total)
- Experiência UX precisa ajustes
- Falta de cache offline robusto

---

## 🎯 DECISÃO: APK NATIVO vs WEB MOBILE

### 📱 **RECOMENDAÇÃO: AMBOS (ESTRATÉGIA HÍBRIDA)**

#### **FASE 1 - PWA/Web Mobile (CURTO PRAZO - 2-4 semanas)**
✅ **Implementar PRIMEIRO**
- Aproveita 100% do código existente
- Deploy instantâneo via Netlify
- Sem revisão de stores (App/Play Store)
- Menor custo de desenvolvimento
- Atualizações instantâneas
- Cross-platform automático

#### **FASE 2 - APK Nativo (MÉDIO PRAZO - 1-3 meses)**
✅ **Implementar DEPOIS**
- Melhor performance
- Acesso a recursos nativos
- Presença nas stores (descoberta)
- Monetização (IAP, AdMob)
- Push notifications robustas
- Melhor retenção de usuários

---

## 🛠️ MELHOR STACK TECNOLÓGICA

### **FASE 1: PWA (Web Mobile)**

```
Dungeon Scoundrel (existente)
├── Frontend: JavaScript Vanilla ES6+
├── Backend: Firebase (Firestore + Auth)
├── Hosting: Netlify
└── PWA Features:
    ├── Service Worker (Workbox)
    ├── Cache API
    ├── IndexedDB (offline saves)
    └── Web App Manifest
```

**Justificativa:**
- ✅ Zero mudanças no código existente
- ✅ Rápido de implementar (2-4 semanas)
- ✅ Funciona em Android + iOS
- ✅ Custo zero adicional

---

### **FASE 2: APK Nativo (Capacitor)**

```
Dungeon Scoundrel Mobile
├── Framework: Capacitor 6.x (recomendado)
│   └── Wrapper nativo para web app existente
├── Código: 95% reutilizado (HTML/CSS/JS atual)
├── Plugins Capacitor:
│   ├── @capacitor/app
│   ├── @capacitor/haptics
│   ├── @capacitor/splash-screen
│   ├── @capacitor/status-bar
│   ├── @capacitor/browser
│   ├── @capacitor/network
│   └── Opcionais:
│       ├── @capacitor-community/admob
│       ├── @capacitor/purchases (IAP)
│       └── @capacitor/push-notifications
├── Build:
│   ├── Android: Android Studio + Gradle
│   └── iOS: Xcode + CocoaPods
└── Deploy:
    ├── Google Play Store
    └── Apple App Store
```

**Justificativa:**
- ✅ Aproveita 95% do código existente
- ✅ Acesso a APIs nativas
- ✅ Performance superior ao PWA
- ✅ Monetização completa
- ✅ Presença nas stores
- ⚠️ Requer setup de builds nativos

---

### **❌ ALTERNATIVAS DESCARTADAS**

#### **React Native / Flutter**
- ❌ Reescrita completa do jogo
- ❌ Tempo: 3-6 meses
- ❌ Custo alto
- ❌ Perda de todo código existente

#### **Ionic Framework**
- ⚠️ Similar ao Capacitor, mas mais pesado
- ⚠️ Requer Angular/React/Vue
- ✅ Capacitor é mais leve e flexível

#### **Cordova**
- ❌ Tecnologia legada
- ❌ Performance inferior
- ❌ Menos suporte da comunidade

---

## 📋 PASSO A PASSO DETALHADO

---

## 🚀 FASE 1: PWA/WEB MOBILE (2-4 SEMANAS)

### **SEMANA 1: OTIMIZAÇÃO DE PERFORMANCE**

#### **1.1 - Reduzir Tamanho de Assets (2-3h)**
```bash
# Comprimir imagens para WebP com qualidade adaptativa
cwebp -q 75 public/assets/images/*.jpg -o public/assets/images/*.webp

# Minificar JavaScript
npx terser public/src/js/game.js -o public/src/js/game.min.js -c -m

# Minificar CSS
npx csso public/src/styles/styles.css -o public/src/styles/styles.min.css

# Comprimir HTML
npx html-minifier --collapse-whitespace --remove-comments public/index.html -o public/index.min.html
```

**Resultado esperado:** Redução de ~12MB para ~6-8MB

#### **1.2 - Lazy Loading de Assets (3-4h)**
Implementar carregamento sob demanda:
```javascript
// Carregar avatares apenas quando selecionados
function lazyLoadClassAvatar(className) {
    const img = new Image();
    img.src = `assets/images/avatar-${className}.webp`;
    img.onload = () => renderClassSelection();
}

// Carregar música apenas quando necessário
function lazyLoadMusic(context) {
    if (!musicLoaded[context]) {
        loadMusicForContext(context);
    }
}
```

**Arquivos a modificar:**
- `public/src/js/game.js` (sistema de carregamento)
- `public/src/js/systems/music.js`

#### **1.3 - Desabilitar Animações Pesadas em Mobile (2h)**
```javascript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
    // Reduzir partículas
    MAX_PARTICLES = 20; // ao invés de 50

    // Desabilitar screen shake intenso
    SCREEN_SHAKE_INTENSITY = 2; // ao invés de 5

    // Simplificar animações de cartas
    ANIMATION_DURATION = 200; // ao invés de 400ms
}
```

**Arquivo:** `public/src/js/game.js`

---

### **SEMANA 2: SERVICE WORKER E CACHE OFFLINE**

#### **2.1 - Instalar Workbox (1h)**
```bash
npm init -y
npm install workbox-cli --save-dev
```

Criar `workbox-config.js`:
```javascript
module.exports = {
    globDirectory: 'public/',
    globPatterns: [
        '**/*.{html,js,css,svg,webp,jpg,png,json,woff2}'
    ],
    swDest: 'public/sw.js',
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'google-fonts-stylesheets',
            },
        },
        {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'firebase-assets',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
                },
            },
        },
    ],
};
```

#### **2.2 - Registrar Service Worker (30min)**
Adicionar em `public/index.html` (antes do `</body>`):
```javascript
<script>
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
</script>
```

#### **2.3 - Implementar Offline Saves (3-4h)**
Usar IndexedDB para saves locais:
```javascript
// Criar arquivo: public/src/js/utils/offline-storage.js

class OfflineStorage {
    constructor() {
        this.dbName = 'DungeonScoundrelDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Criar object stores
                if (!db.objectStoreNames.contains('saves')) {
                    db.createObjectStore('saves', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('stats')) {
                    db.createObjectStore('stats', { keyPath: 'id' });
                }
            };
        });
    }

    async saveGame(saveData) {
        const tx = this.db.transaction(['saves'], 'readwrite');
        const store = tx.objectStore('saves');
        await store.put({ id: 'currentSave', data: saveData, timestamp: Date.now() });
    }

    async loadGame() {
        const tx = this.db.transaction(['saves'], 'readonly');
        const store = tx.objectStore('saves');
        const request = store.get('currentSave');
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result?.data);
        });
    }
}

// Usar no jogo
const offlineStorage = new OfflineStorage();
await offlineStorage.init();
```

**Integrar com sistema existente:**
- Modificar funções `saveGame()` e `loadGame()` em `game.js`
- Fazer fallback para localStorage se IndexedDB falhar

---

### **SEMANA 3: UX MOBILE**

#### **3.1 - Melhorar Touch Targets (2-3h)**
Garantir mínimo 44x44px para todos os botões:
```css
/* Adicionar em public/src/styles/styles.css */

/* Mobile-first buttons */
@media (max-width: 768px) {
    button, .card, .clickable {
        min-width: 44px;
        min-height: 44px;
        padding: 12px 20px;
    }

    /* Aumentar área de toque das cartas */
    .card {
        width: 100px;  /* ao invés de 80px */
        height: 140px; /* ao invés de 120px */
    }

    /* Melhorar espaçamento */
    .hand-container {
        gap: 8px; /* mais espaço entre cartas */
    }
}
```

#### **3.2 - Redesenhar Tooltips para Touch (3-4h)**
Criar sistema de tooltips mobile-friendly:
```javascript
// Adicionar em public/src/js/utils/mobile-tooltips.js

function showMobileTooltip(element, content) {
    // Em desktop: hover
    // Em mobile: tap para mostrar, tap fora para esconder

    const isMobile = 'ontouchstart' in window;

    if (isMobile) {
        element.addEventListener('click', (e) => {
            e.stopPropagation();

            // Criar tooltip modal
            const tooltip = document.createElement('div');
            tooltip.className = 'mobile-tooltip-modal';
            tooltip.innerHTML = `
                <div class="tooltip-content">${content}</div>
                <button class="tooltip-close">✕</button>
            `;

            document.body.appendChild(tooltip);

            // Fechar ao clicar no X ou fora
            tooltip.querySelector('.tooltip-close').onclick = () => tooltip.remove();
            tooltip.onclick = (e) => {
                if (e.target === tooltip) tooltip.remove();
            };
        });
    } else {
        // Tooltip hover padrão para desktop
        element.addEventListener('mouseenter', () => showTooltip(element, content));
        element.addEventListener('mouseleave', hideTooltip);
    }
}
```

**CSS para tooltip modal:**
```css
.mobile-tooltip-modal {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s;
}

.tooltip-content {
    background: linear-gradient(135deg, #3a2f1f 0%, #2c2416 100%);
    border: 2px solid #d4af37;
    border-radius: 12px;
    padding: 20px;
    max-width: 85vw;
    color: #e0d4c0;
    font-size: 16px;
    line-height: 1.5;
}

.tooltip-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    background: #d4af37;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    color: #2c2416;
    cursor: pointer;
}
```

#### **3.3 - Implementar Gestures (2-3h)**
Adicionar gestures úteis:
```javascript
// Adicionar em public/src/js/utils/gestures.js

class GestureHandler {
    constructor() {
        this.startX = 0;
        this.startY = 0;
    }

    init() {
        document.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const deltaX = endX - this.startX;
            const deltaY = endY - this.startY;

            // Swipe horizontal
            if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50) {
                if (deltaX > 0) {
                    this.onSwipeRight();
                } else {
                    this.onSwipeLeft();
                }
            }

            // Swipe vertical
            if (Math.abs(deltaY) > 100 && Math.abs(deltaX) < 50) {
                if (deltaY > 0) {
                    this.onSwipeDown();
                } else {
                    this.onSwipeUp();
                }
            }
        });
    }

    onSwipeRight() {
        // Navegar menu lateral
        console.log('Swipe right: Open menu');
    }

    onSwipeLeft() {
        // Fechar menu
        console.log('Swipe left: Close menu');
    }

    onSwipeDown() {
        // Ver inventário/relíquias
        console.log('Swipe down: Show inventory');
    }

    onSwipeUp() {
        // Ver estatísticas
        console.log('Swipe up: Show stats');
    }
}

const gestures = new GestureHandler();
gestures.init();
```

#### **3.4 - Forçar Orientação Portrait (30min)**
Adicionar aviso para landscape:
```html
<!-- Adicionar em public/index.html -->
<div id="orientation-warning" style="display: none;">
    <div class="orientation-content">
        <div style="font-size: 48px; margin-bottom: 20px;">📱</div>
        <h2>Please Rotate Your Device</h2>
        <p>Dungeon Scoundrel is best played in portrait mode</p>
        <div class="rotate-icon">🔄</div>
    </div>
</div>

<style>
#orientation-warning {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #2c2416;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

@media (orientation: landscape) and (max-width: 768px) {
    #orientation-warning {
        display: flex !important;
    }
    #app-container {
        display: none;
    }
}
</style>
```

---

### **SEMANA 4: TESTES E AJUSTES FINAIS**

#### **4.1 - Testar em Dispositivos Reais (Full Week)**

**Checklist de Testes:**
```markdown
## Android (Testar em 3+ dispositivos)
- [ ] Samsung Galaxy (Android 11+)
- [ ] Xiaomi/Redmi (MIUI)
- [ ] Motorola/OnePlus (Android puro)

### Itens a testar:
- [ ] Carregamento inicial (< 5s em 4G)
- [ ] Performance de animações (60fps)
- [ ] Touch responsiveness
- [ ] Tooltips funcionando
- [ ] Haptic feedback
- [ ] Áudio (música + SFX)
- [ ] Save/Load funciona offline
- [ ] Firebase sync funciona online
- [ ] Orientação landscape bloqueada
- [ ] PWA Install prompt aparece
- [ ] Service Worker cacheia assets

## iOS (Testar em 2+ dispositivos)
- [ ] iPhone 12+ (iOS 15+)
- [ ] iPad (opcional)

### Itens a testar:
- [ ] Safari compatibilidade
- [ ] Add to Home Screen funciona
- [ ] Splash screen aparece
- [ ] Notch/Safe area respeitada
- [ ] Mesmos testes do Android
```

#### **4.2 - Otimizações de Performance (Ongoing)**
Usar Chrome DevTools:
```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse https://dungeonscoundrel.com --view --preset=mobile

# Metas:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 90
# - SEO: > 95
# - PWA: 100
```

#### **4.3 - Deploy PWA (1h)**
```bash
# Build de produção
npm run build

# Deploy Netlify
netlify deploy --prod

# Testar PWA
# 1. Abrir Chrome/Edge
# 2. DevTools > Application > Service Workers
# 3. Verificar cache
# 4. Testar offline (Network > Offline)
```

---

## 🚀 FASE 2: APK NATIVO COM CAPACITOR (1-3 MESES)

### **MÊS 1: SETUP E CONFIGURAÇÃO**

#### **SEMANA 1-2: Instalar Capacitor**

**1. Inicializar projeto Capacitor:**
```bash
cd /home/user/DungeonScoundrel

# Instalar Capacitor
npm install @capacitor/core @capacitor/cli --save-dev

# Inicializar
npx cap init "Dungeon Scoundrel" "com.dungeonscoundrel.game" --web-dir=public

# Adicionar plataformas
npx cap add android
npx cap add ios
```

**2. Configurar `capacitor.config.json`:**
```json
{
  "appId": "com.dungeonscoundrel.game",
  "appName": "Dungeon Scoundrel",
  "webDir": "public",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#2c2416",
      "showSpinner": false
    },
    "StatusBar": {
      "style": "dark",
      "backgroundColor": "#2c2416"
    },
    "Keyboard": {
      "resize": "none"
    }
  },
  "server": {
    "androidScheme": "https"
  }
}
```

**3. Instalar plugins essenciais:**
```bash
npm install @capacitor/app @capacitor/haptics @capacitor/splash-screen @capacitor/status-bar @capacitor/browser @capacitor/network
```

**4. Atualizar código para usar Capacitor:**
```javascript
// Adicionar em public/src/js/core/capacitor-bridge.js

import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

export class CapacitorBridge {
    static async init() {
        // Configurar status bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#2c2416' });

        // Listener para botão voltar do Android
        App.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
                this.showExitConfirmation();
            } else {
                window.history.back();
            }
        });

        // Listener para app pausar/resumir
        App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                this.onAppResume();
            } else {
                this.onAppPause();
            }
        });
    }

    static async vibrate(type = 'medium') {
        try {
            const style = {
                light: ImpactStyle.Light,
                medium: ImpactStyle.Medium,
                heavy: ImpactStyle.Heavy
            }[type];

            await Haptics.impact({ style });
        } catch (e) {
            console.warn('Haptics not available');
        }
    }

    static showExitConfirmation() {
        // Mostrar dialog para confirmar saída
        if (confirm('Exit Dungeon Scoundrel?')) {
            App.exitApp();
        }
    }

    static onAppResume() {
        // Retomar música se estava tocando
        if (game.musicEnabled) {
            musicSystem.resume();
        }
    }

    static onAppPause() {
        // Salvar jogo automaticamente
        game.saveGame();
        // Pausar música
        musicSystem.pause();
    }
}

// Inicializar quando app carregar
if (window.Capacitor) {
    CapacitorBridge.init();
}
```

---

#### **SEMANA 3: Setup Android**

**1. Instalar Android Studio:**
- Download: https://developer.android.com/studio
- Instalar SDK Tools, Build Tools, Platform Tools

**2. Configurar projeto Android:**
```bash
# Sincronizar arquivos
npx cap sync android

# Abrir no Android Studio
npx cap open android
```

**3. Configurar `android/app/build.gradle`:**
```gradle
android {
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.dungeonscoundrel.game"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

**4. Adicionar ícones e splash screen:**
```bash
# Gerar ícones Android (1024x1024 PNG)
# Usar ferramenta: https://icon.kitchen

# Splash screen (2048x2048 PNG)
# Colocar em: android/app/src/main/res/drawable/splash.png
```

**5. Build APK de teste:**
```bash
cd android
./gradlew assembleDebug

# APK gerado em:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

#### **SEMANA 4: Setup iOS (Se disponível)**

**1. Requisitos:**
- macOS com Xcode 14+
- Apple Developer Account ($99/ano)
- Certificados e Provisioning Profiles

**2. Configurar projeto iOS:**
```bash
# Sincronizar arquivos
npx cap sync ios

# Abrir no Xcode
npx cap open ios
```

**3. Configurar App ID e certificados:**
- Acessar: https://developer.apple.com
- Criar App ID: `com.dungeonscoundrel.game`
- Gerar certificados de distribuição
- Criar Provisioning Profile

**4. Build IPA:**
```bash
# Em Xcode:
# Product > Archive
# Distribute App > App Store Connect
```

---

### **MÊS 2: FEATURES NATIVAS**

#### **2.1 - Integrar AdMob (Opcional - Monetização)**

**Instalar plugin:**
```bash
npm install @capacitor-community/admob
npx cap sync
```

**Configurar AdMob:**
```javascript
// Adicionar em public/src/js/core/admob-manager.js

import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export class AdMobManager {
    static async init() {
        await AdMob.initialize({
            requestTrackingAuthorization: true,
            initializeForTesting: false
        });
    }

    static async showBanner() {
        await AdMob.showBanner({
            adId: 'ca-app-pub-XXXXXXXX~YYYYYY', // Seu ID AdMob
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0
        });
    }

    static async showInterstitial() {
        await AdMob.prepareInterstitial({
            adId: 'ca-app-pub-XXXXXXXX~YYYYYY'
        });

        await AdMob.showInterstitial();
    }

    static async showRewarded(onReward) {
        await AdMob.prepareRewardVideoAd({
            adId: 'ca-app-pub-XXXXXXXX~YYYYYY'
        });

        AdMob.addListener('onRewardedVideoAdReward', (reward) => {
            onReward(reward);
        });

        await AdMob.showRewardVideoAd();
    }
}

// Usar no jogo
// Exemplo: Mostrar ad após game over
async function onGameOver() {
    if (Math.random() < 0.3) { // 30% de chance
        await AdMobManager.showInterstitial();
    }
}

// Exemplo: Ad recompensado para reviver
async function offerRevive() {
    const revive = confirm('Watch ad to revive with 50% HP?');
    if (revive) {
        await AdMobManager.showRewarded((reward) => {
            game.hp = Math.floor(game.maxHp * 0.5);
            game.continueGame();
        });
    }
}
```

#### **2.2 - Integrar In-App Purchases (Opcional)**

**Instalar plugin:**
```bash
npm install @capacitor/purchases
npm install @revenuecat/purchases-capacitor
npx cap sync
```

**Configurar IAP:**
```javascript
// Adicionar em public/src/js/core/iap-manager.js

import { Purchases } from '@revenuecat/purchases-capacitor';

export class IAPManager {
    static async init() {
        await Purchases.configure({
            apiKey: 'YOUR_REVENUECAT_KEY',
            appUserID: game.userId // ID único do jogador
        });
    }

    static async getProducts() {
        const { products } = await Purchases.getOfferings();
        return products;
    }

    static async purchase(productId) {
        try {
            const { customerInfo } = await Purchases.purchaseProduct({
                productIdentifier: productId
            });

            // Verificar compra
            if (customerInfo.entitlements.active['premium']) {
                this.unlockPremiumFeatures();
            }
        } catch (error) {
            console.error('Purchase failed:', error);
        }
    }

    static unlockPremiumFeatures() {
        // Exemplo: Remover ads
        game.isPremium = true;
        localStorage.setItem('isPremium', 'true');

        // Desbloquear relíquias exclusivas
        game.unlockPremiumRelics();
    }
}

// Produtos sugeridos:
/*
1. Remove Ads - $2.99
2. Starter Pack (50 Gold + 2 Relics) - $4.99
3. Premium Pass (Todas relíquias + Sem ads) - $9.99
4. Support Developer - $1.99
*/
```

#### **2.3 - Push Notifications**

**Instalar plugin:**
```bash
npm install @capacitor/push-notifications
npx cap sync
```

**Configurar notificações:**
```javascript
// Adicionar em public/src/js/core/notification-manager.js

import { PushNotifications } from '@capacitor/push-notifications';

export class NotificationManager {
    static async init() {
        // Pedir permissão
        const result = await PushNotifications.requestPermissions();

        if (result.receive === 'granted') {
            await PushNotifications.register();
        }

        // Listeners
        PushNotifications.addListener('registration', (token) => {
            console.log('Push token:', token.value);
            this.sendTokenToServer(token.value);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Notification received:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log('Notification action:', action);
            this.handleNotificationAction(action);
        });
    }

    static sendTokenToServer(token) {
        // Enviar token para Firebase/backend
        // Para usar com Firebase Cloud Messaging
    }

    static handleNotificationAction(action) {
        // Exemplo: Daily reward notification
        if (action.notification.data.type === 'daily_reward') {
            game.showDailyReward();
        }
    }

    static async scheduleLocalNotification(title, body, delay) {
        // Notificação local (não precisa de servidor)
        // Exemplo: Lembrar de jogar
        await PushNotifications.schedule({
            notifications: [
                {
                    title: title,
                    body: body,
                    id: Date.now(),
                    schedule: { at: new Date(Date.now() + delay) }
                }
            ]
        });
    }
}

// Usar no jogo
// Exemplo: Notificar após 24h sem jogar
function onPlayerLeave() {
    NotificationManager.scheduleLocalNotification(
        '⚔️ The dungeon awaits!',
        'Your daily reward is ready! Come back to claim it.',
        24 * 60 * 60 * 1000 // 24 horas
    );
}
```

---

### **MÊS 3: TESTES, OTIMIZAÇÃO E DEPLOY**

#### **3.1 - Testes Beta (2-3 semanas)**

**Android Beta (Google Play Console):**
```bash
# Build signed APK/AAB
cd android
./gradlew bundleRelease

# Gerar em: android/app/build/outputs/bundle/release/app-release.aab

# Upload para Play Console:
# 1. Criar app em: https://play.google.com/console
# 2. Production > Create new release > Upload AAB
# 3. Internal testing > Add testers (emails)
```

**iOS TestFlight (App Store Connect):**
```bash
# Build em Xcode
# Product > Archive > Distribute > TestFlight

# Adicionar testers:
# 1. App Store Connect > TestFlight
# 2. Add External Testers (até 10.000)
```

**Feedback a coletar:**
- Performance em diferentes devices
- Bugs específicos de plataforma
- UX em telas pequenas/grandes
- Bateria drain
- Crash reports

#### **3.2 - Otimizações Finais**

**Performance:**
```javascript
// Reduzir draw calls
// Usar CSS transform ao invés de left/top
element.style.transform = `translate(${x}px, ${y}px)`;

// Usar requestAnimationFrame
function gameLoop() {
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
}

// Lazy load modules
const heavyModule = await import('./heavy-module.js');
```

**Reduzir tamanho do APK:**
```bash
# Habilitar ProGuard (ofuscar código)
# Já configurado em build.gradle

# Comprimir assets
npx cap copy android

# Usar Android App Bundle (AAB)
./gradlew bundleRelease
```

#### **3.3 - Deploy nas Stores**

**Google Play Store:**
```markdown
1. Preparar assets:
   - Icon: 512x512 PNG
   - Feature Graphic: 1024x500
   - Screenshots: 6-8 images (16:9 e 9:16)
   - Promo video (opcional)

2. Preencher listing:
   - Título: "Dungeon Scoundrel - Roguelike Card Game"
   - Short description: 80 chars
   - Full description: Até 4000 chars
   - Categoria: Games > Card
   - Rating: Everyone 10+

3. Configurar preço:
   - Free (com IAP opcional)

4. Submit for review:
   - Review time: 1-7 dias
```

**Apple App Store:**
```markdown
1. Preparar assets:
   - Icon: 1024x1024 PNG
   - Screenshots: iPhone 6.7", iPad Pro 12.9"
   - App preview video (opcional)

2. App Store Connect:
   - Nome: "Dungeon Scoundrel"
   - Subtitle: "Dark Medieval Roguelike"
   - Categoria: Games > Card
   - Rating: 9+

3. Pricing:
   - Free (com IAP opcional)

4. Submit for review:
   - Review time: 1-3 dias (mais rigoroso)
   - Pode reprovar por:
     - Bugs
     - Violação de guidelines
     - IAP mal implementado
```

---

## 📊 CRONOGRAMA E CUSTOS

### **FASE 1: PWA (Curto Prazo)**
| Tarefa | Tempo | Custo |
|--------|-------|-------|
| Otimização de Performance | 1 semana | $0 |
| Service Worker + Offline | 1 semana | $0 |
| UX Mobile | 1 semana | $0 |
| Testes | 1 semana | $0 |
| **TOTAL FASE 1** | **2-4 semanas** | **$0** |

### **FASE 2: APK Nativo (Médio Prazo)**
| Tarefa | Tempo | Custo |
|--------|-------|-------|
| Setup Capacitor | 1 semana | $0 |
| Config Android/iOS | 1 semana | $0 |
| Features Nativas | 3-4 semanas | $0-$200* |
| Testes Beta | 2-3 semanas | $0 |
| Deploy Stores | 1 semana | $125** |
| **TOTAL FASE 2** | **2-3 meses** | **$125-$325** |

**Custos adicionais:**
- * AdMob/IAP: Grátis (comissão de 30% nas vendas)
- ** Apple Developer: $99/ano (obrigatório)
- ** Google Play: $25 one-time (obrigatório)

---

## 🎯 FEATURES RECOMENDADAS PARA MOBILE

### **Must Have (Essenciais):**
1. ✅ Service Worker (cache offline)
2. ✅ Touch-friendly UI (44px min)
3. ✅ Performance otimizada (60fps)
4. ✅ Splash screen
5. ✅ Orientação portrait forçada
6. ✅ Haptic feedback
7. ✅ Auto-save frequente

### **Should Have (Importantes):**
8. ✅ Gestures (swipe)
9. ✅ Push notifications
10. ✅ Daily rewards
11. ✅ Cloud save sync
12. ✅ Leaderboard global
13. ✅ Dark mode (já tem)

### **Nice to Have (Opcionais):**
14. ⚠️ AdMob (monetização)
15. ⚠️ IAP (remover ads, starter pack)
16. ⚠️ Social share
17. ⚠️ Achievements com Google Play Games
18. ⚠️ Modo offline completo

---

## 📱 DIFERENCIAIS MOBILE

### **Novas features exclusivas para mobile:**

1. **Daily Login Rewards**
```javascript
function checkDailyReward() {
    const lastLogin = localStorage.getItem('lastLogin');
    const today = new Date().toDateString();

    if (lastLogin !== today) {
        showDailyReward();
        localStorage.setItem('lastLogin', today);
    }
}
```

2. **Quick Play Mode**
- Runs curtas (10 cartas ao invés de 50)
- Perfeito para jogar no ônibus/metrô

3. **Portrait-Optimized Layout**
- UI redesenhada para tela vertical
- Cartas maiores, mais fáceis de tocar

4. **Cloud Sync**
- Continuar jogo no PC/Mobile
- Backups automáticos

---

## 🚀 RECOMENDAÇÃO FINAL

### **MELHOR ESTRATÉGIA:**

1. **AGORA (Semanas 1-4):**
   - ✅ Implementar PWA completo
   - ✅ Otimizar performance mobile
   - ✅ Lançar como "Web App"
   - ✅ Coletar feedback dos usuários

2. **DEPOIS (Meses 2-4):**
   - ✅ Desenvolver APK nativo com Capacitor
   - ✅ Adicionar features nativas (IAP, Push)
   - ✅ Publicar nas stores
   - ✅ Marketing e growth

### **VANTAGENS DESSA ABORDAGEM:**
- ✅ **Rápido:** PWA em 2-4 semanas
- ✅ **Barato:** $0 para começar
- ✅ **Validação:** Testar mercado antes de investir
- ✅ **Evolutivo:** Migrar para nativo depois
- ✅ **Cross-platform:** Funciona em tudo

---

## 📞 PRÓXIMOS PASSOS

### **Se concordar com o roadmap:**

1. **Fazer backup do código atual**
```bash
git checkout -b mobile-pwa-development
git push origin mobile-pwa-development
```

2. **Começar Fase 1 - Semana 1**
- Otimização de assets
- Lazy loading
- Redução de animações mobile

3. **Testar progressivamente**
- Deploy em staging
- Testar em devices reais
- Iterar baseado em feedback

---

## 📚 RECURSOS ÚTEIS

### **Documentação:**
- Capacitor: https://capacitorjs.com/docs
- PWA: https://web.dev/progressive-web-apps/
- Workbox: https://developers.google.com/web/tools/workbox
- Firebase: https://firebase.google.com/docs

### **Ferramentas:**
- Lighthouse: Auditar performance
- Chrome DevTools: Debug mobile
- Android Studio: Build Android
- Xcode: Build iOS

### **Comunidades:**
- r/gamedev
- r/incremental_games
- Discord: Capacitor Community
- Stack Overflow

---

**Criado em:** 2025-11-12
**Autor:** Claude Code
**Versão:** 1.0

