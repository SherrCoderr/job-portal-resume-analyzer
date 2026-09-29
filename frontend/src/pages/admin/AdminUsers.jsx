import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Mail,
  Phone,
  AlertTriangle,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllUsers, toggleUserStatus, deleteUser } from '../../api/adminApi';

const ROLE_TABS = [
  { label: 'All Users', value: '' },
  { label: 'Job Seekers', value: 'ROLE_JOB_SEEKER' },
  { label: 'Recruiters', value: 'ROLE_RECRUITER' },
  { label: 'Admins', value: 'ROLE_ADMIN' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Delete confirmation modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(
    async (currentPage = page, role = selectedRole) => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          size: pageSize,
        };
        if (role) {
          params.role = role;
        }

        const res = await getAllUsers(params);
        const data = res?.data || res;

        const content = data?.content || (Array.isArray(data) ? data : []);
        setUsers(content);
        setTotalPages(data?.totalPages || 1);
        setTotalElements(data?.totalElements !== undefined ? data.totalElements : content.length);
        setPage(currentPage);
      } catch (err) {
        console.error('Failed to load users:', err);
        const msg = err?.response?.data?.message || err?.message || 'Failed to load user accounts.';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, selectedRole]
  );

  useEffect(() => {
    fetchUsers(page, selectedRole);
  }, [fetchUsers, page, selectedRole]);

  // Handle role tab change
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setPage(0);
  };

  // Handle Toggle User Status
  const handleToggleStatus = async (user) => {
    try {
      setActionLoadingId(user.id);
      const res = await toggleUserStatus(user.id);
      const updatedUser = res?.data || res;

      // Update state locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, enabled: updatedUser?.enabled !== undefined ? updatedUser.enabled : !u.enabled }
            : u
        )
      );

      const statusText = !user.enabled ? 'enabled' : 'disabled';
      toast.success(`User ${user.fullName || user.email} has been ${statusText}.`);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to update user status.';
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (user) => {
    setUserToDelete(user);
  };

  // Execute user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await deleteUser(userToDelete.id);
      toast.success(`User ${userToDelete.fullName || userToDelete.email} has been deleted.`);
      setUserToDelete(null);
      // Refresh user list
      fetchUsers(page, selectedRole);
    } catch (err) {
      console.error('Failed to delete user:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete user.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter users client-side for search query
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = u?.fullName?.toLowerCase().includes(q);
    const emailMatch = u?.email?.toLowerCase().includes(q);
    return nameMatch || emailMatch;
  });

  // Role Badge Styling
  const renderRoleBadge = (role = '') => {
    const r = role.toUpperCase();
    if (r === 'ROLE_ADMIN' || r === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          Admin
        </span>
      );
    }
    if (r === 'ROLE_RECRUITER' || r === 'RECRUITER') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Recruiter
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        Job Seeker
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <span>User Management</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage accounts, filter by role, activate or deactivate platform access, and audit users.
            </p>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
            Total Users: <span className="text-indigo-600 font-bold">{totalElements}</span>
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 sm:p-5 space-y-4">
          {/* Tabs for Roles */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            {ROLE_TABS.map((tab) => {
              const active = selectedRole === tab.value;
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => handleRoleChange(tab.value)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name or email address..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => fetchUsers(page, selectedRole)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3" />
              <p className="text-sm text-slate-500 font-medium">Fetching user accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No users found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No users match your current search query. Try typing a different name or email.'
                  : 'No users registered under this selected category.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Clear search query
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
                      <th className="py-3.5 px-6">User</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Joined Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredUsers.map((u) => {
                      const joinedDate = u?.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—';

                      const isSelfLoading = actionLoadingId === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Name & Email */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                                {(u.fullName || u.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <div className="font-bold text-slate-900 truncate">
                                  {u.fullName || 'No name provided'}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{u.email}</span>
                                </div>
                                {u.phone && (
                                  <div className="text-2xs text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{u.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-4 px-6">{renderRoleBadge(u.role)}</td>

                          {/* Status Badge */}
                          <td className="py-4 px-6">
                            {u.enabled ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                <span>Enabled</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                <span>Disabled</span>
                              </span>
                            )}
                          </td>

                          {/* Joined Date */}
                          <td className="py-4 px-6 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{joinedDate}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle Status Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u)}
                                disabled={isSelfLoading}
                                title={u.enabled ? 'Disable user account' : 'Enable user account'}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                  u.enabled
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                                } disabled:opacity-50`}
                              >
                                <Power className="w-3.5 h-3.5" />
                                <span>{u.enabled ? 'Disable' : 'Enable'}</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => confirmDelete(u)}
                                disabled={isSelfLoading}
                                title="Delete user"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
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
                {filteredUsers.map((u) => {
                  const joinedDate = u?.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  const isSelfLoading = actionLoadingId === u.id;

                  return (
                    <div key={u.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {(u.fullName || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.fullName || 'No name'}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                        {renderRoleBadge(u.role)}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Joined {joinedDate}</span>
                        </div>

                        <div>
                          {u.enabled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800">
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-rose-100 text-rose-800">
                              Disabled
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={isSelfLoading}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            u.enabled
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{u.enabled ? 'Disable' : 'Enable'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => confirmDelete(u)}
                          disabled={isSelfLoading}
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
                    total users)
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
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete User Account</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Are you sure you want to permanently delete{' '}
                    <span className="font-bold text-slate-800">
                      {userToDelete.fullName || userToDelete.email}
                    </span>
                    ? This action cannot be undone and will remove all associated profile data.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
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
