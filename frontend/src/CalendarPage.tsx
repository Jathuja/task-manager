import React, { useState, useEffect, useContext } from 'react';
import { Home, Plus, LayoutGrid, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar, dateFnsLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { AuthContext } from './App';
import AddTaskModal from './AddTaskModal';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import KanbanBoard from './KanbanBoard';
import { Task } from './types';
import NotificationBell from './NotificationBell';

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const API_URL = "http://127.0.0.1:8000";

interface CustomEvent extends CalendarEvent {
  resource: any;
}

const CustomToolbar = (toolbar: any) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');
  const changeView = (view: string) => toolbar.onView(view);

  return (
    <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <button onClick={goToCurrent} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
          Today
        </button>
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button onClick={goToBack} className="p-1.5 text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={goToNext} className="p-1.5 text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <span className="text-lg font-bold text-gray-900 tracking-tight">
        {toolbar.label}
      </span>

      <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
        {['month', 'week', 'day'].map((view) => (
          <button 
            key={view}
            onClick={() => changeView(view)} 
            className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
              toolbar.view === view ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const username = user?.username || "user";
  const avatarUrl = user?.profile_picture_url || "";
  const userInitial = username[0]?.toUpperCase();

  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'kanban'>('kanban');

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setTasks(res.data);

      const calendarEvents = res.data
        .filter((task: any) => task.due_date)
        .map((task: any) => ({
          title: task.title,
          start: new Date(task.due_date),
          end: new Date(task.due_date),
          allDay: true,
          resource: task
        }));
        
      setEvents(calendarEvents);
    } catch (err) {
      console.error("Failed to fetch tasks for calendar", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const eventStyleGetter = (event: CustomEvent) => {
    let backgroundColor = '#6366F1'; // Default Indigo
    if (event.resource.priority === 'high') backgroundColor = '#EF4444'; // Red
    if (event.resource.priority === 'low') backgroundColor = '#10B981'; // Green
    
    if (event.resource.status === 'done') {
      backgroundColor = '#9CA3AF'; // Gray if done
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '2px 8px'
      }
    };
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Sidebar */}
      <Sidebar onAddTask={() => { setIsModalOpen(true); setEditingTask(null); }} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Board</h1>
            
            {/* View Switcher */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center">
              <button 
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'kanban' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid size={18} />
                Kanban
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'calendar' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CalendarIcon size={18} />
                Calendar
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div 
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold cursor-pointer"
            >
              {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" /> : userInitial}
            </div>
          </div>
        </div>

        {/* Content Container */}
        {viewMode === 'kanban' ? (
          <div className="flex-1 overflow-hidden">
            <KanbanBoard tasks={tasks} setTasks={setTasks} fetchTasks={fetchTasks} onEditTask={(t) => { setEditingTask(t); setIsModalOpen(true); }} />
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%', fontFamily: '"Inter", sans-serif' }}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              components={{
                toolbar: CustomToolbar
              }}
            />
          </div>
        )}

        <AddTaskModal 
          open={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingTask(null); }} 
          onTaskAdded={fetchTasks}
          editingTask={editingTask}
        />
      </div>
    </div>
  );
}
