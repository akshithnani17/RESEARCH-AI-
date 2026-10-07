import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Network, ArrowRight, Layers, HelpCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import { Project } from '../types';
import { InteractiveResearchGraph } from '../components/graph/InteractiveResearchGraph';

export const InteractiveGraphPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pId = parseInt(projectId || '0', 10);

  const { data: project } = useQuery<Project>({
    queryKey: ['project', pId],
    queryFn: () => apiClient.getProject(pId),
    enabled: !!pId,
  });

  const { data: graphData, isLoading } = useQuery<{ nodes: any[]; edges: any[] }>({
    queryKey: ['research-graph', pId],
    queryFn: () => apiClient.getResearchGraph(pId),
    enabled: !!pId,
  });

  if (isLoading || !graphData) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800"></div>
        <div className="h-[600px] animate-pulse rounded-2xl bg-slate-900 border border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium">
            <Link to={`/projects/${pId}`} className="hover:underline">
              {project?.name || `Project #${pId}`}
            </Link>
            <span>/</span>
            <span className="text-slate-300">Interactive Graph</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Interactive Literature & Gap Knowledge Graph
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time visual relationships between baseline papers, identified limitations, candidate research gaps, and proposed solutions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/projects/${pId}/solution`}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
          >
            <span>Solution Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Graph Component */}
      <InteractiveResearchGraph
        initialNodes={graphData.nodes}
        initialEdges={graphData.edges}
      />
    </div>
  );
};
