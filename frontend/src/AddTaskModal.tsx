import React, { useState } from 'react';
import axios from 'axios';
import { X, ClipboardList, Flag, CheckCircle, Clock, PlayCircle } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
}

export default function AddTaskModal({ open, onClose, onTaskAdded }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newTask = {
        id: Date.now(), 
        title,
        status,
        priority,
        due_date: dueDate || null
      };

      await axios.post(`${API_URL}/api/v1/tasks`, newTask, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      onTaskAdded();
      handleClose();
    } catch (err: any) {
      console.error("Failed to add task", err);
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please log out and log back in to continue.");
      } else {
        alert(err.response?.data?.detail || "Failed to add task!");
      }
    }
  };

  const handleClose = () => {
    setTitle('');
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    onClose();
  };

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-emerald-500', borderColor: 'border-emerald-500', bg: 'bg-emerald-50' },
    { value: 'medium', label: 'Medium', color: 'text-amber-500', borderColor: 'border-amber-500', bg: 'bg-amber-50' },
    { value: 'high', label: 'High', color: 'text-red-500', borderColor: 'border-red-500', bg: 'bg-red-50' },
  ];

  const statuses = [
    { value: 'todo', label: 'To Do', icon: <Clock size={16} /> },
    { value: 'in-progress', label: 'In Progress', icon: <PlayCircle size={16} /> },
    { value: 'done', label: 'Done', icon: <CheckCircle size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-indigo-50 p-6 relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-indigo-500 hover:bg-indigo-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
              <p className="text-sm font-semibold text-indigo-500">Add to your project board</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Task Title</label>
              <input
                autoFocus
                type="text"
                placeholder="E.g., Design new landing page..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-gray-900 font-medium placeholder-gray-400"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Current Status</label>
              <div className="flex gap-2">
                {statuses.map((s) => {
                  const isActive = status === s.value;
                  return (
                    <button
                      type="button"
                      key={s.value}
                      onClick={() => setStatus(s.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors border flex-1 justify-center ${
                        isActive 
                          ? 'bg-gray-800 text-white border-gray-800' 
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {s.icon}
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Priority Level</label>
              <div className="flex gap-2">
                {priorities.map((p) => {
                  const isActive = priority === p.value;
                  return (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors border flex-1 justify-center ${
                        isActive 
                          ? `${p.bg} ${p.color} ${p.borderColor}` 
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Flag size={16} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
