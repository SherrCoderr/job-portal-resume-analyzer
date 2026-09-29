import api from './axios';

/**
 * Search and filter active jobs with pagination
 * @param {Object} params - { keyword, location, jobType, experienceLevel, page, size, sortBy, sortDir }
 * @returns {Promise<Object>} API response with PagedResponse<JobResponse>
 */
export const searchJobs = (params = {}) => {
  return api.get('/api/jobs', { params }).then((response) => response.data);
};

/**
 * Get job details by ID
 * @param {number|string} id
 * @returns {Promise<Object>} API response with JobResponse
 */
export const getJobById = (id) => {
  return api.get(`/api/jobs/${id}`).then((response) => response.data);
};

/**
 * Create a new job posting (Recruiter/Admin)
 * @param {Object} data - JobRequest { title, description, companyId, location, jobType, experienceLevel, requiredSkills, niceToHaveSkills, minSalary, maxSalary, deadline }
 * @returns {Promise<Object>} API response with JobResponse
 */
export const createJob = (data) => {
  return api.post('/api/jobs', data).then((response) => response.data);
};

/**
 * Update an existing job posting (Recruiter/Admin)
 * @param {number|string} id
 * @param {Object} data - JobRequest
 * @returns {Promise<Object>} API response with JobResponse
 */
export const updateJob = (id, data) => {
  return api.put(`/api/jobs/${id}`, data).then((response) => response.data);
};

/**
 * Delete a job posting (Recruiter/Admin)
 * @param {number|string} id
 * @returns {Promise<Object>} API response with confirmation
 */
export const deleteJob = (id) => {
  return api.delete(`/api/jobs/${id}`).then((response) => response.data);
};

/**
 * Get jobs posted by the logged-in recruiter
 * @param {number|Object} page - Page number or params object { page, size }
 * @param {number} [size=10] - Page size
 * @returns {Promise<Object>} API response with PagedResponse<JobResponse>
 */
export const getRecruiterJobs = (page = 0, size = 10) => {
  const params = typeof page === 'object' && page !== null ? page : { page, size };
  return api.get('/api/jobs/recruiter/my-jobs', { params }).then((response) => response.data);
};

/**
 * Toggle job status (ACTIVE <-> CLOSED)
 * @param {number|string} id
 * @returns {Promise<Object>} API response with updated JobResponse
 */
export const toggleJobStatus = (id) => {
  return api.patch(`/api/jobs/${id}/toggle-status`).then((response) => response.data);
};

export default {
  searchJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
  toggleJobStatus,
};
