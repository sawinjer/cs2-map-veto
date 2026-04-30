FROM oven/bun:1.3.0-alpine AS base
WORKDIR /app

# --- Prune monorepo to client scope (Turborepo) ---
FROM base AS pruner
COPY . .
RUN bunx turbo prune client --docker

# --- Install deps (layer-cached separately from source) ---
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile

# --- Build static assets ---
FROM base AS builder
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile
RUN bunx turbo run build --filter=client

# --- Serve with Nginx ---
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
