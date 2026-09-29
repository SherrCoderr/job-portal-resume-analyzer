import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  X,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Building2,
  Clock,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { searchJobs } from '../api/jobApi';
import useAuthDefault, { useAuth as useAuthNamed } from '../hooks/useAuth';

const useAuth = useAuthNamed || useAuthDefault;

const JOB_TYPES = [
  { value: '', label: 'All Job Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const EXPERIENCE_LEVELS = [
  { value: '', label: 'All Experience Levels' },
  { value: 'ENTRY_LEVEL', label: 'Entry Level' },
  { value: 'MID_LEVEL', label: 'Mid Level' },
  { value: 'SENIOR_LEVEL', label: 'Senior Level' },
  { value: 'LEAD_EXECUTIVE', label: 'Lead / Executive' },
];

export default function JobListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch {
    // Outside auth provider
  }

  // Filter state initialized from URL parameters
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [experienceLevel, setExperienceLevel] = useState(
    searchParams.get('experienceLevel') || ''
  );
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const pageSize = 9;

  // Data state
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state to URL params
  const updateUrlParams = useCallback(
    (newKeyword, newLocation, newJobType, newExp, newPage) => {
      const params = new URLSearchParams();
      if (newKeyword) params.set('keyword', newKeyword);
      if (newLocation) params.set('location', newLocation);
      if (newJobType) params.set('jobType', newJobType);
      if (newExp) params.set('experienceLevel', newExp);
      if (newPage > 0) params.set('page', newPage.toString());

      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Fetch jobs function
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (location.trim()) params.location = location.trim();
      if (jobType) params.jobType = jobType;
      if (experienceLevel) params.experienceLevel = experienceLevel;

      const res = await searchJobs(params);
      const data = res?.data || res;

      if (data && Array.isArray(data.content)) {
        setJobs(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setJobs(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setJobs([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Unable to load job listings. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  }, [keyword, location, jobType, experienceLevel, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    updateUrlParams(keyword, location, jobType, experienceLevel, 0);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setJobType('');
    setExperienceLevel('');
    setPage(0);
    setSearchParams({}, { replace: true });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      updateUrlParams(keyword, location, jobType, experienceLevel, newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper formatting for labels
  const formatJobType = (type) => {
    if (!type) return '';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatSalary = (min, max, currency = '$') => {
    if (!min && !max) return null;
    const curr = currency || '$';
    const fmt = (num) => Number(num).toLocaleString();
    if (min && max) return `${curr}${fmt(min)} - ${curr}${fmt(max)}`;
    if (min) return `From ${curr}${fmt(min)}`;
    return `Up to ${curr}${fmt(max)}`;
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const hasActiveFilters = Boolean(keyword || location || jobType || experienceLevel);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore Career Opportunities
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                {totalElements > 0
                  ? `Showing ${totalElements} open position${totalElements === 1 ? '' : 's'}`
                  : 'Find the role that matches your skills'}
              </p>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center gap-2 self-start bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              )}
            </button>
          </div>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row gap-3"
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search job title, skills, or company..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (city or remote)..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation('')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Content Layout: Filters Sidebar + Job Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar (Desktop) */}
          <aside
            className={`lg:block ${
              mobileFilterOpen ? 'block' : 'hidden'
            } lg:col-span-1`}
          >
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs sticky top-24 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Filter Roles</span>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => {
                    setJobType(e.target.value);
                    setPage(0);
                    updateUrlParams(keyword, location, e.target.value, experienceLevel, 0);
                  }}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm text-slate-700 bg-white focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                >
                  {JOB_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => {
                    setExperienceLevel(e.target.value);
                    setPage(0);
                    updateUrlParams(keyword, location, jobType, e.target.value, 0);
                  }}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm text-slate-700 bg-white focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                >
                  {EXPERIENCE_LEVELS.map((exp) => (
                    <option key={exp.value} value={exp.value}>
                      {exp.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear button if filters applied */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Jobs Listing Main Section */}
          <main className="lg:col-span-3">
            {/* Loading Skeleton State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse flex flex-col justify-between h-72"
                  >
                    <div>
                      <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-3" />
                      <div className="h-3 bg-slate-200 rounded-md w-1/2 mb-4" />
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-slate-100 rounded-full w-20" />
                        <div className="h-6 bg-slate-100 rounded-full w-24" />
                      </div>
                      <div className="h-10 bg-slate-100 rounded-md w-full mb-3" />
                    </div>
                    <div className="h-8 bg-slate-200 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-8">
                <p className="text-red-700 font-semibold mb-4">{error}</p>
                <button
                  type="button"
                  onClick={fetchJobs}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && jobs.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs my-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  No matching jobs found
                </h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                  {hasActiveFilters
                    ? "We couldn't find any job postings matching your current search parameters. Try adjusting or clearing your filters."
                    : 'There are currently no active job postings available. Please check back later.'}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>
            )}

            {/* Job Cards Grid */}
            {!loading && !error && jobs.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  {jobs.map((job) => {
                    const salaryText = formatSalary(
                      job.minSalary,
                      job.maxSalary,
                      job.salaryCurrency
                    );
                    const skills = Array.isArray(job.requiredSkills)
                      ? job.requiredSkills
                      : [];
                    const visibleSkills = skills.slice(0, 5);
                    const remainingSkillsCount = skills.length - 5;

                    return (
                      <div
                        key={job.id}
                        className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between relative group"
                      >
                        <div>
                          {/* Top row: Badges & Applied indicator */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-2xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                              {formatJobType(job.jobType) || 'Job'}
                            </span>

                            {/* Match Score or Applied Badge */}
                            <div className="flex items-center gap-1.5">
                              {job.seekerMatchScore !== null &&
                                job.seekerMatchScore !== undefined && (
                                  <span
                                    title="AI Resume Match Score"
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-2xs font-bold ${
                                      job.seekerMatchScore >= 75
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : job.seekerMatchScore >= 50
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>{Math.round(job.seekerMatchScore)}% Match</span>
                                  </span>
                                )}

                              {job.hasApplied && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-2xs font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Applied</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title */}
                          <Link
                            to={`/jobs/${job.id}`}
                            className="block font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1"
                          >
                            {job.title}
                          </Link>

                          {/* Company & Location */}
                          <div className="space-y-1 mb-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {job.companyName || 'Confidential Company'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{job.location || 'Remote'}</span>
                            </div>
                          </div>

                          {/* Experience Level & Salary Range */}
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 mb-4 pb-3 border-b border-slate-100">
                            {job.experienceLevel && (
                              <span className="inline-flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                <span>{formatJobType(job.experienceLevel)}</span>
                              </span>
                            )}
                            {salaryText && (
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{salaryText}</span>
                              </span>
                            )}
                          </div>

                          {/* Skills Chips */}
                          <div className="mb-5">
                            <div className="flex flex-wrap gap-1.5">
                              {visibleSkills.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-2xs font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {remainingSkillsCount > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-2xs font-medium">
                                  +{remainingSkillsCount} more
                                </span>
                              )}
                              {skills.length === 0 && (
                                <span className="text-2xs text-slate-400 italic">
                                  No specific skills listed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Posted date & Action button */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-2xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(job.createdAt)}
                          </span>

                          <Link
                            to={`/jobs/${job.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <p className="text-xs sm:text-sm text-slate-600">
                      Showing page <span className="font-semibold">{page + 1}</span> of{' '}
                      <span className="font-semibold">{totalPages}</span> ({totalElements} total jobs)
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      {/* Numeric page badges */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i)
                          .filter(
                            (p) =>
                              p === 0 ||
                              p === totalPages - 1 ||
                              Math.abs(p - page) <= 1
                          )
                          .map((p, idx, arr) => {
                            const prevP = arr[idx - 1];
                            const showEllipsis = prevP !== undefined && p - prevP > 1;

                            return (
                              <React.Fragment key={p}>
                                {showEllipsis && (
                                  <span className="px-2 text-xs text-slate-400">...</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handlePageChange(p)}
                                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                    page === p
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  {p + 1}
                                </button>
                              </React.Fragment>
                            );
                          })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages - 1}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
