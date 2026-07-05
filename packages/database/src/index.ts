import { PrismaClient } from "../generated/prisma/index.js";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaConfigVersion: number | undefined;
}

const PRISMA_CONFIG_VERSION = 3;
const prismaClient =
  globalThis.prisma && globalThis.prismaConfigVersion === PRISMA_CONFIG_VERSION
    ? globalThis.prisma
    : new PrismaClient({
        transactionOptions: {
          maxWait: 5000,
          timeout: 15000,
        },
      });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismaClient;
  globalThis.prismaConfigVersion = PRISMA_CONFIG_VERSION;
}

export { prismaClient as prisma };
