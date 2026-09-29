import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Calendar, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  PlusCircle, 
  Eye, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getRecruiterJobs, toggleJobStatus, deleteJob } from '../../api/jobApi';

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Status toggle & delete state
  const [actionInProgress, setActionInProgress] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJobs = async (page = 0) => {
    setLoading(true);
    try {
      const res = await getRecruiterJobs(page, pageSize);
      const data = res?.data || res;
      setJobs(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
      setCurrentPage(data?.pageNumber ?? page);
    } catch (err) {
      console.error('Failed to fetch recruiter jobs:', err);
      toast.error('Failed to load your job listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const handleToggleStatus = async (job) => {
    setActionInProgress(job.id);
    try {
      const res = await toggleJobStatus(job.id);
      const updated = res?.data || res;
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: updated?.status || (j.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE') } : j))
      );
      toast.success(`Job marked as ${updated?.status || 'updated'}`);
    } catch (err) {
      console.error('Error toggling job status:', err);
      toast.error('Failed to update job status');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await deleteJob(jobToDelete.id);
      toast.success('Job listing deleted successfully');
      setJobToDelete(null);
      // Refresh current page or previous page if last item deleted
      if (jobs.length === 1 && currentPage > 0) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchJobs(currentPage);
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      toast.error('Failed to delete job posting');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter jobs by title or location locally for quick filtering
  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(term) ||
      job.location?.toLowerCase().includes(term) ||
      job.companyName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Job Postings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Oversee active and closed positions, monitor applications, and manage listing statuses.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/create"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow transition self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Post New Job
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by job title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
          Showing <span className="font-semibold text-slate-700">{filteredJobs.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{totalElements}</span> jobs
        </div>
      </div>

      {/* Jobs Table / Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-500">Loading your jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No job postings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm
                ? 'No jobs match your search filter. Try clearing the filter.'
                : "You haven't posted any jobs yet. Start hiring top talent today!"}
            </p>
            {!searchTerm && (
              <Link
                to="/recruiter/jobs/create"
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Post Your First Job
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Job Title & Details</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Applicants</th>
                  <th className="py-3.5 px-6">Posted Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredJobs.map((job) => {
                  const isActive = job.status === 'ACTIVE';
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6">
                        <div>
                          <Link
                            to={`/recruiter/jobs/${job.id}/applicants`}
                            className="font-semibold text-slate-900 hover:text-indigo-600 transition"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                            <span className="font-medium text-slate-600">
                              {job.companyName || 'Company'}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{job.jobType?.replace('_', ' ').toLowerCase()}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex items-center text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
                          <span>{job.location}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {job.status}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <Link
                          to={`/recruiter/jobs/${job.id}/applicants`}
                          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition"
                        >
                          <Users className="w-3.5 h-3.5 mr-1" />
                          <span>{job.applicantCount || 0} applicants</span>
                        </Link>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500">
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString()
                          : '-'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center space-x-2">
                          {/* View Applicants button */}
                          <Link
                            to={`/recruiter/jobs/${job.id}/applicants`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="View Applicants"
                          >
                            <Users className="w-4 h-4" />
                          </Link>

                          {/* Edit button */}
                          <Link
                            to={`/recruiter/jobs/${job.id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Job"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {/* Toggle status button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(job)}
                            disabled={actionInProgress === job.id}
                            className={`p-1.5 rounded-lg transition ${
                              isActive
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={isActive ? 'Deactivate / Close Job' : 'Reopen / Activate Job'}
                          >
                            {actionInProgress === job.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                            ) : isActive ? (
                              <ToggleRight className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => setJobToDelete(job)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Job Posting</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-slate-900">"{jobToDelete.title}"</span>? All
              candidate match histories and applications associated with this job will be impacted.
            </p>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteJob}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete Job
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
