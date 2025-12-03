# @confluence/frontend

The interface with consciousness - where data becomes perception.

## Overview

This is the Next.js frontend for Confluence, built with React, TypeScript, and Tailwind CSS. It transforms data into visual and auditory experiences through Canvas rendering, WebGL (Three.js), and Web Audio (Tone.js).

## Architecture

Built on Next.js 14 with App Router, emphasizing:
- Server and client component separation
- Real-time audio synthesis with Tone.js
- Physics-based canvas animations
- Responsive, accessible design

## Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx          # Landing page
│   ├── pulse/page.tsx    # Live data sonification
│   ├── iris/page.tsx     # Iris dataset music
│   ├── about/page.tsx    # Philosophy page
│   ├── layout.tsx        # Root layout
│   ├── error.tsx         # Error boundary
│   └── loading.tsx       # Loading state
├── components/       # Reusable React components
│   ├── Navigation.tsx        # Global navigation
│   └── AnimatedBackground.tsx # Canvas background
└── lib/              # Utilities and helpers
    ├── sonify.ts         # Generic sonification utilities
    └── iris-sonify.ts    # Iris-specific audio logic
```

## Run Standalone

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Runs on port 3000 (or 4000 in Docker).

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Optional: Enable debug logging
NEXT_PUBLIC_DEBUG=false
```

## Key Dependencies

- **Next.js 14** - React framework with App Router
- **Tone.js** - Web Audio synthesis
- **Three.js** - WebGL 3D rendering
- **D3** - Data visualization utilities
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library

## Pages

- `/` - Portfolio-grade landing page with animated hero
- `/pulse` - Real-time data visualization with live sound generation
- `/iris` - Fisher's 1936 iris dataset as interactive music (150 flowers, 3 species)
- `/about` - Philosophy and methodology behind data sonification

## Development Notes

- All interactive components use `"use client"` directive
- Audio context requires user interaction to start (browser policy)
- Canvas animations use `requestAnimationFrame` for performance
- Color schemes follow semantic theme tokens

---

Built with precision and intention.
