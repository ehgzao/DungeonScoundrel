/* ============================================
   DARK ATMOSPHERIC MUSIC SYSTEM
   Medieval dark music inspired by Heretic, Zelda, Diablo
   Extracted from game.js
   ============================================ */

// ============================================
// DARK ATMOSPHERIC MUSIC SYSTEM
// ============================================
// Substitui Epic8BitMusic por atmosfera dark medieval
// Inspirado em Heretic, Zelda, Diablo

class DarkAtmosphericMusic {
    constructor() {
this.context = audioContext;
this.masterGain = this.context.createGain();
this.masterGain.connect(this.context.destination);
this.masterGain.gain.value = 0.70; // Volume inicial 70%

this.isPlaying = false;
this.currentContext = 'menu'; // menu, gameplay, shop, victory, defeat
this.oscillators = [];
this.intervals = [];
this.timeouts = []; // Track timeouts too!
this.gainNodes = [];

// Create reverb buffer ONCE to save memory
this.reverbBuffer = this.createReverbBuffer();

this.contextNames = {
    menu: '🏰 Dark Awakening',
    gameplay: '⚔️ Into the Depths',
    shop: '🏛️ Merchant\'s Shadow',
    victory: '👑 Triumph in Darkness',
    defeat: '💀 The Final Darkness'
};
    }
    
