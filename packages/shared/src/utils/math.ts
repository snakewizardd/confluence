/**
 * Mathematical utilities - the universal language
 */

export const normalize = (value: number, min: number, max: number): number => {
  if (max === min) return 0
  return (value - min) / (max - min)
}

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

// Calculate harmony score from multiple metrics
export const calculateHarmony = (metrics: number[]): number => {
  if (metrics.length === 0) return 0

  // Harmony is inversely related to variance
  const mean = metrics.reduce((a, b) => a + b, 0) / metrics.length
  const variance = metrics.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / metrics.length

  // Lower variance = higher harmony
  return clamp(1 - variance, 0, 1)
}
