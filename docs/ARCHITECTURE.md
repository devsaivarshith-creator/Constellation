# 🏛️ Constellation Intelligence Platform — Architecture Documentation

## 1. System Overview

Constellation is an investigative intelligence platform engineered for law enforcement, regulatory bodies, and intelligence analysts. It couples graph analytics, autonomous multi-step reasoning, probabilistic entity resolution, and tamper-evident cryptographic ledgers into an integrated investigative operating environment.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                               │
│                         (React 19 + Vite + Vanilla CSS)                     │
│                                                                             │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────┐  │
│  │ 3D Investigation Hub  │ │ Byomkesh AI Copilot   │ │ Dossier Inspector │  │
│  │  • SVG Bezier Roping  │ │  • Citation Engine    │ │  • Cryptographic  │  │
│  │  • Interactive Pinning│ │  • Hypothesis Tester  │ │    Evidence Vault │  │
│  │  • Multi-Workspace    │ │  • Graph Inferences   │ │  • Timelines      │  │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────┘  │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────┐  │
│  │ 3D Geospatial Globe   │ │ Cross-Case Sweeper    │ │ Cryptographic     │  │
│  │  • Interactive Pings  │ │  • Discrepancies      │ │   HMAC Audit      │  │
│  │  • Corridors / Ports  │ │  • Bridge Detection   │ │   Hash-Chain      │  │
│  └───────────────────────┘ └───────────────────────┘ └───────────────────┘  │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │ HTTP / JSON / JWT
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API & APPLICATION LAYER                          │
│                               (FastAPI / Python)                            │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ API Routers (14 Modules)                                              │  │
│  │ • /api/auth             • /api/cases             • /api/entities      │  │
│  │ • /api/relationships    • /api/ingestion         • /api/entity-res    │  │
│  │ • /api/evidence         • /api/byomkesh          • /api/hypotheses    │  │
│  │ • /api/audit            • /api/home              • /api/sweep         │  │
│  │ • /api/workspaces       • /api/notifications     • /api/health        │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ Core Intelligence Engines                                             │  │
│  │                                                                       │  │
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │  │
│  │  │   Byomkesh Agent    │  │  Auto Research &    │  │ Entity         │ │  │
│  │  │ (LangGraph Machine) │  │  Hypothesis Engine  │  │ Resolution     │ │  │
│  │  └─────────────────────┘  └─────────────────────┘  └────────────────┘ │  │
│  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │  │
│  │  │ HMAC Audit Ledger   │  │ Ingestion & NER     │  │ 12-Hour Sweep  │ │  │
│  │  │ (SHA-256 Chaining)  │  │ (PDF/CSV/Exif Extr) │  │ Engine         │ │  │
│  │  └─────────────────────┘  └─────────────────────┘  └────────────────┘ │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└───────────────────────────────────────┼─────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────┐
│              GRAPH LAYER              │ │          RELATIONAL LAYER         │
│                                       │ │                                   │
│  Primary: Neo4j 5.x Bolt Engine       │ │  SQLite High-Performance Store    │
│  Fallback: Embedded In-Memory Engine  │ │  • Users & RBAC Permissions       │
│  • Property Graph Schema              │ │  • HMAC Audit Ledger Records      │
│  • Cypher Execution Interface         │ │  • Pending Entity Resolution      │
│  • Weighted Relationships             │ │  • Investigation Workspaces       │
│  • Strict Node/Edge Provenance        │ │  • Ingestion Evidence Registry    │
└───────────────────────────────────────┘ └───────────────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Byomkesh AI Investigative Agent
The Byomkesh Agent is structured as a deterministic state machine:
1. **`parse_question`**: Extracts named entities and establishes intent (contact tracing, shortest paths, evidence foundation).
2. **`plan_graph_query`**: Formulates bounded Cypher patterns against the target case subgraph.
3. **`execute_cypher`**: Queries the active graph engine (Neo4j or Embedded Resilience Engine).
4. **`retrieve_evidence`**: Retrieves attached cryptographic documents, wiretap logs, and photos.
5. **`construct_explanation`**: Generates natural language conclusions with **mandatory citations** (`[cit_1]`, `[cit_2]`) linked directly to node IDs and relationship edge IDs. Hallucinations are prevented by constraining generation strictly to graph facts.

### 2.2 Dual Graph Architecture (Resilience Layer)
- **Primary Mode**: Connects via `AsyncGraphDatabase` to Neo4j on `bolt://localhost:7687`.
- **Embedded Resilience Mode**: If Neo4j is offline, the system automatically transitions into the Embedded Resilience Engine without downtime. In-memory nodes, typed edges, and subgraph queries mirror Neo4j schemas, allowing instant plug-and-play development without requiring Docker or external database instances.

### 2.3 Cryptographic HMAC Hash-Chain Audit Ledger
Every state modification (evidence attachment, entity resolution merge, hypothesis creation) is permanently committed to a tamper-evident audit ledger:
$$\text{HMAC}_n = \text{HMAC-SHA256}(K, \text{Seq}_n \parallel \text{EventType} \parallel \text{ActorID} \parallel \text{TargetID} \parallel \text{PayloadHash} \parallel \text{HMAC}_{n-1})$$
Any retroactive modification breaks the chain and is immediately flagged by the `/api/audit/verify` endpoint.

### 2.4 Fellegi-Sunter Entity Resolution (ER)
- Links fragmented records across jurisdictions (e.g., "Tariq Merchant" vs "T. Merchant").
- Evaluates token frequencies, phonetic soundex matches, phone number matching, and co-occurrence graphs.
- Candidates with confidence $\ge 0.70$ enter a human-in-the-loop queue. Once confirmed, relationships are rewired to the canonical entity and logged to the audit chain.

### 2.5 Investigation Workspace & 3D Interactive Canvas
- Implemented with pure CSS and React 19.
- Custom SVG bezier roping (`M x1 y1 C cx1 cy1 cx2 cy2 x2 y2`) allows interactive linking between suspect cards.
- Moving any node recalculates all linked bezier curves in real time.
- File explorer supports drag-and-drop ingestion of entities and evidence directly onto the visual canvas.

---

## 3. Data Models & Schemas

### Graph Nodes
| Node Label | Core Properties | Example Use Case |
| :--- | :--- | :--- |
| `Person` | `id`, `name`, `full_name`, `role`, `threat`, `phone`, `location` | Suspects, couriers, masters |
| `Organization` | `id`, `name`, `jurisdiction`, `address`, `type` | Shell entities, freight carriers |
| `Vehicle` | `id`, `name`, `flag`, `imo_number`, `vessel_type` | Cargo bulkers, dhows |
| `Financial` | `id`, `name`, `bank`, `account_no`, `ledger_type` | Hawala settlement accounts |
| `Location` | `id`, `name`, `country`, `coordinates`, `type` | Ports, berths, safehouses |
| `Evidence` | `id`, `title`, `filename`, `file_hash`, `evidence_type` | Manifests, CCTV footage |
| `Case` | `id`, `title`, `legal_basis`, `status`, `description` | High-level legal umbrella |

### Graph Edges
- `BENEFICIAL_OWNER`
- `COMMUNICATES_WITH`
- `FUNDS_TRANSFERRED`
- `AUTHORIZED_SIGNATORY`
- `CHARTERS_VESSEL`
- `DOCKED_AT`
- `COMMANDS`
- `ASSOCIATED_WITH`
