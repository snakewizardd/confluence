// loom-sonify.ts - Generative Mathematical Sonification Engine
// Where mathematics dreams in sound, where formulas become music

const DEBUG = false;

// Type definitions for each mathematical system
export interface LorenzData {
  x: number[];
  y: number[];
  z: number[];
  raw: { x: number[]; y: number[]; z: number[] };
  speed: number[];
  wing_switches: number[];
  params: { sigma: number; rho: number; beta: number; dt: number };
}

export interface AutomatonData {
  grid: number[][];
  density: number[];
  triggers: Array<{ row: number; col: number }>;
  rule: number;
  width: number;
  generations: number;
}

export interface FibonacciData {
  x: number[];
  y: number[];
  raw: { x: number[]; y: number[]; r: number[]; theta: number[] };
  fib: number[];
  ratios: number[];
  phi: number;
}

export interface CliffordData {
  x: number[];
  y: number[];
  raw: { x: number[]; y: number[] };
  velocity: number[];
  params: { a: number; b: number; c: number; d: number };
}

export interface LoomData {
  system: string;
  data: LorenzData | AutomatonData | FibonacciData | CliffordData;
  timestamp: string;
}

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
        if (DEBUG) console.log('Tone.js loaded from CDN for Loom');
        resolve(window.Tone);
      } else {
        reject(new Error('Tone.js failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Tone.js script'));
    document.head.appendChild(script);
  });
}

/**
 * Main Loom sonifier class
 */
export class LoomSonifier {
  private Tone: any = null;
  private synths: any[] = [];
  private parts: any[] = [];
  private isPlaying = false;
  private system: string = '';

