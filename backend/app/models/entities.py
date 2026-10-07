import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    research_question = Column(Text, nullable=True)
    
    # State tracking: CREATED, UPLOADING, PROCESSING, ANALYZING, COMPARING, DISCOVERING_GAPS, RANKING_GAPS, GENERATING_SOLUTION, COMPLETED, FAILED
    status = Column(String(50), default="CREATED", nullable=False)
    status_message = Column(String(255), default="Project created. Ready for paper uploads.")
    progress_percentage = Column(Integer, default=0)
    
    health_score = Column(Float, default=0.0)
    evidence_coverage = Column(Float, default=0.0)
    top_gap_score = Column(Float, default=0.0)
    selected_gap_id = Column(Integer, nullable=True)

    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="projects")
    papers = relationship("Paper", back_populates="project", cascade="all, delete-orphan")
    research_gaps = relationship("ResearchGap", back_populates="project", cascade="all, delete-orphan")
    solution = relationship("Solution", back_populates="project", uselist=False, cascade="all, delete-orphan")
    master_prompt = relationship("MasterPrompt", back_populates="project", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project", cascade="all, delete-orphan")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    
    authors = Column(JSON, default=list)  # List[str]
    publication_year = Column(Integer, nullable=True)
    venue = Column(String(255), nullable=True)
    abstract = Column(Text, nullable=True)
    keywords = Column(JSON, default=list)
    
    page_count = Column(Integer, default=0)
    raw_text = Column(Text, nullable=True)
    processing_status = Column(String(50), default="UPLOADED")  # UPLOADED, EXTRACTED, ANALYZED, FAILED
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="papers")
    sections = relationship("PaperSection", back_populates="paper", cascade="all, delete-orphan")
    chunks = relationship("PaperChunk", back_populates="paper", cascade="all, delete-orphan")
    analysis = relationship("PaperAnalysis", back_populates="paper", uselist=False, cascade="all, delete-orphan")


class PaperSection(Base):
    __tablename__ = "paper_sections"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True)
    section_title = Column(String(255), nullable=False)
    section_type = Column(String(100), nullable=False)  # abstract, intro, methodology, results, limitations, future_work, conclusion, etc.
    content = Column(Text, nullable=False)
    start_page = Column(Integer, default=1)
    end_page = Column(Integer, default=1)

    paper = relationship("Paper", back_populates="sections")


class PaperChunk(Base):
    __tablename__ = "paper_chunks"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    section_name = Column(String(255), nullable=True)
    page_number = Column(Integer, default=1)
    embedding_vector = Column(JSON, nullable=True)  # JSON representation of vector floats

    paper = relationship("Paper", back_populates="chunks")


class PaperAnalysis(Base):
    __tablename__ = "paper_analyses"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    research_problem = Column(Text, nullable=True)
    research_objective = Column(Text, nullable=True)
    methodology = Column(Text, nullable=True)
    dataset = Column(Text, nullable=True)
    algorithms = Column(JSON, default=list)
    experimental_setup = Column(Text, nullable=True)
    results = Column(Text, nullable=True)
    evaluation_metrics = Column(JSON, default=list)
    limitations = Column(JSON, default=list)  # List[str]
    future_work = Column(JSON, default=list)   # List[str]
    conclusion = Column(Text, nullable=True)
    
    # Key evidence citations extracted from text with pages
    evidence_snippets = Column(JSON, default=list)  # List[dict]: {"claim": str, "section": str, "page": int, "text": str}

    paper = relationship("Paper", back_populates="analysis")


class ResearchGap(Base):
    __tablename__ = "research_gaps"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    rank = Column(Integer, default=1)
    title = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False)  # MISSING_CAPABILITY, COMMON_LIMITATION, CONTRADICTION, TRADE_OFF, METHODOLOGICAL, DATASET, EVALUATION
    description = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    potential_impact = Column(Text, nullable=False)
    feasibility = Column(Text, nullable=False)
    
    # Detailed transparent AI-Assisted Gap Score Breakdown
    overall_score = Column(Float, nullable=False)  # 0 to 100
    evidence_strength_score = Column(Float, default=0.0)
    cross_paper_support_score = Column(Float, default=0.0)
    novelty_score = Column(Float, default=0.0)
    impact_score = Column(Float, default=0.0)
    feasibility_score = Column(Float, default=0.0)
    confidence_level = Column(String(50), default="Medium")  # High, Medium, Exploratory

    is_selected = Column(Boolean, default=False)
    supporting_paper_ids = Column(JSON, default=list)  # List[int]
    contradictions_summary = Column(Text, nullable=True)
    trade_offs_summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="research_gaps")
    evidence_items = relationship("GapEvidence", back_populates="gap", cascade="all, delete-orphan")


class GapEvidence(Base):
    __tablename__ = "gap_evidence"

    id = Column(Integer, primary_key=True, index=True)
    gap_id = Column(Integer, ForeignKey("research_gaps.id", ondelete="CASCADE"), nullable=False, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    claim = Column(Text, nullable=False)
    paper_title = Column(String(500), nullable=False)
    section_name = Column(String(255), nullable=True)
    page_number = Column(Integer, default=1)
    extracted_text = Column(Text, nullable=False)
    relationship_type = Column(String(50), default="SUPPORTS")  # SUPPORTS, CONTRADICTS, LIMITATION_OF, EXTENDS

    gap = relationship("ResearchGap", back_populates="evidence_items")


class Solution(Base):
    __tablename__ = "solutions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    gap_id = Column(Integer, ForeignKey("research_gaps.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(500), nullable=False)
    problem_statement = Column(Text, nullable=False)
    research_gap_summary = Column(Text, nullable=False)
    proposed_solution = Column(Text, nullable=False)
    
    # Deep structured solution components
    architecture_overview = Column(Text, nullable=False)
    architecture_nodes = Column(JSON, default=list)  # Nodes for React Flow
    architecture_edges = Column(JSON, default=list)  # Edges for React Flow
    
    algorithms = Column(JSON, default=list)  # List[dict]: {name, description, justification, complexity, alternative}
    dataset_recommendations = Column(JSON, default=list)  # List[dict]: {name, description, source_url_type, size, license}
    tech_stack = Column(JSON, default=dict)  # {frontend: [], backend: [], ai_ml: [], database: [], infra: []}
    
    implementation_phases = Column(JSON, default=list)  # List[dict]: {phase_number, title, duration, tasks: [], technologies: [], deliverables: []}
    evaluation_metrics = Column(JSON, default=list)  # List[dict]: {metric_name, type: "Planned", formula_description, target_threshold, rationale}
    expected_results = Column(Text, nullable=False)
    research_methodology = Column(Text, nullable=False)
    risks_and_mitigations = Column(JSON, default=list)  # List[dict]: {risk, impact, mitigation}
    future_work = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="solution")


class MasterPrompt(Base):
    __tablename__ = "master_prompts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    prompt_text = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    char_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="master_prompt")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), default="FULL")  # FULL, EXECUTIVE, GAP_ONLY, SOLUTION_ONLY
    markdown_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="reports")
