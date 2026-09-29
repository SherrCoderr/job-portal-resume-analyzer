import api from './axios';

/**
 * Fetch Admin Dashboard statistics
 * @returns {Promise<Object>} API response containing DashboardStatsResponse
 */
export const getDashboardStats = () => {
  return api.get('/api/admin/stats').then((response) => response.data);
};

/**
 * Fetch paginated list of users with optional role filtering
 * @param {Object|string} [paramsOrRole] - Query parameters object { role, page, size } or role string
 * @param {number} [page=0] - Page number (if first param is role)
 * @param {number} [size=10] - Page size (if first param is role)
 * @returns {Promise<Object>} API response containing PagedResponse<UserResponse>
 */
export const getAllUsers = (paramsOrRole = {}, page = 0, size = 10) => {
  let params = {};
  if (typeof paramsOrRole === 'object' && paramsOrRole !== null) {
    params = { ...paramsOrRole };
  } else {
    if (paramsOrRole) params.role = paramsOrRole;
    params.page = page;
    params.size = size;
  }
  return api.get('/api/admin/users', { params }).then((response) => response.data);
};

/**
 * Toggle user account status (enable/disable)
 * @param {number|string} userId
 * @returns {Promise<Object>} API response with updated UserResponse
 */
export const toggleUserStatus = (userId) => {
  return api.patch(`/api/admin/users/${userId}/toggle-status`).then((response) => response.data);
};

/**
 * Permanently delete a user account
 * @param {number|string} userId
 * @returns {Promise<Object>} API response confirmation
 */
export const deleteUser = (userId) => {
  return api.delete(`/api/admin/users/${userId}`).then((response) => response.data);
};

/**
 * Admin delete a job posting
 * @param {number|string} jobId
 * @returns {Promise<Object>} API response confirmation
 */
export const deleteJob = (jobId) => {
  return api.delete(`/api/admin/jobs/${jobId}`).then((response) => response.data);
};

export default {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  deleteJob,
};
