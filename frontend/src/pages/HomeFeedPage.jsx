import { useState, useEffect, useRef } from 'react';
import { useWorkspace, CANONICAL_CASES } from '../contexts/WorkspaceContext';
import Panel3D from '../components/Panel3D';
import ProvenanceBadge from '../components/desktop/ProvenanceBadge';
import {
  CRIME_GENRES,
  EPISTEMIC_TIERS,
  MASTER_CATEGORIES
} from '../constants/masterModel';
import {
  Play, Shield, ArrowRight, Clock, AlertTriangle,
  Folder, Users, DollarSign, Activity, Radio,
  CheckCircle2, Compass, Layers, Plus, ExternalLink,
  Zap, Bell, ArrowUpRight, Check, ChevronDown, ChevronUp,
  Upload, Search, Filter, Sparkles, Database, FileText,
  SlidersHorizontal, RefreshCw, Eye, Pause, ChevronLeft, ChevronRight
} from 'lucide-react';
import './HomeFeedPage.css';

// Real-Time Intelligence Carousel Slides
const HERO_SLIDES = [
  {
    id: 'slide-1',
    kicker: 'CRITICAL BREAKTHROUGH',
    kickerType: 'breakthrough',
    title: 'Byomkesh verified cross-case financial conduit linking Silver Dune to Operation Black Tide.',
    summary: 'Offshore corporate filings and seized Dubai ledger records reveal Al-Barakah Logistics FZE funnels narcotics proceeds through forged Panamanian charter agreements into Surat diamond trading nodes and Hawala Account #88219.',
    caseId: 'case-102',
    caseTag: 'CASE 102 ↔ CASE 117',
    genre: 'narcotics',
    genreLabel: 'Narcotics & Hawala',
    provenance: 'ANALYTICAL_INFERENCE',
    metrics: [
      { label: 'EVALUATED CONFIDENCE', value: '94% CORROBORATED' },
      { label: 'GRAPH NODES LINKED', value: '6 (Tariq Merchant, 2 Shells, 1 Vessel, 2 Hawalas)' },
      { label: 'TRANSACTION VOLUME', value: '₹14.8 Cr (14 Split Tranches)' }
    ]
  },
  {
    id: 'slide-2',
    kicker: 'LIVE OSINT & SATELLITE DISCOVERY',
    kickerType: 'osint',
    title: 'Maritime AIS transponder shutdown detected off Saurashtra coast — MV Sagar Ratna dark run.',
    summary: 'Automated satellite telemetry receiver logged unannounced transponder disconnect at 21:14 UTC. Acoustic hydrophone array picked up nocturnal lightering rendezvous with unflagged wooden dhow.',
    caseId: 'case-102',
    caseTag: 'CASE 102 (SILVER DUNE)',
    genre: 'narcotics',
    genreLabel: 'Maritime Narcotics',
    provenance: 'RAW_DATA',
    metrics: [
      { label: 'RADAR ANOMALY', value: '1.4m Draft Change at Sea' },
      { label: 'LAST AIS PING', value: '22°42\'N, 69°18\'E' },
      { label: 'LIGHTERING DHOW', value: 'Identified as Red Sand Dhow #9' }
    ]
  },
  {
    id: 'slide-3',
    kicker: 'NEW CORPORATE CASE UPDATE',
    kickerType: 'corporate',
    title: 'Titan FinTech encrypted ledger leak exposes ₹64Cr round-tripping through Colombo escrow.',
    summary: 'Financial Intelligence Unit flagged 28 straw accounts operated by Farhan Qureshi. Colombo wire logs match Surat SEZ diamond import invoices down to SHA-256 ledger checksums.',
    caseId: 'case-117',
    caseTag: 'CASE 117 (OPERATION BLACK TIDE)',
    genre: 'corporate_fraud',
    genreLabel: 'Corporate AML & Fraud',
    provenance: 'EVIDENCE',
    metrics: [
      { label: 'ROUND-TRIP VOLUME', value: '₹64.2 Cr' },
      { label: 'STRAW ACCOUNTS', value: '28 Active Nodes' },
      { label: 'PRIMARY BROKER', value: 'Blue Horizon Marine LLP' }
    ]
  },
  {
    id: 'slide-4',
    kicker: 'FORENSIC BALLISTICS BREAKTHROUGH',
    kickerType: 'breakthrough',
    title: 'Striation match on Dock 4 spent 9mm casing links hitman Vikram Jadhav to customs murder.',
    summary: 'State Forensic Lab certified 99.4% breech face match between the weapon seized in Case 108 and the fatal bullet recovered from the customs informant murder scene.',
    caseId: 'case-108',
    caseTag: 'CASE 108 (WATERFRONT HIT)',
    genre: 'homicide',
    genreLabel: 'Homicide Investigation',
    provenance: 'EVIDENCE',
    metrics: [
      { label: 'BALLISTICS MATCH', value: '99.4% Striation Certainty' },
      { label: 'LEGAL CHARGE', value: 'BNS Sec 103 / Arms Act' },
      { label: 'FORENSIC HASH', value: 'SHA-256 #0xAA19...C344' }
    ]
  },
  {
    id: 'slide-5',
    kicker: 'ENCRYPTED SIGINT INTERCEPT',
    kickerType: 'sigint',
    title: 'Thuraya satellite comms burst triangulated between Dubai and Surat diamond bourse.',
    summary: 'Frequency band 1544.15 MHz intercepted with Diffie-Hellman key handshake. Broker discussing consignment clearance Berth 9 and immediate Hawala settlement at Surat bourse.',
    caseId: 'case-168',
    caseTag: 'CASE 168 (DARKNET CYBER)',
    genre: 'cyber',
    genreLabel: 'Encrypted Telemetry',
    provenance: 'OBSERVED_EVENT',
    metrics: [
      { label: 'INTERCEPT FREQ', value: '1544.15 MHz Burst' },
      { label: 'TRIANGULATION', value: 'Porbandar Coastal Beacon' },
      { label: 'ENCRYPTION', value: '256-bit AES Handshake' }
    ]
  }
];

