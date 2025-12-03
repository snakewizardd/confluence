// generators.ts - Synthetic data that feels alive

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

/**
 * Growth curve - sigmoid with organic noise
 * Models: crop growth, learning curves, adoption patterns
 */
export function generateGrowth(
  points: number = 100,
  noise: number = 0.05
): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  const now = Date.now();

  for (let i = 0; i < points; i++) {
    const t = i / points;
    // Sigmoid: 1 / (1 + e^(-k(t-0.5))) stretched to [0,1]
    const sigmoid = 1 / (1 + Math.exp(-12 * (t - 0.5)));
    // Add perlin-like noise (simplified: layered sine waves)
    const n = Math.sin(t * 13.7) * 0.3 + Math.sin(t * 31.4) * 0.2 + Math.sin(t * 67.1) * 0.1;
    const value = Math.max(0, Math.min(1, sigmoid + n * noise));

    result.push({
      timestamp: now - (points - i) * 3600000, // hourly points going back
      value
    });
  }
  return result;
}

/**
 * Flow curve - sine wave with drift
 * Models: river flow, breathing, tidal patterns, seasons
 */
export function generateFlow(
  points: number = 100,
  frequency: number = 3,
  drift: number = 0.1
): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  const now = Date.now();

  for (let i = 0; i < points; i++) {
    const t = i / points;
    // Base wave
    const wave = Math.sin(t * Math.PI * 2 * frequency);
    // Drift (slow wandering of the baseline)
    const d = Math.sin(t * Math.PI * 0.5) * drift;
    // Normalize to [0,1]
    const value = (wave + 1) / 2 + d;

    result.push({
      timestamp: now - (points - i) * 3600000,
      value: Math.max(0, Math.min(1, value))
    });
  }
  return result;
}

/**
 * Chaos curve - for when you need entropy
 * Models: weather, markets, consciousness fluctuations
 */
export function generateChaos(
  points: number = 100,
  seed: number = 42
): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  const now = Date.now();

  // Simple seeded PRNG (mulberry32)
  let state = seed;
  const random = () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  let value = 0.5;
  for (let i = 0; i < points; i++) {
    // Random walk with mean reversion
    value += (random() - 0.5) * 0.1;
    value += (0.5 - value) * 0.02; // pull toward center
    value = Math.max(0, Math.min(1, value));

    result.push({
      timestamp: now - (points - i) * 3600000,
      value
    });
  }
  return result;
}
