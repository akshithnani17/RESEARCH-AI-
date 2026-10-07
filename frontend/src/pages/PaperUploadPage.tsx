import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Layers
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Paper, Project } from '../types';

export const PaperUploadPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pId = parseInt(projectId || '0', 10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { data: project } = useQuery<Project>({
    queryKey: ['project', pId],
    queryFn: () => apiClient.getProject(pId),
    enabled: !!pId,
  });

  const { data: papers, isLoading: papersLoading } = useQuery<Paper[]>({
    queryKey: ['papers', pId],
    queryFn: () => apiClient.getPapers(pId),
    enabled: !!pId,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => apiClient.uploadPapers(pId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers', pId] });
      queryClient.invalidateQueries({ queryKey: ['project', pId] });
      setUploadError(null);
      setIsUploading(false);
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.detail || 'Failed to upload paper. Please check PDF file.');
      setIsUploading(false);
    },
  });

  const deletePaperMutation = useMutation({
    mutationFn: (paperId: number) => apiClient.deletePaper(pId, paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers', pId] });
      queryClient.invalidateQueries({ queryKey: ['project', pId] });
    },
  });

  const runAnalysisMutation = useMutation({
    mutationFn: () => apiClient.runAnalysis(pId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', pId] });
      navigate(`/projects/${pId}`);
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.detail || 'Analysis failed to start.');
    },
  });

  const handleFiles = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setUploadError(`File '${file.name}' is not a PDF. Only text-based PDF papers are supported.`);
        setIsUploading(false);
        return;
      }
      formData.append('files', file);
    }

    uploadMutation.mutate(formData);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const paperCount = papers?.length || 0;
  const minRequired = 5;
  const isReadyForAnalysis = paperCount >= minRequired;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-medium">
            <Link to="/projects" className="hover:underline">Projects</Link>
            <span>/</span>
            <span className="text-slate-300">{project?.name || `Project #${pId}`}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">Upload Research Papers</h1>
          <p className="mt-1 text-xs text-slate-400">
            Upload at least 5 research papers in PDF format for cross-paper literature synthesis.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => runAnalysisMutation.mutate()}
            disabled={!isReadyForAnalysis || runAnalysisMutation.isPending}
            className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {runAnalysisMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <span>Start Cross-Paper Analysis</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 flex items-start space-x-2.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload Progress Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {paperCount} of {minRequired} Minimum Required Papers Uploaded
            </div>
            <div className="text-xs text-slate-400">
              {isReadyForAnalysis
                ? 'Literature threshold satisfied. Ready to discover evidence-backed research gaps.'
                : `Upload ${minRequired - paperCount} more research paper(s) to unlock cross-paper comparison.`}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isReadyForAnalysis ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.min(100, (paperCount / minRequired) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-950/30'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-4">
          {isUploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
          ) : (
            <UploadCloud className="h-7 w-7 text-indigo-400" />
          )}
        </div>

        <h3 className="text-base font-bold text-white">
          {isUploading ? 'Extracting & Indexing Paper Text...' : 'Drag and Drop Research PDFs Here'}
        </h3>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          Supports text-based research papers. Max 30MB per file. (Scanned image PDFs require OCR).
        </p>

        <div className="mt-4 inline-flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition">
          <span>Browse Local Files</span>
        </div>
      </div>

      {/* Uploaded Papers List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Uploaded Literature Documents ({paperCount})
        </h3>

        {papersLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-900 border border-slate-800"></div>
            ))}
          </div>
        ) : paperCount === 0 ? (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-8 text-center text-xs text-slate-500">
            No papers uploaded yet. Drag and drop PDF files above to begin.
          </div>
        ) : (
          <div className="space-y-2.5">
            {papers?.map((paper, idx) => (
              <div
                key={paper.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-indigo-400 font-semibold text-xs font-mono">
                    #{idx + 1}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate max-w-xl">
                      {paper.title}
                    </h4>
                    <div className="mt-0.5 flex items-center space-x-3 text-[10px] text-slate-400">
                      <span>{paper.original_filename}</span>
                      <span>{(paper.file_size_bytes / (1024 * 1024)).toFixed(2)} MB</span>
                      {paper.page_count > 0 && <span>{paper.page_count} Pages</span>}
                      {paper.publication_year && <span>Year: {paper.publication_year}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                      paper.processing_status === 'ANALYZED'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                        : paper.processing_status === 'FAILED'
                        ? 'bg-red-950/60 text-red-300 border-red-800/40'
                        : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40'
                    }`}
                  >
                    {paper.processing_status}
                  </span>

                  <button
                    onClick={() => deletePaperMutation.mutate(paper.id)}
                    className="rounded p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Remove Paper"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
