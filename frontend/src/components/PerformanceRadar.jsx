import React from 'react';
import { Target, CheckCircle, XCircle, TrendingUp, Award } from 'lucide-react';

export default function PerformanceRadar({ 
  scores = { problem_solving: 80, technical_depth: 78, communication: 85, architecture: 82, cultural_fit: 88, overall: 82 },
  rubricAlignment = null,
  elo = 1500,
  tier = 'Mid-Level'
}) {
  const dimensions = [
    { key: 'problem_solving', label: 'Problem Solving', value: scores.problem_solving || 75 },
    { key: 'technical_depth', label: 'Technical Depth', value: scores.technical_depth || 75 },
    { key: 'communication', label: 'Communication', value: scores.communication || 75 },
    { key: 'architecture', label: 'Architecture', value: scores.architecture || 75 },
    { key: 'cultural_fit', label: 'Culture & STAR', value: scores.cultural_fit || 75 },
  ];

  // SVG Radar polygon math (center: 150, 150; max radius: 100)
  const cx = 150;
  const cy = 135;
  const r = 95;
  const angleStep = (Math.PI * 2) / dimensions.length;

  const points = dimensions.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const distance = (dim.value / 100) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Grid concentric rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Competency Spider Chart */}
      <div style={{ background: '#060913', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
            <Target size={15} />
            <span>REAL-TIME COMPETENCY RADAR</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>
            <Award size={13} />
            <span>{elo} ELO ({tier})</span>
          </div>
        </div>

        <svg className="radar-svg" viewBox="0 0 300 270">
          {/* Background web rings */}
          {rings.map((ring, ringIdx) => {
            const ringPts = dimensions.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const distance = ring * r;
              return `${cx + distance * Math.cos(angle)},${cy + distance * Math.sin(angle)}`;
            }).join(' ');
            return (
              <polygon
                key={ringIdx}
                points={ringPts}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Axes lines */}
          {dimensions.map((dim, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x2 = cx + r * Math.cos(angle);
            const y2 = cy + r * Math.sin(angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
              />
            );
          })}

          {/* Candidate score polygon */}
          <polygon
            points={points}
            fill="rgba(0, 242, 254, 0.25)"
            stroke="#00f2fe"
            strokeWidth="2.5"
          />

          {/* Dimension vertex dots & labels */}
          {dimensions.map((dim, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const distance = (dim.value / 100) * r;
            const dotX = cx + distance * Math.cos(angle);
            const dotY = cy + distance * Math.sin(angle);
            
            // Label placement slightly outside max radius
            const labelDist = r + 24;
            const labelX = cx + labelDist * Math.cos(angle);
            const labelY = cy + labelDist * Math.sin(angle);

            return (
              <g key={i}>
                <circle cx={dotX} cy={dotY} r="4" fill="#00f2fe" stroke="#fff" strokeWidth="1.5" />
                <text
                  x={labelX}
                  y={labelY + 4}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {dim.label} ({dim.value}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Semantic Rubric Alignment Meter */}
      <div style={{ background: 'rgba(14, 19, 38, 0.7)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#a855f7' }}>
            <TrendingUp size={14} />
            <span>SEMANTIC RUBRIC ALIGNMENT (RAG)</span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00f2fe' }}>
            {rubricAlignment?.overall_coverage ? `${rubricAlignment.overall_coverage}% Match` : 'Awaiting Turn'}
          </span>
        </div>

        {rubricAlignment?.criteria_scores && rubricAlignment.criteria_scores.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {rubricAlignment.criteria_scores.map((crit, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: crit.covered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.08)',
                  border: `1px solid ${crit.covered ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.2)'}`,
                  fontSize: '0.75rem'
                }}
              >
                <span style={{ color: '#cbd5e1' }}>{crit.criterion}</span>
                {crit.covered ? (
                  <CheckCircle size={14} color="#10b981" />
                ) : (
                  <XCircle size={14} color="#f43f5e" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Vector DB will compute semantic rubric criteria coverage as soon as you submit an answer.
          </p>
        )}
      </div>
    </div>
  );
}
