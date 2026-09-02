import React, { useContext, useState, useEffect } from 'react';
import { Search, ArrowLeft, FolderPlus, Folder, Plus, X, Trash2, CheckCircle2, Clock, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from './App';
import axios from 'axios';
import NotificationBell from './NotificationBell';
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
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    if (category.toLowerCase().includes('startup')) {
      return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', label: 'Startup' };
    }
    if (category.toLowerCase().includes('client')) {
      return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'Client' };
    }
    return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Personal' };
  };

  // Determine Project Health based on Tasks
  const getProjectHealth = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    if (projectTasks.length === 0) return { label: 'On Track', color: 'bg-emerald-500' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueCount = projectTasks.filter(t => {
      if (t.status === 'done' || !t.due_date) return false;
      const dueDate = new Date(t.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;

    const highPriorityPending = projectTasks.filter(t => t.status !== 'done' && (t.priority === 'high' || t.priority === '🔴 High')).length;

    if (overdueCount > 0) return { label: 'Behind Schedule', color: 'bg-red-500' };
    if (highPriorityPending > 0) return { label: 'At Risk', color: 'bg-amber-500' };
    return { label: 'On Track', color: 'bg-emerald-500' };
  };

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.project_id === projectId);
    if (projectTasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = projectTasks.filter(t => t.status === 'done').length;
    const percentage = Math.round((completed / projectTasks.length) * 100);
    return { completed, total: projectTasks.length, percentage };
  };

  const deleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`${API_URL}/api/v1/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error("Failed to delete project", err);
      alert("Failed to delete project. Please try again.");
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="outline-none text-sm text-gray-600 bg-transparent w-48"
              />
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

        {/* Content */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Your Projects</h2>
          <button 
            onClick={() => {
              setEditingProject(null);
              setShowTemplateModal(true);
            }}
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
            {filteredProjects.length === 0 ? (
               <div className="col-span-full text-center text-gray-500 py-10">
                 {searchQuery ? `No projects found matching "${searchQuery}".` : 'No projects found. Create one!'}
               </div>
            ) : filteredProjects.map((project, index) => {
              const badge = getCategoryBadge(project.category);
              const health = getProjectHealth(project.id);
              const progress = getProjectProgress(project.id);
              
              // Map Priority to Color and Text
              let priorityColor = "text-amber-600 bg-amber-50 border-amber-100";
              let priorityText = "🟡 Medium";
              if (project.priority === "High" || project.priority === "🔴 High") {
                priorityColor = "text-red-600 bg-red-50 border-red-100";
                priorityText = "🔴 High";
              } else if (project.priority === "Low" || project.priority === "🟢 Low") {
                priorityColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
                priorityText = "🟢 Low";
              }

              // Map Status to Color
              const statusVal = project.status || "Planning";
              let statusColor = "text-gray-500 bg-gray-100 border-gray-200";
              if (statusVal === "In Progress") statusColor = "text-indigo-600 bg-indigo-50 border-indigo-100";
              else if (statusVal === "On Hold") statusColor = "text-amber-600 bg-amber-50 border-amber-100";
              else if (statusVal === "Completed") statusColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
              else if (statusVal === "Cancelled") statusColor = "text-red-600 bg-red-50 border-red-100";

              return (
                <div 
                  key={project.id || index} 
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group flex flex-col relative h-full"
                >
                  
                  {/* Top Row: Health, Actions & Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${health.color} animate-pulse`} />
                      <span className="text-xs font-bold text-gray-500">{health.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Action Buttons (Hover) */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingProject(project); setShowTemplateModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all"
                          title="Edit Project"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => deleteProject(project.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          title="Delete Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform shrink-0">
                      <Folder size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1">{project.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${priorityColor}`}>
                          {priorityText}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${statusColor}`}>
                          {statusVal}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">{project.description}</p>
                  )}

                  <div className="mt-auto">
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mb-2">
                      <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className={progress.percentage === 100 ? "text-emerald-500" : "text-gray-400"} />
                        {progress.percentage}% Completed
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        {progress.completed}/{progress.total} Tasks
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${progress.percentage === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
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
                    <h2 className="text-xl font-bold text-gray-900">{editingProject ? "Edit Project" : "Create New Project"}</h2>
                    <p className="text-sm font-semibold text-indigo-500">{editingProject ? "Update workspace details" : "Start a new workspace"}</p>
                  </div>
                </div>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const formData = new FormData(e.currentTarget);
                    const payload = {
                      name: formData.get("name") as string,
                      category: formData.get("category") as string,
                      description: formData.get("description") as string,
                      priority: formData.get("priority") as string,
                      status: formData.get("status") as string
                    };
                    if (editingProject) {
                      await axios.put(`${API_URL}/api/v1/projects/${editingProject.id}`, payload, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                      });
                    } else {
                      await axios.post(`${API_URL}/api/v1/projects`, payload, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                      });
                    }
                    setShowTemplateModal(false);
                    setEditingProject(null);
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
                      defaultValue={editingProject?.name || ""}
                      placeholder="E.g., Website Redesign"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      required
                      defaultValue={editingProject?.category || "Personal"}
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
                        defaultValue={editingProject?.priority || "Medium"}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-gray-700"
                      >
                        <option value="Low">🟢 Low</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="High">🔴 High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                      <select
                        name="status"
                        required
                        defaultValue={editingProject?.status || "Planning"}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-gray-700"
                      >
                        <option value="Planning">Planning</option>
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
                      defaultValue={editingProject?.description || ""}
                      placeholder="Brief description of the project..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => { setShowTemplateModal(false); setEditingProject(null); }}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-all"
                  >
                    {editingProject ? "Save Changes" : "Create Project"}
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
