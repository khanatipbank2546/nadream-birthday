/* ==========================================================================
   Sound Engine - Badminton Court 3D RPG Audio & Synthesized Lo-Fi Synth
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isBGMPlaying = false;
    this.bgmAudio = null;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("AudioContext failed to initialize:", e);
    }

    if (!this.bgmAudio) {
      try {
        this.bgmAudio = new Audio();
        this.bgmAudio.src = "music/newSong.mp4?v=35000.0";
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.3; // Lowered volume as requested
      } catch (err) {
        console.error("Audio element failed to initialize:", err);
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      if (this.bgmAudio) {
        this.bgmAudio.muted = this.isMuted;
      }
    } catch (e) {}
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

  // Play target BGM audio file
  startBGM() {
    if (this.isMuted) return;
    try {
      this.init();
      if (this.isBGMPlaying) return;
      this.isBGMPlaying = true;

      if (this.bgmAudio) {
        this.bgmAudio.muted = false;
        this.bgmAudio.volume = 0.3; // Ensure volume is 0.3
        this.bgmAudio.play().catch(e => {
          console.warn("Failed to play BGM audio file:", e);
        });
      }
    } catch (e) {
      console.error("startBGM exception caught:", e);
    }
  }

  stopBGM() {
    this.isBGMPlaying = false;
    try {
      if (this.bgmAudio) {
        this.bgmAudio.pause();
      }
    } catch (e) {
      console.error("stopBGM exception caught:", e);
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

  playQuestComplete() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playNote(freq, 'triangle', 0.35, 0.22, idx * 0.08);
    });
  }

  playDoorUnlock() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.playNote(300, 'triangle', 0.12, 0.18);
    this.playNote(400, 'triangle', 0.12, 0.18, 0.08);
    this.playNote(600, 'sine', 0.25, 0.22, 0.16);
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
