import { PrismaClient } from '@prisma/client';

// This setup prevents creating too many connections during development
// (due to Next.js Hot Module Reloading)

declare global {
    // allow global `var` declarations
    var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
    // Optional: uncomment this to see the SQL queries in your terminal
    // log: ['query'],
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
}

export default prisma;
