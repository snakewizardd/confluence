# Confluence

Data sonification platform. Transform datasets into music.

## Experience

- **/** - Portal
- **/pulse** - Synthetic data as ambient soundscape
- **/iris** - Fisher's 1936 iris dataset as composition
- **/about** - Philosophy

## Stack

Next.js 14 · FastAPI · R · Tone.js · Canvas API

## Run

```bash
docker-compose up
```

Visit http://localhost:4000

## Deploy

**Frontend:** Vercel-ready (see `packages/frontend/vercel.json`)
**Backend:** Docker-ready (see `docker-compose.yml`)

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
DATABASE_URL=postgresql+asyncpg://confluence:confluence@db:5432/confluence
R_SCRIPT_PATH=/app/r_scripts
```

See `.env.example` for full documentation.

## Development

```bash
# Full stack with Docker
docker-compose up

# Frontend only (requires backend running)
cd packages/frontend && npm run dev

# Backend only
cd packages/backend && uvicorn confluence.main:app --reload
```

## Features

✓ Real-time waveform visualization
✓ Interactive sound controls with keyboard shortcuts
✓ Accessibility (WCAG AA, reduced motion support)
✓ Responsive design
✓ Error boundaries and graceful degradation

## License

MIT
