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

        socket.on('join_project', (projectId: string) => {
            socket.join(`project:${projectId}`);
            console.log(`User ${socket.id} joined project:${projectId}`);
        });

        socket.on('leave_project', (projectId: string) => {
            socket.leave(`project:${projectId}`);
            console.log(`User ${socket.id} left project:${projectId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
