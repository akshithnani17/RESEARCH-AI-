from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, Project, Paper, ResearchGap, Solution, MasterPrompt
from app.schemas.solution import SolutionResponse, GenerateSolutionRequest
from app.api.deps import get_current_user
from app.ai.offline_engine import OfflineResearchEngine

router = APIRouter(prefix="/projects/{project_id}/solution", tags=["Solutions"])

@router.get("", response_model=SolutionResponse)
def get_solution(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    solution = db.query(Solution).filter(Solution.project_id == project_id).first()
    if not solution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No solution generated yet. Select a research gap first.")
    
    return solution

@router.post("/generate", response_model=SolutionResponse)
def generate_or_regenerate_solution(
    project_id: int,
    req: GenerateSolutionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    target_gap_id = req.gap_id or project.selected_gap_id
    gap = db.query(ResearchGap).filter(ResearchGap.id == target_gap_id, ResearchGap.project_id == project_id).first()
    if not gap:
        gap = db.query(ResearchGap).filter(ResearchGap.project_id == project_id).order_by(ResearchGap.rank.asc()).first()
    
    if not gap:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No research gaps available to generate a solution.")

    # Select this gap
    all_gaps = db.query(ResearchGap).filter(ResearchGap.project_id == project_id).all()
    for g in all_gaps:
        g.is_selected = (g.id == gap.id)
    project.selected_gap_id = gap.id
    project.top_gap_score = gap.overall_score
    db.commit()

    papers = db.query(Paper).filter(Paper.project_id == project_id).all()
    papers_payload = [{
        "id": p.id,
        "title": p.title,
        "authors": p.authors,
        "publication_year": p.publication_year,
        "analysis": {
            "research_problem": p.analysis.research_problem if p.analysis else "",
            "methodology": p.analysis.methodology if p.analysis else "",
            "limitations": p.analysis.limitations if p.analysis else []
        }
    } for p in papers]

    gap_dict = {
        "title": gap.title,
        "description": gap.description,
        "why_it_matters": gap.why_it_matters,
        "potential_impact": gap.potential_impact,
        "feasibility": gap.feasibility,
        "overall_score": gap.overall_score,
        "confidence_level": gap.confidence_level,
        "trade_offs_summary": gap.trade_offs_summary,
        "evidence_items": [
            {
                "paper_title": ev.paper_title,
                "page_number": ev.page_number,
                "section_name": ev.section_name,
                "extracted_text": ev.extracted_text,
                "relationship_type": ev.relationship_type,
                "claim": ev.claim
            } for ev in gap.evidence_items
        ]
    }

    sol_data = OfflineResearchEngine.generate_solution(
        project_name=project.name,
        domain=req.focus_domain or project.domain,
        topic=project.topic,
        gap=gap_dict,
        papers_data=papers_payload
    )

    existing_solution = db.query(Solution).filter(Solution.project_id == project_id).first()
    if existing_solution:
        existing_solution.gap_id = gap.id
        existing_solution.title = sol_data["title"]
        existing_solution.problem_statement = sol_data["problem_statement"]
        existing_solution.research_gap_summary = sol_data["research_gap_summary"]
        existing_solution.proposed_solution = sol_data["proposed_solution"]
        existing_solution.architecture_overview = sol_data["architecture_overview"]
        existing_solution.architecture_nodes = sol_data["architecture_nodes"]
        existing_solution.architecture_edges = sol_data["architecture_edges"]
        existing_solution.algorithms = sol_data["algorithms"]
        existing_solution.dataset_recommendations = sol_data["dataset_recommendations"]
        existing_solution.tech_stack = sol_data["tech_stack"]
        existing_solution.implementation_phases = sol_data["implementation_phases"]
        existing_solution.evaluation_metrics = sol_data["evaluation_metrics"]
        existing_solution.expected_results = sol_data["expected_results"]
        existing_solution.research_methodology = sol_data["research_methodology"]
        existing_solution.risks_and_mitigations = sol_data["risks_and_mitigations"]
        existing_solution.future_work = sol_data["future_work"]
        solution_out = existing_solution
    else:
        solution_out = Solution(
            project_id=project.id,
            gap_id=gap.id,
            title=sol_data["title"],
            problem_statement=sol_data["problem_statement"],
            research_gap_summary=sol_data["research_gap_summary"],
            proposed_solution=sol_data["proposed_solution"],
            architecture_overview=sol_data["architecture_overview"],
            architecture_nodes=sol_data["architecture_nodes"],
            architecture_edges=sol_data["architecture_edges"],
            algorithms=sol_data["algorithms"],
            dataset_recommendations=sol_data["dataset_recommendations"],
            tech_stack=sol_data["tech_stack"],
            implementation_phases=sol_data["implementation_phases"],
            evaluation_metrics=sol_data["evaluation_metrics"],
            expected_results=sol_data["expected_results"],
            research_methodology=sol_data["research_methodology"],
            risks_and_mitigations=sol_data["risks_and_mitigations"],
            future_work=sol_data["future_work"]
        )
        db.add(solution_out)

    # Regenerate Master Prompt simultaneously
    db.query(MasterPrompt).filter(MasterPrompt.project_id == project_id).delete()
    project_dict = {
        "name": project.name,
        "domain": project.domain,
        "topic": project.topic,
        "research_question": project.research_question
    }
    master_prompt_str = OfflineResearchEngine.generate_master_prompt(
        project=project_dict,
        papers=papers_payload,
        gap=gap_dict,
        solution=sol_data
    )
    db_prompt = MasterPrompt(
        project_id=project.id,
        prompt_text=master_prompt_str,
        word_count=len(master_prompt_str.split()),
        char_count=len(master_prompt_str)
    )
    db.add(db_prompt)

    db.commit()
    db.refresh(solution_out)
    return solution_out
