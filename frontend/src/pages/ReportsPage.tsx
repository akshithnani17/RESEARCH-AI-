import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Project } from '../types';

export const ReportsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pId = parseInt(projectId || '0', 10);
  const [copied, setCopied] = useState<boolean>(false);

  const { data: project } = useQuery<Project>({
    queryKey: ['project', pId],
    queryFn: () => apiClient.getProject(pId),
    enabled: !!pId,
  });

  const { data: reportData, isLoading } = useQuery<{ project_id: number; title: string; markdown_content: string }>({
    queryKey: ['report', pId],
    queryFn: () => apiClient.getMarkdownReport(pId),
    enabled: !!pId,
  });

  const handleCopy = () => {
    if (!reportData?.markdown_content) return;
    navigator.clipboard.writeText(reportData.markdown_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'markdown' | 'txt') => {
    window.open(apiClient.getReportDownloadUrl(pId, format), '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !reportData) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800"></div>
        <div className="h-96 animate-pulse rounded-2xl bg-slate-900 border border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium">
            <Link to={`/projects/${pId}`} className="hover:underline">
              {project?.name || `Project #${pId}`}
            </Link>
            <span>/</span>
            <span className="text-slate-300">Research Report</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Academic Research Gap & Solution Report
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Comprehensive synthesis document suitable for thesis defense, grant proposals, or academic publication drafts.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => handleDownload('txt')}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>TXT</span>
          </button>

          <button
            onClick={() => handleDownload('markdown')}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Markdown</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Rendered Academic Markdown Report */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md prose prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-slate-300 prose-p:text-xs prose-li:text-xs prose-li:text-slate-300 prose-code:text-indigo-300 prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
        <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {reportData.markdown_content}
        </pre>
      </div>
    </div>
  );
};
