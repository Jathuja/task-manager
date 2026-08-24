import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { AuthContext } from './App';

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

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: 'message', title: "New Comment", text: "Alex left a comment on 'Website Redesign'.", time: "10 mins ago", color: "text-blue-500", bgColor: "bg-blue-50", read: false },
    { id: 2, type: 'task', title: "Task Assigned", text: "You were assigned to 'Update API Docs'.", time: "1 hour ago", color: "text-emerald-500", bgColor: "bg-emerald-50", read: false },
    { id: 3, type: 'alert', title: "Deadline Approaching", text: "'Mobile App V2' is due tomorrow.", time: "5 hours ago", color: "text-amber-500", bgColor: "bg-amber-50", read: true }
  ]);

  useEffect(() => {
    if (!username) return;
    
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

  const markAsRead = (id: string | number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotif = (id: string | number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, deleteNotif, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};
