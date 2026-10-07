import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Code2,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  BarChart2,
  RotateCcw,
  BookOpen,
  Calendar,
  Box
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Solution, Project, ResearchGap } from '../types';
import { InteractiveArchitectureBuilder } from '../components/architecture/InteractiveArchitectureBuilder';

export const SolutionWorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pId = parseInt(projectId || '0', 10);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('architecture');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  const { data: project } = useQuery<Project>({
    queryKey: ['project', pId],
    queryFn: () => apiClient.getProject(pId),
    enabled: !!pId,
  });

  const { data: solution, isLoading: solutionLoading } = useQuery<Solution>({
    queryKey: ['solution', pId],
    queryFn: () => apiClient.getSolution(pId),
    enabled: !!pId,
  });

  const regenerateMutation = useMutation({
    mutationFn: () => apiClient.generateSolution(pId, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution', pId] });
      queryClient.invalidateQueries({ queryKey: ['prompt', pId] });
    },
  });

  const toggleChecklist = (taskKey: string) => {
    setChecklistState((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  if (solutionLoading || !solution) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800"></div>
        <div className="h-96 animate-pulse rounded-2xl bg-slate-900 border border-slate-800"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'architecture', label: 'Architecture Diagram', icon: Box },
    { id: 'algorithms', label: 'Algorithms & Models', icon: Code2 },
    { id: 'datasets', label: 'Datasets & Tech Stack', icon: Database },
    { id: 'roadmap', label: 'Implementation Roadmap', icon: Calendar },
    { id: 'evaluation', label: 'Evaluation & Metrics', icon: FileCheck2 },
    { id: 'methodology', label: 'Methodology & Risks', icon: BookOpen },
  ];

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
            <span className="text-slate-300">Solution Workspace</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            {solution.title}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Engineered solution blueprint addressing the selected research gap with concrete architecture and milestones.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Regenerate Solution</span>
          </button>

          <Link
            to={`/projects/${pId}/prompt`}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>Universal Master Prompt</span>
          </Link>
        </div>
      </div>

      {/* Problem & Gap Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            Problem Statement
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">{solution.problem_statement}</p>
        </div>

        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
            Proposed Technical Direction
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">{solution.proposed_solution}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {/* Architecture Tab */}
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <InteractiveArchitectureBuilder
              initialNodes={solution.architecture_nodes}
              initialEdges={solution.architecture_edges}
              solutionTitle={solution.title}
            />
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300 leading-relaxed">
              <strong className="text-white block mb-1">Architecture Overview:</strong>
              {solution.architecture_overview}
            </div>
          </div>
        )}

        {/* Algorithms Tab */}
        {activeTab === 'algorithms' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {solution.algorithms?.map((algo, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 font-mono">
                        Algorithm #{idx + 1}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{algo.name}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{algo.description}</p>
                    
                    <div className="border-t border-slate-800 pt-2 space-y-1.5 text-[11px] text-slate-400">
                      <div>
                        <strong className="text-slate-300">Justification:</strong> {algo.justification}
                      </div>
                      <div>
                        <strong className="text-slate-300">Complexity:</strong>{' '}
                        <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[10px]">
                          {algo.complexity}
                        </code>
                      </div>
                      <div>
                        <strong className="text-slate-300">Alternative:</strong> {algo.alternative}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Datasets & Tech Stack Tab */}
        {activeTab === 'datasets' && (
          <div className="space-y-6">
            {/* Datasets */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recommended Datasets & Academic Benchmarks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {solution.dataset_recommendations?.map((ds, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{ds.name}</h4>
                      <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                        {ds.size}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{ds.description}</p>
                    <div className="text-[11px] text-slate-400 pt-1 flex justify-between">
                      <span>Source: {ds.source_url_type}</span>
                      <span className="text-emerald-400">{ds.license}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Target Technology Stack
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(solution.tech_stack || {}).map(([category, items]) => (
                  <div key={category} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block font-mono">
                      {category.replace('_', '/')}
                    </span>
                    <ul className="space-y-1 text-xs text-slate-200">
                      {(items as string[]).map((it, iIdx) => (
                        <li key={iIdx} className="flex items-center space-x-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Implementation Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {solution.implementation_phases?.map((phase) => (
                <div
                  key={phase.phase_number}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold font-mono">
                        {phase.phase_number}
                      </span>
                      <h4 className="text-sm font-bold text-white">{phase.title}</h4>
                    </div>
                    <span className="text-xs text-indigo-300 font-mono bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                      Duration: {phase.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tasks Checklist */}
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Milestone Tasks & Checkpoints
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {phase.tasks.map((task, tIdx) => {
                          const taskKey = `p${phase.phase_number}-t${tIdx}`;
                          const isDone = checklistState[taskKey] || false;
                          return (
                            <li
                              key={tIdx}
                              onClick={() => toggleChecklist(taskKey)}
                              className="flex items-start space-x-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-800/40 transition"
                            >
                              <div
                                className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition ${
                                  isDone
                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                    : 'border-slate-600 bg-slate-950'
                                }`}
                              >
                                {isDone && <CheckCircle2 className="h-3 w-3" />}
                              </div>
                              <span className={isDone ? 'line-through text-slate-500' : ''}>
                                {task}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Technologies & Deliverables */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Technologies Utilized
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {phase.technologies.map((t, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Tangible Deliverables
                        </div>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {phase.deliverables.map((d, idx) => (
                            <li key={idx} className="flex items-center space-x-1.5">
                              <span className="text-indigo-400">▸</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evaluation & Metrics Tab */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200">
              <strong className="block font-bold mb-0.5">Scientific Grounding Notice:</strong>
              All metrics below represent planned academic evaluation benchmarks for empirical comparison against baseline literature. Experimental results are not fabricated.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solution.evaluation_metrics?.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{m.metric_name}</h4>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                      {m.type}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800 text-[11px] font-mono text-slate-300">
                    Target: <strong className="text-emerald-400">{m.target_threshold}</strong>
                  </div>

                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">Protocol / Formula:</strong> {m.formula_description}
                  </div>

                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">Rationale:</strong> {m.rationale}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Expected Experimental Outcomes
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{solution.expected_results}</p>
            </div>
          </div>
        )}

        {/* Methodology & Risks Tab */}
        {activeTab === 'methodology' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Formal Research Methodology
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {solution.research_methodology}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Technical Risks & Mitigation Strategies
              </h4>
              <div className="space-y-3">
                {solution.risks_and_mitigations?.map((r, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{r.risk}</span>
                      <span className="text-amber-400 font-mono text-[11px]">{r.impact}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      <strong className="text-emerald-400">Mitigation:</strong> {r.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Future Investigation Directions
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {solution.future_work?.map((fw, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="text-indigo-400">▸</span>
                    <span>{fw}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
