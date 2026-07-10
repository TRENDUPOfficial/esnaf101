import "dotenv/config";
import "reflect-metadata";
import { resolve } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module";

/**
 * Prod'da yalnızca bilinen panel origin'lerine izin verir. `ALLOWED_ORIGINS`
 * tanımlı değilse (yerel dev) tüm localhost portlarına izin verir — bu
 * fallback'i production'a taşımayın.
 */
function resolveAllowedOrigins(): (string | RegExp)[] | boolean {
  const configured = process.env.ALLOWED_ORIGINS;
  if (configured) {
    return configured.split(",").map((origin) => origin.trim());
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("ALLOWED_ORIGINS tanımlı değil (production'da CORS için zorunlu)");
  }
  return [/^http:\/\/localhost:\d+$/];
}

async function bootstrap() {
  // rawBody: true -> Clerk/WhatsApp webhook imza doğrulaması ham gövdeye ihtiyaç duyar.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.use(helmet());
  app.enableCors({ origin: resolveAllowedOrigins() });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // S3/R2 kimlik bilgileri tanımlı değilken ObjectStorage yerel diske
  // yazıyor (bkz. @esnaf101/integrations-storage) — bu dosyaları dev
  // ortamında servis etmek için:
  if (!process.env.S3_ENDPOINT) {
    app.useStaticAssets(resolve(process.env.LOCAL_STORAGE_DIR ?? ".local-storage"), {
      prefix: "/uploads",
    });
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`esnaf101 api listening on :${port}`);
}

bootstrap();
