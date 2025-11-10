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
    shop: '🛍️ Merchant\'s Shadow',
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
console.log('[MUSIC] Stopping all audio...');

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

console.log('[MUSIC] All audio stopped.');
    }
    
    // Sistema de troca automática de contexto
    switchContext(newContext) {
if (this.currentContext === newContext) return;
console.log(`🎵 Music: ${this.currentContext} → ${newContext}`);

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
    
    // ============================================
    // TRACK 1: MENU THEME - Dark Awakening
    // ============================================
    playMenuTheme() {
// Drone grave contínuo (80 Hz)
this.playDrone(80, 0.20, 'sine');
this.playDrone(120, 0.15, 'triangle'); // Harmônico

// Pad atmosférico dark
this.playAtmosphericPad([196, 246.94, 293.66], 0.08); // G3, B3, D4 (menor)

// Bells medievais espaçados (a cada 4 segundos)
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
const bassPattern = [90, 90, 135, 90]; // Tônica, tônica, quinta, tônica
let bassIndex = 0;
const bassTimer = setInterval(() => {
    if (!this.isPlaying) return;
    this.playPercussiveBass(bassPattern[bassIndex % bassPattern.length], 0.22, 0.15);
    bassIndex++;
}, bassInterval);
this.intervals.push(bassTimer);

// Melodia menor misteriosa (escala frígia de E)
const melody = [164.81, 174.61, 196, 220, 246.94, 261.63, 293.66]; // E, F, G, A, B, C, D
const melPattern = [4, 3, 2, 0, 2, 3, 4, 2]; // Padrão misterioso
let melIndex = 0;
const melInterval = 1000;
const melTimer = setInterval(() => {
    if (!this.isPlaying) return;
    const freq = melody[melPattern[melIndex % melPattern.length]];
    this.playNote(freq * 2, 0.10, 0.8, 'triangle');
    melIndex++;
}, melInterval);
this.intervals.push(melTimer);

// Percussão dark sutil
this.playDarkPercussion(bassInterval * 2);
    }
    
    // ============================================
    // TRACK 3: SHOP THEME - Merchant's Shadow
    // ============================================
    playShopTheme() {
// Drone mais enérgico
this.playDrone(110, 0.14, 'sine');

// Bass rítmico (dá movimento)
const bassPattern = [110, 110, 165, 110]; // Root, root, fifth, root
let bassIndex = 0;
const bassInterval = 400; // Mais rápido
const bassTimer = setInterval(() => {
    if (!this.isPlaying) return;
    this.playPercussiveBass(bassPattern[bassIndex % bassPattern.length], 0.16, 0.12);
    bassIndex++;
}, bassInterval);
this.intervals.push(bassTimer);

// Arpejos medievais com ritmo
const arpNotes = [261.63, 329.63, 392, 493.88]; // C4, E4, G4, B4
let arpIndex = 0;
const arpInterval = 400; // Mais rápido (sincronizado com bass)
const arpTimer = setInterval(() => {
    if (!this.isPlaying) return;
    this.playNote(arpNotes[arpIndex % arpNotes.length] * 2, 0.10, 0.35, 'triangle');
    arpIndex++;
}, arpInterval);
this.intervals.push(arpTimer);

// Bells com mais presença e ritmo
const bellPattern = [523.25, 659.25, 783.99, 659.25]; // C5, E5, G5, E5
let bellIndex = 0;
const bellTimer = setInterval(() => {
    if (!this.isPlaying) return;
    this.playBell(bellPattern[bellIndex % bellPattern.length], 0.12, 1.2);
    bellIndex++;
}, 1600); // Mais frequente
this.intervals.push(bellTimer);

// REMOVED: Percussão interval removido - causava chiado após vitória
// A música dark já tem atmosfera suficiente sem percussão contínua
    }
    
    // ============================================
    // TRACK 4: VICTORY THEME - Triumph in Darkness (REBUILT)
    // ============================================
    playVictoryTheme() {
// REDESIGNED FROM SCRATCH: All notes have explicit duration, NO continuous drones!

// Fanfarra épica ascendente (0-3s)
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

// Percussão triunfante (0-2.4s)
for (let i = 0; i < 4; i++) {
    const hitTimeout = setTimeout(() => {
        if (!this.isPlaying) return;
        this.playPercussiveBass(60, 0.15, 0.1);
    }, i * 600);
    this.timeouts.push(hitTimeout);
}

// Arpejo final celebratório (3-3.6s)
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
    // Nota final C5 com fade out gradual - duração DEFINIDA
    this.playNote(523.25, 0.18, 1.5, 'sine'); // 1.5s duration - STOPS at 5.1s
}, 3600);
this.timeouts.push(finalNoteTimeout);

