import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthDefault, { useAuth as useAuthNamed } from '../hooks/useAuth';
import LoadingState from './LoadingState';

// Support both named { useAuth } and default useAuth exports
const useAuth = useAuthNamed || useAuthDefault;

/**
 * Route protection wrapper verifying authentication status and role access.
 * @param {Object} props
 * @param {string[]} [props.roles] - Array of permitted roles (e.g. ['ROLE_JOB_SEEKER'] or ['JOB_SEEKER']).
 * @param {React.ReactNode} [props.children] - Optional custom children, falls back to <Outlet />.
 */
export default function ProtectedRoute({ roles, children }) {
  const location = useLocation();
  let auth = {};
  try {
    const authHook = useAuthNamed || useAuthDefault;
    if (typeof authHook === 'function') {
      auth = authHook();
    }
  } catch (err) {
    auth = { user: null, isAuthenticated: false, loading: false };
  }
  const { user, loading, isAuthenticated } = auth;

  // 1. Loading state
  if (loading) {
    return <LoadingState message="Checking authentication..." fullScreen />;
  }

  // 2. Unauthenticated check
  // Verify token or user existence
  const isAuthed = Boolean(isAuthenticated || user);
  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role authorization check
  if (roles && roles.length > 0) {
    const userRole = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : null);

    const hasAllowedRole = roles.some((permittedRole) => {
      if (!userRole) return false;
      const cleanPermitted = permittedRole.toUpperCase().replace(/^ROLE_/, '');
      const cleanUserRole = String(userRole).toUpperCase().replace(/^ROLE_/, '');
      return permittedRole === userRole || cleanPermitted === cleanUserRole;
    });

    if (!hasAllowedRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 4. Render outlet or nested children
  return children ? <>{children}</> : <Outlet />;
}
