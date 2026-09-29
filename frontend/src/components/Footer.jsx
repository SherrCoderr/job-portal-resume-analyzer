import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart } from 'lucide-react';

/**
 * Standard application footer with branding, navigation links, and copyright statement.
 * @param {Object} props
 * @param {string} [props.className=''] - Additional CSS classes.
 */
export default function Footer({ className = '' }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`border-t border-slate-200 bg-white mt-auto py-8 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4 text-center">
        {/* Brand */}
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="text-slate-900 tracking-tight">JobPortal</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
          <Link
            to="/jobs"
            className="hover:text-indigo-600 transition-colors"
          >
            Browse Jobs
          </Link>
          <Link
            to="/login"
            className="hover:text-indigo-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="hover:text-indigo-600 transition-colors"
          >
            Register
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400">AI-Powered Resume Matcher</span>
        </div>

        {/* Copyright */}
        <p className="text-xs sm:text-sm text-slate-400">
          &copy; {currentYear} JobPortal. All rights reserved. Built with precision for job seekers and recruiters.
        </p>
      </div>
    </footer>
  );
}
