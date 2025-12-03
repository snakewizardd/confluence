# The vessel for the frontend - the interface with consciousness
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copy shared package source (not node_modules)
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

# Copy frontend package files (not node_modules)
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/frontend/tsconfig.json ./packages/frontend/
COPY packages/frontend/next.config.js ./packages/frontend/
COPY packages/frontend/tailwind.config.js ./packages/frontend/
COPY packages/frontend/postcss.config.js ./packages/frontend/
COPY packages/frontend/.eslintrc.json ./packages/frontend/
COPY packages/frontend/src ./packages/frontend/src
COPY packages/frontend/public ./packages/frontend/public

# Install dependencies for the entire workspace
RUN pnpm install --frozen-lockfile

# Set working directory to frontend
WORKDIR /app/packages/frontend

# The port through which it speaks
EXPOSE 3000

# Breathe (development mode)
CMD ["pnpm", "run", "dev"]

# For production, use:
# CMD ["pnpm", "run", "build", "&&", "pnpm", "run", "start"]
