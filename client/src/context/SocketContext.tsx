import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
        if (isAuthenticated) {
            if (!socketRef.current) {
                const socketInstance = io('http://localhost:3000', {
                    reconnection: true,
                });

                socketInstance.on('connect', () => {
                    console.log('Socket connected:', socketInstance.id);
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

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
