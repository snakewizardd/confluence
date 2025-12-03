# CONFLUENCE MAKEFILE
# The commands that give the system form

.PHONY: help install dev breathe clean test lint meditate compose

# Default target - show available commands
help:
	@echo "CONFLUENCE - Where rivers meet"
	@echo ""
	@echo "Available commands:"
	@echo "  make install    Install all dependencies"
	@echo "  make dev        Run in development mode"
	@echo "  make breathe    Start the system with Docker"
	@echo "  make build      Build all packages"
	@echo "  make test       Run tests (prayers)"
	@echo "  make lint       Check code quality"
	@echo "  make meditate   Generate a philosophical reflection"
	@echo "  make compose    Create poetry from data"
	@echo "  make clean      Remove all build artifacts"
	@echo ""

# Install dependencies - the gathering of tools
install:
	@echo "Installing dependencies..."
	pnpm install
	@echo "Dependencies installed. The tools are ready."

# Development mode - the system awakens locally
dev:
	@echo "Starting development mode..."
	pnpm run dev

# Docker - the full system breathing
breathe:
	@echo "Starting Confluence with Docker..."
	@echo "The system is breathing..."
	docker-compose up --build

# Stop Docker gracefully
rest:
	@echo "The system rests..."
	docker-compose down

# Build all packages
build:
	@echo "Building all packages..."
	pnpm run build
	@echo "Build complete."

# Run tests - prayers asking "is this true?"
test:
	@echo "Running tests..."
	pnpm run test

# Lint - ensuring beauty and correctness
lint:
	@echo "Checking code quality..."
	pnpm run lint

# Meditate - generate philosophical reflection
meditate:
	@echo ""
	@echo "✨ Consulting the mirror of soul..."
	@echo ""
	pnpm run meditate

# Compose - create poetry from data
compose:
	@echo ""
	@echo "🎵 Transforming data into verse..."
	@echo ""
	pnpm run compose

# Clean - remove all build artifacts
clean:
	@echo "Cleaning build artifacts..."
	pnpm run clean
	docker-compose down -v
	@echo "Clean complete. Back to the void."

# Database - initialize the schema
db-init:
	@echo "Initializing database..."
	docker-compose exec db psql -U confluence -d confluence -f /docker-entrypoint-initdb.d/init.sql
	@echo "Database initialized."

# Logs - observe the flow
logs:
	docker-compose logs -f

# Status - check the pulse
status:
	@echo "Checking system status..."
	@curl -s http://localhost:8000/health | jq . || echo "Backend not responding"
	@echo "Frontend: http://localhost:3000"
