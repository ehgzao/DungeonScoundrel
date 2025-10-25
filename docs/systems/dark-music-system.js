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
        this.masterGain.gain.value = 0.15; // Mais baixo que 8-bit
        
        this.isPlaying = false;
        this.currentContext = 'menu'; // menu, gameplay, shop, victory, defeat
        this.oscillators = [];
        this.intervals = [];
        this.gainNodes = [];
        
        this.contextNames = {
            menu: '🏰 Dark Awakening',
            gameplay: '⚔️ Into the Depths',
            shop: '🛍️ Merchant\'s Shadow',
            victory: '👑 Triumph in Darkness',
            defeat: '💀 The Final Darkness'
        };
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
        this.oscillators.forEach(osc => { try { osc.stop(); } catch(e) {} });
        this.intervals.forEach(id => clearInterval(id));
        this.oscillators = [];
        this.intervals = [];
        this.gainNodes = [];
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
        setTimeout(callback, duration * 1000);
    }
    
    fadeIn(duration) {
        this.masterGain.gain.setValueAtTime(0.001, this.context.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(
            0.15,
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
        // Drone mais suave
        this.playDrone(100, 0.12, 'sine');
        
        // Arpejos medievais lentos (escala menor)
        const arpNotes = [261.63, 293.66, 329.63, 392]; // C4, D4, E4, G4
        let arpIndex = 0;
        const arpInterval = 600;
        const arpTimer = setInterval(() => {
            if (!this.isPlaying) return;
            this.playNote(arpNotes[arpIndex % arpNotes.length] * 2, 0.08, 0.5, 'triangle');
            arpIndex++;
        }, arpInterval);
        this.intervals.push(arpTimer);
        
        // Bells mais presentes
        const bellPattern = [523.25, 587.33, 659.25, 523.25]; // C5, D5, E5, C5
        let bellIndex = 0;
        const bellTimer = setInterval(() => {
            if (!this.isPlaying) return;
            this.playBell(bellPattern[bellIndex % bellPattern.length], 0.10, 1.5);
            bellIndex++;
        }, 2400);
        this.intervals.push(bellTimer);
    }
    
    // ============================================
    // TRACK 4: VICTORY THEME - Triumph in Darkness
    // ============================================
    playVictoryTheme() {
        // Fanfarra épica grave (one-shot, não loop)
        const fanfare = [
            {freq: 261.63, time: 0, duration: 0.4},      // C4
            {freq: 329.63, time: 0.5, duration: 0.4},    // E4
            {freq: 392, time: 1.0, duration: 0.4},       // G4
            {freq: 523.25, time: 1.5, duration: 1.0},    // C5 (sustentado)
        ];
        
        fanfare.forEach(note => {
            setTimeout(() => {
                if (!this.isPlaying) return;
                this.playNote(note.freq, 0.18, note.duration, 'square');
                this.playNote(note.freq * 2, 0.10, note.duration, 'triangle');
                // Percussão triunfante
                this.playDarkPercussion(100);
            }, note.time * 1000);
        });
        
        // Drone de resolução
        setTimeout(() => {
            if (!this.isPlaying) return;
            this.playDrone(261.63, 0.15, 'triangle');
        }, 1500);
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
            setTimeout(() => {
                if (!this.isPlaying) return;
                this.playNote(note.freq, 0.15, 0.8, 'sine');
            }, note.time * 1000);
        });
        
        // Bells fúnebres
        setTimeout(() => {
            if (!this.isPlaying) return;
            this.playBell(523.25, 0.08, 3.0); // C5
        }, 1000);
        
        setTimeout(() => {
            if (!this.isPlaying) return;
            this.playBell(392, 0.08, 3.0); // G4
        }, 2000);
        
        // Fade to silence
        setTimeout(() => {
            this.fadeOut(2.0, () => {});
        }, 3000);
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
        
        // Criar impulse response simples para reverb
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
        reverb.buffer = impulse;
        
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
        
        this.oscillators.push(osc);
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
            
            this.oscillators.push(osc);
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
        
        this.oscillators.push(osc);
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
            
            kick.start(this.context.currentTime);
            kick.stop(this.context.currentTime + 0.1);
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

// ============================================
// INSTRUÇÕES DE USO
// ============================================
/*

1. Substituir no index.html:
   - Substituir "class Epic8BitMusic" por este código
   - Substituir "const music = new Epic8BitMusic()" por "const music = new DarkAtmosphericMusic()"

2. Adicionar triggers de troca automática:

   // Ao iniciar jogo:
   music.switchContext('gameplay');
   
   // Ao abrir shop:
   music.switchContext('shop');
   
   // Ao vencer:
   music.switchContext('victory');
   
   // Ao morrer:
   music.switchContext('defeat');
   
   // Ao voltar ao menu:
   music.switchContext('menu');

3. Sistema funciona automaticamente com fade in/out entre contextos!

*/
