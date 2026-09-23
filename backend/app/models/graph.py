from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

# Phase 1 Node Labels
NodeLabel = Literal[
    "Case", "Person", "Identity", "Communication",
    "FinancialTransaction", "Organization", "Location",
    "Vehicle", "Event", "Evidence", "Legal", "Relationship"
]

# Phase 1 Typed Relationships
RelationshipType = Literal[
    "OWNS", "CONTACTS", "TRANSFERS_TO", "LOCATED_AT", "ASSOCIATED_WITH",
    "EVIDENCE_OF", "CONTRADICTED_BY", "PART_OF", "REPORTED_AT",
    "COMMUNICATES_WITH", "IDENTIFIED_BY", "DRIVES", "ATTENDED",
    "EMPLOYED_BY", "AUTHORIZED_BY", "LINKED_TO_CASE"
]

RelationshipMethod = Literal["manual", "resolved", "inferred"]

class NodeCreate(BaseModel):
    label: NodeLabel
    properties: Dict[str, Any]
    case_id: Optional[str] = None

class PersonProperties(BaseModel):
    full_name: str
    aliases: List[str] = []
    date_of_birth: Optional[str] = None
    nationality: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

class RelationshipCreate(BaseModel):
    from_id: str
    to_id: str
    rel_type: RelationshipType
    confidence: float = Field(1.0, ge=0.0, le=1.0)
    source_ids: List[str] = Field(default_factory=list, description="IDs of Evidence nodes supporting this edge")
    method: RelationshipMethod = "manual"
    properties: Dict[str, Any] = Field(default_factory=dict)

class NodeResponse(BaseModel):
    id: str
    label: str
    properties: Dict[str, Any]
    case_id: Optional[str] = None
    created_at: Optional[str] = None

class RelationshipResponse(BaseModel):
    id: str
    from_id: str
    to_id: str
    rel_type: str
    confidence: float
    source_ids: List[str]
    method: str
    created_at: str
    properties: Dict[str, Any] = {}

class SubgraphResponse(BaseModel):
    nodes: List[NodeResponse]
    edges: List[RelationshipResponse]
