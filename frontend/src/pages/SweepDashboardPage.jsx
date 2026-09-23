import { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import ProvenanceBadge from '../components/desktop/ProvenanceBadge';
import Panel3D from '../components/Panel3D';
import {
  Clock, Activity, AlertTriangle, CheckCircle2, RotateCcw,
  ArrowRight, Shield, Layers, FileText, Sparkles
} from 'lucide-react';
import './SweepDashboardPage.css';

export default function SweepDashboardPage() {
  const { setActiveNavSection, setActiveCaseId, openTab, addNodeToCanvas } = useWorkspace();
  const [isRunning, setIsRunning] = useState(false);
  const [lastExecuted, setLastExecuted] = useState('2 hours ago');
  const [sweepCycle, setSweepCycle] = useState('CYCLE #8821-NIGHT');

  const [sweepFindings, setSweepFindings] = useState([
    {
      id: 'sw-1',
      type: 'CROSS_CASE_CONNECTION',
      caseA: 'Case 102 (Silver Dune)',
      caseB: 'Case 117 (Operation Black Tide)',
      title: 'Shared Hawala Settlement Node #88219',
      summary: 'Automated correlation of 14 split cash transactions matches ledger account operated by Tariq Merchant proxy.',
      provenance: 'INFERENCE',
      confidence: 0.94
    },
    {
      id: 'sw-2',
      type: 'CONTRADICTION',
      caseA: 'Case 102',
      caseB: 'Port of Kandla Authority Log',
      title: '31-Hour Discrepancy in Cargo Clearance Papers',
      summary: 'CCTV physical departure timestamp precedes official ICEGATE clearance file by 31 hours.',
      provenance: 'OBSERVATION',
      confidence: 0.99
    },
    {
      id: 'sw-3',
      type: 'HYPOTHESIS_REVISION',
      caseA: 'Case 102',
      caseB: 'Panama Public Registry',
      title: 'Beneficial Ownership Proxy Directorship Established',
      summary: 'Byomkesh elevated hypothesis confidence from 78% to 94% following corporate email correlation.',
      provenance: 'HYPOTHESIS',
      confidence: 0.94
    }
  ]);

  const handleRunManualSweep = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setLastExecuted('Just now');
      setSweepCycle(`CYCLE #${Math.floor(8822 + Math.random() * 50)}-FLASH`);
      const newFinding = {
        id: `sw-${Date.now()}`,
        type: 'CROSS_CASE_CONNECTION',
        caseA: 'Case 102 (Silver Dune)',
        caseB: 'FIU Realtime Gateway',
        title: 'New Encrypted Escrow Account Identified in Dubai Gold Souk',
        summary: 'Byomkesh correlated ledger timestamp #9921 with wire transfer sequence to Tariq Merchant proxy syndicate.',
        provenance: 'INFERENCE',
        confidence: 0.97
      };
      setSweepFindings(prev => [newFinding, ...prev]);
    }, 1800);
  };

  const handleSendToWorkspace = (item) => {
    addNodeToCanvas({
      id: `finding-${item.id}`,
      title: item.title,
      type: 'evidence',
      subtitle: item.type,
      provenance: item.provenance,
      description: item.summary,
      confidence: item.confidence
    });
    setActiveCaseId('case-102');
    setActiveNavSection('workspace');
    openTab({ id: 'canvas', title: 'Investigation Canvas', type: 'canvas' });
  };

  return (
    <div className="sweep-page-container">
      {/* Sweep Header Banner with 3D bending */}
      <Panel3D maxAngle={2} glow="white" className="sweep-header-panel3d">
        <div className="sweep-header-banner">
          <div className="sweep-banner-left">
            <div className="sweep-hero-title-row">
              <Activity size={18} className="text-red" />
              <h1>12-Hour Autonomous Research Sweep</h1>
              <span className="sweep-cycle-tag font-mono">{sweepCycle}</span>
            </div>
            <p className="sweep-hero-desc">
              Every 12 hours, Byomkesh autonomously conducts an exhaustive cross-case scan parsing new evidence, corporate registries, Lloyd's vessel movements, OSINT, and cyber signals to detect emerging networks and contradictions.
            </p>
          </div>

          <div className="sweep-banner-right">
            <button
              className="btn btn-primary"
              onClick={handleRunManualSweep}
              disabled={isRunning}
            >
              <RotateCcw size={13} className={isRunning ? 'spin' : ''} />
              {isRunning ? 'Executing Global Sweep...' : 'Trigger Immediate Sweep'}
            </button>
          </div>
        </div>
      </Panel3D>

      {/* Sweep Status Cards Grid with 3D bending */}
      <div className="sweep-metrics-overview">
        <Panel3D maxAngle={6} glow="white" className="sweep-stat-panel3d">
          <div className="sweep-stat-card">
            <span className="stat-label">LAST SWEEP COMPLETED</span>
            <span className="stat-main-num font-mono">{lastExecuted}</span>
            <span className="stat-sub">Executed in 18.4s // 0 errors</span>
          </div>
        </Panel3D>
        <Panel3D maxAngle={6} glow="white" className="sweep-stat-panel3d">
          <div className="sweep-stat-card">
            <span className="stat-label">NEXT AUTONOMOUS RUN</span>
            <span className="stat-main-num font-mono text-red">in 10 hours</span>
            <span className="stat-sub">Scheduled for 04:00 UTC</span>
          </div>
        </Panel3D>
        <Panel3D maxAngle={6} glow="white" className="sweep-stat-panel3d">
          <div className="sweep-stat-card">
            <span className="stat-label">ITEMS SCANNED</span>
            <span className="stat-main-num font-mono">2,481</span>
            <span className="stat-sub">Documents, logs, transcripts</span>
          </div>
        </Panel3D>
        <Panel3D maxAngle={6} glow="white" className="sweep-stat-panel3d">
          <div className="sweep-stat-card">
            <span className="stat-label">ENTITIES EVALUATED</span>
            <span className="stat-main-num font-mono">18,392</span>
            <span className="stat-sub">Graph nodes traversed</span>
          </div>
        </Panel3D>
      </div>

      {/* Sweep Discoveries Section with 3D bending */}
      <div className="sweep-discoveries-section">
        <div className="sec-header">
          <h2>Latest Sweep Discoveries ({sweepCycle})</h2>
          <span className="sec-tag">{sweepFindings.length} FINDINGS DETECTED & CORRELATED</span>
        </div>

        <div className="sweep-findings-list">
          {sweepFindings.map(item => (
            <Panel3D key={item.id} maxAngle={4} glow="white" className="sweep-finding-panel3d">
              <div className="sweep-finding-card">
                <div className="f-header-row">
                  <div className="f-type-lockup">
                    <span className="f-type-tag">{item.type}</span>
                    <ProvenanceBadge level={item.provenance} size="sm" />
                  </div>
                  <span className="f-conf font-mono">{(item.confidence * 100).toFixed(0)}% CONFIDENCE</span>
                </div>

                <div className="f-title">{item.title}</div>
                <p className="f-summary">{item.summary}</p>

                <div className="f-footer">
                  <span className="f-cases text-blue">{item.caseA} ↔ {item.caseB}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSendToWorkspace(item)}
                  >
                    Open in Workspace <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </Panel3D>
          ))}
        </div>
      </div>
    </div>
  );
}
