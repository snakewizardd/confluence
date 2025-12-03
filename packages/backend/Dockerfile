# The vessel for the computational heart
FROM python:3.11-slim

# R installation - for statistical computing
RUN apt-get update && apt-get install -y \
    r-base \
    r-base-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Poetry - the dependency weaver
RUN pip install poetry==1.7.1

# Copy only dependency files first for better caching
COPY packages/backend/pyproject.toml packages/backend/poetry.lock* ./

# Configure Poetry and install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

# Copy the entire backend package
COPY packages/backend .

# Install the package itself
RUN poetry install --no-interaction --no-ansi

# The port through which it speaks
EXPOSE 8000

# Breathe
CMD ["uvicorn", "confluence.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
