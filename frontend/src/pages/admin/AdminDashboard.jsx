import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  UserCheck,
  Building,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Layers,
  ArrowRight,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboardStats } from '../../api/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await getDashboardStats();
      const data = res?.data || res;
      setStats(data);
      if (isManualRefresh) {
        toast.success('Dashboard metrics refreshed');
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to load system analytics.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4" />
          <p className="text-slate-600 font-semibold text-base">Loading administrative metrics...</p>
        </div>
      </div>
    );
  }

  // Format Status Key to readable label
  const formatStatusLabel = (key = '') => {
    return key
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Color mapping for application statuses
  const getStatusColorConfig = (statusKey = '') => {
    const key = statusKey.toUpperCase();
    switch (key) {
      case 'APPLIED':
      case 'PENDING':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          bar: 'bg-blue-500',
          icon: Clock,
        };
      case 'SHORTLISTED':
      case 'IN_REVIEW':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          bar: 'bg-amber-500',
          icon: TrendingUp,
        };
      case 'INTERVIEW':
      case 'INTERVIEWING':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          bar: 'bg-purple-500',
          icon: UserCheck,
        };
      case 'HIRED':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          bar: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          bar: 'bg-rose-500',
          icon: XCircle,
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          bar: 'bg-slate-500',
          icon: FileText,
        };
    }
  };

  const applicationsByStatus = stats?.applicationsByStatus || {};
  const jobsByType = stats?.jobsByType || {};
  const totalApps = stats?.totalApplications || 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Shield className="w-3.5 h-3.5" />
                Administrator Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Analytics & Overview
            </h1>
            <p className="text-slate-500 text-sm">
              Live statistics, platform user distributions, active jobs, and candidate hiring pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchStats(true)}
              className="text-xs font-bold text-red-700 hover:text-red-900 underline ml-4 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Primary Stats Cards Grid (8 Cards) */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Key Platform Metrics</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Total Users */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Users
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                    {(stats?.totalUsers || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>All registered accounts</span>
                <Link to="/admin/users" className="text-indigo-600 font-semibold hover:underline">
                  View users &rarr;
                </Link>
              </div>
            </div>

            {/* 2. Job Seekers */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Job Seekers
                  </p>
                  <h3 className="text-3xl font-extrabold text-blue-600 mt-1">
                    {(stats?.totalJobSeekers || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>
                  {stats?.totalUsers
                    ? `${Math.round(((stats.totalJobSeekers || 0) / stats.totalUsers) * 100)}% of total users`
                    : 'Candidates with resumes'}
                </span>
              </div>
            </div>

            {/* 3. Recruiters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Recruiters
                  </p>
                  <h3 className="text-3xl font-extrabold text-purple-600 mt-1">
                    {(stats?.totalRecruiters || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>Hiring company representatives</span>
              </div>
            </div>

            {/* 4. Total Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Jobs Posted
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                    {(stats?.totalJobs || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>Across all companies</span>
                <Link to="/admin/jobs" className="text-indigo-600 font-semibold hover:underline">
                  Moderate jobs &rarr;
                </Link>
              </div>
            </div>

            {/* 5. Active Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Active Jobs
                  </p>
                  <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
                    {(stats?.activeJobs || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>
                  {stats?.totalJobs
                    ? `${Math.round(((stats.activeJobs || 0) / stats.totalJobs) * 100)}% currently accepting applicants`
                    : 'Open vacancies'}
                </span>
              </div>
            </div>

            {/* 6. Total Applications */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Applications
                  </p>
                  <h3 className="text-3xl font-extrabold text-cyan-600 mt-1">
                    {(stats?.totalApplications || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>Candidate submissions</span>
              </div>
            </div>

            {/* 7. Shortlisted */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Shortlisted
                  </p>
                  <h3 className="text-3xl font-extrabold text-amber-600 mt-1">
                    {(stats?.shortlistedCount || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>Advanced to screening</span>
              </div>
            </div>

            {/* 8. Hired */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Hired Candidates
                  </p>
                  <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">
                    {(stats?.hiredCount || 0).toLocaleString()}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>Successful placements</span>
              </div>
            </div>
          </div>
        </div>

        {/* Applications by Status Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Applications by Status Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current distribution of all candidate applications across lifecycle stages
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
              {totalApps} Total Submissions
            </span>
          </div>

          {Object.keys(applicationsByStatus).length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm italic">
              No application status records found yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(applicationsByStatus).map(([statusKey, count]) => {
                const config = getStatusColorConfig(statusKey);
                const IconComponent = config.icon;
                const percentage = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;

                return (
                  <div
                    key={statusKey}
                    className={`rounded-xl border p-4 ${config.bg} ${config.border} flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>
                          {formatStatusLabel(statusKey)}
                        </span>
                        <IconComponent className={`w-4 h-4 ${config.text}`} />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {count.toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-2xs text-slate-500 font-semibold mb-1">
                        <span>Share</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-white/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${config.bar}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Jobs By Type & Quick Admin Actions (2-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jobs by Type Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Job Postings by Employment Type</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distribution of full-time, part-time, contract, and remote positions
                  </p>
                </div>
              </div>

              {Object.keys(jobsByType).length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm italic">
                  No job category data available.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(jobsByType).map(([typeKey, count]) => {
                    const totalJobs = stats?.totalJobs || 1;
                    const percent = Math.round((count / totalJobs) * 100);

                    return (
                      <div key={typeKey} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-700">{formatStatusLabel(typeKey)}</span>
                          <span className="text-slate-900">
                            {count} <span className="text-slate-400 font-normal">({percent}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                to="/admin/jobs"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                <span>View and moderate all job listings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Administrative Shortcuts */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-slate-100 mb-5">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Administrative Operations</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Frequently accessed moderation controls and management views
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        User Management
                      </h4>
                      <p className="text-xs text-slate-500">
                        View, filter, enable/disable or remove system users
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/admin/jobs"
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        Job Postings Moderation
                      </h4>
                      <p className="text-xs text-slate-500">
                        Inspect active and closed jobs, audit applicants, remove listings
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/jobs"
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        Live Job Portal
                      </h4>
                      <p className="text-xs text-slate-500">
                        Browse active job listings as experienced by job seekers
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-2xs text-slate-400 text-center">
              Logged in with system role: ROLE_ADMIN
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
