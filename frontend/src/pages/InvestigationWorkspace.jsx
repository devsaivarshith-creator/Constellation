import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import WorkspaceOverviewHub from '../components/workspace/WorkspaceOverviewHub';
import CaseFileAdder from '../components/workspace/CaseFileAdder';
import InvestigationCanvas from '../components/workspace/InvestigationCanvas';
import CrossCaseImporter from '../components/workspace/CrossCaseImporter';
import {
  Layers, ArrowLeft, Plus, Database, Sidebar,
  Activity, CheckCircle2, Shield, RefreshCw, X
} from 'lucide-react';
import './InvestigationWorkspace.css';

export default function InvestigationWorkspace() {
  const {
    activeWorkspaceId,
    activeWorkspace,
    closeWorkspace,
    activeCase
  } = useWorkspace();

  const [fileAdderOpen, setFileAdderOpen] = useState(true);
  const [importerOpen, setImporterOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('healthy');

  // Verify backend health
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') setBackendStatus('live');
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  // If no workspace is open, show the clean Workspaces Hub
  if (!activeWorkspaceId) {
    return <WorkspaceOverviewHub />;
  }

  return (
    <div className="investigation-workspace-root">
      {/* ── Top Workspace Command Bar ─────────────────────────────── */}
      <header className="workspace-top-bar">
        {/* Left: Back to Hub & Workspace Title */}
        <div className="topbar-left-cluster">
          <button
            className="topbar-back-btn"
            onClick={closeWorkspace}
            title="Return to Workspaces Overview"
          >
            <ArrowLeft size={13} />
            <span>All Workspaces</span>
          </button>

          <div className="topbar-divider" />

          <div className="case-title-cluster">
            <span className="case-name-text">{activeWorkspace?.name || activeCase.name}</span>
            <span className="case-badge-pill font-mono">{activeWorkspace?.caseName || activeCase.name.split('—')[0].trim()}</span>
            <span className={`case-priority-badge font-mono priority-${(activeWorkspace?.priority || activeCase.priority || 'HIGH').toLowerCase()}`}>
              {activeWorkspace?.priority || activeCase.priority || 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Center / Right: File Adder & Importer Toggles */}
        <div className="topbar-right-cluster">
          <button
            className={`topbar-toggle-btn ${fileAdderOpen ? 'active' : ''}`}
            onClick={() => setFileAdderOpen(prev => !prev)}
            title="Toggle Case File & Entity Adder"
          >
            <Sidebar size={13} />
            <span>Case Files &amp; Entities</span>
          </button>

          <button
            className={`topbar-toggle-btn ${importerOpen ? 'active' : ''}`}
            onClick={() => setImporterOpen(prev => !prev)}
            title="Toggle Cross-Case File Importer"
          >
            <Database size={13} />
            <span>Cross-Case Importer</span>
          </button>

          <div className="topbar-divider" />

          {/* Backend Connection Indicator */}
          <div className="backend-status-pill">
            <span className={`backend-pulse-dot ${backendStatus === 'live' ? 'live' : 'offline'}`} />
            <span className="backend-status-text font-mono">
              {backendStatus === 'live' ? 'FASTAPI LIVE' : 'BACKEND OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Workspace Stage ──────────────────────────────────── */}
      <div className="workspace-main-stage">
        {/* Left: Case File Adder */}
        {fileAdderOpen && (
          <CaseFileAdder onClose={() => setFileAdderOpen(false)} />
        )}

        {/* Center: Full-Scale Investigation Canvas */}
        <main className="workspace-canvas-stage">
          <InvestigationCanvas />
        </main>

        {/* Right: Collapsible Cross-Case Importer */}
        {importerOpen && (
          <aside className="workspace-importer-dock">
            <CrossCaseImporter onClose={() => setImporterOpen(false)} />
          </aside>
        )}
      </div>
    </div>
  );
}
