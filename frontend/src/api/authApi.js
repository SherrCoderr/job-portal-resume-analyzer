import api from './axios';

/**
 * Register a new user (Job Seeker or Recruiter)
 * @param {Object} data - { email, password, fullName, phone, role, companyName, companyWebsite }
 * @returns {Promise<Object>} API response with AuthResponse
 */
export const register = (data) => {
  return api.post('/api/auth/register', data).then((response) => response.data);
};

/**
 * Login user with credentials
 * @param {Object} data - { email, password }
 * @returns {Promise<Object>} API response with AuthResponse
 */
export const login = (data) => {
  return api.post('/api/auth/login', data).then((response) => response.data);
};

/**
 * Get current authenticated user details
 * @returns {Promise<Object>} API response with UserResponse
 */
export const getMe = () => {
  return api.get('/api/auth/me').then((response) => response.data);
};

export default {
  register,
  login,
  getMe,
};
