import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  Search,
  FileText,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { apiClient } from '../api/client';
import { MasterPrompt, Project } from '../types';

export const MasterPromptPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pId = parseInt(projectId || '0', 10);
  const queryClient = useQueryClient();

  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  const { data: project } = useQuery<Project>({
    queryKey: ['project', pId],
    queryFn: () => apiClient.getProject(pId),
    enabled: !!pId,
  });

  const { data: promptData, isLoading } = useQuery<MasterPrompt>({
    queryKey: ['prompt', pId],
    queryFn: () => apiClient.getMasterPrompt(pId),
    enabled: !!pId,
  });

  const regenerateMutation = useMutation({
    mutationFn: (instructions?: string) =>
      apiClient.generateMasterPrompt(pId, { custom_instructions: instructions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt', pId] });
      setShowCustomModal(false);
      setCustomInstructions('');
    },
  });

  const handleCopy = () => {
    if (!promptData?.prompt_text) return;
    navigator.clipboard.writeText(promptData.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = (format: 'txt' | 'md') => {
    if (!promptData?.prompt_text) return;
    const blob = new Blob([promptData.prompt_text], {
      type: format === 'txt' ? 'text/plain;charset=utf-8' : 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ResearchGap_Master_Prompt_${pId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading || !promptData) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800"></div>
        <div className="h-96 animate-pulse rounded-2xl bg-slate-900 border border-slate-800"></div>
      </div>
    );
  }

  const promptText = promptData.prompt_text;
  const wordCount = promptData.word_count || promptText.split(/\s+/).length;
  const charCount = promptData.char_count || promptText.length;

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
            <span className="text-slate-300">Master Prompt Generator</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Universal Master LLM Prompt
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Self-contained specification that can be copied into any compatible LLM to independently build the complete proposed solution.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Customize & Regenerate</span>
          </button>

          <button
            onClick={() => handleDownload('txt')}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download TXT</span>
          </button>

          <button
            onClick={() => handleDownload('md')}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Markdown</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center space-x-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-md transition ${
              copied
                ? 'bg-emerald-600 shadow-emerald-600/25'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Prompt Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Master Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Meta Stats & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center space-x-4 text-xs text-slate-300 font-mono">
          <span>
            Words: <strong className="text-indigo-400">{wordCount.toLocaleString()}</strong>
          </span>
          <span>•</span>
          <span>
            Characters: <strong className="text-indigo-400">{charCount.toLocaleString()}</strong>
          </span>
          <span>•</span>
          <span className="text-emerald-400">Universal Format</span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search within prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7.5 rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Code Container */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
            <span className="text-slate-200 font-bold">universal_master_prompt.txt</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition font-sans"
          >
            {copied ? 'Copied' : 'Click to Copy Full Text'}
          </button>
        </div>

        <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap selection:bg-indigo-600 selection:text-white">
          {promptText}
        </pre>
      </div>

      {/* Customize & Regenerate Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Customize Master Prompt</h3>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Add domain-specific guidance, target framework constraints, or custom instructions to append to the master prompt.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom Implementation Instructions
              </label>
              <textarea
                rows={4}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Prioritize PyTorch Lightning and ONNX export for edge inference; enforce strict PEP 8 type annotations..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => regenerateMutation.mutate(customInstructions)}
                disabled={regenerateMutation.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                {regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
