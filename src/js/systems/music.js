/**
 * Music System Module
 * Handles background music, context switching, and volume control
 */

import { MUSIC_TRACKS, STORAGE_KEYS } from '../utils/constants.js';
import { storage, randomElement } from '../utils/storage.js';

/**
 * Music System
 * Manages background music with context switching and volume control
 */
export class MusicSystem {
    constructor() {
        this.currentAudio = null;
        this.currentContext = 'menu';
        this.volume = this._loadVolume();
        this.isPlaying = false;
        this.tracks = MUSIC_TRACKS;
        
        console.log('[MUSIC] System initialized');
    }

    /**
     * Load saved volume from storage
     * @private
     * @returns {number} Volume (0-1)
     */
    _loadVolume() {
        return storage.get(STORAGE_KEYS.MUSIC_VOLUME, 0.5);
    }

    /**
     * Save volume to storage
     * @private
     * @param {number} volume - Volume (0-1)
     */
    _saveVolume(volume) {
        storage.set(STORAGE_KEYS.MUSIC_VOLUME, volume);
    }

    /**
     * Initialize music system
     * @param {string} context - Initial context ('menu', 'gameplay', 'shop', etc.)
     */
    init(context = 'menu') {
        this.currentContext = context;
        this.play();
    }

    /**
     * Play music for current context
     */
    play() {
        // Stop current track if playing
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }

        // Get tracks for current context
        const contextTracks = this.tracks[this.currentContext.toUpperCase()];
        if (!contextTracks || contextTracks.length === 0) {
            console.warn('[MUSIC] No tracks found for context:', this.currentContext);
            return;
        }

        // Pick random track
        const track = randomElement(contextTracks);
        
        try {
            this.currentAudio = new Audio(track.file);
            this.currentAudio.volume = this.volume;
            this.currentAudio.loop = true;
            
            // Play with error handling
            const playPromise = this.currentAudio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        this.isPlaying = true;
                        console.log('[MUSIC] Playing:', track.name);
                    })
                    .catch(error => {
                        console.warn('[MUSIC] Autoplay prevented:', error);
                        this.isPlaying = false;
                    });
            }
        } catch (error) {
            console.error('[MUSIC] Error playing track:', error);
            this.isPlaying = false;
        }
    }

    /**
     * Pause current music
     */
    pause() {
        if (this.currentAudio && this.isPlaying) {
            this.currentAudio.pause();
            this.isPlaying = false;
            console.log('[MUSIC] Paused');
        }
    }

    /**
     * Resume current music
     */
    resume() {
        if (this.currentAudio && !this.isPlaying) {
            const playPromise = this.currentAudio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        this.isPlaying = true;
                        console.log('[MUSIC] Resumed');
                    })
                    .catch(error => {
                        console.warn('[MUSIC] Resume prevented:', error);
                    });
            }
        }
    }

    /**
     * Toggle play/pause
     */
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.resume();
        }
    }

    /**
     * Switch music context (menu, gameplay, shop, victory, defeat)
     * @param {string} context - Context name
     */
    switchContext(context) {
        if (this.currentContext === context) {
            return; // Already in this context
        }

        console.log('[MUSIC] Switching context:', this.currentContext, '→', context);
        this.currentContext = context;
        
        if (this.isPlaying || this.currentAudio) {
            this.play();
        }
    }

    /**
     * Set volume
     * @param {number} volume - Volume (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this._saveVolume(this.volume);
        
        if (this.currentAudio) {
            this.currentAudio.volume = this.volume;
        }
        
        console.log('[MUSIC] Volume set to:', Math.round(this.volume * 100) + '%');
    }

    /**
     * Get current volume
     * @returns {number} Volume (0-1)
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Check if music is playing
     * @returns {boolean} Is playing
     */
    playing() {
        return this.isPlaying;
    }

    /**
     * Stop all music
     */
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.isPlaying = false;
            console.log('[MUSIC] Stopped');
        }
    }

    /**
     * Get current track info
     * @returns {Object|null} Track info
     */
    getCurrentTrack() {
        if (!this.currentContext) return null;
        
        const contextTracks = this.tracks[this.currentContext.toUpperCase()];
        return contextTracks ? contextTracks[0] : null; // Return first track as reference
    }
}

/**
 * Initialize music system and expose globally
 */
export function initializeMusicSystem() {
    const musicSystem = new MusicSystem();
    
    // Expose globally for backwards compatibility
    window.music = musicSystem;
    
    console.log('[MUSIC] System initialized and exposed globally');
    
    return musicSystem;
}

export default MusicSystem;
