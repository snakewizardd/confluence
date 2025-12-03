# @confluence/shared

The common language - types and utilities shared across the system.

## Overview

Shared TypeScript package containing types, utilities, and constants used across frontend and backend. Ensures type safety and consistency throughout the monorepo using Zod for runtime validation.

## Structure

```
src/
├── types/           # Type definitions and schemas
│   ├── index.ts         # Re-exports all types
│   ├── data.ts          # Data structures (time series, geo, stats)
│   ├── harmony.ts       # Harmony metrics and sonification types
│   └── api.ts           # API communication shapes
├── utils/           # Shared utility functions
│   ├── index.ts         # Re-exports all utilities
│   ├── time.ts          # Time manipulation helpers
│   ├── math.ts          # Mathematical utilities
│   ├── generators.ts    # Data generation functions
│   └── validation.ts    # Zod validation helpers
└── constants/       # Shared constants
    └── index.ts         # System-wide constants and thresholds
```

## Usage

### Importing Types

```typescript
// Import from main entry point
import { TimeSeries, HarmonyMetrics } from '@confluence/shared'

// Or import from specific subpaths
import { TimeSeries } from '@confluence/shared/types'
import { calculateHarmony } from '@confluence/shared/utils'
```

### Using Validation

```typescript
import { TimeSeriesSchema } from '@confluence/shared/types'

// Runtime validation with Zod
const validated = TimeSeriesSchema.parse(rawData)

// Safe parsing with error handling
const result = TimeSeriesSchema.safeParse(rawData)
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}
```

### Utilities

```typescript
import { calculateHarmony, formatTime } from '@confluence/shared/utils'

// Use pure functions
const harmonyScore = calculateHarmony(metrics)
const formatted = formatTime(timestamp)
```

## Available Exports

The package provides granular exports for tree-shaking optimization:

- `.` - All exports (types, utils, constants)
- `./types` - All type definitions
- `./utils` - All utility functions
- `./utils/generators` - Data generation utilities
- `./utils/math` - Mathematical helpers
- `./utils/time` - Time manipulation functions
- `./utils/validation` - Zod validation helpers
- `./constants` - System constants

## Development

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# Watch mode for development
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Design Principles

- **Type Safety**: All types use Zod for runtime validation
- **Purity**: Utilities are pure functions without side effects
- **Immutability**: Constants are immutable and frozen
- **Explicitness**: Everything is typed, nothing is assumed
- **Tree-shakeable**: Granular exports for optimal bundling

## Dependencies

- **zod**: Runtime type validation and schema definition

---

Built with precision and shared across the confluence.
