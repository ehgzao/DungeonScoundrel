// ============================================
// IMPORTS
// ============================================
import {
    HEALTH,
    GOLD,
    CARDS,
    COMBO,
    BOSS,
    DIFFICULTY,
    EVENT_CONFIG,
    POTIONS,
    RELIC_CONFIG,
    ACHIEVEMENT_CONFIG,
    UI,
    TIMING,
    SHOP_PRICES,
    SHOP_VALUES,
    CLASS_COOLDOWNS,
    KEYS,
    STORAGE_KEYS,
    GAME_MODES,
    CARD_TYPES,
    SUITS,
    LOG_TYPES,
    MESSAGE_TYPES,
    SPECIAL_CARDS,
    COMBAT,
    LUCKY_DRAW
} from './config/game-constants.js';

// Import game state module
import {
    game,
    permanentStats,
    permanentUnlocks,
    UNLOCKS
} from './modules/game-state.js';

// Import game events module
import {
    triggerRandomEvent,
    showEventModal,
    closeEventWrapper
} from './modules/game-events.js';

// Import game shop module
import {
    updateShopDisplay,
    buyItem,
    openShop,
    closeShop
} from './modules/game-shop.js';

// Import game relics module
import {
    giveRelicByRarity,
    giveRandomRelic,
    giveRareRelic,
    updateRelicsDisplay,
    getRelicBonus
} from './modules/game-relics.js';

// Import game classes module
import {
    CLASSES,
    PASSIVE_ICONS,
    checkClassUnlocks,
    getBloodlustBonus,
    useClassAbility,
    updateAbilityUI,
    startGameWithClass,
    getPassiveIcons
} from './modules/game-classes.js';

// Import game sounds module
import { playSound } from './modules/game-sounds.js';

// Import game deck module
import { 
    specialCards, 
    createDeck, 
    shuffleDeck, 
    balanceEasyModeDeck 
} from './modules/game-deck.js';

// Import game combat module
import {
    addLog,
    getBerserkBonus,
    getComboBonus,
    getCardType,
    handleSpecial,
    handleWeapon,
    handlePotion,
    handleMonster,
    saveGameState,
    undoLastMove,
    handleCardClick
} from './modules/game-combat.js';

// ============================================
// DOM ELEMENTS
// ============================================
// Welcome Screen
const welcomeScreen = document.getElementById('welcomeScreen');
const gameWrapper = document.getElementById('gameWrapper');
const btnWelcomeStart = document.getElementById('btnWelcomeStart');
const btnLearnToPlay = document.getElementById('btnLearnToPlay');
const btnWelcomeLeaderboard = document.getElementById('btnWelcomeLeaderboard');

// Modals
const newGameModal = document.getElementById('newGameModal');
const learnToPlayModal = document.getElementById('learnToPlayModal');
const shopModal = document.getElementById('shopModal');
const eventModal = document.getElementById('eventModal');
const giveUpModal = document.getElementById('giveUpModal');

// Buttons
const btnStartGameModal = document.getElementById('btnStartGameModal');
const btnStartInteractiveTutorial = document.getElementById('btnStartInteractiveTutorial');
const btnOpenRulesReference = document.getElementById('btnOpenRulesReference');
const btnDrawRoom = document.getElementById('btnDrawRoom');
const btnAvoidRoom = document.getElementById('btnAvoidRoom');
const btnOpenShop = document.getElementById('btnOpenShop');
const btnTopGiveUp = document.getElementById('btnTopGiveUp');
const btnCancelGiveUp = document.getElementById('btnCancelGiveUp');
const btnConfirmGiveUp = document.getElementById('btnConfirmGiveUp');

// Inputs
const playerNameInput = document.getElementById('playerNameInput');
const difficultySelector = document.getElementById('difficultySelector');

// Display Elements
const healthEl = document.getElementById('health');
const goldEl = document.getElementById('goldAmount');
const dungeonCountEl = document.getElementById('dungeonCount');
const statRoomsEl = document.getElementById('statRooms');
const mainScoreValue = document.getElementById('mainScoreValue');
const equippedWeaponEl = document.getElementById('equippedWeapon');
const bottomBar = document.getElementById('room'); // The room/bottom bar
const gameTimer = document.getElementById('gameTimer');
const discardPilePreview = document.getElementById('discardPilePreview');
const holdAreaContainer = document.getElementById('holdAreaContainer');

// ============================================
// GAME STATE
// ============================================
// NOTE: game, permanentStats, permanentUnlocks, UNLOCKS
// are now imported from modules/game-state.js

// ============================================
// INITIALIZATION AND SCREEN FLOW LOGIC
// ============================================

function showWelcomeScreen() {
    welcomeScreen.style.display = 'flex';
    gameWrapper.classList.remove('active');
    newGameModal.classList.remove('active');
}

function showNewGameModal() {
    newGameModal.classList.add('active');
    
    // CRITICAL: ALWAYS remove old suggestions first (prevents duplicate suggestions)
    const oldSuggestion = document.querySelector('.difficulty-suggestion');
    if (oldSuggestion) {
        oldSuggestion.remove();
    }
    
    // First-time player: Suggest Easy difficulty
    const hasPlayedBefore = localStorage.getItem(STORAGE_KEYS.PLAYED_BEFORE);
    
    if (!hasPlayedBefore) {
        
        // Select Easy by default
        difficultySelector.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        const easyBtn = difficultySelector.querySelector('.difficulty-btn[data-difficulty="easy"]');
        if (easyBtn) {
            easyBtn.classList.add('selected');
            
            // Add pulsing highlight animation
            easyBtn.style.animation = 'pulse 1.5s ease-in-out 3';
            easyBtn.style.boxShadow = '0 0 20px rgba(107, 207, 127, 0.8)';
        }
        
        // Add suggestion message BEFORE difficulty selector
        const suggestionMsg = document.createElement('div');
        suggestionMsg.className = 'difficulty-suggestion';
        suggestionMsg.style.cssText = 'position: relative; z-index: 10000; text-align: center; color: #6bcf7f; font-size: 0.95em; margin-bottom: 15px; padding: 10px 15px; background: rgba(107, 207, 127, 0.15); border-radius: 8px; border: 2px solid rgba(107, 207, 127, 0.4); box-shadow: 0 4px 12px rgba(107, 207, 127, 0.3);';
        suggestionMsg.innerHTML = '<strong>First time?</strong> We recommend starting on <strong>Easy</strong> to learn the mechanics!<br><small style="color: #aaa;">(You can choose any difficulty)</small>';
        
        // Insert BEFORE the difficulty selector
        difficultySelector.parentElement.insertBefore(suggestionMsg, difficultySelector);
    }
}

function showGameUI() {
    welcomeScreen.style.display = 'none';
    newGameModal.classList.remove('active');
    gameWrapper.classList.add('active');
}

// Welcome Screen Hooks
btnWelcomeStart.onclick = showNewGameModal;
btnLearnToPlay.onclick = () => {
    learnToPlayModal.classList.add('active');
};
btnWelcomeLeaderboard.onclick = showLeaderboard;
// btnWelcomeUnlocks.onclick removed - now handled by codex.js

// Music Chamber Hook
const btnWelcomeSoundboard = document.getElementById('btnWelcomeSoundboard');
const btnCloseSoundboard = document.getElementById('btnCloseSoundboard');

if (btnWelcomeSoundboard) {
    btnWelcomeSoundboard.onclick = () => {
        const soundboardModal = document.getElementById('soundboardModal');
        if (soundboardModal) soundboardModal.classList.add('active');
    };
}

if (btnCloseSoundboard) {
    btnCloseSoundboard.onclick = () => {
        const soundboardModal = document.getElementById('soundboardModal');
        if (soundboardModal) soundboardModal.classList.remove('active');
    };
}

// Music Player Controls
const btnWelcomeMusicToggle = document.getElementById('btnWelcomeMusicToggle');
const welcomeMusicVolume = document.getElementById('welcomeMusicVolume');

if (btnWelcomeMusicToggle && typeof music !== 'undefined') {
    btnWelcomeMusicToggle.onclick = () => {
        if (music.isPlaying) {
            music.stop();
            btnWelcomeMusicToggle.textContent = '▶️';
        } else {
            music.start();
            btnWelcomeMusicToggle.textContent = '⏸️';
        }
    };
}

if (welcomeMusicVolume && typeof music !== 'undefined') {
    welcomeMusicVolume.oninput = (e) => {
        const volume = parseInt(e.target.value);
        music.setVolume(volume);
    };
}

// In-game Music Controls
const btnMusicToggle = document.getElementById('btnMusicToggle');
const musicVolume = document.getElementById('musicVolume');

if (btnMusicToggle && typeof music !== 'undefined') {
    btnMusicToggle.onclick = () => {
        if (music.isPlaying) {
            music.stop();
            btnMusicToggle.textContent = '▶️';
        } else {
            music.start();
            btnMusicToggle.textContent = '⏸️';
        }
    };
}

if (musicVolume && typeof music !== 'undefined') {
    musicVolume.oninput = (e) => {
        const volume = parseInt(e.target.value);
        music.setVolume(volume);
    };
}

// Soundboard Play Buttons
const btnPlayMenu = document.getElementById('btnPlayMenu');
const btnPlayGameplay = document.getElementById('btnPlayGameplay');
const btnPlayShop = document.getElementById('btnPlayShop');
const btnPlayVictory = document.getElementById('btnPlayVictory');
const btnPlayDefeat = document.getElementById('btnPlayDefeat');

if (btnPlayMenu && typeof music !== 'undefined') {
    btnPlayMenu.onclick = () => {
        music.stop();
        music.currentContext = 'menu';
        music.start();
    };
}

if (btnPlayGameplay && typeof music !== 'undefined') {
    btnPlayGameplay.onclick = () => {
        music.stop();
        music.currentContext = 'gameplay';
        music.start();
    };
}

if (btnPlayShop && typeof music !== 'undefined') {
    btnPlayShop.onclick = () => {
        music.stop();
        music.currentContext = 'shop';
        music.start();
    };
}

if (btnPlayVictory && typeof music !== 'undefined') {
    btnPlayVictory.onclick = () => {
        music.stop();
        music.currentContext = 'victory';
        music.start();
    };
}

if (btnPlayDefeat && typeof music !== 'undefined') {
    btnPlayDefeat.onclick = () => {
        music.stop();
        music.currentContext = 'defeat';
        music.start();
    };
}

// Learn to Play Modal Hooks
btnStartInteractiveTutorial.onclick = () => {
    learnToPlayModal.classList.remove('active');
    startInteractiveTutorial();
};
btnOpenRulesReference.onclick = () => {
    learnToPlayModal.classList.remove('active');
    showTutorial();
};

// Soundboard will be hooked later after music is created

// New Game Modal Hooks
const nameError = document.getElementById('nameError');

// Sanitize player name input (XSS prevention)
function sanitizePlayerName(input) {
    return input
        .trim()
        .replace(/[<>'"&]/g, '') // Remove dangerous chars
        .replace(/\s+/g, ' ')     // Collapse multiple spaces
        .substring(0, 10);         // Max 10 chars
}

// Clear error on input
playerNameInput.oninput = () => {
    nameError.style.display = 'none';
    playerNameInput.style.borderColor = '#667eea';
};

btnStartGameModal.onclick = () => {
    const name = sanitizePlayerName(playerNameInput.value);
    
    if (name.length < 3) {
        nameError.textContent = '❌ Name must have at least 3 characters!';
        nameError.style.display = 'block';
        playerNameInput.style.borderColor = '#ff6b6b';
        playerNameInput.focus();
        return;
    }
    if (name.length > 10) {
        nameError.textContent = '❌ Name must have maximum 10 characters!';
        nameError.style.display = 'block';
        playerNameInput.style.borderColor = '#ff6b6b';
        playerNameInput.focus();
        return;
    }
    
    // Update input with sanitized value
    playerNameInput.value = name;
    
    // Open class selection instead of starting game directly
    showClassSelection();
};
btnCancelStart.onclick = () => {
    newGameModal.classList.remove('active');
    nameError.style.display = 'none';
    playerNameInput.style.borderColor = '#667eea';
};

// ============================================
// CLASS SELECTION SYSTEM
// ============================================
const classSelectionModal = document.getElementById('classSelectionModal');
const classCards = document.querySelectorAll('.class-card');
const classDescription = document.getElementById('classDescription');
const classDescTitle = document.getElementById('classDescTitle');
const classDescMotivation = document.getElementById('classDescMotivation');
const classDescMechanics = document.getElementById('classDescMechanics');
const btnConfirmClass = document.getElementById('btnConfirmClass');
const btnCancelClass = document.getElementById('btnCancelClass');
const classSelectionTitle = document.getElementById('classSelectionTitle');
const classSelectionSubtitle = document.getElementById('classSelectionSubtitle');

let selectedClass = null;

// NOTE: CLASSES and checkClassUnlocks moved to modules/game-classes.js

function showClassSelection() {
    newGameModal.classList.remove('active');
    classSelectionModal.classList.add('active');
    selectedClass = null;
    btnConfirmClass.disabled = true;
    classDescription.style.display = 'none';
    classSelectionTitle.textContent = 'SELECT YOUR HERO';
    classSelectionSubtitle.textContent = '';
    
    // Check unlocks before showing
    checkClassUnlocks();
    
    // Reset all class cards and apply lock states
    classCards.forEach(card => {
        const className = card.dataset.class;
        const classData = CLASSES[className];
        const isLocked = !classData.unlocked;
        
        card.classList.remove('selected');
        card.style.borderColor = '#5a4a38';
        card.style.transform = 'translateY(0)';
        
        // Apply locked visual state
        if (isLocked) {
            card.style.opacity = '0.4';
            card.style.filter = 'grayscale(80%)';
            card.style.cursor = 'not-allowed';
            
            // Add lock icon overlay
            if (!card.querySelector('.lock-overlay')) {
                const lockOverlay = document.createElement('div');
                lockOverlay.className = 'lock-overlay';
                lockOverlay.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 3em;
                    z-index: 10;
                    pointer-events: none;
                `;
                lockOverlay.textContent = '🔒';
                card.style.position = 'relative';
                card.appendChild(lockOverlay);
            }
        } else {
            card.style.opacity = '1';
            card.style.filter = 'none';
            card.style.cursor = 'pointer';
            
            // Remove lock overlay if exists
            const lockOverlay = card.querySelector('.lock-overlay');
            if (lockOverlay) {
                lockOverlay.remove();
            }
        }
    });
}

// Class card click handlers
classCards.forEach(card => {
    card.onclick = () => {
        const className = card.dataset.class;
        const classData = CLASSES[className];
        
        // Check if locked
        if (!classData.unlocked) {
            // Show lock message
            classSelectionTitle.textContent = classData.name + ' 🔒';
            classSelectionSubtitle.textContent = 'LOCKED';
            classDescTitle.textContent = classData.name + ' (LOCKED)';
            classDescMotivation.textContent = '';
            classDescMechanics.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 3em; margin-bottom: 15px;">🔒</div>
                    <div style="color: #ff6b6b; font-weight: bold; font-size: 1.2em; margin-bottom: 10px;">
                        CLASS LOCKED
                    </div>
                    <div style="color: #ffd93d; font-size: 1.1em;">
                        ${classData.unlockRequirement}
                    </div>
                </div>
            `;
            classDescription.style.display = 'block';
            btnConfirmClass.disabled = true;
            playSound('error');
            return;
        }
        
        selectedClass = className;
        
        // Update UI
        classCards.forEach(c => {
            c.classList.remove('selected');
            if (CLASSES[c.dataset.class].unlocked) {
                c.style.borderColor = '#5a4a38';
            }
        });
        card.classList.add('selected');
        card.style.borderColor = '#c9a961';
        card.style.transform = 'translateY(-5px)';
        
        // Show description
        classSelectionTitle.textContent = classData.name;
        classSelectionSubtitle.textContent = 'Your chosen hero';
        classDescTitle.textContent = classData.name;
        classDescMotivation.textContent = classData.motivation;
        classDescMechanics.innerHTML = classData.mechanics;
        classDescription.style.display = 'block';
        
        btnConfirmClass.disabled = false;
        playSound('cardFlip');
    };
});

btnConfirmClass.onclick = () => {
    if (!selectedClass) return;
    classSelectionModal.classList.remove('active');
    startGameWithClass(selectedClass);
};

btnCancelClass.onclick = () => {
    classSelectionModal.classList.remove('active');
    newGameModal.classList.add('active');
};

// NOTE: startGameWithClass moved to modules/game-classes.js

// FIXED HOOK: Difficulty Selector
difficultySelector.addEventListener('click', (e) => {
    const target = e.target.closest('.difficulty-btn');
    if (!target) return;
    
    // Remove 'selected' class from all
    difficultySelector.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add 'selected' class to the clicked one
    target.classList.add('selected');
});

// Top Bar Hooks
// btnTopTutorial removed - only in main menu
// btnTopLeaderboard removed - only in main menu
// btnTopUnlocks removed - replaced by CODEX system
btnOpenShop.onclick = openShop;

// Give Up Hooks (ROBUST VERSION)
if (btnTopGiveUp && giveUpModal && btnCancelGiveUp && btnConfirmGiveUp) {
    btnTopGiveUp.addEventListener('click', function() {
        if (game.gameOver || game.gameStartTime === 0) {
            showMessage('⚠️ Start a game first!', 'warning');
            return;
        }
        giveUpModal.classList.add('active');
    });
    
    btnCancelGiveUp.addEventListener('click', function() {
        giveUpModal.classList.remove('active');
    });
    
    btnConfirmGiveUp.addEventListener('click', function() {
        giveUpModal.classList.remove('active');
        endGame('death', true); // true = gave up
    });
    
} else {
    console.error('❌ Give Up elements not found:', {
        btnTopGiveUp: !!btnTopGiveUp,
        giveUpModal: !!giveUpModal,
        btnCancelGiveUp: !!btnCancelGiveUp,
        btnConfirmGiveUp: !!btnConfirmGiveUp
    });
}

// FIXED HOOKS: Action Buttons
btnDrawRoom.onclick = drawRoom;
btnAvoidRoom.onclick = avoidRoom;

// Undo Button Hook
const btnUndo = document.getElementById('btnUndo');
if (btnUndo) {
    btnUndo.onclick = undoLastMove;
}

// Class Ability Button Hook
const btnClassAbility = document.getElementById('btnClassAbility');
if (btnClassAbility) {
    btnClassAbility.onclick = useClassAbility;
}

// ============================================
// KEYBOARD SHORTCUTS (Desktop Optimization)
// ============================================
document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    // TUTORIAL MODE - Block all shortcuts except Space, Arrows, ESC
    if (inGameTutorialActive) {
        const allowedKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'];
        
        // ESC during tutorial - Show skip confirmation
        if (e.key === KEYS.ESCAPE) {
            e.preventDefault();
            const skipBtn = document.getElementById('tutorialSkip');
            if (skipBtn) {
                skipBtn.click();
            }
            return;
        }
        
        // Block all other keys during tutorial
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
            return;
        }
        
        // Allow Space/Arrows to work on tutorial buttons
        return;
    }
    
    // Ignore if modal is open (except ESC)
    const modalOpen = document.querySelector('.modal-overlay.active');
    if (modalOpen && e.key !== KEYS.ESCAPE) return;
    
    // ESC - Close modals
    if (e.key === KEYS.ESCAPE) {
        const modal = document.querySelector('.modal-overlay.active');
        if (modal) {
            modal.classList.remove('active');
            playSound('cardFlip');
            return;
        }
    }
    
    // Only in-game shortcuts below
    if (!gameWrapper.classList.contains('active') || game.gameOver) return;
    
    switch(e.key.toLowerCase()) {
        case ' ': // Space - Draw Room
        case KEYS.DRAW:
            e.preventDefault();
            if (!btnDrawRoom.disabled) {
                btnDrawRoom.click();
            }
            break;
            
        case KEYS.AVOID: // A - Avoid Room
            e.preventDefault();
            if (!btnAvoidRoom.disabled) {
                btnAvoidRoom.click();
            }
            break;
            
        case KEYS.ABILITY: // Q - Class Ability
            e.preventDefault();
            if (btnClassAbility && !btnClassAbility.disabled) {
                btnClassAbility.click();
            }
            break;
            
        case KEYS.UNDO: // U - Undo
            e.preventDefault();
            const btnUndoKey = document.getElementById('btnUndo');
            if (btnUndoKey && !btnUndoKey.disabled) {
                btnUndoKey.click();
            }
            break;
            
        case KEYS.SHOP: // S - Shop
            e.preventDefault();
            if (btnOpenShop && !btnOpenShop.disabled) {
                btnOpenShop.click();
            }
            break;
            
        case KEYS.CARD_1:
        case KEYS.CARD_2:
        case KEYS.CARD_3:
        case KEYS.CARD_4:
        case KEYS.CARD_5:
            e.preventDefault();
            const cardIndex = parseInt(e.key) - 1;
            const cards = bottomBar.querySelectorAll('.card');
            if (cards[cardIndex]) {
                cards[cardIndex].click();
            }
            break;
    }
});


