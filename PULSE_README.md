# The Pulse - Architect's Implementation

The proof of concept that the philosophy works. This is the SOUL of the project - harmony as mathematical unity.

## What It Is

A self-contained meditation on data as living system. Growth emerges as a sigmoid curve with perlin-like noise. Flow undulates as a sine wave with drift. Their harmony is measured through coherence, balance, momentum, and volatility. The patterns become sound and sight.

## How to Experience It

```bash
# Ensure Docker is running
pnpm run breathe

# Or run frontend only
pnpm --filter @confluence/frontend dev
```

Navigate to: **http://localhost:3000/pulse**

## What You'll See

1. **Canvas Visualization** - Dark gradient with:
   - Flow (blue wave) - breathing, tidal patterns
   - Growth (green line) - emergence, development
   - Harmony indicator (glowing circle) - grows with unity

2. **Harmony Metrics Grid** - Four dimensions:
   - **Coherence** - How similar are the patterns? (correlation)
   - **Balance** - How centered around 0.5?
   - **Momentum** - Is it growing (↑) or declining (↓)?
   - **Volatility** - How much noise/chaos?

3. **Controls**:
   - **▶ Listen** / **⏸ Pause** - Start/stop sonification
   - **↻ Regenerate** - Create new random data

## The Experience

- Click **Listen** to hear growth become melody, flow become rhythm
- Watch the glowing harmony circle pulse with the overall score
- Click **Regenerate** to see different patterns emerge
- Observe how coherence, balance, momentum, and volatility interact

## Philosophy Demonstrated

- **No external APIs** - All data generated using sophisticated algorithms
- **Mathematical rigor** - Real correlation, variance, trend analysis
- **Meaningful sonification** - Pentatonic scale, tempo from harmony
- **Canvas not SVG** - Raw pixels, direct rendering, faster
- **Unity as calculation** - Harmony isn't feeling, it's math

## Technical Implementation

### Data Generation (packages/shared/src/utils/generators.ts)

**Growth: Sigmoid with Perlin-like Noise**
```typescript
const sigmoid = 1 / (1 + Math.exp(-12 * (t - 0.5)))
const noise = Math.sin(t * 13.7) * 0.3 + Math.sin(t * 31.4) * 0.2 + Math.sin(t * 67.1) * 0.1
```
- Models: crop growth, learning curves, adoption patterns
- Layered sine waves create organic noise
- Returns 100 hourly points going back from now

**Flow: Sine with Drift**
```typescript
const wave = Math.sin(t * Math.PI * 2 * frequency)
const drift = Math.sin(t * Math.PI * 0.5) * drift_amount
```
- Models: river flow, breathing, tidal patterns, seasons
- Baseline wanders slowly (drift)
- Normalized to [0,1]

**Chaos: Seeded Random Walk**
- Mulberry32 PRNG for reproducibility
- Random walk with mean reversion (pulls toward 0.5)
- For weather, markets, consciousness fluctuations

### Harmony Calculation (packages/shared/src/utils/math.ts)

The **SOUL** of the project - how we measure unity.

```typescript
interface HarmonyMetrics {
  overall: number;      // 0-1, weighted combination
  coherence: number;    // correlation between series
  balance: number;      // distance from center (0.5)
  momentum: number;     // trend direction (-1 to 1)
  volatility: number;   // normalized std dev
}
```

**Coherence** (Correlation):
```typescript
dotProduct / (sqrt(norm1) * sqrt(norm2))
```
- Compares first two series
- Dot product normalized by vector magnitudes
- 1 = perfectly aligned, 0 = uncorrelated

**Balance**:
```typescript
1 - abs(mean - 0.5) * 2
```
- How centered around 0.5?
- 1 = perfect center, 0 = at extremes

**Momentum**:
```typescript
(lastThirdMean - firstThirdMean)
```
- Positive = upward trend
- Negative = downward trend
- Compares first third vs last third

**Volatility**:
```typescript
min(stdDev * 2, 1)
```
- Standard deviation normalized
- High = chaotic, Low = stable

**Overall** (Weighted):
```typescript
balance * 0.3 + coherence * 0.3 + (1-volatility) * 0.2 + (1-abs(momentum)) * 0.2
```
- High harmony = balanced, coherent, low volatility, stable

### Sonification (packages/frontend/src/lib/sonify.ts)

**DataSonifier Class** - Turn data into sound using Tone.js

**valueToNote()**: Maps 0-1 to musical notes
```typescript
const scaleIndex = floor(value * scale.length)
const octaveOffset = floor(value * 2)  // span 2 octaves
const midiNote = (baseOctave + octaveOffset) * 12 + semitone
```

**playSeries()**: Creates Tone.Sequence
- Growth → melody (pitch via pentatonic scale)
- Flow → rhythm (note duration 0.1-0.5s)
- Loops continuously

**setHarmony()**: Adjusts tempo
```typescript
const tempo = 60 + (1 - harmony) * 60  // 60-120 BPM
```
- High harmony = slow, gentle (60 BPM)
- Low harmony = fast, intense (120 BPM)

**Scales Available**:
- Pentatonic [0,2,4,7,9] - always consonant, peaceful
- Dorian [0,2,3,5,7,9,10] - melancholy but hopeful
- Lydian [0,2,4,6,7,9,11] - dreamy, expansive
- Minor [0,2,3,5,7,8,10] - contemplative

### Visualization (Canvas API)

**Dark Gradient Background**:
```javascript
gradient.addColorStop(0, '#1a1a2e')
gradient.addColorStop(1, '#16213e')
```

**Flow (Water)**: Blue wave, thin stroke
**Growth (Earth)**: Green line, thick stroke
**Harmony Circle**: Glowing center, radius grows with harmony

No D3.js - raw Canvas 2D for performance and control.

## Files

```
packages/shared/src/utils/
├── generators.ts      # Growth, Flow, Chaos generation
└── math.ts           # HarmonyMetrics calculation

packages/frontend/src/
├── app/pulse/page.tsx  # Main page with Canvas viz
└── lib/sonify.ts       # Tone.js sonification engine
```

## What's Different from First Version

1. **No D3.js** - Canvas for direct pixel control
2. **Sophisticated noise** - Layered sine waves (perlin-like)
3. **Full harmony metrics** - Not just overall, but 4 dimensions
4. **Correlation** - Proper dot product coherence calculation
5. **Seeded chaos** - Reproducible randomness
6. **Better sonification** - Scales, tempo modulation, rhythm
7. **Shared generators** - Backend can use same functions

## Next Steps

This foundation enables:
- Real USDA/NOAA/NASA data using same generators as templates
- 3D Three.js visualizations (mountains from growth, rivers from flow)
- Multi-voice sonification (harmony as chords, not just tempo)
- Database storage of harmony scores over time
- AI meditation on harmony patterns

But The Pulse proves the core thesis: **harmony is measurable, calculable, experienceable**.

---

*"Coherence. Balance. Momentum. Volatility. Unity."*
