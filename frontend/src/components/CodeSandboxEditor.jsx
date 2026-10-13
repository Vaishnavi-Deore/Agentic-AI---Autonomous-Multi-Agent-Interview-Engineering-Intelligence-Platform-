import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Sparkles,
  Zap,
  Gauge
} from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_PYTHON_STARTER = `def calculate_rrf(rank_sparse, rank_dense, k=60):
    """
    Reciprocal Rank Fusion (RRF) calculation for Hybrid Search
    Score = sum(1 / (k + rank))
    """
    rrf_scores = {}
    
    # Process sparse BM25 ranks
    for doc_id, rank in rank_sparse.items():
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank))
        
    # Process dense vector ranks
    for doc_id, rank in rank_dense.items():
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank))
        
    return sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)

# Test execution with sample ranks
sparse_ranks = {"doc_1": 1, "doc_2": 2, "doc_3": 5}
dense_ranks = {"doc_2": 1, "doc_3": 2, "doc_4": 3}

results = calculate_rrf(sparse_ranks, dense_ranks)
print("Hybrid RRF Ranked Documents:")
for doc, score in results:
    print(f" -> {doc}: {score:.5f}")
`;

export default function CodeSandboxEditor({ activeQuestion }) {
  const [code, setCode] = useState(DEFAULT_PYTHON_STARTER);
  const [output, setOutput] = useState('');
  const [execTime, setExecTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [testSuiteResult, setTestSuiteResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (activeQuestion?.starter_code) {
      setCode(activeQuestion.starter_code);
    }
  }, [activeQuestion]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Executing in isolated sandbox...');
    setHasError(false);
    try {
      const res = await api.runCode(code);
      if (res.success) {
        setOutput(res.output || 'Done (no stdout output)');
        setExecTime(res.execution_time_ms);
        setHasError(false);
      } else {
        setOutput(res.error || res.traceback || 'Execution failed.');
        setExecTime(res.execution_time_ms);
        setHasError(true);
      }
    } catch (err) {
      setOutput(`Error communicating with sandbox: ${err.message}`);
      setHasError(true);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunTestSuite = async () => {
    setIsTesting(true);
    try {
      const res = await api.runCodeTestSuite(code, activeQuestion?.topic || 'Algorithm');
      setTestSuiteResult(res);
      if (res.raw_output) {
        setOutput(res.raw_output);
        setExecTime(res.execution_time_ms);
      }
    } catch (err) {
      alert(`Test suite execution failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setCode(activeQuestion?.starter_code || DEFAULT_PYTHON_STARTER);
    setOutput('');
    setExecTime(null);
    setHasError(false);
    setTestSuiteResult(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', gap: '0.75rem' }}>
      <div className="code-editor-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} color="#00f2fe" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
            Python Sandbox REPL & Dynamic Test Suite
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleReset} 
            title="Reset code"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem' }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleRunTestSuite}
            disabled={isTesting}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', borderColor: '#a855f7', color: '#c084fc' }}
          >
            <Sparkles size={12} />
            <span>{isTesting ? 'Testing...' : 'AI Test Suite & Big-O'}</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={handleRun}
            disabled={isRunning}
            id="btn-run-code"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
          >
            <Play size={12} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Text Area */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck="false"
        className="code-textarea"
        style={{
          minHeight: '220px',
          width: '100%',
          padding: '0.75rem',
          background: '#040711',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          color: '#e2e8f0',
          resize: 'vertical'
        }}
      />

      {/* Dynamic Test Suite Results Panel */}
      {testSuiteResult && (
        <div className="glass-panel" style={{
          padding: '0.85rem 1rem',
          borderLeft: `4px solid ${testSuiteResult.success ? '#10b981' : '#f59e0b'}`,
          background: 'rgba(0,0,0,0.35)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gauge size={15} color="#00f2fe" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                AI Automated Test Harness ({testSuiteResult.passed_tests}/{testSuiteResult.total_tests} Passed)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                Time: {testSuiteResult.time_complexity}
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                Space: {testSuiteResult.space_complexity}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.45rem' }}>
            {testSuiteResult.tests?.map((t, idx) => (
              <div key={idx} style={{
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                background: t.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                border: `1px solid ${t.passed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                fontSize: '0.72rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: t.passed ? '#a7f3d0' : '#fecdd3' }}>
                  <span>{t.name}</span>
                  <span>{t.passed ? '✔ PASS' : '✘ FAIL'}</span>
                </div>
                <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {t.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stdout Console */}
      <div className="terminal-container" style={{
        background: '#02040a',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.75rem 1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>STDOUT OUTPUT</div>
          {execTime !== null && (
            <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={11} />
              <span>{execTime}ms</span>
            </div>
          )}
        </div>

        <pre style={{
          fontFamily: 'monospace',
          fontSize: '0.78rem',
          color: hasError ? '#f43f5e' : '#34d399',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          maxHeight: '120px',
          overflowY: 'auto'
        }}>
          {output || 'Click "Run Code" or "AI Test Suite" to execute.'}
        </pre>
      </div>
    </div>
  );
}
