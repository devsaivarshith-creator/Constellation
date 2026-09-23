import pytest
from app.db.sqlite_client import init_sqlite_db
from app.dependencies import create_initial_users
from app.services.graph_service import graph_service
from app.services.sweep_service import sweep_service
from app.services.autonomous_research_service import auto_research_service
from app.models.hypothesis import HypothesisChallengeRequest

@pytest.fixture(autouse=True)
def setup_db():
    init_sqlite_db()
    create_initial_users()

@pytest.mark.asyncio
async def test_12_hour_sweep_engine():
    # Execute a sweep
    summary = await sweep_service.execute_sweep(triggered_by="test_runner")
    assert summary.status == "completed"
    assert summary.cases_scanned_count >= 0
    assert summary.sweep_id.startswith("swp_")

@pytest.mark.asyncio
async def test_byomkesh_auto_mode_and_challenge():
    actor = "usr_test_investigator"
    
    # Create test case
    case = await graph_service.create_node(
        label="Case",
        properties={"title": "Operation Valkyrie", "legal_basis": "Court Authorization #9921"},
        actor_id=actor
    )
    case_id = case["id"]

    # Run Byomkesh Auto Mode
    artifact = await auto_research_service.run_autonomous_research(
        case_id=case_id,
        objective="Trace network of Marcus Vance and associates",
        actor_id=actor,
        max_depth=3,
        relevance_threshold=0.75
    )

    assert artifact["status"] == "completed"
    assert len(artifact["hypotheses"]) > 0
    assert "report" in artifact

    # Test Challenge Byomkesh
    hyp = artifact["hypotheses"][0]
    hyp_id = hyp["id"]
    initial_confidence = hyp["confidence"]

    challenge_result = await auto_research_service.challenge_hypothesis(
        hypothesis_id=hyp_id,
        challenge_req=HypothesisChallengeRequest(
            challenge_statement="The IP address matches a known commercial VPN exit node, not the subject's residence."
        ),
        actor_id=actor
    )

    assert challenge_result["hypothesis"]["id"] == hyp_id
    assert challenge_result["hypothesis"]["confidence"] < initial_confidence
    assert len(challenge_result["hypothesis"]["challenge_history"]) == 1
