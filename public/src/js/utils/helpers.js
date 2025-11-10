/* ============================================
   STORAGE & UTILITY HELPERS
   Storage Cache, Debounce, Haptic, Tooltips
   Extracted from game.js
   ============================================ */

// ============================================
// OPTIMIZATION HELPERS
// ============================================

// Storage Cache - Optimizes localStorage operations with error handling
class StorageCache {
    constructor() {
        this.cache = {};
        this.storageAvailable = this.checkStorageAvailability();
    }
    
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            console.warn('LocalStorage not available:', e);
            return false;
        }
    }
    
    get(key, defaultValue = {}) {
        if (!this.storageAvailable) return defaultValue;
        
        if (this.cache[key] === undefined) {
            try {
                const data = localStorage.getItem(key);
                this.cache[key] = data ? JSON.parse(data) : defaultValue;
            } catch(e) {
                console.error(`Error reading ${key}:`, e);
                this.cache[key] = defaultValue;
            }
        }
        return this.cache[key];
    }
    
    set(key, value) {
        if (!this.storageAvailable) {
            console.warn('Storage not available, using cache only');
            this.cache[key] = value;
            return false;
        }
        
        this.cache[key] = value;
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch(e) {
            if (e.name === 'QuotaExceededError') {
                console.error('Storage quota exceeded');
                // Try to clear old data
                this.clearOldData();
            } else {
                console.error(`Error saving ${key}:`, e);
            }
            return false;
        }
    }
    
    update(key, updater) {
        const current = this.get(key);
        const updated = updater(current);
        this.set(key, updated);
        return updated;
    }
    
    invalidate(key) {
        delete this.cache[key];
    }
    
    clearCache() {
        this.cache = {};
    }
    
    clearOldData() {
        // Clear non-essential data if quota exceeded
        try {
            const keysToPreserve = ['scoundrel_lifetime_stats', 'scoundrel_unlocks'];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !keysToPreserve.includes(key)) {
                    localStorage.removeItem(key);
                    delete this.cache[key];
                }
            }
        } catch(e) {
            console.error('Error clearing old data:', e);
        }
    }
}

const storage = new StorageCache();

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function - Prevents excessive function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Haptic Feedback for mobile devices
function hapticFeedback(type = 'light') {
    if ('vibrate' in navigator) {
        const patterns = {
            light: 10,
            medium: 25,
            heavy: 50,
            success: [10, 50, 10],
            error: [50, 25, 50],
            impact: 30
        };
        navigator.vibrate(patterns[type] || 10);
    }
}

// Tooltip System (Global scope for inline HTML handlers)
let activeTooltip = null;

window.showTooltip = function(element, text, position = 'top') {
    hideTooltip(); // Hide any existing tooltip
    
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.95);
        color: #c9a961;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.85em;
        max-width: 250px;
        z-index: 10001;
        pointer-events: none;
        border: 1px solid #5a4a38;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
        font-family: 'Cinzel', serif;
        white-space: normal;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    if (position === 'top') {
        tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
        tooltip.style.top = (rect.top - tooltipRect.height - 10) + 'px';
    } else if (position === 'bottom') {
        tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
        tooltip.style.top = (rect.bottom + 10) + 'px';
    }
    
    activeTooltip = tooltip;
};

window.hideTooltip = function() {
    if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
    }
};

// Screen Shake Effect
window.screenShake = function() {
    const gameContainer = document.body;
    gameContainer.style.animation = 'shake 0.3s';
    setTimeout(() => {
        gameContainer.style.animation = '';
    }, 300);
};

// Focus Management for modals
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    });
    
    // Focus first element when modal opens
    if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
    }
}

// Loading State Helper
function setButtonLoading(button, loading, originalText = '') {
    if (loading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span style="opacity: 0.7;">⏳</span> Loading...';
        button.style.cursor = 'wait';
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || originalText;
        button.style.cursor = 'pointer';
    }
}

// Screen Transition Helper
function transitionScreen(fromElement, toElement, callback) {
    if (fromElement) {
        fromElement.style.opacity = '1';
        fromElement.style.transition = 'opacity 0.3s ease';
        fromElement.style.opacity = '0';
        
        setTimeout(() => {
            fromElement.style.display = 'none';
            if (toElement) {
                toElement.style.display = 'flex';
                toElement.style.opacity = '0';
                setTimeout(() => {
                    toElement.style.transition = 'opacity 0.3s ease';
                    toElement.style.opacity = '1';
                }, 10);
            }
            if (callback) callback();
        }, 300);
    }
}