// REMOVED: Drone contínuo eliminado! Era o culpado do chiado!
// Victory theme agora termina completamente em ~5.1 segundos
    }
    
    // ============================================
    // TRACK 5: DEFEAT THEME - The Final Darkness
    // ============================================
    playDefeatTheme() {
// Descida cromática sombria
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

// Bells fúnebres
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

// REMOVED: Não rastreamos notes temporárias (param automaticamente)
    }
    
    playBell(freq, volume, duration) {
// Bell com harmônicos
const harmonics = [1, 2.76, 5.4, 8.93]; // Proporções de sino

harmonics.forEach((harmonic, index) => {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq * harmonic;
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    const now = this.context.currentTime;
    const vol = volume / (index + 1); // Harmônicos mais baixos
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
    
    // REMOVED: Não rastreamos bells temporários (param automaticamente)
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

// REMOVED: Não rastreamos bass temporário (para automaticamente)
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
    
    // REMOVED: Não rastreamos oscillators temporários!
    // Eles param automaticamente em 0.1s
    // Rastrear causa conflitos com stopAll()
}, interval);

this.intervals.push(percTimer);
    }
    
    // Métodos de compatibilidade com código existente
    nextTrack() {
// No sistema novo, não há "next track" manual
// Mas mantém compatibilidade
playSound('cardFlip');
    }
    
    prevTrack() {
// Compatibilidade
playSound('cardFlip');
    }
}
const music = new DarkAtmosphericMusic();

// Sound/Music Hooks
// btnTopSound removed - redundant with Play/Pause + Volume
btnMusicToggle.onclick = function() {
    game.settings.musicEnabled = !game.settings.musicEnabled;
    this.classList.toggle('active', game.settings.musicEnabled);
    this.textContent = game.settings.musicEnabled ? '⏸️' : '⏯️';

    if (game.settings.musicEnabled) {
        music.start();
    } else {
        music.stop();
    }
};

// Music Volume Control (Gameplay)
const musicVolumeSlider = document.getElementById('musicVolume');
if (musicVolumeSlider) {
    // Initialize slider background with current value
    const initialVolume = musicVolumeSlider.value || 40;
    musicVolumeSlider.style.background = `linear-gradient(to right, #c9a961 0%, #c9a961 ${initialVolume}%, #2a2318 ${initialVolume}%, #2a2318 100%)`;
    
    // Set initial volume to 40%
    music.masterGain.gain.value = initialVolume / 100;
    
    // Apply debounce to reduce excessive calls
    musicVolumeSlider.oninput = debounce((e) => {
        const volume = e.target.value / 100;
        const volumePercent = e.target.value;
        music.masterGain.gain.value = volume;
        
        // Update slider background dynamically
        e.target.style.background = `linear-gradient(to right, #c9a961 0%, #c9a961 ${volumePercent}%, #2a2318 ${volumePercent}%, #2a2318 100%)`;
        
        // Haptic feedback on volume change
        hapticFeedback('light');
    }, 50);
}

// Welcome Screen Music Controls (AFTER music is created)
const btnWelcomeMusicToggle = document.getElementById('btnWelcomeMusicToggle');
const btnWelcomeSoundboard = document.getElementById('btnWelcomeSoundboard');

