import React, { useState, useEffect } from 'react';
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  X, 
  FileText,
  Briefcase
} from 'lucide-react';
import { api } from '../services/api';

export default function ResumeJdGapModal({
  isOpen,
  onClose,
  sampleResumes = {},
  onSelectTailoredQuestion
}) {
  const [resumeKey, setResumeKey] = useState('ai_engineer');
  const [jdText, setJdText] = useState('Senior AI & Distributed Systems Engineer. Lead production multi-agent architectures, hybrid RAG with reciprocal rank fusion, vector database sharding, and high-availability disaster recovery.');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleAnalyze();
    }
  }, [isOpen]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const activeResume = sampleResumes[resumeKey] || sampleResumes.ai_engineer;
      const res = await api.analyzeResumeJdGap(activeResume, jdText);
      setAnalysis(res);
    } catch (err) {
      console.error('Failed to run gap analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '840px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Target size={22} color="#00f2fe" />
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                Resume & Job Description Semantic Gap Radar
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Vector similarity matching candidate competencies against target job requirements
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '0.4rem' }}>
                CANDIDATE RESUME PROFILE
              </label>
              <select
                value={resumeKey}
                onChange={(e) => setResumeKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.78rem'
                }}
              >
                {Object.keys(sampleResumes).map(k => (
                  <option key={k} value={k} style={{ background: '#0a0e1e', color: '#fff' }}>
                    {sampleResumes[k].name} ({sampleResumes[k].title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', display: 'block', marginBottom: '0.4rem' }}>
                TARGET JOB DESCRIPTION (JD)
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.78rem',
                  resize: 'none'
                }}
              />
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleAnalyze} 
            disabled={isLoading} 
            style={{ alignSelf: 'flex-start', padding: '0.45rem 1rem', fontSize: '0.78rem' }}
          >
            <Sparkles size={14} />
            <span>{isLoading ? 'Computing Vector Overlap...' : 'Run Semantic Gap Radar'}</span>
          </button>

          {analysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Score Header */}
              <div className="glass-panel" style={{
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 242, 254, 0.06)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CANDIDATE: {analysis.candidate_name}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    Target Role Alignment: {analysis.overall_match_pct}%
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                    {analysis.summary}
                  </div>
                </div>

                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: analysis.overall_match_pct >= 80 ? '#10b981' : '#f59e0b',
                  textAlign: 'right'
                }}>
                  {analysis.overall_match_pct >= 80 ? 'STRONG FIT' : 'GAP FLAGGED'}
                </div>
              </div>

              {/* Matched vs Gaps Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Verified Competencies */}
                <div className="glass-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                      Verified Competencies ({analysis.matched_competencies?.length})
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {analysis.matched_competencies?.map((comp, idx) => (
                      <div key={idx} style={{
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ fontWeight: 600, color: '#a7f3d0' }}>{comp.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Match Confidence: {comp.confidence_pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blindspots & Gaps */}
                <div className="glass-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                    <AlertTriangle size={16} color="#f59e0b" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                      Identified Blindspots ({analysis.skill_gaps?.length})
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {analysis.skill_gaps?.map((gap, idx) => (
                      <div key={idx} style={{
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ fontWeight: 600, color: '#fde68a' }}>{gap.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>{gap.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tailored Custom Questions */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '0.65rem' }}>
                  AI-SYNTHESIZED TARGETED QUESTIONS (DESIGNED TO TEST IDENTIFIED GAPS)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {analysis.tailored_challenges?.map(q => (
                    <div 
                      key={q.id}
                      className="glass-panel"
                      style={{
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        borderLeft: '3px solid #00f2fe',
                        borderRadius: '6px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00f2fe' }}>
                            {q.topic}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            [{q.difficulty}]
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                          {q.question}
                        </p>
                      </div>

                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (onSelectTailoredQuestion) onSelectTailoredQuestion(q);
                          onClose();
                        }}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                      >
                        <span>Launch Drill</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
