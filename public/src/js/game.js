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
const game = {
    deck: [],
    relics: [],
    heldCard: null,
    discardPile: [],
    lastActionWasAvoid: false,
    gameOver: false,
    gameTimerInterval: null,
    gameStartTime: 0,
    undoAvailable: false,
    lastGameState: null,
    potionsUsed: 0,
    difficulty: 'normal',
    combo: 0,
    score: 0,
    health: 20,
    maxHealth: 20,
    equippedWeapon: null,
    dungeon: [],
    room: [],
    gold: 0,
    totalGoldEarned: 0,
    stats: {},
    settings: {
        soundEnabled: true,
        musicEnabled: true
    },
    dodgeActive: false,
    doubleDamage: false,
    berserkStacks: 0,
    mirrorShield: 0,
    obliterateMode: false
};

// Permanent Stats (LocalStorage)
let permanentStats = {};

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
        console.log('[EASY MODAL] Removing old suggestion');
        oldSuggestion.remove();
    }
    
    // First-time player: Suggest Easy difficulty
    const hasPlayedBefore = localStorage.getItem('dungeon_scoundrel_played_before');
    console.log('[EASY MODAL] hasPlayedBefore:', hasPlayedBefore);
    console.log('[EASY MODAL] Should show Easy suggestion:', !hasPlayedBefore);
    
    if (!hasPlayedBefore) {
        console.log('[EASY MODAL] ✅ Showing Easy suggestion...');
        
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
    console.log('[TUTORIAL] Learn to Play button clicked');
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
    console.log('[TUTORIAL] Start Interactive Tutorial button clicked');
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

// Class definitions
const CLASSES = {
    scoundrel: {
        name: 'SCOUNDREL',
        motivation: '"I have no honor, no glory, only survival in the dark."',
        mechanics: '<strong>⚔️ Passive:</strong> None - Pure skill and luck<br><br><strong>✨ Active:</strong> None - Just you and your wits<br><br><em style="color: #8b7355; font-size: 0.9em;">This is the baseline class. Master the basics before seeking power.</em>',
        icon: '🎭',
        unlocked: true,
        unlockRequirement: 'Always available',
        passive: {},
        active: null
    },
    knight: {
        name: 'KNIGHT',
        motivation: '"Honor and steel shall guide my path through the darkness."',
        mechanics: '<strong>🛡️ Passive:</strong> +5 Max HP | Weapons have +1 durability<br><br><strong>⚔️ Active (Shield Bash):</strong> Deal damage equal to your weapon value to the first monster in the room. Cooldown: 3 rooms.',
        icon: '🛡️',
        unlocked: false,
        unlockRequirement: 'Win on Easy difficulty',
        passive: { maxHpBonus: 5, weaponDurabilityBonus: 1 },
        active: {
            name: 'Shield Bash',
            description: 'Deal weapon damage to first monster',
            cooldown: 3,
            icon: '🛡️'
        }
    },
    rogue: {
        name: 'ROGUE',
        motivation: '"In shadows I thrive, through cunning I survive."',
        mechanics: '<strong>🗡️ Passive:</strong> Can hold 2 cards instead of 1 | Start with 1 extra gold per room<br><br><strong>🔪 Active (Shadow Strike):</strong> Next monster takes double weapon damage and doesn\'t break combo. Cooldown: 4 rooms.',
        icon: '🗡️',
        unlocked: false,
        unlockRequirement: 'Win on Normal difficulty',
        passive: { maxHoldCards: 2, bonusGoldPerRoom: 1 },
        active: {
            name: 'Shadow Strike',
            description: 'Next monster: 2x damage, combo safe',
            cooldown: 4,
            icon: '🔪'
        }
    },
    dancer: {
        name: 'DANCER',
        motivation: '"Grace in motion, life in every step, death in every turn."',
        mechanics: '<strong>💃 Passive:</strong> Potions heal +3 HP | Can use 2 potions per room | Higher event chance (luck)<br><br><strong>✨ Active (Healing Dance):</strong> Heal 5 HP and gain +2 weapon damage for next 2 monsters. Cooldown: 5 rooms.',
        icon: '💃',
        unlocked: false,
        unlockRequirement: 'Win on Hard difficulty',
        passive: { potionHealBonus: 3, maxPotionsPerRoom: 2, eventChanceBonus: 15 },
        active: {
            name: 'Healing Dance',
            description: 'Heal 5 HP + damage buff',
            cooldown: 5,
            icon: '✨'
        }
    },
    berserker: {
        name: 'BERSERKER',
        motivation: '"Through pain I find power. Through fury I find victory."',
        mechanics: '<strong>💢 Passive (Bloodlust):</strong> Damage increases as HP decreases<br>• +1 damage at ≤70% HP<br>• +2 damage at ≤50% HP<br>• +3 damage at ≤30% HP<br><br><strong>⚔️ Active (Rage Strike):</strong> Sacrifice 5 HP for triple damage (3x) on next 3 attacks. Breaks combo. Cooldown: 4 rooms.<br><em style="color: #ff6b6b; font-size: 0.9em;">⚠️ Cannot use if HP ≤ 5</em>',
        icon: '💢',
        unlocked: false,
        unlockRequirement: 'Win on Hard + Kill 5 bosses total',
        passive: { bloodlust: true },
        active: {
            name: 'Rage Strike',
            description: 'Sacrifice 5 HP: 3x damage for 3 attacks, breaks combo',
            cooldown: 4,
            icon: '⚔️'
        }
    },
    priest: {
        name: 'PRIEST',
        motivation: '"The light protects me. The divine guides me. Chaos shall be purified."',
        mechanics: '<strong>🕊️ Passive (Divine Blessing):</strong> 15% chance to negate damage completely | Potions heal +2 HP | Start with +2 Max HP<br><br><strong>📿 Active (Purification):</strong> Permanently remove the strongest monster from current dungeon OR transform a monster into a potion. Cooldown: 6 rooms.<br><em style="color: #ffd700; font-size: 0.9em;">✨ Strategic: Eliminate threats before facing them</em>',
        icon: '📿',
        unlocked: false,
        unlockRequirement: 'Collect 20 relics + 10 events + 5 wins total',
        passive: { divineBlessing: true, potionHealBonus: 2, startMaxHpBonus: 2 },
        active: {
            name: 'Purification',
            description: 'Remove strongest monster or convert to potion',
            cooldown: 6,
            icon: '📿'
        }
    }
};

// Function to check class unlocks based on wins
function checkClassUnlocks() {
    const stats = storage.get('scoundrel_lifetime_stats', {});
    
    // Knight unlocks after Easy win
    if (stats.easyWins >= 1) {
        CLASSES.knight.unlocked = true;
    }
    
    // Rogue unlocks after Normal win
    if (stats.normalWins >= 1) {
        CLASSES.rogue.unlocked = true;
    }
    
    // Dancer unlocks after Hard win
    if (stats.hardWins >= 1) {
        CLASSES.dancer.unlocked = true;
    }
    
    // Berserker unlocks after Hard win + 5 bosses killed
    if (stats.hardWins >= 1 && (stats.bossesKilled || 0) >= 5) {
        CLASSES.berserker.unlocked = true;
    }
    
    // Priest unlocks after 20 relics + 10 events + 5 wins
    const totalRelics = stats.totalRelicsCollected || 0;
    const totalEvents = stats.eventsTriggered || 0;
    const totalWins = stats.gamesWon || 0;
    
    if (totalRelics >= 20 && totalEvents >= 10 && totalWins >= 5) {
        CLASSES.priest.unlocked = true;
    }
}

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

// Store class in game object
function startGameWithClass(className) {
    game.playerClass = className;
    game.classData = CLASSES[className];
    game.classAbilityCooldown = 0; // Tracks rooms until ability is ready
    game.classAbilityActive = false; // For buffs like Shadow Strike
    game.classAbilityCounter = 0; // For counting buff duration
    startGame();
}

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
        console.log('Give Up clicked', {gameOver: game.gameOver, gameStartTime: game.gameStartTime});
        if (game.gameOver || game.gameStartTime === 0) {
            console.log('Give Up blocked - game not running');
            showMessage('⚠️ Start a game first!', 'warning');
            return;
        }
        console.log('Opening Give Up modal');
        giveUpModal.classList.add('active');
    });
    
    btnCancelGiveUp.addEventListener('click', function() {
        console.log('Give Up cancelled');
        giveUpModal.classList.remove('active');
    });
    
    btnConfirmGiveUp.addEventListener('click', function() {
        console.log('Give Up confirmed');
        giveUpModal.classList.remove('active');
        endGame('death', true); // true = gave up
    });
    
    console.log('✅ Give Up system initialized');
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
        if (e.key === 'Escape') {
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
            console.log('[TUTORIAL] Key blocked:', e.key);
            return;
        }
        
        // Allow Space/Arrows to work on tutorial buttons
        return;
    }
    
    // Ignore if modal is open (except ESC)
    const modalOpen = document.querySelector('.modal-overlay.active');
    if (modalOpen && e.key !== 'Escape') return;
    
    // ESC - Close modals
    if (e.key === 'Escape') {
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
        case 'd':
            e.preventDefault();
            if (!btnDrawRoom.disabled) {
                btnDrawRoom.click();
            }
            break;
            
        case 'a': // A - Avoid Room
            e.preventDefault();
            if (!btnAvoidRoom.disabled) {
                btnAvoidRoom.click();
            }
            break;
            
        case 'q': // Q - Class Ability
            e.preventDefault();
            if (btnClassAbility && !btnClassAbility.disabled) {
                btnClassAbility.click();
            }
            break;
            
        case 'u': // U - Undo
            e.preventDefault();
            const btnUndoKey = document.getElementById('btnUndo');
            if (btnUndoKey && !btnUndoKey.disabled) {
                btnUndoKey.click();
            }
            break;
            
        case 's': // S - Shop
            e.preventDefault();
            if (btnOpenShop && !btnOpenShop.disabled) {
                btnOpenShop.click();
            }
            break;
            
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
            e.preventDefault();
            const cardIndex = parseInt(e.key) - 1;
            const cards = bottomBar.querySelectorAll('.card');
            if (cards[cardIndex]) {
                cards[cardIndex].click();
            }
            break;
    }
});

console.log('✅ Keyboard shortcuts loaded! D=Draw | A=Avoid | Q=Ability | 1-5=Cards | U=Undo | S=Shop | ESC=Close');

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

