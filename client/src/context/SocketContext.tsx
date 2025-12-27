import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { isAuthenticated } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Solo intentamos conectar si el usuario está logueado
        if (isAuthenticated) {
            if (!socketRef.current) {
                // REVISA EL PUERTO: Si tu servidor Node corre en el 4000, cámbialo aquí
                const socketInstance = io('http://localhost:3000', {
                    reconnection: true,
                });

                socketInstance.on('connect', () => {
                    console.log('✅ Socket conectado:', socketInstance.id);
                });

                socketRef.current = socketInstance;
                setSocket(socketInstance);
            }

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                    setSocket(null);
                }
            };
        } else {
            // Si el usuario cierra sesión, desconectamos el socket
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        }
    }, [isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

// Este es el hook que usaremos en el Dashboard
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context; // Retorna un objeto { socket: ... }
};