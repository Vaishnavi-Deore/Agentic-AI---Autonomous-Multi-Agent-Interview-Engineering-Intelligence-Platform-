import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  AlertOctagon, 
  Activity, 
  Terminal, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  ShieldAlert,
  Zap,
  Server
} from 'lucide-react';
import { api } from '../services/api';

export default function ChaosIncidentSimulator({ activeIncident, onIncidentUpdated }) {
  const [incident, setIncident] = useState(activeIncident);
  const [selectedAction, setSelectedAction] = useState(null);
  const [rationale, setRationale] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [triageFeedback, setTriageFeedback] = useState(null);

  useEffect(() => {
    if (activeIncident) {
      setIncident(activeIncident);
      setSelectedAction(null);
      setTriageFeedback(null);
    }
  }, [activeIncident]);

  const handleTriggerNewIncident = async () => {
    try {
      const res = await api.triggerChaosIncident();
      if (res.incident) {
        setIncident(res.incident);
        setSelectedAction(null);
        setTriageFeedback(null);
        if (onIncidentUpdated) onIncidentUpdated(res.incident);
      }
    } catch (err) {
      alert(`Failed to trigger incident: ${err.message}`);
    }
  };

  const handleExecuteTriage = async () => {
    if (!selectedAction) {
      alert('Please select a mitigation action command first.');
      return;
    }
    setIsExecuting(true);
    try {
      const res = await api.triageChaosIncident(selectedAction, rationale);
      setTriageFeedback(res);
      if (res.updated_incident) {
        setIncident(res.updated_incident);
        if (onIncidentUpdated) onIncidentUpdated(res.updated_incident);
      }
    } catch (err) {
      alert(`Error executing triage: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!incident) {
    return (
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Flame size={40} color="#f43f5e" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Production Chaos Incident Simulator</h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
          Simulates live production outages (Split-Brain, Consumer Lag, Vector OOM) to test your incident command and architectural triage abilities.
        </p>
        <button className="btn btn-primary" onClick={handleTriggerNewIncident}>
          <Zap size={14} />
          <span>Inject Chaos Engineering Anomaly (SEV-1)</span>
        </button>
      </div>
    );
  }

  const curr = incident.current_metrics || {};
  const isRecovered = incident.status === 'RECOVERED';
  const isFiring = incident.status === 'FIRING';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', overflowY: 'auto' }}>
      {/* Incident Header HUD */}
      <div className="glass-panel" style={{
        padding: '1.25rem',
        borderLeft: `4px solid ${isRecovered ? '#10b981' : '#f43f5e'}`,
        background: isRecovered 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 20, 38, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(14, 20, 38, 0.8) 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <ShieldAlert size={16} color={isRecovered ? '#10b981' : '#f43f5e'} />
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: isRecovered ? '#10b981' : '#f43f5e',
                letterSpacing: '1px'
              }}>
                {incident.severity} &bull; SERVICE: {incident.service?.toUpperCase()}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              {incident.title}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.35rem', maxWidth: '640px' }}>
              {incident.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              background: isRecovered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              border: `1px solid ${isRecovered ? '#10b981' : '#f43f5e'}`,
              color: isRecovered ? '#10b981' : '#f43f5e',
              animation: isFiring ? 'pulseGlow 2s infinite' : 'none'
            }}>
              {incident.status}
            </span>

            <button 
              className="btn btn-secondary" 
              onClick={handleTriggerNewIncident}
              title="Inject another incident scenario"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
            >
              <RotateCcw size={13} />
              <span>Next Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Dials */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>P99 LATENCY</div>
          <div style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            color: curr.p99_latency_ms > 200 ? '#f43f5e' : '#10b981' 
          }}>
            {curr.p99_latency_ms}ms
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>SLA limit: 100ms</div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>ERROR RATE</div>
          <div style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            color: curr.error_rate_pct > 1.0 ? '#f43f5e' : '#10b981' 
          }}>
            {curr.error_rate_pct}%
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Normal: &lt;0.05%</div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRAFFIC (QPS)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
            {curr.qps?.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Peak load</div>
        </div>

        <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLUSTER CPU</div>
          <div style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            color: curr.cpu_load_pct > 80 ? '#f59e0b' : '#10b981' 
          }}>
            {curr.cpu_load_pct}%
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>Capacity bound</div>
        </div>
      </div>

      {/* Live Server Log Stream */}
      <div className="glass-panel" style={{ padding: '1rem', background: '#05070f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <Terminal size={15} color="#00f2fe" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
            PRODUCTION LOG STREAM & ALERT TRACE (LIVE)
          </span>
        </div>

        <div style={{
          maxHeight: '140px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.73rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          color: '#cbd5e1'
        }}>
          {incident.logs?.map((line, idx) => {
            let color = '#cbd5e1';
            if (line.includes('[CRITICAL]')) color = '#f43f5e';
            else if (line.includes('[ERROR]')) color = '#fb7185';
            else if (line.includes('[WARN]')) color = '#f59e0b';
            else if (line.includes('[COMMAND]')) color = '#38bdf8';
            else if (line.includes('[RECOVERY]')) color = '#10b981';

            return (
              <div key={idx} style={{ color, wordBreak: 'break-all' }}>
                {line}
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident Triage & Mitigation Options */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
          INCIDENT COMMAND: SELECT MITIGATION RUNBOOK
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {incident.available_actions?.map(action => (
            <label
              key={action.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: selectedAction === action.id ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${selectedAction === action.id ? '#00f2fe' : 'rgba(255, 255, 255, 0.08)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input 
                type="radio" 
                name="triage-action"
                checked={selectedAction === action.id}
                onChange={() => setSelectedAction(action.id)}
                style={{ accentColor: '#00f2fe' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: selectedAction === action.id ? '#fff' : '#cbd5e1' }}>
                {action.label}
              </span>
            </label>
          ))}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Engineering Rationale & Blast Radius Assessment (Optional, evaluated for Staff-score):
          </div>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Explain why this command mitigates the cascade, protects upstream caller SLAs, and avoids split-brain..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.8rem',
              resize: 'none'
            }}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleExecuteTriage}
          disabled={isExecuting || !selectedAction}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Play size={14} />
          <span>{isExecuting ? 'Executing Incident Command...' : 'Execute Mitigation Command'}</span>
        </button>

        {/* Triage Outcome Feedback */}
        {triageFeedback && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '8px',
            background: triageFeedback.status === 'RECOVERED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            border: `1px solid ${triageFeedback.status === 'RECOVERED' ? '#10b981' : '#f43f5e'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ 
                fontWeight: 700, 
                fontSize: '0.85rem', 
                color: triageFeedback.status === 'RECOVERED' ? '#10b981' : '#f43f5e' 
              }}>
                {triageFeedback.status === 'RECOVERED' ? 'Incident Successfully Mitigated!' : 'Triage Command Failed!'}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                Score: {triageFeedback.score}/100
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              {triageFeedback.critique}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
