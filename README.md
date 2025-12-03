# Confluence

> Where data becomes music. Where numbers reveal rhythm.

A living philosophical instrument that transforms datasets into sound, demonstrating that statistics and soul are not separate domains but one river with many tributaries.

## What This Is

Confluence is a data sonification and visualization platform that turns numerical patterns into musical experiences. Fisher's 1936 iris dataset becomes a three-voice composition. Time series data pulses with life. Statistical distributions hum their hidden harmonies.

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Tone.js, Canvas API
- **Backend:** FastAPI (Python), R integration for statistical computing
- **Database:** PostgreSQL, Redis
- **Infrastructure:** Docker Compose, GitHub Actions

## Quick Start

```bash
docker-compose up
```

Visit http://localhost:4000

## Available Pages

- `/` - Landing page introducing the instruments
- `/pulse` - Live data visualization with sound synthesis
- `/iris` - Fisher's iris dataset as interactive music
- `/about` - Philosophy and methodology behind the project

## Development

```bash
# Run with hot reload (local development)
pnpm dev:local

# Run full stack in Docker
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# View logs
pnpm logs
```

## Project Structure

```
confluence/
├── packages/
│   ├── frontend/    # Next.js application
│   ├── backend/     # FastAPI + R services
│   └── shared/      # Shared types and utilities
└── docker-compose.yml
```

## Philosophy

Every dataset carries rhythm. Sound reaches us differently than sight—it bypasses analysis and speaks directly to intuition. This project demonstrates that engineering IS philosophy, where the architecture embodies the message.

Read more at `/about` or in `CLAUDE.md`.

## Environment Variables

See `.env.example` files in each package directory for required configuration.

---

Built with rigor, harmony, and intention.