// ============================================
// ALL GAME CODE (STARTGAME, HANDLECLICK, ETC)
// ============================================

// Game State (minimum re-declaration)
game.stats = {
    monstersSlain: 0,
    totalDamage: 0,
    totalHealing: 0,
    roomsCleared: 0,
    weaponsEquipped: 0,
    potionsUsed: 0,
    maxCombo: 0,
    specialsUsed: 0,
    cardsHeld: 0,
    roomsAvoided: 0,
    gamesWon: 0,
    hardWins: 0,
    minimalistWin: false,
    onePunch: false,
    musicWasOn: false
};

// NOTE: specialCards moved to modules/game-deck.js

// Card suits and values
const suits = {'♠': 'spades', '♣': 'clubs', '♥': 'hearts', '♦': 'diamonds'};
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];

// ===== 50 ACHIEVEMENTS SYSTEM =====

// ===== SOUND EFFECTS SYSTEM =====
// NOTE: soundEffects and playSound moved to modules/game-sounds.js

// ============================================
// NOTE: CLASS ABILITIES moved to modules/game-classes.js
// useClassAbility, useKnightAbility, useRogueAbility, useDancerAbility,
// useBerserkerAbility, usePriestAbility, updateAbilityUI
// ============================================

// Tooltip Generation
function generateTooltip(card) {
    const type = getCardType(card);
    
    // Obliterate mode
    if (game.obliterateMode) {
        return `<span class="tooltip-negative">💥 OBLITERATE: Remove this card permanently!</span>`;
    }
    
    // Boss special tooltip
    if (card.isBoss) {
        const bossName = card.bossName || 'Boss';
        return `<span class="tooltip-negative">👹 <strong>${bossName}</strong> - ${card.numValue}/${card.maxHP || card.numValue} HP<br>${card.bossFlavor || 'Defeat this boss to continue!'}</span>`;
    }
    
    const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
    
    if (type === 'monster') {
        const baseWeapon = game.equippedWeapon?.numValue || 0;
        const berserkBonus = getBerserkBonus();
        
        // Add class ability bonuses (CRITICAL: only if weapon equipped, same as handleMonster)
        let classBonus = 0;
        if (game.equippedWeapon && game.classAbilityActive && game.classAbilityCounter > 0) {
            if (game.playerClass === 'dancer') {
                classBonus = COMBAT.DANCER_DAMAGE_BONUS;
            }
        }
        
        const bloodlustBonus = getBloodlustBonus();
        const comboBonus = getComboBonus();
        
        const totalWeapon = baseWeapon + powerBonus + berserkBonus + classBonus + bloodlustBonus + comboBonus;
        let effectiveWeapon = game.doubleDamage ? totalWeapon * 2 : totalWeapon;
        
        // Rogue Shadow Strike (2x) - CRITICAL: only if weapon equipped
        if (game.equippedWeapon && game.classAbilityActive && game.classAbilityCounter > 0 && game.playerClass === 'rogue') {
            effectiveWeapon *= 2;
        }
        
        // Berserker Rage Strike (3x) - CRITICAL: only if weapon equipped
        if (game.equippedWeapon && game.rageStrikeActive && game.classAbilityCounter > 0) {
            effectiveWeapon *= 3;
        }

        if (baseWeapon === 0) {
            return `<span class="tooltip-negative">⚠️ No weapon! Damage: -${card.numValue} HP</span>`;
        }
        
        let actualDamage = card.numValue - effectiveWeapon;
        
        // Add info about active buffs
        let buffInfo = '';
        if (game.berserkStacks > 0) buffInfo += `🔥+${berserkBonus} `;
        if (comboBonus > 0) buffInfo += `🔥🔥+${comboBonus} `;
        if (game.doubleDamage) buffInfo += `⚡2x `;
        if (game.mirrorShield > 0) buffInfo += `🪞${game.mirrorShield} `;
        if (classBonus > 0) buffInfo += `💃+${classBonus} `;
        if (bloodlustBonus > 0) buffInfo += `💢+${bloodlustBonus} `;
        if (game.equippedWeapon && game.classAbilityActive && game.classAbilityCounter > 0 && game.playerClass === 'rogue') buffInfo += `🔪2x `;
        if (game.equippedWeapon && game.rageStrikeActive && game.classAbilityCounter > 0) buffInfo += `⚔️3x `;
        
        if (game.dodgeActive) return `<span class="tooltip-positive">🛡️ Dodge: No damage! ${buffInfo}</span>`;
        
        if (game.mirrorShield > 0 && actualDamage > 0) {
            const reflected = Math.min(actualDamage, game.mirrorShield);
            const remaining = actualDamage - reflected;
            if (remaining <= 0) {
                return `<span class="tooltip-positive">🪞 Mirror blocks all! ${buffInfo}</span>`;
            } else {
                return `<span class="tooltip-warning">🪞 Mirror -${reflected}, Take -${remaining} ${buffInfo}</span>`;
            }
        }
        
        if (actualDamage > 0) return `<span class="tooltip-negative">⚔️ Fight: -${actualDamage} HP ${buffInfo}</span>`;
        else return `<span class="tooltip-positive">⚔️ Perfect! No damage! ${buffInfo}</span>`;
        
    } else if (type === 'weapon') {
        const current = (game.equippedWeapon?.numValue || 0) + powerBonus;
        const cardValue = card.numValue + powerBonus;

        if (cardValue > current) return `<span class="tooltip-positive">⬆️ Better Weapon! (${current} → ${cardValue})</span>`;
        else if (cardValue < current) return `<span class="tooltip-negative">⬇️ Worse Weapon (${current} → ${cardValue})</span>`;
        else return `<span class="tooltip-neutral">↔️ Same Weapon (${cardValue})</span>`;
        
    } else if (type === 'potion') {
        const maxPotions = (game.classData && game.classData.passive.maxPotionsPerRoom) || 1;
        if (game.potionsUsed >= maxPotions) {
            return `<span class="tooltip-negative">❌ Potion limit reached (${maxPotions}/${maxPotions})</span>`;
        }
        
        const healBonus = getRelicBonus('healBonus');
        const classHealBonus = (game.classData && game.classData.passive.potionHealBonus) || 0;
        const totalHealBonus = healBonus + classHealBonus;
        const heal = Math.min(card.numValue + totalHealBonus, game.maxHealth - game.health);

        if (heal > 0) {
            let bonusText = totalHealBonus > 0 ? ` (+${totalHealBonus} bonus)` : '';
            return `<span class="tooltip-positive">💚 Heal: +${heal} HP${bonusText}</span>`;
        } else {
            return `<span class="tooltip-neutral">💚 HP Full</span>`;
        }
        
    } else if (card.special) {
        return `<span class="tooltip-positive">✨ ${card.special.description}</span>`;
    }
    return '';
}

// ===== ACHIEVEMENT SYSTEM =====
function checkAchievements() {
    // Check achievements in real-time during gameplay
    checkAllAchievements();
    
    // Check in-game achievements that can't be checked via lifetime stats
    const unlocked = loadAchievements();
    
    // Collector - 3 relics in single run
    if (game.relics.length >= 3 && !unlocked.includes('collector')) {
        unlockAchievement('collector');
    }
    
    // Relic Hunter - 5 relics in single run
    if (game.relics.length >= 5 && !unlocked.includes('relic_hunter')) {
        unlockAchievement('relic_hunter');
    }
}

// NOTE: addLog moved to modules/game-combat.js

// Helper: Reset combo with unlocks
function resetCombo() {
    if (permanentUnlocks.comboGod) game.combo = 2;
    else if (permanentUnlocks.comboMaster) game.combo = 1;
    else game.combo = 0;
}

// NOTE: getBerserkBonus, getComboBonus moved to modules/game-combat.js
// NOTE: getBloodlustBonus moved to modules/game-classes.js
// NOTE: createDeck, shuffleDeck, balanceEasyModeDeck moved to modules/game-deck.js

function startGame() {
    // Mark that player has played before (for first-time Easy suggestion)
    localStorage.setItem(STORAGE_KEYS.PLAYED_BEFORE, 'true');
    
    // 1. Load Stats and Unlocks
    loadPermanentStats();
    loadUnlocks();
    
    // 2. Configure Game State
    game.difficulty = document.querySelector('.difficulty-btn.selected').dataset.difficulty;
    const healthMap = { easy: 20, normal: 15, hard: 10, endless: 15 };
    let startHealthBonus = permanentUnlocks.startHealth ? 5 : 0;

    game.maxHealth = healthMap[game.difficulty] + startHealthBonus;
    
    // Apply class passives
    if (game.classData && game.classData.passive) {
        // Knight: +5 Max HP
        if (game.classData.passive.maxHpBonus) {
            game.maxHealth += game.classData.passive.maxHpBonus;
        }
        // Priest: +2 Max HP (starting bonus)
        if (game.classData.passive.startMaxHpBonus) {
            game.maxHealth += game.classData.passive.startMaxHpBonus;
        }
    }
    
    // Rope relic: +1 starting HP
    if (game.relics.some(r => r.id === 'rope')) {
        game.maxHealth += 1;
    }
    
    game.health = game.maxHealth;
    
    // Update player info display
    if (game.playerClass) {
        const playerAvatar = document.getElementById('playerAvatar');
        const playerNameDisplay = document.getElementById('playerNameDisplay');
        const playerClassDisplay = document.getElementById('playerClassDisplay');
        
        if (playerAvatar) playerAvatar.src = `assets/images/avatar-${game.playerClass}.webp`;
        if (playerNameDisplay) playerNameDisplay.textContent = sanitizePlayerName(playerNameInput.value);
        if (playerClassDisplay) playerClassDisplay.textContent = game.classData.name;
        
        // Update ability button (only if class has an active ability)
        if (game.classData.active) {
            const abilityIcon = document.getElementById('abilityIcon');
            const abilityName = document.getElementById('abilityName');
            const abilityDescription = document.getElementById('abilityDescription');
            
            if (abilityIcon) abilityIcon.textContent = game.classData.active.icon;
            if (abilityName) abilityName.textContent = game.classData.active.name;
            if (abilityDescription) abilityDescription.textContent = game.classData.active.description;
        }
        
        // Show passive icons (using PASSIVE_ICONS from game-classes.js module)
        const passiveIconsDisplay = document.getElementById('passiveIconsDisplay');
        if (!passiveIconsDisplay) {
            console.warn('[GAME] passiveIconsDisplay element not found');
        } else {
            passiveIconsDisplay.innerHTML = '';
            const icons = PASSIVE_ICONS[game.playerClass] || [];
            icons.forEach(passive => {
                const iconEl = document.createElement('div');
                iconEl.style.cssText = 'background: rgba(0,0,0,0.5); border: 1px solid #5a4a38; border-radius: 6px; padding: 4px 8px; font-size: 0.7em; display: flex; align-items: center; gap: 4px; color: #ffd700;';
                iconEl.title = passive.title;
                iconEl.innerHTML = `<span>${passive.icon}</span><span style="color: #c9a961;">${passive.text}</span>`;
                passiveIconsDisplay.appendChild(iconEl);
            });
        }
    }
    
    game.deck = createDeck();
    game.dungeon = [...game.deck];
    game.room = [];
    game.discardPile = [];
    game.equippedWeapon = null;
    game.heldCard = null;
    game.potionsUsed = 0;
    game.gameOver = false;
    game.score = 0;
    resetCombo();
    game.dodgeActive = false;
    game.doubleDamage = false;
    game.berserkStacks = 0;
    game.mirrorShield = 0;
    game.obliterateMode = false;
    game.gameStartTime = Date.now();
    game.seenEvents = []; // Track events seen this run (no repeats)
    game.eventTriggeredThisRoom = false; // Max 1 event per room
    game.endlessLevel = 0; // Track endless mode progression
    game.finalBossDefeated = false; // Track if final boss was defeated
    game.heldCardIndex = 0; // Track which held card is currently displayed (for Rogue)
    
    // Per-room flags initialization
    game.firstAttackDone = false; // Power Gauntlet flag
    game.criticalWarningShown = false; // HP critical warning flag
    
    // Class abilities
    game.classAbilityCooldown = 0; // Cooldown in rooms
    game.classAbilityActive = false; // Is buff active?
    game.classAbilityCounter = 0; // Uses left for buff
    game.rageStrikeActive = false; // Berserker Rage Strike flag
    
    // Run Stats
    game.stats = {
        monstersSlain: 0, totalDamage: 0, totalHealing: 0, roomsCleared: 0,
        weaponsEquipped: 0, potionsUsed: 0, maxCombo: 0, specialsUsed: 0,
        cardsHeld: 0, roomsAvoided: 0, gamesWon: 0, hardWins: 0,
        shopsVisited: 0,  // Track for score penalty
        minimalistWin: false, onePunch: false, musicWasOn: game.settings.musicEnabled,
        bossesKilled: 0, relicsCollected: 0, eventsTriggered: 0  // For class unlocks
    };
    
    // Initial Gold and Relics
    const startingGoldMap = { easy: 30, normal: 15, hard: 0, endless: 15 };
    game.gold = startingGoldMap[game.difficulty] || 0;
    game.totalGoldEarned = 0;
    game.relics = [];
    game.shopPriceMultiplier = 1.0; // Shop price multiplier (increases with visits)
    applyPermanentUnlocks(); // Applies initial gold/relics

    // 3. Update UI
    addLog(`Game started on ${game.difficulty.toUpperCase()} difficulty!`, 'info');
    showMessage(`Game started! Enter a dungeon to begin.`, 'info');
    
    btnStartGameModal.disabled = true; // Prevent double click
    btnDrawRoom.removeAttribute('disabled');
    btnDrawRoom.disabled = false;
    // First action must be Draw, not Avoid
    btnAvoidRoom.setAttribute('disabled', 'disabled');
    btnAvoidRoom.disabled = true;
    
    // Timer functions
    function pauseTimer() {
        if (game.gameTimerInterval) {
            clearInterval(game.gameTimerInterval);
            game.gameTimerInterval = null;
            game.gameTimerPausedAt = Date.now();
        }
    }
    
    function resumeTimer() {
        if (!game.gameTimerInterval) {
            // Add paused duration to start time
            if (game.gameTimerPausedAt) {
                const pausedDuration = Date.now() - game.gameTimerPausedAt;
                game.gameStartTime += pausedDuration;
                game.gameTimerPausedAt = null;
            }
            
            game.gameTimerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - game.gameStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                gameTimer.textContent = `⏱️ ${minutes}:${seconds}`;
            }, 1000);
        }
    }
    
    // Store timer functions globally
    window.pauseGameTimer = pauseTimer;
    window.resumeGameTimer = resumeTimer;
    
    // Start Timer (will be paused if tutorial starts)
    if (game.gameTimerInterval) clearInterval(game.gameTimerInterval);
    game.gameTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - game.gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        gameTimer.textContent = `⏱️ ${minutes}:${seconds}`;
    }, 1000);
    
    updateUI();
    updateRelicsDisplay();
    
    // 4. Change Screens
    showGameUI();
    
    playSound('start');
    
    // Switch to gameplay music
    music.switchContext('gameplay');
    
    // Start in-game tutorial if first time on Easy
    setTimeout(() => checkAndStartTutorial(), 500);
}

