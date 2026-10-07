import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderKanban,
  FileText,
  SearchCode,
  Cpu,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart2,
  Clock,
  ExternalLink,
  Layers,
  Database
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DashboardStats, Project } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: apiClient.getDashboardStats,
  });

  const loadDemoMutation = useMutation({
    mutationFn: apiClient.loadDemoProject,
    onSuccess: (newProj: Project) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${newProj.id}`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-900 border border-slate-800"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.total_projects || 0,
      icon: FolderKanban,
      color: 'text-indigo-400',
      bg: 'bg-indigo-600/10',
      border: 'border-indigo-500/20',
    },
    {
      title: 'Papers Analyzed',
      value: stats?.papers_analyzed || 0,
      icon: FileText,
      color: 'text-sky-400',
      bg: 'bg-sky-600/10',
      border: 'border-sky-500/20',
    },
    {
      title: 'Research Gaps Found',
      value: stats?.research_gaps_found || 0,
      icon: SearchCode,
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'Solutions Generated',
      value: stats?.solutions_generated || 0,
      icon: Cpu,
      color: 'text-violet-400',
      bg: 'bg-violet-600/10',
      border: 'border-violet-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Research Workspace</h1>
          <p className="mt-1 text-xs text-slate-400">
            Automated cross-paper gap synthesis, grounded citation extraction, and implementation blueprints.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadDemoMutation.mutate()}
            disabled={loadDemoMutation.isPending}
            className="flex items-center space-x-2 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/60 hover:border-indigo-500/50 transition disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>
              {loadDemoMutation.isPending ? 'Loading Benchmark...' : 'Load Demo Research Project'}
            </span>
          </button>

          <Link
            to="/projects/new"
            className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Project</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.title}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg} ${card.border} border`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-white tracking-tight">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Health & Coverage Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Academic Rigor & Grounding Rule
              </span>
            </div>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
              Enforced
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            All research gaps are validated against extracted paper sections. Fact is explicitly separated from AI inference and recommended proposals.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Domain Independence
              </span>
            </div>
            <span className="rounded bg-indigo-950 text-indigo-300 px-2 py-0.5 text-[10px] font-mono border border-indigo-800/40">
              Universal
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Supports AI, Machine Learning, Cybersecurity, Healthcare, NLP, Computer Vision, Robotics, and interdisciplinary literature.
          </p>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Recent Research Projects
          </h2>
          <Link
            to="/projects"
            className="flex items-center space-x-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {!stats?.recent_projects || stats.recent_projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-4">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Research Projects Yet</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Create your first research project and upload 5+ papers to begin automated gap discovery.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => loadDemoMutation.mutate()}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                Load Demo Dataset
              </button>
              <Link
                to="/projects/new"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
              >
                Create Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.recent_projects.map((proj) => (
              <div
                key={proj.id}
                className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 hover:bg-slate-900 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 text-[10px] font-medium">
                      {proj.domain}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        proj.status === 'COMPLETED'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                          : proj.status === 'FAILED'
                          ? 'bg-red-950/60 text-red-300 border-red-800/40'
                          : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40 animate-pulse'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                    {proj.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {proj.description || proj.topic}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                    <div>
                      <span>Papers:</span>{' '}
                      <strong className="text-slate-200">{proj.paper_count}</strong>
                    </div>
                    <div>
                      <span>Top Gap Score:</span>{' '}
                      <strong className="text-indigo-400">
                        {proj.top_gap_score ? `${proj.top_gap_score}/100` : 'Pending'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Updated {new Date(proj.updated_at).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/projects/${proj.id}`}
                    className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <span>Open Project</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
