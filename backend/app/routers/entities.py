from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
from app.models.graph import NodeCreate, NodeResponse
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.services.graph_service import graph_service
from app.services.er_service import er_service

router = APIRouter(prefix="/entities", tags=["Entities"])

@router.post("", response_model=NodeResponse)
async def create_entity(
    node_in: NodeCreate,
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    node = await graph_service.create_node(
        label=node_in.label,
        properties=node_in.properties,
        case_id=node_in.case_id,
        actor_id=current_user.id
    )

    # Automatically run entity resolution against same-label entities
    await er_service.run_resolution_for_entity(node["id"], case_id=node_in.case_id)

    return NodeResponse(
        id=node["id"],
        label=node["label"],
        properties=node["properties"],
        case_id=node.get("case_id"),
        created_at=node["properties"].get("created_at")
    )

@router.get("/{entity_id}", response_model=NodeResponse)
async def get_entity(entity_id: str, current_user: UserResponse = Depends(get_current_user)):
    node = await graph_service.get_node(entity_id)
    if not node:
        raise HTTPException(status_code=404, detail="Entity not found")
    return NodeResponse(
        id=node["id"],
        label=node["label"],
        properties=node["properties"],
        case_id=node.get("case_id"),
        created_at=node["properties"].get("created_at")
    )

@router.get("", response_model=List[NodeResponse])
async def list_entities(
    label: str = "Person",
    case_id: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    nodes = await graph_service.list_nodes(label=label, case_id=case_id)
    return [
        NodeResponse(
            id=n["id"],
            label=n["label"],
            properties=n["properties"],
            case_id=n.get("case_id"),
            created_at=n["properties"].get("created_at")
        )
        for n in nodes
    ]
