import { useState } from 'react';
import ProvenanceBadge from '../desktop/ProvenanceBadge';
import {
  Clock, AlertTriangle, Calendar, MapPin, Radio,
  FileText, ShieldCheck, ChevronRight
} from 'lucide-react';
import './TimelineView.css';

export default function TimelineView() {
  const [filterSource, setFilterSource] = useState('ALL');

  const events = [
    {
      id: 'e-1',
      date: '14 AUG 2026',
      time: '10:30 UTC',
      title: 'Panama Registry Proxy Registration',
      location: 'Panama Maritime Authority (Remote Filing)',
      source: 'Corporate Filing',
      provenance: 'RAW DATA',
      summary: 'Proxy nominee signs charter agreement transferring operational control of MV Sagar Ratna to Al-Barakah Logistics.',
      discrepancy: false
    },
    {
      id: 'e-2',
      date: '18 AUG 2026',
      time: '14:15 UTC',
      title: 'Structured Hawala Fund Clearance (₹4.8 Cr)',
      location: 'Dubai Marina Al-Sayeed Tower',
      source: 'Financial Ledger',
      provenance: 'RAW DATA',
      summary: 'Al-Barakah ledger reflects credit from anonymous offshore wallet #0x992B matching narcotics transaction schedule.',
      discrepancy: false
    },
    {
      id: 'e-3',
      date: '20 SEP 2026',
      time: '04:12 UTC',
      title: 'AIS Transponder Deactivated Off Kandla Coast',
      location: 'Arabian Sea Co-ordinates 19.4N, 68.2E',
      source: 'Maritime AIS Telemetry',
      provenance: 'OBSERVATION',
      summary: 'MV Sagar Ratna transponder ceases broadcasts for 31 hours. AIS black-zone coincides with night rendezvous.',
      discrepancy: true,
      discrepancyNote: 'Vessel re-emerges 40 nautical miles south of scheduled course.'
    },
    {
      id: 'e-4',
      date: '20 SEP 2026',
      time: '04:15 UTC',
      title: 'Unmanifested Offloading Recorded by Port Gate CCTV',
      location: 'Port of Kandla, Gate 3 Cargo Inspection Berth',
      source: 'Port CCTV Surveillance',
      provenance: 'OBSERVATION',
      summary: 'Container C-9921 offloaded onto flatbed truck MH-04-A-1102 without customs barcode scan.',
      discrepancy: true,
      discrepancyNote: 'Contradicts official customs log declaring offloading on 21-Sep at 11:30 UTC (31-hour gap).'
    },
    {
      id: 'e-5',
      date: '21 SEP 2026',
      time: '11:30 UTC',
      title: 'Delayed Customs Clearance Filed',
      location: 'Kandla Customs House Berth 4',
      source: 'Customs ICEGATE Log',
      provenance: 'RAW DATA',
      summary: 'Official paperwork submitted declaring gypsum cargo cleared. Sealed container already departed port perimeter.',
      discrepancy: true,
      discrepancyNote: 'Fabricated timeline entry suspected.'
    },
    {
      id: 'e-6',
      date: '23 SEP 2026',
      time: '09:38 UTC',
      title: 'Cross-Case Intercept Nexus (Case 117)',
      source: 'Byomkesh Automated Sweep',
      location: 'Central Directorate SIGINT Hub',
      provenance: 'CORRELATION',
      summary: 'Intercepted Thuraya satellite IMEI matches communications of courier intercepted in Operation Black Tide.',
      discrepancy: false
    }
  ];

  return (
    <div className="timeline-view-container">
      {/* Timeline Controls Bar */}
      <div className="timeline-toolbar">
        <div className="toolbar-left">
          <Clock size={14} className="text-blue" />
          <span className="toolbar-title">CHRONOLOGICAL INCIDENT RECONSTRUCTION</span>
          <span className="event-count-tag">{events.length} Events Logged</span>
        </div>
        <div className="toolbar-right">
          <div className="discrepancy-indicator">
            <AlertTriangle size={12} className="text-red" />
            <span>3 Timeline Contradictions Flagged</span>
          </div>
        </div>
      </div>

      {/* Main Chronological Stream */}
      <div className="timeline-stream-viewport">
        <div className="timeline-vertical-spine" />

        <div className="timeline-events-list">
          {events.map((ev) => (
            <div key={ev.id} className={`timeline-event-card ${ev.discrepancy ? 'has-discrepancy' : ''}`}>
              <div className="event-marker">
                {ev.discrepancy ? (
                  <AlertTriangle size={11} className="text-red" />
                ) : (
                  <div className="event-dot" />
                )}
              </div>

              <div className="event-card-body">
                <div className="event-header-row">
                  <div className="event-date-stamp font-mono">
                    {ev.date} — {ev.time}
                  </div>
                  <div className="event-tags-group">
                    <ProvenanceBadge level={ev.provenance} size="sm" />
                    <span className="source-tag">{ev.source}</span>
                  </div>
                </div>

                <div className="event-title-text">{ev.title}</div>

                <div className="event-location-text">
                  <MapPin size={11} /> {ev.location}
                </div>

                <p className="event-summary-text">{ev.summary}</p>

                {ev.discrepancy && (
                  <div className="event-discrepancy-box">
                    <AlertTriangle size={13} className="text-red flex-shrink-0" />
                    <div className="discrepancy-details">
                      <span className="d-title">CONTRADICTION DETECTED BY BYOMKESH:</span>
                      <p>{ev.discrepancyNote}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
