import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import ProvenanceBadge from '../desktop/ProvenanceBadge';
import { MASTER_CATEGORIES } from '../../constants/masterModel';
import {
  User, Building2, MapPin, Car, DollarSign, Cpu,
  ShieldAlert, Link2, ExternalLink, Filter, Plus,
  Layers, CheckCircle2, AlertTriangle, ArrowRight, X,
  GripHorizontal, Move, Scissors, Zap, GitCommit, Check,
  Sparkles, FileText
} from 'lucide-react';
import './InvestigationCanvas.css';

export default function InvestigationCanvas() {
  const {
    activeCase,
    canvasNodes,
    setCanvasNodes,
    canvasEdges,
    addNodeToCanvas,
    addRopeConnection,
    removeEdge,
    updateNodePosition,
    selectedEntity,
    setSelectedEntity,
    ropingSource,
    setRopingSource,
    flashNodeId,
    openTab
  } = useWorkspace();

  const canvasRef = useRef(null);
  const [filterType, setFilterType] = useState('ALL');
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingNode, setDraggingNode] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Double-click / Double-tap spawn menu state
  const [doubleClickMenu, setDoubleClickMenu] = useState(null); // { x: number, y: number }
  const [quickNodeName, setQuickNodeName] = useState('');
  const lastTapRef = useRef(0);

  // Manual connection bar state
  const [showConnectBar, setShowConnectBar] = useState(false);
  const [connectFrom, setConnectFrom] = useState('');
  const [connectTo, setConnectTo] = useState('');
  const [connectRel, setConnectRel] = useState('COORDINATES_WITH');

  // Trigger temporary toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const draggingRef = useRef({ id: null, offsetX: 0, offsetY: 0 });

  // Dragging node on canvas
  const handleNodeMouseDown = (e, node) => {
    if (e.target.closest('button') || e.target.closest('.card-rope-anchor')) return;
    e.stopPropagation();

    setSelectedEntity(node);

    // If currently roping and clicked a different node, establish connection immediately
    if (ropingSource) {
      if (ropingSource !== node.id) {
        addRopeConnection(ropingSource, node.id, connectRel || 'COORDINATES_WITH');
        triggerToast(`Linked ${canvasNodes.find(n => n.id === ropingSource)?.name} ➔ ${node.name} (${connectRel || 'COORDINATES_WITH'})`);
        setRopingSource(null);
      }
      return;
    }

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - (node.x || 50);
    const offsetY = e.clientY - rect.top - (node.y || 50);

    draggingRef.current = { id: node.id, offsetX, offsetY };
    setDraggingNode(node.id);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { id, offsetX, offsetY } = draggingRef.current;
      if (!id || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = Math.max(10, Math.min(rect.width - 230, e.clientX - rect.left - offsetX));
      const newY = Math.max(10, Math.min(rect.height - 150, e.clientY - rect.top - offsetY));
      updateNodePosition(id, Math.round(newX), Math.round(newY));
    };

    const handleMouseUp = () => {
      if (draggingRef.current.id) {
        draggingRef.current = { id: null, offsetX: 0, offsetY: 0 };
        setDraggingNode(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [updateNodePosition]);

  // Handle Drop from FileExplorer or CrossCaseImporter
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    let item = null;
    const rawJson = e.dataTransfer.getData('application/json');
    const rawText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');

    if (rawJson) {
      try { item = JSON.parse(rawJson); } catch (err) {}
    }
    if (!item && rawText) {
      try { item = JSON.parse(rawText); } catch (err) {}
    }
    if (!item && window.__CONSTELLATION_DRAGGED_ITEM__) {
      item = window.__CONSTELLATION_DRAGGED_ITEM__;
    }

    if (!item) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const dropX = Math.max(20, Math.min(rect.width - 240, e.clientX - rect.left - 100));
    const dropY = Math.max(20, Math.min(rect.height - 180, e.clientY - rect.top - 40));

    const result = addNodeToCanvas(item, Math.round(dropX), Math.round(dropY));
    triggerToast(result.isExisting ? `Repositioned ${result.name} on Board` : `Added ${result.name} to Board`);
    window.__CONSTELLATION_DRAGGED_ITEM__ = null;
  };

  const startRopingFrom = (e, nodeId) => {
    e.stopPropagation();
    if (ropingSource === nodeId) {
      setRopingSource(null);
    } else {
      setRopingSource(nodeId);
      const srcNode = canvasNodes.find(n => n.id === nodeId);
      triggerToast(`Roping from ${srcNode?.name || 'entity'}. Click any destination card to complete link.`);
    }
  };

  const handleManualConnect = () => {
    if (!connectFrom || !connectTo || connectFrom === connectTo) {
      triggerToast('Please select two distinct entities to connect.');
      return;
    }
    addRopeConnection(connectFrom, connectTo, connectRel || 'COORDINATES_WITH');
    const n1 = canvasNodes.find(n => n.id === connectFrom)?.name;
    const n2 = canvasNodes.find(n => n.id === connectTo)?.name;
    triggerToast(`Connected ${n1} ➔ ${n2} (${connectRel})`);
    setShowConnectBar(false);
  };

  // Double-Click on Canvas to Spawn Node at Position
  const handleCanvasDoubleClick = (e) => {
    if (
      e.target.closest('.canvas-entity-card') ||
      e.target.closest('button') ||
      e.target.closest('.inline-connect-bar') ||
      e.target.closest('.double-tap-spawn-popover')
    ) {
      return;
    }
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft || 0;
    const scrollTop = canvasRef.current.scrollTop || 0;
    const posX = Math.max(20, Math.min(rect.width - 250, e.clientX - rect.left + scrollLeft - 110));
    const posY = Math.max(20, Math.min(rect.height - 210, e.clientY - rect.top + scrollTop - 40));

    setDoubleClickMenu({ x: posX, y: posY });
    setQuickNodeName('');
  };

  // Double-Tap on Canvas for Touch Devices
  const handleCanvasTouchEnd = (e) => {
    if (e.target.closest('.canvas-entity-card') || e.target.closest('button') || e.target.closest('.double-tap-spawn-popover')) return;
    const now = Date.now();
    const delta = now - lastTapRef.current;
    if (delta < 320 && delta > 40) {
      const touch = e.changedTouches?.[0];
      if (touch && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const scrollLeft = canvasRef.current.scrollLeft || 0;
        const scrollTop = canvasRef.current.scrollTop || 0;
        const posX = Math.max(20, Math.min(rect.width - 250, touch.clientX - rect.left + scrollLeft - 110));
        const posY = Math.max(20, Math.min(rect.height - 210, touch.clientY - rect.top + scrollTop - 40));
        setDoubleClickMenu({ x: posX, y: posY });
        setQuickNodeName('');
      }
    }
    lastTapRef.current = now;
  };

  // Spawn node at double-tap position
  const handleSpawnAtPosition = (type, customTitle = null) => {
    if (!doubleClickMenu) return;
    const seed = Math.floor(100 + Math.random() * 900);
    const id = `node-${Date.now()}-${seed}`;
    const name = customTitle && customTitle.trim() ? customTitle.trim() : null;

    let item;
    if (type === 'Person') {
      const names = ['Kareem Merchant', 'Imran Malik', 'Suresh Varma', 'Zoya Chen', 'Deepak Mehta'];
      const pick = names[Math.floor(Math.random() * names.length)];
      item = {
        id,
        name: name || `${pick} #${seed}`,
        role: 'Person of Interest / Operative',
        type: 'Person',
        threat: 'HIGH',
        provenance: 'EXTRACTED_ENTITY'
      };
    } else if (type === 'Organization') {
      const orgs = ['Apex Horizon FZE', 'Caspian Freight Lines', 'Diamond Port Logistics', 'Gulf Stream Bullion LLC'];
      const pick = orgs[Math.floor(Math.random() * orgs.length)];
      item = {
        id,
        name: name || `${pick}`,
        role: 'Corporate Entity / Shell',
        type: 'Organization',
        threat: 'CRITICAL',
        provenance: 'ANALYTICAL_INFERENCE'
      };
    } else if (type === 'Vehicle') {
      const boats = ['MV Sagar Priya', 'Dhow Bahr-al-Noor', 'Speedcraft Falcon-9', 'Cargo Vessel Al-Rayyan'];
      const pick = boats[Math.floor(Math.random() * boats.length)];
      item = {
        id,
        name: name || `${pick}`,
        role: 'Vessel / Transport Craft',
        type: 'Vehicle',
        threat: 'HIGH',
        provenance: 'RAW_DATA'
      };
    } else if (type === 'Financial') {
      item = {
        id,
        name: name || `Hawala Ledger #${seed}`,
        role: 'Settlement Account Mirror',
        type: 'Financial',
        threat: 'CRITICAL',
        provenance: 'VERIFIED_RELATIONSHIP'
      };
    } else {
      item = {
        id,
        name: name || `Evidence Artifact #${seed}`,
        role: 'Chain-of-Custody Document',
        type: 'Evidence',
        threat: 'HIGH',
        provenance: 'EVIDENCE'
      };
    }

    addNodeToCanvas(item, doubleClickMenu.x, doubleClickMenu.y);
    triggerToast(`Added ${item.name} at cursor position`);
    setDoubleClickMenu(null);
  };

  // Quick Spawn Handlers with guaranteed unique names
  const handleQuickAdd = (type) => {
    const seed = Math.floor(100 + Math.random() * 900);
    const id = `node-${Date.now()}-${seed}`;
    let item;
    if (type === 'Person') {
      const names = ['Kareem Merchant', 'Imran Malik', 'Suresh Varma', 'Zoya Chen', 'Deepak Mehta'];
      const pick = names[Math.floor(Math.random() * names.length)];
      item = { id, name: `${pick} #${seed}`, role: 'Syndicate Operative / Proxy', type: 'Person', threat: 'HIGH', provenance: 'EXTRACTED_ENTITY' };
    } else if (type === 'Organization') {
      const orgs = ['Apex Horizon FZE', 'Caspian Freight Lines', 'Diamond Port Logistics', 'Gulf Stream Bullion LLC'];
      const pick = orgs[Math.floor(Math.random() * orgs.length)];
      item = { id, name: `${pick}`, role: 'Offshore Trading Shell', type: 'Organization', threat: 'CRITICAL', provenance: 'ANALYTICAL_INFERENCE' };
    } else if (type === 'Vehicle') {
      const boats = ['MV Sagar Priya', 'Dhow Bahr-al-Noor', 'Speedcraft Falcon-9', 'Cargo Vessel Al-Rayyan'];
      const pick = boats[Math.floor(Math.random() * boats.length)];
      item = { id, name: `${pick}`, role: 'Lightering & Transshipment Vessel', type: 'Vehicle', threat: 'HIGH', provenance: 'RAW_DATA' };
    } else {
      item = { id, name: `Hawala Ledger #${seed}`, role: 'Split Tranche Clearing Mirror', type: 'Financial', threat: 'CRITICAL', provenance: 'VERIFIED_RELATIONSHIP' };
    }
    const added = addNodeToCanvas(item);
    triggerToast(`Created & Pinned ${type}: ${added.name}`);
  };

  const filteredNodes = filterType === 'ALL'
    ? canvasNodes
    : canvasNodes.filter(n => (n.type || '').toUpperCase() === filterType);

  const getEntityIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'person': return <User size={12} className="type-icon" />;
      case 'organization': return <Building2 size={12} className="type-icon" />;
      case 'vehicle': return <Car size={12} className="type-icon" />;
      case 'financial': return <DollarSign size={12} className="type-icon" />;
      case 'location': return <MapPin size={12} className="type-icon" />;
      default: return <ShieldAlert size={12} className="type-icon" />;
    }
  };

  return (
    <div className="canvas-workspace-container">
      {/* ── Top Command Strip ────────────────────────────────────── */}
      <div className="canvas-command-bar">
        {/* Filters */}
        <div className="canvas-filter-chips">
          {['ALL', 'PERSON', 'ORGANIZATION', 'VEHICLE', 'FINANCIAL'].map(type => (
            <button
              key={type}
              className={`filter-chip ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Quick Add & Connect Controls */}
        <div className="canvas-actions-cluster">
          <div className="quick-spawn-btn-group">
            <button className="spawn-btn" onClick={() => handleQuickAdd('Person')} title="Spawn a new Person node">
              <Plus size={11} /> Person
            </button>
            <button className="spawn-btn" onClick={() => handleQuickAdd('Organization')} title="Spawn an Organization node">
              <Plus size={11} /> Org
            </button>
            <button className="spawn-btn" onClick={() => handleQuickAdd('Vehicle')} title="Spawn a Vehicle node">
              <Plus size={11} /> Vessel
            </button>
            <button className="spawn-btn" onClick={() => handleQuickAdd('Financial')} title="Spawn a Financial node">
              <Plus size={11} /> Hawala
            </button>
          </div>

          <button
            className={`canvas-connect-tool-btn ${showConnectBar ? 'active' : ''}`}
            onClick={() => setShowConnectBar(prev => !prev)}
            title="Open connection builder to rope two nodes"
          >
            <Link2 size={12} />
            <span>Connect Nodes</span>
          </button>
        </div>

        {/* Status Counts & Double-Click Hint */}
        <div className="canvas-meta-status">
          <span className="canvas-double-click-hint font-mono">💡 Double-tap canvas to add node</span>
          <span className="meta-badge-nodes">{canvasNodes.length} NODES</span>
          <span className="meta-badge-ropes">{canvasEdges.length} ROPES</span>
        </div>
      </div>

      {/* ── INLINE CONNECTION BUILDER BAR ───────────────────────── */}
      {showConnectBar && (
        <div className="inline-connect-bar">
          <div className="connect-bar-inner">
            <span className="connect-bar-label">ROPE CONNECTION:</span>
            <select
              className="connect-select"
              value={connectFrom}
              onChange={(e) => setConnectFrom(e.target.value)}
            >
              <option value="">Select Source Node...</option>
              {canvasNodes.map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
              ))}
            </select>

            <span className="connect-arrow">➔</span>

            <select
              className="connect-select"
              value={connectTo}
              onChange={(e) => setConnectTo(e.target.value)}
            >
              <option value="">Select Target Node...</option>
              {canvasNodes.map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
              ))}
            </select>

            <select
              className="connect-select rel-select"
              value={connectRel}
              onChange={(e) => setConnectRel(e.target.value)}
            >
              {MASTER_CATEGORIES['16_RELATIONSHIPS'].types.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>

            <button className="connect-execute-btn" onClick={handleManualConnect}>
              <Check size={11} /> Connect
            </button>
            <button className="connect-cancel-btn" onClick={() => setShowConnectBar(false)}>
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      {/* ── ROPING ACTIVE BANNER ─────────────────────────────────── */}
      {ropingSource && (
        <div className="roping-instruction-strip">
          <Zap size={13} className="roping-pulse-glyph" />
          <span>
            ROPING ACTIVE: Click any destination card to connect with <strong>{canvasNodes.find(n => n.id === ropingSource)?.name}</strong>
          </span>
          <button className="roping-dismiss-btn" onClick={() => setRopingSource(null)}>
            Cancel Roping
          </button>
        </div>
      )}

      {/* ── TOAST CONFIRMATION NOTIFICATION ─────────────────────── */}
      {toastMessage && (
        <div className="canvas-toast-pill">
          <CheckCircle2 size={13} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Interactive Pinboard / Canvas Area ──────────────────── */}
      <div
        ref={canvasRef}
        className={`canvas-board-viewport ${isDragOver ? 'drag-over-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDoubleClick={handleCanvasDoubleClick}
        onTouchEnd={handleCanvasTouchEnd}
      >
        {/* Drop Highlight Overlay */}
        {isDragOver && (
          <div className="canvas-drop-hint">
            <Plus size={24} />
            <span>Drop Entity onto Investigation Board</span>
          </div>
        )}

        {/* ── DOUBLE-CLICK / DOUBLE-TAP QUICK SPAWN POPOVER ─────── */}
        {doubleClickMenu && (
          <div
            className="double-tap-spawn-popover"
            style={{
              transform: `translate3d(${doubleClickMenu.x}px, ${doubleClickMenu.y}px, 0)`
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <div className="popover-header">
              <div className="popover-title-row">
                <Sparkles size={12} className="popover-icon" />
                <span className="popover-title">ADD NODE AT POSITION</span>
              </div>
              <button
                className="popover-close-btn"
                onClick={() => setDoubleClickMenu(null)}
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>

            {/* Quick Name Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSpawnAtPosition('Person', quickNodeName);
              }}
              className="popover-form"
            >
              <input
                type="text"
                className="popover-input"
                placeholder="Entity name... (Enter to add)"
                value={quickNodeName}
                onChange={(e) => setQuickNodeName(e.target.value)}
                autoFocus
              />
            </form>

            {/* Fast Type Spawn Buttons */}
            <div className="popover-type-grid">
              <button
                type="button"
                className="popover-type-btn"
                onClick={() => handleSpawnAtPosition('Person', quickNodeName)}
                title="Add Person"
              >
                <User size={12} />
                <span>Person</span>
              </button>
              <button
                type="button"
                className="popover-type-btn"
                onClick={() => handleSpawnAtPosition('Organization', quickNodeName)}
                title="Add Organization"
              >
                <Building2 size={12} />
                <span>Org</span>
              </button>
              <button
                type="button"
                className="popover-type-btn"
                onClick={() => handleSpawnAtPosition('Vehicle', quickNodeName)}
                title="Add Vehicle / Vessel"
              >
                <Car size={12} />
                <span>Vessel</span>
              </button>
              <button
                type="button"
                className="popover-type-btn"
                onClick={() => handleSpawnAtPosition('Financial', quickNodeName)}
                title="Add Financial / Hawala Account"
              >
                <DollarSign size={12} />
                <span>Hawala</span>
              </button>
              <button
                type="button"
                className="popover-type-btn"
                onClick={() => handleSpawnAtPosition('Evidence', quickNodeName)}
                title="Add Evidence Artifact"
              >
                <FileText size={12} />
                <span>Evidence</span>
              </button>
            </div>
          </div>
        )}

        {/* ── SVG Bezier Ropes Layer ────────────────────────────── */}
        <svg className="canvas-ropes-svg">
          {canvasEdges.map(edge => {
            const src = canvasNodes.find(n => n.id === edge.source);
            const dst = canvasNodes.find(n => n.id === edge.target);
            if (!src || !dst) return null;

            // Anchor centers
            const x1 = (src.x || 80) + 110;
            const y1 = (src.y || 80) + 55;
            const x2 = (dst.x || 400) + 110;
            const y2 = (dst.y || 200) + 55;

            // Curvature control points
            const dx = x2 - x1;
            const dy = y2 - y1;
            const cx1 = x1 + dx * 0.5;
            const cy1 = y1 - 25;
            const cx2 = x1 + dx * 0.5;
            const cy2 = y2 + 25;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={edge.id} className="rope-curve-group">
                {/* Glow shadow */}
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="6"
                  fill="none"
                />
                {/* Main animated dashed rope line */}
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeDasharray="6, 4"
                  fill="none"
                  className="rope-path"
                />
                {/* Midpoint Interactive Relationship Badge */}
                <foreignObject
                  x={midX - 75}
                  y={midY - 13}
                  width="150"
                  height="26"
                  className="rope-foreign-object"
                >
                  <div className="rope-label-pill" title={`${edge.label} (Confidence: ${edge.confidence || 0.94})`}>
                    <span className="rope-text">{edge.label}</span>
                    <button
                      className="rope-sever-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEdge(edge.id);
                        triggerToast(`Severed rope: ${edge.label}`);
                      }}
                      title="Sever / Cut Rope"
                    >
                      <Scissors size={10} />
                    </button>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* ── Interactive Draggable Node Cards ──────────────────── */}
        {filteredNodes.map(node => {
          const isSelected = selectedEntity?.id === node.id;
          const isRopingTarget = ropingSource && ropingSource !== node.id;
          const isRopingSelf = ropingSource === node.id;
          const isFlashed = flashNodeId === node.id;

          return (
            <div
              key={node.id}
              className={`canvas-entity-card ${isSelected ? 'selected' : ''} ${isRopingSelf ? 'roping-source-node' : ''} ${isRopingTarget ? 'roping-target-candidate' : ''} ${isFlashed ? 'flash-highlight' : ''}`}
              style={{
                transform: `translate3d(${node.x || 80}px, ${node.y || 80}px, 0)`
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onClick={() => {
                if (ropingSource && ropingSource !== node.id) {
                  addRopeConnection(ropingSource, node.id, connectRel || 'COORDINATES_WITH');
                  triggerToast(`Connected ${canvasNodes.find(n => n.id === ropingSource)?.name} ➔ ${node.name} (${connectRel || 'COORDINATES_WITH'})`);
                  setRopingSource(null);
                } else {
                  setSelectedEntity(node);
                }
              }}
            >
              {/* Left & Right Connection Anchors */}
              <div
                className="card-rope-anchor anchor-left"
                onClick={(e) => startRopingFrom(e, node.id)}
                title="Click anchor to link"
              />
              <div
                className="card-rope-anchor anchor-right"
                onClick={(e) => startRopingFrom(e, node.id)}
                title="Click anchor to link"
              />

              {/* Roping Target Hint */}
              {isRopingTarget && (
                <div className="roping-target-hint font-mono">
                  <Link2 size={11} />
                  <span>CLICK TO LINK</span>
                </div>
              )}

              {/* Card Header */}
              <div className="card-drag-header">
                <div className="card-type-tag">
                  {getEntityIcon(node.type)}
                  <span>{(node.type || 'ENTITY').toUpperCase()}</span>
                </div>
                <div className="card-header-actions">
                  <ProvenanceBadge level={node.provenance || 'RAW DATA'} size="sm" />
                  <button
                    className={`card-rope-btn ${isRopingSelf ? 'active' : ''}`}
                    onClick={(e) => startRopingFrom(e, node.id)}
                    title={isRopingSelf ? "Cancel Roping" : "Rope / Connect to another node"}
                  >
                    <Link2 size={11} />
                  </button>
                </div>
              </div>

              {/* Entity Title */}
              <div className="card-node-title">
                {node.name}
              </div>

              {/* Role / Subtitle */}
              <div className="card-node-role">
                {node.role}
              </div>

              {/* Threat & Link Indicators */}
              <div className="card-node-footer">
                <span className={`threat-indicator threat-${(node.threat || 'HIGH').toLowerCase()}`}>
                  {node.threat || 'HIGH'}
                </span>
                <span className="node-drag-grip" title="Drag to move card">
                  <GripHorizontal size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
