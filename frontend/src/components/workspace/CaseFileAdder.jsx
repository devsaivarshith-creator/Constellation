import { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import ProvenanceBadge from '../desktop/ProvenanceBadge';
import {
  Search, Plus, User, Building2, Car, DollarSign,
  ShieldAlert, FileText, Upload, Check, GripVertical,
  X, Layers, ChevronRight, Sparkles
} from 'lucide-react';
import './CaseFileAdder.css';

export default function CaseFileAdder({ onClose }) {
  const {
    activeCase,
    canvasNodes,
    addNodeToCanvas
  } = useWorkspace();

  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [customEntity, setCustomEntity] = useState({
    name: '',
    type: 'Person',
    role: '',
    threat: 'HIGH',
    provenance: 'EXTRACTED_ENTITY'
  });
  const [addedIds, setAddedIds] = useState(new Set());

  // Extract all entities available in the active case
  const availableItems = [];
  const info = activeCase?.information || {};

  if (info.people) {
    info.people.forEach(p => availableItems.push({ ...p, type: 'Person', role: p.role || 'Person of Interest' }));
  }
  if (info.organizations) {
    info.organizations.forEach(o => availableItems.push({ ...o, type: 'Organization', role: o.type || 'Corporate Entity' }));
  }
  if (info.vehicles) {
    info.vehicles.forEach(v => availableItems.push({ ...v, type: 'Vehicle', role: v.type || 'Vehicle / Vessel' }));
  }
  if (info.financial) {
    info.financial.forEach(f => availableItems.push({ ...f, type: 'Financial', role: f.amount || 'Financial Account' }));
  }
  if (info.locations) {
    info.locations.forEach(l => availableItems.push({ ...l, type: 'Location', role: l.type || 'Geographic Landmark' }));
  }
  if (info.evidence) {
    info.evidence.forEach(e => availableItems.push({ ...e, type: 'Evidence', name: e.title || e.name, role: e.type || 'Evidence Artifact' }));
  }
  if (info.digital) {
    info.digital.forEach(d => availableItems.push({ ...d, type: 'Digital', role: d.status || 'Digital Signal' }));
  }

  // Filter items
  const filteredItems = availableItems.filter(item => {
    const matchesCat = selectedCategory === 'ALL' || (item.type || '').toUpperCase() === selectedCategory;
    const q = filterText.toLowerCase().trim();
    const matchesQuery = !q || (item.name || '').toLowerCase().includes(q) || (item.role || '').toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const handleAdd = (item) => {
    addNodeToCanvas(item);
    setAddedIds(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  const handleDragStart = (e, item) => {
    const payload = JSON.stringify(item);
    try {
      e.dataTransfer.setData('application/json', payload);
      e.dataTransfer.setData('text/plain', payload);
    } catch (err) {}
    window.__CONSTELLATION_DRAGGED_ITEM__ = item;
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!customEntity.name.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      name: customEntity.name,
      type: customEntity.type,
      role: customEntity.role || `${customEntity.type} in Case`,
      threat: customEntity.threat,
      provenance: customEntity.provenance
    };

    addNodeToCanvas(newItem);
    setCustomEntity({
      name: '',
      type: 'Person',
      role: '',
      threat: 'HIGH',
      provenance: 'EXTRACTED_ENTITY'
    });
    setShowCustomCreator(false);
  };

  const getIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'person': return <User size={13} />;
      case 'organization': return <Building2 size={13} />;
      case 'vehicle': return <Car size={13} />;
      case 'financial': return <DollarSign size={13} />;
      case 'evidence': return <FileText size={13} />;
      default: return <ShieldAlert size={13} />;
    }
  };

  return (
    <aside className="case-file-adder-sidebar">
      {/* Header */}
      <div className="adder-header">
        <div className="adder-title-group">
          <Layers size={14} className="adder-icon" />
          <div className="adder-title-text">
            <span className="adder-title">CASE FILE ADDER</span>
            <span className="adder-case-name font-mono">{activeCase?.name.split('—')[0].trim()}</span>
          </div>
        </div>
        {onClose && (
          <button className="adder-close-btn" onClick={onClose} title="Hide File Adder">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="adder-search-box">
        <Search size={12} className="search-icon" />
        <input
          type="text"
          className="adder-search-input"
          placeholder="Filter case files &amp; entities..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        {filterText && (
          <button className="adder-clear-btn" onClick={() => setFilterText('')}>×</button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="adder-filter-chips">
        {['ALL', 'PERSON', 'ORGANIZATION', 'VEHICLE', 'FINANCIAL', 'EVIDENCE'].map(cat => (
          <button
            key={cat}
            className={`adder-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quick Action Button: Custom Entity */}
      <div className="adder-quick-actions">
        <button
          className={`adder-action-btn ${showCustomCreator ? 'active' : ''}`}
          onClick={() => setShowCustomCreator(!showCustomCreator)}
        >
          <Plus size={12} /> {showCustomCreator ? 'Close Creator' : 'Add Custom Entity'}
        </button>
      </div>

      {/* Inline Custom Entity Creator */}
      {showCustomCreator && (
        <form onSubmit={handleCreateCustom} className="custom-entity-form">
          <input
            type="text"
            className="custom-input"
            placeholder="Entity Name (e.g. Al-Sayed Broker)"
            value={customEntity.name}
            onChange={(e) => setCustomEntity(prev => ({ ...prev, name: e.target.value }))}
            required
            autoFocus
          />
          <div className="custom-form-row">
            <select
              className="custom-select"
              value={customEntity.type}
              onChange={(e) => setCustomEntity(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="Person">Person</option>
              <option value="Organization">Organization</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Financial">Financial</option>
              <option value="Evidence">Evidence</option>
            </select>

            <select
              className="custom-select"
              value={customEntity.threat}
              onChange={(e) => setCustomEntity(prev => ({ ...prev, threat: e.target.value }))}
            >
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </div>
          <input
            type="text"
            className="custom-input"
            placeholder="Role / Tag (e.g. Dubai Charter Nominee)"
            value={customEntity.role}
            onChange={(e) => setCustomEntity(prev => ({ ...prev, role: e.target.value }))}
          />
          <button type="submit" className="btn btn-primary custom-submit-btn">
            <Plus size={12} /> Add to Board
          </button>
        </form>
      )}

      {/* Available Items List */}
      <div className="adder-items-list">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => {
            const alreadyOnCanvas = canvasNodes.some(n => n.id === item.id || n.name === item.name);
            const justAdded = addedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`adder-card-item ${alreadyOnCanvas ? 'is-on-canvas' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
              >
                <div className="adder-drag-handle" title="Drag onto canvas">
                  <GripVertical size={12} />
                </div>

                <div className="adder-item-main">
                  <div className="adder-item-top">
                    <span className="adder-type-pill">
                      {getIcon(item.type)}
                      <span>{(item.type || 'ITEM').toUpperCase()}</span>
                    </span>
                    <ProvenanceBadge level={item.provenance || 'RAW DATA'} size="sm" />
                  </div>

                  <div className="adder-item-title">{item.name}</div>
                  <div className="adder-item-role">{item.role}</div>
                </div>

                <button
                  className={`adder-add-btn ${justAdded ? 'added' : ''}`}
                  onClick={() => handleAdd(item)}
                  title={alreadyOnCanvas ? "Reposition on canvas" : "Add to canvas"}
                >
                  {justAdded ? (
                    <>
                      <Check size={11} /> Added
                    </>
                  ) : alreadyOnCanvas ? (
                    'Reposition'
                  ) : (
                    <>
                      <Plus size={11} /> Add
                    </>
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div className="adder-empty-state">
            <span>No matching case artifacts found</span>
          </div>
        )}
      </div>
    </aside>
  );
}
