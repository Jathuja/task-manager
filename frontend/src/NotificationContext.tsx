import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { AuthContext } from './App';
import axios from 'axios';

export interface Notification {
  id: string | number;
  type: string;
  title: string;
  text: string;
  time: string;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string | number) => void;
  deleteNotif: (id: string | number) => void;
  clearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  deleteNotif: () => {},
  clearAll: () => {}
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const username = user?.username;

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!username) return;
    
    // Fetch dynamic alerts
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://127.0.0.1:8000/api/v1/alerts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedAlerts = res.data.map((a: any) => ({
          id: a.id,
          type: 'alert',
          title: a.title,
          text: a.message,
          time: new Date(a.created_at).toLocaleString(),
          color: a.type === 'warning' ? 'text-red-500' : 'text-amber-500',
          bgColor: a.type === 'warning' ? 'bg-red-50' : 'bg-amber-50',
          read: a.is_read
        }));
        setNotifications(fetchedAlerts);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      }
    };
    fetchAlerts();
    
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/${username}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'task_update') {
          const newNotif: Notification = {
            id: Date.now().toString(),
            type: 'system',
            title: "Task Updated",
            text: data.message,
            time: "Just now",
            color: "text-indigo-500",
            bgColor: "bg-indigo-50"
          };
          setNotifications(prev => [newNotif, ...prev]);
        } else {
          const newNotif: Notification = {
            id: Date.now().toString(),
            type: 'system',
            title: "New Alert",
            text: data.message || event.data,
            time: "Just now",
            color: "text-indigo-500",
            bgColor: "bg-indigo-50"
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      } catch (e) {
        const newNotif: Notification = {
          id: Date.now().toString(),
          type: 'system',
          title: "System Notification",
          text: event.data,
          time: "Just now",
          color: "text-indigo-500",
          bgColor: "bg-indigo-50"
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    };

    return () => {
      ws.close();
    };
  }, [username]);

  const markAsRead = async (id: string | number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/alerts/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (e) {}
  };

  const deleteNotif = (id: string | number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = async () => {
    setNotifications([]);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/alerts/clear`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, deleteNotif, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};
