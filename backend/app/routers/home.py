from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from app.models.intelligence import HomeBriefingResponse, LiveIntelligenceItem
from app.models.auth import UserResponse
from app.dependencies import get_current_user
from app.services.sweep_service import sweep_service
from app.services.graph_service import graph_service
from app.services.autonomous_research_service import auto_research_service

router = APIRouter(prefix="/home", tags=["Home Briefing"])

@router.get("/briefing", response_model=HomeBriefingResponse)
async def get_home_briefing(current_user: UserResponse = Depends(get_current_user)):
    """
    Returns the consolidated Netflix-style briefing:
    - What's happening right now?
    - Byomkesh highlights & discoveries
    - Continue investigating tiles
    - Live unverified intelligence
    - 12-hour sweep status
    """
    # 1. Sweep summary
    latest_sweep = await sweep_service.get_latest_sweep()

    # 2. Hero discovery
    hero = latest_sweep.findings[0] if latest_sweep.findings else None

    # 3. Continue cases
    cases = await graph_service.list_nodes(label="Case")
    continue_cases = []
    for c in cases[:4]:
        props = c.get("properties", {})
        continue_cases.append({
            "id": c["id"],
            "title": props.get("title", "Active Investigation"),
            "legal_basis": props.get("legal_basis", "Authorized"),
            "status": props.get("status", "active"),
            "last_active": props.get("created_at", datetime.now(timezone.utc).isoformat())
        })

    # 4. Live unverified intelligence items
    live_intel = [
        LiveIntelligenceItem(
            id="intel_01",
            source_name="Financial Regulatory Wire",
            source_type="public_records",
            title="Entity Transfer Involving Off-Shore Account",
            snippet="Cross-border wire of $420,000 flagged matching identifier associated with Marcus Vance.",
            status="unverified",
            confidence=0.74,
            detected_at=datetime.now(timezone.utc).isoformat(),
            relevant_entity_ids=["person_marcus_vance"]
        ),
        LiveIntelligenceItem(
            id="intel_02",
            source_name="Maritime AIS Telemetry",
            source_type="osint",
            title="Vessel Northern Star Port Entry",
            snippet="Vessel linked to Case 102 logistics docked at Port of Rotterdam at 04:15 UTC.",
            status="unverified",
            confidence=0.88,
            detected_at=datetime.now(timezone.utc).isoformat(),
            relevant_case_ids=[cases[0]["id"]] if cases else []
        )
    ]

    return HomeBriefingResponse(
        greeting=f"Good evening, Special Agent {current_user.username.title()}.",
        hero_discovery=hero,
        continue_cases=continue_cases,
        live_intelligence=live_intel,
        sweep_status=latest_sweep,
        unread_alerts_count=len(latest_sweep.findings) + len(live_intel)
    )
