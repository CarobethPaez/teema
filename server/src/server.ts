import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; // Keep for type if needed, or remove if unused. Checking usage..
// Actually, 'Server' is not used anymore in this file directly as type or value after refactor.
// But let's check if it breaks compilation if I remove it.
// The code `const io = initSocket(server)` returns `io` which is `Server`.
// But we don't use `io` explicitly in `server.ts` other than initialization.
// So safe to remove.

import cors from 'cors';
import dotenv from 'dotenv';

import { prisma } from './lib/prisma';

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import commentRoutes from './routes/commentRoutes';

const authRoutes_ = authRoutes;
const projectRoutes_ = projectRoutes;
const taskRoutes_ = taskRoutes;
const commentRoutes_ = commentRoutes;

import { initSocket } from './lib/socket';

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);

// Basic health check
app.get('/', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).send('Task Management API is running and Database is connected');
    } catch (error) {
        res.status(500).send('API running but Database connection failed');
    }
});

// Socket initialization moved to lib/socket.ts

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
