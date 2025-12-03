// sonify.ts - Turn data into sound
import * as Tone from 'tone';

export interface SonificationConfig {
  scale: number[];       // MIDI notes in scale
  baseOctave: number;    // starting octave
  tempo: number;         // BPM
  volume: number;        // 0-1
}

const SCALES = {
  // Pentatonic - always consonant, peaceful
  pentatonic: [0, 2, 4, 7, 9],
  // Dorian - melancholy but hopeful
  dorian: [0, 2, 3, 5, 7, 9, 10],
  // Lydian - dreamy, expansive
  lydian: [0, 2, 4, 6, 7, 9, 11],
  // Minor - contemplative
  minor: [0, 2, 3, 5, 7, 8, 10],
};

export class DataSonifier {
  private synth: Tone.PolySynth | null = null;
  private sequence: Tone.Sequence | null = null;
  private isPlaying = false;

  constructor(private config: SonificationConfig = {
    scale: SCALES.pentatonic,
    baseOctave: 3,
    tempo: 72,
    volume: 0.6
  }) {}

  async init() {
    await Tone.start();

    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.4,
        release: 1.2
      }
    }).toDestination();

    this.synth.volume.value = Tone.gainToDb(this.config.volume);
    Tone.getTransport().bpm.value = this.config.tempo;
  }

  /**
   * Convert a value (0-1) to a note in the scale
   */
  valueToNote(value: number): string {
    const { scale, baseOctave } = this.config;
    const scaleIndex = Math.floor(value * scale.length);
    const octaveOffset = Math.floor(value * 2); // span 2 octaves
    const semitone = scale[Math.min(scaleIndex, scale.length - 1)];
    const midiNote = (baseOctave + octaveOffset) * 12 + semitone;
    return Tone.Frequency(midiNote, 'midi').toNote();
  }

  /**
   * Play a time series as melody
   */
  playSeries(
    series: Array<{ value: number }>,
    rhythmSeries?: Array<{ value: number }> // optional: modulates timing
  ) {
    if (!this.synth) return;

    // Convert series to notes
    const notes = series.map((point, i) => {
      const note = this.valueToNote(point.value);
      // Rhythm from second series if provided
      const duration = rhythmSeries
        ? 0.1 + rhythmSeries[i % rhythmSeries.length].value * 0.4
        : 0.25;
      return { note, duration };
    });

    // Create sequence
    if (this.sequence) {
      this.sequence.dispose();
    }

    let index = 0;
    this.sequence = new Tone.Sequence(
      (time, _) => {
        if (index < notes.length && this.synth) {
          const { note, duration } = notes[index];
          this.synth.triggerAttackRelease(note, duration, time);
          index++;
        }
      },
      notes.map((_, i) => i),
      '8n'
    );

    this.sequence.loop = true;
    this.sequence.start(0);
    Tone.getTransport().start();
    this.isPlaying = true;
  }

  stop() {
    Tone.getTransport().stop();
    if (this.sequence) {
      this.sequence.stop();
    }
    this.isPlaying = false;
  }

  /**
   * Adjust parameters based on harmony
   */
  setHarmony(harmony: number) {
    if (!this.synth) return;

    // High harmony = more consonant, slower, gentler
    // Low harmony = dissonant, faster, harsher
    const tempo = 60 + (1 - harmony) * 60; // 60-120 BPM
    Tone.getTransport().bpm.value = tempo;

    // Could also modulate: scale choice, reverb, filter cutoff, etc.
  }

  get playing() {
    return this.isPlaying;
  }

  dispose() {
    this.stop();
    this.synth?.dispose();
    this.sequence?.dispose();
  }
}
