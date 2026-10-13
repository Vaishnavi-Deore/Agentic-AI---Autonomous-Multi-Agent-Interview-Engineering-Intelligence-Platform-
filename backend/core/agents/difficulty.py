"""
Adaptive Difficulty Engine for PrepMind AI
Uses an ELO-inspired rating system to dynamically adjust question complexity
and provide scaffolding or deep-dive challenges.
"""

from typing import Dict, Any


class DifficultyEngine:
    def __init__(self, initial_elo: int = 1500):
        self.elo = initial_elo
        self.history = [initial_elo]

    def update_rating(self, round_score: int, expected_score: int = 70) -> Dict[str, Any]:
        """
        Updates candidate ELO rating based on round performance.
        K-factor = 32.
        """
        k = 32
        actual = round_score / 100.0
        expected = expected_score / 100.0
        delta = int(k * (actual - expected))

        self.elo = max(1000, min(2200, self.elo + delta))
        self.history.append(self.elo)

        tier = self.get_tier()
        action = "elevate" if delta > 8 else ("maintain" if delta >= -5 else "scaffold")

        return {
            "current_elo": self.elo,
            "delta": delta,
            "tier": tier,
            "recommendation": action,
            "agent_thought": f"Agent [Difficulty Tuner]: Candidate ELO adjusted by {delta:+d} -> {self.elo} ({tier} tier). Mode: {action}."
        }

    def get_tier(self) -> str:
        if self.elo >= 1850:
            return "Staff / Principal"
        elif self.elo >= 1650:
            return "Senior"
        elif self.elo >= 1400:
            return "Mid-Level"
        else:
            return "Associate / Junior"


difficulty_engine = DifficultyEngine()
