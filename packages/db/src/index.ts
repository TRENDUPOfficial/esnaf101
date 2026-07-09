import { PrismaClient } from "../generated/client";

export * from "../generated/client";

declare global {
  // eslint-disable-next-line no-var
  var __esnaf101PrismaClient: PrismaClient | undefined;
}

export const prisma = global.__esnaf101PrismaClient ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__esnaf101PrismaClient = prisma;
}
