"""
Comprehensive Test Suite for Advanced Agentic AI Capabilities:
1. Health & Initial State
2. Session Start & RAG Embedding Ingestion
3. Answer Submission with 5-Agent Council Swarm & ReAct Tool Loop
4. Fact-Checker Grounding & Hallucination/Anti-Pattern Flags
5. Chaos Engineering Incident Injection & Incident Triage
6. System Design AI Architecture Audit (SPOF & Capacity)
7. Code Sandbox AI Dynamic Test Suite & Big-O Complexity
8. Resume vs JD Semantic Gap Radar & Tailored Challenge Synthesis
"""

from fastapi.testclient import TestClient
from app import app


def test_full_agentic_intelligence_pipeline():
    client = TestClient(app)

    print("\n[TEST 1] Checking API Health...")
    health = client.get("/api/health").json()
    assert health["status"] == "healthy"
    print(" -> Health check OK:", health["tier"])

    print("\n[TEST 2] Starting Session with RAG Resume...")
    start_payload = {
        "track": "ai_agentic",
        "persona": "alex",
        "jd_text": "Senior Distributed AI Systems Engineer. Lead RAG pipelines, LangGraph state graphs, and disaster recovery."
    }
    start_res = client.post("/api/session/start", json=start_payload).json()
    assert "session_id" in start_res
    assert "active_question" in start_res
    print(" -> Session started. Question topic:", start_res["active_question"]["topic"])

    print("\n[TEST 3] Submitting Answer with Council Swarm Mode & ReAct Execution...")
    ans_text = "I recommend using sliding-window chunking, dense vector search with BM25 sparse search via Reciprocal Rank Fusion, Raft consensus for leader election with quorum replication, and circuit breakers with bulkhead thread pools to isolate cascading downstream failures."
    ans_res = client.post("/api/session/answer", json={"answer": ans_text, "enable_council": True}).json()
    
    assert "council" in ans_res
    assert "fact_check" in ans_res
    assert "react_trace" in ans_res
    assert "evaluation" in ans_res
    
    council = ans_res["council"]
    assert council["consensus_pct"] > 50
    assert len(council["dialogue"]) == 5
    print(f" -> Council Swarm: Consensus {council['consensus_pct']}% - Status: {council['consensus_status']}")
    print(f" -> Lead Interrogator: {council['lead_speaker']}")

    fact_check = ans_res["fact_check"]
    assert fact_check["accuracy_score"] >= 80
    print(f" -> Fact-Checker Dr. Vera: Accuracy {fact_check['accuracy_score']}% - Flags: {len(fact_check['flags'])}")

    react_trace = ans_res["react_trace"]
    assert react_trace["tools_invoked_count"] == 3
    print(f" -> ReAct Autonomous Trace: {react_trace['tools_invoked_count']} sequenced tool calls completed")

    print("\n[TEST 4] Triggering Chaos Engineering Incident...")
    chaos_res = client.post("/api/incident/trigger", json={}).json()
    inc = chaos_res["incident"]
    assert inc["status"] == "FIRING"
    print(f" -> Chaos Incident Injected: {inc['severity']} - '{inc['title']}'")
    print(f" -> Latency: {inc['current_metrics']['p99_latency_ms']}ms | Error Rate: {inc['current_metrics']['error_rate_pct']}%")

    print("\n[TEST 5] Triaging Chaos Incident with Optimal Runbook...")
    opt_action = next(a["id"] for a in inc["available_actions"] if a["is_optimal"])
    triage_res = client.post("/api/incident/triage", json={
        "action_id": opt_action,
        "candidate_rationale": "Fence degraded primary master and shed uncacheable queries via ingress token bucket rate limiter to protect database thread pools."
    }).json()
    assert triage_res["status"] == "RECOVERED"
    assert triage_res["score"] >= 85
    print(f" -> Triage Outcome: {triage_res['status']} | Score: {triage_res['score']}/100")
    print(f" -> Feedback: {triage_res['critique'][:90]}...")

    print("\n[TEST 6] Running AI Architecture Audit on Topology...")
    audit_res = client.post("/api/design/audit", json={
        "selected_blocks": ["cdn", "gateway", "service", "redis", "db"],
        "qps": 25000,
        "object_size_kb": 2.5
    }).json()
    assert audit_res["resilience_score"] >= 70
    print(f" -> Architecture Resilience Score: {audit_res['resilience_score']}/100 ({audit_res['verdict']})")
    print(f" -> Positive Patterns: {len(audit_res['positive_patterns'])} | Vulnerabilities: {len(audit_res['findings'])}")

    print("\n[TEST 7] Running AI Automated Code Test Suite & Big-O Benchmark...")
    test_code = """
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

arr = [1, 3, 5, 7, 9, 11]
idx = binary_search(arr, 7)
print("Found target at index:", idx)
"""
    code_res = client.post("/api/code/test-suite", json={"code": test_code, "topic": "Binary Search"}).json()
    assert code_res["passed_tests"] == code_res["total_tests"]
    print(f" -> Automated Test Suite: {code_res['passed_tests']}/{code_res['total_tests']} tests passed")
    print(f" -> Complexity: Time {code_res['time_complexity']}, Space {code_res['space_complexity']}")

    print("\n[TEST 8] Running Resume & JD Semantic Gap Radar...")
    gap_res = client.post("/api/rag/analyze-match", json={
        "jd_text": "Senior Distributed AI Systems Engineer. Experience with Kafka partition tuning, vector embeddings, and zero-downtime consensus."
    }).json()
    assert gap_res["overall_match_pct"] > 50
    assert len(gap_res["tailored_challenges"]) == 3
    print(f" -> Gap Radar Match: {gap_res['overall_match_pct']}%")
    print(f" -> Generated {len(gap_res['tailored_challenges'])} custom gap-probing challenges")

    print("\n=======================================================")
    print("  ALL ADVANCED AGENTIC AI CAPABILITY TESTS PASSED! SUCCESS!  ")
    print("=======================================================\n")


if __name__ == "__main__":
    test_full_agentic_intelligence_pipeline()
