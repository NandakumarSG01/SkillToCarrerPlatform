import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/Landing';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardHome from './pages/Dashboard';
import ResumePage from './pages/Resume';
import SkillGraphPage from './pages/SkillGraph';
import JobsPage from './pages/Jobs';
import JobDetailPage from './pages/JobDetail';
import LearnPage from './pages/Learn';
import EditorPage from './pages/Editor';
import IntegrationsPage from './pages/Integrations';
import ProfilePage from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#07070f' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.3)', borderTop: '2px solid #6366f1', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#8888aa', fontSize: 14 }}>Loading SkillGraph AI...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div className="bg-mesh" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="skillgraph" element={<SkillGraphPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="editor" element={<EditorPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
