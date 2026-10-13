"""
PrepMind AI - Advanced Multi-Agent Interview Intelligence Backend
FastAPI REST application exposing multi-agent orchestration, Council Swarm deliberation,
Chaos Engineering incident triage, ReAct autonomous tool execution, RAG semantic gap analysis,
vector DB inspection, code execution sandbox, and architecture audit.
"""

import os
import json
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.vector_db import vector_db
from core.rag_pipeline import rag_pipeline
from core.llm_engine import llm_config, llm_engine
from core.agents.supervisor import supervisor
from core.agents.interviewer import INTERVIEWER_PERSONAS
from core.agents.difficulty import difficulty_engine
from core.agents.council import council_agent
from core.agents.chaos_agent import chaos_agent
from core.agents.fact_checker import fact_checker_agent
from core.agents.react_agent import react_agent
from core.tools.code_sandbox import code_sandbox
from core.tools.architecture_auditor import architecture_auditor

app = FastAPI(
    title="PrepMind AI - Agentic Interview Platform API",
    description="Multi-Agent Autonomous Interview Intelligence Platform with Swarm Council, Chaos Simulator, RAG Semantic Gap Analysis, Reflexion Evaluator, and Live Telemetry.",
    version="2.0.0"
)

# Enable CORS for frontend development and local servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request schemas
class StartSessionRequest(BaseModel):
    track: str = "ai_agentic"
    persona: str = "alex"
    resume_data: Optional[Any] = None
    jd_text: Optional[str] = ""


class SubmitAnswerRequest(BaseModel):
    answer: str
    enable_council: Optional[bool] = True


class SettingsUpdateRequest(BaseModel):
    provider: str
    api_key: Optional[str] = ""
    model: Optional[str] = ""


class CodeRunRequest(BaseModel):
    code: str


class CodeTestSuiteRequest(BaseModel):
    code: str
    topic: Optional[str] = "Algorithm"


class TranscribeRequest(BaseModel):
    audio_base64: str


class CouncilDeliberateRequest(BaseModel):
    candidate_answer: str


class ChaosIncidentTriggerRequest(BaseModel):
    scenario_id: Optional[str] = None


class ChaosIncidentTriageRequest(BaseModel):
    action_id: str
    candidate_rationale: Optional[str] = ""


class ArchitectureAuditRequest(BaseModel):
    selected_blocks: List[str]
    qps: Optional[int] = 15000
    object_size_kb: Optional[float] = 2.0


class ResumeJdGapRequest(BaseModel):
    resume_data: Optional[Any] = None
    jd_text: Optional[str] = ""


@app.get("/api/health")
def health_check():
    collections_info = {
        name: len(col.documents)
        for name, col in vector_db.collections.items()
    }
    return {
        "status": "healthy",
        "provider": llm_config.provider,
        "collections": collections_info,
        "active_persona": supervisor.persona,
        "active_track": supervisor.track,
        "current_elo": difficulty_engine.elo,
        "tier": difficulty_engine.get_tier(),
        "active_incident": chaos_agent.get_status()
    }


@app.get("/api/sample-data")
def get_sample_data():
    sample_path = os.path.join(os.path.dirname(__file__), "data", "sample_resumes.json")
    resumes = {}
    if os.path.exists(sample_path):
        with open(sample_path, "r", encoding="utf-8") as f:
            resumes = json.load(f)

    tracks = [
        {"id": "ai_agentic", "title": "AI & Agentic Systems", "description": "RAG, Multi-Agent LangGraph, Vector DBs, Evaluator Triad, Inference Optimization", "icon": "Brain"},
        {"id": "fullstack_swe", "title": "Full-Stack Software Engineering", "description": "React 19 internals, Concurrency, Database Indexing, Distributed Caching", "icon": "Layers"},
        {"id": "system_design", "title": "High-Scale Distributed Systems", "description": "Global URL Shortener, CRDT Collaborative Canvases, Kafka, Microservices", "icon": "Network"},
        {"id": "behavioral_star", "title": "Executive Behavioral & STAR", "description": "Leadership principles, Disagree & Commit, Severity Outages, Cross-team Influence", "icon": "UserCheck"}
    ]

    personas = [
        {"id": k, **v} for k, v in INTERVIEWER_PERSONAS.items()
    ]

    return {
        "tracks": tracks,
        "personas": personas,
        "sample_resumes": resumes
    }


@app.post("/api/settings")
def update_settings(req: SettingsUpdateRequest):
    llm_config.update_keys(provider=req.provider, api_key=req.api_key or "", model=req.model or "")
    return {
        "status": "success",
        "provider": llm_config.provider,
        "message": f"LLM provider updated to '{llm_config.provider}'"
    }