    createReverbBuffer() {
const reverbTime = 2.0;
const reverbDecay = 2.0;
const sampleRate = this.context.sampleRate;
const length = sampleRate * reverbTime;
const impulse = this.context.createBuffer(2, length, sampleRate);

for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, reverbDecay);
    }
}
return impulse;
    }
    
    getCurrentTrackName() {
return this.contextNames[this.currentContext];
    }
    
    start() {
if (this.isPlaying) return;
this.isPlaying = true;
this.playContext(this.currentContext);
this.updateNowPlayingDisplay();
    }
    
    stop() {
this.isPlaying = false;
this.stopAll();
this.updateNowPlayingDisplay();
    }
    
    stopAll() {

// Clear all oscillators
this.oscillators.forEach(osc => {
    try {
        osc.stop();
        osc.disconnect();
    } catch(e) {
        console.warn('[MUSIC] Error stopping oscillator:', e);
    }
});

// Clear all gain nodes (CRITICAL FIX!)
this.gainNodes.forEach(gain => {
    try {
        gain.disconnect();
    } catch(e) {
        console.warn('[MUSIC] Error disconnecting gain:', e);
    }
});

// Clear all intervals
this.intervals.forEach(id => clearInterval(id));

// Clear all timeouts
this.timeouts.forEach(id => clearTimeout(id));

// Clear arrays
this.oscillators = [];
this.intervals = [];
this.timeouts = [];
this.gainNodes = [];

    }
    
    // Sistema de troca automÃ¡tica de contexto
    switchContext(newContext) {
if (this.currentContext === newContext) return;

this.currentContext = newContext;

if (this.isPlaying) {
    this.fadeOut(0.5, () => {
        this.stopAll();
        this.playContext(newContext);
        this.fadeIn(0.5);
    });
}

this.updateNowPlayingDisplay();
    }
    
    fadeOut(duration, callback) {
this.masterGain.gain.exponentialRampToValueAtTime(
    0.001,
    this.context.currentTime + duration
);
const timeoutId = setTimeout(callback, duration * 1000);
this.timeouts.push(timeoutId);
    }
    
    fadeIn(duration) {
this.masterGain.gain.setValueAtTime(0.001, this.context.currentTime);
this.masterGain.gain.exponentialRampToValueAtTime(
    0.70,
    this.context.currentTime + duration
);
    }
    
    playContext(context) {
switch(context) {
    case 'menu': this.playMenuTheme(); break;
    case 'gameplay': this.playGameplayTheme(); break;
    case 'shop': this.playShopTheme(); break;
    case 'victory': this.playVictoryTheme(); break;
    case 'defeat': this.playDefeatTheme(); break;
}
    }
    
    updateNowPlayingDisplay() {
const display = document.getElementById('nowPlayingDisplay');
if (display) {
    display.textContent = this.isPlaying ? 
        this.getCurrentTrackName() : 
        '🎵 Music Paused';
}
    }
    
    setVolume(value) {
// value: 0-100
const normalizedVolume = value / 100;
// Apply exponential curve for better perceived volume control
const targetVolume = normalizedVolume * normalizedVolume * 0.70; // Max 70%
this.masterGain.gain.setValueAtTime(targetVolume, this.context.currentTime);
    }
    
    // ============================================
    // TRACK 1: MENU THEME - Dark Awakening
    // ============================================
    playMenuTheme() {
// Drone grave contÃ­nuo (80 Hz)
this.playDrone(80, 0.20, 'sine');
this.playDrone(120, 0.15, 'triangle'); // HarmÃ´nico

// Pad atmosfÃ©rico dark
this.playAtmosphericPad([196, 246.94, 293.66], 0.08); // G3, B3, D4 (menor)

// Bells medievais espaÃ§ados (a cada 4 segundos)
const bellPattern = [523.25, 392, 493.88, 440]; // C5, G4, B4, A4
let bellIndex = 0;
const bellTimer = setInterval(() => {
    if (!this.isPlaying) return;
    this.playBell(bellPattern[bellIndex % bellPattern.length], 0.08, 2.0);
    bellIndex++;
}, 4000);
this.intervals.push(bellTimer);
    }
    
    // ============================================
    // TRACK 2: GAMEPLAY THEME - Into the Depths
    // ============================================
    playGameplayTheme() {
// Drone + Bass pulsante (90 Hz, 2 batidas por segundo)
this.playDrone(90, 0.18, 'sine');

const bassInterval = 500; // 120 BPM = 500ms
const bassPattern = [90, 90, 135, 90]; // TÃ´nica, tÃ´nica, quinta, tÃ´nica
let bassIndex = 0;
const bassTimer = setInterval(() => {
    if (!this.isPlaying) return;
    this.playPercussiveBass(bassPattern[bassIndex % bassPattern.length], 0.22, 0.15);
    bassIndex++;
}, bassInterval);
this.intervals.push(bassTimer);

// Melodia menor misteriosa (escala frÃ­gia de E)
const melody = [164.81, 174.61, 196, 220, 246.94, 261.63, 293.66]; // E, F, G, A, B, C, D
const melPattern = [4, 3, 2, 0, 2, 3, 4, 2]; // PadrÃ£o misterioso
let melIndex = 0;
const melInterval = 1000;
const melTimer = setInterval(() => {
    if (!this.isPlaying) return;
    const freq = melody[melPattern[melIndex % melPattern.length]];
    this.playNote(freq * 2, 0.10, 0.8, 'triangle');
    melIndex++;
}, melInterval);
this.intervals.push(melTimer);

// PercussÃ£o dark sutil
this.playDarkPercussion(bassInterval * 2);
    }
    
    // ============================================
    // TRACK 3: SHOP THEME - Merchant's Shadow
    // ============================================
    playShopTheme() {
// Drone mais enÃ©rgico
this.playDrone(110, 0.14, 'sine');

// Bass rÃ­tmico (dÃ¡ movimento)
const bassPattern = [110, 110, 165, 110]; // Root, root, fifth, root
let bassIndex = 0;
const bassInterval = 400; // Mais rÃ¡pido
const bassTimer = setInterval(() => {
    if (!this.isPlaying) return;
    this.playPercussiveBass(bassPattern[bassIndex % bassPattern.length], 0.16, 0.12);
    bassIndex++;
}, bassInterval);
this.intervals.push(bassTimer);

// Arpejos medievais com ritmo
const arpNotes = [261.63, 329.63, 392, 493.88]; // C4, E4, G4, B4
let arpIndex = 0;
const arpInterval = 400; // Mais rÃ¡pido (sincronizado com bass)
const arpTimer = setInterval(() => {
    if (!this.isPlaying) return;
    this.playNote(arpNotes[arpIndex % arpNotes.length] * 2, 0.10, 0.35, 'triangle');
    arpIndex++;
}, arpInterval);
this.intervals.push(arpTimer);

// Bells com mais presenÃ§a e ritmo
const bellPattern = [523.25, 659.25, 783.99, 659.25]; // C5, E5, G5, E5
let bellIndex = 0;
const bellTimer = setInterval(() => {
    if (!this.isPlaying) return;
    this.playBell(bellPattern[bellIndex % bellPattern.length], 0.12, 1.2);
    bellIndex++;
}, 1600); // Mais frequente
this.intervals.push(bellTimer);

// REMOVED: PercussÃ£o interval removido - causava chiado apÃ³s vitÃ³ria
// A mÃºsica dark jÃ¡ tem atmosfera suficiente sem percussÃ£o contÃ­nua
    }
    
    // ============================================
    // TRACK 4: VICTORY THEME - Triumph in Darkness (REBUILT)
    // ============================================
    playVictoryTheme() {
// REDESIGNED FROM SCRATCH: All notes have explicit duration, NO continuous drones!

// Fanfarra Ã©pica ascendente (0-3s)
const fanfare = [
    {freq: 261.63, time: 0, duration: 0.3},      // C4
    {freq: 329.63, time: 0.3, duration: 0.3},    // E4
    {freq: 392, time: 0.6, duration: 0.3},       // G4
    {freq: 523.25, time: 0.9, duration: 0.5},    // C5
    {freq: 659.25, time: 1.5, duration: 0.4},    // E5
    {freq: 783.99, time: 2.0, duration: 0.8},    // G5 - REDUCED duration (was 1.0)
];

fanfare.forEach(note => {
    const timeoutId = setTimeout(() => {
        if (!this.isPlaying) return;
        this.playNote(note.freq, 0.20, note.duration, 'square');
        this.playNote(note.freq * 2, 0.12, note.duration, 'triangle');
        this.playBell(note.freq, 0.08, note.duration * 1.5); // Reduced from *2
    }, note.time * 1000);
    this.timeouts.push(timeoutId);
});

// PercussÃ£o triunfante (0-2.4s)
for (let i = 0; i < 4; i++) {
    const hitTimeout = setTimeout(() => {
        if (!this.isPlaying) return;
        this.playPercussiveBass(60, 0.15, 0.1);
    }, i * 600);
    this.timeouts.push(hitTimeout);
}

// Arpejo final celebratÃ³rio (3-3.6s)
const arpeggio = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
arpeggio.forEach((freq, index) => {
    const timeoutId = setTimeout(() => {
        if (!this.isPlaying) return;
        this.playNote(freq, 0.15, 0.25, 'sine'); // Reduced duration
    }, (3000 + index * 150));
    this.timeouts.push(timeoutId);
});

// FINAL NOTE: Note sustentada que PARA automaticamente (3.6-5.1s)
const finalNoteTimeout = setTimeout(() => {
    if (!this.isPlaying) return;
    // Nota final C5 com fade out gradual - duraÃ§Ã£o DEFINIDA
    this.playNote(523.25, 0.18, 1.5, 'sine'); // 1.5s duration - STOPS at 5.1s
}, 3600);
this.timeouts.push(finalNoteTimeout);

// REMOVED: Drone contÃ­nuo eliminado! Era o culpado do chiado!
// Victory theme agora termina completamente em ~5.1 segundos
    }
    
    // ============================================
    // TRACK 5: DEFEAT THEME - The Final Darkness
    // ============================================
    playDefeatTheme() {
// Descida cromÃ¡tica sombria
const descent = [
    {freq: 293.66, time: 0},    // D4
    {freq: 277.18, time: 0.6},  // C#4
    {freq: 261.63, time: 1.2},  // C4
    {freq: 246.94, time: 1.8},  // B3
    {freq: 220, time: 2.4},     // A3
];

descent.forEach(note => {
    const timeoutId = setTimeout(() => {
        if (!this.isPlaying) return;
        this.playNote(note.freq, 0.15, 0.8, 'sine');
    }, note.time * 1000);
    this.timeouts.push(timeoutId);
});

// Bells fÃºnebres
const bell1TimeoutId = setTimeout(() => {
    if (!this.isPlaying) return;
    this.playBell(523.25, 0.08, 3.0); // C5
}, 1000);
this.timeouts.push(bell1TimeoutId);

const bell2TimeoutId = setTimeout(() => {
    if (!this.isPlaying) return;
    this.playBell(392, 0.08, 3.0); // G4
}, 2000);
this.timeouts.push(bell2TimeoutId);

// Fade to silence
const fadeTimeoutId = setTimeout(() => {
    this.fadeOut(2.0, () => {});
}, 3000);
this.timeouts.push(fadeTimeoutId);
    }
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    playDrone(freq, volume, waveType = 'sine') {
const osc = this.context.createOscillator();
const gain = this.context.createGain();
const filter = this.context.createBiquadFilter();

osc.type = waveType;
osc.frequency.value = freq;

filter.type = 'lowpass';
filter.frequency.value = freq * 4; // Filtro suave
filter.Q.value = 1;

osc.connect(filter);
filter.connect(gain);
gain.connect(this.masterGain);

gain.gain.setValueAtTime(0, this.context.currentTime);
gain.gain.exponentialRampToValueAtTime(volume, this.context.currentTime + 1.0);

osc.start(this.context.currentTime);

this.oscillators.push(osc);
this.gainNodes.push(gain);
    }
    
    playNote(freq, volume, duration, waveType = 'sine') {
const osc = this.context.createOscillator();
const gain = this.context.createGain();
const reverb = this.context.createConvolver();

// Reuse pre-created reverb buffer (CRITICAL FIX for memory leak)
reverb.buffer = this.reverbBuffer;

osc.type = waveType;
osc.frequency.value = freq;

osc.connect(gain);
gain.connect(reverb);
reverb.connect(this.masterGain);

const now = this.context.currentTime;
gain.gain.setValueAtTime(volume, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

osc.start(now);
osc.stop(now + duration);

// REMOVED: NÃ£o rastreamos notes temporÃ¡rias (param automaticamente)
    }
    
    playBell(freq, volume, duration) {
// Bell com harmÃ´nicos
const harmonics = [1, 2.76, 5.4, 8.93]; // ProporÃ§Ãµes de sino

harmonics.forEach((harmonic, index) => {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq * harmonic;
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    const now = this.context.currentTime;
    const vol = volume / (index + 1); // HarmÃ´nicos mais baixos
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
    
    // REMOVED: NÃ£o rastreamos bells temporÃ¡rios (param automaticamente)
});
    }
    
    playPercussiveBass(freq, volume, duration) {
const osc = this.context.createOscillator();
const gain = this.context.createGain();

osc.type = 'sine';
osc.frequency.setValueAtTime(freq, this.context.currentTime);
osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.context.currentTime + duration);

osc.connect(gain);
gain.connect(this.masterGain);

const now = this.context.currentTime;
gain.gain.setValueAtTime(volume, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

osc.start(now);
osc.stop(now + duration);

// REMOVED: NÃ£o rastreamos bass temporÃ¡rio (para automaticamente)
    }
    
    playAtmosphericPad(freqs, volume) {
freqs.forEach(freq => {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    
    filter.type = 'lowpass';
    filter.frequency.value = freq * 2;
    filter.Q.value = 0.7;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 2.0);
    
    osc.start(this.context.currentTime);
    
    this.oscillators.push(osc);
});
    }
    
    playDarkPercussion(interval) {
const percTimer = setInterval(() => {
    if (!this.isPlaying) return;
    
    // Kick drum grave
    const kick = this.context.createOscillator();
    const kickGain = this.context.createGain();
    
    kick.frequency.setValueAtTime(150, this.context.currentTime);
    kick.frequency.exponentialRampToValueAtTime(40, this.context.currentTime + 0.1);
    
    kick.connect(kickGain);
    kickGain.connect(this.masterGain);
    
    kickGain.gain.setValueAtTime(0.15, this.context.currentTime);
    kickGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
    
    const startTime = this.context.currentTime;
    kick.start(startTime);
    kick.stop(startTime + 0.1);
    
    // REMOVED: NÃ£o rastreamos oscillators temporÃ¡rios!
    // Eles param automaticamente em 0.1s
    // Rastrear causa conflitos com stopAll()
}, interval);

this.intervals.push(percTimer);
}

