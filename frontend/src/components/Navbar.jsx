import React from 'react';
import { Sparkles, Database, Settings, RefreshCw, Award, Bot, Cpu, Target, Flame, Users } from 'lucide-react';

export default function Navbar({
  sessionData,
  onOpenSetup,
  onOpenVectorInspector,
  onOpenSettings,
  onOpenGapAnalyzer,
  onFinishSession,
  provider,
  elo,
  tier,
  trackTitle,
  activeIncident,
  councilMode
}) {
  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="brand-logo-icon">
          <Bot size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="brand-title">PrepMind AI</span>
            <span className="brand-tag">AGENTIC 2.0 SWARM</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Autonomous Multi-Agent Interview Intelligence & Chaos Simulator
          </span>
        </div>
      </div>

      <div className="nav-status-group">
        <div className="hud-badge">
          <Cpu size={14} color="#00f2fe" />
          <span>Track:</span>
          <strong style={{ color: '#00f2fe' }}>{trackTitle || 'AI & Agentic'}</strong>
        </div>

        <div className="hud-badge elo">
          <Award size={14} />
          <span>ELO:</span>
          <strong>{elo || 1500}</strong>
          <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>({tier || 'Mid-Level'})</span>
        </div>

        <div className="hud-badge provider">
          <Sparkles size={14} />
          <span>Engine:</span>
          <strong style={{ textTransform: 'capitalize' }}>{provider || 'Built-in'}</strong>
        </div>

        {/* Resume & JD Gap Radar */}
        <button
          className="btn btn-secondary"
          onClick={onOpenGapAnalyzer}
          title="Analyze Resume & Job Description Semantic Match"
          id="btn-gap-radar"
          style={{ borderColor: '#00f2fe', color: '#00f2fe' }}
        >
          <Target size={14} />
          <span>Gap Radar</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenVectorInspector}
          title="Inspect RAG Vector Collections & Embeddings"
          id="btn-inspect-vector"
        >
          <Database size={15} color="#00f2fe" />
          <span>Vector DB</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenSettings}
          title="Configure LLM Provider & API Keys"
          id="btn-settings"
        >
          <Settings size={15} />
        </button>

        <button
          className="btn btn-outline-cyan"
          onClick={onOpenSetup}
          title="Start or Restart Session"
          id="btn-new-session"
        >
          <RefreshCw size={14} />
          <span>New Round</span>
        </button>

        {sessionData && (
          <button
            className="btn btn-accent"
            onClick={onFinishSession}
            id="btn-finish-debrief"
          >
            <Award size={15} />
            <span>Finish & Debrief</span>
          </button>
        )}
      </div>
    </header>
  );
}
