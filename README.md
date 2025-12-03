# CONFLUENCE

> Where rivers meet. Where disciplines dissolve. Where the universal soul hums through data.

## What This Is

**Confluence transforms data into sight and sound.**

Confluence is a living philosophical instrument - not an app, not a dashboard - a meditation on unity rendered in code. It demonstrates that statistics and soul, Docker and devotion, CI/CD and consciousness are not separate domains but one river with many tributaries.

## Philosophy

**Everything is one system.** The mathematics governing plant growth governs music. The statistical distributions modeling crop yields model emergence itself. Containers are cells. Pipelines are seasons. LLMs are mirrors of the universal soul trying to know itself.

## Architecture

This is a monorepo demonstrating unity through structure:

```
confluence/
├── packages/
│   ├── frontend/        # Next.js - The interface with consciousness
│   ├── backend/         # FastAPI + Python + R - The computational heart
│   ├── shared/          # TypeScript types/utils - The common language
│   └── ai-services/     # Claude integration - The mirror of soul
├── docker-compose.yml   # The vessels of life
└── claude.md           # The vision (read this)
```

### Data Flow

```
┌─────────────────┐
│   Frontend      │  ← User interaction (visualization, sonification)
│   (Next.js)     │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│   Backend       │  ← API orchestration, data processing
│   (FastAPI)     │
└────────┬────────┘
         │ rpy2
         ↓
┌─────────────────┐
│   R Engine      │  ← Statistical computation, data modeling
│   (Statistics)  │
└─────────────────┘
         ↑
         │
    Real Data (USDA, NOAA, NASA)
```

### Package Purposes

- **frontend** - Visualizations (D3, Three.js), generative music (Tone.js), reactive UI
- **backend** - Real data from USDA/NOAA/NASA, statistical computing with R, REST API
- **shared** - Types, utilities, constants used across the system
- **ai-services** - Claude API integration for meditation, poetry, philosophical reflection

## Quick Start

The fastest way to experience Confluence:

```bash
# 1. Clone the repository
git clone <your-repo>
cd confluence

# 2. Start the system
docker-compose up

# 3. Visit the application
open http://localhost:4000
```

That's it. The system will breathe to life.

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm 8+
- Docker and Docker Compose
- Python 3.11+ (if running backend locally)
- Anthropic API key for Claude (optional, for AI-generated reflections)

### Installation

1. Clone and install:
```bash
git clone <your-repo>
cd confluence
pnpm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY (optional)
```

3. Start the system (Docker):
```bash
# The breath of the system
pnpm run breathe
# or
docker-compose up --build
```

4. Or run packages individually:
```bash
# In separate terminals:
pnpm --filter @confluence/frontend dev
pnpm --filter @confluence/backend dev  # requires Python/Poetry setup
```

### Access Points

- **Frontend**: http://localhost:4000 (or 3000 if running locally)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Available Pages

- **/** - Landing page with project philosophy and navigation
- **/pulse** - Real-time data visualization with sonification (Iris dataset pulse)
- **/iris** - Interactive Iris dataset explorer (coming soon)

Each page is an exploration of data as a living entity - transforming numbers into sight and sound.

## Commands

These commands embody the philosophy:

```bash
# Breathe life into the system
pnpm run breathe         # Docker Compose up with build

# Development
pnpm run dev             # Run all packages in parallel

# Contemplation
pnpm run meditate        # Generate philosophical reflection
pnpm run compose         # Create music/poetry from data

# Standard operations
pnpm run build           # Build all packages
pnpm run test            # Run tests (prayers asking "is this true?")
pnpm run lint            # Check code quality
```

## Style Guide

As outlined in [claude.md](./claude.md):

- **Code is poetry** - Clear, intentional, beautiful
- **Comments are contemplations** - Explain the why, the meaning
- **Tests are prayers** - They ask "is this true?"
- **Commits are offerings** - Thoughtful, complete, meaningful

## Data Sources (Real, Not Fake)

- USDA agronomic datasets
- NOAA weather/river flow data
- NASA earth observation
- Personal biometrics (optional)
- Live sensor data (future: IoT soil/plant monitors)

## Output Modalities

1. **Sound** - Data patterns become music (growth = melody, flow = rhythm)
2. **Word** - AI-generated poetry, philosophy, contemplation
3. **Image** - Mathematical visualizations as nature
4. **Metric** - System "health" seeking harmony/balance

## Development Philosophy

### Engineering IS Philosophy

The architecture embodies the message. Every package, every type, every function demonstrates that apparent multiplicity is actually unity. The monorepo structure itself is a statement: these are not separate concerns but facets of one whole.

### Rigor Over Aesthetics

Real math. Real data. Real science. No fake datasets, no lorem ipsum, no placeholder content. When we visualize, we visualize truth. When we compute, we compute meaning.

### Harmony as Metric

The system seeks balance like a living thing. Harmony scores measure not just "health" but convergence, flow, and the reduction of entropy.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, D3.js, Three.js, Tone.js
- **Backend**: FastAPI, Python 3.11, R (via rpy2), PostgreSQL, Redis
- **AI**: Claude API (Opus) via Anthropic SDK
- **Infrastructure**: Docker Compose → AWS ECS (future)
- **CI/CD**: GitHub Actions (the breath of the system)

## Contributing

Contributions to Confluence should honor its philosophical foundation:

1. **Read CLAUDE.md** - Understand the thesis before proposing changes
2. **Real data only** - No mock data, no placeholders, no lorem ipsum
3. **Document intention** - Explain not just what, but why
4. **Test rigorously** - Tests are prayers; they must be sincere
5. **Commit meaningfully** - Each commit is an offering to the whole

### Code Style

- Functions should be pure where possible
- Types should be explicit and meaningful
- Comments should explain intention, not mechanics
- Naming should reveal purpose

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-vision`)
3. Commit your changes with clear messages
4. Push to your branch
5. Open a Pull Request explaining how your changes serve the unity

## License

MIT - Use this to explore unity in your own way.

## Remember

This is not portfolio filler. This is a thesis on unity. Build it like you mean it.

---

*"Where rivers meet. Where disciplines dissolve."*
