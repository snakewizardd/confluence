# The Pulse - First Living Feature

The proof of concept that the philosophy works.

## What It Is

A self-contained meditation on data as living system. Growth emerges as a sigmoid curve. Flow undulates as a sine wave. Their harmony is measured by convergence. The patterns become sound and sight.

## How to Experience It

```bash
# Ensure Docker is running
pnpm run breathe

# Or run frontend only
pnpm --filter @confluence/frontend dev
```

Navigate to: **http://localhost:3000/pulse**

## What You'll See

1. **Harmony Score** - A percentage showing how aligned growth and flow are
2. **Visualization** - Organic curves: mountains (growth) and rivers (flow)
3. **Sonification Controls** - Play/pause to hear the data as music

## The Experience

- Click **Play** to start the sonification
- Watch the visualization gently pulse in rhythm
- Listen as growth becomes melody (higher growth = higher pitch)
- Feel flow become rhythm (higher flow = faster notes)
- Observe harmony shape timbre (higher harmony = brighter sound)

## Philosophy Demonstrated

- **No external APIs** - All data generated locally using math
- **Organic visualization** - D3.js curves feel like nature, not charts
- **Meaningful sonification** - Tone.js maps data dimensions to musical parameters
- **Meditative pace** - Slow animations, gentle transitions
- **Unity thesis** - Growth and flow are not separate, but facets of one pattern

## Technical Details

### Data Generation
- **Growth**: Sigmoid curve (0 to 1) with 3% noise - represents emergence
- **Flow**: Sine wave (3 cycles) with drift + 4% noise - represents rhythm
- 100 points over 10 seconds

### Harmony Calculation
Uses `calculateHarmony()` from shared utils:
- Combines all growth and flow values
- Calculates variance (how different they are)
- Returns 1 - variance (lower variance = higher harmony)

### Visualization
- D3.js with `curveCatmullRom` for smooth, organic curves
- Growth: solid green area (mountains rising)
- Flow: dashed blue line (rivers flowing)
- Gradients for depth and dimension
- Gentle pulsing when playing

### Sonification
- **Pentatonic scale** for harmoniousness
- **Growth → Pitch**: Higher values = higher notes
- **Flow → Duration**: Higher values = faster rhythm
- **Harmony → Filter**: Higher harmony = brighter tone (2000Hz vs 500Hz)
- **Tempo**: 40-60 BPM based on harmony (slower when less harmonious)

## Files

```
packages/frontend/src/
├── app/pulse/page.tsx                    # Main page component
├── components/pulse/
│   ├── PulseVisualization.tsx           # D3.js visualization
│   └── PulseSonification.tsx            # Tone.js sonification
└── lib/pulse/
    ├── types.ts                          # TypeScript types
    └── dataGenerator.ts                  # Synthetic data generation
```

## Next Steps

This is the foundation. Real features will:
- Fetch actual data from USDA/NOAA/NASA APIs
- Calculate more sophisticated harmony metrics
- Create more complex visualizations (Three.js 3D mountains)
- Compose multi-voice sonifications
- Store reflections and meditations in database

But The Pulse proves the core thesis: data can be experienced as a living, unified system.

---

*"Mountains rise. Rivers flow. Patterns converge."*
