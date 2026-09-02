import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from './App';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useNavigate } from 'react-router-dom';
import AddTaskModal from './AddTaskModal';
import { Task, Project } from './types';
import { Search, Loader2, Edit2, Trash2, Clock, Filter, SlidersHorizontal, ArrowLeft } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

export default function MyTasksPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all, independent, project
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterModule, setFilterModule] = useState('all');

  const username = user?.username || "user";
  const avatarUrl = user?.profile_picture_url || "";
  const userInitial = username[0]?.toUpperCase() || "U";

  const fetchData = async () => {
    try {
      const [taskRes, projRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/tasks`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${API_URL}/api/v1/projects`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setTasks(taskRes.data.reverse());
      setProjects(projRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`${API_URL}/api/v1/tasks/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        fetchData();
      } catch (err) {
        console.error("Failed to delete task", err);
      }
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Search
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Project
      if (filterProject !== 'all' && t.project_id !== filterProject) return false;

      // Type
      if (filterType === 'independent' && t.project_id) return false;
      if (filterType === 'project' && !t.project_id) return false;

      // Status
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;

      // Priority
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;

      // Module
      if (filterModule !== 'all' && (t.category || 'Uncategorized') !== filterModule) return false;

      return true;
    });
  }, [tasks, searchQuery, filterProject, filterType, filterStatus, filterPriority, filterModule]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar onAddTask={() => { setShowTaskModal(true); setEditingTask(null); }} />

      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow-sm text-indigo-500 hover:bg-gray-50 border border-gray-100" title="Back to Dashboard">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-outfit font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 drop-shadow-sm">
                My Tasks
              </h1>
              <p className="text-sm font-semibold text-gray-500 mt-1.5 flex items-center gap-2">
                Manage all your tasks in one unified view.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2.5 rounded-2xl shadow-sm flex items-center border border-gray-100 transition-shadow hover:shadow-md">
              <Search size={18} className="text-gray-400 mr-2" strokeWidth={3} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
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

        {/* Smart Filters Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mr-2">
            <SlidersHorizontal size={18} className="text-indigo-500" /> Filters:
          </div>
          
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">Type: All</option>
            <option value="independent">Independent Tasks</option>
            <option value="project">Project Tasks</option>
          </select>

          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">Project: All</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">Status: All</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">Priority: All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">Module: All</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
            <option value="DevOps">DevOps</option>
            <option value="Marketing">Marketing</option>
            <option value="Research">Research</option>
            <option value="Uncategorized">Uncategorized</option>
          </select>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Tasks ({filteredTasks.length})</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48 text-indigo-500">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 -mr-2 flex-1">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">
                  No tasks found matching your filters.
                </div>
              ) : (
                filteredTasks.map(task => {
                  const proj = projects.find(p => p.id === task.project_id);
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 border border-gray-50 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500 shadow-red-500/50' : task.priority === 'low' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-amber-500 shadow-amber-500/50'} shadow-sm`} />
                        <span className="font-bold text-gray-800 line-clamp-1 min-w-[200px]">{task.title}</span>
                        {proj ? (
                          <span className="text-[10px] font-extrabold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">
                            🔵 {proj.name}
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
                            Independent
                          </span>
                        )}
                        {(task.category && task.category !== 'Uncategorized') && (
                          <span className="text-[10px] font-extrabold px-2 py-1 bg-purple-50 text-purple-600 rounded-md">
                            {task.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-extrabold px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg uppercase tracking-wider w-28 text-center">
                          {task.status.replace('-', ' ')}
                        </span>
                        {task.due_date && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md whitespace-nowrap">
                            <Clock size={12} strokeWidth={2.5} />
                            <span>{task.due_date}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingTask(task); setShowTaskModal(true); }}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all shrink-0"
                            title="Edit Task"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, task.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shrink-0"
                            title="Delete Task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>

      <AddTaskModal 
        open={showTaskModal} 
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onTaskAdded={fetchData}
        editingTask={editingTask}
      />
    </div>
  );
}
