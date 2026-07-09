# Repo kökünden çalıştırılmalı: docker build -f apps/worker/Dockerfile .
FROM node:20-alpine AS base
# Prisma'nın query engine binary'si musl üzerinde OpenSSL 1.1'e ihtiyaç duyuyor,
# Alpine'de varsayılan gelmiyor (bkz. https://pris.ly/d/engine-not-found-error).
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /repo

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @esnaf101/db exec prisma generate
RUN pnpm --filter @esnaf101/db --filter @esnaf101/crypto \
      --filter @esnaf101/integrations-whatsapp --filter @esnaf101/integrations-invoicing \
      --filter @esnaf101/integrations-shipping --filter @esnaf101/integrations-billing \
      --filter @esnaf101/integrations-storage build
RUN pnpm --filter @esnaf101/worker build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/worker
CMD ["node", "dist/index.js"]
