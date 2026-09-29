import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  UploadCloud,
  User,
  Search,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getMyApplications } from '../../api/applicationApi';
import { getSeekerProfile } from '../../api/profileApi';
import StatusBadge from '../../components/StatusBadge';

export default function SeekerDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    shortlisted: 0,
    interviewsHired: 0,
    activeResumeName: null,
  });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch applications and seeker profile concurrently
        const [appsRes, profileRes] = await Promise.allSettled([
          getMyApplications(0, 50),
          getSeekerProfile(),
        ]);

        if (!isMounted) return;

        // Process Applications data
        let allApps = [];
        let totalCount = 0;
        if (appsRes.status === 'fulfilled') {
          const raw = appsRes.value?.data || appsRes.value;
          allApps = raw?.content || (Array.isArray(raw) ? raw : []);
          totalCount = raw?.totalElements !== undefined ? raw.totalElements : allApps.length;
        }

        // Process Profile data
        let profileData = null;
        if (profileRes.status === 'fulfilled') {
          profileData = profileRes.value?.data || profileRes.value;
          setProfile(profileData);
        }

        // Calculate statistics
        const shortlistedCount = allApps.filter(
          (app) => (app?.status || '').toUpperCase() === 'SHORTLISTED'
        ).length;

        const interviewOrHiredCount = allApps.filter((app) => {
          const s = (app?.status || '').toUpperCase();
          return s === 'INTERVIEW' || s === 'INTERVIEWING' || s === 'HIRED' || s === 'OFFERED';
        }).length;

        const activeResumeTitle =
          profileData?.activeResume?.fileName ||
          profileData?.activeResumeName ||
          profileData?.resumeFileName ||
          (profileData?.resumeId ? 'Resume Uploaded' : null);

        setStats({
          totalApplications: totalCount,
          shortlisted: shortlistedCount,
          interviewsHired: interviewOrHiredCount,
          activeResumeName: activeResumeTitle,
        });

        // Take the latest 5 applications
        setRecentApplications(allApps.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        if (isMounted) {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName =
    user?.fullName ||
    user?.name ||
    (user?.email ? user.email.split('@')[0] : 'Job Seeker');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/40 text-indigo-100 backdrop-blur-sm mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Candidate Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
              Track your job applications, optimize your resume for ATS matching, and discover new career opportunities.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-white to-transparent pointer-events-none" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Applications */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Applications
                </p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">
                  {loading ? (
                    <span className="inline-block w-8 h-8 bg-slate-200 animate-pulse rounded"></span>
                  ) : (
                    stats.totalApplications
                  )}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>All submitted roles</span>
            </div>
          </div>

          {/* Card 2: Shortlisted */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Shortlisted
                </p>
                <h3 className="text-3xl font-bold text-amber-600 mt-1">
                  {loading ? (
                    <span className="inline-block w-8 h-8 bg-slate-200 animate-pulse rounded"></span>
                  ) : (
                    stats.shortlisted
                  )}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-700">
              <span>Selected for review</span>
            </div>
          </div>

          {/* Card 3: Interviews / Hired */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Interviews / Hired
                </p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-1">
                  {loading ? (
                    <span className="inline-block w-8 h-8 bg-slate-200 animate-pulse rounded"></span>
                  ) : (
                    stats.interviewsHired
                  )}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-700">
              <span>Active advances & offers</span>
            </div>
          </div>

          {/* Card 4: Active Resume */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="max-w-[70%]">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Active Resume
                </p>
                <p className="text-base font-semibold text-slate-800 mt-2 truncate" title={stats.activeResumeName || 'No resume active'}>
                  {loading ? (
                    <span className="inline-block w-24 h-5 bg-slate-200 animate-pulse rounded"></span>
                  ) : (
                    stats.activeResumeName || 'No resume set'
                  )}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/seeker/resumes"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Manage resumes</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/jobs"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="p-3 rounded-lg bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Browse Jobs
                </h3>
                <p className="text-xs text-slate-500">Explore openings and apply</p>
              </div>
            </Link>

            <Link
              to="/seeker/resumes"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Upload Resume
                </h3>
                <p className="text-xs text-slate-500">Parse skills with AI analyzer</p>
              </div>
            </Link>

            <Link
              to="/seeker/profile"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="p-3 rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  View Profile
                </h3>
                <p className="text-xs text-slate-500">Update experience & skills</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of your 5 most recent job applications
              </p>
            </div>
            <Link
              to="/seeker/applications"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
            >
              <span>View All Applications</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3"></div>
              <p className="text-sm text-slate-500">Loading your applications...</p>
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">No applications yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't submitted any job applications yet. Start exploring active job openings!
              </p>
              <div className="mt-5">
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg px-4 py-2 shadow-sm transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Jobs Now</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplications.map((app) => {
                const jobTitle = app?.jobTitle || app?.job?.title || 'Role not specified';
                const companyName =
                  app?.companyName || app?.job?.companyName || app?.job?.company?.name || 'Company';
                const location = app?.location || app?.job?.location || 'Remote / Unspecified';
                const appliedDate = app?.appliedAt || app?.createdAt;
                const formattedDate = appliedDate
                  ? new Date(appliedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={app.id}
                    className="p-5 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/seeker/applications/${app.id}`}
                          className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {jobTitle}
                        </Link>
                        <StatusBadge status={app.status || 'APPLIED'} />
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {companyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Applied {formattedDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {app?.matchScore !== undefined && app?.matchScore !== null && (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                            app.matchScore >= 75
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : app.matchScore >= 50
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {Math.round(
                            app.matchScore <= 1 && app.matchScore > 0
                              ? app.matchScore * 100
                              : app.matchScore
                          )}
                          % Match
                        </span>
                      )}
                      <Link
                        to={`/seeker/applications/${app.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
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
  );
}
