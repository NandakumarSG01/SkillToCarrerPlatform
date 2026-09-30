import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_JOBS, MOCK_SKILLS, getMatchColor } from '../lib/mockData';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, BookOpen, MapPin, DollarSign, Users, Clock } from 'lucide-react';

function MatchRingLarge({ score }) {
  const r = 60, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const c = getMatchColor(score);
  return (
    <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={160} height={160} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={80} cy={80} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={12} />
        <motion.circle cx={80} cy={80} r={r} fill="none" stroke={c} strokeWidth={12}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 12px ${c})` }}
        />
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 900, color: c, letterSpacing: '-0.04em', lineHeight: 1 }}>{score}%</div>
        <div style={{ fontSize: 12, color: '#8888aa', marginTop: 4 }}>match score</div>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  const job = MOCK_JOBS.find(j => j.id === id) || MOCK_JOBS[0];
  const userSkills = MOCK_SKILLS;

  const radarData = ['Frontend', 'Backend', 'DevOps', 'Cloud', 'Database', 'Algorithms'].map(cat => {
    const userCatSkills = userSkills.filter(s => s.category === cat);
    const avgUser = userCatSkills.length ? userCatSkills.reduce((s, k) => s + k.proficiency, 0) / userCatSkills.length : 30;
    return { subject: cat, User: Math.round(avgUser), Job: Math.round(50 + Math.random() * 45) };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Back */}
      <Link to="/dashboard/jobs" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, color: '#8888aa', fontSize: 13, width: 'fit-content' }}>
        <ArrowLeft size={14} /> Back to all jobs
      </Link>

      {/* Header */}
      <div className="glass-card" style={{ padding: 28, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: `${job.color}20`, border: `1px solid ${job.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: job.color, flexShrink: 0 }}>
          {job.logo}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 6 }}>{job.title}</h1>
          <div style={{ fontSize: 16, color: '#8888aa', marginBottom: 12 }}>{job.company}</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { icon: MapPin, text: job.location },
              { icon: DollarSign, text: job.salary },
              { icon: Clock, text: job.posted },
              { icon: Users, text: `${job.applicants} applicants` },
            ].map(({ icon: Icon, text }, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#8888aa' }}>
                <Icon size={13} /> {text}
              </span>
            ))}
          </div>
        </div>
        <button className="btn-primary" style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>Apply Now</button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Left: Score + Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Score card */}
          <div className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff', marginBottom: 20 }}>Match Accuracy</h3>
            <MatchRingLarge score={job.matchScore} />
            <div style={{ marginTop: 24, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{job.matchedSkills.length}</div>
                  <div style={{ fontSize: 11, color: '#8888aa' }}>Skills matched</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#f43f5e' }}>{job.missingSkills.length}</div>
                  <div style={{ fontSize: 11, color: '#8888aa' }}>Skills missing</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{job.improvementAreas.length}</div>
                  <div style={{ fontSize: 11, color: '#8888aa' }}>To improve</div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Analysis */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff', marginBottom: 16 }}>Skill Analysis</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {job.matchedSkills.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#f0f0ff', flex: 1 }}>{s}</span>
                  <span className="badge badge-emerald">You have this</span>
                </div>
              ))}
              {job.missingSkills.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <XCircle size={15} color="#f43f5e" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#f0f0ff', flex: 1 }}>{s}</span>
                  <Link to="/dashboard/learn" style={{ textDecoration: 'none' }}>
                    <span className="badge badge-rose" style={{ cursor: 'pointer' }}>Learn now</span>
                  </Link>
                </div>
              ))}
              {job.improvementAreas.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertCircle size={15} color="#f59e0b" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#f0f0ff', flex: 1 }}>{s}</span>
                  <span className="badge badge-amber">Improve</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Radar + Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Radar Chart */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff', marginBottom: 6 }}>Skill Overlap Radar</h3>
            <p style={{ fontSize: 12, color: '#8888aa', marginBottom: 16 }}>Your skills vs job requirements</p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8888aa', fontSize: 11 }} />
                <Radar name="You" dataKey="User" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Job" dataKey="Job" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 2" />
                <Tooltip contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8888aa' }}>
                <div style={{ width: 12, height: 2, background: '#6366f1', borderRadius: 1 }} /> Your skills
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8888aa' }}>
                <div style={{ width: 12, height: 2, background: '#06b6d4', borderRadius: 1 }} /> Job requirements
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={15} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff' }}>AI Recommendation</div>
                <div style={{ fontSize: 12, color: '#8888aa' }}>To reach 90%+ match score</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.7, marginBottom: 16 }}>
              You're <strong style={{ color: '#a5b4fc' }}>{job.matchScore}% matched</strong> to this role. To reach 90%, focus on:
            </p>
            {job.missingSkills.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '10px 14px', background: 'rgba(99,102,241,0.06)', borderRadius: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0ff' }}>Learn {s}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6366f1' }}>+{Math.round(15 / job.missingSkills.length)}%</span>
              </div>
            ))}
            <Link to="/dashboard/learn" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ marginTop: 12, width: '100%', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                Get Learning Plan
              </button>
            </Link>
          </div>

          {/* Job Description */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff', marginBottom: 12 }}>About the Role</h3>
            <p style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.8 }}>{job.description}</p>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 8 }}>Required skills:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.requirements.map(r => (
                  <span key={r} className={`badge ${job.matchedSkills.includes(r) ? 'badge-emerald' : 'badge-rose'}`}>{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
