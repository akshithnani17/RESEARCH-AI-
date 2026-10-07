import os
import json
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.core.config import settings
from app.ai.prompts import (
    PAPER_ANALYSIS_SYSTEM_PROMPT,
    PAPER_ANALYSIS_USER_PROMPT,
    GAP_DISCOVERY_SYSTEM_PROMPT,
    GAP_DISCOVERY_USER_PROMPT
)
from app.ai.structured_parser import StructuredJSONParser
from app.ai.offline_engine import OfflineResearchEngine

class LLMClient:
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.base_url = settings.LLM_BASE_URL
        self.model = settings.LLM_MODEL
        self.provider = settings.LLM_PROVIDER
        
        self.client = None
        if self.api_key and self.provider == "openai_compatible":
            try:
                self.client = OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url
                )
            except Exception:
                self.client = None

    def analyze_paper(
        self,
        title: str,
        authors: List[str],
        year: Optional[int],
        abstract: str,
        raw_text: str,
        sections: List[Dict[str, Any]],
        pages: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyzes a paper. If LLM is configured and reachable, uses OpenAI API with schema validation.
        Otherwise, uses the grounded OfflineResearchEngine.
        """
        if self.client:
            try:
                prompt_content = raw_text[:14000] if len(raw_text) > 14000 else raw_text
                user_msg = PAPER_ANALYSIS_USER_PROMPT.format(
                    title=title,
                    authors=", ".join(authors) if authors else "Unknown",
                    year=str(year) if year else "Unknown",
                    content=prompt_content
                )
                
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": PAPER_ANALYSIS_SYSTEM_PROMPT},
                        {"role": "user", "content": user_msg}
                    ],
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
                
                raw_json = response.choices[0].message.content
                parsed = StructuredJSONParser.parse_json(raw_json)
                if parsed and "research_problem" in parsed:
                    return parsed
            except Exception:
                # Graceful fallback to offline engine
                pass

        return OfflineResearchEngine.analyze_paper(
            title=title,
            authors=authors,
            year=year,
            abstract=abstract,
            raw_text=raw_text,
            sections=sections,
            pages=pages
        )

    def discover_gaps(
        self,
        project_topic: str,
        domain: str,
        papers_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Cross-paper gap discovery across all uploaded papers.
        """
        if self.client:
            try:
                summaries = []
                for idx, p in enumerate(papers_data):
                    analysis = p.get("analysis", {})
                    summaries.append(
                        f"Paper [{idx+1}] '{p['title']}' (Year: {p.get('publication_year', 'N/A')})\n"
                        f"- Problem: {analysis.get('research_problem')}\n"
                        f"- Method: {analysis.get('methodology')}\n"
                        f"- Limitations: {'; '.join(analysis.get('limitations', []))}\n"
                        f"- Future Work: {'; '.join(analysis.get('future_work', []))}\n"
                    )
                papers_summary = "\n\n".join(summaries)
                
                user_msg = GAP_DISCOVERY_USER_PROMPT.format(
                    num_papers=len(papers_data),
                    papers_summary=papers_summary
                )

                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": GAP_DISCOVERY_SYSTEM_PROMPT},
                        {"role": "user", "content": user_msg}
                    ],
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )

                raw_json = response.choices[0].message.content
                parsed = StructuredJSONParser.parse_json(raw_json)
                if parsed and "research_gaps" in parsed and len(parsed["research_gaps"]) > 0:
                    # Enrich paper indices into actual paper IDs
                    gaps_out = []
                    for g in parsed["research_gaps"]:
                        supporting_ids = []
                        for idx_p in g.get("supporting_paper_indices", []):
                            if 0 <= idx_p < len(papers_data):
                                supporting_ids.append(papers_data[idx_p]["id"])
                        if not supporting_ids:
                            supporting_ids = [p["id"] for p in papers_data[:3]]

                        evidence_items = []
                        for ev in g.get("evidence_items", []):
                            p_idx = ev.get("paper_index", 0)
                            p_obj = papers_data[p_idx] if 0 <= p_idx < len(papers_data) else papers_data[0]
                            evidence_items.append({
                                "paper_id": p_obj["id"],
                                "paper_title": p_obj["title"],
                                "claim": ev.get("claim", "Evidence claim"),
                                "section_name": ev.get("section_name", "Core Section"),
                                "page_number": ev.get("page_number", 1),
                                "extracted_text": ev.get("extracted_text", "Extracted evidence text."),
                                "relationship_type": ev.get("relationship_type", "SUPPORTS")
                            })

                        g["supporting_paper_ids"] = supporting_ids
                        g["evidence_items"] = evidence_items
                        gaps_out.append(g)
                    return gaps_out
            except Exception:
                pass

        return OfflineResearchEngine.discover_gaps(
            project_topic=project_topic,
            domain=domain,
            papers_data=papers_data
        )

llm_client = LLMClient()
