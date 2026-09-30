import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles, Network, Briefcase, BookOpen, Zap, ChevronDown } from 'lucide-react';

const FEATURES = [
  { icon: Network, title: 'Visual Skill Graph', desc: 'Interactive D3 graph mapping all your skills, proficiency levels, and their sources in real-time.', color: '#6366f1' },
  { icon: Briefcase, title: 'Intelligent Job Matching', desc: 'AI calculates match accuracy for every job listing based on your exact skill set and experience.', color: '#06b6d4' },
  { icon: BookOpen, title: 'AI Learning Path', desc: 'Get curated resources to fill your skill gaps and increase your job match score to 90%+.', color: '#10b981' },
  { icon: Sparkles, title: 'Resume Intelligence', desc: 'Upload your resume and get AI-driven suggestions to make every bullet point count.', color: '#f59e0b' },
];

const STATS = [
  { value: '94%', label: 'Average match improvement' },
  { value: '10k+', label: 'Developers using SkillGraph' },
  { value: '2.4M', label: 'Skills analyzed daily' },
  { value: '48h', label: 'Avg. time to first interview' },
];

const MARQUEE_SKILLS = ['React', 'Python', 'AWS', 'Node.js', 'Docker', 'TypeScript', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'System Design', 'LeetCode', 'GitHub', 'TailwindCSS', 'Rust', 'Go', 'Redis'];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', position: 'relative', overflowX: 'hidden' }}>
      <div className="bg-mesh" />

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', background: 'rgba(7,7,15,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="white" fill="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.03em', color: '#f0f0ff' }}>
            SkillGraph<span style={{ color: '#6366f1' }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none' }}>Login</Link>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', position: 'relative', zIndex: 1 }}>
            Get Started — Free <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="badge badge-indigo" style={{ margin: '0 auto 24px', fontSize: 12 }}>
            <Sparkles size={10} /> Powered by AI · Resume → Skills → Dream Job
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24, color: '#f0f0ff' }}>
            Your Skills.
            <br />
            <span className="gradient-text">Visualized. Matched.</span>
            <br />
            Leveled Up.
          </h1>

          <p style={{ fontSize: 18, color: '#8888aa', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Upload your resume, connect your coding profiles, and instantly see how well you match every job — with an AI that tells you exactly what to learn next.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} className="btn-primary" style={{ fontSize: 15, padding: '13px 28px', position: 'relative', zIndex: 1 }}>
              Start Analyzing — Free <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>


      </section>

      {/* Marquee */}
      <div style={{ padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}>
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: 16, width: 'max-content' }}
        >
          {[...MARQUEE_SKILLS, ...MARQUEE_SKILLS].map((s, i) => (
            <span key={i} className="skill-tag" style={{ whiteSpace: 'nowrap' }}>{s}</span>
          ))}
        </motion.div>
      </div>

      {/* Stats */}
      <section style={{ padding: '80px 48px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#8888aa', marginTop: 6 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 48px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 12 }}>
              Everything you need to <span className="gradient-text">land your dream job</span>
            </h2>
            <p style={{ color: '#8888aa', fontSize: 16 }}>The only career intelligence platform built for developers.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="glass-card" style={{ padding: 28 }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}20`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0ff', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 48px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px', background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 12 }}>Ready to see your skill graph?</h2>
          <p style={{ color: '#8888aa', marginBottom: 28, fontSize: 15 }}>Upload your resume and get a complete career intelligence report in 60 seconds.</p>
          <button onClick={() => navigate('/register')} className="btn-primary" style={{ fontSize: 15, padding: '14px 32px', position: 'relative', zIndex: 1 }}>
            Start for Free — No credit card <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 48px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#4a4a6a', fontSize: 13 }}>
        <span>© 2025 SkillGraph AI</span>
        <span>Built with ❤️ for developers</span>
      </footer>
    </div>
  );
}
