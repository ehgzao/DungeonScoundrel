/**
 * Modal Management System
 * Handles all modal windows, focus trapping, and messages
 */

/**
 * Modal Manager
 * Centralized modal control system
 */
export class ModalManager {
    constructor() {
        this.activeModal = null;
        this.focusTrapElements = [];
        
        console.log('[MODALS] Manager initialized');
    }

    /**
     * Open a modal by ID
     * @param {string} modalId - ID of modal element
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn('[MODALS] Modal not found:', modalId);
            return;
        }

        modal.classList.add('active');
        this.activeModal = modal;
        this.trapFocus(modal);
        
        console.log('[MODALS] Opened:', modalId);
    }

    /**
     * Close a modal by ID
     * @param {string} modalId - ID of modal element
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn('[MODALS] Modal not found:', modalId);
            return;
        }

        modal.classList.remove('active');
        if (this.activeModal === modal) {
            this.activeModal = null;
        }
        
        console.log('[MODALS] Closed:', modalId);
    }

    /**
     * Close active modal
     */
    closeActiveModal() {
        if (this.activeModal) {
            this.activeModal.classList.remove('active');
            this.activeModal = null;
        }
    }

    /**
     * Trap focus within element (accessibility)
     * @param {HTMLElement} element - Element to trap focus in
     */
    trapFocus(element) {
        if (!element) return;

        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstFocusable.focus();

        // Handle tab key
        const handleTab = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        element.addEventListener('keydown', handleTab);
        this.focusTrapElements.push({ element, handler: handleTab });
    }

    /**
     * Show temporary message
     * @param {string} text - Message text
     * @param {string} type - Message type ('success', 'danger', 'info', 'warning')
     * @param {number} duration - Duration in ms (default: 3000)
     */
    showMessage(text, type = 'info', duration = 3000) {
        // Find or create message container
        let messageContainer = document.getElementById('messageContainer');
        
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'messageContainer';
            messageContainer.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(messageContainer);
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = text;
        messageEl.style.cssText = `
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            animation: slideInUp 0.3s ease;
            pointer-events: auto;
            font-family: 'Cinzel', serif;
            text-align: center;
            max-width: 400px;
        `;

        // Type-specific styling
        const colors = {
            success: { bg: 'rgba(107, 207, 127, 0.95)', border: '#6bcf7f', text: '#fff' },
            danger: { bg: 'rgba(255, 107, 107, 0.95)', border: '#ff6b6b', text: '#fff' },
            info: { bg: 'rgba(78, 205, 196, 0.95)', border: '#4ecdc4', text: '#fff' },
            warning: { bg: 'rgba(255, 217, 61, 0.95)', border: '#ffd93d', text: '#000' }
        };

        const color = colors[type] || colors.info;
        messageEl.style.background = color.bg;
        messageEl.style.border = `2px solid ${color.border}`;
        messageEl.style.color = color.text;

        messageContainer.appendChild(messageEl);

        // Auto-remove after duration
        setTimeout(() => {
            messageEl.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                messageEl.remove();
                
                // Remove container if empty
                if (messageContainer.children.length === 0) {
                    messageContainer.remove();
                }
            }, 300);
        }, duration);
    }

    /**
     * Show confirmation dialog
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback if confirmed
     * @param {Function} onCancel - Callback if cancelled
     */
    showConfirm(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.zIndex = '9999';

        const modal = document.createElement('div');
        modal.className = 'modal-content';
        modal.style.maxWidth = '400px';
        modal.innerHTML = `
            <h2>⚠️ Confirm</h2>
            <p style="margin: 20px 0; font-size: 1.1em;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-danger" id="confirmYes">Yes</button>
                <button class="btn btn-secondary" id="confirmNo">No</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const cleanup = () => overlay.remove();

        document.getElementById('confirmYes').onclick = () => {
            cleanup();
            if (onConfirm) onConfirm();
        };

        document.getElementById('confirmNo').onclick = () => {
            cleanup();
            if (onCancel) onCancel();
        };

        // ESC to cancel
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                if (onCancel) onCancel();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    /**
     * Get active modal
     * @returns {HTMLElement|null} Active modal element
     */
    getActiveModal() {
        return this.activeModal;
    }

    /**
     * Check if any modal is open
     * @returns {boolean} Is any modal open
     */
    isModalOpen() {
        return this.activeModal !== null;
    }
}

/**
 * Initialize and expose modal manager globally
 */
export function initializeModalManager() {
    const modalManager = new ModalManager();
    
    // Expose globally
    window.modalManager = modalManager;
    window.showMessage = (text, type, duration) => modalManager.showMessage(text, type, duration);
    window.trapFocus = (element) => modalManager.trapFocus(element);
    
    console.log('[MODALS] Manager initialized and exposed globally');
    
    return modalManager;
}

export default ModalManager;
