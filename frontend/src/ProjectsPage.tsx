import React, { useContext, useState, useEffect } from 'react';
import { Search, Bell, ArrowLeft, FolderPlus, Folder, Activity, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from './App';
import axios from 'axios';
import { Project, Task } from './types';

const API_URL = "http://127.0.0.1:8000";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const username = user?.username || "user";
  const avatarUrl = user?.profile_picture_url || "";
  const userInitial = username[0]?.toUpperCase() || "U";

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [projRes, taskRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/projects`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/v1/tasks`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProjects(projRes.data);
        setTasks(taskRes.data);
      } catch (error) {
        console.error("Error fetching project data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  // Generate Category Badge Style
  const getCategoryBadge = (category: string) => {
    if (category.toLowerCase().includes('course') || category.toLowerCase().includes('academic')) {
      return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', label: 'Academic' };
    }
    if (category.toLowerCase().includes('startup') || category.toLowerCase().includes('client')) {
      return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', label: 'Startup' };
    }
    return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Personal' };
  };

  // Determine Project Health based on Tasks
  const getProjectHealth = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    if (projectTasks.length === 0) return { label: 'On Track', color: 'bg-emerald-500' };

    const overdueCount = projectTasks.filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()).length;
    const highPriorityPending = projectTasks.filter(t => t.status !== 'done' && t.priority === 'high').length;

    if (overdueCount > 0) return { label: 'Behind Schedule', color: 'bg-red-500' };
    if (highPriorityPending > 0) return { label: 'At Risk', color: 'bg-amber-500' };
    return { label: 'On Track', color: 'bg-emerald-500' };
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto p-8 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-white rounded-full shadow-sm text-indigo-500 hover:bg-gray-50">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Workspaces & Portfolios</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center border border-gray-100">
              <Search size={20} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search projects..." className="outline-none text-sm text-gray-600 bg-transparent" />
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <Bell size={20} />
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Your Projects</h2>
          <button 
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-600 font-bold text-sm transition-colors shadow-lg shadow-indigo-500/30"
          >
            <FolderPlus size={18} strokeWidth={3} />
            New Project Template
          </button>
        </div>

        {loading ? (
           <div className="text-center mt-10 text-gray-500 font-bold">Loading workspaces...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.length === 0 ? (
               <div className="col-span-full text-center text-gray-500 py-10">No projects found. Create one!</div>
            ) : projects.map((project, index) => {
              const badge = getCategoryBadge(project.category);
              const health = getProjectHealth(project.id);
              
              return (
                <div key={project.id || index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group">
                  
                  {/* Top Row: Health & Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${health.color} animate-pulse`} />
                      <span className="text-xs font-bold text-gray-500">{health.label}</span>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                      <Folder size={24} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{project.name}</h3>
                  </div>

                  {/* Team Members & Invite */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                          T{i}
                        </div>
                      ))}
                    </div>
                    <button className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:bg-indigo-50 px-2 py-1.5 rounded-lg transition-colors">
                      <Plus size={14} strokeWidth={3} /> Invite
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Project Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="bg-indigo-50 p-6 relative">
                <button 
                  onClick={() => setShowTemplateModal(false)}
                  className="absolute top-4 right-4 p-2 text-indigo-500 hover:bg-indigo-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <FolderPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
                    <p className="text-sm font-semibold text-indigo-500">Start a new workspace</p>
                  </div>
                </div>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.target as typeof e.target & {
                    name: { value: string };
                    category: { value: string };
                    description: { value: string };
                    priority: { value: string };
                    status: { value: string };
                  };
                  try {
                    await axios.post(`${API_URL}/api/v1/projects`, {
                      name: target.name.value,
                      category: target.category.value,
                      description: target.description.value,
                      priority: target.priority.value,
                      status: target.status.value
                    }, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setShowTemplateModal(false);
                    // Refresh data
                    const token = localStorage.getItem('token');
                    const projRes = await axios.get(`${API_URL}/api/v1/projects`, { headers: { Authorization: `Bearer ${token}` } });
                    setProjects(projRes.data);
                  } catch (err) {
                    console.error("Failed to create project", err);
                    alert("Failed to create project. Please try again.");
                  }
                }}
                className="p-6"
              >
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Project Name</label>
                    <input
                      name="name"
                      required
                      autoFocus
                      type="text"
                      placeholder="E.g., Website Redesign"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-gray-700"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Academic">Academic</option>
                      <option value="Startup">Startup</option>
                      <option value="Client">Client</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                      <select
                        name="priority"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-gray-700"
                      >
                        <option value="Low">🟢 Low</option>
                        <option value="Medium" selected>🟡 Medium</option>
                        <option value="High">🔴 High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                      <select
                        name="status"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-gray-700"
                      >
                        <option value="Planning" selected>Planning</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Brief description of the project..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-all"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
