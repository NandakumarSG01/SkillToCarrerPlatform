import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Clock, DollarSign, Users, ArrowRight, ExternalLink, Briefcase, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import { Country, State, City } from 'country-state-city';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const getMatchColor = (score) => {
  if (score >= 80) return '#10b981';
  if (score >= 65) return '#6366f1';
  if (score >= 50) return '#f59e0b';
  return '#f43f5e';
};

function MatchRing({ score, size = 60 }) {
  const radius = (size - 10) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const c = getMatchColor(score);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={c} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${c})`, transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  );
}

const FILTERS = ['All', 'Naukri', 'LinkedIn'];

export default function JobsPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [search, setSearch] = useState(queryParam);
  // Store ISO codes for lookup
  const [country, setCountry] = useState('All');
  const [stateValue, setStateValue] = useState('All');
  const [district, setDistrict] = useState('All');
  
  const countriesList = Country.getAllCountries();
  const statesList = country !== 'All' && country !== 'Remote' ? State.getStatesOfCountry(country) : [];
  const citiesList = stateValue !== 'All' ? City.getCitiesOfState(country, stateValue) : [];

  const getLocationString = (cIso = country, sIso = stateValue, dName = district) => {
    if (cIso === 'All' && sIso === 'All' && dName === 'All') return 'All Locations';
    if (cIso === 'Remote') return 'Remote';
    let parts = [];
    if (dName !== 'All') parts.push(dName);
    if (sIso !== 'All') {
      const sObj = State.getStateByCodeAndCountry(sIso, cIso);
      if (sObj) parts.push(sObj.name);
    }
    if (cIso !== 'All') {
      const cObj = Country.getCountryByCode(cIso);
      if (cObj) parts.push(cObj.name);
    }
    return parts.join(', ');
  };

  const [filter, setFilter] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [source, setSource] = useState('');

  // Fetch initial jobs from database or personalized dashboard
  useEffect(() => {
    if (queryParam) {
      setSearch(queryParam);
      searchAIJobs(queryParam, getLocationString());
    } else {
      fetchJobs();
    }
  }, [token, queryParam]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs`);
      const data = await res.json();
      const formatted = (data.jobs || []).map((job, i) => ({
        ...job,
        color: ['#6366f1', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e'][i % 6],
        logo: job.company?.charAt(0) || '?',
        requirements: job.requiredSkills ? job.requiredSkills.split(',').map(s => s.trim()) : (job.requirements || []),
        matchedSkills: job.matchedSkills || [],
        missingSkills: job.missingSkills || [],
        matchScore: job.matchScore || 0,
        location: job.location || 'India',
        type: job.type || 'Full-time',
        salary: job.salary || job.salaryRange || 'Competitive',
        posted: job.posted || 'Recently',
        source: job.source || 'Database',
        naukriLink: `https://www.naukri.com/${encodeURIComponent(job.title)}-jobs`,
        linkedinLink: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}`,
      }));
      setJobs(formatted);
      setSource('Database');
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };


  // AI-powered search for real-time jobs from Naukri & LinkedIn
  const searchAIJobs = async (queryToSearch, locToSearch = getLocationString()) => {
    if (!token) return;
    setAiLoading(true);
    try {
      let finalQuery = queryToSearch || search || 'software developer';
      if (!finalQuery.toLowerCase().includes('job')) {
        finalQuery += ' jobs';
      }
      if (locToSearch && locToSearch !== 'All Locations') {
        finalQuery += ` in ${locToSearch}`;
      } else {
        if (!finalQuery.toLowerCase().includes('in ') && !finalQuery.toLowerCase().includes('remote')) {
          finalQuery += ` in India`;
        }
      }
      
      const res = await fetch(`${API_URL}/api/jobs/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query: finalQuery, skills: [] }),
      });
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        setSource(data.source || 'AI-powered');
      }
    } catch (err) {
      console.error('AI search error:', err);
    }
    setAiLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const loc = getLocationString();
    if (search.trim() || loc !== 'All Locations') {
      searchAIJobs(search, loc);
    }
  };

  const filtered = jobs
    .filter(j => {
      if (filter === 'Naukri') return j.source === 'Naukri';
      if (filter === 'LinkedIn') return j.source === 'LinkedIn';
      return true;
    })
    // .filter(...) we rely on the backend for search now, but we can still filter locally if needed
    .filter(j => !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 4 }}>
            Job Matches
          </h1>
          <p style={{ color: '#8888aa', fontSize: 14 }}>
            {filtered.length} jobs found · Source: {source}
          </p>
        </div>
        <button
          onClick={() => searchAIJobs(search || 'developer', getLocationString())}
          disabled={aiLoading}
          className="btn-primary"
          style={{ fontSize: 13, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}
        >
          {aiLoading ? (
            <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Searching...</>
          ) : (
            <><Sparkles size={14} /> Search Naukri & LinkedIn</>
          )}
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px' }}>
          <Search size={14} color="#8888aa" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles (e.g. React Developer, Data Scientist)..." style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f0f0ff', fontSize: 13, width: '100%', fontFamily: 'Inter, sans-serif' }} />
          
          <button type="submit" style={{ display: 'none' }}>Submit</button>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
          
          <MapPin size={14} color="#8888aa" />
          
          {/* Country */}
          <div style={{ position: 'relative' }}>
            <select 
              value={country} 
              onChange={e => {
                const newC = e.target.value;
                setCountry(newC);
                setStateValue('All');
                setDistrict('All');
                searchAIJobs(search, getLocationString(newC, 'All', 'All'));
              }}
              style={{ appearance: 'none', background: 'transparent', border: 'none', outline: 'none', color: '#f0f0ff', fontSize: 13, paddingRight: 20, cursor: 'pointer', fontFamily: 'Inter, sans-serif', maxWidth: 160, textOverflow: 'ellipsis' }}
            >
              <option value="All" style={{ background: '#13131a', color: '#f0f0ff' }}>All Countries</option>
              <option value="Remote" style={{ background: '#13131a', color: '#f0f0ff' }}>Remote</option>
              {countriesList.map(c => <option key={c.isoCode} value={c.isoCode} style={{ background: '#13131a', color: '#f0f0ff' }}>{c.name}</option>)}
            </select>
            <ChevronDown size={12} color="#8888aa" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {country !== 'All' && country !== 'Remote' && (
            <>
              <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }}></div>
              <div style={{ position: 'relative' }}>
                <select 
                  value={stateValue} 
                  onChange={e => {
                    const newS = e.target.value;
                    setStateValue(newS);
                    setDistrict('All');
                    searchAIJobs(search, getLocationString(country, newS, 'All'));
                  }}
                  style={{ appearance: 'none', background: 'transparent', border: 'none', outline: 'none', color: '#f0f0ff', fontSize: 13, paddingRight: 20, cursor: 'pointer', fontFamily: 'Inter, sans-serif', maxWidth: 160, textOverflow: 'ellipsis' }}
                >
                  <option value="All" style={{ background: '#13131a', color: '#f0f0ff' }}>All States</option>
                  {statesList.map(s => <option key={s.isoCode} value={s.isoCode} style={{ background: '#13131a', color: '#f0f0ff' }}>{s.name}</option>)}
                </select>
                <ChevronDown size={12} color="#8888aa" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </>
          )}

          {country !== 'All' && country !== 'Remote' && stateValue !== 'All' && (
            <>
              <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }}></div>
              <div style={{ position: 'relative' }}>
                <select 
                  value={district} 
                  onChange={e => {
                    const newD = e.target.value;
                    setDistrict(newD);
                    searchAIJobs(search, getLocationString(country, stateValue, newD));
                  }}
                  style={{ appearance: 'none', background: 'transparent', border: 'none', outline: 'none', color: '#f0f0ff', fontSize: 13, paddingRight: 20, cursor: 'pointer', fontFamily: 'Inter, sans-serif', maxWidth: 160, textOverflow: 'ellipsis' }}
                >
                  <option value="All" style={{ background: '#13131a', color: '#f0f0ff' }}>All Districts</option>
                  {citiesList.map(d => <option key={d.name} value={d.name} style={{ background: '#13131a', color: '#f0f0ff' }}>{d.name}</option>)}
                </select>
                <ChevronDown size={12} color="#8888aa" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </>
          )}
        </form>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderColor: filter === f ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
              color: filter === f ? '#a5b4fc' : '#8888aa',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {(loading || aiLoading) && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#8888aa', fontSize: 13 }}>
            {aiLoading ? 'Searching Naukri & LinkedIn via AI...' : 'Loading jobs...'}
          </p>
        </div>
      )}

      {/* Job Cards Grid */}
      {!loading && !aiLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map((job, i) => (
            <motion.div key={job.id || i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <motion.div whileHover={{ y: -3 }} className="glass-card" style={{ padding: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${job.color}20`, border: `1px solid ${job.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: job.color, flexShrink: 0 }}>
                    {job.logo}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0ff', marginBottom: 3 }}>{job.title}</div>
                    <div style={{ fontSize: 13, color: '#8888aa' }}>{job.company}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                      {job.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8888aa' }}>
                          <MapPin size={10} /> {job.location}
                        </span>
                      )}
                      {job.salary && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8888aa' }}>
                          <DollarSign size={10} /> {job.salary}
                        </span>
                      )}
                      {job.experience && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8888aa' }}>
                          <Briefcase size={10} /> {job.experience}
                        </span>
                      )}
                    </div>
                  </div>
                  {job.matchScore > 0 && (
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <MatchRing score={job.matchScore} size={56} />
                      <div style={{ fontSize: 13, fontWeight: 800, color: getMatchColor(job.matchScore), marginTop: -38 }}>{job.matchScore}%</div>
                      <div style={{ fontSize: 10, color: '#8888aa', marginTop: 32 }}>match</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {job.description && (
                  <p style={{ fontSize: 12, color: '#8888aa', lineHeight: 1.5, margin: 0 }}>{job.description}</p>
                )}

                {/* Skills */}
                {(job.requirements || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(job.matchedSkills || []).slice(0, 3).map(s => (
                      <span key={s} className="badge badge-emerald">{s}</span>
                    ))}
                    {(job.missingSkills || []).slice(0, 2).map(s => (
                      <span key={s} className="badge badge-rose">{s}</span>
                    ))}
                    {((job.matchedSkills?.length || 0) === 0 && (job.missingSkills?.length || 0) === 0) && (
                      (job.requirements || []).slice(0, 4).map(s => (
                        <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.15)' }}>{s}</span>
                      ))
                    )}
                  </div>
                )}

                {/* Footer with source & links */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {job.posted && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8888aa' }}>
                        <Clock size={10} /> {job.posted}
                      </span>
                    )}
                    <span style={{ 
                      fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                      background: job.source === 'Naukri' ? 'rgba(16,185,129,0.1)' : job.source === 'LinkedIn' ? 'rgba(6,182,212,0.1)' : 'rgba(99,102,241,0.1)',
                      color: job.source === 'Naukri' ? '#10b981' : job.source === 'LinkedIn' ? '#06b6d4' : '#8888aa',
                      border: `1px solid ${job.source === 'Naukri' ? 'rgba(16,185,129,0.2)' : job.source === 'LinkedIn' ? 'rgba(6,182,212,0.2)' : 'rgba(99,102,241,0.15)'}`,
                    }}>
                      {job.source}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={job.naukriLink} target="_blank" rel="noopener noreferrer" style={{ 
                      fontSize: 11, color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3,
                      padding: '4px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)'
                    }}
                      onClick={e => e.stopPropagation()}>
                      Naukri <ExternalLink size={9} />
                    </a>
                    <a href={job.linkedinLink} target="_blank" rel="noopener noreferrer" style={{ 
                      fontSize: 11, color: '#06b6d4', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3,
                      padding: '4px 10px', borderRadius: 6, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)'
                    }}
                      onClick={e => e.stopPropagation()}>
                      LinkedIn <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !aiLoading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#8888aa' }}>
          <Briefcase size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={{ fontSize: 15 }}>No jobs found. Try a different search query.</p>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
