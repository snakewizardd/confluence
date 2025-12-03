# @confluence/backend

The computational heart - where mathematics meets meaning.

## Philosophy

This backend is not a REST API. It is a living system that:
- Computes statistical patterns using Python and R
- Fetches real data from nature (USDA, NOAA, NASA)
- Transforms numbers into insights
- Seeks harmony as its primary metric

## Structure

```
confluence/
├── main.py           # The heartbeat - FastAPI application
├── config.py         # The constants - settings and configuration
├── api/              # Routes - the pathways of data
├── core/             # Business logic - the mind
├── db/               # Database - the memory
├── models/           # Data models - the forms
├── services/         # External integrations - the senses
└── compute/          # R integration - statistical soul
```

## Development

```bash
# Install dependencies
poetry install

# Run locally
poetry run uvicorn confluence.main:app --reload

# Run tests (prayers asking "is this true?")
poetry run pytest

# Format (make beautiful)
poetry run black .
poetry run ruff check .
```

## Philosophy in Code

- Every endpoint is intentional
- Every computation has meaning
- Tests are prayers - they ask "is this true?"
- Comments are contemplations