// ============================================
// IN-GAME TUTORIAL SYSTEM
// ============================================
// In-game tutorial system
let inGameTutorialActive = false;
let inGameTutorialStep = 0;

const IN_GAME_TUTORIAL_STEPS = [
    {
        id: 'welcome',
        title: '🎴 Welcome to Dungeon Scoundrel!',
        text: 'Your Quest Begins!\n\nYou are a SCOUNDREL exploring dark medieval dungeons filled with monsters, treasures, and ancient relics.\n\n🎯 GOAL: Clear all cards from the dungeon deck without dying!',
        visual: null, // No visual for in-game tutorial
        highlight: null,
        position: 'center',
        buttonText: 'Let\'s Start!'
    },
    // === TOPO DA TELA (Top elements) ===
    {
        id: 'health',
        title: '❤️ Your Health',
        text: 'This is your HP. If it reaches 0, game over! Heal with potions (♥ Hearts) and avoid damage.',
        highlight: '#health',
        position: 'top-right',
        buttonText: 'Got it!'
    },
    {
        id: 'gold',
        title: '💰 Gold',
        text: 'You earn gold by clearing rooms. Save it to buy items that will help you survive!',
        highlight: '#goldAmount',
        position: 'top-right',
        buttonText: 'Next'
    },
    {
        id: 'weapon',
        title: '⚔️ Weapons',
        text: 'You need a weapon to fight monsters! Equip weapons (♦ Diamonds) from the cards you draw.',
        highlight: '#equippedWeapon',
        position: 'bottom',
        buttonText: 'Next'
    },
    {
        id: 'codex',
        title: '📖 Codex (Relics & Upgrades)',
        text: 'Click the 📖 RELICS button at the top to see all relics and permanent upgrades!\n\nRelics give you powerful passive bonuses. Upgrades make you stronger for all future runs. Unlock them by completing challenges!',
        highlight: '#btnTopRelics',
        position: 'top',
        buttonText: 'Got it!'
    },
    {
        id: 'score',
        title: '🏆 Score System',
        text: 'Your SCORE is the ultimate challenge! Points are earned by:\n\n• Defeating monsters\n• Finding relics\n• Clearing rooms quickly\n• Avoiding damage\n\nCompete for the highest score! Can you master the dungeon?',
        highlight: '#mainScoreDisplay',
        position: 'bottom',
        buttonText: 'I\'ll Do My Best!'
    },
    // === MEIO DA TELA (Middle elements) ===
    {
        id: 'merchant',
        title: '🏺 Merchant',
        text: 'Click the MERCHANT button to buy healing potions, weapons, and powerful relics. Spend your gold wisely to survive the dungeon!',
        highlight: '#btnOpenShop',
        position: 'top-right',
        buttonText: 'Got it!'
    },
    {
        id: 'held_card',
        title: '✋ Held Cards (Unique Mechanic!)',
        text: 'Right-click a card to HOLD it! This is a unique mechanic in Dungeon Scoundrel.\n\nHeld cards are saved for later and won\'t clutter your room. Perfect for saving strong weapons or potions for when you really need them!',
        highlight: '#holdAreaContainer',
        position: 'left',
        buttonText: 'Great Tip!'
    },
    // === BAIXO DA TELA (Bottom elements - game start) ===
    {
        id: 'draw',
        title: '🎲 Drawing Rooms',
        text: 'Click "Draw Room" to draw 4 cards. Each room is a new challenge!',
        highlight: '#btnDrawRoom',
        position: 'top',
        buttonText: 'Draw My First Room!',
        action: () => {
            // Directly call drawRoom to draw the first hand of cards
            drawRoom();
        }
    },
    {
        id: 'cards',
        title: '🃏 Understanding Cards',
        text: '♠️♣️ = Monsters (damage you)\n♦️ = Weapons (equip to fight)\n♥️ = Potions (heal you)\n✨ = Special (powerful effects)',
        highlight: '#room',
        position: 'top',
        buttonText: 'I Understand!'
    },
    {
        id: 'combat',
        title: '⚔️ Combat Basics',
        text: 'Click a MONSTER card to attack it! Your weapon damage is subtracted from the monster\'s HP. If the monster has more HP than your weapon, you take the difference as damage.',
        highlight: '#room',
        position: 'top',
        buttonText: 'Ready to Fight!'
    },
    // === FINAL (Strategy & Finish) ===
    {
        id: 'strategy',
        title: '🧠 Strategy Tips',
        text: '1. Always equip a weapon first!\n2. Use potions when HP is low\n3. Save strong weapons for tough monsters\n4. Clear the room before drawing a new one\n5. Use held cards wisely!',
        highlight: null,
        position: 'center',
        buttonText: 'Almost Ready!'
    },
    {
        id: 'finish',
        title: '🏆 You\'re Ready!',
        text: 'That\'s all you need to know! The dungeon is yours to conquer. Good luck, Scoundrel!',
        highlight: null,
        position: 'center',
        buttonText: 'Start My Adventure!'
    }
];

function checkAndStartTutorial() {
    // Only show tutorial if:
    // 1. Tutorial not completed yet
    // 2. Tutorial not skipped yet
    // 3. Difficulty is Easy
    // 4. Tutorial not already active
    const tutorialCompleted = localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED);
    const tutorialSkipped = localStorage.getItem(STORAGE_KEYS.TUTORIAL_SKIPPED);
    const playedBefore = localStorage.getItem(STORAGE_KEYS.PLAYED_BEFORE);
    
    
    // CRITICAL: Prevent tutorial from starting multiple times
    if (inGameTutorialActive) {
        return;
    }
    
    if (!tutorialCompleted && !tutorialSkipped && game.difficulty === 'easy') {
        inGameTutorialActive = true;
        inGameTutorialStep = 0;
        
        // PAUSE TIMER during tutorial
        if (window.pauseGameTimer) {
            window.pauseGameTimer();
        }
        
        // CRITICAL: Disable all game buttons during tutorial
        if (window.disableGameButtons) {
            window.disableGameButtons();
        }
        
        showTutorialStep(IN_GAME_TUTORIAL_STEPS[0]);
    } else {
    }
}

function showTutorialStep(step) {
    
    // CLEANUP - Remove ALL previous tutorial elements
    document.querySelectorAll('.tutorial-overlay, .tutorial-spotlight, .tutorial-modal').forEach(el => {
        el.remove();
    });
    
    // Remove previous highlighting
    document.querySelectorAll('.tutorial-highlighted').forEach(el => {
        el.classList.remove('tutorial-highlighted');
        el.style.position = '';
        el.style.zIndex = '';
        el.style.boxShadow = '';
    });
    
    // ALWAYS create dark overlay (LIGHTER for better visibility)
    const darkOverlay = document.createElement('div');
    darkOverlay.className = 'tutorial-overlay';
    darkOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.70);
        z-index: 9998;
        pointer-events: none;
    `;
    document.body.appendChild(darkOverlay);
    
    // SPOTLIGHT element if specified (CUTOUT approach using box-shadow)
    if (step.highlight) {
        const targetElement = document.querySelector(step.highlight);
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            
            
            // Only create spotlight if element is visible (has dimensions)
            if (rect.width > 0 && rect.height > 0) {
                // Create spotlight with BRIGHT glow (no dark shadow)
                const spotlight = document.createElement('div');
                spotlight.className = 'tutorial-spotlight';
                spotlight.style.cssText = `
                    position: fixed;
                    top: ${rect.top - 10}px;
                    left: ${rect.left - 10}px;
                    width: ${rect.width + 20}px;
                    height: ${rect.height + 20}px;
                    border: 3px solid #ffd700;
                    border-radius: 12px;
                    box-shadow: 
                        0 0 30px rgba(255, 215, 0, 0.9),
                        0 0 60px rgba(255, 215, 0, 0.6),
                        inset 0 0 20px rgba(255, 215, 0, 0.2);
                    z-index: 9999;
                    pointer-events: none;
                    animation: tutorialPulse 2s infinite;
                    background: rgba(255, 215, 0, 0.05);
                `;
                document.body.appendChild(spotlight);
                
                // Make target element interactive and above spotlight
                targetElement.style.position = 'relative';
                targetElement.style.zIndex = '10000';
                targetElement.classList.add('tutorial-highlighted');
                
            } else {
                console.warn('[TUTORIAL] ⚠️ Element not visible (0 dimensions):', step.highlight);
            }
        } else {
            console.warn('[TUTORIAL] ⚠️ Element not found:', step.highlight);
        }
    }
    
    // 3. Create MODAL (text explanation)
    const modal = document.createElement('div');
    modal.className = 'tutorial-modal';
    modal.style.cssText = `
        position: fixed;
        ${step.position === 'center' ? 'top: 50%; left: 50%; transform: translate(-50%, -50%);' : ''}
        ${step.position === 'top' ? 'top: 120px; left: 50%; transform: translateX(-50%);' : ''}
        ${step.position === 'bottom' ? 'bottom: 100px; left: 50%; transform: translateX(-50%);' : ''}
        ${step.position === 'top-right' ? 'top: 120px; right: 30px;' : ''}
        ${step.position === 'left' ? 'top: 50%; left: 30px; transform: translateY(-50%);' : ''}
        max-width: 500px;
        background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
        border: 3px solid #ffd700;
        border-radius: 15px;
        padding: 25px;
        z-index: 10001;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
        text-align: center;
        pointer-events: all;
    `;
    
    // Create visual content if specified
    let visualHTML = '';
    if (step.visual === 'cards') {
        visualHTML = `
            <div style="display: flex; gap: 12px; justify-content: center; margin: 20px 0; flex-wrap: wrap;">
                <div class="card" style="background: linear-gradient(135deg, #1a1410 0%, #2d2520 100%); border: 2px solid #8b4513; padding: 12px; border-radius: 8px; min-width: 70px; text-align: center;">
                    <div style="font-size: 2em;">K♠</div>
                    <div style="font-size: 0.7em; color: #aaa; margin-top: 4px;">Monster</div>
                </div>
                <div class="card" style="background: linear-gradient(135deg, #1a1410 0%, #2d2520 100%); border: 2px solid #8b4513; padding: 12px; border-radius: 8px; min-width: 70px; text-align: center;">
                    <div style="font-size: 2em; color: #ff6b6b;">10♦</div>
                    <div style="font-size: 0.7em; color: #aaa; margin-top: 4px;">Weapon</div>
                </div>
                <div class="card" style="background: linear-gradient(135deg, #1a1410 0%, #2d2520 100%); border: 2px solid #8b4513; padding: 12px; border-radius: 8px; min-width: 70px; text-align: center;">
                    <div style="font-size: 2em; color: #ff6b6b;">7♥</div>
                    <div style="font-size: 0.7em; color: #aaa; margin-top: 4px;">Potion</div>
                </div>
                <div class="card" style="background: linear-gradient(135deg, #1a1410 0%, #2d2520 100%); border: 2px solid #ffd700; padding: 12px; border-radius: 8px; min-width: 70px; text-align: center; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);">
                    <div style="font-size: 2em; color: #ffd700;">⚡</div>
                    <div style="font-size: 0.7em; color: #ffd700; margin-top: 4px;">Special</div>
                </div>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <h2 style="color: #ffd700; margin-bottom: 15px; font-size: 1.5em;">${step.title}</h2>
        <p style="color: #e0e0e0; line-height: 1.6; white-space: pre-line; margin-bottom: 20px;">${step.text}</p>
        ${visualHTML}
        <div style="display: flex; gap: 10px; justify-content: center;">
            ${inGameTutorialStep > 0 ? '<button class="btn btn-secondary" id="tutorialSkip">Skip Tutorial</button>' : ''}
            <button class="btn btn-primary" id="tutorialNext">${step.buttonText}</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Button handlers
    const nextBtn = document.getElementById('tutorialNext');
    const skipBtn = document.getElementById('tutorialSkip');
    
    nextBtn.onclick = () => {
        // Execute action if exists
        if (step.action) step.action();
        
        // Next step (showTutorialStep will handle cleanup)
        inGameTutorialStep++;
        if (inGameTutorialStep < IN_GAME_TUTORIAL_STEPS.length) {
            // Delay for card draw animation
            if (step.action) {
                setTimeout(() => showTutorialStep(IN_GAME_TUTORIAL_STEPS[inGameTutorialStep]), 1000);
            } else {
                showTutorialStep(IN_GAME_TUTORIAL_STEPS[inGameTutorialStep]);
            }
        } else {
            // Remove all tutorial elements before completing
            const allTutorialElements = document.querySelectorAll('[id^="tutorialOverlay"], [id^="tutorialSpotlight"], [id^="tutorialModal"], .tutorial-spotlight-element');
            allTutorialElements.forEach(el => el.remove());
            completeTutorial();
        }
    };
    
    if (skipBtn) {
        skipBtn.onclick = () => {
            // Show confirmation modal
            const confirmModal = document.createElement('div');
            confirmModal.id = 'tutorialSkipConfirm';
            confirmModal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
                border: 3px solid #ff4444;
                border-radius: 15px;
                padding: 30px;
                z-index: 10002;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.9);
                text-align: center;
                max-width: 450px;
                pointer-events: all;
            `;
            
            confirmModal.innerHTML = `
                <h2 style="color: #ff4444; margin-bottom: 20px; font-size: 1.6em;">⚠️ Skip Tutorial?</h2>
                <p style="color: #e0e0e0; line-height: 1.6; margin-bottom: 25px;">Are you SURE you want to skip the tutorial? This is your first time playing and learning the basics will greatly help your survival!</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="btn btn-secondary" id="cancelSkip" style="min-width: 120px;">Keep Learning</button>
                    <button class="btn btn-danger" id="confirmSkip" style="min-width: 120px; background: #ff4444;">Skip Tutorial</button>
                </div>
            `;
            
            document.body.appendChild(confirmModal);
            
            document.getElementById('cancelSkip').onclick = () => {
                confirmModal.remove();
            };
            
            document.getElementById('confirmSkip').onclick = () => {
                confirmModal.remove();
                skipTutorial(); // Use skipTutorial instead of completeTutorial
            };
        };
    }
}

function skipTutorial() {
    inGameTutorialActive = false;
    
    // Cleanup ALL tutorial elements
    document.querySelectorAll('.tutorial-overlay, .tutorial-spotlight, .tutorial-modal').forEach(el => {
        el.remove();
    });
    
    // Restore highlighted elements
    document.querySelectorAll('.tutorial-highlighted').forEach(el => {
        el.classList.remove('tutorial-highlighted');
        el.style.zIndex = '';
        el.style.position = '';
    });
    
    // Resume timer
    if (window.resumeGameTimer) {
        window.resumeGameTimer();
    }
    
    // CRITICAL: Re-enable game buttons
    if (window.enableGameButtons) {
        window.enableGameButtons();
    }
    
    // CRITICAL: Set SKIPPED flag, NOT completed flag
    // This prevents achievement from unlocking
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_SKIPPED, 'true');
    
    // NO ACHIEVEMENT when skipping!
    showMessage('Tutorial skipped. Good luck!', 'info');
}

function completeTutorial() {
    inGameTutorialActive = false;
    
    // Cleanup ALL tutorial elements
    document.querySelectorAll('.tutorial-overlay, .tutorial-spotlight, .tutorial-modal').forEach(el => {
        el.remove();
    });
    
    // CRITICAL: Re-enable game buttons
    if (window.enableGameButtons) {
        window.enableGameButtons();
    }
    
    // Restore highlighted elements
    document.querySelectorAll('.tutorial-highlighted').forEach(el => {
        el.classList.remove('tutorial-highlighted');
        el.style.zIndex = '';
        el.style.position = '';
    });
    
    // Resume timer
    if (window.resumeGameTimer) {
        window.resumeGameTimer();
    }
    
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
    
    // Unlock achievement ONLY when completing (not skipping)
    unlockAchievement('tutorial_master');
    
    showMessage('🎓 Tutorial completed! Good luck in the dungeon!', 'success');
}

// Add CSS animation for pulse (BRIGHT glow, no dark shadow)
const tutorialStyle = document.createElement('style');
tutorialStyle.textContent = `
    @keyframes tutorialPulse {
        0%, 100% { 
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.9), 0 0 60px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.2);
            transform: scale(1);
        }
        50% { 
            box-shadow: 0 0 40px rgba(255, 215, 0, 1), 0 0 80px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.3);
            transform: scale(1.02);
        }
    }
