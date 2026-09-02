import React, { useState, createContext, useEffect, ReactNode } from "react";
import axios from "axios";
import "./index.css"; // Ensure tailwind is imported
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import Dashboard from "./Dashboard";
import CalendarPage from "./CalendarPage";
import SettingsPage from "./SettingsPage";
import TrackingPage from "./TrackingPage";
import ProjectsPage from "./ProjectsPage";
import InboxPage from "./InboxPage";
import MyTasksPage from "./MyTasksPage";
import ProjectDetailsPage from "./ProjectDetailsPage";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from "./types";
import { NotificationProvider } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  login: (token: string, provider?: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {}
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error("Token invalid", err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, provider?: string) => {
    localStorage.setItem('token', token);
    await fetchUser(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen w-screen text-indigo-500 font-semibold">Loading...</div>;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const urlToken = searchParams.get("token");
  if (urlToken && !user) {
    login(urlToken, "Google User");
    window.history.replaceState({}, document.title, "/");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
            
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/my-tasks" element={user ? <MyTasksPage /> : <Navigate to="/login" />} />
            <Route path="/calendar" element={user ? <CalendarPage /> : <Navigate to="/login" />} />
            <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
            <Route path="/tracking" element={user ? <TrackingPage /> : <Navigate to="/login" />} />
            <Route path="/projects" element={user ? <ProjectsPage /> : <Navigate to="/login" />} />
            <Route path="/projects/:id" element={user ? <ProjectDetailsPage /> : <Navigate to="/login" />} />
            <Route path="/inbox" element={user ? <InboxPage /> : <Navigate to="/login" />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthContext.Provider>
  );
}
