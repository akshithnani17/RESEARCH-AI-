import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.entities import User, Project, Paper, PaperAnalysis
from app.schemas.paper import PaperResponse, PaperAnalysisResponse
from app.api.deps import get_current_user
from app.services.pipeline_service import PipelineService

router = APIRouter(prefix="/projects/{project_id}/papers", tags=["Papers"])

@router.get("", response_model=List[PaperResponse])
def list_papers(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    
    papers = db.query(Paper).filter(Paper.project_id == project_id).order_by(Paper.created_at.asc()).all()
    return papers

@router.post("/upload", response_model=List[PaperResponse], status_code=status.HTTP_201_CREATED)
async def upload_papers(
    project_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files uploaded.")

    uploaded_papers = []
    project_upload_dir = os.path.join(settings.UPLOAD_DIR, f"project_{project_id}")
    os.makedirs(project_upload_dir, exist_ok=True)

    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format for '{file.filename}'. Only PDF files are supported."
            )
        
        # Check duplicate filename in project
        existing = db.query(Paper).filter(Paper.project_id == project_id, Paper.original_filename == file.filename).first()
        if existing:
            # Skip or allow duplicate with uuid
            pass

        unique_id = str(uuid.uuid4())[:8]
        safe_filename = f"{unique_id}_{file.filename.replace(' ', '_')}"
        dest_path = os.path.join(project_upload_dir, safe_filename)

        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(dest_path)
        if file_size > (settings.MAX_FILE_SIZE_MB * 1024 * 1024):
            os.remove(dest_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file.filename}' exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
            )

        paper = Paper(
            project_id=project.id,
            title=file.filename.replace(".pdf", "").replace("_", " ").replace("-", " "),
            original_filename=file.filename,
            file_path=dest_path,
            file_size_bytes=file_size,
            processing_status="UPLOADED"
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)

        # Process paper text extraction & analysis
        try:
            processed_paper = PipelineService.process_uploaded_paper(db, paper)
            uploaded_papers.append(processed_paper)
        except Exception as e:
            paper.processing_status = "FAILED"
            paper.error_message = str(e)
            db.commit()
            uploaded_papers.append(paper)

    # Update project paper count and status
    total_papers = db.query(Paper).filter(Paper.project_id == project_id).count()
    project.status_message = f"{total_papers} paper(s) uploaded. Minimum {settings.MIN_PAPERS_REQUIRED} required to run gap discovery."
    db.commit()

    return uploaded_papers

@router.delete("/{paper_id}")
def delete_paper(
    project_id: int,
    paper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    
    paper = db.query(Paper).filter(Paper.id == paper_id, Paper.project_id == project_id).first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found.")

    if os.path.exists(paper.file_path):
        try:
            os.remove(paper.file_path)
        except Exception:
            pass

    db.delete(paper)
    db.commit()
    return {"message": f"Paper #{paper_id} deleted successfully."}
