import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AgentTelemetryGraph from './components/AgentTelemetryGraph';
import InterviewStage from './components/InterviewStage';
import CodeSandboxEditor from './components/CodeSandboxEditor';
import SystemDesignCanvas from './components/SystemDesignCanvas';
import PerformanceRadar from './components/PerformanceRadar';
import AgentCouncilWarRoom from './components/AgentCouncilWarRoom';
import ChaosIncidentSimulator from './components/ChaosIncidentSimulator';
import ResumeJdGapModal from './components/ResumeJdGapModal';
import AgentNodeInspectorModal from './components/AgentNodeInspectorModal';
import SetupModal from './components/SetupModal';
import RagInspectorModal from './components/RagInspectorModal';
import SettingsModal from './components/SettingsModal';
import PostInterviewReport from './components/PostInterviewReport';
import { api } from './services/api';
import { Terminal, Network, Target, Users, Flame } from 'lucide-react';

export default function App() {
  const [sessionData, setSessionData] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [activeTab, setActiveTab] = useState('radar');
  const [telemetry, setTelemetry] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [provider, setProvider] = useState('builtin');
  const [elo, setElo] = useState(1500);
  const [tier, setTier] = useState('Mid-Level');

  // Advanced Agentic State
  const [councilMode, setCouncilMode] = useState(true);
  const [councilData, setCouncilData] = useState(null);
  const [factCheckData, setFactCheckData] = useState(null);
  const [reactTrace, setReactTrace] = useState(null);
  const [activeIncident, setActiveIncident] = useState(null);

  // Modals & Node Inspector
  const [showSetup, setShowSetup] = useState(false);
  const [showVectorInspector, setShowVectorInspector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showGapModal, setShowGapModal] = useState(false);
  const [inspectedNodeId, setInspectedNodeId] = useState(null);
  const [showNodeInspector, setShowNodeInspector] = useState(false);
  const [finalReport, setFinalReport] = useState(null);

  // Initial load
  useEffect(() => {
    // 1. Fetch sample data
    api.getSampleData()
      .then(data => {
        setSampleData(data);
        startDefaultSession(data);
      })
      .catch(err => console.error('Failed to load sample data:', err));

    // 2. Fetch health & incident status
    api.getHealth()
      .then(h => {
        if (h.provider) setProvider(h.provider);
        if (h.current_elo) setElo(h.current_elo);
        if (h.tier) setTier(h.tier);
        if (h.active_incident) setActiveIncident(h.active_incident);
      })
      .catch(err => console.error('Failed to get health:', err));
  }, []);

  const startDefaultSession = async (sData) => {
    try {
      const defaultResume = sData?.sample_resumes?.ai_engineer;
      const res = await api.startSession({
        track: 'ai_agentic',
        persona: 'alex',
        resume_data: defaultResume,
        jd_text: 'Senior AI Engineer position at BigTech. Responsible for production RAG architectures, multi-agent frameworks, vector search, and LLM evaluations.'
      });
      setSessionData(res);
      setTelemetry(res.telemetry || []);
      setElo(res.elo || 1500);
      setTier(res.tier || 'Mid-Level');
      setActiveTab('radar');
    } catch (err) {
      console.error('Error starting default session:', err);
    }
  };

  const handleStartSession = async (payload) => {
    setIsThinking(true);
    try {
      const res = await api.startSession(payload);
      setSessionData(res);
      setTelemetry(res.telemetry || []);
      setElo(res.elo || 1500);
      setTier(res.tier || 'Mid-Level');
      setCouncilData(null);
      setFactCheckData(null);
      setReactTrace(null);
      setFinalReport(null);
      
      // Auto-switch right tab based on track
      if (payload.track === 'fullstack_swe') setActiveTab('code');
      else if (payload.track === 'system_design') setActiveTab('design');
      else setActiveTab('radar');
    } catch (err) {
      alert(`Failed to launch session: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendMessage = async (candidateAnswer) => {
    setIsThinking(true);
    try {
      const res = await api.submitAnswer(candidateAnswer, councilMode);
      if (res.error) {
        alert(res.error);
        return;
      }
      setSessionData(prev => ({
        ...prev,
        round_history: res.round_history,
        last_evaluation: res.evaluation
      }));
      setTelemetry(res.telemetry || []);
      
      if (res.council) setCouncilData(res.council);
      if (res.fact_check) setFactCheckData(res.fact_check);
      if (res.react_trace) setReactTrace(res.react_trace);

      if (res.difficulty) {
        setElo(res.difficulty.current_elo);
        setTier(res.difficulty.tier);
      }
    } catch (err) {
      alert(`Error submitting answer: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRequestHint = async () => {
    try {
      const res = await api.requestHint();
      setTelemetry(res.telemetry || []);
      setSessionData(prev => {
        const history = [...(prev?.round_history || [])];
        if (history.length > 0) {
          const lastRound = { ...history[history.length - 1] };
          lastRound.messages = [...(lastRound.messages || []), res.hint_message];
          history[history.length - 1] = lastRound;
        }
        return { ...prev, round_history: history };
      });
    } catch (err) {
      alert(`Failed to get hint: ${err.message}`);
    }
  };

  const handleNextQuestion = async () => {
    setIsThinking(true);
    try {
      const res = await api.nextQuestion();
      setSessionData(prev => ({
        ...prev,
        active_question: res.active_question,
        round_history: [
          ...(prev?.round_history || []),
          {
            type: 'turn',
            question_id: res.active_question.id,
            question_topic: res.active_question.topic,
            messages: [res.opening_message]
          }
        ]
      }));
      setTelemetry(res.telemetry || []);
      if (res.active_question.starter_code) setActiveTab('code');
      else if (res.active_question.track === 'system_design') setActiveTab('design');
    } catch (err) {
      alert(`Failed to advance question: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSelectTailoredQuestion = (tailoredQ) => {
    const openingMsg = {
      speaker: 'Alex Vance (Principal Architect)',
      role: 'interviewer',
      persona: 'alex',
      text: `Hello Candidate! Based on our RAG gap analysis, we detected an opportunity in ${tailoredQ.topic}.\n\nHere is your custom drill: ${tailoredQ.question}`,
      agent_thought: `Agent [Gap Analyzer]: Injected targeted drill probing candidate blindspot in ${tailoredQ.topic}.`
    };

    setSessionData(prev => ({
      ...prev,
      active_question: tailoredQ,
      round_history: [
        ...(prev?.round_history || []),
        {
          type: 'turn',
          question_id: tailoredQ.id,
          question_topic: tailoredQ.topic,
          messages: [openingMsg]
        }
      ]
    }));
  };

  const handleInspectNode = (nodeId) => {
    setInspectedNodeId(nodeId);
    setShowNodeInspector(true);
  };

  const handleFinishSession = async () => {
    setIsThinking(true);
    try {
      const res = await api.finishSession();
      setFinalReport(res.report);
      setTelemetry(res.telemetry || []);
      setShowReport(true);
    } catch (err) {
      alert(`Failed to finish session: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  const currentTrackObj = sampleData?.tracks?.find(t => t.id === sessionData?.active_question?.track);
  const trackTitle = currentTrackObj ? currentTrackObj.title : 'AI & Agentic Systems';

  const lastTurn = sessionData?.round_history?.[sessionData.round_history.length - 1];
  const lastEval = lastTurn?.evaluation || sessionData?.last_evaluation;

  return (
    <div className="app-container">
      {/* Top HUD Navigation */}
      <Navbar
        sessionData={sessionData}
        onOpenSetup={() => setShowSetup(true)}
        onOpenVectorInspector={() => setShowVectorInspector(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenGapAnalyzer={() => setShowGapModal(true)}
        onFinishSession={handleFinishSession}
        provider={provider}
        elo={elo}
        tier={tier}
        trackTitle={trackTitle}
        activeIncident={activeIncident}
        councilMode={councilMode}
      />

      <main className="main-content">
        {/* Agent Telemetry Live Workflow Graph with Interactive Node Inspection */}
        <AgentTelemetryGraph 
          telemetry={telemetry} 
          onInspectNode={handleInspectNode}
        />

        {/* Two-column Interactive Stage */}
        <div className="stage-grid">
          {/* Left Column: Chat Feed & Audio Stage */}
          <InterviewStage
            sessionData={sessionData}
            onSendMessage={handleSendMessage}
            onRequestHint={handleRequestHint}
            onNextQuestion={handleNextQuestion}
            onFinishSession={handleFinishSession}
            isThinking={isThinking}
            councilMode={councilMode}
            onToggleCouncilMode={() => setCouncilMode(!councilMode)}
            activeIncident={activeIncident}
            onOpenChaosWarRoom={() => setActiveTab('chaos')}
            onOpenCouncilWarRoom={() => setActiveTab('council')}
          />

          {/* Right Column: Multi-tool Workbench */}
          <div className="workbench-container glass-panel">
            {/* Tabs */}
            <div className="workbench-tabs" style={{ flexWrap: 'wrap', overflowX: 'auto' }}>
              <button
                className={`tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
                onClick={() => setActiveTab('radar')}
                id="tab-radar"
              >
                <Target size={14} color={activeTab === 'radar' ? '#00f2fe' : '#94a3b8'} />
                <span>Radar & Rubrics</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'council' ? 'active' : ''}`}
                onClick={() => setActiveTab('council')}
                id="tab-council"
              >
                <Users size={14} color={activeTab === 'council' ? '#38bdf8' : '#94a3b8'} />
                <span>Council War Room</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'chaos' ? 'active' : ''}`}
                onClick={() => setActiveTab('chaos')}
                id="tab-chaos"
              >
                <Flame size={14} color={activeTab === 'chaos' ? '#f43f5e' : '#94a3b8'} />
                <span>Chaos Incident {activeIncident?.status === 'FIRING' ? '🚨' : ''}</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'design' ? 'active' : ''}`}
                onClick={() => setActiveTab('design')}
                id="tab-design"
              >
                <Network size={14} color={activeTab === 'design' ? '#00f2fe' : '#94a3b8'} />
                <span>Architecture</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
                id="tab-code"
              >
                <Terminal size={14} color={activeTab === 'code' ? '#00f2fe' : '#94a3b8'} />
                <span>Python REPL & Tests</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="workbench-body">
              {activeTab === 'radar' && (
                <PerformanceRadar
                  scores={lastEval?.scores}
                  rubricAlignment={lastEval?.rubric_alignment}
                  elo={elo}
                  tier={tier}
                />
              )}

              {activeTab === 'council' && (
                <AgentCouncilWarRoom
                  councilData={councilData}
                  factCheckData={factCheckData}
                  reactTrace={reactTrace}
                  onTriggerReDebate={() => {
                    const lastAns = sessionData?.round_history?.[sessionData.round_history.length - 1]?.messages?.filter(m => m.role === 'candidate')?.pop()?.text;
                    if (lastAns) handleSendMessage(lastAns);
                  }}
                  isThinking={isThinking}
                />
              )}

              {activeTab === 'chaos' && (
                <ChaosIncidentSimulator
                  activeIncident={activeIncident}
                  onIncidentUpdated={(updated) => setActiveIncident(updated)}
                />
              )}

              {activeTab === 'design' && (
                <SystemDesignCanvas activeQuestion={sessionData?.active_question} />
              )}

              {activeTab === 'code' && (
                <CodeSandboxEditor activeQuestion={sessionData?.active_question} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Node Inspector Modal */}
      <AgentNodeInspectorModal
        isOpen={showNodeInspector}
        onClose={() => setShowNodeInspector(false)}
        nodeId={inspectedNodeId}
        telemetry={telemetry}
      />

      {/* Modals */}
      <ResumeJdGapModal
        isOpen={showGapModal}
        onClose={() => setShowGapModal(false)}
        sampleResumes={sampleData?.sample_resumes || {}}
        onSelectTailoredQuestion={handleSelectTailoredQuestion}
      />

      <SetupModal
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        sampleData={sampleData}
        onStartSession={handleStartSession}
        currentTrack={sessionData?.active_question?.track}
        currentPersona={sessionData?.opening_message?.persona}
      />

      <RagInspectorModal
        isOpen={showVectorInspector}
        onClose={() => setShowVectorInspector(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentProvider={provider}
        onSettingsSaved={(newProv) => setProvider(newProv)}
      />

      <PostInterviewReport
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        report={finalReport}
        onRestart={() => {
          setShowReport(false);
          setShowSetup(true);
        }}
      />
    </div>
  );
}
