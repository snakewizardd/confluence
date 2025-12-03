# AI Assistant Context Guide

When consulting external AI assistants about this project, share these specific files and information based on the task.

## Essential Context (Always Share)

1. **[claude.md](./claude.md)** - The philosophical vision and core thesis
2. **[README.md](./README.md)** - Architecture overview and tech stack

## Context by Task Type

### 🎨 Frontend Development (UI, Visualizations, Sonification)

**Core Files:**
- [packages/frontend/src/app/layout.tsx](packages/frontend/src/app/layout.tsx) - Root layout with fonts
- [packages/frontend/src/app/page.tsx](packages/frontend/src/app/page.tsx) - Landing page
- [packages/frontend/tailwind.config.js](packages/frontend/tailwind.config.js) - Color palette and theme
- [packages/frontend/next.config.js](packages/frontend/next.config.js) - Next.js configuration

**Type Definitions:**
- [packages/shared/src/types/data.ts](packages/shared/src/types/data.ts) - TimeSeries, GeoPoint, StatisticalSummary schemas
- [packages/shared/src/types/harmony.ts](packages/shared/src/types/harmony.ts) - HarmonyScore, SonificationParams schemas
- [packages/shared/src/utils/math.ts](packages/shared/src/utils/math.ts) - normalize, lerp, calculateHarmony functions

**Package Config:**
- [packages/frontend/package.json](packages/frontend/package.json) - Dependencies (D3, Three.js, Tone.js)

**What to Explain:**
- We use Zod schemas from `@confluence/shared` for type safety
- Colors are nature-inspired (earth, water, growth palettes)
- D3.js for data visualization, Three.js for 3D, Tone.js for music
- Data should come from backend API at `http://localhost:8000`

### 🔧 Backend Development (APIs, Data Fetching, R Integration)

**Core Files:**
- [packages/backend/confluence/main.py](packages/backend/confluence/main.py) - FastAPI application
- [packages/backend/confluence/config.py](packages/backend/confluence/config.py) - Settings and environment vars
- [packages/backend/pyproject.toml](packages/backend/pyproject.toml) - Python dependencies
- [packages/backend/scripts/init.sql](packages/backend/scripts/init.sql) - Database schema

**What to Explain:**
- FastAPI with async/await patterns
- R integration via rpy2 for statistical computing
- PostgreSQL for persistence, Redis for caching
- Data sources: USDA, NOAA, NASA (environment vars for API keys)
- Return types should match Zod schemas in shared package

**Key Directories:**
- `confluence/api/` - Where API routes will go
- `confluence/services/` - Where data fetchers will go
- `confluence/compute/` - Where R statistical functions will go
- `confluence/models/` - Where SQLAlchemy models will go

### 📦 Shared Types & Utilities (Cross-package Development)

**Core Files:**
- [packages/shared/src/types/data.ts](packages/shared/src/types/data.ts) - Data structures
- [packages/shared/src/types/harmony.ts](packages/shared/src/types/harmony.ts) - Harmony metrics
- [packages/shared/src/types/api.ts](packages/shared/src/types/api.ts) - API response wrappers
- [packages/shared/src/utils/math.ts](packages/shared/src/utils/math.ts) - Mathematical utilities
- [packages/shared/src/utils/time.ts](packages/shared/src/utils/time.ts) - Time utilities
- [packages/shared/src/constants/index.ts](packages/shared/src/constants/index.ts) - Constants

**What to Explain:**
- All types use Zod for runtime validation
- Utilities are pure functions
- This package is imported by frontend and backend
- Any changes here affect multiple packages

### 🐳 Docker & Infrastructure (DevOps, Deployment)

**Core Files:**
- [docker-compose.yml](docker-compose.yml) - Service orchestration
- [packages/backend/Dockerfile](packages/backend/Dockerfile) - Python + R image
- [packages/frontend/Dockerfile](packages/frontend/Dockerfile) - Node + pnpm image
- [packages/backend/scripts/init.sql](packages/backend/scripts/init.sql) - Database initialization
- [.dockerignore](.dockerignore) - What to exclude from builds

**What to Explain:**
- Build context is root directory (not individual packages)
- Volume mounts for hot-reload: frontend/src and backend/confluence
- PostgreSQL needs init.sql to run on first start
- Redis for caching/ephemeral state
- Health checks ensure services start in correct order

