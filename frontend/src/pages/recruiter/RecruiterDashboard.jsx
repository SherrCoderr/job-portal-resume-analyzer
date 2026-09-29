import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  Clock, 
  PlusCircle, 
  ArrowRight, 
  TrendingUp, 
  Award,
  AlertCircle,
  RefreshCw,
  Building,
  UserCheck
} from 'lucide-react';
import { getRecruiterJobs } from '../../api/jobApi';
import { getRecruiterApplications } from '../../api/applicationApi';
import { useAuth } from '../../context/AuthContext';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    shortlistedApplicants: 0,
  });
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        getRecruiterJobs(0, 100).catch((err) => {
          console.error('Failed to load recruiter jobs:', err);
          return null;
        }),
        getRecruiterApplications(0, 100).catch((err) => {
          console.error('Failed to load recruiter applications:', err);
          return null;
        }),
      ]);

      const jobsData = jobsRes?.data?.content || jobsRes?.content || [];
      const totalJobs = jobsRes?.data?.totalElements ?? jobsData.length;
      const activeJobs = jobsData.filter((job) => job.status === 'ACTIVE').length;

      const appsData = appsRes?.data?.content || appsRes?.content || [];
      const totalApps = appsRes?.data?.totalElements ?? appsData.length;
      const shortlisted = appsData.filter((app) => app.status === 'SHORTLISTED').length;

      setStats({
        totalJobs,
        activeJobs,
        totalApplicants: totalApps,
        shortlistedApplicants: shortlisted,
      });

      // Get last 5 recent applicants
      const sortedApps = [...appsData].sort(
        (a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0)
      );
      setRecentApplicants(sortedApps.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const getScoreBadge = (score) => {
    if (score == null) return null;
    const numScore = Math.round(score);
    let colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (numScore < 50) {
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (numScore < 75) {
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colorClass}`}>
        <Award className="w-3 h-3 mr-1" />
        {numScore}% Match
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-xs font-medium mb-3 backdrop-blur-sm border border-indigo-400/20">
              <Building className="w-3.5 h-3.5 mr-1.5" />
              Recruiter Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.fullName || 'Recruiter'}!
            </h1>
            <p className="mt-1.5 text-indigo-200 text-sm sm:text-base max-w-2xl">
              Track candidate matches, oversee your active job openings, and streamline your hiring pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/recruiter/jobs/create"
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white text-indigo-600 font-semibold text-sm shadow hover:bg-indigo-50 transition duration-150 ease-in-out"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Post New Job
            </Link>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center px-3.5 py-2.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-800 text-white font-medium text-sm border border-indigo-600 transition"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Jobs Posted</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '-' : stats.totalJobs}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Created by your organization</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Jobs</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {loading ? '-' : stats.activeJobs}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Currently open for applications</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Applicants */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Applicants</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? '-' : stats.totalApplicants}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Received candidates</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Shortlisted Candidates */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Shortlisted</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">
              {loading ? '-' : stats.shortlistedApplicants}
            </h3>
            <p className="text-xs text-slate-400 mt-1">High-potential matches</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions + Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions & Overview Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span>Quick Actions</span>
            </h2>
            <div className="space-y-3">
              <Link
                to="/recruiter/jobs/create"
                className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition duration-150 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Post New Job</p>
                    <p className="text-xs text-slate-500">Define requirements & skills</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                to="/recruiter/jobs"
                className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition duration-150 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Manage Jobs</p>
                    <p className="text-xs text-slate-500">Edit, close or view postings</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                to="/recruiter/company"
                className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition duration-150 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Company Profile</p>
                    <p className="text-xs text-slate-500">Branding, website & details</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>

          {/* Hiring Tip Card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
            <div className="flex items-start space-x-3">
              <Award className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-indigo-900">Deterministic Match Score</h4>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                  Our system evaluates resume skills against your exact job requirements, giving you instant confidence before opening a single CV.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Applicants (Last 5) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Applicants</h2>
                <p className="text-xs text-slate-500 mt-0.5">Latest candidates across your posted roles</p>
              </div>
              <Link
                to="/recruiter/jobs"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                View Jobs <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
                <p className="text-sm">Loading recent applicants...</p>
              </div>
            ) : recentApplicants.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-700">No applicants yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Once candidates apply to your active job listings, their details and match scores will appear right here.
                </p>
                <Link
                  to="/recruiter/jobs/create"
                  className="mt-4 inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" /> Post a Job
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplicants.map((app) => {
                  const matchScore = app.resumeMatch?.matchScore;
                  return (
                    <div
                      key={app.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2.5 rounded-lg transition"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm flex-shrink-0">
                          {app.jobSeekerName ? app.jobSeekerName.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {app.jobSeekerName || 'Anonymous Candidate'}
                            </span>
                            {getScoreBadge(matchScore)}
                          </div>
                          <p className="text-xs font-medium text-indigo-600 mt-0.5">
                            Applied for: {app.jobTitle}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                            <span>{app.jobSeekerEmail}</span>
                            {app.appliedAt && (
                              <>
                                <span>•</span>
                                <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                        <Link
                          to={`/recruiter/applicants/${app.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          Details
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
