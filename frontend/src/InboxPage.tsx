import React, { useContext, useEffect, useState } from 'react';
import { Search, Bell, ArrowLeft, MessageSquare, ClipboardList, AlertTriangle, Activity, Trash2, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from './App';

interface Notification {
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

export default function InboxPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const username = user?.username || "user";
  const avatarUrl = user?.profile_picture_url || "";
  const userInitial = username[0]?.toUpperCase() || "U";

  const [filter, setFilter] = useState('All');
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
          // Handle string messages or other types
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
        // Fallback for non-JSON messages
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

  const getIconForType = (type: string, color: string, bgColor: string) => {
    switch (type) {
      case 'message': return <MessageSquare size={20} />;
      case 'task': return <ClipboardList size={20} />;
      case 'alert': return <AlertTriangle size={20} />;
      default: return <Activity size={20} />;
    }
  };

  const markAsRead = (id: string | number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotif = (id: string | number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Alerts') return n.type === 'alert';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow-sm text-indigo-500 hover:bg-gray-50 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inbox & Notifications</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center border border-gray-100">
              <Search size={20} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search..." className="outline-none text-sm text-gray-600 bg-transparent" />
            </div>
            <button className="text-gray-500 hover:text-gray-700 relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-50 text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <div 
              onClick={() => navigate('/settings')} 
              className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold cursor-pointer"
            >
              {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" /> : userInitial}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl">
          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-100">
              {['All', 'Unread', 'Alerts'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filter === f ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                <Trash2 size={16} /> Clear All
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="p-10 text-center text-gray-500 font-medium">No notifications in this view.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredNotifications.map((notif) => (
                  <li key={notif.id} className={`p-6 hover:bg-gray-50 transition-colors flex items-start gap-4 relative group ${notif.read ? 'opacity-70' : 'bg-blue-50/20'}`}>
                    {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.bgColor} ${notif.color}`}>
                      {notif.icon || getIconForType(notif.type, notif.color || '', notif.bgColor || '')}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-base text-gray-900 mb-1 ${notif.read ? 'font-semibold' : 'font-bold'}`}>{notif.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{notif.text}</p>
                      <span className="text-xs font-semibold text-gray-400">{notif.time}</span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.read && (
                        <button onClick={() => markAsRead(notif.id)} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Mark as Read">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button onClick={() => deleteNotif(notif.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <X size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
