import os
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.entities import (
    Project, Paper, PaperSection, PaperChunk, PaperAnalysis,
    ResearchGap, GapEvidence, Solution, MasterPrompt, Report
)
from app.pdf.extractor import PDFExtractor
from app.pdf.chunker import TextChunker
from app.ai.client import llm_client
from app.ai.offline_engine import OfflineResearchEngine
from app.core.config import settings

class PipelineService:
    @staticmethod
    def process_uploaded_paper(db: Session, paper: Paper) -> Paper:
        paper.processing_status = "EXTRACTING"
        db.commit()

        # Extract text and metadata from PDF
        extraction = PDFExtractor.extract(paper.file_path)
        
        if extraction.error and extraction.is_scanned:
            paper.processing_status = "FAILED"
            paper.error_message = extraction.error
            db.commit()
            return paper

        paper.title = extraction.title or paper.title
        paper.authors = extraction.authors
        paper.publication_year = extraction.publication_year
        paper.abstract = extraction.abstract
        paper.page_count = extraction.page_count
        paper.raw_text = extraction.raw_text
        paper.processing_status = "EXTRACTED"
        db.commit()

        # Store Sections
        for sec in extraction.sections:
            db_sec = PaperSection(
                paper_id=paper.id,
                section_title=sec["section_title"],
                section_type=sec["section_type"],
                content=sec["content"],
                start_page=sec["start_page"],
                end_page=sec["end_page"]
            )
            db.add(db_sec)
        
        # Store Chunks
        chunks = TextChunker.chunk_paper(extraction.pages, extraction.sections)
        for chk in chunks:
            db_chk = PaperChunk(
                paper_id=paper.id,
                chunk_index=chk["chunk_index"],
                content=chk["content"],
                section_name=chk["section_name"],
                page_number=chk["page_number"]
            )
            db.add(db_chk)
        
        db.commit()

        # Generate Paper Analysis Card
        paper.processing_status = "ANALYZING"
        db.commit()

        analysis_data = llm_client.analyze_paper(
            title=paper.title,
            authors=paper.authors,
            year=paper.publication_year,
            abstract=paper.abstract or "",
            raw_text=paper.raw_text or "",
            sections=extraction.sections,
            pages=extraction.pages
        )

        db_analysis = PaperAnalysis(
            paper_id=paper.id,
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
        db.add(db_analysis)
        paper.processing_status = "ANALYZED"
        db.commit()
        db.refresh(paper)
        return paper

    @staticmethod
    def run_full_project_pipeline(db: Session, project_id: int) -> Project:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found.")

        papers = db.query(Paper).filter(Paper.project_id == project_id).all()
        if len(papers) < settings.MIN_PAPERS_REQUIRED and not project.is_demo:
            raise ValueError(f"At least {settings.MIN_PAPERS_REQUIRED} papers are required for cross-paper analysis.")

        try:
            # 1. ANALYZING PAPERS
            project.status = "ANALYZING"
            project.status_message = "Analyzing individual research papers and extracting methodology..."
            project.progress_percentage = 20
            db.commit()

            papers_payload = []
            for p in papers:
                if p.processing_status != "ANALYZED" or not p.analysis:
                    PipelineService.process_uploaded_paper(db, p)
                
                papers_payload.append({
                    "id": p.id,
                    "title": p.title,
                    "authors": p.authors,
                    "publication_year": p.publication_year,
                    "abstract": p.abstract,
                    "analysis": {
                        "research_problem": p.analysis.research_problem if p.analysis else "",
                        "research_objective": p.analysis.research_objective if p.analysis else "",
                        "methodology": p.analysis.methodology if p.analysis else "",
                        "dataset": p.analysis.dataset if p.analysis else "",
                        "algorithms": p.analysis.algorithms if p.analysis else [],
                        "results": p.analysis.results if p.analysis else "",
                        "evaluation_metrics": p.analysis.evaluation_metrics if p.analysis else [],
                        "limitations": p.analysis.limitations if p.analysis else [],
                        "future_work": p.analysis.future_work if p.analysis else []
                    }
                })

            # 2. COMPARING PAPERS
            project.status = "COMPARING"
            project.status_message = "Building cross-paper comparison matrix and detecting trade-offs..."
            project.progress_percentage = 40
            db.commit()

            # 3. DISCOVERING GAPS
            project.status = "DISCOVERING_GAPS"
            project.status_message = "Synthesizing cross-paper limitations and formulating research gap candidates..."
            project.progress_percentage = 60
            db.commit()

            # Clear old gaps if any
            db.query(ResearchGap).filter(ResearchGap.project_id == project_id).delete()
            db.commit()

            discovered_gaps = llm_client.discover_gaps(
                project_topic=project.topic,
                domain=project.domain,
                papers_data=papers_payload
            )

            created_gaps = []
            for g in discovered_gaps:
                gap_obj = ResearchGap(
                    project_id=project.id,
                    rank=g.get("rank", 1),
                    title=g.get("title", "Research Gap"),
                    category=g.get("category", "MISSING_CAPABILITY"),
                    description=g.get("description", ""),
                    why_it_matters=g.get("why_it_matters", ""),
                    potential_impact=g.get("potential_impact", ""),
                    feasibility=g.get("feasibility", ""),
                    overall_score=g.get("overall_score", 85.0),
                    evidence_strength_score=g.get("evidence_strength_score", 85.0),
                    cross_paper_support_score=g.get("cross_paper_support_score", 85.0),
                    novelty_score=g.get("novelty_score", 85.0),
                    impact_score=g.get("impact_score", 85.0),
                    feasibility_score=g.get("feasibility_score", 85.0),
                    confidence_level=g.get("confidence_level", "High"),
                    supporting_paper_ids=g.get("supporting_paper_ids", []),
                    contradictions_summary=g.get("contradictions_summary"),
                    trade_offs_summary=g.get("trade_offs_summary")
                )
                db.add(gap_obj)
                db.flush()

                # Add evidence items
                for ev in g.get("evidence_items", []):
                    ev_obj = GapEvidence(
                        gap_id=gap_obj.id,
                        paper_id=ev.get("paper_id", papers[0].id),
                        claim=ev.get("claim", "Evidence claim"),
                        paper_title=ev.get("paper_title", papers[0].title),
                        section_name=ev.get("section_name", "Core Section"),
                        page_number=ev.get("page_number", 1),
                        extracted_text=ev.get("extracted_text", "Extracted evidence quote."),
                        relationship_type=ev.get("relationship_type", "SUPPORTS")
                    )
                    db.add(ev_obj)
                
                created_gaps.append(gap_obj)
            
            db.commit()

            # 4. RANKING GAPS & SELECTING STRONGEST GAP
            project.status = "RANKING_GAPS"
            project.status_message = "Ranking candidate research gaps with transparent multi-factor weighting..."
            project.progress_percentage = 80
            db.commit()

            top_gap = created_gaps[0] if created_gaps else None
            if top_gap:
                top_gap.is_selected = True
                project.selected_gap_id = top_gap.id
                project.top_gap_score = top_gap.overall_score
            
            # Health Score & Evidence Coverage calculation
            evidence_count = sum(len(g.evidence_items) for g in created_gaps)
            total_papers = len(papers)
            coverage = min(100.0, round((evidence_count / max(total_papers * 2, 1)) * 100, 1))
            health = min(100.0, round((0.4 * project.top_gap_score) + (0.3 * coverage) + (0.3 * min(total_papers * 20, 100)), 1))
            
            project.evidence_coverage = coverage
            project.health_score = health

            # 5. GENERATE PROPOSED SOLUTION
            project.status = "GENERATING_SOLUTION"
            project.status_message = "Formulating system architecture, algorithms, and implementation roadmap..."
            project.progress_percentage = 90
            db.commit()

            if top_gap:
                # Clear existing solution
                db.query(Solution).filter(Solution.project_id == project_id).delete()
                db.commit()

                top_gap_dict = {
                    "title": top_gap.title,
                    "description": top_gap.description,
                    "why_it_matters": top_gap.why_it_matters,
                    "potential_impact": top_gap.potential_impact,
                    "feasibility": top_gap.feasibility,
                    "overall_score": top_gap.overall_score,
                    "confidence_level": top_gap.confidence_level,
                    "trade_offs_summary": top_gap.trade_offs_summary,
                    "evidence_items": [
                        {
                            "paper_title": ev.paper_title,
                            "page_number": ev.page_number,
                            "section_name": ev.section_name,
                            "extracted_text": ev.extracted_text,
                            "relationship_type": ev.relationship_type,
                            "claim": ev.claim
                        } for ev in top_gap.evidence_items
                    ]
                }

                solution_data = OfflineResearchEngine.generate_solution(
                    project_name=project.name,
                    domain=project.domain,
                    topic=project.topic,
                    gap=top_gap_dict,
                    papers_data=papers_payload
                )

                db_solution = Solution(
                    project_id=project.id,
                    gap_id=top_gap.id,
                    title=solution_data["title"],
                    problem_statement=solution_data["problem_statement"],
                    research_gap_summary=solution_data["research_gap_summary"],
                    proposed_solution=solution_data["proposed_solution"],
                    architecture_overview=solution_data["architecture_overview"],
                    architecture_nodes=solution_data["architecture_nodes"],
                    architecture_edges=solution_data["architecture_edges"],
                    algorithms=solution_data["algorithms"],
                    dataset_recommendations=solution_data["dataset_recommendations"],
                    tech_stack=solution_data["tech_stack"],
                    implementation_phases=solution_data["implementation_phases"],
                    evaluation_metrics=solution_data["evaluation_metrics"],
                    expected_results=solution_data["expected_results"],
                    research_methodology=solution_data["research_methodology"],
                    risks_and_mitigations=solution_data["risks_and_mitigations"],
                    future_work=solution_data["future_work"]
                )
                db.add(db_solution)
                db.commit()

                # 6. GENERATE UNIVERSAL MASTER PROMPT
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
                    gap=top_gap_dict,
                    solution=solution_data
                )

                db_prompt = MasterPrompt(
                    project_id=project.id,
                    prompt_text=master_prompt_str,
                    word_count=len(master_prompt_str.split()),
                    char_count=len(master_prompt_str)
                )
                db.add(db_prompt)
                db.commit()

            # 7. COMPLETED
            project.status = "COMPLETED"
            project.status_message = "Cross-paper analysis and research gap discovery completed successfully."
            project.progress_percentage = 100
            db.commit()
            db.refresh(project)
            return project

        except Exception as e:
            db.rollback()
            project.status = "FAILED"
            project.status_message = f"Analysis failed: {str(e)}"
            db.commit()
            raise e
