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

// Add this to math.ts - the actual harmony algorithm

export interface HarmonyMetrics {
  overall: number;        // 0-1, the unified score
  coherence: number;      // how similar are the patterns?
  balance: number;        // how centered around 0.5?
  momentum: number;       // is it growing, stable, or declining?
  volatility: number;     // how much noise/chaos?
}

/**
 * Calculate harmony between multiple time series
 * This is the SOUL of the project - how we measure unity
 */
export function calculateHarmony(
  series: Array<{ value: number }[]>
): HarmonyMetrics {
  if (series.length === 0 || series[0].length === 0) {
    return { overall: 0.5, coherence: 0.5, balance: 0.5, momentum: 0, volatility: 0 };
  }

  const allValues = series.flatMap(s => s.map(p => p.value));
  const n = allValues.length;

  // Balance: how close to center (0.5)?
  const mean = allValues.reduce((a, b) => a + b, 0) / n;
  const balance = 1 - Math.abs(mean - 0.5) * 2;

  // Volatility: standard deviation normalized
  const variance = allValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const volatility = Math.min(1, stdDev * 2); // cap at 1

  // Momentum: trend direction (last third vs first third)
  const third = Math.floor(n / 3);
  const firstThird = allValues.slice(0, third);
  const lastThird = allValues.slice(-third);
  const firstMean = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
  const lastMean = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;
  const momentum = (lastMean - firstMean); // -1 to 1

  // Coherence: correlation between series (if multiple)
  let coherence = 1;
  if (series.length > 1) {
    // Simplified: compare first two series
    const s1 = series[0].map(p => p.value);
    const s2 = series[1].map(p => p.value);
    const minLen = Math.min(s1.length, s2.length);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    for (let i = 0; i < minLen; i++) {
      dotProduct += s1[i] * s2[i];
      norm1 += s1[i] * s1[i];
      norm2 += s2[i] * s2[i];
    }
    coherence = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2) + 0.0001);
    coherence = (coherence + 1) / 2; // normalize to 0-1
  }

  // Overall: weighted combination
  // High harmony = balanced, coherent, low volatility, stable momentum
  const overall = (
    balance * 0.3 +
    coherence * 0.3 +
    (1 - volatility) * 0.2 +
    (1 - Math.abs(momentum)) * 0.2
  );

  return {
    overall: Math.max(0, Math.min(1, overall)),
    coherence,
    balance,
    momentum,
    volatility
  };
}