// Update music button visual
function updateWelcomeMusicButton() {
    if (btnWelcomeMusicToggle) {
        btnWelcomeMusicToggle.textContent = music.isPlaying ? '⏸️' : '⏯️';
        btnWelcomeMusicToggle.style.opacity = music.isPlaying ? '1' : '0.7';
    }
    
    // Update now playing display
    music.updateNowPlayingDisplay();
}

if (btnWelcomeMusicToggle) {
    btnWelcomeMusicToggle.onclick = () => {
        game.settings.musicEnabled = !game.settings.musicEnabled;
        if (game.settings.musicEnabled) {
            music.start();
        } else {
            music.stop();
        }
        updateWelcomeMusicButton();
        playSound('click');
    };
}

// Music Volume Control (Welcome Screen)
const welcomeMusicVolumeSlider = document.getElementById('welcomeMusicVolume');
if (welcomeMusicVolumeSlider) {
    // Initialize slider background with current value
    const initialVolume = welcomeMusicVolumeSlider.value;
    welcomeMusicVolumeSlider.style.background = `linear-gradient(to right, #c9a961 0%, #c9a961 ${initialVolume}%, #2a2318 ${initialVolume}%, #2a2318 100%)`;
    
    // Apply debounce to reduce excessive calls
    welcomeMusicVolumeSlider.oninput = debounce((e) => {
        const volume = e.target.value / 100;
        const volumePercent = e.target.value;
        music.masterGain.gain.value = volume;
        
        // Update slider background dynamically
        e.target.style.background = `linear-gradient(to right, #c9a961 0%, #c9a961 ${volumePercent}%, #2a2318 ${volumePercent}%, #2a2318 100%)`;
        
        // Sync with gameplay slider
        if (musicVolumeSlider) {
            musicVolumeSlider.value = e.target.value;
            musicVolumeSlider.style.background = `linear-gradient(to right, #c9a961 0%, #c9a961 ${volumePercent}%, #2a2318 ${volumePercent}%, #2a2318 100%)`;
        }
        
        // Haptic feedback
        hapticFeedback('light');
    }, 50);
}

// Soundboard Modal
const soundboardModal = document.getElementById('soundboardModal');
const btnCloseSoundboard = document.getElementById('btnCloseSoundboard');

if (btnWelcomeSoundboard) {
    btnWelcomeSoundboard.onclick = () => {
        soundboardModal.classList.add('active');
        playSound('click');
    };
}

// Helper: Update all soundboard buttons to PLAY state
function updateSoundboardButtons() {
    ['Menu', 'Gameplay', 'Shop', 'Victory', 'Defeat'].forEach(theme => {
        const btn = document.getElementById(`btnPlay${theme}`);
        if (btn) {
            const isCurrentTheme = music.currentContext === theme.toLowerCase();
            const isPlaying = music.isPlaying && isCurrentTheme;
            btn.innerHTML = isPlaying ? '⏸️ PAUSE' : '▶️ PLAY';
        }
    });
}

if (btnCloseSoundboard) {
    btnCloseSoundboard.onclick = () => {
        soundboardModal.classList.remove('active');
        
        // COMPLETE FIX: Stop music AND return to menu theme
        music.stop();
        music.switchContext('menu');
        music.start();
        
        // Update all buttons to PLAY state
        updateSoundboardButtons();
        updateWelcomeMusicButton();
        
        console.log('[MUSIC] Soundboard closed, returned to menu theme.');
    };
}

// Soundboard Buttons - REWRITTEN with toggle functionality
const setupSoundboardButton = (btnId, context) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        const isCurrentContext = music.currentContext === context;
        const isPlaying = music.isPlaying;
        
        if (isPlaying && isCurrentContext) {
            // PAUSE current theme
            music.stop();
            btn.innerHTML = '▶️ PLAY';
        } else {
            // PLAY this theme
            game.settings.musicEnabled = true;
            music.switchContext(context);
            music.start();
            updateSoundboardButtons(); // Update ALL buttons
        }
        
        playSound('cardFlip');
        updateWelcomeMusicButton();
    });
};

