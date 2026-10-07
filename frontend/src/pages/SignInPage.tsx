import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

export const SignInPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState<string | null>(null);
  const [showForgotDialog, setShowForgotDialog] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || 'Authentication failed. Please verify your email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await apiClient.forgotPassword({ email: forgotEmail });
      setForgotPasswordMsg(res.message || 'Password reset request submitted.');
    } catch (err: any) {
      setForgotPasswordMsg(err.response?.data?.detail || 'Error submitting request.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-600/30">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            ResearchGap <span className="text-indigo-400">AI</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          Sign In to Your Workspace
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Enter your credentials to access your research gap discovery projects.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 flex items-start space-x-2.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="researcher@university.edu"
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotDialog(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••••••"
                className="mt-1.5 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center">
            <span className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/sign-up" className="font-medium text-indigo-400 hover:text-indigo-300">
                Create an account
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white">Reset Password</h3>
            <p className="mt-1 text-xs text-slate-400">
              Enter your email address to receive password recovery instructions.
            </p>

            {forgotPasswordMsg ? (
              <div className="mt-4 rounded-lg bg-indigo-950/60 border border-indigo-800/60 p-3 text-xs text-indigo-200">
                {forgotPasswordMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotDialog(false);
                      setForgotPasswordMsg(null);
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}

            {forgotPasswordMsg && (
              <button
                onClick={() => {
                  setShowForgotDialog(false);
                  setForgotPasswordMsg(null);
                }}
                className="mt-4 w-full rounded-lg bg-slate-800 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
