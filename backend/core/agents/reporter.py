"""
Reporter Agent for PrepMind AI
Aggregates complete multi-agent interview telemetry into an executive scorecard,
radar chart dimensions, and an actionable 7-day personalized prep roadmap.
"""

from typing import Dict, Any, List


class ReporterAgent:
    def __init__(self):
        self.name = "Executive Debrief Reporter"

    def generate_final_report(
        self,
        candidate_info: Dict[str, Any],
        round_history: List[Dict[str, Any]],
        elo_rating: int,
        tier: str,
        track: str
    ) -> Dict[str, Any]:
        """Synthesizes all round turns into a holistic report"""
        if not round_history:
            return self._empty_report()

        # Compute average metrics across turns
        all_scores = [turn.get("evaluation", {}).get("scores", {}) for turn in round_history if "evaluation" in turn]
        if not all_scores:
            all_scores = [{
                "problem_solving": 82, "technical_depth": 80,
                "communication": 85, "architecture": 78, "cultural_fit": 88, "overall": 83
            }]

        def avg_metric(key):
            vals = [s.get(key, 75) for s in all_scores if key in s]
            return int(sum(vals) / max(len(vals), 1))

        radar_scores = {
            "problem_solving": avg_metric("problem_solving"),
            "technical_depth": avg_metric("technical_depth"),
            "communication": avg_metric("communication"),
            "architecture": avg_metric("architecture"),
            "cultural_fit": avg_metric("cultural_fit"),
            "overall": avg_metric("overall")
        }

        # Determine hiring decision
        overall = radar_scores["overall"]
        if overall >= 88:
            verdict = "STRONG HIRE"
            readiness = "Exceeds Expectations for Senior/Staff Tier"
        elif overall >= 78:
            verdict = "HIRE"
            readiness = "Solid Fit for Target Level"
        elif overall >= 65:
            verdict = "LEANING HIRE"
            readiness = "Needs minor refinement in architectural trade-offs"
        else:
            verdict = "NEEDS REVISION"
            readiness = "Recommended 2-3 weeks targeted drill before on-site"

        # Collect strengths and areas for growth
        strengths = []
        improvements = []
        for turn in round_history:
            ev = turn.get("evaluation", {})
            for st in ev.get("strengths", []):
                if st not in strengths:
                    strengths.append(st)
            for imp in ev.get("areas_for_improvement", []):
                if imp not in improvements:
                    improvements.append(imp)

        if not strengths:
            strengths = ["Structured thought process", "Clear technical terminology", "Professional delivery"]
        if not improvements:
            improvements = ["Quantify P99 latency SLA metrics", "Address extreme failure recovery scenarios"]

        # Personalized 7-Day Roadmap
        roadmap = self._generate_roadmap(track, improvements)

        return {
            "candidate_name": candidate_info.get("name", "Candidate"),
            "target_track": track,
            "verdict": verdict,
            "readiness_summary": readiness,
            "final_elo": elo_rating,
            "tier": tier,
            "radar_scores": radar_scores,
            "top_strengths": strengths[:4],
            "key_growth_areas": improvements[:4],
            "seven_day_roadmap": roadmap,
            "total_questions_completed": len(round_history)
        }

    def _generate_roadmap(self, track: str, gaps: List[str]) -> List[Dict[str, str]]:
        if track == "ai_agentic":
            return [
                {"day": "Day 1", "focus": "Hybrid RAG & Reciprocal Rank Fusion", "action": "Implement BM25 + dense vector fusion with Cohere/bge cross-encoder rerankers."},
                {"day": "Day 2", "focus": "Autonomous Multi-Agent StateGraphs", "action": "Build cycle-free state machines in LangGraph with human-in-the-loop checkpoints."},
                {"day": "Day 3", "focus": "LLM Evaluation Triad", "action": "Set up continuous automated evaluations for Groundedness, Faithfulness, and Answer Relevance."},
                {"day": "Day 4", "focus": "Safe Tool Calling & Idempotency", "action": "Design schema validation, retry budgets, and sandbox isolation for external tools."},
                {"day": "Day 5", "focus": "Inference Optimization & KV Cache", "action": "Deep dive into vLLM, PagedAttention, and AWQ/GPTQ quantization tradeoffs."},
                {"day": "Day 6", "focus": "Mock Drill with Alex (Bar Raiser)", "action": "Execute a timed 45-minute live simulation on high-concurrency agent workflows."},
                {"day": "Day 7", "focus": "Resume Cross-Examination Defense", "action": "Rehearse deep-dive technical justifications for every metric on your resume."}
            ]
        elif track == "system_design":
            return [
                {"day": "Day 1", "focus": "Capacity Estimation Math", "action": "Practice back-of-the-envelope calculations for storage, QPS, and network bandwidth."},
                {"day": "Day 2", "focus": "Distributed ID & Caching Layers", "action": "Master Snowflake ID generators, Redis cluster topologies, and cache stampede mitigations."},
                {"day": "Day 3", "focus": "Partitioning & Sharding", "action": "Deep dive into consistent hashing, virtual nodes, and rebalancing protocols."},
                {"day": "Day 4", "focus": "Real-time Sync (CRDT vs OT)", "action": "Analyze state-based vs operation-based CRDTs for collaborative canvases."},
                {"day": "Day 5", "focus": "Event Streams & Consensus", "action": "Study Kafka partition rebalances, idempotent producers, and Raft consensus."},
                {"day": "Day 6", "focus": "End-to-End Timed Mock", "action": "Design a globally distributed URL shortener and live whiteboard canvas in 45 min."},
                {"day": "Day 7", "focus": "Trade-off Polish", "action": "Memorize CAP theorem, PACELC theorem, and latency numbers every programmer should know."}
            ]
        else:
            return [
                {"day": "Day 1", "focus": "STAR Framework Foundations", "action": "Structure top 5 engineering career accomplishments strictly using the STAR format."},
                {"day": "Day 2", "focus": "Technical Conflict & Disagreement", "action": "Draft 2 stories demonstrating 'Disagree and Commit' backed by empirical benchmark data."},
                {"day": "Day 3", "focus": "Production Outage Post-Mortems", "action": "Walk through 5 Whys, blast-radius mitigation, and blameless systemic improvements."},
                {"day": "Day 4", "focus": "Cross-Functional Influence", "action": "Rehearse scenarios where you influenced product roadmap without formal authority."},
                {"day": "Day 5", "focus": "Algorithmic & Code Walkthroughs", "action": "Practice articulating time and space complexities out loud before writing code."},
                {"day": "Day 6", "focus": "Full Behavioral Simulation", "action": "Conduct a live voice interview session with Elena Rostova (Director Persona)."},
                {"day": "Day 7", "focus": "Final Alignment & Questions for Interviewer", "action": "Prepare 6 reverse-interview questions about engineering culture and architecture."}
            ]

    def _empty_report(self) -> Dict[str, Any]:
        return {
            "candidate_name": "Candidate",
            "verdict": "INCOMPLETE",
            "readiness_summary": "No completed turns recorded.",
            "final_elo": 1500,
            "tier": "Mid-Level",
            "radar_scores": {"problem_solving": 50, "technical_depth": 50, "communication": 50, "architecture": 50, "cultural_fit": 50, "overall": 50},
            "top_strengths": [],
            "key_growth_areas": [],
            "seven_day_roadmap": []
        }


reporter_agent = ReporterAgent()
