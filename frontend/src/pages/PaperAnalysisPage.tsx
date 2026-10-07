import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Bookmark,
  Calendar,
  Users,
  Layers,
  Cpu,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Paper, Project } from '../types';
import { EvidenceDrawer } from '../components/common/EvidenceDrawer';

export const PaperAnalysisPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pId = parseInt(projectId || '0', 10);
  const [selectedPaperForEvidence, setSelectedPaperForEvidence] = useState<Paper | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: project } = useQuery<Project>({
    queryKey: ['project', pId],
    queryFn: () => apiClient.getProject(pId),
    enabled: !!pId,
  });

  const { data: papers, isLoading } = useQuery<Paper[]>({
    queryKey: ['papers', pId],
    queryFn: () => apiClient.getPapers(pId),
    enabled: !!pId,
  });

  const filteredPapers = papers?.filter((p) => {
    const title = p.title.toLowerCase();
    const authors = p.authors.join(' ').toLowerCase();
    const problem = p.analysis?.research_problem?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return title.includes(q) || authors.includes(q) || problem.includes(q);
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-900 border border-slate-800"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium">
            <Link to={`/projects/${pId}`} className="hover:underline">
              {project?.name || `Project #${pId}`}
            </Link>
            <span>/</span>
            <span className="text-slate-300">Paper Analysis Cards</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Systematic Literature Analysis
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Structured research extraction and grounded evidence cards across all {papers?.length || 0} baseline papers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/projects/${pId}/comparison`}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
          >
            <span>Cross-Paper Matrix</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter papers by title, author, or problem..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Cards List */}
      <div className="space-y-6">
        {filteredPapers?.map((paper, idx) => {
          const analysis = paper.analysis;
          return (
            <div
              key={paper.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-5"
            >
              {/* Paper Title and Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600/20 text-indigo-400 text-[11px] font-bold">
                      #{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {paper.original_filename}
                    </span>
                    {paper.publication_year && (
                      <span className="flex items-center text-[11px] text-slate-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {paper.publication_year}
                      </span>
                    )}
                    {paper.venue && (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {paper.venue}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {paper.title}
                  </h3>

                  {paper.authors && paper.authors.length > 0 && (
                    <div className="flex items-center text-xs text-slate-400 pt-0.5">
                      <Users className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                      <span>{paper.authors.join(', ')}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPaperForEvidence(paper)}
                  className="flex items-center space-x-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/60 hover:border-indigo-500/50 transition shrink-0"
                >
                  <Bookmark className="h-3.5 w-3.5 text-indigo-400" />
                  <span>View Evidence ({analysis?.evidence_snippets?.length || 0})</span>
                </button>
              </div>

              {/* Research Problem & Objective */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                    Research Problem
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysis?.research_problem || 'Not identified in the uploaded paper.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1">
                    Core Objective
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysis?.research_objective || 'Not identified in the uploaded paper.'}
                  </p>
                </div>
              </div>

              {/* Methodology & Datasets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Methodology & Pipeline
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysis?.methodology || 'Not identified in the uploaded paper.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Dataset & Benchmarks
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysis?.dataset || 'Not identified in the uploaded paper.'}
                  </p>
                </div>
              </div>

              {/* Algorithms & Metrics Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Algorithms & Core Models
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis?.algorithms && analysis.algorithms.length > 0 ? (
                      analysis.algorithms.map((algo, aIdx) => (
                        <span
                          key={aIdx}
                          className="rounded bg-indigo-950/80 text-indigo-300 px-2 py-0.5 text-[11px] font-medium border border-indigo-800/40"
                        >
                          {algo}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Not identified in the uploaded paper.</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Evaluation Metrics
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis?.evaluation_metrics && analysis.evaluation_metrics.length > 0 ? (
                      analysis.evaluation_metrics.map((m, mIdx) => (
                        <span
                          key={mIdx}
                          className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700"
                        >
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Not identified in the uploaded paper.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Limitations & Future Work */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
                <div>
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Reported Limitations</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis?.limitations && analysis.limitations.length > 0 ? (
                      analysis.limitations.map((lim, lIdx) => (
                        <li key={lIdx} className="flex items-start space-x-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>{lim}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">Not identified in the uploaded paper.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Proposed Future Work</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis?.future_work && analysis.future_work.length > 0 ? (
                      analysis.future_work.map((fw, fIdx) => (
                        <li key={fIdx} className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>{fw}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">Not identified in the uploaded paper.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evidence Drawer Modal */}
      {selectedPaperForEvidence && (
        <EvidenceDrawer
          isOpen={!!selectedPaperForEvidence}
          onClose={() => setSelectedPaperForEvidence(null)}
          title={selectedPaperForEvidence.title}
          evidenceItems={selectedPaperForEvidence.analysis?.evidence_snippets || []}
        />
      )}
    </div>
  );
};
