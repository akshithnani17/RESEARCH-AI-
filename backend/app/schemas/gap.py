from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class GapEvidenceResponse(BaseModel):
    id: int
    gap_id: int
    paper_id: int
    claim: str
    paper_title: str
    section_name: Optional[str] = None
    page_number: int = 1
    extracted_text: str
    relationship_type: str

    class Config:
        from_attributes = True

class ResearchGapResponse(BaseModel):
    id: int
    project_id: int
    rank: int
    title: str
    category: str
    description: str
    why_it_matters: str
    potential_impact: str
    feasibility: str
    overall_score: float
    evidence_strength_score: float
    cross_paper_support_score: float
    novelty_score: float
    impact_score: float
    feasibility_score: float
    confidence_level: str
    is_selected: bool
    supporting_paper_ids: List[int] = []
    contradictions_summary: Optional[str] = None
    trade_offs_summary: Optional[str] = None
    created_at: datetime
    evidence_items: List[GapEvidenceResponse] = []

    class Config:
        from_attributes = True

class GapDiscoveryResponse(BaseModel):
    project_id: int
    gaps: List[ResearchGapResponse]
    health_score: float
    evidence_coverage: float

class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    category: str
    data: Dict[str, Any]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relation: str

class ResearchGraphResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
