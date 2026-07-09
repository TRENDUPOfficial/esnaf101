import "dotenv/config";
import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  // rawBody: true -> Clerk webhook imza doğrulaması (svix) ham gövdeye ihtiyaç duyar.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`esnaf101 api listening on :${port}`);
}

bootstrap();