// Special Cards Types
const specialCards = [
    { id: 'dodge', name: '🛡️ Dodge', description: 'Avoid next damage', effect: () => { game.dodgeActive = true; showMessage('🛡️ Dodge active!', 'success'); createParticles(window.innerWidth / 2, window.innerHeight / 2, '#4ecdc4', 20); } },
    { id: 'double_damage', name: '⚡ Power', description: 'Weapon 2x stronger', effect: () => { game.doubleDamage = true; showMessage('⚡ Power Strike!', 'success'); createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 25); } },
    { id: 'super_heal', name: '💊 Super Potion', description: 'Heal to full HP', effect: () => { const healed = game.maxHealth - game.health; game.health = game.maxHealth; showDamageNumber(healed, 'heal'); showMessage('💊 HP Full!', 'success'); createParticles(window.innerWidth / 2, window.innerHeight / 2, '#6bcf7f', 30); } },
    { id: 'treasure', name: '💰 Treasure', description: '+5 Max HP', effect: () => { game.maxHealth += 5; game.health += 5; showDamageNumber('+5 MAX', 'heal'); showMessage('💰 Max HP increased!', 'success'); createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 35); } },
    
    // 🆕 NOVAS CARTAS ESPECIAIS
    { id: 'berserk_card', name: '🔥 Berserk', description: 'Next 3 attacks +5 damage', effect: () => { 
        // Hourglass: +1 extra berserk turn
        game.berserkStacks = game.relics.some(r => r.id === 'hourglass') ? 4 : 3; 
        showMessage('🔥 BERSERK MODE! Next 3 attacks +5 damage!', 'success'); 
        playSound('special');
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 40);
        
        // Track berserk use for achievement
        const saved = localStorage.getItem('scoundrel_lifetime_stats');
        let lifetimeStats = saved ? JSON.parse(saved) : {};
        lifetimeStats.berserkUses = (lifetimeStats.berserkUses || 0) + 1;
        localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
    } },
    { id: 'time_warp', name: '⏰ Time Warp', description: 'Draw 2 extra cards this room', effect: () => {
        if (game.dungeon.length >= 2) {
            const extraCards = game.dungeon.splice(0, 2);
            game.room.push(...extraCards);
            showMessage('⏰ Time Warp! +2 cards drawn!', 'success');
            playSound('cardDraw');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 30);
            updateUI();
            
            // Track time warp use for achievement
            const saved = localStorage.getItem('scoundrel_lifetime_stats');
            let lifetimeStats = saved ? JSON.parse(saved) : {};
            lifetimeStats.timeWarps = (lifetimeStats.timeWarps || 0) + 1;
            localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
        } else {
            showMessage('⏰ Time Warp! Not enough cards in deck!', 'warning');
        }
    } },
    { id: 'card_destroy', name: '💥 Obliterate', description: 'Remove a card permanently', effect: () => {
        if (game.room.length > 0) {
            showMessage('💥 Choose a card to OBLITERATE (left-click)!', 'warning');
            game.obliterateMode = true;
            playSound('special');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 35);
        } else {
            showMessage('💥 No cards to obliterate!', 'warning');
        }
    } },
    { id: 'gamble', name: '🎰 Gamble', description: '50% chance: +15 HP or -10 HP', effect: () => {
        const win = Math.random() < 0.5;
        if (win) {
            const heal = Math.min(15, game.maxHealth - game.health);
            game.health = Math.min(game.maxHealth, game.health + 15);
            showDamageNumber(heal, 'heal');
            showMessage('🎰 JACKPOT! +15 HP!', 'success');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#6bcf7f', 50);
        } else {
            game.health -= 10;
            showDamageNumber(10, 'damage');
            showMessage('🎰 Bad luck... -10 HP!', 'danger');
            screenShake();
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 30);
        }
        playSound('special');
        updateUI();
        
        // Track gamble use for achievement
        const saved = localStorage.getItem('scoundrel_lifetime_stats');
        let lifetimeStats = saved ? JSON.parse(saved) : {};
        lifetimeStats.gambleCards = (lifetimeStats.gambleCards || 0) + 1;
        localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
    } },
    { id: 'lucky_draw', name: '🎲 Lucky Draw', description: 'Draw 3 cards with favorable odds', effect: () => {
        // BALANCED: Draw exactly 3 cards with controlled probabilities
        // 40% potion, 40% weapon, 20% monster (much better than random!)
        const drawnCards = [];
        const cardsToDraw = Math.min(3, game.dungeon.length);
        
        for (let i = 0; i < cardsToDraw; i++) {
            if (game.dungeon.length === 0) break;
            
            // Find cards by type in dungeon
            const potions = game.dungeon.filter(c => c.suitName === 'hearts');
            const weapons = game.dungeon.filter(c => c.suitName === 'diamonds');
            const monsters = game.dungeon.filter(c => c.suitName === 'clubs' || c.suitName === 'spades');
            
            let selectedCard = null;
            const roll = Math.random();
            
            // 40% chance for potion
            if (roll < 0.40 && potions.length > 0) {
                selectedCard = potions[Math.floor(Math.random() * potions.length)];
            }
            // 40% chance for weapon (cumulative 0.40-0.80)
            else if (roll < 0.80 && weapons.length > 0) {
                selectedCard = weapons[Math.floor(Math.random() * weapons.length)];
            }
            // 20% chance for monster OR fallback if preferred types unavailable
            else if (monsters.length > 0) {
                selectedCard = monsters[Math.floor(Math.random() * monsters.length)];
            }
            // Fallback: draw any card if specific type unavailable
            else {
                selectedCard = game.dungeon[Math.floor(Math.random() * game.dungeon.length)];
            }
            
            if (selectedCard) {
                const index = game.dungeon.indexOf(selectedCard);
                game.dungeon.splice(index, 1);
                drawnCards.push(selectedCard);
            }
        }
        
        game.room.push(...drawnCards);
        
        const weaponCount = drawnCards.filter(c => c.suitName === 'diamonds').length;
        const potionCount = drawnCards.filter(c => c.suitName === 'hearts').length;
        
        showMessage(`🎲 Lucky Draw! Drew ${drawnCards.length} cards (${weaponCount}⚔️ ${potionCount}❤️)`, 'success');
        earnGold(5);
        
        playSound('cardDraw');
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 25);
        updateUI();
    } }
];

// Card suits and values
const suits = {'♠': 'spades', '♣': 'clubs', '♥': 'hearts', '♦': 'diamonds'};
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];

// ===== 50 ACHIEVEMENTS SYSTEM =====

// ===== ADVANCED SOUND EFFECTS SYSTEM =====
// audioContext is now loaded from audio-context.js (loaded before this file)

const soundEffects = {
    cardDraw: (ctx, time) => {
        for (let i = 0; i < 8; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 200 + Math.random() * 400;
            osc.connect(gain);
            gain.connect(sfxMasterGain);
            const startTime = time + (i * 0.03);
            gain.gain.setValueAtTime(0.03, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
            osc.start(startTime);
            osc.stop(startTime + 0.05);
        }
    },
    cardFlip: (ctx, time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, time);
        osc.frequency.exponentialRampToValueAtTime(800, time + 0.1);
        osc.connect(gain);
        gain.connect(sfxMasterGain);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.start(time);
        osc.stop(time + 0.15);
    },
    attack: (ctx, time) => {
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) { data[i] = (Math.random() * 2 - 1) * (1 - i / data.length); }
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        const gain = ctx.createGain();
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sfxMasterGain);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        const clang = ctx.createOscillator();
        const clangGain = ctx.createGain();
        clang.type = 'square';
        clang.frequency.value = 800;
        clang.connect(clangGain);
        clangGain.connect(sfxMasterGain);
        clangGain.gain.setValueAtTime(0.15, time + 0.1);
        clangGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        noise.start(time);
        clang.start(time + 0.1);
        clang.stop(time + 0.25);
    },
    damage: (ctx, time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.4);
        osc.connect(gain);
        gain.connect(sfxMasterGain);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        osc.start(time);
        osc.stop(time + 0.4);
        const crack = ctx.createOscillator();
        const crackGain = ctx.createGain();
        crack.type = 'square';
        crack.frequency.value = 200;
        crack.connect(crackGain);
        crackGain.connect(sfxMasterGain);
        crackGain.gain.setValueAtTime(0.1, time + 0.05);
        crackGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        crack.start(time + 0.05);
        crack.stop(time + 0.15);
    },
    heal: (ctx, time) => {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(sfxMasterGain);
            const startTime = time + (i * 0.08);
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    },
    equip: (ctx, time) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'square';
        osc2.type = 'square';
        osc1.frequency.value = 400;
        osc2.frequency.value = 600;
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(sfxMasterGain);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.2);
        osc2.stop(time + 0.2);
    },
    hold: (ctx, time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, time);
        osc.frequency.exponentialRampToValueAtTime(600, time + 0.1);
        osc.connect(gain);
        gain.connect(sfxMasterGain);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.start(time);
        osc.stop(time + 0.15);
    },
    special: (ctx, time) => {
        for (let i = 0; i < 6; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 800 + (i * 200) + (Math.random() * 100);
            osc.connect(gain);
            gain.connect(sfxMasterGain);
            const startTime = time + (i * 0.05);
            gain.gain.setValueAtTime(0.08, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        }
    },
    combo: (ctx, time) => {
        const chord = [659.25, 783.99, 987.77]; // E5, G5, B5
        chord.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(sfxMasterGain);
            gain.gain.setValueAtTime(0.12, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
            osc.start(time);
            osc.stop(time + 0.4);
        });
    },
    roomClear: (ctx, time) => {
        const melody = [523.25, 659.25, 783.99]; // C5, E5, G5
        melody.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(sfxMasterGain);
            const startTime = time + (i * 0.12);
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    },
    avoid: (ctx, time) => {
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) { data[i] = (Math.random() * 2 - 1) * (1 - i / data.length); }
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.exponentialRampToValueAtTime(200, time + 0.4);
        const gain = ctx.createGain();
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sfxMasterGain);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        noise.start(time);
    },
    victory: (ctx, time) => {
        const fanfare = [{freq: 523.25, start: 0}, {freq: 659.25, start: 0.15}, {freq: 783.99, start: 0.3}, {freq: 1046.50, start: 0.45}];
        fanfare.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = note.freq;
            osc.connect(gain);
            gain.connect(sfxMasterGain);
            const startTime = time + note.start;
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    },
    defeat: (ctx, time) => {
        const descent = [{freq: 493.88, start: 0}, {freq: 440.00, start: 0.2}, {freq: 392.00, start: 0.4}, {freq: 293.66, start: 0.6}];
        descent.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = note.freq;
            osc.connect(gain);
            gain.connect(sfxMasterGain);
            const startTime = time + note.start;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
            osc.start(startTime);
            osc.stop(startTime + 0.6);
        });
    },
    start: (ctx, time) => {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(sfxMasterGain);
            const startTime = time + (i * 0.1);
            gain.gain.setValueAtTime(0.12, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    },
    error: (ctx, time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 150;
        osc.connect(gain);
        gain.connect(sfxMasterGain);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.setValueAtTime(0, time + 0.1);
        gain.gain.setValueAtTime(0.2, time + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
    }
};

// Unified playSound function
function playSound(soundName) {
    if (!game.settings.soundEnabled || !audioContext) return;
    const soundFn = soundEffects[soundName];
    if (!soundFn) {
        console.warn('Sound not found:', soundName);
        return;
    }
    try {
        const time = audioContext.currentTime;
        soundFn(audioContext, time);
    } catch (e) {
        // console.warn("Audio context error", e);
    }
}

// ============================================
// ============================================
// CLASS ABILITIES
// ============================================

function useClassAbility() {
    if (!game.classData) return;
    
    // Scoundrel has no ability
    if (!game.classData.active) {
        showMessage('❌ Scoundrel has no special abilities!', 'warning');
        playSound('error');
        return;
    }
    
    // Check cooldown
    if (game.classAbilityCooldown > 0) {
        showMessage(`⏳ Ability on cooldown! ${game.classAbilityCooldown} rooms remaining.`, 'warning');
        playSound('error');
        return;
    }
    
    // Execute ability based on class
    if (game.playerClass === 'knight') {
        useKnightAbility();
    } else if (game.playerClass === 'rogue') {
        useRogueAbility();
    } else if (game.playerClass === 'dancer') {
        useDancerAbility();
    } else if (game.playerClass === 'berserker') {
        useBerserkerAbility();
    } else if (game.playerClass === 'priest') {
        usePriestAbility();
    }
    
    updateAbilityUI();
}

function useKnightAbility() {
    // Shield Bash: Deal weapon damage to first monster
    if (!game.equippedWeapon) {
        showMessage('⚠️ Need a weapon equipped to use Shield Bash!', 'warning');
        playSound('error');
        return;
    }
    
    const firstMonster = game.room.find(c => getCardType(c) === 'monster');
    if (!firstMonster) {
        showMessage('⚠️ No monsters in room!', 'warning');
        playSound('error');
        return;
    }
    
    const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
    const damage = game.equippedWeapon.numValue + powerBonus;
    firstMonster.numValue -= damage;
    
    if (firstMonster.numValue <= 0) {
        const index = game.room.indexOf(firstMonster);
        game.room.splice(index, 1);
        game.discardPile.push(firstMonster);
        game.stats.monstersSlain++;
        showMessage(`🛡️ Shield Bash! Monster defeated!`, 'success');
    } else {
        showMessage(`🛡️ Shield Bash! Dealt ${damage} damage! (${firstMonster.numValue} HP left)`, 'success');
    }
    
    game.classAbilityCooldown = game.classData.active.cooldown;
    playSound('special');
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#c9a961', 40);
    updateUI();
    checkGameState();
}

function useRogueAbility() {
    // Shadow Strike: Next monster 2x damage, combo safe
    game.classAbilityActive = true;
    game.classAbilityCounter = 1; // Next monster only
    game.classAbilityCooldown = game.classData.active.cooldown;
    
    showMessage('🔪 Shadow Strike activated! Next kill: 2x damage, combo safe!', 'success');
    playSound('special');
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#667eea', 40);
    updateUI();
}

function useDancerAbility() {
    // Healing Dance: Heal 5 HP + damage buff
    game.health = Math.min(game.maxHealth, game.health + 5);
    game.classAbilityActive = true;
    game.classAbilityCounter = 2; // Next 2 monsters
    game.classAbilityCooldown = game.classData.active.cooldown;
    
    showMessage('✨ Healing Dance! +5 HP and damage buff for 2 attacks!', 'success');
    playSound('heal');
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 50);
    updateUI();
}

function useBerserkerAbility() {
    // Rage Strike: Sacrifice 5 HP for 3x damage
    if (game.health <= 5) {
        showMessage('⚠️ Not enough HP! Need more than 5 HP to use Rage Strike.', 'danger');
        playSound('error');
        return;
    }
    
    // Sacrifice HP
    game.health -= 5;
    
    // Activate 3x damage buff
    game.classAbilityActive = true;
    game.classAbilityCounter = 3; // 3 attacks (buffed for balance)
    game.rageStrikeActive = true; // Special flag for triple damage
    game.classAbilityCooldown = game.classData.active.cooldown;
    
    // Break combo (high risk)
    if (game.combo > 0) {
        showMessage(`💢 Rage Strike! -5 HP, next attack: 3x damage! ⚠️ Combo broken! (Lost ${game.combo}x)`, 'warning');
        game.combo = 0;
    } else {
        showMessage('💢 Rage Strike! -5 HP, next attack: 3x damage!', 'warning');
    }
    
    playSound('special');
    screenShake();
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 60);
    updateUI();
}

