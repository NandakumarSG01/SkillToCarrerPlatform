import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { useAuth } from '../context/AuthContext';
import { Filter, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
const SOURCES = ['all', 'resume', 'analysis', 'inferred'];

const getSkillColor = (source) => {
  switch (source) {
    case 'resume': return '#6366f1'; // Indigo
    case 'github': return '#06b6d4'; // Cyan
    case 'leetcode': return '#f59e0b'; // Amber
    case 'manual': return '#10b981'; // Emerald
    case 'analysis': return '#8b5cf6'; // Violet
    case 'inferred': return '#ec4899'; // Pink
    default: return '#6366f1';
  }
};

const NODE_RADIUS = (weight) => 12 + (weight / 100) * 14;

export default function SkillGraphPage() {
  const { token } = useAuth();
  const svgRef = useRef(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [filterSource, setFilterSource] = useState('all');
  const [skills, setSkills] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, [token]);

  useEffect(() => {
    if (skills.length > 0) {
      const filtered = filterSource === 'all' ? skills : skills.filter(s => s.source === filterSource);
      setFilteredCount(filtered.length);
      renderGraph(filtered);
    }
  }, [filterSource, skills]);

  const fetchSkills = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/resume/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!data.hasResume) {
        setHasResume(false);
      } else {
        setHasResume(true);
        // data.skills comes from the database (assigned random proficiency for weights)
        // Ensure every skill has a 'source' and 'id'
        const formattedSkills = (data.skills || []).map((s, i) => ({
          ...s,
          id: `skill-${i}`,
          source: s.source || 'resume',
          weight: s.proficiency || Math.max(40, 90 - (i * 2)) // Use proficiency just as a size weight
        }));
        setSkills(formattedSkills);
      }
    } catch (err) {
      console.error('Failed to fetch skills graph data', err);
    }
    setLoading(false);
  };

  const renderGraph = (displaySkills) => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (displaySkills.length === 0) return;

    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr('width', width).attr('height', height);

    // Gradient defs
    const defs = svg.append('defs');
    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#3b82f6'];
    colors.forEach((c, i) => {
      const g = defs.append('radialGradient').attr('id', `node-grad-${i}`).attr('cx', '30%').attr('cy', '30%');
      g.append('stop').attr('offset', '0%').attr('stop-color', c).attr('stop-opacity', 1);
      g.append('stop').attr('offset', '100%').attr('stop-color', c).attr('stop-opacity', 0.6);
    });

    const gOuter = defs.append('radialGradient').attr('id', 'center-grad').attr('cx', '30%').attr('cy', '30%');
    gOuter.append('stop').attr('offset', '0%').attr('stop-color', '#a5b4fc').attr('stop-opacity', 1);
    gOuter.append('stop').attr('offset', '100%').attr('stop-color', '#6366f1').attr('stop-opacity', 1);

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom().scaleExtent([0.4, 3]).on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Nodes data
    const centerNode = { id: 'user', label: 'You', weight: 100, source: 'center', x: width / 2, y: height / 2 };
    const nodes = [centerNode, ...displaySkills.map(s => ({ ...s, fx: null, fy: null }))];

    // Links
    const links = displaySkills.map(s => ({ source: 'user', target: s.id }));

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => 80 + (100 - (d.target.weight || 50)) * 0.5).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => NODE_RADIUS(d.weight || 50) + 12));

    // Fix center node
    centerNode.fx = width / 2;
    centerNode.fy = height / 2;

    // Edges
    const link = g.append('g').selectAll('line').data(links).enter().append('line')
      .attr('stroke', d => `${getSkillColor(d.target.source || 'resume')}40`)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4');

    // Node groups
    const node = g.append('g').selectAll('g').data(nodes).enter().append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); if (d.id !== 'user') { d.fx = null; d.fy = null; } })
      )
      .on('click', (e, d) => setSelectedSkill(d.id === 'user' ? null : d));

    // Glow filter
    const glow = defs.append('filter').attr('id', 'glow');
    glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Get Icon URL
    const getIconUrl = (skillName) => {
      const name = skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const iconMap = {
        'react': 'react-original',
        'reactjs': 'react-original',
        'nodejs': 'nodejs-plain',
        'node': 'nodejs-plain',
        'python': 'python-plain',
        'javascript': 'javascript-plain',
        'js': 'javascript-plain',
        'typescript': 'typescript-plain',
        'ts': 'typescript-plain',
        'html': 'html5-plain',
        'css': 'css3-plain',
        'htmlcss': 'html5-plain',
        'java': 'java-plain',
        'csharp': 'csharp-plain',
        'c': 'c-plain',
        'cpp': 'cplusplus-plain',
        'cplusplus': 'cplusplus-plain',
        'go': 'go-original-wordmark',
        'rust': 'rust-plain',
        'sql': 'mysql-plain',
        'mysql': 'mysql-plain',
        'postgresql': 'postgresql-plain',
        'postgres': 'postgresql-plain',
        'mongodb': 'mongodb-plain',
        'mongo': 'mongodb-plain',
        'redis': 'redis-plain',
        'aws': 'amazonwebservices-original',
        'azure': 'azure-plain',
        'gcp': 'googlecloud-plain',
        'docker': 'docker-plain',
        'kubernetes': 'kubernetes-plain',
        'k8s': 'kubernetes-plain',
        'git': 'git-plain',
        'github': 'github-original',
        'vue': 'vuejs-plain',
        'vuejs': 'vuejs-plain',
        'angular': 'angularjs-plain',
        'nextjs': 'nextjs-original',
        'nestjs': 'nestjs-plain',
        'express': 'express-original',
        'spring': 'spring-plain',
        'django': 'django-plain',
        'flask': 'flask-original',
        'fastapi': 'fastapi-plain',
        'graphql': 'graphql-plain',
        'figma': 'figma-plain',
        'tailwindcss': 'tailwindcss-plain',
        'tailwind': 'tailwindcss-plain',
      };
      
      const mappedIcon = iconMap[name];
      if (mappedIcon) {
        return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${mappedIcon.split('-')[0]}/${mappedIcon}.svg`;
      }
      return null;
    };

    // Node circles
    node.append('circle')
      .attr('r', d => d.id === 'user' ? 28 : NODE_RADIUS(d.weight || 50))
      .attr('fill', (d, i) => d.id === 'user' ? 'url(#center-grad)' : `url(#node-grad-${i % colors.length})`)
      .attr('filter', 'url(#glow)')
      .attr('stroke', (d, i) => d.id === 'user' ? '#a5b4fc' : colors[i % colors.length])
      .attr('stroke-width', (d) => d.id === 'user' ? 2 : 1.5)
      .attr('stroke-opacity', 0.6)
      .style('transition', 'r 0.3s');

    // Pulse ring for center node
    const pulse = node.filter(d => d.id === 'user').append('circle').attr('r', 28).attr('fill', 'none').attr('stroke', '#6366f1').attr('stroke-width', 2).attr('opacity', 0.6);
    function pulsate() {
      pulse.transition().duration(1500).attr('r', 42).attr('opacity', 0).on('end', () => { pulse.attr('r', 28).attr('opacity', 0.6); pulsate(); });
    }
    pulsate();

    // Icons inside nodes
    node.each(function(d) {
      if (d.id !== 'user') {
        const iconUrl = getIconUrl(d.name);
        if (iconUrl) {
          const r = NODE_RADIUS(d.weight || 50);
          const iconSize = r * 0.9; // Scale icon to fit inside circle
          d3.select(this).append('image')
            .attr('href', iconUrl)
            .attr('x', -iconSize / 2)
            .attr('y', -iconSize / 2 - 2) // Shift up slightly to make room for text
            .attr('width', iconSize)
            .attr('height', iconSize)
            .attr('opacity', 0.9);
        }
      }
    });

    // Labels
    node.append('text')
      .attr('dy', d => {
        if (d.id === 'user') return 5;
        const iconUrl = getIconUrl(d.name);
        const r = NODE_RADIUS(d.weight || 50);
        return iconUrl ? (r * 0.45 + 10) : 4; // Drop text below icon if icon exists, else center it
      })
      .attr('text-anchor', 'middle')
      .attr('fill', '#f0f0ff')
      .attr('font-size', d => {
        if (d.id === 'user') return 12;
        return getIconUrl(d.name) ? 9 : 11; // Smaller text if icon exists
      })
      .attr('font-weight', d => d.id === 'user' ? 700 : 600)
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.id === 'user' ? 'YOU' : d.name)
      .style('pointer-events', 'none')
      .attr('filter', 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))'); // Add text shadow for legibility over icons/gradients

    // Center icon
    node.filter(d => d.id === 'user').append('text')
      .attr('dy', -6).attr('text-anchor', 'middle').attr('fill', '#f0f0ff').attr('font-size', 16).text('⚡')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!hasResume) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <AlertCircle size={36} color="#6366f1" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0ff', marginBottom: 12 }}>No Skills Found</h2>
        <p style={{ color: '#8888aa', fontSize: 15, maxWidth: 400, lineHeight: 1.6, marginBottom: 24 }}>
          Please upload your resume to generate your interactive skill graph and analyze your career potential.
        </p>
        <Link to="/dashboard/resume" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} /> Upload Resume
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 4 }}>Skill Graph</h1>
          <p style={{ color: '#8888aa', fontSize: 14 }}>Interactive visualization of your {filteredCount} skills from your resume</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={14} color="#8888aa" />
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 4 }}>
            {SOURCES.map(s => (
              <button key={s} onClick={() => setFilterSource(s)} style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                background: filterSource === s ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: filterSource === s ? '#a5b4fc' : '#8888aa',
                transition: 'all 0.15s'
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
        {/* Background grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg ref={svgRef} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }} />

        {/* Source Legend */}
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { source: 'resume', color: '#6366f1', label: 'Resume' },
            { source: 'analysis', color: '#8b5cf6', label: 'AI Analysis' },
            { source: 'inferred', color: '#ec4899', label: 'Inferred' },
          ].map(({ source, color, label }) => (
            <div key={source} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, backdropFilter: 'blur(10px)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 11, color: '#c0c0d0' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Selected skill panel */}
        <AnimatePresence>
          {selectedSkill && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ position: 'absolute', top: 16, right: 16, width: 220, background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px', backdropFilter: 'blur(20px)', zIndex: 10 }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, color: '#f0f0ff', marginBottom: 4 }}>{selectedSkill.name}</div>
              <div style={{ display: 'inline-block', padding: '2px 8px', background: `${getSkillColor(selectedSkill.source)}20`, border: `1px solid ${getSkillColor(selectedSkill.source)}40`, borderRadius: 12, fontSize: 11, color: getSkillColor(selectedSkill.source), marginBottom: 12 }}>
                Source: {selectedSkill.source}
              </div>
              <p style={{ fontSize: 13, color: '#8888aa', lineHeight: 1.5, marginBottom: 16 }}>
                Identified from your resume profile. Used for job matching and learning recommendations.
              </p>
              <button onClick={() => setSelectedSkill(null)} style={{ width: '100%', padding: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#8888aa', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 14px', fontSize: 11, color: '#8888aa', backdropFilter: 'blur(10px)', pointerEvents: 'none' }}>
          Drag nodes to rearrange · Click to inspect · Scroll to zoom
        </div>
      </div>
    </div>
  );
}
