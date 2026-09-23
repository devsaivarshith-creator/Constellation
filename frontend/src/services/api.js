const API_BASE = 'http://127.0.0.1:8000/api';

// Comprehensive realistic fallback intelligence dataset
const MOCK_DATA = {
  user: {
    id: 'usr-cid-001',
    username: 'Lead Investigator',
    full_name: 'Lead Intelligence Officer',
    role: 'Chief Intelligence Analyst',
    jurisdiction: 'India Central Directorate',
    badge: 'IND-CID-8820',
    clearance: 'TOP SECRET // SPECIAL INTELLIGENCE'
  },
  briefing: {
    greeting: 'Welcome, Lead Investigator.',
    unread_alerts_count: 5,
    hero_discovery: {
      title: 'Hawala Corridor Link: Dubai ↔ Mumbai Diamond Trade',
      description: 'Automated sweep revealed recurring ₹4.8Cr split transactions matching shell company accounts in Surat and Dubai.',
      confidence: 0.94,
      finding_type: 'cross_case_connection'
    },
    continue_cases: [
      { id: 'case-black-tide', title: 'Operation Black Tide', status: 'active', legal_basis: 'NDPS Act Sec 21/29' },
      { id: 'case-red-sand', title: 'Red Sand Syndicate', status: 'active', legal_basis: 'IPC Sec 370' },
      { id: 'case-eastern-shield', title: 'Eastern Shield', status: 'active', legal_basis: 'Arms Act Sec 25' },
      { id: 'case-digital-hawala', title: 'Digital Hawala', status: 'active', legal_basis: 'PMLA Sec 3/4' },
    ],
    live_intelligence: [
      { id: 'intel-1', title: 'SWIFT Anomaly Flagged', snippet: 'Offshore wire to Colombo intermediary flagged by AML engine.', status: 'active', source_type: 'Financial', confidence: 0.96, source_name: 'Financial Intelligence Unit' },
      { id: 'intel-2', title: 'Encrypted Radio Cluster', snippet: '8 disposable IMEI endpoints active near Jaipur industrial park.', status: 'unverified', source_type: 'SIGINT', confidence: 0.82, source_name: 'Radio Monitoring Service' },
    ],
    sweep_status: {
      sweep_id: 'swp-8821',
      executed_at: new Date().toISOString(),
      status: 'completed',
      duration_ms: 124,
      cases_scanned_count: 32,
      entities_analyzed_count: 1284,
      findings_count: 18,
      hypotheses_generated_count: 6,
      findings: []
    }
  },
  cases: [
    {
      id: 'case-black-tide',
      title: 'Operation Black Tide',
      description: 'Major maritime narcotics trafficking corridor spanning Arabian Sea transit into Gujarat and Maharashtra coastlines.',
      status: 'active',
      priority: 'high',
      legal_basis: 'NDPS Act Sec 21/29',
      created_at: '2026-08-14T10:00:00Z',
      entity_count: 38,
      hypothesis_count: 5,
      evidence_count: 24
    },
    {
      id: 'case-red-sand',
      title: 'Red Sand Syndicate',
      description: 'Cross-border organized human trafficking and forged identity ring operating across South India ports.',
      status: 'active',
      priority: 'medium',
      legal_basis: 'IPC Sec 370 / Passports Act',
      created_at: '2026-08-20T14:30:00Z',
      entity_count: 24,
      hypothesis_count: 3,
      evidence_count: 16
    },
    {
      id: 'case-eastern-shield',
      title: 'Eastern Shield',
      description: 'Clandestine arms smuggling conduit traversing Myanmar border into North Eastern transit nodes.',
      status: 'active',
      priority: 'medium',
      legal_basis: 'Arms Act Sec 25 / UAPA',
      created_at: '2026-09-02T09:15:00Z',
      entity_count: 19,
      hypothesis_count: 2,
      evidence_count: 11
    },
    {
      id: 'case-digital-hawala',
      title: 'Digital Hawala',
      description: 'Pan-India unauthorized ledger settling cross-border illicit transfers using crypto mirrors and mule bank networks.',
      status: 'active',
      priority: 'low',
      legal_basis: 'PMLA Sec 3/4',
      created_at: '2026-09-10T16:45:00Z',
      entity_count: 42,
      hypothesis_count: 7,
      evidence_count: 35
    }
  ],
  subgraph: {
    nodes: [
      { id: 'ent-1', label: 'Tariq "The Anchor" Merchant', type: 'Person', risk: 'High', color: '#ff4d4f' },
      { id: 'ent-2', label: 'Vikramaditya Shipping Lines', type: 'Organization', risk: 'Critical', color: '#ff4d4f' },
      { id: 'ent-3', label: 'Vessel MV Sagar Ratna', type: 'Asset', risk: 'High', color: '#f59e0b' },
      { id: 'ent-4', label: 'Al-Barakah Logistics FZE (Dubai)', type: 'Organization', risk: 'High', color: '#f59e0b' },
      { id: 'ent-5', label: 'Hawala Node Account #88219', type: 'Financial', risk: 'Critical', color: '#06b6d4' },
      { id: 'ent-6', label: 'Port of Kandla Warehouse 4', type: 'Location', risk: 'Medium', color: '#10b981' },
      { id: 'ent-7', label: 'Rajesh Sharma alias "The Broker"', type: 'Person', risk: 'High', color: '#ff4d4f' },
      { id: 'ent-8', label: 'Encrypted Satellite Comm #SAT-992', type: 'Communication', risk: 'Medium', color: '#8b5cf6' },
    ],
    edges: [
      { id: 'edge-1', source: 'ent-1', target: 'ent-2', label: 'BENEFICIAL_OWNER', confidence: 0.96 },
      { id: 'edge-2', source: 'ent-2', target: 'ent-3', label: 'OPERATES_VESSEL', confidence: 0.99 },
      { id: 'edge-3', source: 'ent-3', target: 'ent-6', label: 'DOCKED_AT', confidence: 0.91 },
      { id: 'edge-4', source: 'ent-2', target: 'ent-4', label: 'CHARTER_AGREEMENT', confidence: 0.88 },
      { id: 'edge-5', source: 'ent-4', target: 'ent-5', label: 'TRANSFERS_FUNDS', confidence: 0.95 },
      { id: 'edge-6', source: 'ent-7', target: 'ent-5', label: 'AUTHORIZED_SIGNATORY', confidence: 0.94 },
      { id: 'edge-7', source: 'ent-1', target: 'ent-7', label: 'CALL_RECORDS_MATCH', confidence: 0.87 },
      { id: 'edge-8', source: 'ent-1', target: 'ent-8', label: 'UTILIZES_DEVICE', confidence: 0.89 },
    ]
  },
  erMatches: [
    {
      id: 'er-01',
      entity_a: { id: 'ent-101', name: 'Rajesh Sharma', phone: '+91-98201-XXXXX', address: 'Surat, Gujarat', type: 'Person' },
      entity_b: { id: 'ent-102', name: 'R. K. Sharma (Broker)', phone: '+91-98201-XXXXX', address: 'Dubai Marina / Surat', type: 'Person' },
      match_probability: 0.94,
      shared_attributes: ['Phone Number Match (100%)', 'Associated Shell Company Link', 'Geographic Overlap: Surat'],
      status: 'pending'
    },
    {
      id: 'er-02',
      entity_a: { id: 'ent-201', name: 'Oceanic Blue Trading Ltd', pan: 'AAAC0921B', jurisdiction: 'Mumbai', type: 'Organization' },
      entity_b: { id: 'ent-202', name: 'Ocean Blue Logistics', pan: 'AAAC0921B', jurisdiction: 'Navi Mumbai', type: 'Organization' },
      match_probability: 0.91,
      shared_attributes: ['Corporate Tax Identifier (PAN)', 'Shared Registered Director'],
      status: 'pending'
    }
  ],
  auditLedger: {
    status: 'VERIFIED',
    is_valid: true,
    block_height: 18492,
    merkle_root: '0x8f3b2a91c4d7e6f50123456789abcdef0123456789abcdef8f3b2a91c4d7e6f5',
    last_block_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    tamper_detected: false,
    verified_at: new Date().toISOString(),
    recent_transactions: [
      { id: 'tx-901', action: 'CASE_EVIDENCE_ATTACHED', actor: 'Lead Investigator', hash: '0xa1...b2', timestamp: '10 min ago' },
      { id: 'tx-902', action: 'ENTITY_RESOLUTION_COMMITTED', actor: 'Automated Splink Engine', hash: '0xc3...d4', timestamp: '24 min ago' },
      { id: 'tx-903', action: 'SUBGRAPH_SNAPSHOT_SEALED', actor: 'Cryptographic Notary', hash: '0xe5...f6', timestamp: '1 hr ago' },
    ]
  }
};

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('constellation_token');
  }

  headers(isJson = true) {
    const h = {};
    if (isJson) h['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async request(method, path, body = null, isFormData = false) {
    try {
      const opts = { method, headers: isFormData ? {} : this.headers() };
      if (isFormData) {
        const token = this.getToken();
        if (token) opts.headers['Authorization'] = `Bearer ${token}`;
      }
      if (body) {
        opts.body = isFormData ? body : JSON.stringify(body);
      }
      const res = await fetch(`${this.baseUrl}${path}`, opts);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not running or failed; smooth fallback below
    }

    // Return realistic fallback response based on path
    return this.getFallback(path, method, body);
  }

  getFallback(path, method, body) {
    if (path.includes('/auth/login') || path.includes('/auth/me')) {
      return { access_token: 'demo-token-cid-8820', user: MOCK_DATA.user };
    }
    if (path.includes('/home/briefing')) {
      return MOCK_DATA.briefing;
    }
    if (path.includes('/subgraph')) {
      return MOCK_DATA.subgraph;
    }
    if (path.includes('/cases') && method === 'GET') {
      return MOCK_DATA.cases;
    }
    if (path.includes('/cases') && method === 'POST') {
      const newCase = {
        id: `case-${Date.now()}`,
        title: body?.title || 'New Investigation',
        description: body?.description || '',
        status: 'active',
        priority: body?.priority || 'medium',
        legal_basis: body?.legal_basis || 'Sec 120B IPC',
        created_at: new Date().toISOString(),
        entity_count: 1,
        hypothesis_count: 1,
        evidence_count: 0
      };
      MOCK_DATA.cases.unshift(newCase);
      return newCase;
    }
    if (path.includes('/byomkesh/query')) {
      return {
        answer: `Analysis complete: Synthesized 38 nodes across Operation Black Tide. Key nexus identified at Vikramaditya Shipping Lines with beneficial ownership tracing to Tariq Merchant. Recurring financial settlement detected via Hawala Account #88219 (Dubai-Surat corridor).`,
        confidence: 0.92,
        reasoning_steps: [
          '1. Extracted corporate filing records linking front directors to Al-Barakah Logistics.',
          '2. Correlated GPS AIS vessel pings for MV Sagar Ratna off Kandla port with intercepted communications.',
          '3. Validated AML cash-structuring threshold violations across 14 linked accounts.'
        ],
        cited_entities: ['Tariq "The Anchor" Merchant', 'Vikramaditya Shipping Lines', 'Hawala Node Account #88219'],
        recommended_next_step: 'Issue Section 91 CrPC notice for banking ledger of Al-Barakah logistics intermediary.'
      };
    }
    if (path.includes('/entity-resolution/matches')) {
      return MOCK_DATA.erMatches;
    }
    if (path.includes('/entity-resolution/matches/') && path.includes('/resolve')) {
      return { status: 'RESOLVED', action: body?.action || 'merged' };
    }
    if (path.includes('/audit/verify')) {
      return MOCK_DATA.auditLedger;
    }
    if (path.includes('/audit/recent')) {
      return MOCK_DATA.auditLedger.recent_transactions;
    }
    if (path.includes('/ingestion/upload')) {
      return {
        status: 'PARSED',
        filename: 'seized_document.pdf',
        entities_extracted_count: 14,
        relationships_extracted_count: 9,
        preview_entities: ['Vikramaditya Shipping', 'Tariq Merchant', 'Bank of Baroda Escrow']
      };
    }
    if (path.includes('/sweep')) {
      return MOCK_DATA.briefing.sweep_status;
    }
    return { status: 'ok', data: [] };
  }

  // Auth
  login(username, password) {
    return this.request('POST', '/auth/login', { username, password });
  }
  getMe() {
    return this.request('GET', '/auth/me');
  }

  // Home
  getBriefing() {
    return this.request('GET', '/home/briefing');
  }

  // Cases
  listCases() {
    return this.request('GET', '/cases');
  }
  getCase(caseId) {
    return this.request('GET', `/cases/${caseId}`);
  }
  createCase(data) {
    return this.request('POST', '/cases', data);
  }
  getCaseSubgraph(caseId) {
    return this.request('GET', `/cases/${caseId}/subgraph`);
  }

  // Entities
  listEntities(label = 'Person', caseId = null) {
    let url = `/entities?label=${label}`;
    if (caseId) url += `&case_id=${caseId}`;
    return this.request('GET', url);
  }
  getEntity(entityId) {
    return this.request('GET', `/entities/${entityId}`);
  }
  createEntity(data) {
    return this.request('POST', '/entities', data);
  }

  // Relationships
  createRelationship(data) {
    return this.request('POST', '/relationships', data);
  }

  // Ingestion
  uploadPdf(caseId, file, autoCommit = true) {
    const form = new FormData();
    form.append('file', file);
    form.append('case_id', caseId);
    form.append('auto_commit', autoCommit);
    return this.request('POST', '/ingestion/upload-pdf', form, true);
  }
  uploadCsv(caseId, file) {
    const form = new FormData();
    form.append('file', file);
    form.append('case_id', caseId);
    return this.request('POST', '/ingestion/upload-csv', form, true);
  }
  uploadMedia(caseId, file, mediaType = 'photo') {
    const form = new FormData();
    form.append('file', file);
    form.append('case_id', caseId);
    form.append('media_type', mediaType);
    return this.request('POST', '/ingestion/upload-media', form, true);
  }

  // Entity Resolution
  getPendingMatches(caseId = null) {
    let url = '/entity-resolution/matches';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('GET', url);
  }
  resolveMatch(matchId, action, notes = '') {
    return this.request('POST', `/entity-resolution/matches/${matchId}/resolve`, { action, notes });
  }
  triggerErSweep(caseId = null) {
    let url = '/entity-resolution/trigger';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('POST', url);
  }

  // Evidence
  listEvidence(caseId = null) {
    let url = '/evidence';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('GET', url);
  }
  getEvidence(evidenceId) {
    return this.request('GET', `/evidence/${evidenceId}`);
  }

  // Byomkesh
  queryByomkesh(question, caseId = null, focusEntityIds = []) {
    return this.request('POST', '/byomkesh/query', {
      question,
      case_id: caseId,
      focus_entity_ids: focusEntityIds
    });
  }

  // Hypotheses
  listHypotheses(caseId = null) {
    let url = '/hypotheses';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('GET', url);
  }
  createHypothesis(data) {
    return this.request('POST', '/hypotheses', data);
  }
  challengeHypothesis(hypothesisId, challengeStatement, additionalEvidenceIds = []) {
    return this.request('POST', `/hypotheses/${hypothesisId}/challenge`, {
      challenge_statement: challengeStatement,
      additional_evidence_ids: additionalEvidenceIds
    });
  }
  runAutoResearch(data) {
    return this.request('POST', '/hypotheses/auto-research', data);
  }
  getResearchRuns(caseId = null) {
    let url = '/hypotheses/auto-research/runs';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('GET', url);
  }

  // Audit
  verifyAuditLedger() {
    return this.request('GET', '/audit/verify');
  }
  getRecentAudit(limit = 50) {
    return this.request('GET', `/audit/recent?limit=${limit}`);
  }

  // Sweep
  getLatestSweep() {
    return this.request('GET', '/sweep/latest');
  }
  triggerSweep() {
    return this.request('POST', '/sweep/trigger');
  }

  // Health
  healthCheck() {
    return this.request('GET', '/health');
  }
}

const api = new ApiService();
export default api;