playNote(freq, volume, duration, waveType = 'sine') {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const reverb = this.context.createConvolver();

    // Reuse pre-created reverb buffer (CRITICAL FIX for memory leak)
    reverb.buffer = this.reverbBuffer;

    osc.type = waveType;
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(reverb);
    reverb.connect(this.masterGain);

    const now = this.context.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
}

playBell(freq, volume, duration) {
    // Bell com harmÃ´nicos
    const harmonics = [1, 2.76, 5.4, 8.93]; // ProporÃ§Ãµes de sino

    harmonics.forEach((harmonic, index) => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq * harmonic;

        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.context.currentTime;
        const vol = volume / (index + 1); // HarmÃ´nicos mais baixos
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    });
}

playPercussiveBass(freq, volume, duration) {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.context.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.context.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
}

playAtmosphericPad(freqs, volume) {
    freqs.forEach(freq => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        filter.type = 'lowpass';
        filter.frequency.value = freq * 2;
        filter.Q.value = 0.7;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 2.0);

        osc.start(this.context.currentTime);

        this.oscillators.push(osc);
    });
}

playDarkPercussion(interval) {
    const percTimer = setInterval(() => {
        if (!this.isPlaying) return;

        // Kick drum grave
        const kick = this.context.createOscillator();
        const kickGain = this.context.createGain();

        kick.frequency.setValueAtTime(150, this.context.currentTime);
        kick.frequency.exponentialRampToValueAtTime(40, this.context.currentTime + 0.1);

        kick.connect(kickGain);
        kickGain.connect(this.masterGain);

        kickGain.gain.setValueAtTime(0.15, this.context.currentTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);

        const startTime = this.context.currentTime;
        kick.start(startTime);
        kick.stop(startTime + 0.1);
    }, interval);

    this.intervals.push(percTimer);
}

    // MÃ©todos de compatibilidade com cÃ³digo existente
    nextTrack() {
        // Compatibilidade
        if (typeof playSound !== 'undefined') playSound('cardFlip');
    }

    prevTrack() {
        // Compatibilidade
        if (typeof playSound !== 'undefined') playSound('cardFlip');
    }
}

// Create music instance
const music = new DarkAtmosphericMusic();

// Expose globally
window.music = music;

// Music button hooks will be set up in game.js after DOM is ready
// All DOM manipulation and game state access moved to game.js
