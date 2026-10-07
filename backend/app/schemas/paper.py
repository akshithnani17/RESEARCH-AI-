from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class PaperEvidenceSnippet(BaseModel):
    claim: str
    section: str
    page: int
    text: str
    relationship: Optional[str] = "SUPPORTS"

class PaperAnalysisResponse(BaseModel):
    id: int
    paper_id: int
    research_problem: Optional[str] = None
    research_objective: Optional[str] = None
    methodology: Optional[str] = None
    dataset: Optional[str] = None
    algorithms: List[str] = []
    experimental_setup: Optional[str] = None
    results: Optional[str] = None
    evaluation_metrics: List[str] = []
    limitations: List[str] = []
    future_work: List[str] = []
    conclusion: Optional[str] = None
    evidence_snippets: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True

class PaperResponse(BaseModel):
    id: int
    project_id: int
    title: str
    original_filename: str
    file_size_bytes: int
    authors: List[str] = []
    publication_year: Optional[int] = None
    venue: Optional[str] = None
    abstract: Optional[str] = None
    keywords: List[str] = []
    page_count: int = 0
    processing_status: str
    error_message: Optional[str] = None
    created_at: datetime
    analysis: Optional[PaperAnalysisResponse] = None

    class Config:
        from_attributes = True

class ComparisonRow(BaseModel):
    dimension: str
    papers: Dict[int, str]  # paper_id -> summary string for this dimension

class PaperComparisonResponse(BaseModel):
    project_id: int
    papers: List[PaperResponse]
    dimensions: List[str]
    matrix: List[ComparisonRow]
    common_limitations: List[str]
    detected_contradictions: List[Dict[str, Any]]
    detected_trade_offs: List[Dict[str, Any]]
