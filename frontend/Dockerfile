# Multi-stage build for Frontend Vite SPA
FROM node:22-alpine AS builder

WORKDIR /app

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package*.json tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source files
COPY vite.config.ts index.html eslint.config.js ./
COPY public/ ./public/
COPY src/ ./src/

# Build static assets
RUN npm run build

# Nginx production stage
FROM nginx:alpine AS runner

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
