import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApplicationById } from '../../api/applicationApi';
import { downloadResume } from '../../api/resumeApi';
import StatusBadge from '../../components/StatusBadge';
import ResumeMatchCard from '../../components/ResumeMatchCard';

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingResume, setDownloadingResume] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getApplicationById(id);
        const data = res?.data || res;
        if (isMounted) {
          setApplication(data);
        }
      } catch (err) {
        console.error('Failed to load application details:', err);
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              'Could not load application details.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDownloadSubmittedResume = async () => {
    const resumeId = application?.resumeId || application?.resume?.id;
    if (!resumeId) {
      toast.error('No attached resume ID found.');
      return;
    }

    try {
      setDownloadingResume(true);
      const toastId = toast.loading('Downloading resume...');
      const blob = await downloadResume(resumeId);

      const fileName =
        application?.resumeFileName ||
        application?.resume?.fileName ||
        `resume_${resumeId}.pdf`;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download complete', { id: toastId });
    } catch (err) {
      console.error('Failed to download resume:', err);
      toast.error('Failed to download attached resume.');
    } finally {
      setDownloadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4" />
          <p className="text-slate-600 font-medium">Loading application information...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Application Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            {error || "The application you're looking for does not exist or has been removed."}
          </p>
          <div className="mt-6">
            <Link
              to="/seeker/applications"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Applications</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract application values
  const job = application.job || {};
  const jobTitle = application.jobTitle || job.title || 'Role Title';
  const companyName =
    application.companyName || job.companyName || job.company?.name || 'Company Name';
  const location = application.location || job.location || 'Remote / Unspecified';
  const jobType = application.jobType || job.jobType || 'Full-time';
  const experienceLevel = application.experienceLevel || job.experienceLevel;
  const minSalary = application.minSalary ?? job.minSalary;
  const maxSalary = application.maxSalary ?? job.maxSalary;
  const appliedDate = application.appliedAt || application.createdAt;
  const formattedDate = appliedDate
    ? new Date(appliedDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const status = (application.status || 'APPLIED').toUpperCase();

  // Determine timeline progress steps
  const isRejected = status === 'REJECTED';
  const isHired = status === 'HIRED';
  const isInterview = ['INTERVIEW', 'INTERVIEWING'].includes(status);
  const isShortlisted = ['SHORTLISTED', 'IN_REVIEW'].includes(status) || isInterview || isHired;

  const timelineSteps = [
    {
      id: 1,
      title: 'Applied',
      desc: `Submitted on ${formattedDate}`,
      completed: true,
      current: status === 'APPLIED' || status === 'PENDING',
    },
    {
      id: 2,
      title: 'Under Review / Shortlisted',
      desc: isShortlisted ? 'Profile selected for further review' : 'Awaiting recruiter screening',
      completed: isShortlisted,
      current: ['SHORTLISTED', 'IN_REVIEW'].includes(status),
    },
    {
      id: 3,
      title: 'Interview',
      desc: isInterview || isHired ? 'Interview in progress / completed' : 'Technical & behavioral stages',
      completed: isInterview || isHired,
      current: isInterview,
    },
    {
      id: 4,
      title: isRejected ? 'Not Selected' : 'Decision',
      desc: isRejected
        ? 'Application closed'
        : isHired
        ? 'Offer extended & hired!'
        : 'Final hiring outcome',
      completed: isHired || isRejected,
      current: isHired || isRejected,
      isError: isRejected,
    },
  ];

  // Match data for ResumeMatchCard
  const matchData = {
    matchScore:
      application.matchScore ??
      application.resumeMatchScore ??
      application.score,
    matchedSkills:
      application.matchedSkills ||
      application.resumeMatch?.matchedSkills ||
      [],
    missingSkills:
      application.missingSkills ||
      application.resumeMatch?.missingSkills ||
      [],
    totalRequiredSkillsCount:
      application.totalRequiredSkillsCount ||
      application.resumeMatch?.totalRequiredSkillsCount,
    jobTitle: jobTitle,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/seeker/applications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Applications</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Status:</span>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Job Information Header Card */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {jobType}
                </span>
                {experienceLevel && (
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {experienceLevel}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {jobTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-5 text-sm text-slate-600">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>{companyName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{location}</span>
                </div>

                {(minSalary || maxSalary) && (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>
                      {minSalary ? `$${minSalary.toLocaleString()}` : ''}
                      {minSalary && maxSalary ? ' - ' : ''}
                      {maxSalary ? `$${maxSalary.toLocaleString()}` : ''}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Applied on {formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            {(application.jobId || job.id) && (
              <Link
                to={`/jobs/${application.jobId || job.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap self-start"
              >
                <span>View Job Posting</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Job Description Snippet if available */}
          {(application.jobDescription || job.description) && (
            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Job Overview
              </h4>
              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {application.jobDescription || job.description}
              </p>
            </div>
          )}
        </div>

        {/* Application Progress Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Application Progress
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Track where your application stands in the employer's review process
          </p>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {timelineSteps.map((step, idx) => {
                let badgeClass = 'bg-slate-100 text-slate-500 border-slate-300';
                if (step.isError) {
                  badgeClass = 'bg-red-500 text-white border-red-600';
                } else if (step.completed) {
                  badgeClass = 'bg-indigo-600 text-white border-indigo-700';
                } else if (step.current) {
                  badgeClass = 'bg-indigo-100 text-indigo-700 border-indigo-500 ring-2 ring-indigo-300';
                }

                return (
                  <div key={step.id} className="flex md:flex-col items-start gap-3">
                    <div className="flex items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 transition-all ${badgeClass}`}
                      >
                        {step.isError ? (
                          <XCircle className="w-5 h-5" />
                        ) : step.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          step.id
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <h4
                        className={`text-sm font-bold ${
                          step.isError
                            ? 'text-red-600'
                            : step.completed || step.current
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cover Letter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Submitted Cover Letter</h2>
          </div>

          {application.coverLetter ? (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {application.coverLetter}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-lg border border-slate-100">
              No cover letter was attached to this application.
            </p>
          )}
        </div>

        {/* Resume Match Card */}
        <div>
          <ResumeMatchCard matchData={matchData} />
        </div>

        {/* Attached Resume Action Bar */}
        {(application.resumeId || application.resumeFileName || application.resume) && (
          <div className="bg-white rounded-xl shadow-md p-5 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Submitted Resume
                </p>
                <p className="text-sm font-bold text-slate-800 break-all">
                  {application.resumeFileName ||
                    application.resume?.fileName ||
                    'Application Resume'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadSubmittedResume}
              disabled={downloadingResume}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingResume ? 'Downloading...' : 'Download Resume'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
