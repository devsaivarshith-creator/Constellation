import uuid
import json
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.db.sqlite_client import get_db_connection

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

# ---- Models ----
class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    case_id: Optional[str] = None
    description: Optional[str] = ""

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    canvas_state: Optional[dict] = None

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    case_id: Optional[str] = None
    description: str = ""
    canvas_state: dict = {}
    created_by: str
    created_at: str
    updated_at: str

# ---- Endpoints ----
@router.post("", response_model=WorkspaceResponse)
async def create_workspace(
    ws_in: WorkspaceCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    ws_id = f"ws_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    canvas = json.dumps({"nodes": [], "edges": []})

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO workspaces (id, name, case_id, description, canvas_state, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (ws_id, ws_in.name, ws_in.case_id, ws_in.description or "", canvas, current_user.id, now, now))
    conn.commit()
    conn.close()

    return WorkspaceResponse(
        id=ws_id, name=ws_in.name, case_id=ws_in.case_id,
        description=ws_in.description or "", canvas_state={"nodes": [], "edges": []},
        created_by=current_user.id, created_at=now, updated_at=now
    )

@router.get("", response_model=List[WorkspaceResponse])
async def list_workspaces(
    case_id: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    if case_id:
        cursor.execute("SELECT * FROM workspaces WHERE case_id = ? ORDER BY updated_at DESC", (case_id,))
    else:
        cursor.execute("SELECT * FROM workspaces ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    conn.close()

    return [
        WorkspaceResponse(
            id=r["id"], name=r["name"], case_id=r["case_id"],
            description=r["description"] or "",
            canvas_state=json.loads(r["canvas_state"] or "{}"),
            created_by=r["created_by"],
            created_at=r["created_at"], updated_at=r["updated_at"]
        ) for r in rows
    ]

@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(workspace_id: str, current_user: UserResponse = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM workspaces WHERE id = ?", (workspace_id,))
    r = cursor.fetchone()
    conn.close()

    if not r:
        raise HTTPException(status_code=404, detail="Workspace not found")

    return WorkspaceResponse(
        id=r["id"], name=r["name"], case_id=r["case_id"],
        description=r["description"] or "",
        canvas_state=json.loads(r["canvas_state"] or "{}"),
        created_by=r["created_by"],
        created_at=r["created_at"], updated_at=r["updated_at"]
    )

@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    ws_update: WorkspaceUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM workspaces WHERE id = ?", (workspace_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Workspace not found")

    now = datetime.now(timezone.utc).isoformat()
    new_name = ws_update.name or existing["name"]
    new_desc = ws_update.description if ws_update.description is not None else existing["description"]
    new_canvas = json.dumps(ws_update.canvas_state) if ws_update.canvas_state is not None else existing["canvas_state"]

    cursor.execute("""
        UPDATE workspaces SET name = ?, description = ?, canvas_state = ?, updated_at = ? WHERE id = ?
    """, (new_name, new_desc, new_canvas, now, workspace_id))
    conn.commit()

    cursor.execute("SELECT * FROM workspaces WHERE id = ?", (workspace_id,))
    r = cursor.fetchone()
    conn.close()

    return WorkspaceResponse(
        id=r["id"], name=r["name"], case_id=r["case_id"],
        description=r["description"] or "",
        canvas_state=json.loads(r["canvas_state"] or "{}"),
        created_by=r["created_by"],
        created_at=r["created_at"], updated_at=r["updated_at"]
    )

@router.delete("/{workspace_id}")
async def delete_workspace(
    workspace_id: str,
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM workspaces WHERE id = ?", (workspace_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Workspace not found")
    conn.commit()
    conn.close()
    return {"status": "deleted", "workspace_id": workspace_id}
