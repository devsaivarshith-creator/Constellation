from fastapi import APIRouter, Depends
from app.models.intelligence import SweepSummary
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.services.sweep_service import sweep_service

router = APIRouter(prefix="/sweep", tags=["12-Hour Sweep Engine"])

@router.get("/latest", response_model=SweepSummary)
async def get_latest_sweep(current_user: UserResponse = Depends(get_current_user)):
    return await sweep_service.get_latest_sweep()

@router.post("/trigger", response_model=SweepSummary)
async def trigger_sweep(current_user: UserResponse = Depends(require_role(["admin", "investigator"]))):
    """Triggers an on-demand incremental sweep across cases, entities, and hypotheses."""
    return await sweep_service.execute_sweep(triggered_by=current_user.username)
