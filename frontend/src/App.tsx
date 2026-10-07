import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { PaperUploadPage } from './pages/PaperUploadPage';
import { PaperAnalysisPage } from './pages/PaperAnalysisPage';
import { PaperComparisonPage } from './pages/PaperComparisonPage';
import { ResearchGapDiscoveryPage } from './pages/ResearchGapDiscoveryPage';
import { InteractiveGraphPage } from './pages/InteractiveGraphPage';
import { SolutionWorkspacePage } from './pages/SolutionWorkspacePage';
import { MasterPromptPage } from './pages/MasterPromptPage';
import { ReportsPage } from './pages/ReportsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />

            {/* Protected Workspace Routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/new" element={<CreateProjectPage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/projects/:projectId/upload" element={<PaperUploadPage />} />
              <Route path="/projects/:projectId/analysis" element={<PaperAnalysisPage />} />
              <Route path="/projects/:projectId/comparison" element={<PaperComparisonPage />} />
              <Route path="/projects/:projectId/gaps" element={<ResearchGapDiscoveryPage />} />
              <Route path="/projects/:projectId/graph" element={<InteractiveGraphPage />} />
              <Route path="/projects/:projectId/solution" element={<SolutionWorkspacePage />} />
              <Route path="/projects/:projectId/prompt" element={<MasterPromptPage />} />
              <Route path="/projects/:projectId/reports" element={<ReportsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
