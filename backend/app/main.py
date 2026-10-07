import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router
from app.api.papers import router as papers_router
from app.api.analysis import router as analysis_router
from app.api.comparison import router as comparison_router
from app.api.gaps import router as gaps_router
from app.api.solutions import router as solutions_router
from app.api.prompts import router as prompts_router
from app.api.reports import router as reports_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Evidence-Grounded Research Gap Discovery and Solution Recommendation Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler (Requirement #33)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_message = str(exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred during research processing. Please review input files or system logs.",
            "error_type": exc.__class__.__name__,
            "message": error_message
        }
    )

# Include Routers under API_V1_STR (/api)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(papers_router, prefix=settings.API_V1_STR)
app.include_router(analysis_router, prefix=settings.API_V1_STR)
app.include_router(comparison_router, prefix=settings.API_V1_STR)
app.include_router(gaps_router, prefix=settings.API_V1_STR)
app.include_router(solutions_router, prefix=settings.API_V1_STR)
app.include_router(prompts_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "2.0.0",
        "llm_provider": settings.LLM_PROVIDER,
        "min_papers_required": settings.MIN_PAPERS_REQUIRED
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
