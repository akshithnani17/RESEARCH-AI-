from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, Project, Paper, PaperAnalysis
from app.schemas.paper import PaperComparisonResponse, PaperResponse
from app.api.deps import get_current_user
from app.ai.offline_engine import OfflineResearchEngine

router = APIRouter(prefix="/projects/{project_id}/comparison", tags=["Comparison"])

@router.get("", response_model=PaperComparisonResponse)
def get_comparison_matrix(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    papers = db.query(Paper).filter(Paper.project_id == project_id).all()
    if not papers:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No papers uploaded in this project.")

    papers_data = []
    for p in papers:
        papers_data.append({
            "id": p.id,
            "title": p.title,
            "authors": p.authors,
            "publication_year": p.publication_year,
            "venue": p.venue,
            "analysis": {
                "research_problem": p.analysis.research_problem if p.analysis else "",
                "research_objective": p.analysis.research_objective if p.analysis else "",
                "methodology": p.analysis.methodology if p.analysis else "",
                "dataset": p.analysis.dataset if p.analysis else "",
                "algorithms": p.analysis.algorithms if p.analysis else [],
                "results": p.analysis.results if p.analysis else "",
                "limitations": p.analysis.limitations if p.analysis else [],
                "future_work": p.analysis.future_work if p.analysis else []
            }
        })

    comp_res = OfflineResearchEngine.compare_papers(papers_data)

    return {
        "project_id": project_id,
        "papers": papers,
        "dimensions": comp_res["dimensions"],
        "matrix": comp_res["matrix"],
        "common_limitations": comp_res["common_limitations"],
        "detected_contradictions": comp_res["detected_contradictions"],
        "detected_trade_offs": comp_res["detected_trade_offs"]
    }
