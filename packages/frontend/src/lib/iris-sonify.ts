// iris-sonify.ts - Fisher's Iris Dataset Sound Engine
// Transform botanical measurements into living music
// Load Tone.js from CDN to avoid webpack bundling issues

// Debug mode - set to true to enable verbose logging
const DEBUG = false;

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
        if (DEBUG) console.log('Tone.js loaded from CDN for Iris');
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
  private currentTempo = 120;
  private currentWaves: IrisWave[] = [];
  private shouldLoop = false;

  // Mute state for each voice
  private mutedVoices = {
    sepalLength: false,
    sepalWidth: false,
    petalLength: false,
    petalWidth: false,
  };

  async init(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Load Tone.js from CDN
      this.Tone = await loadToneFromCDN();
      const Tone = this.Tone;

      await Tone.start();

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

  playWaves(waves: IrisWave[], tempo = 120, loop = false): void {
    if (!this.synths || waves.length === 0) {
      console.error('Cannot play: synths not initialized or empty waves');
      return;
    }

    this.stop();

    this.currentWaves = waves;
    this.currentTempo = tempo;
    this.shouldLoop = loop;

    const { sepalLength, sepalWidth, petalLength, petalWidth } = this.synths;
    const msPerBeat = (60 / this.currentTempo) * 1000;
    const msPerNote = msPerBeat / 2; // 8th notes

    let currentIndex = 0;

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) {
        return;
      }

      // Handle end of sequence
      if (currentIndex >= waves.length) {
        if (this.shouldLoop) {
          currentIndex = 0; // Loop back to start
        } else {
          this.stop();
          return;
        }
      }

      const wave = waves[currentIndex];

      // Set scale based on species
      this.setScaleForSpecies(wave.species);

      // Play each feature as a different voice (only if not muted)
      // Sepal Length - high melody
      if (!this.mutedVoices.sepalLength) {
        const slNote = this.valueToNote(wave.sepal_length, 5, this.currentScale);
        sepalLength.triggerAttackRelease(slNote, '8n', undefined, 0.6);
      }

      // Sepal Width - mid harmony
      if (!this.mutedVoices.sepalWidth) {
        const swNote = this.valueToNote(wave.sepal_width, 4, this.currentScale);
        sepalWidth.triggerAttackRelease(swNote, '4n', undefined, 0.5);
      }

      // Petal Length - bass
      if (!this.mutedVoices.petalLength) {
        const plNote = this.valueToNote(wave.petal_length, 2, this.currentScale);
        petalLength.triggerAttackRelease(plNote, '4n', undefined, 0.7);
      }

      // Petal Width - shimmer texture (occasional)
      if (!this.mutedVoices.petalWidth && currentIndex % 2 === 0) {
        const pwNote = this.valueToNote(wave.petal_width, 6, this.currentScale);
        petalWidth.triggerAttackRelease(pwNote, '2n', undefined, 0.3);
      }

      currentIndex++;
    }, msPerNote);

    this.isPlaying = true;
    if (DEBUG) console.log(`Playing ${waves.length} iris observations at ${tempo} BPM (loop: ${loop})`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPlaying = false;
    if (DEBUG) console.log('Iris playback stopped');
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  // === REAL-TIME CONTROL METHODS ===

  /**
   * Sets the tempo and restarts playback if currently playing.
   * @param bpm - Beats per minute (40-120 recommended)
   */
  setTempo(bpm: number): void {
    this.currentTempo = Math.max(40, Math.min(120, bpm));
    // If currently playing, restart with new tempo
    if (this.isPlaying && this.currentWaves.length > 0) {
      this.playWaves(this.currentWaves, this.currentTempo, this.shouldLoop);
    }
  }

  /**
   * Sets the musical scale.
   * Changes apply to future notes.
   * @param scaleName - 'major', 'minor', or 'lydian'
   */
  setScale(scaleName: string): void {
    const scale = SCALES[scaleName as keyof typeof SCALES];
    if (scale) {
      this.currentScale = scale;
    } else {
      console.warn(`Unknown scale: ${scaleName}, keeping current scale`);
    }
  }

  /**
   * Sets the reverb wet amount.
   * @param wet - Reverb amount (0.0 to 1.0)
   */
  setReverb(wet: number): void {
    const wetClamped = Math.max(0, Math.min(1, wet));
    if (this.fx?.reverb) {
      this.fx.reverb.wet.rampTo(wetClamped, 0.5);
    }
  }

  /**
   * Mutes or unmutes a specific voice.
   * @param voiceName - 'sepalLength', 'sepalWidth', 'petalLength', or 'petalWidth'
   * @param muted - true to mute, false to unmute
   */
  muteVoice(voiceName: string, muted: boolean): void {
    if (voiceName in this.mutedVoices) {
      this.mutedVoices[voiceName as keyof typeof this.mutedVoices] = muted;
    } else {
      console.warn(`Unknown voice: ${voiceName}`);
    }
  }

  /**
   * Sets the loop mode.
   * @param loop - true to loop continuously, false to stop at end
   */
  setLoop(loop: boolean): void {
    this.shouldLoop = loop;
  }

  /**
   * Gets the current tempo.
   */
  getTempo(): number {
    return this.currentTempo;
  }

  /**
   * Gets whether a voice is muted.
   */
  isVoiceMuted(voiceName: string): boolean {
    if (voiceName in this.mutedVoices) {
      return this.mutedVoices[voiceName as keyof typeof this.mutedVoices];
    }
    return false;
  }

  /**
   * Gets the loop state.
   */
  getLoop(): boolean {
    return this.shouldLoop;
  }

  /**
   * Gets the Tone.js instance for external use (e.g., visualizers).
   */
  getTone(): any {
    return this.Tone;
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
