import { useState } from 'react';
import { useWorkspace, CANONICAL_CASES } from '../../contexts/WorkspaceContext';
import Panel3D from '../Panel3D';
import {
  FolderPlus, Layers, Play, Clock, Shield, Search,
  Trash2, Plus, ArrowRight, CheckCircle2, ChevronRight,
  Briefcase, Activity, AlertTriangle, X
} from 'lucide-react';
import './WorkspaceOverviewHub.css';

export default function WorkspaceOverviewHub() {
  const {
    workspaces,
    openWorkspace,
    createWorkspace,
    deleteWorkspace,
    setActiveNavSection
  } = useWorkspace();

  const [searchFilter, setSearchFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsForm, setNewWsForm] = useState({
    name: '',
    caseId: 'case-102',
    description: ''
  });

  const allCasesList = Object.values(CANONICAL_CASES);

  const filteredWorkspaces = workspaces.filter(w => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      w.name.toLowerCase().includes(q) ||
      (w.caseName && w.caseName.toLowerCase().includes(q)) ||
      (w.description && w.description.toLowerCase().includes(q)) ||
      (w.genre && w.genre.toLowerCase().includes(q))
    );
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newWsForm.name.trim()) return;

    createWorkspace({
      name: newWsForm.name,
      caseId: newWsForm.caseId,
      description: newWsForm.description
    });

    setShowCreateModal(false);
    setNewWsForm({
      name: '',
      caseId: 'case-102',
      description: ''
    });
  };

  return (
    <div className="workspace-hub-scrollable">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <Panel3D className="hub-header-panel3d" glow="white" maxAngle={2}>
        <div className="hub-header-container">
          <div className="hub-header-left">
            <div className="hub-badge-row">
              <span className="hub-live-dot" />
              <span className="hub-title-kicker font-mono">WORKSPACE COMMAND CENTER</span>
              <span className="hub-count-pill font-mono">{workspaces.length} ACTIVE WORKSPACES</span>
            </div>
            <h1 className="hub-main-title">Investigation Workspaces</h1>
            <p className="hub-subtext">
              Select an ongoing case workspace to continue graph analysis, or create a clean new workspace to import dossiers, link people, and map cross-case conduits.
            </p>
          </div>

          <div className="hub-header-actions">
            <button
              className="btn btn-primary hub-create-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={14} /> Create New Workspace
            </button>
          </div>
        </div>
      </Panel3D>

      {/* ── Search & Filter Controls ─────────────────────────────── */}
      <div className="hub-toolbar-strip">
        <div className="hub-search-box">
          <Search size={14} className="hub-search-icon" />
          <input
            type="text"
            className="hub-search-input"
            placeholder="Search workspaces by name, case, or keyword..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          {searchFilter && (
            <button className="hub-search-clear" onClick={() => setSearchFilter('')}>×</button>
          )}
        </div>

        <div className="hub-stats-overview font-mono">
          <span>SHOWING {filteredWorkspaces.length} OF {workspaces.length} WORKSPACES</span>
        </div>
      </div>

      {/* ── Workspaces Grid ──────────────────────────────────────── */}
      <div className="hub-workspaces-grid">
        {filteredWorkspaces.map(ws => (
          <Panel3D key={ws.id} className="hub-card-panel3d" glow="white" maxAngle={4}>
            <div
              className={`hub-workspace-card priority-border-${(ws.priority || 'high').toLowerCase()}`}
              onClick={() => openWorkspace(ws.id)}
            >
              {/* Card Top Meta */}
              <div className="ws-card-top-row">
                <span className="ws-case-tag font-mono">{ws.caseName || 'Case Workspace'}</span>
                <span className={`ws-priority-pill priority-${(ws.priority || 'high').toLowerCase()}`}>
                  {ws.priority || 'ACTIVE'}
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="ws-card-title">{ws.name}</h2>
              <p className="ws-card-desc">{ws.description}</p>

              {/* Entity & Rope Count Badges */}
              <div className="ws-stats-chips">
                <div className="stat-chip">
                  <Layers size={11} />
                  <span className="font-mono">{ws.nodesCount || ws.nodes?.length || 0} Entities</span>
                </div>
                <div className="stat-chip">
                  <span className="font-mono">{ws.edgesCount || ws.edges?.length || 0} Ropes</span>
                </div>
                <div className="stat-chip time-chip">
                  <Clock size={11} />
                  <span>{ws.lastModified || 'Recent'}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="ws-card-footer">
                <button
                  className="btn btn-primary ws-open-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openWorkspace(ws.id);
                  }}
                >
                  <Play size={12} fill="currentColor" /> Open Workspace
                </button>

                <button
                  className="ws-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete workspace "${ws.name}"?`)) {
                      deleteWorkspace(ws.id);
                    }
                  }}
                  title="Delete Workspace"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </Panel3D>
        ))}

        {/* Create Workspace Quick Tile */}
        <div className="hub-create-tile" onClick={() => setShowCreateModal(true)}>
          <div className="create-tile-inner">
            <div className="create-tile-icon-box">
              <Plus size={24} />
            </div>
            <h3 className="create-tile-title">New Workspace</h3>
            <p className="create-tile-caption">Create a clean board or link an existing case dossier</p>
          </div>
        </div>
      </div>

      {/* ── CREATE WORKSPACE MODAL ───────────────────────────────── */}
      {showCreateModal && (
        <div className="hub-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="hub-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="hub-modal-header">
              <div className="modal-title-group">
                <FolderPlus size={16} className="modal-title-icon" />
                <h3 className="modal-title">Create New Investigation Workspace</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="hub-modal-form">
              <div className="modal-form-group">
                <label className="modal-label font-mono">WORKSPACE NAME</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Dubai Hawala Trail & Shells"
                  value={newWsForm.name}
                  onChange={(e) => setNewWsForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  autoFocus
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label font-mono">ASSOCIATE PRIMARY CASE</label>
                <select
                  className="modal-select"
                  value={newWsForm.caseId}
                  onChange={(e) => setNewWsForm(prev => ({ ...prev, caseId: e.target.value }))}
                >
                  {allCasesList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.genreLabel || c.genre})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-label font-mono">DESCRIPTION & INVESTIGATIVE GOAL</label>
                <textarea
                  className="modal-textarea"
                  rows={3}
                  placeholder="Brief note on what this workspace board is analyzing..."
                  value={newWsForm.description}
                  onChange={(e) => setNewWsForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newWsForm.name.trim()}
                >
                  <Plus size={13} /> Create &amp; Open Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
