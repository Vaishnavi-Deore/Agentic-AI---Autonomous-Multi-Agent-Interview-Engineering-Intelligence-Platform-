"""
Multi-Agent Council Deliberation Engine for PrepMind AI
Coordinates real-time collaborative and adversarial debate among specialized AI agents:
1. Alex Vance (Principal Distributed Systems Architect)
2. Marcus Kane (Algorithmic & Performance Specialist)
3. Elena Rostova (Director of Engineering & Leadership)
4. Dr. Vera Cross (Technical Fact-Checker & Grounding Verifier)
5. Sophia Martinez (FAANG Executive Career & Socratic Coach)

Simulates live executive committee deliberation, cross-agent dialogue,
rubric consensus scoring, and unified follow-up challenge formulation.
"""

import random
from typing import Dict, Any, List
from .interviewer import INTERVIEWER_PERSONAS
from .evaluator import evaluator_agent
from .fact_checker import fact_checker_agent
from ..llm_engine import llm_engine


class CouncilAgent:
    def __init__(self):
        self.name = "Executive Bar Raiser Council"

    def deliberate(
        self,
        candidate_answer: str,
        question_data: Dict[str, Any],
        round_history: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes a multi-agent deliberation where the committee members
        cross-examine the candidate's answer from their distinct domains.
        """
        topic = question_data.get("topic", "System Architecture")
        expected_rubric = question_data.get("expected_rubric", [])
        
        # 1. Fact-check the answer
        fact_result = fact_checker_agent.verify_answer(candidate_answer, topic=topic)
        
        # 2. Reflexion evaluation
        eval_result = evaluator_agent.evaluate_response(
            candidate_answer=candidate_answer,
            question_data=question_data,
            round_history=round_history or []
        )
        scores = eval_result["scores"]
        
        # 3. Individual Agent Perspectives in the Council
        # Alex (Architect)
        alex_score = scores.get("architecture", 80)
        alex_verdict = "APPROVED" if alex_score >= 82 else "NEEDS DEEPER MITIGATION"
        alex_speech = (
            f"From an architectural standpoint, the candidate's treatment of {topic} touched key structural components. "
            + (f"However, we need explicit guarantees for split-brain avoidance and P99 latency protection." if alex_score < 85
               else f"The decomposition into decoupled fault domains demonstrates solid Staff-level maturity.")
        )

        # Marcus (Algorithms)
        marcus_score = scores.get("problem_solving", 82)
        marcus_verdict = "OPTIMAL" if marcus_score >= 85 else "SCRUTINIZE COMPLEXITY"
        marcus_speech = (
            f"Looking at data access patterns: the candidate proposed plausible logic, but I want to see "
            f"their exact time/space invariants under peak write concurrency. Are we talking O(1) amortized or O(log N) lookup overhead?"
        )

        # Elena (Director)
        elena_score = scores.get("cultural_fit", 85)
        elena_verdict = "STRONG FIT" if elena_score >= 80 else "PROBE OWNERSHIP"
        elena_speech = (
            f"Communication cadence is clear. Notice how they framed the problem boundary. "
            f"I want to ensure they can defend this decision before product stakeholders when downstream SLAs degrade."
        )

        # Dr. Vera (Fact-Checker)
        vera_score = fact_result.get("accuracy_score", 85)
        vera_verdict = "VERIFIED" if vera_score >= 80 else "FACTUAL FLAGS"
        vera_flags_str = "; ".join(fact_result.get("flags", [])) if fact_result.get("flags") else "No hallucinated claims detected."
        vera_speech = (
            f"Technical verification completed: {fact_result['accuracy_score']}% confidence. "
            f"{vera_flags_str}"
        )

        # Sophia (Socratic Coach)
        sophia_speech = (
            f"Candidate is demonstrating composure. Let's steer the next question toward their greatest opportunity: "
            f"elevating from a high-level overview into rigorous, quantified production resilience."
        )

        # 4. Cross-Agent Interaction / Dialogue Exchanges
        dialogue = [
            {
                "speaker": "Alex Vance",
                "role": "Principal Architect",
                "avatar": "architect",
                "color": "#38bdf8",
                "text": alex_speech,
                "score": alex_score,
                "verdict": alex_verdict
            },
            {
                "speaker": "Marcus Kane",
                "role": "Algorithmic Specialist",
                "avatar": "algorithms",
                "color": "#a855f7",
                "text": marcus_speech,
                "score": marcus_score,
                "verdict": marcus_verdict
            },
            {
                "speaker": "Dr. Vera Cross",
                "role": "Technical Fact-Checker",
                "avatar": "verifier",
                "color": "#00f2fe",
                "text": vera_speech,
                "score": vera_score,
                "verdict": vera_verdict
            },
            {
                "speaker": "Elena Rostova",
                "role": "Director of Engineering",
                "avatar": "director",
                "color": "#f43f5e",
                "text": elena_speech,
                "score": elena_score,
                "verdict": elena_verdict
            },
            {
                "speaker": "Sophia Martinez",
                "role": "Executive Coach",
                "avatar": "mentor",
                "color": "#10b981",
                "text": sophia_speech,
                "score": scores.get("communication", 86),
                "verdict": "SUPPORTIVE"
            }
        ]

        # 5. Consensus Calculation
        avg_score = int((alex_score + marcus_score + vera_score + elena_score + scores.get("communication", 86)) / 5)
        consensus_pct = min(98, max(55, int(avg_score * 0.98 + (5 if not fact_result.get("flags") else -10))))
        
        if consensus_pct >= 85:
            consensus_status = "UNANIMOUS APPROVAL (STAFF TIER)"
            lead_speaker = "Alex Vance"
        elif consensus_pct >= 72:
            consensus_status = "MAJORITY CONCURRENCE WITH SCRUTINY"
            lead_speaker = "Marcus Kane" if vera_score > 75 else "Dr. Vera Cross"
        else:
            consensus_status = "DIVERGENCE ON ARCHITECTURAL SOUNDNESS"
            lead_speaker = "Dr. Vera Cross"

        # 6. Unified Follow-up Challenge
        joint_followup_prompt = (
            f"Candidate asserted: '{candidate_answer[:200]}...'\n"
            f"The Council is probing: {topic}. Lead speaker: {lead_speaker}.\n"
            f"Craft a razor-sharp, multi-faceted follow-up question that challenges their specific trade-offs."
        )

        joint_question_text = (
            f"The committee acknowledges your approach to {topic}. However, Alex and Marcus want to drill down: "
            f"If downstream services experience asymmetric network partitions and cache hit ratio drops to zero, "
            f"how specifically does your data layer maintain consistency without cascading timeout saturation across the cluster?"
        )

        return {
            "consensus_pct": consensus_pct,
            "consensus_status": consensus_status,
            "lead_speaker": lead_speaker,
            "overall_score": avg_score,
            "dialogue": dialogue,
            "fact_check": fact_result,
            "eval_scores": scores,
            "joint_followup": {
                "speaker": lead_speaker,
                "text": joint_question_text,
                "consensus_badge": consensus_status
            },
            "agent_thought": (
                f"Agent [Council Swarm]: Convened 5-agent deliberation. "
                f"Consensus achieved: {consensus_pct}%. Lead interrogator: {lead_speaker}."
            )
        }


council_agent = CouncilAgent()
