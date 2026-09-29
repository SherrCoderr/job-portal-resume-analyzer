import api from './axios';

/**
 * Apply to a job posting (Job Seeker)
 * @param {Object} data - ApplicationRequest { jobId, resumeId, coverLetter }
 * @returns {Promise<Object>} API response with ApplicationResponse
 */
export const applyToJob = (data) => {
  return api.post('/api/applications', data).then((response) => response.data);
};

/**
 * Get applications submitted by current job seeker
 * @param {number|Object} page - Page number or params object { page, size }
 * @param {number} [size=10] - Page size
 * @returns {Promise<Object>} API response with PagedResponse<ApplicationResponse>
 */
export const getMyApplications = (page = 0, size = 10) => {
  const params = typeof page === 'object' && page !== null ? page : { page, size };
  return api.get('/api/applications/seeker/my-applications', { params }).then((response) => response.data);
};

/**
 * Get applicants for a specific job (Recruiter/Admin)
 * @param {number|string} jobId
 * @param {number|Object} page - Page number or params object { page, size }
 * @param {number} [size=10] - Page size
 * @returns {Promise<Object>} API response with PagedResponse<ApplicationResponse>
 */
export const getJobApplicants = (jobId, page = 0, size = 10) => {
  const params = typeof page === 'object' && page !== null ? page : { page, size };
  return api.get(`/api/applications/job/${jobId}`, { params }).then((response) => response.data);
};

/**
 * Get all applications across all jobs for the logged-in recruiter
 * @param {number|Object} page - Page number or params object { page, size }
 * @param {number} [size=10] - Page size
 * @returns {Promise<Object>} API response with PagedResponse<ApplicationResponse>
 */
export const getRecruiterApplications = (page = 0, size = 10) => {
  const params = typeof page === 'object' && page !== null ? page : { page, size };
  return api.get('/api/applications/recruiter/all', { params }).then((response) => response.data);
};

/**
 * Update application status (Recruiter/Admin)
 * @param {number|string} id - Application ID
 * @param {Object|string} data - StatusUpdateRequest { status } or status string (e.g. 'SHORTLISTED')
 * @returns {Promise<Object>} API response with updated ApplicationResponse
 */
export const updateApplicationStatus = (id, data) => {
  const payload = typeof data === 'string' ? { status: data } : data;
  return api.patch(`/api/applications/${id}/status`, payload).then((response) => response.data);
};

/**
 * Get application details by ID
 * @param {number|string} id
 * @returns {Promise<Object>} API response with ApplicationResponse
 */
export const getApplicationById = (id) => {
  return api.get(`/api/applications/${id}`).then((response) => response.data);
};

export default {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  getRecruiterApplications,
  updateApplicationStatus,
  getApplicationById,
};
