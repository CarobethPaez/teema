import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getIO } from '../lib/socket';

interface AuthRequest extends Request {
    user?: any;
}

export const createComment = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user.id;
        const { content, taskId } = req.body;

        if (!content || !taskId) {
            return res.status(400).json({ message: 'Content and Task ID are required' });
        }

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: { include: { members: true } } }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check project membership
        const isMember = task.project.members.some(member => member.id === userId);
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                taskId,
                authorId: userId
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        // Emit to project room
        getIO().to(`project:${task.projectId}`).emit('comment:created', comment);

        return res.status(201).json(comment);
    } catch (error) {
        console.error('Create comment error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const comment = await prisma.comment.findUnique({
            where: { id },
            include: { task: true }
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.authorId !== userId) {
            return res.status(403).json({ message: 'You can only delete your own comments' });
        }

        await prisma.comment.delete({ where: { id } });

        // Emit to project room (we need projectId, so we fetched task relation)
        // Wait, we didn't fetch Project relation in findUnique above. 
        // Let's optimize: fetch existing task to get projectId.
        const task = await prisma.task.findUnique({
            where: { id: comment.taskId },
            select: { projectId: true }
        });

        if (task) {
            getIO().to(`project:${task.projectId}`).emit('comment:deleted', { id, taskId: comment.taskId });
        }

        return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getTaskComments = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user.id;
        const { taskId } = req.params;

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: { include: { members: true } } }
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const isMember = task.project.members.some(member => member.id === userId);
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const comments = await prisma.comment.findMany({
            where: { taskId },
            include: {
                author: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        return res.status(200).json(comments);
    } catch (error) {
        console.error('Get comments error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
