import api from './axios';

/**
 * Upload a resume file (PDF or DOCX)
 * @param {FormData|File} formData - FormData containing 'file' or a File instance
 * @returns {Promise<Object>} API response with parsed ResumeResponse
 */
export const uploadResume = (formData) => {
  let body = formData;
  if (typeof window !== 'undefined' && formData instanceof File) {
    body = new FormData();
    body.append('file', formData);
  }
  return api
    .post('/api/resumes/upload', body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => response.data);
};

/**
 * Get all resumes uploaded by the authenticated job seeker
 * @returns {Promise<Object>} API response with list of ResumeResponse
 */
export const getMyResumes = () => {
  return api.get('/api/resumes/my-resumes').then((response) => response.data);
};

/**
 * Get resume details and parsed skills by resume ID
 * @param {number|string} id - Resume ID
 * @returns {Promise<Object>} API response with ResumeResponse
 */
export const getResumeById = (id) => {
  return api.get(`/api/resumes/${id}`).then((response) => response.data);
};

/**
 * Delete a resume by ID
 * @param {number|string} id - Resume ID
 * @returns {Promise<Object>} API response with confirmation
 */
export const deleteResume = (id) => {
  return api.delete(`/api/resumes/${id}`).then((response) => response.data);
};

/**
 * Download a resume file as a binary blob
 * @param {number|string} id - Resume ID
 * @returns {Promise<Blob>} Blob of the file content
 */
export const downloadResume = (id) => {
  return api
    .get(`/api/resumes/download/${id}`, {
      responseType: 'blob',
    })
    .then((response) => response.data);
};

/**
 * Calculate match score and skill breakdown between a resume and a job
 * @param {Object|number|string} data - { resumeId, jobId } or resumeId
 * @param {number|string} [jobId] - Optional jobId if first arg is resumeId
 * @returns {Promise<Object>} API response with ResumeMatchResponse
 */
export const matchResume = (data, jobId) => {
  const payload =
    typeof data === 'object' && data !== null
      ? data
      : { resumeId: data, jobId };
  return api.post('/api/resumes/match', payload).then((response) => response.data);
};

/**
 * Get all supported tech/domain skills supported by the system analyzer
 * @returns {Promise<Object>} API response with list of supported skill strings
 */
export const getSupportedSkills = () => {
  return api.get('/api/resumes/skills/supported').then((response) => response.data);
};

export default {
  uploadResume,
  getMyResumes,
  getResumeById,
  deleteResume,
  downloadResume,
  matchResume,
  getSupportedSkills,
};
