// Importing PrismaClient dynamically to avoid build-time type issues in Docker.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PrismaClient } from '@prisma/client';

// Add a global variable for hot-reloading in development
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaInstance = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance;