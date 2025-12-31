import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import cors from 'cors';
import dotenv from 'dotenv';

import { prisma } from './lib/prisma.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

import { initSocket } from './lib/socket.js';

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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
