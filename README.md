# Constellation — Investigative Intelligence Platform

[![License: BUSL-1.1](https://img.shields.io/badge/License-BUSL--1.1-blue.svg)](LICENSE)
[![Author: Adithya Srivatsa](https://img.shields.io/badge/Author-Adithya%20Srivatsa-orange.svg)](https://github.com/Hundred-Trillion)
[![Organization: Hundred-Trillion](https://img.shields.io/badge/Org-Hundred--Trillion-purple.svg)](https://github.com/Hundred-Trillion)

**CONSTELLATION** is a next-generation investigative intelligence, graph correlation, and autonomous OSINT platform designed for multi-agency law enforcement, forensics, and corporate compliance investigations.

Built with **honest epistemic provenance, zero hallucinations, sequential HMAC-SHA256 auditability**, and an **Apple + Windows 11 Fluent dark UI**.

```
RAW DATA → OBSERVATION → CORRELATION → ANALYTICAL INFERENCE → HYPOTHESIS
```

---

## Authorship & Legal Notice

* **Author**: **Adithya Srivatsa**
* **Repository Owner**: **Hundred-Trillion**
* **License**: Business Source License 1.1 (BUSL-1.1, Perpetual / No After License). See [LICENSE](LICENSE) for full legal terms.

---

## Core Capabilities

### 1. Interactive Multi-Agent Workspace
* **Investigation Canvas**: Fluid 60fps card dragging and anchor-based roping connections between suspects, corporate shells, vessels, and financial conduits.
* **Double-Tap / Double-Click Node Creation**: Double-clicking anywhere on the canvas background opens an instant spawn popover at cursor coordinates (`+ Person`, `+ Org`, `+ Vessel`, `+ Hawala`, `+ Evidence`).
* **Workspaces Overview Hub**: Clean management view displaying active workspace counts, case search, and 1-click workspace switching.
* **Dedicated Case File Adder**: Left-side drawer dock with 1-click mounting of case files, dossiers, and exhibits directly onto the board.

### 2. Windows 11 Style File Explorer
* **Right-Click Context Menu**:
  * Right-click empty canvas: `📁 New folder` (with inline renaming), `📄 New Document`, `🔄 Refresh`, `🔀 Sort by`, `👁️ View`, `⚙️ Properties`.
  * Right-click item: `📌 Pin to Workspace Canvas`, `👁️ Open`, `✏️ Rename`, `📋 Copy`, `🗑️ Delete`, `⚙️ Properties`.
* **Organized Folder Hierarchy**:
  * 📁 `Active Investigations`: Live operations (*Case 102 Silver Dune, Case 117 Operation Black Tide, Case 143 Red Sand Syndicate, Case 121 Vault Breach, Case 135 Extortion, Case 155 Sanctions, Case 168 Darknet*).
  * 📁 `Cases Done (Closed & Convicted)`: Solved archives (*Case 108 Waterfront Hit, Case 094 Kandla Bribery, Case 081 Nariman Shell Wire, Case 062 Hawala Golden Falcon*).
* **Properties Dialog**: Inspect file locations, MIME types, creation dates, and cryptographic SHA-256 integrity checksums.

### 3. Byomkesh Autonomous Reasoning Engine
* Autonomous 12-hour background sweeps identifying cross-case Hawala nexus, maritime sanctions evasion, and biometric breach anomalies.
* Strict hallucination prevention with mandatory citation validation.

### 4. Cryptographic Provenance & Evidence Ledger
* Sequential HMAC-SHA256 hash-chain write audit log with tamper-evident chain-of-custody verification.
* Multi-tier epistemic separation adhering to Section 63 of the Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023.

---

## Architecture & Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite, Lucide Icons, Vanilla CSS | Windows 11 Fluent + Apple Minimalist dark design system |
| **Backend** | Python 3.12, FastAPI, PyMuPDF, spaCy | High-performance async REST API & ingestion services |
| **Graph Database** | Neo4j 5 Community + Embedded Resilience Engine | Property graph with typed, confidence-weighted relationships |
| **Entity Resolution** | Splink 4 / Fellegi-Sunter Model (DuckDB Backend) | Probabilistic record linkage, match candidate queue |
| **Evidence Ledger** | Sequential HMAC-SHA256 Hash Chain (SQLite) | Tamper-evident write audit log with sequence verification |

---

## Quickstart

### 1. Backend Service
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*API documentation available at `http://127.0.0.1:8000/docs`*

### 2. Frontend Application
```powershell
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## License

This software is licensed under the **Business Source License 1.1 (BUSL-1.1)** with no transition after-license.  
All intellectual property and repository rights belong to **Hundred-Trillion** and author **Adithya Srivatsa**.
