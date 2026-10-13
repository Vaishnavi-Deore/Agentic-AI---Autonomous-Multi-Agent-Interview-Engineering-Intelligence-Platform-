import React, { useRef, useEffect } from 'react';
import { Volume2, Mic, Activity, Sliders, Zap } from 'lucide-react';

export default function AudioWaveformVisualizer({
  isListening = false,
  isAiSpeaking = false,
  volumeLevel = 15,
  speechRate = 1.05,
  onSpeechRateChange
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Base amplitude depends on state
      let amp = 3;
      if (isListening) {
        amp = Math.max(10, Math.min(26, volumeLevel * 0.9));
      } else if (isAiSpeaking) {
        amp = 14 + Math.sin(step * 0.08) * 8;
      } else {
        amp = 4 + Math.sin(step * 0.04) * 2; // subtle idle breathing
      }

      step += 1;

      // Draw 3 layered harmonic waves
      const waves = [
        { color: 'rgba(0, 242, 254, 0.85)', freq: 0.025, speed: 0.06, amp: amp * 1.0, lineWidth: 2.2 },
        { color: 'rgba(157, 78, 221, 0.7)', freq: 0.035, speed: -0.05, amp: amp * 0.7, lineWidth: 1.8 },
        { color: 'rgba(56, 189, 248, 0.5)', freq: 0.018, speed: 0.04, amp: amp * 0.5, lineWidth: 1.2 }
      ];

      waves.forEach(w => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.lineWidth;
        ctx.shadowColor = w.color;
        ctx.shadowBlur = isListening || isAiSpeaking ? 10 : 4;

        for (let x = 0; x < width; x++) {
          // Windowing function to taper edges gracefully to zero
          const taper = Math.sin((x / width) * Math.PI);
          const y = centerY + Math.sin(x * w.freq + step * w.speed) * w.amp * taper;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isAiSpeaking, volumeLevel]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.4rem 0.85rem',
      background: 'rgba(6, 10, 24, 0.85)',
      borderRadius: '8px',
      border: `1px solid ${isListening ? 'rgba(244, 63, 94, 0.4)' : (isAiSpeaking ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.06)')}`,
      marginBottom: '0.45rem',
      gap: '0.75rem',
      transition: 'border 0.3s ease'
    }}>
      {/* Left state badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: '135px' }}>
        <div style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: isListening ? '#f43f5e' : (isAiSpeaking ? '#00f2fe' : '#10b981'),
          boxShadow: `0 0 8px ${isListening ? '#f43f5e' : (isAiSpeaking ? '#00f2fe' : '#10b981')}`
        }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.3px' }}>
          {isListening ? 'VOICE RECORDING' : (isAiSpeaking ? 'AI SYNTHESIS ACTIVE' : 'SPEECH ENGINE READY')}
        </span>
      </div>

      {/* Center Canvas Wave */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          width={280}
          height={32}
          style={{ width: '100%', maxWidth: '320px', height: '32px', display: 'block' }}
        />
      </div>

      {/* Right Voice Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>Rate:</span>
        {[0.9, 1.05, 1.25].map(rate => (
          <button
            key={rate}
            onClick={() => onSpeechRateChange && onSpeechRateChange(rate)}
            style={{
              background: Math.abs(speechRate - rate) < 0.05 ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${Math.abs(speechRate - rate) < 0.05 ? '#00f2fe' : 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '4px',
              padding: '0.15rem 0.35rem',
              color: Math.abs(speechRate - rate) < 0.05 ? '#00f2fe' : '#94a3b8',
              fontSize: '0.65rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {rate}x
          </button>
        ))}
      </div>
    </div>
  );
}
