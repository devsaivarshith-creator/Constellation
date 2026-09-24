# 🌐 Constellation Intelligence Platform

> Multi-agent, multi-layer investigative intelligence platform for law enforcement and intelligence analysts.

**Author:** Adithya Srivatsa  
**Organization:** Hundred-Trillion  
**License:** BUSL-1.1 (Business Source License)

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** (backend)
- **Node.js 18+** (frontend)
- **Neo4j 5** (optional — system works without it using embedded graph engine)

### 1. Clone & Configure
```bash
git clone https://github.com/devsaivarshith-creator/Constellation.git
cd Constellation
cp .env.example .env
# Edit .env to add your NVIDIA API key (optional) and customize settings
```

### 2. Start Backend
```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm  # For NER (optional)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. (Optional) Start Neo4j
```bash
docker compose up -d
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                  │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Dashboard │ │ Workspace  │ │ Intel    │ │ Audit    │ │
│  │ (Home)   │ │ (Canvas)   │ │ Feed     │ │ Ledger   │ │
│  └──────────┘ └────────────┘ └──────────┘ └──────────┘ │
│                        ▼                                 │
│              API Service (api.js)                        │
│              JWT Token Management                        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────┴──────────────────────────────────┐
│               Backend (FastAPI / Python)                  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              API Routers (14 modules)             │    │
│  │  auth · cases · entities · relationships         │    │
│  │  ingestion · entity-resolution · evidence        │    │
│  │  byomkesh · audit · home · hypotheses            │    │
│  │  sweep · workspaces · notifications              │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Services Layer (7 engines)           │    │
│  │  GraphService · AuditService · ByomkeshAgent     │    │
│  │  IngestionService · ERService · SweepService     │    │
│  │  AutonomousResearchService                        │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        ▼                                 │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │   Neo4j (Graph)   │  │   SQLite (Relational)     │    │
│  │   Knowledge Graph │  │   Users · Audit · ER      │    │
│  │   w/ Fallback     │  │   Evidence · Workspaces   │    │
│  └──────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🔑 API Endpoints

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/register` | Register new account |
| **Auth** | POST | `/api/auth/login` | Login & get JWT token |
| **Auth** | GET | `/api/auth/me` | Get current user profile |
| **Cases** | GET/POST | `/api/cases` | List/create investigation cases |
| **Cases** | GET | `/api/cases/{id}/subgraph` | Get case knowledge graph |
| **Entities** | GET/POST | `/api/entities` | List/create graph entities |
| **Relationships** | POST | `/api/relationships` | Create typed relationships |
| **Ingestion** | POST | `/api/ingestion/upload-pdf` | Upload & parse PDF with NER |
| **Ingestion** | POST | `/api/ingestion/upload-csv` | Ingest structured call logs |
| **Ingestion** | POST | `/api/ingestion/upload-media` | Upload photos/audio/video |
| **Entity Resolution** | GET | `/api/entity-resolution/matches` | Get pending ER matches |
| **Entity Resolution** | POST | `/api/entity-resolution/matches/{id}/resolve` | Confirm/reject match |
| **Evidence** | GET | `/api/evidence` | List evidence items |
| **Byomkesh** | POST | `/api/byomkesh/query` | Query the AI investigation agent |
| **Hypotheses** | GET/POST | `/api/hypotheses` | Manage investigation hypotheses |
| **Hypotheses** | POST | `/api/hypotheses/{id}/challenge` | Challenge AI hypothesis |
| **Hypotheses** | POST | `/api/hypotheses/auto-research` | Run autonomous research |
| **Sweep** | GET/POST | `/api/sweep/latest` | 12-hour cross-case sweep |
| **Audit** | GET | `/api/audit/verify` | Verify HMAC hash-chain integrity |
| **Audit** | GET | `/api/audit/recent` | Recent audit events |
| **Workspaces** | CRUD | `/api/workspaces` | Manage investigation workspaces |
| **Notifications** | GET/POST | `/api/notifications` | User notifications |
| **Health** | GET | `/api/health` | System health check |

## 🔒 Security Features

- **JWT Authentication** — PBKDF2-HMAC-SHA256 password hashing with 100K iterations
- **HMAC Hash-Chain Audit Ledger** — Tamper-evident cryptographic chain for every write operation
- **Role-Based Access Control** — Admin, Investigator, Read-Only roles
- **Evidence Integrity** — SHA-256 hashing of all ingested evidence files
- **Legal Basis Enforcement** — Cases require legal justification before creation

## 🤖 AI / Intelligence Features

- **Byomkesh Agent** — LangGraph-based investigative query engine with mandatory citations
- **Autonomous Research** — Bounded multi-step investigation with hypothesis generation
- **Entity Resolution** — Probabilistic Fellegi-Sunter matching with human-in-the-loop confirmation
- **12-Hour Sweep Engine** — Cross-case pattern detection and contradiction analysis
- **NER Ingestion Pipeline** — spaCy-powered named entity extraction from documents

## ⚙️ Configuration

All configuration is managed via the `.env` file. Key settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `NVIDIA_API_KEY` | NVIDIA NIM API key for LLM | Optional |
| `NEO4J_URI` | Neo4j bolt connection | Optional |
| `JWT_SECRET_KEY` | JWT signing secret | Yes |
| `HMAC_SECRET_KEY` | Audit ledger HMAC key | Yes |

## 📝 Default Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `investigator` | `investigator123` | Investigator |
| `analyst` | `analyst123` | Read-Only |