function usePriestAbility() {
    // Purification: Remove strongest monster or convert to potion
    const monsters = game.dungeon.filter(c => getCardType(c) === 'monster');
    
    if (monsters.length === 0) {
        showMessage('⚠️ No monsters in dungeon to purify!', 'warning');
        playSound('error');
        return;
    }
    
    // Find strongest monster
    const strongestMonster = monsters.reduce((max, card) => 
        card.numValue > max.numValue ? card : max
    );
    
    // Ask player what to do
    const choice = confirm(
        `📿 PURIFICATION\n\n` +
        `Strongest monster: ${strongestMonster.value}${strongestMonster.suit} (${strongestMonster.numValue} HP)\n\n` +
        `Choose:\n` +
        `• OK = Remove permanently\n` +
        `• Cancel = Transform into potion`
    );
    
    const index = game.dungeon.indexOf(strongestMonster);
    
    if (choice) {
        // Remove permanently
        game.dungeon.splice(index, 1);
        showMessage(`📿 Purification! ${strongestMonster.value}${strongestMonster.suit} removed from existence!`, 'success');
    } else {
        // Transform to potion (random value 2-10)
        const potionValue = Math.floor(Math.random() * 9) + 2;
        game.dungeon[index] = {
            value: potionValue.toString(),
            suit: '♥',
            numValue: potionValue,
            suitName: 'hearts'
        };
        showMessage(`📿 Purification! ${strongestMonster.value}${strongestMonster.suit} transformed into ${potionValue}♥ potion!`, 'success');
    }
    
    game.classAbilityCooldown = game.classData.active.cooldown;
    playSound('special');
    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 70);
    updateUI();
}

