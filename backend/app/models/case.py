from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class CaseBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = ""
    # NON-NEGOTIABLE REQUIREMENT: legal_basis is strictly required!
    legal_basis: str = Field(
        ...,
        min_length=5,
        description="Legal justification authorizing this investigation (e.g. Warrant #1234, Grand Jury Subpoena, Title 18 USC Section...)"
    )
    status: str = Field("active", pattern="^(active|archived|closed|pending_approval)$")

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    legal_basis: Optional[str] = None
    status: Optional[str] = None

class CaseResponse(CaseBase):
    id: str
    created_at: str
    created_by: str
    entity_count: Optional[int] = 0
    relationship_count: Optional[int] = 0
