# @confluence/backend

The computational heart - where mathematics meets meaning.

## Overview

FastAPI backend that bridges Python and R to transform statistical data into formats suitable for visualization and sonification. Emphasizes real data sources and rigorous statistical computation.

## Architecture

Built with FastAPI and Python 3.11+, integrating:
- R statistical computing via subprocess execution
- PostgreSQL for data persistence (ready for expansion)
- Redis for caching (configured, ready for use)
- CORS-enabled API for frontend communication

## Structure

```
confluence/
├── main.py              # FastAPI application entry point
├── config.py            # Settings and environment configuration
├── routers/             # API route handlers
│   ├── __init__.py
│   └── iris.py          # Iris dataset transformation endpoints
└── r_scripts/           # R statistical computation scripts
    └── iris_transform.R # Iris dataset processing
```

## API Endpoints

### Core Endpoints
- `GET /` - Root endpoint, returns API status
- `GET /health` - Health check for monitoring
- `GET /api/info` - API metadata and available endpoints
- `GET /docs` - Interactive OpenAPI documentation (Swagger UI)

### Iris Dataset Endpoints
- `GET /api/iris/health` - Iris pipeline status
- `GET /api/iris/test` - Test R availability and version
- `GET /api/iris/debug` - Comprehensive diagnostic information
- `GET /api/iris/data` - Transform iris dataset into wave patterns

## R Integration

The backend executes R scripts via subprocess to perform statistical computations:

1. FastAPI endpoint receives request
2. Python calls `Rscript` with appropriate script path
3. R script processes data (e.g., Fisher's iris dataset)
4. R outputs JSON to stdout
5. Python parses JSON and returns to client

**Requirements:**
- R must be installed and available in PATH
- R package `jsonlite` must be installed

**Install R dependencies:**
```bash
Rscript -e "install.packages('jsonlite', repos='https://cloud.r-project.org')"
```

## Development

```bash
# Install dependencies (requires Poetry)
poetry install

# Run development server with hot reload
poetry run uvicorn confluence.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
poetry run pytest

# Format code
poetry run black .
poetry run ruff check .
```

Runs on port 8000 (configured in Docker).

## Environment Variables

Create `.env` from `.env.example`:

```bash
# Database (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://confluence:confluence@localhost:5432/confluence

# Cache (Redis)
REDIS_URL=redis://localhost:6379/0

# External API keys (optional)
USDA_API_KEY=your_key_here
NOAA_API_KEY=your_key_here
NASA_API_KEY=your_key_here

# CORS settings
CORS_ORIGINS=["http://localhost:3000","http://localhost:4000"]
```

## Docker

Dockerfile includes:
- Python 3.11 base image
- R installation with jsonlite package
- Poetry for dependency management
- Health check endpoint monitoring

## Future Expansion

Planned integrations:
- USDA agronomic datasets
- NOAA weather/river flow data
- NASA earth observation data
- Real-time sensor data (IoT)

---

Built with rigor and intention.
