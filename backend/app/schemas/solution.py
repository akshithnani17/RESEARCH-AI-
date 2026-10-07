from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class SolutionResponse(BaseModel):
    id: int
    project_id: int
    gap_id: Optional[int] = None
    title: str
    problem_statement: str
    research_gap_summary: str
    proposed_solution: str
    architecture_overview: str
    architecture_nodes: List[Dict[str, Any]] = []
    architecture_edges: List[Dict[str, Any]] = []
    algorithms: List[Dict[str, Any]] = []
    dataset_recommendations: List[Dict[str, Any]] = []
    tech_stack: Dict[str, Any] = {}
    implementation_phases: List[Dict[str, Any]] = []
    evaluation_metrics: List[Dict[str, Any]] = []
    expected_results: str
    research_methodology: str
    risks_and_mitigations: List[Dict[str, Any]] = []
    future_work: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GenerateSolutionRequest(BaseModel):
    gap_id: Optional[int] = None
    focus_domain: Optional[str] = None
