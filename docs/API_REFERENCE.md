# 📡 Constellation Intelligence Platform — API Reference

Base URL (Local): `http://127.0.0.1:8000/api`  
Interactive Swagger Docs: `http://127.0.0.1:8000/docs`  
ReDoc Documentation: `http://127.0.0.1:8000/redoc`

All endpoints (except `/api/health`, `/api/auth/login`, and `/api/auth/register`) require standard Bearer token authentication:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication (`/api/auth`)

### POST `/api/auth/login`
Authenticates user and returns JWT token.
- **Request Body:**
  ```json
  {
    "username": "investigator",
    "password": "investigator123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "id": "usr_ed556cbda1",
      "username": "investigator",
      "full_name": "Lead Intelligence Officer",
      "role": "investigator"
    }
  }
  ```

### GET `/api/auth/me`
Returns authenticated user profile.
- **Response (200 OK):**
  ```json
  {
    "id": "usr_ed556cbda1",
    "username": "investigator",
    "full_name": "Lead Intelligence Officer",
    "role": "investigator"
  }
  ```

---

## 2. Intelligence Cases (`/api/cases`)

### GET `/api/cases`
Lists all active investigation cases.

### GET `/api/cases/{case_id}/subgraph`
Fetches all nodes and relationships within a specific case boundary.
- **Response (200 OK):**
  ```json
  {
    "nodes": [
      {
        "id": "p-1",
        "label": "Person",
        "properties": {
          "name": "Tariq \"The Anchor\" Merchant",
          "threat": "CRITICAL"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "from_id": "p-1",
        "to_id": "org-1",
        "rel_type": "BENEFICIAL_OWNER",
        "confidence": 0.94
      }
    ]
  }
  ```

---

## 3. Byomkesh AI Copilot (`/api/byomkesh`)

### POST `/api/byomkesh/query`
Executes an investigative query against the case knowledge graph with mandatory citations.
- **Request Body:**
  ```json
  {
    "question": "Who controls Al-Barakah Logistics and how are funds transferred?",
    "case_id": "case-102"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "query_id": "byo_11e2141ae868",
    "question": "Who controls Al-Barakah Logistics and how are funds transferred?",
    "answer": "Based on the verified knowledge graph records:\n• [cit_1] Tariq Merchant -[BENEFICIAL_OWNER]-> Al-Barakah Logistics FZE (Confidence: 0.94)...",
    "citations": [
      {
        "citation_id": "cit_1",
        "target_type": "edge",
        "target_id": "edge-1",
        "label_or_type": "BENEFICIAL_OWNER",
        "summary": "Tariq Merchant -[BENEFICIAL_OWNER]-> Al-Barakah Logistics FZE",
        "confidence": 0.94
      }
    ],
    "confidence": 0.95,
    "execution_time_ms": 0.22
  }
  ```

---

## 4. Entity Resolution (`/api/entity-resolution`)

### GET `/api/entity-resolution/matches`
Lists pending cross-case or within-case entity resolution match candidates.

### POST `/api/entity-resolution/matches/{match_id}/resolve`
Confirm or reject an entity match.
- **Request Body:**
  ```json
  {
    "action": "confirm",
    "notes": "Verified against Dubai corporate registry filings."
  }
  ```

---

## 5. Workspaces (`/api/workspaces`)

### GET `/api/workspaces`
Lists all workspaces with serialized canvas states.

### POST `/api/workspaces`
Creates a new workspace.
- **Request Body:**
  ```json
  {
    "name": "Red Sand Syndicate — Creek Smuggling",
    "case_id": "case-143",
    "description": "Porbandar creek offloading and unmanifested dhow routes."
  }
  ```

### PUT `/api/workspaces/{workspace_id}`
Updates workspace canvas nodes, bezier connections, and metadata.

---

## 6. Audit Ledger (`/api/audit`)

### GET `/api/audit/verify`
Performs cryptographic validation of the HMAC SHA-256 hash-chain across all historical records.
- **Response (200 OK):**
  ```json
  {
    "valid": true,
    "total_records": 24,
    "latest_hmac": "aad402584e8e48425a854b5f3e551f9c10923afa19a56c632cc84f3fe55739d1",
    "status": "verified_intact"
  }
  ```

### GET `/api/audit/recent`
Returns the recent audit events.

---

## 7. 12-Hour Sweep Engine (`/api/sweep`)

### GET `/api/sweep/latest`
Fetches findings from the most recent autonomous cross-case analysis.

### POST `/api/sweep/trigger`
Triggers an immediate sweep across all active cases, entities, and evidence.

---

## 8. Ingestion & Document Processing (`/api/ingestion`)

### POST `/api/ingestion/upload-pdf`
Uploads a document, extracts text, computes SHA-256 hash, runs Named Entity Recognition, and adds entities to the case graph.
- **Multipart Form:**
  - `file`: PDF binary
  - `case_id`: `case-102`
  - `auto_commit`: `true`

---

## 9. System Health (`/api/health`)

### GET `/api/health`
Public health check.
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "app": "Constellation Intelligence Platform",
    "version": "1.0.0",
    "graph_backend": "Embedded Resilience Engine",
    "llm_configured": false
  }
  ```
