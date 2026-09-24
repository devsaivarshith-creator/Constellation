import uuid
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.models.auth import UserResponse
from app.dependencies import get_current_user
from app.db.sqlite_client import get_db_connection

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    body: str = ""
    notification_type: str = "info"
    is_read: bool = False
    link: str = ""
    created_at: str

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    unread_only: bool = False,
    current_user: UserResponse = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    if unread_only:
        cursor.execute(
            "SELECT * FROM notifications WHERE (user_id = ? OR user_id = ? OR user_id = 'all') AND is_read = 0 ORDER BY created_at DESC LIMIT 50",
            (current_user.id, current_user.username)
        )
    else:
        cursor.execute(
            "SELECT * FROM notifications WHERE user_id = ? OR user_id = ? OR user_id = 'all' ORDER BY created_at DESC LIMIT 50",
            (current_user.id, current_user.username)
        )
    rows = cursor.fetchall()
    conn.close()
    return [
        NotificationResponse(
            id=r["id"], user_id=r["user_id"], title=r["title"],
            body=r["body"] or "", notification_type=r["notification_type"] or "info",
            is_read=bool(r["is_read"]), link=r["link"] or "",
            created_at=r["created_at"]
        ) for r in rows
    ]

@router.post("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: UserResponse = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
        (notification_id, current_user.id)
    )
    conn.commit()
    conn.close()
    return {"status": "read", "notification_id": notification_id}

@router.post("/read-all")
async def mark_all_read(current_user: UserResponse = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
        (current_user.id,)
    )
    conn.commit()
    conn.close()
    return {"status": "all_read"}

def create_notification(user_id: str, title: str, body: str = "", notification_type: str = "info", link: str = ""):
    """Utility to create a notification from any service."""
    notif_id = f"notif_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc).isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO notifications (id, user_id, title, body, notification_type, is_read, link, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    """, (notif_id, user_id, title, body, notification_type, link, now))
    conn.commit()
    conn.close()
    return notif_id
