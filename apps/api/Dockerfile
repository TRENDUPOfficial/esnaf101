# Repo kökünden çalıştırılmalı: docker build -f apps/api/Dockerfile .
# (pnpm workspace bağımlılıkları yüzünden build context tüm monorepo olmalı.)
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
RUN pnpm --filter @esnaf101/api build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 3001
# Container her başladığında bekleyen migration'ları uygular, sonra sunucuyu
# başlatır — `prisma migrate deploy` idempotent olduğundan tekrar tekrar
# çalıştırmak güvenli (yalnızca henüz uygulanmamış migration'ları uygular).
CMD ["sh", "-c", "pnpm --filter @esnaf101/db exec prisma migrate deploy && node dist/main.js"]
