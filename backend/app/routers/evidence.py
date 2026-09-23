from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.models.evidence import EvidenceResponse
from app.models.auth import UserResponse
from app.dependencies import get_current_user
from app.services.graph_service import graph_service
from app.db.sqlite_client import get_db_connection

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.get("", response_model=List[EvidenceResponse])
async def list_evidence(
    case_id: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    nodes = await graph_service.list_nodes(label="Evidence", case_id=case_id)
    results = []
    for n in nodes:
        props = n.get("properties", {})
        results.append(EvidenceResponse(
            id=n["id"],
            case_id=n.get("case_id") or props.get("case_id", ""),
            title=props.get("title", n["id"]),
            evidence_type=props.get("evidence_type", "document"),
            description=props.get("description", ""),
            collected_at=props.get("collected_at", ""),
            collected_by=props.get("collected_by", ""),
            filename=props.get("filename"),
            file_hash=props.get("file_hash", "0" * 64),
            file_size=props.get("file_size"),
            chain_of_custody_hash=props.get("chain_of_custody_hash"),
            created_at=props.get("created_at", ""),
            metadata=props
        ))
    return results

@router.get("/{evidence_id}", response_model=EvidenceResponse)
async def get_evidence(evidence_id: str, current_user: UserResponse = Depends(get_current_user)):
    node = await graph_service.get_node(evidence_id)
    if not node:
        raise HTTPException(status_code=404, detail="Evidence item not found")
    props = node.get("properties", {})
    return EvidenceResponse(
        id=node["id"],
        case_id=node.get("case_id") or props.get("case_id", ""),
        title=props.get("title", node["id"]),
        evidence_type=props.get("evidence_type", "document"),
        description=props.get("description", ""),
        collected_at=props.get("collected_at", ""),
        collected_by=props.get("collected_by", ""),
        filename=props.get("filename"),
        file_hash=props.get("file_hash", "0" * 64),
        file_size=props.get("file_size"),
        chain_of_custody_hash=props.get("chain_of_custody_hash"),
        created_at=props.get("created_at", ""),
        metadata=props
    )
