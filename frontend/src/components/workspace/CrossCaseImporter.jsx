import { useState, useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import {
  Search, Plus, GripVertical, ChevronRight, ChevronLeft,
  X, Filter, ExternalLink, ShieldAlert, Users, Building2,
  Car, DollarSign, FileText, ArrowRight, Layers, Database,
  GitBranch, Link2, Minimize2, CheckCircle2
} from 'lucide-react';
import ProvenanceBadge from '../desktop/ProvenanceBadge';
import Panel3D from '../Panel3D';
import { CROSS_CASE_REGISTRY, MASTER_CATEGORIES, CRIME_GENRES } from '../../constants/masterModel';
import './CrossCaseImporter.css';

export default function CrossCaseImporter({ isOpen, onToggle }) {
  const { addNodeToCanvas, activeCaseId } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [importedIds, setImportedIds] = useState({});

  // Filter cross-case registry
  const filteredList = useMemo(() => {
    return CROSS_CASE_REGISTRY.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q) ||
        item.caseName.toLowerCase().includes(q);

      const matchesCase = selectedCaseFilter === 'ALL' || item.caseId === selectedCaseFilter;
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchesSearch && matchesCase && matchesCat;
    });
  }, [searchQuery, selectedCaseFilter, selectedCategory]);

  const handleImport = (item) => {
    addNodeToCanvas({
      id: item.id,
      name: item.name,
      type: item.specificType || 'Entity',
      role: item.role,
      threat: item.threat,
      provenance: item.provenance,
      details: item.details
    });

    setImportedIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setImportedIds(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const handleDragStart = (e, item) => {
    const payload = JSON.stringify({
      id: item.id,
      name: item.name,
      type: item.specificType || 'Entity',
      role: item.role,
      threat: item.threat,
      provenance: item.provenance,
      details: item.details
    });

    // Provide universal fallbacks
    try {
      e.dataTransfer.setData('application/json', payload);
      e.dataTransfer.setData('text/plain', payload);
      e.dataTransfer.setData('text', payload);
    } catch (err) {
      console.warn('dataTransfer set error:', err);
    }

    // Window level guarantee
    window.__CONSTELLATION_DRAGGED_ITEM__ = JSON.parse(payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (!isOpen) {
    return (
      <button
        className="importer-collapsed-tab"
        onClick={onToggle}
        title="Open Cross-Case File Importer & Explorer"
      >
        <ChevronLeft size={13} />
        <Database size={13} />
        <span className="collapsed-tab-text">CROSS-CASE IMPORTER</span>
      </button>
    );
  }

  return (
    <Panel3D maxAngle={4} glow="white" className="cross-case-importer-panel3d">
      <div className="cross-case-importer-container">
        {/* Header */}
        <div className="importer-header">
          <div className="importer-header-title">
            <Database size={13} className="text-white" />
            <span className="importer-title-text">CROSS-CASE IMPORTER</span>
            <span className="importer-count-badge font-mono">{filteredList.length}</span>
          </div>

          <div className="importer-header-controls">
            <button className="importer-collapse-btn" onClick={onToggle} title="Collapse Importer">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="importer-search-area">
          <div className="importer-search-box">
            <Search size={12} className="text-muted" />
            <input
              type="text"
              placeholder="Search other cases, ledgers, ships, people..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="importer-input"
            />
            {searchQuery && (
              <button className="importer-clear-btn" onClick={() => setSearchQuery('')}>
                <X size={11} />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="importer-filter-row">
            <select
              className="importer-select"
              value={selectedCaseFilter}
              onChange={e => setSelectedCaseFilter(e.target.value)}
            >
              <option value="ALL">All Bureau Cases</option>
              <option value="case-102">Case 102 (Silver Dune)</option>
              <option value="case-117">Case 117 (Operation Black Tide)</option>
              <option value="case-143">Case 143 (Red Sand Syndicate)</option>
              <option value="case-108">Case 108 (Contract Hit)</option>
              <option value="case-121">Case 121 (Vault Breach)</option>
              <option value="case-135">Case 135 (Black Pearl)</option>
              <option value="case-155">Case 155 (Blue Horizon)</option>
              <option value="case-168">Case 168 (Darknet Cyber)</option>
            </select>

            <select
              className="importer-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="02_PEOPLE">People</option>
              <option value="08_ORGANIZATIONS">Organizations</option>
              <option value="07_FINANCIAL">Financial</option>
              <option value="10_VEHICLES">Vehicles</option>
              <option value="13_EVIDENCE">Evidence</option>
              <option value="09_LOCATIONS">Locations</option>
              <option value="06_DIGITAL_NETWORK">Digital</option>
            </select>
          </div>
        </div>

        {/* Drag Hint Banner */}
        <div className="importer-drag-hint font-mono">
          <GripVertical size={11} />
          <span>DRAG CARD ONTO BOARD OR CLICK [+ IMPORT]</span>
        </div>

        {/* Entity List */}
        <div className="importer-list-scroll">
          {filteredList.length === 0 ? (
            <div className="importer-empty-state font-mono">
              No matching files or entities in repository.
            </div>
          ) : (
            filteredList.map(item => {
              const isImported = !!importedIds[item.id];
              const isOtherCase = item.caseId !== activeCaseId;

              return (
                <div
                  key={item.id}
                  className={`importer-card ${isImported ? 'imported-flash' : ''}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, item)}
                  title="Drag onto Canvas or click [+ Import]"
                >
                  <div className="importer-card-top">
                    <span className="importer-case-pill font-mono">
                      {item.caseName.split('(')[0].trim()}
                    </span>
                    <span className={`importer-threat threat-${item.threat.toLowerCase()}`}>
                      {item.threat}
                    </span>
                  </div>

                  <div className="importer-card-title-row">
                    <GripVertical size={12} className="drag-handle-ico" />
                    <span className="importer-card-name">{item.name}</span>
                  </div>

                  <div className="importer-card-role text-muted">
                    <span className="font-mono text-cyan-subtle">[{item.specificType}]</span> {item.role}
                  </div>

                  <p className="importer-card-desc">{item.details}</p>

                  <div className="importer-card-footer">
                    <ProvenanceBadge level={item.provenance} size="sm" />
                    <button
                      className={`import-action-btn ${isImported ? 'is-imported' : ''}`}
                      onClick={() => handleImport(item)}
                    >
                      {isImported ? (
                        <>
                          <CheckCircle2 size={10} /> Imported
                        </>
                      ) : (
                        <>
                          <Plus size={10} /> Import to Canvas
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Panel3D>
  );
}
