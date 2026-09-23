# Investigation Workspace & 3D Floating Windows Walkthrough

We have redesigned and upgraded the **Constellation** intelligence platform to focus entirely on the **Investigation Workspace** as the primary interactive environment, with a high-end **minimalist black-and-white aesthetic**, **3 floating 3D bending windows**, **drag-and-drop from File Explorer**, **interactive SVG bezier roping**, and a **fully functional FastAPI backend**.

---

## 1. Architectural Overview & Enhancements

### A. The Investigation Workspace (The Central Soul)
- **Immediate Default View**: Launching the app opens directly into the Investigation Workspace (`activeNavSection: 'workspace'`).
- **3D Perspective Stage**: A pitch black (`#000000`) canvas with a subtle dot-matrix blueprint grid and perspective depth (`perspective(1400px)`).
- **Top Command Strip**:
  - Explorer toggle button (`[ ☰ EXPLORER ]`)
  - Case metadata pill (`CASE 102 — SILVER DUNE` · `CRITICAL PRIORITY`)
  - 3 Window state toggles (`1. Canvas & Ropes`, `2. Byomkesh AI`, `3. Dossier & Timeline`)
  - Quick arrangement buttons: `Tile Windows` and `Focus Canvas`
  - Real-time Backend Health Indicator: `● FASTAPI BACKEND LIVE (127.0.0.1:8000)`

---

### B. The 3 Floating 3D Bending Windows
All 3 windows are encased in our interactive `Panel3D` component featuring dynamic cursor perspective tilt (`rotateX`, `rotateY`), silver/white specular reflection glare, and floating depth:

1. **Window 1: Investigation Board & Canvas (Canvas & Ropes)**
   - **Interactive Node Pinboard**: Draggable entity cards representing Tariq Merchant, Rajesh Sharma, Al-Barakah Logistics, Hawala Node #88219, etc.
   - **Dynamic SVG Bezier Ropes**: Real-time curved rope connections rendered across nodes (`M x1 y1 C ... x2 y2`).
   - **Interactive Roping**: Click "Rope / Link" on any node, select a target node, and pick the verified relationship (`COORDINATES_WITH`, `BENEFICIAL_OWNER`, `TRANSFERS_FUNDS`, `COMMUNICATES_WITH`).
   - **Live Severance**: Click the `×` button on any rope's midpoint pill to sever the connection.
   - **Free Dragging**: Dragging any card across the board smoothly stretches and recalculates all attached bezier ropes in real time.

2. **Window 2: Byomkesh AI Intelligence Engine**
   - **Live Backend Integration**: Queries hit `POST http://127.0.0.1:8000/api/byomkesh/query` on the live FastAPI backend server.
   - **Automated Graph Inferences**: Returns structured deductions, Cypher queries executed, confidence ratings, and exact graph citations (`[cit_1]`, `[cit_2]`).
   - **Autonomous Research & Hypotheses**: Mode switcher for `ASSIST`, `RESEARCH`, and `REVIEW` with an interactive hypothesis challenge workflow.

3. **Window 3: Dossier & Evidence Inspector**
   - **Entity Dossier**: Live inspection of the selected canvas entity with identifiers, phone/wiretap records, passports, threat ratings, and legal basis.
   - **Timeline Reconstruction**: Step-by-step intelligence events (AIS blackout, Hawala ledger settlements, unmanifested Kandla port offloads).
   - **Evidence Vault**: Cryptographic hashes, classifications, and forensics summaries.

---

### C. Drag-and-Drop from File Explorer
- In `FileExplorer.jsx`, folders under **Case 102 -> INFORMATION** expand into draggable items:
  - **People**: Tariq "The Anchor" Merchant, Rajesh Sharma, Captain Al-Sayed, Nadia Chen
  - **Organizations**: Al-Barakah Logistics FZE, Vikramaditya Shipping Lines
  - **Vehicles**: MV Sagar Ratna (IMO 921882)
  - **Financial**: Hawala Node #88219 (₹14.8 Cr Settlement Mirror)
  - **Evidence**: Bill of Lading #BOL-9921, CCTV Night Offload Still, Wire Transfer Ledger
- Each item carries `draggable={true}`, a `GripVertical` handle, and a `(drag)` tag.
- Dragging any item from the explorer over the Investigation Board highlights the drop zone and pins the entity at the exact mouse cursor location.

---

### D. Minimalist Black-and-White Aesthetic
- **Palette**: Pure pitch black foundations (`#000000`, `#050505`, `#0a0a0a`), clean white typography (`#ffffff`), and hair-thin graphite borders (`rgba(255, 255, 255, 0.12)`).
- **High-Contrast Elements**: Inverted monochrome buttons and badges, eliminating neon distractions for a clean, Apple-and-Linear level intelligence terminal.

---

### E. Fully Functional Backend Integration
- **FastAPI Backend Server**: Running live on `http://127.0.0.1:8000`.
- **Seeded Canonical Intelligence**: Case 102 graph entities, relationships, evidence, and hypotheses automatically seeded into the embedded resilience graph engine.
- **Verified Endpoints**:
  - `GET /api/health` -> `200 OK` (`{"status": "healthy", "graph_backend": "Embedded Resilience Engine"}`)
  - `POST /api/byomkesh/query` -> `200 OK` (returns live graph inferences and citations).

---

## 2. Verification Summary

| Component | Status | Details |
| :--- | :--- | :--- |
| **Frontend Production Build** | **PASS** | `npm run build` compiled cleanly in 477ms with 0 errors. |
| **Vite Dev Server** | **RUNNING** | Active on `http://localhost:5173/`. |
| **FastAPI Backend Daemon** | **RUNNING** | Active on `http://127.0.0.1:8000/api`. |
| **Byomkesh Live Queries** | **PASS** | Tested with live queries (`POST /api/byomkesh/query`) returning graph deductions & citations. |
| **Canvas & Bezier Roping** | **READY** | Full SVG bezier curves, node drag handlers, and relationship creation. |
| **File Explorer Dragging** | **READY** | Serialized JSON payloads transferred and captured by drop handlers. |
