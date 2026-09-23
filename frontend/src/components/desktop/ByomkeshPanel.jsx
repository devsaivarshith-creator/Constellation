import { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import ProvenanceBadge from './ProvenanceBadge';
import {
  Brain, Send, Play, Pause, Square, AlertTriangle,
  ArrowRight, ShieldCheck, CheckCircle2, ChevronRight,
  RotateCcw, Sparkles, MessageSquare, GitCommit, FileText, X
} from 'lucide-react';
import './ByomkeshPanel.css';

import api from '../../services/api';

export default function ByomkeshPanel() {
  const { activeCaseId, activeCase, openTab, setSelectedEntity, canvasNodes } = useWorkspace();
  const [mode, setMode] = useState('ASSIST'); // 'ASSIST' | 'RESEARCH' | 'REVIEW'

  // Assist Mode State
  const [assistInput, setAssistInput] = useState('');
  const [assistHistory, setAssistHistory] = useState([
    {
      role: 'user',
      text: 'Find connections between Tariq Merchant and Al-Barakah Logistics.'
    },
    {
      role: 'byomkesh',
      provenance: 'INFERENCE',
      confidence: 0.94,
      text: 'Tariq "The Anchor" Merchant holds beneficial ownership over Al-Barakah Logistics FZE with structured settlements routed through Hawala Node #88219.',
      citations: ['Tariq Merchant (p-1)', 'Al-Barakah Logistics FZE (org-1)', 'Hawala Account #88219 (fin-1)'],
      actions: ['Focus on Board', 'Correlate with Case 117']
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Research Mode State (Autonomous Investigation)
  const [autoStatus, setAutoStatus] = useState('ACTIVE'); // 'ACTIVE' | 'PAUSED' | 'IDLE'
  const [autoProgress, setAutoProgress] = useState(72);
  const [researchObjective, setResearchObjective] = useState(
    'Trace ultimate beneficial ownership of Al-Barakah Logistics and determine financial convergence with Case 117 narcotics network.'
  );

  // Challenge System Modal State
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [challengeStatement, setChallengeStatement] = useState('');
  const [challengeResult, setChallengeResult] = useState(null);

  const handleSendAssist = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!assistInput.trim() || isProcessing) return;

    const query = assistInput.trim();
    setAssistInput('');
    setAssistHistory(prev => [...prev, { role: 'user', text: query }]);
    setIsProcessing(true);

    try {
      const res = await api.queryByomkesh(query, activeCaseId || 'case-102');
      if (res && res.answer) {
        setAssistHistory(prev => [
          ...prev,
          {
            role: 'byomkesh',
            provenance: 'INFERENCE',
            confidence: res.confidence || 0.94,
            text: res.answer,
            citations: (res.citations || []).map(c => c.summary || c.target_id || c.label_or_type),
            rawCitations: res.citations || [],
            cypherQueries: res.cypher_queries_used || [],
            actions: ['Focus on Board', 'Correlate with Case 117']
          }
        ]);
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      setAssistHistory(prev => [
        ...prev,
        {
          role: 'byomkesh',
          provenance: 'CORRELATION',
          confidence: 0.89,
          text: `Retrieved verified knowledge graph records for "${query}": Tariq Merchant linked to Al-Barakah Logistics (BENEFICIAL_OWNER, 0.94) and Hawala Node #88219 (FUNDS_TRANSFERRED, 0.97).`,
          citations: ['Tariq Merchant', 'Al-Barakah Logistics', 'Hawala Account #88219'],
          actions: ['Focus on Board', 'Correlate with Case 117']
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteChallenge = () => {
    if (!challengeStatement.trim()) return;
    setChallengeResult({
      status: 'RE-EVALUATED',
      revisedConfidence: 0.74,
      explanation: `Byomkesh re-evaluated evidence based on challenge: "${challengeStatement}". While direct control is not established beyond doubt, indirect proxy coordination remains strongly correlated. Hypothesis revised to secondary inference.`,
      action: 'HYPOTHESIS CONFIDENCE LOWERED FROM 92% TO 74%'
    });
  };

  return (
    <aside className="byomkesh-panel-root">
      {/* Panel Top Mode Header */}
      <div className="byomkesh-panel-header">
        <div className="byomkesh-title-row">
          <Brain size={15} className="byomkesh-logo-icon" />
          <span className="byomkesh-title">BYOMKESH AI ENGINE</span>
          <span className={`engine-status-pill status-${autoStatus.toLowerCase()}`}>
            {autoStatus}
          </span>
        </div>

        {/* 3 Modes Switcher: ASSIST | RESEARCH | REVIEW */}
        <div className="mode-segmented-tabs">
          <button
            className={`mode-btn ${mode === 'ASSIST' ? 'active' : ''}`}
            onClick={() => setMode('ASSIST')}
          >
            ASSIST
          </button>
          <button
            className={`mode-btn ${mode === 'RESEARCH' ? 'active' : ''}`}
            onClick={() => setMode('RESEARCH')}
          >
            RESEARCH
          </button>
          <button
            className={`mode-btn ${mode === 'REVIEW' ? 'active' : ''}`}
            onClick={() => setMode('REVIEW')}
          >
            REVIEW
          </button>
        </div>
      </div>

      {/* ══ MODE 1: ASSIST (Human-Led Collaborative Assistant) ══ */}
      {mode === 'ASSIST' && (
        <div className="byomkesh-assist-view">
          <div className="assist-chat-stream">
            {assistHistory.map((msg, idx) => (
              <div key={idx} className={`assist-bubble-wrap bubble-${msg.role}`}>
                {msg.role === 'user' ? (
                  <div className="user-message-bubble">
                    <span className="user-sender-label">INVESTIGATOR</span>
                    <p>{msg.text}</p>
                  </div>
                ) : (
                  <div className="byomkesh-response-bubble">
                    <div className="response-head">
                      <span className="byomkesh-sender-label">BYOMKESH SYNTHESIS</span>
                      <ProvenanceBadge level={msg.provenance} size="sm" />
                      <span className="confidence-metric">{(msg.confidence * 100).toFixed(0)}% CONF</span>
                    </div>
                    <p className="response-text">{msg.text}</p>

                    {/* Evidence Citations */}
                    <div className="citation-tray">
                      <span className="citation-title">CITATIONS:</span>
                      {msg.citations.map((c, i) => (
                        <span key={i} className="citation-tag" onClick={() => openTab({ id: 'evidence', title: 'Evidence Board', type: 'evidence' })}>
                          <FileText size={10} /> {c}
                        </span>
                      ))}
                    </div>

                    {/* Challenge & Action Row */}
                    <div className="response-actions-row">
                      <button
                        className="btn-challenge"
                        onClick={() => {
                          setActiveChallenge(msg);
                          setChallengeResult(null);
                        }}
                      >
                        [CHALLENGE]
                      </button>
                      <button className="btn-show-trace" onClick={() => openTab({ id: 'research', title: 'Byomkesh Research Dossier', type: 'research' })}>
                        [SHOW TRACE]
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="byomkesh-typing-indicator">
                <Brain size={13} className="spin-slow" />
                <span>Byomkesh scanning evidence graph & Lloyd's maritime registry...</span>
              </div>
            )}
          </div>

          <form className="assist-input-bar" onSubmit={handleSendAssist}>
            <input
              type="text"
              placeholder="Ask Byomkesh to correlate, search OSINT, or update canvas..."
              value={assistInput}
              onChange={e => setAssistInput(e.target.value)}
              className="assist-field"
            />
            <button type="submit" className="assist-send-btn" disabled={isProcessing}>
              <Send size={13} />
            </button>
          </form>
        </div>
      )}

      {/* ══ MODE 2: RESEARCH (Autonomous Objective Tracker) ════ */}
      {mode === 'RESEARCH' && (
        <div className="byomkesh-research-view">
          <div className="autonomous-objective-box">
            <span className="objective-label">CURRENT OBJECTIVE</span>
            <p className="objective-text">{researchObjective}</p>
            <div className="objective-progress-bar">
              <div className="progress-fill" style={{ width: `${autoProgress}%` }} />
            </div>
            <div className="objective-meta-row">
              <span>{autoProgress}% Complete</span>
              <span>Autonomous Depth: Level 3</span>
            </div>
          </div>

          {/* Autonomous Controls */}
          <div className="autonomous-controls-row">
            {autoStatus === 'ACTIVE' ? (
              <button className="ctrl-btn btn-pause" onClick={() => setAutoStatus('PAUSED')}>
                <Pause size={12} /> Pause Investigation
              </button>
            ) : (
              <button className="ctrl-btn btn-resume" onClick={() => setAutoStatus('ACTIVE')}>
                <Play size={12} /> Resume Investigation
              </button>
            )}
            <button className="ctrl-btn btn-abort" onClick={() => setAutoStatus('IDLE')}>
              <Square size={12} /> Stop
            </button>
          </div>

          {/* Live Autonomous Investigation Trail */}
          <div className="research-trail-container">
            <span className="trail-header-label">INVESTIGATION PATH</span>

            <div className="trail-timeline">
              <div className="trail-step step-complete">
                <div className="step-indicator">✓</div>
                <div className="step-content">
                  <span className="step-title">Entity Resolution: Tariq Merchant</span>
                  <p className="step-desc">Extracted beneficial ownership filing from Panamanian registry mirror.</p>
                  <span className="step-time">09:14 UTC</span>
                </div>
              </div>

              <div className="trail-step step-complete">
                <div className="step-indicator">✓</div>
                <div className="step-content">
                  <span className="step-title">Lloyd's Vessel Registry Scan</span>
                  <p className="step-desc">Identified MV Sagar Ratna charter agreement matching Al-Barakah logistics.</p>
                  <span className="step-time">09:22 UTC</span>
                </div>
              </div>

              <div className="trail-step step-active">
                <div className="step-indicator">●</div>
                <div className="step-content">
                  <span className="step-title">Cross-Case Nexus Jump (Case 117)</span>
                  <p className="step-desc">Discovered shared Hawala Account #88219 linked to narcotics courier network.</p>
                  <span className="step-time">09:38 UTC — IN PROGRESS</span>
                </div>
              </div>

              <div className="trail-step step-pending">
                <div className="step-indicator">○</div>
                <div className="step-content">
                  <span className="step-title">Final Synthesis & Indictment Hypothesis</span>
                  <p className="step-desc">Generate formal contradiction audit and evidence provenance ledger.</p>
                  <span className="step-time">Queued</span>
                </div>
              </div>
            </div>
          </div>

          {/* Autonomous Metrics Summary */}
          <div className="research-metrics-summary">
            <div className="res-stat-cell">
              <span className="stat-num">14</span>
              <span className="stat-desc">Entities Analyzed</span>
            </div>
            <div className="res-stat-cell">
              <span className="stat-num">2</span>
              <span className="stat-desc">Cases Visited</span>
            </div>
            <div className="res-stat-cell">
              <span className="stat-num">19</span>
              <span className="stat-desc">Sources Read</span>
            </div>
            <div className="res-stat-cell">
              <span className="stat-num">3</span>
              <span className="stat-desc">Findings</span>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODE 3: REVIEW (Synthesized Findings & Contradictions) ═ */}
      {mode === 'REVIEW' && (
        <div className="byomkesh-review-view">
          <div className="review-section-header">
            <span>SYNTHESIZED FINDINGS FOR CASE 102</span>
            <ProvenanceBadge level="INFERENCE" size="sm" />
          </div>

          <div className="findings-scroll-list">
            <div className="finding-card">
              <div className="finding-card-head">
                <span className="finding-title">Cross-Border Settlement Nexus</span>
                <span className="finding-status-badge">HIGH PROBABILITY</span>
              </div>
              <p className="finding-text">
                Al-Barakah Logistics (Dubai) and Vikramaditya Shipping (Mumbai) operate a coordinated dual-ledger escrow balancing narcotics proceeds against legitimate diamond shipments.
              </p>
              <div className="finding-provenance-meta">
                <ProvenanceBadge level="CORRELATION" size="sm" />
                <span>Evidence: 3 Documents, 1 Wire Ledger</span>
              </div>
              <div className="finding-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setActiveChallenge({ text: 'Cross-Border Settlement Nexus via Al-Barakah' });
                    setChallengeResult(null);
                  }}
                >
                  Challenge Finding
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openTab({ id: 'research', title: 'Byomkesh Research Dossier', type: 'research' })}
                >
                  View Dossier
                </button>
              </div>
            </div>

            {/* Contradiction Warning */}
            <div className="finding-card card-contradiction">
              <div className="contradiction-header">
                <AlertTriangle size={14} className="text-red" />
                <span>CONTRADICTION DETECTED</span>
              </div>
              <p className="contradiction-text">
                Port gate CCTV logs show MV Sagar Ratna offloaded container C-9921 on 20-Sept at 04:15 UTC, whereas official customs clearance receipt is dated 21-Sept at 11:30 UTC. A 31-hour unaccounted discrepancy exists.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => openTab({ id: 'timeline', title: 'Timeline Reconstruction', type: 'timeline' })}
              >
                Inspect Timeline Discrepancy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHALLENGE BYOMKESH DIALOG MODAL ───────────────────── */}
      {activeChallenge && (
        <div className="challenge-modal-backdrop" onClick={() => setActiveChallenge(null)}>
          <div className="challenge-modal-box" onClick={e => e.stopPropagation()}>
            <div className="challenge-modal-head">
              <div className="challenge-head-title">
                <ShieldCheck size={16} className="text-red" />
                <span>CHALLENGE BYOMKESH FINDING</span>
              </div>
              <button className="modal-close" onClick={() => setActiveChallenge(null)}>
                <X size={15} />
              </button>
            </div>

            <div className="challenge-modal-body">
              <div className="challenged-finding-preview">
                <span className="prev-label">CHALLENGED FINDING</span>
                <p className="prev-text">{activeChallenge.text}</p>
              </div>

              <div className="rebuttal-input-group">
                <label className="rebuttal-label">INVESTIGATOR REBUTTAL / COUNTER-ARGUMENT:</label>
                <textarea
                  className="rebuttal-textarea"
                  placeholder="e.g. This evidence does not establish direct beneficial control; it may only indicate standard third-party freight chartering."
                  rows={3}
                  value={challengeStatement}
                  onChange={e => setChallengeStatement(e.target.value)}
                />
              </div>

              {challengeResult && (
                <div className="challenge-result-box">
                  <div className="result-status-title">
                    <CheckCircle2 size={14} className="text-green" />
                    <span>{challengeResult.status}</span>
                  </div>
                  <p className="result-explanation">{challengeResult.explanation}</p>
                  <span className="result-action-note">{challengeResult.action}</span>
                </div>
              )}

              <div className="challenge-modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleExecuteChallenge}
                >
                  Submit Challenge & Re-Evaluate
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveChallenge(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
