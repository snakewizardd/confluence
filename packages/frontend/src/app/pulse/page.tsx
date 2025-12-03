'use client'

import { useEffect, useState, useRef } from 'react'
import { PulseVisualization } from '@/components/pulse/PulseVisualization'
import { PulseSonification } from '@/components/pulse/PulseSonification'
import { generatePulseData } from '@/lib/pulse/dataGenerator'
import { calculateHarmony } from '@confluence/shared'
import type { PulseData } from '@/lib/pulse/types'

export default function PulsePage() {
  const [pulseData, setPulseData] = useState<PulseData | null>(null)
  const [harmonyScore, setHarmonyScore] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Generate data on mount
  useEffect(() => {
    const data = generatePulseData()
    setPulseData(data)

    // Calculate harmony from growth and flow patterns
    const growthValues = data.growth.map(d => d.value)
    const flowValues = data.flow.map(d => d.value)
    const combinedMetrics = [...growthValues, ...flowValues]
    const harmony = calculateHarmony(combinedMetrics)

    setHarmonyScore(harmony)
  }, [])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  if (!pulseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-50 via-water-50 to-growth-50">
        <p className="text-earth-600 font-mono text-sm">The system awakens...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-water-50 to-growth-50">
      {/* Header */}
      <header className="pt-12 pb-8 text-center">
        <h1 className="text-5xl font-serif text-earth-900 mb-3">The Pulse</h1>
        <p className="text-lg text-water-700 font-light mb-2">
          Where data breathes. Where patterns flow.
        </p>
        <p className="text-sm text-earth-600 font-mono">
          A meditation on harmony in living systems
        </p>
      </header>

      {/* Harmony Score Display */}
      <div className="max-w-4xl mx-auto px-8 mb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-earth-200">
          <div className="text-center">
            <p className="text-sm text-earth-600 mb-2 font-mono">Harmony</p>
            <div className="relative h-3 bg-earth-100 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-growth-400 to-water-500 transition-all duration-1000 ease-out"
                style={{ width: `${harmonyScore * 100}%` }}
              />
            </div>
            <p className="text-3xl font-serif text-earth-900 mt-3">
              {(harmonyScore * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-water-600 mt-1">
              {harmonyScore > 0.8 ? 'Convergence' : harmonyScore > 0.5 ? 'Balance' : 'Emergence'}
            </p>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="max-w-6xl mx-auto px-8 mb-8">
        <PulseVisualization
          growthData={pulseData.growth}
          flowData={pulseData.flow}
          harmony={harmonyScore}
          isPlaying={isPlaying}
        />
      </div>

      {/* Sonification Controls */}
      <div className="max-w-4xl mx-auto px-8 pb-16">
        <PulseSonification
          growthData={pulseData.growth}
          flowData={pulseData.flow}
          harmony={harmonyScore}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
        />
      </div>

      {/* Footer - Philosophy */}
      <footer className="max-w-3xl mx-auto px-8 pb-12 text-center">
        <p className="text-sm text-earth-500 leading-relaxed">
          Growth emerges as a sigmoid curve with organic noise.
          Flow undulates as a sine wave with gentle drift.
          Their harmony is measured by convergence - how alike they become.
          Listen. Watch. Feel the unity.
        </p>
      </footer>
    </div>
  )
}
