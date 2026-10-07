import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  GitCompare,
  SearchCode,
  Network,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Project, Paper } from '../types';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pId = parseInt(projectId || '0', 10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ['project', pId],
    queryFn: () => apiClient.getProject(pId),
    enabled: !!pId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.status !== 'COMPLETED' && data.status !== 'FAILED' && data.status !== 'CREATED') {
        return 3000;
      }
      return false;
    },
  });

  const { data: papers } = useQuery<Paper[]>({
    queryKey: ['papers', pId],
    queryFn: () => apiClient.getPapers(pId),
    enabled: !!pId,
  });

  const runAnalysisMutation = useMutation({
    mutationFn: () => apiClient.runAnalysis(pId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', pId] });
      queryClient.invalidateQueries({ queryKey: ['papers', pId] });
    },
  });

  if (projectLoading || !project) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800"></div>
        <div className="h-40 animate-pulse rounded-2xl bg-slate-900 border border-slate-800"></div>
      </div>
    );
  }

  const paperCount = papers?.length || project.paper_count || 0;
  const isCompleted = project.status === 'COMPLETED';
  const isProcessing =
    project.status === 'PROCESSING' ||
    project.status === 'ANALYZING' ||
    project.status === 'COMPARING' ||
    project.status === 'DISCOVERING_GAPS' ||
    project.status === 'RANKING_GAPS' ||
    project.status === 'GENERATING_SOLUTION';

  const pipelineSteps = [
    { key: 'CREATED', label: '1. Papers Uploaded' },
    { key: 'ANALYZING', label: '2. Paper Analysis' },
    { key: 'COMPARING', label: '3. Cross-Paper Matrix' },
    { key: 'DISCOVERING_GAPS', label: '4. Gap Discovery' },
    { key: 'RANKING_GAPS', label: '5. Gap Ranking' },
    { key: 'GENERATING_SOLUTION', label: '6. Solution & Prompt' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'CREATED':
      case 'UPLOADING':
        return 0;
      case 'EXTRACTING':
      case 'ANALYZING':
        return 1;
      case 'COMPARING':
        return 2;
      case 'DISCOVERING_GAPS':
        return 3;
      case 'RANKING_GAPS':
        return 4;
      case 'GENERATING_SOLUTION':
      case 'COMPLETED':
        return 5;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(project.status);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 mb-1">
            <span className="rounded bg-indigo-950 px-2 py-0.5 font-medium border border-indigo-800/40">
              {project.domain}
            </span>
            {project.is_demo && (
              <span className="rounded bg-amber-950 text-amber-300 px-2 py-0.5 font-mono text-[10px] border border-amber-800/40">
                Demo Benchmark Dataset
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {project.name}
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">
            {project.description || project.topic}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {paperCount < 5 ? (
            <Link
              to={`/projects/${pId}/upload`}
              className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Papers ({paperCount}/5)</span>
            </Link>
          ) : (
            <button
              onClick={() => runAnalysisMutation.mutate()}
              disabled={isProcessing || runAnalysisMutation.isPending}
              className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Literature...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Re-Run Discovery Pipeline</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Live Processing Stepper */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
              Pipeline Status
            </span>
            <div className="text-sm font-bold text-white mt-0.5">{project.status_message}</div>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Progress: <strong className="text-indigo-400">{project.progress_percentage}%</strong>
          </div>
        </div>

        {/* Multi-step indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {pipelineSteps.map((step, idx) => {
            const isPassed = isCompleted || idx < currentStepIdx;
            const isCurrent = !isCompleted && idx === currentStepIdx;
            return (
              <div
                key={step.key}
                className={`p-2.5 rounded-lg border text-center transition ${
                  isPassed
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                    : isCurrent
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 animate-pulse'
                    : 'border-slate-800 bg-slate-950/40 text-slate-500'
                }`}
              >
                <div className="text-[11px] font-semibold">{step.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Research Health & Score Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Research Health Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {project.health_score ? `${project.health_score}/100` : 'Pending'}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            AI-assisted quality index based on cross-paper support, depth of extracted limitations, and citation coverage.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Evidence Coverage</span>
            <BarChart2 className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-300 tracking-tight">
            {project.evidence_coverage ? `${project.evidence_coverage}%` : '0%'}
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full"
              style={{ width: `${project.evidence_coverage || 0}%` }}
            ></div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Ratio of verified paper citations grounding the discovered research claims.
          </p>
        </div>

        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5">
          <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
            <span>Top AI-Assisted Gap Score</span>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 tracking-tight">
            {project.top_gap_score ? `${project.top_gap_score}/100` : 'Pending'}
          </div>
          <p className="mt-2 text-[11px] text-slate-300">
            Weighted composite: 30% Evidence + 20% Cross-Paper + 20% Novelty + 15% Impact + 15% Feasibility.
          </p>
        </div>
      </div>

      {/* Navigation Cards to Workspaces */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Research Discovery Workspaces
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link
            to={`/projects/${pId}/analysis`}
            className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                Paper Analysis Cards
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Structured research cards extracting problem, methodology, dataset, results, limitations, and grounded quotes with page references.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-indigo-400">
              <span>View Paper Cards</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to={`/projects/${pId}/comparison`}
            className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600/10 text-sky-400 border border-sky-500/20 mb-3">
                <GitCompare className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
                Cross-Paper Comparison Matrix
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Comparative matrix across 8 academic dimensions with automated detection of contradictions and trade-offs.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-sky-400">
              <span>Open Comparison Matrix</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to={`/projects/${pId}/gaps`}
            className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 mb-3">
                <SearchCode className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                Research Gaps & Ranking
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Ranked candidate research gaps with transparent multi-factor weighting, side-by-side gap comparisons, and primary gap selection.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-emerald-400">
              <span>Explore Research Gaps</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to={`/projects/${pId}/graph`}
            className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/20 mb-3">
                <Network className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition">
                Interactive Research Graph
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Interactive React Flow graph linking papers, limitations, candidate gaps, and proposed solutions with node details inspector.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-violet-400">
              <span>Open Interactive Graph</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to={`/projects/${pId}/solution`}
            className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600/10 text-amber-400 border border-amber-500/20 mb-3">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                Solution Workspace & Roadmap
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Interactive architecture builder, algorithm choices with complexity, dataset requirements, and phased implementation checklists.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-amber-400">
              <span>Open Solution Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            to={`/projects/${pId}/prompt`}
            className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                Universal Master Prompt
              </h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Self-contained, production-grade universal master prompt ready to copy into ANY LLM to build the proposed research solution.
              </p>
            </div>
            <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-indigo-400">
              <span>Generate Master Prompt</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
