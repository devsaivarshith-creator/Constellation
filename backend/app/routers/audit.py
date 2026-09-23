from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.services.audit_service import audit_service
from app.db.sqlite_client import get_db_connection

router = APIRouter(prefix="/audit", tags=["Audit & Integrity Ledger"])

@router.get("/verify")
async def verify_audit_ledger(current_user: UserResponse = Depends(require_role(["admin", "investigator"]))):
    """
    Verifies the cryptographic HMAC hash-chain across all historical writes.
    Detects any database tampering, modified payloads, or deleted sequence records.
    """
    return audit_service.verify_chain()

@router.get("/recent")
async def get_recent_audit_events(limit: int = 50, current_user: UserResponse = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT sequence_number, event_type, actor_id, target_id,
               payload_hash, prev_event_hmac, hmac, timestamp
        FROM audit_log
        ORDER BY sequence_number DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
