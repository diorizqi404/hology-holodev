# Multi-stage build for Backend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json tsconfig*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code and docs (required for openapi.yaml in /app/docs)
COPY src/ ./src/
COPY docs/ ./docs/

# Build TypeScript to dist
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production dependencies + tsx for utility scripts
COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx && npm cache clean --force

# Copy built files and sources for runtime tools
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docs ./docs
COPY src/ ./src/
COPY scripts/ ./scripts/

# Expose default backend port
EXPOSE 3000

# Start server
CMD ["node", "dist/server.js"]
