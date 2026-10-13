import React, { useState } from 'react';
import { X, Sparkles, Brain, Layers, Network, UserCheck, FileText, Check } from 'lucide-react';

const TRACK_ICONS = {
  ai_agentic: Brain,
  fullstack_swe: Layers,
  system_design: Network,
  behavioral_star: UserCheck,
};

export default function SetupModal({
  isOpen,
  onClose,
  sampleData,
  onStartSession,
  currentTrack = 'ai_agentic',
  currentPersona = 'alex'
}) {
  const [selectedTrack, setSelectedTrack] = useState(currentTrack);
  const [selectedPersona, setSelectedPersona] = useState(currentPersona);
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState(
    'Staff / Senior Engineer position. Responsibilities include architecting high-scale distributed systems, RAG workflows, vector retrieval pipelines, and leading complex cross-functional technical initiatives. Minimum 5+ years shipping production software.'
  );

  if (!isOpen) return null;

  const tracks = sampleData?.tracks || [];
  const personas = sampleData?.personas || [];
  const resumes = sampleData?.sample_resumes || {};

  const handleLoadSampleResume = (key) => {
    const r = resumes[key];
    if (!r) return;
    const text = [
      `Name: ${r.name} - ${r.title}`,
      `Summary: ${r.summary}`,
      `Skills: ${r.skills.join(', ')}`,
      ...r.experience.map(e => `Role: ${e.role} at ${e.company} (${e.duration})\n` + e.highlights.map(h => `  * ${h}`).join('\n'))
    ].join('\n\n');
    setResumeText(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartSession({
      track: selectedTrack,
      persona: selectedPersona,
      resume_data: resumeText.trim() || undefined,
      jd_text: jdText.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#fff' }}>
              Configure Interview Simulation
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Select your interview track, interviewer persona, and ingest resume into RAG vector memory.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Step 1: Select Track */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '0.5rem' }}>
              1. CHOOSE INTERVIEW TRACK
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
              {tracks.map(t => {
                const Icon = TRACK_ICONS[t.id] || Brain;
                const isSelected = selectedTrack === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTrack(t.id)}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? '#00f2fe' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Icon size={16} color={isSelected ? '#00f2fe' : '#94a3b8'} />
                      <strong style={{ fontSize: '0.85rem', color: isSelected ? '#fff' : '#cbd5e1' }}>
                        {t.title}
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                      {t.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Interviewer Persona */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#a855f7', display: 'block', marginBottom: '0.5rem' }}>
              2. SELECT INTERVIEWER PERSONA
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
              {personas.map(p => {
                const isSelected = selectedPersona === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? '#a855f7' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#fff' : '#cbd5e1' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginBottom: '0.2rem' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {p.style}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Ingest Candidate Resume (RAG Vector Store) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>
                3. CANDIDATE RESUME (VECTOR MEMORY)
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleLoadSampleResume('ai_engineer')}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
                >
                  <FileText size={12} />
                  <span>AI Engineer Resume</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleLoadSampleResume('fullstack_engineer')}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
                >
                  <FileText size={12} />
                  <span>Full-Stack Resume</span>
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste candidate resume or click buttons above to auto-load rich sample profile..."
              style={{
                width: '100%',
                background: '#070a14',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#e2e8f0',
                padding: '0.75rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-launch-session">
              <Sparkles size={16} />
              <span>Launch Autonomous Interview Round</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
