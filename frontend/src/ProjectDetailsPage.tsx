import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from './App';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { Project, Task, Milestone } from './types';
import { ArrowLeft, Target, Plus, CheckCircle2, Clock, CheckCircle, Activity, Flag, Edit2, Trash2 } from 'lucide-react';
import AddTaskModal from './AddTaskModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList, Tooltip as RechartsTooltip } from 'recharts';

const API_URL = "http://127.0.0.1:8000";

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'milestones' | 'progress'>('overview');
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // New Milestone State
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');

  const username = user?.username || "user";
  const avatarUrl = user?.profile_picture_url || "";
  const userInitial = username[0]?.toUpperCase() || "U";

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [projRes, taskRes, mileRes, actRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/projects`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/v1/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/v1/milestones?project_id=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/v1/activity?project_id=${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const currentProj = projRes.data.find((p: Project) => p.id === id);
      setProject(currentProj);
      
      const projTasks = taskRes.data.filter((t: Task) => t.project_id === id);
      setTasks(projTasks);
      setMilestones(mileRes.data);
      setActivities(actRes.data);
    } catch (err) {
      console.error("Failed to fetch project details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/v1/milestones`, {
        name: milestoneName,
        project_id: id,
        status: "Pending",
        due_date: milestoneDate || null
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowMilestoneModal(false);
      setMilestoneName('');
      setMilestoneDate('');
      fetchData();
    } catch (err) {
      console.error("Failed to create milestone", err);
    }
  };

  const getCategoryBadge = (category: string) => {
    if (category?.toLowerCase().includes('course') || category?.toLowerCase().includes('academic')) {
      return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', label: 'Academic' };
    }
    if (category?.toLowerCase().includes('startup')) {
      return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', label: 'Startup' };
    }
    if (category?.toLowerCase().includes('client')) {
      return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'Client' };
    }
    return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Personal' };
  };

  const handleDeleteTask = async (taskId: string | number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`${API_URL}/api/v1/tasks/${taskId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        fetchData();
      } catch (err) {
        console.error("Failed to delete task", err);
      }
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-500 font-bold">Loading Workspace...</div>;
  }

  if (!project) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500 font-bold">Project not found.</div>;
  }

  const badge = getCategoryBadge(project.category);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Compute Module Chart Data
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Workspace Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-20">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/projects')} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-indigo-600 transition-colors">
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.name}</h1>
                  <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-500 mt-1">{project.description || "No description provided."}</p>
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

          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-gray-100">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'milestones', label: 'Milestones' },
              { id: 'progress', label: 'Progress' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Project Progress</h3>
                    <p className="text-sm text-gray-500 mt-1">{completedTasks} of {totalTasks} tasks completed</p>
                  </div>
                  <div className="text-3xl font-black text-indigo-600">{progressPercentage}%</div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 max-h-[300px] overflow-y-auto">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="flex flex-col gap-4">
                    {activities.length === 0 ? (
                      <div className="text-sm text-gray-500 italic">No recent activity.</div>
                    ) : (
                      activities.map(act => (
                        <div key={act.id} className="flex flex-col gap-1 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                          <span className="text-sm font-semibold text-gray-800">{act.description}</span>
                          <span className="text-xs font-medium text-gray-400">{new Date(act.created_at).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Project Details</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{project.status || "Planning"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Priority</span>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{project.priority || "Medium"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Created On</span>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">All Tasks</h3>
                <button 
                  onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={16} strokeWidth={3} />
                  Add Task
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 font-medium">No tasks in this project yet.</div>
                ) : tasks.map(task => (
                  <div key={task.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'low' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="font-bold text-gray-800">{task.title}</span>
                      {task.category && task.category !== 'Uncategorized' && (
                        <span className="text-[10px] font-extrabold px-2 py-1 bg-purple-50 text-purple-600 rounded-md">
                          {task.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-extrabold px-3 py-1 bg-gray-100 text-gray-500 rounded-lg uppercase tracking-wider">{task.status.replace('-', ' ')}</span>
                      {task.due_date && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                          <Clock size={12} strokeWidth={2.5} />
                          <span>{task.due_date}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 ml-4">
                        <button 
                          onClick={() => { setEditingTask(task); setShowTaskModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 size={16} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Project Milestones</h3>
                <button 
                  onClick={() => setShowMilestoneModal(true)}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Target size={16} strokeWidth={3} />
                  Create Milestone
                </button>
              </div>

              {milestones.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium bg-white rounded-3xl border border-gray-100">
                  No milestones created. Use milestones to organize project phases.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {milestones.map(milestone => {
                    const mTasks = tasks.filter(t => t.milestone_id === milestone.id);
                    const mTotal = mTasks.length;
                    const mCompleted = mTasks.filter(t => t.status === 'done').length;
                    const mProgress = mTotal === 0 ? 0 : Math.round((mCompleted / mTotal) * 100);

                    return (
                      <div key={milestone.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                              <Flag size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 line-clamp-1">{milestone.name}</h4>
                              <p className="text-xs font-bold text-gray-400 mt-0.5">{milestone.status}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                            <span>Progress</span>
                            <span className={mProgress === 100 ? "text-emerald-500" : "text-indigo-600"}>{mProgress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${mProgress === 100 ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${mProgress}%` }} />
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-400">{mCompleted} of {mTotal} tasks completed</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-96">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Module Completion Details</h3>
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
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">No tasks data available.</div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Create Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-[400px] overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create Milestone</h2>
            <p className="text-sm font-semibold text-gray-500 mb-6">Group your tasks into phases.</p>
            <form onSubmit={handleCreateMilestone} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Milestone Name</label>
                <input required type="text" value={milestoneName} onChange={e => setMilestoneName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm" placeholder="e.g. Hotel Module" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Due Date (Optional)</label>
                <input type="date" value={milestoneDate} onChange={e => setMilestoneDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-gray-600" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowMilestoneModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal - prepopulated with project_id */}
      {showTaskModal && (
        <AddTaskModal 
          open={showTaskModal} 
          onClose={() => setShowTaskModal(false)} 
          onTaskAdded={fetchData} 
          editingTask={editingTask}
          defaultProjectId={project.id}
        />
      )}
    </div>
  );
}
