import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Common Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public & General Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobListingsPage from './pages/JobListingsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Job Seeker Pages
import SeekerDashboard from './pages/seeker/SeekerDashboard';
import SeekerProfile from './pages/seeker/SeekerProfile';
import SeekerResume from './pages/seeker/SeekerResume';
import SeekerApplications from './pages/seeker/SeekerApplications';
import ApplicationDetails from './pages/seeker/ApplicationDetails';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CompanyProfile from './pages/recruiter/CompanyProfile';
import CreateJob from './pages/recruiter/CreateJob';
import ManageJobs from './pages/recruiter/ManageJobs';
import EditJob from './pages/recruiter/EditJob';
import JobApplicants from './pages/recruiter/JobApplicants';
import ApplicantDetails from './pages/recruiter/ApplicantDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
              borderRadius: '10px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
          <Navbar />

          <main className="flex-1 flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<JobListingsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Convenience Shortcuts / Navigation Aliases */}
              <Route path="/dashboard" element={<Navigate to="/seeker/dashboard" replace />} />
              <Route path="/my-applications" element={<Navigate to="/seeker/applications" replace />} />
              <Route path="/profile" element={<Navigate to="/seeker/profile" replace />} />
              <Route path="/seeker/resumes" element={<Navigate to="/seeker/resume" replace />} />
              <Route path="/recruiter/jobs/new" element={<Navigate to="/recruiter/jobs/create" replace />} />

              {/* Protected Routes: Job Seeker (ROLE_JOB_SEEKER) */}
              <Route element={<ProtectedRoute roles={['ROLE_JOB_SEEKER']} />}>
                <Route path="/seeker/dashboard" element={<SeekerDashboard />} />
                <Route path="/seeker/profile" element={<SeekerProfile />} />
                <Route path="/seeker/resume" element={<SeekerResume />} />
                <Route path="/seeker/applications" element={<SeekerApplications />} />
                <Route path="/seeker/applications/:id" element={<ApplicationDetails />} />
              </Route>

              {/* Protected Routes: Recruiter (ROLE_RECRUITER) */}
              <Route element={<ProtectedRoute roles={['ROLE_RECRUITER']} />}>
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/company" element={<CompanyProfile />} />
                <Route path="/recruiter/jobs/create" element={<CreateJob />} />
                <Route path="/recruiter/jobs" element={<ManageJobs />} />
                <Route path="/recruiter/jobs/:id/edit" element={<EditJob />} />
                <Route path="/recruiter/jobs/:jobId/applicants" element={<JobApplicants />} />
                <Route path="/recruiter/applicants/:id" element={<ApplicantDetails />} />
              </Route>

              {/* Protected Routes: Admin (ROLE_ADMIN) */}
              <Route element={<ProtectedRoute roles={['ROLE_ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
              </Route>

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
