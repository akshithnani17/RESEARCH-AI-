from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    domain: str = Field(..., min_length=2, max_length=255)
    topic: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    research_question: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    topic: Optional[str] = None
    description: Optional[str] = None
    research_question: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    user_id: int
    name: str
    domain: str
    topic: str
    description: Optional[str] = None
    research_question: Optional[str] = None
    status: str
    status_message: Optional[str] = None
    progress_percentage: int
    health_score: float
    evidence_coverage: float
    top_gap_score: float
    selected_gap_id: Optional[int] = None
    is_demo: bool
    paper_count: int = 0
    gap_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_projects: int
    papers_analyzed: int
    research_gaps_found: int
    solutions_generated: int
    recent_projects: List[ProjectResponse]
