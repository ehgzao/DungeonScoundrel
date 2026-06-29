/* ============================================
   AUDIO CONTEXT INITIALIZATION
   Must load before music.js and game.js
   ============================================ */

// Create global audio context for music and sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
window.audioContext = audioContext; // Expose globally for music.js

// Master gain for all sound effects
const sfxMasterGain = audioContext.createGain();
sfxMasterGain.connect(audioContext.destination);
sfxMasterGain.gain.value = 0.3; // Default SFX volume
window.sfxMasterGain = sfxMasterGain; // Expose globally for game-sounds.js

// Browser autoplay policy creates the context in a "suspended" state until a
// user gesture. Resume it once on the first interaction so music/SFX play.
const _resumeAudioContext = () => {
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
    }
};
['pointerdown', 'keydown', 'touchstart'].forEach((evt) =>
    document.addEventListener(evt, _resumeAudioContext, { once: true }));

