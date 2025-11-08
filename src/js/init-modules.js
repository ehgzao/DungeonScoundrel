/**
 * Module Initializer
 * Este arquivo inicializa todos os módulos sem precisar modificar game.js
 * Solução intermediária para deploy rápido
 */

// Import all modules
import { STORAGE_KEYS } from './utils/constants.js';
import { storage } from './utils/storage.js';
import { initializeCodexSystem } from './systems/codex.js';
import { initializeShopSystem } from './systems/shop.js';
import { initializeAchievementSystem } from './systems/achievements.js';
import { initializeMusicSystem } from './systems/music.js';
import { initializeModalManager } from './ui/modals.js';
import { initializeEventManager } from './ui/events.js';

console.log('[INIT] Initializing modular systems...');

// Wait for game.js to load and define its variables
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            // Initialize systems that don't need game dependencies
            console.log('[INIT] Starting system initialization...');
            
            // Music system (independent)
            const musicSystem = initializeMusicSystem();
            console.log('[INIT] ✅ Music system ready');
            
            // Modal manager (independent)
            const modalManager = initializeModalManager();
            console.log('[INIT] ✅ Modal manager ready');
            
            // Store in window for global access
            window.moduleSystems = {
                music: musicSystem,
                modals: modalManager
            };
            
            console.log('[INIT] ✅ Core systems initialized!');
            console.log('[INIT] Game can now use window.moduleSystems');
            
        } catch (error) {
            console.error('[INIT] Error initializing modules:', error);
        }
    }, 100); // Small delay to ensure game.js variables are defined
});

export default true;
