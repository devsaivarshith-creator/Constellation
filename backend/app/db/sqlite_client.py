import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List
from app.config import settings

def get_db_connection():
    db_path = Path(settings.SQLITE_DB_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        full_name TEXT DEFAULT '',
        role TEXT NOT NULL CHECK(role IN ('admin', 'investigator', 'read_only')),
        created_at TEXT NOT NULL
    )
    """)
    
    # Audit log (HMAC Hash-Chain Ledger)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_log (
        sequence_number INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        prev_event_hmac TEXT NOT NULL,
        hmac TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)
    
    # Pending Entity Resolution Matches
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS er_matches (
        id TEXT PRIMARY KEY,
        case_id TEXT,
        label TEXT NOT NULL,
        entity_a_id TEXT NOT NULL,
        entity_b_id TEXT NOT NULL,
        confidence REAL NOT NULL,
        supporting_evidence_count INTEGER NOT NULL DEFAULT 0,
        contradicting_evidence_count INTEGER NOT NULL DEFAULT 0,
        comparison_details TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'rejected')),
        created_at TEXT NOT NULL,
        reviewed_at TEXT,
        reviewer_id TEXT
    )
    """)
    
    # Ingested Documents & Evidence Ledger metadata
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence_records (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_hash TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        collected_at TEXT NOT NULL,
        collected_by TEXT NOT NULL,
        metadata_json TEXT
    )
    """)

    # Workspaces — persisted investigation workspaces
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        case_id TEXT,
        description TEXT DEFAULT '',
        canvas_state TEXT DEFAULT '{}',
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Notifications — persistent notification store
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT DEFAULT '',
        notification_type TEXT DEFAULT 'info',
        is_read INTEGER DEFAULT 0,
        link TEXT DEFAULT '',
        created_at TEXT NOT NULL
    )
    """)

    # Try to add full_name column if missing (migration-safe)
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT DEFAULT ''")
    except Exception:
        pass  # Column already exists

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_sqlite_db()
    print("SQLite DB initialized successfully.")
