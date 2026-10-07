from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, Project, Paper, ResearchGap, Solution, PaperAnalysis
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, DashboardStats
from app.api.deps import get_current_user
from app.services.demo_dataset_service import DemoDatasetService
from app.services.pipeline_service import PipelineService

router = APIRouter(prefix="/projects", tags=["Projects"])

def project_to_response(p: Project, db: Session) -> dict:
    paper_count = db.query(Paper).filter(Paper.project_id == p.id).count()
    gap_count = db.query(ResearchGap).filter(ResearchGap.project_id == p.id).count()
    
    return {
        "id": p.id,
        "user_id": p.user_id,
        "name": p.name,
        "domain": p.domain,
        "topic": p.topic,
        "description": p.description,
        "research_question": p.research_question,
        "status": p.status,
        "status_message": p.status_message,
        "progress_percentage": p.progress_percentage,
        "health_score": p.health_score,
        "evidence_coverage": p.evidence_coverage,
        "top_gap_score": p.top_gap_score,
        "selected_gap_id": p.selected_gap_id,
        "is_demo": p.is_demo,
        "paper_count": paper_count,
        "gap_count": gap_count,
        "created_at": p.created_at,
        "updated_at": p.updated_at
    }

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.updated_at.desc()).all()
    return [project_to_response(p, db) for p in projects]

@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    total_projects = len(user_projects)
    project_ids = [p.id for p in user_projects]
    
    papers_analyzed = db.query(Paper).filter(Paper.project_id.in_(project_ids)).count() if project_ids else 0
    research_gaps_found = db.query(ResearchGap).filter(ResearchGap.project_id.in_(project_ids)).count() if project_ids else 0
    solutions_generated = db.query(Solution).filter(Solution.project_id.in_(project_ids)).count() if project_ids else 0
    
    recent_projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.updated_at.desc()).limit(6).all()
    
    return {
        "total_projects": total_projects,
        "papers_analyzed": papers_analyzed,
        "research_gaps_found": research_gaps_found,
        "solutions_generated": solutions_generated,
        "recent_projects": [project_to_response(p, db) for p in recent_projects]
    }

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    req: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_proj = Project(
        user_id=current_user.id,
        name=req.name.strip(),
        domain=req.domain.strip(),
        topic=req.topic.strip(),
        description=req.description.strip() if req.description else None,
        research_question=req.research_question.strip() if req.research_question else None,
        status="CREATED",
        status_message="Project created. Upload 5+ research papers to begin analysis.",
        progress_percentage=0
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)
    return project_to_response(new_proj, db)

@router.post("/load-demo", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def load_demo_project(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    demo_data = DemoDatasetService.get_demo_project_payload()
    
    new_proj = Project(
        user_id=current_user.id,
        name=demo_data["name"],
        domain=demo_data["domain"],
        topic=demo_data["topic"],
        description=demo_data["description"],
        research_question=demo_data["research_question"],
        status="PROCESSING",
        status_message="Loading preloaded benchmark research papers...",
        progress_percentage=10,
        is_demo=True
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)

    # Add demo papers
    for p_info in demo_data["papers"]:
        p_obj = Paper(
            project_id=new_proj.id,
            title=p_info["title"],
            original_filename=p_info["original_filename"],
            file_path="demo://" + p_info["original_filename"],
            file_size_bytes=1024 * 1024 * 2,
            authors=p_info["authors"],
            publication_year=p_info["publication_year"],
            venue=p_info["venue"],
            abstract=p_info["abstract"],
            page_count=p_info["page_count"],
            raw_text=p_info["raw_text"],
            processing_status="ANALYZED"
        )
        db.add(p_obj)
        db.flush()

        analysis_data = p_info["analysis"]
        analysis_obj = PaperAnalysis(
            paper_id=p_obj.id,
            research_problem=analysis_data.get("research_problem"),
            research_objective=analysis_data.get("research_objective"),
            methodology=analysis_data.get("methodology"),
            dataset=analysis_data.get("dataset"),
            algorithms=analysis_data.get("algorithms", []),
            experimental_setup=analysis_data.get("experimental_setup"),
            results=analysis_data.get("results"),
            evaluation_metrics=analysis_data.get("evaluation_metrics", []),
            limitations=analysis_data.get("limitations", []),
            future_work=analysis_data.get("future_work", []),
            conclusion=analysis_data.get("conclusion"),
            evidence_snippets=analysis_data.get("evidence_snippets", [])
        )
        db.add(analysis_obj)

    db.commit()

    # Trigger full pipeline for demo
    PipelineService.run_full_project_pipeline(db, new_proj.id)
    db.refresh(new_proj)
    return project_to_response(new_proj, db)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    return project_to_response(project, db)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    req: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    
    if req.name is not None:
        project.name = req.name.strip()
    if req.domain is not None:
        project.domain = req.domain.strip()
    if req.topic is not None:
        project.topic = req.topic.strip()
    if req.description is not None:
        project.description = req.description.strip()
    if req.research_question is not None:
        project.research_question = req.research_question.strip()

    db.commit()
    db.refresh(project)
    return project_to_response(project, db)

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    
    db.delete(project)
    db.commit()
    return {"message": f"Project #{project_id} deleted successfully."}
