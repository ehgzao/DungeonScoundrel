/**
 * Event Management System
 * Centralized event handling - replaces onclick inline handlers
 */

/**
 * Event Manager
 * Handles all UI events with delegation pattern
 */
export class EventManager {
    constructor(dependencies) {
        this.handlers = {};
        this.dependencies = dependencies || {};
        
        console.log('[EVENTS] Manager initialized');
    }

    /**
     * Initialize all event listeners
     * Call this after DOM is ready and all systems are initialized
     */
    init() {
        this._setupGlobalListeners();
        this._setupButtonListeners();
        this._setupModalListeners();
        this._setupKeyboardShortcuts();
        
        console.log('[EVENTS] All listeners attached');
    }

    /**
     * Setup global event listeners
     * @private
     */
    _setupGlobalListeners() {
        // Close modals on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
            }
        });

        // Escape key closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal-overlay.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
            }
        });
    }

    /**
     * Setup button listeners
     * @private
     */
    _setupButtonListeners() {
        // Use event delegation on document
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            // Get button ID or data attributes
            const id = button.id;
            const action = button.dataset.action;
            const modalId = button.dataset.modal;

            // Handle modal close buttons
            if (button.classList.contains('modal-close-btn') || button.classList.contains('close-modal-btn')) {
                const modal = button.closest('.modal-overlay');
                if (modal) modal.classList.remove('active');
                return;
            }

            // Handle modal open buttons
            if (modalId) {
                const modal = document.getElementById(modalId);
                if (modal) modal.classList.add('active');
                return;
            }

            // Handle action buttons
            if (action && this.handlers[action]) {
                this.handlers[action](e, button);
                return;
            }

            // Handle specific button IDs
            if (id && this.handlers[id]) {
                this.handlers[id](e, button);
            }
        });
    }

    /**
     * Setup modal-specific listeners
     * @private
     */
    _setupModalListeners() {
        // Tab switching in CODEX
        document.querySelectorAll('[data-tab]').forEach(tabBtn => {
            tabBtn.addEventListener('click', () => {
                const tabName = tabBtn.dataset.tab;
                if (window.switchCodexTab) {
                    window.switchCodexTab(tabName);
                }
            });
        });

        // Filter buttons
        document.querySelectorAll('[data-filter]').forEach(filterBtn => {
            filterBtn.addEventListener('click', () => {
                const filterType = filterBtn.dataset.filter;
                const filterValue = filterBtn.dataset.value;

                if (filterType === 'rarity' && window.filterRelicsByRarity) {
                    window.filterRelicsByRarity(filterValue);
                } else if (filterType === 'status' && window.filterUpgradesByStatus) {
                    window.filterUpgradesByStatus(filterValue);
                } else if (filterType === 'tier' && window.filterAchievementsByTier) {
                    window.filterAchievementsByTier(filterValue);
                }
            });
        });
    }

    /**
     * Setup keyboard shortcuts
     * @private
     */
    _setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Space = pause/play music
            if (e.code === 'Space' && window.music) {
                e.preventDefault();
                window.music.toggle();
            }

            // C = open CODEX
            if (e.key === 'c' && window.openCodex) {
                e.preventDefault();
                window.openCodex();
            }

            // M = toggle music
            if (e.key === 'm' && window.music) {
                e.preventDefault();
                window.music.toggle();
            }
        });
    }

    /**
     * Register a handler for specific action
     * @param {string} action - Action name or button ID
     * @param {Function} handler - Handler function
     */
    on(action, handler) {
        this.handlers[action] = handler;
        console.log('[EVENTS] Registered handler:', action);
    }

    /**
     * Unregister a handler
     * @param {string} action - Action name or button ID
     */
    off(action) {
        delete this.handlers[action];
        console.log('[EVENTS] Unregistered handler:', action);
    }

    /**
     * Trigger a handler programmatically
     * @param {string} action - Action name
     * @param {*} data - Data to pass to handler
     */
    trigger(action, data) {
        if (this.handlers[action]) {
            this.handlers[action](data);
        }
    }

    /**
     * Setup game-specific button handlers
     * Call this after game is initialized
     * @param {Object} gameHandlers - Object with handler functions
     */
    setupGameHandlers(gameHandlers) {
        Object.keys(gameHandlers).forEach(action => {
            this.on(action, gameHandlers[action]);
        });
        
        console.log('[EVENTS] Game handlers registered:', Object.keys(gameHandlers).length);
    }
}

/**
 * Initialize event manager and expose globally
 */
export function initializeEventManager(dependencies) {
    const eventManager = new EventManager(dependencies);
    
    // Expose globally
    window.eventManager = eventManager;
    
    console.log('[EVENTS] Manager initialized and exposed globally');
    
    return eventManager;
}

/**
 * Helper: Convert inline onclick to data-action attribute
 * This can be called to progressively enhance existing HTML
 * @param {string} selector - CSS selector for elements
 */
export function convertOnclickToDataAction(selector = '[onclick]') {
    document.querySelectorAll(selector).forEach(element => {
        const onclick = element.getAttribute('onclick');
        if (!onclick) return;

        // Extract function name
        const match = onclick.match(/^(\w+)\(/);
        if (match) {
            const functionName = match[1];
            element.setAttribute('data-action', functionName);
            element.removeAttribute('onclick');
            console.log('[EVENTS] Converted onclick to data-action:', functionName);
        }
    });
}

export default EventManager;
