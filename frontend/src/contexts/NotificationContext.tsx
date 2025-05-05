import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@supabase/auth-helpers-react';
import { toast } from 'react-hot-toast';
import { useNotificationStore } from '@/store/notificationStore';

interface NotificationContextType {
  socket: Socket | null;
  connected: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  connected: false,
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const user = useUser();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: false,
    });

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Set up event listeners
    socket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      
      // Add to notification store
      addNotification({
        type: notification.type,
        message: notification.data.message || 'New notification',
        data: notification.data,
        timestamp: notification.timestamp,
      });
      
      // Show toast for important notifications
      if (['order_status_update', 'order_cancelled', 'new_order'].includes(notification.type)) {
        toast(notification.data.message || 'New notification', {
          icon: notification.type === 'order_cancelled' ? '❌' : '✅',
        });
      }
    });

    // Connect if user is logged in, disconnect otherwise
    if (user) {
      socket.connect();
      
      // Join user-specific room for private notifications
      socket.emit('join', user.id);
      
      // Join role-specific room if user has a role
      if (user.user_metadata?.role) {
        socket.emit('join', `role:${user.user_metadata.role}`);
      }
    } else {
      socket.disconnect();
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('notification');
    };
  }, [socket, user, addNotification]);

  return (
    <NotificationContext.Provider value={{ socket, connected }}>
      {children}
    </NotificationContext.Provider>
  );
};
