import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

let prisma: PrismaClient;

// Avoid multiple instances during dev (TSX reloads files)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error']
    });
}

prisma = globalForPrisma.prisma;

export { prisma };
