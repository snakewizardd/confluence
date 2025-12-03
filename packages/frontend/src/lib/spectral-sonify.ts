// spectral-sonify.ts - Spectral Sonification Engine
// Transform hidden frequencies into audible sound

declare global {
  interface Window {
    Tone: any;
  }
}

async function loadToneJS(): Promise<void> {
  if (typeof window !== 'undefined' && window.Tone) return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js';
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export class SpectralSonifier {
  private synths: any[] = [];
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    await loadToneJS();
    const Tone = window.Tone;
    await Tone.start();

    // Create synths for spectral components
    for (let i = 0; i < 8; i++) {
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 }
      }).toDestination();
      this.synths.push(synth);
    }

    this.initialized = true;
  }

  play(components: Array<{frequency: number, power_normalized: number}>): void {
    if (!this.initialized || !window.Tone) return;

    components.slice(0, 8).forEach((comp, i) => {
      const audioFreq = this.mapFrequency(comp.frequency);
      const velocity = comp.power_normalized * 0.8;
      this.synths[i]?.triggerAttackRelease(audioFreq, '2n', undefined, velocity);
    });
  }

  stop(): void {
    this.synths.forEach(s => s?.triggerRelease?.());
  }

  private mapFrequency(dataFreq: number): number {
    // Map data frequency to audible range (100-800 Hz)
    const minAudio = 100;
    const maxAudio = 800;
    const mapped = minAudio + (dataFreq % 1) * (maxAudio - minAudio);
    return Math.max(minAudio, Math.min(maxAudio, mapped));
  }
}
