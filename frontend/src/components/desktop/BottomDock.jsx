import { useWorkspace } from '../../contexts/WorkspaceContext';
import ProvenanceBadge from './ProvenanceBadge';
import {
  Activity, FileText, Terminal, ShieldCheck, ChevronUp,
  ChevronDown, X, Hash, Clock, Link2, CheckCircle2
} from 'lucide-react';
import './BottomDock.css';

export default function BottomDock() {
  const {
    showBottomDock,
    setShowBottomDock,
    bottomDockTab,
    setBottomDockTab,
    activeCase
  } = useWorkspace();

  if (!showBottomDock) {
    return (
      <div className="bottom-dock-collapsed-bar">
        <button
          className="dock-toggle-btn"
          onClick={() => setShowBottomDock(true)}
          title="Open Inspection Drawer"
        >
          <ChevronUp size={13} />
          <span>ACTIVITY & PROVENANCE DRAWER</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bottom-dock-container">
      {/* Dock Tab Bar Header */}
      <div className="bottom-dock-header">
        <div className="dock-tabs-group">
          <button
            className={`dock-tab ${bottomDockTab === 'activity' ? 'active' : ''}`}
            onClick={() => setBottomDockTab('activity')}
          >
            <Activity size={12} />
            <span>ACTIVITY LOG</span>
          </button>
          <button
            className={`dock-tab ${bottomDockTab === 'sources' ? 'active' : ''}`}
            onClick={() => setBottomDockTab('sources')}
          >
            <FileText size={12} />
            <span>SOURCES & PROVENANCE</span>
          </button>
          <button
            className={`dock-tab ${bottomDockTab === 'trace' ? 'active' : ''}`}
            onClick={() => setBottomDockTab('trace')}
          >
            <Terminal size={12} />
            <span>AI TRACE (CYPHER & REASONING)</span>
          </button>
          <button
            className={`dock-tab ${bottomDockTab === 'custody' ? 'active' : ''}`}
            onClick={() => setBottomDockTab('custody')}
          >
            <ShieldCheck size={12} />
            <span>CHAIN OF CUSTODY (MERKLE LEDGER)</span>
          </button>
        </div>

        <div className="dock-actions-right">
          <button
            className="dock-ctrl-btn"
            onClick={() => setShowBottomDock(false)}
            title="Collapse Drawer"
          >
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* Dock Content Body */}
      <div className="bottom-dock-body">
        {/* ══ 1. ACTIVITY LOG ══════════════════════════════════ */}
        {bottomDockTab === 'activity' && (
          <div className="dock-table-wrapper">
            <table className="dock-table">
              <thead>
                <tr>
                  <th>TIMESTAMP (UTC)</th>
                  <th>ACTOR</th>
                  <th>ACTION</th>
                  <th>TARGET ENTITY / ARTIFACT</th>
                  <th>PROVENANCE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono">16:51:20</td>
                  <td>Lead Investigator</td>
                  <td>ATTACH_EVIDENCE</td>
                  <td>Bill of Lading #BOL-9921-A</td>
                  <td><ProvenanceBadge level="RAW DATA" size="sm" /></td>
                </tr>
                <tr>
                  <td className="font-mono">16:42:04</td>
                  <td>Byomkesh Autonomous Agent</td>
                  <td>CROSS_CASE_DISCOVERY</td>
                  <td>Case 102 ↔ Case 117 (Hawala Nexus)</td>
                  <td><ProvenanceBadge level="INFERENCE" size="sm" /></td>
                </tr>
                <tr>
                  <td className="font-mono">16:15:33</td>
                  <td>Splink Entity Engine</td>
                  <td>IDENTITY_RESOLUTION</td>
                  <td>Rajesh Sharma (Broker) ↔ Tariq Proxy</td>
                  <td><ProvenanceBadge level="CORRELATION" size="sm" /></td>
                </tr>
                <tr>
                  <td className="font-mono">15:58:12</td>
                  <td>System Daemon</td>
                  <td>SEAL_BLOCKCHAIN_BATCH</td>
                  <td>Block #18492 (28 Signatures Sealed)</td>
                  <td><ProvenanceBadge level="OBSERVATION" size="sm" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ══ 2. SOURCES & PROVENANCE ══════════════════════════ */}
        {bottomDockTab === 'sources' && (
          <div className="provenance-trail-view">
            <div className="provenance-pipeline-card">
              <div className="pipeline-step">
                <span className="step-tag">1. PRIMARY EVIDENCE</span>
                <span className="step-val">Bill of Lading #BOL-9921-A (PDF)</span>
                <ProvenanceBadge level="RAW DATA" size="sm" />
              </div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-step">
                <span className="step-tag">2. EXTRACTION</span>
                <span className="step-val">Shipper: Al-Barakah FZE // Carrier: MV Sagar Ratna</span>
                <ProvenanceBadge level="OBSERVATION" size="sm" />
              </div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-step">
                <span className="step-tag">3. GRAPH CORRELATION</span>
                <span className="step-val">Port AIS Deactivation 20-Sept 04:12 UTC</span>
                <ProvenanceBadge level="CORRELATION" size="sm" />
              </div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-step">
                <span className="step-tag">4. DERIVED HYPOTHESIS</span>
                <span className="step-val">Offshore Clandestine Transshipment Nexus</span>
                <ProvenanceBadge level="HYPOTHESIS" size="sm" />
              </div>
            </div>
          </div>
        )}

        {/* ══ 3. AI EXECUTION TRACE ════════════════════════════ */}
        {bottomDockTab === 'trace' && (
          <div className="ai-trace-code-view font-mono">
            <div className="trace-line text-muted">[2026-09-23T16:42:01Z] EXECUTING CYPHER SUBGRAPH SCAN:</div>
            <div className="trace-line text-blue">
              {'MATCH (p:Person {name: "Tariq Merchant"})-[r:BENEFICIAL_OWNER]->(o:Organization)-[:CHARTERS]->(v:Vehicle)'}
            </div>
            <div className="trace-line text-blue">
              {'OPTIONAL MATCH (o)-[:SETTLES_VIA]->(f:FinancialNode)<-[:SETTLES_VIA]-(c:Case {id: "case-117"})'}
            </div>
            <div className="trace-line text-blue">
              {'RETURN p, o, v, f, c;'}
            </div>
            <div className="trace-line text-green">
              &gt;&gt; Graph Result: 1 Path Matched (Node #88219 linked to Case 117 narcotics network)
            </div>
            <div className="trace-line text-muted">
              [2026-09-23T16:42:03Z] Byomkesh Reasoning Engine: Synthesizing hypothesis artifact with confidence metric 0.94.
            </div>
          </div>
        )}

        {/* ══ 4. CHAIN OF CUSTODY (MERKLE LEDGER) ══════════════ */}
        {bottomDockTab === 'custody' && (
          <div className="custody-integrity-view">
            <div className="custody-header-banner">
              <CheckCircle2 size={15} className="text-green" />
              <span>CRYPTOGRAPHIC EVIDENCE CHAIN OF CUSTODY VERIFIED (ZERO TAMPER DETECTED)</span>
            </div>
            <div className="custody-grid">
              <div className="custody-card">
                <span className="c-label">DOCUMENT SHA-256 HASH</span>
                <span className="c-val font-mono">0x88f2b19c72e41a0b33c5e89d12f384a91c0b2d3e4f5a6b7c8d9e0f1a2b3c4d5e</span>
              </div>
              <div className="custody-card">
                <span className="c-label">MERKLE ROOT COMMIT</span>
                <span className="c-val font-mono">0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b</span>
              </div>
              <div className="custody-card">
                <span className="c-label">EVIDENCE NOTARY SEAL</span>
                <span className="c-val">Digital Custody Seal // Officer A. Sharma (IND-CID-8820)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
