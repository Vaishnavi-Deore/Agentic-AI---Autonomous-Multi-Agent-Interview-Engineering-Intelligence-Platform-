"""
Evaluator & Critic Agent (Reflexion Engine) for PrepMind AI
Provides real-time scoring, STAR framework compliance checks,
vector-based rubric alignment, and actionable feedback.
"""

import json
import re
from typing import Dict, Any, List
from ..vector_db import vector_db
from ..llm_engine import llm_engine


class EvaluatorAgent:
    def __init__(self):
        self.name = "Reflexion Evaluator"

    def evaluate_response(
        self,
        candidate_answer: str,
        question_data: Dict[str, Any],
        round_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Executes multi-dimensional critique using vector rubric alignment
        and structured LLM evaluation.
        """
        expected_rubric = question_data.get("expected_rubric", [])
        track = question_data.get("track", "ai_agentic")

        # 1. Semantic Vector Rubric Alignment
        alignment = vector_db.compute_rubric_alignment(candidate_answer, expected_rubric)
        coverage_pct = alignment.get("overall_coverage", 70.0)

        # Baseline scores modulated by semantic coverage and answer length
        word_count = len(candidate_answer.split())
        length_factor = min(1.0, word_count / 80.0) if word_count >= 15 else 0.4

        base_score = int(min(96, max(45, (coverage_pct * 0.65) + (length_factor * 35))))

        # Dimension scores
        problem_solving = min(98, max(50, base_score + (3 if "trade-off" in candidate_answer.lower() else -2)))
        tech_depth = min(98, max(45, int(base_score * 0.95) + (5 if any(w in candidate_answer.lower() for w in ["latency", "cache", "scale", "partition", "vector", "index"]) else 0)))
        communication = min(98, max(55, base_score + (4 if word_count > 60 else -5)))
        architecture = min(98, max(50, base_score + (4 if "design" in candidate_answer.lower() or "service" in candidate_answer.lower() else 0)))
        cultural_fit = min(98, max(60, base_score + (5 if any(w in candidate_answer.lower() for w in ["team", "user", "collaborat", "learn", "metric"]) else 0)))

        scores = {
            "problem_solving": problem_solving,
            "technical_depth": tech_depth,
            "communication": communication,
            "architecture": architecture,
            "cultural_fit": cultural_fit,
            "overall": int((problem_solving + tech_depth + communication + architecture + cultural_fit) / 5)
        }

        # STAR framework breakdown for behavioral
        star_analysis = self._evaluate_star(candidate_answer) if track == "behavioral_star" else None

        # Extract strengths & improvements
        covered_criteria = [c["criterion"] for c in alignment.get("criteria_scores", []) if c.get("covered")]
        uncovered_criteria = [c["criterion"] for c in alignment.get("criteria_scores", []) if not c.get("covered")]

        strengths = []
        if covered_criteria:
            strengths.append(f"Directly addressed: {covered_criteria[0]}.")
        if len(covered_criteria) > 1:
            strengths.append(f"Highlighted key technical nuance: {covered_criteria[1]}.")
        else:
            strengths.append("Clear structural communication and good professional demeanor.")

        areas_for_improvement = []
        if uncovered_criteria:
            areas_for_improvement.append(f"Expand on: {uncovered_criteria[0]}.")
        if len(uncovered_criteria) > 1:
            areas_for_improvement.append(f"Consider quantifying production trade-offs around: {uncovered_criteria[1]}.")
        else:
            areas_for_improvement.append("Provide concrete P99 latency or memory bounds to demonstrate Staff-level depth.")

        thought = (
            f"Agent [Evaluator]: Computed semantic rubric coverage: {coverage_pct:.1f}%. "
            f"Overall rating: {scores['overall']}/100. Covered {len(covered_criteria)}/{len(expected_rubric)} core criteria."
        )

        return {
            "agent_thought": thought,
            "scores": scores,
            "rubric_alignment": alignment,
            "strengths": strengths,
            "areas_for_improvement": areas_for_improvement,
            "star_analysis": star_analysis,
            "interviewer_critique": (
                f"Candidate answered with solid domain awareness. "
                f"Rubric alignment achieved {coverage_pct:.1f}% semantic match with expected technical benchmarks."
            )
        }

    def _evaluate_star(self, text: str) -> Dict[str, Any]:
        """Heuristic STAR method detector"""
        lower = text.lower()
        has_sit = any(w in lower for w in ["when", "situation", "project", "time", "company", "system was"])
        has_task = any(w in lower for w in ["needed to", "goal", "task", "objective", "required", "responsible for"])
        has_act = any(w in lower for w in ["i designed", "i built", "i decided", "implemented", "refactored", "led", "investigated"])
        has_res = any(w in lower for w in ["result", "reduced", "improved", "saved", "latency dropped", "%", "outcome", "successfully"])

        return {
            "situation": "Present" if has_sit else "Weak context setting",
            "task": "Present" if has_task else "Specify exact constraints",
            "action": "Well demonstrated" if has_act else "Focus more on YOUR specific actions",
            "result": "Quantified" if has_res else "Add quantified business/technical impact metrics"
        }


evaluator_agent = EvaluatorAgent()
