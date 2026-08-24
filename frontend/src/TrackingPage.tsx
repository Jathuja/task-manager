import React, { useContext, useEffect, useState } from 'react';
import { Search, Bell, ArrowLeft, AlertCircle, Clock, ShieldAlert, CheckCircle2, Circle, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from './App';
import NotificationBell from './NotificationBell';
import axios from 'axios';
import { Task, Project } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import AddTaskModal from './AddTaskModal';

const API_URL = "http://127.0.0.1:8000";

export default function TrackingPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const username = user?.username || "user";
  const avatarUrl = user?.profile_picture_url || "";
  const userInitial = username[0]?.toUpperCase() || "U";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasksAndProjects = async () => {
    try {
      const [taskRes, projRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/tasks`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${API_URL}/api/v1/projects`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setTasks(taskRes.data);
      setProjects(projRes.data);
    } catch (err) {
      console.error("Failed to fetch tracking data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndProjects();
  }, []);

  // Compute metrics
  const highPriorityOverdue = tasks.filter(t => t.priority === 'high' && t.status !== 'done');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  
  // Aggregate by category
  const categories: Record<string, { total: number, completed: number }> = {};
  tasks.forEach(t => {
    const cat = t.category || "Uncategorized";
    if (!categories[cat]) categories[cat] = { total: 0, completed: 0 };
    categories[cat].total += 1;
    if (t.status === 'done') categories[cat].completed += 1;
  });

  const chartData = Object.entries(categories).map(([name, data]) => {
    const completion = Math.round((data.completed / data.total) * 100);
    return {
      name,
      Completion: completion,
      fill: completion === 100 ? '#10B981' : (completion > 0 ? '#6366F1' : '#E5E7EB')
    };
  });

  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Calculate milestones from projects
  const milestones = projects.map(proj => {
    const projTasks = tasks.filter(t => t.project_id === proj.id);
    const totalProjTasks = projTasks.length;
    const completedProjTasks = projTasks.filter(t => t.status === 'done').length;
    
    let status = 'Pending';
    let color = 'bg-gray-200 text-gray-400';
    let borderColor = 'border-gray-200';
    
    if (totalProjTasks > 0) {
      if (completedProjTasks === totalProjTasks) {
        status = 'Completed';
        color = 'text-emerald-600';
        borderColor = 'border-emerald-500 bg-emerald-500';
      } else if (completedProjTasks > 0) {
        status = 'In Progress';
        color = 'text-indigo-500';
        borderColor = 'border-indigo-500 bg-indigo-500';
      }
    }
    
    return { id: proj.id, name: proj.name, status, color, borderColor };
  });

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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Time & Milestone Tracking</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center border border-gray-100">
              <Search size={20} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search..." className="outline-none text-sm text-gray-600 bg-transparent" />
            </div>
            <NotificationBell />
            <div 
              onClick={() => navigate('/settings')} 
              className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold cursor-pointer"
            >
              {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" /> : userInitial}
            </div>
          </div>
        </div>

        {loading ? (
           <div className="text-center mt-10 text-gray-500 font-bold">Loading metrics...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Progress & Modules */}
            <div className="xl:col-span-2 flex flex-col gap-8">
              
              {/* Overall Progress Banner */}
              <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-lg flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-2">Overall Velocity</h2>
                  <p className="text-indigo-200 font-medium max-w-sm">
                    You have completed {completedTasks} out of {totalTasks} tasks. Keep pushing towards your next milestone!
                  </p>
                </div>
                <div className="relative z-10 w-32 h-32 flex items-center justify-center rounded-full bg-indigo-500 border-4 border-indigo-400 shadow-inner">
                   <span className="text-4xl font-black">{overallProgress}%</span>
                </div>
                
                {/* Decorative circles */}
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-50px] left-[200px] w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              </div>

              {/* Module Progress Chart */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-96">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Module Completion Status</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 13, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                      <RechartsTooltip 
                        cursor={{fill: '#F3F4F6'}} 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}}
                        formatter={(value) => [`${value}%`, 'Completion']}
                      />
                      <Bar dataKey="Completion" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList dataKey="Completion" position="top" formatter={(val: number) => `${val}%`} style={{ fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium">No category data available.</div>
                )}
              </div>
            </div>

            {/* Right Column: Alerts & Deadlines */}
            <div className="flex flex-col gap-6">
              
              {/* Overdue / Priority Alerts */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-red-500" />
                  Priority Alerts
                </h3>
                
                {highPriorityOverdue.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {highPriorityOverdue.slice(0,4).map(task => (
                      <div key={task.id} className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3 group">
                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-red-900 leading-tight">{task.title}</p>
                          <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                            <Clock size={12} /> {task.due_date || 'No Date'}
                          </p>
                        </div>
                        <button 
                          onClick={() => { setEditingTask(task); setShowTaskModal(true); }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-all shrink-0"
                          title="Edit Task"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                    <p className="text-sm font-bold text-emerald-700">You're all caught up!</p>
                    <p className="text-xs font-medium text-emerald-600 mt-1">No high priority alerts.</p>
                  </div>
                )}
              </div>

              {/* Milestone Tracker */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Milestone Tracker</h3>
                <div className="relative border-l-2 border-indigo-100 ml-3 pl-5 flex flex-col gap-6 py-2">
                  {milestones.length > 0 ? milestones.map(milestone => (
                    <div key={milestone.id} className="relative">
                      <div className={`absolute -left-[27px] w-4 h-4 rounded-full border-4 border-white shadow-sm ${milestone.borderColor}`}></div>
                      <p className={`text-sm font-bold ${milestone.status === 'Pending' ? 'text-gray-500' : 'text-gray-800'}`}>{milestone.name}</p>
                      <p className={`text-xs font-semibold mt-0.5 ${milestone.color}`}>{milestone.status}</p>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-500 font-medium italic">No projects found. Create one to see milestones!</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <AddTaskModal 
        open={showTaskModal} 
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onTaskAdded={fetchTasksAndProjects}
        editingTask={editingTask}
      />
    </div>
  );
}