### 🗄️ Database Design (Schema, Queries)

**Core Files:**
- [packages/backend/scripts/init.sql](packages/backend/scripts/init.sql) - Complete schema
- [packages/shared/src/types/data.ts](packages/shared/src/types/data.ts) - Data structure types
- [packages/shared/src/types/harmony.ts](packages/shared/src/types/harmony.ts) - Harmony types

**Tables:**
- `time_series` - Metadata for data streams
- `time_series_data` - Actual points (indexed by timestamp)
- `harmony_scores` - System balance measurements

**What to Explain:**
- JSONB columns for flexible metadata/context
- Triggers for auto-updating timestamps
- UUID primary keys
- Indexes optimized for time-based queries

### 🎵 Data Sonification (Tone.js, Music Generation)

**Relevant Files:**
- [packages/shared/src/types/harmony.ts](packages/shared/src/types/harmony.ts) - SonificationParams type
- [packages/shared/src/constants/index.ts](packages/shared/src/constants/index.ts) - MUSICAL_SCALES
- [packages/frontend/package.json](packages/frontend/package.json) - Tone.js dependency

**What to Explain:**
- Map data dimensions to musical parameters (melody, rhythm, harmony)
- Musical scales defined in shared constants
- Tone.js for web audio synthesis
- Data patterns become sound: growth → melody, flow → rhythm

### 📊 Data Visualization (D3.js, Three.js)

**Relevant Files:**
- [packages/frontend/tailwind.config.js](packages/frontend/tailwind.config.js) - Color palettes
- [packages/shared/src/types/data.ts](packages/shared/src/types/data.ts) - Data structures to visualize
- [packages/shared/src/utils/math.ts](packages/shared/src/utils/math.ts) - normalize, mapRange functions
- [packages/frontend/package.json](packages/frontend/package.json) - D3, Three.js dependencies

**What to Explain:**
- Use nature-inspired colors (earth/water/growth from Tailwind config)
- Visualizations should show patterns, not just data
- Three.js for 3D mathematical nature (mountains from functions, rivers from data)
- D3.js for statistical charts and time series

## Quick Reference: File Purposes

```
claude.md                     → Core philosophy and vision
README.md                     → Architecture and getting started
docker-compose.yml            → Infrastructure orchestration

packages/frontend/
├── src/app/                  → Next.js pages and layouts
├── package.json              → Frontend dependencies
└── tailwind.config.js        → Theme and colors

packages/backend/
├── confluence/main.py        → FastAPI app entry point
├── confluence/config.py      → Settings and env vars
├── pyproject.toml            → Python dependencies
└── scripts/init.sql          → Database schema

packages/shared/
├── src/types/                → Zod schemas (data, harmony, API)
├── src/utils/                → Pure functions (math, time)
└── src/constants/            → Immutable values
```

## Example Prompts for External AI

### For Frontend Work:
> "I'm building a D3.js visualization component for this project. Here's the context:
> - [Attach: claude.md, packages/shared/src/types/data.ts, packages/frontend/tailwind.config.js]
> - I need to visualize TimeSeries data using the earth/water/growth color palette
> - The component should show harmony in the data patterns"

### For Backend Work:
> "I need to create a FastAPI endpoint to fetch USDA agricultural data. Context:
> - [Attach: claude.md, packages/backend/confluence/main.py, packages/shared/src/types/data.ts]
> - The endpoint should return data matching the TimeSeries schema
> - Use async/await patterns consistent with the existing code"

### For Docker Issues:
> "The backend container won't start. Here's the setup:
> - [Attach: docker-compose.yml, packages/backend/Dockerfile, error logs]
> - Build context is root directory
> - Need help debugging dependency installation"

## Pro Tips

1. **Always include claude.md** - Helps AI understand the philosophical context
2. **Share type definitions** - Zod schemas show exact data structures expected
3. **Include package.json** - Shows what libraries are available
4. **For errors**: Share docker-compose.yml + relevant Dockerfile + error logs
5. **For new features**: Share existing similar code as examples of patterns to follow

## What NOT to Share

- `.env` file (contains secrets)
- `node_modules/` or any installed dependencies
- `poetry.lock` or `pnpm-lock.yaml` (too large, auto-generated)
- Docker volumes or build artifacts

---

Remember: This is a philosophical instrument, not just an app. Any AI assisting should understand the unity thesis.
