# Multi-stage Dockerfile for Next.js standalone on Coolify / Docker
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Dependencies stage: better-sqlite3's install script compiles it with node-gyp
FROM base AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# 2. Builder stage: build Next.js with standalone output
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Read at build time: NEXT_PUBLIC_* are inlined into the client bundle and the TTL is printed in the
# statically rendered privacy policy. In Coolify, mark these variables as "Build Variable".
ARG CALLBACK_OUTBOX_TTL_HOURS
ARG NEXT_PUBLIC_CALLBACK_CALL_NUMBER
ARG NEXT_PUBLIC_EXTRA_CLOSED_DATES
ENV CALLBACK_OUTBOX_TTL_HOURS=$CALLBACK_OUTBOX_TTL_HOURS \
    NEXT_PUBLIC_CALLBACK_CALL_NUMBER=$NEXT_PUBLIC_CALLBACK_CALL_NUMBER \
    NEXT_PUBLIC_EXTRA_CLOSED_DATES=$NEXT_PUBLIC_EXTRA_CLOSED_DATES

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm build

# 3. Production runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV OUTBOX_DB_PATH="/app/data/outbox.db"

# Install runtime C++ libraries needed by better-sqlite3
RUN apk add --no-cache libstdc++

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create persistent storage mount directory for SQLite with correct permissions
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Copy static assets, standalone bundle, and drizzle migrations
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

USER nextjs

EXPOSE 3000

# busybox wget is the only HTTP client in the image (no curl); Coolify waits for this before
# switching traffic during a rolling update.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
