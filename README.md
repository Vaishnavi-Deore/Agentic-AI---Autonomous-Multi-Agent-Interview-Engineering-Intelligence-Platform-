# PrepMind AI 🧠⚡
### Autonomous Multi-Agent Interview Intelligence Platform (Agentic AI 2.0)
> **Production-grade Agentic AI application featuring Swarm Council Deliberation, Chaos Engineering Incident Simulator, ReAct Tool Execution Loops, Technical Fact-Checking Grounding, RAG Semantic Gap Radar, Reflexion Evaluator, Code Sandbox, System Architecture Whiteboard, and Full Docker Production Orchestration.**

---

## 🌟 Overview & Advanced Agentic AI Capabilities

PrepMind AI 2.0 is an autonomous multi-agent mock interview and technical evaluation platform built to simulate high-stakes **Staff/Principal Engineering**, **Distributed System Design**, **AI/Agentic Architecture**, and **Executive Leadership (STAR)** interviews.

### Key Advanced Agentic AI Capabilities:

1. **Executive Bar Raiser Council Swarm (Multi-Agent Deliberation Chamber)**:
   - Coordinates dynamic cross-agent deliberations among 5 specialized AI personas:
     - **Alex Vance** (Principal Distributed Systems Architect)
     - **Marcus Kane** (Algorithmic & Performance Specialist)
     - **Dr. Vera Cross** (Technical Fact-Checker & Grounding Verifier)
     - **Elena Rostova** (Director of Engineering & Leadership)
     - **Sophia Martinez** (Executive Career & Socratic Coach)
   - Agents cross-examine candidate proposals, vote on a **Council Consensus Rating (%)**, and formulate joint targeted follow-up challenges.

2. **Grounding & Fact-Checking Agent (Dr. Vera Cross)**:
   - Scrutinizes technical assertions against known distributed system invariants (e.g., Raft majority quorum latency overheads, Kafka `acks=all` vs message durability guarantees, HNSW $\mathcal{O}(\log N)$ ANN complexity, Redis persistence fsync options).
   - Detects architectural misconceptions, quantifies numerical engineering SLA metrics, and flags buzzwords vs substance.

3. **Chaos Engineering & Live Production Incident Simulator (Chaos Monkey AI)**:
   - Dynamically injects live production outages (e.g. *Redis Sentinel Split-Brain & Cache Stampede*, *Kafka Consumer Thread Starvation & Rebalance Storm*, *HNSW Vector DB Memory Exhaustion*).
   - Live simulated telemetry metrics (P99 Latency ms, Error Rate %, Traffic QPS, CPU Load %) with real-time scrolling server log traces.
   - Interactive runbook console where candidates select mitigation commands and justify engineering blast-radius containment.

4. **Autonomous ReAct (Reasoning + Acting) Tool Execution Loop**:
   - Traceable agent reasoning cycle: `Thought -> Action -> Action Input -> Observation -> Reflection -> Decision`.
   - Agents autonomously invoke tools: `vector_db`, `fact_checker_agent`, and `code_sandbox`.

5. **Human-Crafted Dynamic UI & Audio Waveform Visualizer**:
   - **HTML5 Canvas Fluid Harmonic Waveform**: Dynamic sine wave oscillation that modulates organically with candidate voice volume and AI speech synthesis.
   - **Interactive Pipeline Node Inspector**: Click on any node in the orchestration graph to inspect real-time state, memory buffers, latency SLAs, and emitted logs.
   - **Live Candidate Cadence & Word Pacer**: Real-time word counter and pacing rating to guide candidates toward Staff-level answer depth.

6. **AI Architecture Auditor (System Design Whiteboard)**:
   - Evaluates system design topologies for **Single Points of Failure (SPOF)**, database connection pool bottlenecks, and missing ingress protections.
   - Computes back-of-the-envelope capacity estimations (daily requests, storage growth GB/day, network bandwidth Gbps).

