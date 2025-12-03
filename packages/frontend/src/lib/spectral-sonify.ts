// spectral-sonify.ts - Spectral Sonification Engine
// Transform hidden frequencies into audible sound

declare global {
  interface Window {
    Tone: any;
  }
}

async function loadToneJS(): Promise<void> {
  console.log('[SPECTRUM] loadToneJS() called');
  console.log('[SPECTRUM] window exists:', typeof window !== 'undefined');
  console.log('[SPECTRUM] window.Tone exists:', typeof window !== 'undefined' && !!window.Tone);

  if (typeof window !== 'undefined' && window.Tone) {
    console.log('[SPECTRUM] Tone.js already loaded, skipping');
    return;
  }

  console.log('[SPECTRUM] Loading Tone.js from CDN...');
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js';
    script.onload = () => {
      console.log('[SPECTRUM] Tone.js loaded successfully');
      console.log('[SPECTRUM] window.Tone after load:', !!window.Tone);
      resolve();
    };
    script.onerror = (e) => {
      console.error('[SPECTRUM] Failed to load Tone.js:', e);
      reject(e);
    };
    document.head.appendChild(script);
  });
}

export class SpectralSonifier {
  private synths: any[] = [];
  private initialized = false;

  async init(): Promise<void> {
    console.log('[SPECTRUM] init() called');
    console.log('[SPECTRUM] initialized:', this.initialized);

    if (this.initialized) {
      console.log('[SPECTRUM] already initialized, skipping');
      return;
    }

    console.log('[SPECTRUM] Loading Tone.js...');
    await loadToneJS();

    const Tone = window.Tone;
    console.log('[SPECTRUM] Tone object:', Tone);
    console.log('[SPECTRUM] Tone.context:', Tone?.context);

    console.log('[SPECTRUM] Starting audio context...');
    await Tone.start();
    console.log('[SPECTRUM] Audio context started');
    console.log('[SPECTRUM] Audio context state:', Tone.context.state);

    // Create synths for spectral components
    console.log('[SPECTRUM] Creating synths...');
    for (let i = 0; i < 8; i++) {
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 }
      }).toDestination();
      this.synths.push(synth);
      console.log(`[SPECTRUM] Created synth ${i}`);
    }
    console.log('[SPECTRUM] Created', this.synths.length, 'synths');

    this.initialized = true;
    console.log('[SPECTRUM] Initialization complete');
  }

  play(components: Array<{frequency: number, power_normalized: number}>): void {
    console.log('[SPECTRUM] play() called');
    console.log('[SPECTRUM] initialized:', this.initialized);
    console.log('[SPECTRUM] window.Tone exists:', !!window.Tone);
    console.log('[SPECTRUM] components received:', components);
    console.log('[SPECTRUM] components length:', components?.length);
    console.log('[SPECTRUM] synths available:', this.synths.length);

    if (!this.initialized) {
      console.error('[SPECTRUM] Not initialized! Call init() first');
      return;
    }

    if (!window.Tone) {
      console.error('[SPECTRUM] window.Tone not available!');
      return;
    }

    if (!components || components.length === 0) {
      console.error('[SPECTRUM] No components to play');
      return;
    }

    const now = window.Tone.now();
    console.log('[SPECTRUM] Current time:', now);

    components.slice(0, 8).forEach((comp, i) => {
      const audioFreq = this.mapFrequency(comp.frequency);
      const velocity = comp.power_normalized * 0.8;
      console.log(`[SPECTRUM] Playing synth ${i}:`, {
        dataFreq: comp.frequency,
        audioFreq,
        velocity,
        power: comp.power_normalized
      });
      this.synths[i]?.triggerAttackRelease(audioFreq, '2n', now + (i * 0.1), velocity);
    });

    console.log('[SPECTRUM] All notes triggered');
  }

  stop(): void {
    console.log('[SPECTRUM] stop() called');
    console.log('[SPECTRUM] Releasing', this.synths.length, 'synths');
    this.synths.forEach((s, i) => {
      console.log(`[SPECTRUM] Releasing synth ${i}`);
      s?.triggerRelease?.();
    });
  }

  private mapFrequency(dataFreq: number): number {
    // Map data frequency to audible range (100-800 Hz)
    const minAudio = 100;
    const maxAudio = 800;
    const mapped = minAudio + (dataFreq % 1) * (maxAudio - minAudio);
    return Math.max(minAudio, Math.min(maxAudio, mapped));
  }
}
