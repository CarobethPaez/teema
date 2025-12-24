import api from './api';

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface LoginData {
    email: string;
    password?: string;
}

export interface RegisterData {
    email: string;
    password?: string;
    name: string;
}

export const authService = {
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    async getMe(): Promise<User> {
        const response = await api.get('/auth/me');
        return response.data;
    }
};
