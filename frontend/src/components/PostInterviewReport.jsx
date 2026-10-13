import React, { useEffect } from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Calendar, Download, RefreshCw, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PostInterviewReport({ report, isOpen, onClose, onRestart }) {
  useEffect(() => {
    if (isOpen && (report?.verdict === 'STRONG HIRE' || report?.verdict === 'HIRE')) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen, report]);

  if (!isOpen || !report) return null;

  const isHire = report.verdict === 'STRONG HIRE' || report.verdict === 'HIRE';
  const verdictColor = report.verdict === 'STRONG HIRE' ? '#10b981' : (report.verdict === 'HIRE' ? '#00f2fe' : (report.verdict === 'LEANING HIRE' ? '#f59e0b' : '#f43f5e'));

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PrepMind_Interview_Report_${report.candidate_name || 'Candidate'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '880px', padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="brand-tag">EXECUTIVE CANDIDATE DEBRIEF</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                PrepMind Autonomous Multi-Agent Synthesis
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#fff', margin: 0 }}>
              {report.candidate_name || 'Candidate'} — Candidate Scorecard
            </h1>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Verdict Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: `${verdictColor}15`,
          border: `1.5px solid ${verdictColor}`,
          borderRadius: '12px',
          padding: '1.25rem 1.75rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: verdictColor, fontWeight: 700 }}>
              DECISION VERDICT
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: verdictColor, fontFamily: 'var(--font-display)' }}>
              {report.verdict || 'HIRE'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              {report.readiness_summary}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>FINAL ELO RATING</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              {report.final_elo || 1500}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#fef3c7' }}>
              Tier: <strong>{report.tier || 'Mid-Level'}</strong>
            </div>
          </div>
        </div>

        {/* 5-Axis Score Breakdown */}
        {report.radar_scores && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.65rem', marginBottom: '1.5rem' }}>
            {Object.entries(report.radar_scores).filter(([k]) => k !== 'overall').map(([key, val]) => (
              <div 
                key={key}
                style={{
                  background: '#070a14',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '0.75rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: '0.2rem' }}>
                  {key.replace('_', ' ')}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>
                  {val}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Strengths & Growth Areas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} />
              <span>KEY IDENTIFIED STRENGTHS</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(report.top_strengths || []).map((st, i) => (
                <li key={i}>{st}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', color: '#f43f5e', fontWeight: 700, fontSize: '0.85rem' }}>
              <AlertTriangle size={16} />
              <span>CRITICAL GAPS & GROWTH AREAS</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(report.key_growth_areas || []).map((ga, i) => (
                <li key={i}>{ga}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 7-Day Targeted Roadmap */}
        {report.seven_day_roadmap && report.seven_day_roadmap.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.88rem' }}>
              <Calendar size={16} />
              <span>PERSONALIZED 7-DAY TARGETED ACTION PLAN</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
              {report.seven_day_roadmap.map((plan, pIdx) => (
                <div 
                  key={pIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    background: '#070a14',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '0.6rem 0.85rem'
                  }}
                >
                  <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    {plan.day}
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: '#fff', display: 'block' }}>
                      {plan.focus}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {plan.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button className="btn btn-secondary" onClick={handleExportJson} style={{ fontSize: '0.78rem' }}>
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button className="btn btn-secondary" onClick={handlePrint} style={{ fontSize: '0.78rem' }}>
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button className="btn btn-primary" onClick={onRestart}>
              <RefreshCw size={14} />
              <span>Start New Round</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
