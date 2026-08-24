import React, { useContext, useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, ClipboardList, AlertTriangle, Activity, CheckCircle, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from './NotificationContext';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, deleteNotif, clearAll } = useContext(NotificationContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIconForType = (type: string, color: string, bgColor: string) => {
    switch (type) {
      case 'message': return <MessageSquare size={16} />;
      case 'task': return <ClipboardList size={16} />;
      case 'alert': return <AlertTriangle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700 relative p-2 transition-colors rounded-full hover:bg-gray-50"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button 
                  onClick={() => { clearAll(); setIsOpen(false); }}
                  className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 font-medium">
                No new notifications.
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notifications.slice(0, 5).map((notif) => (
                  <li key={notif.id} className={`p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 relative group ${notif.read ? 'opacity-70' : 'bg-blue-50/10'}`}>
                    {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.bgColor} ${notif.color}`}>
                      {notif.icon || getIconForType(notif.type, notif.color || '', notif.bgColor || '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm text-gray-900 truncate ${notif.read ? 'font-medium' : 'font-bold'}`}>{notif.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{notif.text}</p>
                      <span className="text-[10px] font-semibold text-gray-400 mt-1 block">{notif.time}</span>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.read && (
                        <button onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }} className="p-1 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded" title="Mark as Read">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="Dismiss">
                        <X size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
            <button 
              onClick={() => { navigate('/inbox'); setIsOpen(false); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View all in Inbox
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
