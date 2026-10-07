export interface User {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  domain: string;
  topic: string;
  description?: string;
  research_question?: string;
  status: 'CREATED' | 'UPLOADING' | 'PROCESSING' | 'EXTRACTING' | 'ANALYZING' | 'COMPARING' | 'DISCOVERING_GAPS' | 'RANKING_GAPS' | 'GENERATING_SOLUTION' | 'COMPLETED' | 'FAILED';
  status_message?: string;
  progress_percentage: number;
  health_score: number;
  evidence_coverage: number;
  top_gap_score: number;
  selected_gap_id?: number;
  is_demo: boolean;
  paper_count: number;
  gap_count: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_projects: number;
  papers_analyzed: number;
  research_gaps_found: number;
  solutions_generated: number;
  recent_projects: Project[];
}

export interface EvidenceSnippet {
  claim: string;
  section: string;
  page: number;
  text: string;
  relationship?: string;
}

export interface PaperAnalysis {
  id: number;
  paper_id: number;
  research_problem?: string;
  research_objective?: string;
  methodology?: string;
  dataset?: string;
  algorithms: string[];
  experimental_setup?: string;
  results?: string;
  evaluation_metrics: string[];
  limitations: string[];
  future_work: string[];
  conclusion?: string;
  evidence_snippets: EvidenceSnippet[];
}

export interface Paper {
  id: number;
  project_id: number;
  title: string;
  original_filename: string;
  file_size_bytes: number;
  authors: string[];
  publication_year?: number;
  venue?: string;
  abstract?: string;
  keywords: string[];
  page_count: number;
  processing_status: 'UPLOADED' | 'EXTRACTING' | 'EXTRACTED' | 'ANALYZING' | 'ANALYZED' | 'FAILED';
  error_message?: string;
  created_at: string;
  analysis?: PaperAnalysis;
}

export interface ComparisonRow {
  dimension: string;
  papers: Record<number, string>;
}

export interface Contradiction {
  topic: string;
  description: string;
  affected_papers: string[];
}

export interface TradeOff {
  trade_off_type: string;
  description: string;
  observed_in: string[];
}

export interface PaperComparisonResponse {
  project_id: number;
  papers: Paper[];
  dimensions: string[];
  matrix: ComparisonRow[];
  common_limitations: string[];
  detected_contradictions: Contradiction[];
  detected_trade_offs: TradeOff[];
}

export interface GapEvidence {
  id: number;
  gap_id: number;
  paper_id: number;
  claim: string;
  paper_title: string;
  section_name?: string;
  page_number: number;
  extracted_text: string;
  relationship_type: string;
}

export interface ResearchGap {
  id: number;
  project_id: number;
  rank: number;
  title: string;
  category: string;
  description: string;
  why_it_matters: string;
  potential_impact: string;
  feasibility: string;
  overall_score: number;
  evidence_strength_score: number;
  cross_paper_support_score: number;
  novelty_score: number;
  impact_score: number;
  feasibility_score: number;
  confidence_level: 'High' | 'Medium' | 'Exploratory';
  is_selected: boolean;
  supporting_paper_ids: number[];
  contradictions_summary?: string;
  trade_offs_summary?: string;
  created_at: string;
  evidence_items: GapEvidence[];
}

export interface AlgorithmSpec {
  name: string;
  description: string;
  justification: string;
  complexity: string;
  alternative: string;
}

export interface DatasetSpec {
  name: string;
  description: string;
  source_url_type: string;
  size: string;
  license: string;
}

export interface ImplementationChecklistItem {
  task: string;
  done: boolean;
}

export interface ImplementationPhase {
  phase_number: number;
  title: string;
  duration: string;
  tasks: string[];
  technologies: string[];
  deliverables: string[];
  completion_checklist?: ImplementationChecklistItem[];
}

export interface EvaluationMetric {
  metric_name: string;
  type: string;
  formula_description: string;
  target_threshold: string;
  rationale: string;
}

export interface RiskMitigation {
  risk: string;
  impact: string;
  mitigation: string;
}

export interface Solution {
  id: number;
  project_id: number;
  gap_id?: number;
  title: string;
  problem_statement: string;
  research_gap_summary: string;
  proposed_solution: string;
  architecture_overview: string;
  architecture_nodes: any[];
  architecture_edges: any[];
  algorithms: AlgorithmSpec[];
  dataset_recommendations: DatasetSpec[];
  tech_stack: {
    frontend: string[];
    backend: string[];
    ai_ml: string[];
    database: string[];
    infrastructure: string[];
  };
  implementation_phases: ImplementationPhase[];
  evaluation_metrics: EvaluationMetric[];
  expected_results: string;
  research_methodology: string;
  risks_and_mitigations: RiskMitigation[];
  future_work: string[];
  created_at: string;
  updated_at: string;
}

export interface MasterPrompt {
  id: number;
  project_id: number;
  prompt_text: string;
  word_count: number;
  char_count: number;
  created_at: string;
}
