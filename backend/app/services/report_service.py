from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import Project, Paper, ResearchGap, Solution, MasterPrompt

class ReportService:
    @staticmethod
    def generate_markdown_report(db: Session, project_id: int) -> str:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return "# Project Not Found"

        papers = db.query(Paper).filter(Paper.project_id == project_id).all()
        gaps = db.query(ResearchGap).filter(ResearchGap.project_id == project_id).order_by(ResearchGap.rank.asc()).all()
        solution = db.query(Solution).filter(Solution.project_id == project_id).first()
        prompt = db.query(MasterPrompt).filter(MasterPrompt.project_id == project_id).first()

        md_sections = []

        # Header
        md_sections.append(f"# Academic Research Gap & Solution Report: {project.name}\n")
        md_sections.append(f"**Platform:** ResearchGap AI (Evidence-Grounded Discovery Engine)")
        md_sections.append(f"**Domain:** {project.domain} | **Topic:** {project.topic}")
        md_sections.append(f"**Status:** {project.status} | **Research Health Score:** {project.health_score}/100 | **Evidence Coverage:** {project.evidence_coverage}%\n")
        md_sections.append("---\n")

        # Executive Summary
        md_sections.append("## 1. Executive Summary\n")
        md_sections.append(
            f"This research report compiles a systematic cross-paper literature analysis across {len(papers)} peer-reviewed papers. "
            f"By analyzing methodologies, experimental baselines, and extracted limitations, the system identified {len(gaps)} evidence-backed candidate research gaps. "
            f"The primary gap was selected based on a transparent multi-factor weighting formula (AI-Assisted Gap Score: {project.top_gap_score}/100), leading to the formulation of a comprehensive research solution and implementation roadmap.\n"
        )

        # Core Research Problem
        md_sections.append("## 2. Research Context & Problem Statement\n")
        md_sections.append(f"**Research Topic:** {project.topic}")
        md_sections.append(f"**Core Research Question:** {project.research_question or 'Not specified'}")
        if project.description:
            md_sections.append(f"**Scope & Overview:** {project.description}\n")

        # Individual Paper Analyses
        md_sections.append("## 3. Systematic Literature Review & Paper Analyses\n")
        for idx, p in enumerate(papers):
            year_str = f" ({p.publication_year})" if p.publication_year else ""
            authors_str = ", ".join(p.authors) if p.authors else "Not identified"
            md_sections.append(f"### 3.{idx+1} Paper: {p.title}{year_str}")
            md_sections.append(f"- **Authors:** {authors_str}")
            md_sections.append(f"- **Venue / Year:** {p.venue or 'N/A'} | {p.publication_year or 'N/A'}")
            if p.abstract:
                md_sections.append(f"- **Abstract:** {p.abstract[:350]}...")
            if p.analysis:
                md_sections.append(f"- **Research Problem:** {p.analysis.research_problem}")
                md_sections.append(f"- **Methodology:** {p.analysis.methodology}")
                md_sections.append(f"- **Dataset:** {p.analysis.dataset}")
                md_sections.append(f"- **Algorithms:** {', '.join(p.analysis.algorithms or [])}")
                md_sections.append(f"- **Key Results:** {p.analysis.results}")
                md_sections.append(f"- **Reported Limitations:**")
                for lim in p.analysis.limitations or []:
                    md_sections.append(f"  * {lim}")
                md_sections.append(f"- **Future Work:**")
                for fw in p.analysis.future_work or []:
                    md_sections.append(f"  * {fw}")
            md_sections.append("\n")

        # Cross-Paper Comparison Matrix
        md_sections.append("## 4. Cross-Paper Comparison & Trade-Off Matrix\n")
        md_sections.append("| Dimension | " + " | ".join([f"P{i+1}: {p.title[:20]}..." for i, p in enumerate(papers[:5])]) + " |")
        md_sections.append("| " + " | ".join(["---"] * (len(papers[:5]) + 1)) + " |")
        
        dimensions = ["Methodology", "Dataset", "Primary Results", "Main Limitation"]
        for dim in dimensions:
            row_items = [dim]
            for p in papers[:5]:
                if p.analysis:
                    if dim == "Methodology":
                        row_items.append((p.analysis.methodology or "")[:40] + "...")
                    elif dim == "Dataset":
                        row_items.append((p.analysis.dataset or "")[:40])
                    elif dim == "Primary Results":
                        row_items.append((p.analysis.results or "")[:40] + "...")
                    elif dim == "Main Limitation":
                        lims = p.analysis.limitations or []
                        row_items.append(lims[0][:40] + "..." if lims else "N/A")
                else:
                    row_items.append("Pending analysis")
            md_sections.append("| " + " | ".join(row_items) + " |")
        md_sections.append("\n")

        # Discovered Research Gaps
        md_sections.append("## 5. Discovered Research Gaps & Transparent Scoring\n")
        for g in gaps:
            sel_tag = " [SELECTED PRIMARY GAP]" if g.is_selected else ""
            md_sections.append(f"### Gap #{g.rank}: {g.title}{sel_tag}")
            md_sections.append(f"- **Category:** {g.category} | **Confidence:** {g.confidence_level}")
            md_sections.append(f"- **AI-Assisted Gap Score:** {g.overall_score}/100")
            md_sections.append(f"  * Evidence Strength (30%): {g.evidence_strength_score}/100")
            md_sections.append(f"  * Cross-Paper Support (20%): {g.cross_paper_support_score}/100")
            md_sections.append(f"  * Potential Novelty (20%): {g.novelty_score}/100")
            md_sections.append(f"  * Potential Impact (15%): {g.impact_score}/100")
            md_sections.append(f"  * Technical Feasibility (15%): {g.feasibility_score}/100")
            md_sections.append(f"- **Description:** {g.description}")
            md_sections.append(f"- **Why It Matters:** {g.why_it_matters}")
            md_sections.append(f"- **Potential Impact:** {g.potential_impact}")
            md_sections.append(f"- **Feasibility:** {g.feasibility}")
            if g.contradictions_summary:
                md_sections.append(f"- **Contradictions Identified:** {g.contradictions_summary}")
            if g.trade_offs_summary:
                md_sections.append(f"- **Trade-Offs Observed:** {g.trade_offs_summary}")
            
            # Grounded Evidence items
            if g.evidence_items:
                md_sections.append("- **Grounded Literature Evidence:**")
                for ev in g.evidence_items:
                    md_sections.append(f"  * [{ev.paper_title}, Page {ev.page_number}, Section: {ev.section_name or 'Core'}] \"{ev.extracted_text}\" ({ev.relationship_type})")
            md_sections.append("\n")

        # Proposed Solution & Implementation Roadmap
        if solution:
            md_sections.append("## 6. Proposed Research Solution Architecture\n")
            md_sections.append(f"### {solution.title}\n")
            md_sections.append(f"**Problem Statement:**\n{solution.problem_statement}\n")
            md_sections.append(f"**Proposed Approach:**\n{solution.proposed_solution}\n")
            md_sections.append(f"**Architecture Overview:**\n{solution.architecture_overview}\n")
            
            md_sections.append("### Recommended Algorithms & Computational Complexity\n")
            for a in solution.algorithms or []:
                md_sections.append(f"- **{a.get('name')}:** {a.get('description')}")
                md_sections.append(f"  * Justification: {a.get('justification')}")
                md_sections.append(f"  * Complexity: {a.get('complexity')} | Alternative: {a.get('alternative')}")
            md_sections.append("\n")

            md_sections.append("### Recommended Datasets & Benchmarks\n")
            for d in solution.dataset_recommendations or []:
                md_sections.append(f"- **{d.get('name')}:** {d.get('description')} (Size: {d.get('size')}, License: {d.get('license')})")
            md_sections.append("\n")

            md_sections.append("### Step-by-Step Phased Implementation Roadmap\n")
            for ph in solution.implementation_phases or []:
                md_sections.append(f"#### Phase {ph.get('phase_number')}: {ph.get('title')} ({ph.get('duration')})")
                md_sections.append("Tasks:")
                for t in ph.get('tasks', []):
                    md_sections.append(f"- [ ] {t}")
                md_sections.append(f"Technologies: {', '.join(ph.get('technologies', []))}")
                md_sections.append(f"Deliverables: {', '.join(ph.get('deliverables', []))}\n")

            md_sections.append("### Evaluation Plan & Planned Academic Metrics\n")
            md_sections.append("> Note: All metrics below represent planned evaluation protocols for benchmarking against baseline literature.\n")
            for m in solution.evaluation_metrics or []:
                md_sections.append(f"- **{m.get('metric_name')} [{m.get('type')}]:**")
                md_sections.append(f"  * Target Threshold: {m.get('target_threshold')}")
                md_sections.append(f"  * Formula / Protocol: {m.get('formula_description')}")
                md_sections.append(f"  * Rationale: {m.get('rationale')}")
            md_sections.append("\n")

            md_sections.append(f"### Research Methodology & Risk Mitigation\n")
            md_sections.append(f"{solution.research_methodology}\n")

        # Master Prompt Appendix
        if prompt:
            md_sections.append("## 7. Universal Master Prompt (For Any LLM)\n")
            md_sections.append("```text\n" + prompt.prompt_text + "\n```\n")

        return "\n".join(md_sections)
