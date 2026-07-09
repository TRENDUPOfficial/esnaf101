# Repo kökünden çalıştırılmalı: docker build -f apps/superadmin/Dockerfile .
FROM node:20-alpine AS base
# Prisma'nın query engine binary'si musl üzerinde OpenSSL 1.1'e ihtiyaç duyuyor,
# Alpine'de varsayılan gelmiyor (bkz. https://pris.ly/d/engine-not-found-error).
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /repo

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @esnaf101/db exec prisma generate
RUN pnpm --filter @esnaf101/db build
RUN pnpm --filter @esnaf101/superadmin build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/superadmin
EXPOSE 3002
CMD ["pnpm", "start"]
