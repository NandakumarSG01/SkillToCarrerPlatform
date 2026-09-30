import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Download, Eye, FileText, ChevronRight, ChevronLeft, User, Briefcase, GraduationCap, Code2, FolderOpen, Sparkles, Check } from 'lucide-react';

// ─── Load html2pdf.js from CDN once ───────────────────────────────────────────
function loadHtml2Pdf() {
  return new Promise((resolve) => {
    if (window.html2pdf) { resolve(window.html2pdf); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    s.onload = () => resolve(window.html2pdf);
    document.head.appendChild(s);
  });
}

// ─── Default form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', email: '', phone: '', location: '', linkedin: '', website: '',
  summary: '',
  experience: [{ company: '', role: '', start: '', end: '', bullets: [''] }],
  education: [{ school: '', degree: '', year: '', gpa: '' }],
  skills: [''],
  projects: [{ title: '', description: '', link: '' }],
};

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'modern',    label: 'Modern',    accent: '#4f46e5', desc: 'Clean indigo sidebar, ATS-friendly' },
  { id: 'classic',   label: 'Classic',   accent: '#1e293b', desc: 'Traditional serif, corporate style' },
  { id: 'minimal',   label: 'Minimal',   accent: '#0ea5e9', desc: 'White space, elegant & airy' },
  { id: 'executive', label: 'Executive', accent: '#0f172a', desc: 'Dark header, two-column power look' },
  { id: 'creative',  label: 'Creative',  accent: '#7c3aed', desc: 'Bold violet, standout design' },
];

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = ['Fill Details', 'Choose Template', 'Preview & Download'];