`;
document.head.appendChild(tutorialStyle);

function drawRoom() {
    if (game.dungeon.length === 0) {
        // Endless mode: reload deck instead of ending
        if (game.difficulty === 'endless') {
            // Progressive difficulty scaling
            game.endlessLevel = (game.endlessLevel || 0) + 1;
            const difficultyScaling = Math.min(game.endlessLevel * DIFFICULTY.ENDLESS_SCALING_INCREMENT, DIFFICULTY.ENDLESS_MAX_SCALING);
            
            game.dungeon = createDeck();
            
            // Make monsters progressively harder
            game.dungeon.forEach(card => {
                if (card.suitName === 'clubs' || card.suitName === 'spades') {
                    card.numValue = Math.floor(card.numValue * (1 + difficultyScaling));
                }
            });
            
            showMessage(`♾️ ENDLESS MODE: Deck ${game.endlessLevel} loaded! Monsters +${Math.floor(difficultyScaling * 100)}% HP!`, 'warning');
            playSound('special');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 50);
        } else {
            // Check if final boss already defeated
            if (!game.finalBossDefeated) {
                spawnFinalBoss();
                return;
            }
            endGame('victory');
            return;
        }
    }

    // NEW BOSS SYSTEM: 2 Minibosses (room 15 and 25) + Final Boss mandatory
    const nextRoomNumber = game.stats.roomsCleared + 1;
    const isMiniboss1 = nextRoomNumber === BOSS.MINIBOSS_1_ROOM;
    const isMiniboss2 = nextRoomNumber === BOSS.MINIBOSS_2_ROOM;
    
    // Warn player about upcoming miniboss
    if (nextRoomNumber === 14) {
        showMessage('⚠️ MINIBOSS APPROACHING! Prepare for a tough fight!', 'warning');
    } else if (nextRoomNumber === 24) {
        showMessage('⚠️ FINAL MINIBOSS APPROACHING! Get ready!', 'warning');
    }
    
    if (isMiniboss1 || isMiniboss2) {
        // MINIBOSS BATTLE with difficulty scaling
        const minibossNumber = isMiniboss1 ? 1 : 2;
        
        // HP scales with difficulty
        const difficultyHPMap = {
            easy: { miniboss1: 12, miniboss2: 18 },
            normal: { miniboss1: 15, miniboss2: 22 },
            hard: { miniboss1: 20, miniboss2: 28 },
            endless: { miniboss1: 15, miniboss2: 22 }
        };
        
        const bossHP = isMiniboss1 
            ? difficultyHPMap[game.difficulty].miniboss1 
            : difficultyHPMap[game.difficulty].miniboss2;
        
        // Miniboss names and flavor
        const minibossData = [
            { name: 'The Forgotten Knight', flavor: 'A hollow warrior bound by ancient curses...' },
            { name: 'The Crimson Warden', flavor: 'Guardian of the deeper dungeons, covered in blood of the fallen.' }
        ];
        
        const boss = minibossData[minibossNumber - 1];
        
        const bossCard = {
            suit: '👹',
            value: '👹',
            numValue: bossHP,
            maxHP: bossHP, // Store max HP for HP bar
            isBoss: true,
            isMiniboss: true,
            bossNumber: minibossNumber,
            bossName: boss.name,
            bossFlavor: boss.flavor
        };
        
        // Deal 3 cards to room (or remaining if < 3)
        // Speed Boots: +1 extra card draw
        let baseCardsToDraw = 3;
        if (game.relics.some(r => r.id === 'boots')) baseCardsToDraw += 1;
        
        const cardsToDraw = Math.min(baseCardsToDraw, game.dungeon.length);
        const drawnCards = game.dungeon.splice(0, cardsToDraw);
        game.room.push(bossCard, ...drawnCards);
        game.lastActionWasAvoid = false;
        
        playSound('special');
        addLog(`⚠️ MINIBOSS #${minibossNumber} BATTLE! ${boss.name} has ${bossHP} HP!`, 'danger');
        showMessage(`👹 MINIBOSS: ${boss.name}`, 'danger');
        
        // Show miniboss intro with flavor
        setTimeout(() => {
            showMessage(boss.flavor, 'info');
        }, 1000);
        
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 60);
    } else {
        // Normal room
        const numToDraw = 4;
        
        // BEGINNER HELP: Guarantee weapon in first 5 rooms if player has none
        if (game.stats.roomsCleared < 5 && !game.equippedWeapon) {
            // Find a weapon in dungeon
            const weaponIndex = game.dungeon.findIndex(card => card.suitName === 'diamonds');
            if (weaponIndex !== -1) {
                // Draw weapon + 3 random cards
                const weapon = game.dungeon.splice(weaponIndex, 1)[0];
                const otherCards = game.dungeon.splice(0, Math.min(3, game.dungeon.length));
                game.room.push(weapon, ...otherCards);
                showMessage('🔰 Beginner help: Weapon included!', 'success');
            } else {
                // No weapons left, draw normally
                const drawnCards = game.dungeon.splice(0, Math.min(numToDraw, game.dungeon.length));
                game.room.push(...drawnCards);
            }
        } else {
            const drawnCards = game.dungeon.splice(0, Math.min(numToDraw, game.dungeon.length));
            game.room.push(...drawnCards);
        }
        
        game.lastActionWasAvoid = false;
        
        playSound('cardDraw');
        addLog(`Entered dungeon with ${game.room.length} cards`, 'info');
        showMessage(`You entered a dungeon with ${game.room.length} cards!`, 'info');
    }

    // BUGFIX: Fortress Armor (tank relic) gives +1 HP shield at start of each room
    if (game.relics.some(r => r.id === 'tank')) {
        game.mirrorShield = 1;
        showMessage('🏰 Fortress Armor: +1 HP shield', 'success');
    }

    updateUI();
    btnDrawRoom.disabled = true;
    btnAvoidRoom.disabled = true;
}

function avoidRoom() {
    // Four Leaf Clover: Can avoid 2x in a row
    const hasClover = game.relics.some(r => r.id === 'clover');
    
    if (game.lastActionWasAvoid && !hasClover) {
        showMessage('❌ You cannot avoid 2 dungeons in a row!', 'warning');
        playSound('error');
        return;
    }
    
    // Leather Boots: Avoid costs 2 cards instead of 3
    const avoidCost = game.relics.some(r => r.id === 'leather_boots') ? 2 : CARDS.AVOID_COST;
    
    if (game.dungeon.length < avoidCost) {
        showMessage('Not enough cards to avoid!', 'warning');
        return;
    }

    const discarded = game.dungeon.splice(0, avoidCost);
    game.discardPile.push(...discarded);
    game.stats.roomsAvoided++;
    game.lastActionWasAvoid = true;
    
    playSound('avoid');
    addLog(`Avoided dungeon, ${avoidCost} cards discarded`, 'info');
    showMessage(`You avoided the dungeon! ${avoidCost} cards discarded.`, 'info');
    updateUI();

    if (game.dungeon.length === 0) {
        endGame('victory');
    }
}

// NOTE: saveGameState, undoLastMove, handleCardClick moved to modules/game-combat.js
// NOTE: getCardType, handleSpecial, handleMonster, handleWeapon, handlePotion moved to modules/game-combat.js

function checkGameState() {
    // Room Cleared?
    const roomEmpty = game.room.length === 0;
    const notGameOver = !game.gameOver;

    if (roomEmpty && notGameOver) {
        
        game.potionsUsed = 0;
        game.stats.roomsCleared++;
        
        // Show combo message if active (combo now persists between rooms!)
        if (game.combo >= COMBO.MIN_VISUAL_COMBO) {
            showMessage(`🔥 ${game.combo}x COMBO! DUNGEON CLEAR! Keep it going!`, 'success');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', UI.ROOM_CLEAR_PARTICLES);
        }
        
        // COMBO NO LONGER RESETS - it persists between chambers!
        // (Only breaks when: taking damage, or equipping a weapon)
        game.undoAvailable = false; // Reset undo for new room
        game.lastGameState = null;
        game.eventTriggeredThisRoom = false; // Reset event flag for new room
        
        // Decrement class ability cooldown
        if (game.classAbilityCooldown > 0) {
            game.classAbilityCooldown--;
            if (game.classAbilityCooldown === 0) {
                showMessage('✨ Class ability ready!', 'success');
            }
        }
        
        playSound('roomClear');
        addLog(`Dungeon cleared! Total: ${game.stats.roomsCleared}`, 'info');
        
        // Victory particles!
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', UI.ROOM_CLEAR_PARTICLES);
        setTimeout(() => createParticles(window.innerWidth / 2 + 100, window.innerHeight / 2, '#6bcf7f', UI.SECONDARY_PARTICLES), TIMING.PARTICLE_DELAY_1);
        setTimeout(() => createParticles(window.innerWidth / 2 - 100, window.innerHeight / 2, '#4ecdc4', UI.SECONDARY_PARTICLES), TIMING.PARTICLE_DELAY_2);
        
        // Room Clear Relics (optimized single iteration)
        let goldPerRoom = 0;
        let passiveHeal = 0;
        
        // Reset per-room flags
        game.firstAttackDone = false; // Power Gauntlet reset
        
        game.relics.forEach(r => {
            // Reset per-room relic flags
            if (r.id === 'tank') r.shieldUsed = false;
            if (r.id === 'cloak') r.usedThisRoom = false;
            if (r.id === 'stone') r.stoneUsed = false;
            if (r.id === 'mirror_shard') r.usedThisRoom = false;
            
            // Gold bonuses
            if (r.id === 'coin_pouch') goldPerRoom += 2;
            if (r.id === 'greedy') goldPerRoom += 3;
            
            // Passive healing (generic system based on effect)
            if (r.effect === 'passive_heal') {
                // Standard passive healing: +1 HP per room (meditation, healing_study)
                passiveHeal += 1;
            }
            if (r.id === 'bandage') passiveHeal += 0.5; // Bandage gives additional 0.5
        });
        
        // Rogue: +1 gold per room
        if (game.classData && game.classData.passive.bonusGoldPerRoom) {
            goldPerRoom += game.classData.passive.bonusGoldPerRoom;
        }
        
        if (goldPerRoom > 0) earnGold(goldPerRoom);
        if (passiveHeal > 0) game.health = Math.min(game.maxHealth, game.health + Math.floor(passiveHeal));
        
        // Reset Mirror Shield at room clear (only for current dungeon)
        game.mirrorShield = 0;
        
        // Reset weapon durability at room clear (Master Smith relic)
        if (game.equippedWeapon && game.relics.some(r => r.id === 'master_smith')) {
            game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
            showMessage('🔨 Master Smith repaired your weapon!', 'success');
        }
        
        // Room clear bonus (difficulty-based)
        const roomBonusByDifficulty = {
            easy: Math.floor(Math.random() * 4) + 5,    // 5-8 gold
            normal: Math.floor(Math.random() * 3) + 4,  // 4-6 gold
            hard: Math.floor(Math.random() * 3) + 2,    // 2-4 gold
            endless: Math.floor(Math.random() * 3) + 4  // 4-6 gold
        };
        const bonusGold = roomBonusByDifficulty[game.difficulty] || 3;
        earnGold(bonusGold);
        
        updateRunningScore(); // Update score
        updateUI(); // Update stats
        checkAchievements();

        // Event Chance (difficulty-based)
        // Only trigger if no event was triggered this room yet
        const eventChanceByDifficulty = {
            easy: EVENT_CONFIG.CHANCE_EASY,
            normal: EVENT_CONFIG.CHANCE_NORMAL,
            hard: EVENT_CONFIG.CHANCE_HARD,
            endless: EVENT_CONFIG.CHANCE_ENDLESS
        };
        let eventChance = eventChanceByDifficulty[game.difficulty] || EVENT_CONFIG.CHANCE_NORMAL;
        
        // Dancer: +15% event chance (luck passive)
        if (game.classData && game.classData.passive.eventChanceBonus) {
            eventChance += (game.classData.passive.eventChanceBonus / 100);
        }
        
        // Event Luck unlock: +50% event chance
        if (permanentUnlocks.eventLuck) {
            eventChance += 0.50;
        }
        
        // Compass relic: +10% event chance
        if (game.relics.some(r => r.id === 'compass')) {
            eventChance += 0.10;
        }
        
        setTimeout(() => {
            if (!game.gameOver && !game.eventTriggeredThisRoom && Math.random() < eventChance) {
                triggerRandomEvent();
            }
        }, 800);
        
        // CRITICAL: Enable buttons AFTER room clear and BEFORE boss spawn
        // This ensures buttons are enabled even if boss spawns immediately
        btnDrawRoom.removeAttribute('disabled');
        btnDrawRoom.disabled = false;
        
        // First room (roomsCleared === 0): Avoid must be disabled
        // After first room: Avoid enabled unless lastActionWasAvoid
        if (game.stats.roomsCleared === 1 || game.lastActionWasAvoid) {
            btnAvoidRoom.setAttribute('disabled', 'disabled');
            btnAvoidRoom.disabled = true;
        } else {
            btnAvoidRoom.removeAttribute('disabled');
            btnAvoidRoom.disabled = false;
        }
    }

    if (game.health <= 0) {
        endGame('death');
    }

    // Victory condition: deck empty and room empty (non-endless)
    if (game.dungeon.length === 0 && game.room.length === 0 && game.difficulty !== 'endless') {
        // Check if final boss already defeated
        if (!game.finalBossDefeated) {
            // CRITICAL: Only spawn if boss is not already in room
            // This prevents boss HP from resetting if room becomes empty temporarily
            const bossInRoom = game.room.some(card => card.isBoss && card.bossNumber === BOSS.FINAL_BOSS_NUMBER);
            if (!bossInRoom) {
                spawnFinalBoss();
            } else {
            }
        } else {
            endGame('victory');
        }
    }
    
    // ENDLESS MODE: Auto-reload deck if both dungeon and room are empty
    if (game.dungeon.length === 0 && game.room.length === 0 && game.difficulty === 'endless' && !game.gameOver) {
        // Progressive difficulty scaling
        game.endlessLevel = (game.endlessLevel || 0) + 1;
        const difficultyScaling = Math.min(game.endlessLevel * 0.15, 2); // Max 2x scaling
        
        game.dungeon = createDeck();
        
        // Make monsters progressively harder
        game.dungeon.forEach(card => {
            if (card.suitName === 'clubs' || card.suitName === 'spades') {
                card.numValue = Math.floor(card.numValue * (1 + difficultyScaling));
            }
        });
        
        showMessage(`♾️ ENDLESS MODE: Deck ${game.endlessLevel} loaded! Monsters +${Math.floor(difficultyScaling * 100)}% HP!`, 'warning');
        playSound('special');
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 50);
        
        // Automatically draw first room from new deck
        setTimeout(() => {
            if (!game.gameOver) {
                drawRoom();
            }
        }, 1000);
    }
}

