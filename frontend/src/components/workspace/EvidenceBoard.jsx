import { useState } from 'react';
import ProvenanceBadge from '../desktop/ProvenanceBadge';
import {
  FileText, Image as ImageIcon, Volume2, Video, Camera,
  FileCode, Globe, Shield, Download, Eye, Hash, Lock, CheckCircle2
} from 'lucide-react';
import './EvidenceBoard.css';

export default function EvidenceBoard() {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [activeEvidence, setActiveEvidence] = useState(null);

  const evidenceItems = [
    {
      id: 'evd-1',
      title: 'Bill of Lading #BOL-9921-A',
      category: 'DOCUMENTS',
      format: 'PDF',
      size: '2.4 MB',
      classification: 'TOP SECRET // NOFORN',
      provenance: 'RAW DATA',
      hash: '0x88f2b19c72e41a0b33c5e89d12f384a91c0b2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      chainOfCustody: 'Seized by Maritime Enforcement Wing Berth 4, Kandla',
      summary: 'Declares 4,200 metric tons gypsum. Interlineated signature corresponds to Panamanian proxy nominee.',
      timestamp: '2026-09-20 08:30 UTC'
    },
    {
      id: 'evd-2',
      title: 'Port Gate 3 CCTV Capture (04:15 UTC)',
      category: 'CCTV',
      format: 'STILL / MP4',
      size: '18.1 MB',
      classification: 'CONFIDENTIAL',
      provenance: 'RAW DATA',
      hash: '0x32e1a84f09c21d8b77a6f5e432109876543210fedcba9876543210fedcba9876',
      chainOfCustody: 'Extracted from Kandla Port Trust server unit #KPT-04',
      summary: 'Shows unmanifested offloading of container C-9921 onto unregistered heavy flatbed truck.',
      timestamp: '2026-09-20 04:15 UTC'
    },
    {
      id: 'evd-3',
      title: 'Al-Barakah Escrow Ledger Export',
      category: 'REPORTS',
      format: 'CSV / XLS',
      size: '840 KB',
      classification: 'SECRET',
      provenance: 'RAW DATA',
      hash: '0x99a7d31fe82c1b0456789abcdef0123456789abcdef0123456789abcdef99a7d',
      chainOfCustody: 'Transmitted via FIU-IND secure gateway under MLAT treaty',
      summary: 'Ledger detailing 14 structured tranche withdrawals totaling ₹14.8 Crore matching narcotics payment cycle.',
      timestamp: '2026-09-18 14:15 UTC'
    },
    {
      id: 'evd-4',
      title: 'Thuraya Satellite Intercept Audio #WT-882',
      category: 'AUDIO',
      format: 'WAV / AUDIO',
      size: '5.2 MB',
      classification: 'TOP SECRET // SI',
      provenance: 'RAW DATA',
      hash: '0x44c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
      chainOfCustody: 'SIGINT interception station Mt. Abu relay',
      summary: 'Arabic & Urdu dialogue coordinating vessel rendezvous at coordinates 19.4N, 68.2E.',
      timestamp: '2026-09-19 23:45 UTC'
    },
    {
      id: 'evd-5',
      title: 'Lloyds Maritime Intelligence Scraping Report',
      category: 'OSINT',
      format: 'JSON',
      size: '310 KB',
      classification: 'UNCLASSIFIED // OSINT',
      provenance: 'OBSERVATION',
      hash: '0x12a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
      chainOfCustody: 'Automated Byomkesh OSINT harvest',
      summary: 'Historical voyage logs show MV Sagar Ratna diverted from Colombo routing 3 consecutive trips.',
      timestamp: '2026-09-22 18:00 UTC'
    },
    {
      id: 'evd-6',
      title: 'Dark Web Telegram Broker Transcript',
      category: 'CYBER',
      format: 'LOG / TXT',
      size: '120 KB',
      classification: 'RESTRICTED',
      provenance: 'OBSERVATION',
      hash: '0x55f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
      chainOfCustody: 'Cybercrime Cell digital forensics dump',
      summary: 'Escrow broker offering guaranteed delivery of maritime container through Kandla green channel.',
      timestamp: '2026-09-17 19:20 UTC'
    }
  ];

  const filteredEvidence = filterCategory === 'ALL'
    ? evidenceItems
    : evidenceItems.filter(e => e.category === filterCategory);

  return (
    <div className="evidence-board-root">
      {/* Category Bar */}
      <div className="evidence-toolbar">
        <div className="category-pills-row">
          {['ALL', 'DOCUMENTS', 'CCTV', 'AUDIO', 'REPORTS', 'OSINT', 'CYBER'].map(cat => (
            <button
              key={cat}
              className={`cat-pill ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="evidence-total-tag">
          {filteredEvidence.length} Exhibits Sealed
        </div>
      </div>

      {/* Grid of Evidence Dossiers */}
      <div className="evidence-grid-viewport">
        <div className="evidence-cards-matrix">
          {filteredEvidence.map(item => (
            <div
              key={item.id}
              className={`evidence-dossier-card ${activeEvidence?.id === item.id ? 'active' : ''}`}
              onClick={() => setActiveEvidence(item)}
            >
              <div className="dossier-top">
                <div className="dossier-format-tag">
                  {item.category === 'DOCUMENTS' && <FileText size={13} className="text-blue" />}
                  {item.category === 'CCTV' && <Camera size={13} className="text-amber" />}
                  {item.category === 'AUDIO' && <Volume2 size={13} className="text-violet" />}
                  {item.category === 'REPORTS' && <FileCode size={13} className="text-green" />}
                  {item.category === 'OSINT' && <Globe size={13} className="text-blue" />}
                  {item.category === 'CYBER' && <Shield size={13} className="text-red" />}
                  <span>{item.format}</span>
                </div>
                <ProvenanceBadge level={item.provenance} size="sm" />
              </div>

              <div className="dossier-title">{item.title}</div>
              <p className="dossier-summary">{item.summary}</p>

              <div className="dossier-custody-foot">
                <span className="hash-preview font-mono">{item.hash.slice(0, 14)}...</span>
                <span className="classification-tag">{item.classification.split('//')[0].trim()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Inspection Modal */}
      {activeEvidence && (
        <div className="evidence-inspect-backdrop" onClick={() => setActiveEvidence(null)}>
          <div className="evidence-inspect-modal" onClick={e => e.stopPropagation()}>
            <div className="inspect-head">
              <div className="inspect-head-left">
                <span className="ev-classification">{activeEvidence.classification}</span>
                <h3>{activeEvidence.title}</h3>
              </div>
              <ProvenanceBadge level={activeEvidence.provenance} size="md" />
            </div>

            <div className="inspect-body">
              <div className="inspect-meta-grid">
                <div className="meta-box">
                  <span className="m-label">EXHIBIT ID</span>
                  <span className="m-val font-mono">{activeEvidence.id}</span>
                </div>
                <div className="meta-box">
                  <span className="m-label">SEIZED TIMESTAMP</span>
                  <span className="m-val">{activeEvidence.timestamp}</span>
                </div>
                <div className="meta-box">
                  <span className="m-label">FILE SIZE & FORMAT</span>
                  <span className="m-val">{activeEvidence.size} // {activeEvidence.format}</span>
                </div>
                <div className="meta-box">
                  <span className="m-label">INTEGRITY STATUS</span>
                  <span className="m-val text-green">SHA-256 SEALED</span>
                </div>
              </div>

              <div className="inspect-section">
                <span className="sec-label">INTELLIGENCE ABSTRACT</span>
                <p className="sec-text">{activeEvidence.summary}</p>
              </div>

              <div className="inspect-section">
                <span className="sec-label">CHAIN OF CUSTODY PROVENANCE</span>
                <p className="sec-text font-mono text-muted">{activeEvidence.chainOfCustody}</p>
              </div>

              <div className="inspect-hash-banner">
                <Hash size={13} className="text-blue" />
                <span className="font-mono">{activeEvidence.hash}</span>
              </div>

              <div className="inspect-actions-row">
                <button className="btn btn-primary" onClick={() => setActiveEvidence(null)}>
                  <Eye size={13} /> Open Decrypted Document Viewer
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveEvidence(null)}>
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
