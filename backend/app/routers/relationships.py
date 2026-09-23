from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.models.graph import RelationshipCreate, RelationshipResponse
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.services.graph_service import graph_service

router = APIRouter(prefix="/relationships", tags=["Relationships"])

@router.post("", response_model=RelationshipResponse)
async def create_relationship(
    rel_in: RelationshipCreate,
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    edge = await graph_service.create_relationship(
        from_id=rel_in.from_id,
        to_id=rel_in.to_id,
        rel_type=rel_in.rel_type,
        confidence=rel_in.confidence,
        source_ids=rel_in.source_ids,
        actor_id=current_user.id,
        method=rel_in.method,
        properties=rel_in.properties
    )
    return RelationshipResponse(
        id=edge["id"],
        from_id=edge["from_id"],
        to_id=edge["to_id"],
        rel_type=edge["rel_type"],
        confidence=edge["confidence"],
        source_ids=edge["source_ids"],
        method=edge["method"],
        created_at=edge["created_at"],
        properties=edge.get("properties", {})
    )
