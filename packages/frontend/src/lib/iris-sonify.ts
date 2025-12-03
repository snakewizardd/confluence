// iris-sonify.ts - Fisher's Iris Dataset Sound Engine
// Transform botanical measurements into living music
// Load Tone.js from CDN to avoid webpack bundling issues

export interface IrisWave {
  index: number;
  t: number;
  sepal_length: number;
  sepal_width: number;
  petal_length: number;
  petal_width: number;
  species: string;
  composite_wave: number;
  wave1: number;
  wave2: number;
  wave3: number;
  wave4: number;
}

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],      // setosa - bright, pure
  minor: [0, 2, 3, 5, 7, 8, 10],      // versicolor - contemplative
  lydian: [0, 2, 4, 6, 7, 9, 11],     // virginica - ethereal, elevated
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
        console.log('Tone.js loaded from CDN for Iris');
        resolve(window.Tone);
      } else {
        reject(new Error('Tone.js failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Tone.js script'));
    document.head.appendChild(script);
  });
}

export class IrisSonifier {
  private Tone: any = null;

  private synths: {
    sepalLength: any;  // PolySynth triangle - high melody
    sepalWidth: any;   // PolySynth sawtooth - mid harmony
    petalLength: any;  // Synth sine - bass
    petalWidth: any;   // Synth sine - shimmer texture
  } | null = null;

  private fx: {
    chorus: any;
    delay: any;
    reverb: any;
    compressor: any;
  } | null = null;

  private isPlaying = false;
  private currentScale = SCALES.major;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async init(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Load Tone.js from CDN
      this.Tone = await loadToneFromCDN();
      const Tone = this.Tone;

      console.log('Iris Tone loaded, starting audio context...');
      await Tone.start();
      console.log('Iris audio context started:', Tone.context.state);

      // Build effects chain (chorus -> delay -> reverb -> compressor -> destination)
      const compressor = new Tone.Compressor({
        threshold: -20,
        ratio: 4,
        attack: 0.003,
        release: 0.1,
      }).toDestination();

      const reverb = new Tone.Reverb({
        decay: 4.0,
        wet: 0.4,
        preDelay: 0.01,
      }).connect(compressor);
      await reverb.generate();

      const delay = new Tone.FeedbackDelay({
        delayTime: '8n',
        feedback: 0.25,
        wet: 0.25,
      }).connect(reverb);

      const chorus = new Tone.Chorus({
        frequency: 1.5,
        delayTime: 3.5,
        depth: 0.6,
        wet: 0.35,
      }).connect(delay).start();

      this.fx = { chorus, delay, reverb, compressor };

      // Build synths - four voices for four features

      // Sepal Length - high melody, triangle wave
      const sepalLength = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.5, release: 2.0 },
        volume: -10,
      }).connect(chorus);

      // Sepal Width - mid harmony, sawtooth wave
      const sepalWidth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.08, decay: 0.4, sustain: 0.6, release: 2.5 },
        volume: -14,
      }).connect(chorus);

      // Petal Length - bass, sine wave
      const petalLength = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 1.0 },
        volume: -8,
      }).connect(compressor);

      // Petal Width - shimmer texture, sine wave
      const petalWidth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.15, decay: 0.6, sustain: 0.4, release: 3.0 },
        volume: -18,
      }).connect(delay);

      this.synths = { sepalLength, sepalWidth, petalLength, petalWidth };

      // Test sound
      console.log('Playing Iris test note...');
      sepalLength.triggerAttackRelease('C4', '8n');

      return true;
    } catch (e) {
      console.error('Iris Tone.js init failed:', e);
      return false;
    }
  }

  private valueToNote(value: number, baseOctave = 4, scale = this.currentScale): string {
    const v = Math.max(0, Math.min(0.999, value));
    const idx = Math.floor(v * scale.length);
    const octave = baseOctave + Math.floor(v * 2); // 2 octave span
    const midi = octave * 12 + scale[idx];
    return this.Tone?.Frequency?.(midi, 'midi').toNote() || 'C4';
  }

  private setScaleForSpecies(species: string): void {
    // Different scale per species
    if (species === 'setosa') {
      this.currentScale = SCALES.major;
    } else if (species === 'versicolor') {
      this.currentScale = SCALES.minor;
    } else if (species === 'virginica') {
      this.currentScale = SCALES.lydian;
    }
  }

  playWaves(waves: IrisWave[], tempo = 120): void {
    if (!this.synths || waves.length === 0) {
      console.error('Cannot play: synths not initialized or empty waves');
      return;
    }

    this.stop();

    const { sepalLength, sepalWidth, petalLength, petalWidth } = this.synths;
    const msPerBeat = (60 / tempo) * 1000;
    const msPerNote = msPerBeat / 2; // 8th notes

    let currentIndex = 0;

    this.intervalId = setInterval(() => {
      if (!this.isPlaying || currentIndex >= waves.length) {
        this.stop();
        return;
      }

      const wave = waves[currentIndex];

      // Set scale based on species
      this.setScaleForSpecies(wave.species);

      // Play each feature as a different voice
      // Sepal Length - high melody
      const slNote = this.valueToNote(wave.sepal_length, 5, this.currentScale);
      sepalLength.triggerAttackRelease(slNote, '8n', undefined, 0.6);

      // Sepal Width - mid harmony
      const swNote = this.valueToNote(wave.sepal_width, 4, this.currentScale);
      sepalWidth.triggerAttackRelease(swNote, '4n', undefined, 0.5);

      // Petal Length - bass
      const plNote = this.valueToNote(wave.petal_length, 2, this.currentScale);
      petalLength.triggerAttackRelease(plNote, '4n', undefined, 0.7);

      // Petal Width - shimmer texture (occasional)
      if (currentIndex % 2 === 0) {
        const pwNote = this.valueToNote(wave.petal_width, 6, this.currentScale);
        petalWidth.triggerAttackRelease(pwNote, '2n', undefined, 0.3);
      }

      currentIndex++;
    }, msPerNote);

    this.isPlaying = true;
    console.log(`Playing ${waves.length} iris observations at ${tempo} BPM`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPlaying = false;
    console.log('Iris playback stopped');
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
