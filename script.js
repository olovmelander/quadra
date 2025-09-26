// =================================================================================
// THEMES.JS - Advanced Animation Logic for Meditative Quadra
// =================================================================================

// A helper function for random numbers in a range
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// =================================================================================
// 🌲 FOREST THEME
// =================================================================================

let forestAnimationFrameId = null;

function startForestAnimations() {
    if (forestAnimationFrameId) cancelAnimationFrame(forestAnimationFrameId);

    const themeContainer = document.getElementById('forest-theme');
    const firefliesContainer = document.getElementById('fireflies');
    const particleContainer = document.getElementById('forest-particles');

    if (!themeContainer || !firefliesContainer || !particleContainer) {
        console.error("Forest theme containers not found for animation!");
        return;
    }

    const fireflies = [];
    firefliesContainer.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const el = document.createElement('div');
        el.className = 'firefly';
        firefliesContainer.appendChild(el);
        fireflies.push(new Firefly(el, themeContainer.offsetWidth, themeContainer.offsetHeight));
    }

    // This check prevents re-populating particles on theme re-entry
    if (particleContainer.children.length === 0) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'forest-particle';
            const size = random(1, 3);
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.setProperty('--x-start', `${random(0, 100)}vw`);
            particle.style.setProperty('--y-start', `${random(0, 100)}vh`);
            particle.style.setProperty('--x-end', `${random(0, 100)}vw`);
            particle.style.setProperty('--y-end', `${random(0, 100)}vh`);
            particle.style.animationDuration = `${random(15, 30)}s`;
            particle.style.animationDelay = `-${random(0, 30)}s`;
            particleContainer.appendChild(particle);
        }
    }

    function animateForest() {
        if (document.getElementById('forest-theme')?.classList.contains('active')) {
            fireflies.forEach(f => f.update());
            forestAnimationFrameId = requestAnimationFrame(animateForest);
        } else {
            stopForestAnimations();
        }
    }
    animateForest();
}

function stopForestAnimations() {
    if (forestAnimationFrameId) {
        cancelAnimationFrame(forestAnimationFrameId);
        forestAnimationFrameId = null;
    }
}

class Firefly {
    constructor(element, boundsX, boundsY) {
        this.element = element; this.boundsX = boundsX; this.boundsY = boundsY;
        this.x = random(0, this.boundsX || window.innerWidth);
        this.y = random(0, this.boundsY || window.innerHeight);
        this.vx = 0; this.vy = 0; this.wanderAngle = random(0, Math.PI * 2);
        this.lastBlink = Date.now();
        this.blinkDuration = random(100, 300);
        this.nextBlink = random(2000, 5000);
    }
    update() {
        if (this.boundsX === 0) { // Check if bounds are not set yet
            const container = this.element.parentElement?.parentElement;
            if (container && container.offsetWidth > 0) {
                this.boundsX = container.offsetWidth;
                this.boundsY = container.offsetHeight;
            }
            return; // Skip first frame if bounds are not ready
        }
        this.wanderAngle += random(-0.4, 0.4);
        this.vx += Math.cos(this.wanderAngle) * 0.08;
        this.vy += Math.sin(this.wanderAngle) * 0.08;
        this.vx *= 0.96; this.vy *= 0.96;
        this.x += this.vx; this.y += this.vy;

        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x > this.boundsX) { this.x = this.boundsX; this.vx *= -1; }
        if (this.y < 0) { this.y = 0; this.vy *= -1; }
        if (this.y > this.boundsY) { this.y = this.boundsY; this.vy *= -1; }

        const now = Date.now();
        if (now - this.lastBlink > this.nextBlink) {
            this.element.style.opacity = '1';
            this.element.style.boxShadow = '0 0 18px #f0f0aa, 0 0 28px #f0f0aa';
            setTimeout(() => {
                this.element.style.opacity = '0.5';
                this.element.style.boxShadow = '0 0 12px #f0f0aa, 0 0 20px #f0f0aa';
            }, this.blinkDuration);
            this.lastBlink = now;
            this.nextBlink = random(2000, 8000);
        }

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}
        class SoundManager {
            constructor() {
                this.audioContext = null; this.isMuted = false; this.musicInterval = null;
                this.musicTrack = 'Ambient'; this.soundSet = 'Zen';
                this.currentTrackId = null;
                this.trackNames = [
                    'Ambient', 'Decay', 'Zen', 'Nostalgia', 'Nebula', 'Aurora',
                    'Galaxy', 'Rainfall', 'Koi', 'Meadow', 'MiracleTone', 'HealingDrone',
                    'CosmicChimes', 'SingingBowl', 'Starlight', 'SwedishForest', 'GongBath'
                ];
                this.soundSets = {
                    Retro: {
                        move: () => this.createTone(200, 0.05, 'square', 0.2),
                        rotate: () => this.createTone(400, 0.08, 'triangle', 0.3),
                        drop: () => this.createTone(120, 0.1, 'sine', 0.4),
                        lineClear: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.createTone(f, 0.2, 'sine', 0.4), i*50)),
                        levelUp: () => [261, 329, 392, 523, 659].forEach((f, i) => setTimeout(() => this.createTone(f, 0.15, 'sine', 0.5), i*60)),
                        gameOver: () => [400, 350, 300, 250, 200].forEach((f, i) => setTimeout(() => this.createTone(f, 0.3, 'sawtooth', 0.5), i*150))
                    },
                    Zen: {
                        move: () => this.createTone(100, 0.1, 'sine', 0.1),
                        rotate: () => this.createTone(150, 0.1, 'sine', 0.15),
                        drop: () => this.createTone(80, 0.2, 'sine', 0.2),
                        lineClear: () => [261, 329, 392].forEach((f, i) => setTimeout(() => this.createTone(f, 0.5, 'sine', 0.15), i*80)),
                        levelUp: () => [392, 493, 587].forEach((f, i) => setTimeout(() => this.createTone(f, 0.6, 'sine', 0.2), i*100)),
                        gameOver: () => [220, 164, 130].forEach((f, i) => setTimeout(() => this.createTone(f, 0.8, 'sine', 0.2), i*200))
                    }
                };
            }
            init() { if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)(); }
            createTone(frequency, duration = 0.1, type = 'sine', volume = 0.3, onended = null) {
                if (!this.audioContext || this.isMuted) return;
                const osc = this.audioContext.createOscillator(), gain = this.audioContext.createGain();
                osc.connect(gain); gain.connect(this.audioContext.destination);
                osc.type = type; osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                osc.start(); osc.stop(this.audioContext.currentTime + duration);
                if (onended) osc.onended = onended;
            }
            setTrack(trackName) {
                if (!this.trackNames.includes(trackName)) return;
                this.musicTrack = trackName;
                settings.musicTrack = trackName;
                saveSettings();
                document.getElementById('music-track').value = trackName;
                this.stopBackgroundMusic();
                if (!this.isMuted) this.startBackgroundMusic();
            }

            nextTrack() {
                const currentIndex = this.trackNames.indexOf(this.musicTrack);
                const nextIndex = (currentIndex + 1) % this.trackNames.length;
                this.setTrack(this.trackNames[nextIndex]);
            }
            setSoundSet(setName) { this.soundSet = setName; }
            playMove() { this.soundSets[this.soundSet].move(); }
            playRotate() { this.soundSets[this.soundSet].rotate(); }
            playDrop() { this.soundSets[this.soundSet].drop(); }
            playLineClear() { this.soundSets[this.soundSet].lineClear(); }
            playLevelUp() { this.soundSets[this.soundSet].levelUp(); }
            playGameOver() { this.soundSets[this.soundSet].gameOver(); }
            startBackgroundMusic() {
                if (this.isMuted) return;
                this.stopBackgroundMusic();
                this.currentTrackId = Symbol();
                const trackId = this.currentTrackId;
                const tracks = {
                    Ambient: () => this.startAmbientMusic(trackId),
                    Decay: () => this.startDecayMusic(trackId), Nostalgia: () => this.startNostalgiaMusic(trackId),
                    Zen: () => this.startZenMusic(trackId), Nebula: () => this.startNebulaMusic(trackId),
                    Aurora: () => this.startAuroraMusic(trackId), Galaxy: () => this.startGalaxyMusic(trackId),
                    Rainfall: () => this.startRainfallMusic(trackId), Koi: () => this.startKoiMusic(trackId),
                    Meadow: () => this.startMeadowMusic(trackId), MiracleTone: () => this.startMiracleToneMusic(trackId),
                    HealingDrone: () => this.startHealingDroneMusic(trackId),
                    CosmicChimes: () => this.startCosmicChimesMusic(trackId),
                    SingingBowl: () => this.startSingingBowlMusic(trackId),
                    Starlight: () => this.startStarlightMusic(trackId),
                    SwedishForest: () => this.startSwedishForestMusic(trackId),
                    GongBath: () => this.startGongBathMusic(trackId)
                };
                (tracks[this.musicTrack] || tracks.Nebula)(trackId);
            }
            startGongBathMusic(trackId) {
                const baseNotes = [41.20, 48.99, 55.00, 61.74]; // E1, G1, A1, B1

                const playGong = () => {
                    if (this.isMuted || trackId !== this.currentTrackId) return;

                    const baseFreq = baseNotes[~~(Math.random() * baseNotes.length)];
                    const duration = random(15, 20);
                    const mainVolume = random(0.1, 0.2);

                    // Main gong tone - sine for a smoother fundamental
                    this.createTone(baseFreq, duration, 'sine', mainVolume);

                    // Subtle lower octave sine for fundamental depth
                    this.createTone(baseFreq / 2, duration * 1.1, 'sine', mainVolume * 0.6);

                    // Inharmonic overtones for shimmer
                    for (let i = 2; i < 9; i++) {
                        if (Math.random() > 0.65) { // Make overtones more sparse
                            // Use non-integer multiples for a more gong-like inharmonic sound
                            const overtoneFreq = baseFreq * (i + random(-0.1, 0.1));
                            const overtoneVolume = mainVolume / (i * 2) * (random(0.5, 1.0));
                            const overtoneDuration = duration * random(0.7, 1.1);
                             setTimeout(() => {
                                if (this.isMuted || trackId !== this.currentTrackId) return;
                                this.createTone(overtoneFreq, overtoneDuration, 'sine', overtoneVolume);
                            }, random(100, 400)); // Stagger the overtones more
                        }
                    }

                    const nextGongIn = random(10000, 18000);
                    setTimeout(playGong, nextGongIn);
                };

                playGong();
            }
            startNebulaMusic(trackId) {
                const b = [65, 73, 82, 73], m = [262, 294, 330, 349, 392, 440, 494, 523]; let bi=0, mi=0;
                const interval = setInterval(() => { if (this.isMuted || trackId !== this.currentTrackId) { clearInterval(interval); return; } this.createTone(b[bi++ % b.length], 0.4, 'triangle', 0.1); if (bi % 2 === 0) this.createTone(m[mi++ % m.length], 0.2, 'sine', 0.15); }, 250);
                this.musicInterval = interval;
            }

            startAmbientMusic(trackId) {
                const s=[261, 311, 349, 392, 466], d=130;
                const interval = setInterval(() => { if (this.isMuted || trackId !== this.currentTrackId) { clearInterval(interval); return; } this.createTone(s[~~(Math.random()*s.length)], 0.8, 'sine', 0.15); if(Math.random()>0.7)this.createTone(s[~~(Math.random()*s.length)]/2,1.2,'sine',0.1); if(Math.random()>0.9)this.createTone(d,2.5,'sine',0.08); }, 900);
                this.musicInterval = interval;
            }
            startDecayMusic(trackId) {
                const n=[220, 277.18, 329.63];
                const interval = setInterval(() => { if (this.isMuted || trackId !== this.currentTrackId) { clearInterval(interval); return; } const note=n[~~(Math.random()*n.length)]; this.createTone(note*(1+(Math.random()-0.5)*0.005), 4, 'sine', Math.random()*0.05+0.05); }, 2000+Math.random()*2000);
                this.musicInterval = interval;
            }
            startNostalgiaMusic(trackId) {
                const m=[293.66, 329.63, 293.66, 220, 146.83]; let mi=0;
                const interval = setInterval(() => { if (this.isMuted || trackId !== this.currentTrackId) { clearInterval(interval); return; } const n=m[mi++ % m.length]; this.createTone(n, 2.5, 'triangle', 0.1); if(Math.random()>0.6) this.createTone(n*2,2.5,'sine',0.05); }, 1500);
                this.musicInterval = interval;
            }
            startZenMusic(trackId) {
                const scale = [261.63, 392.00, 440.00, 523.25], drone = 110;
                const interval = setInterval(() => {
                    if (this.isMuted || trackId !== this.currentTrackId) { clearInterval(interval); return; }
                    if (Math.random() > 0.8) this.createTone(drone, 10, 'sine', 0.05);
                    if (Math.random() > 0.7) this.createTone(scale[~~(Math.random()*scale.length)], 3, 'sine', 0.1);
                }, 4000);
                 this.musicInterval = interval;
            }
             startAuroraMusic(trackId) {
                const play = () => { if (this.isMuted || trackId !== this.currentTrackId) return; this.createTone(Math.random() * 100 + 80, 8, 'sine', Math.random() * 0.1, play); };
                play();
            }
            startGalaxyMusic(trackId) {
                const playDrone = () => { if(this.isMuted || trackId !== this.currentTrackId) return; this.createTone(55, 15, 'sawtooth', 0.03, playDrone); };
                const playSparkles = () => { if(this.isMuted || trackId !== this.currentTrackId) return; this.createTone(Math.random() * 1000 + 1000, 0.1, 'triangle', Math.random() * 0.05); setTimeout(playSparkles, Math.random() * 2000 + 500); };
                playDrone(); playSparkles();
            }
            startRainfallMusic(trackId) {
                const notes = [523, 587, 659, 784]; let idx = 0;
                const playNote = () => { if(this.isMuted || trackId !== this.currentTrackId) return; this.createTone(notes[idx % notes.length], 0.5, 'sine', 0.1); idx++; setTimeout(playNote, Math.random() * 800 + 400); };
                playNote();
            }
            startKoiMusic(trackId) {
                const scale = [261, 329, 392, 523, 587];
                const playPluck = () => { if(this.isMuted || trackId !== this.currentTrackId) return; this.createTone(scale[~~(Math.random()*scale.length)], 1.5, 'triangle', 0.15); setTimeout(playPluck, Math.random() * 2000 + 1000); };
                playPluck();
            }
            startMeadowMusic(trackId) {
                const padScale = [130.81, 196.00, 261.63];
                const bellScale = [523.25, 659.25, 783.99];
                const playPad = () => { if(this.isMuted || trackId !== this.currentTrackId) return; this.createTone(padScale[~~(Math.random()*padScale.length)], 12, 'sine', 0.1, playPad); };
                const playBell = () => { if(this.isMuted || trackId !== this.currentTrackId) return; if(Math.random() > 0.6) this.createTone(bellScale[~~(Math.random()*bellScale.length)], 3, 'sine', 0.08); setTimeout(playBell, Math.random() * 5000 + 3000); };
                playPad(); playBell();
            }
            startMiracleToneMusic(trackId) {
                const play = () => {
                    if (this.isMuted || trackId !== this.currentTrackId) return;
                    this.createTone(528, 10, 'sine', 0.1);
                    this.createTone(264, 10, 'sine', 0.05);
                    setTimeout(() => { if (!this.isMuted && trackId === this.currentTrackId) play(); }, 12000);
                };
                play();
            }
            startHealingDroneMusic(trackId) {
                const play = () => { if (this.isMuted || trackId !== this.currentTrackId) return; this.createTone(174, 15, 'sine', 0.15, play); };
                play();
            }

            startCosmicChimesMusic(trackId) {
                const scale = [880, 932.33, 1046.50, 1174.66, 1318.51];
                const playChime = () => {
                    if (this.isMuted || trackId !== this.currentTrackId) return;
                    const freq = scale[~~(Math.random() * scale.length)];
                    this.createTone(freq, 4, 'triangle', Math.random() * 0.08 + 0.02);
                    setTimeout(playChime, Math.random() * 5000 + 3000);
                };
                playChime();
            }

            startSingingBowlMusic(trackId) {
                const drone = 82.41;
                const strikeNote = 329.63;
                const playDrone = () => {
                    if(this.isMuted || trackId !== this.currentTrackId) return;
                    this.createTone(drone, 15, 'sine', 0.1, playDrone);
                };
                const playStrike = () => {
                    if(this.isMuted || trackId !== this.currentTrackId) return;
                    this.createTone(strikeNote, 8, 'sine', 0.1);
                    this.createTone(strikeNote * 2, 8, 'sine', 0.05);
                    setTimeout(playStrike, Math.random() * 15000 + 10000);
                };
                playDrone();
                playStrike();
            }

            startStarlightMusic(trackId) {
                const scale = [1046.50, 1174.66, 1318.51, 1396.91, 1567.98];
                const playNote = () => {
                    if (this.isMuted || trackId !== this.currentTrackId) return;
                    const note = scale[~~(Math.random() * scale.length)];
                    this.createTone(note, 2, 'triangle', Math.random() * 0.1 + 0.05);
                    if (Math.random() > 0.8) {
                        this.createTone(note / 2, 3, 'sine', 0.05);
                    }
                    setTimeout(playNote, Math.random() * 3000 + 1500);
                };
                playNote();
            }

            startSwedishForestMusic(trackId) {
                const droneFreq = 60;
                const playDrone = () => {
                    if(this.isMuted || trackId !== this.currentTrackId) return;
                    this.createTone(droneFreq, 20, 'sawtooth', 0.04, playDrone);
                };

                const playWind = () => {
                    if (this.isMuted || trackId !== this.currentTrackId) return;
                    for (let i = 0; i < 5; i++) {
                        this.createTone(80 + Math.random() * 40, 2 + Math.random() * 3, 'sine', 0.005 + Math.random() * 0.01);
                    }
                    setTimeout(playWind, Math.random() * 4000 + 2000);
                };

                const scale = [392.00, 440.00, 587.33, 659.25];
                const playTones = () => {
                    if (this.isMuted || trackId !== this.currentTrackId) return;
                    if (Math.random() > 0.6) {
                        const note = scale[~~(Math.random() * scale.length)];
                        this.createTone(note, 5, 'triangle', 0.08);
                        if (Math.random() > 0.5) { this.createTone(note/2, 5, 'sine', 0.04); }
                    }
                    setTimeout(playTones, Math.random() * 8000 + 5000);
                };

                playDrone();
                playWind();
                playTones();
            }

            stopBackgroundMusic() {
                this.currentTrackId = null;
                if (this.musicInterval) {
                    clearInterval(this.musicInterval);
                    this.musicInterval = null;
                }
            }
            toggleMute() { this.isMuted = !this.isMuted; this.isMuted ? this.stopBackgroundMusic() : this.startBackgroundMusic(); return this.isMuted; }
        }

        const COLS = 10, ROWS = 20, HIDDEN_ROWS = 4;
        let BLOCK_SIZE = 30;
        const COLORS = { I: '#00ff00', O: '#ff9900', T: '#0000ff', S: '#00ffff', Z: '#ff0000', J: '#ffff00', L: '#cc00cc' };
        const SHAPES = { I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], O: [[1,1],[1,1]], T: [[0,0,0],[1,1,1],[0,1,0]], S: [[0,1,1],[1,1,0],[0,0,0]], Z: [[1,1,0],[0,1,1],[0,0,0]], J: [[0,0,0],[1,1,1],[0,0,1]], L: [[0,0,0],[1,1,1],[1,0,0]] };
        const PIECE_KEYS = 'IOTZSLJ', SCORE_VALUES = { 1: 100, 2: 300, 3: 500, 4: 800 };
        const LEVEL_SPEEDS = [ 1000, 850, 700, 550, 400, 300, 200, 150, 100, 80, 60, 50, 40, 35, 30 ];
        const THEMES = ['forest', 'ocean', 'sunset', 'mountain', 'zen', 'winter', 'fall', 'summer', 'spring', 'aurora', 'galaxy', 'rainy-window', 'koi-pond', 'meadow', 'cosmic-chimes', 'singing-bowl', 'starlight', 'swedish-forest', 'geode', 'bioluminescence', 'desert-oasis', 'bamboo-grove'];

        let canvas, ctx, nextCanvases = [], board, lockedPieces = [], currentPiece = null;
        let nextPieces = [], score = 0, lines = 0, level = 1, dropInterval = 1000;
        let dropCounter = 0, lastTime = 0, startTime, piecesPlaced = 0, isGameOver = false;
        let isProcessingPhysics = false, inputQueue = null, dasTimer = null, dasIntervalTimer = null;
        let animationId = null, linesUntilNextLevel = 10, activeTheme = 'forest', randomThemeInterval = null, activeThemeAnimationId = null;

        let settings = { dasDelay: 120, dasInterval: 40, musicTrack: 'Ambient', soundSet: 'Zen', backgroundMode: 'Level', backgroundTheme: 'forest', controlScheme: 'ontouchstart' in window ? 'Touch' : 'Keyboard', keyBindings: { moveLeft: 'ArrowLeft', moveRight: 'ArrowRight', rotateRight: 'ArrowUp', rotateLeft: 'z', flip: 'a', softDrop: 'ArrowDown', hardDrop: 'Space', toggleMusic: 'M' } };
        const soundManager = new SoundManager();
