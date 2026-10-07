from app.schemas.auth import SignUpRequest, LoginRequest, ForgotPasswordRequest, TokenResponse, UserResponse
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, DashboardStats
from app.schemas.paper import PaperResponse, PaperAnalysisResponse, PaperComparisonResponse, ComparisonRow, PaperEvidenceSnippet
from app.schemas.gap import ResearchGapResponse, GapEvidenceResponse, GapDiscoveryResponse, ResearchGraphResponse
from app.schemas.solution import SolutionResponse, GenerateSolutionRequest
from app.schemas.prompt import MasterPromptResponse, GeneratePromptRequest

__all__ = [
    "SignUpRequest",
    "LoginRequest",
    "ForgotPasswordRequest",
    "TokenResponse",
    "UserResponse",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "DashboardStats",
    "PaperResponse",
    "PaperAnalysisResponse",
    "PaperComparisonResponse",
    "ComparisonRow",
    "PaperEvidenceSnippet",
    "ResearchGapResponse",
    "GapEvidenceResponse",
    "GapDiscoveryResponse",
    "ResearchGraphResponse",
    "SolutionResponse",
    "GenerateSolutionRequest",
    "MasterPromptResponse",
    "GeneratePromptRequest"
]
