/* ============================================
   IN-GAME TUTORIAL  (Classic mode, first play on Easy)
   ============================================
   Extracted from game.js (TD-3). Behaviour is unchanged — this is a pure move.
   Loads as a classic script AFTER game.js so the window.* helpers it relies on
   (game, drawRoom, showMessage, unlockAchievement, timers, button enable/disable,
   STORAGE_KEYS) already exist. Exposes window.InGameTutorial plus the original
   global function names for any external callers.
   ============================================ */
(function () {
    const game = window.game; // singleton — mutated in place, so the reference is stable
    const SK = () => window.STORAGE_KEYS || {};

    let active = false;
    let stepIndex = 0;

    const STEPS = [
        {
            id: 'welcome',
            title: '🎴 Welcome to Dungeon Scoundrel!',
            text: 'Your Quest Begins!\n\nYou are a SCOUNDREL exploring dark medieval dungeons filled with monsters, treasures, and ancient relics.\n\n🎯 GOAL: Clear all cards from the dungeon deck without dying!',
            visual: null,
            highlight: null,
            position: 'center',
            buttonText: 'Let\'s Start!'
        },
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
            text: 'Right-click (or long-press on touch) a card to HOLD it! This is a unique mechanic in Dungeon Scoundrel.\n\nHeld cards are saved for later and won\'t clutter your room. Perfect for saving strong weapons or potions for when you really need them!',
            highlight: '#holdAreaContainer',
            position: 'left',
            buttonText: 'Great Tip!'
        },
        {
            id: 'draw',
            title: '🎲 Entering Chambers',
            text: 'Click "⚔️ Enter Chamber" to draw 4 cards. Each chamber is a new challenge!',
            highlight: '#btnDrawRoom',
            position: 'top',
            buttonText: 'Enter My First Chamber!',
            action: () => {
                // Directly call drawRoom to draw the first hand of cards
                if (window.drawRoom) window.drawRoom();
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

    function check() {
        // Only show tutorial if not completed/skipped, on Easy, Classic, not active.
        const tutorialCompleted = localStorage.getItem(SK().TUTORIAL_COMPLETED);
        const tutorialSkipped = localStorage.getItem(SK().TUTORIAL_SKIPPED);

        // Prevent the tutorial from starting multiple times
        if (active) return;

        // Interactive tutorial only in Classic (Adventure is map-driven, not linear).
        if (!tutorialCompleted && !tutorialSkipped && game.difficulty === 'easy' && game.mode !== 'adventure') {
            active = true;
            stepIndex = 0;

            // PAUSE TIMER during tutorial
            if (window.pauseGameTimer) window.pauseGameTimer();
            // Disable all game buttons during tutorial
            if (window.disableGameButtons) window.disableGameButtons();

            showStep(STEPS[0]);
        }
    }

    function showStep(step) {
        if (!step) return; // guard: ignore an out-of-range step (e.g. a double-advance race)
        // CLEANUP - Remove ALL previous tutorial elements
        document.querySelectorAll('.tutorial-overlay, .tutorial-spotlight, .tutorial-modal').forEach(el => el.remove());

        // Remove previous highlighting
        document.querySelectorAll('.tutorial-highlighted').forEach(el => {
            el.classList.remove('tutorial-highlighted');
            el.style.position = '';
            el.style.zIndex = '';
            el.style.boxShadow = '';
        });

        // ALWAYS create dark overlay
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

        // SPOTLIGHT element if specified
        if (step.highlight) {
            const targetElement = document.querySelector(step.highlight);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
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

                    targetElement.style.position = 'relative';
                    targetElement.style.zIndex = '10000';
                    targetElement.classList.add('tutorial-highlighted');
                } else {
                    (window.silentWarn || console.warn)('[TUTORIAL] ⚠️ Element not visible (0 dimensions):', step.highlight);
                }
            } else {
                (window.silentWarn || console.warn)('[TUTORIAL] ⚠️ Element not found:', step.highlight);
            }
        }

        // Create MODAL (text explanation)
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
                ${stepIndex > 0 ? '<button class="btn btn-secondary" id="tutorialSkip">Skip Tutorial</button>' : ''}
                <button class="btn btn-primary" id="tutorialNext">${step.buttonText}</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Button handlers
        const nextBtn = document.getElementById('tutorialNext');
        const skipBtn = document.getElementById('tutorialSkip');

        nextBtn.onclick = () => {
            if (step.action) step.action();

            stepIndex++;
            if (stepIndex < STEPS.length) {
                if (step.action) {
                    setTimeout(() => showStep(STEPS[stepIndex]), 1000);
                } else {
                    showStep(STEPS[stepIndex]);
                }
            } else {
                const allTutorialElements = document.querySelectorAll('[id^="tutorialOverlay"], [id^="tutorialSpotlight"], [id^="tutorialModal"], .tutorial-spotlight-element');
                allTutorialElements.forEach(el => el.remove());
                complete();
            }
        };

        if (skipBtn) {
            skipBtn.onclick = () => {
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

                document.getElementById('cancelSkip').onclick = () => confirmModal.remove();
                document.getElementById('confirmSkip').onclick = () => {
                    confirmModal.remove();
                    skip();
                };
            };
        }
    }

    function skip() {
        active = false;

        document.querySelectorAll('.tutorial-overlay, .tutorial-spotlight, .tutorial-modal').forEach(el => el.remove());
        document.querySelectorAll('.tutorial-highlighted').forEach(el => {
            el.classList.remove('tutorial-highlighted');
            el.style.zIndex = '';
            el.style.position = '';
        });

        if (window.resumeGameTimer) window.resumeGameTimer();
        if (window.enableGameButtons) window.enableGameButtons();

        // Set SKIPPED flag (NOT completed) — prevents the achievement from unlocking
        localStorage.setItem(SK().TUTORIAL_SKIPPED, 'true');

        if (window.showMessage) window.showMessage('Tutorial skipped. Good luck!', 'info');
    }

    function complete() {
        active = false;

        document.querySelectorAll('.tutorial-overlay, .tutorial-spotlight, .tutorial-modal').forEach(el => el.remove());

        if (window.enableGameButtons) window.enableGameButtons();

        document.querySelectorAll('.tutorial-highlighted').forEach(el => {
            el.classList.remove('tutorial-highlighted');
            el.style.zIndex = '';
            el.style.position = '';
        });

        if (window.resumeGameTimer) window.resumeGameTimer();

        localStorage.setItem(SK().TUTORIAL_COMPLETED, 'true');

        // Unlock achievement ONLY when completing (not skipping)
        if (window.unlockAchievement) window.unlockAchievement('tutorial_master');

        if (window.showMessage) window.showMessage('🎓 Tutorial completed! Good luck in the dungeon!', 'success');
    }

    // Pulse glow keyframes for the spotlight
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

    // Public API + back-compat global names.
    window.InGameTutorial = { check, isActive: () => active, skip, complete, showStep };
    window.checkAndStartTutorial = check;
    window.skipTutorial = skip;
    window.completeTutorial = complete;
})();
