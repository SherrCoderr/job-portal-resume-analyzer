import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  FileCheck2,
  Sparkles,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  Award,
  Zap,
} from 'lucide-react';
import useAuthDefault, { useAuth as useAuthNamed } from '../hooks/useAuth';

const useAuth = useAuthNamed || useAuthDefault;

export default function LandingPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch {
    // If rendered outside AuthProvider
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const isRecruiter = user?.role === 'ROLE_RECRUITER';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle background decorative shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-purple-400 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-700/60 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm font-medium mb-6 backdrop-blur-xs shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI-Driven Resume Analysis & Precision Job Matching</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-200 to-purple-200">Dream Job</span> Today
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 font-normal mb-10 leading-relaxed">
            Discover thousands of career opportunities from vetted top employers.
            Analyze your resume against real job requirements with instant matching scores.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl shadow-2xl border border-white/20 flex flex-col md:flex-row gap-2.5 items-stretch text-slate-700"
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, keywords, or company..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, state, or 'Remote'..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3 rounded-xl shadow-md transition-all duration-150 cursor-pointer active:scale-[0.99] text-base shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search Jobs</span>
            </button>
          </form>

          {/* Popular searches tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-indigo-200">
            <span className="font-medium text-indigo-300">Popular:</span>
            {['Software Engineer', 'React Developer', 'DevOps', 'Data Analyst', 'Remote'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setKeyword(tag);
                  navigate(`/jobs?keyword=${encodeURIComponent(tag)}`);
                }}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-slate-200/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">1,000+</div>
            <div className="text-sm sm:text-base font-medium text-slate-600 mt-1">Active Job Listings</div>
          </div>
          <div className="p-4 border-l border-slate-100">
            <div className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">500+</div>
            <div className="text-sm sm:text-base font-medium text-slate-600 mt-1">Verified Companies</div>
          </div>
          <div className="p-4 border-l-0 md:border-l border-slate-100">
            <div className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">10,000+</div>
            <div className="text-sm sm:text-base font-medium text-slate-600 mt-1">Qualified Candidates</div>
          </div>
          <div className="p-4 border-l border-slate-100">
            <div className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">95%</div>
            <div className="text-sm sm:text-base font-medium text-slate-600 mt-1">Skill Match Precision</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
            Engineered For Seamless Hiring
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Everything you need to land your next high-impact role
          </p>
          <p className="text-slate-600 text-base sm:text-lg mt-4">
            Our platform bridges the gap between ambitious professionals and top hiring teams using intelligent deterministic skill mapping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Job Matching */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Intelligent Job Matching</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
              Filter by experience level, job type, salary benchmarks, and tech stacks. Get matched with roles tailored precisely to your background and career ambitions.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Real-time filters for remote & hybrid jobs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified recruiter postings</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Resume Analysis */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-6">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Resume Analysis</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
              Upload your PDF or DOCX resume for automated text parsing and deterministic skill extraction. See a breakdown of matching vs. missing skills for every listing.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant percentage match score</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Detailed skill gap insights</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Easy Apply */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-6">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Easy 1-Click Apply</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
              Submit your active resume and a personalized note directly to hiring managers in seconds. Track application progress transparently from review to offer.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Application status tracking dashboard</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Direct notification updates</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 border-y border-slate-200/70 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How JobPortal Works</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">Three simple steps to unlock your potential</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-xs">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Create Your Profile</h4>
              <p className="text-slate-600 text-sm">
                Sign up as a job seeker or recruiter, upload your resume, and configure your career preferences.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-xs">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Check Match Scores</h4>
              <p className="text-slate-600 text-sm">
                Inspect how your skills compare against required criteria before applying to optimize your chances.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-xs">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2">Apply & Get Hired</h4>
              <p className="text-slate-600 text-sm">
                Submit applications with a single click and track your interview pipeline with instant status updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to Take the Next Step in Your Career?
          </h2>
          <p className="text-indigo-100 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of professionals landing their ideal roles or hire top talent with AI-verified skill checks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-6 py-3.5 rounded-xl shadow-md transition-colors"
            >
              <span>Explore All Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isRecruiter ? (
              <Link
                to="/recruiter/jobs/new"
                className="inline-flex items-center gap-2 bg-indigo-800/80 hover:bg-indigo-800 text-white font-semibold px-6 py-3.5 rounded-xl border border-indigo-400/30 transition-colors"
              >
                <span>Post a Job Listing</span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-indigo-900/60 hover:bg-indigo-900/80 text-white font-semibold px-6 py-3.5 rounded-xl border border-indigo-400/30 transition-colors"
              >
                <span>Create Free Account</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
