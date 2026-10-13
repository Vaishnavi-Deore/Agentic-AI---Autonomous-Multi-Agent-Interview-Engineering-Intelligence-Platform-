"""
Supervisor Agent (State Machine Orchestrator) for PrepMind AI
Coordinates multi-agent workflows, state transitions, tool execution,
council deliberations, chaos incident injections, and emits real-time
telemetry events for the frontend graph visualizer.
"""

import time
import uuid
from typing import Dict, Any, List, Optional
from .interviewer import interviewer_agent, INTERVIEWER_PERSONAS
from .evaluator import evaluator_agent
from .difficulty import difficulty_engine
from .reporter import reporter_agent
from .fact_checker import fact_checker_agent
from .council import council_agent
from .chaos_agent import chaos_agent
from .react_agent import react_agent
from ..rag_pipeline import rag_pipeline
from ..vector_db import vector_db


class SupervisorAgent:
    def __init__(self):
        self.session_id: str = str(uuid.uuid4())
        self.candidate_info: Dict[str, Any] = {"name": "Candidate", "role": "Senior Engineer"}
        self.track: str = "ai_agentic"
        self.persona: str = "alex"
        self.council_mode_enabled: bool = True
        self.active_question: Dict[str, Any] = {}
        self.round_history: List[Dict[str, Any]] = []
        self.status: str = "READY"
        self.telemetry_events: List[Dict[str, Any]] = []

    def start_session(
        self,
        track: str = "ai_agentic",
        persona: str = "alex",
        resume_data: Any = None,
        jd_text: str = ""
    ) -> Dict[str, Any]:
        """Initializes a new interview session and selects the first challenge"""
        self.session_id = str(uuid.uuid4())
        self.track = track
        self.persona = persona
        interviewer_agent.set_persona(persona)
        self.round_history = []
        self.telemetry_events = []
        self.status = "IN_PROGRESS"

        # 1. RAG Ingestion
        if resume_data:
            ingest_res = rag_pipeline.ingest_resume(resume_data)
            self.candidate_info = ingest_res.get("parsed_profile", self.candidate_info)
        
        if jd_text:
            rag_pipeline.ingest_job_description(jd_text)

        self._emit_telemetry("SUPERVISOR", "Session initialized", {"track": track, "persona": persona})
        self._emit_telemetry("RAG_RETRIEVER", "Ingested candidate resume & target JD into vector database", {
            "resume_chunks": len(vector_db.get_or_create_collection("resumes").documents),
            "jd_chunks": len(vector_db.get_or_create_collection("job_descriptions").documents)
        })

        # 2. Retrieve targeted question from vector DB
        q_results = vector_db.query("questions_bank", f"{track}", top_k=5)
        matching_questions = [
            q["metadata"] for q in q_results
            if q.get("metadata", {}).get("track") == track
        ]
        if not matching_questions:
            all_q = vector_db.get_or_create_collection("questions_bank").documents
            matching_questions = [d.metadata for d in all_q if d.metadata.get("track") == track]
            if not matching_questions and all_q:
                matching_questions = [all_q[0].metadata]

        self.active_question = matching_questions[0] if matching_questions else {
            "id": "gen_1",
            "track": track,
            "topic": "System Architecture & Foundations",
            "difficulty": "Senior",
            "company": "Top Tech",
            "question": "Walk me through how you design high-availability distributed systems under sudden burst traffic.",
            "expected_rubric": ["Load balancing", "Caching", "Database replication", "Circuit breaking"]
        }

        self._emit_telemetry("RAG_RETRIEVER", f"Selected question: '{self.active_question.get('topic')}'", {
            "question_id": self.active_question.get("id"),
            "company": self.active_question.get("company"),
            "expected_rubric_count": len(self.active_question.get("expected_rubric", []))
        })

        # 3. Interviewer Opening
        opening = interviewer_agent.ask_initial_question(
            self.active_question,
            candidate_name=self.candidate_info.get("name", "Candidate")
        )
        self._emit_telemetry("INTERVIEWER", opening.get("agent_thought", "Asking scenario question"), {
            "persona": persona,
            "speaker": opening["speaker"]
        })

        # Append to conversation history
        self.round_history.append({
            "type": "turn",
            "question_id": self.active_question.get("id"),
            "question_topic": self.active_question.get("topic"),
            "messages": [opening]
        })

        return {
            "session_id": self.session_id,
            "status": self.status,
            "active_question": self.active_question,
            "opening_message": opening,
            "candidate_info": self.candidate_info,
            "telemetry": self.telemetry_events,
            "elo": difficulty_engine.elo,
            "tier": difficulty_engine.get_tier()
        }

    def submit_answer(self, candidate_answer: str, enable_council: bool = True) -> Dict[str, Any]:
        """Candidate submits answer; Evaluator, Fact-Checker, Council Swarm, Difficulty Tuner, and Interviewer execute"""
        if not candidate_answer or not candidate_answer.strip():
            return {"error": "Answer cannot be empty."}

        # Record candidate message
        cand_msg = {
            "speaker": self.candidate_info.get("name", "Candidate"),
            "role": "candidate",
            "text": candidate_answer
        }
        if self.round_history:
            self.round_history[-1]["messages"].append(cand_msg)

        # 1. Telemetry: Candidate Answer received
        self._emit_telemetry("CANDIDATE", f"Candidate submitted {len(candidate_answer.split())} words", {
            "word_count": len(candidate_answer.split())
        })

        # 2. Fact-Checker Agent Grounding
        fact_result = fact_checker_agent.verify_answer(candidate_answer, topic=self.active_question.get("topic", ""))
        self._emit_telemetry("FACT_CHECKER", fact_result.get("agent_thought"), {
            "accuracy_score": fact_result["accuracy_score"],
            "flags_count": len(fact_result.get("flags", []))
        })

        # 3. Evaluator Agent Critique (Reflexion)
        eval_result = evaluator_agent.evaluate_response(
            candidate_answer=candidate_answer,
            question_data=self.active_question,
            round_history=self.round_history
        )
        self._emit_telemetry("EVALUATOR", eval_result.get("agent_thought"), {
            "overall_score": eval_result["scores"]["overall"],
            "rubric_coverage_pct": eval_result["rubric_alignment"].get("overall_coverage")
        })

        # 4. Council Swarm Deliberation
        council_result = None
        if enable_council:
            council_result = council_agent.deliberate(
                candidate_answer=candidate_answer,
                question_data=self.active_question,
                round_history=self.round_history
            )
            self._emit_telemetry("COUNCIL_SWARM", council_result.get("agent_thought"), {
                "consensus_pct": council_result["consensus_pct"],
                "lead_speaker": council_result["lead_speaker"]
            })

        # 5. ReAct Autonomous Tool Cycle Trace
        react_trace = react_agent.execute_react_cycle(candidate_answer, self.active_question)
        self._emit_telemetry("REACT_TOOLS", react_trace.get("agent_thought"), {
            "tools_invoked": react_trace.get("tools_invoked_count")
        })

        # 6. Adaptive Difficulty Update
        diff_update = difficulty_engine.update_rating(
            round_score=eval_result["scores"]["overall"]
        )
        self._emit_telemetry("DIFFICULTY_TUNER", diff_update.get("agent_thought"), {
            "current_elo": diff_update["current_elo"],
            "tier": diff_update["tier"],
            "delta": diff_update["delta"]
        })

        # 7. Contextual RAG lookup for follow-up
        rag_ctx = rag_pipeline.retrieve_interview_context(
            current_question_topic=self.active_question.get("topic", ""),
            track=self.track
        )

        # 8. Follow-up Formulation
        if enable_council and council_result and council_result.get("joint_followup"):
            followup = {
                "speaker": council_result["joint_followup"]["speaker"],
                "role": "interviewer",
                "persona": "council",
                "text": council_result["joint_followup"]["text"],
                "consensus_badge": council_result["consensus_status"],
                "agent_thought": f"Agent [Council Deliberation]: Consensus {council_result['consensus_pct']}%. Lead follow-up question dispatched."
            }
        else:
            followup = interviewer_agent.generate_followup(
                candidate_answer=candidate_answer,
                question_data=self.active_question,
                rag_context=rag_ctx,
                eval_critique=eval_result
            )

        self._emit_telemetry("INTERVIEWER", followup.get("agent_thought"), {
            "followup_speaker": followup["speaker"]
        })

        if self.round_history:
            self.round_history[-1]["messages"].append(followup)
            self.round_history[-1]["evaluation"] = eval_result
            self.round_history[-1]["fact_check"] = fact_result
            self.round_history[-1]["council_deliberation"] = council_result
            self.round_history[-1]["react_trace"] = react_trace
            self.round_history[-1]["difficulty_delta"] = diff_update["delta"]

        return {
            "session_id": self.session_id,
            "status": self.status,
            "evaluation": eval_result,
            "fact_check": fact_result,
            "council": council_result,
            "react_trace": react_trace,
            "difficulty": diff_update,
            "interviewer_response": followup,
            "telemetry": self.telemetry_events,
            "round_history": self.round_history
        }

    def deliberate_council(self, candidate_answer: str) -> Dict[str, Any]:
        """Directly invokes the 5-agent council committee to deliberate"""
        result = council_agent.deliberate(
            candidate_answer=candidate_answer,
            question_data=self.active_question,
            round_history=self.round_history
        )
        self._emit_telemetry("COUNCIL_SWARM", result["agent_thought"], {
            "consensus_pct": result["consensus_pct"],
            "lead": result["lead_speaker"]
        })
        return result

    def trigger_incident(self, scenario_id: Optional[str] = None) -> Dict[str, Any]:
        """Dispatches an asynchronous chaos engineering incident into the interview session"""
        res = chaos_agent.trigger_incident(scenario_id)
        inc = res["incident"]
        self._emit_telemetry("CHAOS_ENGINE", res["agent_thought"], {
            "incident_id": inc["id"],
            "severity": inc["severity"]
        })
        return res

    def triage_incident(self, action_id: str, candidate_rationale: str = "") -> Dict[str, Any]:
        """Executes candidate triage action on the active chaos incident"""
        res = chaos_agent.execute_triage(action_id, candidate_rationale)
        self._emit_telemetry("CHAOS_ENGINE", res["agent_thought"], {
            "status": res["status"],
            "score": res["score"]
        })
        return res

    def request_hint(self) -> Dict[str, Any]:
        """Provides progressive Socratic guidance without revealing answers"""
        hint_text = self.active_question.get(
            "context_hint",
            "Consider breaking down the problem into system boundaries, failure points, and data contracts."
        )
        msg = {
            "speaker": "Sophia (Coach Agent)",
            "role": "coach",
            "text": f"💡 Socratic Hint: {hint_text}",
            "agent_thought": "Agent [Coach]: Injected targeted hint to help candidate maintain momentum."
        }
        self._emit_telemetry("COACH", "Socratic guidance dispatched", {"hint": hint_text})
        if self.round_history:
            self.round_history[-1]["messages"].append(msg)

        return {
            "hint_message": msg,
            "telemetry": self.telemetry_events
        }

    def next_question(self) -> Dict[str, Any]:
        """Pivots to the next question in the track or elevated difficulty tier"""
        q_results = vector_db.query("questions_bank", self.track, top_k=10)
        curr_id = self.active_question.get("id")
        available = [
            q["metadata"] for q in q_results
            if q.get("metadata", {}).get("track") == self.track and q.get("metadata", {}).get("id") != curr_id
        ]
        if not available:
            all_q = vector_db.get_or_create_collection("questions_bank").documents
            available = [d.metadata for d in all_q if d.metadata.get("id") != curr_id]

        if available:
            self.active_question = available[0]
        else:
            self.active_question = {
                "id": "gen_next",
                "track": self.track,
                "topic": "Advanced Production Failure Modes",
                "difficulty": difficulty_engine.get_tier(),
                "company": "FAANG Tier",
                "question": "How do you handle cascading failure scenarios when downstream microservices degrade, without taking down core customer workflows?",
                "expected_rubric": ["Circuit Breakers", "Bulkheading", "Graceful Degradation", "Adaptive Rate Limiting"]
            }

        opening = interviewer_agent.ask_initial_question(
            self.active_question,
            candidate_name=self.candidate_info.get("name", "Candidate")
        )
        self._emit_telemetry("SUPERVISOR", f"Advanced to next question: '{self.active_question.get('topic')}'", {
            "new_question_id": self.active_question.get("id")
        })

        self.round_history.append({
            "type": "turn",
            "question_id": self.active_question.get("id"),
            "question_topic": self.active_question.get("topic"),
            "messages": [opening]
        })

        return {
            "active_question": self.active_question,
            "opening_message": opening,
            "telemetry": self.telemetry_events
        }

    def finish_session(self) -> Dict[str, Any]:
        """Finalizes session and produces comprehensive report"""
        self.status = "FINISHED"
        report = reporter_agent.generate_final_report(
            candidate_info=self.candidate_info,
            round_history=self.round_history,
            elo_rating=difficulty_engine.elo,
            tier=difficulty_engine.get_tier(),
            track=self.track
        )
        self._emit_telemetry("REPORTER", f"Executive report generated. Verdict: {report['verdict']}", {
            "final_elo": report["final_elo"],
            "verdict": report["verdict"]
        })

        return {
            "session_id": self.session_id,
            "status": self.status,
            "report": report,
            "telemetry": self.telemetry_events
        }

    def _emit_telemetry(self, node_id: str, message: str, metadata: Optional[Dict[str, Any]] = None):
        event = {
            "id": str(uuid.uuid4())[:8],
            "timestamp": time.strftime("%H:%M:%S"),
            "node": node_id,
            "message": message,
            "metadata": metadata or {}
        }
        self.telemetry_events.append(event)
        if len(self.telemetry_events) > 35:
            self.telemetry_events = self.telemetry_events[-35:]


supervisor = SupervisorAgent()
