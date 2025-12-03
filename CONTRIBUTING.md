# Contributing to Confluence

Thank you for your interest in contributing to Confluence.

## Philosophy First

Before contributing, please read [claude.md](./claude.md) to understand the philosophical foundation. Contributions should align with the vision that:

- Engineering IS philosophy
- Rigor over aesthetics
- Harmony as metric
- Code is poetry

## Development Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

Quick start:
```bash
pnpm install
cp .env.example .env
# Add data source API keys if needed
pnpm run breathe
```

## Code Style

- **Code is poetry** - Clear, intentional, beautiful
- **Comments are contemplations** - Explain the why and meaning, not just the what
- **Tests are prayers** - They ask "is this true?"
- Use TypeScript strict mode
- Follow the existing patterns in each package

## Commit Messages

Write meaningful commit messages that reflect the philosophy:

```
Good: "Add harmony calculation using statistical variance"
Good: "Implement time series visualization with D3"
Bad: "Fix stuff"
Bad: "Updates"
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/meaningful-name`)
3. Make your changes following the code style
4. Write or update tests
5. Ensure all tests pass (`pnpm run test`)
6. Ensure linting passes (`pnpm run lint`)
7. Update documentation if needed
8. Submit a pull request with a clear description

## Areas for Contribution

- Real data source integrations (USDA, NOAA, NASA APIs)
- D3.js visualizations of statistical patterns
- Three.js nature-inspired renderings
- Tone.js generative music from data
- Statistical algorithms (R or Python)
- Documentation and examples

## Questions?

Open an issue for discussion. This is a living philosophical instrument - let's build it with intention.
