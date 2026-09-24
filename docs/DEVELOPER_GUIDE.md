# 🛠️ Constellation Intelligence Platform — Developer Guide

## 1. Quickstart (Under 60 Seconds)

### Step 1: Run the Unified Launcher
Constellation provides a single launcher script that automatically verifies dependencies, creates `.env` from template if missing, sets up the Python virtual environment, installs npm packages, and starts both Backend and Frontend:
```bash
./start.sh
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
- **Interactive API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Live Netlify Cloud Preview**: [https://constellation-intel.netlify.app](https://constellation-intel.netlify.app)

---

## 2. Environment Configuration (Plug & Play)

The repository root includes `.env.example` and `.env` configured with out-of-the-box defaults:

```ini
# Application
APP_NAME="Constellation Intelligence Platform"
APP_VERSION="1.0.0"
DEBUG=true

# Database
SQLITE_DB_PATH=./constellation.db
EVIDENCE_STORE_DIR=./evidence_store

# Security Secrets (Preconfigured with defaults for local dev)
JWT_SECRET_KEY=constellation_production_jwt_secret_key_adithya_2026_secured
HMAC_SECRET_KEY=constellation_tamper_evident_hmac_secret_chain_key_2026

# Optional: Neo4j (System uses resilient embedded engine if Neo4j is offline)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=constellation_secure_2026

# Optional: NVIDIA NIM API key for generative synthesis
NVIDIA_API_KEY=
```

---

## 3. Running Services Individually

### Backend Standalone
```bash
./backend/run.sh
```
Or manually:
```bash
cd backend
source .venv/bin/activate
export PYTHONPATH=.
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Standalone
```bash
cd frontend
npm install
npm run dev
```

---

## 4. Running Backend Tests

The backend test suite covers authentication, JWT generation, case subgraphs, Byomkesh query execution, entity resolution, and cryptographic audit ledger verification:

```bash
cd backend
PYTHONPATH=. .venv/bin/pytest tests/ -v
```

---

## 5. Deploying Frontend to Netlify

The frontend is ready for continuous deployment or direct CLI/API deployment on Netlify:

### Direct Build & Upload
```bash
cd frontend
npm run build
cd dist
zip -r ../dist.zip .
cd ..

# Deploy via Netlify REST API
curl -X POST \
  -H "Authorization: Bearer <your_netlify_token>" \
  -H "Content-Type: application/zip" \
  --data-binary "@dist.zip" \
  https://api.netlify.com/api/v1/sites/<site_id>/deploys
```

### Netlify Configuration (`netlify.toml`)
Ensure the repository contains `netlify.toml` in the project root:
```toml
[build]
  base = "frontend"
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 6. Default User Personas

| Username | Password | Full Name | Role | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| `investigator` | `investigator123` | Lead Intelligence Officer | `investigator` | Full access to boards, roping, Byomkesh, ER resolution |
| `admin` | `admin123` | Chief Intelligence Director | `admin` | System admin, user provisioning, audit verification |
| `analyst` | `analyst123` | Senior Intelligence Analyst | `read_only` | Read-only analysis, timeline exploration |
