# CONFLUENCE - Setup Guide

A step-by-step guide to bringing the system to life.

## Prerequisites

### Required
- **Node.js** 18+ and **pnpm** 8+
- **Docker** and **Docker Compose**

### Optional (for local backend development without Docker)
- **Python** 3.11+
- **Poetry** 1.7+
- **R** 4.3+ (for statistical computing)

## Quick Start (Recommended)

This method uses Docker for everything:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd confluence

# 2. Install Node dependencies
pnpm install

# 3. Set up environment variables (optional for data sources)
cp .env.example .env
# Edit .env to add USDA_API_KEY, NOAA_API_KEY, NASA_API_KEY if needed

# 4. Start the entire system
pnpm run breathe
# or equivalently: docker-compose up --build

# 5. Access the system
# Frontend: http://localhost:4000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

That's it! The system is breathing.

## Local Development (Without Docker)

If you want to run packages individually for development:

### 1. Install Dependencies

```bash
# Root and TypeScript packages
pnpm install

# Backend (requires Python 3.11+)
cd packages/backend
poetry install
cd ../..
```

### 2. Set Up Database

You'll still need PostgreSQL and Redis. Either:

**Option A: Use Docker for just the databases**
```bash
docker-compose up db redis
```

**Option B: Install locally**
- Install PostgreSQL 16
- Install Redis 7
- Create database: `createdb confluence`
- Run init script: `psql confluence < packages/backend/scripts/init.sql`

### 3. Environment Variables

Create `.env` files in each package:

```bash
# Root .env
cp .env.example .env

# Backend
cp packages/backend/.env.example packages/backend/.env

# Frontend (if needed)
cp packages/frontend/.env.example packages/frontend/.env
```

Edit each `.env` file with appropriate values.

### 4. Run Services

In separate terminal windows:

```bash
# Terminal 1: Backend
cd packages/backend
poetry run uvicorn confluence.main:app --reload

# Terminal 2: Frontend
pnpm --filter @confluence/frontend dev
```

## Getting API Keys (Optional)

### Data Source APIs

- **USDA**: https://www.nass.usda.gov/developer/
- **NOAA**: https://www.ncdc.noaa.gov/cdo-web/token
- **NASA**: https://api.nasa.gov/

Add these to `.env` as `USDA_API_KEY`, `NOAA_API_KEY`, `NASA_API_KEY`.

## Verification

### Check System Health

```bash
# Backend health
curl http://localhost:8000/health

# Frontend (should show the landing page)
open http://localhost:3000
```

### Run Tests

```bash
# All packages
pnpm run test

# Specific package
pnpm --filter @confluence/shared test
```

## Troubleshooting

### Docker Issues

**Port conflicts:**
```bash
# Check what's using ports 3000, 8000, 5432, 6379
lsof -i :3000
# Kill processes or change ports in docker-compose.yml
```

**Build failures:**
```bash
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Backend Issues

**Python/Poetry errors:**
```bash
# Ensure Python 3.11+
python --version

# Reinstall dependencies
cd packages/backend
poetry env remove python
poetry install
```

**Database connection:**
```bash
# Verify PostgreSQL is running
docker-compose ps
# Or locally: pg_isready
```

### Frontend Issues

**Module not found:**
```bash
# Reinstall dependencies
pnpm install --force

# Clear Next.js cache
rm -rf packages/frontend/.next
```

## Next Steps

Once the system is running:

1. Read [claude.md](./claude.md) for the philosophical vision
2. Explore the API at http://localhost:8000/docs
3. Visit http://localhost:4000 to see the visualizations
4. Examine the shared types in `packages/shared/src/types/`
5. Explore data sonification at /pulse and /iris

## Development Workflow

```bash
# Make changes to code
# Tests run automatically (if configured)
pnpm run test

# Format and lint
pnpm run lint

# Build for production
pnpm run build

# Docker deployment
pnpm run breathe
```

## Remember

You're not just installing software. You're bringing a philosophical instrument to life. Each command is intentional. Each service has purpose. The system seeks harmony.

---

*"The system is breathing..."*
