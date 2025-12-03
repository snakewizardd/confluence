'use client'

import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { mapRange, normalize } from '@confluence/shared'
import { MUSICAL_SCALES } from '@confluence/shared'
import type { DataPoint } from '@/lib/pulse/types'

interface Props {
  growthData: DataPoint[]
  flowData: DataPoint[]
  harmony: number
  isPlaying: boolean
  onPlayPause: () => void
}

export function PulseSonification({ growthData, flowData, harmony, isPlaying, onPlayPause }: Props) {
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const sequenceRef = useRef<Tone.Sequence | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize Tone.js synth
    if (!synthRef.current) {
      // Create a warm, organic synth
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 0.5,
          decay: 0.3,
          sustain: 0.4,
          release: 1.5,
        },
      }).toDestination()

      // Adjust volume for gentleness
      synthRef.current.volume.value = -12
    }

    return () => {
      // Cleanup
      if (sequenceRef.current) {
        sequenceRef.current.dispose()
      }
      if (synthRef.current) {
        synthRef.current.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (!synthRef.current) return

    const startSonification = async () => {
      if (isPlaying && !isInitialized) {
        await Tone.start()
        setIsInitialized(true)
      }

      if (isPlaying) {
        // Dispose old sequence
        if (sequenceRef.current) {
          sequenceRef.current.dispose()
        }

        // Map growth data to melody (pitch)
        // Higher growth = higher pitch
        const rootNote = 'C4'
        const scale = MUSICAL_SCALES.pentatonic // Gentle, harmonious scale
        const baseFreq = Tone.Frequency(rootNote).toFrequency()

        // Sample data points for melody
        const melodyPoints = growthData.filter((_, i) => i % 5 === 0)

        const notes = melodyPoints.map(point => {
          // Map value (0-1) to scale index
          const scaleIndex = Math.floor(mapRange(point.value, 0, 1, 0, scale.length - 1))
          const semitones = scale[scaleIndex]
          const freq = baseFreq * Math.pow(2, semitones / 12)
          return Tone.Frequency(freq, 'hz').toNote()
        })

        // Map flow data to rhythm (timing)
        // Sample flow points
        const rhythmPoints = flowData.filter((_, i) => i % 5 === 0)

        const timings = rhythmPoints.map(point => {
          // Map value to note duration
          // Higher flow = faster rhythm
          return mapRange(point.value, 0, 1, 0.8, 0.3)
        })

        // Map harmony to consonance (filter frequency)
        // Higher harmony = brighter sound
        const filterFreq = mapRange(harmony, 0, 1, 500, 2000)

        // Add filter
        const filter = new Tone.Filter(filterFreq, 'lowpass').toDestination()
        synthRef.current.disconnect()
        synthRef.current.connect(filter)

        // Create sequence
        let index = 0
        sequenceRef.current = new Tone.Sequence(
          (time, note) => {
            if (synthRef.current && note) {
              synthRef.current.triggerAttackRelease(note, timings[index % timings.length], time)
              index++
            }
          },
          notes,
          '4n' // Quarter note subdivisions
        ).start(0)

        // Set gentle tempo based on harmony
        const bpm = mapRange(harmony, 0, 1, 40, 60) // Slower when less harmonious
        Tone.Transport.bpm.value = bpm

        // Start transport
        Tone.Transport.start()
      } else {
        // Stop playback
        Tone.Transport.stop()
        if (sequenceRef.current) {
          sequenceRef.current.stop()
        }
      }
    }

    startSonification()

    return () => {
      Tone.Transport.stop()
    }
  }, [isPlaying, growthData, flowData, harmony, isInitialized])

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-earth-200">
      <div className="text-center">
        <h3 className="text-lg font-serif text-earth-900 mb-3">Sonification</h3>
        <p className="text-sm text-earth-600 mb-6 max-w-md mx-auto">
          Growth becomes melody. Flow becomes rhythm. Harmony shapes consonance.
          Listen to the unity of patterns.
        </p>

        <button
          onClick={onPlayPause}
          className={`
            px-8 py-4 rounded-full font-mono text-sm
            transition-all duration-300 ease-out
            ${
              isPlaying
                ? 'bg-gradient-to-r from-water-500 to-growth-500 text-white shadow-lg scale-105'
                : 'bg-earth-100 text-earth-700 hover:bg-earth-200 shadow'
            }
          `}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <div className="mt-6 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="text-center">
            <p className="text-xs text-earth-500 mb-1">Melody</p>
            <p className="text-sm font-mono text-growth-700">Growth → Pitch</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-earth-500 mb-1">Rhythm</p>
            <p className="text-sm font-mono text-water-700">Flow → Timing</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-earth-500 mb-1">Timbre</p>
            <p className="text-sm font-mono text-earth-700">Harmony → Tone</p>
          </div>
        </div>

        {isPlaying && (
          <div className="mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-water-100/50 rounded-full">
              <div className="w-2 h-2 bg-water-500 rounded-full animate-pulse" />
              <span className="text-xs text-water-700 font-mono">Playing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
