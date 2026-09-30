import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Linkedin, Github, Save, Camera, Plus, Trash2, CheckCircle, AlertCircle 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

// Internal style helper for local consistency
const sectionStyles = {
  container: { marginBottom: 24, padding: 24 },
  header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }
};

export default function ProfilePage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    headline: '',
    summary: '',
    phone: '',
    address: '',
    avatarUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    educations: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.profile) {
        setFormData({
          fullName: data.profile.fullName || '',
          headline: data.profile.headline || '',
          summary: data.profile.summary || '',
          phone: data.profile.phone || '',
          address: data.profile.address || '',
          avatarUrl: data.profile.avatarUrl || '',
          linkedinUrl: data.profile.linkedinUrl || '',
          githubUrl: data.profile.githubUrl || '',
          educations: data.profile.educations || []
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccess(false);
    
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      educations: [...prev.educations, { institution: '', degree: '', field: '', location: '', marks: '', cgpa: '', startDate: '', endDate: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    const newEdu = [...formData.educations];
    newEdu[index][field] = value;
    setFormData(prev => ({ ...prev, educations: newEdu }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index)
    }));
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <CheckCircle size={32} color="#6366f1" />
      </motion.div>
      <div style={{ marginTop: 12, color: '#8888aa' }}>Loading profile...</div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 850, margin: '0 auto', paddingBottom: 80 }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 4 }}>
            Profile Settings
          </h1>
          <p style={{ color: '#8888aa', fontSize: 14 }}>
            Update your personal, academic and professional presence
          </p>
        </div>
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : success ? <><CheckCircle size={16} /> Updated Successfully</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Personal Section */}
        <section className="glass-card" style={sectionStyles.container}>
          <div style={sectionStyles.header}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#6366f1" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0f0ff' }}>Personal Information</h2>
          </div>
          
          <div style={sectionStyles.grid}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="input-field" value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Headline / Degree</label>
              <input type="text" className="input-field" placeholder="Full Stack Developer / MBA"
                value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a4a6a' }} />
                <input type="text" className="input-field" style={{ paddingLeft: 38 }} placeholder="+91 99999 99999"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Location / Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a4a6a' }} />
                <input type="text" className="input-field" style={{ paddingLeft: 38 }} placeholder="Chennai, TN"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
          </div>
          
          <div className="input-group" style={{ marginTop: 20 }}>
            <label className="input-label">Professional Summary</label>
            <textarea className="input-field" rows={4} value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})}
              placeholder="Tell us about your career goals and achievements..." 
              style={{ resize: 'none' }} />
          </div>
        </section>

        {/* Education Section */}
        <section className="glass-card" style={sectionStyles.container}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={18} color="#06b6d4" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0f0ff' }}>Academic Records</h2>
            </div>
            <button type="button" onClick={addEducation} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
              <Plus size={14} /> Add Schooling/College
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {formData.educations.map((edu, idx) => (
              <motion.div 
                layout 
                key={idx} 
                style={{ 
                  padding: 20, 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 14, 
                  position: 'relative' 
                }}
              >
                <button 
                  type="button" 
                  onClick={() => removeEducation(idx)} 
                  style={{ position: 'absolute', top: 12, right: 12, color: 'var(--accent-rose)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                  onMouseEnter={e => e.target.style.opacity = 1}
                  onMouseLeave={e => e.target.style.opacity = 0.6}
                >
                  <Trash2 size={16} />
                </button>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="input-group">
                    <label className="input-label">College / School Name</label>
                    <input type="text" className="input-field" placeholder="SRM Institute of Technology"
                      value={edu.institution} onChange={e => updateEducation(idx, 'institution', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Degree</label>
                    <input type="text" className="input-field" placeholder="B.Tech"
                      value={edu.degree} onChange={e => updateEducation(idx, 'degree', e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Field</label>
                    <input type="text" className="input-field" placeholder="CSE"
                      value={edu.field} onChange={e => updateEducation(idx, 'field', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">CGPA</label>
                    <input type="text" className="input-field" placeholder="9.5"
                      value={edu.cgpa} onChange={e => updateEducation(idx, 'cgpa', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Marks (%)</label>
                    <input type="text" className="input-field" placeholder="95"
                      value={edu.marks} onChange={e => updateEducation(idx, 'marks', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Address</label>
                    <input type="text" className="input-field" placeholder="Kattankulathur"
                      value={edu.location} onChange={e => updateEducation(idx, 'location', e.target.value)} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {formData.educations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: 12 }}>
              <AlertCircle size={24} style={{ marginBottom: 10, opacity: 0.5 }} />
              <div>No academic records provided yet. Click "Add" to start.</div>
            </div>
          )}
        </section>

        {/* Social Presence */}
        <section className="glass-card" style={sectionStyles.container}>
          <div style={sectionStyles.header}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Linkedin size={18} color="#8b5cf6" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0f0ff' }}>Online Presence</h2>
          </div>
          
          <div style={sectionStyles.grid}>
            <div className="input-group">
              <label className="input-label">LinkedIn account</label>
              <div style={{ position: 'relative' }}>
                <Linkedin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#0a66c2' }} />
                <input type="text" className="input-field" style={{ paddingLeft: 38 }} placeholder="linkedin.com/in/username"
                  value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">GitHub account</label>
              <div style={{ position: 'relative' }}>
                <Github size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#f0f6fc' }} />
                <input type="text" className="input-field" style={{ paddingLeft: 38 }} placeholder="github.com/username"
                  value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Save Button Visibility - only on mobile or as a snackbar if needed, but we have it at top */}
    </motion.div>
  );
}