// Mobile Orientation Warning
function checkMobileOrientation() {
    if (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) {
        const orientationWarning = document.getElementById('orientationWarning');
        if (orientationWarning) {
            orientationWarning.style.display = 'flex';
        }
    } else {
        const orientationWarning = document.getElementById('orientationWarning');
        if (orientationWarning) {
            orientationWarning.style.display = 'none';
        }
    }
}

// Add shake animation to element
function shakeElement(element) {
    element.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 400);
}

// Add pulse animation to element  
function pulseElement(element, color = '#6bcf7f') {
    const originalBorder = element.style.border;
    element.style.animation = `pulse 0.6s ease`;
    element.style.border = `2px solid ${color}`;
    setTimeout(() => {
        element.style.animation = '';
        element.style.border = originalBorder;
    }, 600);
}

// DOM Helpers - Optimizes DOM manipulations
function createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

function createElementsFragment(items, createItemHTML, attachHandlers = null) {
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
        const html = createItemHTML(item);
        const element = createElementFromHTML(html);
        
        if (attachHandlers) {
            attachHandlers(element, item);
        }
        
        fragment.appendChild(element);
    });
    
    return fragment;
}

function updateList(container, items, createItemHTML, attachHandlers = null) {
    const fragment = createElementsFragment(items, createItemHTML, attachHandlers);
    container.innerHTML = '';
    container.appendChild(fragment);
}

// Modal Manager - Simplified modal management
const modalManager = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    },
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    },
    toggle(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.toggle('active');
    }
};

console.log('✅ Optimization helpers loaded!');

// ============================================
// DOM ELEMENTS (NEW STRUCTURE)
// ============================================

// Screens
const welcomeScreen = document.getElementById('welcomeScreen');
const gameWrapper = document.getElementById('gameWrapper');

// Welcome Buttons
const btnWelcomeStart = document.getElementById('btnWelcomeStart');
const btnLearnToPlay = document.getElementById('btnLearnToPlay');
const btnWelcomeLeaderboard = document.getElementById('btnWelcomeLeaderboard');
// btnWelcomeUnlocks removed - replaced by btnCodex in CODEX system

// Learn to Play Modal Elements
const learnToPlayModal = document.getElementById('learnToPlayModal');
const btnStartInteractiveTutorial = document.getElementById('btnStartInteractiveTutorial');
const btnOpenRulesReference = document.getElementById('btnOpenRulesReference');

// Interactive Tutorial Elements
const interactiveTutorialModal = document.getElementById('interactiveTutorialModal');
const tutorialStepTitle = document.getElementById('tutorialStepTitle');
const tutorialStepContent = document.getElementById('tutorialStepContent');
const btnTutorialPrev = document.getElementById('btnTutorialPrev');
const btnTutorialNext = document.getElementById('btnTutorialNext');
const btnTutorialSkip = document.getElementById('btnTutorialSkip');
const tutorialCurrentStep = document.getElementById('tutorialCurrentStep');
const tutorialTotalSteps = document.getElementById('tutorialTotalSteps');

// New Game Modal
const newGameModal = document.getElementById('newGameModal');
const playerNameInput = document.getElementById('playerNameInput');
const difficultySelector = document.getElementById('difficultySelector');
const btnStartGameModal = document.getElementById('btnStartGameModal');
const btnCancelStart = document.getElementById('btnCancelStart');

// Game Bars
const topBar = document.querySelector('.top-bar');
const centerArea = document.querySelector('.center-area');
const bottomBar = document.getElementById('room'); // Bottom bar is the room

// Side Panels
const relicsPanel = document.getElementById('relicsPanel');
const relicsList = document.getElementById('relicsList');
const btnOpenShop = document.getElementById('btnOpenShop');
const holdAreaContainer = document.getElementById('holdAreaContainer');
const discardPilePreview = document.getElementById('discardPilePreview');
const gameTimer = document.getElementById('gameTimer');

// Center Stage
const messageArea = document.getElementById('messageArea');
const equippedWeaponEl = document.getElementById('equippedWeapon');
const btnDrawRoom = document.getElementById('btnDrawRoom');
const btnAvoidRoom = document.getElementById('btnAvoidRoom');
const mainScoreValue = document.getElementById('mainScoreValue'); // New Score Element

// Top Bar Stats
const healthEl = document.getElementById('health');
const goldEl = document.getElementById('goldAmount');
// scoreEl removed
const dungeonCountEl = document.getElementById('dungeonCount');
const statRoomsEl = document.getElementById('statRooms');

