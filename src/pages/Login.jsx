import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) { setError('Email is required'); return; }
    if (!form.password.trim()) { setError('Password is required'); return; }

    setLoading(true);
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#07070f' }}>
      <div className="bg-mesh" />

      {/* Left Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="white" fill="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: '#f0f0ff' }}>SkillGraph<span style={{ color: '#6366f1' }}>AI</span></span>
          </Link>

          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', lineHeight: 1.15, marginBottom: 16 }}>
            Your career graph<br />awaits.
          </h2>
          <p style={{ color: '#8888aa', fontSize: 15, lineHeight: 1.7, maxWidth: 360 }}>
            Sign in to access your skill profile, job matches, and personalized AI learning recommendations.
          </p>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Skill graph with proficiency scores', 'Job match accuracy up to 94%', 'AI-powered learning recommendations', 'Resume editor with AI suggestions'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#8888aa', fontSize: 13 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
                </div>
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ color: '#8888aa', fontSize: 14 }}>Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="input-label">Email address</label>
              <input type="email" className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@gmail.com" required />
            </div>

            <div>
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="input-field" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Enter your password" required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, color: '#fda4af', fontSize: 13 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '13px', fontSize: 15, justifyContent: 'center', position: 'relative', zIndex: 1, marginTop: 4 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} />
                  Signing in...
                </span>
              ) : (
                <><span>Sign in</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#8888aa', marginTop: 24 }}>
            New to SkillGraph?{' '}
            <Link to="/register" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>Create account →</Link>
          </p>
        </motion.div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