function updateAbilityUI() {
    const btn = document.getElementById('btnClassAbility');
    const cooldownDisplay = document.getElementById('abilityCooldownDisplay');
    const desc = document.getElementById('abilityDescription');
    
    if (!game.classData) return;
    
    // Scoundrel has no ability - disable button
    if (!game.classData.active) {
        btn.disabled = true;
        btn.style.opacity = '0.3';
        btn.style.display = 'none'; // Hide button for Scoundrel
        cooldownDisplay.style.display = 'none';
        if (desc) desc.textContent = 'No abilities available';
        return;
    }
    
    // Show button for classes with abilities
    btn.style.display = 'block';
    
    if (game.classAbilityCooldown > 0) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        cooldownDisplay.textContent = `${game.classAbilityCooldown} rooms`;
        cooldownDisplay.style.display = 'block';
    } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        cooldownDisplay.style.display = 'none';
    }
    
    // Show active buff
    if (game.classAbilityActive && game.classAbilityCounter > 0) {
        desc.innerHTML = `<strong style="color: #6bcf7f;">✨ ACTIVE! ${game.classAbilityCounter} uses left</strong>`;
    } else {
        desc.textContent = game.classData.active.description;
    }
}

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
        
        // Add class ability bonuses
        let classBonus = 0;
        if (game.classAbilityActive && game.classAbilityCounter > 0) {
            if (game.playerClass === 'dancer') {
                classBonus = 2;
            }
        }
        
        const bloodlustBonus = getBloodlustBonus();
        const comboBonus = getComboBonus();
        
        const totalWeapon = baseWeapon + powerBonus + berserkBonus + classBonus + bloodlustBonus + comboBonus;
        let effectiveWeapon = game.doubleDamage ? totalWeapon * 2 : totalWeapon;
        
        // Rogue Shadow Strike (2x)
        if (game.classAbilityActive && game.classAbilityCounter > 0 && game.playerClass === 'rogue') {
            effectiveWeapon *= 2;
        }
        
        // Berserker Rage Strike (3x)
        if (game.rageStrikeActive && game.classAbilityCounter > 0) {
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
        if (game.classAbilityActive && game.classAbilityCounter > 0 && game.playerClass === 'rogue') buffInfo += `🔪2x `;
        if (game.rageStrikeActive && game.classAbilityCounter > 0) buffInfo += `⚔️3x `;
        
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

// Game Log (now in a modal or sidebar? For now, no visible log)
function addLog(message, type = 'info') {
    console.log(`LOG [${type}]: ${message}`);
    // (The log UI was removed for a cleaner layout)
}

// Helper: Reset combo with unlocks
function resetCombo() {
    if (permanentUnlocks.comboGod) game.combo = 2;
    else if (permanentUnlocks.comboMaster) game.combo = 1;
    else game.combo = 0;
}

// Helper: Calculate berserk bonus
function getBerserkBonus() {
    if (game.berserkStacks <= 0) return 0;
    return permanentUnlocks.berserkMaster ? 7 : 5;
}

// Helper: Calculate bloodlust bonus
function getBloodlustBonus() {
    if (!game.classData || !game.classData.passive.bloodlust) return 0;
    const hpPercent = (game.health / game.maxHealth) * 100;
    if (hpPercent <= 30) return 3;
    if (hpPercent <= 50) return 2;
    if (hpPercent <= 70) return 1;
    return 0;
}

// Helper: Calculate combo bonus
function getComboBonus() {
    if (game.combo === 0) return 0;
    
    // Combo God: +2 damage per combo level (stacks with base)
    // Base: 2 combo = +1, 3 combo = +2, etc.
    // With Combo God: 2 combo = +2, 3 combo = +4, etc.
    const comboMultiplier = permanentUnlocks.comboGod ? 2 : 1;
    let bonus = game.combo >= 2 ? (game.combo - 1) * comboMultiplier : 0;
    
    // Fire Ring: +1 damage per combo stack
    if (game.relics.some(r => r.id === 'ring_fire') && game.combo >= 1) {
        bonus += game.combo;
    }
    
    return bonus;
}

// Initialize deck
function createDeck() {
    let deck = [];
    
    // SCOUNDREL ORIGINAL RULES:
    // Remove: Jokers, Red Face Cards (J♥,Q♥,K♥,J♦,Q♦,K♦), Red Aces (A♥,A♦)
    
    // 26 MONSTERS (♠ Spades + ♣ Clubs): A(14), 2-10, J(11), Q(12), K(13)
    const monsterSuits = [
        { suit: '♠', suitName: 'spades' },
        { suit: '♣', suitName: 'clubs' }
    ];
    const monsterValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const monsterNumValues = [14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    
    for (let suit of monsterSuits) {
        for (let i = 0; i < monsterValues.length; i++) {
            deck.push({ 
                value: monsterValues[i], 
                suit: suit.suit, 
                numValue: monsterNumValues[i], 
                suitName: suit.suitName 
            });
        }
    }
    
    // 9 WEAPONS (♦ Diamonds): 2-10 only (NO face cards, NO Ace)
    const weaponValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const weaponNumValues = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    for (let i = 0; i < weaponValues.length; i++) {
        deck.push({ 
            value: weaponValues[i], 
            suit: '♦', 
            numValue: weaponNumValues[i], 
            suitName: 'diamonds' 
        });
    }
    
    // 9 POTIONS (♥ Hearts): 2-10 only (NO face cards, NO Ace)
    const potionValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const potionNumValues = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    for (let i = 0; i < potionValues.length; i++) {
        deck.push({ 
            value: potionValues[i], 
            suit: '♥', 
            numValue: potionNumValues[i], 
            suitName: 'hearts' 
        });
    }
    
    // SPECIAL CARDS (our addition for gamification)
    // Base: 6 special cards (deck = 50 cards total)
    let specialCount = 6;
    
    // Old Book: +10% more special cards (+1)
    if (game.relics.some(r => r.id === 'book')) specialCount += 1;
    
    // Magic Orb: +100% special cards (2x = +6)
    if (game.relics.some(r => r.id === 'orb')) specialCount += 6;
    for (let i = 0; i < specialCount; i++) {
        deck.push({ 
            value: '✨', 
            suit: '', 
            numValue: 0, 
            suitName: 'special', 
            special: specialCards[Math.floor(Math.random() * specialCards.length)] 
        });
    }
    
    // TOTAL: 26 monsters + 9 weapons + 9 potions + 6 specials = 50 cards
    let finalDeck = shuffleDeck(deck);
    
    // EASY MODE BALANCING: First 10 rooms should be beginner-friendly
    if (game.difficulty === 'easy' && game.stats.roomsCleared < 10) {
        finalDeck = balanceEasyModeDeck(finalDeck);
    }
    
    return finalDeck;
}

function balanceEasyModeDeck(deck) {
    // EASY MODE: 70% monstros <5 damage, 70% armas 4-8 damage (first 10 rooms)
    let balanced = [...deck];
    
    // Find all monsters and weapons
    const monsters = balanced.filter(c => c.suitName === 'clubs' || c.suitName === 'spades');
    const weapons = balanced.filter(c => c.suitName === 'diamonds');
    
    // Balance monsters: 70% should be <5 damage
    const targetLowMonsters = Math.floor(monsters.length * 0.70);
    const lowMonsters = monsters.filter(c => c.numValue < 5);
    const highMonsters = monsters.filter(c => c.numValue >= 5);
    
    if (lowMonsters.length < targetLowMonsters && highMonsters.length > 0) {
        // Replace high monsters with low ones
        const toReplace = Math.min(targetLowMonsters - lowMonsters.length, highMonsters.length);
        for (let i = 0; i < toReplace; i++) {
            const highMonster = highMonsters[i];
            const index = balanced.indexOf(highMonster);
            // Replace with random low monster (2, 3, 4)
            const newValue = [2, 3, 4][Math.floor(Math.random() * 3)];
            balanced[index] = {
                ...highMonster,
                value: newValue.toString(),
                numValue: newValue
            };
        }
    }
    
    // Balance weapons: 70% should be 4-8 damage
    const targetMidWeapons = Math.floor(weapons.length * 0.70);
    const midWeapons = weapons.filter(c => c.numValue >= 4 && c.numValue <= 8);
    const offWeapons = weapons.filter(c => c.numValue < 4 || c.numValue > 8);
    
    if (midWeapons.length < targetMidWeapons && offWeapons.length > 0) {
        // Replace off-range weapons with mid-range ones
        const toReplace = Math.min(targetMidWeapons - midWeapons.length, offWeapons.length);
        for (let i = 0; i < toReplace; i++) {
            const offWeapon = offWeapons[i];
            const index = balanced.indexOf(offWeapon);
            // Replace with random mid weapon (4, 5, 6, 7, 8)
            const newValue = [4, 5, 6, 7, 8][Math.floor(Math.random() * 5)];
            balanced[index] = {
                ...offWeapon,
                value: newValue.toString(),
                numValue: newValue
            };
        }
    }
    
    return balanced;
}

function shuffleDeck(deck) {
    let shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function startGame() {
    // Mark that player has played before (for first-time Easy suggestion)
    localStorage.setItem('dungeon_scoundrel_played_before', 'true');
    
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
        
        if (playerAvatar) playerAvatar.src = `assets/images/avatar-${game.playerClass}.jpg`;
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
        
        // Show passive icons
        const passiveIconsDisplay = document.getElementById('passiveIconsDisplay');
        if (!passiveIconsDisplay) {
            console.warn('[GAME] passiveIconsDisplay element not found');
        } else {
            passiveIconsDisplay.innerHTML = '';
        
        // Create passive icons based on class
        const passiveIcons = {
            knight: [
                { icon: '❤️', text: '+5 HP', title: 'Start with +5 Max HP' },
                { icon: '🔨', text: '+1 Dur', title: 'Weapons last +1 use' }
            ],
            rogue: [
                { icon: '📌', text: 'x2 Hold', title: 'Can hold 2 cards' },
                { icon: '💰', text: '+1 Gold', title: '+1 gold per room' }
            ],
            dancer: [
                { icon: '💊', text: '+3 HP', title: 'Potions heal +3 HP' },
                { icon: '💊', text: 'x2 Use', title: 'Use 2 potions per room' },
                { icon: '🎲', text: '+15%', title: '+15% event chance' }
            ],
            berserker: [
                { icon: '💢', text: 'Bloodlust', title: 'Damage increases as HP decreases' },
                { icon: '⚔️', text: 'High Risk', title: '+1/+2/+3 damage at ≤70%/50%/30% HP' }
            ],
            priest: [
                { icon: '🕊️', text: '15% Dodge', title: '15% chance to dodge damage' },
                { icon: '💊', text: '+2 HP', title: 'Potions heal +2 HP' },
                { icon: '❤️', text: '+2 HP', title: 'Start with +2 Max HP' }
            ]
        };
        
            const icons = passiveIcons[game.playerClass] || [];
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
    btnDrawRoom.disabled = false;
    btnAvoidRoom.disabled = false;
    
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
            // Auto-click draw room
            document.getElementById('btnDrawRoom').click();
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
    // 2. Difficulty is Easy
    // 3. Tutorial not already active
    const tutorialCompleted = localStorage.getItem('dungeon_scoundrel_tutorial_completed');
    const playedBefore = localStorage.getItem('dungeon_scoundrel_played_before');
    
    console.log('[TUTORIAL] Checking conditions...');
    console.log('[TUTORIAL]   - tutorial_completed:', tutorialCompleted);
    console.log('[TUTORIAL]   - played_before:', playedBefore);
    console.log('[TUTORIAL]   - game.difficulty:', game.difficulty);
    console.log('[TUTORIAL]   - inGameTutorialActive:', inGameTutorialActive);
    console.log('[TUTORIAL]   - Should start:', !tutorialCompleted && game.difficulty === 'easy' && !inGameTutorialActive);
    
    // CRITICAL: Prevent tutorial from starting multiple times
    if (inGameTutorialActive) {
        console.log('[TUTORIAL] ⚠️ Tutorial already active, skipping...');
        return;
    }
    
    if (!tutorialCompleted && game.difficulty === 'easy') {
        console.log('[TUTORIAL] ✅ Starting in-game tutorial...');
        inGameTutorialActive = true;
        inGameTutorialStep = 0;
        
        // PAUSE TIMER during tutorial
        if (window.pauseGameTimer) {
            window.pauseGameTimer();
            console.log('[TUTORIAL] Timer paused');
        }
        
        showTutorialStep(IN_GAME_TUTORIAL_STEPS[0]);
    } else {
        console.log('[TUTORIAL] ❌ Tutorial not started - conditions not met');
    }
}

function showTutorialStep(step) {
    console.log('[TUTORIAL] Showing step:', step.id);
    
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
            
            console.log('[TUTORIAL] 🎯 Creating spotlight for:', step.highlight, 'Rect:', rect);
            
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
                
                console.log('[TUTORIAL] ✅ Spotlight created successfully');
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
        console.log('[TUTORIAL] Timer resumed (skipped)');
    }
    
    localStorage.setItem('dungeon_scoundrel_tutorial_completed', 'true');
    
    // NO ACHIEVEMENT when skipping!
    showMessage('Tutorial skipped. Good luck!', 'info');
    console.log('[TUTORIAL] Tutorial skipped (no achievement)');
}

function completeTutorial() {
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
        console.log('[TUTORIAL] Timer resumed');
    }
    
    localStorage.setItem('dungeon_scoundrel_tutorial_completed', 'true');
    
    // Unlock achievement ONLY when completing (not skipping)
    unlockAchievement('tutorial_master');
    
    showMessage('🎓 Tutorial completed! Good luck in the dungeon!', 'success');
    console.log('[TUTORIAL] Tutorial completed with achievement!');
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
    const isMiniboss1 = nextRoomNumber === 15;
    const isMiniboss2 = nextRoomNumber === 25;
    
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
    const avoidCost = game.relics.some(r => r.id === 'leather_boots') ? 2 : 3;
    
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

// Undo System - Save game state before action
function saveGameState() {
    game.lastGameState = {
        health: game.health,
        gold: game.gold,
        room: [...game.room],
        dungeon: [...game.dungeon],
        discardPile: [...game.discardPile],
        equippedWeapon: game.equippedWeapon ? {...game.equippedWeapon} : null,
        potionsUsed: game.potionsUsed,
        combo: game.combo,
        heldCard: game.heldCard ? (Array.isArray(game.heldCard) ? [...game.heldCard] : {...game.heldCard}) : null
    };
    game.undoAvailable = true;
}

function undoLastMove() {
    if (!game.undoAvailable || !game.lastGameState) {
        showMessage('❌ No move to undo!', 'warning');
        return;
    }
    
    // Restore game state
    game.health = game.lastGameState.health;
    game.gold = game.lastGameState.gold;
    game.room = [...game.lastGameState.room];
    game.dungeon = [...game.lastGameState.dungeon];
    game.discardPile = [...game.lastGameState.discardPile];
    game.equippedWeapon = game.lastGameState.equippedWeapon ? {...game.lastGameState.equippedWeapon} : null;
    game.potionsUsed = game.lastGameState.potionsUsed;
    game.combo = game.lastGameState.combo;
    game.heldCard = game.lastGameState.heldCard ? (Array.isArray(game.lastGameState.heldCard) ? [...game.lastGameState.heldCard] : {...game.lastGameState.heldCard}) : null;
    
    game.undoAvailable = false;
    game.lastGameState = null;
    
    showMessage('↩️ Move undone!', 'info');
    playSound('cardFlip');
    updateUI();
}

function handleCardClick(card, index) {
    if (game.gameOver) return;
    
    // Save state for undo (Easy/Normal only)
    if (game.difficulty === 'easy' || game.difficulty === 'normal') {
        saveGameState();
    }

    // Obliterate mode - remove ANY card permanently
    if (game.obliterateMode) {
        game.room.splice(index, 1);
        // Don't add to discard - it's obliterated!
        game.obliterateMode = false;
        showMessage('💥 Card OBLITERATED from existence!', 'success');
        playSound('special');
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 40);
        
        // Track obliteration for achievement
        const saved = localStorage.getItem('scoundrel_lifetime_stats');
        let lifetimeStats = saved ? JSON.parse(saved) : {};
        lifetimeStats.cardsObliterated = (lifetimeStats.cardsObliterated || 0) + 1;
        localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
        
        updateUI();
        checkGameState();
        checkAchievements();
        return;
    }

    const cardType = getCardType(card);

    if (cardType === 'monster') handleMonster(card, index);
    else if (cardType === 'weapon') handleWeapon(card, index);
    else if (cardType === 'potion') handlePotion(card, index);
    else if (cardType === 'special') handleSpecial(card, index);
}

function getCardType(card) {
    if (card.special) return 'special';
    if (card.isBoss) return 'monster'; // Boss is a monster!
    if (card.suitName === 'clubs' || card.suitName === 'spades') return 'monster';
    if (card.suitName === 'diamonds') return 'weapon';
    if (card.suitName === 'hearts') return 'potion';
}

function handleSpecial(card, index) {
    game.room.splice(index, 1);
    game.discardPile.push(card);
    game.stats.specialsUsed++;
    
    playSound('special');
    addLog(`Used special: ${card.special.name}`, 'heal');
    card.special.effect();
    
    updateUI();
    checkGameState();
    checkAchievements();
}

function handleMonster(monster, index) {
    const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
    const baseWeapon = game.equippedWeapon ? game.equippedWeapon.numValue : 0;
    
    // Calculate all bonuses using helpers (DRY principle)
    const berserkBonus = getBerserkBonus();
    const bloodlustBonus = getBloodlustBonus();
    const comboBonus = getComboBonus();
    
    // Power Gauntlet: +3 damage on first attack each room
    let gauntletBonus = 0;
    if (game.relics.some(r => r.id === 'gauntlet') && !game.firstAttackDone) {
        gauntletBonus = 3;
        game.firstAttackDone = true; // Mark first attack as done
    }
    
    // Thunder Gauntlet: 20% chance to deal double damage (flag only)
    let thunderCrit = false;
    if (game.relics.some(r => r.id === 'warrior') && Math.random() < 0.2) {
        thunderCrit = true;
    }
    
    // Critical Strike permanent unlock: 10% chance to deal 3x damage (flag only)
    let criticalHit = false;
    if (permanentUnlocks.criticalStrike && Math.random() < 0.1) {
        criticalHit = true;
    }
    
    // Add class ability bonuses
    let classBonus = 0;
    let rogueDoubleActive = false;
    let berserkerTripleActive = false;
    if (game.classAbilityActive && game.classAbilityCounter > 0) {
        if (game.playerClass === 'rogue') {
            // Rogue: 2x damage on next attack
            rogueDoubleActive = true;
        } else if (game.playerClass === 'dancer') {
            // Dancer: +2 damage for next 2 monsters
            classBonus = 2;
        } else if (game.playerClass === 'berserker' && game.rageStrikeActive) {
            // Berserker: 3x damage on next attack
            berserkerTripleActive = true;
        }
    }
    
    const totalWeapon = baseWeapon + powerBonus + berserkBonus + classBonus + bloodlustBonus + comboBonus + gauntletBonus;
    let effectiveWeapon = game.doubleDamage ? totalWeapon * 2 : totalWeapon;
    
    // Thunder Gauntlet: 20% chance to deal double damage
    if (thunderCrit) {
        effectiveWeapon *= 2;
    }
    
    // Critical Strike permanent unlock: 10% chance to deal 3x damage
    if (criticalHit) {
        effectiveWeapon *= 3;
    }
    
    // Apply Rogue Shadow Strike (2x damage)
    if (rogueDoubleActive) {
        effectiveWeapon *= 2;
    }
    
    // Apply Berserker Rage Strike (3x damage)
    if (berserkerTripleActive) {
        effectiveWeapon *= 3;
    }
    
    // Track if weapon durability was already reduced (for boss battles)
    let weaponDurabilityReduced = false;
    
    // Boss battle: reduce HP instead of instant kill
    if (monster.isBoss) {
        // SPECIAL CASE: Boss without weapon - boss attacks once and flees!
        if (!game.equippedWeapon) {
            const bossDamage = monster.numValue;
            game.health -= bossDamage;
            game.stats.totalDamage += bossDamage;
            
            // Remove boss from room
            game.room.splice(index, 1);
            game.discardPile.push(monster);
            
            showMessage(`👹 ${monster.bossName || 'Boss'} attacked and fled! -${bossDamage} HP (NO REWARD!)`, 'danger');
            playSound('damage');
            screenShake();
            createParticles(window.innerWidth / 2, window.innerWidth / 2, '#ff6b6b', 60);
            
            // Additional warning message
            setTimeout(() => {
                showMessage(`⚠️ No weapon equipped = No gold! Always bring a weapon to boss fights!`, 'warning');
            }, 1500);
            
            // Break combo
            resetCombo();
            
            updateUI();
            checkGameState();
            return;
        }
        
        monster.numValue -= effectiveWeapon;
        
        // Weapon durability for boss attacks
        if (game.equippedWeapon && game.equippedWeapon.durability < 999) {
            game.equippedWeapon.durability--;
            weaponDurabilityReduced = true; // Mark that durability was already reduced
            
            if (game.equippedWeapon.durability <= 0) {
                // Weapon broke!
                showMessage(`💔 Your weapon broke!`, 'danger');
                playSound('error');
                game.discardPile.push(game.equippedWeapon);
                game.equippedWeapon = null;
                
                // Check if room is now cleared after weapon broke
                updateUI();
                checkGameState();
            }
        }
        
        if (monster.numValue <= 0) {
            // Boss defeated!
            game.stats.monstersSlain++;
            game.stats.bossesKilled++;  // Track for Berserker unlock
            
            // Check if this is the final boss
            if (monster.bossNumber === 99) {
                game.finalBossDefeated = true;
            }
            
            game.room.splice(index, 1);
            game.discardPile.push(monster);
            
            // Boss gold based on difficulty
            const bossGoldByDifficulty = {
                easy: Math.floor(Math.random() * 16) + 25,    // 25-40 gold
                normal: Math.floor(Math.random() * 11) + 20,  // 20-30 gold
                hard: Math.floor(Math.random() * 11) + 15,    // 15-25 gold
                endless: Math.floor(Math.random() * 11) + 20  // 20-30 gold
            };
            const bossGold = bossGoldByDifficulty[game.difficulty] || 20;
            earnGold(bossGold);
            
            // Victory messages based on boss
            const victoryMessages = [
                '⚔️ The Knight falls silent. The curse is broken...',
                '💉 The Warden collapses. The path ahead is now open.',
                '✨ The Shadow dissolves into nothingness. Light returns.',
                '🌟 The Abyss Keeper is no more. You are the legend now.'
            ];
            
            const victoryMsg = victoryMessages[Math.min(monster.bossNumber - 1, victoryMessages.length - 1)];
            
            showMessage(`👹 ${monster.bossName} DEFEATED! +${bossGold} GOLD!`, 'success');
            setTimeout(() => showMessage(victoryMsg, 'success'), 800);
            
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 80);
            playSound('special');
            
            // Increment combo for boss kill
            game.combo++;
            game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
            
            updateUI();
            checkGameState();
            checkAchievements();
            return;
        } else {
            // Boss still alive - show HP remaining
            showMessage(`⚔️ Hit boss for ${effectiveWeapon} damage! Boss HP: ${monster.numValue}`, 'info');
            playSound('attack');
            updateUI();
            // DON'T return - let player continue in same room with boss
            return;
        }
    }
    
    let damage = Math.max(0, monster.numValue - effectiveWeapon);
    
    // === RELIC DEFENSE SYSTEM (BEFORE DAMAGE CALCULATION) ===
    
    // Mirror Shard: Reflect 2 damage once per room (BEFORE taking damage)
    const mirrorShardRelic = game.relics.find(r => r.id === 'mirror_shard');
    if (mirrorShardRelic && !mirrorShardRelic.usedThisRoom && damage > 0) {
        mirrorShardRelic.usedThisRoom = true;
        const reflectDamage = 2;
        monster.numValue -= reflectDamage;
        showMessage(`🪞 Mirror Shard reflected ${reflectDamage} damage!`, 'info');
        
        // Check if reflection killed the monster
        if (monster.numValue <= 0) {
            game.room.splice(index, 1);
            game.discardPile.push(monster);
            game.stats.monstersSlain++;
            game.combo++;
            game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
            
            // Monster Tooth bonus
            if (game.relics.some(r => r.id === 'tooth')) {
                earnGold(1);
            }
            
            addLog(`Mirror Shard defeated ${monster.value}${monster.suit}!`, 'success');
            showMessage('🪞 Mirror Shard killed the monster!', 'success');
            playSound('special');
            updateUI();
            checkGameState();
            return;
        }
    }
    
    // Thorns Armor permanent unlock: Reflect 2 damage (doesn't prevent damage to player)
    if (permanentUnlocks.thornsArmor && damage > 0) {
        monster.numValue -= 2;
        showMessage('🌵 Thorns Armor reflected 2 damage!', 'info');
        
        // Check if thorns killed the monster
        if (monster.numValue <= 0) {
            game.room.splice(index, 1);
            game.discardPile.push(monster);
            game.stats.monstersSlain++;
            
            // Still take damage but monster is dead
            game.health -= damage;
            game.stats.totalDamage += damage;
            showDamageNumber(damage, 'damage');
            
            // Monster Tooth bonus
            if (game.relics.some(r => r.id === 'tooth')) {
                earnGold(1);
            }
            
            addLog(`Thorns Armor defeated ${monster.value}${monster.suit}!`, 'success');
            showMessage('🌵 Thorns Armor killed the monster (after taking damage)!', 'warning');
            resetCombo();
            updateUI();
            checkGameState();
            return;
        }
    }
    
    // Weak Thorns: Reflect 1 damage (doesn't prevent damage to player) (stacks with thornsArmor)
    if (game.relics.some(r => r.id === 'weak_thorns') && damage > 0) {
        monster.numValue -= 1;
        showMessage('🌿 Weak Thorns reflected 1 damage!', 'info');
        
        // Check if thorns killed the monster
        if (monster.numValue <= 0) {
            game.room.splice(index, 1);
            game.discardPile.push(monster);
            game.stats.monstersSlain++;
            
            // Still take damage but monster is dead
            game.health -= damage;
            game.stats.totalDamage += damage;
            showDamageNumber(damage, 'damage');
            
            // Monster Tooth bonus
            if (game.relics.some(r => r.id === 'tooth')) {
                earnGold(1);
            }
            
            addLog(`Weak Thorns defeated ${monster.value}${monster.suit}!`, 'success');
            showMessage('🌿 Weak Thorns killed the monster (after taking damage)!', 'warning');
            resetCombo();
            updateUI();
            checkGameState();
            return;
        }
    }
    
    // Iron Armor: Reduce ALL damage by 1 (permanent effect)
    if (game.relics.some(r => r.id === 'armor') && damage > 0) {
        const originalDamage = damage;
        damage = Math.max(0, damage - 1);
        if (damage < originalDamage) {
            if (damage === 0) {
                showMessage(`🦾 Iron Armor absorbed all ${originalDamage} damage!`, 'success');
            } else {
                showMessage(`🦾 Iron Armor reduced damage! (${originalDamage} → ${damage})`, 'info');
            }
        }
    }
    
    // Stone Relic - Reduce first damage by 1 each room (stacks with armor)
    let stoneRelic = game.relics.find(r => r.id === 'stone' && !r.stoneUsed);
    if (stoneRelic && damage > 0) {
        stoneRelic.stoneUsed = true;
        const originalDamage = damage;
        damage = Math.max(0, damage - 1);
        if (damage === 0) {
            showMessage(`🪨 Stone absorbed all ${originalDamage} damage!`, 'success');
        } else {
            showMessage(`🪨 Stone reduced damage by 1! (${originalDamage} → ${damage})`, 'info');
        }
    }
    
    // Track if weapon was used for ATTACK (not just defense)
    // If dodge is active, weapon is not used (even if perfect kill)
    let weaponWasUsed = !game.dodgeActive;
    
    // Track if attack was made (for Power consumption)
    // Power should consume when attacking (with or without weapon)
    // But NOT when using defensive abilities (Dodge, Divine Blessing, etc)
    let attackWasMade = !game.dodgeActive;
    
    playSound('attack');
    
    // Dodge (dodgeMaster: avoids 2 attacks instead of 1)
    if (game.dodgeActive && damage > 0) {
        // dodgeMaster unlock: dodge lasts 2 attacks
        if (!permanentUnlocks.dodgeMaster) {
            game.dodgeActive = false;
        } else {
            // Track dodge counter for dodgeMaster
            if (!game.dodgeCounter) game.dodgeCounter = 2;
            game.dodgeCounter--;
            if (game.dodgeCounter <= 0) {
                game.dodgeActive = false;
                game.dodgeCounter = 0;
            }
        }
        playSound('special');
        addLog(`Dodged attack from ${monster.value}${monster.suit}!`, 'heal');
        showMessage('🛡️ Dodged! No damage!', 'success');
    }
    // Priest Divine Blessing - 15% chance to dodge
    else if (damage > 0 && game.classData && game.classData.passive.divineBlessing && Math.random() < 0.15) {
        weaponWasUsed = false; // Divine Blessing = no weapon used
        attackWasMade = false; // Divine Blessing = no attack made
        playSound('special');
        addLog(`Divine Blessing! Dodged attack from ${monster.value}${monster.suit}!`, 'heal');
        showMessage('🕊️ Divine Blessing! No damage!', 'success');
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 40);
        game.combo++;
        game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
    } 
    // Mirror Shield - Reflect damage
    else if (damage > 0 && game.mirrorShield > 0) {
        const reflected = Math.min(damage, game.mirrorShield);
        game.mirrorShield -= reflected;
        const remaining = damage - reflected;
        
        if (remaining > 0) {
            game.health -= remaining;
            game.stats.totalDamage += remaining;
            showDamageNumber(remaining, 'damage');
            playSound('damage');
        }
        
        showMessage(`🪞 Mirror reflected ${reflected} damage! Shield: ${game.mirrorShield}`, 'success');
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 30);
        
        if (remaining <= 0) {
            weaponWasUsed = false; // Mirror blocked all = no weapon used
            attackWasMade = false; // Mirror blocked all = no attack made
            game.combo++;
            game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
        } else {
            resetCombo();
        }
    }
    // Cloak Relic - First damage each room is 0 (PRIORITY)
    else if (damage > 0) {
        let cloakRelic = game.relics.find(r => r.id === 'cloak' && !r.usedThisRoom);
        if (cloakRelic) {
            cloakRelic.usedThisRoom = true;
            weaponWasUsed = false; // Cloak = no weapon used
            attackWasMade = false; // Cloak = no attack made
            showMessage(`🧥 Cloak protected you! No damage this turn!`, 'success');
            playSound('special');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 30);
            // Perfect dodge - keep combo!
            game.combo++;
            game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
            if (game.combo >= 2) {
                showCombo(game.combo);
            }
        } else {
            // Tank Relic Shield - Reduces damage by 1
            let shieldRelic = game.relics.find(r => r.id === 'tank' && !r.shieldUsed);
            if (shieldRelic) {
                shieldRelic.shieldUsed = true;
                const actualDamage = Math.max(0, damage - 1);
                showMessage(`🛡️ Shield absorbed 1 damage! Received ${actualDamage}.`, 'success');
                if (actualDamage > 0) {
                    game.health -= actualDamage;
                    game.stats.totalDamage += actualDamage;
                    showDamageNumber(actualDamage, 'damage');
                    playSound('damage');
                    resetCombo();
                } else {
                    // Shield absorbed all damage - keep combo
                    game.combo++;
                    game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
                }
            } else {
                // Normal Damage
                console.log('[COMBO] Taking damage:', { 
                    damage, 
                    comboBefore: game.combo, 
                    hasWeapon: !!game.equippedWeapon,
                    effectiveWeapon,
                    rogueDoubleActive 
                });
                
                game.health -= damage;
                game.stats.totalDamage += damage;
                
                // Rogue Shadow Strike: don't break combo even when taking damage
                const rogueComboSafe = (game.playerClass === 'rogue' && rogueDoubleActive);
                if (!rogueComboSafe) {
                    console.log('[COMBO] Resetting combo (took damage)');
                    resetCombo(); // Reset combo (unless Rogue ability is active)
                } else {
                    console.log('[COMBO] Rogue Shadow Strike active - combo safe');
                }
                
                console.log('[COMBO] After damage:', { comboAfter: game.combo });
                
                showDamageNumber(damage, 'damage');
                playSound('damage');
                screenShake();
                addLog(`Took ${damage} damage from ${monster.value}${monster.suit}`, 'damage');
                showMessage(`⚔️ Took ${damage} damage!`, 'danger');
            }
        }
    } 
    // Perfect Kill
    else {
        game.combo++;
        game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
        if (game.combo >= 2) {
            showCombo(game.combo);
            playSound('combo');
        }
        
        // Lifesteal (relic + permanent unlock)
        let lifesteal = game.relics.filter(r => r.id === 'vampire').length * 2;
        
        // Permanent unlock: lifeSteal (1 HP on perfect kill)
        if (permanentUnlocks.lifeSteal) {
            lifesteal += 1;
        }
        
        if (lifesteal > 0) {
            game.health = Math.min(game.maxHealth, game.health + lifesteal);
            showMessage(`🧛 +${lifesteal} HP from Vampirism!`, 'success');
        }
        
        // Monster Tooth: +1 gold per monster
        if (game.relics.some(r => r.id === 'tooth')) {
            earnGold(1);
        }
        
        addLog(`Defeated ${monster.value}${monster.suit}! (Combo: ${game.combo})`, 'info');
        if (criticalHit) {
            showMessage(`💥 MEGA CRITICAL! ${game.combo}x COMBO!`, 'success');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 50);
        } else if (thunderCrit) {
            showMessage(`⚡ CRITICAL HIT! ${game.combo}x COMBO!`, 'success');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 30);
        } else {
            showMessage(`⚔️ Perfect kill! ${game.combo}x COMBO!`, 'success');
        }
    }
    
    // Reset Power (doubleDamage) ONLY if attack was made
    // Power consumes when attacking (with or without weapon)
    // But NOT when using defensive abilities (Dodge, Divine Blessing, Mirror, Cloak)
    if (attackWasMade && game.doubleDamage) {
        game.doubleDamage = false;
    }
    
    // Consume Berserk stack ONLY if attack was made
    // Same logic as Power: consumes when attacking, not when defending
    if (attackWasMade && game.berserkStacks > 0 && berserkBonus > 0) {
        game.berserkStacks--;
        showMessage(`🔥 Berserk +5 damage! (${game.berserkStacks} left)`, 'info');
    }
    
    // Weapon durability system - ONLY if weapon was actually USED
    // AND durability wasn't already reduced (boss battles reduce durability earlier)
    if (weaponWasUsed && game.equippedWeapon && game.equippedWeapon.durability < 999 && !weaponDurabilityReduced) {
        game.equippedWeapon.durability--;
        
        if (game.equippedWeapon.durability <= 0) {
            // Weapon broke!
            showMessage(`💔 Your weapon broke!`, 'danger');
            playSound('error');
            game.discardPile.push(game.equippedWeapon);
            game.equippedWeapon = null;
        } else {
            // Show remaining durability
            const emoji = game.equippedWeapon.durability === 1 ? '⚠️' : '⚔️';
            addLog(`${emoji} Weapon: ${game.equippedWeapon.durability}/${game.equippedWeapon.maxDurability} uses left`, 'info');
        }
    }
    
    // Decrement class ability counter ONLY if attack was made
    // Same logic as Power and Berserk: consumes when attacking, not when defending
    if (attackWasMade && game.classAbilityActive && game.classAbilityCounter > 0) {
        game.classAbilityCounter--;
        if (game.classAbilityCounter === 0) {
            game.classAbilityActive = false;
            game.rageStrikeActive = false; // Reset Berserker flag
            showMessage('✨ Class ability buff expired!', 'info');
        }
    }
    
    game.stats.monstersSlain++;
    game.room.splice(index, 1);
    game.discardPile.push(monster);
    
    // Monster gold (difficulty-based, with boss bonus)
    if (monster.isBoss) {
        // Boss gold rewards (much more generous!)
        const bossGoldByDifficulty = {
            easy: Math.floor(Math.random() * 16) + 25,    // 25-40 gold
            normal: Math.floor(Math.random() * 11) + 20,  // 20-30 gold
            hard: Math.floor(Math.random() * 11) + 15,    // 15-25 gold
            endless: Math.floor(Math.random() * 11) + 20  // 20-30 gold
        };
        const bossGold = bossGoldByDifficulty[game.difficulty] || 20;
        earnGold(bossGold);
        showMessage(`👹 BOSS DEFEATED! +${bossGold} gold!`, 'success');
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#d4af37', 50);
    } else {
        // Normal monster gold
        const goldByDifficulty = {
            easy: Math.floor(Math.random() * 4) + 3,    // 3-6 gold
            normal: Math.floor(Math.random() * 3) + 2,  // 2-4 gold
            hard: Math.floor(Math.random() * 3) + 2,    // 2-4 gold (buffed from 1-2)
            endless: Math.floor(Math.random() * 3) + 2  // 2-4 gold
        };
        const baseGold = goldByDifficulty[game.difficulty] || 2;
        earnGold(baseGold);
    }
    
    // Revive
    if (game.health <= 0) {
        const phoenix = game.relics.find(r => r.id === 'phoenix' && !r.used);
        if (phoenix) {
            phoenix.used = true;
            game.health = 10;
            showMessage('🐦 Phoenix Feather activated! Revived with 10 HP!', 'success');
            playSound('special');
            updateRelicsDisplay();
        }
    }
    
    updateRunningScore(); // Update score
    updateUI();
    checkGameState();
    checkAchievements();
}

