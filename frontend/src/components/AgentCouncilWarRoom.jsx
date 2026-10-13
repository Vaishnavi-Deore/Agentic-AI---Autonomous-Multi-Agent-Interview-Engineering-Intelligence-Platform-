import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Terminal, 
  CheckCircle2, 
  Cpu, 
  Award, 
  Sparkles, 
  RefreshCw,
  ChevronRight,
  Flame,
  Brain
} from 'lucide-react';

export default function AgentCouncilWarRoom({
  councilData,
  factCheckData,
  reactTrace,
  onTriggerReDebate,
  isThinking
}) {
  const [activeStepTab, setActiveStepTab] = useState(0);

  if (!councilData && !factCheckData) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Users size={36} color="#38bdf8" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Agent Council Standing By</h3>
        <p style={{ fontSize: '0.85rem' }}>
          Submit an answer in the chat or click "Trigger Council Deliberation" to convene the 5-agent executive committee.
        </p>
      </div>
    );
  }

  const dialogue = councilData?.dialogue || [];
  const consensusPct = councilData?.consensus_pct || 75;
  const consensusStatus = councilData?.consensus_status || 'CONSENSUS IN PROGRESS';
  const leadSpeaker = councilData?.lead_speaker || 'Alex Vance';
  const steps = reactTrace?.steps || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', overflowY: 'auto' }}>
      {/* Council Executive Banner */}
      <div className="glass-panel" style={{ 
        padding: '1.25rem', 
        borderLeft: '4px solid #00f2fe',
        background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(121, 40, 202, 0.08) 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Users size={18} color="#00f2fe" />
              <span style={{ fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#00f2fe', fontWeight: 700 }}>
                Executive Bar Raiser Council Swarm
              </span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              Multi-Agent Deliberation Chamber
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Lead Interrogator for Round: <strong style={{ color: '#fff' }}>{leadSpeaker}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>COMMITTEE ALIGNMENT</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: consensusPct >= 80 ? '#10b981' : '#f59e0b' }}>
                {consensusPct}%
              </div>
            </div>
            <div style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: consensusPct >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${consensusPct >= 80 ? '#10b981' : '#f59e0b'}`,
              color: consensusPct >= 80 ? '#10b981' : '#f59e0b'
            }}>
              {consensusStatus}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Agent Deliberation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
          AGENT COMMITTEE TRANSCRIPT & INDIVIDUAL CRITIQUES
        </div>

        {dialogue.map((agent, idx) => (
          <div 
            key={idx}
            className="glass-panel"
            style={{ 
              padding: '1rem',
              borderLeft: `3px solid ${agent.color}`,
              background: 'rgba(14, 20, 38, 0.65)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `${agent.color}22`,
                  border: `1px solid ${agent.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: agent.color
                }}>
                  {agent.speaker[0]}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                    {agent.speaker}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: agent.color }}>
                    {agent.role}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#94a3b8',
                  fontWeight: 600
                }}>
                  Score: {agent.score}/100
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  background: `${agent.color}15`,
                  border: `1px solid ${agent.color}40`,
                  color: agent.color,
                  fontWeight: 700
                }}>
                  {agent.verdict}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.55', fontStyle: 'italic' }}>
              "{agent.text}"
            </p>
          </div>
        ))}
      </div>

      {/* Fact-Checker & Technical Grounding Panel */}
      {factCheckData && (
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#00f2fe" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                Technical Fact-Checking & Anti-Pattern Inspector (Dr. Vera Cross)
              </span>
            </div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: factCheckData.accuracy_score >= 80 ? '#10b981' : '#f59e0b',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(0,0,0,0.3)'
            }}>
              Accuracy: {factCheckData.accuracy_score}%
            </div>
          </div>

          {factCheckData.flags && factCheckData.flags.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {factCheckData.flags.map((flag, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  fontSize: '0.78rem',
                  color: '#fecdd3'
                }}>
                  <AlertTriangle size={15} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.78rem',
              color: '#a7f3d0',
              marginBottom: '0.75rem'
            }}>
              <CheckCircle2 size={15} color="#10b981" />
              <span>Zero technical hallucinations or critical anti-patterns detected. Sound grounding.</span>
            </div>
          )}

          {factCheckData.positive_citations && factCheckData.positive_citations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>VERIFIED PRODUCTION GROUNDINGS:</div>
              {factCheckData.positive_citations.map((cite, i) => (
                <div key={i} style={{ fontSize: '0.75rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#10b981' }}>✔</span> {cite}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Autonomous ReAct Tool Execution Trace */}
      {steps.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={17} color="#a855f7" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                Autonomous ReAct Tool-Use Trace
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {steps.length} Sequenced Tool Actions
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {steps.map((step, idx) => (
              <div 
                key={idx}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: '#a855f725',
                      color: '#c084fc',
                      border: '1px solid #a855f750'
                    }}>
                      STEP {step.step}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#00f2fe' }}>
                      {step.action}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>{step.status}</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem', lineHeight: '1.4' }}>
                  <strong style={{ color: '#e2e8f0' }}>Thought:</strong> {step.thought}
                </div>

                <div style={{ 
                  fontSize: '0.72rem', 
                  color: '#cbd5e1', 
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '0.4rem 0.6rem', 
                  borderRadius: '4px',
                  borderLeft: '2px solid #a855f7'
                }}>
                  <strong style={{ color: '#a855f7' }}>Obs:</strong> {step.observation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
