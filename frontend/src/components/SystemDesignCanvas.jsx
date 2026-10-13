import React, { useState } from 'react';
import { 
  Network, 
  Server, 
  Database, 
  Globe, 
  Layers, 
  Cpu, 
  Shield, 
  HardDrive, 
  Calculator,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

const AVAILABLE_BLOCKS = [
  { id: 'cdn', name: 'Global CDN / Edge', category: 'Edge', icon: Globe, color: '#38bdf8' },
  { id: 'gateway', name: 'API Gateway & Rate Limiter', category: 'Ingress', icon: Shield, color: '#00f2fe' },
  { id: 'service', name: 'Microservice Cluster', category: 'Compute', icon: Cpu, color: '#a855f7' },
  { id: 'redis', name: 'Redis Cache Cluster', category: 'Cache', icon: Server, color: '#f59e0b' },
  { id: 'db', name: 'Sharded SQL / NoSQL DB', category: 'Storage', icon: Database, color: '#10b981' },
  { id: 'kafka', name: 'Kafka Event Stream', category: 'Queue', icon: Layers, color: '#ec4899' },
  { id: 's3', name: 'S3 Blob Storage', category: 'Storage', icon: HardDrive, color: '#6366f1' },
];

export default function SystemDesignCanvas({ activeQuestion }) {
  const [selectedBlocks, setSelectedBlocks] = useState(['cdn', 'gateway', 'service', 'redis', 'db']);
  const [qps, setQps] = useState(15000);
  const [objectSizeKb, setObjectSizeKb] = useState(2);
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const toggleBlock = (blockId) => {
    setSelectedBlocks(prev => 
      prev.includes(blockId) ? prev.filter(b => b !== blockId) : [...prev, blockId]
    );
  };

  // Back of the envelope math
  const dailyRequests = qps * 86400;
  const storagePerDayGb = ((dailyRequests * objectSizeKb) / (1024 * 1024)).toFixed(2);
  const bandwidthGbps = (((qps * objectSizeKb * 8) / (1024 * 1024))).toFixed(2);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await api.auditArchitecture(selectedBlocks, qps, objectSizeKb);
      setAuditResult(res);
    } catch (err) {
      alert(`Architecture audit failed: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Network size={16} color="#00f2fe" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
            System Architecture Whiteboard & SPOF Inspector
          </span>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleRunAudit}
          disabled={isAuditing}
          style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
        >
          <Sparkles size={13} />
          <span>{isAuditing ? 'Auditing Topology...' : 'AI Architecture Audit'}</span>
        </button>
      </div>

      {/* Available Palette */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
        {AVAILABLE_BLOCKS.map(block => {
          const Icon = block.icon;
          const isSelected = selectedBlocks.includes(block.id);
          return (
            <button
              key={block.id}
              onClick={() => toggleBlock(block.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: isSelected ? `${block.color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isSelected ? block.color : 'rgba(255,255,255,0.1)'}`,
                color: isSelected ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={13} color={isSelected ? block.color : '#94a3b8'} />
              <span>{block.name}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Topology Graph */}
      <div style={{
        background: '#05070f',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.75rem',
        minHeight: '150px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ padding: '0.5rem 0.8rem', background: '#1e293b', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
            User Clients (Web / Mobile)
          </div>
          <span style={{ color: '#00f2fe' }}>➔</span>

          {selectedBlocks.map((bId, idx) => {
            const block = AVAILABLE_BLOCKS.find(b => b.id === bId);
            if (!block) return null;
            const Icon = block.icon;
            return (
              <React.Fragment key={bId}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '6px',
                  background: `${block.color}18`,
                  border: `1px solid ${block.color}`,
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  boxShadow: `0 0 12px ${block.color}25`
                }}>
                  <Icon size={14} color={block.color} />
                  <span>{block.name}</span>
                </div>
                {idx < selectedBlocks.length - 1 && (
                  <span style={{ color: '#00f2fe', fontSize: '0.8rem' }}>➔</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.5rem' }}>
          Active Flow: Ingress &bull; Caching &bull; Decoupled Workers &bull; Persistent Storage
        </div>
      </div>

      {/* AI Architecture Audit Results */}
      {auditResult && (
        <div className="glass-panel" style={{
          padding: '1rem',
          borderLeft: `4px solid ${auditResult.resilience_score >= 80 ? '#10b981' : '#f59e0b'}`,
          background: 'rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldCheck size={16} color={auditResult.resilience_score >= 80 ? '#10b981' : '#f59e0b'} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                AI Architectural Audit Verdict: {auditResult.verdict}
              </span>
            </div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: auditResult.resilience_score >= 80 ? '#10b981' : '#f59e0b',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.06)'
            }}>
              Rating: {auditResult.resilience_score}/100
            </div>
          </div>

          {auditResult.findings && auditResult.findings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.65rem' }}>
              {auditResult.findings.map((f, i) => (
                <div key={i} style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  fontSize: '0.73rem',
                  color: '#fecdd3'
                }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f43f5e' }}>
                    <AlertTriangle size={13} />
                    <span>[{f.type}] {f.title}</span>
                  </div>
                  <div style={{ marginTop: '0.2rem', color: '#e2e8f0' }}>{f.detail}</div>
                </div>
              ))}
            </div>
          )}

          {auditResult.positive_patterns && auditResult.positive_patterns.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>RECOGNIZED RESILIENCE PATTERNS:</div>
              {auditResult.positive_patterns.map((p, i) => (
                <div key={i} style={{ fontSize: '0.73rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={12} color="#10b981" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Back of the Envelope Capacity Estimator */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Calculator size={15} color="#00f2fe" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
            Back-of-the-Envelope Capacity Estimator
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Target Traffic (QPS): <strong style={{ color: '#00f2fe' }}>{qps.toLocaleString()}</strong>
            </label>
            <input 
              type="range" 
              min="1000" 
              max="100000" 
              step="1000"
              value={qps}
              onChange={(e) => setQps(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#00f2fe' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
              Payload Object Size (KB): <strong style={{ color: '#00f2fe' }}>{objectSizeKb} KB</strong>
            </label>
            <input 
              type="range" 
              min="0.5" 
              max="50" 
              step="0.5"
              value={objectSizeKb}
              onChange={(e) => setObjectSizeKb(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#00f2fe' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>DAILY REQUESTS</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
              {(dailyRequests / 1000000).toFixed(1)}M / day
            </div>
          </div>
          <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>STORAGE INGEST</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a855f7' }}>
              {storagePerDayGb} GB / day
            </div>
          </div>
          <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>BANDWIDTH REQUIRED</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
              {bandwidthGbps} Gbps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
