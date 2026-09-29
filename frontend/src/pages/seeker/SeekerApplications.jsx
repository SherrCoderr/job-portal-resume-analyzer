import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Filter,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Clock,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyApplications } from '../../api/applicationApi';
import StatusBadge from '../../components/StatusBadge';

export default function SeekerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLast, setIsLast] = useState(true);

  // Fetch applications
  const fetchApplications = async (targetPage = 0) => {
    try {
      setLoading(true);
      const res = await getMyApplications(targetPage, pageSize);
      const data = res?.data || res;

      const content = data?.content || (Array.isArray(data) ? data : []);
      setApplications(content);

      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements !== undefined ? data.totalElements : content.length);
      setIsLast(data?.isLast !== undefined ? data.isLast : targetPage >= (data?.totalPages || 1) - 1);
      setPage(targetPage);
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(page);
  }, [page]);

  // Client-side filter for quick local searching & status filtering
  const filteredApplications = applications.filter((app) => {
    const title = app?.jobTitle || app?.job?.title || '';
    const company = app?.companyName || app?.job?.companyName || app?.job?.company?.name || '';
    const location = app?.location || app?.job?.location || '';
    const status = (app?.status || '').toUpperCase();

    const matchesStatus =
      statusFilter === 'ALL' ||
      status === statusFilter ||
      (statusFilter === 'INTERVIEW' && ['INTERVIEW', 'INTERVIEWING'].includes(status));

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      title.toLowerCase().includes(query) ||
      company.toLowerCase().includes(query) ||
      location.toLowerCase().includes(query);

    return matchesStatus && matchesQuery;
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getMatchScoreBadge = (score) => {
    if (score === null || score === undefined) return null;
    const rounded = Math.round(score <= 1 && score > 0 ? score * 100 : score);

    let color = 'bg-slate-50 text-slate-700 border-slate-200';
    if (rounded >= 75) {
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (rounded >= 50) {
      color = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
        <Sparkles className="w-3 h-3" />
        <span>{rounded}% Match</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              My Applications
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track the progress, status, and resume match score of all roles you've applied to.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <Search className="w-4 h-4" />
            <span>Browse More Jobs</span>
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, company, or location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider shrink-0">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPLIED">Applied / Pending</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW">Interview</option>
              <option value="HIRED">Hired</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications List Card */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3" />
              <p className="text-sm text-slate-500">Loading your applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No matching applications found'
                  : 'You have not submitted any applications yet'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try clearing or changing your filters to see more results.'
                  : 'Explore current openings and apply to launch your next career move.'}
              </p>
              {searchQuery || statusFilter !== 'ALL' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Clear all filters
                </button>
              ) : (
                <div className="mt-5">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Browse Open Positions</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-6">Job Role & Company</th>
                      <th className="py-3.5 px-6">Location</th>
                      <th className="py-3.5 px-6">Applied Date</th>
                      <th className="py-3.5 px-6">Match Score</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredApplications.map((app) => {
                      const jobTitle = app?.jobTitle || app?.job?.title || 'Job Title';
                      const companyName =
                        app?.companyName || app?.job?.companyName || app?.job?.company?.name || 'Company';
                      const location = app?.location || app?.job?.location || 'Remote';
                      const appliedDate = app?.appliedAt || app?.createdAt;
                      const formattedDate = appliedDate
                        ? new Date(appliedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent';

                      const matchScore = app?.matchScore ?? app?.resumeMatchScore;

                      return (
                        <tr
                          key={app.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                                {companyName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <Link
                                  to={`/seeker/applications/${app.id}`}
                                  className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block"
                                >
                                  {jobTitle}
                                </Link>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  <span>{companyName}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-slate-600 text-xs">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{location}</span>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-slate-600 text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formattedDate}</span>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            {getMatchScoreBadge(matchScore) || (
                              <span className="text-xs text-slate-400 italic">—</span>
                            )}
                          </td>

                          <td className="py-4 px-6">
                            <StatusBadge status={app.status || 'APPLIED'} />
                          </td>

                          <td className="py-4 px-6 text-right">
                            <Link
                              to={`/seeker/applications/${app.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredApplications.map((app) => {
                  const jobTitle = app?.jobTitle || app?.job?.title || 'Job Title';
                  const companyName =
                    app?.companyName || app?.job?.companyName || app?.job?.company?.name || 'Company';
                  const location = app?.location || app?.job?.location || 'Remote';
                  const appliedDate = app?.appliedAt || app?.createdAt;
                  const formattedDate = appliedDate
                    ? new Date(appliedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  const matchScore = app?.matchScore ?? app?.resumeMatchScore;

                  return (
                    <div key={app.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/seeker/applications/${app.id}`}
                            className="text-base font-bold text-slate-900 hover:text-indigo-600"
                          >
                            {jobTitle}
                          </Link>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{companyName}</span>
                          </div>
                        </div>
                        <StatusBadge status={app.status || 'APPLIED'} />
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formattedDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div>
                          {getMatchScoreBadge(matchScore)}
                        </div>

                        <Link
                          to={`/seeker/applications/${app.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors"
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
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div>
                    Showing page <span className="font-semibold text-slate-900">{page + 1}</span> of{' '}
                    <span className="font-semibold text-slate-900">{totalPages}</span> (
                    {totalElements} total)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => handlePageChange(page - 1)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      // Only show adjacent pages if many pages
                      if (
                        idx === 0 ||
                        idx === totalPages - 1 ||
                        Math.abs(idx - page) <= 1
                      ) {
                        return (
                          <button
                            key={`page-btn-${idx}`}
                            onClick={() => handlePageChange(idx)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              page === idx
                                ? 'bg-indigo-600 text-white'
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

                    <button
                      type="button"
                      disabled={isLast || page >= totalPages - 1}
                      onClick={() => handlePageChange(page + 1)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
