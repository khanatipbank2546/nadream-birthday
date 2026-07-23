/* ==========================================================================
   Sound Engine - Badminton Court 3D RPG Audio & Synthesized Lo-Fi Synth
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmTimer = null;
    this.isBGMPlaying = false;
    this.crackleNode = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.isMuted;
  }

  playNote(freq, type = 'sine', duration = 0.3, volume = 0.2, delay = 0) {
    if (this.isMuted || !this.ctx) return;
    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }, delay * 1000);
  }

  // Synthesized Lo-Fi Electric Piano Note (Warm Mellow EP Sound)
  playLoFiChordNote(freq, duration = 1.2, volume = 0.12, delay = 0) {
    if (this.isMuted || !this.ctx) return;
    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Mellow Low-Pass Filter for Lo-Fi warmth
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }, delay * 1000);
  }

  // Vinyl Crackle Background Ambience
  startVinylCrackle() {
    if (this.isMuted || !this.ctx || this.crackleNode) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        if (Math.random() < 0.003) {
          output[i] = (Math.random() * 2 - 1) * 0.3;
        } else {
          output[i] = (Math.random() * 2 - 1) * 0.01;
        }
      }

      this.crackleNode = this.ctx.createBufferSource();
      this.crackleNode.buffer = buffer;
      this.crackleNode.loop = true;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);

      this.crackleNode.connect(gain);
      gain.connect(this.ctx.destination);

      this.crackleNode.start();
    } catch (e) {}
  }

  // Built-in Lo-Fi Chill Hop Music Beat Loop
  startBGM() {
    if (this.isMuted) return;
    this.init();
    if (this.isBGMPlaying) return;
    this.isBGMPlaying = true;

    this.startVinylCrackle();

    // Lo-Fi Jazz Chord Progressions: Cmaj7 -> Am7 -> Dm7 -> G7
    const chords = [
      // Cmaj7 (C4, E4, G4, B4) + Bass C3
      { bass: 130.81, notes: [261.63, 329.63, 392.00, 493.88], delay: 0 },
      // Am7 (A3, C4, E4, G4) + Bass A2
      { bass: 110.00, notes: [220.00, 261.63, 329.63, 392.00], delay: 2.2 },
      // Dm7 (D3, F4, A4, C5) + Bass D3
      { bass: 146.83, notes: [293.66, 349.23, 440.00, 523.25], delay: 4.4 },
      // G7 (G3, B3, D4, F4) + Bass G2
      { bass: 98.00, notes: [196.00, 246.94, 293.66, 349.23], delay: 6.6 }
    ];

    const playLoFiLoop = () => {
      if (!this.isBGMPlaying || this.isMuted) return;

      chords.forEach(c => {
        // Sub-bass note
        this.playLoFiChordNote(c.bass, 2.0, 0.15, c.delay);
        // EP Chord Notes
        c.notes.forEach(n => {
          this.playLoFiChordNote(n, 1.8, 0.08, c.delay + Math.random() * 0.03);
        });
      });

      this.bgmTimer = setTimeout(playLoFiLoop, 8800);
    };

    playLoFiLoop();
  }

  stopBGM() {
    this.isBGMPlaying = false;
    if (this.bgmTimer) clearTimeout(this.bgmTimer);
    if (this.crackleNode) {
      try { this.crackleNode.stop(); } catch (e) {}
      this.crackleNode = null;
    }
  }

  playJump() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {}
  }

  playCalendarTear() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch (e) {}
  }

  playLandingImpact() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  playSecretDoorCutscene() {
    this.init();
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      this.playNote(freq, 'triangle', 0.45, 0.22, idx * 0.1);
    });
  }

  playClick() {
    this.init();
    this.playNote(700, 'triangle', 0.08, 0.15);
  }

  playHappyBirthday() {
    this.init();
    this.stopBGM();

    const song = [
      { f: 261.63, d: 0.3, t: 0.0 },
      { f: 261.63, d: 0.3, t: 0.35 },
      { f: 293.66, d: 0.5, t: 0.7 },
      { f: 261.63, d: 0.5, t: 1.3 },
      { f: 349.23, d: 0.5, t: 1.9 },
      { f: 329.63, d: 0.8, t: 2.5 },

      { f: 261.63, d: 0.3, t: 3.5 },
      { f: 261.63, d: 0.3, t: 3.85 },
      { f: 293.66, d: 0.5, t: 4.2 },
      { f: 261.63, d: 0.5, t: 4.8 },
      { f: 392.00, d: 0.5, t: 5.4 },
      { f: 349.23, d: 0.8, t: 6.0 },

      { f: 261.63, d: 0.3, t: 7.0 },
      { f: 261.63, d: 0.3, t: 7.35 },
      { f: 523.25, d: 0.5, t: 7.7 },
      { f: 440.00, d: 0.5, t: 8.3 },
      { f: 349.23, d: 0.5, t: 8.9 },
      { f: 329.63, d: 0.5, t: 9.5 },
      { f: 293.66, d: 0.8, t: 10.1 },

      { f: 466.16, d: 0.3, t: 11.1 },
      { f: 466.16, d: 0.3, t: 11.45 },
      { f: 440.00, d: 0.5, t: 11.8 },
      { f: 349.23, d: 0.5, t: 12.4 },
      { f: 392.00, d: 0.5, t: 13.0 },
      { f: 349.23, d: 1.2, t: 13.6 }
    ];

    song.forEach(s => {
      this.playNote(s.f, 'triangle', s.d, 0.22, s.t);
    });
  }
}

window.soundEngine = new SoundEngine();
