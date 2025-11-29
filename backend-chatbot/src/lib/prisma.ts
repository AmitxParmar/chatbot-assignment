import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DB_URL;

let prisma: PrismaClient;

// Avoid multiple instances during dev (TSX reloads files)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString });
    globalForPrisma.prisma = new PrismaClient({
        adapter,
        log: ['query', 'info', 'warn', 'error']
    });
}

prisma = globalForPrisma.prisma;

export { prisma };