function handleWeapon(weapon, index) {
    if (game.equippedWeapon) {
        game.discardPile.push(game.equippedWeapon);
    }
    
    // BREAKING COMBO: Equiping weapon breaks combo (strategic choice!)
    if (game.combo > 0) {
        const brokenCombo = game.combo;
        resetCombo();
        if (brokenCombo >= 3) {
            showMessage(`💔 ${brokenCombo}x combo broken! (equipped weapon)`, 'warning');
        }
    }
    
    game.equippedWeapon = weapon;
    game.room.splice(index, 1);
    game.stats.weaponsEquipped++;
    
    // Set durability based on difficulty
    const durabilityMap = { easy: 3, normal: 2, hard: 1, endless: 2 };
    game.equippedWeapon.maxDurability = durabilityMap[game.difficulty] || 2;
    
    // Apply Knight bonus (+1 durability)
    if (game.classData && game.classData.passive.weaponDurabilityBonus) {
        game.equippedWeapon.maxDurability += game.classData.passive.weaponDurabilityBonus;
    }
    
    // Apply permanent unlock bonus (+1 durability)
    if (permanentUnlocks.durablePlus) {
        game.equippedWeapon.maxDurability += 1;
    }
    
    // Gloves relic: +1 durability
    if (game.relics.some(r => r.id === 'gloves')) {
        game.equippedWeapon.maxDurability += 1;
    }
    
    game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
    
    // Master Smith: +1 damage when equipping weapon
    if (game.relics.some(r => r.id === 'master_smith')) {
        game.equippedWeapon.numValue += 1;
        showMessage('🔨 Master Smith enhanced your weapon (+1 damage)!', 'success');
    }
    
    // Check for Durable Weapons relic
    if (game.relics.some(r => r.id === 'durable_weapons')) {
        game.equippedWeapon.maxDurability = 999; // Infinite durability
        game.equippedWeapon.durability = 999;
    }
    
    playSound('equip');
    const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
    addLog(`Equipped ${weapon.value}${weapon.suit}!`, 'equip');
    showMessage(`⚔️ Equipped weapon with value ${weapon.numValue + powerBonus}! (${game.equippedWeapon.durability}/${game.equippedWeapon.maxDurability} uses)`, 'success');
    
    updateUI();
    checkGameState();
    checkAchievements();
}

