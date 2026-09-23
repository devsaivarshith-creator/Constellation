import pytest
import asyncio
from app.db.sqlite_client import init_sqlite_db
from app.dependencies import create_initial_users
from app.services.audit_service import audit_service
from app.services.graph_service import graph_service
from app.services.er_service import er_service
from app.services.byomkesh_service import byomkesh_agent
from app.services.ingestion_service import ingestion_service

@pytest.fixture(autouse=True)
def setup_db():
    init_sqlite_db()
    create_initial_users()

@pytest.mark.asyncio
async def test_audit_hash_chain_integrity():
    # Log 3 events
    e1 = audit_service.log_event("TEST_EVENT", "actor_1", "target_1", {"key": "val1"})
    e2 = audit_service.log_event("TEST_EVENT", "actor_1", "target_2", {"key": "val2"})
    e3 = audit_service.log_event("TEST_EVENT", "actor_1", "target_3", {"key": "val3"})

    # Verify chain
    report = audit_service.verify_chain()
    assert report["valid"] is True
    assert report["total_records"] >= 3

@pytest.mark.asyncio
async def test_person_and_contacts_creation():
    actor = "usr_test_investigator"
    
    # Create Case
    case = await graph_service.create_node(
        label="Case",
        properties={"title": "Operation Starlight", "legal_basis": "Federal Warrant 2026-X"},
        actor_id=actor
    )
    case_id = case["id"]

    # Create two Person nodes
    p1 = await graph_service.create_node(
        label="Person",
        properties={"full_name": "Marcus Vance", "phone": "+1-555-0199"},
        actor_id=actor,
        case_id=case_id
    )
    p2 = await graph_service.create_node(
        label="Person",
        properties={"full_name": "Elena Rostova", "phone": "+1-555-0288"},
        actor_id=actor,
        case_id=case_id
    )

    # Create typed CONTACTS relationship
    edge = await graph_service.create_relationship(
        from_id=p1["id"],
        to_id=p2["id"],
        rel_type="CONTACTS",
        confidence=0.94,
        source_ids=["ev_wiretap_01"],
        actor_id=actor,
        method="manual",
        properties={"calls_count": 8}
    )

    assert edge["from_id"] == p1["id"]
    assert edge["to_id"] == p2["id"]
    assert edge["rel_type"] == "CONTACTS"
    assert edge["confidence"] == 0.94

    # Verify Subgraph
    subgraph = await graph_service.get_case_subgraph(case_id=case_id)
    node_ids = [n["id"] for n in subgraph["nodes"]]
    assert p1["id"] in node_ids
    assert p2["id"] in node_ids
    assert any(e["id"] == edge["id"] for e in subgraph["edges"])

@pytest.mark.asyncio
async def test_entity_resolution_workflow():
    actor = "usr_test_investigator"
    case_id = "case_er_test"

    # Create original person
    orig = await graph_service.create_node(
        label="Person",
        properties={"full_name": "Jonathan E. Archer", "phone": "+1-555-4321"},
        actor_id=actor,
        case_id=case_id
    )

    # Ingest a near-duplicate person
    dup = await graph_service.create_node(
        label="Person",
        properties={"full_name": "Jon Archer", "phone": "+1-555-4321"},
        actor_id=actor,
        case_id=case_id
    )

    # Evaluate candidate pair
    match = await er_service.evaluate_candidate_pair(dup, orig, case_id=case_id)
    assert match is not None
    assert match["confidence"] >= 0.70
    assert match["supporting_evidence_count"] >= 2
    assert match["status"] == "pending"

    # Confirm match via investigator action
    res = await er_service.resolve_match(match["id"], action="confirm", actor_id=actor)
    assert res["status"] == "confirmed"
    assert res["action"] == "confirm"

@pytest.mark.asyncio
async def test_byomkesh_query_with_citations():
    actor = "usr_test_investigator"
    
    # Query Byomkesh
    response = await byomkesh_agent.query(question="Who did Marcus Vance contact?")
    assert response.query_id.startswith("byo_")
    assert isinstance(response.citations, list)
    assert len(response.citations) > 0
    # Every citation has exact target_id and type
    for c in response.citations:
        assert c.target_type in ("node", "edge", "evidence")
        assert len(c.target_id) > 0

@pytest.mark.asyncio
async def test_csv_call_log_ingestion():
    actor = "usr_test_investigator"
    case_id = "case_csv_test"
    
    csv_content = """caller,callee,timestamp,duration
Julian Assange,Daniel Ellsberg,2024-03-12T14:30:00Z,420
Julian Assange,Chelsea Manning,2024-03-12T16:15:00Z,180
"""
    result = await ingestion_service.ingest_csv_call_records(
        case_id=case_id,
        filename="intercept_call_logs.csv",
        csv_text=csv_content,
        actor_id=actor
    )
    
    assert result["entities_created"] >= 3
    assert result["contacts_relationships_created"] == 2
    assert result["evidence_id"].startswith("ev_")

