"""
Fact-Checker & Grounding Agent (Dr. Vera Cross) for PrepMind AI
Inspects candidate technical assertions, identifies buzzword usage vs depth,
catches common architectural misconceptions, and benchmarks against production realities.
"""

import re
from typing import Dict, Any, List

# Canonical technical ground truths and common architectural traps
KNOWLEDGE_FACTS = [
    {
        "keywords": ["raft", "consensus", "latency", "cross-region"],
        "check": lambda text: "zero" in text and "latency" in text,
        "flag": "Misconception: Raft consensus requires a majority quorum round-trip (RTT), introducing 40-100ms+ cross-region latency overhead.",
        "severity": "HIGH",
        "verified_fact": "Raft leader election and log replication require majority round-trips. Cross-region deployments must factor in WAN latency bounds."
    },
    {
        "keywords": ["kafka", "loss", "guarantee", "ack"],
        "check": lambda text: ("zero data loss" in text or "never lose" in text) and "acks=all" not in text and "min.insync.replicas" not in text,
        "flag": "Caveat: Kafka only guarantees zero data loss when configured with acks=all (or -1) and min.insync.replicas >= 2.",
        "severity": "MEDIUM",
        "verified_fact": "Default Kafka producer acks=1 can lose messages if the partition leader fails before replica synchronization."
    },
    {
        "keywords": ["vector", "index", "hnsw", "o(1)"],
        "check": lambda text: "o(1)" in text and ("vector" in text or "hnsw" in text),
        "flag": "Misconception: Approximate Nearest Neighbor (HNSW / IVF-PQ) search is O(log N) or O(M * log N), not O(1).",
        "severity": "HIGH",
        "verified_fact": "HNSW uses hierarchical proximity graphs with logarithmic search complexity O(log N) balancing recall vs query latency."
    },
    {
        "keywords": ["redis", "persistence", "memory"],
        "check": lambda text: "only in-memory" in text or "no persistence" in text,
        "flag": "Incomplete: Redis supports both RDB point-in-time snapshots and AOF (Append-Only File) fsync persistence.",
        "severity": "LOW",
        "verified_fact": "Redis offers configurable durability via AOF (appendfsync everysec/always) and RDB snapshots."
    },
    {
        "keywords": ["crdt", "conflict", "eventual"],
        "check": lambda text: "crdt" in text,
        "flag": None, # Positive match
        "severity": "POSITIVE",
        "verified_fact": "Correctly leveraged Conflict-Free Replicated Data Types (State-based / Operation-based) for mathematically guaranteed convergence."
    },
    {
        "keywords": ["circuit breaker", "cascading", "bulkhead"],
        "check": lambda text: "circuit breaker" in text or "bulkhead" in text,
        "flag": None,
        "severity": "POSITIVE",
        "verified_fact": "Exemplary resilience pattern identified for preventing thread pool exhaustion during downstream degradation."
    }
]


class FactCheckerAgent:
    def __init__(self):
        self.name = "Dr. Vera Cross"
        self.title = "Technical Fact-Checker & Grounding Verifier"

    def verify_answer(self, candidate_answer: str, topic: str = "") -> Dict[str, Any]:
        """
        Analyzes candidate response for factual technical correctness,
        quantified precision, and buzzword vs substance ratio.
        """
        text_lower = candidate_answer.lower()
        findings: List[Dict[str, Any]] = []
        positive_citations: List[str] = []
        flags: List[str] = []

        # 1. Inspect knowledge facts
        for fact in KNOWLEDGE_FACTS:
            if any(kw in text_lower for kw in fact["keywords"]):
                if fact["check"](text_lower):
                    if fact["flag"]:
                        flags.append(fact["flag"])
                        findings.append({
                            "type": "WARNING",
                            "severity": fact["severity"],
                            "message": fact["flag"],
                            "correction": fact["verified_fact"]
                        })
                elif fact["severity"] == "POSITIVE":
                    positive_citations.append(fact["verified_fact"])

        # 2. Metric & Numerical Precision Check (Staff-level indicators)
        has_quantified_metrics = bool(re.search(r'\d+(\.\d+)?\s*(ms|s|gb|mb|qps|tb|k|%)', text_lower))
        metric_score = 92 if has_quantified_metrics else 68

        # 3. Buzzword Density vs Explanation Quality
        buzzwords = ["scale", "synergy", "modern", "microservices", "ai", "cloud-native", "seamless", "robust", "vector"]
        buzzword_count = sum(1 for bw in buzzwords if bw in text_lower)
        word_count = len(candidate_answer.split())
        buzzword_ratio = buzzword_count / max(word_count, 1)

        # Baseline accuracy score
        base_accuracy = 88
        if flags:
            base_accuracy -= (len(flags) * 12)
        if positive_citations:
            base_accuracy += min(10, len(positive_citations) * 5)
        if has_quantified_metrics:
            base_accuracy += 6

        accuracy_score = max(45, min(99, base_accuracy))

        agent_thought = (
            f"Agent [Fact-Checker Dr. Vera]: Verified technical assertions. "
            f"Accuracy: {accuracy_score}%. Flags identified: {len(flags)}. "
            f"Quantified engineering SLA metrics: {'Present' if has_quantified_metrics else 'Omitted (Recommended)'}."
        )

        return {
            "speaker": self.name,
            "title": self.title,
            "accuracy_score": accuracy_score,
            "has_quantified_metrics": has_quantified_metrics,
            "flags": flags,
            "positive_citations": positive_citations[:3],
            "findings": findings,
            "buzzword_ratio": round(buzzword_ratio, 3),
            "agent_thought": agent_thought
        }


fact_checker_agent = FactCheckerAgent()
