import api from './api';
import type { User } from './authService';

export interface Comment {
    id: string;
    content: string;
    taskId: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    author?: User;
}

export const commentService = {
    async getTaskComments(taskId: string): Promise<Comment[]> {
        const response = await api.get(`/comments/task/${taskId}`);
        return response.data;
    },

    async create(taskId: string, content: string): Promise<Comment> {
        const response = await api.post('/comments', { taskId, content });
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/comments/${id}`);
    }
};
