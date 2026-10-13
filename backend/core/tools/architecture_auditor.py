"""
Architecture Auditor Tool for PrepMind AI
Analyzes system design topology, detects Single Points of Failure (SPOF),
computes throughput bounds, and generates architectural resilience score.
"""

from typing import List, Dict, Any


class ArchitectureAuditor:
    @staticmethod
    def audit_topology(selected_block_ids: List[str], qps: int = 15000, object_size_kb: float = 2.0) -> Dict[str, Any]:
        """
        Inspects system design topology blocks, checks for critical architectural
        deficiencies, and computes resilience score.
        """
        blocks = set(selected_block_ids)
        findings = []
        score = 85

        # 1. Edge & Ingress Check
        if "gateway" not in blocks:
            score -= 15
            findings.append({
                "type": "SPOF",
                "severity": "CRITICAL",
                "title": "Missing API Gateway & Rate Limiter",
                "detail": "Direct client traffic to microservices leaves cluster vulnerable to DDoS attacks, lack of authentication termination, and uncontrolled traffic spikes."
            })
        
        if "cdn" not in blocks and qps > 10000:
            score -= 10
            findings.append({
                "type": "PERFORMANCE",
                "severity": "MEDIUM",
                "title": "Missing Global CDN Layer",
                "detail": f"At {qps:,} QPS, serving static assets and cacheable responses without edge caching saturates origin servers and balloons international round-trip latency."
            })

        # 2. Caching & Database Protection Check
        if "redis" not in blocks and "db" in blocks:
            score -= 20
            findings.append({
                "type": "BOTTLENECK",
                "severity": "HIGH",
                "title": "Unprotected Database Layer",
                "detail": "No caching layer in front of relational/NoSQL storage. Database connection pools and IOPS will saturate rapidly under read spikes."
            })

        # 3. Asynchronous Decoupling Check
        if qps >= 10000 and "kafka" not in blocks:
            score -= 12
            findings.append({
                "type": "RESILIENCE",
                "severity": "MEDIUM",
                "title": "Synchronous Coupling Risk",
                "detail": "High-write throughput without an asynchronous event log (Kafka / SQS) creates cascading backpressure when downstream services slow down."
            })

        # Positive reinforcements
        positive_patterns = []
        if "cdn" in blocks and "gateway" in blocks:
            positive_patterns.append("Two-tier ingress security (Edge CDN + Centralized Gateway)")
        if "redis" in blocks:
            positive_patterns.append("Sub-5ms low-latency memory caching tier")
        if "kafka" in blocks:
            positive_patterns.append("Decoupled event-driven asynchronous message buffering")
        if "s3" in blocks:
            positive_patterns.append("Separation of binary blob storage from structured database")

        score = max(35, min(98, score + (len(positive_patterns) * 3)))

        # Back of the envelope math
        daily_req = qps * 86400
        daily_storage_gb = round((daily_req * object_size_kb) / (1024 * 1024), 2)
        bandwidth_gbps = round((qps * object_size_kb * 8) / (1024 * 1024), 2)

        verdict = "PRODUCTION READY (STAFF)" if score >= 85 else ("ACCEPTABLE WITH CAVEATS" if score >= 70 else "VULNERABLE TOPOLOGY")

        return {
            "resilience_score": score,
            "verdict": verdict,
            "findings": findings,
            "positive_patterns": positive_patterns,
            "metrics": {
                "qps": qps,
                "daily_requests_est": f"{daily_req:,}",
                "daily_storage_gb": daily_storage_gb,
                "bandwidth_gbps": bandwidth_gbps
            },
            "architect_verdict": f"Architectural Audit completed. Resilience Rating: {score}/100 ({verdict}). {len(findings)} vulnerability alerts identified."
        }


architecture_auditor = ArchitectureAuditor()
