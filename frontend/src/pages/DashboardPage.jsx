import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ExternalLink, RefreshCw, Box,
  Users, CreditCard, Globe as GlobeIcon, Cpu,
  ShieldAlert, Activity, CheckCircle, X, MapPin,
  TrendingUp, Compass, FileText, AlertCircle
} from 'lucide-react';
import Panel3D from '../components/Panel3D';
import Globe3D from '../components/Globe3D';
import api from '../services/api';
import './DashboardPage.css';

const INITIAL_ALERTS = [
  {
    id: 'alt-01',
    title: 'New financial link detected',
    location: 'Surat, Gujarat',
    time: '12 min ago',
    type: 'red',
    details: 'Unregistered hawala transfer of ₹4.8 Crore flagged between Surat diamond export shell and Dubai logistics firm.',
    confidence: '94%',
    priority: 'Critical'
  },
  {
    id: 'alt-02',
    title: 'Known associate movement',
    location: 'Nagpur, Maharashtra',
    time: '36 min ago',
    type: 'amber',
    details: 'Automated ANPR camera match for vehicle MH-31-BK-9021 linked to courier network of Operation Black Tide.',
    confidence: '88%',
    priority: 'High'
  },
  {
    id: 'alt-03',
    title: 'Suspicious communication cluster',
    location: 'Jaipur, Rajasthan',
    time: '1 hr ago',
    type: 'green',
    details: 'Encrypted VoIP cluster initiated across 8 disposable IMEI endpoints within a 400m radius of Jaipur industrial park.',
    confidence: '82%',
    priority: 'Medium'
  },
  {
    id: 'alt-04',
    title: 'Cross-border transaction',
    location: 'Chennai, Tamil Nadu',
    time: '2 hrs ago',
    type: 'red',
    details: 'SWIFT wire transfer anomaly through Colombo intermediary to Singapore offshore account flagged by AML engine.',
    confidence: '96%',
    priority: 'Critical'
  },
  {
    id: 'alt-05',
    title: 'New shell company registered',
    location: 'Bengaluru, Karnataka',
    time: '3 hrs ago',
    type: 'cyan',
    details: 'Ministry of Corporate Affairs filing links 3 known front directors to newly incorporated logistics entity.',
    confidence: '79%',
    priority: 'Informational'
  },
];