export default function HomeFeedPage() {
  const {
    setActiveNavSection,
    setActiveCaseId,
    openTab,
    addNodeToCanvas,
    ingestArtifact,
    workspaces,
    openWorkspace,
    setActiveWorkspaceId
  } = useWorkspace();

  // Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);

  // Collapsible section toggles (minimizing visual overload / cognitive pressure)
  const [sectionsOpen, setSectionsOpen] = useState({
    ingestion: true,
    hero: true,
    workingOn: true,
    byomkesh: true,
    genres: true
  });

  const toggleSection = (key) => {
    setSectionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Quick Ingestion Bar Form State
  const [ingestForm, setIngestForm] = useState({
    title: '',
    caseId: 'case-102',
    genre: 'narcotics',
    tier: 'RAW_DATA',
    category: '13_EVIDENCE',
    fileName: '',
    fileSize: ''
  });
  const [ingestionToast, setIngestionToast] = useState(null);
  const [isSubmittingIngest, setIsSubmittingIngest] = useState(false);
  const fileInputRef = useRef(null);

  // Genre filter for bottom case shelves
  const [selectedGenreFilter, setSelectedGenreFilter] = useState('ALL');

  // Sweep state
  const [sweepTriggered, setSweepTriggered] = useState(false);

  // Real-time auto-advance carousel
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = 70; // ticks every 70ms for smooth progress bar (7000ms per slide)
    const timer = setInterval(() => {
      setSlideProgress(prev => {
        if (prev >= 100) {
          setCurrentSlideIndex(curr => (curr + 1) % HERO_SLIDES.length);
          return 0;
        }
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isCarouselPaused, currentSlideIndex]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((currentSlideIndex + 1) % HERO_SLIDES.length);
    setSlideProgress(0);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((currentSlideIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setSlideProgress(0);
  };

  const handleSelectSlide = (idx) => {
    setCurrentSlideIndex(idx);
    setSlideProgress(0);
  };

  // Case Launch (opens workspace directly)
  const handleOpenCase = (caseId) => {
    setActiveCaseId(caseId);
    const matchingWs = (workspaces || []).find(w => w.caseId === caseId);
    if (matchingWs) {
      openWorkspace(matchingWs.id);
    }
    setActiveNavSection('workspace');
  };

  // Ingestion handlers
  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIngestForm(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
    }
  };

  const handleIngestSubmit = (e) => {
    e.preventDefault();
    if (!ingestForm.title.trim()) return;

    setIsSubmittingIngest(true);

    setTimeout(() => {
      const result = ingestArtifact({
        title: ingestForm.title,
        caseId: ingestForm.caseId,
        genre: ingestForm.genre,
        tier: ingestForm.tier,
        category: ingestForm.category,
        fileName: ingestForm.fileName || 'dossier-payload.bin',
        fileSize: ingestForm.fileSize || '38.4 KB'
      });

      setIsSubmittingIngest(false);
      setIngestionToast({
        title: ingestForm.title,
        caseName: CANONICAL_CASES[ingestForm.caseId]?.name || 'Target Case',
        genre: ingestForm.genre.toUpperCase(),
        tier: ingestForm.tier
      });

      // Clear form
      setIngestForm({
        title: '',
        caseId: 'case-102',
        genre: 'narcotics',
        tier: 'RAW_DATA',
        category: '13_EVIDENCE',
        fileName: '',
        fileSize: ''
      });

      // Hide toast after 4s
      setTimeout(() => setIngestionToast(null), 4000);
    }, 450);
  };

  const handleTriggerSweep = () => {
    setSweepTriggered(true);
    setTimeout(() => setSweepTriggered(false), 2500);
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  // Cases list from context
  const allCasesList = Object.values(CANONICAL_CASES);

  // Filtered crime genres
  const filteredGenres = selectedGenreFilter === 'ALL'
    ? CRIME_GENRES
    : CRIME_GENRES.filter(g => g.id === selectedGenreFilter);

  return (
    <div className="home-feed-scrollable">
      
      {/* ─────────────────────────────────────────────────────────────────
          0. TOP FLOATING DATA INGESTION & AUTO-LABELLING BAR
      ───────────────────────────────────────────────────────────────── */}
      <Panel3D className="floating-ingestion-panel" glow="red" maxAngle={2}>
        <div className="ingestion-bar-container">
          <div className="ingestion-header-row">
            <div className="ingestion-title-left">
              <span className="ingestion-pulse-dot" />
              <span className="ingestion-headline">RAPID DATA INGESTION & AUTO-LABELLING</span>
              <span className="ingestion-subtext">DIRECT CRYPTOGRAPHIC HASH & GENRE TAGGING</span>
            </div>
            <button
              className="btn-collapse-toggle"
              onClick={() => toggleSection('ingestion')}
              title={sectionsOpen.ingestion ? 'Collapse Ingestion Bar' : 'Expand Ingestion Bar'}
            >
              {sectionsOpen.ingestion ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span className="toggle-label">{sectionsOpen.ingestion ? 'Hide Bar' : 'Ingest Data'}</span>
            </button>
          </div>

          {sectionsOpen.ingestion && (
            <form className="ingestion-form-grid" onSubmit={handleIngestSubmit}>
              {/* File Attachment / Drag Target */}
              <div 
                className={`ingest-dropzone ${ingestForm.fileName ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} className="upload-icon" />
                <div className="dropzone-text">
                  {ingestForm.fileName ? (
                    <span className="file-name-tag font-mono">{ingestForm.fileName} ({ingestForm.fileSize})</span>
                  ) : (
                    <span>Click to attach CCTV, CDR, Ledger or Warrant</span>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFilePicked}
                />
              </div>

              {/* Title / Dossier Label */}
              <div className="ingest-field-group">
                <label className="ingest-label">ARTIFACT / DOSSIER TITLE</label>
                <input
                  type="text"
                  className="ingest-input"
                  placeholder="e.g. Dubai Marina Ledger Extract #4"
                  value={ingestForm.title}
                  onChange={(e) => setIngestForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Target Case Selector */}
              <div className="ingest-field-group">
                <label className="ingest-label">TARGET CASE</label>
                <select
                  className="ingest-select"
                  value={ingestForm.caseId}
                  onChange={(e) => setIngestForm(prev => ({ ...prev, caseId: e.target.value }))}
                >
                  {allCasesList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Crime Genre Auto-Labelling Selector */}
              <div className="ingest-field-group">
                <label className="ingest-label">CRIME GENRE (AUTO-LABEL)</label>
                <select
                  className="ingest-select"
                  value={ingestForm.genre}
                  onChange={(e) => setIngestForm(prev => ({ ...prev, genre: e.target.value }))}
                >
                  <option value="narcotics">💊 Narcotics & Contraband</option>
                  <option value="corporate_fraud">🏢 Corporate Fraud & AML</option>
                  <option value="trafficking">⛓️ Human Trafficking</option>
                  <option value="homicide">🩸 Homicide & Murder</option>
                  <option value="robbery">💎 Armed Robbery & Heist</option>
                  <option value="blackmail">✉️ Extortion & Blackmail</option>
                  <option value="civil_maritime">⚖️ Civil & Maritime Disputes</option>
                  <option value="cyber">🌐 Cyber & State Actors</option>
                </select>
              </div>

              {/* Epistemic Tier Selector */}
              <div className="ingest-field-group">
                <label className="ingest-label">EPISTEMIC TIER</label>
                <select
                  className="ingest-select"
                  value={ingestForm.tier}
                  onChange={(e) => setIngestForm(prev => ({ ...prev, tier: e.target.value }))}
                >
                  {EPISTEMIC_TIERS.map(t => (
                    <option key={t.id} value={t.id}>
                      Tier {t.tier} — {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn btn-primary ingest-submit-btn"
                disabled={isSubmittingIngest || !ingestForm.title.trim()}
              >
                {isSubmittingIngest ? (
                  <>
                    <RefreshCw size={13} className="spin-icon" /> Hashing...
                  </>
                ) : (
                  <>
                    <Plus size={13} /> Ingest & Tag
                  </>
                )}
              </button>
            </form>
          )}

          {/* Glowing Success Ingestion Toast */}
          {ingestionToast && (
            <div className="ingest-success-toast">
              <CheckCircle2 size={15} className="toast-success-icon" />
              <div className="toast-text-body">
                <strong>Ingestion Complete:</strong> &ldquo;{ingestionToast.title}&rdquo; registered with SHA-256 into <em>{ingestionToast.caseName}</em>. Auto-labeled as <span className="toast-genre-tag font-mono">[{ingestionToast.genre}]</span> under <span className="toast-tier-tag font-mono">[{ingestionToast.tier}]</span>.
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleOpenCase(ingestForm.caseId || 'case-102')}
              >
                View in Workspace <ArrowRight size={11} />
              </button>
            </div>
          )}
        </div>
      </Panel3D>

      {/* ─────────────────────────────────────────────────────────────────
          1. CINEMATIC HERO SLIDESHOW / CAROUSEL (NETFLIX HERO)
      ───────────────────────────────────────────────────────────────── */}
      <div className="hero-section-wrapper">
        <Panel3D className="intel-hero-panel3d" glow="white" maxAngle={3}>
          <section
            className="intel-hero-card"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            {/* Background cinematic vignette */}
            <div className="hero-backdrop-gradient" />
            
            {/* Top Carousel Nav & Live Indicator */}
            <div className="hero-carousel-top-bar">
              <div className="hero-kicker-row">
                <span className={`hero-live-pill kicker-${currentSlide.kickerType}`}>
                  <span className="live-dot" />
                  {currentSlide.kicker}
                </span>
                <ProvenanceBadge level={currentSlide.provenance} size="sm" />
                <span className="hero-case-tag font-mono">{currentSlide.caseTag}</span>
                <span className="hero-genre-pill font-mono">{currentSlide.genreLabel}</span>
              </div>

              {/* Carousel Controls */}
              <div className="hero-controls-group">
                <button
                  className="hero-nav-arrow"
                  onClick={handlePrevSlide}
                  title="Previous Breakthrough"
                >
                  <ChevronLeft size={15} />
                </button>

                <div className="carousel-dots-strip">
                  {HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      className={`carousel-dot-btn ${idx === currentSlideIndex ? 'active' : ''}`}
                      onClick={() => handleSelectSlide(idx)}
                      title={`Slide ${idx + 1}: ${slide.kicker}`}
                    >
                      {idx === currentSlideIndex && (
                        <div 
                          className="dot-progress-fill" 
                          style={{ width: `${slideProgress}%` }} 
                        />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  className="hero-nav-arrow"
                  onClick={handleNextSlide}
                  title="Next Breakthrough"
                >
                  <ChevronRight size={15} />
                </button>

                <button
                  className="hero-pause-btn"
                  onClick={() => setIsCarouselPaused(!isCarouselPaused)}
                  title={isCarouselPaused ? 'Resume auto-slideshow' : 'Pause slideshow'}
                >
                  {isCarouselPaused ? <Play size={11} /> : <Pause size={11} />}
                </button>
              </div>
            </div>

            {/* Slide Content */}
            <div className="hero-content-inner">
              <h1 className="hero-intel-headline">
                {currentSlide.title}
              </h1>

              <p className="hero-intel-summary">
                {currentSlide.summary}
              </p>

              {/* Metrics Strip */}
              <div className="hero-metrics-strip">
                {currentSlide.metrics.map((m, idx) => (
                  <div key={idx} className="metric-strip-item">
                    {idx > 0 && <div className="strip-separator" />}
                    <div className="strip-metric">
                      <span className="m-label">{m.label}</span>
                      <span className="m-val font-mono">{m.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="hero-action-buttons">
                <button
                  className="btn btn-primary hero-main-btn"
                  onClick={() => handleOpenCase(currentSlide.caseId)}
                >
                  <Play size={13} fill="currentColor" /> Enter Investigation Workspace
                </button>
                <button
                  className="btn btn-secondary hero-sub-btn"
                  onClick={() => {
                    handleOpenCase(currentSlide.caseId);
                    openTab({ id: 'timeline', title: 'Timeline Reconstruction', type: 'timeline' });
                  }}
                >
                  <Clock size={13} /> Reconstruct Timeline
                </button>
                <button
                  className="btn btn-secondary hero-sub-btn"
                  onClick={() => {
                    handleOpenCase(currentSlide.caseId);
                    openTab({ id: 'evidence', title: 'Evidence Vault', type: 'evidence' });
                  }}
                >
                  <Shield size={13} /> Evidence Chain
                </button>
              </div>
            </div>
          </section>
        </Panel3D>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          2. SHELF: "CURRENTLY WORKING ON" (CONTINUE INVESTIGATING)
      ───────────────────────────────────────────────────────────────── */}
      <section className="feed-row-section">
        <div className="feed-row-header">
          <div className="row-title-lockup">
            <h2>Currently Working On</h2>
            <span className="row-subtitle">ACTIVE CASE DIRECTORIES & RAPID RESUME</span>
          </div>
          <div className="row-header-actions">
            <span className="row-badge font-mono">{allCasesList.length} CASES OPEN</span>
            <button
              className="btn-collapse-toggle"
              onClick={() => toggleSection('workingOn')}
            >
              {sectionsOpen.workingOn ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <span className="toggle-label">{sectionsOpen.workingOn ? 'Collapse' : 'Expand'}</span>
            </button>
          </div>
        </div>

        {sectionsOpen.workingOn && (
          <div className="horizontal-cards-shelf">
            {allCasesList.slice(0, 4).map(c => (
              <Panel3D key={c.id} className="case-card-panel3d" glow="white" maxAngle={4}>
                <div
                  className={`netflix-case-card card-${c.priority ? c.priority.toLowerCase() : 'high'}`}
                  onClick={() => handleOpenCase(c.id)}
                >
                  <div className="case-card-top">
                    <span className="case-id font-mono">{c.id.toUpperCase()}</span>
                    <span className={`priority-pill ${c.priority === 'CRITICAL' ? 'red-pill' : c.priority === 'HIGH' ? 'amber-pill' : 'blue-pill'}`}>
                      {c.priority || 'ACTIVE'}
                    </span>
                  </div>

                  <h3 className="case-title">{c.name.split('—')[1]?.trim() || c.name}</h3>
                  <p className="case-desc">{c.description || 'Primary active investigation dossier.'}</p>

                  <div className="case-progress-line">
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${c.progress || 60}%` }} />
                    </div>
                    <span className="progress-pct font-mono">{c.progress || 60}%</span>
                  </div>

                  <div className="case-footer-meta">
                    <span className="lead-tag">Lead: {c.leadInvestigator || 'Unassigned'}</span>
                    <span className="count-tag font-mono">{c.entitiesCount || 20} Entities • {c.lastModified || 'Recent'}</span>
                  </div>

                  <button className="btn-card-launch" onClick={(e) => { e.stopPropagation(); handleOpenCase(c.id); }}>
                    Continue in Workspace <ArrowRight size={11} />
                  </button>
                </div>
              </Panel3D>
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          3. SHELF: "BYOMKESH FINDINGS & 12H SWEEP PATTERNS"
      ───────────────────────────────────────────────────────────────── */}
      <section className="feed-row-section">
        <div className="feed-row-header">
          <div className="row-title-lockup">
            <h2>Byomkesh Findings & 12H Sweep Patterns</h2>
            <span className="row-subtitle">AUTONOMOUS PATTERN DEDUCTION & CROSS-CASE BRIDGES</span>
          </div>
          <div className="row-header-actions">
            <span className="row-badge font-mono">18,392 ENTITIES EVALUATED</span>
            <button
              className="btn-collapse-toggle"
              onClick={() => toggleSection('byomkesh')}
            >
              {sectionsOpen.byomkesh ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <span className="toggle-label">{sectionsOpen.byomkesh ? 'Collapse' : 'Expand'}</span>
            </button>
          </div>
        </div>

        {sectionsOpen.byomkesh && (
          <Panel3D className="sweep-panel3d" glow="white" maxAngle={3}>
            <div className="sweep-summary-panel">
              <div className="sweep-panel-left">
                <div className="sweep-status-indicator">
                  <Activity size={16} className="activity-icon" />
                  <span className="sweep-headline">12-HOUR AUTONOMOUS REASONING SWEEP</span>
                  <span className="sweep-live-tag font-mono">STATUS: OPTIMAL</span>
                </div>
                
                <p className="sweep-caption">
                  Byomkesh independently parses all unverified signals, registries, OSINT, and cross-case relationships every 12 hours.
                </p>

                {/* Sweep Telemetry Grid */}
                <div className="sweep-telemetry-metrics">
                  <div className="tel-cell">
                    <span className="tel-val font-mono">2,481</span>
                    <span className="tel-lbl">Raw Artifacts Parsed</span>
                  </div>
                  <div className="tel-cell">
                    <span className="tel-val font-mono">18,392</span>
                    <span className="tel-lbl">Entities Evaluated</span>
                  </div>
                  <div className="tel-cell">
                    <span className="tel-val font-mono highlight-link">6</span>
                    <span className="tel-lbl">Cross-Case Links</span>
                  </div>
                  <div className="tel-cell">
                    <span className="tel-val font-mono">2</span>
                    <span className="tel-lbl">Hypothesis Revisions</span>
                  </div>
                </div>

                {/* Key Findings Pills */}
                <div className="byomkesh-findings-grid">
                  <div className="finding-card">
                    <div className="finding-badge">
                      <Sparkles size={11} /> PATTERN RECOGNIZED
                    </div>
                    <div className="finding-title">Hawala Split Mirroring Cluster</div>
                    <div className="finding-desc">
                      ₹14.8Cr split into 14 sub-threshold tranches matches Emirates National ledger hash across Case 102 &amp; Case 117.
                    </div>
                    <button 
                      className="btn-finding-action font-mono"
                      onClick={() => handleOpenCase('case-102')}
                    >
                      Inspect in Canvas →
                    </button>
                  </div>

                  <div className="finding-card">
                    <div className="finding-badge badge-warning">
                      <AlertTriangle size={11} /> CONTRADICTION FLAGGED
                    </div>
                    <div className="finding-title">Port Clearance Delay (31h)</div>
                    <div className="finding-desc">
                      MV Sagar Ratna berth log contradicts broker Rajesh Sharma cargo stamp by 31 hours.
                    </div>
                    <button 
                      className="btn-finding-action font-mono"
                      onClick={() => handleOpenCase('case-102')}
                    >
                      Reconstruct Timeline →
                    </button>
                  </div>
                </div>
              </div>

              <div className="sweep-panel-right">
                <div className="sweep-timing-box">
                  <span className="t-label">LAST SWEEP</span>
                  <span className="t-val">2 hours ago (18.4s)</span>
                </div>
                <div className="sweep-timing-box">
                  <span className="t-label">NEXT SWEEP</span>
                  <span className="t-val font-mono text-white">in 10 hours</span>
                </div>
                <div className="sweep-timing-box">
                  <span className="t-label">EVALUATOR</span>
                  <span className="t-val font-mono">Byomkesh 2.4 Agent</span>
                </div>

                <button
                  className="btn btn-primary btn-sm btn-sweep-trigger"
                  onClick={handleTriggerSweep}
                  disabled={sweepTriggered}
                >
                  {sweepTriggered ? (
                    <>
                      <RefreshCw size={12} className="spin-icon" /> Running Sweep...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} /> Trigger Immediate Sweep
                    </>
                  )}
                </button>
              </div>
            </div>
          </Panel3D>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          4. NETFLIX-STYLE SHELVES: CASES GROUPED BY CRIME GENRE
      ───────────────────────────────────────────────────────────────── */}
      <section className="feed-row-section">
        <div className="feed-row-header">
          <div className="row-title-lockup">
            <h2>Dossier Archive by Crime Genre</h2>
            <span className="row-subtitle">CRIMINAL CLASSIFICATION & JURISDICTIONAL DIRECTORIES</span>
          </div>

          <div className="genre-filter-pill-bar">
            <button
              className={`genre-pill-btn ${selectedGenreFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedGenreFilter('ALL')}
            >
              All Genres ({CRIME_GENRES.length})
            </button>
            {CRIME_GENRES.map(g => (
              <button
                key={g.id}
                className={`genre-pill-btn ${selectedGenreFilter === g.id ? 'active' : ''}`}
                onClick={() => setSelectedGenreFilter(g.id)}
              >
                {g.tag}
              </button>
            ))}
          </div>
        </div>

        {/* Render each crime genre shelf */}
        <div className="crime-genre-shelves-stack">
          {filteredGenres.map(genre => {
            // Find cases matching this genre
            const genreCases = allCasesList.filter(c => c.genre === genre.id || genre.cases?.includes(c.id));
            if (genreCases.length === 0) return null;

            return (
              <div key={genre.id} className="genre-shelf-block">
                <div className="genre-shelf-title-row">
                  <div className="genre-shelf-title-group">
                    <span className="genre-tag-badge font-mono">{genre.tag}</span>
                    <h3 className="genre-shelf-title">{genre.title}</h3>
                    <span className="genre-shelf-subtitle">{genre.subtitle}</span>
                  </div>
                  <span className="genre-shelf-count font-mono">{genreCases.length} CASE{genreCases.length > 1 ? 'S' : ''}</span>
                </div>

                <div className="horizontal-cards-shelf">
                  {genreCases.map(c => (
                    <Panel3D key={c.id} className="case-card-panel3d" glow="white" maxAngle={4}>
                      <div
                        className={`netflix-case-card card-${c.priority ? c.priority.toLowerCase() : 'high'}`}
                        onClick={() => handleOpenCase(c.id)}
                      >
                        <div className="case-card-top">
                          <span className="case-id font-mono">{c.id.toUpperCase()}</span>
                          <span className={`priority-pill ${c.priority === 'CRITICAL' ? 'red-pill' : c.priority === 'HIGH' ? 'amber-pill' : 'blue-pill'}`}>
                            {c.priority || 'ACTIVE'}
                          </span>
                        </div>

                        <h4 className="case-title">{c.name.split('—')[1]?.trim() || c.name}</h4>
                        <p className="case-desc">{c.description || 'Primary active investigation dossier.'}</p>

                        <div className="case-progress-line">
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${c.progress || 50}%` }} />
                          </div>
                          <span className="progress-pct font-mono">{c.progress || 50}%</span>
                        </div>

                        <div className="case-footer-meta">
                          <span>Lead: {c.leadInvestigator || 'Officer'}</span>
                          <span className="font-mono">{c.entitiesCount || 20} Entities • {c.evidenceCount || 10} Evidence</span>
                        </div>

                        <div className="case-action-hover-row">
                          <button
                            className="btn btn-primary btn-sm btn-w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCase(c.id);
                            }}
                          >
                            <Play size={11} fill="currentColor" /> Open in Workspace
                          </button>
                        </div>
                      </div>
                    </Panel3D>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
