import React from 'react';
import { 
  GitMerge, 
  Database, 
  Users, 
  UserCheck, 
  User, 
  ShieldCheck, 
  SearchCode, 
  Terminal, 
  Flame, 
  Sliders, 
  FileCheck2, 
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';

const AGENT_NODES = [
  { id: 'SUPERVISOR', label: 'Supervisor', role: 'State Machine', icon: GitMerge, color: '#38bdf8' },
  { id: 'RAG_RETRIEVER', label: 'RAG Vector Store', role: 'Cosine Search', icon: Database, color: '#00f2fe' },
  { id: 'COUNCIL_SWARM', label: 'Council Swarm', role: '5-Agent Committee', icon: Users, color: '#38bdf8' },
  { id: 'INTERVIEWER', label: 'Interviewer Lead', role: 'Persona Probe', icon: UserCheck, color: '#a855f7' },
  { id: 'CANDIDATE', label: 'Candidate', role: 'Voice / Code', icon: User, color: '#34d399' },
  { id: 'FACT_CHECKER', label: 'Fact-Checker', role: 'Grounding Agent', icon: ShieldCheck, color: '#00f2fe' },
  { id: 'EVALUATOR', label: 'Reflexion Critic', role: 'Rubric Vector', icon: SearchCode, color: '#f43f5e' },
  { id: 'REACT_TOOLS', label: 'ReAct Tools', role: 'Tool Sandbox', icon: Terminal, color: '#c084fc' },
  { id: 'CHAOS_ENGINE', label: 'Chaos Monkey', role: 'Live Incident', icon: Flame, color: '#fb7185' },
  { id: 'DIFFICULTY_TUNER', label: 'Difficulty Tuner', role: 'Adaptive ELO', icon: Sliders, color: '#f59e0b' },
  { id: 'REPORTER', label: 'Debrief Reporter', role: 'Action Roadmap', icon: FileCheck2, color: '#10b981' },
];

export default function AgentTelemetryGraph({ 
  telemetry = [], 
  activeNode = 'SUPERVISOR',
  onInspectNode
}) {
  const latestEvent = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const currentActive = latestEvent ? latestEvent.node : activeNode;

  return (
    <div className="agent-pipeline-container glass-panel">
      <div className="pipeline-header">
        <div className="pipeline-title">
          <Activity size={18} color="#00f2fe" />
          <span>AUTONOMOUS AGENT ORCHESTRATION PIPELINE (LIVE SWARM GRAPH)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>💡 Click any node to inspect memory & logs</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="live-dot" />
            <span>Active State: <strong style={{ color: '#00f2fe' }}>{currentActive}</strong></span>
          </div>
        </div>
      </div>

      <div className="pipeline-flow" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {AGENT_NODES.map((node, index) => {
          const Icon = node.icon;
          const isActive = currentActive === node.id;
          return (
            <React.Fragment key={node.id}>
              <div 
                className={`agent-node ${isActive ? 'active' : ''}`}
                onClick={() => onInspectNode && onInspectNode(node.id)}
                title={`Click to inspect ${node.label} (${node.role})`}
                style={{
                  borderColor: isActive ? node.color : undefined,
                  boxShadow: isActive ? `0 0 16px ${node.color}66` : undefined,
                  minWidth: '130px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.15s ease, border-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = `${node.color}88`;
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: `${node.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={14} color={node.color} />
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: isActive ? '#fff' : '#cbd5e1' }}>
                    {node.label}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-faint)' }}>
                    {node.role}
                  </div>
                </div>
              </div>

              {index < AGENT_NODES.length - 1 && (
                <ArrowRight size={13} className="node-arrow" style={{ opacity: 0.6 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="telemetry-ticker">
        <span style={{ color: '#00f2fe', fontWeight: 700 }}>[TELEMETRY]</span>
        <span style={{ color: '#94a3b8' }}>
          {latestEvent ? `${latestEvent.timestamp} - ${latestEvent.message}` : 'Swarm active. Ready for candidate input...'}
        </span>
      </div>
    </div>
  );
}
