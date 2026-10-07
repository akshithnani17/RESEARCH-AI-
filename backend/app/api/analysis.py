from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.entities import User, Project, Paper, PaperAnalysis
from app.schemas.paper import PaperResponse
from app.schemas.project import ProjectResponse
from app.api.deps import get_current_user
from app.services.pipeline_service import PipelineService
from app.api.projects import project_to_response

router = APIRouter(prefix="/projects/{project_id}/analysis", tags=["Analysis"])

@router.post("/run", response_model=ProjectResponse)
def trigger_analysis(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    papers = db.query(Paper).filter(Paper.project_id == project_id).all()
    if len(papers) < settings.MIN_PAPERS_REQUIRED and not project.is_demo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"At least {settings.MIN_PAPERS_REQUIRED} research papers are required. You currently have {len(papers)}."
        )

    # Execute full pipeline
    updated_project = PipelineService.run_full_project_pipeline(db, project_id)
    return project_to_response(updated_project, db)

@router.get("/status")
def get_analysis_status(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    
    return {
        "status": project.status,
        "status_message": project.status_message,
        "progress_percentage": project.progress_percentage,
        "health_score": project.health_score,
        "evidence_coverage": project.evidence_coverage,
        "top_gap_score": project.top_gap_score
    }
