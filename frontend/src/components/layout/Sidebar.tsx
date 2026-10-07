import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  FileText,
  GitCompare,
  SearchCode,
  Network,
  Cpu,
  Sparkles,
  FileSpreadsheet,
  Settings,
  Layers
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const location = useLocation();

  // If inside a project view, show project-specific deep workflows
  const isInsideProject = !!projectId;

  const globalNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', path: '/projects', icon: FolderKanban },
    { name: 'Create Project', path: '/projects/new', icon: PlusCircle },
  ];

  const projectNav = projectId
    ? [
        { name: 'Project Overview', path: `/projects/${projectId}`, icon: Layers },
        { name: 'Paper Upload', path: `/projects/${projectId}/upload`, icon: PlusCircle },
        { name: 'Paper Analysis', path: `/projects/${projectId}/analysis`, icon: FileText },
        { name: 'Cross-Paper Matrix', path: `/projects/${projectId}/comparison`, icon: GitCompare },
        { name: 'Research Gaps', path: `/projects/${projectId}/gaps`, icon: SearchCode },
        { name: 'Interactive Graph', path: `/projects/${projectId}/graph`, icon: Network },
        { name: 'Solution Workspace', path: `/projects/${projectId}/solution`, icon: Cpu },
        { name: 'Master Prompt', path: `/projects/${projectId}/prompt`, icon: Sparkles },
        { name: 'Research Report', path: `/projects/${projectId}/reports`, icon: FileSpreadsheet },
      ]
    : [];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </div>
          <nav className="mt-2 space-y-1">
            {globalNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {isInsideProject && (
          <div>
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
              <span>Active Project</span>
              <span className="text-[9px] bg-indigo-950/80 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/40">
                #{projectId}
              </span>
            </div>
            <nav className="mt-2 space-y-1">
              {projectNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="border-t border-slate-900 pt-4">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs text-slate-400">
          <div className="font-semibold text-slate-300">Evidence Rule</div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            FACT is direct paper citations. INFERENCE is cross-paper gap synthesis. PROPOSAL is AI-guided architecture.
          </p>
        </div>
      </div>
    </aside>
  );
};
