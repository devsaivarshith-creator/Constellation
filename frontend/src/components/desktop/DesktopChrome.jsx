import { useState, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Panel3D from '../Panel3D';
import TotalFileExplorer from './TotalFileExplorer';
import {
  Search, Bell, Shield, Activity, GitBranch,
  CheckCircle2, Clock, ChevronRight, X, AlertTriangle,
  Radio, Check, Trash2, ArrowUpRight, Database,
  Home, Network, Folder, Globe, Cpu, Scale, Settings
} from 'lucide-react';
import './DesktopChrome.css';

export default function DesktopChrome({ children }) {
  const {
    activeNavSection,
    setActiveNavSection,
    activeCase,
    selectedFileItem,
    searchQuery,
    setSearchQuery,
    notifications,
    markAllNotificationsRead,
    dismissNotification,
    setSelectedEntity,
    canvasNodes
  } = useWorkspace();

  const [utcTime, setUtcTime] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTotalExplorer, setShowTotalExplorer] = useState(false);

  // Live UTC Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${mins}:${secs} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard shortcuts: Cmd+K, Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    if (notif.targetId) {
      const matching = canvasNodes.find(n => n.id === notif.targetId);
      if (matching) setSelectedEntity(matching);
    }
    setActiveNavSection('workspace');
    setShowNotifications(false);
  };

  return (
    <div className="desktop-window-container">
      {/* ── TOP TITLEBAR CHROME (OpenAI Style Minimal Floating Panel) ── */}
      <Panel3D className="desktop-titlebar-panel3d" glow="white" maxAngle={2}>
        <header className="desktop-titlebar openai-minimal-titlebar">
          {/* Left: OpenAI style minimal brand mark */}
          <div className="titlebar-left">
            <div className="brand-lockup-openai" onClick={() => setActiveNavSection('home')}>
              <div className="brand-dot-emerald" />
              <span className="brand-text-openai">CONSTELLATION</span>
              <span className="brand-sub-openai font-mono">SEE PATTERNS. STOP CRIME.</span>
            </div>
          </div>

          {/* Center: Top Navigation Switcher */}
          <nav className="titlebar-nav-switcher">
            <button
              className={`nav-tab-btn ${activeNavSection === 'home' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('home')}
            >
              Dashboard
            </button>
            <button
              className={`nav-tab-btn ${activeNavSection === 'workspace' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('workspace')}
            >
              Workspace
            </button>
            <button
              className={`nav-tab-btn ${activeNavSection === 'intel' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('intel')}
            >
              Live Intel
            </button>
            <button
              className={`nav-tab-btn ${activeNavSection === 'sweeps' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('sweeps')}
            >
              12h Sweeps
            </button>
            <button
              className={`nav-tab-btn ${activeNavSection === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('audit')}
            >
              Provenance
            </button>
          </nav>

          {/* Right: Total File Explorer, Quick Search, Sweep Countdown, Notification Bell, Officer Profile */}
          <div className="titlebar-right">
            <button
              className={`total-explorer-trigger-btn ${showTotalExplorer ? 'active' : ''}`}
              onClick={() => setShowTotalExplorer(true)}
              title="Open Windows File Explorer (All Cases & Cross-Case Repositories)"
            >
              <Database size={12} />
              <span>TOTAL FILE EXPLORER</span>
            </button>

            <div className="titlebar-search-box" onClick={() => setShowSearchModal(true)}>
              <Search size={13} className="search-ico" />
              <span className="search-text-placeholder">Search intelligence...</span>
              <kbd className="search-kbd">⌘K</kbd>
            </div>

            <div className="sweep-countdown-indicator" title="Next Autonomous 12-Hour Sweep in 10 Hours">
              <span className="sweep-dot" />
              <span>Sweep: 10h</span>
            </div>

            {/* Fully Functional Notification Bell */}
            <button
              className={`titlebar-icon-action ${showNotifications ? 'active' : ''}`}
              title="Intelligence Alerts & Notifications"
              onClick={() => setShowNotifications(prev => !prev)}
            >
              <Bell size={14} />
              {unreadCount > 0 && <span className="notif-badge-pill">{unreadCount}</span>}
            </button>

            <div className="officer-profile-capsule" title="Special Agent (Clearance: TOP SECRET // SPECIAL INTELLIGENCE)">
              <Shield size={13} className="officer-badge-icon" />
              <span className="officer-name">Lead Officer</span>
              <span className="clearance-tag">TS-SCI</span>
            </div>
          </div>
        </header>
      </Panel3D>

      {/* ── NOTIFICATION CENTER FLYOUT DROPDOWN ─────────────────── */}
      {showNotifications && (
        <div className="notification-center-flyout">
          <Panel3D className="notification-panel3d" glow="white" maxAngle={4}>
            <div className="notif-header">
              <div className="notif-title-row">
                <Bell size={13} />
                <span className="notif-heading">INTELLIGENCE ALERTS</span>
                {unreadCount > 0 && <span className="notif-count-tag">{unreadCount} NEW</span>}
              </div>
              <div className="notif-header-actions">
                <button className="notif-action-btn" onClick={markAllNotificationsRead} title="Mark All as Read">
                  <Check size={12} />
                  <span>Mark Read</span>
                </button>
                <button className="notif-close-btn" onClick={() => setShowNotifications(false)}>
                  <X size={13} />
                </button>
              </div>
            </div>

            <div className="notif-list-body">
              {notifications && notifications.length > 0 ? (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`notif-card-item ${!n.read ? 'is-unread' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="notif-card-top">
                      <span className={`urgency-pill urgency-${n.urgency.toLowerCase()}`}>
                        {n.urgency}
                      </span>
                      <span className="notif-time">{n.time}</span>
                    </div>
                    <div className="notif-item-title">{n.title}</div>
                    <div className="notif-item-msg">{n.message}</div>
                    <div className="notif-item-actions">
                      <span className="view-workspace-hint">
                        View in Workspace <ArrowUpRight size={10} />
                      </span>
                      <button
                        className="notif-dismiss-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(n.id);
                        }}
                        title="Dismiss alert"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="notif-empty-state">No active intelligence alerts</div>
              )}
            </div>
          </Panel3D>
        </div>
      )}

      {/* ── DESKTOP MAIN VIEWPORT WITH LEFT ICON RAIL ─────────── */}
      <div className="desktop-main-split">
        {/* Left Navigation Icon Rail (as in screenshot) */}
        <aside className="left-icon-rail-dock">
          <div className="rail-group-top">
            <button
              className={`rail-btn ${activeNavSection === 'home' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('home')}
              title="Global Intelligence Grid (Dashboard)"
            >
              <Home size={18} />
            </button>
            <button
              className={`rail-btn ${activeNavSection === 'workspace' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('workspace')}
              title="Investigation Workspace Canvas"
            >
              <Network size={18} />
            </button>
            <button
              className={`rail-btn ${showTotalExplorer ? 'active' : ''}`}
              onClick={() => setShowTotalExplorer(true)}
              title="Total File Explorer"
            >
              <Folder size={18} />
            </button>
            <button
              className={`rail-btn ${activeNavSection === 'intel' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('intel')}
              title="Live Intelligence Feeds"
            >
              <Globe size={18} />
            </button>
            <button
              className={`rail-btn ${activeNavSection === 'sweeps' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('sweeps')}
              title="Byomkesh AI 12h Sweeps"
            >
              <Cpu size={18} />
            </button>
            <button
              className={`rail-btn ${activeNavSection === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveNavSection('audit')}
              title="Provenance & Audit Ledger"
            >
              <Scale size={18} />
            </button>
          </div>

          <div className="rail-group-bottom">
            <button
              className="rail-btn rail-btn-settings"
              onClick={() => setShowSearchModal(true)}
              title="Quick Search & Settings (⌘K)"
            >
              <Settings size={18} />
            </button>
          </div>
        </aside>

        {/* Center Main Stage */}
        <main className="desktop-workspace-canvas">
          {children}
        </main>
      </div>

      {/* ── BOTTOM DESKTOP STATUS BAR (3D Bending Floating Panel) ── */}
      <Panel3D className="desktop-statusbar-panel3d" glow="white" maxAngle={2}>
        <footer className="desktop-statusbar">
          <div className="statusbar-left">
            <div className="status-item">
              <GitBranch size={12} className="status-icon" />
              <span className="status-label font-mono">case/{activeCase.id}</span>
            </div>
            <div className="status-separator" />
            <div className="status-item">
              <CheckCircle2 size={12} className="status-icon text-green" />
              <span className="status-label">Ledger: 0x8f3b...SEALED</span>
            </div>
            <div className="status-separator" />
            <div className="status-item">
              <span className="legal-basis-badge">{activeCase.legalBasis}</span>
            </div>
          </div>

          <div className="statusbar-right">
            <div className="status-item">
              <Activity size={12} className="status-icon text-blue" />
              <span className="status-label">Byomkesh Engine: READY</span>
            </div>
            <div className="status-separator" />
            <div className="status-item">
              <Clock size={12} className="status-icon" />
              <span className="status-label font-mono">{utcTime}</span>
            </div>
          </div>
        </footer>
      </Panel3D>

      {/* ── COMMAND PALETTE MODAL (Cmd+K) ──────────────────────── */}
      {showSearchModal && (
        <div className="command-palette-backdrop" onClick={() => setShowSearchModal(false)}>
          <div className="command-palette-panel" onClick={e => e.stopPropagation()}>
            <div className="palette-input-row">
              <Search size={16} className="palette-search-icon" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search entities, cases, files..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="palette-input-field"
              />
              <button className="palette-close-btn" onClick={() => setShowSearchModal(false)}>
                <X size={15} />
              </button>
            </div>
            <div className="palette-results-list">
              <div className="palette-group-title">COMMANDS</div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('home'); setShowSearchModal(false); }}
              >
                <span>Navigate to Global Intelligence Grid Dashboard</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('workspace'); setShowSearchModal(false); }}
              >
                <span>Open Active Case Workspace Canvas</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setShowTotalExplorer(true); setShowSearchModal(false); }}
              >
                <span>Open Windows File Explorer</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('sweeps'); setShowSearchModal(false); }}
              >
                <span>Inspect 12-Hour Sweep Discoveries</span>
                <span className="palette-shortcut">↵</span>
              </div>
              <div className="palette-group-title">CANONICAL ENTITIES</div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('workspace'); setShowSearchModal(false); }}
              >
                <span>Tariq "The Anchor" Merchant [PERSON // CRITICAL]</span>
                <span className="palette-tag">Case 102</span>
              </div>
              <div
                className="palette-result-item"
                onClick={() => { setActiveNavSection('workspace'); setShowSearchModal(false); }}
              >
                <span>Al-Barakah Logistics FZE [ORGANIZATION // DUBAI]</span>
                <span className="palette-tag">Case 102</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOTAL BUREAU FILE EXPLORER MODAL ────────────────────── */}
      <TotalFileExplorer
        isOpen={showTotalExplorer}
        onClose={() => setShowTotalExplorer(false)}
      />
    </div>
  );
}
