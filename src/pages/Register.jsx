import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Eye, EyeOff, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'One number' },
  { test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p), label: 'One special character' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmailValid = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const allPasswordRulesPass = PASSWORD_RULES.every(r => r.test(form.password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Full name is required'); return; }
    if (!isEmailValid(form.email)) { setError('Please enter a valid email (e.g. name@gmail.com)'); return; }
    if (!allPasswordRulesPass) { setError('Password does not meet all requirements'); return; }

    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07070f', padding: 24, position: 'relative' }}>
      <div className="bg-mesh" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48, justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="white" fill="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.03em', color: '#f0f0ff' }}>SkillGraph<span style={{ color: '#6366f1' }}>AI</span></span>
        </Link>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '40px 36px', backdropFilter: 'blur(20px)' }}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 8 }}>Create your account</h1>
            <p style={{ color: '#8888aa', fontSize: 14 }}>Your career intelligence platform awaits</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="input-label">Full name</label>
              <input type="text" className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter your full name" required />
            </div>
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
              {/* Password strength indicators */}
              {form.password.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {PASSWORD_RULES.map((rule, i) => {
                    const passes = rule.test(form.password);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: passes ? '#10b981' : '#8888aa', transition: 'color 0.2s' }}>
                        <CheckCircle2 size={12} style={{ opacity: passes ? 1 : 0.3 }} />
                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, color: '#fda4af', fontSize: 13 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '13px', fontSize: 15, justifyContent: 'center', position: 'relative', zIndex: 1, marginTop: 6 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} />
                  Creating account...
                </span>
              ) : (
                <><span>Create account</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#8888aa', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </motion.div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