const ACTIVE_INVESTIGATIONS = [
  {
    id: 'case-black-tide',
    title: 'Operation Black Tide',
    subtitle: 'Narcotics • West Coast',
    severity: 'High',
    severityClass: 'badge-red',
    iconBg: '#1f2937',
    iconColor: '#ff4d4f'
  },
  {
    id: 'case-red-sand',
    title: 'Red Sand Syndicate',
    subtitle: 'Human Trafficking • South India',
    severity: 'Medium',
    severityClass: 'badge-amber',
    iconBg: '#3b2314',
    iconColor: '#f59e0b'
  },
  {
    id: 'case-eastern-shield',
    title: 'Eastern Shield',
    subtitle: 'Arms Smuggling • North East',
    severity: 'Medium',
    severityClass: 'badge-amber',
    iconBg: '#172554',
    iconColor: '#3b82f6'
  },
  {
    id: 'case-digital-hawala',
    title: 'Digital Hawala',
    subtitle: 'Financial Crime • Pan-India',
    severity: 'Low',
    severityClass: 'badge-green',
    iconBg: '#064e3b',
    iconColor: '#10b981'
  }
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('India');
  const [showRegionSelect, setShowRegionSelect] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Trigger processing animation
  const handleRefreshAnalysis = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="grid-dashboard-root">
      {/* ── MAIN TWO-COLUMN DASHBOARD GRID ───────────────── */}
      <div className="dashboard-grid-layout">
        {/* ══ LEFT 2/3 COLUMN: HERO + BOTTOM PANELS ════════ */}
        <div className="left-intelligence-column">
          {/* 1. HERO PANEL: GLOBAL INTELLIGENCE GRID */}
          <Panel3D className="hero-grid-panel" maxAngle={4} glow="green">
            <div className="hero-content-split">
              {/* Left Side: Headline, Subtitle, CTA, Stats */}
              <div className="hero-text-block">
                <div className="hero-grid-badge">
                  <span className="status-dot dot-green pulse-indicator" />
                  <span>GLOBAL INTELLIGENCE GRID</span>
                </div>

                <h1 className="hero-main-heading">
                  Connect<br />
                  <span className="accent-gradient-text">the dots.</span>
                </h1>

                <p className="hero-description-text">
                  AI-powered intelligence to uncover organized crime networks across the globe.
                </p>

                <button
                  className="hero-explore-btn"
                  onClick={() => navigate('/cases')}
                >
                  <span>Explore Network</span>
                  <ArrowRight size={16} />
                </button>

                {/* Key Jurisdictions & Entities Metrics */}
                <div className="hero-metrics-row">
                  <div className="metric-stat-item">
                    <span className="stat-value">32</span>
                    <span className="stat-label">Jurisdictions Monitored</span>
                  </div>
                  <div className="metric-stat-item">
                    <span className="stat-value">1.2M+</span>
                    <span className="stat-label">Entities Analyzed</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Interactive 3D Canvas Globe */}
              <div className="hero-globe-wrapper">
                <Globe3D />
              </div>
            </div>
          </Panel3D>

          {/* 2. BOTTOM ROW: NETWORK OVERVIEW & AI ANALYSIS */}
          <div className="bottom-intelligence-row">
            {/* Panel A: Network Overview */}
            <Panel3D className="network-overview-panel" maxAngle={6} glow="green">
              <div className="panel-header-row">
                <h3 className="panel-title">Network Overview</h3>
                <div className="header-controls-group">
                  <div className="dropdown-pill-wrapper">
                    <button
                      className="region-pill-dropdown"
                      onClick={() => setShowRegionSelect(!showRegionSelect)}
                    >
                      <span>{selectedRegion}</span>
                      <span className="dropdown-arrow">▾</span>
                    </button>
                    {showRegionSelect && (
                      <div className="dropdown-pill-menu">
                        {['India', 'Southeast Asia', 'Middle East', 'Global Grid'].map(r => (
                          <div
                            key={r}
                            className="dropdown-menu-item"
                            onClick={() => {
                              setSelectedRegion(r);
                              setShowRegionSelect(false);
                            }}
                          >
                            {r}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="panel-action-btn" onClick={() => navigate('/cases')} title="Full Network">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards in a Row */}
              <div className="overview-stats-grid">
                <div className="overview-stat-card">
                  <div className="stat-card-top">
                    <div className="stat-card-icon">
                      <Box size={18} />
                    </div>
                  </div>
                  <div className="stat-card-number">1,842</div>
                  <div className="stat-card-type">Organizations</div>
                  <div className="stat-trend trend-up">
                    <TrendingUp size={12} />
                    <span>12%</span>
                  </div>
                </div>

                <div className="overview-stat-card">
                  <div className="stat-card-top">
                    <div className="stat-card-icon">
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="stat-card-number">5,671</div>
                  <div className="stat-card-type">Individuals</div>
                  <div className="stat-trend trend-up">
                    <TrendingUp size={12} />
                    <span>8%</span>
                  </div>
                </div>

                <div className="overview-stat-card">
                  <div className="stat-card-top">
                    <div className="stat-card-icon">
                      <CreditCard size={18} />
                    </div>
                  </div>
                  <div className="stat-card-number">12,309</div>
                  <div className="stat-card-type">Financial Links</div>
                  <div className="stat-trend trend-up">
                    <TrendingUp size={12} />
                    <span>24%</span>
                  </div>
                </div>

                <div className="overview-stat-card">
                  <div className="stat-card-top">
                    <div className="stat-card-icon">
                      <GlobeIcon size={18} />
                    </div>
                  </div>
                  <div className="stat-card-number">47</div>
                  <div className="stat-card-type">Active Regions</div>
                  <div className="stat-trend trend-up">
                    <TrendingUp size={12} />
                    <span>6%</span>
                  </div>
                </div>
              </div>
            </Panel3D>

            {/* Panel B: AI Analysis */}
            <Panel3D className="ai-analysis-panel" maxAngle={6} glow="green">
              <div className="panel-header-row">
                <h3 className="panel-title">AI Analysis</h3>
                <div className="header-controls-group">
                  <button
                    className={`ai-processing-pill ${isProcessing ? 'is-spinning' : ''}`}
                    onClick={handleRefreshAnalysis}
                  >
                    <RefreshCw size={12} className="spin-icon" />
                    <span>{isProcessing ? 'Analyzing...' : 'Processing'}</span>
                  </button>
                  <button className="panel-action-btn" onClick={() => navigate('/byomkesh')} title="Byomkesh AI">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* 4 Sleek Glowing Progress Bars */}
              <div className="ai-progress-list">
                <div className="ai-progress-item">
                  <div className="progress-info-row">
                    <div className="progress-label-group">
                      <Cpu size={15} className="progress-icon" />
                      <span>Pattern Recognition</span>
                    </div>
                    <span className="progress-value-pct">87%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '87%' }} />
                  </div>
                </div>

                <div className="ai-progress-item">
                  <div className="progress-info-row">
                    <div className="progress-label-group">
                      <Compass size={15} className="progress-icon" />
                      <span>Entity Resolution</span>
                    </div>
                    <span className="progress-value-pct">72%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '72%' }} />
                  </div>
                </div>

                <div className="ai-progress-item">
                  <div className="progress-info-row">
                    <div className="progress-label-group">
                      <ShieldAlert size={15} className="progress-icon" />
                      <span>Risk Scoring</span>
                    </div>
                    <span className="progress-value-pct">91%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '91%' }} />
                  </div>
                </div>

                <div className="ai-progress-item">
                  <div className="progress-info-row">
                    <div className="progress-label-group">
                      <Activity size={15} className="progress-icon" />
                      <span>Network Mapping</span>
                    </div>
                    <span className="progress-value-pct">68%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: '68%' }} />
                  </div>
                </div>
              </div>
            </Panel3D>
          </div>
        </div>

        {/* ══ RIGHT 1/3 COLUMN: LIVE ALERTS & INVESTIGATIONS ═ */}
        <div className="right-feed-column">
          {/* Panel 1: Live Alerts */}
          <Panel3D className="live-alerts-panel" maxAngle={5} glow="green">
            <div className="panel-header-row">
              <h3 className="panel-title">Live Alerts</h3>
              <button className="panel-action-btn view-all-link" onClick={() => navigate('/cases')}>
                <span>View all</span>
                <ExternalLink size={13} />
              </button>
            </div>

            <div className="alerts-feed-list">
              {INITIAL_ALERTS.map(alert => (
                <div
                  key={alert.id}
                  className="alert-feed-item"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="alert-item-header">
                    <span className={`status-dot dot-${alert.type} pulse-indicator`} />
                    <span className="alert-title-text">{alert.title}</span>
                    <span className="alert-time-stamp">{alert.time}</span>
                  </div>
                  <div className="alert-item-location">
                    <span>{alert.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel3D>

          {/* Panel 2: Active Investigations */}
          <Panel3D className="active-investigations-panel" maxAngle={5} glow="green">
            <div className="panel-header-row">
              <h3 className="panel-title">Active Investigations</h3>
              <button className="panel-action-btn view-all-link" onClick={() => navigate('/cases')}>
                <span>View all</span>
                <ExternalLink size={13} />
              </button>
            </div>

            <div className="investigations-list">
              {ACTIVE_INVESTIGATIONS.map(inv => (
                <div
                  key={inv.id}
                  className="investigation-item-card"
                  onClick={() => navigate('/cases')}
                >
                  <div
                    className="inv-icon-box"
                    style={{ background: inv.iconBg, color: inv.iconColor }}
                  >
                    <FileText size={18} />
                  </div>
                  <div className="inv-details">
                    <span className="inv-title">{inv.title}</span>
                    <span className="inv-subtitle">{inv.subtitle}</span>
                  </div>
                  <div className="inv-badge-wrapper">
                    <span className={`badge-pill ${inv.severityClass}`}>
                      {inv.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Brand Pill */}
            <div className="powered-badge-container">
              <div className="powered-pill">
                <span className="powered-sparkle">✦</span>
                <span>Powered by Netlify</span>
              </div>
            </div>
          </Panel3D>
        </div>
      </div>

      {/* ── ALERT DETAIL MODAL ─────────────────────────── */}
      {selectedAlert && (
        <div className="modal-backdrop" onClick={() => setSelectedAlert(null)}>
          <div className="alert-inspect-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title-lockup">
                <span className={`status-dot dot-${selectedAlert.type}`} />
                <h3>{selectedAlert.title}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedAlert(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content">
              <div className="modal-meta-grid">
                <div className="meta-cell">
                  <span className="cell-label">Location</span>
                  <span className="cell-val">
                    <MapPin size={13} /> {selectedAlert.location}
                  </span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">Timestamp</span>
                  <span className="cell-val">{selectedAlert.time}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">Confidence</span>
                  <span className="cell-val text-green">{selectedAlert.confidence}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-label">Priority</span>
                  <span className={`cell-val priority-${selectedAlert.priority.toLowerCase()}`}>
                    {selectedAlert.priority}
                  </span>
                </div>
              </div>

              <div className="modal-intel-summary">
                <h4>Intelligence Brief</h4>
                <p>{selectedAlert.details}</p>
              </div>

              <div className="modal-action-buttons">
                <button
                  className="btn-action-primary"
                  onClick={() => {
                    setSelectedAlert(null);
                    navigate('/cases');
                  }}
                >
                  <span>Attach to Investigation</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  className="btn-action-secondary"
                  onClick={() => {
                    setSelectedAlert(null);
                    navigate('/byomkesh');
                  }}
                >
                  <span>Query with Byomkesh AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
