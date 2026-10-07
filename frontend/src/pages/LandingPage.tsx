import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  SearchCode,
  GitCompare,
  Network,
  Cpu,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Layers,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 lg:px-12 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            ResearchGap <span className="text-indigo-400">AI</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/sign-in"
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/sign-up"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6 lg:px-12 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 mb-6">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Evidence-Grounded Research Gap Discovery Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn Research Papers Into <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300">
              Actionable Research Gaps
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your research papers, discover evidence-backed gaps, explore proposed solutions, and generate a complete implementation roadmap and universal master prompt for any LLM.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition"
            >
              <span>Start Discovery Workflow</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Sign In to Projects
            </Link>
          </div>
        </div>

        {/* Interactive Live Product Preview Mock */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
              <span className="ml-2 text-xs font-mono text-slate-400">
                researchgap-ai/workspace/project-204
              </span>
            </div>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
              AI-Assisted Gap Score: 92.4/100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs uppercase font-semibold tracking-wider text-slate-500">
                1. Multi-Paper Synthesis
              </div>
              <div className="mt-2 text-sm font-bold text-white">5 Baseline Papers Analyzed</div>
              <div className="mt-2 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between"><span>Retriever Latency:</span> <span className="text-red-400">Bottleneck</span></div>
                <div className="flex justify-between"><span>Adversarial Defense:</span> <span className="text-amber-400">78% Vulnerable</span></div>
                <div className="flex justify-between"><span>Cross-Evidence:</span> <span className="text-emerald-400">92% Coverage</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
              <div className="text-xs uppercase font-semibold tracking-wider text-indigo-400">
                2. Discovered Research Gap
              </div>
              <div className="mt-2 text-sm font-bold text-white">
                Out-of-Distribution Invariant Calibration
              </div>
              <p className="mt-1 text-xs text-slate-300 line-clamp-2">
                Literature indicates a potential gap in maintaining verifiable accuracy under non-stationary shifts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs uppercase font-semibold tracking-wider text-slate-500">
                3. Proposed Solution
              </div>
              <div className="mt-2 text-sm font-bold text-white">
                IRMv2 + Neuro-Symbolic Verifier
              </div>
              <div className="mt-2 flex items-center space-x-2 text-xs text-slate-400">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300">5 Phases</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-emerald-300">Target +14%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 lg:px-12 border-b border-slate-800/80 bg-slate-950/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Systematic Scientific Pipeline
            </h2>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
              How ResearchGap AI Works
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-center">
            {[
              { step: '1', title: 'Upload Papers', desc: 'Upload 5+ research papers in PDF format.' },
              { step: '2', title: 'Analyze Literature', desc: 'Extract problem, methods, datasets, limitations.' },
              { step: '3', title: 'Discover Gaps', desc: 'Cross-paper synthesis & transparent weighted scoring.' },
              { step: '4', title: 'Generate Solution', desc: 'Interactive architecture & algorithm roadmap.' },
              { step: '5', title: 'Get Master Prompt', desc: 'Copy universal prompt to build with any LLM.' },
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 text-sm font-bold border border-indigo-500/30 mb-3">
                  {item.step}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-6 lg:px-12 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Core Capabilities
            </h2>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
              Built for Serious Academic Research
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: SearchCode,
                title: 'Multi-Paper Analysis',
                desc: 'Extract problems, objectives, datasets, algorithms, and limitations from PDFs with exact page references.',
              },
              {
                icon: GitCompare,
                title: 'Cross-Paper Matrix',
                desc: 'Compare papers across 8 standardized dimensions, detect contradictions, and analyze trade-offs.',
              },
              {
                icon: BarChart3,
                title: 'Transparent Gap Scoring',
                desc: 'Multi-factor weighted scoring based on Evidence Strength, Cross-Paper Support, Novelty, and Feasibility.',
              },
              {
                icon: Network,
                title: 'Interactive Research Graph',
                desc: 'Real React Flow node graph linking papers, limitations, candidate gaps, and solutions.',
              },
              {
                icon: Cpu,
                title: 'Interactive Architecture',
                desc: 'Full-screen interactive system architecture builder with component data flow inspectors.',
              },
              {
                icon: Layers,
                title: 'Implementation Roadmap',
                desc: 'Phased milestone timeline with task breakdowns, tech stacks, and completion checklists.',
              },
              {
                icon: FileCheck2,
                title: 'Evaluation Plan',
                desc: 'Relevant planned academic metrics and mathematical formulas clearly separated from fabricated data.',
              },
              {
                icon: Sparkles,
                title: 'Universal Master Prompt',
                desc: 'Self-contained, production-grade prompt ready to paste into any LLM to build the solution.',
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">ResearchGap AI — Version 2.0</span>
          </div>
          <div>Evidence-Grounded Research Gap Discovery and Solution Recommendation Platform</div>
        </div>
      </footer>
    </div>
  );
};
