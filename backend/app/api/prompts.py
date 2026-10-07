from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import User, Project, Paper, ResearchGap, Solution, MasterPrompt
from app.schemas.prompt import MasterPromptResponse, GeneratePromptRequest
from app.api.deps import get_current_user
from app.ai.offline_engine import OfflineResearchEngine

router = APIRouter(prefix="/projects/{project_id}/prompt", tags=["Master Prompt"])

@router.get("", response_model=MasterPromptResponse)
def get_master_prompt(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    prompt = db.query(MasterPrompt).filter(MasterPrompt.project_id == project_id).first()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Master prompt not generated yet. Generate solution first.")

    return prompt

@router.post("/generate", response_model=MasterPromptResponse)
def regenerate_master_prompt(
    project_id: int,
    req: GeneratePromptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    solution = db.query(Solution).filter(Solution.project_id == project_id).first()
    if not solution:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Generate a solution before generating the Master Prompt.")

    gap = db.query(ResearchGap).filter(ResearchGap.id == solution.gap_id).first()
    if not gap:
        gap = db.query(ResearchGap).filter(ResearchGap.project_id == project_id).first()

    papers = db.query(Paper).filter(Paper.project_id == project_id).all()
    papers_payload = [{
        "id": p.id,
        "title": p.title,
        "authors": p.authors,
        "publication_year": p.publication_year
    } for p in papers]

    gap_dict = {
        "title": gap.title if gap else "Research Gap",
        "category": gap.category if gap else "MISSING_CAPABILITY",
        "description": gap.description if gap else "",
        "why_it_matters": gap.why_it_matters if gap else "",
        "overall_score": gap.overall_score if gap else 85.0,
        "confidence_level": gap.confidence_level if gap else "High",
        "trade_offs_summary": gap.trade_offs_summary if gap else "",
        "evidence_items": [
            {
                "paper_title": ev.paper_title,
                "page_number": ev.page_number,
                "section_name": ev.section_name,
                "extracted_text": ev.extracted_text,
                "relationship_type": ev.relationship_type,
                "claim": ev.claim
            } for ev in (gap.evidence_items if gap else [])
        ]
    }

    sol_dict = {
        "problem_statement": solution.problem_statement,
        "proposed_solution": solution.proposed_solution,
        "architecture_overview": solution.architecture_overview,
        "architecture_nodes": solution.architecture_nodes,
        "algorithms": solution.algorithms,
        "dataset_recommendations": solution.dataset_recommendations,
        "tech_stack": solution.tech_stack,
        "implementation_phases": solution.implementation_phases,
        "evaluation_metrics": solution.evaluation_metrics,
        "expected_results": solution.expected_results,
        "research_methodology": solution.research_methodology,
        "risks_and_mitigations": solution.risks_and_mitigations,
        "future_work": solution.future_work
    }

    project_dict = {
        "name": project.name,
        "domain": project.domain,
        "topic": project.topic,
        "research_question": project.research_question
    }

    prompt_text = OfflineResearchEngine.generate_master_prompt(
        project=project_dict,
        papers=papers_payload,
        gap=gap_dict,
        solution=sol_dict
    )

    if req.custom_instructions:
        prompt_text += f"\n\n================================================================================\nADDITIONAL USER INSTRUCTIONS\n================================================================================\n{req.custom_instructions}\n"

    existing_prompt = db.query(MasterPrompt).filter(MasterPrompt.project_id == project_id).first()
    if existing_prompt:
        existing_prompt.prompt_text = prompt_text
        existing_prompt.word_count = len(prompt_text.split())
        existing_prompt.char_count = len(prompt_text)
        out_prompt = existing_prompt
    else:
        out_prompt = MasterPrompt(
            project_id=project.id,
            prompt_text=prompt_text,
            word_count=len(prompt_text.split()),
            char_count=len(prompt_text)
        )
        db.add(out_prompt)

    db.commit()
    db.refresh(out_prompt)
    return out_prompt
