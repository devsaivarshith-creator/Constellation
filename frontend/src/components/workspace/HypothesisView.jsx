import { useState } from 'react';
import ProvenanceBadge from '../desktop/ProvenanceBadge';
import {
  AlertCircle, ShieldCheck, CheckCircle2, AlertTriangle,
  RotateCcw, FileText, ArrowRight, MessageSquare, Plus, X
} from 'lucide-react';
import './HypothesisView.css';

export default function HypothesisView() {
  const [hypotheses, setHypotheses] = useState([
    {
      id: 'hyp-1',
      title: 'Al-Barakah Logistics operates as an unauthorized settlement corridor for narcotics contraband',
      confidence: 0.88,
      status: 'ACTIVE',
      provenance: 'HYPOTHESIS',
      author: 'Byomkesh Autonomous Engine',
      lastEvaluated: '1 hour ago',
      rationale: 'Correlation of 14 structured withdrawals matching narcotics courier drop schedules off Kandla port.',
      supportingEvidence: [
        'Bill of Lading #BOL-9921-A',
        'Wire Transfer Ledger (Al-Barakah)',
        'CCTV Capture Berth 4'
      ],
      contradictingEvidence: []
    },
    {
      id: 'hyp-2',
      title: 'Tariq Merchant maintains indirect beneficial ownership of MV Sagar Ratna through forged Panamanian proxy',
      confidence: 0.94,
      status: 'ACTIVE',
      provenance: 'HYPOTHESIS',
      author: 'Lead Investigator & Byomkesh',
      lastEvaluated: '35 mins ago',
      rationale: 'Panama corporate incorporation filing links personal encrypted email address to proxy shell company.',
      supportingEvidence: [
        'Bill of Lading #BOL-9921-A',
        'Corporate Registry Filing #PAN-8819',
        'Thuraya Satellite Intercept #WT-882'
      ],
      contradictingEvidence: []
    }
  ]);

  const [activeChallengeHyp, setActiveChallengeHyp] = useState(null);
  const [challengeStatement, setChallengeStatement] = useState('');
  const [challengeResult, setChallengeResult] = useState(null);

  const handleExecuteChallenge = () => {
    if (!challengeStatement.trim() || !activeChallengeHyp) return;

    setHypotheses(prev => prev.map(h => {
      if (h.id === activeChallengeHyp.id) {
        return {
          ...h,
          confidence: Math.max(0.4, Number((h.confidence - 0.15).toFixed(2))),
          status: 'CHALLENGED',
          contradictingEvidence: [...h.contradictingEvidence, `Investigator Rebuttal: "${challengeStatement.slice(0, 40)}..."`]
        };
      }
      return h;
    }));

    setChallengeResult({
      status: 'HYPOTHESIS RE-EVALUATED & CONFIDENCE ADJUSTED',
      note: 'Byomkesh re-assessed evidentiary weight. Status marked as CHALLENGED pending corroborating financial affidavits.'
    });
  };

  return (
    <div className="hypotheses-view-container">
      {/* Top Toolbar */}
      <div className="hypotheses-toolbar">
        <div className="toolbar-left">
          <AlertCircle size={14} className="text-red" />
          <span className="toolbar-title">FORMAL INVESTIGATIVE HYPOTHESES & CHALLENGE MATRIX</span>
          <span className="hyp-count-badge">{hypotheses.length} Working Assertions</span>
        </div>
        <button className="btn btn-secondary btn-sm">
          <Plus size={12} /> Propose Hypothesis
        </button>
      </div>

      {/* Hypotheses List */}
      <div className="hypotheses-viewport">
        <div className="hypotheses-cards-list">
          {hypotheses.map(hyp => (
            <div key={hyp.id} className="hypothesis-card">
              <div className="hyp-card-header">
                <div className="hyp-header-left">
                  <ProvenanceBadge level="HYPOTHESIS" size="sm" />
                  <span className={`hyp-status-pill status-${hyp.status.toLowerCase()}`}>
                    {hyp.status}
                  </span>
                </div>
                <div className="confidence-meter-group">
                  <span className="conf-label">EVIDENTIARY CONFIDENCE:</span>
                  <div className="conf-bar-track">
                    <div
                      className="conf-bar-fill"
                      style={{
                        width: `${hyp.confidence * 100}%`,
                        backgroundColor: hyp.confidence > 0.8 ? 'var(--accent-red)' : 'var(--accent-amber)'
                      }}
                    />
                  </div>
                  <span className="conf-pct font-mono">{(hyp.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="hyp-statement-title">{hyp.title}</div>
              <p className="hyp-rationale-text">{hyp.rationale}</p>

              {/* Supporting & Contradicting Evidence Blocks */}
              <div className="hyp-evidence-comparison-grid">
                <div className="evidence-col col-supporting">
                  <span className="col-title text-green">
                    <CheckCircle2 size={12} /> SUPPORTING EVIDENCE ({hyp.supportingEvidence.length})
                  </span>
                  <div className="evidence-chips-list">
                    {hyp.supportingEvidence.map((e, idx) => (
                      <span key={idx} className="evidence-chip">
                        <FileText size={10} /> {e}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="evidence-col col-contradicting">
                  <span className="col-title text-red">
                    <AlertTriangle size={12} /> CONTRADICTING EVIDENCE ({hyp.contradictingEvidence.length})
                  </span>
                  <div className="evidence-chips-list">
                    {hyp.contradictingEvidence.length > 0 ? (
                      hyp.contradictingEvidence.map((e, idx) => (
                        <span key={idx} className="evidence-chip chip-contra">
                          <AlertCircle size={10} /> {e}
                        </span>
                      ))
                    ) : (
                      <span className="no-contra-text">Zero recorded contradictions at current sweep depth.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="hyp-card-footer">
                <div className="hyp-author-meta">
                  <span>Synthesized by: {hyp.author}</span>
                  <span>•</span>
                  <span>Evaluated: {hyp.lastEvaluated}</span>
                </div>

                <div className="hyp-actions-group">
                  <button
                    className="btn-challenge-action"
                    onClick={() => {
                      setActiveChallengeHyp(hyp);
                      setChallengeStatement('');
                      setChallengeResult(null);
                    }}
                  >
                    [CHALLENGE HYPOTHESIS]
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    Show Evidentiary Graph
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Challenge Modal Dialog ────────────────────────────── */}
      {activeChallengeHyp && (
        <div className="challenge-modal-backdrop" onClick={() => setActiveChallengeHyp(null)}>
          <div className="challenge-modal-box" onClick={e => e.stopPropagation()}>
            <div className="challenge-modal-head">
              <div className="challenge-head-title">
                <ShieldCheck size={16} className="text-red" />
                <span>CHALLENGE BYOMKESH HYPOTHESIS</span>
              </div>
              <button className="modal-close" onClick={() => setActiveChallengeHyp(null)}>
                <X size={15} />
              </button>
            </div>

            <div className="challenge-modal-body">
              <div className="challenged-finding-preview">
                <span className="prev-label">HYPOTHESIS UNDER FORMAL CHALLENGE</span>
                <p className="prev-text">{activeChallengeHyp.title}</p>
              </div>

              <div className="rebuttal-input-group">
                <label className="rebuttal-label">INVESTIGATOR COUNTER-EVIDENCE / CRITIQUE:</label>
                <textarea
                  className="rebuttal-textarea"
                  placeholder="e.g. This evidence does not establish control of the account; Al-Barakah maintains contracts with 14 other logistics entities."
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
                  <p className="result-explanation">{challengeResult.note}</p>
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
                  onClick={() => setActiveChallengeHyp(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
