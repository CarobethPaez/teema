import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getIO } from '../lib/socket.js';

interface AuthRequest extends Request {
    user?: any;
}

export const createTask = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user.id;
        const { title, description, projectId, assigneeId } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({ message: 'Title and Project ID are required' });
        }

        // Verify project existence and membership
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isMember = project.members.some(member => member.id === userId);
        if (!isMember) {
            return res.status(403).json({ message: 'You must be a member of the project to create tasks' });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                assigneeId: assigneeId || null,
                status: 'todo' // Default status
            },
            include: {
                assignee: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        getIO().to(`project:${projectId}`).emit('task:created', task);

        return res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, description, status, assigneeId } = req.body;

        const task = await prisma.task.findUnique({
            where: { id },
            include: { project: { include: { members: true } } }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user is member of the project
        const isMember = task.project.members.some(member => member.id === userId);
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                title,
                description,
                status,
                assigneeId
            },
            include: {
                assignee: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        getIO().to(`project:${task.projectId}`).emit('task:updated', updatedTask);

        return res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Update task error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const task = await prisma.task.findUnique({
            where: { id },
            include: { project: { include: { members: true } } }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user is member of the project
        const isMember = task.project.members.some(member => member.id === userId);
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await prisma.task.delete({ where: { id } });

        getIO().to(`project:${task.projectId}`).emit('task:deleted', { id });

        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
