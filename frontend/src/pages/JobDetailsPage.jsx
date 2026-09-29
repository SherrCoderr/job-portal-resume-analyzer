import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  X,
  AlertCircle,
  Share2,
  Bookmark,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getJobById } from '../api/jobApi';
import { applyToJob } from '../api/applicationApi';
import useAuthDefault, { useAuth as useAuthNamed } from '../hooks/useAuth';

const useAuth = useAuthNamed || useAuthDefault;

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  let authUser = null;
  try {
    const auth = useAuth();
    authUser = auth?.user;
  } catch {
    // Outside auth provider
  }

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getJobById(id);
        const jobData = res?.data || res;
        if (isMounted) {
          if (jobData) {
            setJob(jobData);
          } else {
            setError('Job listing not found');
          }
        }
      } catch (err) {
        console.error('Failed to load job details:', err);
        if (isMounted) {
          setError(
            err?.response?.status === 404
              ? 'Job not found. It may have been closed or removed.'
              : 'Failed to load job details. Please try again later.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleApplyClick = () => {
    if (!authUser) {
      toast('Please sign in as a job seeker to apply for this position', {
        icon: 'ℹ️',
      });
      navigate('/login', { state: { from: location } });
      return;
    }

    const userRole = (authUser.role || '').toUpperCase();
    if (userRole === 'ROLE_RECRUITER' || userRole === 'RECRUITER') {
      toast.error('Recruiter accounts cannot apply to jobs. Please switch to a job seeker account.');
      return;
    }

    setIsApplyModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      await applyToJob({
        jobId: job.id,
        coverLetter: coverLetter.trim() || undefined,
      });

      toast.success('Your application was submitted successfully!');
      setIsApplyModalOpen(false);
      setCoverLetter('');
      // Update local state to reflect applied
      setJob((prev) =>
        prev
          ? {
              ...prev,
              hasApplied: true,
              applicantCount: (prev.applicantCount || 0) + 1,
            }
          : prev
      );
    } catch (err) {
      console.error('Apply error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Could not submit your application. Please try again.';
      toast.error(msg);
    } finally {
      setIsApplying(false);
    }
  };

  // Formatters
  const formatJobType = (type) => {
    if (!type) return '';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatSalary = (min, max, currency = '$') => {
    if (!min && !max) return 'Not disclosed';
    const curr = currency || '$';
    const fmt = (num) => Number(num).toLocaleString();
    if (min && max) return `${curr}${fmt(min)} - ${curr}${fmt(max)}`;
    if (min) return `From ${curr}${fmt(min)}`;
    return `Up to ${curr}${fmt(max)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Job Unavailable</h2>
          <p className="text-slate-600 text-sm mb-6">{error || 'This job is no longer available.'}</p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Jobs</span>
          </Link>
        </div>
      </div>
    );
  }

  const isSeeker =
    authUser &&
    (authUser.role === 'ROLE_JOB_SEEKER' || authUser.role === 'JOB_SEEKER');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to listings</span>
          </button>
        </div>

        {/* Company Info & Job Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-2xl shrink-0">
                {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'J'}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {job.title}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 mt-1">
                  <span className="flex items-center gap-1.5 font-medium text-slate-800">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{job.companyName || 'Confidential Company'}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{job.location || 'Remote'}</span>
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {formatJobType(job.jobType)}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right Action: Apply Button or Status */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-3 shrink-0">
              {job.hasApplied ? (
                <div className="inline-flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-xl font-bold text-sm shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Application Submitted</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyClick}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white px-7 py-3 rounded-xl font-semibold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{authUser ? 'Apply for this Role' : 'Sign in to Apply'}</span>
                </button>
              )}

              {/* Applicant counter */}
              <div className="flex items-center justify-center md:justify-end gap-1.5 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {job.applicantCount || 0} applicant{(job.applicantCount || 0) === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>

          {/* Resume Match Score Banner (if available) */}
          {job.seekerMatchScore !== null && job.seekerMatchScore !== undefined && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-indigo-50/60 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">
                    Resume Match Assessment
                  </h4>
                  <p className="text-xs text-indigo-700">
                    Calculated against your active resume skills
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-700">
                    {Math.round(job.seekerMatchScore)}%
                  </div>
                  <div className="text-2xs font-semibold text-indigo-600 uppercase tracking-wider">
                    {job.seekerMatchScore >= 75
                      ? 'High Match'
                      : job.seekerMatchScore >= 50
                      ? 'Moderate Match'
                      : 'Developing Match'}
                  </div>
                </div>

                <div className="w-24 sm:w-32 bg-indigo-200/80 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      job.seekerMatchScore >= 75
                        ? 'bg-emerald-500'
                        : job.seekerMatchScore >= 50
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, job.seekerMatchScore))}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details Grid (Content + Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Description Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Job Overview & Description
              </h2>
              <div className="text-slate-700 text-sm leading-relaxed space-y-4 whitespace-pre-line">
                {job.description || 'No description provided.'}
              </div>
            </div>

            {/* Required Skills Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Required Skills & Qualifications</span>
                <span className="text-xs font-normal text-slate-500">
                  {job.requiredSkills?.length || 0} core skill
                  {(job.requiredSkills?.length || 0) === 1 ? '' : 's'}
                </span>
              </h3>

              {job.requiredSkills && job.requiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No required skills specified by the employer.
                </p>
              )}
            </div>

            {/* Nice to Have Skills Card */}
            {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Nice to Have Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.niceToHaveSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                Job Details Summary
              </h3>

              {/* Job Type */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-2xs font-bold uppercase tracking-wider text-slate-400">
                    Employment Type
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatJobType(job.jobType) || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Experience Level */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-2xs font-bold uppercase tracking-wider text-slate-400">
                    Experience Level
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatJobType(job.experienceLevel) || 'Not specified'}
                    {job.minExperienceYears ? ` (${job.minExperienceYears}+ yrs)` : ''}
                  </span>
                </div>
              </div>

              {/* Salary Range */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-2xs font-bold uppercase tracking-wider text-slate-400">
                    Salary Range
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatSalary(job.minSalary, job.maxSalary, job.salaryCurrency)}
                  </span>
                </div>
              </div>

              {/* Posted Date */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-2xs font-bold uppercase tracking-wider text-slate-400">
                    Date Posted
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-2xs font-bold uppercase tracking-wider text-slate-400">
                    Workplace Location
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {job.location || 'Remote'}
                  </span>
                </div>
              </div>

              {/* Sidebar Action Button */}
              <div className="pt-4 border-t border-slate-100">
                {job.hasApplied ? (
                  <div className="w-full text-center py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                    Already Applied
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyClick}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm shadow-md transition-all cursor-pointer text-center"
                  >
                    {authUser ? 'Apply for this Job' : 'Sign in to Apply'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Apply for {job.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  at {job.companyName || 'Company'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="coverLetter"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                >
                  Cover Letter / Note to Recruiter{' '}
                  <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  id="coverLetter"
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself, explain why you're a standout fit for this role, and highlight key achievements..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 resize-none transition-all"
                />
              </div>

              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-900">
                <span className="font-semibold block mb-0.5">Resume Attachment</span>
                Your latest active profile resume will be automatically forwarded and evaluated with this application.
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  disabled={isApplying}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
