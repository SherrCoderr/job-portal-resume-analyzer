import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  Calendar, 
  Download, 
  FileText, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApplicationById, updateApplicationStatus } from '../../api/applicationApi';
import { downloadResume } from '../../api/resumeApi';
import ResumeMatchCard from '../../components/ResumeMatchCard';

const STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'Applied', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'HIRED', label: 'Hired', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const ApplicantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('APPLIED');
  const [savingStatus, setSavingStatus] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);

  useEffect(() => {
    const loadApplication = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getApplicationById(id);
        const data = res?.data || res;
        setApplication(data);
        if (data?.status) {
          setSelectedStatus(data.status);
        }
      } catch (err) {
        console.error('Error loading applicant details:', err);
        toast.error('Failed to load candidate application details');
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id || selectedStatus === application?.status) return;

    setSavingStatus(true);
    try {
      const res = await updateApplicationStatus(id, { status: selectedStatus });
      const updated = res?.data || res;
      setApplication((prev) => ({ ...prev, status: selectedStatus }));
      toast.success(`Application status updated to ${selectedStatus}!`);
    } catch (err) {
      console.error('Failed to update application status:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update candidate status';
      toast.error(errMsg);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!application?.resumeId) {
      toast.error('No resume file attached to this candidate');
      return;
    }

    setDownloadingResume(true);
    try {
      const blob = await downloadResume(application.resumeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName =
        application.resumeFileName ||
        `${(application.jobSeekerName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Resume downloaded successfully');
    } catch (err) {
      console.error('Failed to download resume:', err);
      toast.error('Unable to download candidate resume');
    } finally {
      setDownloadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium text-sm">Loading applicant profile & analysis...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Application Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">
          This candidate application might have been deleted or does not exist.
        </p>
        <Link
          to="/recruiter/jobs"
          className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Return to Manage Jobs
        </Link>
      </div>
    );
  }

  const backLink = application.jobId
    ? `/recruiter/jobs/${application.jobId}/applicants`
    : '/recruiter/jobs';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb / Back Link */}
      <div>
        <Link
          to={backLink}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Applicants
        </Link>

        {/* Candidate Header Profile Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-2xl sm:text-3xl shadow-sm flex-shrink-0">
                {application.jobSeekerName ? application.jobSeekerName.charAt(0).toUpperCase() : 'C'}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {application.jobSeekerName || 'Anonymous Candidate'}
                  </h1>
                  <span
                    className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border ${
                      STATUS_OPTIONS.find((s) => s.value === application.status)?.color ||
                      'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {application.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-500 mt-2">
                  {application.jobSeekerEmail && (
                    <a
                      href={`mailto:${application.jobSeekerEmail}`}
                      className="flex items-center hover:text-indigo-600 transition"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {application.jobSeekerEmail}
                    </a>
                  )}
                  {application.jobSeekerPhone && (
                    <a
                      href={`tel:${application.jobSeekerPhone}`}
                      className="flex items-center hover:text-indigo-600 transition"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {application.jobSeekerPhone}
                    </a>
                  )}
                  {application.appliedAt && (
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Applied on {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Resume Download Action */}
            <div className="flex items-center space-x-3 self-start md:self-center">
              {application.resumeId && (
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  disabled={downloadingResume}
                  className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-300 shadow-sm transition disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 mr-1.5 ${downloadingResume ? 'animate-bounce' : ''}`} />
                  {downloadingResume ? 'Downloading...' : 'Download Resume'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Column (Application details & cover letter) + Right Column (Match Breakdown & Status Management) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Info & Cover Letter */}
        <div className="lg:col-span-1 space-y-6">
          {/* Target Job Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Position Applied For
            </h3>
            <div>
              <h4 className="text-base font-bold text-slate-900">{application.jobTitle}</h4>
              <p className="text-xs text-indigo-600 font-medium mt-0.5">
                {application.companyName || 'Company'}
              </p>
              {application.jobLocation && (
                <p className="text-xs text-slate-500 mt-1">{application.jobLocation}</p>
              )}
            </div>

            {application.jobId && (
              <div className="pt-2">
                <Link
                  to={`/recruiter/jobs/${application.jobId}/applicants`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                >
                  View all applicants for this job <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            )}
          </div>

          {/* Status Update Control */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Update Candidate Status
            </h3>

            <div>
              <label htmlFor="status" className="block text-xs font-semibold text-slate-700 mb-2">
                Pipeline Stage
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800 bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={savingStatus || selectedStatus === application.status}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow transition disabled:opacity-50"
            >
              {savingStatus ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving Status...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Status
                </>
              )}
            </button>
          </div>

          {/* Attached Resume File Metadata */}
          {application.resumeFileName && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {application.resumeFileName}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Parsed resume document</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Resume Match Breakdown & Cover Letter */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume Match Breakdown Component */}
          <ResumeMatchCard match={application.resumeMatch} />

          {/* Cover Letter Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-4">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Cover Letter / Note</h3>
            </div>

            {application.coverLetter ? (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {application.coverLetter}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs italic">No cover letter was submitted with this application.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetails;
