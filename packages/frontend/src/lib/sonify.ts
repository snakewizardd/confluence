
// sonify.ts - The Pulse Sound Engine
// Load Tone.js from CDN to avoid webpack bundling issues

export interface SonificationConfig {
  scale: number[];
  baseOctave: number;
  tempo: number;
  volume: number;
}

const SCALES = {
  pentatonic: [0, 2, 4, 7, 9],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

// Declare global Tone type
declare global {
  interface Window {
    Tone: any;
  }
}

// Load Tone.js from CDN
function loadToneFromCDN(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.Tone) {
      resolve(window.Tone);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/tone@14.9.17/build/Tone.js';
    script.async = true;
    script.onload = () => {
      if (window.Tone) {
        console.log('Tone.js loaded from CDN');
        resolve(window.Tone);
      } else {
        reject(new Error('Tone.js failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Tone.js script'));
    document.head.appendChild(script);
  });
}

export class DataSonifier {
  private Tone: any = null;
  
  private synths: {
    lead: any;
    bass: any;
    pad: any;
    texture: any;
  } | null = null;

  private fx: {
    reverb: any;
    delay: any;
    filter: any;
    compressor: any;
    chorus: any;
  } | null = null;

  private isPlaying = false;
  private harmonyLevel = 0.5;
  private timers: ReturnType<typeof setInterval>[] = [];

  constructor(
    private _config: SonificationConfig = {
      scale: SCALES.lydian,
      baseOctave: 3,
      tempo: 72,
      volume: 0.6,
    }
  ) {}

  async init(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Load Tone.js from CDN
      this.Tone = await loadToneFromCDN();
      const Tone = this.Tone;

      console.log('Tone loaded, starting audio context...');
      await Tone.start();
      console.log('Audio context started:', Tone.context.state);

      // Build effects chain
      const compressor = new Tone.Compressor({
        threshold: -18,
        ratio: 3,
        attack: 0.003,
        release: 0.1,
      }).toDestination();

      const reverb = new Tone.Reverb({
        decay: 3.5,
        wet: 0.35,
        preDelay: 0.01,
      }).connect(compressor);
      await reverb.generate();

      const delay = new Tone.FeedbackDelay({
        delayTime: '8n',
        feedback: 0.3,
        wet: 0.2,
      }).connect(reverb);

      const filter = new Tone.Filter({
        type: 'lowpass',
        frequency: 2000,
        Q: 1,
        rolloff: -24,
      }).connect(delay);

      const chorus = new Tone.Chorus({
        frequency: 2,
        delayTime: 3.5,
        depth: 0.5,
        wet: 0.3,
      }).connect(filter).start();

      this.fx = { reverb, delay, filter, compressor, chorus };

      // Build synths
      const lead = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle8' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 1.8 },
        volume: -8,
      }).connect(chorus);

      const bass = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8 },
        volume: -6,
      }).connect(compressor);

      const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 3.0 },
        volume: -20,
      }).connect(reverb);

      const texture = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.5, sustain: 0.3, release: 2.0 },
        volume: -24,
      }).connect(delay);

      this.synths = { lead, bass, pad, texture };

      // Test sound
      console.log('Playing test note...');
      lead.triggerAttackRelease('C4', '8n');

      return true;
    } catch (e) {
      console.error('Tone.js init failed:', e);
      return false;
    }
  }

  private valueToNote(value: number, octaveSpan = 2): string {
    const { scale, baseOctave } = this._config;
    const v = Math.max(0, Math.min(0.999, value));
    const idx = Math.floor(v * scale.length);
    const octave = Math.floor(v * octaveSpan);
    const midi = (baseOctave + octave) * 12 + scale[idx];
    return this.Tone?.Frequency?.(midi, 'midi').toNote() || 'C4';
  }

  private valueToChord(value: number): string[] {
    const { scale, baseOctave } = this._config;
    const v = Math.max(0, Math.min(0.999, value));
    const root = Math.floor(v * scale.length);
    const third = (root + 2) % scale.length;
    const fifth = (root + 4) % scale.length;
    const oct = baseOctave + 1;

    if (!this.Tone?.Frequency) return ['C4', 'E4', 'G4'];

    return [
      this.Tone.Frequency(oct * 12 + scale[root], 'midi').toNote(),
      this.Tone.Frequency(oct * 12 + scale[third], 'midi').toNote(),
      this.Tone.Frequency(oct * 12 + scale[fifth], 'midi').toNote(),
    ];
  }

  playSeries(series: Array<{ value: number }>): void {
    if (!this.synths || series.length === 0) {
      console.error('Cannot play: synths not initialized or empty series');
      return;
    }

    this.stop();

    const { lead, bass, pad, texture } = this.synths;
    const msPerBeat = (60 / this._config.tempo) * 1000;

    // Calculate volatility for texture density
    const mean = series.reduce((s, p) => s + p.value, 0) / series.length;
    const variance = series.reduce((s, p) => s + (p.value - mean) ** 2, 0) / series.length;
    const volatility = Math.min(1, Math.sqrt(variance) * 2);

    // MELODY - 16th notes
    let mi = 0;
    this.timers.push(setInterval(() => {
      if (!this.isPlaying) return;
      const note = this.valueToNote(series[mi % series.length].value, 2);
      lead.triggerAttackRelease(note, '16n', undefined, 0.5 + Math.random() * 0.2);
      mi++;
    }, msPerBeat / 4));

    // BASS - quarter notes
    let bi = 0;
    const bassPoints = series.filter((_, i) => i % 4 === 0);
    this.timers.push(setInterval(() => {
      if (!this.isPlaying) return;
      const note = this.valueToNote(bassPoints[bi % bassPoints.length].value * 0.5, 0);
      bass.triggerAttackRelease(note, '8n', undefined, 0.8);
      if (this.fx?.filter) {
        this.fx.filter.frequency.rampTo(800 + this.harmonyLevel * 1200, 0.2);
      }
      bi++;
    }, msPerBeat));

    // PAD - half notes
    let pi = 0;
    const padPoints = series.filter((_, i) => i % 8 === 0);
    this.timers.push(setInterval(() => {
      if (!this.isPlaying) return;
      const chord = this.valueToChord(padPoints[pi % padPoints.length].value);
      pad.triggerAttackRelease(chord, '2n', undefined, 0.35);
      pi++;
    }, msPerBeat * 2));

    // TEXTURE - sparse shimmer based on volatility
    if (volatility > 0.25) {
      this.timers.push(setInterval(() => {
        if (!this.isPlaying) return;
        if (Math.random() < volatility * 0.4) {
          const note = this.valueToNote(0.7 + Math.random() * 0.25, 2);
          texture.triggerAttackRelease(note, '8n', undefined, 0.15);
        }
      }, msPerBeat / 2));
    }

    this.isPlaying = true;
    console.log('Playback started');
  }

  stop(): void {
    this.timers.forEach(t => clearInterval(t));
    this.timers = [];
    this.isPlaying = false;
  }

  setHarmony(h: number): void {
    this.harmonyLevel = h;
    this._config.tempo = 60 + (1 - h) * 50;

    if (this.fx) {
      this.fx.filter?.frequency?.rampTo?.(800 + h * 2200, 1);
      this.fx.reverb?.wet?.rampTo?.(0.2 + h * 0.4, 1);
      this.fx.delay?.feedback?.rampTo?.(0.1 + h * 0.3, 1);
    }
  }

  setMomentum(m: number): void {
    this.fx?.chorus?.frequency?.rampTo?.(1 + Math.abs(m) * 3, 2);
  }

  setBalance(b: number): void {
    if (this.fx?.chorus) this.fx.chorus.depth = b * 0.7;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  dispose(): void {
    this.stop();
    if (this.synths) {
      Object.values(this.synths).forEach(s => s?.dispose?.());
    }
    if (this.fx) {
      Object.values(this.fx).forEach(f => f?.dispose?.());
    }
    this.synths = null;
    this.fx = null;
  }
}
