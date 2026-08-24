import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, Clock, CheckCircle, FolderOpen, Activity, Loader2, Edit2 } from 'lucide-react';
import { AuthContext } from './App';
import axios from 'axios';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useNavigate } from 'react-router-dom';
import AddTaskModal from './AddTaskModal';
import { Project, Task } from './types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = "http://127.0.0.1:8000";

// Mock data for charts
const defaultLineChartData = [
  { name: 'Jan', task: 10 }, { name: 'Feb', task: 25 },
  { name: 'Mar', task: 40 }, { name: 'Apr', task: 35 },
  { name: 'May', task: 55 }, { name: 'Jun', task: 70 },
  { name: 'Jul', task: 65 }
];

const StatCard = ({ title, count, icon, bgClass, iconColorClass }: { title: string, count: number, icon: React.ReactNode, bgClass: string, iconColorClass: string }) => (
  <div className={`flex-1 p-6 rounded-3xl ${bgClass} shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-[1.02] duration-200`}>
    <div>
      <h3 className="text-gray-500 font-semibold text-sm mb-1">{title}</h3>
      <span className="text-3xl font-black text-gray-900 tracking-tight">{count}</span>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm ${iconColorClass}`}>
      {icon}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const username = user?.username || "user";
  const avatarUrl = user?.profile_picture_url || "";
  const userInitial = username[0]?.toUpperCase() || "U";

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Sort tasks by reversing the array so newest added are first (or sort by created_at if available)
      const sorted = res.data.reverse();
      setTasks(sorted);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'todo').length;

  const pieData = [
    { name: 'To Do', value: pendingTasks > 0 ? pendingTasks : 1, color: '#FCD34D' }, // Avoid completely empty chart
    { name: 'In Progress', value: inProgressTasks, color: '#60A5FA' },
    { name: 'Done', value: completedTasks, color: '#34D399' }
  ];

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar onAddTask={() => { setShowTaskModal(true); setEditingTask(null); }} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-outfit font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 drop-shadow-sm">
              Welcome back, {user?.full_name || username}
            </h1>
            <p className="text-sm font-semibold text-gray-500 mt-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Here is what's happening with your projects today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2.5 rounded-2xl shadow-sm flex items-center border border-gray-100 transition-shadow hover:shadow-md">
              <Search size={18} className="text-gray-400 mr-2" strokeWidth={3} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="outline-none text-sm text-gray-600 bg-transparent w-48 font-medium" 
              />
            </div>
            <NotificationBell />
            <div 
              onClick={() => navigate('/settings')}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
            >
              {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-2xl object-cover" /> : userInitial}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6 mb-8">
          <StatCard 
            title="Total Tasks" 
            count={totalTasks} 
            icon={<FolderOpen size={24} strokeWidth={2.5} />} 
            bgClass="bg-indigo-50" 
            iconColorClass="text-indigo-600" 
          />
          <StatCard 
            title="In Progress" 
            count={inProgressTasks} 
            icon={<Activity size={24} strokeWidth={2.5} />} 
            bgClass="bg-blue-50" 
            iconColorClass="text-blue-600" 
          />
          <StatCard 
            title="Pending" 
            count={pendingTasks} 
            icon={<Clock size={24} strokeWidth={2.5} />} 
            bgClass="bg-amber-50" 
            iconColorClass="text-amber-600" 
          />
          <StatCard 
            title="Completed" 
            count={completedTasks} 
            icon={<CheckCircle size={24} strokeWidth={2.5} />} 
            bgClass="bg-emerald-50" 
            iconColorClass="text-emerald-600" 
          />
        </div>

        {/* Charts Row */}
        <div className="flex gap-6 mb-8">
          {/* Line Chart */}
          <div className="flex-[2] bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-80">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Activity Overview</h2>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={defaultLineChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                  cursor={{ stroke: '#F3F4F6', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="task" stroke="#6366F1" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-80 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Task Status</h2>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={10}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-bold text-gray-500">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tasks List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Recent Tasks</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-indigo-500">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 -mr-2 h-64">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">
                  {searchQuery ? "No tasks found matching your search." : "No tasks found. Create your first one!"}
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-gray-50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500 shadow-red-500/50' : task.priority === 'low' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-amber-500 shadow-amber-500/50'} shadow-sm`} />
                      <span className="font-bold text-gray-800 line-clamp-1">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-extrabold px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg uppercase tracking-wider">
                        {task.status.replace('-', ' ')}
                      </span>
                      {task.due_date && <span className="text-sm font-semibold text-gray-400 w-20 text-right">{task.due_date}</span>}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingTask(task); setShowTaskModal(true); }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all shrink-0"
                        title="Edit Task"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      <AddTaskModal 
        open={showTaskModal} 
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onTaskAdded={fetchTasks}
        editingTask={editingTask}
      />
    </div>
  );
}
