from fastapi import APIRouter, HTTPException, Depends
from app.models.byomkesh import ByomkeshQueryRequest, ByomkeshQueryResponse
from app.models.auth import UserResponse
from app.dependencies import get_current_user
from app.services.byomkesh_service import byomkesh_agent

router = APIRouter(prefix="/byomkesh", tags=["Byomkesh Agent"])

@router.post("/query", response_model=ByomkeshQueryResponse)
async def query_byomkesh(
    req: ByomkeshQueryRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Queries Byomkesh in Query Mode (Phase 1).
    Synthesizes answer with mandatory clickable citations referencing exact graph entities/edges.
    """
    response = await byomkesh_agent.query(
        question=req.question,
        case_id=req.case_id,
        focus_entity_ids=req.focus_entity_ids
    )
    return response