// Setup all soundboard buttons
setupSoundboardButton('btnPlayMenu', 'menu');
setupSoundboardButton('btnPlayGameplay', 'gameplay');
setupSoundboardButton('btnPlayShop', 'shop');
setupSoundboardButton('btnPlayVictory', 'victory');
setupSoundboardButton('btnPlayDefeat', 'defeat');

// Initialize button states
updateSoundboardButtons();

// Initialize welcome music button state
updateWelcomeMusicButton();

// Particles System with performance limit
let activeParticles = 0;
const MAX_PARTICLES = 150; // Prevent performance issues

function createParticles(x, y, color, count = 10) {
    // Limit number of particles for performance
    const actualCount = Math.min(count, MAX_PARTICLES - activeParticles);
    if (actualCount <= 0) return; // Skip if at limit
    
    for (let i = 0; i < actualCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            background: ${color};
            border-radius: 50%;
            animation: particleFade ${Math.random() * 0.5 + 0.5}s ease-out forwards;
            transform: translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px);
        `;
        activeParticles++;
        document.body.appendChild(particle);
        setTimeout(() => {
            particle.remove();
            activeParticles--;
        }, 1000);
    }
}

// Add particle animation CSS
if (!document.getElementById('particleStyles')) {
    const style = document.createElement('style');
    style.id = 'particleStyles';
    style.textContent = `
        .particle {
            position: fixed;
            pointer-events: none;
            z-index: 9999;
        }
        @keyframes particleFade {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-100px) scale(0); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        .shake { animation: shake 0.4s ease; }
        
        @keyframes slideInRight {
            0% { 
                opacity: 0; 
                transform: translateX(400px) scale(0.8); 
            }
            50% { 
                transform: translateX(-20px) scale(1.05); 
            }
            100% { 
                opacity: 1; 
                transform: translateX(0) scale(1); 
            }
        }
        
        .achievement-toast {
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .damage-number {
            position: fixed;
            font-size: 2.5em;
            font-weight: bold;
            pointer-events: none;
            z-index: 9999;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            animation: damageFloat 1.5s ease-out forwards;
        }
        @keyframes damageFloat {
            0% { opacity: 1; transform: translateY(0) scale(0.5); }
            50% { transform: translateY(-60px) scale(1.2); }
            100% { opacity: 0; transform: translateY(-120px) scale(0.8); }
        }
        .damage-number.damage { color: #ff6b6b; }
        .damage-number.heal { color: #6bcf7f; }
        .damage-number.combo { color: #ffd93d; }
        .damage-number.score { color: #ffd700; font-size: 3em; }
        
        .combo-counter {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 5em;
            font-weight: bold;
            color: #ffd93d;
            text-shadow: 0 0 30px rgba(255, 217, 61, 0.8);
            pointer-events: none;
            z-index: 9998;
            animation: comboPopup 1s ease-out forwards;
        }
        @keyframes comboPopup {
            0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.3) rotate(5deg); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(0.8) rotate(0deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Damage Numbers System
function showDamageNumber(amount, type = 'damage') {
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
    
    const damageEl = document.createElement('div');
    damageEl.className = `damage-number ${type}`;
    damageEl.textContent = typeof amount === 'number' ? (type === 'heal' ? `+${amount}` : `-${amount}`) : amount;
    damageEl.style.left = x + 'px';
    damageEl.style.top = y + 'px';
    
    document.body.appendChild(damageEl);
    setTimeout(() => damageEl.remove(), 1500);
    
    // Particles
    const color = type === 'heal' ? '#6bcf7f' : (type === 'damage' ? '#ff6b6b' : '#ffd93d');
    createParticles(x, y, color, 15);
    
    // Haptic feedback based on type
    if (type === 'damage') {
        hapticFeedback('heavy');
    } else if (type === 'heal') {
        hapticFeedback('success');
    } else {
        hapticFeedback('medium');
    }
}

function showCombo(count) {
    const comboEl = document.createElement('div');
    comboEl.className = 'combo-counter';
    
    // Calculate combo damage bonus
    const comboBonus = getComboBonus();
    
    // Different messages and colors based on combo count
    let message = `${count}x COMBO!`;
    let color = '#ffd93d'; // Default yellow
    
    if (count >= 10) {
        message = `${count}x LEGENDARY!`;
        color = '#ff6b6b'; // Red for legendary
    } else if (count >= 7) {
        message = `${count}x AMAZING!`;
        color = '#a8edea'; // Blue for amazing
    } else if (count >= 5) {
        message = `${count}x GREAT!`;
        color = '#6bcf7f'; // Green for great
    }
    
    // Add damage bonus to message if > 0
    if (comboBonus > 0) {
        message += ` (+${comboBonus} dmg)`;
    }
    
    comboEl.textContent = message;
    comboEl.style.color = color;
    comboEl.style.textShadow = `0 0 30px ${color}`;
    
    document.body.appendChild(comboEl);
    setTimeout(() => comboEl.remove(), 1000);
    
    // Haptic feedback for combos
    if (count >= 10) {
        hapticFeedback('success');
    } else if (count >= 5) {
        hapticFeedback('medium');
    } else {
        hapticFeedback('light');
    }
    
    // Extra particles for high combos
    if (count >= 5) {
        createParticles(window.innerWidth / 2, window.innerHeight / 2, color, count * 3);
    }
}

function screenShake() {
    const gameWrapper = document.getElementById('gameWrapper');
    if (gameWrapper) {
        gameWrapper.classList.add('shake');
        hapticFeedback('heavy');
        setTimeout(() => gameWrapper.classList.remove('shake'), 400);
    }
}

// Hold System
function holdCard(card, sourceIndex) {
    // Check max hold cards (Rogue can hold 2, Feather +1)
    let maxHold = (game.classData && game.classData.passive.maxHoldCards) || 1;
    
    // Feather relic: +1 hold slot
    if (game.relics.some(r => r.id === 'feather')) maxHold += 1;
    
    // Count current held cards
    const currentHeldCount = game.heldCard ? (Array.isArray(game.heldCard) ? game.heldCard.length : 1) : 0;
    
    if (currentHeldCount >= maxHold) {
        showMessage(`❌ Hold slots full! (Max: ${maxHold})`, 'warning');
        playSound('error');
        return;
    }
    
    // Monsters cannot be held!
    const cardType = getCardType(card);
    if (cardType === 'monster') {
        showMessage('❌ Monsters cannot be held! You must fight them.', 'danger');
        playSound('error');
        return;
    }
    
    // Initialize heldCard as array for Rogue, single for others
    if (!game.heldCard) {
        game.heldCard = maxHold > 1 ? [] : null;
    }
    
    // Add to hold
    const cardToHold = { ...card, sourceIndex };
    if (maxHold > 1) {
        if (!Array.isArray(game.heldCard)) game.heldCard = [];
        game.heldCard.push(cardToHold);
    } else {
        game.heldCard = cardToHold;
    }
    
    game.room.splice(sourceIndex, 1);
    game.stats.cardsHeld++;
    
    const typeEmoji = {
        'weapon': '⚔️',
        'potion': '💊',
        'special': '✨'
    };
    
    playSound('hold');
    addLog(`Held ${card.value}${card.suit}`, 'info');
    showMessage(`📌 ${typeEmoji[cardType]} Held for later use! (${currentHeldCount + 1}/${maxHold})`, 'info');
    createParticles(window.innerWidth / 2, window.innerHeight / 3, '#ffd93d', 20);
    updateUI();
    checkGameState(); // Check if room is now cleared after holding card
}

function useHeldCard() {
    if (!game.heldCard) return;
    
    const card = game.heldCard;
    game.heldCard = null;
    
    game.room.unshift(card); // Adds back to the start of the room
    
    updateUI();
    
    // Simulates clicking the card that just returned
    setTimeout(() => {
        const firstCardEl = bottomBar.querySelector('.card');
        if (firstCardEl) {
            firstCardEl.click();
        }
    }, 100);
}


// Log module load
console.log('[MUSIC] Dark atmospheric music system loaded');