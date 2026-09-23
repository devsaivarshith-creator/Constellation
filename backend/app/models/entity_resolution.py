from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ERComparisonField(BaseModel):
    similarity: float
    method: str
    match: Optional[bool] = None
    value_a: Optional[Any] = None
    value_b: Optional[Any] = None

class ERMatchBase(BaseModel):
    case_id: Optional[str] = None
    label: str
    entity_a_id: str
    entity_b_id: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    supporting_evidence_count: int = 0
    contradicting_evidence_count: int = 0
    comparison_details: Dict[str, Any] = {}

class ERMatchResponse(ERMatchBase):
    id: str
    entity_a_data: Optional[Dict[str, Any]] = None
    entity_b_data: Optional[Dict[str, Any]] = None
    status: str # "pending" | "confirmed" | "rejected"
    created_at: str
    reviewed_at: Optional[str] = None
    reviewer_id: Optional[str] = None

class ERResolutionAction(BaseModel):
    action: str = Field(..., pattern="^(confirm|reject)$")
    merge_strategy: Optional[str] = "keep_primary" # or "union_properties"
    notes: Optional[str] = None
