import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SearchCode,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  Layers,
  Scale,
  Award,
  ExternalLink,
  ChevronRight,
  BarChart3,
  X
} from 'lucide-react';
import { apiClient } from '../api/client';
import { ResearchGap, Project } from '../types';
import { EvidenceDrawer } from '../components/common/EvidenceDrawer';

export const ResearchGapDiscoveryPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pId = parseInt(projectId || '0', 10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedGapForEvidence, setSelectedGapForEvidence] = useState<ResearchGap | null>(null);
  const [comparingGaps, setComparingGaps] = useState<[ResearchGap, ResearchGap] | null>(null);

  const { data: project } = useQuery<Project>({
    queryKey: ['project', pId],
    queryFn: () => apiClient.getProject(pId),
    enabled: !!pId,
  });

  const { data: gaps, isLoading } = useQuery<ResearchGap[]>({
    queryKey: ['gaps', pId],
    queryFn: () => apiClient.getGaps(pId),
    enabled: !!pId,
  });

  const selectGapMutation = useMutation({
    mutationFn: (gapId: number) => apiClient.selectGap(pId, gapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaps', pId] });
      queryClient.invalidateQueries({ queryKey: ['project', pId] });
    },
  });

  const generateSolutionMutation = useMutation({
    mutationFn: (gapId: number) => apiClient.generateSolution(pId, { gap_id: gapId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution', pId] });
      queryClient.invalidateQueries({ queryKey: ['project', pId] });
      navigate(`/projects/${pId}/solution`);
    },
  });

  if (isLoading || !gaps) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-900 border border-slate-800"></div>
          ))}
        </div>
      </div>
    );
  }

  const handleSelectAndGenerate = async (gapId: number) => {
    await selectGapMutation.mutateAsync(gapId);
    generateSolutionMutation.mutate(gapId);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium">
            <Link to={`/projects/${pId}`} className="hover:underline">
              {project?.name || `Project #${pId}`}
            </Link>
            <span>/</span>
            <span className="text-slate-300">Research Gap Discovery Engine</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Discovered Research Gaps & Transparent Ranking
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Cross-paper gaps ranked by evidence strength, multi-paper support, novelty, and feasibility.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {gaps.length >= 2 && (
            <button
              onClick={() => setComparingGaps([gaps[0], gaps[1]])}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Compare Top Gaps</span>
            </button>
          )}

          <Link
            to={`/projects/${pId}/graph`}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
          >
            <span>Interactive Graph</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Scoring Weights Transparency Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-slate-300">
          <BarChart3 className="h-4 w-4 text-indigo-400" />
          <span className="font-bold uppercase tracking-wider text-[11px]">
            Transparent Scoring Formula
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300">30% Evidence</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-sky-300">20% Cross-Paper</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-violet-300">20% Novelty</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-emerald-300">15% Impact</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">15% Feasibility</span>
        </div>
      </div>

      {/* Gaps List */}
      <div className="space-y-6">
        {gaps.map((gap) => {
          const isSelected = gap.is_selected;
          return (
            <div
              key={gap.id}
              className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md space-y-5 transition ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/20 shadow-indigo-500/10'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Rank, Score Badge, Selection */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-600 text-white">
                      Rank #{gap.rank}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {gap.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        gap.confidence_level === 'High'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800/40'
                          : 'bg-amber-950 text-amber-300 border-amber-800/40'
                      }`}
                    >
                      {gap.confidence_level} Confidence
                    </span>
                    {isSelected && (
                      <span className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                        Selected Primary Gap
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {gap.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      AI-Assisted Gap Score
                    </div>
                    <div className="text-2xl font-extrabold text-indigo-400 font-mono">
                      {gap.overall_score}/100
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Significance */}
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">{gap.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Why It Matters
                    </span>
                    <p className="text-xs text-slate-300">{gap.why_it_matters}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      Potential Impact
                    </span>
                    <p className="text-xs text-slate-300">{gap.potential_impact}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
                      Feasibility
                    </span>
                    <p className="text-xs text-slate-300">{gap.feasibility}</p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown Bar */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">
                  Transparent Score Breakdown
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Evidence (30%)</div>
                    <div className="font-bold text-indigo-400">{gap.evidence_strength_score}</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Cross-Paper (20%)</div>
                    <div className="font-bold text-sky-400">{gap.cross_paper_support_score}</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Novelty (20%)</div>
                    <div className="font-bold text-violet-400">{gap.novelty_score}</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Impact (15%)</div>
                    <div className="font-bold text-emerald-400">{gap.impact_score}</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Feasibility (15%)</div>
                    <div className="font-bold text-amber-400">{gap.feasibility_score}</div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
                <button
                  onClick={() => setSelectedGapForEvidence(gap)}
                  className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Inspect Grounded Evidence ({gap.evidence_items?.length || 0} citations)</span>
                </button>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {!isSelected && (
                    <button
                      onClick={() => selectGapMutation.mutate(gap.id)}
                      className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                    >
                      Bookmark Gap
                    </button>
                  )}
                  <button
                    onClick={() => handleSelectAndGenerate(gap.id)}
                    className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
                  >
                    <span>Formulate Research Solution</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side by Side Gap Comparison Modal */}
      {comparingGaps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Side-by-Side Research Gap Comparison</h3>
              </div>
              <button
                onClick={() => setComparingGaps(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[comparingGaps[0], comparingGaps[1]].map((g, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400">Rank #{g.rank}</span>
                    <span className="font-mono text-sm font-extrabold text-white">{g.overall_score}/100</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{g.title}</h4>
                  <p className="text-xs text-slate-300">{g.description}</p>
                  <div className="text-xs text-slate-400">
                    <strong>Impact:</strong> {g.potential_impact}
                  </div>
                  <div className="text-xs text-slate-400">
                    <strong>Feasibility:</strong> {g.feasibility}
                  </div>
                  <button
                    onClick={() => {
                      setComparingGaps(null);
                      handleSelectAndGenerate(g.id);
                    }}
                    className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Select This Gap
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grounded Evidence Drawer */}
      {selectedGapForEvidence && (
        <EvidenceDrawer
          isOpen={!!selectedGapForEvidence}
          onClose={() => setSelectedGapForEvidence(null)}
          title={selectedGapForEvidence.title}
          evidenceItems={selectedGapForEvidence.evidence_items || []}
        />
      )}
    </div>
  );
};
