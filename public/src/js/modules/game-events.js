/**
 * ============================================
 * GAME EVENTS MODULE
 * ============================================
 * Event system management
 * 
 * @module game-events
 * @version 1.0.0
 * @author Gabriel Lima
 */

// Import game state
import { game } from './game-state.js';

// DOM Elements (will be initialized after DOM loads)
let eventModal, eventTitle, eventText, eventChoices;
let btnDrawRoom, btnAvoidRoom;

// Initialize DOM elements
function initEventElements() {
    eventModal = document.getElementById('eventModal');
    eventTitle = document.getElementById('eventTitle');
    eventText = document.getElementById('eventText');
    eventChoices = document.getElementById('eventChoices');
    btnDrawRoom = document.getElementById('btnDrawRoom');
    btnAvoidRoom = document.getElementById('btnAvoidRoom');
}

// Call init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventElements);
} else {
    initEventElements();
}

/**
 * Trigger a random event from the available pool
 */
export function triggerRandomEvent() {
    if (game.gameOver) return;
    
    // Access EVENTS from global scope (loaded by game-data.js)
    const EVENTS = window.EVENTS;
    if (!EVENTS) {
        console.error('[EVENTS] EVENTS array not found!');
        return;
    }
    
    game.stats.eventsTriggered++;  // Track for Priest unlock
    
    // Filter out events already seen this run (no repeats)
    let availableEvents = EVENTS.filter(e => !game.seenEvents.includes(e.id));
    
    // If all events seen, reset the pool
    if (availableEvents.length === 0) {
        game.seenEvents = [];
        availableEvents = [...EVENTS];
    }
    
    // Pick random event from available pool
    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    
    // Mark event as seen this run
    game.seenEvents.push(event.id);
    
    // Mark that an event was triggered this room (max 1 per room)
    game.eventTriggeredThisRoom = true;
    
    showEventModal(event);
}

/**
 * Show event modal with choices
 */
export function showEventModal(event) {
    if (!eventModal || !eventTitle || !eventText || !eventChoices) {
        console.error('[EVENTS] Event DOM elements not initialized!');
        return;
    }
    
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
                // Call earnGold from global scope
                if (typeof window.earnGold === 'function') {
                    window.earnGold(2);
                }
                if (typeof window.showMessage === 'function') {
                    window.showMessage('ðŸ® Lantern: +2 gold from event!', 'info');
                }
            }
            
            // Holy Necklace: Events heal 2 HP
            if (game.relics.some(r => r.id === 'necklace')) {
                game.health = Math.min(game.maxHealth, game.health + 2);
                if (typeof window.showMessage === 'function') {
                    window.showMessage('ðŸ“¿ Holy Necklace: +2 HP!', 'success');
                }
            }
            
            eventModal.classList.remove('active');
            
            // Track event completion for achievement
            const saved = localStorage.getItem('scoundrel_lifetime_stats');
            let lifetimeStats = saved ? JSON.parse(saved) : {};
            lifetimeStats.eventsCompleted = (lifetimeStats.eventsCompleted || 0) + 1;
            localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
            
            // Re-enable buttons if room is empty
            if (game.room.length === 0 && btnDrawRoom && btnAvoidRoom) {
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
            
            // Call global functions
            if (typeof window.updateUI === 'function') window.updateUI();
            if (typeof window.checkGameState === 'function') window.checkGameState();
            if (typeof window.checkAchievements === 'function') window.checkAchievements();
        };
        eventChoices.appendChild(choiceEl);
    });
    
    // Disable game buttons while event is active
    if (btnDrawRoom) btnDrawRoom.disabled = true;
    if (btnAvoidRoom) btnAvoidRoom.disabled = true;
    
    // Show event modal
    eventModal.classList.add('active');
    
    // Play sound
    if (typeof window.playSound === 'function') {
        window.playSound('special');
    }
}

/**
 * Close event modal wrapper
 */
export function closeEventWrapper() {
    if (eventModal) {
        eventModal.classList.remove('active');
    }
    
    // Re-enable buttons if room is empty
    if (game.room.length === 0 && btnDrawRoom && btnAvoidRoom) {
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
}

// Global exposure for compatibility
window.triggerRandomEvent = triggerRandomEvent;
window.closeEventWrapper = closeEventWrapper;

