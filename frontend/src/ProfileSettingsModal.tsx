import React, { useState } from 'react';
import axios from 'axios';
import { X, Eye, EyeOff, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

interface ProfileSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({ open, onClose }: ProfileSettingsModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!open) return null;

  const handleUpdate = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    try {
      const updateData: any = {};
      if (email.trim()) updateData.email = email.trim();
      if (password) updateData.password = password;

      if (Object.keys(updateData).length === 0) {
        setErrorMsg("Please fill at least one field to update.");
        setLoading(false);
        return;
      }

      await axios.put(`${API_URL}/users/update`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setSuccessMsg("Profile updated successfully!");
      setEmail('');
      setPassword('');
      
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2000);
      
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gray-50 p-6 relative border-b border-gray-100">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Update your email or password</p>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {successMsg && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <p className="text-sm font-bold">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-100">
              <ShieldAlert size={20} className="text-red-500" />
              <p className="text-sm font-bold">{errorMsg}</p>
            </div>
          )}

          <div className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">New Email Address</label>
              <input
                type="email"
                placeholder="Enter new email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 pt-0 flex justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
