from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, Project, Paper, ResearchGap, GapEvidence, Solution
from app.schemas.gap import ResearchGapResponse, GapDiscoveryResponse, ResearchGraphResponse
from app.api.deps import get_current_user
from app.services.pipeline_service import PipelineService

router = APIRouter(prefix="/projects/{project_id}/gaps", tags=["Research Gaps"])

@router.get("", response_model=List[ResearchGapResponse])
def list_gaps(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    gaps = db.query(ResearchGap).filter(ResearchGap.project_id == project_id).order_by(ResearchGap.rank.asc()).all()
    return gaps

@router.post("/discover", response_model=GapDiscoveryResponse)
def trigger_gap_discovery(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    updated_project = PipelineService.run_full_project_pipeline(db, project_id)
    gaps = db.query(ResearchGap).filter(ResearchGap.project_id == project_id).order_by(ResearchGap.rank.asc()).all()
    
    return {
        "project_id": project_id,
        "gaps": gaps,
        "health_score": updated_project.health_score,
        "evidence_coverage": updated_project.evidence_coverage
    }

@router.post("/{gap_id}/select", response_model=ResearchGapResponse)
def select_gap(
    project_id: int,
    gap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    all_gaps = db.query(ResearchGap).filter(ResearchGap.project_id == project_id).all()
    selected = None
    for g in all_gaps:
        if g.id == gap_id:
            g.is_selected = True
            selected = g
            project.selected_gap_id = g.id
            project.top_gap_score = g.overall_score
        else:
            g.is_selected = False

    if not selected:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research Gap not found.")

    db.commit()
    db.refresh(selected)
    return selected

@router.get("/graph", response_model=ResearchGraphResponse)
def get_research_graph(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    papers = db.query(Paper).filter(Paper.project_id == project_id).all()
    gaps = db.query(ResearchGap).filter(ResearchGap.project_id == project_id).all()
    solution = db.query(Solution).filter(Solution.project_id == project_id).first()

    nodes = []
    edges = []

    # Paper nodes (Left column)
    y_offset = 50
    for idx, p in enumerate(papers):
        p_node_id = f"paper-{p.id}"
        nodes.append({
            "id": p_node_id,
            "type": "default",
            "data": {
                "label": f"Paper #{idx+1}: {p.title[:35]}...",
                "category": "Literature Baseline",
                "year": p.publication_year,
                "authors": p.authors[:2] if p.authors else []
            },
            "position": {"x": 50, "y": y_offset + (idx * 110)}
        })

    # Gap nodes (Center column)
    for idx, g in enumerate(gaps):
        g_node_id = f"gap-{g.id}"
        nodes.append({
            "id": g_node_id,
            "type": "default",
            "data": {
                "label": f"Gap #{g.rank}: {g.title[:35]}...",
                "category": f"Gap ({g.category})",
                "score": g.overall_score,
                "confidence": g.confidence_level,
                "selected": g.is_selected
            },
            "position": {"x": 420, "y": y_offset + (idx * 130)}
        })

        # Connect supporting papers to gap
        for p_id in (g.supporting_paper_ids or []):
            edges.append({
                "id": f"e-paper{p_id}-gap{g.id}",
                "source": f"paper-{p_id}",
                "target": g_node_id,
                "label": "Supports Gap",
                "relation": "SUPPORTS"
            })

    # Solution node (Right column)
    if solution:
        sol_node_id = f"sol-{solution.id}"
        nodes.append({
            "id": sol_node_id,
            "type": "output",
            "data": {
                "label": f"Proposed Solution: {solution.title[:35]}...",
                "category": "Recommended Solution",
                "tech_count": len(solution.tech_stack.get("ai_ml", [])) if solution.tech_stack else 0
            },
            "position": {"x": 800, "y": 200}
        })

        if solution.gap_id:
            edges.append({
                "id": f"e-gap{solution.gap_id}-sol{solution.id}",
                "source": f"gap-{solution.gap_id}",
                "target": sol_node_id,
                "label": "Resolves Gap",
                "relation": "RESOLVES",
                "animated": True
            })

    return {
        "nodes": nodes,
        "edges": edges
    }
