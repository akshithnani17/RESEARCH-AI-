import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GitCompare,
  Filter,
  ArrowRight,
  AlertTriangle,
  Scale,
  Search,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { apiClient } from '../api/client';
import { PaperComparisonResponse, Project } from '../types';

export const PaperComparisonPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pId = parseInt(projectId || '0', 10);
  const [selectedDimension, setSelectedDimension] = useState<string>('ALL');

  const { data: project } = useQuery<Project>({
    queryKey: ['project', pId],
    queryFn: () => apiClient.getProject(pId),
    enabled: !!pId,
  });

  const { data: compData, isLoading } = useQuery<PaperComparisonResponse>({
    queryKey: ['comparison', pId],
    queryFn: () => apiClient.getComparison(pId),
    enabled: !!pId,
  });

  if (isLoading || !compData) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800"></div>
        <div className="h-96 animate-pulse rounded-2xl bg-slate-900 border border-slate-800"></div>
      </div>
    );
  }

  const filteredMatrix =
    selectedDimension === 'ALL'
      ? compData.matrix
      : compData.matrix.filter((row) => row.dimension === selectedDimension);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium">
            <Link to={`/projects/${pId}`} className="hover:underline">
              {project?.name || `Project #${pId}`}
            </Link>
            <span>/</span>
            <span className="text-slate-300">Cross-Paper Comparison Matrix</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Cross-Paper Comparative Analysis
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Systematic matrix comparing {compData.papers.length} baseline papers across 8 core dimensions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/projects/${pId}/gaps`}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
          >
            <span>Discover Gaps</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Filter Dimension Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0 mr-1">
          Dimension:
        </span>
        <button
          onClick={() => setSelectedDimension('ALL')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition shrink-0 ${
            selectedDimension === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Dimensions ({compData.matrix.length})
        </button>
        {compData.dimensions.map((dim) => (
          <button
            key={dim}
            onClick={() => setSelectedDimension(dim)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition shrink-0 ${
              selectedDimension === dim
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {dim}
          </button>
        ))}
      </div>

      {/* Comparison Matrix Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="p-4 w-44 shrink-0 bg-slate-950">
                  Research Dimension
                </th>
                {compData.papers.map((p, idx) => (
                  <th key={p.id} scope="col" className="p-4 min-w-[240px] max-w-[320px]">
                    <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold mb-0.5">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Paper #{idx + 1}</span>
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">{p.title}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {p.publication_year ? `Year ${p.publication_year}` : 'Year N/A'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMatrix.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/30 transition">
                  <td className="p-4 font-bold text-slate-200 bg-slate-950/60 align-top border-r border-slate-800/80">
                    <span className="text-indigo-300">{row.dimension}</span>
                  </td>
                  {compData.papers.map((p) => (
                    <td key={p.id} className="p-4 align-top leading-relaxed text-slate-300">
                      {row.papers[p.id] || 'Not identified in the uploaded paper.'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contradictions & Trade-Offs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contradictions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-2 text-amber-400 mb-4 border-b border-slate-800 pb-3">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Detected Literature Contradictions
            </h3>
          </div>

          <div className="space-y-4">
            {compData.detected_contradictions.map((c, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4 space-y-2"
              >
                <div className="text-xs font-bold text-amber-300">{c.topic}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500">Affected literature:</span>{' '}
                  {c.affected_papers.join(' vs ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade-Offs */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-2 text-sky-400 mb-4 border-b border-slate-800 pb-3">
            <Scale className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Identified Empirical Trade-Offs
            </h3>
          </div>

          <div className="space-y-4">
            {compData.detected_trade_offs.map((t, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-sky-500/20 bg-sky-950/10 p-4 space-y-2"
              >
                <div className="text-xs font-bold text-sky-300">{t.trade_off_type}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500">Observed across:</span>{' '}
                  {t.observed_in.length} papers
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
