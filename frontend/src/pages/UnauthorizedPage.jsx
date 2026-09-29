import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';
import useAuthDefault, { useAuth as useAuthNamed } from '../hooks/useAuth';

const useAuth = useAuthNamed || useAuthDefault;

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch {
    // Outside auth provider
  }

  const role = user?.role || 'Guest';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Shield Icon Graphic */}
        <div className="mx-auto w-24 h-24 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6 shadow-sm">
          <ShieldAlert className="w-12 h-12" />
        </div>

        {/* Headings */}
        <div className="inline-block px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
          Error 403 &bull; Access Denied
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Insufficient Permissions
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          You don't have authorization to view this resource. This page requires specific
          administrative or role privileges.
        </p>

        {user && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 mb-8 text-xs text-slate-500 text-left">
            <span className="font-semibold text-slate-700">Currently signed in as: </span>
            <span className="font-mono text-indigo-600">{user.email || 'User'}</span>
            <span className="ml-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
              {role}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl shadow-2xs transition-colors cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Go Back</span>
          </button>

          {!user ? (
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Another Account</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
