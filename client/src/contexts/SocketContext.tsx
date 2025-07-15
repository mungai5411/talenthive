import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (data: any) => void;
  sendMeetupRequest: (data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      const socketURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      
      const newSocket = io(socketURL, {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        // Join user's personal room
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('onlineUsers', (users: string[]) => {
        setOnlineUsers(users);
      });

      // Listen for new messages
      newSocket.on('newMessage', (data) => {
        // Handle new message (you can dispatch to a global state or show notification)
        console.log('New message received:', data);
      });

      // Listen for meetup requests
      newSocket.on('newMeetupRequest', (data) => {
        // Handle new meetup request
        console.log('New meetup request:', data);
      });

      // Listen for barter updates
      newSocket.on('barterUpdate', (data) => {
        // Handle barter status updates
        console.log('Barter update:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token]);

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('join', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leave', roomId);
    }
  };

  const sendMessage = (data: any) => {
    if (socket) {
      socket.emit('sendMessage', data);
    }
  };

  const sendMeetupRequest = (data: any) => {
    if (socket) {
      socket.emit('meetupRequest', data);
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendMeetupRequest
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};