import api from './api';
import type { User } from './authService';
import type { Task } from './taskService';

export interface Project {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    owner?: User;
    members?: User[];
    tasks?: Task[];
    _count?: {
        tasks: number;
        members: number;
    };
}

export interface CreateProjectData {
    name: string;
    description?: string;
}

export const projectService = {
    async getAll(): Promise<Project[]> {
        const response = await api.get('/projects');
        return response.data;
    },

    async getOne(id: string): Promise<Project> {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    async create(data: CreateProjectData): Promise<Project> {
        const response = await api.post('/projects', data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateProjectData>): Promise<Project> {
        const response = await api.put(`/projects/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/projects/${id}`);
    }
};
