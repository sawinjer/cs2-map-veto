FROM oven/bun:1.3.0-alpine AS base
WORKDIR /app

# --- Prune monorepo to server scope (Turborepo) ---
FROM base AS pruner
COPY . .
RUN bunx turbo prune server --docker

# --- Install deps (layer-cached separately from source) ---
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile

# --- Copy full source and link workspaces ---
FROM base AS builder
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
RUN bun install --frozen-lockfile

# --- Production runner ---
FROM oven/bun:1.3.0-alpine AS runner
WORKDIR /app

RUN apk add --no-cache bash curl \
  && curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | sh \
  && apk add --no-cache infisical

COPY --from=builder /app .

EXPOSE 3000

CMD ["sh", "-c", "infisical run --projectId=$INFISICAL_PROJECT_ID --env=$INFISICAL_ENV --domain=$INFISICAL_DOMAIN -- bun apps/server/index.ts"]
