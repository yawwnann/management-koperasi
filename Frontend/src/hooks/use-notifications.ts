import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getCurrentUser } from '@/lib/api-helpers';
import type { Notification } from '@/types/notification.types';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
          setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/${id}/read`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/read-all`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // WebSocket connection
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || typeof window === 'undefined') return;
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
      const baseURL = API_URL.replace('/api', '');

      const socket = io(`${baseURL}/notifications`, {
        query: {
          token,
        },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        // Subscribe to notifications
        socket.emit('subscribe', {
          userId: user.id,
          role: user.role,
        });
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      // Handle real-time notification from WebSocket
      socket.on('notification', (data: any) => {
        console.log('New notification received via WebSocket:', data);
        // Convert WebSocket payload to Notification format
        const notification: Notification = {
          id: data.data?.id || `notif_${Date.now()}`,
          type: data.type,
          title: `${data.type === 'payment' ? 'Pembayaran' : data.type === 'withdrawal' ? 'Penarikan' : 'Sistem'} ${data.action === 'created' ? 'Baru' : data.action === 'approved' ? 'Disetujui' : 'Ditolak'}`,
          message: `${data.data?.userName || 'User'} - Rp${Number(data.data?.amount || 0).toLocaleString('id-ID')}`,
          isRead: false,
          actionUrl: `/${data.type}s/riwayat/${data.data?.id}`,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      socket.on('subscribed', (data) => {
        console.log('Subscribed to notifications:', data);
      });

      socketRef.current = socket;

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, []);

  // Load initial notifications
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  };
}
