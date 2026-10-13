import React, { useState } from 'react';
import { X, Sparkles, Key, Check, Cpu } from 'lucide-react';
import { api } from '../services/api';

export default function SettingsModal({ isOpen, onClose, currentProvider = 'builtin', onSettingsSaved }) {
  const [provider, setProvider] = useState(currentProvider);
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [model, setModel] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const activeKey = provider === 'gemini' ? geminiKey : (provider === 'openai' ? openaiKey : '');
      const res = await api.updateSettings(provider, activeKey, model);
      setSuccessMsg(res.message || 'Settings saved successfully!');
      if (onSettingsSaved) {
        onSettingsSaved(provider);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      alert(`Error updating settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
              LLM Engine & Execution Provider
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Choose your execution mode. The built-in agent engine works offline with zero API key!
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Provider Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* Built-in Engine */}
            <div
              onClick={() => setProvider('builtin')}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: provider === 'builtin' ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${provider === 'builtin' ? '#00f2fe' : 'rgba(255, 255, 255, 0.08)'}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>
                  ⚡ Built-in Autonomous Agent Engine (Recommended)
                </strong>
                {provider === 'builtin' && <Check size={16} color="#00f2fe" />}
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                Zero setup required. Instant realistic responses, vector rubric alignment, and reflexions.
              </p>
            </div>

            {/* Google Gemini API */}
            <div
              onClick={() => setProvider('gemini')}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: provider === 'gemini' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${provider === 'gemini' ? '#a855f7' : 'rgba(255, 255, 255, 0.08)'}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>
                  ✨ Google Gemini API (gemini-2.0-flash / gemini-1.5-pro)
                </strong>
                {provider === 'gemini' && <Check size={16} color="#a855f7" />}
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                Uses live Google Gemini for generative agent thoughts and conversational dynamic follow-ups.
              </p>
            </div>

            {/* OpenAI API */}
            <div
              onClick={() => setProvider('openai')}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: provider === 'openai' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${provider === 'openai' ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>
                  🌐 OpenAI API (gpt-4o / gpt-4o-mini)
                </strong>
                {provider === 'openai' && <Check size={16} color="#10b981" />}
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                Uses OpenAI client for chat completions and function responses.
              </p>
            </div>
          </div>

          {/* API Key Input based on selection */}
          {provider === 'gemini' && (
            <div>
              <label style={{ fontSize: '0.78rem', color: '#a855f7', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Gemini API Key (optional if GEMINI_API_KEY env is set)
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                style={{
                  width: '100%',
                  background: '#070a14',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          )}

          {provider === 'openai' && (
            <div>
              <label style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                OpenAI API Key (optional if OPENAI_API_KEY env is set)
              </label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                style={{
                  width: '100%',
                  background: '#070a14',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          )}

          {successMsg && (
            <div style={{ color: '#34d399', fontSize: '0.8rem', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
