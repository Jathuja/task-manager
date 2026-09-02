import React, { useContext } from 'react';
import { 
  Plus, 
  LayoutDashboard, 
  Activity, 
  FolderOpen, 
  CalendarClock, 
  Inbox, 
  Settings,
  LogOut,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './App';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  path: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, path }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path;

  return (
    <div 
      onClick={() => navigate(path)}
      className={`group flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 ${
        active ? 'bg-white/10 text-white font-bold shadow-sm border border-white/5' : 'text-white/70 hover:bg-white/5 hover:text-white font-medium'
      }`}
    >
      <div className={`${active ? 'text-[#FCA311]' : 'text-[#FCA311]/70 group-hover:text-[#FCA311]'}`}>
        {icon}
      </div>
      <span className="text-[15px]">{text}</span>
    </div>
  );
};

interface SidebarProps {
  onAddTask?: () => void;
}

export default function Sidebar({ onAddTask }: SidebarProps) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="w-[260px] bg-gradient-to-br from-[#3b2d87] via-[#4638a0] to-[#5546c2] flex flex-col p-6 h-full text-white shadow-[4px_0_24px_rgba(67,53,158,0.25)] relative z-10">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 mt-2">
        <div className="bg-white text-[#43359E] w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
          <CheckCircle2 size={24} strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-[22px] font-bold tracking-tight leading-tight">PlanNex</h2>
          <p className="text-[11px] text-white/70 font-semibold tracking-wide uppercase">Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-2 -mr-2">
        <span className="text-[11px] font-bold text-white/50 mt-2 mb-2 ml-4 uppercase tracking-wider">Menu</span>
        <NavItem icon={<LayoutDashboard size={20} strokeWidth={2.5} />} text="Dashboard" path="/dashboard" />
        <NavItem icon={<ListTodo size={20} strokeWidth={2.5} />} text="My Tasks" path="/my-tasks" />
        <NavItem icon={<FolderOpen size={20} strokeWidth={2.5} />} text="Projects" path="/projects" />
        <NavItem icon={<Activity size={20} strokeWidth={2.5} />} text="Tracking" path="/tracking" />
        <NavItem icon={<CalendarClock size={20} strokeWidth={2.5} />} text="Calendar" path="/calendar" />
        <NavItem icon={<Inbox size={20} strokeWidth={2.5} />} text="Messages" path="/inbox" />
        
        <span className="text-[11px] font-bold text-white/50 mt-6 mb-2 ml-4 uppercase tracking-wider">Configuration</span>
        <NavItem icon={<Settings size={20} strokeWidth={2.5} />} text="Settings" path="/settings" />
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-6 flex flex-col gap-4">
        {onAddTask && (
          <button 
            onClick={onAddTask}
            className="flex items-center justify-center gap-2 bg-[#FCA311] text-white rounded-xl py-3.5 px-4 hover:bg-[#F39C12] transition-colors shadow-lg shadow-[#FCA311]/20 font-bold text-[15px]"
          >
            <Plus size={20} strokeWidth={3} />
            Add New Task
          </button>
        )}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 text-red-100 hover:bg-red-500/20 hover:text-red-400 font-medium w-full mt-2"
        >
          <LogOut size={20} strokeWidth={2.5} />
          <span className="text-[15px]">Logout</span>
        </button>
      </div>
    </div>
  );
}
