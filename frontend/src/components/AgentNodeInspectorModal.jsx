import React from 'react';
import { X, Activity, Cpu, Database, Shield, Zap, Terminal, CheckCircle2, Clock } from 'lucide-react';

const NODE_DETAILS = {
  SUPERVISOR: {
    title: "Supervisor Agent Orchestrator",
    architecture: "State Graph Coordinator (LangGraph-style)",
    description: "Maintains session state machines, routes execution between retrieval, interviewer personas, critic reflexions, and handles turn termination.",
    latency_sla: "< 25ms state transition",
    memory_context: "Stores complete session round history, candidate profile, and telemetry buffer.",
    tools_exposed: ["start_session", "submit_answer", "next_question", "finish_session"]
  },
  RAG_RETRIEVER: {
    title: "RAG & Vector Retrieval Engine",
    architecture: "Dense TF-IDF N-Gram / Cosine Similarity Vector Store",
    description: "Vectorizes candidate resumes and job descriptions using sliding window chunking. Retrieves high-relevance domain context and rubric criteria.",
    latency_sla: "< 15ms cosine query",
    memory_context: "Multi-collection vector store (resumes, job_descriptions, questions_bank).",
    tools_exposed: ["vector_db.query", "vector_db.compute_rubric_alignment", "rag_pipeline.chunk"]
  },
  COUNCIL_SWARM: {
    title: "Executive Bar Raiser Council Swarm",
    architecture: "Multi-Agent Deliberation Chamber (5 Personas)",
    description: "Convenes Alex (Architect), Marcus (Algorithms), Elena (Director), Vera (Verifier), and Sophia (Coach) to debate candidate answers from distinct technical angles.",
    latency_sla: "< 60ms committee deliberation",
    memory_context: "Cross-agent dialogue transcripts and consensus rating matrix.",
    tools_exposed: ["council_agent.deliberate", "consensus_meter", "joint_followup"]
  },
  INTERVIEWER: {
    title: "Interviewer Persona Agent",
    architecture: "Socratic Inquisitor & Behavioral Prober",
    description: "Tailors inquiry tone based on persona profile. Asks deep follow-ups grounded in candidate resume experience and identified rubric gaps.",
    latency_sla: "< 40ms dynamic speech synthesis",
    memory_context: "Persona guidelines, candidate resume highlights, active question rubric.",
    tools_exposed: ["interviewer_agent.generate_followup", "interviewer_agent.ask_initial_question"]
  },
  CANDIDATE: {
    title: "Candidate Audio & Code Ingress",
    architecture: "Multimodal Voice & Text Pipeline",
    description: "Captures candidate microphone audio (16kHz PCM WAV export), runs speech recognition STT, and ingests Python algorithm solutions.",
    latency_sla: "< 50ms audio capture buffer",
    memory_context: "Raw PCM audio buffers and code text buffer.",
    tools_exposed: ["web_speech_stt", "pcm_wav_exporter", "code_runner"]
  },
  FACT_CHECKER: {
    title: "Dr. Vera Cross (Technical Fact-Checker)",
    architecture: "Knowledge Graph & Anti-Pattern Verifier",
    description: "Audits candidate claims against production realities (Raft quorum RTT, Kafka acks=all durability, HNSW logarithmic bounds, Redis persistence modes).",
    latency_sla: "< 20ms semantic claim check",
    memory_context: "Canonical distributed system invariants and benchmark knowledge.",
    tools_exposed: ["fact_checker_agent.verify_answer", "anti_pattern_detector"]
  },
  EVALUATOR: {
    title: "Reflexion Evaluator & STAR Critic",
    architecture: "Multi-Dimensional Vector Rubric Evaluator",
    description: "Scores candidate answers across 5 competencies (Problem Solving, Technical Depth, Communication, Architecture, Cultural Fit) and STAR framework compliance.",
    latency_sla: "< 35ms rubric scoring",
    memory_context: "Rubric criteria similarity vectors and STAR pattern regexes.",
    tools_exposed: ["evaluator_agent.evaluate_response", "star_detector"]
  },
  REACT_TOOLS: {
    title: "Autonomous ReAct Tool Sandbox",
    architecture: "Reasoning + Acting Execution Engine",
    description: "Coordinates multi-turn tool loops (Thought -> Action -> Action Input -> Observation -> Decision) for verifiable technical proofs.",
    latency_sla: "< 30ms sandbox round-trip",
    memory_context: "Action parameters, observation logs, and execution traces.",
    tools_exposed: ["code_sandbox.execute_python", "code_sandbox.test_suite"]
  },
  CHAOS_ENGINE: {
    title: "Chaos Monkey AI (Production Incident Simulator)",
    architecture: "Dynamic Anomaly & Outage Injector",
    description: "Simulates real-world production outages (Split-Brain, Consumer Thread Starvation, Vector OOM) with live P99 latency, error rate telemetry, and log streaming.",
    latency_sla: "< 10ms anomaly synthesis",
    memory_context: "Incident telemetry state, server logs, and triage runbooks.",
    tools_exposed: ["chaos_agent.trigger_incident", "chaos_agent.execute_triage"]
  },
  DIFFICULTY_TUNER: {
    title: "Adaptive ELO Difficulty Engine",
    architecture: "Latent Trait ELO Rating System",
    description: "Dynamically updates candidate ELO based on rubric coverage scores (K=32). Modulates questions between Junior, Mid, Senior, and Staff tiers.",
    latency_sla: "< 5ms ELO rating update",
    memory_context: "Rating progression history and target ability thresholds.",
    tools_exposed: ["difficulty_engine.update_rating", "difficulty_engine.get_tier"]
  },
  REPORTER: {
    title: "Executive Debrief & Study Plan Generator",
    architecture: "Holistic Synthesis Reporter",
    description: "Compiles interview scorecard, hiring verdict (Strong Hire, Hire, Leaning Hire), SVG competency radar, and 7-day personalized prep curriculum.",
    latency_sla: "< 45ms debrief report generation",
    memory_context: "Full round evaluations, difficulty deltas, and candidate growth areas.",
    tools_exposed: ["reporter_agent.generate_final_report", "roadmap_generator"]
  }
};

