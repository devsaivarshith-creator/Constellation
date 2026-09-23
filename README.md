# Constellation — Investigative Intelligence Platform (Phase 1 MVP)

A multi-agent, multi-layer investigative intelligence platform built with **honest provenance, zero hallucinations, and tamper-evident cryptographic auditability**.

```
DATA → OBSERVATION → CORRELATION → INFERENCE → HYPOTHESIS
```

---

## Architecture & Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Graph Database** | Neo4j 5 Community (Docker) + Embedded Resilience Engine | Property graph with typed, confidence-weighted relationships |
| **Entity Resolution** | Splink 4 / Fellegi-Sunter Model (DuckDB Backend) | Probabilistic record linkage, match candidate queue |
| **Orchestration Agent** | LangGraph + NVIDIA NIM API (`meta/llama-3.3-70b-instruct`) | Query Mode (Byomkesh) with hard constraint citations |
| **Evidence Ledger** | Sequential HMAC-SHA256 Hash Chain (SQLite) | Tamper-evident write audit log with sequence verification |
| **Backend** | Python 3.12 (FastAPI, PyMuPDF, spaCy) | High-performance async REST API |
| **Frontend** | React, Vite, Cytoscape.js | Apple Minimalist design system (SF Pro/Inter, neutral grayscale) |

---

## Quickstart

### 1. Start Neo4j (Docker)
```powershell
docker compose up -d
```
*(Neo4j Browser at `http://localhost:7474`, auth: `neo4j/constellation_secure_2026`)*

### 2. Run Backend
```powershell
cd backend
.\venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
API Documentation available at: `http://localhost:8000/docs`

### 3. Run Frontend
```powershell
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Running the Automated Test Suite

```powershell
cd backend
.\venv\Scripts\python -m pytest tests/test_vertical_slice.py -v
```

Verifies:
- Sequential HMAC hash-chain audit integrity
- Person entity creation & typed `CONTACTS` relationships
- Probabilistic Entity Resolution candidate evaluation & confirm/reject merge
- Byomkesh query agent with strictly enforced citations
- CSV tabular call log ingestion
