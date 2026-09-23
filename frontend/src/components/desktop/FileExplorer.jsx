import { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Panel3D from '../Panel3D';
import {
  ChevronDown, ChevronRight, Folder, FolderOpen, FileText,
  User, Brain, Briefcase, Radio, Users, Building2, MapPin,
  Car, DollarSign, Cpu, Calendar, ShieldAlert, GitCommit,
  Layers, Search, FileCode, CheckCircle2, AlertCircle, GripVertical, Plus
} from 'lucide-react';
import './FileExplorer.css';

export default function FileExplorer() {
  const {
    activeCaseId,
    setActiveCaseId,
    activeCase,
    selectedFileItem,
    setSelectedFileItem,
    openTab,
    addNodeToCanvas
  } = useWorkspace();

  const [expandedSections, setExpandedSections] = useState({
    USER: false,
    BYOMKESH: false,
    CASES: true,
    INTELLIGENCE: false,
    ACTIVE_CASE: true,
    INFORMATION: true,
    PEOPLE_SUB: true,
    ORGS_SUB: true,
    FIN_SUB: true,
    VEH_SUB: true,
    INVESTIGATION: true,
    EVIDENCE_SUB: true
  });

  const [filterText, setFilterText] = useState('');

  const toggleSection = (key, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectCase = (caseId) => {
    setActiveCaseId(caseId);
    // Keep section open permanently when selected
    setExpandedSections(prev => ({
      ...prev,
      CASES: true,
      ACTIVE_CASE: true,
      INFORMATION: true,
      INVESTIGATION: true
    }));
    setSelectedFileItem({
      type: 'case_root',
      folder: 'CASES',
      item: caseId === 'case-102' ? 'Case 102 — Silver Dune' : caseId
    });
  };

  const handleSelectItem = (folder, item, tabTarget = 'canvas') => {
    setSelectedFileItem({ type: 'item', folder, item });
    openTab({ id: tabTarget, title: item, type: tabTarget, closable: true });
  };

  const matchesFilter = (name) => {
    if (!filterText.trim()) return true;
    return (name || '').toLowerCase().includes(filterText.toLowerCase().trim());
  };

  const handleUniversalDragStart = (e, item) => {
    const payload = JSON.stringify(item);
    try {
      e.dataTransfer.setData('application/json', payload);
      e.dataTransfer.setData('text/plain', payload);
      e.dataTransfer.setData('text', payload);
    } catch (err) {}
    window.__CONSTELLATION_DRAGGED_ITEM__ = item;
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Panel3D className="explorer-sidebar-panel3d" glow="white" maxAngle={3}>
      <aside className="explorer-sidebar">
        {/* Explorer Top Toolbar with Live Search */}
        <div className="explorer-title-bar">
          <span className="explorer-title">EXPLORER</span>
          <div className="explorer-search-input-wrap">
            <Search size={11} className="exp-search-icon" />
            <input
              type="text"
              placeholder="Filter files & entities..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="exp-search-field"
            />
            {filterText && (
              <button className="exp-search-clear" onClick={() => setFilterText('')}>×</button>
            )}
          </div>
        </div>

        <div className="explorer-tree-content">
          {/* ══ 1. ROOT: USER ════════════════════════════════════════ */}
          <div className="tree-node-group">
            <div
              className="tree-node-header"
              onClick={() => handleSelectItem('USER', 'My Cases')}
            >
              <span className="chevron-toggle-btn" onClick={(e) => toggleSection('USER', e)}>
                {expandedSections.USER ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </span>
              <User size={13} className="node-icon icon-user" />
              <span className="node-name">USER WORKSPACE</span>
              <span className="node-count-badge">5</span>
            </div>

            {expandedSections.USER && (
              <div className="tree-children">
                <div className="tree-item" onClick={() => handleSelectItem('USER', 'My Cases')}>
                  <Briefcase size={12} className="item-icon" />
                  <span>My Cases</span>
                </div>
                <div className="tree-item" onClick={() => handleSelectItem('USER', 'My Investigations')}>
                  <Layers size={12} className="item-icon" />
                  <span>My Investigations</span>
                </div>
                <div className="tree-item" onClick={() => handleSelectItem('USER', 'Evidence', 'evidence')}>
                  <ShieldAlert size={12} className="item-icon" />
                  <span>Evidence Vault</span>
                </div>
                <div className="tree-item" onClick={() => handleSelectItem('USER', 'Reports', 'research')}>
                  <FileCode size={12} className="item-icon" />
                  <span>Investigation Reports</span>
                </div>
              </div>
            )}
          </div>

          {/* ══ 2. ROOT: BYOMKESH ════════════════════════════════════ */}
          <div className="tree-node-group">
            <div
              className="tree-node-header"
              onClick={() => handleSelectItem('BYOMKESH', 'Active Research', 'research')}
            >
              <span className="chevron-toggle-btn" onClick={(e) => toggleSection('BYOMKESH', e)}>
                {expandedSections.BYOMKESH ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </span>
              <Brain size={13} className="node-icon icon-byomkesh" />
              <span className="node-name">BYOMKESH REASONING</span>
              <span className="node-count-badge">4</span>
            </div>

            {expandedSections.BYOMKESH && (
              <div className="tree-children">
                <div className="tree-item" onClick={() => handleSelectItem('BYOMKESH', 'Active Research', 'research')}>
                  <Brain size={12} className="item-icon text-white" />
                  <span>Active Reasoning</span>
                </div>
                <div className="tree-item" onClick={() => handleSelectItem('BYOMKESH', 'Autonomous Investigations', 'research')}>
                  <GitCommit size={12} className="item-icon" />
                  <span>Autonomous Investigations</span>
                </div>
                <div className="tree-item" onClick={() => handleSelectItem('BYOMKESH', 'Cross-Case Analysis', 'network')}>
                  <Layers size={12} className="item-icon" />
                  <span>Cross-Case Analysis</span>
                </div>
                <div className="tree-item" onClick={() => handleSelectItem('BYOMKESH', 'Discoveries', 'canvas')}>
                  <CheckCircle2 size={12} className="item-icon" />
                  <span>Verified Deductions</span>
                </div>
              </div>
            )}
          </div>

          {/* ══ 3. ROOT: CASES ═══════════════════════════════════════ */}
          <div className="tree-node-group">
            <div
              className="tree-node-header"
              onClick={() => handleSelectCase('case-102')}
            >
              <span className="chevron-toggle-btn" onClick={(e) => toggleSection('CASES', e)}>
                {expandedSections.CASES ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </span>
              <Briefcase size={13} className="node-icon icon-cases" />
              <span className="node-name">CASES DIRECTORY</span>
              <span className="node-count-badge">3</span>
            </div>

            {expandedSections.CASES && (
              <div className="tree-children">
                {/* Case 102 Folder */}
                <div className="case-subfolder">
                  <div
                    className={`tree-node-header case-header ${activeCaseId === 'case-102' ? 'active-case' : ''}`}
                    onClick={() => handleSelectCase('case-102')}
                  >
                    <span className="chevron-toggle-btn" onClick={(e) => toggleSection('ACTIVE_CASE', e)}>
                      {expandedSections.ACTIVE_CASE ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </span>
                    {expandedSections.ACTIVE_CASE ? <FolderOpen size={13} className="folder-icon" /> : <Folder size={13} className="folder-icon" />}
                    <span className="case-title-text">CASE 102 — SILVER DUNE</span>
                    <span className="case-status-dot dot-critical" title="Priority: Critical" />
                  </div>

                  {expandedSections.ACTIVE_CASE && activeCaseId === 'case-102' && (
                    <div className="case-branches">
                      {/* BRANCH A: INFORMATION ("What exists") */}
                      <div className="branch-group">
                        <div
                          className="branch-header"
                          onClick={() => setExpandedSections(prev => ({ ...prev, INFORMATION: true }))}
                        >
                          <span className="chevron-toggle-btn" onClick={(e) => toggleSection('INFORMATION', e)}>
                            {expandedSections.INFORMATION ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                          </span>
                          <span className="branch-label label-info">INFORMATION</span>
                          <span className="branch-sublabel">ENTITIES & ARTIFACTS</span>
                        </div>

                        {expandedSections.INFORMATION && (
                          <div className="branch-items">
                            {/* ── PEOPLE SUBTREE (DRAGGABLE & CLICK-ADD) ── */}
                            <div className="nested-entity-category">
                              <div
                                className="tree-item category-head"
                                onClick={() => setExpandedSections(prev => ({ ...prev, PEOPLE_SUB: !prev.PEOPLE_SUB }))}
                              >
                                <span className="chevron-toggle-btn">
                                  {expandedSections.PEOPLE_SUB ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                </span>
                                <Users size={12} className="item-icon" />
                                <span className="cat-title">People</span>
                                <span className="item-badge">4</span>
                              </div>
                              {expandedSections.PEOPLE_SUB && (
                                <div className="draggable-items-sublist">
                                  {[
                                    { id: 'p-1', name: 'Tariq "The Anchor" Merchant', role: 'Syndicate Coordinator', threat: 'CRITICAL', provenance: 'INFERENCE' },
                                    { id: 'p-2', name: 'Rajesh Sharma', role: 'Charter Broker', threat: 'HIGH', provenance: 'OBSERVATION' },
                                    { id: 'p-3', name: 'Captain Al-Sayed', role: 'Vessel Master', threat: 'MEDIUM', provenance: 'RAW DATA' },
                                    { id: 'p-4', name: 'Nadia Chen', role: 'Financial Broker', threat: 'HIGH', provenance: 'CORRELATION' }
                                  ].filter(p => matchesFilter(p.name)).map(p => (
                                    <div
                                      key={p.id}
                                      className="draggable-tree-entity"
                                      draggable={true}
                                      title="Drag to Canvas or click [+ Add] to pin"
                                      onDragStart={(e) => handleUniversalDragStart(e, {
                                        id: p.id,
                                        name: p.name,
                                        type: 'Person',
                                        role: p.role,
                                        threat: p.threat,
                                        provenance: p.provenance
                                      })}
                                    >
                                      <GripVertical size={11} className="drag-handle-glyph" />
                                      <User size={11} className="entity-item-icon" />
                                      <span className="entity-tree-name">{p.name}</span>
                                      <button
                                        className="entity-quick-add-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addNodeToCanvas(p);
                                        }}
                                        title="Pin to board"
                                      >
                                        <Plus size={10} /> Add
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* ── ORGANIZATIONS SUBTREE (DRAGGABLE & CLICK-ADD) ── */}
                            <div className="nested-entity-category">
                              <div
                                className="tree-item category-head"
                                onClick={() => setExpandedSections(prev => ({ ...prev, ORGS_SUB: !prev.ORGS_SUB }))}
                              >
                                <span className="chevron-toggle-btn">
                                  {expandedSections.ORGS_SUB ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                </span>
                                <Building2 size={12} className="item-icon" />
                                <span className="cat-title">Organizations</span>
                                <span className="item-badge">2</span>
                              </div>
                              {expandedSections.ORGS_SUB && (
                                <div className="draggable-items-sublist">
                                  {[
                                    { id: 'org-1', name: 'Al-Barakah Logistics FZE', role: 'Shell Charterer (Dubai)', threat: 'HIGH', provenance: 'INFERENCE', type: 'Organization' },
                                    { id: 'org-2', name: 'Vikramaditya Shipping Lines', role: 'Maritime Freight Operator', threat: 'MEDIUM', provenance: 'RAW DATA', type: 'Organization' }
                                  ].filter(org => matchesFilter(org.name)).map(org => (
                                    <div
                                      key={org.id}
                                      className="draggable-tree-entity"
                                      draggable={true}
                                      title="Drag to Canvas or click [+ Add] to pin"
                                      onDragStart={(e) => handleUniversalDragStart(e, org)}
                                    >
                                      <GripVertical size={11} className="drag-handle-glyph" />
                                      <Building2 size={11} className="entity-item-icon" />
                                      <span className="entity-tree-name">{org.name}</span>
                                      <button
                                        className="entity-quick-add-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addNodeToCanvas(org);
                                        }}
                                        title="Pin to board"
                                      >
                                        <Plus size={10} /> Add
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* ── VEHICLES SUBTREE (DRAGGABLE & CLICK-ADD) ── */}
                            <div className="nested-entity-category">
                              <div
                                className="tree-item category-head"
                                onClick={() => setExpandedSections(prev => ({ ...prev, VEH_SUB: !prev.VEH_SUB }))}
                              >
                                <span className="chevron-toggle-btn">
                                  {expandedSections.VEH_SUB ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                </span>
                                <Car size={12} className="item-icon" />
                                <span className="cat-title">Vehicles</span>
                                <span className="item-badge">1</span>
                              </div>
                              {expandedSections.VEH_SUB && (
                                <div className="draggable-items-sublist">
                                  <div
                                    className="draggable-tree-entity"
                                    draggable={true}
                                    title="Drag onto Canvas to pin"
                                    onDragStart={(e) => handleUniversalDragStart(e, {
                                      id: 'veh-1',
                                      name: 'MV Sagar Ratna (IMO 921882)',
                                      type: 'Vehicle',
                                      role: 'Bulk Cargo Carrier',
                                      threat: 'HIGH',
                                      provenance: 'RAW DATA'
                                    })}
                                  >
                                    <GripVertical size={11} className="drag-handle-glyph" />
                                    <Car size={11} className="entity-item-icon" />
                                    <span className="entity-tree-name">MV Sagar Ratna</span>
                                    <button
                                      className="entity-quick-add-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addNodeToCanvas({
                                          id: 'veh-1',
                                          name: 'MV Sagar Ratna (IMO 921882)',
                                          type: 'Vehicle',
                                          role: 'Bulk Cargo Carrier',
                                          threat: 'HIGH',
                                          provenance: 'RAW DATA'
                                        });
                                      }}
                                    >
                                      <Plus size={10} /> Add
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ── FINANCIAL SUBTREE (DRAGGABLE & CLICK-ADD) ── */}
                            <div className="nested-entity-category">
                              <div
                                className="tree-item category-head"
                                onClick={() => setExpandedSections(prev => ({ ...prev, FIN_SUB: !prev.FIN_SUB }))}
                              >
                                <span className="chevron-toggle-btn">
                                  {expandedSections.FIN_SUB ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                </span>
                                <DollarSign size={12} className="item-icon" />
                                <span className="cat-title">Financial</span>
                                <span className="item-badge">1</span>
                              </div>
                              {expandedSections.FIN_SUB && (
                                <div className="draggable-items-sublist">
                                  <div
                                    className="draggable-tree-entity"
                                    draggable={true}
                                    title="Drag onto Canvas to pin"
                                    onDragStart={(e) => handleUniversalDragStart(e, {
                                      id: 'fin-1',
                                      name: 'Hawala Account #88219',
                                      type: 'Financial',
                                      role: '₹14.8 Cr Settlement Mirror',
                                      threat: 'CRITICAL',
                                      provenance: 'CORRELATION'
                                    })}
                                  >
                                    <GripVertical size={11} className="drag-handle-glyph" />
                                    <DollarSign size={11} className="entity-item-icon" />
                                    <span className="entity-tree-name">Hawala Node #88219</span>
                                    <button
                                      className="entity-quick-add-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addNodeToCanvas({
                                          id: 'fin-1',
                                          name: 'Hawala Account #88219',
                                          type: 'Financial',
                                          role: '₹14.8 Cr Settlement Mirror',
                                          threat: 'CRITICAL',
                                          provenance: 'CORRELATION'
                                        });
                                      }}
                                    >
                                      <Plus size={10} /> Add
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Evidence Subfolder (Draggable) */}
                            <div className="nested-folder">
                              <div
                                className="tree-item"
                                onClick={() => setExpandedSections(prev => ({ ...prev, EVIDENCE_SUB: !prev.EVIDENCE_SUB }))}
                              >
                                <span className="chevron-toggle-btn">
                                  {expandedSections.EVIDENCE_SUB ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                </span>
                                <ShieldAlert size={12} className="item-icon text-white" />
                                <span>Evidence Items</span>
                                <span className="item-badge">3</span>
                              </div>
                              {expandedSections.EVIDENCE_SUB && (
                                <div className="draggable-items-sublist">
                                  {[
                                    { id: 'evd-1', name: 'Bill of Lading #BOL-9921', role: 'Panama Maritime Doc', type: 'Evidence', threat: 'MEDIUM', provenance: 'RAW DATA' },
                                    { id: 'evd-2', name: 'CCTV Night Offload Still', role: 'Port Gate 3 Footage', type: 'Evidence', threat: 'HIGH', provenance: 'RAW DATA' },
                                    { id: 'evd-3', name: 'Wire Transfer Ledger', role: 'Al-Barakah Mirror', type: 'Evidence', threat: 'CRITICAL', provenance: 'CORRELATION' }
                                  ].filter(evd => matchesFilter(evd.name)).map(evd => (
                                    <div
                                      key={evd.id}
                                      className="draggable-tree-entity"
                                      draggable={true}
                                      title="Drag onto Canvas to pin"
                                      onDragStart={(e) => handleUniversalDragStart(e, evd)}
                                    >
                                      <GripVertical size={11} className="drag-handle-glyph" />
                                      <FileText size={11} className="entity-item-icon" />
                                      <span className="entity-tree-name">{evd.name}</span>
                                      <button
                                        className="entity-quick-add-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addNodeToCanvas(evd);
                                        }}
                                      >
                                        <Plus size={10} /> Add
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* BRANCH B: INVESTIGATION */}
                      <div className="branch-group">
                        <div
                          className="branch-header"
                          onClick={() => setExpandedSections(prev => ({ ...prev, INVESTIGATION: true }))}
                        >
                          <span className="chevron-toggle-btn" onClick={(e) => toggleSection('INVESTIGATION', e)}>
                            {expandedSections.INVESTIGATION ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                          </span>
                          <span className="branch-label label-inv">INVESTIGATION</span>
                          <span className="branch-sublabel">UNDERSTANDING</span>
                        </div>

                        {expandedSections.INVESTIGATION && (
                          <div className="branch-items">
                            <div
                              className={`tree-item ${selectedFileItem.item === 'Main Investigation' ? 'selected' : ''}`}
                              onClick={() => handleSelectItem('INVESTIGATION', 'Main Investigation', 'canvas')}
                            >
                              <FileText size={12} className="item-icon text-white" />
                              <span>Main Investigation</span>
                            </div>
                            <div
                              className={`tree-item ${selectedFileItem.item === 'Financial Network' ? 'selected' : ''}`}
                              onClick={() => handleSelectItem('INVESTIGATION', 'Financial Network', 'network')}
                            >
                              <DollarSign size={12} className="item-icon" />
                              <span>Financial Network</span>
                            </div>
                            <div
                              className={`tree-item ${selectedFileItem.item === 'Timeline Reconstruction' ? 'selected' : ''}`}
                              onClick={() => handleSelectItem('INVESTIGATION', 'Timeline Reconstruction', 'timeline')}
                            >
                              <Calendar size={12} className="item-icon" />
                              <span>Timeline Reconstruction</span>
                            </div>
                            <div
                              className={`tree-item ${selectedFileItem.item === 'Hypotheses' ? 'selected' : ''}`}
                              onClick={() => handleSelectItem('INVESTIGATION', 'Hypotheses', 'hypotheses')}
                            >
                              <AlertCircle size={12} className="item-icon" />
                              <span>Hypotheses</span>
                              <span className="item-badge">2</span>
                            </div>
                            <div
                              className={`tree-item ${selectedFileItem.item === 'Findings' ? 'selected' : ''}`}
                              onClick={() => handleSelectItem('INVESTIGATION', 'Findings', 'research')}
                            >
                              <CheckCircle2 size={12} className="item-icon" />
                              <span>Findings</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Case 117 Folder */}
                <div
                  className={`tree-node-header case-header ${activeCaseId === 'case-117' ? 'active-case' : ''}`}
                  onClick={() => handleSelectCase('case-117')}
                >
                  <Folder size={13} className="folder-icon" />
                  <span className="case-title-text">CASE 117 — OPERATION BLACK TIDE</span>
                </div>

                {/* Case 143 Folder */}
                <div
                  className={`tree-node-header case-header ${activeCaseId === 'case-143' ? 'active-case' : ''}`}
                  onClick={() => handleSelectCase('case-143')}
                >
                  <Folder size={13} className="folder-icon" />
                  <span className="case-title-text">CASE 143 — RED SAND SYNDICATE</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </Panel3D>
  );
}
