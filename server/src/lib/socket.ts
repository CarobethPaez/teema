import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { prisma } from './prisma.js';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        // Escuchar creación de tareas
        // Agregamos 'async' antes de (newTask)
        socket.on('task:create', async (taskData) => {
            console.log('🚀 Recibido para guardar:', taskData);

            try {
                // Guardamos físicamente en PostgreSQL
                const savedTask = await prisma.task.create({
                    data: {
                        title: taskData.title,
                        status: taskData.status || 'todo',
                        projectId: taskData.projectId
                    }
                });

                console.log('💾 Tarea guardada en BD con ID:', savedTask.id);

                // Emitimos la tarea YA GUARDADA (con su ID real de la BD) a todos
                io.emit('task:received', savedTask);
            } catch (error) {
                console.error('❌ Error al guardar en Prisma:', error);
            }
        });

        socket.on('join_project', (projectId: string) => {
            socket.join(`project:${projectId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}; // <--- AQUÍ SE CIERRA initSocket

// Ahora getIO está en el nivel superior, fuera de initSocket
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};