let touchStartX = null, touchStartY = null, touchStartTime = null, lastTap = 0, touchLastX = null, touchLastY = null;

        function createCosmicChimesScene() {
            const dustContainer = document.getElementById('space-dust');
            if (dustContainer && dustContainer.children.length === 0) {
                for (let i = 0; i < 70; i++) {
                    let particle = document.createElement('div');
                    particle.className = 'dust-particle';
                    const size = Math.random() * 2 + 1;
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.setProperty('--x-start', `${Math.random() * 100}vw`);
                    particle.style.setProperty('--y-start', `${Math.random() * 100}vh`);
                    particle.style.setProperty('--x-end', `${Math.random() * 100}vw`);
                    particle.style.setProperty('--y-end', `${Math.random() * 100}vh`);
                    particle.style.animationDelay = `-${Math.random() * 30}s`;
                    dustContainer.appendChild(particle);
                }
            }
            const chimesContainer = document.getElementById('chimes');
            if (chimesContainer && chimesContainer.children.length === 0) {
                 for (let i = 0; i < 12; i++) {
                    let chime = document.createElement('div');
                    chime.className = 'chime';
                    chime.style.left = `${5 + Math.random() * 90}%`;
                    chime.style.top = `${-10 + Math.random() * 30}%`;
                    chime.style.setProperty('--r-start', `${Math.random() * 10 - 5}deg`);
                    chime.style.setProperty('--r-end', `${Math.random() * 10 - 5}deg`);
                    chime.style.animationDelay = `-${Math.random() * 12}s`;
                    chimesContainer.appendChild(chime);
                }
            }
        }
        function createSingingBowlScene() {
            const ripplesContainer = document.getElementById('bowl-ripples');
            if (ripplesContainer && ripplesContainer.children.length === 0) {
                for (let i=0; i<5; i++) { // Increased ripple count
                    let ripple = document.createElement('div');
                    ripple.className = 'bowl-ripple';
                    const duration = Math.random() * 4 + 6; // 6-10s duration
                    ripple.style.animationDuration = `${duration}s`;
                    ripple.style.animationDelay = `-${Math.random() * duration}s`;
                    // Vary opacity slightly for a layered look
                    ripple.style.opacity = Math.random() * 0.4 + 0.6;
                    ripplesContainer.appendChild(ripple);
                }
            }
            const motesContainer = document.getElementById('bowl-motes');
            if (motesContainer && motesContainer.children.length === 0) {
                for (let i=0; i<40; i++) { // Increased mote count
                    let mote = document.createElement('div');
                    mote.className = 'bowl-mote';
                    const size = Math.random() * 4 + 1; // Varied size
                    mote.style.width = `${size}px`;
                    mote.style.height = `${size}px`;
                    // Spawn motes from within the bowl area
                    mote.style.left = `${Math.random() * 40 + 30}%`;
                    mote.style.animationDuration = `${Math.random() * 8 + 12}s`; // 12-20s duration
                    mote.style.animationDelay = `-${Math.random() * 20}s`;
                    // Set random horizontal drift for the weave animation
                    mote.style.setProperty('--x-drift', `${Math.random() * 10 - 5}vw`);
                    motesContainer.appendChild(mote);
                }
            }
        }
        function createZenScene() {
            // Raked Sand Shimmer
            const sand = document.querySelector('#zen-theme .raked-sand');
            if (sand && sand.children.length === 0) {
                const shimmer = document.createElement('div');
                shimmer.style.cssText = `
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
                    background-size: 200% 100%;
                    animation: sand-shimmer 25s ease-in-out infinite;
                `;
                const keyframes = `
                    @keyframes sand-shimmer {
                        from { background-position: 150% 0; }
                        to { background-position: -50% 0; }
                    }
                `;
                const styleSheet = document.createElement("style");
                styleSheet.innerText = keyframes;
                document.head.appendChild(styleSheet);
                sand.appendChild(shimmer);
            }

            // Petals
            const petalsContainer = document.getElementById('petals');
            if (petalsContainer && petalsContainer.children.length === 0) {
                 for (let i = 0; i < 25; i++) {
                    let petal = document.createElement('div');
                    petal.className = 'petal';
                    petal.style.left = `${Math.random() * 110 - 5}%`;
                    petal.style.setProperty('--r-start', `${Math.random() * 360}deg`);
                    petal.style.setProperty('--r-end', `${Math.random() * 720 - 360}deg`);
                    petal.style.setProperty('--x-drift', `${Math.random() * 40 - 20}vw`);
                    petal.style.animationDelay = `-${Math.random() * 12}s`;
                    petal.style.animationDuration = `${Math.random() * 5 + 7}s`;
                    petalsContainer.appendChild(petal);
                }
            }

            // Water Ripple
            const rippleContainer = document.querySelector('#zen-theme .water-feature');
            if (rippleContainer && rippleContainer.children.length === 0) {
                const createRipple = () => {
                    if (activeTheme !== 'zen') return;
                    let ripple = document.createElement('div');
                    ripple.className = 'zen-ripple';
                    ripple.style.animationDelay = `${Math.random() * 2}s`;
                    ripple.addEventListener('animationend', () => {
                        ripple.remove();
                    }, { once: true });
                    rippleContainer.appendChild(ripple);
                    setTimeout(createRipple, Math.random() * 6000 + 4000);
                }
                createRipple();
            }
        }
        function createBioluminescenceScene() {
            const mushroomContainer = document.getElementById('bio-mushrooms');
            if (mushroomContainer && mushroomContainer.children.length === 0) {
                const numMushrooms = 20;
                for (let i = 0; i < numMushrooms; i++) {
                    const mushroom = document.createElement('div');
                    mushroom.className = 'bio-mushroom';
                    const cap = document.createElement('div');
                    cap.className = 'bio-mushroom-cap';
                    const stem = document.createElement('div');
                    stem.className = 'bio-mushroom-stem';

                    mushroom.appendChild(cap);
                    mushroom.appendChild(stem);

                    const size = Math.random() * 60 + 40;
                    mushroom.style.width = `${size}px`;
                    mushroom.style.height = `${size * 1.25}px`;
                    mushroom.style.left = `${Math.random() * 95}%`;
                    mushroom.style.bottom = `-${Math.random() * 20}px`;
                    mushroom.style.zIndex = Math.floor(Math.random() * 4) + 1;
                    cap.style.animationDelay = `-${Math.random() * 10}s`;

                    mushroomContainer.appendChild(mushroom);
                }
            }
            const sporeContainer = document.getElementById('bio-spores');
            if (sporeContainer && sporeContainer.children.length === 0) {
                 for (let i = 0; i < 50; i++) {
                    let spore = document.createElement('div');
                    spore.className = 'bio-spore';
                    spore.style.left = `${Math.random() * 100}%`;
                    spore.style.bottom = `${Math.random() * 100}%`;
                    spore.style.setProperty('--x-drift', `${Math.random() * 10 - 5}vw`);
                    spore.style.animationDelay = `-${Math.random() * 20}s`;
                    sporeContainer.appendChild(spore);
                }
            }
        }
        function createGeodeScene() {
            // 1. Varied Crystals
            const crystalContainer = document.getElementById('geode-crystals');
            if (crystalContainer && crystalContainer.children.length === 0) {
                const crystalPalettes = [
                    ['#a29bfe', '#74b9ff', '#d6a2e8'], // Amethyst/Fluorite
                    ['#ff7675', '#fab1a0', '#fdcb6e'], // Rose Quartz/Citrine
                    ['#55efc4', '#81ecec', '#74b9ff'], // Aquamarine/Celestite
                    ['#fffe7a', '#ffb5b5', '#b5ffe7']  // Opal/Iridescent
                ];
                 const crystalShapes = [
                    'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', // Classic crystal
                    'polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)',    // Shard
                    'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)', // Octagon
                    'polygon(50% 0%, 90% 20%, 100% 60%, 50% 100%, 0% 60%, 10% 20%)' // Pointed
                ];
                const numCrystals = 18;
                for (let i = 0; i < numCrystals; i++) {
                    const crystal = document.createElement('div');
                    crystal.className = 'crystal';
                    const palette = crystalPalettes[Math.floor(Math.random() * crystalPalettes.length)];
                    const shape = crystalShapes[Math.floor(Math.random() * crystalShapes.length)];

                    const size = Math.random() * 80 + 50;
                    crystal.style.width = `${size}px`;
                    crystal.style.height = `${size * (Math.random() * 0.5 + 0.8)}px`;
                    crystal.style.left = `${Math.random() * 90}%`;
                    crystal.style.top = `${Math.random() * 80}%`;
                    crystal.style.clipPath = shape;

                    const glow = document.createElement('div');
                    glow.className = 'crystal-glow';
                    glow.style.clipPath = shape;

                    crystal.style.background = `linear-gradient(${Math.random()*360}deg, ${palette.join(', ')})`;
                    glow.style.background = `linear-gradient(${Math.random()*360}deg, ${palette.join(', ')})`;

                    crystal.style.setProperty('--r-start', `${Math.random() * 10 - 5}deg`);
                    crystal.style.setProperty('--r-end', `${Math.random() * 10 - 5}deg`);
                    crystal.style.animationDelay = `-${Math.random() * 40}s`;
                    glow.style.animationDelay = `-${Math.random() * 8}s`;

                    crystal.appendChild(glow);
                    crystalContainer.appendChild(crystal);
                }
            }

            // 2. Layered Geode Dust
            const dustLayers = [
                { container: document.getElementById('geode-dust-back'), count: 40, minSize: 0.5, maxSize: 1.5, minDuration: 30, maxDuration: 40, opacity: 0.4 },
                { container: document.getElementById('geode-dust-mid'), count: 30, minSize: 1, maxSize: 2, minDuration: 20, maxDuration: 30, opacity: 0.6 },
                { container: document.getElementById('geode-dust-front'), count: 20, minSize: 1.5, maxSize: 2.5, minDuration: 15, maxDuration: 25, opacity: 0.8 }
            ];

            dustLayers.forEach(layer => {
                if (layer.container && layer.container.children.length === 0) {
                    for (let i = 0; i < layer.count; i++) {
                        let particle = document.createElement('div');
                        particle.className = 'geode-dust-particle';
                        const size = Math.random() * (layer.maxSize - layer.minSize) + layer.minSize;
                        particle.style.width = `${size}px`;
                        particle.style.height = `${size}px`;
                        particle.style.setProperty('--x-start', `${Math.random() * 100}vw`);
                        particle.style.setProperty('--y-start', `${Math.random() * 100}vh`);
                        particle.style.setProperty('--x-end', `${Math.random() * 100}vw`);
                        particle.style.setProperty('--y-end', `${Math.random() * 100}vh`);
                        particle.style.setProperty('--opacity', layer.opacity);
                        const duration = Math.random() * (layer.maxDuration - layer.minDuration) + layer.minDuration;
                        particle.style.animationDuration = `${duration}s`;
                        particle.style.animationDelay = `-${Math.random() * duration}s`;
                        layer.container.appendChild(particle);
                    }
                }
            });
        }
        function createStarlightScene() {
             const layers = [
                { container: document.getElementById('starlights-back'), count: 40, minSize: 0.5, maxSize: 1.5 },
                { container: document.getElementById('starlights-mid'), count: 30, minSize: 1, maxSize: 2 },
                { container: document.getElementById('starlights-front'), count: 20, minSize: 1.5, maxSize: 2.5 }
            ];
            layers.forEach(layer => {
                if (layer.container && layer.container.children.length === 0) {
                    for (let i = 0; i < layer.count; i++) {
                        let star = document.createElement('div');
                        star.className = 'starlight';
                        const size = Math.random() * (layer.maxSize - layer.minSize) + layer.minSize;
                        star.style.width = `${size}px`;
                        star.style.height = `${size}px`;
                        star.style.left = `${Math.random() * 100}%`;
                        star.style.top = `${Math.random() * 100}%`;
                        star.style.animationDelay = `-${Math.random() * 8}s`;
                        layer.container.appendChild(star);
                    }
                }
            });

            // Add shooting stars
            const shootingStarContainer = document.getElementById('starlight-shooting-stars');
            if (shootingStarContainer && shootingStarContainer.children.length === 0) {
                for (let i = 0; i < 5; i++) {
                    let star = document.createElement('div');
                    star.className = 'shooting-star-starlight';
                    star.style.top = `${Math.random() * 100}%`;
                    const duration = Math.random() * 4 + 3; // 3-7 seconds
                    star.style.animationDuration = `${duration}s`;
                    star.style.animationDelay = `-${Math.random() * 20}s`; // Staggered start times
                    star.style.width = `${Math.random() * 100 + 150}px`;
                    shootingStarContainer.appendChild(star);
                }
            }
        }
        function createMeadowScene() {
            // 1. Swaying Grass (120+ blades)
            const grassContainer = document.querySelector('.meadow-grass');
            if (grassContainer && grassContainer.children.length === 0) {
                for (let i = 0; i < 150; i++) {
                    let blade = document.createElement('div');
                    blade.className = 'grass-blade';
                    blade.style.left = `${Math.random() * 100}%`;
                    blade.style.height = `${Math.random() * 60 + 40}px`;
                    const swayDuration = Math.random() * 4 + 4;
                    blade.style.animationDuration = `${swayDuration}s`;
                    blade.style.animationDelay = `-${Math.random() * swayDuration}s`;
                    // Vary green color slightly
                    blade.style.background = `linear-gradient(to top, #4a7c3b, hsl(90, 39%, ${Math.random() * 15 + 45}%))`;
                    grassContainer.appendChild(blade);
                }
            }

            // 2. Colorful Flowers
            const flowerContainer = document.getElementById('meadow-flowers');
            if (flowerContainer && flowerContainer.children.length === 0) {
                const flowerData = [
                    { color: '#e53935', svg: '<path d="M10 25 L5 15 A5 5 0 1 1 15 15 L10 25 Z" fill="{color}"/>' }, // Tulip-like
                    { color: '#fdd835', svg: '<circle cx="10" cy="10" r="5" fill="{color}"/><circle cx="10" cy="10" r="2" fill="#8d6e63"/>' }, // Buttercup
                    { color: '#8e24aa', svg: '<path d="M10 25 L5 20 L0 10 L5 0 L15 0 L20 10 L15 20 Z" fill="{color}"/>' } // Aster-like
                ];
                for (let i = 0; i < 25; i++) {
                    let flower = document.createElement('div');
                    flower.className = 'meadow-flower';
                    const data = flowerData[Math.floor(Math.random() * flowerData.length)];
                    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 25">${data.svg.replace('{color}', data.color)}</svg>`;
                    flower.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
                    flower.style.left = `${Math.random() * 98}%`;
                    flower.style.bottom = `${Math.random() * 60}%`;
                    flower.style.animationDelay = `-${Math.random() * 10}s`;
                    flowerContainer.appendChild(flower);
                }
            }

            // 3. Enhanced Butterflies
            const butterflyContainer = document.getElementById('meadow-butterflies');
            if (butterflyContainer && butterflyContainer.children.length === 0) {
                const wingColors = [
                    { stroke: 'gold', fill: 'rgba(255,215,0,0.7)' },
                    { stroke: '#a29bfe', fill: 'rgba(162,155,254,0.7)' },
                    { stroke: '#ff7675', fill: 'rgba(255,118,117,0.7)' }
                ];
                for (let i = 0; i < 10; i++) {
                    let butterfly = document.createElement('div');
                    butterfly.className = 'butterfly';
                    const wingLeft = document.createElement('div');
                    wingLeft.className = 'butterfly-wing left';
                    const wingRight = document.createElement('div');
                    wingRight.className = 'butterfly-wing right';

                    const colors = wingColors[Math.floor(Math.random() * wingColors.length)];
                    const wingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 30"><path d="M 15 15 C 0 0, 0 30, 15 15" stroke="${colors.stroke}" fill="${colors.fill}" stroke-width="2"/></svg>`;
                    wingLeft.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(wingSvg)}')`;
                    wingRight.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(wingSvg)}')`;

                    butterfly.appendChild(wingLeft);
                    butterfly.appendChild(wingRight);

                    for(let j=1; j<=8; j++){ // 8 keyframe points
                        butterfly.style.setProperty(`--x${j}`, `${Math.random() * 90}vw`);
                        butterfly.style.setProperty(`--y${j}`, `${Math.random() * 70}vh`);
                    }
                    const duration = Math.random() * 10 + 15;
                    butterfly.style.animationDuration = `${duration}s`;
                    butterfly.style.animationDelay = `-${Math.random() * duration}s`;
                    const flapSpeed = Math.random() * 0.3 + 0.3;
                    wingLeft.style.animationDuration = `${flapSpeed}s`;
                    wingRight.style.animationDuration = `${flapSpeed}s`;

                    butterflyContainer.appendChild(butterfly);
                }
            }

            // 4. Improved Pollen
            const pollenContainer = document.getElementById('meadow-pollen');
            if (pollenContainer && pollenContainer.children.length === 0) {
                for (let i = 0; i < 100; i++) { // Increased count
                    let particle = document.createElement('div');
                    particle.className = 'pollen-particle';
                    particle.style.setProperty('--x-start', `${Math.random() * 100}vw`);
                    particle.style.setProperty('--y-start', `${100 + Math.random() * 30}vh`);
                    particle.style.setProperty('--x-end', `${Math.random() * 100}vw`);
                    for(let j = 1; j <= 3; j++) {
                        particle.style.setProperty(`--x-gust${j}`, `${Math.random() * 60 - 30}vw`); // Wider gusts
                    }
                    particle.style.animationDelay = `-${Math.random() * 10}s`;
                    pollenContainer.appendChild(particle);
                }
            }
        }
        function createKoiPondScene() {
            // 1. Lily Pads
            const lilyPadContainer = document.getElementById('lily-pads');
            if (lilyPadContainer && lilyPadContainer.children.length === 0) {
                const numPads = 6;
                for (let i = 0; i < numPads; i++) {
                    let pad = document.createElement('div');
                    pad.className = 'lily-pad';
                    const size = Math.random() * 50 + 70;
                    pad.style.width = `${size}px`;
                    pad.style.height = `${size}px`;
                    pad.style.setProperty('--x-pos', `${10 + Math.random() * 80}vw`);
                    pad.style.setProperty('--y-pos', `${10 + Math.random() * 80}vh`);
                    pad.style.animationDelay = `-${Math.random() * 20}s`;
                    lilyPadContainer.appendChild(pad);
                }
            }

            // 2. Koi Fish & Ripples
            const koiContainer = document.getElementById('koi-fish');
            const rippleContainer = document.getElementById('koi-ripples');
            const koiInstances = [];

            if (koiContainer && koiContainer.children.length === 0) {
                const numKoi = 7;
                const koiColors = [
                    { base: '#f08c28', spots: ['#000', '#fff'] }, // Kohaku/Orange
                    { base: '#fff', spots: ['#d44d2d', '#000'] }, // Sanke/White
                    { base: '#333', spots: ['#f08c28', '#fff'] }, // Bekko/Black
                    { base: '#f2c94c', spots: ['#fff'] } // Yamabuki/Yellow
                ];

                for (let i = 0; i < numKoi; i++) {
                    let koi = document.createElement('div');
                    koi.className = 'koi';

                    const colors = koiColors[Math.floor(Math.random() * koiColors.length)];
                    let spotsSvg = '';
                    const spotCount = Math.floor(Math.random() * 4) + 2;
                    for(let j=0; j < spotCount; j++){
                        spotsSvg += `<circle cx="${Math.random()*80+10}" cy="${Math.random()*20+10}" r="${Math.random()*6+4}" fill="${colors.spots[Math.floor(Math.random()*colors.spots.length)]}" opacity="${Math.random() * 0.3 + 0.6}"/>`;
                    }
                    const koiSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><path d="M50 0 C20 0, 0 20, 0 20 S20 40, 50 40 C80 40, 100 20, 100 20 S80 0, 50 0 Z" fill="${colors.base}"/>${spotsSvg}</svg>`;
                    koi.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(koiSvg)}')`;

                    for(let j=1; j<=5; j++){
                        koi.style.setProperty(`--x${j}`, `${Math.random() * 90}vw`);
                        koi.style.setProperty(`--y${j}`, `${Math.random() * 90}vh`);
                        koi.style.setProperty(`--r${j}`, `${Math.random() * 360}deg`);
                    }
                    const duration = Math.random() * 10 + 20;
                    koi.style.animationDuration = `${duration}s`;
                    koi.style.animationDelay = `-${Math.random() * duration}s`;

                    koiContainer.appendChild(koi);
                    koiInstances.push(koi);
                }

                let lastRippleTime = 0;
                function rippleLoop(timestamp) {
                    if (activeTheme !== 'koi-pond' || isGameOver) {
                        activeThemeAnimationId = null;
                        return;
                    }
                    // Generate ripple roughly every 500-1000ms
                    if (timestamp - lastRippleTime > Math.random() * 500 + 500) {
                         lastRippleTime = timestamp;
                         // Pick a random fish to generate a ripple
                         const koi = koiInstances[Math.floor(Math.random() * koiInstances.length)];
                         const rect = koi.getBoundingClientRect();

                         // Only create ripple if fish is on screen
                         if (rect.top > 0 && rect.left > 0 && rect.bottom < window.innerHeight && rect.right < window.innerWidth) {
                            let ripple = document.createElement('div');
                            ripple.className = 'koi-ripple';
                            // Position ripple behind the fish head
                            const rippleX = rect.left + rect.width * 0.2;
                            const rippleY = rect.top + rect.height / 2;
                            ripple.style.left = `${rippleX}px`;
                            ripple.style.top = `${rippleY}px`;
                            ripple.style.width = `${rect.width * 1.5}px`;
                            ripple.style.height = `${rect.width * 1.5}px`;
                            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
                            rippleContainer.appendChild(ripple);
                         }
                    }
                    activeThemeAnimationId = requestAnimationFrame(rippleLoop);
                }
                rippleLoop(0);
            }
        }
        function createRainyWindow() {
            const canvas = document.getElementById('rain-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            function resizeCanvas() {
                if (!canvas) return;
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            window.addEventListener('resize', resizeCanvas, false);
            resizeCanvas();

            let drops = [];
            function createDrop(isInitial) {
                return {
                    x: Math.random() * canvas.width,
                    y: isInitial ? Math.random() * canvas.height : -50,
                    r: Math.random() * 1.5 + 1,
                    vy: Math.random() * 3 + 2,
                    isStreaking: false
                };
            }
            for(let i=0; i<150; i++){ drops.push(createDrop(true)); }

            function animate() {
                if (activeTheme !== 'rainy-window') {
                    return;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if(Math.random() > 0.8) drops.push(createDrop(false));

                for (let i = drops.length - 1; i >= 0; i--) {
                    let drop = drops[i];
                    if (drop.r > 3.5) drop.isStreaking = true;
                    drop.y += drop.vy;
                    if (drop.isStreaking) {
                        ctx.beginPath();
                        ctx.moveTo(drop.x, drop.y - drop.r * 4);
                        ctx.lineTo(drop.x, drop.y);
                        ctx.strokeStyle = `rgba(220, 230, 255, 0.3)`;
                        ctx.lineWidth = drop.r * 0.6;
                        ctx.stroke();
                    }
                    ctx.beginPath();
                    ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(220, 230, 255, 0.6)`;
                    ctx.fill();

                    for (let j = i - 1; j >= 0; j--) {
                        let other = drops[j];
                        let dx = drop.x - other.x;
                        let dy = drop.y - other.y;
                        if (Math.sqrt(dx*dx + dy*dy) < drop.r + other.r) {
                            drop.r = Math.min(Math.sqrt(Math.pow(drop.r, 2) + Math.pow(other.r, 2)), 15);
                            drops.splice(j, 1);
                            i--;
                            break;
                        }
                    }
                    if (drop.y > canvas.height + 50) drops.splice(i, 1);
                }
                activeThemeAnimationId = requestAnimationFrame(animate);
            }
            animate();
        }
        function resizeGame() {
            let blockSizeFromHeight;
            let blockSizeFromWidth;
            const bodyStyle = window.getComputedStyle(document.body);

            if (window.innerWidth > 768) { // Desktop Mode
                const margin = 0.95;
                const availableHeight = window.innerHeight * margin;
                const availableWidth = window.innerWidth * margin;

                blockSizeFromHeight = availableHeight / (ROWS + 5); // Original estimation is fine here

                const sidebarWidth = 180;
                const gap = 30;
                blockSizeFromWidth = (availableWidth - sidebarWidth - gap) / COLS;
            } else { // Mobile Mode
                const bodyHPadding = parseFloat(bodyStyle.paddingLeft) + parseFloat(bodyStyle.paddingRight);
                const availableWidth = window.innerWidth - bodyHPadding;
                blockSizeFromWidth = availableWidth / COLS;

                // Precise height calculation
                const nextPiecesContainer = document.querySelector('.next-pieces-container');
                const sidebar = document.querySelector('.sidebar');
                const gameContainer = document.querySelector('.game-container');
                const gameArea = document.querySelector('.game-area');

                const gameContainerGap = parseFloat(window.getComputedStyle(gameContainer).gap) || 0;
                const gameAreaGap = parseFloat(window.getComputedStyle(gameArea).gap) || 0;

                const otherElementsHeight =
                    nextPiecesContainer.offsetHeight +
                    sidebar.offsetHeight +
                    gameContainerGap +
                    gameAreaGap;

                const bodyVPadding = parseFloat(bodyStyle.paddingTop) + parseFloat(bodyStyle.paddingBottom);
                const totalAvailableHeight = window.innerHeight - bodyVPadding;

                const canvasAvailableHeight = totalAvailableHeight - otherElementsHeight;

                blockSizeFromHeight = canvasAvailableHeight / ROWS;
            }

            BLOCK_SIZE = Math.floor(Math.min(blockSizeFromHeight, blockSizeFromWidth));

            canvas.width = COLS * BLOCK_SIZE;
            canvas.height = ROWS * BLOCK_SIZE;

            // Maintain aspect ratio of next piece canvases relative to new BLOCK_SIZE
            if (nextCanvases && nextCanvases.length > 0) {
                nextCanvases[0].width = BLOCK_SIZE * 2;
                nextCanvases[0].height = BLOCK_SIZE * (50/30);
                for (let i = 1; i < 5; i++) {
                    nextCanvases[i].width = BLOCK_SIZE * (50/30);
                    nextCanvases[i].height = BLOCK_SIZE * (40/30);
                }
            }

            // Redraw the game with new sizes if the game is active
            if (!isGameOver && currentPiece) {
                draw();
                drawNextPieces();
            }
        }

        function init() {
            canvas = document.getElementById('game-canvas'); ctx = canvas.getContext('2d');
            nextCanvases = Array.from({length: 5}, (_, i) => document.getElementById(`next-${i}`));

            resizeGame();
            window.addEventListener('resize', resizeGame);

            createParticles(); loadSettings(); setupUI();
            document.addEventListener('click', initSound, { once: true });
            document.addEventListener('keydown', initSound, { once: true });
            document.addEventListener('fullscreenchange', () => {
                const fullscreenBtn = document.getElementById('fullscreen-toggle');
                fullscreenBtn.textContent = document.fullscreenElement ? '><' : '⛶';
            });

            window.addEventListener('touchstart', handleTouchStart, { passive: false });
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd, { passive: false });

            resetGame();
        }

        function createSwedishForest() {
            // Pine tree generation for parallax layers
            const layers = [
                { el: document.getElementById('sf-layer-1'), count: 80, height: 150, color: 'rgba(20, 40, 50, 0.7)' },
                { el: document.getElementById('sf-layer-2'), count: 60, height: 250, color: 'rgba(30, 55, 70, 0.8)' },
                { el: document.getElementById('sf-layer-3'), count: 40, height: 400, color: 'rgba(40, 70, 90, 0.9)' }
            ];

            layers.forEach(layer => {
                if(layer.el && !layer.el.style.backgroundImage) {
                    const T_WIDTH = 100;
                    let canvas = document.createElement('canvas');
                    canvas.width = layer.count * T_WIDTH;
                    canvas.height = layer.height;
                    let ctx = canvas.getContext('2d');

                    for(let i = 0; i < layer.count; i++) {
                        const h = layer.height * (0.6 + Math.random() * 0.4);
                        const tH = h * (0.1 + Math.random() * 0.05);
                        const x = i * T_WIDTH + (Math.random() - 0.5) * 20;

                        // Draw trunk
                        ctx.fillStyle = layer.color;
                        ctx.fillRect(x + T_WIDTH/2 - 5, canvas.height - tH, 10, tH);

                        // Draw foliage
                        let y = canvas.height - tH;
                        let w = T_WIDTH * 0.9;
                        let numLayers = 5 + Math.floor(Math.random() * 3);
                        let layerHeight = y / numLayers;

                        for (let j = 0; j < numLayers; j++) {
                            let cY = y - (j * layerHeight);
                            let cW = w * ((numLayers - j) / numLayers) * (1 + (Math.random() - 0.5) * 0.2);
                            let sway = (Math.random() - 0.5) * 10;

                            ctx.beginPath();
                            ctx.moveTo(x + T_WIDTH/2 + sway, cY - layerHeight);
                            ctx.lineTo(x + T_WIDTH/2 - cW/2, cY);
                            ctx.lineTo(x + T_WIDTH/2 + cW/2, cY);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    layer.el.style.backgroundImage = `url(${canvas.toDataURL()})`;
                    layer.el.style.backgroundSize = `${canvas.width}px ${canvas.height}px`;
                }
            });

            // God ray generation
            const godRayContainer = document.querySelector('.god-ray-container');
            if (godRayContainer && godRayContainer.children.length === 0) {
                for (let i = 0; i < 15; i++) {
                    let ray = document.createElement('div');
                    ray.className = 'god-ray';
                    ray.style.left = `${Math.random() * 120 - 10}%`;
                    ray.style.top = '0px';
                    ray.style.width = `${Math.random() * 4 + 2}px`;
                    ray.style.height = '120%';
                    ray.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
                    ray.style.opacity = `${Math.random() * 0.1 + 0.05}`;
                    godRayContainer.appendChild(ray);
                }
            }
        }
        function createGalaxyScene() {
            // Background Stars
            const starsContainer = document.getElementById('galaxy-stars-bg');
            if (starsContainer && starsContainer.children.length === 0) {
                for (let i = 0; i < 200; i++) {
                    let star = document.createElement('div');
                    star.className = 'galaxy-star-bg';
                    const size = Math.random() * 2 + 0.5;
                    star.style.width = `${size}px`;
                    star.style.height = `${size}px`;
                    star.style.left = `${Math.random() * 100}%`;
                    star.style.top = `${Math.random() * 100}%`;
                    star.style.animationDelay = `${Math.random() * 15}s`;
                    starsContainer.appendChild(star);
                }
            }

            // Shooting Stars
            const shootingStarContainer = document.getElementById('shooting-stars');
            if (shootingStarContainer && shootingStarContainer.children.length === 0) {
                for (let i = 0; i < 5; i++) {
                    let star = document.createElement('div');
                    star.className = 'shooting-star';
                    star.style.top = `${Math.random() * 100}%`;
                    const duration = Math.random() * 5 + 5;
                    star.style.animationDuration = `${duration}s`;
                    star.style.animationDelay = `${Math.random() * 20}s`;
                    star.style.width = `${Math.random() * 100 + 100}px`;
                    shootingStarContainer.appendChild(star);
                }
            }
        }
        function createAuroraScene() {
            // Faint, twinkling stars
            const starsContainer = document.getElementById('aurora-stars');
            if (starsContainer && starsContainer.children.length === 0) {
                for (let i = 0; i < 150; i++) {
                    let star = document.createElement('div');
                    star.className = 'aurora-star';
                    const size = Math.random() * 1.5 + 0.5;
                    star.style.width = `${size}px`;
                    star.style.height = `${size}px`;
                    star.style.left = `${Math.random() * 100}%`;
                    star.style.top = `${Math.random() * 100}%`;
                    star.style.animationDelay = `${Math.random() * 10}s`;
                    starsContainer.appendChild(star);
                }
            }
        }
        function createSpringScene() {
            // Drifting Clouds
            const cloudContainer = document.getElementById('spring-clouds');
            if (cloudContainer && cloudContainer.children.length === 0) {
                for (let i = 0; i < 15; i++) {
                    let cloud = document.createElement('div');
                    cloud.className = 'spring-cloud';
                    const size = Math.random() * 150 + 100;
                    cloud.style.width = `${size}px`;
                    cloud.style.height = `${size * 0.6}px`;
                    cloud.style.top = `${Math.random() * 50}%`;
                    cloud.style.opacity = Math.random() * 0.4 + 0.3;
                    const duration = Math.random() * 80 + 60;
                    cloud.style.animationDuration = `${duration}s`;
                    cloud.style.animationDelay = `-${Math.random() * duration}s`;
                    cloudContainer.appendChild(cloud);
                }
            }

            // Multi-layered Rain
            const rainLayers = [
                { container: document.getElementById('rain-back'), count: 50, width: '0.8px', height: '40px', duration: 0.6, drift: -10 },
                { container: document.getElementById('rain-mid'), count: 60, width: '1px', height: '60px', duration: 0.5, drift: -15 },
                { container: document.getElementById('rain-front'), count: 30, width: '1.2px', height: '80px', duration: 0.4, drift: -20 }
            ];
            rainLayers.forEach(layer => {
                if (layer.container && layer.container.children.length === 0) {
                    for (let i = 0; i < layer.count; i++) {
                        let drop = document.createElement('div');
                        drop.className = 'spring-raindrop';
                        drop.style.left = `${Math.random() * 105}%`; // Allow some overflow
                        drop.style.width = layer.width;
                        drop.style.height = layer.height;
                        const animDuration = Math.random() * 0.2 + layer.duration;
                        drop.style.animationDuration = `${animDuration}s`;
                        drop.style.animationDelay = `-${Math.random() * animDuration * 5}s`;
                        drop.style.setProperty('--x-drift', `${layer.drift}px`);
                        layer.container.appendChild(drop);
                    }
                }
            });

            // Unfurling Sprouts with Life Cycle
            const sproutsContainer = document.getElementById('sprouts-container');
            if (sproutsContainer && sproutsContainer.children.length === 0) {
                for (let i = 0; i < 25; i++) {
                    let sprout = document.createElement('div');
                    sprout.className = 'sprout';
                    sprout.style.left = `${5 + Math.random() * 90}%`;
                    sprout.style.animationDelay = `-${Math.random() * 25}s`;

                    const leftLeaf = document.createElement('div');
                    leftLeaf.className = 'left';
                    const rightLeaf = document.createElement('div');
                    rightLeaf.className = 'right';

                    // Vary sway speed for each sprout
                    const swayDuration = Math.random() * 2 + 4;
                    leftLeaf.style.animationDuration = `${swayDuration}s`;
                    rightLeaf.style.animationDuration = `${swayDuration}s`;

                    sprout.appendChild(leftLeaf);
                    sprout.appendChild(rightLeaf);
                    sproutsContainer.appendChild(sprout);
                }
            }
        }
        function createRainyWindow() {
            const canvas = document.getElementById('rain-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            function resizeCanvas() {
                if (!canvas) return;
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            window.addEventListener('resize', resizeCanvas, false);
            resizeCanvas();

            let drops = [];
            function createDrop(isInitial) {
                return {
                    x: Math.random() * canvas.width,
                    y: isInitial ? Math.random() * canvas.height : -50,
                    r: Math.random() * 1.5 + 1,
                    vy: Math.random() * 3 + 2,
                    isStreaking: false
                };
            }
            for(let i=0; i<150; i++){ drops.push(createDrop(true)); }

            function animate() {
                if (activeTheme !== 'rainy-window') {
                    return;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if(Math.random() > 0.8) drops.push(createDrop(false));

                for (let i = drops.length - 1; i >= 0; i--) {
                    let drop = drops[i];
                    if (drop.r > 3.5) drop.isStreaking = true;
                    drop.y += drop.vy;
                    if (drop.isStreaking) {
                        ctx.beginPath();
                        ctx.moveTo(drop.x, drop.y - drop.r * 4);
                        ctx.lineTo(drop.x, drop.y);
                        ctx.strokeStyle = `rgba(220, 230, 255, 0.3)`;
                        ctx.lineWidth = drop.r * 0.6;
                        ctx.stroke();
                    }
                    ctx.beginPath();
                    ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(220, 230, 255, 0.6)`;
                    ctx.fill();

                    for (let j = i - 1; j >= 0; j--) {
                        let other = drops[j];
                        let dx = drop.x - other.x;
                        let dy = drop.y - other.y;
                        if (Math.sqrt(dx*dx + dy*dy) < drop.r + other.r) {
                            drop.r = Math.min(Math.sqrt(Math.pow(drop.r, 2) + Math.pow(other.r, 2)), 15);
                            drops.splice(j, 1);
                            i--;
                            break;
                        }
                    }
                    if (drop.y > canvas.height + 50) drops.splice(i, 1);
                }
                activeThemeAnimationId = requestAnimationFrame(animate);
            }
            animate();
        }
        function createSummerScene() {
            // God Rays
            const godRayContainer = document.querySelector('.god-rays-summer');
            if (godRayContainer && godRayContainer.children.length === 0) {
                for (let i = 0; i < 20; i++) {
                    let ray = document.createElement('div');
                    ray.className = 'summer-god-ray';
                    ray.style.left = `${Math.random() * 140 - 20}%`;
                    ray.style.top = '0px';
                    ray.style.width = `${Math.random() * 4 + 2}px`;
                    ray.style.height = '120%';
                    ray.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;
                    ray.style.animationDelay = `-${Math.random() * 8}s`; // Add delay for breathing effect
                    godRayContainer.appendChild(ray);
                }
            }

            // Dandelion Seeds
            const seedContainer = document.getElementById('dandelion-seeds');
            if (seedContainer && seedContainer.children.length === 0) {
                for (let i = 0; i < 60; i++) { // Increased seed count
                    let seed = document.createElement('div');
                    seed.className = 'dandelion-seed';
                    const xStart = Math.random() * 100;
                    const yStart = 100 + Math.random() * 20;
                    const xEnd = Math.random() * 100;
                    const yEnd = -20 + Math.random() * -20;
                    seed.style.setProperty('--x-start', `${xStart}vw`);
                    seed.style.setProperty('--y-start', `${yStart}vh`);
                    seed.style.setProperty('--x-mid', `${xStart + (Math.random() - 0.5) * 40}vw`);
                    seed.style.setProperty('--y-mid', `${(yStart + yEnd) / 2}vh`);
                    seed.style.setProperty('--x-end', `${xEnd}vw`);
                    seed.style.setProperty('--y-end', `${yEnd}vh`);
                    seed.style.animationDuration = `${Math.random() * 10 + 15}s`;
                    seed.style.animationDelay = `-${Math.random() * 25}s`;
                    seedContainer.appendChild(seed);
                }
            }

            // Swaying Grass
            const grassContainer = document.querySelector('.summer-grass');
            if (grassContainer && grassContainer.children.length === 0) {
                for (let i = 0; i < 120; i++) {
                    let blade = document.createElement('div');
                    blade.className = 'summer-grass-blade';
                    blade.style.left = `${Math.random() * 100}%`;
                    blade.style.height = `${Math.random() * 40 + 20}px`;
                    blade.style.animationDelay = `-${Math.random() * 7}s`;
                    blade.style.filter = `brightness(${Math.random() * 0.3 + 0.8})`;
                    grassContainer.appendChild(blade);
                }
            }
        }
        function createAutumnScene() {
            // Define leaf shapes and colors
            const leafShapes = [
                'M15 0 C0 5, 5 25, 15 30 C25 25, 30 5, 15 0 Z', // Simple teardrop
                'M15 0 L17 10 L30 12 L18 18 L22 30 L15 25 L8 30 L12 18 L0 12 L13 10 Z', // Maple-like
                'M15 0 C 0 10, 0 20, 5 30 C 10 25, 20 25, 25 30 C 30 20, 30 10, 15 0 Z' // Oak-like
            ];
            const leafColors = ['#d44d2d', '#f7a156', '#a26e49', '#6d4c3c'];

            // Multi-layered falling leaves
            const leafLayers = [
                { container: document.getElementById('fall-leaves-back'), count: 20, minSize: 15, maxSize: 25, minDuration: 15, maxDuration: 20 },
                { container: document.getElementById('fall-leaves-mid'), count: 15, minSize: 20, maxSize: 35, minDuration: 10, maxDuration: 15 },
                { container: document.getElementById('fall-leaves-front'), count: 10, minSize: 25, maxSize: 45, minDuration: 7, maxDuration: 12 }
            ];

            leafLayers.forEach(layer => {
                if (layer.container && layer.container.children.length === 0) {
                    for (let i = 0; i < layer.count; i++) {
                        let leaf = document.createElement('div');
                        leaf.className = 'leaf';
                        const shape = leafShapes[Math.floor(Math.random() * leafShapes.length)];
                        const color = leafColors[Math.floor(Math.random() * leafColors.length)];
                        leaf.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><path d="${shape}" fill="${encodeURIComponent(color)}"/></svg>')`;
                        const size = Math.random() * (layer.maxSize - layer.minSize) + layer.minSize;
                        leaf.style.width = `${size}px`;
                        leaf.style.height = `${size}px`;

                        leaf.style.setProperty('--x-start', `${Math.random() * 100}vw`);
                        leaf.style.setProperty('--x-end', `${Math.random() * 100}vw`);
                        leaf.style.setProperty('--r-start', `${Math.random() * 360}deg`);
                        leaf.style.setProperty('--r-end', `${Math.random() * 1440 - 720}deg`);
                        for(let j = 1; j <= 4; j++) {
                            leaf.style.setProperty(`--x-gust${j}`, `${Math.random() * 20 - 10}vw`);
                        }

                        const duration = Math.random() * (layer.maxDuration - layer.minDuration) + layer.minDuration;
                        leaf.style.animationDuration = `${duration}s`;
                        leaf.style.animationDelay = `-${Math.random() * duration}s`;
                        layer.container.appendChild(leaf);
                    }
                }
            });

            // Dynamic Ground leaves
            const groundContainer = document.querySelector('.ground-leaves');
            if (groundContainer && groundContainer.children.length === 0) {
                groundContainer.style.backgroundImage = ''; // Clear any old canvas
                for (let i = 0; i < 80; i++) {
                    let leaf = document.createElement('div');
                    leaf.className = 'ground-leaf';
                    const shape = leafShapes[Math.floor(Math.random() * leafShapes.length)];
                    const color = leafColors[Math.floor(Math.random() * leafColors.length)];
                    leaf.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><path d="${shape}" fill="${encodeURIComponent(color)}"/></svg>')`;

                    const size = Math.random() * 25 + 20;
                    leaf.style.width = `${size}px`;
                    leaf.style.height = `${size}px`;
                    leaf.style.left = `${Math.random() * 100}%`;
                    leaf.style.bottom = `${Math.random() * 40 - 10}px`; // Stagger vertically
                    leaf.style.opacity = Math.random() * 0.5 + 0.5;

                    leaf.style.setProperty('--r1', `${Math.random() * 20 - 10}deg`);
                    leaf.style.setProperty('--r2', `${Math.random() * 20 - 10}deg`);
                    leaf.style.animationDuration = `${Math.random() * 5 + 5}s`;
                    leaf.style.animationDelay = `-${Math.random() * 10}s`;

                    groundContainer.appendChild(leaf);
                }
            }

            // Wind Particles
            const windContainer = document.getElementById('fall-wind-particles');
            if (windContainer && windContainer.children.length === 0) {
                for (let i = 0; i < 10; i++) {
                    let particle = document.createElement('div');
                    particle.className = 'fall-wind-particle';
                    particle.style.top = `${Math.random() * 100}%`;
                    const duration = Math.random() * 3 + 2;
                    particle.style.animationDuration = `${duration}s`;
                    particle.style.animationDelay = `-${Math.random() * duration}s`;
                    windContainer.appendChild(particle);
                }
            }
        }
        function createWinterScene() {
            // Multi-layered snowfall
            const snowflakeLayers = [
                { container: document.getElementById('snowflakes-back'), count: 70, minSize: 1, maxSize: 3, minDuration: 20, maxDuration: 30 },
                { container: document.getElementById('snowflakes-mid'), count: 50, minSize: 2, maxSize: 5, minDuration: 10, maxDuration: 15 },
                { container: document.getElementById('snowflakes-front'), count: 30, minSize: 4, maxSize: 8, minDuration: 5, maxDuration: 8 }
            ];

            snowflakeLayers.forEach(layer => {
                if (layer.container && layer.container.children.length === 0) {
                    for (let i = 0; i < layer.count; i++) {
                        let flake = document.createElement('div');
                        flake.className = 'snowflake';
                        const size = Math.random() * (layer.maxSize - layer.minSize) + layer.minSize;
                        flake.style.width = `${size}px`;
                        flake.style.height = `${size}px`;
                        const xStart = Math.random() * 120 - 10;
                        const windEffect = (Math.random() - 0.5) * 50; // Wind gust effect
                        flake.style.setProperty('--x-start', `${xStart}vw`);
                        flake.style.setProperty('--x-end', `${xStart + windEffect + (Math.random() * 20 - 10)}vw`);
                        flake.style.setProperty('--r-end', `${Math.random() * 720 - 360}deg`);
                        const duration = Math.random() * (layer.maxDuration - layer.minDuration) + layer.minDuration;
                        flake.style.animationDuration = `${duration}s`;
                        flake.style.animationDelay = `-${Math.random() * duration}s`;
                        layer.container.appendChild(flake);
                    }
                }
            });

            // Ice crystal generation
            const crystalContainer = document.querySelector('.ice-crystals');
            if (crystalContainer && crystalContainer.children.length === 0) {
                for (let i = 0; i < 5; i++) { // Reduced count for subtlety
                    let crystal = document.createElement('div');
                    crystal.className = 'ice-crystal';

                    // Position near corners
                    const corner = Math.floor(Math.random() * 4);
                    const xPos = (corner % 2 === 0) ? `${Math.random() * 20}%` : `${80 + Math.random() * 20}%`;
                    const yPos = (corner < 2) ? `${Math.random() * 20}%` : `${80 + Math.random() * 20}%`;
                    crystal.style.left = xPos;
                    crystal.style.top = yPos;

                    const size = Math.random() * 80 + 40; // Adjusted size
                    crystal.style.width = `${size}px`;
                    crystal.style.height = `${size}px`;
                    crystal.style.animationDelay = `-${Math.random() * 30}s`;
                    crystalContainer.appendChild(crystal);
                }
            }
        }
        function createEnchantedForest() {
            // Tree generation for parallax layers
            const layers = [
                { el: document.getElementById('enchanted-forest-back'), count: 40, color: 'rgba(10, 15, 25, 0.7)', height: 250 },
                { el: document.getElementById('enchanted-forest-mid'), count: 30, color: 'rgba(20, 30, 50, 0.8)', height: 350 },
                { el: document.getElementById('enchanted-forest-front'), count: 20, color: 'rgba(30, 45, 75, 0.9)', height: 500 }
            ];

            layers.forEach(layer => {
                if(layer.el && !layer.el.style.backgroundImage) {
                    const T_WIDTH = 150;
                    let canvas = document.createElement('canvas');
                    canvas.width = layer.count * T_WIDTH;
                    canvas.height = layer.height;
                    let ctx = canvas.getContext('2d');
                    ctx.fillStyle = layer.color;
                    ctx.strokeStyle = layer.color;

                    for(let i = 0; i < layer.count; i++) {
                        const x = i * T_WIDTH + Math.random() * (T_WIDTH / 2);
                        const h = layer.height * (0.7 + Math.random() * 0.3);
                        const trunkWidth = 10 + Math.random() * 10;

                        // Draw trunk
                        ctx.beginPath();
                        ctx.moveTo(x, canvas.height);
                        ctx.lineTo(x + trunkWidth / 4, canvas.height - h / 2);
                        ctx.lineTo(x - trunkWidth / 4, canvas.height - h);
                        ctx.lineWidth = trunkWidth;
                        ctx.stroke();

                        // Draw branches
                        for(let j = 0; j < 5; j++) {
                            const branchY = canvas.height - h + (Math.random() * (h/2));
                            const branchLen = Math.random() * 40 + 20;
                            const angle = (Math.random() - 0.5) * Math.PI;
                            ctx.beginPath();
                            ctx.moveTo(x - trunkWidth / 4, branchY);
                            ctx.lineTo(x - trunkWidth / 4 + Math.cos(angle) * branchLen, branchY + Math.sin(angle) * branchLen);
                            ctx.lineWidth = Math.random() * 3 + 1;
                            ctx.stroke();
                        }
                    }
                    layer.el.style.backgroundImage = `url(${canvas.toDataURL()})`;
                    layer.el.style.backgroundSize = `${canvas.width}px ${canvas.height}px`;
                }
            });
        }
        function createSunset() {
            // Procedurally generate clouds
            const cloudLayers = [
                { el: document.getElementById('sunset-clouds-back'), count: 10, color: 'rgba(255, 255, 255, 0.2)', height: 300, width: 800 },
                { el: document.getElementById('sunset-clouds-mid'), count: 8, color: 'rgba(255, 230, 200, 0.5)', height: 250, width: 600 },
                { el: document.getElementById('sunset-clouds-front'), count: 6, color: 'rgba(255, 240, 220, 0.8)', height: 200, width: 400 }
            ];

            cloudLayers.forEach(layer => {
                if (layer.el && !layer.el.style.backgroundImage) {
                    let canvas = document.createElement('canvas');
                    canvas.width = layer.count * layer.width;
                    canvas.height = layer.height;
                    let ctx = canvas.getContext('2d');

                    for (let i = 0; i < layer.count; i++) {
                        const x = i * layer.width + Math.random() * (layer.width / 2);
                        const y = Math.random() * (canvas.height * 0.4) + canvas.height * 0.1;
                        const w = layer.width * (0.6 + Math.random() * 0.4);
                        const h = layer.height * (0.4 + Math.random() * 0.3);
                        ctx.fillStyle = layer.color;
                        ctx.filter = `blur(${Math.random() * 10 + 5}px)`;

                        for(let j=0; j<8; j++) {
                            const puffX = x + (Math.random() - 0.5) * w;
                            const puffY = y + (Math.random() - 0.5) * h;
                            const puffR = Math.random() * (w/4) + (w/8);
                            ctx.beginPath();
                            ctx.arc(puffX, puffY, puffR, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                    }
                    layer.el.style.backgroundImage = `url(${canvas.toDataURL()})`;
                    layer.el.style.backgroundSize = `${canvas.width}px 100%`;
                    layer.el.style.top = `${Math.random() * 20}%`;
                }
            });

            // Procedurally generate mountain silhouette
            const mountainContainer = document.querySelector('.mountain-silhouette');
            if (mountainContainer && mountainContainer.children.length === 0) {
                let canvas = document.createElement('canvas');
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight * 0.25;
                let ctx = canvas.getContext('2d');

                const drawMountainRange = (color, startY, amplitude, peaks) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height);
                    let x = 0;
                    while (x < canvas.width) {
                        const peakWidth = canvas.width / peaks;
                        const step = peakWidth / 20;
                        for (let i = 0; i < 20; i++) {
                            const y = startY + Math.sin((x / peakWidth) * Math.PI * 2) * amplitude * Math.sin((x/canvas.width)*Math.PI);
                            ctx.lineTo(x, y);
                            x += step;
                        }
                    }
                    ctx.lineTo(canvas.width, canvas.height);
                    ctx.closePath();
                    ctx.fill();
                };

                drawMountainRange('rgba(20, 20, 40, 0.6)', canvas.height * 0.7, canvas.height * 0.4, 3);
                drawMountainRange('rgba(40, 40, 60, 0.8)', canvas.height * 0.8, canvas.height * 0.3, 5);
                drawMountainRange('rgba(60, 60, 80, 1.0)', canvas.height * 0.9, canvas.height * 0.2, 8);

                mountainContainer.style.backgroundImage = `url(${canvas.toDataURL()})`;
                mountainContainer.style.backgroundSize = '100% 100%';
            }


            // God Rays
            const godRayContainer = document.querySelector('.sunset-god-rays');
            if (godRayContainer && godRayContainer.children.length === 0) {
                for (let i = 0; i < 30; i++) {
                    let ray = document.createElement('div');
                    ray.className = 'sunset-god-ray';
                    ray.style.transform = `rotate(${i * 12 + Math.random() * 4 - 2}deg)`;
                    godRayContainer.appendChild(ray);
                }
            }

            // Dust Motes
            const dustContainer = document.getElementById('dust-motes');
            if (dustContainer && dustContainer.children.length === 0) {
                for (let i = 0; i < 50; i++) {
                    let mote = document.createElement('div');
                    mote.className = 'dust-mote';
                    const size = Math.random() * 2 + 1;
                    mote.style.width = `${size}px`;
                    mote.style.height = `${size}px`;
                    mote.style.setProperty('--x-start', `${Math.random() * 100}vw`);
                    mote.style.setProperty('--y-start', `${Math.random() * 100}vh`);
                    mote.style.setProperty('--x-end', `${Math.random() * 100}vw`);
                    mote.style.setProperty('--y-end', `${Math.random() * 100}vh`);
                    mote.style.animationDelay = `-${Math.random() * 15}s`;
                    dustContainer.appendChild(mote);
                }
            }
        }
        function createMountainScene() {
            // Stars
            const starsContainer = document.getElementById('mountain-stars');
            if (starsContainer && starsContainer.children.length === 0) {
                for (let i = 0; i < 150; i++) {
                    let star = document.createElement('div');
                    star.className = 'mountain-star';
                    const size = Math.random() * 2 + 1;
                    star.style.width = `${size}px`;
                    star.style.height = `${size}px`;
                    star.style.left = `${Math.random() * 100}%`;
                    star.style.top = `${Math.random() * 50}%`;
                    const dayNightCycle = document.querySelector('.mountain-sky').style.animation;
                    // This is a simplified way; a better implementation would use JS to track animation progress
                    star.style.setProperty('--start-op', 0);
                    star.style.setProperty('--end-op', Math.random() * 0.8);
                    star.style.animationDelay = `${Math.random() * 10}s`;
                    starsContainer.appendChild(star);
                }
            }

            // Mountain Ranges
            const mountainLayers = [
                { el: document.getElementById('mountain-range-back'), color: '#3E517A', height: 0.6, peaks: 5, jaggedness: 0.4 },
                { el: document.getElementById('mountain-range-mid'), color: '#2C3E50', height: 0.7, peaks: 7, jaggedness: 0.6 },
                { el: document.getElementById('mountain-range-front'), color: '#1B2631', height: 0.8, peaks: 9, jaggedness: 0.8 }
            ];
            mountainLayers.forEach(layer => {
                if (layer.el && !layer.el.style.backgroundImage) {
                    const canvas = document.createElement('canvas');
                    const C_WIDTH = 2048;
                    canvas.width = C_WIDTH * 2;
                    canvas.height = window.innerHeight;
                    const ctx = canvas.getContext('2d');

                    ctx.fillStyle = layer.color;
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height);
                    let y = canvas.height * layer.height;
                    let x = 0;
                    while (x < canvas.width) {
                        const peakWidth = canvas.width / (layer.peaks * 2);
                        const step = peakWidth / 20;
                        for (let i = 0; i < 20; i++) {
                            const sineX = (x / peakWidth) * Math.PI;
                            const sineY = Math.sin(sineX) * (peakWidth/3) * (0.5 + Math.sin(x*0.01)*0.5);
                            const noise = (Math.random() - 0.5) * layer.jaggedness * step;
                            ctx.lineTo(x, y - sineY + noise);
                            x += step;
                        }
                    }
                    ctx.lineTo(canvas.width, canvas.height);
                    ctx.closePath();
                    ctx.fill();
                    layer.el.style.backgroundImage = `url(${canvas.toDataURL()})`;
                    layer.el.style.backgroundSize = `${canvas.width}px 100%`;
                }
            });

            // Clouds
            const cloudContainer = document.querySelector('.mountain-clouds');
            if (cloudContainer && !cloudContainer.style.backgroundImage) {
                 let canvas = document.createElement('canvas');
                 canvas.width = 4096;
                 canvas.height = 400; // Increased height for more vertical variation
                 let ctx = canvas.getContext('2d');
                 ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';

                 for (let i = 0; i < 15; i++) { // Generate 15 cloud clusters
                     const startX = Math.random() * canvas.width;
                     const startY = Math.random() * (canvas.height * 0.6) + (canvas.height * 0.1);
                     const cloudLength = Math.random() * 400 + 200; // Make clouds longer
                     const puffCount = 20;

                     ctx.filter = `blur(${Math.random() * 10 + 8}px)`;

                     for(let j = 0; j < puffCount; j++) {
                         const progress = j / puffCount;
                         // Distribute puffs along the length, with some randomness
                         const puffX = startX + progress * cloudLength + (Math.random() - 0.5) * 50;
                         // Create a gentle arc for the cloud shape
                         const puffY = startY + Math.sin(progress * Math.PI) * 40 + (Math.random() - 0.5) * 30;
                         // Puffs are smaller at the edges
                         const maxRadius = Math.sin(progress * Math.PI) * 60 + 20;
                         const puffR = Math.random() * maxRadius;

                         ctx.beginPath();
                         ctx.arc(puffX, puffY, puffR, 0, 2 * Math.PI);
                         ctx.fill();
                     }
                 }
                 cloudContainer.style.backgroundImage = `url(${canvas.toDataURL()})`;
                 cloudContainer.style.backgroundSize = `${canvas.width}px 100%`;
            }
        }
        function createDeepOcean() {
            // Caustics
            const causticsContainer = document.querySelector('#ocean-theme .caustics-container');
            if (causticsContainer && causticsContainer.children.length === 0) {
                const light = document.createElement('div');
                light.className = 'caustic-light';
                causticsContainer.appendChild(light);
            }

            // God Rays
            const godRayContainer = document.querySelector('.ocean-god-rays');
            if (godRayContainer && godRayContainer.children.length === 0) {
                for (let i = 0; i < 15; i++) {
                    let ray = document.createElement('div');
                    ray.className = 'ocean-god-ray';
                    ray.style.left = `${Math.random() * 120 - 10}%`;
                    ray.style.top = '0px';
                    ray.style.width = `${Math.random() * 3 + 1}px`;
                    ray.style.height = '120%';
                    ray.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
                    ray.style.opacity = `${Math.random() * 0.1 + 0.05}`;
                    godRayContainer.appendChild(ray);
                }
            }

            // Plankton
            const planktonContainer = document.getElementById('ocean-plankton-layer');
            if (planktonContainer && planktonContainer.children.length === 0) {
                for (let i = 0; i < 100; i++) {
                    let particle = document.createElement('div');
                    particle.className = 'ocean-plankton';
                    const size = Math.random() * 1.5 + 0.5;
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.setProperty('--x-start', `${Math.random() * 100}vw`);
                    particle.style.setProperty('--y-start', `${Math.random() * 100}vh`);
                    particle.style.setProperty('--x-end', `${Math.random() * 100}vw`);
                    particle.style.setProperty('--y-end', `${Math.random() * 100}vh`);
                    particle.style.animationDelay = `-${Math.random() * 10}s`;
                    planktonContainer.appendChild(particle);
                }
            }

            // Jellyfish
            const jellyfishContainer = document.getElementById('jellyfish-layer');
            if (jellyfishContainer && jellyfishContainer.children.length === 0) {
                for (let i = 0; i < 8; i++) {
                    let fish = document.createElement('div');
                    fish.className = 'jellyfish';
                    let body = document.createElement('div');
                    body.className = 'jelly-body';
                    let tentacles = document.createElement('div');
                    tentacles.className = 'jelly-tentacles';

                    for (let j = 0; j < 5; j++) {
                        let tentacle = document.createElement('div');
                        tentacle.className = 'tentacle';
                        tentacle.style.height = `${Math.random() * 40 + 30}px`;
                        tentacle.style.left = `${Math.random() * 40 - 20}px`;
                        tentacle.style.animationDelay = `-${Math.random() * 4}s`;
                        tentacles.appendChild(tentacle);
                    }

                    fish.appendChild(body);
                    fish.appendChild(tentacles);

                    fish.style.setProperty('--x-start', `${-10 + Math.random() * 120}vw`);
                    fish.style.setProperty('--y-start', `${110}vh`);
                    fish.style.setProperty('--x-end', `${-10 + Math.random() * 120}vw`);
                    fish.style.setProperty('--y-end', `${-20}vh`);
                    fish.style.animationDuration = `${Math.random() * 20 + 15}s`;
                    fish.style.animationDelay = `-${Math.random() * 35}s`;
                    body.style.animationDelay = `-${Math.random() * 4}s`;

                    jellyfishContainer.appendChild(fish);
                }
            }

            // Ocean floor layers
            const layers = [
                { el: document.getElementById('ocean-floor-bg'), count: 80, color: 'rgba(5, 30, 50, 0.6)', height: 120 },
                { el: document.getElementById('ocean-floor-mid'), count: 50, color: 'rgba(10, 40, 65, 0.8)', height: 180 },
                { el: document.getElementById('ocean-floor-fg'), count: 30, color: 'rgba(15, 50, 80, 1.0)', height: 250 }
            ];

            layers.forEach(layer => {
                if (layer.el && !layer.el.style.backgroundImage) {
                    const C_WIDTH = 250;
                    let canvas = document.createElement('canvas');
                    canvas.width = layer.count * C_WIDTH;
                    canvas.height = layer.height;
                    let ctx = canvas.getContext('2d');

                    // Draw ground
                    ctx.fillStyle = layer.color;
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height);
                    let y = canvas.height * 0.9;
                    for (let i = 0; i < canvas.width; i++) {
                        y += (Math.random() - 0.5) * 0.5;
                        y = Math.max(canvas.height * 0.7, Math.min(canvas.height, y));
                        ctx.lineTo(i, y);
                    }
                    ctx.lineTo(canvas.width, canvas.height);
                    ctx.closePath();
                    ctx.fill();

                    // Draw flora
                    for (let i = 0; i < layer.count * 1.5; i++) {
                        const x = Math.random() * canvas.width;
                        let groundY = 0;
                        // Find ground Y at this x (approximate)
                        for (let j = 0; j < canvas.height; j++) {
                            if (ctx.getImageData(x, j, 1, 1).data[3] > 0) {
                                groundY = j;
                                break;
                            }
                        }
                        if (groundY === 0) continue;


                        if (Math.random() > 0.3) { // Seaweed
                            ctx.strokeStyle = `rgba(${parseInt(layer.color.slice(5,-1).split(',')[0]) + 10}, ${parseInt(layer.color.slice(5,-1).split(',')[1]) + 10}, ${parseInt(layer.color.slice(5,-1).split(',')[2]) + 10}, ${parseFloat(layer.color.slice(5,-1).split(',')[3]) * 1.2})`;
                            const h = (Math.random() * 0.8 + 0.2) * layer.height;
                            ctx.beginPath();
                            ctx.moveTo(x, groundY);
                            ctx.bezierCurveTo(x + (Math.random()-0.5)*50, groundY - h*0.3, x + (Math.random()-0.5)*50, groundY - h*0.7, x + (Math.random()-0.5)*30, groundY-h);
                            ctx.lineWidth = Math.random() * 3 + 1;
                            ctx.stroke();
                        } else { // Coral Fan
                            ctx.fillStyle = `rgba(${parseInt(layer.color.slice(5,-1).split(',')[0]) - 5}, ${parseInt(layer.color.slice(5,-1).split(',')[1]) + 5}, ${parseInt(layer.color.slice(5,-1).split(',')[2]) + 5}, ${parseFloat(layer.color.slice(5,-1).split(',')[3])})`;
                            const h = (Math.random() * 0.2 + 0.1) * layer.height;
                            const w = (Math.random() * 0.4 + 0.2) * C_WIDTH / 4;
                            ctx.beginPath();
                            ctx.moveTo(x, groundY);
                            for (let j=0; j<5; j++) {
                                ctx.lineTo(x + (Math.random() - 0.5) * w, groundY - Math.random() * h);
                            }
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    layer.el.style.backgroundImage = `url(${canvas.toDataURL()})`;
                    layer.el.style.backgroundSize = `${canvas.width}px ${canvas.height}px`;
                }
            });
        }
        function createSunset() {
            // Dust Motes
            const dustContainer = document.getElementById('dust-motes');
            if (dustContainer && dustContainer.children.length === 0) {
                for (let i = 0; i < 50; i++) {
                    let mote = document.createElement('div');
                    mote.className = 'dust-mote';
                    const size = Math.random() * 2 + 1;
                    mote.style.width = `${size}px`;
                    mote.style.height = `${size}px`;
                    mote.style.setProperty('--x-start', `${Math.random() * 100}vw`);
                    mote.style.setProperty('--y-start', `${Math.random() * 100}vh`);
                    mote.style.setProperty('--x-end', `${Math.random() * 100}vw`);
                    mote.style.setProperty('--y-end', `${Math.random() * 100}vh`);
                    mote.style.animationDelay = `-${Math.random() * 15}s`;
                    dustContainer.appendChild(mote);
                }
            }
        }
        function createParticles() {
            const containers = {
                stars: { count: 100, el: 'stars' }, fireflies: { count: 20, el: 'fireflies' },
                bubbles: { count: 30, el: 'bubbles' },
                petals: { count: 25, el: 'petals' },
                forestSpirits: { count: 10, el: 'forest-spirits' }
            };

            for (const key in containers) {
                const container = document.getElementById(containers[key].el);
                if (container && container.children.length === 0) {
                    for (let i = 0; i < containers[key].count; i++) {
                        let el = document.createElement('div');
                        switch(key) {
                            case 'stars': el.className = 'star'; el.style.width = `${Math.random()*2+1}px`; el.style.height=el.style.width; el.style.left = `${Math.random()*100}%`; el.style.top = `${Math.random()*100}%`; el.style.animationDelay = `${Math.random()*5}s`; break;
                            case 'fireflies': el.className = 'firefly'; el.style.setProperty('--x-start', `${Math.random() * 100}vw`); el.style.setProperty('--y-start', `${Math.random() * 100}vh`); el.style.setProperty('--x-end', `${Math.random() * 100}vw`); el.style.setProperty('--y-end', `${Math.random() * 100}vh`); el.style.animationDelay = `${Math.random() * 15}s`; break;
                            case 'bubbles': el.className = 'bubble'; const size = Math.random()*15+5; el.style.width=`${size}px`; el.style.height=`${size}px`; el.style.left=`${Math.random()*100}%`; el.style.animationDuration=`${Math.random()*10+10}s`; el.style.animationDelay=`${Math.random()*15}s`; el.style.setProperty('--x-drift', `${Math.random()*4-2}vw`); el.style.setProperty('--x-drift-end', `${Math.random()*4-2}vw`); break;
                            case 'clouds': el.className='cloud'; el.style.top=`${Math.random()*40+5}%`; el.style.transform=`scale(${Math.random()*0.5+0.5})`; el.style.animationDuration=`${Math.random()*40+30}s`; el.style.animationDelay=`${Math.random()*30}s`; break;
                            case 'petals': el.className='petal'; el.style.left=`${Math.random()*100}%`; el.style.setProperty('--r-start', `${Math.random()*360}deg`); el.style.setProperty('--r-end', `${Math.random()*720-360}deg`); el.style.setProperty('--x-drift', `${Math.random()*40-20}vw`); el.style.animationDelay = `${Math.random()*12}s`; break;
                            case 'snowflakes': el.className = 'snowflake'; el.textContent = '❄'; const snowSize = Math.random() * 0.8 + 0.4; el.style.fontSize = `${snowSize}rem`; el.style.left = `${Math.random()*100}%`; el.style.animationDuration=`${Math.random()*10+8}s`; el.style.animationDelay=`${Math.random()*10}s`; el.style.setProperty('--x-drift', `${Math.random()*6-3}vw`); el.style.setProperty('--r-end', `${Math.random()*360-180}deg`); break;
                            case 'leaves': el.className = 'leaf'; const leafColor = ['#c84c0f', '#e67e22', '#f1c40f'][Math.floor(Math.random() * 3)]; el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 0 C0 5, 5 15, 10 20 C15 15, 20 5, 10 0 Z" fill="${encodeURIComponent(leafColor)}"/></svg>')`; el.style.left=`${Math.random()*100}%`; el.style.animationDuration=`${Math.random()*8+7}s`; el.style.animationDelay=`${Math.random()*10}s`; el.style.setProperty('--x-drift', `${Math.random()*20-10}vw`); el.style.setProperty('--r-end', `${Math.random()*1080-540}deg`); break;
                            case 'sunRays': el.className = 'sun-ray'; el.style.height = `${Math.random()*400+300}px`; el.style.width = `${Math.random()*30+20}px`; el.style.top = '0'; el.style.left = `${Math.random()*100-25}%`; el.style.setProperty('--r-start', `${Math.random()*10-5}deg`); el.style.setProperty('--r-end', `${Math.random()*10-5}deg`); el.style.animationDelay = `${Math.random()*5}s`; break;
                            case 'sparkles': el.className = 'sparkle'; el.style.left = `${Math.random()*100}%`; el.style.top = `${Math.random()*100}%`; el.style.animationDelay = `${Math.random()*2}s`; break;
                            case 'sprouts': el.className = 'sprout'; el.style.left = `${Math.random()*100}%`; el.style.bottom = `${Math.random()* -20}px`; el.style.animationDuration = `${Math.random()*8+6}s`; el.style.animationDelay = `${Math.random()*14}s`; el.style.setProperty('--r-end', `${Math.random()*180-90}deg`); break;
                            case 'raindrops': el.className = 'raindrop'; el.style.left = `${Math.random()*100}%`; el.style.height = `${Math.random()*50+50}px`; el.style.width = `${Math.random() * 1.5 + 1}px`; el.style.animationDuration = `${Math.random()*0.5+0.3}s`; el.style.animationDelay = `${Math.random()*5}s`; el.style.setProperty('--x-drift-rain', `${Math.random() * 10 - 5}vw`); break;
                            case 'koi': el.className = 'koi'; ['--x1','--y1','--x2','--y2','--x3','--y3','--x4','--y4', '--x5', '--y5', '--x6', '--y6', '--x7', '--y7', '--x8', '--y8'].forEach(v => el.style.setProperty(v, `${Math.random()*80+10}vw`)); ['--r1','--r2','--r3','--r4', '--r5', '--r6', '--r7', '--r8'].forEach(v => el.style.setProperty(v, `${Math.random()*360}deg`)); el.style.animationDelay = `${Math.random()*35}s`; break;
                            case 'pollen': el.className = 'pollen'; el.style.left = `${Math.random()*100}%`; el.style.top = `${Math.random()*100}%`; el.style.setProperty('--x', `${Math.random()*100-50}px`); el.style.setProperty('--y', `${Math.random()*100-50}px`); el.style.animationDelay = `${Math.random()*8}s`; break;
                            case 'butterflies': el.className = 'butterfly'; ['--x1','--y1','--x2','--y2','--x3','--y3','--x4','--y4', '--x5', '--y5', '--x6', '--y6', '--x7', '--y7', '--x8', '--y8'].forEach(v => el.style.setProperty(v, `${Math.random()*80+10}vw`)); el.style.animationDelay = `${Math.random()*15}s`; break;
                            case 'galaxyStars': el.className = 'galaxy-star'; el.style.width = `${Math.random()*2+1}px`; el.style.height=el.style.width; el.style.left = `${Math.random()*100}%`; el.style.top = `${Math.random()*100}%`; el.style.animationDelay = `${Math.random()*8}s`; break;
                            case 'chimes': el.className = 'chime'; el.style.left = `${Math.random() * 95}%`; el.style.top = `${Math.random() * 30 + 35}%`; el.style.transform = `rotate(${Math.random() * 20 - 10}deg) scaleY(${Math.random() * 0.3 + 0.8})`; el.style.animationDelay = `${Math.random() * 10}s`; break;
                            case 'ripples': el.className = 'ripple'; el.style.left = '50%'; el.style.top = '50%'; el.style.transform = 'translate(-50%, -50%)'; el.style.animationDelay = `${i * 1.6}s`; break;
                            case 'starlights': el.className = 'starlight'; const starlightSize = Math.random() * 2.5 + 1; el.style.width = `${starlightSize}px`; el.style.height = `${starlightSize}px`; el.style.left = `${Math.random() * 100}%`; el.style.top = `${Math.random() * 100}%`; el.style.animationDelay = `${Math.random() * 6}s`; break;
                            case 'forestSpirits': el.className = 'forest-spirit'; el.style.setProperty('--x-start', `${Math.random() * 80 + 10}vw`); el.style.setProperty('--y-start', `${Math.random() * 30 + 60}vh`); el.style.setProperty('--x-end', `${Math.random() * 80 + 10}vw`); el.style.setProperty('--y-end', `${Math.random() * 30 + 30}vh`); el.style.animationDelay = `${Math.random() * 25}s`; break;
                        }
                        container.appendChild(el);
                    }
                }
            }
        }

        function setBackground(themeName) {
            if (activeThemeAnimationId) {
                cancelAnimationFrame(activeThemeAnimationId);
                activeThemeAnimationId = null;
            }
            // Stop any running JS-based animations from the previous theme
            if (activeTheme === 'forest' && typeof stopForestAnimations === 'function') {
                stopForestAnimations();
            }

            if (!THEMES.includes(themeName) || activeTheme === themeName) return;
            activeTheme = themeName;
            document.querySelectorAll('.theme-container').forEach(el => {
                if (el.id === `${themeName}-theme`) {
                    el.classList.add('active');
                    if (themeName === 'swedish-forest') {
                        createSwedishForest();
                    }
                    if (themeName === 'ocean') {
                        createDeepOcean();
                    }
                    if (themeName === 'sunset') {
                        createSunset();
                    }
                    if (themeName === 'mountain') {
                        createMountainScene();
                    }
                    if (themeName === 'zen') {
                        createZenScene();
                    }
                    if (themeName === 'forest') {
                        createEnchantedForest();
                        if (typeof startForestAnimations === 'function') {
                            startForestAnimations();
                        }
                    }
                    if (themeName === 'winter') {
                        createWinterScene();
                    }
                    if (themeName === 'fall') {
                        createAutumnScene();
                    }
                    if (themeName === 'summer') {
                        createSummerScene();
                    }
                    if (themeName === 'spring') {
                        createSpringScene();
                    }
                    if (themeName === 'aurora') {
                        createAuroraScene();
                    }
                    if (themeName === 'galaxy') {
                        createGalaxyScene();
                    }
                    if (themeName === 'rainy-window') {
                        createRainyWindow();
                    }
                    if (themeName === 'koi-pond') {
                        createKoiPondScene();
                    }
                    if (themeName === 'meadow') {
                        createMeadowScene();
                    }
                    if (themeName === 'cosmic-chimes') {
                        createCosmicChimesScene();
                    }
                    if (themeName === 'singing-bowl') {
                        createSingingBowlScene();
                    }
                    if (themeName === 'starlight') {
                        createStarlightScene();
                    }
                    if (themeName === 'geode') {
                        createGeodeScene();
                    }
                    if (themeName === 'bioluminescence') {
                        createBioluminescenceScene();
                    }
                    if (themeName === 'desert-oasis') {
                        createDesertOasisScene();
                    }
                    if (themeName === 'bamboo-grove') {
                        createBambooGroveScene();
                    }
                } else {
                    el.classList.remove('active');
                }
            });
        }

        function createDesertOasisScene() {
            // 1. Twinkling Stars
            const starsContainer = document.getElementById('desert-stars');
            if (starsContainer && starsContainer.children.length === 0) {
                for (let i = 0; i < 150; i++) {
                    let star = document.createElement('div');
                    star.className = 'desert-star';
                    const size = Math.random() * 1.5 + 0.5;
                    star.style.width = `${size}px`;
                    star.style.height = `${size}px`;
                    star.style.left = `${Math.random() * 100}%`;
                    star.style.top = `${Math.random() * 60}%`; // Only in the upper part of the sky
                    star.style.animationDelay = `-${Math.random() * 10}s`;
                    starsContainer.appendChild(star);
                }
            }

            // 2. Drifting Sand Particles
            const sandContainer = document.getElementById('desert-sand-particles');
            if (sandContainer && sandContainer.children.length === 0) {
                for (let i = 0; i < 80; i++) {
                    let particle = document.createElement('div');
                    particle.className = 'sand-particle';
                    particle.style.setProperty('--x-start', `${Math.random() * 100}vw`);
                    particle.style.setProperty('--y-start', `${Math.random() * 100}vh`);
                    particle.style.setProperty('--x-end', `${Math.random() * 100}vw`);
                    particle.style.setProperty('--y-end', `${Math.random() * 100}vh`);
                    const duration = Math.random() * 20 + 15;
                    particle.style.animationDuration = `${duration}s`;
                    particle.style.animationDelay = `-${Math.random() * duration}s`;
                    sandContainer.appendChild(particle);
                }
            }

            // 3. Desert Fauna
            const faunaContainer = document.getElementById('desert-fauna');
            if (faunaContainer && faunaContainer.children.length === 0) {
                // Lizards
                for (let i = 0; i < 2; i++) {
                    let lizard = document.createElement('div');
                    lizard.className = 'desert-lizard';
                    lizard.style.left = `${10 + Math.random() * 80}%`;
                    lizard.style.animationDelay = `-${Math.random() * 30}s`;
                    faunaContainer.appendChild(lizard);
                }
                // Moths
                for (let i = 0; i < 7; i++) {
                    let moth = document.createElement('div');
                    moth.className = 'desert-moth';
                    moth.style.setProperty('--x-start', `${Math.random() * 100}vw`);
                    moth.style.setProperty('--y-start', `${Math.random() * 100}vh`);
                    moth.style.setProperty('--x-end', `${Math.random() * 100}vw`);
                    moth.style.setProperty('--y-end', `${Math.random() * 100}vh`);
                    moth.style.animationDelay = `-${Math.random() * 20}s`;
                    faunaContainer.appendChild(moth);
                }
            }

            // 4. Desert Flora (procedurally drawn cacti and palms)
            const floraContainer = document.getElementById('desert-flora');
            if (floraContainer && floraContainer.children.length === 0) {
                 for (let i = 0; i < 8; i++) { // Cacti
                    let cactus = document.createElement('div');
                    cactus.className = 'cactus';
                    cactus.style.left = `${5 + Math.random() * 90}%`;
                    cactus.style.bottom = `${Math.random() * 10}%`;
                    cactus.style.height = `${Math.random() * 40 + 30}px`;
                    floraContainer.appendChild(cactus);
                 }
                for (let i = 0; i < 5; i++) { // Desert Flowers
                    let flower = document.createElement('div');
                    flower.className = 'desert-flower';
                    flower.style.left = `${5 + Math.random() * 90}%`;
                    flower.style.bottom = `${Math.random() * 5}%`;
                    flower.style.animationDelay = `-${Math.random() * 15}s`;
                    floraContainer.appendChild(flower);
                }
                 for (let i = 0; i < 3; i++) { // Palm trees in the oasis area
                    let palm = document.createElement('div');
                    palm.className = 'palm-tree';
                    palm.style.left = `${40 + Math.random() * 20}%`; // Centered for oasis
                    palm.style.bottom = `${5 + Math.random() * 10}%`;
                    palm.style.height = `${Math.random() * 60 + 80}px`;
                    floraContainer.appendChild(palm);
                 }
            }
        }

        function createBambooGroveScene() {
            // 1. Sun Dapples
            const dappleContainer = document.getElementById('bamboo-sun-dapples');
            if (dappleContainer && dappleContainer.children.length === 0) {
                for (let i = 0; i < 30; i++) {
                    let dapple = document.createElement('div');
                    dapple.className = 'sun-dapple';
                    dapple.style.left = `${Math.random() * 100}%`;
                    dapple.style.top = `${Math.random() * 100}%`;
                    const size = Math.random() * 100 + 50;
                    dapple.style.width = `${size}px`;
                    dapple.style.height = `${size}px`;
                    dapple.style.animationDelay = `-${Math.random() * 15}s`;
                    dappleContainer.appendChild(dapple);
                }
            }

            // 2. Falling Leaves
            const leafContainer = document.getElementById('bamboo-leaves');
            if (leafContainer && leafContainer.children.length === 0) {
                for (let i = 0; i < 20; i++) {
                    let leaf = document.createElement('div');
                    leaf.className = 'bamboo-leaf';
                    leaf.style.left = `${Math.random() * 100}%`;
                    leaf.style.setProperty('--r-end', `${Math.random() * 720 - 360}deg`);
                    leaf.style.setProperty('--x-drift', `${Math.random() * 10 - 5}vw`);
                    const duration = Math.random() * 8 + 10;
                    leaf.style.animationDuration = `${duration}s`;
                    leaf.style.animationDelay = `-${Math.random() * duration}s`;
                    leafContainer.appendChild(leaf);
                }
            }

            // 3. Fauna (Dragonflies)
            const faunaContainer = document.getElementById('bamboo-fauna');
            if (faunaContainer && faunaContainer.children.length === 0) {
                for (let i = 0; i < 5; i++) {
                    let dragonfly = document.createElement('div');
                    dragonfly.className = 'dragonfly';
                    for(let j=1; j<=6; j++){
                        dragonfly.style.setProperty(`--x${j}`, `${Math.random() * 90}vw`);
                        dragonfly.style.setProperty(`--y${j}`, `${Math.random() * 80}vh`);
                    }
                    const duration = Math.random() * 10 + 12;
                    dragonfly.style.animationDuration = `${duration}s`;
                    dragonfly.style.animationDelay = `-${Math.random() * duration}s`;
                    faunaContainer.appendChild(dragonfly);
                }
            }
        }

        function startRandomThemeChanger() {
            stopRandomThemeChanger();
            if (settings.backgroundMode !== 'Random' || isGameOver) return;
            randomThemeInterval = setInterval(() => {
                let newTheme;
                do { newTheme = THEMES[Math.floor(Math.random() * THEMES.length)]; } while (newTheme === activeTheme);
                setBackground(newTheme);
            }, 60000);
        }

        function stopRandomThemeChanger() {
            if (randomThemeInterval) clearInterval(randomThemeInterval);
            randomThemeInterval = null;
        }

        function updateBackground(level) {
            if (settings.backgroundMode !== 'Level') return;
            const themeIndex = Math.floor((level - 1) / 2) % THEMES.length;
            setBackground(THEMES[themeIndex]);
        }

        function initSound() { soundManager.init(); soundManager.startBackgroundMusic(); }

        function resetGame() {
            lockedPieces = []; currentPiece = null; nextPieces = [];
            score = 0; lines = 0; level = 1; linesUntilNextLevel = 10;
            dropInterval = LEVEL_SPEEDS[0]; dropCounter = 0; piecesPlaced = 0;
            isGameOver = false; isProcessingPhysics = false; inputQueue = null;
            startTime = Date.now(); fillBag(); updateStats(); spawnPiece();
            stopRandomThemeChanger();
            if (settings.backgroundMode === 'Specific') {
                setBackground(settings.backgroundTheme);
            } else {
                setBackground('forest');
            }
        }
        function fillBag() { while(nextPieces.length<10) { const bag=[...PIECE_KEYS].sort(()=>Math.random()-0.5); nextPieces.push(...bag); } }
        function spawnPiece() {
            const shapeKey = nextPieces.shift();
            currentPiece = { shapeKey, shape: SHAPES[shapeKey], x: ~~(COLS/2)-~~(SHAPES[shapeKey][0].length/2), y: 0, color: COLORS[shapeKey] };
            fillBag(); drawNextPieces(); piecesPlaced++;
            if (inputQueue) { const a=inputQueue; inputQueue=null; setTimeout(() => { if (a.type==='move') move(a.dir); else if (a.type==='rotate') rotate(a.dir); }, 0); }
            if (!isValidPosition(currentPiece)) gameOver();
        }
        function generateBoard(pieces) {
            const b = Array.from({length:ROWS+HIDDEN_ROWS},()=>Array(COLS).fill(0));
            for (const p of pieces) { p.shape.forEach((r,y)=>r.forEach((v,x) => { if(v>0){ const bx=p.x+x, by=p.y+y; if(by>=0&&by<b.length&&bx>=0&&bx<COLS) b[by][bx]=p.shapeKey; } })); } return b;
        }
        function isValidPosition(p, cX=p.x, cY=p.y) {
            const boardData = generateBoard(lockedPieces);
            for (let y=0; y<p.shape.length; y++) for (let x=0; x<p.shape[y].length; x++) if (p.shape[y][x]>0) { const bx=cX+x, by=cY+y; if (bx<0||bx>=COLS||by>=boardData.length||(boardData[by]&&boardData[by][bx]!==0)) return false; } return true;
        }
        function move(dir) { if(!currentPiece||isProcessingPhysics) return; if(isValidPosition(currentPiece, currentPiece.x+dir, currentPiece.y)) { currentPiece.x+=dir; soundManager.playMove(); } }
        function rotate(dir='right') {
            if (!currentPiece||isProcessingPhysics) return; const o=currentPiece.shape;
            let r; if (dir==='right') r=o[0].map((_,i)=>o.map(row=>row[i]).reverse()); else if(dir==='left') r=o[0].map((_,i)=>o.map(row=>row[i])).reverse(); else r=o.map(row=>row.slice().reverse()).reverse();
            currentPiece.shape=r; for(const k of [0,1,-1,2,-2]) { if(isValidPosition(currentPiece, currentPiece.x+k, currentPiece.y)) { currentPiece.x+=k; soundManager.playRotate(); return; } } currentPiece.shape=o;
        }
        function softDrop() { if(!currentPiece||isProcessingPhysics) return; if(isValidPosition(currentPiece, currentPiece.x, currentPiece.y+1)) { currentPiece.y++; score+=level; dropCounter=0; } else lockPiece(); }
        function hardDrop() { if(!currentPiece||isProcessingPhysics) return; let d=0; while(isValidPosition(currentPiece,currentPiece.x,currentPiece.y+1)){currentPiece.y++;d++;} score+=d*2*level; lockPiece(); }
        function lockPiece() { if(!currentPiece) return; soundManager.playDrop(); lockedPieces.push({...currentPiece, shape:[...currentPiece.shape]}); currentPiece=null; dropCounter=0; processPhysics(); }
        async function processPhysics() {
            isProcessingPhysics=true; let loopActive=true;
            while(loopActive) {
                loopActive = false; const boardData = generateBoard(lockedPieces); const fullLines = [];
                for(let y=boardData.length-1;y>=0;y--) if(boardData[y].every(c=>c!==0)) fullLines.push(y);
                if(fullLines.length>0) {
                    loopActive=true; const oldLevel=level; lines+=fullLines.length; linesUntilNextLevel-=fullLines.length;
                    if(linesUntilNextLevel<=0){ level++; linesUntilNextLevel=10+linesUntilNextLevel; dropInterval=LEVEL_SPEEDS[Math.min(level-1, LEVEL_SPEEDS.length-1)]; soundManager.playLevelUp(); showLevelUpNotification(level); }
                    if(oldLevel!==level) updateBackground(level);
                    score+=(SCORE_VALUES[fullLines.length]||SCORE_VALUES[4])*level; soundManager.playLineClear(); showScorePopup((SCORE_VALUES[fullLines.length]||SCORE_VALUES[4])*level);
                    canvas.classList.add('line-flash'); setTimeout(()=>canvas.classList.remove('line-flash'),500);
                    fullLines.forEach(y=>{ for(let x=0;x<COLS;x++)boardData[y][x]='C'; }); board=boardData; draw(); await sleep(200);
                    let newBoard=boardData.filter((_,y)=>!fullLines.includes(y)); while(newBoard.length<ROWS+HIDDEN_ROWS)newBoard.unshift(Array(COLS).fill(0));
                    lockedPieces=findConnectedComponents(newBoard); continue;
                }
                let pieceFell = false;
                for(const p of [...lockedPieces].sort((a,b)=>b.y-a.y)) {
                    const others=lockedPieces.filter(op=>op!==p);
                    while(canFall(p, others)) { p.y++; pieceFell=true; draw(); await sleep(40); }
                }
                if(pieceFell) loopActive=true;
            }
            isProcessingPhysics=false; updateStats(); spawnPiece();
        }
        function canFall(p, others) {
            const boardData=generateBoard(others);
            for(let y=0;y<p.shape.length;y++) for(let x=0;x<p.shape[y].length;x++) if(p.shape[y][x]>0) { const by=p.y+y+1, bx=p.x+x; if(by>=boardData.length||boardData[by][bx]!==0)return false;} return true;
        }
        function findConnectedComponents(boardData) {
            const pieces=[], visited=Array.from({length:boardData.length},()=>Array(boardData[0].length).fill(false));
            for(let r=0;r<boardData.length;r++) for(let c=0;c<boardData[0].length;c++) {
                if(boardData[r][c]!==0&&!visited[r][c]) {
                    const shapeKey=boardData[r][c], component=[], queue=[[r,c]]; visited[r][c]=true;
                    let minR=r,maxR=r,minC=c,maxC=c;
                    while(queue.length>0) {
                        const [row,col]=queue.shift(); component.push({r:row,c:col});
                        minR=Math.min(minR,row); maxR=Math.max(maxR,row); minC=Math.min(minC,col); maxC=Math.max(maxC,col);
                        [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{ const nr=row+dr,nc=col+dc; if(nr>=0&&nr<boardData.length&&nc>=0&&nc<boardData[0].length&&!visited[nr][nc]&&boardData[nr][nc]===shapeKey){visited[nr][nc]=true;queue.push([nr,nc]);}});
                    }
                    const shape=Array.from({length:maxR-minR+1},()=>Array(maxC-minC+1).fill(0));
                    component.forEach(({r,c})=>{shape[r-minR][c-minC]=1});
                    pieces.push({x:minC, y:minR, shape, shapeKey, color:COLORS[shapeKey]});
                }
            }
            return pieces;
        }
        function draw() {
            if (level>=10) { canvas.style.borderColor = '#ef4444'; canvas.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.4)';}
            else if (level>=5) { canvas.style.borderColor = '#fbbf24'; canvas.style.boxShadow = '0 0 30px rgba(251, 191, 36, 0.6), 0 0 60px rgba(251, 191, 36, 0.4)';}
            else { canvas.style.borderColor = '#8b5cf6'; canvas.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)';}
            ctx.clearRect(0,0,canvas.width,canvas.height); ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1;
            for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*BLOCK_SIZE,0);ctx.lineTo(x*BLOCK_SIZE,canvas.height);ctx.stroke();}
            for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*BLOCK_SIZE);ctx.lineTo(canvas.width,y*BLOCK_SIZE);ctx.stroke();}
            const boardData=generateBoard(lockedPieces);
            boardData.forEach((row,y)=>{ if(y<HIDDEN_ROWS)return; row.forEach((c,x)=>{ if(c!==0&&c!=='C')drawBlock(x,y-HIDDEN_ROWS,COLORS[c]); else if(c==='C')drawBlock(x,y-HIDDEN_ROWS,'#ffffff');});});
            if(currentPiece) {
                let ghostY=currentPiece.y; while(isValidPosition(currentPiece,currentPiece.x,ghostY+1))ghostY++;
                currentPiece.shape.forEach((r,y)=>r.forEach((c,x)=>{ if(c>0&&ghostY+y>=HIDDEN_ROWS)drawBlock(currentPiece.x+x,ghostY+y-HIDDEN_ROWS,'rgba(255,255,255,0.2)',true); if(c>0&&currentPiece.y+y>=HIDDEN_ROWS)drawBlock(currentPiece.x+x,currentPiece.y+y-HIDDEN_ROWS,currentPiece.color);}));
            }
        }
        function drawBlock(x,y,c,isGhost=false) {
            ctx.fillStyle=c; ctx.fillRect(x*BLOCK_SIZE,y*BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
            if(!isGhost){
                const highlightSize = Math.max(1, BLOCK_SIZE / 5);
                const highlightOffset = Math.max(1, BLOCK_SIZE / 15);
                ctx.fillStyle='rgba(255,255,255,0.3)';
                ctx.fillRect(x*BLOCK_SIZE+highlightOffset,y*BLOCK_SIZE+highlightOffset,highlightSize,highlightSize);

                const borderOffset = Math.max(0.5, BLOCK_SIZE / 30);
                ctx.strokeStyle='rgba(0,0,0,0.5)';
                ctx.lineWidth= Math.max(1, BLOCK_SIZE / 15);
                ctx.strokeRect(x*BLOCK_SIZE+borderOffset,y*BLOCK_SIZE+borderOffset,BLOCK_SIZE-(2*borderOffset),BLOCK_SIZE-(2*borderOffset));
            }
        }
        function drawNextPieces() {
            nextCanvases.forEach((canv,idx)=>{
                const ctx2=canv.getContext('2d'); ctx2.clearRect(0,0,canv.width,canv.height);
                if(nextPieces[idx]){
                    const s=SHAPES[nextPieces[idx]], c=COLORS[nextPieces[idx]], bs = BLOCK_SIZE * (idx === 0 ? 0.4 : 0.33), ox=(canv.width-s[0].length*bs)/2, oy=(canv.height-s.length*bs)/2;
                    s.forEach((r,y)=>r.forEach((cell,x)=>{
                        if(cell>0){
                            ctx2.fillStyle=c;
                            ctx2.fillRect(ox+x*bs,oy+y*bs,bs,bs);
                            if(idx===0){
                                const highlightSize = Math.max(1, bs/4);
                                const highlightOffset = Math.max(1, bs/12);
                                ctx2.fillStyle='rgba(255,255,255,0.3)';
                                ctx2.fillRect(ox+x*bs+highlightOffset,oy+y*bs+highlightOffset,highlightSize,highlightSize);
                            }
                            ctx2.strokeStyle='rgba(0,0,0,0.5)';
                            ctx2.lineWidth=Math.max(0.5, bs/12);
                            ctx2.strokeRect(ox+x*bs,oy+y*bs,bs,bs);
                        }
                    }));
                }
            });
        }
        function updateStats() {
            document.getElementById('score').textContent=score; document.getElementById('lines').textContent=lines;
            const lvlEl=document.getElementById('level'); lvlEl.textContent=level; lvlEl.className='stat-value'; if(level>=10)lvlEl.classList.add('danger');else if(level>=5)lvlEl.classList.add('warning');
            document.getElementById('next-level').textContent=linesUntilNextLevel;
            const baseSpd=LEVEL_SPEEDS[0], currSpd=LEVEL_SPEEDS[Math.min(level-1, LEVEL_SPEEDS.length-1)], spdMult=(baseSpd/currSpd).toFixed(1);
            const spdEl=document.getElementById('speed'); spdEl.textContent=`${spdMult}x`; spdEl.className='stat-value'; if(parseFloat(spdMult)>=20)spdEl.classList.add('danger');else if(parseFloat(spdMult)>=5)spdEl.classList.add('warning');
            const elapsed=(Date.now()-startTime)/60000; document.getElementById('bpm').textContent=elapsed>0?~~(piecesPlaced*4/elapsed):0;
        }
        function showScorePopup(p) { const el=document.createElement('div'); el.className='score-popup'; el.textContent=`+${p}`; el.style.left='50%';el.style.top='50%'; const c=document.getElementById('score-popups');c.appendChild(el); setTimeout(()=>c.removeChild(el),1000); }
        function showLevelUpNotification(lvl) {
            const n=document.createElement('div'); n.style.cssText=`position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);font-family:'Orbitron',sans-serif;font-size:32px;font-weight:900;color:#fbbf24;text-shadow:0 0 20px rgba(251,191,36,0.8);animation:levelUp 1.5s ease-out forwards;pointer-events:none;z-index:100;`;
            n.textContent=`LEVEL ${lvl}!`; const s=document.createElement('style'); s.textContent=`@keyframes levelUp{0%{transform:translate(-50%,-50%) scale(0.5);opacity:0;}50%{transform:translate(-50%,-50%) scale(1.2);opacity:1;}100%{transform:translate(-50%,-200%) scale(1);opacity:0;}}`;
            document.head.appendChild(s); const c=document.getElementById('score-popups');c.appendChild(n); setTimeout(()=>{c.removeChild(n);document.head.removeChild(s);},1500);
        }
        function gameLoop(time) {
            if(isGameOver)return; const delta=time-lastTime; lastTime=time;
            if(!isProcessingPhysics&&currentPiece){ dropCounter+=delta; if(dropCounter>dropInterval)softDrop(); }
            draw(); updateStats(); animationId=requestAnimationFrame(gameLoop);
        }
        function startGame() {
            document.getElementById('start-modal').classList.remove('visible');
            document.getElementById('game-over-modal').classList.remove('visible');
            resetGame();
            lastTime = performance.now();
            if (animationId) cancelAnimationFrame(animationId);
            if (settings.backgroundMode === 'Random') {
                startRandomThemeChanger();
            }
            animationId = requestAnimationFrame(gameLoop);
        }
        function gameOver() {
            isGameOver = true;
            stopRandomThemeChanger();
            soundManager.playGameOver();
            const speedMultiplier=(LEVEL_SPEEDS[0]/dropInterval).toFixed(1);
            document.getElementById('final-stats').innerHTML=`<div style="font-size:24px;margin-bottom:10px;color:#fbbf24;">Score: ${score}</div><div style="margin-bottom:5px;">Level ${level} (${speedMultiplier}x speed)</div><div>Lines Cleared: ${lines}</div>`;
            document.getElementById('game-over-modal').classList.add('visible');
        }
        function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
        function toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
            }
        }
        function setupUI(){
            const sm=document.getElementById('settings-modal');
            document.getElementById('settings-btn').addEventListener('click',()=>sm.classList.add('visible'));
            document.getElementById('close-settings').addEventListener('click',()=>sm.classList.remove('visible'));
            document.getElementById('fullscreen-toggle').addEventListener('click', toggleFullScreen);
            document.getElementById('next-track-btn').addEventListener('click', () => soundManager.nextTrack());
            const ds=document.getElementById('das-delay'),dv=document.getElementById('das-delay-value'),is=document.getElementById('das-interval'),iv=document.getElementById('das-interval-value');
            ds.value=settings.dasDelay;dv.textContent=settings.dasDelay; is.value=settings.dasInterval;iv.textContent=settings.dasInterval;
            ds.addEventListener('input',(e)=>{settings.dasDelay=parseInt(e.target.value);dv.textContent=settings.dasDelay;saveSettings();});
            is.addEventListener('input',(e)=>{settings.dasInterval=parseInt(e.target.value);iv.textContent=settings.dasInterval;saveSettings();});
            const mt=document.getElementById('music-track');
            mt.value=settings.musicTrack;
            mt.addEventListener('change',(e)=>{settings.musicTrack=e.target.value;soundManager.setTrack(settings.musicTrack);saveSettings();});
            const st=document.getElementById('sfx-set');
            st.value=settings.soundSet;
            st.addEventListener('change',(e)=>{settings.soundSet=e.target.value;soundManager.setSoundSet(settings.soundSet);saveSettings();});

            const bgModeSelect = document.getElementById('background-mode');
            const themeSetting = document.getElementById('theme-setting');
            const bgThemeSelect = document.getElementById('background-theme');

            function setThemeSelectorVisibility(visible) {
                themeSetting.style.display = visible ? 'contents' : 'none';
            }

            bgModeSelect.value = settings.backgroundMode;
            bgThemeSelect.value = settings.backgroundTheme;
            setThemeSelectorVisibility(settings.backgroundMode === 'Specific');

            bgModeSelect.addEventListener('change', (e) => {
                settings.backgroundMode = e.target.value;
                stopRandomThemeChanger();
                if (settings.backgroundMode === 'Specific') {
                    setThemeSelectorVisibility(true);
                    setBackground(settings.backgroundTheme);
                } else {
                    setThemeSelectorVisibility(false);
                    if (settings.backgroundMode === 'Random' && !isGameOver) {
                        startRandomThemeChanger();
                    } else { // Level mode
                        updateBackground(level);
                    }
                }
                saveSettings();
            });

            bgThemeSelect.addEventListener('change', (e) => {
                settings.backgroundTheme = e.target.value;
                if (settings.backgroundMode === 'Specific') {
                    setBackground(settings.backgroundTheme);
                }
                saveSettings();
            });

            const cs = document.getElementById('control-scheme');
            cs.value = settings.controlScheme;
            cs.addEventListener('change', (e) => {
                settings.controlScheme = e.target.value;
                saveSettings();
                updateControlsDisplay();
            });

            document.querySelectorAll('.key-input').forEach(el=>{ const a=el.id.substring(4);el.textContent=settings.keyBindings[a];el.addEventListener('click',()=>listenForKey(el));el.addEventListener('keydown',(e)=>handleKeybinding(e,el)); });
            updateControlsDisplay();
        }
        function listenForKey(el) { document.querySelectorAll('.key-input').forEach(e=>e.classList.remove('listening')); el.classList.add('listening'); el.textContent='Press a key...'; }
        function handleKeybinding(e,el){ e.preventDefault(); const a=el.id.substring(4), k=e.key===' '?'Space':e.key; if(Object.values(settings.keyBindings).includes(k)&&settings.keyBindings[a]!==k){ el.textContent=settings.keyBindings[a];el.classList.remove('listening');return; } settings.keyBindings[a]=k; el.textContent=k; el.classList.remove('listening'); saveSettings(); updateControlsDisplay(); }
        function saveSettings(){localStorage.setItem('quadraSettings',JSON.stringify(settings));}
        function loadSettings(){ const s=localStorage.getItem('quadraSettings'); if(s){ const l=JSON.parse(s); settings={...settings,...l}; settings.keyBindings={...settings.keyBindings,...l.keyBindings};} soundManager.musicTrack=settings.musicTrack; soundManager.soundSet=settings.soundSet; }
        function updateControlsDisplay() {
            const l = document.getElementById('controls-list');
            l.innerHTML = '';
            const o = ['moveLeft', 'moveRight', 'rotateRight', 'rotateLeft', 'flip', 'softDrop', 'hardDrop', 'toggleMusic'];
            if (settings.controlScheme === 'Keyboard') {
                document.querySelectorAll('.key-input').forEach(el => el.parentElement.style.display = 'contents');
                o.forEach(a => {
                    if (settings.keyBindings[a]) {
                        const t = a.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                        l.innerHTML += `<div>${t}: ${settings.keyBindings[a]}</div>`;
                    }
                });
            } else {
                 document.querySelectorAll('.key-input').forEach(el => el.parentElement.style.display = 'none');
                 l.innerHTML = '<div>Swipe to move</div><div>Tap to rotate</div><div>Flick down to drop</div>';
            }
        }

        function handleTouchStart(e) {
            if (settings.controlScheme !== 'Touch') return;
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('key-input') || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchLastX = touch.clientX;
            touchLastY = touch.clientY;
            touchStartTime = Date.now();
        }

        function handleTouchMove(e) {
            if (!touchStartX || settings.controlScheme !== 'Touch') return;
            e.preventDefault();

            const touch = e.touches[0];
            const deltaX = touch.clientX - touchLastX;
            const deltaY = touch.clientY - touchLastY;

            const moveThreshold = BLOCK_SIZE;
            const softDropThreshold = BLOCK_SIZE / 2;

            // Horizontal movement check
            if (Math.abs(deltaX) > moveThreshold) {
                move(deltaX > 0 ? 1 : -1);
                touchLastX = touch.clientX;
            }

            // Vertical movement check
            if (deltaY > softDropThreshold) {
                softDrop();
                touchLastY = touch.clientY;
            }
        }

        function handleTouchEnd(e) {
            if (!touchStartX || settings.controlScheme !== 'Touch') return;
            e.preventDefault();

            if (document.getElementById('start-modal').classList.contains('visible') || document.getElementById('game-over-modal').classList.contains('visible')) {
                startGame();
                touchStartX = null; touchStartY = null; touchStartTime = null; lastTap = 0; touchLastX = null; touchLastY = null;
                return;
            }

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const deltaTime = Date.now() - touchStartTime;

            const tapThreshold = 25;
            const flickTime = 300;
            const flickDistY = 60;

            // It's a tap if the finger moved less than the threshold and the touch was short
            if (deltaTime < flickTime && Math.abs(deltaX) < tapThreshold && Math.abs(deltaY) < tapThreshold) {
                const canvasRect = canvas.getBoundingClientRect();
                const touchXonCanvas = touch.clientX - canvasRect.left;
                if (touchXonCanvas < canvas.width / 2) {
                    rotate('left');
                } else {
                    rotate('right');
                }
            }
            // It's a flick if the touch was short and moved a significant distance
            else if (deltaTime < flickTime) {
                // Vertical flick for hard drop
                if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > flickDistY) {
                    hardDrop();
                }
            }

            touchStartX = null;
            touchStartY = null;
            touchStartTime = null;
            touchLastX = null;
            touchLastY = null;
        }

        let keyMap={};
        document.addEventListener('keydown',(e)=>{
            if(document.activeElement.classList.contains('key-input'))return;
            if(document.getElementById('start-modal').classList.contains('visible')||document.getElementById('game-over-modal').classList.contains('visible')){startGame();return;}
            if(isGameOver)return; const k=e.key===' '?'Space':e.key, a=Object.keys(settings.keyBindings).find(key=>settings.keyBindings[key]===k);
            if(!a||keyMap[a])return; keyMap[a]=true;
            if(isProcessingPhysics){ if(!inputQueue&&(a==='moveLeft'||a==='moveRight'||a.startsWith('rotate')||a==='flip')){inputQueue={type:a.startsWith('rotate')||a==='flip'?'rotate':'move',dir:a==='moveLeft'?-1:(a==='moveRight'?1:(a==='rotateLeft'?'left':(a==='flip'?'flip':'right')))};}return;}
            switch(a){
                case'moveLeft':move(-1);dasTimer=setTimeout(()=>{dasIntervalTimer=setInterval(()=>move(-1),settings.dasInterval);},settings.dasDelay);break;
                case'moveRight':move(1);dasTimer=setTimeout(()=>{dasIntervalTimer=setInterval(()=>move(1),settings.dasInterval);},settings.dasDelay);break;
                case'softDrop':softDrop();break; case'rotateRight':rotate('right');break; case'rotateLeft':rotate('left');break; case'flip':rotate('flip');break;
                case'hardDrop':e.preventDefault();hardDrop();break;
                case'toggleMusic':const m=soundManager.toggleMute();document.getElementById('sound-toggle').textContent=m?'🔇':'🔊';break;
            }
        });
        document.addEventListener('keyup',(e)=>{
            const k=e.key===' '?'Space':e.key, a=Object.keys(settings.keyBindings).find(key=>settings.keyBindings[key]===k);
            if(a)keyMap[a]=false; if(a==='moveLeft'||a==='moveRight'){clearTimeout(dasTimer);clearInterval(dasIntervalTimer);dasIntervalTimer=null;dasIntervalTimer=null;}
        });
        window.addEventListener('load', init);
