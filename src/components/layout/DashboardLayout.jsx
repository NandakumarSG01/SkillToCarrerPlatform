import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AICopilot from '../AICopilot';
import {
  LayoutDashboard, FileText, Network, Briefcase,
  BookOpen, Edit3, Plug, ChevronLeft, ChevronRight,
  Bot, User, LogOut, Settings, Bell, Search, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Resume Analyzer', to: '/dashboard/resume', icon: FileText },
  { label: 'Skill Graph', to: '/dashboard/skillgraph', icon: Network },
  { label: 'Job Matches', to: '/dashboard/jobs', icon: Briefcase },
  { label: 'Learning Path', to: '/dashboard/learn', icon: BookOpen },
  { label: 'AI Resume Editor', to: '/dashboard/editor', icon: Edit3 },
  { label: 'Integrations', to: '/dashboard/integrations', icon: Plug },
  { label: 'User Profile', to: '/dashboard/profile', icon: User },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      const q = encodeURIComponent(globalSearch.trim());
      if (location.pathname.includes('/dashboard/learn')) {
        navigate(`/dashboard/learn?q=${q}`);
      } else {
        navigate(`/dashboard/jobs?q=${q}`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: 'rgba(10,10,20,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={16} color="white" fill="white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: '#f0f0ff' }}
              >
                SkillGraph<span style={{ color: '#6366f1' }}>AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              title={collapsed ? label : undefined}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 13 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* User + collapse */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            onClick={() => navigate('/dashboard/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8,
              cursor: 'pointer', transition: 'background 0.15s',
              justifyContent: collapsed ? 'center' : 'flex-start'
            }}
            className="sidebar-item"
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white'
            }}>
              {user?.avatar || 'U'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f0ff', whiteSpace: 'nowrap' }}>{user?.profile?.fullName || user?.name || 'User'}</div>
                  <div style={{ fontSize: 11, color: '#8888aa', whiteSpace: 'nowrap' }}>{user?.profile?.headline || 'Profile'}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleLogout} className="sidebar-item" style={{ border: 'none', width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <LogOut size={15} />
            <AnimatePresence>
              {!collapsed && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{fontSize:13}}>Logout</motion.span>}
            </AnimatePresence>
          </button>

          <button
            onClick={() => setCollapsed(c => !c)}
            className="sidebar-item"
            style={{ border: 'none', width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            <AnimatePresence>
              {!collapsed && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{fontSize:13}}>Collapse</motion.span>}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(7,7,15,0.8)', backdropFilter: 'blur(10px)', flexShrink: 0
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8, padding: '6px 14px', width: 260
          }}>
            <Search size={14} color="#8888aa" />
            <input 
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              onKeyDown={handleGlobalSearch}
              placeholder="Search skills, jobs..." 
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f0f0ff', fontSize: 13, width: '100%' }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-ghost" style={{ padding: '7px' }}>
              <Bell size={16} />
            </button>
            <button
              onClick={() => setCopilotOpen(o => !o)}
              className={copilotOpen ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '7px 12px', fontSize: 13 }}
            >
              <Bot size={15} />
              AI Copilot
            </button>
          </div>
        </div>

        {/* Page + Copilot */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px', minWidth: 0 }}>
            <div className="page-enter">
              <Outlet />
            </div>
          </main>

          <AnimatePresence>
            {copilotOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  borderLeft: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(10,10,20,0.9)',
                  overflow: 'hidden', flexShrink: 0
                }}
              >
                <div style={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <AICopilot />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
