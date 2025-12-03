/**
 * sonify.ts - The Pulse Sound Engine
 *
 * Data becomes melody. Numbers find their voice.
 *
 * This module transforms data series into generative music using Tone.js.
 * We load Tone.js from CDN rather than bundling it with webpack because:
 * 1. Tone.js contains complex audio worklets that don't bundle well
 * 2. CDN loading ensures we get the exact version we need
 * 3. Reduces bundle size significantly (~200KB savings)
 * 4. Allows for graceful degradation if audio isn't critical to initial render
 */

// Debug mode - set to true to enable verbose logging
const DEBUG = false;

/**
 * Configuration for sonification engine.
 * Defines the musical parameters for data-to-sound transformation.
 */
export interface SonificationConfig {
  /** Musical scale as semitone intervals from root (e.g., [0, 2, 4, 7, 9]) */
  scale: number[];
  /** Base octave for pitch mapping (3 = C3-B3 range) */
  baseOctave: number;
  /** Tempo in beats per minute */
  tempo: number;
  /** Master volume (0.0 to 1.0) */
  volume: number;
}

/**
 * Musical scales as semitone intervals.
 * Each number represents semitones above the root note.
 */
const SCALES = {
  /** Pentatonic - ancient, universal, no dissonance */
  pentatonic: [0, 2, 4, 7, 9],
  /** Dorian - balanced, jazzy, folk-like */
  dorian: [0, 2, 3, 5, 7, 9, 10],
  /** Lydian - bright, dreamy, ethereal (used as default for its openness) */
  lydian: [0, 2, 4, 6, 7, 9, 11],
  /** Natural minor - darker, introspective */
  minor: [0, 2, 3, 5, 7, 8, 10],
};

// === TYPE DECLARATIONS ===

/** Declare global Tone type for CDN-loaded library */
declare global {
  interface Window {
    Tone: any;
  }
}

// === CDN LOADER ===

/**
 * Dynamically loads Tone.js from CDN.
 * Returns a promise that resolves with the Tone object when loaded.
 */
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
        if (DEBUG) console.log('Tone.js loaded from CDN');
        resolve(window.Tone);
      } else {
        reject(new Error('Tone.js failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Tone.js script'));
    document.head.appendChild(script);
  });
}

// === SONIFICATION ENGINE ===

/**
 * DataSonifier transforms numerical data series into generative music.
 *
 * Architecture:
 * - Four synth voices (lead, bass, pad, texture) for rich polyphony
 * - Effects chain (chorus → filter → delay → reverb → compressor)
 * - Data values (0-1) map to musical parameters
 * - Harmony/momentum/balance parameters control expression
 *
 * Musical theory:
 * - Uses Lydian scale by default for its bright, open quality
 * - Lead plays 16th notes (melody from data)
 * - Bass plays quarter notes (foundation, transposed down)
 * - Pad plays half notes (harmonic chords)
 * - Texture adds shimmer when data is volatile
 */
export class DataSonifier {
  /** The Tone.js library instance, loaded from CDN */
  private Tone: any = null;

  /** Four synthesizer voices for different musical roles */
  private synths: {
    lead: any;    // Main melody - triangle wave, quick attack
    bass: any;    // Low foundation - sine wave, punchy
    pad: any;     // Harmonic background - sawtooth, slow attack
    texture: any; // Sparse shimmer - sine wave, ethereal
  } | null = null;

  /** Effects chain for spatial and timbral processing */
  private fx: {
    reverb: any;     // Spatial depth
    delay: any;      // Rhythmic echo
    filter: any;     // Frequency sculpting
    compressor: any; // Dynamic control
    chorus: any;     // Stereo width and movement
  } | null = null;

  /** Whether playback is currently active */
  private isPlaying = false;

  /** Current harmony level (0-1), affects tempo and effects */
  private harmonyLevel = 0.5;

  /** Interval timers for each voice */
  private timers: ReturnType<typeof setInterval>[] = [];

  /**
   * Creates a new DataSonifier instance.
   * @param _config - Musical configuration (scale, octave, tempo, volume)
   */
  constructor(
    private _config: SonificationConfig = {
      scale: SCALES.lydian,  // Lydian for bright, open sound
      baseOctave: 3,         // Middle-low range (C3)
      tempo: 72,             // Moderate tempo (72 BPM)
      volume: 0.6,           // Comfortable listening level
    }
  ) {}

  // === INITIALIZATION ===