7. **Automated Code Test Suite & Big-O Complexity Benchmarker**:
   - Executes Python algorithms in an isolated sandbox with automated smoke tests, contract tests, edge-case checks, and latency benchmarks.
   - Automatically computes asymptotic **Time & Space Complexity** (Big-O analysis).

8. **Resume & Job Description Semantic Gap Radar**:
   - Vector similarity matching between candidate experience and target job description qualifications.
   - Synthesizes 3 customized, gap-targeting interview challenges ready to launch with 1 click.

---

## 📐 Architecture Pipeline

```
                              ┌─────────────────────────────────────────┐
                              │      Supervisor Agent (State Machine)   │
                              └────────────────────┬────────────────────┘
                                                   │
                  ┌────────────────────────────────┼────────────────────────────────┐
                  ▼                                ▼                                ▼
     ┌──────────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────────┐
     │  RAG Semantic Vector DB  │     │  Council Swarm Chamber   │     │  Chaos Incident Engine   │
     │ (Resumes, JDs, Gap Radar)│     │  (Alex, Marcus, Elena,   │     │  (Live Outages, Metrics, │
     └────────────┬─────────────┘     │   Vera, Sophia)          │     │   Runbook Triage)        │
                  │                   └────────────┬─────────────┘     └────────────┬─────────────┘
                  ▼                                │                                │
     ┌──────────────────────────┐                  ▼                                ▼
     │  Fact-Checker Grounding  │◄───────── Candidate Answer ────────►┌──────────────────────────┐
     │  (Anti-Pattern Inspector)│       (Voice / Code Input)          │  Autonomous ReAct Tools  │
     └────────────┬─────────────┘                                     │  (Sandbox, Big-O, Tests) │
                  │                                                   └──────────────────────────┘
                  ▼
     ┌──────────────────────────┐
     │ Reflexion Critic & ELO   │
     └────────────┬─────────────┘
                  │
                  ▼
     ┌──────────────────────────┐
     │ Executive Debrief Report │
     │  (7-Day Targeted Plan)   │
     └──────────────────────────┘
```

---

## 🐳 Docker Production Deployment

PrepMind AI is fully containerized with multi-stage Docker builds and production Docker Compose:

### One-Click Launch (Windows):
Double-click **`docker-start.bat`** in the root directory.

### CLI Launch (Any OS):
```bash
docker compose up --build -d
```

