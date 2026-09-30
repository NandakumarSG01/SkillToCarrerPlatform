import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Youtube, Github, ExternalLink, Clock, BarChart2, Sparkles, ChevronDown, ChevronUp, Target, AlertCircle, FileText, CheckCircle, Search, History, Check } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const PLATFORM_STYLES = {
  YouTube: { color: '#ef4444', icon: '▶', bg: 'rgba(239,68,68,0.1)' },
  GitHub: { color: '#e2e8f0', icon: '⬡', bg: 'rgba(226,232,240,0.08)' },
  Udemy: { color: '#a78bfa', icon: 'U', bg: 'rgba(167,139,250,0.1)' },
  Documentation: { color: '#06b6d4', icon: '📄', bg: 'rgba(6,182,212,0.1)' },
};

const DIFFICULTY_COLORS = {
  'Beginner': '#10b981',
  'Intermediate': '#f59e0b',
  'Advanced': '#ef4444',
  'All Levels': '#6366f1'
};

export default function LearnPage() {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [learningResources, setLearningResources] = useState({});
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'history'
  const [learningHistory, setLearningHistory] = useState([]);
  const [customSkills, setCustomSkills] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q');

  // Fetch dashboard data to get actual skills and job matches
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/resume/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
      setDashboardLoading(false);
    };

    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/courses/history`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        setLearningHistory(data.history || []);
      } catch (err) { }
    };

    fetchDashboard();
    fetchHistory();
  }, [token]);

  // Compute actual missing skills based on dashboard data
  const missingSkills = useMemo(() => {
    if (!dashboardData?.hasResume || !dashboardData?.skills) return [];
    
    const userSkills = dashboardData.skills.map(s => s.name.toLowerCase());
    
    // Core high-value tech skills to suggest
    const potentialSkills = [
      'Docker', 'AWS', 'Kubernetes', 'TypeScript', 'System Design', 
      'Next.js', 'GraphQL', 'Python', 'Go', 'Redis',
      'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'CI/CD',
      'Terraform', 'Apache Kafka', 'Elasticsearch', 'Microservices', 'Spring Boot'
    ];
    
    const computed = potentialSkills.filter(s => !userSkills.includes(s.toLowerCase())).slice(0, 12);
    // Merge custom searched skills at the top, without deep duplicates
    const all = [...customSkills, ...computed];
    return Array.from(new Set(all));
  }, [dashboardData, customSkills]);

  // Set initial selected skill once missingSkills are computed
  useEffect(() => {
    if (missingSkills.length > 0 && !selectedSkill) {
      setSelectedSkill(missingSkills[0]);
    }
  }, [missingSkills, selectedSkill]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const q = searchInput.trim();
      if (!customSkills.includes(q)) setCustomSkills([q, ...customSkills]);
      setSelectedSkill(q);
      setSearchInput('');
      setActiveTab('plan');
    }
  };

  useEffect(() => {
    if (urlQuery && urlQuery.trim()) {
      const q = urlQuery.trim();
      if (!customSkills.includes(q)) {
        setCustomSkills(prev => [q, ...prev]);
      }
      setSelectedSkill(q);
      setActiveTab('plan');
    }
  }, [urlQuery]);

  const markComplete = async (res, skill) => {
    try {
      const resp = await fetch(`${API_URL}/api/courses/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ skill, title: res.title, courseUrl: res.url })
      });
      const data = await resp.json();
      if (data.item || data.history) {
        setLearningHistory([data.item || data.history, ...learningHistory]);
      }
    } catch (err) { }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      if (!token || !selectedSkill) return;

      // If we already cached resources for this skill, do not refetch
      if (learningResources[selectedSkill] && learningResources[selectedSkill].length > 0) return;

      setCoursesLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/courses/recommendations?skills=${encodeURIComponent(selectedSkill)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.recommendations) {
            setLearningResources(prev => ({
              ...prev,
              [selectedSkill]: data.recommendations[selectedSkill] || []
            }));
          }
        } else {
          console.error('Failed to fetch courses, status:', res.status);
        }
      } catch (err) {
        console.error('Failed to fetch courses', err);
      }
      setCoursesLoading(false);
    };
    fetchCourses();
  }, [token, selectedSkill]);

  if (dashboardLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!dashboardData?.hasResume || missingSkills.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <AlertCircle size={36} color="#6366f1" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0ff', marginBottom: 12 }}>Upload Resume to Generate Path</h2>
        <p style={{ color: '#8888aa', fontSize: 15, maxWidth: 400, lineHeight: 1.6, marginBottom: 24 }}>
          We need to analyze your current skills from your resume before we can generate a personalized learning roadmap.
        </p>
        <Link to="/dashboard/resume" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} /> Upload Resume
        </Link>
      </div>
    );
  }

  const resources = selectedSkill ? (learningResources[selectedSkill] || []) : [];
  const topJob = dashboardData.topJobs?.[0] || { title: 'Senior Software Engineer', company: 'Tech Corp', matchScore: 75 };
  const matchScore = topJob.matchScore || 75;
  const potentialScore = Math.min(99, matchScore + missingSkills.slice(0, missingSkills.indexOf(selectedSkill) + 1).length * 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 4 }}>Learning Path</h1>
          <p style={{ color: '#8888aa', fontSize: 14 }}>Real, playable video courses to boost your match score</p>
        </div>
        <div style={{ display: 'flex', gap: 10, background: 'rgba(255,255,255,0.04)', padding: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setActiveTab('plan')}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6, background: activeTab === 'plan' ? 'rgba(99,102,241,0.15)' : 'transparent', color: activeTab === 'plan' ? '#a5b4fc' : '#8888aa' }}>
            <Target size={14} /> Action Plan
          </button>
          <button onClick={() => setActiveTab('history')}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6, background: activeTab === 'history' ? 'rgba(99,102,241,0.15)' : 'transparent', color: activeTab === 'history' ? '#a5b4fc' : '#8888aa' }}>
            <History size={14} /> History
          </button>
        </div>
      </div>

      {/* AI Insight Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: '18px 22px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff', marginBottom: 4 }}>
            Your current top match: <span style={{ color: '#a5b4fc' }}>{topJob.company} — {topJob.title}</span> at {matchScore}%
          </div>
          <div style={{ fontSize: 13, color: '#8888aa' }}>
            Learning all recommended skills will push your match to <strong style={{ color: '#10b981' }}>{Math.min(99, matchScore + 15)}%+</strong>. Start with {missingSkills[0]}.
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#10b981', letterSpacing: '-0.04em' }}>90%+</div>
          <div style={{ fontSize: 11, color: '#8888aa' }}>potential match</div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Skills sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: 10 }}>
            <Search size={14} color="#8888aa" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search any course to learn..." style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f0f0ff', fontSize: 13, width: '100%', fontFamily: 'Inter, sans-serif' }} />
            <button type="submit" disabled={!searchInput.trim()} style={{ background: searchInput.trim() ? '#6366f1' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: searchInput.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>Search</button>
          </form>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#4a4a6a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Skills to learn</div>
          {missingSkills.map((skill, i) => {
            const impact = Math.round((missingSkills.length - i) * 3 + 2);
            return (
              <motion.button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                whileHover={{ x: 2 }}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid',
                  borderColor: selectedSkill === skill ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)',
                  background: selectedSkill === skill ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left'
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: selectedSkill === skill ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: selectedSkill === skill ? 'white' : '#8888aa', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selectedSkill === skill ? '#a5b4fc' : '#f0f0ff', marginBottom: 2 }}>{skill}</div>
                  <div style={{ fontSize: 11, color: '#8888aa' }}>+{impact}% match boost</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedSkill === skill ? '#6366f1' : '#2a2a4a', flexShrink: 0 }} />
              </motion.button>
            );
          })}

          {/* Progress card */}
          <div style={{ marginTop: 12, padding: '16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', marginBottom: 8 }}>Learning Progress</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8888aa', marginBottom: 6 }}>
              <span>2 of 5 skills started</span>
              <span>40%</span>
            </div>
            <div className="match-bar-track">
              <div className="match-bar-fill" style={{ width: '40%', background: 'linear-gradient(90deg,#10b981,#059669)' }} />
            </div>
          </div>
        </div>

        {/* Course cards & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {activeTab === 'plan' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f0f0ff', letterSpacing: '-0.02em' }}>
                    Learn <span style={{ color: '#6366f1' }}>{selectedSkill}</span>
                  </h2>
                  <p style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>{coursesLoading ? 'Finding resources...' : `${resources.length} specific real resources · Free`}</p>
                </div>
                {missingSkills.indexOf(selectedSkill) !== -1 && (
                  <span className="badge badge-indigo">
                    <Target size={10} /> +{Math.round((missingSkills.length - missingSkills.indexOf(selectedSkill)) * 3 + 2)}% match boost
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {coursesLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff', marginBottom: 6 }}>Finding real courses for {selectedSkill}...</div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key={selectedSkill} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {resources.length > 0 ? resources.map((res, i) => {
                const ps = PLATFORM_STYLES[res.platform] || PLATFORM_STYLES.Documentation;
                const isExpanded = expanded[`${selectedSkill}-${i}`];
                const isCompleted = learningHistory.some(h => h.courseUrl === res.url);
                return (
                  <motion.div key={i} whileHover={{ y: -2 }} className="course-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: `linear-gradient(to bottom, ${ps.color}, ${ps.color}66)` }} />
                    <div style={{ paddingLeft: 12 }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        {res.thumbnail ? (
                          <div style={{ width: 100, height: 60, borderRadius: 8, background: '#1c1c2e', backgroundImage: `url(${res.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: ps.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, border: `1px solid ${ps.color}30` }}>
                            {ps.icon}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.title}</div>
                          <div style={{ fontSize: 12, color: '#8888aa', marginBottom: 8 }}>{res.instructor} · <span style={{ color: ps.color }}>{res.platform}</span></div>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8888aa' }}>
                              <Clock size={10} /> {res.duration}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: DIFFICULTY_COLORS[res.difficulty] }}>
                              <BarChart2 size={10} /> {res.difficulty}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {isCompleted ? (
                              <button disabled style={{ fontSize: 12, padding: '6px 12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'not-allowed' }}>
                                <Check size={12} /> Done
                              </button>
                            ) : (
                              <button onClick={() => markComplete(res, selectedSkill)} style={{ fontSize: 12, padding: '6px 12px', background: 'transparent', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                Mark Complete
                              </button>
                            )}
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <ExternalLink size={12} /> Access
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff', marginBottom: 6 }}>Generating resources for {selectedSkill}...</div>
                  <p style={{ fontSize: 13, color: '#8888aa' }}>Our AI is finding the best free resources for this skill.</p>
                </div>
              )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* All-skills overview */}
            <div className="glass-card" style={{ padding: 22, marginTop: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff', marginBottom: 14 }}>Your Complete Learning Roadmap</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {missingSkills.slice(0, 8).map((skill, i) => {
                  const isCompleted = learningHistory.some(h => h.skill.toLowerCase() === skill.toLowerCase());
                  return (
                    <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: isCompleted ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: isCompleted ? '#10b981' : '#4a4a6a', flexShrink: 0 }}>
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      <span style={{ flex: 1, fontSize: 13, color: isCompleted ? '#10b981' : '#f0f0ff' }}>{skill}</span>
                      <div style={{ width: 120 }}>
                        <div className="match-bar-track" style={{ height: 4 }}>
                          <div className="match-bar-fill" style={{ width: isCompleted ? '100%' : '0%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: '#8888aa', width: 28, textAlign: 'right' }}>
                        {isCompleted ? '✅' : '0%'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f0f0ff', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Real Learning History
            </h2>
            {learningHistory.length === 0 ? (
              <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                <CheckCircle size={40} color="#4a4a6a" style={{ opacity: 0.5, margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f0f0ff', marginBottom: 8 }}>Nothing learned yet!</h3>
                <p style={{ fontSize: 13, color: '#8888aa' }}>Search a course from the Action Plan and mark it as complete to start building your actual history timeline.</p>
              </div>
            ) : (
              learningHistory.map((item, i) => (
                <div key={item.id || i} className="glass-card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <CheckCircle size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#8888aa', display: 'flex', gap: 8 }}>
                      <span className="badge badge-emerald">{item.skill}</span>
                      <span>{new Date(item.completedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <a href={item.courseUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, textDecoration: 'none' }}>
                    Review
                  </a>
                </div>
              ))
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
