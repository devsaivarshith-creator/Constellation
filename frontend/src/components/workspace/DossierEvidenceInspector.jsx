import { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import ProvenanceBadge from '../desktop/ProvenanceBadge';
import {
  User, Building2, MapPin, Car, DollarSign, Cpu,
  ShieldAlert, Clock, FileText, CheckCircle2, AlertTriangle,
  ArrowRight, Link2, ExternalLink, Calendar, Search
} from 'lucide-react';
import './DossierEvidenceInspector.css';

export default function DossierEvidenceInspector() {
  const { selectedEntity, activeCase, openTab } = useWorkspace();
  const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' | 'timeline' | 'evidence'

  const timelineEvents = [
    {
      id: 'evt-1',
      date: '18-SEP 02:40 UTC',
      title: 'AIS Transponder Deactivation',
      entity: 'MV Sagar Ratna',
      provenance: 'RAW DATA',
      location: 'Arabian Sea (Coordinates 20.4N, 68.2E)',
      summary: 'Bulk carrier ceases satellite broadcast for 31 hours off Saurashtra coast.'
    },
    {
      id: 'evt-2',
      date: '19-SEP 14:15 UTC',
      title: 'Hawala Ledger Settlement',
      entity: 'Hawala Node #88219',
      provenance: 'CORRELATION',
      location: 'Dubai ↔ Surat',
      summary: 'Structured mirror split of ₹14.8 Cr booked across three shell export invoices.'
    },
    {
      id: 'evt-3',
      date: '20-SEP 23:10 UTC',
      title: 'Unmanifested Night Offloading',
      entity: 'Port of Kandla Berth 4',
      provenance: 'RAW DATA',
      location: 'Kandla, Gujarat',
      summary: 'CCTV recorded unmanifested 40ft container transfer supervised by Tariq Merchant associate.'
    }
  ];

  const evidenceItems = [
    {
      id: 'evd-1',
      title: 'Bill of Lading #BOL-9921-A',
      type: 'Panama Maritime Doc',
      classification: 'SECRET',
      hash: '0x88f2...b19c',
      provenance: 'RAW DATA',
      snippet: 'Declared cargo: Gypsum bulk. Consignee: Levant Marine Logistics Ltd.'
    },
    {
      id: 'evd-2',
      title: 'CCTV Still: Port Gate 3 Offloading',
      type: 'Forensic Video Image',
      classification: 'CONFIDENTIAL',
      hash: '0x32e1...c4a2',
      provenance: 'RAW DATA',
      snippet: 'High-resolution still capturing midnight cargo crane operation without customs presence.'
    },
    {
      id: 'evd-3',
      title: 'Al-Barakah Hawala Wire Mirror',
      type: 'Encrypted Transaction Ledger',
      classification: 'RESTRICTED',
      hash: '0x99a7...d31f',
      provenance: 'CORRELATION',
      snippet: 'Cross-border payment vouchers matching exact timestamps of vessel transit.'
    }
  ];

  return (
    <div className="dossier-inspector-root">
      {/* Top Tab Switcher */}
      <div className="inspector-tabs-header">
        <button
          className={`insp-tab-btn ${activeTab === 'dossier' ? 'active' : ''}`}
          onClick={() => setActiveTab('dossier')}
        >
          <User size={11} />
          <span>ENTITY DOSSIER</span>
        </button>
        <button
          className={`insp-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <Clock size={11} />
          <span>TIMELINE ({timelineEvents.length})</span>
        </button>
        <button
          className={`insp-tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          <FileText size={11} />
          <span>EVIDENCE VAULT ({evidenceItems.length})</span>
        </button>
      </div>

      {/* Tab Content Viewport */}
      <div className="inspector-tab-content">
        {/* ── TAB 1: ENTITY DOSSIER ────────────────────────────── */}
        {activeTab === 'dossier' && (
          <div className="dossier-view">
            {selectedEntity ? (
              <div className="dossier-details-container">
                <div className="dossier-hero-row">
                  <div className="dossier-name-lockup">
                    <span className="dossier-type-tag">{(selectedEntity.type || 'ENTITY').toUpperCase()}</span>
                    <h3 className="dossier-title">{selectedEntity.name}</h3>
                    <p className="dossier-role-text">{selectedEntity.role}</p>
                  </div>
                  <div className="dossier-badges">
                    <ProvenanceBadge level={selectedEntity.provenance || 'RAW DATA'} size="md" />
                    <span className={`threat-badge-pill threat-${(selectedEntity.threat || 'MEDIUM').toLowerCase()}`}>
                      {selectedEntity.threat || 'MEDIUM'} THREAT
                    </span>
                  </div>
                </div>

                <div className="dossier-synopsis">
                  <span className="field-label">INTELLIGENCE SYNOPSIS</span>
                  <p className="field-value">
                    {selectedEntity.details || 'Entity identified through multi-layer intelligence correlation in Case 102. Subject to continuous cross-border surveillance.'}
                  </p>
                </div>

                <div className="dossier-attributes-grid">
                  <div className="attr-item">
                    <span className="attr-k">JURISDICTION</span>
                    <span className="attr-v">{selectedEntity.jurisdiction || selectedEntity.location || 'Mumbai / Dubai'}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-k">IDENTIFIER HASH</span>
                    <span className="attr-v font-mono">{selectedEntity.id}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-k">TELEPHONE / COMMS</span>
                    <span className="attr-v">{selectedEntity.phone || '+971-50-XXX-8891'}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-k">CROSS-CASE LINK</span>
                    <span className="attr-v text-highlight">{selectedEntity.crossCase || 'Case 117 (Operation Black Tide)'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dossier-empty-state">
                <User size={24} className="empty-icon" />
                <span>Select any node on the Investigation Board to view classified dossier</span>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: TIMELINE RECONSTRUCTION ──────────────────── */}
        {activeTab === 'timeline' && (
          <div className="timeline-view">
            <div className="timeline-items-list">
              {timelineEvents.map((evt, idx) => (
                <div key={evt.id} className="timeline-event-card">
                  <div className="event-time-stamp">
                    <span className="time-code">{evt.date}</span>
                    <ProvenanceBadge level={evt.provenance} size="sm" />
                  </div>
                  <div className="event-title-line">
                    <strong>{evt.title}</strong> — <span className="event-entity">{evt.entity}</span>
                  </div>
                  <div className="event-summary-text">{evt.summary}</div>
                  <div className="event-location-text">📍 {evt.location}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: EVIDENCE VAULT ────────────────────────────── */}
        {activeTab === 'evidence' && (
          <div className="evidence-view">
            <div className="evidence-cards-list">
              {evidenceItems.map(item => (
                <div key={item.id} className="evidence-card-row">
                  <div className="evd-card-header">
                    <span className="evd-type-badge">{item.type}</span>
                    <ProvenanceBadge level={item.provenance} size="sm" />
                    <span className="evd-hash-code font-mono">{item.hash}</span>
                  </div>
                  <div className="evd-card-title">{item.title}</div>
                  <div className="evd-card-snippet">{item.snippet}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
