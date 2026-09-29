import api from './axios';

/**
 * Get profile for logged-in job seeker
 * @returns {Promise<Object>} API response with JobSeekerProfileResponse
 */
export const getSeekerProfile = () => {
  return api.get('/api/profiles/seeker').then((response) => response.data);
};

/**
 * Update profile for logged-in job seeker
 * @param {Object} data - JobSeekerProfileRequest { headline, bio, experienceYears, education, currentCompany, currentPosition, githubUrl, linkedinUrl, portfolioUrl, skills }
 * @returns {Promise<Object>} API response with JobSeekerProfileResponse
 */
export const updateSeekerProfile = (data) => {
  return api.put('/api/profiles/seeker', data).then((response) => response.data);
};

/**
 * Get job seeker profile by user ID (Recruiter/Admin)
 * @param {number|string} userId
 * @returns {Promise<Object>} API response with JobSeekerProfileResponse
 */
export const getSeekerProfileById = (userId) => {
  return api.get(`/api/profiles/seeker/${userId}`).then((response) => response.data);
};

/**
 * Get profile for logged-in recruiter
 * @param {Object} [params]
 * @returns {Promise<Object>} API response with RecruiterProfileResponse
 */
export const getRecruiterProfile = () => {
  return api.get('/api/profiles/recruiter').then((response) => response.data);
};

/**
 * Update profile for logged-in recruiter
 * @param {Object} data - RecruiterProfileRequest { department, position, companyId }
 * @returns {Promise<Object>} API response with RecruiterProfileResponse
 */
export const updateRecruiterProfile = (data) => {
  return api.put('/api/profiles/recruiter', data).then((response) => response.data);
};

export default {
  getSeekerProfile,
  updateSeekerProfile,
  getSeekerProfileById,
  getRecruiterProfile,
  updateRecruiterProfile,
};
