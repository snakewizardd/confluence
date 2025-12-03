/**
 * Data generation for The Pulse
 *
 * Growth: Sigmoid curve with organic noise - the pattern of emergence
 * Flow: Sine wave with drift - the rhythm of nature
 */

import { normalize } from '@confluence/shared'
import type { PulseData } from './types'

const POINTS = 100
const DURATION = 10000 // 10 seconds

/**
 * Sigmoid function - the curve of growth and emergence
 */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/**
 * Add organic noise to a value
 */
function addNoise(value: number, amount: number = 0.05): number {
  return value + (Math.random() - 0.5) * amount
}

/**
 * Generate growth data - sigmoid curve with noise
 * Represents emergence, development, the unfolding of potential
 */
function generateGrowth(): Array<{ timestamp: number; value: number }> {
  const data = []

  for (let i = 0; i < POINTS; i++) {
    const t = i / POINTS
    const timestamp = t * DURATION

    // Sigmoid curve: slow start, rapid middle, slow end
    // Shifted to center around 0.5, scaled to -6 to +6 range
    const x = (t - 0.5) * 12
    const baseValue = sigmoid(x)

    // Add organic noise
    const value = addNoise(baseValue, 0.03)

    data.push({ timestamp, value })
  }

  return data
}

/**
 * Generate flow data - sine wave with drift
 * Represents cycles, seasons, the ebb and flow of nature
 */
function generateFlow(): Array<{ timestamp: number; value: number }> {
  const data = []
  const frequency = 3 // 3 complete cycles
  const driftAmount = 0.15 // How much the baseline drifts

  for (let i = 0; i < POINTS; i++) {
    const t = i / POINTS
    const timestamp = t * DURATION

    // Sine wave for cyclical pattern
    const wave = Math.sin(t * frequency * Math.PI * 2)

    // Add gentle upward drift
    const drift = t * driftAmount

    // Normalize to 0-1 range and add noise
    const normalized = normalize(wave + drift, -1 - driftAmount, 1 + driftAmount)
    const value = addNoise(normalized, 0.04)

    data.push({ timestamp, value })
  }

  return data
}

/**
 * Generate the pulse - both growth and flow
 */
export function generatePulseData(): PulseData {
  return {
    growth: generateGrowth(),
    flow: generateFlow(),
  }
}
