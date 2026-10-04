# Multi-stage Dockerfile for Next.js standalone on Coolify / Docker
# Ubuntu 26.04 packages Node 22, so Node 24 and its bundled corepack are copied from the official
# image. That image ships the nodejs.org build, which runs on any glibc distribution.
FROM node:24-slim AS node

FROM ubuntu:26.04 AS base
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/corepack /usr/local/lib/node_modules/corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN ln -s ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack \
    && corepack enable

# 1. Dependencies stage: better-sqlite3's install script compiles it with node-gyp
FROM base AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
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

# wget serves the HEALTHCHECK and the Coolify scheduled task (README). libstdc++, which
# better-sqlite3 needs at runtime, is already part of the Ubuntu base image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*

# Run as non-root user (UID 1001 owns the files on existing /app/data volumes)
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs --no-create-home --shell /usr/sbin/nologin nextjs

# Create persistent storage mount directory for SQLite with correct permissions
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Copy static assets, standalone bundle, and drizzle migrations
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

USER nextjs

EXPOSE 3000

# wget is the only HTTP client in the image (no curl); Coolify waits for this before
# switching traffic during a rolling update.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
