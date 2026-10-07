from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, Project
from app.api.deps import get_current_user
from app.services.report_service import ReportService

router = APIRouter(prefix="/projects/{project_id}/reports", tags=["Reports"])

@router.get("/markdown")
def get_markdown_report(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    markdown_text = ReportService.generate_markdown_report(db, project_id)
    return {
        "project_id": project_id,
        "title": f"Report: {project.name}",
        "markdown_content": markdown_text
    }

@router.get("/download")
def download_report(
    project_id: int,
    format: str = "markdown",  # markdown or txt
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    markdown_text = ReportService.generate_markdown_report(db, project_id)
    filename = f"ResearchGap_AI_Report_{project_id}_{project.name.replace(' ', '_')}"

    if format.lower() == "txt":
        return Response(
            content=markdown_text,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={filename}.txt"}
        )
    else:
        return Response(
            content=markdown_text,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename={filename}.md"}
        )