export default function EditorPage() {
  const { user } = useAuth();
  const previewRef = useRef(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('sg_resume_form');
    if (saved) try { return JSON.parse(saved); } catch {}
    return { ...EMPTY_FORM, name: user?.profile?.fullName || user?.name || '' };
  });
  const [template, setTemplate] = useState('modern');
  const [downloading, setDownloading] = useState(false);

  // Auto-save form to localStorage
  useEffect(() => {
    localStorage.setItem('sg_resume_form', JSON.stringify(form));
  }, [form]);

  // ── Form helpers ──
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const setArr = (key, idx, val) => setForm(f => {
    const arr = [...f[key]];
    arr[idx] = typeof val === 'function' ? val(arr[idx]) : val;
    return { ...f, [key]: arr };
  });

  const addArr = (key, blank) => setForm(f => ({ ...f, [key]: [...f[key], blank] }));
  const rmArr  = (key, idx)   => setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  const setBullet = (expIdx, bIdx, val) => setArr('experience', expIdx, exp => {
    const bullets = [...exp.bullets]; bullets[bIdx] = val; return { ...exp, bullets };
  });
  const addBullet = (expIdx) => setArr('experience', expIdx, exp => ({ ...exp, bullets: [...exp.bullets, ''] }));
  const rmBullet  = (expIdx, bIdx) => setArr('experience', expIdx, exp => ({ ...exp, bullets: exp.bullets.filter((_, i) => i !== bIdx) }));

  // ── PDF Download ──
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const h2p = await loadHtml2Pdf();
      const el = previewRef.current;
      await h2p().set({
        margin: 0,
        filename: `${form.name || 'resume'}-resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(el).save();
    } catch (e) { console.error(e); }
    setDownloading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0ff', letterSpacing: '-0.03em', marginBottom: 4 }}>
            <Sparkles size={20} color="#6366f1" style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Resume Builder
          </h1>
          <p style={{ color: '#8888aa', fontSize: 13 }}>Create a professional resume and download as PDF</p>
        </div>
        {step === 2 && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: downloading ? 0.7 : 1 }}
          >
            <Download size={16} /> {downloading ? 'Generating PDF…' : 'Download PDF'}
          </button>
        )}
      </div>

      {/* Step tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => i < step + 1 && setStep(i)}
            style={{ padding: '8px 20px', borderRadius: 9, border: 'none', fontWeight: 600, fontSize: 13, cursor: i <= step ? 'pointer' : 'default',
              background: step === i ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
              color: step === i ? '#fff' : i < step ? '#a5b4fc' : '#4a4a6a',
              transition: 'all 0.2s' }}>
            {i < step && <Check size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}{s}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 0: Form ── */}
        {step === 0 && (
          <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Personal Info */}
            <Section icon={<User size={16} color="#6366f1" />} title="Personal Information">
              <Grid2>
                <Field label="Full Name"   value={form.name}     onChange={v => setField('name', v)}     placeholder="John Doe" />
                <Field label="Email"       value={form.email}    onChange={v => setField('email', v)}    placeholder="john@email.com" />
                <Field label="Phone"       value={form.phone}    onChange={v => setField('phone', v)}    placeholder="+1 234 567 8900" />
                <Field label="Location"    value={form.location} onChange={v => setField('location', v)} placeholder="New York, NY" />
                <Field label="LinkedIn URL" value={form.linkedin} onChange={v => setField('linkedin', v)} placeholder="linkedin.com/in/johndoe" />
                <Field label="Website / Portfolio" value={form.website} onChange={v => setField('website', v)} placeholder="johndoe.dev" />
              </Grid2>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Professional Summary</label>
                <textarea value={form.summary} onChange={e => setField('summary', e.target.value)}
                  placeholder="Results-driven software engineer with 5+ years of experience..."
                  rows={3} style={{ ...inputStyle, resize: 'vertical', width: '100%' }} />
              </div>
            </Section>

            {/* Work Experience */}
            <Section icon={<Briefcase size={16} color="#06b6d4" />} title="Work Experience">
              {form.experience.map((exp, i) => (
                <ExpCard key={i} exp={exp} idx={i}
                  onChange={(field, val) => setArr('experience', i, e => ({ ...e, [field]: val }))}
                  onBullet={(bi, val) => setBullet(i, bi, val)}
                  onAddBullet={() => addBullet(i)}
                  onRmBullet={(bi) => rmBullet(i, bi)}
                  onRemove={() => rmArr('experience', i)}
                  canRemove={form.experience.length > 1} />
              ))}
              <AddBtn onClick={() => addArr('experience', { company: '', role: '', start: '', end: '', bullets: [''] })} label="Add Experience" />
            </Section>

            {/* Education */}
            <Section icon={<GraduationCap size={16} color="#10b981" />} title="Education">
              {form.education.map((edu, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#8888aa' }}>Education #{i + 1}</span>
                    {form.education.length > 1 && <TrashBtn onClick={() => rmArr('education', i)} />}
                  </div>
                  <Grid2>
                    <Field label="School / University" value={edu.school} onChange={v => setArr('education', i, e => ({ ...e, school: v }))} placeholder="MIT" />
                    <Field label="Degree" value={edu.degree} onChange={v => setArr('education', i, e => ({ ...e, degree: v }))} placeholder="B.Sc. Computer Science" />
                    <Field label="Year" value={edu.year} onChange={v => setArr('education', i, e => ({ ...e, year: v }))} placeholder="2018 – 2022" />
                    <Field label="GPA (optional)" value={edu.gpa} onChange={v => setArr('education', i, e => ({ ...e, gpa: v }))} placeholder="3.8 / 4.0" />
                  </Grid2>
                </div>
              ))}
              <AddBtn onClick={() => addArr('education', { school: '', degree: '', year: '', gpa: '' })} label="Add Education" />
            </Section>

            {/* Skills */}
            <Section icon={<Code2 size={16} color="#f59e0b" />} title="Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.skills.map((sk, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input value={sk} onChange={e => setArr('skills', i, e.target.value)}
                      placeholder={`Skill ${i + 1}`}
                      style={{ ...inputStyle, width: 130 }} />
                    {form.skills.length > 1 && <TrashBtn onClick={() => rmArr('skills', i)} />}
                  </div>
                ))}
                <button onClick={() => addArr('skills', '')}
                  style={{ padding: '6px 14px', border: '1px dashed rgba(99,102,241,0.4)', borderRadius: 8, background: 'transparent', color: '#6366f1', fontSize: 12, cursor: 'pointer' }}>
                  + Add Skill
                </button>
              </div>
            </Section>

            {/* Projects */}
            <Section icon={<FolderOpen size={16} color="#f43f5e" />} title="Projects (Optional)">
              {form.projects.map((proj, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#8888aa' }}>Project #{i + 1}</span>
                    {form.projects.length > 1 && <TrashBtn onClick={() => rmArr('projects', i)} />}
                  </div>
                  <Grid2>
                    <Field label="Project Title" value={proj.title} onChange={v => setArr('projects', i, p => ({ ...p, title: v }))} placeholder="Portfolio Website" />
                    <Field label="Link (optional)" value={proj.link} onChange={v => setArr('projects', i, p => ({ ...p, link: v }))} placeholder="github.com/..." />
                  </Grid2>
                  <div style={{ marginTop: 10 }}>
                    <label style={labelStyle}>Description</label>
                    <textarea value={proj.description} onChange={e => setArr('projects', i, p => ({ ...p, description: e.target.value }))}
                      placeholder="A brief description of what you built and the technologies used..."
                      rows={2} style={{ ...inputStyle, resize: 'vertical', width: '100%' }} />
                  </div>
                </div>
              ))}
              <AddBtn onClick={() => addArr('projects', { title: '', description: '', link: '' })} label="Add Project" />
            </Section>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setStep(1)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 28px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Next: Choose Template <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 1: Template Picker ── */}
        {step === 1 && (
          <motion.div key="templates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ color: '#8888aa', fontSize: 14 }}>Select a template that matches your style. You can always come back and change it.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {TEMPLATES.map(t => (
                <motion.div key={t.id} whileHover={{ y: -4, scale: 1.02 }} onClick={() => setTemplate(t.id)}
                  style={{ cursor: 'pointer', borderRadius: 14, border: `2px solid ${template === t.id ? t.accent : 'rgba(255,255,255,0.08)'}`,
                    background: template === t.id ? `${t.accent}18` : 'rgba(255,255,255,0.03)', padding: 16, transition: 'border-color 0.2s' }}>
                  {/* Mini thumbnail */}
                  <TemplateThumbnail id={t.id} accent={t.accent} />
                  <div style={{ marginTop: 12, fontWeight: 700, fontSize: 14, color: template === t.id ? '#f0f0ff' : '#8888aa' }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: '#6a6a8a', marginTop: 2 }}>{t.desc}</div>
                  {template === t.id && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.accent, fontWeight: 600 }}>
                      <Check size={11} /> Selected
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setStep(0)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#8888aa', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                <ChevronLeft size={15} /> Back
              </button>
              <button onClick={() => setStep(2)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Preview Resume <Eye size={15} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Preview + Download ── */}
        {step === 2 && (
          <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#8888aa', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                <ChevronLeft size={14} /> Change Template
              </button>
              <button onClick={() => setStep(0)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#8888aa', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                <FileText size={14} /> Edit Details
              </button>
            </div>

            {/* A4 Preview wrapper */}
            <div style={{ overflowY: 'auto', maxHeight: '75vh', background: '#c8c8d0', padding: '24px 0', borderRadius: 12, display: 'flex', justifyContent: 'center' }}>
              <div ref={previewRef} style={{ width: 794, minHeight: 1123, background: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
                <ResumePreview form={form} template={template} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#8888aa', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase' };
const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#f0f0ff', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...inputStyle, width: '100%' }} />
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>;
}

function Section({ icon, title, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {icon}
        <span style={{ fontWeight: 700, fontSize: 15, color: '#f0f0ff' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ExpCard({ exp, idx, onChange, onBullet, onAddBullet, onRmBullet, onRemove, canRemove }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: '#8888aa' }}>Experience #{idx + 1}</span>
        {canRemove && <TrashBtn onClick={onRemove} />}
      </div>
      <Grid2>
        <Field label="Company" value={exp.company} onChange={v => onChange('company', v)} placeholder="Google" />
        <Field label="Job Title" value={exp.role} onChange={v => onChange('role', v)} placeholder="Software Engineer" />
        <Field label="Start Date" value={exp.start} onChange={v => onChange('start', v)} placeholder="Jan 2022" />
        <Field label="End Date" value={exp.end} onChange={v => onChange('end', v)} placeholder="Present" />
      </Grid2>
      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Bullet Points (Achievements)</label>
        {exp.bullets.map((b, bi) => (
          <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ color: '#6366f1', fontSize: 14, marginTop: 0 }}>•</span>
            <input value={b} onChange={e => onBullet(bi, e.target.value)}
              placeholder="Achieved X by doing Y, resulting in Z%..."
              style={{ ...inputStyle, flex: 1 }} />
            {exp.bullets.length > 1 && <TrashBtn onClick={() => onRmBullet(bi)} />}
          </div>
        ))}
        <button onClick={onAddBullet}
          style={{ fontSize: 11, color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
          + Add bullet
        </button>
      </div>
    </div>
  );
}

function AddBtn({ onClick, label }) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px dashed rgba(99,102,241,0.4)', borderRadius: 9, background: 'transparent', color: '#6366f1', fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
      <Plus size={14} /> {label}
    </button>
  );
}

function TrashBtn({ onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding: '5px 7px', border: 'none', background: 'rgba(244,63,94,0.1)', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <Trash2 size={13} color="#f43f5e" />
    </button>
  );
}

// ─── Template Thumbnails ───────────────────────────────────────────────────────
function TemplateThumbnail({ id, accent }) {
  const base = { width: '100%', height: 110, borderRadius: 8, overflow: 'hidden', position: 'relative', background: '#fff' };
  if (id === 'modern') return (
    <div style={base}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 28, background: accent }} />
      <div style={{ marginLeft: 34, padding: 8 }}>
        <div style={{ height: 8, width: '60%', background: '#1e293b', borderRadius: 4, marginBottom: 4 }} />
        <div style={{ height: 5, width: '45%', background: '#94a3b8', borderRadius: 3, marginBottom: 8 }} />
        {[40, 55, 50].map((w, i) => <div key={i} style={{ height: 4, width: `${w}%`, background: '#e2e8f0', borderRadius: 2, marginBottom: 3 }} />)}
      </div>
    </div>
  );
  if (id === 'classic') return (
    <div style={base}>
      <div style={{ borderBottom: `2px solid ${accent}`, padding: '8px 10px' }}>
        <div style={{ height: 8, width: '50%', background: accent, borderRadius: 3, margin: '0 auto 4px' }} />
        <div style={{ height: 4, width: '35%', background: '#94a3b8', borderRadius: 2, margin: '0 auto' }} />
      </div>
      <div style={{ padding: '6px 10px' }}>
        {[55, 45, 50, 40].map((w, i) => <div key={i} style={{ height: 4, width: `${w}%`, background: '#e2e8f0', borderRadius: 2, marginBottom: 5 }} />)}
      </div>
    </div>
  );
  if (id === 'minimal') return (
    <div style={base}>
      <div style={{ padding: 10 }}>
        <div style={{ height: 9, width: '55%', background: '#0f172a', borderRadius: 3, marginBottom: 3 }} />
        <div style={{ height: 3, width: '35%', background: accent, borderRadius: 2, marginBottom: 8 }} />
        {[50, 65, 45].map((w, i) => <div key={i} style={{ height: 3, width: `${w}%`, background: '#e2e8f0', borderRadius: 2, marginBottom: 4 }} />)}
      </div>
    </div>
  );
  if (id === 'executive') return (
    <div style={base}>
      <div style={{ background: accent, padding: '10px 10px 8px', marginBottom: 6 }}>
        <div style={{ height: 7, width: '55%', background: 'rgba(255,255,255,0.9)', borderRadius: 3, marginBottom: 3 }} />
        <div style={{ height: 4, width: '40%', background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 8px' }}>
        <div style={{ flex: 1 }}>{[50, 70, 40].map((w, i) => <div key={i} style={{ height: 3, width: `${w}%`, background: '#e2e8f0', borderRadius: 2, marginBottom: 4 }} />)}</div>
        <div style={{ width: 40 }}>{[80, 60, 90].map((w, i) => <div key={i} style={{ height: 3, width: `${w}%`, background: '#e2e8f0', borderRadius: 2, marginBottom: 4 }} />)}</div>
      </div>
    </div>
  );
  // creative
  return (
    <div style={base}>
      <div style={{ background: `linear-gradient(135deg, ${accent}, #ec4899)`, padding: 10 }}>
        <div style={{ height: 8, width: '50%', background: 'rgba(255,255,255,0.9)', borderRadius: 3, marginBottom: 3 }} />
        <div style={{ height: 4, width: '35%', background: 'rgba(255,255,255,0.6)', borderRadius: 2 }} />
      </div>
      <div style={{ padding: '6px 10px' }}>
        {[55, 45, 60].map((w, i) => <div key={i} style={{ height: 4, width: `${w}%`, background: '#e2e8f0', borderRadius: 2, marginBottom: 4 }} />)}
      </div>
    </div>
  );
}

// ─── Resume Preview Component ──────────────────────────────────────────────────
function ResumePreview({ form, template }) {
  const tmpl = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
  const acc = tmpl.accent;

  const sectionTitle = (text) => ({
    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: template === 'executive' || template === 'creative' ? acc : acc,
    borderBottom: `1.5px solid ${acc}`, paddingBottom: 3, marginBottom: 8, marginTop: 16
  });

  const skillTags = form.skills.filter(Boolean);

  if (template === 'modern') return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'Arial, sans-serif', fontSize: 11 }}>
      {/* Left sidebar */}
      <div style={{ width: 200, background: acc, color: '#fff', padding: 24, flexShrink: 0 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, marginBottom: 14 }}>
          {(form.name || 'Y').charAt(0)}
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>Contact</div>
        {form.email && <div style={{ fontSize: 9, marginBottom: 3, wordBreak: 'break-all', opacity: 0.9 }}>{form.email}</div>}
        {form.phone && <div style={{ fontSize: 9, marginBottom: 3, opacity: 0.9 }}>{form.phone}</div>}
        {form.location && <div style={{ fontSize: 9, marginBottom: 3, opacity: 0.9 }}>{form.location}</div>}
        {form.linkedin && <div style={{ fontSize: 9, marginBottom: 3, opacity: 0.9, wordBreak: 'break-all' }}>{form.linkedin}</div>}
        {form.website && <div style={{ fontSize: 9, opacity: 0.9, wordBreak: 'break-all' }}>{form.website}</div>}

        {skillTags.length > 0 && <>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7, marginTop: 16, marginBottom: 8 }}>Skills</div>
          {skillTags.map((sk, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '3px 7px', marginBottom: 4, fontSize: 9 }}>{sk}</div>
          ))}
        </>}
      </div>
      {/* Right content */}
      <div style={{ flex: 1, padding: 28, overflowHidden: true }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>{form.name || 'Your Name'}</h1>
        {form.summary && <p style={{ fontSize: 10, color: '#475569', lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>{form.summary}</p>}
        {form.experience.some(e => e.company) && <>
          <div style={sectionTitle('Experience')}>Experience</div>
          {form.experience.filter(e => e.company).map((exp, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#0f172a' }}>{exp.role}</div>
                <div style={{ fontSize: 9, color: '#94a3b8' }}>{exp.start}{exp.end ? ` – ${exp.end}` : ''}</div>
              </div>
              <div style={{ fontSize: 10, color: acc, fontWeight: 600, marginBottom: 3 }}>{exp.company}</div>
              {exp.bullets.filter(Boolean).map((b, bi) => <div key={bi} style={{ fontSize: 9, color: '#475569', lineHeight: 1.5, paddingLeft: 10 }}>• {b}</div>)}
            </div>
          ))}
        </>}
        {form.education.some(e => e.school) && <>
          <div style={sectionTitle('Education')}>Education</div>
          {form.education.filter(e => e.school).map((edu, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: '#0f172a' }}>{edu.degree}</div>
              <div style={{ fontSize: 10, color: acc, fontWeight: 600 }}>{edu.school}</div>
              <div style={{ fontSize: 9, color: '#94a3b8' }}>{edu.year}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</div>
            </div>
          ))}
        </>}
        {form.projects.some(p => p.title) && <>
          <div style={sectionTitle('Projects')}>Projects</div>
          {form.projects.filter(p => p.title).map((proj, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: '#0f172a' }}>{proj.title}{proj.link ? <span style={{ fontSize: 9, color: acc, fontWeight: 400, marginLeft: 6 }}>{proj.link}</span> : ''}</div>
              {proj.description && <div style={{ fontSize: 9, color: '#475569', lineHeight: 1.5 }}>{proj.description}</div>}
            </div>
          ))}
        </>}
      </div>
    </div>
  );

  if (template === 'classic') return (
    <div style={{ padding: '32px 40px', fontFamily: 'Georgia, serif', fontSize: 11 }}>
      <div style={{ textAlign: 'center', borderBottom: `2px solid ${acc}`, paddingBottom: 12, marginBottom: 14 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: acc, margin: '0 0 4px' }}>{form.name || 'Your Name'}</h1>
        <div style={{ fontSize: 9, color: '#64748b', display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {[form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      {form.summary && <><div style={sectionTitle('Summary')}>PROFESSIONAL SUMMARY</div><p style={{ fontSize: 10, lineHeight: 1.7, color: '#334155' }}>{form.summary}</p></>}
      {form.experience.some(e => e.company) && <><div style={sectionTitle('Experience')}>EXPERIENCE</div>
        {form.experience.filter(e => e.company).map((exp, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><span style={{ fontWeight: 700, fontSize: 11 }}>{exp.role}</span> — <span style={{ fontStyle: 'italic', color: acc }}>{exp.company}</span></div>
              <span style={{ fontSize: 9, color: '#94a3b8' }}>{exp.start}{exp.end ? ` – ${exp.end}` : ''}</span>
            </div>
            {exp.bullets.filter(Boolean).map((b, bi) => <div key={bi} style={{ fontSize: 9, color: '#475569', lineHeight: 1.6, paddingLeft: 12, marginTop: 2 }}>• {b}</div>)}
          </div>
        ))}
      </>}
      {form.education.some(e => e.school) && <><div style={sectionTitle('Education')}>EDUCATION</div>
        {form.education.filter(e => e.school).map((edu, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div><div style={{ fontWeight: 700 }}>{edu.degree}</div><div style={{ fontStyle: 'italic', color: acc, fontSize: 10 }}>{edu.school}</div></div>
            <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right' }}>{edu.year}{edu.gpa ? <><br />GPA: {edu.gpa}</> : ''}</div>
          </div>
        ))}
      </>}
      {skillTags.length > 0 && <><div style={sectionTitle('Skills')}>SKILLS</div><div style={{ fontSize: 10, color: '#334155', lineHeight: 1.8 }}>{skillTags.join(' · ')}</div></>}
      {form.projects.some(p => p.title) && <><div style={sectionTitle('Projects')}>PROJECTS</div>
        {form.projects.filter(p => p.title).map((proj, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 11 }}>{proj.title}</span>{proj.link ? <span style={{ fontSize: 9, color: acc, marginLeft: 6 }}>{proj.link}</span> : ''}
            {proj.description && <div style={{ fontSize: 9, color: '#475569', lineHeight: 1.5, marginTop: 2 }}>{proj.description}</div>}
          </div>
        ))}
      </>}
    </div>
  );

  if (template === 'minimal') return (
    <div style={{ padding: '36px 44px', fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 11 }}>
      <h1 style={{ fontSize: 26, fontWeight: 300, color: '#0f172a', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{form.name || 'Your Name'}</h1>
      <div style={{ height: 2, width: 40, background: acc, margin: '6px 0 8px' }} />
      <div style={{ fontSize: 9, color: '#94a3b8', display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {[form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
      </div>
      {form.summary && <p style={{ fontSize: 10, lineHeight: 1.8, color: '#475569', marginBottom: 0, maxWidth: 560 }}>{form.summary}</p>}
      {form.experience.some(e => e.company) && <>
        <div style={{ ...sectionTitle('Experience'), marginTop: 20 }}>Experience</div>
        {form.experience.filter(e => e.company).map((exp, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, fontSize: 11, color: '#0f172a' }}>{exp.role} · <span style={{ color: acc, fontWeight: 400 }}>{exp.company}</span></span>
              <span style={{ fontSize: 9, color: '#94a3b8' }}>{exp.start}{exp.end ? ` – ${exp.end}` : ''}</span>
            </div>
            {exp.bullets.filter(Boolean).map((b, bi) => <div key={bi} style={{ fontSize: 9, color: '#64748b', lineHeight: 1.6, paddingLeft: 10, marginTop: 2 }}>– {b}</div>)}
          </div>
        ))}
      </>}
      {form.education.some(e => e.school) && <>
        <div style={sectionTitle('Education')}>Education</div>
        {form.education.filter(e => e.school).map((edu, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>{edu.degree}</span> · <span style={{ color: acc, fontSize: 10 }}>{edu.school}</span>
            <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 8 }}>{edu.year}{edu.gpa ? ` (GPA ${edu.gpa})` : ''}</span>
          </div>
        ))}
      </>}
      {skillTags.length > 0 && <><div style={sectionTitle('Skills')}>Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {skillTags.map((sk, i) => <span key={i} style={{ padding: '2px 10px', border: `1px solid ${acc}30`, borderRadius: 20, fontSize: 9, color: '#334155' }}>{sk}</span>)}
        </div>
      </>}
      {form.projects.some(p => p.title) && <>
        <div style={sectionTitle('Projects')}>Projects</div>
        {form.projects.filter(p => p.title).map((proj, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 11 }}>{proj.title}</span>{proj.link ? <span style={{ fontSize: 9, color: acc, marginLeft: 6 }}>{proj.link}</span> : ''}
            {proj.description && <div style={{ fontSize: 9, color: '#64748b', lineHeight: 1.5 }}>{proj.description}</div>}
          </div>
        ))}
      </>}
    </div>
  );

  if (template === 'executive') return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11 }}>
      <div style={{ background: acc, color: '#fff', padding: '24px 32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>{form.name || 'Your Name'}</h1>
        <div style={{ fontSize: 9, opacity: 0.8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 0 }}>
        <div style={{ flex: 2, padding: '20px 28px' }}>
          {form.summary && <><div style={{ fontSize: 9, fontWeight: 700, color: acc, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${acc}`, paddingBottom: 3, marginBottom: 8 }}>Summary</div><p style={{ fontSize: 10, lineHeight: 1.7, color: '#334155', marginTop: 0 }}>{form.summary}</p></>}
          {form.experience.some(e => e.company) && <>
            <div style={{ fontSize: 9, fontWeight: 700, color: acc, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${acc}`, paddingBottom: 3, marginBottom: 10, marginTop: 12 }}>Experience</div>
            {form.experience.filter(e => e.company).map((exp, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: 11 }}>{exp.role}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>{exp.start}{exp.end ? ` – ${exp.end}` : ''}</div>
                </div>
                <div style={{ color: '#64748b', fontSize: 10, fontWeight: 600, marginBottom: 3 }}>{exp.company}</div>
                {exp.bullets.filter(Boolean).map((b, bi) => <div key={bi} style={{ fontSize: 9, color: '#475569', lineHeight: 1.5, paddingLeft: 10 }}>▸ {b}</div>)}
              </div>
            ))}
          </>}
          {form.projects.some(p => p.title) && <>
            <div style={{ fontSize: 9, fontWeight: 700, color: acc, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${acc}`, paddingBottom: 3, marginBottom: 8, marginTop: 12 }}>Projects</div>
            {form.projects.filter(p => p.title).map((proj, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{proj.title}</div>
                {proj.description && <div style={{ fontSize: 9, color: '#475569', lineHeight: 1.5 }}>{proj.description}</div>}
              </div>
            ))}
          </>}
        </div>
        <div style={{ width: 180, background: '#f8fafc', padding: '20px 16px', borderLeft: '1px solid #e2e8f0' }}>
          {form.education.some(e => e.school) && <>
            <div style={{ fontSize: 9, fontWeight: 700, color: acc, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Education</div>
            {form.education.filter(e => e.school).map((edu, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 9 }}>{edu.degree}</div>
                <div style={{ color: acc, fontSize: 9 }}>{edu.school}</div>
                <div style={{ fontSize: 8, color: '#94a3b8' }}>{edu.year}</div>
              </div>
            ))}
          </>}
          {skillTags.length > 0 && <>
            <div style={{ fontSize: 9, fontWeight: 700, color: acc, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 12, marginBottom: 8 }}>Skills</div>
            {skillTags.map((sk, i) => <div key={i} style={{ fontSize: 9, color: '#334155', padding: '2px 0', borderBottom: '1px solid #e2e8f0' }}>{sk}</div>)}
          </>}
        </div>
      </div>
    </div>
  );

  // creative
  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 11 }}>
      <div style={{ background: `linear-gradient(135deg, ${acc} 0%, #ec4899 100%)`, color: '#fff', padding: '28px 36px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{form.name || 'Your Name'}</h1>
        <div style={{ fontSize: 9, opacity: 0.85, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[form.email, form.phone, form.location, form.linkedin, form.website].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      <div style={{ padding: '20px 36px' }}>
        {form.summary && <><div style={{ ...sectionTitle('Summary'), color: acc }}>About Me</div><p style={{ fontSize: 10, lineHeight: 1.75, color: '#475569' }}>{form.summary}</p></>}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <div>
            {form.experience.some(e => e.company) && <>
              <div style={{ ...sectionTitle('Exp'), color: acc, marginTop: 8 }}>Experience</div>
              {form.experience.filter(e => e.company).map((exp, i) => (
                <div key={i} style={{ marginBottom: 12, paddingLeft: 8, borderLeft: `2px solid ${acc}30` }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#0f172a' }}>{exp.role}</div>
                  <div style={{ fontSize: 10, color: acc, fontWeight: 600 }}>{exp.company}</div>
                  <div style={{ fontSize: 8, color: '#94a3b8', marginBottom: 3 }}>{exp.start}{exp.end ? ` – ${exp.end}` : ''}</div>
                  {exp.bullets.filter(Boolean).map((b, bi) => <div key={bi} style={{ fontSize: 9, color: '#475569', lineHeight: 1.5 }}>• {b}</div>)}
                </div>
              ))}
            </>}
            {form.projects.some(p => p.title) && <>
              <div style={{ ...sectionTitle('Proj'), color: acc }}>Projects</div>
              {form.projects.filter(p => p.title).map((proj, i) => (
                <div key={i} style={{ marginBottom: 8, paddingLeft: 8, borderLeft: `2px solid #ec489930` }}>
                  <div style={{ fontWeight: 700 }}>{proj.title}</div>
                  {proj.description && <div style={{ fontSize: 9, color: '#64748b', lineHeight: 1.5 }}>{proj.description}</div>}
                </div>
              ))}
            </>}
          </div>
          <div>
            {form.education.some(e => e.school) && <>
              <div style={{ ...sectionTitle('Edu'), color: '#ec4899', marginTop: 8 }}>Education</div>
              {form.education.filter(e => e.school).map((edu, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700 }}>{edu.degree}</div>
                  <div style={{ color: acc, fontSize: 10 }}>{edu.school}</div>
                  <div style={{ fontSize: 8, color: '#94a3b8' }}>{edu.year}{edu.gpa ? ` · ${edu.gpa}` : ''}</div>
                </div>
              ))}
            </>}
            {skillTags.length > 0 && <>
              <div style={{ ...sectionTitle('Skills'), color: '#ec4899' }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {skillTags.map((sk, i) => (
                  <span key={i} style={{ padding: '2px 8px', background: `${acc}15`, borderRadius: 20, fontSize: 8, color: acc, border: `1px solid ${acc}30` }}>{sk}</span>
                ))}
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}
