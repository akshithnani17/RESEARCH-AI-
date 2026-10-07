import axios from 'axios';
import {
  User,
  Project,
  DashboardStats,
  Paper,
  PaperComparisonResponse,
  ResearchGap,
  Solution,
  MasterPrompt
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('researchgap_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthorized gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/sign-in') && !window.location.pathname.includes('/sign-up') && window.location.pathname !== '/') {
      localStorage.removeItem('researchgap_token');
      localStorage.removeItem('researchgap_user');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Auth
  signUp: async (data: any) => (await api.post('/auth/signup', data)).data,
  login: async (data: any) => (await api.post('/auth/login', data)).data,
  getMe: async (): Promise<User> => (await api.get('/auth/me')).data,
  logout: async () => (await api.post('/auth/logout')).data,
  forgotPassword: async (data: any) => (await api.post('/auth/forgot-password', data)).data,

  // Projects
  getProjects: async (): Promise<Project[]> => (await api.get('/projects')).data,
  getDashboardStats: async (): Promise<DashboardStats> => (await api.get('/projects/dashboard-stats')).data,
  getProject: async (id: number): Promise<Project> => (await api.get(`/projects/${id}`)).data,
  createProject: async (data: any): Promise<Project> => (await api.post('/projects', data)).data,
  updateProject: async (id: number, data: any): Promise<Project> => (await api.put(`/projects/${id}`, data)).data,
  deleteProject: async (id: number) => (await api.delete(`/projects/${id}`)).data,
  loadDemoProject: async (): Promise<Project> => (await api.post('/projects/load-demo')).data,

  // Papers
  getPapers: async (projectId: number): Promise<Paper[]> => (await api.get(`/projects/${projectId}/papers`)).data,
  uploadPapers: async (projectId: number, formData: FormData): Promise<Paper[]> => {
    return (
      await api.post(`/projects/${projectId}/papers/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },
  deletePaper: async (projectId: number, paperId: number) => (await api.delete(`/projects/${projectId}/papers/${paperId}`)).data,

  // Analysis & Pipeline
  runAnalysis: async (projectId: number): Promise<Project> => (await api.post(`/projects/${projectId}/analysis/run`)).data,
  getAnalysisStatus: async (projectId: number) => (await api.get(`/projects/${projectId}/analysis/status`)).data,

  // Comparison
  getComparison: async (projectId: number): Promise<PaperComparisonResponse> => (await api.get(`/projects/${projectId}/comparison`)).data,

  // Research Gaps
  getGaps: async (projectId: number): Promise<ResearchGap[]> => (await api.get(`/projects/${projectId}/gaps`)).data,
  discoverGaps: async (projectId: number) => (await api.post(`/projects/${projectId}/gaps/discover`)).data,
  selectGap: async (projectId: number, gapId: number): Promise<ResearchGap> => (await api.post(`/projects/${projectId}/gaps/${gapId}/select`)).data,
  getResearchGraph: async (projectId: number) => (await api.get(`/projects/${projectId}/gaps/graph`)).data,

  // Solutions
  getSolution: async (projectId: number): Promise<Solution> => (await api.get(`/projects/${projectId}/solution`)).data,
  generateSolution: async (projectId: number, data: { gap_id?: number; focus_domain?: string }): Promise<Solution> =>
    (await api.post(`/projects/${projectId}/solution/generate`, data)).data,

  // Master Prompt
  getMasterPrompt: async (projectId: number): Promise<MasterPrompt> => (await api.get(`/projects/${projectId}/prompt`)).data,
  generateMasterPrompt: async (projectId: number, data?: { custom_instructions?: string }): Promise<MasterPrompt> =>
    (await api.post(`/projects/${projectId}/prompt/generate`, data || {})).data,

  // Reports
  getMarkdownReport: async (projectId: number) => (await api.get(`/projects/${projectId}/reports/markdown`)).data,
  getReportDownloadUrl: (projectId: number, format: 'markdown' | 'txt' = 'markdown') =>
    `${API_BASE_URL}/projects/${projectId}/reports/download?format=${format}`,
};

export default api;