@app.post("/api/session/start")
def start_interview_session(req: StartSessionRequest):
    try:
        session_data = supervisor.start_session(
            track=req.track,
            persona=req.persona,
            resume_data=req.resume_data,
            jd_text=req.jd_text or ""
        )
        return session_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/session/answer")
def submit_answer(req: SubmitAnswerRequest):
    if not req.answer or not req.answer.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")
    try:
        result = supervisor.submit_answer(req.answer, enable_council=req.enable_council if req.enable_council is not None else True)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent/council/deliberate")
def deliberate_council(req: CouncilDeliberateRequest):
    """Directly triggers multi-agent council debate on candidate answer"""
    try:
        return supervisor.deliberate_council(req.candidate_answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/incident/trigger")
def trigger_chaos_incident(req: ChaosIncidentTriggerRequest):
    """Triggers dynamic production chaos incident"""
    try:
        return supervisor.trigger_incident(req.scenario_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/incident/triage")
def triage_chaos_incident(req: ChaosIncidentTriageRequest):
    """Executes mitigation command and rationale against active incident"""
    try:
        return supervisor.triage_incident(req.action_id, req.candidate_rationale or "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/incident/status")
def get_incident_status():
    """Returns current chaos incident state"""
    inc = chaos_agent.get_status()
    return {"incident": inc}


@app.post("/api/design/audit")
def audit_architecture(req: ArchitectureAuditRequest):
    """Runs AI Architecture Auditor on topology blocks"""
    try:
        return architecture_auditor.audit_topology(
            selected_block_ids=req.selected_blocks,
            qps=req.qps or 15000,
            object_size_kb=req.object_size_kb or 2.0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rag/analyze-match")
def analyze_resume_jd_gap(req: ResumeJdGapRequest):
    """Deep semantic gap analysis between Resume and Job Description"""
    try:
        return rag_pipeline.analyze_resume_jd_gap(
            resume_data=req.resume_data,
            jd_text=req.jd_text or ""
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/code/run")
def run_code(req: CodeRunRequest):
    try:
        result = code_sandbox.execute_python(req.code)
        return result
    except Exception as e:
        return {"success": False, "error": str(e), "execution_time_ms": 0}


@app.post("/api/code/test-suite")
def run_test_suite(req: CodeTestSuiteRequest):
    """AI auto-generates unit and edge test cases, benchmarks execution, and analyzes Big-O"""
    try:
        result = code_sandbox.generate_and_run_test_suite(req.code, topic=req.topic or "Algorithm")
        return result
    except Exception as e:
        return {"success": False, "error": str(e), "execution_time_ms": 0}


@app.post("/api/session/hint")
def request_hint():
    try:
        return supervisor.request_hint()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/session/next")
def next_question():
    try:
        return supervisor.next_question()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/session/finish")
def finish_session():
    try:
        return supervisor.finish_session()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vector/inspect")
def inspect_vector_db():
    collections_data = {}
    for name, col in vector_db.collections.items():
        collections_data[name] = {
            "total_chunks": len(col.documents),
            "sample_chunks": [
                {
                    "doc_id": doc.doc_id,
                    "text_snippet": doc.text[:120] + "...",
                    "metadata": doc.metadata
                }
                for doc in col.documents[:5]
            ]
        }
    return {
        "collections": collections_data,
        "resume_profile": rag_pipeline.active_resume_data.get("parsed", {}),
        "target_jd_role": rag_pipeline.active_jd_data.get("role", "Not set")
    }


@app.post("/api/voice/transcribe")
def transcribe_voice(req: TranscribeRequest):
    import base64
    import io
    import speech_recognition as sr

    if not req.audio_base64:
        return {"success": False, "text": "", "error": "Empty audio data received"}

    try:
        b64_clean = req.audio_base64
        if "base64," in b64_clean:
            b64_clean = b64_clean.split("base64,")[1]

        raw_bytes = base64.b64decode(b64_clean)
        if len(raw_bytes) < 100:
            return {"success": False, "text": "", "error": "Audio file too short"}

        audio_stream = io.BytesIO(raw_bytes)
        recognizer = sr.Recognizer()

        with sr.AudioFile(audio_stream) as source:
            audio_data = recognizer.record(source)

        try:
            transcription = recognizer.recognize_google(audio_data)
            return {"success": True, "text": transcription, "error": None}
        except sr.UnknownValueError:
            return {
                "success": False,
                "text": "",
                "error": "No speech recognized. Please speak clearly into your microphone."
            }
        except sr.RequestError as re:
            return {
                "success": False,
                "text": "",
                "error": f"Speech service unavailable: {str(re)}"
            }
    except Exception as e:
        return {"success": False, "text": "", "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
