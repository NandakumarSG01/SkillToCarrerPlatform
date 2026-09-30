import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, TrendingUp, Zap, Target, BookOpen, ChevronRight, Upload, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const getMatchColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 65) return '#6366f1';
  if (score >= 50) return '#f59e0b';
  return '#f43f5e';
};

function MatchRing({ score, size = 80, color }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circumference - (animated / 100) * circumference;
  const c = color || getMatchColor(score);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={radius} className="match-ring-track" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={radius}
        className="match-ring-fill"
        strokeWidth={6}
        stroke={c}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ filter: `drop-shadow(0 0 6px ${c}80)` }}
      />
    </svg>
  );
}

export { MatchRing };

export default function DashboardHome() {
  const { user, token } = useAuth();
  const displayName = user?.profile?.fullName || user?.name || 'User';
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/resume/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // No resume uploaded — show upload prompt
  if (!dashboardData?.hasResume) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 4 }}>
            Welcome, {displayName.split(' ')[0]} 👋
          </motion.h1>
          <p style={{ color: '#8888aa', fontSize: 14 }}>Let's get started with your career intelligence dashboard.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
        >
          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Upload size={36} color="#6366f1" />
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0f0ff', marginBottom: 8 }}>Upload Your Resume</h2>
            <p style={{ color: '#8888aa', fontSize: 14, maxWidth: 400, lineHeight: 1.6 }}>
              To see your personalized dashboard with skill analysis, job matches, and career recommendations, please upload your resume first.
            </p>
          </div>
          <Link to="/dashboard/resume" className="btn-primary" style={{ padding: '14px 28px', fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1, marginTop: 8 }}>
            <FileText size={18} /> Go to Resume Upload <ArrowRight size={16} />
          </Link>

          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            {['Skill Analysis', 'Job Matching', 'AI Recommendations', 'Career Insights'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8888aa' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', opacity: 0.5 }} />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Resume uploaded — show real dashboard
  const { profile, skills, topJobs, stats } = dashboardData;

  const STATS = [
    { label: 'Total Skills', value: stats?.totalSkills || 0, icon: Zap, color: '#6366f1', sub: 'From resume analysis', trend: 'up' },
    { label: 'Job Matches', value: stats?.jobMatches || 0, icon: Target, color: '#06b6d4', sub: 'Real-time matches', trend: 'up' },
    { label: 'Resume Score', value: `${stats?.resumeScore || 0}/100`, icon: TrendingUp, color: '#10b981', sub: 'AI evaluation', trend: 'up' },
    { label: 'Skill Areas', value: [...new Set((skills || []).map(s => s.source))].length, icon: BookOpen, color: '#f59e0b', sub: 'Distinct categories', trend: 'up' },
  ];

  // Build radar data from skills
  const topSkills = (skills || []).slice(0, 6);
  const radarData = topSkills.map(s => ({ subject: s.name, A: s.proficiency }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 4 }}>
          {(() => {
            const hour = new Date().getHours();
            if (hour >= 17) return 'Good evening';
            if (hour >= 12) return 'Good afternoon';
            return 'Good morning';
          })()}, {(profile?.fullName || displayName).split(' ')[0]} 👋
        </motion.h1>
        <p style={{ color: '#8888aa', fontSize: 14 }}>
          {profile?.headline || 'Your career intelligence dashboard is ready.'}
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {STATS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
              <span style={{ fontSize: 11, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(16,185,129,0.15)' }}>{s.sub}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f0f0ff', letterSpacing: '-0.03em', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#8888aa' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>

        {/* Job Matches */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>Top Job Matches</h3>
              <p style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>Based on your resume skills</p>
            </div>
            <Link to="/dashboard/jobs" style={{ textDecoration: 'none', color: '#a5b4fc', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>View all <ChevronRight size={14} /></Link>
          </div>

          {topJobs && topJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topJobs.slice(0, 4).map((job, i) => (
                <a href={job.applyLink || '#'} target="_blank" rel="noopener noreferrer" key={job.id} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${job.color}20`, border: `1px solid ${job.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: job.color, flexShrink: 0 }}>
                      {job.logo}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0ff', marginBottom: 2 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: '#8888aa' }}>{job.company} · {job.type}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MatchRing score={job.matchScore} size={44} />
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: getMatchColor(job.matchScore) }}>{job.matchScore}%</div>
                          <div style={{ fontSize: 10, color: '#8888aa' }}>match</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </a>
              ))}
            </div>
          ) : (
            <p style={{ color: '#8888aa', fontSize: 13, textAlign: 'center', padding: 20 }}>Job matches will appear here after resume analysis</p>
          )}
        </motion.div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Radar */}
          {radarData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 4 }}>Skill Distribution</h3>
              <p style={{ fontSize: 12, color: '#8888aa', marginBottom: 16 }}>From your resume analysis</p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Resume Score */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 12 }}>Resume Score</h3>
            <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}>
              <MatchRing score={stats?.resumeScore || 0} size={120} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 28, fontWeight: 800, color: getMatchColor(stats?.resumeScore || 0) }}>
                {stats?.resumeScore || 0}
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#8888aa', marginTop: 12 }}>AI-evaluated score</p>
          </motion.div>
        </div>
      </div>

      {/* Top Skills */}
      {skills && skills.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>Your Skills (From Resume)</h3>
              <p style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>Extracted and analyzed by AI</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {skills.slice(0, 8).map((skill, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#f0f0ff' }}>{skill.name}</span>
                    <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>{skill.proficiency}%</span>
                  </div>
                  <div className="match-bar-track">
                    <motion.div
                      className="match-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.proficiency}%` }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.7 }}
                      style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#8888aa', border: '1px solid rgba(99,102,241,0.15)', whiteSpace: 'nowrap' }}>
                  {skill.source}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
