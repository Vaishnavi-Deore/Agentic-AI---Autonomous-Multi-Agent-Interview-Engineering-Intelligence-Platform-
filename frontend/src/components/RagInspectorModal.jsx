import React, { useState, useEffect } from 'react';
import { X, Database, Search, FileCode, CheckCircle, Cpu, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function RagInspectorModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeCollection, setActiveCollection] = useState('questions_bank');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.inspectVectorDB()
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const collections = data?.collections || {};
  const activeColData = collections[activeCollection] || { total_chunks: 0, sample_chunks: [] };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '850px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,242,254,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={18} color="#00f2fe" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
                Vector Database & RAG Telemetry Inspector
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Inspect real-time vector collections, dense embeddings, and semantic chunks.
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

        {/* Collection Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
          {Object.keys(collections).map(colName => (
            <button
              key={colName}
              onClick={() => setActiveCollection(colName)}
              className={`btn ${activeCollection === colName ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
            >
              <Layers size={13} />
              <span>{colName} ({collections[colName]?.total_chunks || 0} chunks)</span>
            </button>
          ))}
        </div>

        {/* Profile Card if Resume collection is active */}
        {data?.resume_profile && (
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399' }}>
                Extracted Candidate Vector Metadata
              </span>
              <span style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>
                {data.resume_profile.email || 'jordan.chen@example.com'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
              {(data.resume_profile.skills || []).map((skill, sIdx) => (
                <span
                  key={sIdx}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#a7f3d0',
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sample Chunks in Active Collection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
          {activeColData.sample_chunks && activeColData.sample_chunks.length > 0 ? (
            activeColData.sample_chunks.map((chunk, cIdx) => (
              <div 
                key={cIdx}
                style={{
                  background: '#070a14',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#00f2fe' }}>
                    Doc ID: {chunk.doc_id}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
                    Cosine Vector Indexed
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  {chunk.text_snippet}
                </p>
                {chunk.metadata && Object.keys(chunk.metadata).length > 0 && (
                  <div style={{ marginTop: '0.45rem', fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                    <strong>Metadata:</strong> {JSON.stringify(chunk.metadata)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem' }}>
              No chunks indexed in this collection yet. Launch a session to populate vectors.
            </p>
          )}
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
