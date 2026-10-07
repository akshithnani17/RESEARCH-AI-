import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderKanban,
  PlusCircle,
  Search,
  Trash2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  BookOpen,
  Filter
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: apiClient.getProjects,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const loadDemoMutation = useMutation({
    mutationFn: apiClient.loadDemoProject,
    onSuccess: (newProj: Project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate(`/projects/${newProj.id}`);
    },
  });

  const domains = Array.from(new Set(projects?.map((p) => p.domain) || []));

  const filteredProjects = projects?.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = domainFilter === 'ALL' || p.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Research Projects</h1>
          <p className="mt-1 text-xs text-slate-400">
            Manage your academic research discovery workspaces.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadDemoMutation.mutate()}
            disabled={loadDemoMutation.isPending}
            className="flex items-center space-x-2 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/60 hover:border-indigo-500/50 transition disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Load Demo Project</span>
          </button>
          <Link
            to="/projects/new"
            className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by name or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500 hidden sm:inline" />
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none w-full sm:w-auto"
          >
            <option value="ALL">All Research Domains</option>
            {domains.map((dom) => (
              <option key={dom} value={dom}>
                {dom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-900 border border-slate-800"></div>
          ))}
        </div>
      ) : !filteredProjects || filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-slate-500 mb-3" />
          <h3 className="text-base font-bold text-white">No Matching Projects</h3>
          <p className="mt-1 text-xs text-slate-400">
            {searchQuery ? 'No research projects match your search query.' : 'Create a new project to start.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 transition"
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
                        : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug line-clamp-1">
                  {proj.name}
                </h3>
                <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">
                  {proj.description || proj.topic}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
                  <div>
                    <span>Papers:</span> <strong className="text-slate-200">{proj.paper_count}</strong>
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
                <button
                  onClick={() => {
                    if (window.confirm(`Delete project '${proj.name}'?`)) {
                      deleteMutation.mutate(proj.id);
                    }
                  }}
                  className="rounded p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                  title="Delete Project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

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
  );
};