  async init(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Load Tone.js from CDN
      this.Tone = await loadToneFromCDN();
      const Tone = this.Tone;

      await Tone.start();

      if (DEBUG) console.log('LoomSonifier initialized');
      return true;
    } catch (err) {
      console.error('Failed to initialize LoomSonifier:', err);
      return false;
    }
  }

  /**
   * Play a mathematical system as sound
   */
  async play(loomData: LoomData, tempo: number = 80): Promise<void> {
    if (!this.Tone) return;

    this.stop();
    this.system = loomData.system;

    switch (loomData.system) {
      case 'lorenz':
        await this.playLorenz(loomData.data as LorenzData, tempo);
        break;
      case 'automaton':
        await this.playAutomaton(loomData.data as AutomatonData, tempo);
        break;
      case 'fibonacci':
        await this.playFibonacci(loomData.data as FibonacciData, tempo);
        break;
      case 'clifford':
        await this.playClifford(loomData.data as CliffordData, tempo);
        break;
      default:
        console.error('Unknown system:', loomData.system);
    }

    this.isPlaying = true;
  }

  /**
   * LORENZ (3 voices of chaos)
   * - x → bass (sine, slow)
   * - y → mid (triangle, melody)
   * - z → high (sawtooth, texture)
   * - Tempo follows trajectory speed
   */
  private async playLorenz(data: LorenzData, baseTempo: number): Promise<void> {
    const Tone = this.Tone;

    // Create three synths for x, y, z
    const bassSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.5 },
      volume: -8,
    }).toDestination();

    const midSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.5, release: 0.3 },
      volume: -12,
    }).toDestination();

    const highSynth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 },
      volume: -16,
    }).toDestination();

    this.synths = [bassSynth, midSynth, highSynth];

    // Map normalized values to frequencies
    const baseFreq = 55; // A1
    const sampleInterval = Math.floor(data.x.length / 200); // Sample ~200 points

    // Create parts for each voice
    const now = Tone.now();
    let currentTime = now + 0.5;

    for (let i = 0; i < data.x.length; i += sampleInterval) {
      // Map to MIDI notes (approx 3 octaves)
      const xNote = baseFreq * Math.pow(2, data.x[i] * 3);
      const yNote = baseFreq * 2 * Math.pow(2, data.y[i] * 3);
      const zNote = baseFreq * 4 * Math.pow(2, data.z[i] * 3);

      // Tempo follows trajectory speed
      const speedFactor = i < data.speed.length ? 1 + data.speed[i] * 2 : 1;
      const duration = (60 / (baseTempo * speedFactor)) * sampleInterval;

      // Trigger notes
      bassSynth.triggerAttackRelease(xNote, duration * 0.8, currentTime);
      midSynth.triggerAttackRelease(yNote, duration * 0.6, currentTime);
      highSynth.triggerAttackRelease(zNote, duration * 0.4, currentTime + duration * 0.1);

      currentTime += duration;
    }

    if (DEBUG) console.log('Lorenz sonification started');
  }

  /**
   * AUTOMATON (polyrhythmic percussion)
   * - Each column = one drum voice
   * - Row density → master tempo
   * - Rule 110 creates Turing-complete rhythms
   */
  private async playAutomaton(data: AutomatonData, baseTempo: number): Promise<void> {
    const Tone = this.Tone;

    // Create multiple noise synths for percussion
    const voices = Math.min(data.width, 16); // Limit to 16 voices for performance
    const noiseSynths = Array.from({ length: voices }, (_, i) => {
      const freq = 100 + i * 50; // Different pitch per column
      return new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.05 },
        volume: -20,
      }).toDestination();
    });

    this.synths = noiseSynths;

    // Schedule triggers based on active cells
    const now = Tone.now();
    let currentTime = now + 0.5;

    for (let row = 0; row < data.generations; row++) {
      // Density affects tempo
      const density = data.density[row];
      const tempoMultiplier = 0.5 + density * 1.5;
      const rowDuration = 60 / (baseTempo * tempoMultiplier);

      // Trigger all active cells in this row
      for (let col = 0; col < Math.min(data.width, voices); col++) {
        if (data.grid[row][col] === 1) {
          const note = 50 + col * 10; // Different pitch per column
          noiseSynths[col].triggerAttackRelease(note, '16n', currentTime);
        }
      }

      currentTime += rowDuration;
    }

    if (DEBUG) console.log('Automaton sonification started');
  }

  /**
   * FIBONACCI (golden harmony)
   * - Consecutive ratios → interval relationships
   * - As ratios approach φ → perfect fifth emerges
   * - Spiral position → stereo panning
   * - Index → pitch (Fibonacci frequencies)
   */
  private async playFibonacci(data: FibonacciData, baseTempo: number): Promise<void> {
    const Tone = this.Tone;

    // Create synth with reverb for ethereal sound
    const reverb = new Tone.Reverb({
      decay: 4,
      wet: 0.4,
    }).toDestination();

    await reverb.generate();

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.2, decay: 0.3, sustain: 0.6, release: 1 },
      volume: -10,
    }).connect(reverb);

    this.synths = [synth];

    // Map Fibonacci numbers to frequencies (using golden ratio)
    const baseFreq = 55; // A1
    const sampleInterval = Math.max(1, Math.floor(data.fib.length / 100)); // Sample ~100 notes

    const now = Tone.now();
    let currentTime = now + 0.5;

    for (let i = 0; i < data.fib.length; i += sampleInterval) {
      // Use ratios to determine interval
      const ratio = i < data.ratios.length ? data.ratios[i] : data.phi;
      const freq = baseFreq * ratio;

      // Pan based on spiral position
      const pan = (data.x[i] - 0.5) * 2; // -1 to 1

      // Create panner
      const panner = new Tone.Panner(pan).connect(reverb);
      synth.connect(panner);

      // Duration gets shorter as we spiral out (accelerando)
      const duration = (60 / baseTempo) * (1 - i / data.fib.length * 0.5);

      synth.triggerAttackRelease(freq, duration, currentTime);

      currentTime += duration;
    }

    if (DEBUG) console.log('Fibonacci sonification started');
  }

  /**
   * CLIFFORD (ambient drift)
   * - x → pitch
   * - y → filter cutoff
   * - Velocity between points → dynamics
   */
  private async playClifford(data: CliffordData, baseTempo: number): Promise<void> {
    const Tone = this.Tone;

    // Create synth with filter
    const filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 1000,
      rolloff: -24,
    }).toDestination();

    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.3, decay: 0.2, sustain: 0.7, release: 0.8 },
      volume: -12,
    }).connect(filter);

    this.synths = [synth];

    // Sample points for sonification
    const sampleInterval = Math.max(1, Math.floor(data.x.length / 300));

    const now = Tone.now();
    let currentTime = now + 0.5;

    for (let i = 0; i < data.x.length; i += sampleInterval) {
      // Map x to pitch (audible range)
      const freq = 110 + data.x[i] * 440; // A2 to A5

      // Map y to filter cutoff
      const filterFreq = 200 + data.y[i] * 2000; // 200Hz to 2200Hz
      filter.frequency.setValueAtTime(filterFreq, currentTime);

      // Velocity affects duration and volume
      const velocity = i < data.velocity.length ? data.velocity[i] : 0.5;
      const duration = (60 / baseTempo) * (0.5 + velocity * 1.5);
      const volume = Tone.gainToDb(0.1 + velocity * 0.2);

      synth.volume.setValueAtTime(volume, currentTime);
      synth.triggerAttackRelease(freq, duration, currentTime);

      currentTime += duration * 0.8; // Slight overlap
    }

    if (DEBUG) console.log('Clifford sonification started');
  }

  /**
   * Stop all playing synths
   */
  stop(): void {
    if (!this.Tone) return;

    const now = this.Tone.now();
    this.synths.forEach((synth) => {
      try {
        if (synth.triggerRelease) {
          synth.triggerRelease(now);
        }
        setTimeout(() => synth.dispose(), 2000);
      } catch (err) {
        // Synth may already be disposed
      }
    });

    this.parts.forEach((part) => {
      try {
        part.stop();
        part.dispose();
      } catch (err) {
        // Part may already be disposed
      }
    });

    this.synths = [];
    this.parts = [];
    this.isPlaying = false;

    if (DEBUG) console.log('Stopped all loom synths');
  }

  /**
   * Get current Tone instance
   */
  getTone(): any {
    return this.Tone;
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current system
   */
  getSystem(): string {
    return this.system;
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.stop();
  }
}
