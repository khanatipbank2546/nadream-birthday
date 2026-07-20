/* ==========================================================================
   Sound Engine - Badminton Court 3D RPG Audio & Cutscene SFX (Global Window)
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmTimer = null;
    this.isBGMPlaying = false;
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

  // Secret Door Opening Fanfare & Light Beams Swell SFX
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

  startBGM() {
    if (this.isMuted) return;
    this.init();
    if (this.isBGMPlaying) return;
    this.isBGMPlaying = true;

    const melody = [
      { note: 329.63, duration: 0.3, time: 0 },
      { note: 392.00, duration: 0.3, time: 0.35 },
      { note: 440.00, duration: 0.4, time: 0.7 },
      { note: 523.25, duration: 0.5, time: 1.15 },
      { note: 440.00, duration: 0.3, time: 1.7 },
      { note: 392.00, duration: 0.3, time: 2.05 },
      { note: 329.63, duration: 0.6, time: 2.4 }
    ];

    const playLoop = () => {
      if (!this.isBGMPlaying || this.isMuted) return;
      melody.forEach(item => {
        this.playNote(item.note, 'sine', item.duration, 0.09, item.time);
      });
      this.bgmTimer = setTimeout(playLoop, 3800);
    };

    playLoop();
  }

  stopBGM() {
    this.isBGMPlaying = false;
    if (this.bgmTimer) clearTimeout(this.bgmTimer);
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
