import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <Link to="/dashboard" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              ResearchGap <span className="text-indigo-400">AI</span>
            </span>
            <span className="ml-2 rounded border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
              v2.0
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Evidence-Grounded Engine Active</span>
        </div>

        {user ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-950 text-indigo-300 text-xs font-semibold">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-medium text-slate-200">{user.full_name}</div>
                <div className="text-[10px] text-slate-400">{user.email}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-red-950/40 hover:text-red-300 hover:border-red-900/50 transition"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/sign-in"
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
