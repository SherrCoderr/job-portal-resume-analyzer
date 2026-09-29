import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Building2,
  User,
  Users,
  Calendar,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { searchJobs } from '../../api/jobApi';
import { deleteJob } from '../../api/adminApi';
import StatusBadge from '../../components/StatusBadge';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Job deletion modal state
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJobs = useCallback(
    async (currentPage = page) => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          size: pageSize,
          sortBy: 'createdAt',
          sortDir: 'desc',
        };

        const res = await searchJobs(params);
        const data = res?.data || res;

        const content = data?.content || (Array.isArray(data) ? data : []);
        setJobs(content);
        setTotalPages(data?.totalPages || 1);
        setTotalElements(data?.totalElements !== undefined ? data.totalElements : content.length);
        setPage(currentPage);
      } catch (err) {
        console.error('Failed to load jobs for moderation:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to load jobs list.';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize]
  );

  useEffect(() => {
    fetchJobs(page);
  }, [fetchJobs, page]);

  // Open deletion modal
  const confirmDelete = (job) => {
    setJobToDelete(job);
  };

  // Perform job deletion
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      setIsDeleting(true);
      await deleteJob(jobToDelete.id);
      toast.success(`Job "${jobToDelete.title}" has been deleted.`);
      setJobToDelete(null);
      // Refresh job listings
      fetchJobs(page);
    } catch (err) {
      console.error('Failed to delete job posting:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete job posting.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side search and status filter
  const filteredJobs = jobs.filter((job) => {
    const titleMatch = (job?.title || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
    const companyMatch = (job?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
    const recruiterMatch = (job?.recruiterName || job?.recruiterEmail || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());

    const matchesSearch = !searchQuery.trim() || titleMatch || companyMatch || recruiterMatch;

    const currentStatus = (job?.status || '').toUpperCase();
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && currentStatus === 'ACTIVE') ||
      (statusFilter === 'CLOSED' && currentStatus !== 'ACTIVE');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-indigo-600" />
              <span>Job Postings Moderation</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Audit all recruiter job listings, inspect applicant numbers, and delete non-compliant posts.
            </p>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
            Total Listings: <span className="text-indigo-600 font-bold">{totalElements}</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, company name, or recruiter..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="CLOSED">Closed Only</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => fetchJobs(page)}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3" />
              <p className="text-sm text-slate-500 font-medium">Fetching job listings...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No job listings found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No jobs match your search or status filter. Try resetting filters.'
                  : 'There are currently no job postings in the database.'}
              </p>
              {(searchQuery || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-6">Job Title</th>
                      <th className="py-3.5 px-6">Company</th>
                      <th className="py-3.5 px-6">Recruiter</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-center">Applicants</th>
                      <th className="py-3.5 px-6">Created Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredJobs.map((job) => {
                      const createdDate = job?.createdAt
                        ? new Date(job.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—';

                      return (
                        <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Title */}
                          <td className="py-4 px-6 font-bold text-slate-900 max-w-[220px]">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="hover:text-indigo-600 transition-colors line-clamp-1"
                              title={job.title}
                            >
                              {job.title}
                            </Link>
                            <div className="text-2xs text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                              <span>ID: #{job.id}</span>
                              {job.jobType && (
                                <>
                                  <span>&bull;</span>
                                  <span>{job.jobType.replace(/_/g, ' ')}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Company */}
                          <td className="py-4 px-6 text-slate-700">
                            <div className="flex items-center gap-1.5 font-semibold text-xs">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">
                                {job.companyName || 'Not specified'}
                              </span>
                            </div>
                            {job.location && (
                              <div className="text-2xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{job.location}</span>
                              </div>
                            )}
                          </td>

                          {/* Recruiter */}
                          <td className="py-4 px-6 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px]">
                                {job.recruiterName || 'Unknown'}
                              </span>
                            </div>
                            {job.recruiterEmail && (
                              <div className="text-2xs text-slate-400 truncate max-w-[150px] mt-0.5">
                                {job.recruiterEmail}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <StatusBadge status={job.status || 'ACTIVE'} />
                          </td>

                          {/* Applicants */}
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                              <span>{job.applicantCount ?? 0}</span>
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="py-4 px-6 text-xs text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{createdDate}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* View Details Link */}
                              <Link
                                to={`/jobs/${job.id}`}
                                title="View public job posting"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </Link>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => confirmDelete(job)}
                                title="Moderate: Delete job listing"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="sr-only">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredJobs.map((job) => {
                  const createdDate = job?.createdAt
                    ? new Date(job.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <div key={job.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/jobs/${job.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 block line-clamp-1"
                          >
                            {job.title}
                          </Link>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{job.companyName || 'Company'}</span>
                          </div>
                        </div>
                        <StatusBadge status={job.status || 'ACTIVE'} />
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 gap-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.recruiterName || job.recruiterEmail || 'Recruiter'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.applicantCount ?? 0} Applicants</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{createdDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Job</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => confirmDelete(job)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                  <div>
                    Showing page <span className="font-bold text-slate-900">{page + 1}</span> of{' '}
                    <span className="font-bold text-slate-900">{totalPages}</span> ({totalElements}{' '}
                    total jobs)
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        if (
                          idx === 0 ||
                          idx === totalPages - 1 ||
                          Math.abs(idx - page) <= 1
                        ) {
                          return (
                            <button
                              key={`p-btn-${idx}`}
                              type="button"
                              onClick={() => setPage(idx)}
                              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                page === idx
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          );
                        }
                        if (idx === 1 || idx === totalPages - 2) {
                          return (
                            <span key={`dots-${idx}`} className="px-1 text-slate-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {jobToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Remove Job Posting</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Are you sure you want to permanently remove{' '}
                    <span className="font-bold text-slate-800">"{jobToDelete.title}"</span>?
                    This will delete this job posting from the portal and remove its applicant references.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setJobToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteJob}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
