# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Build the invoice app
RUN pnpm exec nx build invoice

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# Copy only the built app and its runtime dependencies
COPY --from=builder /app/dist/apps/invoice ./
COPY --from=builder /app/dist/apps/invoice/package.json ./package.json

# Install only production dependencies (if any)
RUN npm install --omit=dev --ignore-scripts

# Expose the port (default 4000, can be overridden)
EXPOSE 4000

# Start the app
CMD ["node", "main.js"]
