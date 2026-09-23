from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class EvidenceBase(BaseModel):
    case_id: str
    title: str
    evidence_type: str = Field("document", pattern="^(document|photo|video|audio|digital)$")
    description: Optional[str] = ""
    collected_at: Optional[str] = None
    collected_by: Optional[str] = None

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceResponse(EvidenceBase):
    id: str
    filename: Optional[str] = None
    file_hash: str # SHA-256
    file_size: Optional[int] = None
    chain_of_custody_hash: Optional[str] = None
    created_at: str
    metadata: Dict[str, Any] = {}
