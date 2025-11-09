/**
 * Storage Utility Module
 * Handles all localStorage operations with error handling
 */

/**
 * Safe localStorage wrapper
 */
export const storage = {
    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed value or default
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading from localStorage (${key}):`, error);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store (will be JSON stringified)
     * @returns {boolean} Success status
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
            return false;
        }
    },

    /**
     * Clear all localStorage
     * @returns {boolean} Success status
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    /**
     * Check if key exists
     * @param {string} key - Storage key
     * @returns {boolean} Exists status
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    },

    /**
     * Update item with a transform function
     * @param {string} key - Storage key
     * @param {Function} updater - Function that receives current value and returns updated value
     * @returns {*} Updated value
     */
    update(key, updater) {
        const current = this.get(key, {});
        const updated = updater(current);
        this.set(key, updated);
        return updated;
    }
};

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
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

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format time in MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Clamp number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Shuffle array (Fisher-Yates)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get random element from array
 * @param {Array} array - Source array
 * @returns {*} Random element
 */
export function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export function percentage(value, total) {
    return total === 0 ? 0 : Math.round((value / total) * 100);
}

/**
 * Wait for specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after wait
 */
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if mobile device
 * @returns {boolean} Is mobile
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if landscape orientation
 * @returns {boolean} Is landscape
 */
export function isLandscape() {
    return window.innerWidth > window.innerHeight;
}

/**
 * Play sound effect
 * @param {string} soundFile - Path to sound file
 * @param {number} volume - Volume (0-1)
 */
export function playSound(soundFile, volume = 0.5) {
    try {
        const audio = new Audio(soundFile);
        audio.volume = volume;
        audio.play().catch(err => console.warn('Sound play failed:', err));
    } catch (error) {
        console.warn('Sound error:', error);
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        return false;
    }
}

export default {
    storage,
    debounce,
    generateId,
    formatTime,
    clamp,
    shuffleArray,
    randomElement,
    deepClone,
    formatNumber,
    percentage,
    wait,
    isMobile,
    isLandscape,
    playSound,
    copyToClipboard
};
