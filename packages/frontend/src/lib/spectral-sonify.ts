// spectral-sonify.ts - Spectral Sonification Engine
// Transform hidden frequencies into audible sound
// Maps data periodicities directly to audio frequencies

const DEBUG = false;

export interface SpectralComponent {
  frequency: number;           // Hz in data domain
  power_normalized: number;    // 0-1
  phase: number;               // radians
  period: number;              // inverse of frequency
}

export interface SpectralData {
  components: SpectralComponent[];
  metadata: {
    n_samples: number;
    sample_rate: number;
    spectral_centroid: number;
    spectral_entropy: number;
    spectral_rolloff: number;
    total_power: number;
  };
  full_spectrum: {
    frequencies: number[];
    power: number[];
    phase: number[];
  };
}

export interface SpectralMapping {
  audioFrequency: number;  // Hz in audio domain
  velocity: number;        // 0-1 (volume)
  pan: number;             // -1 to 1 (stereo)
  delay: number;           // ms (phase → timing)
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
        if (DEBUG) console.log('Tone.js loaded from CDN for Spectral');
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
 * Map data frequency to audio frequency using octave folding
 * Keeps everything audible and musically meaningful
 */
export function dataFreqToAudioFreq(dataFreq: number, baseNote: number = 55): number {
  // baseNote = 55 Hz (A1)
  if (dataFreq <= 0) return baseNote;

  // Map to musical octaves logarithmically
  // Data freq 0.001 Hz → low bass
  // Data freq 1 Hz → mid
  // Data freq 100 Hz → high
  const octaves = Math.log2(dataFreq / 0.001);  // 0.001 Hz as reference
  const semitones = octaves * 12;

  // Fold into audible range (3 octaves from base)
  const foldedSemitones = ((semitones % 36) + 36) % 36;

  return baseNote * Math.pow(2, foldedSemitones / 12);
}

/**
 * Convert spectral components to synth parameters
 */
export function mapSpectrum(components: SpectralComponent[]): SpectralMapping[] {
  return components.map((c) => ({
    // Frequency mapping (log scale to musical scale)
    audioFrequency: dataFreqToAudioFreq(c.frequency),

    // Power → velocity (with compression for better mix)
    velocity: Math.pow(c.power_normalized, 0.5) * 0.7 + 0.1,

    // Phase → stereo position
    pan: Math.sin(c.phase),

    // Phase → timing offset (subtle)
    delay: ((c.phase + Math.PI) / (2 * Math.PI)) * 100,  // 0-100ms
  }));
}

/**
 * Spectral centroid → filter cutoff
 */
export function centroidToFilter(centroid: number, maxFreq: number): number {
  // Higher centroid = brighter sound = higher filter cutoff
  const normalized = centroid / maxFreq;
  return 200 + normalized * 4000;  // 200Hz - 4200Hz
}

/**
 * Spectral entropy → reverb/effects
 */
export function entropyToEffects(entropy: number): { reverb: number; distortion: number } {
  // High entropy (noisy) → more effects
  // Low entropy (pure tones) → cleaner sound
  return {
    reverb: entropy * 0.6,
    distortion: entropy * 0.3,
  };
}

/**
 * Main spectral sonifier class
 */
export class SpectralSonifier {
  private Tone: any = null;
  private synths: any[] = [];
  private fx: {
    filter: any;
    reverb: any;
    compressor: any;
  } | null = null;
  private isPlaying = false;

  async init(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Load Tone.js from CDN
      this.Tone = await loadToneFromCDN();
      const Tone = this.Tone;

      await Tone.start();

      // Create effects chain
      this.fx = {
        filter: new Tone.Filter({
          type: 'lowpass',
          frequency: 2000,
          rolloff: -24,
        }),
        reverb: new Tone.Reverb({
          decay: 3,
          wet: 0.3,
        }),
        compressor: new Tone.Compressor({
          threshold: -20,
          ratio: 4,
          attack: 0.003,
          release: 0.25,
        }),
      };

      // Wait for reverb to be ready
      await this.fx.reverb.generate();

      // Chain: reverb → filter → compressor → destination
      this.fx.reverb.connect(this.fx.filter);
      this.fx.filter.connect(this.fx.compressor);
      this.fx.compressor.toDestination();

      if (DEBUG) console.log('SpectralSonifier initialized');
      return true;
    } catch (err) {
      console.error('Failed to initialize SpectralSonifier:', err);
      return false;
    }
  }

  /**
   * Play spectral components as continuous tones
   */
  async play(spectralData: SpectralData, duration: number = 8): Promise<void> {
    if (!this.Tone || !this.fx) return;

    this.stop();

    const Tone = this.Tone;
    const mappings = mapSpectrum(spectralData.components);

    // Update filter based on centroid
    const maxFreq = spectralData.metadata.sample_rate / 2;  // Nyquist
    const filterFreq = centroidToFilter(spectralData.metadata.spectral_centroid, maxFreq);
    this.fx.filter.frequency.value = filterFreq;

    // Update reverb based on entropy
    const effects = entropyToEffects(spectralData.metadata.spectral_entropy);
    this.fx.reverb.wet.value = effects.reverb;

    if (DEBUG) {
      console.log('Spectral mappings:', mappings);
      console.log('Filter frequency:', filterFreq);
      console.log('Reverb wet:', effects.reverb);
    }

    // Create a synth for each spectral component
    this.synths = mappings.map((mapping, i) => {
      // Use different waveforms for visual variety
      const waveforms = ['sine', 'triangle', 'sawtooth'];
      const waveform = waveforms[i % waveforms.length];

      const synth = new Tone.Synth({
        oscillator: {
          type: waveform,
        },
        envelope: {
          attack: 0.5,
          decay: 0.2,
          sustain: 0.8,
          release: 1,
        },
        volume: Tone.gainToDb(mapping.velocity * 0.3),  // Scale down for better mix
      }).connect(this.fx.reverb);

      // Apply panning
      const panner = new Tone.Panner(mapping.pan).connect(synth);
      synth.connect(panner);
      panner.connect(this.fx.reverb);

      // Trigger note with slight delay based on phase
      const startTime = `+${mapping.delay / 1000}`;
      synth.triggerAttack(mapping.audioFrequency, startTime);

      return synth;
    });

    this.isPlaying = true;

    // Auto-release after duration
    setTimeout(() => {
      this.stop();
    }, duration * 1000);
  }

  /**
   * Stop all playing synths
   */
  stop(): void {
    if (!this.Tone) return;

    const now = this.Tone.now();
    this.synths.forEach((synth) => {
      try {
        synth.triggerRelease(now + 0.1);
        setTimeout(() => synth.dispose(), 2000);
      } catch (err) {
        // Synth may already be disposed
      }
    });

    this.synths = [];
    this.isPlaying = false;

    if (DEBUG) console.log('Stopped all synths');
  }

  /**
   * Update filter cutoff in real-time
   */
  setFilterCutoff(freq: number): void {
    if (this.fx) {
      this.fx.filter.frequency.rampTo(freq, 0.1);
    }
  }

  /**
   * Update reverb wetness in real-time
   */
  setReverbWet(wet: number): void {
    if (this.fx) {
      this.fx.reverb.wet.value = wet;
    }
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
   * Dispose of all resources
   */
  dispose(): void {
    this.stop();
    if (this.fx) {
      this.fx.filter.dispose();
      this.fx.reverb.dispose();
      this.fx.compressor.dispose();
      this.fx = null;
    }
  }
}
