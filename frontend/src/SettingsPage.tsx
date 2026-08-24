import React, { useState, useContext } from 'react';
import { Search, Bell, ArrowLeft, Eye, EyeOff, Upload } from 'lucide-react';
import { AuthContext } from './App';
import axios from 'axios';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const API_URL = "http://127.0.0.1:8000";

export default function SettingsPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Profile state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [profilePic, setProfilePic] = useState(user?.profile_picture_url || '');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  const username = user?.username || "user";
  const userInitial = (user?.full_name || username)[0]?.toUpperCase();
  const avatarUrl = user?.profile_picture_url || "";

  const handleSaveProfile = async () => {
    setLoadingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const updateData = {
        full_name: fullName,
        email: email,
        role: role,
        department: department,
        profile_picture_url: profilePic
      };
      await axios.put(`${API_URL}/users/update`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfileMsg({ type: 'success', text: "Profile saved! Reloading..." });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || "Failed to save profile." });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await axios.post(`${API_URL}/users/profile-picture`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      setProfilePic(res.data.profile_picture_url);
      setProfileMsg({ type: 'success', text: "Profile picture uploaded! Reloading..." });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setProfileMsg({ type: 'error', text: "Failed to upload profile picture." });
    }
  };

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword) {
      setPwdMsg({ type: 'error', text: "Both Old and New Password are required." });
      return;
    }
    setLoadingPwd(true);
    setPwdMsg({ type: '', text: '' });
    try {
      const updateData = {
        old_password: oldPassword,
        password: newPassword
      };
      await axios.put(`${API_URL}/users/update`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPwdMsg({ type: 'success', text: "Password changed successfully!" });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: "Failed to change password." });
    } finally {
      setLoadingPwd(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center border border-gray-100">
              <Search size={20} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search..." className="outline-none text-sm text-gray-600 bg-transparent" />
            </div>
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold cursor-pointer">
              {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" /> : userInitial}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="max-w-3xl flex flex-col gap-8">
          
          {/* Profile Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Settings</h2>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-3xl overflow-hidden shadow-sm">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userInitial
                  )}
                </div>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="icon-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="icon-button-file">
                  <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-600 shadow-md">
                    <Upload size={16} />
                  </div>
                </label>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">@{username}</h3>
                <p className="text-sm text-gray-500 mb-2">Update your profile picture and personal details.</p>
                {profileMsg.text && <span className={`text-sm font-medium px-2 py-1 rounded ${profileMsg.type === 'error' ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>{profileMsg.text}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                />
              </div>
              <div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input 
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                  placeholder="e.g. Product Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input 
                  type="text" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                  placeholder="e.g. Engineering"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                disabled={loadingProfile}
                className="bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {loadingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Security</h2>
            <p className="text-sm text-gray-500 mb-6">Update your password to keep your account secure.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input 
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm pr-10"
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm pr-10"
                    placeholder="Enter new password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {pwdMsg.text && (
              <div className={`mt-4 text-sm font-medium p-3 rounded-xl ${pwdMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {pwdMsg.text}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSavePassword}
                disabled={loadingPwd}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {loadingPwd ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
