import { PrismaClient } from '@prisma/client';

// Forzamos la URL directamente en el entorno global de Node antes de crear el cliente
process.env.DATABASE_URL = "postgresql://postgres:postgrespassword@localhost:5433/taskmanager?schema=public";

// Creamos el cliente de la forma más sencilla. 
// Esto evita el error de "Unknown property" y el de "non-empty options".
export const prisma = new PrismaClient();

console.log("🚀 Cliente de Prisma listo para conectar");