### Access Services:
- **Web App (Nginx Production)**: [http://localhost:3000](http://localhost:3000) or [http://localhost](http://localhost)
- **FastAPI Backend REST API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

See [`DEPLOYMENT.md`](file:///c:/Users/deore/Desktop/Agentic%20AI%20Project/DEPLOYMENT.md) for full cloud guides (Render, AWS EC2, Railway, and DigitalOcean).

---

## 🚀 Native Local Development (Without Docker)

### Option 1: One-Click Launch (Windows)
Double-click **`start_project.bat`** in the root folder. It starts both the FastAPI backend and Vite frontend in separate terminal windows.

### Option 2: Terminal Launch

#### 1. Start Python FastAPI Backend:
```bash
cd backend
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: `http://127.0.0.1:8000/docs`

#### 2. Start React Frontend:
```bash
cd frontend
npm run dev
```
Open browser at: `http://localhost:5173`

---

## 🧪 Automated Test Verification

Run the integration test suite validating all agent capabilities:
```bash
python backend/test_advanced_agent.py
```
Or with pytest:
```bash
python -m pytest backend/test_advanced_agent.py
python -m pytest backend/test_api.py
```

---

## 📁 Repository Structure

```
Agentic AI Project/
├── Dockerfile                         # (See backend/Dockerfile & frontend/Dockerfile)
├── docker-compose.yml                 # Production Docker Compose orchestration
├── docker-start.bat                   # One-click Windows Docker starter
├── docker-start.sh                    # Linux/macOS Docker starter
├── render.yaml                        # 1-click cloud deployment blueprint for Render
├── DEPLOYMENT.md                      # Comprehensive deployment documentation
├── backend/
│   ├── Dockerfile                     # Production FastAPI Python 3.11-slim container
│   ├── .dockerignore                  # Docker ignore patterns
│   ├── app.py                         # FastAPI REST API with Council & Chaos endpoints
│   ├── requirements.txt               # Python dependencies
│   ├── test_api.py                    # Base integration tests
│   ├── test_advanced_agent.py         # Advanced agent swarm & chaos test suite
│   ├── core/
│   │   ├── vector_db.py               # Vector indexing & cosine similarity search
│   │   ├── rag_pipeline.py            # Resume parsing, JD chunking & Semantic Gap Radar
│   │   ├── llm_engine.py              # Unified LLM provider (Built-in + Gemini + OpenAI)
│   │   ├── agents/
│   │   │   ├── supervisor.py          # Master LangGraph-style workflow coordinator
│   │   │   ├── council.py             # 5-Agent Council Swarm deliberation chamber
│   │   │   ├── fact_checker.py        # Technical fact-checker & anti-pattern verifier
│   │   │   ├── chaos_agent.py         # Chaos Monkey live production outage simulator
│   │   │   ├── react_agent.py         # Autonomous ReAct tool execution engine
│   │   │   ├── interviewer.py         # Persona interviewers (Alex, Elena, Marcus, Sophia)
│   │   │   ├── evaluator.py           # Reflexion critic with rubric & STAR scoring
│   │   │   ├── difficulty.py          # Adaptive ELO rating engine
│   │   │   └── reporter.py            # Executive debrief & 7-day roadmap generator
│   │   └── tools/
│   │       ├── code_sandbox.py        # Python execution sandbox, test harness & Big-O
│   │       └── architecture_auditor.py# AI Architecture Auditor (SPOF & bottleneck checks)
│   └── data/
│       ├── questions_db.json          # Curated FAANG question bank & rubrics
│       └── sample_resumes.json        # Sample resumes for instant testing
├── frontend/
│   ├── Dockerfile                     # Multi-stage build (Node Vite -> Nginx Alpine)
│   ├── .dockerignore                  # Frontend Docker ignore patterns
│   ├── nginx.conf                     # Production Nginx reverse proxy & SPA router
│   ├── package.json
│   ├── vite.config.js                 # Vite config with backend proxy
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                    # Master frontend orchestrator
│   │   ├── index.css                  # Obsidian glassmorphic dark theme
│   │   ├── services/
│   │   │   └── api.js                 # REST API client
│   │   └── components/
│   │       ├── Navbar.jsx             # HUD navbar with telemetry badges
│   │       ├── AgentTelemetryGraph.jsx# Real-time multi-agent live graph
│   │       ├── AgentNodeInspectorModal.jsx # Interactive node memory & logs inspector
│   │       ├── AudioWaveformVisualizer.jsx # HTML5 Canvas harmonic sine wave visualizer
│   │       ├── InterviewStage.jsx     # Speech recognition, TTS, audio waveforms, chat
│   │       ├── AgentCouncilWarRoom.jsx# 5-Agent Deliberation Chamber & ReAct inspector
│   │       ├── ChaosIncidentSimulator.jsx # Real-time Chaos outage HUD & runbook triage
│   │       ├── ResumeJdGapModal.jsx   # Semantic Gap Radar & tailored challenge generator
│   │       ├── CodeSandboxEditor.jsx  # Live Python REPL runner & automated test suite
│   │       ├── SystemDesignCanvas.jsx # Architecture whiteboard & AI auditor
│   │       ├── PerformanceRadar.jsx   # 5-axis SVG competency radar
│   │       ├── SetupModal.jsx         # Track & persona setup modal
│   │       ├── RagInspectorModal.jsx  # Vector DB collections inspector
│   │       ├── SettingsModal.jsx      # LLM engine configurator
│   │       └── PostInterviewReport.jsx# Final debrief with confetti & study plan
└── start_project.bat                  # One-click Windows starter script
```
