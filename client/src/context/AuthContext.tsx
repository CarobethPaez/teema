import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type User, type LoginData, type RegisterData } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authService.getMe();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (data: LoginData) => {
        const response = await authService.login(data);
        localStorage.setItem('token', response.token);
        setUser(response.user);
    };

    const register = async (data: RegisterData) => {
        const response = await authService.register(data);
        localStorage.setItem('token', response.token);
        setUser(response.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
