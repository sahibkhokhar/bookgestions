import { PrismaClient } from '@prisma/client';

// Add a global variable for hot-reloading in development
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma:
  | PrismaClient
  | undefined = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 