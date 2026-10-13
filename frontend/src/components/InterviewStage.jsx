import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  SkipForward, 
  User, 
  Bot, 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  X, 
  Loader2, 
  Sparkles,
  Users,
  Flame,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import AudioWaveformVisualizer from './AudioWaveformVisualizer';

// Pure JavaScript PCM to WAV converter (16-bit Mono @ 16kHz)
function exportWavBlob(sampleBuffers, sampleRate = 16000) {
  let totalLength = 0;
  for (const buf of sampleBuffers) totalLength += buf.length;
  if (totalLength === 0) return null;

  const merged = new Float32Array(totalLength);
  let offset = 0;
  for (const buf of sampleBuffers) {
    merged.set(buf, offset);
    offset += buf.length;
  }

  const wavBuffer = new ArrayBuffer(44 + merged.length * 2);
  const view = new DataView(wavBuffer);

  const writeStr = (pos, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(pos + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + merged.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // 1 channel (Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // 16-bit
  writeStr(36, 'data');
  view.setUint32(40, merged.length * 2, true);

  let pcmOffset = 44;
  for (let i = 0; i < merged.length; i++, pcmOffset += 2) {
    const s = Math.max(-1, Math.min(1, merged[i]));
    view.setInt16(pcmOffset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

// Convert Blob to Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const QUICK_VOICE_PRESETS = [
  {
    label: "RAG & Hybrid Search",
    text: "For designing an enterprise RAG system, I would use semantic sliding-window chunking, dense vector embeddings with BM25 sparse search using Reciprocal Rank Fusion, followed by a cross-encoder reranker to eliminate hallucinations."
  },
  {
    label: "Multi-Agent System",
    text: "I would architect a graph-based state machine using LangGraph with a Supervisor orchestrator, cycle detection, tool execution idempotency tokens, and human-in-the-loop checkpoints."
  },
  {
    label: "Distributed URL Shortener",
    text: "For 5 billion redirects per month, I'd implement a Key Generation Service with Base62 encoding, a Redis LRU cache cluster achieving sub-10ms latency, and partitioned PostgreSQL shards."
  },
  {
    label: "STAR Outage Incident",
    text: "During a high-severity production outage, I initiated incident command, executed immediate canary rollback to stop user impact, conducted a 5 Whys blameless post-mortem, and automated chaos engineering tests."
  }
];

export default function InterviewStage({
  sessionData,
  onSendMessage,
  onRequestHint,
  onNextQuestion,
  onFinishSession,
  isThinking,
  councilMode = true,
  onToggleCouncilMode,
  activeIncident = null,
  onOpenChaosWarRoom,
  onOpenCouncilWarRoom
}) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.05);
  const [micVolume, setMicVolume] = useState(12);
  const [micStatusMsg, setMicStatusMsg] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [expandedThoughts, setExpandedThoughts] = useState({});

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const pcmBuffersRef = useRef([]);
  const hasSpokenRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessionData?.round_history, isThinking]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const speakText = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted.').replace(/[#*_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const rounds = sessionData?.round_history || [];
    if (rounds.length > 0) {
      const lastRound = rounds[rounds.length - 1];
      const msgs = lastRound.messages || [];
      if (msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.role === 'interviewer' && lastMsg.text) {
          speakText(lastMsg.text);
        }
      }
    }
  }, [sessionData?.round_history]);

  const stopAllAudio = () => {
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch (e) {}
      processorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
    setIsAiSpeaking(false);
  };

  const startListening = async () => {
    setMicStatusMsg(null);
    pcmBuffersRef.current = [];
    hasSpokenRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          channelCount: 1, 
          sampleRate: 16000, 
          echoCancellation: true, 
          noiseSuppression: true 
        } 
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        pcmBuffersRef.current.push(new Float32Array(inputData));

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        if (avg > 15) hasSpokenRef.current = true;
        setMicVolume(Math.round(avg));
      };

      source.connect(analyser);
      analyser.connect(processor);
      
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;
      processor.connect(silentGain);
      silentGain.connect(audioCtx.destination);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            if (transcript.trim()) {
              setInputText(prev => transcript);
              hasSpokenRef.current = true;
            }
          };

          recognition.onerror = (e) => {
            console.warn('[WebSpeech STT fallback to backend WAV]', e.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('SpeechRecognition failed to start:', recErr);
        }
      }

      setIsListening(true);
      setMicStatusMsg("🎙️ Microphone active. Speak clearly into your mic...");
    } catch (err) {
      console.error('Mic access error:', err);
      setMicStatusMsg(`Microphone permission error: ${err.message}. Please check browser permissions.`);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    setMicStatusMsg(null);

    const buffers = [...pcmBuffersRef.current];
    const userSpoke = hasSpokenRef.current;
    stopAllAudio();

    if (!inputText.trim()) {
      setIsTranscribing(true);
      setMicStatusMsg("Processing audio stream with AI transcription...");

      try {
        const wavBlob = exportWavBlob(buffers, 16000);
        if (wavBlob && wavBlob.size > 2000) {
          const b64 = await blobToBase64(wavBlob);
          const res = await api.transcribeVoice(b64);
          if (res.success && res.text) {
            setInputText(res.text);
            setMicStatusMsg(null);
          } else {
            setMicStatusMsg(res.error || "No clear speech detected.");
          }
        } else {
          setMicStatusMsg("Audio recording was too brief or empty.");
        }
      } catch (err) {
        setMicStatusMsg(`Audio transcription error: ${err.message}`);
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleSend = () => {
    if (!inputText.trim() || isThinking) return;
    if (isListening) stopListening();
    onSendMessage(inputText.trim());
    setInputText('');
    setMicStatusMsg(null);
  };

  const toggleThought = (idx) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleUsePreset = (text) => {
    setInputText(text);
    setMicStatusMsg(null);
  };

  const currentQuestion = sessionData?.active_question || {};
  const history = sessionData?.round_history || [];

  // Candidate input pacing analysis
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const wordCountRating = wordCount === 0 ? '' : (wordCount < 40 ? 'Brief' : (wordCount <= 120 ? 'Optimal Staff-Depth' : 'Extensive Analysis'));

  return (
    <div className="chat-container glass-panel">
      {/* Header with Interviewer Persona, Council Mode, and Active Question */}
      <div className="chat-header" style={{ flexWrap: 'wrap', gap: '0.65rem' }}>
        <div className="interviewer-profile">
          <div className="interviewer-avatar">
            {councilMode ? <Users size={22} color="#00f2fe" /> : <Bot size={22} />}
          </div>
          <div className="interviewer-info">
            <h4>
              {councilMode 
                ? 'Executive Bar Raiser Council (5 Agents)' 
                : (sessionData?.opening_message?.speaker || 'Alex Vance (Principal Architect)')}
            </h4>
            <p>
              Target: <strong style={{ color: '#00f2fe' }}>{currentQuestion.company || 'FAANG Tier'}</strong> &bull; Topic: {currentQuestion.topic || 'System Foundations'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
          {/* Council Mode Toggle */}
          <button
            className={`btn ${councilMode ? 'btn-accent' : 'btn-secondary'}`}
            onClick={onToggleCouncilMode}
            title={councilMode ? 'Council Swarm Mode Active (5 Agents Debating)' : 'Single Interviewer Mode'}
            style={{ 
              padding: '0.35rem 0.75rem', 
              fontSize: '0.72rem',
              borderColor: councilMode ? '#00f2fe' : undefined
            }}
          >
            <Users size={13} />
            <span>{councilMode ? 'Council Swarm (ON)' : 'Council Swarm (OFF)'}</span>
          </button>

          {/* TTS Toggle */}
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (ttsEnabled) {
                window.speechSynthesis?.cancel();
                setIsAiSpeaking(false);
              }
              setTtsEnabled(!ttsEnabled);
            }}
            title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
            style={{ padding: '0.4rem 0.6rem' }}
          >
            {ttsEnabled ? <Volume2 size={15} color="#00f2fe" /> : <VolumeX size={15} color="#94a3b8" />}
          </button>

          {/* Socratic Hint */}
          <button
            className="btn btn-secondary"
            onClick={onRequestHint}
            title="Ask coach for a progressive Socratic hint"
            id="btn-ask-hint"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
          >
            <Lightbulb size={13} color="#f59e0b" />
            <span>Hint</span>
          </button>

          {/* Next Question */}
          <button
            className="btn btn-secondary"
            onClick={onNextQuestion}
            title="Move to next question"
            id="btn-next-question"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
          >
            <SkipForward size={13} />
            <span>Next</span>
          </button>
        </div>
      </div>

      {/* Production Chaos Alert Banner if firing */}
      {activeIncident && activeIncident.status === 'FIRING' && (
        <div style={{
          padding: '0.6rem 1rem',
          background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.25) 0%, rgba(244, 63, 94, 0.1) 100%)',
          borderBottom: '1px solid #f43f5e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'pulseGlow 2s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
            <Flame size={16} color="#f43f5e" />
            <span style={{ fontWeight: 800, color: '#fecdd3' }}>[SEV-1 ACTIVE INCIDENT]</span>
            <span style={{ color: '#fff' }}>{activeIncident.title} (P99: {activeIncident.current_metrics?.p99_latency_ms}ms)</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={onOpenChaosWarRoom}
            style={{ padding: '0.25rem 0.65rem', fontSize: '0.7rem', background: '#f43f5e', borderColor: '#f43f5e' }}
          >
            <span>Triage in War Room</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Messages Feed */}
      <div className="chat-messages">
        {history.flatMap((round, rIdx) => round.messages || []).map((msg, idx) => {
          const isInterviewer = msg.role === 'interviewer';
          const isCoach = msg.role === 'coach';
          const isCand = msg.role === 'candidate';
          const thoughtOpen = expandedThoughts[idx];

          return (
            <div
              key={idx}
              className={`message-bubble ${isInterviewer ? 'interviewer' : isCoach ? 'coach' : 'candidate'}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isInterviewer ? '#38bdf8' : isCoach ? '#fbbf24' : '#a7f3d0' }}>
                    {msg.speaker || (isCand ? 'Candidate' : 'Interviewer')}
                  </span>
                  
                  {msg.consensus_badge && (
                    <span 
                      onClick={onOpenCouncilWarRoom}
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: 'rgba(0, 242, 254, 0.15)',
                        border: '1px solid rgba(0, 242, 254, 0.35)',
                        color: '#00f2fe',
                        cursor: 'pointer'
                      }}
                      title="Click to view full Council War Room deliberation"
                    >
                      🏛️ {msg.consensus_badge}
                    </span>
                  )}
                </div>
                
                {msg.agent_thought && (
                  <button
                    onClick={() => toggleThought(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Brain size={12} color="#00f2fe" />
                    <span>Agent Thought</span>
                    {thoughtOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
              </div>

              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.88rem' }}>
                {msg.text}
              </div>

              {msg.agent_thought && thoughtOpen && (
                <div className="agent-thought-callout">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <Brain size={12} />
                    <strong>INTERNAL AGENT REASONING:</strong>
                  </div>
                  {msg.agent_thought}
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="message-bubble interviewer" style={{ opacity: 0.85 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.85rem' }}>
              <div className="live-dot" />
              <span>
                {councilMode ? 'Council Swarm Deliberating across 5 Personas...' : 'Supervisor & Reflexion Evaluator thinking...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Real-time Status / Mic Notice Banner */}
      {micStatusMsg && (
        <div style={{
          background: isListening ? 'rgba(0, 242, 254, 0.12)' : (isTranscribing ? 'rgba(168, 85, 247, 0.15)' : 'rgba(244, 63, 94, 0.12)'),
          borderTop: `1px solid ${isListening ? '#00f2fe' : (isTranscribing ? '#a855f7' : '#f43f5e')}`,
          padding: '0.55rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isTranscribing ? (
              <Loader2 size={14} className="animate-spin" color="#a855f7" />
            ) : isListening ? (
              <div className="live-dot" />
            ) : (
              <AlertCircle size={14} color="#f43f5e" />
            )}
            <span>{micStatusMsg}</span>
          </div>
          <button
            onClick={() => setMicStatusMsg(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Quick Voice Answer Presets Bar */}
      <div style={{
        padding: '0.35rem 1rem',
        background: 'rgba(10, 14, 30, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#38bdf8', whiteSpace: 'nowrap', fontWeight: 700 }}>
          <Sparkles size={12} />
          <span>Quick Voice Answers:</span>
        </div>
        {QUICK_VOICE_PRESETS.map((preset, pIdx) => (
          <button
            key={pIdx}
            onClick={() => handleUsePreset(preset.text)}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              padding: '0.22rem 0.55rem',
              color: '#cbd5e1',
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#00f2fe'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Dynamic HTML5 Canvas Waveform Visualizer */}
      <div style={{ padding: '0 0.75rem' }}>
        <AudioWaveformVisualizer
          isListening={isListening}
          isAiSpeaking={isAiSpeaking}
          volumeLevel={micVolume}
          speechRate={speechRate}
          onSpeechRateChange={(r) => setSpeechRate(r)}
        />
      </div>

      {/* Input Bar with STT & Pacing Guide */}
      <div className="chat-input-bar">
        <button
          className={`btn ${isListening ? 'btn-accent' : 'btn-secondary'}`}
          onClick={toggleMic}
          disabled={isTranscribing}
          title={isListening ? 'Click to stop and transcribe your answer' : 'Speak your answer (Click to start recording)'}
          id="btn-voice-input"
          style={{
            padding: '0.65rem',
            background: isListening ? '#f43f5e' : undefined,
            boxShadow: isListening ? '0 0 16px rgba(244, 63, 94, 0.6)' : undefined
          }}
        >
          {isTranscribing ? (
            <Loader2 size={18} className="animate-spin" color="#fff" />
          ) : isListening ? (
            <MicOff size={18} color="#fff" />
          ) : (
            <Mic size={18} color="#00f2fe" />
          )}
        </button>

        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            className="chat-input-textarea"
            rows={1}
            placeholder={
              isListening 
                ? 'Recording your voice... Speak now! Click the red mic button when done.' 
                : (isTranscribing ? 'Transcribing your audio with AI...' : 'Speak or type your architectural analysis, code reasoning, or STAR experience...')
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isThinking || isTranscribing}
            id="candidate-answer-input"
            style={{ width: '100%', paddingRight: wordCount > 0 ? '110px' : '1rem' }}
          />

          {wordCount > 0 && (
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: wordCount >= 50 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: wordCount >= 50 ? '#10b981' : '#f59e0b',
              border: `1px solid ${wordCount >= 50 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              pointerEvents: 'none'
            }}>
              {wordCount}w &bull; {wordCountRating}
            </span>
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={!inputText.trim() || isThinking || isTranscribing}
          id="btn-submit-answer"
          style={{ padding: '0.7rem 1.1rem' }}
        >
          <Send size={16} />
          <span>Submit</span>
        </button>
      </div>
    </div>
  );
}