function endGame(reason, gaveUp = false) {
    if (game.gameStartTime === 0 || game.gameOver) return;
    
    game.gameOver = true;
    if (game.gameTimerInterval) clearInterval(game.gameTimerInterval); // Stop clock
    
    // Check if this is the first death or every 5th death (show encouraging modal)
    const lifetimeStats = storage.get('scoundrel_lifetime_stats', {});
    const totalDeaths = (lifetimeStats.deaths || 0) + 1; // Current death count
    const isFirstDeath = reason === 'death' && !gaveUp && totalDeaths === 1;
    const isEveryFifthDeath = reason === 'death' && !gaveUp && totalDeaths >= 5 && totalDeaths % 5 === 0;
    
    // Switch music based on outcome
    if (reason === 'victory' || reason === 'boss_fled') {
        music.switchContext('victory'); // Boss fled is still a win
    } else {
        music.switchContext('defeat');
    }
    
    const gameTime = Math.floor((Date.now() - game.gameStartTime) / 1000);
    let title, message, score, scoreLabel, isVictory = false;

    if (reason === 'death') {
        title = '💀 DEFEAT';
        const deathNarratives = [
            'The darkness claimed another soul...',
            'Your tale ends here, in the depths.',
            'The dungeon has taken its toll.',
            'Another scoundrel falls to the abyss.'
        ];
        const randomDeath = deathNarratives[Math.floor(Math.random() * deathNarratives.length)];
        message = gaveUp ? 'You gave up the run.' : randomDeath;
        score = gaveUp ? 0 : calculateDeathScore(); // Score is 0 if gave up
        scoreLabel = 'Final Score:';
        playSound('defeat');
    } else if (reason === 'boss_fled') {
        // Special case: Boss fled, player survived but didn't defeat the boss
        isVictory = true; // Still counts as a win for stats
        title = '🏃 BOSS FLED';
        const fledNarratives = [
            'The boss fled into the shadows... You survived, but at what cost?',
            'Your resilience scared the boss away. A hollow victory.',
            'The coward escaped! You live another day, but glory eludes you.',
            'Without a weapon, you could only endure. The boss retreats in shame.'
        ];
        const randomFled = fledNarratives[Math.floor(Math.random() * fledNarratives.length)];
        message = randomFled;
        score = calculateBossFledScore(); // -50% score penalty
        scoreLabel = 'Score (Boss Fled -50%):';
        playSound('roomClear'); // Not defeat, not full victory
        
        // Muted celebration particles
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
                const y = window.innerHeight / 2;
                createParticles(x, y, '#888888', 20); // Gray particles - bittersweet
            }, i * 300);
        }
        
        game.stats.gamesWon = 1;
        permanentStats.gamesWon = (permanentStats.gamesWon || 0) + 1;
        permanentStats.bossesFled = (permanentStats.bossesFled || 0) + 1; // Track this separately
        
    } else if (reason === 'victory') {
        isVictory = true;
        title = '🏆 VICTORY';
        const victoryNarratives = [
            'Against all odds, you emerge victorious!',
            'The dungeon is conquered. You are the legend.',
            'Light pierces through the darkness. You survived.',
            'Your name will echo through these halls forever.'
        ];
        const randomVictory = victoryNarratives[Math.floor(Math.random() * victoryNarratives.length)];
        message = randomVictory;
        score = calculateWinScore();
        scoreLabel = 'Final Score:';
        playSound('victory');
        
        // Epic victory particle explosion!
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = window.innerWidth / 2 + (Math.random() - 0.5) * 400;
                const y = window.innerHeight / 2 + (Math.random() - 0.5) * 300;
                const colors = ['#ffd700', '#6bcf7f', '#4ecdc4', '#ff6b6b', '#ffd93d'];
                createParticles(x, y, colors[i % colors.length], 50);
            }, i * 200);
        }
        
        game.stats.gamesWon = 1;
        permanentStats.gamesWon = (permanentStats.gamesWon || 0) + 1;
        if (game.difficulty === 'hard') {
            game.stats.hardWins = 1;
            permanentStats.hardWins = (permanentStats.hardWins || 0) + 1;
        }
        if (permanentStats.fastestWin === 0 || gameTime < permanentStats.fastestWin) {
            permanentStats.fastestWin = gameTime;
        }
        
        // Check special victory achievements
        if (gameTime < 60) { // Speedrun: <1 minute
            unlockAchievement('speedrun');
        }
        if (game.health === 1) { // Iron Will: Win with exactly 1 HP
            unlockAchievement('iron_will');
        }
        if (game.stats.roomsCleared >= 10 && game.stats.maxCombo >= 10) { // Perfect Run: 10 rooms with 10x combo
            unlockAchievement('perfect_run');
        }
        
        setTimeout(() => showDamageNumber(score, 'score'), 500);
    }
    
    // Update permanent stats
    updateLifetimeStats(reason, gaveUp); // Save stats
    checkAchievements(); // Check one last time
    savePermanentStats(); // Save progress
    saveUnlocks(); // Save unlocks

    showGameOver(title, message, score, scoreLabel, isVictory, gameTime, reason, gaveUp);
}

// Ported Score Functions
function calculateWinScore() {
    const timeInSeconds = Math.max(1, Math.floor((Date.now() - game.gameStartTime) / 1000));
    
    let difficultyMultiplier = 1;
    if (game.difficulty === 'normal') difficultyMultiplier = 1.5;
    if (game.difficulty === 'hard') difficultyMultiplier = 2.5;

    const baseScore = 1000; // Win bonus
    const healthBonus = game.health * 20;
    const goldBonus = game.totalGoldEarned * 5;
    const comboBonus = game.stats.maxCombo * 10;
    const monsterBonus = game.stats.monstersSlain * 2;
    
    // NEW BONUSES/PENALTIES
    const speedrunBonus = timeInSeconds < 60 ? 1000 : (timeInSeconds < 300 ? 500 : 0); // <1min: +1000, <5min: +500
    const perfectRunBonus = game.stats.totalDamage === 0 ? 1000 : 0; // No damage taken
    const shopPenalty = (game.stats.shopsVisited || 0) * 50; // -50 per shop visit
    
    const timePenalty = timeInSeconds * 2;
    
    const totalScore = Math.floor(
        ((baseScore + healthBonus + goldBonus + comboBonus + monsterBonus + speedrunBonus + perfectRunBonus) - timePenalty - shopPenalty) * difficultyMultiplier
    );
    
    return Math.max(1, totalScore); // Score must be at least 1
}

function calculateBossFledScore() {
    // Boss fled = Victory with -50% penalty
    // Uses same calculation as win, but halved
    const baseWinScore = calculateWinScore();
    const penaltyMultiplier = 0.5; // -50% penalty
    
    return Math.max(1, Math.floor(baseWinScore * penaltyMultiplier));
}

function calculateDeathScore() {
    // Score based on progress made before death
    const roomsBonus = game.stats.roomsCleared * 50;
    const monstersBonus = game.stats.monstersSlain * 10;
    const goldBonus = game.totalGoldEarned * 2;
    const comboBonus = game.stats.maxCombo * 5;
    
    // Time penalty (less harsh for deaths)
    const timeInSeconds = Math.max(1, Math.floor((Date.now() - game.gameStartTime) / 1000));
    const timePenalty = Math.floor(timeInSeconds * 0.5);
    
    const total = roomsBonus + monstersBonus + goldBonus + comboBonus - timePenalty;
    return Math.max(0, total); // Score cannot be negative
}

function showGameOver(title, message, score, scoreLabel, isVictory, gameTime, reason, gaveUp) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active game-over'; // Use modal class
    
    const submitButtonHTML = isVictory ? 
        `<button class="btn btn-success" id="btnSubmitScore">🚀 Submit Score</button>` : '';
    
    // Score Breakdown
    let scoreBreakdownHTML = '';
    if (isVictory) {
        const timeInSeconds = Math.max(1, gameTime);
        let difficultyMultiplier = 1;
        if (game.difficulty === 'normal') difficultyMultiplier = 1.5;
        if (game.difficulty === 'hard') difficultyMultiplier = 2.5;

        const baseScore = 1000;
        const healthBonus = game.health * 20;
        const goldBonus = game.totalGoldEarned * 5;
        const comboBonus = game.stats.maxCombo * 10;
        const monsterBonus = game.stats.monstersSlain * 2;
        
        // NEW BONUSES/PENALTIES
        const speedrunBonus = timeInSeconds < 60 ? 1000 : (timeInSeconds < 300 ? 500 : 0); // <1min: +1000, <5min: +500
        const perfectRunBonus = game.stats.totalDamage === 0 ? 1000 : 0;
        const shopPenalty = (game.stats.shopsVisited || 0) * 50;
        
        const timePenalty = timeInSeconds * 2;
        const subTotal = (baseScore + healthBonus + goldBonus + comboBonus + monsterBonus + speedrunBonus + perfectRunBonus) - timePenalty - shopPenalty;

        let bonusesHTML = '';
        if (speedrunBonus > 0) bonusesHTML += `<p style="color: #6bcf7f;">⚡ Speedrun Bonus (${Math.floor(timeInSeconds/60)}m${timeInSeconds%60}s): +${speedrunBonus}</p>`;
        if (perfectRunBonus > 0) bonusesHTML += `<p style="color: #ffd700;">🏆 Perfect Run (No Damage): +${perfectRunBonus}</p>`;
        if (shopPenalty > 0) bonusesHTML += `<p style="color: #ff6b6b;">🏺 Shop Penalty (${game.stats.shopsVisited || 0} visits): -${shopPenalty}</p>`;

        // Relics collected - extract emoji from name (first character/emoji)
        const relicsHTML = game.relics.length > 0 
            ? game.relics.map(r => {
                const emoji = r.name ? r.name.split(' ')[0] : '📿';
                const fullName = r.name || 'Unknown Relic';
                return `<span title="${fullName}" style="font-size: 1.2em; cursor: help;">${emoji}</span>`;
            }).join(' ')
            : '<span style="color: #888;">None</span>';

        scoreBreakdownHTML = `
            <div class="game-over-stats" style="background: rgba(0,0,0,0.4); border: 1px solid #ffd700; margin-bottom: 15px; text-align: left; padding: 15px; border-radius: 8px;">
                <p style="color: #ffd700; font-weight: bold; font-size: 1.1em; margin-bottom: 12px;">📊 Score Breakdown:</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                    <p>🎯 Win Bonus: <strong style="color: #6bcf7f;">+1000</strong></p>
                    <p>❤️ Health (${game.health} HP): <strong style="color: #6bcf7f;">+${healthBonus}</strong></p>
                    <p>💰 Gold (${game.totalGoldEarned}): <strong style="color: #6bcf7f;">+${goldBonus}</strong></p>
                    <p>🔥 Combo (${game.stats.maxCombo}x): <strong style="color: #6bcf7f;">+${comboBonus}</strong></p>
                    <p>⚔️ Monsters (${game.stats.monstersSlain}): <strong style="color: #6bcf7f;">+${monsterBonus}</strong></p>
                    <p>🚪 Rooms Cleared: <strong style="color: #ffd700;">${game.stats.roomsCleared}</strong></p>
                    <p>💔 Damage Taken: <strong style="color: #ff6b6b;">${game.stats.totalDamage}</strong></p>
                    <p>💊 Potions Used: <strong style="color: #aaa;">${game.stats.potionsUsed || 0}</strong></p>
                </div>
                
                ${bonusesHTML}
                
                <p style="color: #ff6b6b; margin-top: 8px;">⏱️ Time Penalty (${Math.floor(timeInSeconds/60)}m${timeInSeconds%60}s): -${timePenalty}</p>
                
                <p style="margin-top: 10px;">📿 Relics: ${relicsHTML}</p>
        </div>
    `;
    } else {
        // DEATH: Show run statistics (same format as victory)
        const timeInSeconds = Math.max(1, gameTime);
        const roomsBonus = game.stats.roomsCleared * 50;
        const monstersBonus = game.stats.monstersSlain * 10;
        const goldBonus = game.totalGoldEarned * 2;
        const comboBonus = game.stats.maxCombo * 5;
        const timePenalty = Math.floor(timeInSeconds * 0.5);
        const shopsVisited = game.stats.shopsVisited || 0;
        
        // Relics collected - extract emoji from name (first character/emoji)
        const relicsHTML = game.relics.length > 0 
            ? game.relics.map(r => {
                const emoji = r.name ? r.name.split(' ')[0] : '📿';
                const fullName = r.name || 'Unknown Relic';
                return `<span title="${fullName}" style="font-size: 1.2em; cursor: help;">${emoji}</span>`;
            }).join(' ')
            : '<span style="color: #888;">None</span>';
        
        scoreBreakdownHTML = `
            <div class="game-over-stats" style="background: rgba(0,0,0,0.4); border: 1px solid #ff6b6b; margin-bottom: 15px; text-align: left; padding: 15px; border-radius: 8px;">
                <p style="color: #ff6b6b; font-weight: bold; font-size: 1.1em; margin-bottom: 12px;">📊 Run Statistics:</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                    <p>🚪 Rooms Cleared: <strong style="color: #ffd700;">${game.stats.roomsCleared}</strong></p>
                    <p>⚔️ Monsters Slain: <strong style="color: #ffd700;">${game.stats.monstersSlain}</strong></p>
                    <p>💰 Gold Earned: <strong style="color: #ffd700;">${game.totalGoldEarned}</strong></p>
                    <p>🔥 Max Combo: <strong style="color: #ffd700;">${game.stats.maxCombo}x</strong></p>
                    <p>💔 Damage Taken: <strong style="color: #ff6b6b;">${game.stats.totalDamage}</strong></p>
                    <p>⏱️ Time: <strong style="color: #aaa;">${Math.floor(timeInSeconds/60)}m${timeInSeconds%60}s</strong></p>
                    <p>🏺 Shop Visits: <strong style="color: #aaa;">${shopsVisited}</strong></p>
                    <p>💊 Potions Used: <strong style="color: #6bcf7f;">${game.stats.potionsUsed || 0}</strong></p>
                </div>
                
                <p style="margin-top: 10px;">📿 Relics: ${relicsHTML}</p>
                
                <hr style="border: none; border-top: 1px solid #5a4a38; margin: 12px 0;">
                
                <p style="font-size: 0.9em; color: #aaa;">
                    Score: 🚪 ${roomsBonus} + ⚔️ ${monstersBonus} + 💰 ${goldBonus} + 🔥 ${comboBonus} - ⏱️ ${timePenalty}
                </p>
            </div>
        `;
    }
    
    // Build the game over modal HTML
    overlay.innerHTML = `
        <div class="modal-content game-over-content" style="max-width: 550px; border: 3px solid ${isVictory ? '#ffd700' : '#ff6b6b'};">
            <h2 style="color: ${isVictory ? '#ffd700' : '#ff6b6b'}; font-size: 2em; margin-bottom: 15px;">${title}</h2>
            <p style="color: #ddd; font-size: 1.1em; margin-bottom: 20px; font-style: italic;">${message}</p>
            
            ${scoreBreakdownHTML}
            
            <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                ${reason === 'boss_fled' ? `
                    <p style="color: #aaa; font-size: 0.9em; margin-bottom: 5px;">Score:</p>
                    <p style="color: #ffd700; font-size: 2.5em; font-weight: bold; margin-bottom: 10px;">${score}</p>
                    <p class="boss-fled-penalty" style="
                        color: #ff4444;
                        font-size: 1.2em;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        animation: pulsePenalty 0.8s ease-in-out infinite;
                        text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;
                        margin-top: 5px;
                    ">⚠️ BOSS FLED: -50% PENALTY ⚠️</p>
                    <style>
                        @keyframes pulsePenalty {
                            0%, 100% { opacity: 1; transform: scale(1); }
                            50% { opacity: 0.7; transform: scale(1.05); }
                        }
                    </style>
                ` : `
                    <p style="color: #aaa; font-size: 0.9em; margin-bottom: 5px;">${scoreLabel}</p>
                    <p style="color: ${isVictory ? '#ffd700' : '#ff6b6b'}; font-size: 2.5em; font-weight: bold;">${score}</p>
                `}
            </div>
            
            <div class="modal-controls" style="display: flex; gap: 10px; justify-content: center;">
                ${submitButtonHTML}
                <button class="btn btn-primary" id="btnPlayAgain">🎮 Play Again</button>
            </div>
        </div>
    `;
    
    // Add overlay to DOM
    document.body.appendChild(overlay);
    
    // Now attach event handlers (elements exist in DOM now)
    document.getElementById('btnPlayAgain').onclick = () => {
        overlay.remove();
        btnStartGameModal.disabled = false; // Reset button
        
        // Check if this is first death or every 5th death (stored before modal appeared)
        const lifetimeStats = storage.get('scoundrel_lifetime_stats', {});
        const totalDeaths = lifetimeStats.deaths || 0;
        const shouldShowModal = reason === 'death' && !gaveUp && (totalDeaths === 1 || (totalDeaths >= 5 && totalDeaths % 5 === 0));
        
        if (shouldShowModal) {
            // Show encouraging modal AFTER game over modal is closed
            const isFirstDeath = totalDeaths === 1;
            showEncouragingModal(isFirstDeath, () => {
                // Callback: Return to menu AFTER modal is closed
                music.switchContext('menu');
                showWelcomeScreen();
            });
        } else {
            // No modal needed, go straight to menu
            music.switchContext('menu');
            showWelcomeScreen();
        }
    };
    
    if (isVictory) {
        const btnSubmitScore = document.getElementById('btnSubmitScore');
        
        // AUTO-SUBMIT: Enviar automaticamente sem input do player
        (async () => {
            const btn = btnSubmitScore;
            setButtonLoading(btn, true);
            btn.textContent = '📤 Sending...';
            hapticFeedback('medium');
            
            try {
                const result = await submitScoreToLeaderboard(score, gameTime);
                
                // Check if score made it to top 10
                if (result && result.rankPosition) {
                    btn.textContent = `🏆 TOP 10! #${result.rankPosition}`;
                    btn.style.background = 'linear-gradient(180deg, #ffd700 0%, #f5a623 100%)';
                    btn.style.color = '#1a1410';
                    btn.style.fontWeight = 'bold';
                    btn.style.animation = 'pulsePenalty 0.5s ease-in-out 3'; // Reuse pulse animation
                    playSound('victory'); // Special sound for top 10!
                    createParticles(btn.offsetLeft + btn.offsetWidth/2, btn.offsetTop, '#ffd700', 30);
                } else {
                    btn.textContent = '✅ Score Submitted!';
                    btn.style.background = 'linear-gradient(180deg, #6bcf7f 0%, #4ecdc4 100%)';
                }
                btn.disabled = true; // Prevent re-submission
                hapticFeedback('success');
                pulseElement(btn, result?.rankPosition ? '#ffd700' : '#6bcf7f');
                
                // Auto-close modal after 2 seconds on success
                setTimeout(() => {
                    const gameOverOverlay = document.querySelector('.game-over-overlay');
                    if (gameOverOverlay) gameOverOverlay.remove();
                }, 2000);
            } catch (err) {
                setButtonLoading(btn, false);
                btn.textContent = '❌ Submission Failed';
                btn.style.background = 'linear-gradient(180deg, #ff6b6b 0%, #d63031 100%)';
                hapticFeedback('error');
                shakeElement(btn);
                console.error("Score submission error:", err);
                
                // Allow manual retry on error
                btn.disabled = false;
                btn.textContent = '🔄 Retry Submit';
                btn.onclick = async () => {
                    setButtonLoading(btn, true);
                    try {
                        const retryResult = await submitScoreToLeaderboard(score, gameTime);
                        if (retryResult && retryResult.rankPosition) {
                            btn.textContent = `🏆 TOP 10! #${retryResult.rankPosition}`;
                            btn.style.background = 'linear-gradient(180deg, #ffd700 0%, #f5a623 100%)';
                            btn.style.color = '#1a1410';
                            playSound('victory');
                        } else {
                            btn.textContent = '✅ Score Submitted!';
                            btn.style.background = 'linear-gradient(180deg, #6bcf7f 0%, #4ecdc4 100%)';
                        }
                        btn.disabled = true;
                        hapticFeedback('success');
                    } catch (retryErr) {
                        setButtonLoading(btn, false);
                        btn.textContent = '❌ Failed Again';
                        console.error("Retry failed:", retryErr);
                    }
                };
            }
        })();
    }
}

