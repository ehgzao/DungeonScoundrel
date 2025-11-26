/**
 * ============================================
 * GAME SOUNDS MODULE
 * ============================================
 * Sound effects system using Web Audio API
 * 
 * @module game-sounds
 * @version 1.0.0
 * @author Gabriel Lima
 * 
 * Dependências:
 * - audioContext (global from audio-context.js)
 * - sfxMasterGain (global from audio-context.js)
 * - game.settings.soundEnabled (from game-state.js)
 */

// ============================================
// IMPORTS
// ============================================
import { game } from './game-state.js';

// ============================================
// SOUND EFFECTS DEFINITIONS
// ============================================
const soundEffects = {
    cardDraw: (ctx, time) => {
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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
        const sfxMasterGain = window.sfxMasterGain;
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

// ============================================
// PLAY SOUND FUNCTION
// ============================================

/**
 * Play a sound effect by name
 * @param {string} soundName - Name of the sound effect to play
 */
export function playSound(soundName) {
    const audioContext = window.audioContext;
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
        // Silently fail - audio context may not be ready
    }
}

// ============================================
// EXPORTS
// ============================================
export { soundEffects };

// ============================================
// GLOBAL EXPOSURE (for compatibility)
// ============================================
window.playSound = playSound;
