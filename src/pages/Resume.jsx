import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle2, Sparkles, Code2, Briefcase, GraduationCap, FolderOpen, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const CATEGORY_COLORS = { Frontend: '#6366f1', Backend: '#06b6d4', Database: '#10b981', DevOps: '#f59e0b', Cloud: '#f43f5e', Language: '#8b5cf6', API: '#3b82f6', Tools: '#84cc16', Framework: '#6366f1', Testing: '#06b6d4', Other: '#8888aa' };

// Guess skill category based on name
function guessCategory(skillName) {
  const lower = skillName.toLowerCase();
  if (['react', 'angular', 'vue', 'next.js', 'tailwindcss', 'html', 'css', 'bootstrap', 'sass'].some(s => lower.includes(s))) return 'Frontend';
  if (['node', 'express', 'django', 'flask', 'spring', 'laravel', 'fastapi'].some(s => lower.includes(s))) return 'Backend';
  if (['sql', 'postgres', 'mysql', 'mongodb', 'redis', 'firebase', 'prisma', 'dynamodb'].some(s => lower.includes(s))) return 'Database';
  if (['docker', 'kubernetes', 'ci/cd', 'jenkins', 'github actions', 'terraform'].some(s => lower.includes(s))) return 'DevOps';
  if (['aws', 'azure', 'gcp', 'cloud', 'heroku', 'vercel', 'netlify'].some(s => lower.includes(s))) return 'Cloud';
  if (['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'kotlin', 'swift'].some(s => lower.includes(s))) return 'Language';
  if (['rest', 'graphql', 'grpc', 'api', 'websocket'].some(s => lower.includes(s))) return 'API';
  if (['git', 'linux', 'bash', 'vim', 'vscode', 'jira', 'figma', 'postman'].some(s => lower.includes(s))) return 'Tools';
  if (['jest', 'mocha', 'cypress', 'selenium', 'testing'].some(s => lower.includes(s))) return 'Testing';
  return 'Other';
}

export default function ResumePage() {
  const { token, user } = useAuth();
  const [stage, setStage] = useState('loading');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [resumeData, setResumeData] = useState(null);

  // Check if user already has resume data
  useEffect(() => {
    checkExistingResume();
  }, [token]);

  const checkExistingResume = async () => {
    if (!token) { setStage('upload'); return; }
    try {
      const res = await fetch(`${API_URL}/api/resume/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.hasResume && data.skills?.length > 0) {
        // User already has resume analyzed
        setResumeData({
          skills: data.skills.map(s => s.name),
          score: data.stats.resumeScore,
          headline: data.profile.headline,
          summary: data.profile.summary,
        });
        setStage('done');
      } else {
        setStage('upload');
      }
    } catch {
      setStage('upload');
    }
  };

  const uploadResume = async (file) => {
    setFileName(file.name);
    setStage('parsing');
    setProgress(5);
    setError('');

    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) { clearInterval(progressInterval); return 85; }
        return prev + Math.random() * 8 + 2;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch(`${API_URL}/api/resume/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Upload failed');
      }

      const data = await res.json();
      setProgress(100);
      setResumeData(data);

      // Store updated user profile in localStorage
      const updatedUser = { ...user, profile: { ...user?.profile, resumeScore: data.score, skills: (data.skills || []).join(', ') } };
      localStorage.setItem('skillgraph_user', JSON.stringify(updatedUser));

      setTimeout(() => setStage('done'), 500);
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Upload error:', err);
      setError(err.message || 'Failed to analyze resume');
      setStage('upload');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadResume(file);
  }, [token]);

  const handleInput = (e) => {
    const file = e.target.files[0];
    if (file) uploadResume(file);
  };

  // Group skills by category
  const skillsByCategory = {};
  if (resumeData?.skills) {
    resumeData.skills.forEach(name => {
      const cat = guessCategory(name);
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push({ name, proficiency: Math.floor(Math.random() * 30 + 60) });
    });
  }

  // Get experience/education/projects from profile if available
  const experience = resumeData?.experience || [];
  const education = resumeData?.education || [];
  const projects = resumeData?.projects || [];
  const score = resumeData?.score || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 4 }}>Resume Analyzer</h1>
        <p style={{ color: '#8888aa', fontSize: 14 }}>Upload your resume and our AI extracts your skills, experience, and more.</p>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite' }} />
          </motion.div>
        )}

        {stage === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, marginBottom: 16, color: '#fda4af', fontSize: 13 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <label
              htmlFor="resume-input"
              className={`upload-zone ${dragging ? 'dragging' : ''}`}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <motion.div animate={{ y: dragging ? -8 : 0 }} style={{ marginBottom: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={30} color="#a5b4fc" />
                </div>
              </motion.div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0ff', marginBottom: 8 }}>Drop your resume here</h3>
              <p style={{ fontSize: 13, color: '#8888aa', marginBottom: 20 }}>Supports PDF, DOCX, and TXT formats</p>
              <input id="resume-input" type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }} onChange={handleInput} />
              <div className="btn-primary" style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
                <FileText size={15} /> Choose file to upload
              </div>
            </label>
          </motion.div>
        )}

        {stage === 'parsing' && (
          <motion.div key="parsing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 28 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', position: 'absolute' }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={28} color="#6366f1" />
                </div>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f0f0ff', marginBottom: 8 }}>Analyzing your resume with AI...</h3>
              <p style={{ fontSize: 13, color: '#8888aa', marginBottom: 32 }}>{fileName}</p>
              <div style={{ width: 320, marginBottom: 12 }}>
                <div className="match-bar-track" style={{ height: 8 }}>
                  <motion.div className="match-bar-fill" animate={{ width: `${progress}%` }} style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', height: '100%' }} />
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>{Math.round(progress)}%</div>
              {[
                [10, 'Reading document...'],
                [30, 'Extracting text content...'],
                [50, 'AI analyzing skills & experience...'],
                [70, 'Generating insights...'],
                [85, 'Almost done...'],
              ].map(([threshold, label]) => (
                progress >= threshold && (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: '#8888aa' }}>
                    <CheckCircle2 size={12} color="#10b981" /> {label}
                  </div>
                )
              ))}
            </div>
          </motion.div>
        )}

        {stage === 'done' && resumeData && (
          <motion.div key="done" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12 }}>
              <CheckCircle2 size={20} color="#10b981" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff' }}>Resume analyzed successfully!</div>
                <div style={{ fontSize: 12, color: '#8888aa' }}>
                  {fileName || 'Your resume'} · {resumeData.skills?.length || 0} skills extracted
                  {resumeData.strengths?.length > 0 ? ` · ${resumeData.strengths.length} strengths identified` : ''}
                </div>
              </div>
              <button onClick={() => { setStage('upload'); setProgress(0); setResumeData(null); }} className="btn-ghost" style={{ fontSize: 12 }}>
                <RefreshCw size={13} /> Re-upload
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
              {/* Left: Skills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <Code2 size={18} color="#6366f1" />
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>Extracted Skills</h3>
                    <span className="badge badge-indigo">{resumeData.skills?.length || 0} skills</span>
                  </div>
                  {Object.keys(skillsByCategory).length > 0 ? (
                    Object.entries(skillsByCategory).map(([cat, skills]) => (
                      <div key={cat} style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: CATEGORY_COLORS[cat] || '#8888aa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{cat}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {skills.map(s => (
                            <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              <span className="skill-tag" style={{ background: `${CATEGORY_COLORS[cat] || '#6366f1'}18`, color: CATEGORY_COLORS[cat] || '#a5b4fc', borderColor: `${CATEGORY_COLORS[cat] || '#6366f1'}30` }}>{s.name}</span>
                              <div style={{ width: '100%' }}>
                                <div className="match-bar-track" style={{ height: 3 }}>
                                  <div className="match-bar-fill" style={{ width: `${s.proficiency}%`, background: CATEGORY_COLORS[cat] || '#6366f1' }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#8888aa', fontSize: 13 }}>No skills extracted yet.</p>
                  )}
                </div>

                {/* Strengths & Improvements */}
                {(resumeData.strengths?.length > 0 || resumeData.improvements?.length > 0) && (
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <TrendingUp size={18} color="#10b981" />
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>AI Feedback</h3>
                    </div>
                    {resumeData.strengths?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginBottom: 8 }}>Strengths</div>
                        {resumeData.strengths.map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, fontSize: 12, color: '#8888aa' }}>
                            <CheckCircle2 size={12} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} /> {s}
                          </div>
                        ))}
                      </div>
                    )}
                    {resumeData.improvements?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', marginBottom: 8 }}>Areas to Improve</div>
                        {resumeData.improvements.map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, fontSize: 12, color: '#8888aa' }}>
                            <AlertCircle size={12} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} /> {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Summary + Score */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Headline & Summary */}
                {(resumeData.headline || resumeData.summary) && (
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <Briefcase size={18} color="#06b6d4" />
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>Profile Summary</h3>
                    </div>
                    {resumeData.headline && (
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff', marginBottom: 8 }}>{resumeData.headline}</div>
                    )}
                    {resumeData.summary && (
                      <p style={{ fontSize: 12, color: '#8888aa', lineHeight: 1.7 }}>{resumeData.summary}</p>
                    )}
                  </div>
                )}

                {/* Resume Score */}
                <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: '#8888aa', marginBottom: 8 }}>Resume Intelligence Score</div>
                  <div style={{ fontSize: 52, fontWeight: 900, background: `linear-gradient(135deg, ${score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e'}, #8b5cf6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.04em' }}>
                    {score}
                  </div>
                  <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 16 }}>out of 100</div>
                  <div className="match-bar-track" style={{ height: 6 }}>
                    <motion.div className="match-bar-fill" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1 }} style={{ background: `linear-gradient(90deg, ${score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e'}, #8b5cf6)` }} />
                  </div>
                  <p style={{ fontSize: 11, color: '#8888aa', marginTop: 10 }}>
                    {score >= 80 ? 'Excellent! Your resume is well-optimized.' : score >= 60 ? 'Good start! Upload an updated version to improve.' : 'Consider adding more details and skills.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