function handlePotion(potion, index) {
    // Max potions per dungeon (Herb relic: 2x instead of 1x)
    let maxPotionsPerDungeon = 1;
    if (game.relics.some(r => r.id === 'herb')) maxPotionsPerDungeon = 2;
    
    // Dancer can use 2 potions per ROOM (different from dungeon limit)
    const maxPotionsPerRoom = (game.classData && game.classData.passive.maxPotionsPerRoom) || 1;
    
    // Check if potion limit reached (per dungeon)
    if (game.potionsUsed >= maxPotionsPerDungeon) {
        showMessage(`Only ${maxPotionsPerDungeon} potion(s) per dungeon! Discarding...`, 'warning');
        game.room.splice(index, 1);
        game.discardPile.push(potion);
        addLog(`Discarded potion ${potion.value}${potion.suit}`, 'info');
        updateUI();
        checkGameState();
        return;
    }

    // POTIONS DO NOT BREAK COMBO! (Strategic choice - different from weapons)
    // This allows for healing while maintaining combo chains
    
    const healBonus = getRelicBonus('healBonus');
    // Add class bonus (Dancer: +3 HP)
    const classHealBonus = (game.classData && game.classData.passive.potionHealBonus) || 0;
    const heal = potion.numValue + healBonus + classHealBonus;
    
    const oldHealth = game.health;
    game.health = Math.min(game.health + heal, game.maxHealth);
    const actualHeal = game.health - oldHealth;
    
    if (actualHeal > 0) {
        game.potionsUsed++;
        game.stats.potionsUsed++;
        game.stats.totalHealing += actualHeal;
        showDamageNumber(actualHeal, 'heal');
        playSound('heal');
        addLog(`Used ${potion.value}${potion.suit}, healed ${actualHeal} HP`, 'heal');
        showMessage(`💚 Healed ${actualHeal} HP!`, 'success');
    } else {
         showMessage(`💚 HP is full!`, 'info');
    }
    
    game.room.splice(index, 1);
    game.discardPile.push(potion);
    updateUI();
    checkGameState();
    checkAchievements();
}

