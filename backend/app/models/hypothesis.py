from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

HypothesisStatus = Literal["unverified", "under_review", "confirmed", "rejected"]

class HypothesisBase(BaseModel):
    statement: str = Field(..., min_length=5)
    case_id: str
    confidence: float = Field(0.5, ge=0.0, le=1.0)
    supporting_evidence_ids: List[str] = Field(default_factory=list)
    contradicting_evidence_ids: List[str] = Field(default_factory=list)
    status: HypothesisStatus = "unverified"
    thread_id: Optional[str] = None

class HypothesisCreate(HypothesisBase):
    pass

class HypothesisChallengeRequest(BaseModel):
    challenge_statement: str = Field(..., min_length=5, description="The investigator's counter-argument or challenged premise")
    additional_evidence_ids: List[str] = Field(default_factory=list)

class HypothesisResponse(HypothesisBase):
    id: str
    created_at: str
    created_by: str
    last_evaluated_at: Optional[str] = None
    challenge_history: List[Dict[str, Any]] = Field(default_factory=list)

class InvestigationThreadBase(BaseModel):
    case_id: str
    title: str = Field(..., min_length=3)
    description: Optional[str] = ""
    target_entity_ids: List[str] = Field(default_factory=list)

class InvestigationThreadResponse(InvestigationThreadBase):
    id: str
    created_at: str
    hypothesis_count: int = 0
