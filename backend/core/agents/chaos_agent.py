"""
Chaos Engineering & Live Production Incident Simulator for PrepMind AI
Autonomous Chaos Agent (Chaos Monkey AI) that dynamically injects real-time
production anomalies, emits live server telemetry & error logs, and evaluates
candidate incident triage and disaster recovery strategies.
"""

import time
import random
from typing import Dict, Any, List, Optional

INCIDENT_SCENARIOS = [
    {
        "id": "inc_redis_split_brain",
        "title": "Redis Sentinel Split-Brain & Cache Stampede",
        "severity": "SEV-1 CRITICAL",
        "service": "Session & User Profile Caching Cluster",
        "description": "Cross-AZ network partition triggered dual primary master elections. Cache hit ratio collapsed from 99.4% to 11.2%, sending 65,000 QPS directly to un-indexed Postgres primary.",
        "normal_metrics": {"qps": 65000, "p99_latency_ms": 38, "error_rate_pct": 0.02, "cpu_load_pct": 32},
        "incident_metrics": {"qps": 65000, "p99_latency_ms": 1850, "error_rate_pct": 24.8, "cpu_load_pct": 98},
        "resolved_metrics": {"qps": 65000, "p99_latency_ms": 42, "error_rate_pct": 0.04, "cpu_load_pct": 36},
        "initial_logs": [
            "[CRITICAL] redis-sentinel-01: Quorum failure. Multiple masters reported: 10.0.4.12 and 10.0.5.88",
            "[WARN] app-api-gateway: Cache MISS surge detected. Hit ratio: 11.2%",
            "[ERROR] postgres-primary: Connection pool saturated (500/500 active threads). Rejecting new queries.",
            "[ALERT] pagerduty: Outage in SessionService. P99 latency breached 1500ms SLA threshold."
        ],
        "available_actions": [
            {
                "id": "action_fence_and_shed",
                "label": "Fence Old Primary & Engage Rate Limiter",
                "is_optimal": True,
                "remediation_log": "Executed node fencing on 10.0.4.12. Activated token bucket rate limiting on ingress gateway. Postgres connection pool returning to nominal.",
                "explanation": "Correct Staff-level triage: Fencing prevents data divergence, while ingress shed protects database from catastrophic cascade."
            },
            {
                "id": "action_restart_db",
                "label": "Hard Restart PostgreSQL Primary",
                "is_optimal": False,
                "remediation_log": "PostgreSQL service killed and restarting... Extended downtime by 180 seconds. In-flight transactions aborted.",
                "explanation": "Dangerous anti-pattern: Restarting the database during a cache stampede immediately overwhelms the restarting node upon reboot."
            },
            {
                "id": "action_rebuild_cache",
                "label": "Warm Up Cache with Batch Script",
                "is_optimal": False,
                "remediation_log": "Batch cache warming script launched. Generated additional 20k QPS load on saturated database.",
                "explanation": "Premature action: You cannot warm the cache while the database is already connection-starved."
            }
        ]
    },
    {
        "id": "inc_kafka_partition_lag",
        "title": "Kafka Consumer Thread Starvation & Rebalance Storm",
        "severity": "SEV-2 MAJOR",
        "service": "Order Processing & Billing Pipeline",
        "description": "Slow downstream external payment webhook caused consumer heartbeat timeout. Continuous rebalance storms halted order message consumption across all 32 partitions.",
        "normal_metrics": {"qps": 22000, "p99_latency_ms": 85, "error_rate_pct": 0.05, "cpu_load_pct": 40},
        "incident_metrics": {"qps": 22000, "p99_latency_ms": 3200, "error_rate_pct": 18.5, "cpu_load_pct": 89},
        "resolved_metrics": {"qps": 22000, "p99_latency_ms": 95, "error_rate_pct": 0.08, "cpu_load_pct": 44},
        "initial_logs": [
            "[ERROR] kafka-consumer-04: max.poll.interval.ms exceeded (300000ms). Sending LeaveGroup request.",
            "[WARN] kafka-coordinator: PreparingRebalance on group 'order-workers'. All consumers paused.",
            "[CRITICAL] consumer-lag-monitor: Partition lag surpassed 450,000 unconsumed events.",
            "[ALERT] orders-api: HTTP 504 Gateway Timeout while awaiting async payment fulfillment."
        ],
        "available_actions": [
            {
                "id": "action_cooperative_sticky",
                "label": "Switch to Cooperative Sticky Assignor & Decouple Worker Pool",
                "is_optimal": True,
                "remediation_log": "Configured CooperativeStickyAssignor to prevent stop-the-world pauses. Offloaded slow webhooks to unbounded async worker queue with circuit breakers.",
                "explanation": "Optimal: Cooperative rebalances only reassign affected partitions, and async worker threads protect the Kafka poll loop."
            },
            {
                "id": "action_increase_poll_timeout",
                "label": "Increase max.poll.interval.ms to 1 hour",
                "is_optimal": False,
                "remediation_log": "Poll timeout increased. Dead consumers now take up to 60 minutes to be detected by cluster coordinator.",
                "explanation": "Suboptimal workaround: Masks the underlying architectural bottleneck and delays failure detection."
            }
        ]
    },
    {
        "id": "inc_vector_db_oom",
        "title": "HNSW Vector DB Memory Exhaustion & Query Degradation",
        "severity": "SEV-2 MAJOR",
        "service": "Production Semantic RAG & Search Cluster",
        "description": "High-dimensional embedding insertion batch caused resident memory to exceed Kubernetes container limits. Pods stuck in CrashLoopBackOff.",
        "normal_metrics": {"qps": 8500, "p99_latency_ms": 25, "error_rate_pct": 0.01, "cpu_load_pct": 45},
        "incident_metrics": {"qps": 8500, "p99_latency_ms": 1420, "error_rate_pct": 31.0, "cpu_load_pct": 99},
        "resolved_metrics": {"qps": 8500, "p99_latency_ms": 30, "error_rate_pct": 0.03, "cpu_load_pct": 52},
        "initial_logs": [
            "[CRITICAL] kubelet: Container 'milvus-querynode-2' terminated with OOMKilled (Exit Code 137).",
            "[ERROR] rag-orchestrator: Vector similarity search failed. Falling back to un-indexed linear scan.",
            "[WARN] envoy-proxy: Upstream connection failure rate rising: 31%",
            "[ALERT] pagerduty: Enterprise Search RAG latency breached 1000ms SLA."
        ],
        "available_actions": [
            {
                "id": "action_quantize_and_shard",
                "label": "Enable Product Quantization (IVF-PQ) & Horizontal Sharding",
                "is_optimal": True,
                "remediation_log": "Applied Product Quantization (PQ8), reducing vector memory footprint by 75%. Added 4 query nodes to distribute segment load.",
                "explanation": "Optimal: Quantization drastically compresses vector footprints into RAM, eliminating memory pressure."
            },
            {
                "id": "action_drop_index",
                "label": "Drop HNSW Index and Query Raw Vectors",
                "is_optimal": False,
                "remediation_log": "HNSW index dropped. Query time increased from 25ms to 8,500ms due to exhaustive O(N) dot-product scan.",
                "explanation": "Fatal failure: Dropping the index avoids OOM but makes search latency completely unacceptable for real-time traffic."
            }
        ]
    }
]


