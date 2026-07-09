# Repo kökünden çalıştırılmalı: docker build -f apps/web/Dockerfile .
#
# NEXT_PUBLIC_* değişkenleri Next.js'te build-time'da client bundle'a
# gömülür — bu yüzden build ARG olarak geçilmeli:
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.esnaf101.com .
FROM node:20-alpine AS base
# Prisma'nın query engine binary'si musl üzerinde OpenSSL 1.1'e ihtiyaç duyuyor,
# Alpine'de varsayılan gelmiyor (bkz. https://pris.ly/d/engine-not-found-error).
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
WORKDIR /repo

FROM base AS build
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL
ARG CLERK_SECRET_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @esnaf101/db exec prisma generate
RUN pnpm --filter @esnaf101/db build
RUN pnpm --filter @esnaf101/web build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["pnpm", "start"]