  /**
   * Initializes the audio engine.
   * Loads Tone.js, creates synths and effects, starts audio context.
   *
   * @returns Promise<boolean> - true if initialization succeeded
   */
  async init(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Load Tone.js from CDN
      this.Tone = await loadToneFromCDN();
      const Tone = this.Tone;

      await Tone.start();

      // === EFFECTS CHAIN ===
      // Signal flow: synth → chorus → filter → delay → reverb → compressor → speakers
      // Each effect adds character without overwhelming the raw data-sound
      // Compressor - keeps overall volume consistent
      const compressor = new Tone.Compressor({
        threshold: -18,  // Start compressing above -18dB
        ratio: 3,        // 3:1 compression ratio (gentle)
        attack: 0.003,   // Fast attack to catch transients
        release: 0.1,    // Quick release to maintain dynamics
      }).toDestination();

      // Reverb - adds spatial depth (like a medium concert hall)
      const reverb = new Tone.Reverb({
        decay: 3.5,      // 3.5 second decay time
        wet: 0.35,       // 35% reverb, 65% dry signal
        preDelay: 0.01,  // Slight pre-delay for clarity
      }).connect(compressor);
      await reverb.generate();

      // Delay - rhythmic echo at 8th note intervals
      const delay = new Tone.FeedbackDelay({
        delayTime: '8n', // 8th note delay (syncs to tempo)
        feedback: 0.3,   // 30% feedback (3-4 repeats)
        wet: 0.2,        // Subtle delay level
      }).connect(reverb);

      // Filter - sculpts frequency content, controlled by harmony level
      // Higher harmony → brighter sound (higher cutoff frequency)
      const filter = new Tone.Filter({
        type: 'lowpass',  // Low-pass removes high frequencies
        frequency: 2000,  // Default cutoff at 2kHz
        Q: 1,             // Gentle resonance
        rolloff: -24,     // 24dB/octave slope
      }).connect(delay);

      // Chorus - adds stereo width and slight detuning
      const chorus = new Tone.Chorus({
        frequency: 2,     // 2 Hz modulation rate
        delayTime: 3.5,   // 3.5ms base delay
        depth: 0.5,       // Modulation depth
        wet: 0.3,         // 30% chorus effect
      }).connect(filter).start();

      this.fx = { reverb, delay, filter, compressor, chorus };

      // === SYNTH VOICES ===
      // Each synth has a specific role in the musical texture

      // Lead - plays data as melody (16th notes)
      // Triangle wave for warmth, quick attack for articulation
      const lead = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle8' },  // Rich triangle with 8 partials
        envelope: {
          attack: 0.05,   // Quick start
          decay: 0.2,     // Fast initial decay
          sustain: 0.6,   // Moderate sustain level
          release: 1.8,   // Long tail for smooth transitions
        },
        volume: -8,  // Moderate volume
      }).connect(chorus);

      // Bass - foundation rhythm (quarter notes)
      // Pure sine wave for clean low frequencies
      const bass = new Tone.Synth({
        oscillator: { type: 'sine' },  // Pure fundamental
        envelope: {
          attack: 0.01,  // Punchy attack
          decay: 0.3,    // Quick decay
          sustain: 0.1,  // Low sustain (plucky)
          release: 0.8,  // Clean cutoff
        },
        volume: -6,  // Loud and present
      }).connect(compressor);

      // Pad - harmonic chords (half notes)
      // Sawtooth for rich harmonics, slow attack for wash
      const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },  // Rich in harmonics
        envelope: {
          attack: 0.8,   // Very slow swell
          decay: 0.5,    // Gentle decay
          sustain: 0.7,  // High sustain
          release: 3.0,  // Very long tail
        },
        volume: -20,  // Quiet background layer
      }).connect(reverb);

      // Texture - sparse shimmer based on data volatility
      // Ethereal high notes when data is chaotic
      const texture = new Tone.Synth({
        oscillator: { type: 'sine' },  // Pure and delicate
        envelope: {
          attack: 0.1,   // Soft attack
          decay: 0.5,    // Medium decay
          sustain: 0.3,  // Low sustain
          release: 2.0,  // Long release (shimmer)
        },
        volume: -24,  // Very quiet
      }).connect(delay);

      this.synths = { lead, bass, pad, texture };

      return true;
    } catch (e) {
      console.error('Tone.js initialization failed:', e);
      return false;
    }
  }

  // === DATA-TO-MUSIC MAPPING ===

  /**
   * Converts a normalized value (0-1) to a musical note.
   * Maps the value to both scale degree and octave.
   *
   * @param value - Normalized data value (0-1)
   * @param octaveSpan - How many octaves the mapping should span
   * @returns Musical note string (e.g., "C4", "F#5")
   */
  private valueToNote(value: number, octaveSpan = 2): string {
    const { scale, baseOctave } = this._config;
    const v = Math.max(0, Math.min(0.999, value));  // Clamp to valid range
    const idx = Math.floor(v * scale.length);       // Which scale degree
    const octave = Math.floor(v * octaveSpan);      // Which octave offset
    const midi = (baseOctave + octave) * 12 + scale[idx];  // Calculate MIDI note number
    return this.Tone?.Frequency?.(midi, 'midi').toNote() || 'C4';
  }

  /**
   * Converts a normalized value to a three-note chord.
   * Builds a triad (root, third, fifth) from the scale.
   *
   * @param value - Normalized data value (0-1)
   * @returns Array of three note strings
   */
  private valueToChord(value: number): string[] {
    const { scale, baseOctave } = this._config;
    const v = Math.max(0, Math.min(0.999, value));
    const root = Math.floor(v * scale.length);      // Root note
    const third = (root + 2) % scale.length;        // Third (skip one scale degree)
    const fifth = (root + 4) % scale.length;        // Fifth (skip two scale degrees)
    const oct = baseOctave + 1;

    if (!this.Tone?.Frequency) return ['C4', 'E4', 'G4'];

    return [
      this.Tone.Frequency(oct * 12 + scale[root], 'midi').toNote(),
      this.Tone.Frequency(oct * 12 + scale[third], 'midi').toNote(),
      this.Tone.Frequency(oct * 12 + scale[fifth], 'midi').toNote(),
    ];
  }

  // === PLAYBACK CONTROL ===

  /**
   * Starts playing a data series as music.
   * Creates four simultaneous musical voices from the data.
   *
   * @param series - Array of data points with numeric values
   */
  playSeries(series: Array<{ value: number }>): void {
    if (!this.synths || series.length === 0) {
      console.error('Cannot play: synths not initialized or empty series');
      return;
    }

    this.stop();

    const { lead, bass, pad, texture } = this.synths;
    const msPerBeat = (60 / this._config.tempo) * 1000;

    // Calculate volatility to determine texture layer density
    // High volatility = more shimmer/texture
    const mean = series.reduce((s, p) => s + p.value, 0) / series.length;
    const variance = series.reduce((s, p) => s + (p.value - mean) ** 2, 0) / series.length;
    const volatility = Math.min(1, Math.sqrt(variance) * 2);

    // === VOICE 1: MELODY (Lead synth, 16th notes) ===
    // Plays every data point as a fast-moving melody
    let mi = 0;
    this.timers.push(setInterval(() => {
      if (!this.isPlaying) return;
      const note = this.valueToNote(series[mi % series.length].value, 2);
      lead.triggerAttackRelease(note, '16n', undefined, 0.5 + Math.random() * 0.2);
      mi++;
    }, msPerBeat / 4));

    // === VOICE 2: BASS (Bass synth, quarter notes) ===
    // Plays every 4th point as foundation, transposed down
    let bi = 0;
    const bassPoints = series.filter((_, i) => i % 4 === 0);
    this.timers.push(setInterval(() => {
      if (!this.isPlaying) return;
      const note = this.valueToNote(bassPoints[bi % bassPoints.length].value * 0.5, 0);
      bass.triggerAttackRelease(note, '8n', undefined, 0.8);
      // Modulate filter cutoff with harmony level
      if (this.fx?.filter) {
        this.fx.filter.frequency.rampTo(800 + this.harmonyLevel * 1200, 0.2);
      }
      bi++;
    }, msPerBeat));

    // === VOICE 3: PAD (Pad synth, half notes) ===
    // Plays every 8th point as slow-moving chords
    let pi = 0;
    const padPoints = series.filter((_, i) => i % 8 === 0);
    this.timers.push(setInterval(() => {
      if (!this.isPlaying) return;
      const chord = this.valueToChord(padPoints[pi % padPoints.length].value);
      pad.triggerAttackRelease(chord, '2n', undefined, 0.35);
      pi++;
    }, msPerBeat * 2));

    // === VOICE 4: TEXTURE (Texture synth, probabilistic) ===
    // Only active when data is volatile (chaotic)
    if (volatility > 0.25) {
      this.timers.push(setInterval(() => {
        if (!this.isPlaying) return;
        // Probabilistic triggering based on volatility
        if (Math.random() < volatility * 0.4) {
          const note = this.valueToNote(0.7 + Math.random() * 0.25, 2);
          texture.triggerAttackRelease(note, '8n', undefined, 0.15);
        }
      }, msPerBeat / 2));
    }

    this.isPlaying = true;
  }

  /**
   * Stops playback and clears all interval timers.
   */
  stop(): void {
    this.timers.forEach(t => clearInterval(t));
    this.timers = [];
    this.isPlaying = false;
  }

  // === EXPRESSIVE CONTROLS ===

  /**
   * Sets the harmony level, affecting tempo and effects.
   * Higher harmony = slower tempo, brighter sound, more reverb.
   *
   * @param h - Harmony level (0-1)
   */
  setHarmony(h: number): void {
    this.harmonyLevel = h;
    this._config.tempo = 60 + (1 - h) * 50;  // Low harmony = fast tempo (110 BPM)

    if (this.fx) {
      // Higher harmony = brighter filter (800Hz to 3000Hz)
      this.fx.filter?.frequency?.rampTo?.(800 + h * 2200, 1);
      // Higher harmony = more reverb (20% to 60% wet)
      this.fx.reverb?.wet?.rampTo?.(0.2 + h * 0.4, 1);
      // Higher harmony = more delay feedback
      this.fx.delay?.feedback?.rampTo?.(0.1 + h * 0.3, 1);
    }
  }

  /**
   * Sets the momentum level, affecting chorus modulation.
   * Higher momentum = faster chorus movement.
   *
   * @param m - Momentum level (-1 to 1)
   */
  setMomentum(m: number): void {
    // Modulate chorus frequency from 1Hz to 4Hz
    this.fx?.chorus?.frequency?.rampTo?.(1 + Math.abs(m) * 3, 2);
  }

  /**
   * Sets the balance level, affecting chorus depth.
   *
   * @param b - Balance level (0-1)
   */
  setBalance(b: number): void {
    if (this.fx?.chorus) this.fx.chorus.depth = b * 0.7;
  }

  /**
   * Returns whether playback is currently active.
   */
  get playing(): boolean {
    return this.isPlaying;
  }

  // === REAL-TIME CONTROL METHODS ===

  /**
   * Sets the tempo in real-time.
   * Updates the tempo config which affects playback speed.
   * To apply changes during playback, restart with playSeries().
   *
   * @param bpm - Beats per minute (40-120 recommended)
   */
  setTempo(bpm: number): void {
    this._config.tempo = Math.max(40, Math.min(120, bpm));
  }

  /**
   * Sets the musical scale in real-time.
   * Changes the scale used for note mapping.
   *
   * @param scaleName - Name of scale: 'lydian', 'dorian', 'pentatonic', or 'minor'
   */
  setScale(scaleName: string): void {
    const scale = SCALES[scaleName as keyof typeof SCALES];
    if (scale) {
      this._config.scale = scale;
    } else {
      console.warn(`Unknown scale: ${scaleName}, keeping current scale`);
    }
  }

  /**
   * Sets the reverb wet amount in real-time.
   * Controls how much reverb is mixed into the signal.
   *
   * @param wet - Reverb amount (0.0 to 1.0)
   */
  setReverb(wet: number): void {
    const wetClamped = Math.max(0, Math.min(1, wet));
    if (this.fx?.reverb) {
      this.fx.reverb.wet.rampTo(wetClamped, 0.5);
    }
  }

  /**
   * Sets the harmony blend (pad prominence) in real-time.
   * Controls the volume of the pad synth (chords).
   *
   * @param blend - Harmony blend (0.0 to 1.0, where 0 = silent, 1 = loud)
   */
  setHarmonyBlend(blend: number): void {
    const blendClamped = Math.max(0, Math.min(1, blend));
    if (this.synths?.pad) {
      // Pad volume range: -30dB (very quiet) to -10dB (prominent)
      const volume = -30 + blendClamped * 20;
      this.synths.pad.volume.rampTo(volume, 0.5);
    }
  }

  /**
   * Gets the current tempo.
   */
  getTempo(): number {
    return this._config.tempo;
  }

  /**
   * Gets the current scale name.
   */
  getScaleName(): string {
    const { scale } = this._config;
    for (const [name, intervals] of Object.entries(SCALES)) {
      if (JSON.stringify(intervals) === JSON.stringify(scale)) {
        return name;
      }
    }
    return 'custom';
  }

  /**
   * Cleans up all audio resources.
   * Call this when the sonifier is no longer needed.
   */
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
