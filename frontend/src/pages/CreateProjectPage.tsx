import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FolderPlus, ArrowRight, AlertCircle, BookOpen } from 'lucide-react';
import { apiClient } from '../api/client';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  domain: z.string().min(2, 'Research domain is required'),
  topic: z.string().min(3, 'Research topic is required'),
  description: z.string().optional(),
  research_question: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      domain: 'Artificial Intelligence / NLP',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const newProj = await apiClient.createProject(data);
      navigate(`/projects/${newProj.id}/upload`);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || 'Failed to create research project. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Create Research Project</h1>
        <p className="mt-1 text-xs text-slate-400">
          Define your research domain and topic before uploading literature papers.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 flex items-start space-x-2.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Project Title *
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Robust Grounded LLM Reasoning & Latency Optimization"
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Research Domain *
              </label>
              <input
                type="text"
                {...register('domain')}
                placeholder="e.g. Artificial Intelligence, Healthcare, Cybersecurity"
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {errors.domain && (
                <p className="mt-1 text-xs text-red-400">{errors.domain.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Core Research Topic *
              </label>
              <input
                type="text"
                {...register('topic')}
                placeholder="e.g. Retrieval-Augmented Generation Vulnerabilities"
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {errors.topic && (
                <p className="mt-1 text-xs text-red-400">{errors.topic.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Short Description / Problem Scope (Optional)
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Brief description of the research scope, motivation, or target application area..."
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">
              Core Research Question (Optional)
            </label>
            <input
              type="text"
              {...register('research_question')}
              placeholder="e.g. How can we eliminate hallucination without incurring decoding latency penalties?"
              className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="rounded-lg px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create Project & Upload Papers</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
