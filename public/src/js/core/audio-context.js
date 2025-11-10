/* ============================================
   AUDIO CONTEXT INITIALIZATION
   Must load before music.js and game.js
   ============================================ */

// Create global audio context for music and sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Master gain for all sound effects
const sfxMasterGain = audioContext.createGain();
sfxMasterGain.connect(audioContext.destination);
sfxMasterGain.gain.value = 0.3; // Default SFX volume

console.log('[AUDIO CONTEXT] Initialized successfully');
