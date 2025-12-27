import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

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
        socket.on('task:create', (newTask) => {
            console.log('🚀 Tarea recibida:', newTask);
            io.emit('task:received', newTask); 
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