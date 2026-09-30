import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, X, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const QUICK_PROMPTS = [
  'What skills should I learn?',
  'Why is my match score low?',
  'How to improve my resume?',
  'Suggest projects for backend',
];

function getInitialMessages(userName) {
  const firstName = userName?.split(' ')[0] || 'there';
  return [
    {
      role: 'ai',
      content: `👋 Hi ${firstName}! I'm your AI Career Copilot. I've analyzed your skill profile and job matches. Ask me anything — from skill gaps to resume tips!`,
      time: 'now'
    }
  ];
}

// Generate smart responses based on user's actual profile data
function generateDynamicResponse(msg, user) {
  const lower = msg.toLowerCase();
  const resumeScore = user?.profile?.resumeScore || 0;
  const fullName = user?.profile?.fullName || 'there';
  const firstName = fullName.split(' ')[0];

  if (lower.includes('skill') || lower.includes('learn')) {
    if (resumeScore > 0) {
      return `Based on your profile, ${firstName}, your resume score is **${resumeScore}/100**. To improve, I'd recommend focusing on in-demand skills like **React**, **Node.js**, and **Docker**. These appear frequently in job postings for your target roles. Upload your resume for a detailed skill analysis!`;
    }
    return `Hi ${firstName}! To get personalized skill recommendations, please **upload your resume** first. I'll analyze it and tell you exactly which skills to focus on based on the jobs you're targeting. You can do this from the **Resume** section.`;
  }

  if (lower.includes('job') || lower.includes('match') || lower.includes('score')) {
    if (resumeScore > 0) {
      return `${firstName}, with a resume score of **${resumeScore}/100**, you have a solid foundation! To boost your job match scores, consider: 1) Adding more **quantified achievements** to your resume, 2) Building projects that showcase **full-stack skills**, 3) Getting certifications in **cloud platforms** like AWS. Check the **Jobs** section for your current matches!`;
    }
    return `To see your job match scores, upload your resume first! I'll analyze your skills against available positions and calculate your match percentage. Head to the **Resume** section to get started.`;
  }

  if (lower.includes('resume') || lower.includes('cv')) {
    if (resumeScore > 0) {
      return `Your resume currently scores **${resumeScore}/100**. Key improvements: 1) Add **quantified impact** to your experience (e.g., "reduced API latency by 40%"), 2) Include **relevant keywords** from target job descriptions, 3) Add a **skills section** with proficiency levels. Visit the **Resume Editor** for AI-powered suggestions!`;
    }
    return `${firstName}, I haven't analyzed your resume yet. Head to the **Resume** section to upload it! I'll give you a detailed score breakdown, highlight missing keywords, and suggest improvements to help you stand out.`;
  }

  if (lower.includes('project') || lower.includes('portfolio')) {
    return `Great question, ${firstName}! Here are some project ideas that employers love: 1) **Full-stack web app** with authentication and database (shows breadth), 2) **REST API** with proper error handling and documentation, 3) **Dashboard** with data visualization, 4) An **open-source contribution** to a popular repo. Add your best projects to the **Portfolio** section!`;
  }

  // Default response
  if (resumeScore > 0) {
    return `Great question, ${firstName}! Based on your profile (resume score: **${resumeScore}/100**), I'd suggest focusing on strengthening your weakest skill areas. Check the **Skill Graph** section for a visual breakdown, and the **Learning** section for curated courses. Want me to help with something specific?`;
  }
  return `That's a great question, ${firstName}! To give you the most accurate advice, I need to analyze your resume first. Please upload it from the **Resume** section. Once I have your skill data, I can provide personalized recommendations for jobs, courses, and career growth. What would you like to know more about?`;
}

function formatAIText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#a5b4fc', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AICopilot() {
  const { user, token } = useAuth();
  const userName = user?.profile?.fullName || user?.name || 'there';
  const [messages, setMessages] = useState(getInitialMessages(userName));
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, time: 'now' }]);
    setTyping(true);

    let responseText;

    // Try calling the real API first
    try {
      if (token) {
        const res = await fetch(`${API_URL}/api/assistant/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ message: msg }),
        });
        if (res.ok) {
          const data = await res.json();
          responseText = data.reply;
        }
      }
    } catch (err) {
      // API not available, will use fallback
    }

    // Fallback: generate dynamic response based on user profile
    if (!responseText) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      responseText = generateDynamicResponse(msg, user);
    }

    setTyping(false);
    setMessages(prev => [...prev, { role: 'ai', content: responseText, time: 'now' }]);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0ff' }}>AI Copilot</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#10b981' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              Online · Analyzing your profile
            </div>
          </div>
          <button onClick={() => setMessages(getInitialMessages(userName))} className="btn-ghost" style={{ marginLeft: 'auto', padding: 6 }}>
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
            >
              {msg.role === 'ai' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={9} color="white" />
                  </div>
                  <span style={{ fontSize: 11, color: '#8888aa' }}>Copilot</span>
                </div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                {msg.role === 'ai' ? formatAIText(msg.content) : msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={9} color="white" />
              </div>
              <span style={{ fontSize: 11, color: '#8888aa' }}>Copilot</span>
            </div>
            <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {[0,1,2].map(i => (
                <motion.div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1' }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: '0 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => sendMessage(p)}
            style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 11,
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
              color: '#a5b4fc', cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(99,102,241,0.15)'}
            onMouseLeave={e => e.target.style.background = 'rgba(99,102,241,0.08)'}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-end',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '8px 12px', transition: 'border-color 0.2s'
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your skills, jobs..."
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#f0f0ff', fontSize: 13, resize: 'none', fontFamily: 'Inter, sans-serif',
              lineHeight: 1.4, maxHeight: 80
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none',
              background: input.trim() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0
            }}
          >
            <Send size={13} color={input.trim() ? 'white' : '#4a4a6a'} />
          </button>
        </div>
      </div>
    </div>
  );
}
