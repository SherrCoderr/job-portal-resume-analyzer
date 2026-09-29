import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  BriefcaseBusiness,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import useAuthDefault, { useAuth as useAuthNamed } from '../hooks/useAuth';

// Support both named { useAuth } and default useAuth exports
const useAuth = useAuthNamed || useAuthDefault;

/**
 * Responsive top navigation bar with role-specific menu items and user dropdown.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Safe fallback if useAuth is rendered outside an AuthProvider
  let auth = {};
  try {
    const authHook = useAuthNamed || useAuthDefault;
    if (typeof authHook === 'function') {
      auth = authHook();
    }
  } catch (err) {
    auth = { user: null, isAuthenticated: false, loading: false };
  }
  const { user, isAuthenticated, logout } = auth;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close menus on location change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener for user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('token');
    } finally {
      navigate('/login');
    }
  };

  const isAuthed = Boolean(isAuthenticated || user);
  const userRole = (user?.role || '').toUpperCase();

  // Role normalization helpers
  const isJobSeeker = userRole === 'ROLE_JOB_SEEKER' || userRole === 'JOB_SEEKER';
  const isRecruiter = userRole === 'ROLE_RECRUITER' || userRole === 'RECRUITER';
  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';

  // Role-specific navigation links
  const getNavLinks = () => {
    if (!isAuthed) return [];

    if (isJobSeeker) {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', path: '/jobs', icon: Briefcase },
        { name: 'My Applications', path: '/my-applications', icon: FileText },
      ];
    }

    if (isRecruiter) {
      return [
        { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
        { name: 'My Jobs', path: '/recruiter/jobs', icon: BriefcaseBusiness },
        { name: 'Applicants', path: '/recruiter/applicants', icon: Users },
      ];
    }

    if (isAdmin) {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Jobs', path: '/admin/jobs', icon: Briefcase },
      ];
    }

    // Default fallback for logged in users
    return [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Jobs', path: '/jobs', icon: Briefcase },
    ];
  };

  const navLinks = getNavLinks();

  // User display name & role title
  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'My Account';
  const displayEmail = user?.email || '';
  const displayRoleBadge = isJobSeeker
    ? 'Job Seeker'
    : isRecruiter
    ? 'Recruiter'
    : isAdmin
    ? 'Administrator'
    : userRole || 'Member';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight transition-transform hover:scale-[1.01]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xs">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-slate-900 font-extrabold">
                Job<span className="text-indigo-600">Portal</span>
              </span>
            </Link>

            {/* Desktop Navigation Links (Logged In) */}
            {isAuthed && (
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className={({ isActive }) =>
                        `inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{link.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Section: Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthed ? (
              <>
                <Link
                  to="/jobs"
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </>
            ) : (
              /* User Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  aria-expanded={dropdownOpen}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate text-slate-800">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {displayName}
                      </p>
                      {displayEmail && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {displayEmail}
                        </p>
                      )}
                      <span className="mt-1.5 inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-indigo-700">
                        {displayRoleBadge}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        <span>Profile & Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="h-4 w-4 text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2">
          {isAuthed ? (
            <>
              {/* Mobile User Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {displayEmail || displayRoleBadge}
                  </div>
                </div>
              </div>

              {/* Mobile Nav Links */}
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`
                      }
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{link.name}</span>
                    </NavLink>
                  );
                })}

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Profile Settings</span>
                </Link>
              </div>

              {/* Mobile Logout */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            /* Mobile Guest Links */
            <div className="flex flex-col space-y-2 pt-1">
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                Browse Jobs
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