export default function AgentNodeInspectorModal({
  isOpen,
  onClose,
  nodeId,
  telemetry = []
}) {
  if (!isOpen || !nodeId) return null;

  const nodeInfo = NODE_DETAILS[nodeId] || {
    title: `${nodeId} Agent`,
    architecture: "Autonomous Agent Module",
    description: "Executes specialized workflows in the PrepMind orchestration pipeline.",
    latency_sla: "< 25ms",
    memory_context: "Pipeline telemetry memory.",
    tools_exposed: ["execute"]
  };

  // Filter telemetry events for this node
  const nodeEvents = telemetry.filter(e => e.node === nodeId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        style={{ maxWidth: '680px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.15)',
              border: '1px solid #00f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={18} color="#00f2fe" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '1px', color: '#00f2fe', fontWeight: 700 }}>
                PIPELINE NODE INSPECTOR &bull; [{nodeId}]
              </div>
              <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>
                {nodeInfo.title}
              </h2>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Architecture & SLA stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="glass-panel" style={{ padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>ARCHITECTURE PATTERN</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginTop: '0.2rem' }}>
                {nodeInfo.architecture}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>LATENCY SLA / TARGET</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', marginTop: '0.2rem' }}>
                {nodeInfo.latency_sla}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem' }}>
              NODE ROLE & RESPONSIBILITIES
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              {nodeInfo.description}
            </p>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              <strong style={{ color: '#e2e8f0' }}>Memory Context:</strong> {nodeInfo.memory_context}
            </div>
          </div>

          {/* Tools Exposed */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
              EXPOSED SYSTEM INTERFACES / TOOLS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {nodeInfo.tools_exposed?.map((tool, idx) => (
                <span key={idx} style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  color: '#38bdf8'
                }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Recent node telemetry events */}
          <div className="glass-panel" style={{ padding: '0.85rem 1rem', background: '#05070e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
                RECENT EMITTED EVENTS ({nodeEvents.length})
              </div>
              <span style={{ fontSize: '0.68rem', color: '#10b981' }}>Live Heartbeat Active</span>
            </div>

            <div style={{
              maxHeight: '110px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontFamily: 'monospace',
              fontSize: '0.72rem'
            }}>
              {nodeEvents.length > 0 ? (
                nodeEvents.map((ev, i) => (
                  <div key={i} style={{ color: '#cbd5e1' }}>
                    <span style={{ color: '#00f2fe' }}>[{ev.timestamp}]</span> {ev.message}
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-faint)' }}>
                  Node in standby. Awaiting session state transition...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
