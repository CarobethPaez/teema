import { PrismaClient } from '@prisma/client';

// We set the URL in the environment before creating the client
process.env.DATABASE_URL = "postgresql://postgres:postgrespassword@127.0.0.1:5433/taskmanager?schema=public";

console.log("🔍 Prisma DATABASE_URL set to:", process.env.DATABASE_URL);

export const prisma = new PrismaClient();

console.log("🚀 Cliente de Prisma listo para conectar");


