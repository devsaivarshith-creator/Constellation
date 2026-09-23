from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from app.models.auth import UserResponse
from app.dependencies import get_current_user, require_role
from app.services.ingestion_service import ingestion_service

router = APIRouter(prefix="/ingestion", tags=["Ingestion"])

@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    auto_commit: bool = Form(True),
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported by this endpoint")

    content = await file.read()
    result = await ingestion_service.parse_and_extract_pdf(
        case_id=case_id,
        filename=file.filename,
        file_bytes=content,
        actor_id=current_user.id,
        auto_commit_entities=auto_commit
    )
    return result

@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported by this endpoint")

    content = await file.read()
    csv_text = content.decode("utf-8", errors="ignore")
    result = await ingestion_service.ingest_csv_call_records(
        case_id=case_id,
        filename=file.filename,
        csv_text=csv_text,
        actor_id=current_user.id
    )
    return result

@router.post("/upload-media")
async def upload_media(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    media_type: str = Form("photo"),
    current_user: UserResponse = Depends(require_role(["admin", "investigator"]))
):
    content = await file.read()
    node = await ingestion_service.ingest_file_as_evidence(
        case_id=case_id,
        filename=file.filename,
        file_bytes=content,
        evidence_type=media_type,
        actor_id=current_user.id
    )
    return node
