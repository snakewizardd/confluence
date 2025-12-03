# @confluence/shared

The common language - types and utilities shared across the system.

## Philosophy

In a unified system, all parts speak the same language.
This package contains the vocabulary - the types, utilities, and constants
that allow frontend, backend, and AI services to understand each other.

## Structure

```
src/
├── types/           # The forms - data structures
│   ├── data.ts      # Data types (time series, geo, stats)
│   ├── harmony.ts   # Harmony metrics and sonification
│   └── api.ts       # API communication shapes
├── utils/           # The tools - shared functions
│   ├── time.ts      # Time manipulation
│   ├── math.ts      # Mathematical utilities
│   └── validation.ts # Zod validation helpers
└── constants/       # The unchanging truths
```

## Usage

```typescript
import { TimeSeries, calculateHarmony, HARMONY_THRESHOLDS } from '@confluence/shared'

// Validate data
const series = TimeSeriesSchema.parse(rawData)

// Calculate harmony
const harmonyScore = calculateHarmony(metrics)
```

## Design Principles

- All types use Zod for runtime validation
- Utilities are pure functions
- Constants are immutable
- Everything is typed, nothing is assumed