// Achievements
const achievementsCompact = document.getElementById('achievementsCompact');
const achievementCounter = document.getElementById('achievementCounter');
const achievementsModal = document.getElementById('achievementsModal');
const achievementsList = document.getElementById('achievementsList');

// Top Bar Buttons
// btnTopSound removed - redundant with music controls
const btnMusicPrev = document.getElementById('btnMusicPrev');
const btnMusicToggle = document.getElementById('btnMusicToggle');
const btnMusicNext = document.getElementById('btnMusicNext');
// btnTopTutorial removed - only in main menu
// btnTopLeaderboard removed - only in main menu
// btnTopCodex removed - redundant with Relics button
const btnTopGiveUp = document.getElementById('btnTopGiveUp'); // Give Up Button

// Modals
const tutorialModal = document.getElementById('tutorialModal');
const leaderboardModal = document.getElementById('leaderboardModal');
const shopModal = document.getElementById('shopModal');
const eventModal = document.getElementById('eventModal');
const unlocksModal = document.getElementById('unlocksModal');
const giveUpModal = document.getElementById('giveUpModal'); // Give Up Modal

// Modal Elements
const shopGoldAmount = document.getElementById('shopGoldAmount');
const shopItems = document.getElementById('shopItems');
const eventTitle = document.getElementById('eventTitle');
const eventText = document.getElementById('eventText');
const eventChoices = document.getElementById('eventChoices');
const btnCancelGiveUp = document.getElementById('btnCancelGiveUp'); // Give Up Modal Buttons
const btnConfirmGiveUp = document.getElementById('btnConfirmGiveUp');

// Close Modals
document.getElementById('btnCloseTutorial').onclick = () => tutorialModal.classList.remove('active');
document.getElementById('btnCloseLeaderboard').onclick = () => leaderboardModal.classList.remove('active');
document.getElementById('btnCloseShop').onclick = () => closeShop(); // Use wrapper
document.getElementById('btnCloseUnlocks').onclick = () => unlocksModal.classList.remove('active');
document.getElementById('btnCloseAchievements').onclick = () => achievementsModal.classList.remove('active');

// Open Achievements in CODEX (unified)
achievementsCompact.onclick = () => {
    openCodex('achievements');
};

