/**
 * PrepMind AI - API Service Layer
 * Interfaces with FastAPI backend REST endpoints
 */

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  async getSampleData() {
    const res = await fetch(`${API_BASE}/sample-data`);
    if (!res.ok) throw new Error('Failed to fetch sample data');
    return res.json();
  },

  async updateSettings(provider, apiKey = '', model = '') {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, api_key: apiKey, model }),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async startSession(payload) {
    const res = await fetch(`${API_BASE}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to start interview session');
    return res.json();
  },

  async submitAnswer(answer, enableCouncil = true) {
    const res = await fetch(`${API_BASE}/session/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, enable_council: enableCouncil }),
    });
    if (!res.ok) throw new Error('Failed to submit answer');
    return res.json();
  },

  async deliberateCouncil(candidateAnswer) {
    const res = await fetch(`${API_BASE}/agent/council/deliberate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_answer: candidateAnswer }),
    });
    if (!res.ok) throw new Error('Failed to deliberate council');
    return res.json();
  },

  async triggerChaosIncident(scenarioId = null) {
    const res = await fetch(`${API_BASE}/incident/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId }),
    });
    if (!res.ok) throw new Error('Failed to trigger chaos incident');
    return res.json();
  },

  async triageChaosIncident(actionId, candidateRationale = '') {
    const res = await fetch(`${API_BASE}/incident/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_id: actionId, candidate_rationale: candidateRationale }),
    });
    if (!res.ok) throw new Error('Failed to execute triage');
    return res.json();
  },

  async getIncidentStatus() {
    const res = await fetch(`${API_BASE}/incident/status`);
    if (!res.ok) throw new Error('Failed to fetch incident status');
    return res.json();
  },

  async auditArchitecture(selectedBlocks, qps = 15000, objectSizeKb = 2.0) {
    const res = await fetch(`${API_BASE}/design/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selected_blocks: selectedBlocks,
        qps: qps,
        object_size_kb: objectSizeKb,
      }),
    });
    if (!res.ok) throw new Error('Failed to audit architecture');
    return res.json();
  },

  async runCode(code) {
    const res = await fetch(`${API_BASE}/code/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error('Failed to execute code');
    return res.json();
  },

  async runCodeTestSuite(code, topic = 'Algorithm') {
    const res = await fetch(`${API_BASE}/code/test-suite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, topic }),
    });
    if (!res.ok) throw new Error('Failed to run test suite');
    return res.json();
  },

  async analyzeResumeJdGap(resumeData = null, jdText = '') {
    const res = await fetch(`${API_BASE}/rag/analyze-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_data: resumeData, jd_text: jdText }),
    });
    if (!res.ok) throw new Error('Failed to analyze resume/JD gap');
    return res.json();
  },

  async requestHint() {
    const res = await fetch(`${API_BASE}/session/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to get hint');
    return res.json();
  },

  async nextQuestion() {
    const res = await fetch(`${API_BASE}/session/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to advance question');
    return res.json();
  },

  async finishSession() {
    const res = await fetch(`${API_BASE}/session/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to finish session');
    return res.json();
  },

  async inspectVectorDB() {
    const res = await fetch(`${API_BASE}/vector/inspect`);
    if (!res.ok) throw new Error('Failed to inspect vector DB');
    return res.json();
  },

  async transcribeVoice(audioBase64) {
    const res = await fetch(`${API_BASE}/voice/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_base64: audioBase64 }),
    });
    if (!res.ok) throw new Error('Transcription request failed');
    return res.json();
  },
};
