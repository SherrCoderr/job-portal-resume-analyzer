import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Download, 
  Eye, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle, 
  Briefcase,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getJobApplicants, updateApplicationStatus } from '../../api/applicationApi';
import { getJobById } from '../../api/jobApi';
import { downloadResume } from '../../api/resumeApi';

const STATUS_OPTIONS = ['APPLIED', 'SHORTLISTED', 'HIRED', 'REJECTED'];

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Status updating indicator
  const [updatingId, setUpdatingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchJobAndApplicants = async (page = 0) => {
    if (!jobId) return;
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        getJobById(jobId).catch((err) => {
          console.error('Failed to get job:', err);
          return null;
        }),
        getJobApplicants(jobId, page, pageSize).catch((err) => {
          console.error('Failed to get applicants:', err);
          return null;
        }),
      ]);

      if (jobRes) {
        setJob(jobRes?.data || jobRes);
      }

      const appsData = appsRes?.data || appsRes;
      setApplicants(appsData?.content || []);
      setTotalPages(appsData?.totalPages || 0);
      setTotalElements(appsData?.totalElements || 0);
      setCurrentPage(appsData?.pageNumber ?? page);
    } catch (err) {
      console.error('Error fetching job applicants:', err);
      toast.error('Failed to load job applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndApplicants(currentPage);
  }, [jobId, currentPage]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await updateApplicationStatus(appId, { status: newStatus });
      setApplicants((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
      toast.success(`Candidate status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update status';
      toast.error(errMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownload = async (resumeId, applicantName, fileName) => {
    if (!resumeId) {
      toast.error('No resume document attached to this application');
      return;
    }
    setDownloadingId(resumeId);
    try {
      const blob = await downloadResume(resumeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const downloadName = fileName || `${(applicantName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`;
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Resume download complete');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download resume');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SHORTLISTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'HIRED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'APPLIED':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Filter applicants locally for quick responsiveness
  const filteredApplicants = applicants.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      app.jobSeekerName?.toLowerCase().includes(query) ||
      app.jobSeekerEmail?.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button and Job Header */}
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Manage Jobs
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-1">
              <Briefcase className="w-4 h-4" />
              <span>{job?.companyName || 'Company'}</span>
              <span>•</span>
              <span className="capitalize">{job?.jobType?.replace('_', ' ').toLowerCase() || 'Full Time'}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {job?.title || 'Applicants'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Location: <span className="font-medium text-slate-700">{job?.location || 'Not specified'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-center">
              <span className="block text-2xl font-bold text-indigo-600">
                {totalElements}
              </span>
              <span className="text-xs text-indigo-800 font-medium">Total Applicants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-center">
          {['ALL', 'APPLIED', 'SHORTLISTED', 'HIRED', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search candidate name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs text-slate-800"
          />
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-500">Loading applicants...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No applicants found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No candidates match your current filters. Try changing filters.'
                : 'No candidates have applied to this position yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Resume Match</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Applied Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredApplicants.map((app) => {
                  const matchScore = app.resumeMatch?.matchScore;
                  const numScore = matchScore != null ? Math.round(matchScore) : null;
                  
                  let scoreBarColor = 'bg-emerald-500';
                  let scoreTextColor = 'text-emerald-700';
                  if (numScore != null && numScore < 50) {
                    scoreBarColor = 'bg-rose-500';
                    scoreTextColor = 'text-rose-700';
                  } else if (numScore != null && numScore < 75) {
                    scoreBarColor = 'bg-amber-500';
                    scoreTextColor = 'text-amber-700';
                  }

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition">
                      {/* Candidate Avatar & Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm flex-shrink-0">
                            {app.jobSeekerName ? app.jobSeekerName.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <Link
                              to={`/recruiter/applicants/${app.id}`}
                              className="font-semibold text-slate-900 hover:text-indigo-600 transition"
                            >
                              {app.jobSeekerName || 'Anonymous Candidate'}
                            </Link>
                            {app.resumeFileName && (
                              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">
                                {app.resumeFileName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6 text-slate-600">
                        <div className="space-y-1 text-xs">
                          {app.jobSeekerEmail && (
                            <div className="flex items-center text-slate-600">
                              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate max-w-[190px]">{app.jobSeekerEmail}</span>
                            </div>
                          )}
                          {app.jobSeekerPhone && (
                            <div className="flex items-center text-slate-500">
                              <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                              <span>{app.jobSeekerPhone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Match Score */}
                      <td className="py-4 px-6">
                        {numScore != null ? (
                          <div className="w-32">
                            <div className="flex justify-between items-center text-xs font-bold mb-1">
                              <span className={scoreTextColor}>{numScore}% Match</span>
                              <span className="text-slate-400 font-normal text-[10px]">
                                {app.resumeMatch?.matchedSkillsCount || 0}/
                                {app.resumeMatch?.totalRequiredSkillsCount || 0}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${scoreBarColor}`}
                                style={{ width: `${Math.min(numScore, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not calculated</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6">
                        <div className="relative inline-block">
                          <select
                            value={app.status}
                            disabled={updatingId === app.id}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer appearance-none pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${getStatusBadge(
                              app.status
                            )}`}
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center space-x-2">
                          {/* Download Resume Button */}
                          {app.resumeId && (
                            <button
                              type="button"
                              onClick={() => handleDownload(app.resumeId, app.jobSeekerName, app.resumeFileName)}
                              disabled={downloadingId === app.resumeId}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Download Resume"
                            >
                              <Download className={`w-4 h-4 ${downloadingId === app.resumeId ? 'animate-bounce' : ''}`} />
                            </button>
                          )}

                          {/* View Details */}
                          <Link
                            to={`/recruiter/applicants/${app.id}`}
                            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                            title="View Full Profile & Analysis"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-700">{currentPage + 1}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalPages}</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
                className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicants;