// ============================================
// INTERACTIVE TUTORIAL SYSTEM
// ============================================
let tutorialStep = 0;
const tutorialSteps = [
    {
        title: "🎴 Welcome to Dungeon Scoundrel!",
        content: `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: #ffd700; margin-bottom: 20px;">Your Quest Begins!</h3>
                <p style="font-size: 1.1em; line-height: 1.8; margin-bottom: 20px;">
                    You are a <strong>scoundrel</strong> exploring dark medieval dungeons filled with monsters, treasures, and ancient relics.
                </p>
                <div style="background: rgba(0,0,0,0.4); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="font-size: 1.2em; color: #6bcf7f;"><strong>🎯 Goal:</strong> Clear all 50 cards from the dungeon deck without dying!</p>
                </div>
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Crect fill='%232c2416' width='200' height='100'/%3E%3Ctext x='100' y='55' text-anchor='middle' fill='%23d4af37' font-size='40' font-family='serif'%3E%3C/text%3E%3C/svg%3E" alt="Game Preview" style="width: 100%; max-width: 300px; margin: 20px auto; border-radius: 8px;">
            </div>
        `
    },
    {
        title: "🃏 Card Types",
        content: `
            <div style="padding: 20px;">
                <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Learn the Cards</h3>
                <div style="display: grid; gap: 20px;">
                    <div style="background: rgba(0,0,0,0.4); padding: 20px; border-left: 4px solid #ff6b6b; border-radius: 8px;">
                        <h4 style="color: #ff6b6b; margin-bottom: 10px;">♠️ ♣️ MONSTERS (Spades & Clubs)</h4>
                        <p><strong>Click to fight!</strong> Damage = Monster Value - Your Weapon Value</p>
                        <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">💡 Tip: Always have a weapon equipped before fighting!</p>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); padding: 20px; border-left: 4px solid #ffd93d; border-radius: 8px;">
                        <h4 style="color: #ffd93d; margin-bottom: 10px;">♦️ WEAPONS (Diamonds)</h4>
                        <p><strong>Click to equip!</strong> Replaces your current weapon</p>
                        <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">⚠️ Warning: Equipping breaks your combo!</p>
                    </div>
                    <div style="background: rgba(0,0,0,0.4); padding: 20px; border-left: 4px solid #6bcf7f; border-radius: 8px;">
                        <h4 style="color: #6bcf7f; margin-bottom: 10px;">♥️ POTIONS (Hearts)</h4>
                        <p><strong>Click to heal!</strong> Limit: 1 per room</p>
                        <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">💊 Potions DON'T break combo!</p>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: "📌 Hold System",
        content: `
            <div style="padding: 20px;">
                <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Save Cards for Later</h3>
                <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px; text-align: center;">
                    <p style="font-size: 1.2em; margin-bottom: 20px;"><strong>Right-click</strong> or <strong>tap & hold</strong> cards to save them!</p>
                    <div style="margin: 20px 0; padding: 20px; background: rgba(255, 215, 0, 0.1); border: 2px solid #ffd700; border-radius: 8px;">
                        <p style="color: #ffd700; font-size: 1.1em; margin-bottom: 10px;"><strong>✅ CAN HOLD:</strong></p>
                        <p>Weapons ⚔️ | Potions 💊 | Specials ✨</p>
                    </div>
                    <div style="margin: 20px 0; padding: 20px; background: rgba(255, 107, 107, 0.1); border: 2px solid #ff6b6b; border-radius: 8px;">
                        <p style="color: #ff6b6b; font-size: 1.1em; margin-bottom: 10px;"><strong>❌ CANNOT HOLD:</strong></p>
                        <p>Monsters 👹 (must fight immediately!)</p>
                    </div>
                    <p style="margin-top: 20px; color: #aaa;">💡 Strategy: Hold potions for emergencies or weapons for later!</p>
                </div>
            </div>
        `
    },
    {
        title: "🔥 Combo System",
        content: `
            <div style="padding: 20px;">
                <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Build Epic Combos!</h3>
                <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px;">
                    <p style="font-size: 1.1em; text-align: center; margin-bottom: 20px;">Kill monsters without taking damage to build combos!</p>
                    <div style="display: grid; gap: 15px; margin: 20px 0;">
                        <div style="padding: 15px; background: rgba(107, 207, 127, 0.1); border-left: 4px solid #6bcf7f; border-radius: 8px;">
                            <strong style="color: #6bcf7f;">✅ COMBO INCREASES:</strong>
                            <p style="margin-top: 8px;">Perfect kills (no damage taken)</p>
                        </div>
                        <div style="padding: 15px; background: rgba(255, 107, 107, 0.1); border-left: 4px solid #ff6b6b; border-radius: 8px;">
                            <strong style="color: #ff6b6b;">❌ COMBO BREAKS:</strong>
                            <p style="margin-top: 8px;">Taking damage OR equipping a weapon</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 20px; padding: 20px; background: rgba(255, 215, 0, 0.1); border-radius: 8px;">
                        <p style="font-size: 0.9em; color: #ffd93d;"><strong>Rewards:</strong></p>
                        <p style="margin-top: 10px;">5x = GREAT! | 7x = AMAZING! | 10x = LEGENDARY!</p>
                        <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">Max combo × 10 = bonus points!</p>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: "👹 Boss Battles",
        content: `
            <div style="padding: 20px;">
                <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Face the Bosses!</h3>
                <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px;">
                    <p style="font-size: 1.2em; text-align: center; margin-bottom: 20px; color: #ff6b6b;"><strong>Every 10th room = BOSS ROOM!</strong></p>
                    <div style="margin: 20px 0;">
                        <p style="margin-bottom: 10px;">• Bosses have <strong>15 HP</strong></p>
                        <p style="margin-bottom: 10px;">• Requires multiple hits to defeat</p>
                        <p style="margin-bottom: 10px;">• HP bar shows boss health</p>
                    </div>
                    <div style="margin: 30px 0; padding: 20px; background: rgba(255, 107, 107, 0.2); border: 2px solid #ff6b6b; border-radius: 8px;">
                        <h4 style="color: #ff6b6b; margin-bottom: 15px; text-align: center;">⚠️ CRITICAL WARNING!</h4>
                        <p style="text-align: center; font-size: 1.1em;"><strong>Fight boss WITHOUT weapon:</strong></p>
                        <p style="text-align: center; margin-top: 10px;">• Boss attacks once (15 HP damage!)</p>
                        <p style="text-align: center;">• Boss FLEES immediately</p>
                        <p style="text-align: center;">• <strong style="color: #ff6b6b;">NO GOLD REWARD!</strong></p>
                    </div>
                    <p style="text-align: center; color: #ffd93d; font-size: 1.1em; margin-top: 20px;">💡 Always have a weapon before room 10, 20, 30...</p>
                </div>
            </div>
        `
    },
    {
        title: "💰 Shop & Economy",
        content: `
            <div style="padding: 20px;">
                <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Spend Wisely!</h3>
                <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px;">
                    <p style="text-align: center; font-size: 1.1em; margin-bottom: 20px;">Click 🏺 MERCHANT button to open shop</p>
                    <div style="margin: 20px 0; padding: 20px; background: rgba(78, 205, 196, 0.1); border: 2px solid #4ecdc4; border-radius: 8px;">
                        <h4 style="color: #4ecdc4; margin-bottom: 15px; text-align: center;">💎 Shop Features:</h4>
                        <p>• Buy healing potions</p>
                        <p>• Upgrade weapons</p>
                        <p>• Purchase relics (4 rarities)</p>
                        <p>• Increase max HP</p>
                    </div>
                    <div style="margin: 20px 0; padding: 20px; background: rgba(255, 107, 107, 0.2); border: 2px solid #ff6b6b; border-radius: 8px;">
                        <h4 style="color: #ff6b6b; margin-bottom: 15px; text-align: center;">⚠️ Shop Penalties:</h4>
                        <p style="text-align: center;">• Each visit = <strong>-50 score points</strong></p>
                        <p style="text-align: center; margin-top: 10px;">• Prices increase <strong>15%</strong> per purchase (anti-exploit!)</p>
                    </div>
                    <p style="text-align: center; color: #ffd93d; margin-top: 20px;">💡 Use shop strategically to maximize score!</p>
                </div>
            </div>
        `
    },
    {
        title: "🏆 Score System",
        content: `
            <div style="padding: 20px;">
                <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">How Scoring Works</h3>
                <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px; font-size: 0.95em;">
                    <div style="margin-bottom: 20px; padding: 15px; background: rgba(107, 207, 127, 0.1); border-radius: 8px;">
                        <h4 style="color: #6bcf7f; margin-bottom: 10px;">✅ BONUSES:</h4>
                        <p>🎯 Win: +1000</p>
                        <p>❤️ Health: HP × 20</p>
                        <p>💰 Gold: Total × 5</p>
                        <p>🔥 Combo: Max × 10</p>
                        <p>⚔️ Monsters: Slain × 2</p>
                        <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(107, 207, 127, 0.3);">
                            ⚡ <strong>Speedrun:</strong> +1000 (&lt;1min) or +500 (1-5min)<br>
                            🏆 <strong>Perfect Run:</strong> +1000 (no damage!)
                        </p>
                    </div>
                    <div style="margin-bottom: 20px; padding: 15px; background: rgba(255, 107, 107, 0.1); border-radius: 8px;">
                        <h4 style="color: #ff6b6b; margin-bottom: 10px;">❌ PENALTIES:</h4>
                        <p>⏱️ Time: -2 per second</p>
                        <p>🏺 Shop: -50 per visit</p>
                    </div>
                    <div style="text-align: center; padding: 15px; background: rgba(255, 215, 0, 0.1); border-radius: 8px;">
                        <p style="color: #ffd93d;"><strong>Difficulty Multiplier:</strong></p>
                        <p>Easy × 1 | Normal × 1.5 | Hard × 2.5</p>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: "⌨️ Keyboard Shortcuts",
        content: `
            <div style="padding: 20px;">
                <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Master the Keyboard!</h3>
                <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px;">
                    <p style="text-align: center; font-size: 1.1em; margin-bottom: 25px; color: #6bcf7f;">
                        <strong>🖥️ Desktop players can use keyboard shortcuts for faster gameplay!</strong>
                    </p>
                    
                    <div style="display: grid; gap: 12px; margin: 20px 0;">
                        <div style="padding: 12px 20px; background: rgba(102, 126, 234, 0.15); border-left: 4px solid #667eea; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffd93d;"><strong>Space</strong> or <strong>D</strong></span>
                            <span style="color: #ddd;">→ Draw Room</span>
                        </div>
                        
                        <div style="padding: 12px 20px; background: rgba(102, 126, 234, 0.15); border-left: 4px solid #667eea; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffd93d;"><strong>A</strong></span>
                            <span style="color: #ddd;">→ Avoid Room</span>
                        </div>
                        
                        <div style="padding: 12px 20px; background: rgba(102, 126, 234, 0.15); border-left: 4px solid #667eea; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffd93d;"><strong>Q</strong></span>
                            <span style="color: #ddd;">→ Use Class Ability</span>
                        </div>
                        
                        <div style="padding: 12px 20px; background: rgba(102, 126, 234, 0.15); border-left: 4px solid #667eea; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffd93d;"><strong>U</strong></span>
                            <span style="color: #ddd;">→ Undo Last Move</span>
                        </div>
                        
                        <div style="padding: 12px 20px; background: rgba(102, 126, 234, 0.15); border-left: 4px solid #667eea; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffd93d;"><strong>S</strong></span>
                            <span style="color: #ddd;">→ Open Shop</span>
                        </div>
                        
                        <div style="padding: 12px 20px; background: rgba(107, 207, 127, 0.15); border-left: 4px solid #6bcf7f; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffd93d;"><strong>1, 2, 3, 4, 5</strong></span>
                            <span style="color: #ddd;">→ Click cards in room</span>
                        </div>
                        
                        <div style="padding: 12px 20px; background: rgba(255, 107, 107, 0.15); border-left: 4px solid #ff6b6b; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #ffd93d;"><strong>ESC</strong></span>
                            <span style="color: #ddd;">→ Close any modal</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px; padding: 20px; background: rgba(255, 215, 0, 0.1); border: 2px solid #ffd700; border-radius: 8px; text-align: center;">
                        <p style="color: #ffd93d; font-size: 1.1em; margin-bottom: 10px;"><strong>⚡ Pro Tip:</strong></p>
                        <p style="color: #ddd;">Use keyboard shortcuts to play 3x faster!</p>
                        <p style="color: #aaa; font-size: 0.9em; margin-top: 10px;">No need to move your mouse constantly!</p>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: "🎮 Ready to Play!",
        content: `
            <div style="text-align: center; padding: 40px 20px;">
                <h3 style="color: #ffd700; font-size: 2em; margin-bottom: 20px;">You're Ready!</h3>
                <p style="font-size: 1.2em; margin-bottom: 30px;">You now know everything to become a legendary scoundrel!</p>
                <div style="background: rgba(0,0,0,0.4); padding: 30px; border-radius: 8px; margin: 30px 0;">
                    <p style="font-size: 1.1em; color: #6bcf7f; margin-bottom: 15px;"><strong>Quick Recap:</strong></p>
                    <p style="margin: 10px 0;">⚔️ Fight monsters with weapons</p>
                    <p style="margin: 10px 0;">💊 Use potions wisely</p>
                    <p style="margin: 10px 0;">🔥 Build combos for bonus points</p>
                    <p style="margin: 10px 0;">👹 Always bring weapons to bosses</p>
                    <p style="margin: 10px 0;">💰 Use shop strategically</p>
                    <p style="margin: 10px 0;">⌨️ Use keyboard shortcuts for speed</p>
                </div>
                <p style="font-size: 1.3em; color: #ffd93d; margin-top: 30px;"><strong>Close this tutorial and click "⚔️ Start Quest" to begin!</strong></p>
                <p style="margin-top: 20px; color: #aaa; font-size: 0.9em;">You can always re-read the guide from the main menu.</p>
            </div>
        `
    }
];

