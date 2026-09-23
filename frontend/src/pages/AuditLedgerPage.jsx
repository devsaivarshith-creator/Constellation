import { useState } from 'react';
import ProvenanceBadge from '../components/desktop/ProvenanceBadge';
import Panel3D from '../components/Panel3D';
import {
  ShieldCheck, CheckCircle2, Hash, Lock, Search,
  FileText, Activity, Clock, KeyRound
} from 'lucide-react';
import './AuditLedgerPage.css';

export default function AuditLedgerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const auditEvents = [
    {
      id: 'tx-901',
      block: 18492,
      action: 'EVIDENCE_ATTACHED',
      artifact: 'Bill of Lading #BOL-9921-A',
      officer: 'Lead Investigator (IND-CID-8820)',
      hash: '0x88f2b19c72e41a0b33c5e89d12f384a91c0b2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      timestamp: '14 mins ago',
      provenance: 'RAW DATA',
      status: 'SEALED & VERIFIED'
    },
    {
      id: 'tx-902',
      block: 18491,
      action: 'IDENTITY_RESOLUTION_COMMITTED',
      artifact: 'Splink Entity Match: Rajesh Sharma',
      officer: 'Splink Machine Engine',
      hash: '0x32e1a84f09c21d8b77a6f5e432109876543210fedcba9876543210fedcba9876',
      timestamp: '42 mins ago',
      provenance: 'CORRELATION',
      status: 'SEALED & VERIFIED'
    },
    {
      id: 'tx-903',
      block: 18490,
      action: 'CROSS_CASE_DISCOVERY_RECORDED',
      artifact: 'Bridge: Case 102 ↔ Case 117',
      officer: 'Byomkesh Autonomous Agent',
      hash: '0x99a7d31fe82c1b0456789abcdef0123456789abcdef0123456789abcdef99a7d',
      timestamp: '2 hours ago',
      provenance: 'INFERENCE',
      status: 'SEALED & VERIFIED'
    },
    {
      id: 'tx-904',
      block: 18489,
      action: 'HYPOTHESIS_CHALLENGE_LOGGED',
      artifact: 'Rebuttal Statement (Officer A. Sharma)',
      officer: 'Officer A. Sharma',
      hash: '0x44c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
      timestamp: '4 hours ago',
      provenance: 'HYPOTHESIS',
      status: 'SEALED & VERIFIED'
    }
  ];

  const filteredEvents = auditEvents.filter(ev => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      ev.action.toLowerCase().includes(term) ||
      ev.artifact.toLowerCase().includes(term) ||
      ev.officer.toLowerCase().includes(term) ||
      ev.hash.toLowerCase().includes(term) ||
      String(ev.block).includes(term)
    );
  });

  return (
    <div className="audit-ledger-container">
      {/* Top Ledger Header with 3D bending */}
      <Panel3D maxAngle={2} glow="white" className="ledger-header-panel3d">
        <div className="ledger-header-panel">
          <div className="ledger-header-left">
            <div className="ledger-title-row">
              <ShieldCheck size={16} className="text-green" />
              <h1>Cryptographic Provenance & Evidence Ledger</h1>
              <span className="ledger-status-tag font-mono">MERKLE ROOT: 0x8f3b...LOCKED</span>
            </div>
            <p className="ledger-desc">
              Tamper-evident append-only ledger certifying the chain of custody, evidence hashes, and autonomous investigative modifications across all cases.
            </p>
          </div>

          <div className="ledger-header-right">
            <div className="merkle-stat-badge">
              <span className="m-lbl">BLOCK HEIGHT</span>
              <span className="m-val font-mono">#18,492</span>
            </div>
            <div className="merkle-stat-badge">
              <span className="m-lbl">TAMPER DETECTED</span>
              <span className="m-val text-green">ZERO (0.00%)</span>
            </div>
          </div>
        </div>
      </Panel3D>

      {/* Ledger Table Section with 3D bending */}
      <Panel3D maxAngle={2} glow="white" className="ledger-table-panel3d">
        <div className="ledger-table-section">
          <div className="ledger-search-bar">
            <Search size={13} className="text-muted" />
            <input
              type="text"
              placeholder="Search block hashes, exhibit IDs, or actor signatures..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="ledger-search-input"
            />
          </div>

          <div className="ledger-table-wrapper">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>BLOCK</th>
                  <th>ACTION TYPE</th>
                  <th>TARGET ARTIFACT / EVIDENCE</th>
                  <th>OFFICER / AGENT SIGNATURE</th>
                  <th>PROVENANCE</th>
                  <th>SHA-256 PROOF</th>
                  <th>INTEGRITY</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(event => (
                  <tr key={event.id}>
                    <td className="font-mono text-muted">#{event.block}</td>
                    <td className="font-mono text-primary font-bold">{event.action}</td>
                    <td>{event.artifact}</td>
                    <td className="text-secondary">{event.officer}</td>
                    <td><ProvenanceBadge level={event.provenance} size="sm" /></td>
                    <td className="font-mono text-muted" title={event.hash}>
                      {event.hash.slice(0, 16)}...
                    </td>
                    <td>
                      <span className="integrity-tag">
                        <CheckCircle2 size={11} className="text-green" /> {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Panel3D>
    </div>
  );
}
