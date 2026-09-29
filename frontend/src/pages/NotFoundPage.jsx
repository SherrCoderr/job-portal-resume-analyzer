import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Visual Graphic */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-25" />
          <div className="relative w-28 h-28 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl text-white transform -rotate-6">
            <span className="text-4xl font-black tracking-wider">404</span>
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <Link
            to="/jobs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl shadow-2xs transition-colors cursor-pointer text-sm"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Search Jobs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