function startInteractiveTutorial() {
    console.log('[TUTORIAL] Starting interactive tutorial...');
    tutorialStep = 0;
    updateTutorialStep();
    interactiveTutorialModal.classList.add('active');
    console.log('[TUTORIAL] Tutorial modal opened. Total steps:', tutorialSteps.length);
}

function updateTutorialStep() {
    const step = tutorialSteps[tutorialStep];
    tutorialStepTitle.textContent = step.title;
    tutorialStepContent.innerHTML = step.content;
    tutorialCurrentStep.textContent = tutorialStep + 1;
    tutorialTotalSteps.textContent = tutorialSteps.length;
    
    // Update buttons
    btnTutorialPrev.disabled = tutorialStep === 0;
    btnTutorialNext.textContent = tutorialStep === tutorialSteps.length - 1 ? '✅ Finish' : '➡️ Next';
}

btnTutorialNext.onclick = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
        tutorialStep++;
        updateTutorialStep();
    } else {
        // Finish tutorial
        interactiveTutorialModal.classList.remove('active');
    }
};

btnTutorialPrev.onclick = () => {
    if (tutorialStep > 0) {
        tutorialStep--;
        updateTutorialStep();
    }
};

btnTutorialSkip.onclick = () => {
    interactiveTutorialModal.classList.remove('active');
};

// Log module load
console.log('[HELPERS] Storage & Utility helpers loaded');