function checkGameState() {
    console.log('[CHECKGAMESTATE] Called:', { 
        roomLength: game.room.length, 
        gameOver: game.gameOver,
        btnDrawDisabled: btnDrawRoom.disabled,
        btnAvoidDisabled: btnAvoidRoom.disabled
    });
    
    // Room Cleared?
    if (game.room.length === 0 && !game.gameOver) {
        console.log('[CHECKGAMESTATE] ✅ Room cleared! Enabling buttons...');
        
        game.potionsUsed = 0;
        game.stats.roomsCleared++;
        
        // Show combo message if active (combo now persists between rooms!)
        if (game.combo >= 3) {
            showMessage(`🔥 ${game.combo}x COMBO! DUNGEON CLEAR! Keep it going!`, 'success');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 40);
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
        createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 40);
        setTimeout(() => createParticles(window.innerWidth / 2 + 100, window.innerHeight / 2, '#6bcf7f', 30), 150);
        setTimeout(() => createParticles(window.innerWidth / 2 - 100, window.innerHeight / 2, '#4ecdc4', 30), 300);
        
        btnDrawRoom.disabled = false;
        btnAvoidRoom.disabled = game.lastActionWasAvoid;
        
        console.log('[CHECKGAMESTATE] Buttons enabled:', { 
            btnDrawDisabled: btnDrawRoom.disabled,
            btnAvoidDisabled: btnAvoidRoom.disabled
        });
        
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
            easy: 0.40,      // 40% chance
            normal: 0.30,    // 30% chance
            hard: 0.20,      // 20% chance
            endless: 0.25    // 25% chance
        };
        let eventChance = eventChanceByDifficulty[game.difficulty] || 0.30;
        
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
            const bossInRoom = game.room.some(card => card.isBoss && card.bossNumber === 99);
            if (!bossInRoom) {
                console.log('[BOSS] Spawning final boss');
                spawnFinalBoss();
            } else {
                console.log('[BOSS] Final boss already in room, skipping spawn');
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
    if (reason === 'victory') {
        music.switchContext('victory');
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

function calculateDeathScore() {
    // Original logic from Letterboard
    const monstersInDiscard = game.discardPile.filter(c => 
        c.suitName === 'clubs' || c.suitName === 'spades'
    );
    const totalValue = monstersInDiscard.reduce((sum, card) => sum + card.numValue, 0);
    return game.health - totalValue; // Will be a negative number
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

        scoreBreakdownHTML = `
            <div class="game-over-stats" style="background: rgba(0,0,0,0.4); border: 1px solid #ffd700; margin-bottom: 15px; text-align: left;">
                <p style="color: #ffd700; font-weight: bold; font-size: 1.1em; margin-bottom: 10px;">📊 Score Breakdown:</p>
                <p>🎯 Win Bonus: +1000</p>
                <p>❤️ Health Bonus (${game.health} HP): +${healthBonus}</p>
                <p>💰 Gold Bonus (${game.totalGoldEarned} 🪙): +${goldBonus}</p>
                <p>🔥 Combo Bonus (${game.stats.maxCombo}x): +${comboBonus}</p>
                <p>⚔️ Monster Bonus (${game.stats.monstersSlain}): +${monsterBonus}</p>
                ${bonusesHTML}
                <p style="color: #ff6b6b;">⏱️ Time Penalty (${Math.floor(timeInSeconds/60)}m${timeInSeconds%60}s): -${timePenalty}</p>
                <hr style="border-color: rgba(255,255,255,0.2); margin: 5px 0;">
                <p>Subtotal: ${subTotal} x ${difficultyMultiplier}x (${game.difficulty.toUpperCase()}) = <strong style="color: #ffd700; font-size: 1.2em;">${score}</strong></p>
            </div>
        `;
    }
    
    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h1>${title}</h1>
            <p>${message}</p>
            ${scoreBreakdownHTML}
            <p class="game-over-score">${scoreLabel} ${score}</p>
            <div class="game-over-stats">
                <p>📊 <strong>Run Statistics:</strong></p>
                <p>⏱️ Time: ${Math.floor(gameTime/60)}m ${(gameTime%60).toString().padStart(2, '0')}s</p>
                <p>⚔️ Monsters Slain: ${game.stats.monstersSlain}</p>
                <p>🗡️ Weapons Used: ${game.stats.weaponsEquipped}</p>
                <p>💔 Damage Taken: ${game.stats.totalDamage}</p>
                <p>💚 Healing Received: ${game.stats.totalHealing}</p>
                <p>🏰 Rooms Cleared: ${game.stats.roomsCleared}</p>
                <p>🔥 Max Combo: ${game.stats.maxCombo}x</p>
                <p>🪙 Gold Earned: ${game.totalGoldEarned}</p>
            </div>
            <div class="game-over-controls">
                <button class="btn btn-primary" id="btnPlayAgain">🔄 Play Again</button>
                ${submitButtonHTML}
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
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
                await submitScoreToLeaderboard(score, gameTime);
                btn.textContent = '✅ Score Submitted!';
                btn.style.background = 'linear-gradient(180deg, #6bcf7f 0%, #4ecdc4 100%)';
                btn.disabled = true; // Prevent re-submission
                hapticFeedback('success');
                pulseElement(btn, '#6bcf7f');
                console.log(`✅ Score ${score} auto-submitted to leaderboard!`);
                
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
                        await submitScoreToLeaderboard(score, gameTime);
                        btn.textContent = '✅ Score Submitted!';
                        btn.style.background = 'linear-gradient(180deg, #6bcf7f 0%, #4ecdc4 100%)';
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
    // Spawn final boss based on difficulty
    const difficultyHP = {
        easy: 20,
        normal: 30,
        hard: 40
    };
    
    const finalBossHP = difficultyHP[game.difficulty] || 30;
    
    const finalBoss = {
        suit: '👹',
        value: '👹',
        numValue: finalBossHP,
        maxHP: finalBossHP,
        isBoss: true,
        bossNumber: 99,  // Special marker for final boss
        bossName: 'The Dungeon Lord',
        bossFlavor: 'The master of this cursed place. Defeat them to claim your victory!'
    };
    
    game.room = [finalBoss];
    
    playSound('special');
    showMessage('👑 FINAL BOSS: The Dungeon Lord appears!', 'danger');
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
    // Calculate max hold capacity
    let maxHold = 1;
    if (game.selectedClass === 'rogue') maxHold = 2;
    if (game.relics.some(r => r.id === 'feather')) maxHold += 1;
    
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
}

function updateUI() {
    // Check for death FIRST (critical bug fix)
    if (game.health <= 0 && !game.gameOver) {
        endGame('death');
        return; // Stop updating UI
    }
    
    // HP Critical Warning
    if (game.health > 0 && game.health <= 5) {
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
                console.log('[HOLD] Using held card (multi-hold):', game.heldCard[game.heldCardIndex]);
                const selectedCard = game.heldCard.splice(game.heldCardIndex, 1)[0];
                if (game.heldCard.length === 0) {
                    game.heldCard = null;
                    game.heldCardIndex = 0;
                } else {
                    // Adjust index if needed
                    if (game.heldCardIndex >= game.heldCard.length) game.heldCardIndex = 0;
                }
                game.room.unshift(selectedCard);
                console.log('[HOLD] Card added to room, room.length:', game.room.length);
                console.log('[HOLD] Card details:', selectedCard);
                updateUI();
                // SOLUÇÃO DEFINITIVA: Chamar handleCardClick diretamente (sem setTimeout)
                // Isso evita race condition onde carta não existe no DOM ainda
                console.log('[HOLD] Calling handleCardClick directly');
                handleCardClick(selectedCard, 0);
                console.log('[HOLD] ✅ handleCardClick completed');
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
                        console.log('[HOLD] Using held card (array):', game.heldCard[idx]);
                        selectedCard = game.heldCard.splice(idx, 1)[0];
                        if (game.heldCard.length === 0) game.heldCard = null;
                    } else {
                        console.log('[HOLD] Using held card (single):', game.heldCard);
                        selectedCard = game.heldCard;
                        game.heldCard = null;
                    }
                    game.room.unshift(selectedCard);
                    console.log('[HOLD] Card added to room, room.length:', game.room.length);
                    console.log('[HOLD] Card details:', selectedCard);
                    updateUI();
                    // SOLUÇÃO DEFINITIVA: Chamar handleCardClick diretamente (sem setTimeout)
                    // Isso evita race condition onde carta não existe no DOM ainda
                    console.log('[HOLD] Calling handleCardClick directly');
                    handleCardClick(selectedCard, 0);
                    console.log('[HOLD] ✅ handleCardClick completed');
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

let permanentUnlocks = {
    startHealth: false, startGold: false, betterDrops: false, extraRelic: false,
    strongerWeapons: false, masterHealer: false, richStart: false, comboMaster: false,
    bigStart: false, ultraWeapons: false, godMode: false, relicMaster: false,
    shopDiscount: false, eventLuck: false, survivalBonus: false, speedBonus: false,
    weaponMaster: false, potionMaster: false, goldRush: false, comboGod: false,
    durablePlus: false, startPower: false, megaHealth: false, luckyCharm: false,
    berserkMaster: false, mirrorMaster: false, dodgeMaster: false, criticalStrike: false,
    lifeSteal: false, thornsArmor: false
};
const UNLOCKS = [
    // Tier 1: Beginner (Easy)
    { id: 'startHealth', name: '❤️ Tough Start', description: 'Start each run with +5 max HP', requirement: 'Clear 10 rooms', check: () => getTotalStat('roomsCleared') >= 10 },
    { id: 'startGold', name: '💰 Rich Start', description: 'Start each run with 30 gold', requirement: 'Earn 200 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 200 },
    { id: 'strongerWeapons', name: '⚔️ Weapon Expert', description: 'All weapons get +1 damage', requirement: 'Defeat 50 monsters', check: () => getTotalStat('monstersSlain') >= 50 },
    { id: 'masterHealer', name: '💚 Healer', description: 'All potions heal +2 HP', requirement: 'Use 20 potions', check: () => getTotalStat('potionsUsed') >= 20 },
    { id: 'comboMaster', name: '🔥 Combo Start', description: 'Combos start at 1 instead of 0', requirement: 'Get a 5x combo', check: () => getTotalStat('maxCombo') >= 5 },
    
    // Tier 2: Intermediate (Medium)
    { id: 'betterDrops', name: '🍀 Lucky', description: '+30% gold from all sources', requirement: 'Earn 500 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 500 },
    { id: 'extraRelic', name: '🔮 Relic Start', description: 'Start each run with 1 random relic', requirement: 'Clear 30 rooms', check: () => getTotalStat('roomsCleared') >= 30 },
    { id: 'richStart', name: '💎 Wealthy Start', description: 'Start with 50 gold instead of 30', requirement: 'Earn 1000 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 1000 },
    { id: 'weaponMaster', name: '⚔️ Weapon Master', description: 'All weapons get +1 damage (stacks)', requirement: 'Equip 100 weapons', check: () => getTotalStat('weaponsEquipped') >= 100 },
    { id: 'potionMaster', name: '💊 Potion Master', description: 'All potions heal +4 HP (stacks)', requirement: 'Use 75 potions', check: () => getTotalStat('potionsUsed') >= 75 },
    
    // Tier 3: Advanced (Hard)
    { id: 'bigStart', name: '❤️❤️ Warrior Start', description: 'Start with +10 max HP (stacks)', requirement: 'Clear 75 rooms', check: () => getTotalStat('roomsCleared') >= 75 },
    { id: 'durablePlus', name: '🛠️ Durable Weapons', description: 'Weapons have +1 durability on all difficulties', requirement: 'Win 3 games', check: () => getTotalStat('gamesWon') >= 3 },
    { id: 'goldRush', name: '💰💰 Gold Rush', description: '+50% gold from all sources (stacks)', requirement: 'Earn 3000 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 3000 },
    { id: 'shopDiscount', name: '🏪 Merchant Friend', description: '20% discount in all shops', requirement: 'Buy 50 items from shop', check: () => getTotalStat('itemsBought') >= 50 },
    { id: 'relicMaster', name: '🔮🔮 Double Relic Start', description: 'Start with 2 random relics', requirement: 'Clear 100 rooms', check: () => getTotalStat('roomsCleared') >= 100 },
    
    // Tier 4: Expert (Very Hard)
    { id: 'ultraWeapons', name: '⚔️⚔️⚔️ Weapon God', description: 'All weapons get +2 damage (stacks)', requirement: 'Defeat 500 monsters', check: () => getTotalStat('monstersSlain') >= 500 },
    { id: 'startPower', name: '⚡ Power Start', description: 'Start each run with a random weapon', requirement: 'Win 5 games', check: () => getTotalStat('gamesWon') >= 5 },
    { id: 'megaHealth', name: '❤️❤️❤️ Titan Health', description: 'Start with +20 max HP total', requirement: 'Clear 150 rooms', check: () => getTotalStat('roomsCleared') >= 150 },
    { id: 'eventLuck', name: '🎲 Event Master', description: 'Events appear 50% more often', requirement: 'Complete 50 events', check: () => getTotalStat('eventsCompleted') >= 50 },
    { id: 'luckyCharm', name: '🍀🍀 Super Lucky', description: '+60% gold from all sources', requirement: 'Earn 5000 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 5000 },
    
    // Tier 5: Master (Extreme)
    { id: 'comboGod', name: '🔥🔥🔥 Combo God', description: 'Combos start at 2, +2 damage per combo', requirement: 'Get a 15x combo', check: () => getTotalStat('maxCombo') >= 15 },
    { id: 'survivalBonus', name: '💪 Survivor', description: 'Start with +5 HP when below 50% health', requirement: 'Win 10 games', check: () => getTotalStat('gamesWon') >= 10 },
    { id: 'speedBonus', name: '⏱️ Speedrunner', description: 'Gain 2x gold for winning under 1 minute', requirement: 'Win a game in under 1 minute', check: () => getTotalStat('fastestWin') > 0 && getTotalStat('fastestWin') < 60 },
    { id: 'berserkMaster', name: '🔥 Berserk God', description: 'Berserk gives +7 damage instead of +5', requirement: 'Use Berserk 50 times', check: () => getTotalStat('berserkUses') >= 50 },
    { id: 'mirrorMaster', name: '🪞 Mirror Master', description: 'Mirror reflects 15 damage instead of 10', requirement: 'Win a game on Hard', check: () => getTotalStat('hardWins') >= 1 },
    
    // Tier 6: Legend (Insane)
    { id: 'godMode', name: '👑 God Mode', description: 'Start with +15 max HP, 100 gold, 2 relics', requirement: 'Win 20 games', check: () => getTotalStat('gamesWon') >= 20 },
    { id: 'dodgeMaster', name: '🛡️ Dodge God', description: 'Dodge cards avoid 2 attacks instead of 1', requirement: 'Clear 200 rooms', check: () => getTotalStat('roomsCleared') >= 200 },
    { id: 'criticalStrike', name: '💥 Critical Master', description: '10% chance to deal 3x damage', requirement: 'Defeat 1000 monsters', check: () => getTotalStat('monstersSlain') >= 1000 },
    { id: 'lifeSteal', name: '🧛 Vampiric', description: 'Heal 1 HP on every perfect kill', requirement: 'Win 15 games', check: () => getTotalStat('gamesWon') >= 15 },
    { id: 'thornsArmor', name: '🌵 Thorns', description: 'Reflect 2 damage to all attackers', requirement: 'Win 3 games on Hard', check: () => getTotalStat('hardWins') >= 3 }
];

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

// Give relic by specific rarity
function giveRelicByRarity(rarity) {
    let available = RELICS.filter(r => r.rarity === rarity && !game.relics.find(gr => gr.id === r.id));
    
    // If no new relics of this rarity, allow duplicates
    if (available.length === 0) {
        available = RELICS.filter(r => r.rarity === rarity);
    }
    
    if (available.length === 0) {
        showMessage('No relics of this rarity available!', 'warning');
        return;
    }
    
    const randomRelic = available[Math.floor(Math.random() * available.length)];
    game.relics.push({...randomRelic, used: false});
    game.stats.relicsCollected++;  // Track for Priest unlock
    
    // Apply immediate health effects
    if (randomRelic.effect === 'smallHealth') { game.maxHealth += 3; game.health += 3; }
    if (randomRelic.effect === 'maxHealth') { game.maxHealth += 5; game.health += 5; }
    if (randomRelic.effect === 'bigHealth') { game.maxHealth += 10; game.health += 10; }
    if (randomRelic.effect === 'tinyHealth') { game.maxHealth += 1; game.health += 1; }
    
    const rarityColors = { common: '⚪', uncommon: '🟢', rare: '🔵', legendary: '🟠' };
    showMessage(`${rarityColors[rarity]} Relic: ${randomRelic.name}!`, 'success');
    updateRelicsDisplay();
    updateUI();
}

// Give random relic (defaults to common for unlocks)
function giveRandomRelic(rarityFilter = 'common') {
    giveRelicByRarity(rarityFilter);
}

function giveRareRelic() {
    giveRelicByRarity('rare');
}

function updateRelicsDisplay() {
    if (game.relics.length === 0) {
        relicsList.innerHTML = '<div class="relic-effect">No relics yet.</div>';
        return;
    }
    relicsList.innerHTML = game.relics.map(r => {
        let dynamicInfo = '';
        let dynamicDesc = r.description;
        
        // Add dynamic info for Mirror Shield
        if (game.mirrorShield > 0 && (r.id === 'shield' || r.name.includes('Mirror'))) {
            dynamicInfo = ` (${game.mirrorShield} shield remaining)`;
            dynamicDesc += ` | Shield: ${game.mirrorShield} damage`;
        }
        
        // Add dynamic info for Mirror Shard
        if (r.id === 'mirror_shard') {
            if (r.usedThisRoom) {
                dynamicInfo = ' (Used this room)';
                dynamicDesc += ' | Used this room';
            } else {
                dynamicInfo = ' (Ready)';
                dynamicDesc += ' | Ready to reflect';
            }
        }
        
        return `
            <div class="relic-item ${r.used ? 'used' : ''}" 
                 title="${dynamicDesc}${r.used ? ' (Used)' : ''}"
                 onmouseenter="showTooltip(this, '${dynamicDesc.replace(/'/g, "\\'")}', 'bottom')"
                 onmouseleave="hideTooltip()"
                 style="cursor: help;">
                <div class="relic-name">${r.name}${dynamicInfo}</div>
                <div class="relic-effect">${r.description}</div>
            </div>
        `;
    }).join('');
}

function getRelicBonus(type) {
    let bonus = 0;
    game.relics.forEach(r => {
        if (r.effect === type) {
            // Power bonuses
            if (type === 'smallPower') bonus += 1;
            if (type === 'power') bonus += 2;
            if (type === 'bigPower') bonus += 3;
            
            // Heal bonuses
            if (type === 'smallHealBonus') bonus += 1;
            if (type === 'healBonus') bonus += 2;
            
            // Gold bonuses
            if (type === 'smallGoldPerRoom') bonus += 2;
            if (type === 'goldPerRoom') bonus += 3;
        }
    });
    
    // Crown: Double all stat bonuses from relics
    if (game.relics.some(r => r.id === 'crown')) {
        bonus *= 2;
    }
    
    // Permanent unlocks bonuses (BALANCED for better progression)
    if (type === 'power') {
        if (permanentUnlocks.strongerWeapons) bonus += 1;  // +1 damage
        if (permanentUnlocks.weaponMaster) bonus += 1;    // +1 damage (reduced from +2)
        if (permanentUnlocks.ultraWeapons) bonus += 2;    // +2 damage (reduced from +4)
        // Total: +4 instead of +7 (better game balance)
    }
    if (type === 'healBonus') {
        if (permanentUnlocks.masterHealer) bonus += 2;    // +2 HP potions
        if (permanentUnlocks.potionMaster) bonus += 4;    // +4 HP potions (stacks)
    }
    
    // Sum all power types for total weapon bonus
    if (type === 'totalPower') {
        bonus += getRelicBonus('smallPower');
        bonus += getRelicBonus('power');
        bonus += getRelicBonus('bigPower');
    }
    
    return bonus;
}

function triggerRandomEvent() {
    if (game.gameOver) return;
    
    game.stats.eventsTriggered++;  // Track for Priest unlock
    
    // Filter out events already seen this run (no repeats)
    const availableEvents = EVENTS.filter(e => !game.seenEvents.includes(e.id));
    
    // If all events seen, reset the pool
    if (availableEvents.length === 0) {
        game.seenEvents = [];
        availableEvents.push(...EVENTS);
    }
    
    // Pick random event from available pool
    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    
    // Mark event as seen this run
    game.seenEvents.push(event.id);
    
    // Mark that an event was triggered this room (max 1 per room)
    game.eventTriggeredThisRoom = true;
    
    showEventModal(event);
}

function showEventModal(event) {
    eventTitle.textContent = event.title;
    eventText.innerHTML = event.text;
    eventChoices.innerHTML = ''; // Clear previous choices
    
    event.choices.forEach(choice => {
        const choiceEl = document.createElement('div');
        choiceEl.className = 'event-choice';
        choiceEl.innerHTML = choice.text;
        choiceEl.onclick = () => {
            choice.effect();
            
            // Lantern: +2 gold per event
            if (game.relics.some(r => r.id === 'lantern')) {
                earnGold(2);
                showMessage('🏮 Lantern: +2 gold from event!', 'info');
            }
            
            // Holy Necklace: Events heal 2 HP
            if (game.relics.some(r => r.id === 'necklace')) {
                game.health = Math.min(game.maxHealth, game.health + 2);
                showMessage('📿 Holy Necklace: +2 HP!', 'success');
            }
            
            eventModal.classList.remove('active');
            
            // Track event completion for achievement
            const saved = localStorage.getItem('scoundrel_lifetime_stats');
            let lifetimeStats = saved ? JSON.parse(saved) : {};
            lifetimeStats.eventsCompleted = (lifetimeStats.eventsCompleted || 0) + 1;
            localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
            
            // Re-enable buttons if room is empty
            if (game.room.length === 0) {
                btnDrawRoom.disabled = false;
                btnAvoidRoom.disabled = game.lastActionWasAvoid;
            }
            updateUI();
            checkGameState();
            checkAchievements();
        };
        eventChoices.appendChild(choiceEl);
    });
    
    // Disable game buttons while event is active
    btnDrawRoom.disabled = true;
    btnAvoidRoom.disabled = true;
    
    // Show event modal
    eventModal.classList.add('active');
    playSound('special');
}

function updateShopDisplay() {
    // Clear existing items
    shopItems.innerHTML = '';
    shopGoldAmount.textContent = game.gold;
    
    // Check for shop discount (unlocks + relics)
    let discount = 1.0;
    
    // Permanent unlock: 20% discount
    if (permanentUnlocks.shopDiscount) discount *= 0.8;
    
    // Dice relic: 5% discount
    if (game.relics.some(r => r.id === 'dice')) discount *= 0.95;
    
    // Crystal relic: 15% discount
    if (game.relics.some(r => r.id === 'crystal')) discount *= 0.85;
    
    // Show price multiplier warning if prices have increased
    if (game.shopPriceMultiplier > 1.0) {
        const increasePercent = Math.round((game.shopPriceMultiplier - 1) * 100);
        const warningBanner = document.createElement('div');
        warningBanner.style.cssText = 'background: rgba(255, 107, 107, 0.2); border: 2px solid #ff6b6b; padding: 10px; margin-bottom: 15px; text-align: center; border-radius: 8px;';
        warningBanner.innerHTML = `⚠️ <strong>Prices increased by ${increasePercent}%</strong> due to repeated purchases!`;
        shopItems.appendChild(warningBanner);
    }
    
    // Old Key: Check if we have a free item available
    const hasOldKey = game.relics.find(r => r.id === 'key' && !r.used);
    
    SHOP_ITEMS.forEach((item, itemIndex) => {
        // Old Key: First item is FREE (once per game)
        let finalPrice;
        let basePrice = Math.floor(item.price * discount);
        
        if (hasOldKey && itemIndex === 0) {
            finalPrice = 0;
        } else {
            finalPrice = Math.floor(basePrice * game.shopPriceMultiplier);
        }
        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        
        // Add visual indicator if can't afford
        const canAfford = game.gold >= finalPrice;
        const affordClass = canAfford ? '' : 'cannot-afford';
        const priceColor = canAfford ? '#ffd700' : '#ff6b6b';
        
        // Show original price if discount OR price increased
        let priceDisplayHTML = '';
        if (discount < 1.0 && game.shopPriceMultiplier > 1.0) {
            // Show both original and base (with multiplier) if both active
            priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> → <span style="text-decoration: line-through; opacity: 0.5;">${basePrice}</span> `;
        } else if (discount < 1.0) {
            // Just discount
            priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> `;
        } else if (game.shopPriceMultiplier > 1.0) {
            // Just price increase
            priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> `;
        }
        
        itemEl.innerHTML = `
            <div class="item-info ${affordClass}">
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-price" style="color: ${priceColor}; font-weight: bold;">
                    ${priceDisplayHTML}${finalPrice} 🪙
                    ${!canAfford ? ' <span style="color: #ff6b6b; font-size: 0.9em;">(Need ' + (finalPrice - game.gold) + ' more)</span>' : ''}
                </div>
            </div>
            <button class="buy-btn" data-item-id="${item.id}" data-price="${finalPrice}">${canAfford ? 'Buy' : '🔒 Locked'}</button>
        `;
        
        const buyBtn = itemEl.querySelector('.buy-btn');
        if (!canAfford) {
            buyBtn.disabled = true;
            buyBtn.style.opacity = '0.5';
        }
        
        buyBtn.onclick = () => buyItem(item, finalPrice);
        
        shopItems.appendChild(itemEl);
    });
    
    // Show discount banner if unlocked
    if (discount < 1.0) {
        const banner = document.createElement('div');
        banner.style.cssText = 'background: rgba(255, 215, 0, 0.2); border: 2px solid #ffd700; padding: 10px; margin-bottom: 15px; text-align: center; border-radius: 8px;';
        banner.innerHTML = '🏪 <strong>Merchant Friend Active!</strong> 20% discount on all items!';
        shopItems.prepend(banner);
    }
}

function buyItem(item, finalPrice) {
    if (game.gold < finalPrice) {
        showMessage(`❌ Not enough gold! Need ${finalPrice - game.gold} more.`, 'danger');
        playSound('error');
        return;
    }
    
    const success = item.buy(); // Run the item's function
    if (success) {
        // Old Key: Mark as used if this was a free purchase
        if (finalPrice === 0) {
            const keyRelic = game.relics.find(r => r.id === 'key');
            if (keyRelic) {
                keyRelic.used = true;
                showMessage('🗝️ Old Key used - 1 free item!', 'info');
            }
        }
        
        game.gold -= finalPrice;
        
        // ANTI-EXPLOIT: Increase prices by 8% after each purchase (balanced)
        game.shopPriceMultiplier *= 1.08;
        
        showMessage(`Purchased ${item.name}!`, 'success');
        playSound('special');
        
        // Track item purchase for achievement
        const saved = localStorage.getItem('scoundrel_lifetime_stats');
        let lifetimeStats = saved ? JSON.parse(saved) : {};
        lifetimeStats.itemsBought = (lifetimeStats.itemsBought || 0) + 1;
        localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
        
        updateUI();
        updateShopDisplay(); // Re-render shop
        checkAchievements();
    } else {
        playSound('error');
    }
}

function openShop() {
    updateShopDisplay();
    // Disable game buttons
    btnDrawRoom.disabled = true;
    btnAvoidRoom.disabled = true;
    shopModal.classList.add('active');
    
    // Switch to shop music
    music.switchContext('shop');
    
    // Track shop visit for score penalty AND achievements
    game.stats.shopsVisited = (game.stats.shopsVisited || 0) + 1;
    
    const saved = localStorage.getItem('scoundrel_lifetime_stats');
    let lifetimeStats = saved ? JSON.parse(saved) : {};
    lifetimeStats.shopsVisited = (lifetimeStats.shopsVisited || 0) + 1;
    localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
    checkAchievements();
}

function closeShop() {
    shopModal.classList.remove('active');
    // Return to gameplay music
    music.switchContext('gameplay');
    
    // Re-enable buttons based on game state
    if (game.room.length === 0) {
        // No cards in room - enable draw/avoid
        btnDrawRoom.disabled = false;
        btnAvoidRoom.disabled = game.lastActionWasAvoid;
    } else {
        // Cards in room - disable draw/avoid (player must clear room first)
        btnDrawRoom.disabled = true;
        btnAvoidRoom.disabled = true;
    }
}

// Modal open/close functions
function showTutorial() { 
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
}

// Expose Give Up function globally for onclick
window.tryGiveUp = () => {
    if (game.gameStartTime > 0 && !game.gameOver) {
        document.getElementById('giveUpModal').classList.add('active');
    } else {
        alert('Start a game first!');
    }
}

// Expose closeShop globally for onclick
window.closeShopWrapper = () => closeShop();

// Expose closeEvent globally for onclick
window.closeEventWrapper = () => {
    eventModal.classList.remove('active');
    // Re-enable buttons if room is empty
    if (game.room.length === 0) {
        btnDrawRoom.disabled = false;
        btnAvoidRoom.disabled = game.lastActionWasAvoid;
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
            permanentUnlocks = { ...permanentUnlocks, ...parsed }; // This merges the saved data into the default structure
        } catch(e) { console.error("Failed to parse unlocks:", e); }
     }
}
function saveUnlocks() { 
    UNLOCKS.forEach(unlock => {
        if (!permanentUnlocks[unlock.id] && unlock.check()) {
            // We don't unlock here, just check. Unlocking is manual.
        }
    });
    localStorage.setItem('scoundrel_unlocks', JSON.stringify(permanentUnlocks)); 
}

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
// BUG REPORT (EmailJS)
// ============================================
const EMAILJS_SERVICE_ID = 'service_1zs9c54';
const EMAILJS_TEMPLATE_ID = 'template_x3cplm6';
const GAME_VERSION = 'v1.3.0';
function sendBugReport() {
    try {
        const textarea = document.getElementById('bugMessage');
        if (!textarea) { alert('Bug report unavailable.'); return; }
        const message = (textarea.value || '').trim();
        if (!message) { alert('Please describe the bug.'); return; }
        if (!window.emailjs) { alert('Email service not loaded.'); return; }
        const params = {
            from_name: 'Player',
            reply_to: '',
            message: message,
            browser: navigator.userAgent,
            screen: `${window.innerWidth}x${window.innerHeight}`,
            version: GAME_VERSION,
            date: new Date().toLocaleString()
        };
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
            .then(() => {
                document.getElementById('bugReportModal')?.classList.remove('active');
                textarea.value = '';
                alert('Bug report sent. Thank you!');
            })
            .catch(() => {
                alert('Failed to send the bug report. Try again later.');
            });
    } catch (e) {
        alert('Unexpected error while sending.');
    }
}

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
if (typeof updateUI !== 'undefined') window.updateUI = updateUI;
if (typeof updateRelicsDisplay !== 'undefined') window.updateRelicsDisplay = updateRelicsDisplay;
if (typeof takeDamage !== 'undefined') window.takeDamage = takeDamage;
if (typeof resetCombo !== 'undefined') window.resetCombo = resetCombo;
if (typeof buyItem !== 'undefined') window.buyItem = buyItem;
if (typeof handleCardClick !== 'undefined') window.handleCardClick = handleCardClick;
if (typeof getCardType !== 'undefined') window.getCardType = getCardType; // For hold card system

// Expose game state, inputs and unlocks for modules (leaderboard.js, stats.js, codex.js)
window.game = game;
window.playerNameInput = playerNameInput;
window.permanentUnlocks = permanentUnlocks;
window.UNLOCKS = UNLOCKS; // For codex.js
window.createCardElement = createCardElement; // For tutorial - FULL styled cards
window.createMiniCardElement = createMiniCardElement; // For tutorial - mini cards

console.log('[GAME] All functions and state exposed globally for modules');

// Check orientation on load and resize
checkMobileOrientation();
window.addEventListener('resize', debounce(checkMobileOrientation, 300));
