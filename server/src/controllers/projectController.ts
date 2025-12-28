import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

interface AuthRequest extends Request {
    user?: any;
}

export const createProject = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { name, description } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                ownerId: userId,
                members: {
                    connect: { id: userId } // Owner is also a member
                }
            }
        });

        return res.status(201).json(project);
    } catch (error) {
        console.error('Create project error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user.id;

        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { id: userId } } }
                ]
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true }
                },
                _count: {
                    select: { tasks: true, members: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return res.status(200).json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProject = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                members: { select: { id: true, name: true, email: true } },
                tasks: {
                    include: {
                        assignee: { select: { id: true, name: true } }
                    }
                }
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check access
        const isMember = project.members.some(member => member.id === userId);
        if (!isMember) {
            return res.status(403).json({ message: 'Access denied' });
        }

        return res.status(200).json(project);
    } catch (error) {
        console.error('Get project error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { name, description } = req.body;

        const project = await prisma.project.findUnique({ where: { id } });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.ownerId !== userId) {
            return res.status(403).json({ message: 'Only the project owner can update it' });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: { name, description }
        });

        return res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Update project error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const project = await prisma.project.findUnique({ where: { id } });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.ownerId !== userId) {
            return res.status(403).json({ message: 'Only the project owner can delete it' });
        }

        await prisma.project.delete({ where: { id } });

        return res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