function spawnFinalBoss() {
    // CRITICAL: Prevent duplicate spawns
    if (game.finalBossSpawned) {
        return;
    }
    
    game.finalBossSpawned = true; // Mark as spawned
    
    // Spawn final boss based on difficulty
    const difficultyHP = {
        easy: 20,
        normal: 30,
        hard: 40
    };
    
    const finalBossHP = difficultyHP[game.difficulty] || 30;
    
    const finalBoss = {
        suit: '',
        value: '',
        numValue: finalBossHP,
        maxHP: finalBossHP,
        isBoss: true,
        bossNumber: 99,  // Special marker for final boss
        bossName: 'The Dungeon Lord',
        bossFlavor: 'The master of this cursed place. Defeat them to claim your victory!'
    };
    
    game.room = [finalBoss];
    
    playSound('special');
    showMessage('', 'danger');
    setTimeout(() => showMessage(finalBoss.bossFlavor, 'warning'), 1500);
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 100);
    
    // Screen shake for dramatic effect
    screenShake();
    
    updateUI();
}

function showEncouragingModal(isFullVersion = true, onCloseCallback = null) {
    // Create a moment of silence - pause the music for contemplation
    const wasPlaying = music.isPlaying;
    if (wasPlaying) {
        music.stop();
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    
    if (isFullVersion) {
        // FIRST DEATH: Full modal with tips
        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 600px; border: 3px solid #ffd700;">
                <button class="modal-close-btn" id="btnEncouragingClose1">✕</button>
                <h1 style="color: #ffd700;">DON'T GIVE UP!</h1>
                <div style="text-align: left; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; margin: 20px 0;">
                    <p style="font-size: 1.1em; color: #ddd; margin-bottom: 15px;"><strong style="color: #ff6b6b;">Death is just the beginning.</strong> This game is intentionally challenging!</p>
                    
                    <p style="font-size: 1em; color: #c9a961; margin-bottom: 10px;"><strong>Tips for Success:</strong></p>
                    <ul style="color: #aaa; line-height: 1.8; margin-left: 20px;">
                        <li><strong style="color: #6bcf7f;">Always equip weapons</strong> before fighting monsters</li>
                        <li><strong style="color: #ffd93d;">Visit the Shop (S)</strong> to buy relics and upgrades</li>
                        <li><strong style="color: #d4af37;">Unlock permanent upgrades</strong> that carry between runs</li>
                        <li><strong style="color: #a8edea;">Hold cards (right-click)</strong> for strategic plays</li>
                        <li><strong style="color: #ff6b6b;">Start on Easy</strong> to learn the mechanics</li>
                        <li><strong style="color: #c9a961;">Read the Tutorial</strong> for detailed strategies</li>
                    </ul>
                    
                    <p style="font-size: 1em; color: #6bcf7f; margin-top: 20px; text-align: center;">Each death makes you stronger! Keep trying!</p>
                </div>
                
                <div style="text-align: center; padding: 20px 15px; margin: 15px 0; background: linear-gradient(135deg, rgba(78, 205, 196, 0.15) 0%, rgba(107, 207, 127, 0.15) 100%); border-radius: 12px; border: 2px solid rgba(212, 175, 55, 0.3); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);">
                    <p style="font-family: 'Cinzel Decorative', 'Cinzel', serif; font-size: 1.3em; font-weight: 700; color: #ffd700; margin: 0; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8); letter-spacing: 0.05em; line-height: 1.4;">
                        Dreams never get old
                    </p>
                    <p style="font-family: 'Cinzel', serif; font-size: 0.95em; font-style: italic; color: #c9a961; margin: 8px 0 0 0; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6); letter-spacing: 0.03em;">
                        Os sonhos não envelhecem
                    </p>
                </div>
                
                <div class="modal-controls">
                    <button class="btn btn-primary" id="btnEncouragingOK1">I'LL TRY AGAIN!</button>
                </div>
            </div>
        `;
        
        // Add soft ambient sound when modal opens (optional whisper of wind)
        setTimeout(() => {
            // Gentle visual pulse effect
            const modalContent = overlay.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.animation = 'gentlePulse 3s ease-in-out infinite';
            }
        }, 100);
    } else {
        // EVERY 5TH DEATH: Simplified motivational modal
        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 550px; border: 3px solid #ffd700; text-align: center;">
                <button class="modal-close-btn" id="btnEncouragingClose2">✕</button>
                
                <div style="padding: 40px 30px;">
                    <h1 style="font-family: 'Cinzel Decorative', 'Cinzel', serif; font-size: 2.5em; font-weight: 900; color: #ffd700; margin: 0 0 30px 0; text-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.8); letter-spacing: 0.08em; line-height: 1.3;">
                        DON'T GIVE UP
                    </h1>
                    
                    <div style="padding: 35px 25px; margin: 30px 0; background: linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(107, 207, 127, 0.2) 100%); border-radius: 16px; border: 3px solid rgba(212, 175, 55, 0.5); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), inset 0 2px 10px rgba(255, 215, 0, 0.1);">
                        <p style="font-family: 'Cinzel Decorative', 'Cinzel', serif; font-size: 2em; font-weight: 700; color: #ffd700; margin: 0; text-shadow: 0 0 15px rgba(255, 215, 0, 0.7), 0 3px 6px rgba(0, 0, 0, 0.9); letter-spacing: 0.06em; line-height: 1.5;">
                            DREAMS NEVER GET OLD
                        </p>
                        <p style="font-family: 'Cinzel', serif; font-size: 1.2em; font-style: italic; color: #c9a961; margin: 20px 0 0 0; text-shadow: 0 2px 5px rgba(0, 0, 0, 0.7); letter-spacing: 0.04em;">
                            Os sonhos não envelhecem
                        </p>
                    </div>
                </div>
                
                <div class="modal-controls">
                    <button class="btn btn-primary" id="btnEncouragingOK2" style="font-size: 1.1em; padding: 14px 28px;">KEEP FIGHTING!</button>
                </div>
            </div>
        `;
        
        // Gentle golden glow effect
        setTimeout(() => {
            const modalContent = overlay.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.animation = 'goldenGlow 4s ease-in-out infinite';
            }
        }, 100);
    }
    
    document.body.appendChild(overlay);
    
    // Add click handlers for ALL buttons (OK and X)
    const btn1 = document.getElementById('btnEncouragingOK1');
    const btn2 = document.getElementById('btnEncouragingOK2');
    const closeBtn1 = document.getElementById('btnEncouragingClose1');
    const closeBtn2 = document.getElementById('btnEncouragingClose2');
    
    const handleClose = () => {
        // Resume music if it was playing
        if (wasPlaying && typeof music !== 'undefined') {
            music.start();
        }
        // Remove modal
        overlay.remove();
        // Execute callback if provided
        if (onCloseCallback) {
            onCloseCallback();
        }
    };
    
    // Attach handler to whichever buttons exist
    if (btn1) btn1.onclick = handleClose;
    if (btn2) btn2.onclick = handleClose;
    if (closeBtn1) closeBtn1.onclick = handleClose;
    if (closeBtn2) closeBtn2.onclick = handleClose;
}

function showMessage(text, type) {
    const msgEl = document.createElement('div');
    msgEl.className = `message ${type}`;
    msgEl.textContent = text;
    messageArea.appendChild(msgEl);
    
    // Adjust duration based on importance
    const duration = type === 'danger' ? 4000 : (type === 'success' ? 2500 : 3000);
    
    setTimeout(() => {
        msgEl.style.opacity = '0';
        setTimeout(() => msgEl.remove(), 500);
    }, duration);
}

// ============================================
// UI UPDATE
// ============================================

function updateRunningScore() {
    game.score = (game.stats.monstersSlain * 10) + (game.stats.roomsCleared * 50) + game.totalGoldEarned;
    mainScoreValue.textContent = game.score;
}

// ============================================
// HOLD CARD FUNCTION
// ============================================
function holdCard(card, index) {
    // Calculate max hold capacity (uses classData like updateUI)
    let maxHold = (game.classData && game.classData.passive.maxHoldCards) || CARDS.DEFAULT_HOLD_CAPACITY;
    // Feather relic: +1 hold slot
    if (game.relics.some(r => r.id === 'feather')) maxHold += CARDS.FEATHER_BONUS_SLOTS;
    
    // Check if already at capacity
    const currentHeldCount = game.heldCard ? (Array.isArray(game.heldCard) ? game.heldCard.length : 1) : 0;
    
    if (currentHeldCount >= maxHold) {
        showMessage(`Cannot hold more than ${maxHold} card${maxHold > 1 ? 's' : ''}!`, 'error');
        return;
    }
    
    // Check card type - only weapons and potions can be held
    const type = getCardType(card);
    if (type === 'special') {
        showMessage('Cannot hold special cards!', 'error');
        return;
    }
    if (type === 'monster') {
        showMessage('Cannot hold monsters!', 'error');
        return;
    }
    
    // Remove card from room
    const removedCard = game.room.splice(index, 1)[0];
    
    // Add to held cards
    if (!game.heldCard) {
        game.heldCard = maxHold > 1 ? [removedCard] : removedCard;
    } else if (Array.isArray(game.heldCard)) {
        game.heldCard.push(removedCard);
    } else {
        // Convert single card to array
        game.heldCard = [game.heldCard, removedCard];
    }
    
    // Track stat
    if (game.stats) game.stats.cardsHeld++;
    
    playSound('cardFlip');
    showMessage('Card held!', 'success');
    updateUI();
    
    // CRITICAL: Check if room is now empty after holding card
    // This enables buttons if player held the last card
    checkGameState();
}

