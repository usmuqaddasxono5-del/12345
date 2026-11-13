// Web Audio API + SpeechSynthesis audio engine for Trigonometriya Pegasi

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = false;
  private musicTimer: number | null = null;
  private noteIndex = 0;

  // Gentle, cheerful pastel pentatonic melody (C5, E5, G5, A5, G5, E5, D5, C5)
  private readonly melody = [
    523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25,
    587.33, 659.25, 783.99, 659.25, 523.25, 587.33, 523.25, 0,
  ];

  public unlock() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.unlock();
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  public getMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.14,
    startOffset = 0,
    endFreq?: number
  ) {
    if (!this.soundEnabled) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + startOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick() {
    this.playTone(620, 0.07, 'sine', 0.09, 0, 760);
  }

  public playHint() {
    this.playTone(587.33, 0.12, 'triangle', 0.12, 0);
    this.playTone(880, 0.2, 'sine', 0.13, 0.09);
  }

  public playCorrect() {
    // Rising cheerful "ding-ding-ding!"
    this.playTone(523.25, 0.14, 'sine', 0.16, 0);
    this.playTone(659.25, 0.14, 'sine', 0.16, 0.08);
    this.playTone(783.99, 0.24, 'triangle', 0.18, 0.16);
    this.playTone(1046.5, 0.3, 'sine', 0.14, 0.24);
  }

  public playWrong() {
    // Soft gentle "bum"
    this.playTone(230, 0.18, 'triangle', 0.15, 0, 150);
    this.playTone(170, 0.24, 'sine', 0.13, 0.12, 120);
  }

  public playCountdown(isGo = false) {
    if (isGo) {
      this.playTone(523.25, 0.18, 'triangle', 0.16, 0);
      this.playTone(659.25, 0.18, 'triangle', 0.16, 0.06);
      this.playTone(783.99, 0.32, 'sine', 0.18, 0.12);
    } else {
      this.playTone(540, 0.14, 'sine', 0.14, 0);
    }
  }

  public playFanfare() {
    // Joyful victory fanfare
    const notes = [
      { f: 523.25, d: 0.15, t: 0 },
      { f: 659.25, d: 0.15, t: 0.13 },
      { f: 783.99, d: 0.15, t: 0.26 },
      { f: 1046.5, d: 0.32, t: 0.4 },
      { f: 783.99, d: 0.14, t: 0.72 },
      { f: 1046.5, d: 0.55, t: 0.88 },
    ];
    notes.forEach((n) => this.playTone(n.f, n.d, 'triangle', 0.17, n.t));
  }

  private startMusic() {
    if (this.musicTimer !== null || typeof window === 'undefined') return;
    const playStep = () => {
      if (!this.musicEnabled || !this.ctx) return;
      const freq = this.melody[this.noteIndex % this.melody.length];
      this.noteIndex += 1;
      if (freq > 0) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.035, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
      }
    };
    playStep();
    this.musicTimer = window.setInterval(playStep, 420);
  }

  private stopMusic() {
    if (this.musicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public speak(text: string) {
    if (!this.soundEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.volume = 1.0;
      utter.rate = 0.95;
      utter.pitch = 1.2;

      const voices = synth.getVoices();
      if (voices.length > 0) {
        const uzVoice = voices.find((v) => v.lang.toLowerCase().startsWith('uz'));
        const ruVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ru'));
        const trVoice = voices.find((v) => v.lang.toLowerCase().startsWith('tr'));
        utter.voice = uzVoice || ruVoice || trVoice || voices[0];
        utter.lang = utter.voice?.lang || 'uz-UZ';
      } else {
        utter.lang = 'uz-UZ';
      }
      synth.speak(utter);
    } catch {
      // Ignore speech synthesis errors in restricted sandboxes
    }
  }
}

export const soundEngine = new SoundEngine();

export const PRAISE_PHRASES = [
  'Barakalla!',
  'Juda yaxshi!',
  "To'g'ri!",
  'Ajoyib!',
];

export const WRONG_PHRASES = [
  'Xato!',
  "Yana urinib ko'r!",
];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
