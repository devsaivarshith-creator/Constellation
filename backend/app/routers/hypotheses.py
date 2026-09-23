from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.models.hypothesis import HypothesisResponse, HypothesisCreate, HypothesisChallengeRequest
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.services.autonomous_research_service import auto_research_service

router = APIRouter(prefix="/hypotheses", tags=["Hypotheses & Autonomous Research"])

class AutoResearchRequest(BaseModel):
    case_id: str
    objective: str = Field(..., min_length=5)
    max_depth: int = Field(3, ge=1, le=5)
    relevance_threshold: float = Field(0.70, ge=0.1, le=1.0)
    cross_case_permitted: bool = False

@router.get("", response_model=List[Dict[str, Any]])
async def list_hypotheses(case_id: Optional[str] = None, current_user: UserResponse = Depends(get_current_user)):
    return await auto_research_service.get_hypotheses(case_id=case_id)

@router.post("", response_model=Dict[str, Any])
async def create_hypothesis(
    hyp_in: HypothesisCreate,
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    return await auto_research_service.create_hypothesis(
        case_id=hyp_in.case_id,
        statement=hyp_in.statement,
        confidence=hyp_in.confidence,
        supporting_evidence_ids=hyp_in.supporting_evidence_ids,
        contradicting_evidence_ids=hyp_in.contradicting_evidence_ids,
        actor_id=current_user.id
    )

@router.post("/{hypothesis_id}/challenge")
async def challenge_hypothesis(
    hypothesis_id: str,
    challenge_req: HypothesisChallengeRequest,
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    """
    Challenge Feature:
    Investigator challenges an AI conclusion -> Byomkesh re-evaluates supporting evidence,
    checks contradictions, and updates confidence/status.
    """
    try:
        return await auto_research_service.challenge_hypothesis(
            hypothesis_id=hypothesis_id,
            challenge_req=challenge_req,
            actor_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/auto-research")
async def run_auto_research(
    req: AutoResearchRequest,
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    """
    Byomkesh Auto Mode:
    Executes bounded autonomous multi-step research and creates a persisted Research Tree artifact.
    """
    return await auto_research_service.run_autonomous_research(
        case_id=req.case_id,
        objective=req.objective,
        actor_id=current_user.id,
        max_depth=req.max_depth,
        relevance_threshold=req.relevance_threshold,
        cross_case_permitted=req.cross_case_permitted
    )

@router.get("/auto-research/runs")
async def get_research_runs(case_id: Optional[str] = None, current_user: UserResponse = Depends(get_current_user)):
    return await auto_research_service.get_research_runs(case_id=case_id)