function updateUI() {
    // Check for death FIRST (critical bug fix)
    if (game.health <= 0 && !game.gameOver) {
        endGame('death');
        return; // Stop updating UI
    }
    
    // HP Critical Warning
    if (game.health > 0 && game.health <= HEALTH.CRITICAL_THRESHOLD) {
        document.body.classList.add('hp-critical');
        // Show warning message first time
        if (!game.criticalWarningShown) {
            showMessage('⚠️ CRITICAL HP! Find healing soon!', 'danger');
            game.criticalWarningShown = true;
        }
    } else {
        document.body.classList.remove('hp-critical');
        game.criticalWarningShown = false;
    }
    
    // Top Bar
    healthEl.textContent = `${game.health} / ${game.maxHealth}`;
    goldEl.textContent = game.gold;
    
    // Show next cards if player has Map or Candle relic
    const hasMap = game.relics.some(r => r.id === 'map');
    const hasCandle = game.relics.some(r => r.id === 'candle');
    
    if (hasMap && game.dungeon.length > 0) {
        const preview = game.dungeon.slice(0, 3).map(c => `${c.value}${c.suit}`).join(' ');
        dungeonCountEl.textContent = `${game.dungeon.length} (🗺️ ${preview})`;
    } else if (hasCandle && game.dungeon.length > 0) {
        const preview = game.dungeon[0];
        dungeonCountEl.textContent = `${game.dungeon.length} (🕯️ ${preview.value}${preview.suit})`;
    } else {
        dungeonCountEl.textContent = game.dungeon.length;
    }
    
    statRoomsEl.textContent = game.stats.roomsCleared;
    mainScoreValue.textContent = game.score; // Update main score
    
    // Show active class buff indicator (OPTIMIZED: reuse element)
    let buffIndicator = document.getElementById('classBuffIndicator');
    if (game.classAbilityActive && game.classAbilityCounter > 0) {
        if (!buffIndicator) {
            buffIndicator = document.createElement('div');
            buffIndicator.style.cssText = 'position: fixed; top: 120px; right: 20px; background: rgba(255, 215, 0, 0.9); color: #000; padding: 10px 15px; border-radius: 8px; font-weight: bold; z-index: 100; animation: pulse 1s infinite;';
            buffIndicator.id = 'classBuffIndicator';
            document.body.appendChild(buffIndicator);
        }
        
        if (game.playerClass === 'rogue') {
            buffIndicator.innerHTML = `🔪 SHADOW STRIKE<br><small>2x damage, combo safe!</small>`;
        } else if (game.playerClass === 'dancer') {
            buffIndicator.innerHTML = `💃 HEALING DANCE<br><small>+2 dmg (${game.classAbilityCounter} left)</small>`;
        }
    } else if (buffIndicator) {
        buffIndicator.remove();
    }
    
    // Berserk stacks indicator (OPTIMIZED: reuse element)
    let berserkIndicator = document.getElementById('berserkIndicator');
    if (game.berserkStacks > 0) {
        if (!berserkIndicator) {
            berserkIndicator = document.createElement('div');
            berserkIndicator.style.cssText = 'position: fixed; top: 160px; right: 20px; background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: #fff; padding: 10px 15px; border-radius: 8px; font-weight: bold; z-index: 100; box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4); animation: pulse 1s infinite;';
            berserkIndicator.id = 'berserkIndicator';
            document.body.appendChild(berserkIndicator);
        }
        berserkIndicator.innerHTML = `🔥 BERSERK x${game.berserkStacks}<br><small>+5 damage per attack</small>`;
    } else {
        // Remove indicator when stacks reach 0
        if (berserkIndicator) {
            berserkIndicator.remove();
        }
    }
    
    // Undo button visibility (Easy/Normal only)
    const btnUndo = document.getElementById('btnUndo');
    if (btnUndo && (game.difficulty === 'easy' || game.difficulty === 'normal')) {
        btnUndo.style.display = 'inline-block';
        btnUndo.disabled = !game.undoAvailable;
    } else if (btnUndo) {
        btnUndo.style.display = 'none';
    }

    // Center Stage - Weapon
    equippedWeaponEl.innerHTML = '';
    if (game.equippedWeapon) {
        const cardEl = createCardElement(game.equippedWeapon);
        cardEl.classList.add('equipped');
        
        const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
        const berserkBonus = game.berserkStacks > 0 ? 5 : 0;
        const bloodlustBonus = getBloodlustBonus(); // Berserker passive
        const comboBonus = getComboBonus(); // Combo damage
        
        // Calculate TOTAL damage including all buffs
        const baseDamage = game.equippedWeapon.numValue;
        const totalBuffs = powerBonus + berserkBonus + bloodlustBonus + comboBonus;
        const damageBeforeDouble = baseDamage + totalBuffs;
        const finalDamage = game.doubleDamage ? damageBeforeDouble * 2 : damageBeforeDouble;
        
        // Show badge if there's any buff or modifier active
        if (powerBonus > 0 || game.doubleDamage || berserkBonus > 0 || bloodlustBonus > 0 || comboBonus > 0) {
            const badge = document.createElement('div');
            badge.style.cssText = 'position:absolute;top:5px;right:5px;background:#ffd93d;color:#000;padding:3px 8px;border-radius:10px;font-size:0.8em;font-weight:bold;';
            
            // Show FINAL damage value
            badge.textContent = `${finalDamage}`;
            
            // Red background when Berserk is active for visibility
            if (berserkBonus > 0) {
                badge.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
                badge.style.color = '#fff';
                badge.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.4)';
            }
            // Purple background when Power (2x) is active
            else if (game.doubleDamage) {
                badge.style.background = 'linear-gradient(135deg, #a78bfa, #8b5cf6)';
                badge.style.color = '#fff';
                badge.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.4)';
            }
            
            cardEl.appendChild(badge);
        }
        
        // Durability indicator
        if (game.equippedWeapon.durability < 999) {
            const durabilityBar = document.createElement('div');
            durabilityBar.style.cssText = 'position:absolute;bottom:5px;left:5px;right:5px;height:8px;background:rgba(0,0,0,0.5);border-radius:4px;overflow:hidden;';
            
            const durabilityFill = document.createElement('div');
            const percentage = (game.equippedWeapon.durability / game.equippedWeapon.maxDurability) * 100;
            let fillColor = '#6bcf7f'; // Green (full)
            if (percentage <= 33) fillColor = '#ff6b6b'; // Red (low)
            else if (percentage <= 66) fillColor = '#ffd93d'; // Yellow (medium)
            
            durabilityFill.style.cssText = `height:100%;width:${percentage}%;background:${fillColor};transition:all 0.3s ease;`;
            durabilityBar.appendChild(durabilityFill);
            
            const durabilityText = document.createElement('div');
            const durabilityIcon = game.equippedWeapon.durability === 1 ? '⚠️' : '⚔️';
            durabilityText.style.cssText = 'position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:2px 6px;border-radius:8px;font-size:0.7em;font-weight:bold;white-space:nowrap;';
            durabilityText.textContent = `${durabilityIcon} ${game.equippedWeapon.durability}/${game.equippedWeapon.maxDurability}`;
            
            cardEl.appendChild(durabilityBar);
            cardEl.appendChild(durabilityText);
        }
        
        equippedWeaponEl.appendChild(cardEl);
    } else {
        equippedWeaponEl.innerHTML = '<div class="empty-slot">No Weapon</div>';
    }
    
    // Right Bar - Hold (supports multiple cards for Rogue)
    holdAreaContainer.innerHTML = '';
    let maxHold = (game.classData && game.classData.passive.maxHoldCards) || 1;
    
    // Feather relic: +1 hold slot
    if (game.relics.some(r => r.id === 'feather')) maxHold += 1;
    
    if (game.heldCard) {
        // Handle both single card and array of cards
        const heldCards = Array.isArray(game.heldCard) ? game.heldCard : [game.heldCard];
        
        // ROGUE: Multiple cards - show ONE at a time with navigation
        if (maxHold > 1 && heldCards.length > 1) {
            // Ensure index is valid
            if (game.heldCardIndex >= heldCards.length) game.heldCardIndex = 0;
            if (game.heldCardIndex < 0) game.heldCardIndex = heldCards.length - 1;
            
            const currentCard = heldCards[game.heldCardIndex];
            
            // Navigation container
            const navContainer = document.createElement('div');
            navContainer.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px;';
            
            // Left arrow
            const leftArrow = document.createElement('button');
            leftArrow.innerHTML = '\u25c0';
            leftArrow.className = 'held-nav-btn';
            leftArrow.style.cssText = 'background: rgba(0,0,0,0.5); border: 2px solid #ffd93d; color: #ffd93d; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1em; display: flex; align-items: center; justify-content: center; transition: all 0.3s;';
            leftArrow.onmouseover = () => leftArrow.style.background = 'rgba(255, 217, 61, 0.3)';
            leftArrow.onmouseout = () => leftArrow.style.background = 'rgba(0,0,0,0.5)';
            leftArrow.onclick = (e) => {
                e.stopPropagation();
                game.heldCardIndex = (game.heldCardIndex - 1 + heldCards.length) % heldCards.length;
                updateUI();
            };
            
            // Counter
            const counter = document.createElement('div');
            counter.style.cssText = 'color: #ffd93d; font-weight: bold; font-size: 0.9em; min-width: 35px; text-align: center;';
            counter.textContent = `${game.heldCardIndex + 1}/${heldCards.length}`;
            
            // Right arrow
            const rightArrow = document.createElement('button');
            rightArrow.innerHTML = '\u25b6';
            rightArrow.className = 'held-nav-btn';
            rightArrow.style.cssText = 'background: rgba(0,0,0,0.5); border: 2px solid #ffd93d; color: #ffd93d; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1em; display: flex; align-items: center; justify-content: center; transition: all 0.3s;';
            rightArrow.onmouseover = () => rightArrow.style.background = 'rgba(255, 217, 61, 0.3)';
            rightArrow.onmouseout = () => rightArrow.style.background = 'rgba(0,0,0,0.5)';
            rightArrow.onclick = (e) => {
                e.stopPropagation();
                game.heldCardIndex = (game.heldCardIndex + 1) % heldCards.length;
                updateUI();
            };
            
            navContainer.appendChild(leftArrow);
            navContainer.appendChild(counter);
            navContainer.appendChild(rightArrow);
            holdAreaContainer.appendChild(navContainer);
            
            // Show current card
            const cardEl = createCardElement(currentCard);
            cardEl.classList.add('held');
            cardEl.onclick = () => {
                const selectedCard = game.heldCard.splice(game.heldCardIndex, 1)[0];
                if (game.heldCard.length === 0) {
                    game.heldCard = null;
                    game.heldCardIndex = 0;
                } else {
                    // Adjust index if needed
                    if (game.heldCardIndex >= game.heldCard.length) game.heldCardIndex = 0;
                }
                
                // CRITICAL: Process card directly WITHOUT adding to room first
                // Adding to room causes checkGameState() to see room.length = 1
                
                // Determine card type and process accordingly
                const cardType = getCardType(selectedCard);
                
                if (cardType === 'potion') {
                    // For potions: add to room temporarily, then handlePotion removes it
                    game.room.unshift(selectedCard);
                    updateUI();
                    handlePotion(selectedCard, 0);
                } else if (cardType === 'weapon') {
                    // For weapons: add to room temporarily, then handleWeapon removes it
                    game.room.unshift(selectedCard);
                    updateUI();
                    handleWeapon(selectedCard, 0);
                } else {
                    // For other cards: add to room and let player click
                    game.room.unshift(selectedCard);
                    updateUI();
                }
                
            };
            holdAreaContainer.appendChild(cardEl);
            
        } else {
            // Single card or single-hold classes: show normally
            heldCards.forEach((card, idx) => {
                const cardEl = createCardElement(card);
                cardEl.classList.add('held');
                cardEl.style.marginBottom = '10px';
                cardEl.onclick = () => {
                    // Use held card (works for both single and array)
                    let selectedCard;
                    if (Array.isArray(game.heldCard)) {
                        selectedCard = game.heldCard.splice(idx, 1)[0];
                        if (game.heldCard.length === 0) game.heldCard = null;
                    } else {
                        selectedCard = game.heldCard;
                        game.heldCard = null;
                    }
                    
                    // CRITICAL: Process card directly WITHOUT adding to room first
                    
                    // Determine card type and process accordingly
                    const cardType = getCardType(selectedCard);
                    
                    if (cardType === 'potion') {
                        // For potions: add to room temporarily, then handlePotion removes it
                        game.room.unshift(selectedCard);
                        updateUI();
                        handlePotion(selectedCard, 0);
                    } else if (cardType === 'weapon') {
                        // For weapons: add to room temporarily, then handleWeapon removes it
                        game.room.unshift(selectedCard);
                        updateUI();
                        handleWeapon(selectedCard, 0);
                    } else {
                        // For other cards: add to room and let player click
                        game.room.unshift(selectedCard);
                        updateUI();
                    }
                    
                };
                holdAreaContainer.appendChild(cardEl);
            });
            
            // Show count if multiple slots
            if (maxHold > 1) {
                const countEl = document.createElement('div');
                countEl.style.cssText = 'text-align:center;color:#ffd93d;font-size:0.9em;margin-top:5px;';
                countEl.textContent = `${heldCards.length}/${maxHold} held`;
                holdAreaContainer.appendChild(countEl);
            }
        }
    } else {
        const emptyText = maxHold > 1 ? `Right-click to hold (0/${maxHold})` : 'Right-click to hold';
        holdAreaContainer.innerHTML = `<div class="empty-slot" style="font-size: 0.8em;">${emptyText}</div>`;
    }
    
    // Right Bar - Discard
    discardPilePreview.innerHTML = '';
    const lastFive = game.discardPile.slice(-5).reverse();
    if (lastFive.length > 0) {
        lastFive.forEach(card => {
            discardPilePreview.appendChild(createMiniCardElement(card));
        });
    } else {
        discardPilePreview.innerHTML = '<span style="font-size: 0.8em; opacity: 0.5;">Empty</span>';
    }

    // Bottom Bar - Room
    bottomBar.innerHTML = '';
    if (game.room.length > 0) {
        game.room.forEach((card, index) => {
            const cardEl = createCardElement(card);
            
            const tooltip = generateTooltip(card);
            if (tooltip) {
                const tooltipEl = document.createElement('div');
                tooltipEl.className = 'card-tooltip';
                tooltipEl.innerHTML = tooltip;
                cardEl.appendChild(tooltipEl);
            }
            
            // Add preview
            const type = getCardType(card);
            const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
            const baseWeaponVal = game.equippedWeapon ? game.equippedWeapon.numValue : 0;
            const effectiveWeapon = game.doubleDamage ? (baseWeaponVal + powerBonus) * 2 : (baseWeaponVal + powerBonus);

            if (type === 'monster') {
                const damage = card.numValue - effectiveWeapon;
                if (game.dodgeActive || damage <= 0) cardEl.classList.add('preview-safe');
                else cardEl.classList.add('preview-danger');
            } else if (type === 'weapon') {
                const current = baseWeaponVal + powerBonus;
                const cardValue = card.numValue + powerBonus;
                if (cardValue > current) cardEl.classList.add('preview-safe');
                else if (cardValue < current) cardEl.classList.add('preview-danger');
                else cardEl.classList.add('preview-neutral');
            } else if (type === 'potion') {
                const maxPotions = (game.classData && game.classData.passive.maxPotionsPerRoom) || 1;
                if (game.potionsUsed >= maxPotions) cardEl.classList.add('preview-danger');
                else cardEl.classList.add('preview-safe');
            } else if (type === 'special') {
                cardEl.classList.add('preview-safe');
            }
            
            // Click events
            cardEl.onclick = (e) => {
                e.stopPropagation();
                playSound('cardFlip');
                handleCardClick(card, index);
            };
            cardEl.oncontextmenu = (e) => {
                e.preventDefault();
                e.stopPropagation();
                holdCard(card, index);
            };
            
            bottomBar.appendChild(cardEl);
        });
    } else if (!game.gameOver) {
         bottomBar.innerHTML = '<div class="empty-slot">Dungeon Empty. Use controls above.</div>';
    }
    
    // Update class ability UI
    if (game.classData) {
        updateAbilityUI();
    }
}

