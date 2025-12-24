import api from './api';
import type { User } from './authService';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    projectId: string;
    assigneeId?: string;
    createdAt: string;
    updatedAt: string;
    assignee?: User;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    status?: 'todo' | 'in-progress' | 'done';
    assigneeId?: string | null;
}

export const taskService = {
    async create(data: CreateTaskData): Promise<Task> {
        const response = await api.post('/tasks', data);
        return response.data;
    },

    async update(id: string, data: UpdateTaskData): Promise<Task> {
        const response = await api.put(`/tasks/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/tasks/${id}`);
    }
};