class ChaosAgent:
    def __init__(self):
        self.active_incident: Optional[Dict[str, Any]] = None
        self.incident_history: List[Dict[str, Any]] = []

    def trigger_incident(self, scenario_id: Optional[str] = None) -> Dict[str, Any]:
        """Triggers a dynamic chaos engineering production incident"""
        if scenario_id:
            scenario = next((s for s in INCIDENT_SCENARIOS if s["id"] == scenario_id), None)
        else:
            scenario = random.choice(INCIDENT_SCENARIOS)

        if not scenario:
            scenario = INCIDENT_SCENARIOS[0]

        incident_copy = {
            "id": scenario["id"],
            "title": scenario["title"],
            "severity": scenario["severity"],
            "service": scenario["service"],
            "description": scenario["description"],
            "status": "FIRING",
            "start_time": time.strftime("%H:%M:%S"),
            "current_metrics": dict(scenario["incident_metrics"]),
            "normal_metrics": dict(scenario["normal_metrics"]),
            "logs": list(scenario["initial_logs"]),
            "available_actions": scenario["available_actions"],
            "triage_resolved": False
        }

        self.active_incident = incident_copy
        self.incident_history.append(incident_copy)

        agent_thought = (
            f"Agent [Chaos Incident Engine]: Injected {incident_copy['severity']} scenario: '{incident_copy['title']}'. "
            f"Current P99 Latency: {incident_copy['current_metrics']['p99_latency_ms']}ms. Error rate: {incident_copy['current_metrics']['error_rate_pct']}%."
        )

        return {
            "incident": incident_copy,
            "agent_thought": agent_thought
        }

    def execute_triage(self, action_id: str, candidate_rationale: str = "") -> Dict[str, Any]:
        """Evaluates candidate incident mitigation command and rationale"""
        if not self.active_incident:
            # Re-trigger default
            self.trigger_incident()

        incident = self.active_incident
        action = next((a for a in incident["available_actions"] if a["id"] == action_id), None)

        if not action:
            return {"error": "Invalid action ID specified."}

        is_optimal = action["is_optimal"]
        
        # New log entry
        new_log = f"[{time.strftime('%H:%M:%S')}] [COMMAND] {action['remediation_log']}"
        incident["logs"].append(new_log)

        if is_optimal:
            incident["status"] = "RECOVERED"
            incident["triage_resolved"] = True
            incident["current_metrics"] = {
                "qps": incident["normal_metrics"]["qps"],
                "p99_latency_ms": incident["normal_metrics"]["p99_latency_ms"] + random.randint(2, 6),
                "error_rate_pct": 0.04,
                "cpu_load_pct": incident["normal_metrics"]["cpu_load_pct"] + random.randint(1, 4)
            }
            incident["logs"].append(f"[{time.strftime('%H:%M:%S')}] [RECOVERY] System metrics returned within SLA boundaries. Alert resolved.")
            score = 95 if len(candidate_rationale.split()) >= 10 else 88
            critique = f"Excellent triage command executed! {action['explanation']}"
        else:
            incident["status"] = "DEGRADED"
            incident["triage_resolved"] = False
            incident["current_metrics"]["p99_latency_ms"] += 450
            incident["current_metrics"]["error_rate_pct"] = min(99.0, incident["current_metrics"]["error_rate_pct"] + 12.0)
            incident["logs"].append(f"[{time.strftime('%H:%M:%S')}] [FAILURE] Action failed to stabilize cluster. Error rate increased.")
            score = 55
            critique = f"Triage strategy had adverse side effects: {action['explanation']}"

        agent_thought = (
            f"Agent [Chaos Incident Engine]: Triage action '{action['label']}' evaluated. "
            f"Resolution status: {incident['status']}. Score: {score}/100."
        )

        return {
            "status": incident["status"],
            "score": score,
            "critique": critique,
            "updated_incident": incident,
            "agent_thought": agent_thought
        }

    def get_status(self) -> Optional[Dict[str, Any]]:
        return self.active_incident


chaos_agent = ChaosAgent()