function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    const type = getCardType(card);
    cardEl.classList.add(type);
    
    // Boss special styling
    if (card.isBoss) {
        cardEl.classList.add('boss');
        cardEl.style.boxShadow = '0 0 30px rgba(255, 107, 107, 0.8)';
        cardEl.style.borderColor = '#ff6b6b';
        cardEl.style.animation = 'bossPulse 1.5s infinite';
    }

    if (type === 'special') {
        cardEl.innerHTML = `
            <div class="card-value">${card.special.name.split(' ')[0]}</div>
            <div style="font-size: 0.8em; padding: 0 5px;">${card.special.name.split(' ').slice(1).join(' ')}</div>
            <div class="card-suit">✨</div>
        `;
    } else if (card.isBoss) {
        // Calculate HP percentage for bar
        const hpPercent = card.maxHP ? (card.numValue / card.maxHP) * 100 : 100;
        const hpColor = hpPercent > 66 ? '#6bcf7f' : (hpPercent > 33 ? '#ffd93d' : '#ff6b6b');
        
        cardEl.innerHTML = `
            <div class="card-value" style="font-size: 2em;">👹</div>
            <div style="font-size: 0.9em; color: #ff6b6b; font-weight: bold;">BOSS</div>
            <div class="card-suit" style="font-size: 1.2em; color: #ff6b6b;">${card.numValue} HP</div>
            <div style="width: 90%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; margin: 5px auto 0; overflow: hidden;">
                <div style="width: ${hpPercent}%; height: 100%; background: ${hpColor}; transition: all 0.3s ease; border-radius: 4px;"></div>
            </div>
        `;
    } else {
        cardEl.innerHTML = `
            <div class="card-value">${card.value}</div>
            <div class="card-suit">${card.suit}</div>
        `;
        
        // DAMAGE PREVIEW for monster cards
        if (type === 'monster' && card.numValue > 0) {
            const baseWeapon = game.equippedWeapon ? game.equippedWeapon.numValue : 0;
            const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
            const berserkBonus = game.berserkStacks > 0 ? 5 : 0;
            const totalDamage = baseWeapon + powerBonus + berserkBonus;
            const netDamage = card.numValue - totalDamage;
            
            const dmgBadge = document.createElement('div');
            dmgBadge.style.cssText = 'position:absolute;top:5px;left:5px;padding:4px 8px;border-radius:8px;font-size:0.75em;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.3);color:#fff;';
            
            if (totalDamage === 0) {
                dmgBadge.textContent = '✊ 0';
                dmgBadge.style.background = 'linear-gradient(135deg,#999,#666)';
            } else if (netDamage <= 0) {
                dmgBadge.textContent = `⚔️ ${totalDamage}`;
                dmgBadge.style.background = 'linear-gradient(135deg,#6bcf7f,#2fbf71)';
            } else {
                dmgBadge.textContent = `⚔️ ${totalDamage} (-${netDamage})`;
                dmgBadge.style.background = 'linear-gradient(135deg,#ff6b6b,#ee5a52)';
            }
            cardEl.appendChild(dmgBadge);
        }
        
        // Bell relic: Show gold value on cards
        if (game.relics.some(r => r.id === 'bell') && card.numValue > 0) {
            const goldBadge = document.createElement('div');
            goldBadge.style.cssText = 'position:absolute;top:5px;right:5px;background:rgba(255,215,0,0.9);color:#000;padding:2px 6px;border-radius:8px;font-size:0.7em;font-weight:bold;';
            goldBadge.textContent = `💰${card.numValue}`;
            cardEl.appendChild(goldBadge);
        }
    }
    return cardEl;
}

function createMiniCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'mini-card';
    const type = getCardType(card);
    cardEl.classList.add(type);

    if (type === 'special') {
        cardEl.innerHTML = `<span class="card-value">✨</span>`;
    } else {
        cardEl.innerHTML = `
            <span class="card-value">${card.value}</span>
            <span class="card-suit">${card.suit}</span>
        `;
    }
    return cardEl;
}

// ============================================

// NOTE: permanentUnlocks and UNLOCKS are now imported from modules/game-state.js

// Support Functions (Shop, Relics, etc.)
// Helper: Take damage and reset combo (for events)
function takeDamage(amount) {
    game.health -= amount;
    game.stats.totalDamage = (game.stats.totalDamage || 0) + amount;
    resetCombo(); // Always reset combo when taking damage
    showDamageNumber(amount, 'damage');
}

function earnGold(amount) {
    let mult = 1.0;
    
    // Gold multipliers from relics
    if (game.relics.some(r => r.id === 'lucky_penny')) mult += 0.2;
    if (game.relics.some(r => r.id === 'magnet')) mult += 0.4;
    if (game.relics.some(r => r.id === 'lucky')) mult += 0.6;
    
    // Permanent unlocks
    if (permanentUnlocks.betterDrops) mult += 0.3;   // +30%
    if (permanentUnlocks.goldRush) mult += 0.5;      // +50%
    if (permanentUnlocks.luckyCharm) mult += 0.6;    // +60% (already implemented!)
    
    const actual = Math.floor(amount * mult);
    game.gold += actual;
    game.totalGoldEarned += actual;
    updateRunningScore(); // Update score
    updateUI();
}

// NOTE: Relic functions (giveRelicByRarity, giveRandomRelic, giveRareRelic, updateRelicsDisplay, getRelicBonus) moved to modules/game-relics.js

// NOTE: triggerRandomEvent and showEventModal moved to modules/game-events.js

// NOTE: Shop functions (updateShopDisplay, buyItem, openShop, closeShop) moved to modules/game-shop.js

// Modal open/close functions
function showTutorial() { 
    // ...
    tutorialModal.classList.add('active'); 
    trapFocus(tutorialModal);
    hapticFeedback('light');
}

function openUnlocks() { 
    updateUnlocksDisplay();
    unlocksModal.classList.add('active');
    trapFocus(unlocksModal);
    hapticFeedback('light');
}

function updateUnlocksDisplay() { 
    const unlocksList = document.getElementById('unlocksList');
    unlocksList.innerHTML = UNLOCKS.map(unlock => {
        const isUnlocked = permanentUnlocks[unlock.id];
        const canUnlock = !isUnlocked && unlock.check();
        return `
        <div class="unlock-item ${isUnlocked ? 'unlocked' : (canUnlock ? '' : 'locked')}">
            <div class="item-info">
                <div class="item-name">${unlock.name}</div>
                <div class="item-description">${unlock.description}</div>
                <div class="unlock-requirement">
                    ${isUnlocked ? '✅ UNLOCKED' : 
                      (canUnlock ? '✨ READY TO UNLOCK!' : `🔒 ${unlock.requirement}`)}
                </div>
            </div>
            ${!isUnlocked && canUnlock ? `
                <button class="buy-btn" onclick="unlockUpgradeWrapper('${unlock.id}')">
                    Unlock
                </button>
            ` : ''}
        </div>
    `}).join('');
}

// Track active filter for re-application after unlock
let activeUpgradeFilter = 'all';

window.unlockUpgradeWrapper = (unlockId) => {
    const unlockData = UNLOCKS.find(u => u.id === unlockId);

    permanentUnlocks[unlockId] = true;
    saveUnlocks();

    // Enhanced visual feedback
    showMessage(`✨ ${unlockData.name} UNLOCKED!`, 'success');
    playSound('special');
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 50);

    // Re-apply current filter to update the list
    if (activeUpgradeFilter !== 'all') {
        filterUpgradesByStatus(activeUpgradeFilter);
    } else {
        updateUnlocksDisplay();
    }

    // BUGFIX: Update codex UI immediately after unlock
    if (typeof window.populateCodexUpgrades === 'function') {
        window.populateCodexUpgrades();
    }
}

// Expose Give Up function globally for onclick
window.tryGiveUp = () => {
    if (game.gameStartTime > 0 && !game.gameOver) {
        document.getElementById('giveUpModal').classList.add('active');
    } else {
        showMessage('⚠️ Start a game first!', 'warning');
    }
}

// Expose closeShop globally for onclick
window.closeShopWrapper = () => closeShop();

// Expose closeEvent globally for onclick
window.closeEventWrapper = () => {
    eventModal.classList.remove('active');
    // Re-enable buttons if room is empty
    if (game.room.length === 0) {
        btnDrawRoom.removeAttribute('disabled');
        btnDrawRoom.disabled = false;
        if (game.lastActionWasAvoid) {
            btnAvoidRoom.setAttribute('disabled', 'disabled');
            btnAvoidRoom.disabled = true;
        } else {
            btnAvoidRoom.removeAttribute('disabled');
            btnAvoidRoom.disabled = false;
        }
    }
};

window.confirmGiveUp = () => {
    document.getElementById('giveUpModal').classList.remove('active');
    endGame('death', true);
}

function loadUnlocks() {
     const saved = localStorage.getItem('scoundrel_unlocks');
     if(saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(permanentUnlocks, parsed); // Modify object in-place (imports are read-only)
            return Object.keys(permanentUnlocks).filter(k => permanentUnlocks[k]); // Return unlocked IDs for Cloud Save
        } catch(e) { 
            console.error("Failed to parse unlocks:", e); 
            return [];
        }
     }
     return [];
}

function saveUnlocks() { 
    UNLOCKS.forEach(unlock => {
        if (!permanentUnlocks[unlock.id] && unlock.check()) {
            // We don't unlock here, just check. Unlocking is manual.
        }
    });
    localStorage.setItem('scoundrel_unlocks', JSON.stringify(permanentUnlocks)); 
    
    // Auto-save to cloud if logged in
    if (window.currentUser && window.saveProgressToCloud) {
        window.saveProgressToCloud().catch(err => console.warn('Cloud auto-save failed:', err));
    }
}

// Expose for firebase-auth.js
window.loadUnlocks = loadUnlocks;
window.saveUnlocks = saveUnlocks;

function applyPermanentUnlocks() {
    // Gold unlocks
    if (permanentUnlocks.startGold) earnGold(30);
    if (permanentUnlocks.richStart) earnGold(20); // Total 50
    if (permanentUnlocks.godMode) earnGold(100); // God Mode bonus
    
    // HP unlocks (apply before health is set)
    let bonusMaxHP = 0;
    if (permanentUnlocks.startHealth) bonusMaxHP += 5;
    if (permanentUnlocks.bigStart) bonusMaxHP += 10;
    if (permanentUnlocks.megaHealth) bonusMaxHP += 20;
    if (permanentUnlocks.godMode) bonusMaxHP += 15;
    if (bonusMaxHP > 0) {
        game.maxHealth += bonusMaxHP;
        game.health += bonusMaxHP;
    }
    
    // Relic unlocks
    if (permanentUnlocks.extraRelic) giveRandomRelic();
    if (permanentUnlocks.relicMaster) {
        giveRandomRelic();
        giveRandomRelic();
    }
    if (permanentUnlocks.godMode) {
        giveRandomRelic();
        giveRandomRelic();
    }
    
    // Weapon unlock
    if (permanentUnlocks.startPower) {
        const weaponValues = [2, 3, 4, 5, 6, 7, 8, 9, 10];
        const randomValue = weaponValues[Math.floor(Math.random() * weaponValues.length)];
        const weaponCard = {
            value: randomValue.toString(),
            suit: '♦',
            numValue: randomValue,
            suitName: 'diamonds'
        };
        game.room.push(weaponCard);
        showMessage('⚡ Power Start! Free weapon in room!', 'success');
    }
}

// ============================================
// ============================================
// PERMANENT STATS (LOCALSTORAGE)
// ============================================
// BUG REPORT & CONTACT: Handled by inline-scripts.js
// ============================================

// ============================================
// INITIALIZATION
// ============================================
loadPermanentStats();
loadUnlocks();
updateAchievementCounter();

// Initialize menu music (autoplay)
setTimeout(() => {
    game.settings.musicEnabled = true;
    music.switchContext('menu');
    music.start();
    // updateWelcomeMusicButton() removed - function no longer exists
}, 100);

showWelcomeScreen(); // Show welcome screen on load

// ============================================
// CODEX SYSTEM - Now modularized in systems/codex.js
// ============================================
// CODEX functions are loaded from systems/codex.js

// Expose other functions globally for HTML onclick handlers and modules
// Note: createParticles, showDamageNumber, showCombo are in helpers.js (or were removed)
// Only expose functions that actually exist in this file
if (typeof playSound !== 'undefined') window.playSound = playSound;
if (typeof showTutorial !== 'undefined') window.showTutorial = showTutorial;
if (typeof startInteractiveTutorial !== 'undefined') window.startInteractiveTutorial = startInteractiveTutorial;
if (typeof showMessage !== 'undefined') window.showMessage = showMessage;
if (typeof earnGold !== 'undefined') window.earnGold = earnGold;
if (typeof giveRandomRelic !== 'undefined') window.giveRandomRelic = giveRandomRelic;
if (typeof giveRelicByRarity !== 'undefined') window.giveRelicByRarity = giveRelicByRarity;
if (typeof updateUI !== 'undefined') window.updateUI = updateUI;
if (typeof updateRelicsDisplay !== 'undefined') window.updateRelicsDisplay = updateRelicsDisplay;
if (typeof takeDamage !== 'undefined') window.takeDamage = takeDamage;
if (typeof resetCombo !== 'undefined') window.resetCombo = resetCombo;
if (typeof buyItem !== 'undefined') window.buyItem = buyItem;
if (typeof handleCardClick !== 'undefined') window.handleCardClick = handleCardClick;
if (typeof getCardType !== 'undefined') window.getCardType = getCardType; // For hold card system
if (typeof loadUnlocks !== 'undefined') window.loadUnlocks = loadUnlocks;
if (typeof saveUnlocks !== 'undefined') window.saveUnlocks = saveUnlocks;

// Expose additional functions for game-classes.js module
if (typeof startGame !== 'undefined') window.startGame = startGame;
if (typeof checkGameState !== 'undefined') window.checkGameState = checkGameState;
if (typeof getRelicBonus !== 'undefined') window.getRelicBonus = getRelicBonus;
if (typeof screenShake !== 'undefined') window.screenShake = screenShake;
if (typeof createParticles !== 'undefined') window.createParticles = createParticles;

// Expose game state, inputs and unlocks for modules (leaderboard.js, stats.js, codex.js)
window.game = game;
window.playerNameInput = playerNameInput;
window.permanentUnlocks = permanentUnlocks;
window.UNLOCKS = UNLOCKS; // For codex.js
window.RELIC_CONFIG = RELIC_CONFIG; // For game-relics.js
window.createCardElement = createCardElement; // For tutorial - FULL styled cards
window.createMiniCardElement = createMiniCardElement; // For tutorial - mini cards

// Expose additional functions for game-combat.js module
if (typeof checkAchievements !== 'undefined') window.checkAchievements = checkAchievements;
if (typeof updateRunningScore !== 'undefined') window.updateRunningScore = updateRunningScore;
if (typeof endGame !== 'undefined') window.endGame = endGame;
// NOTE: addLog, getBerserkBonus, getComboBonus, getCardType now exposed by game-combat.js

// ============================================
// DEBUG FUNCTIONS (remove in production)
// ============================================
window.DEBUG = {
    // Simulate boss fled scenario: empty dungeon, boss in room, no weapon
    bossFledScenario: function() {
        if (!game.gameStartTime) {
            console.error('❌ Start a game first!');
            return;
        }
        
        // Setup scenario
        game.dungeon = []; // Empty dungeon
        game.equippedWeapon = null; // No weapon
        game.health = 30; // Enough HP to survive
        game.finalBossSpawned = false;
        
        // Spawn boss directly
        const finalBoss = {
            suit: '',
            value: '',
            numValue: 20, // Boss damage
            maxHP: 20,
            isBoss: true,
            bossNumber: 99,
            bossName: 'Test Boss',
            bossFlavor: 'DEBUG: Click this boss without weapon!'
        };
        
        game.room = [finalBoss];
        updateUI();
        
        console.log('✅ Boss Fled scenario ready!');
        console.log('📋 State: Dungeon empty, No weapon, HP=30, Boss HP=20');
        console.log('👆 Click the boss to trigger "Boss Fled" ending');
    },
    
    // Simulate boss respawn scenario: dungeon has cards
    bossRespawnScenario: function() {
        if (!game.gameStartTime) {
            console.error('❌ Start a game first!');
            return;
        }
        
        // Setup scenario
        game.dungeon = [{ suit: '♦', suitName: 'diamonds', value: '10', numValue: 10 }]; // Has a weapon card
        game.equippedWeapon = null; // No weapon
        game.health = 30;
        game.finalBossSpawned = false;
        
        const finalBoss = {
            suit: '',
            value: '',
            numValue: 20,
            maxHP: 20,
            isBoss: true,
            bossNumber: 99,
            bossName: 'Test Boss',
            bossFlavor: 'DEBUG: Boss should respawn after fleeing!'
        };
        
        game.room = [finalBoss];
        updateUI();
        
        console.log('✅ Boss Respawn scenario ready!');
        console.log('📋 State: Dungeon has 1 card, No weapon, HP=30, Boss HP=20');
        console.log('👆 Click the boss - it should flee and respawn');
    },
    
    // Quick win
    win: function() {
        endGame('victory');
    },
    
    // Quick boss fled
    bossFled: function() {
        endGame('boss_fled');
    }
};

console.log('🔧 DEBUG functions available: DEBUG.bossFledScenario(), DEBUG.bossRespawnScenario(), DEBUG.win(), DEBUG.bossFled()');

// Check orientation on load and resize
checkMobileOrientation();
window.addEventListener('resize', debounce(checkMobileOrientation, 300));
