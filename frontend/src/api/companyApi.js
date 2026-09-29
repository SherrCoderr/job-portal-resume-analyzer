import api from './axios';

/**
 * Get list of all registered companies
 * @returns {Promise<Object>} API response with list of CompanyResponse
 */
export const getAllCompanies = () => {
  return api.get('/api/companies').then((response) => response.data);
};

/**
 * Get company details by company ID
 * @param {number|string} id - Company ID
 * @returns {Promise<Object>} API response with CompanyResponse
 */
export const getCompanyById = (id) => {
  return api.get(`/api/companies/${id}`).then((response) => response.data);
};

/**
 * Create a new company (Recruiter/Admin)
 * @param {Object} data - CompanyRequest { name, description, website, location, logoUrl }
 * @returns {Promise<Object>} API response with created CompanyResponse
 */
export const createCompany = (data) => {
  return api.post('/api/companies', data).then((response) => response.data);
};

/**
 * Update company information (Recruiter of company / Admin)
 * @param {number|string} id - Company ID
 * @param {Object} data - CompanyRequest
 * @returns {Promise<Object>} API response with updated CompanyResponse
 */
export const updateCompany = (id, data) => {
  return api.put(`/api/companies/${id}`, data).then((response) => response.data);
};

/**
 * Delete a company (Admin)
 * @param {number|string} id - Company ID
 * @returns {Promise<Object>} API response with confirmation
 */
export const deleteCompany = (id) => {
  return api.delete(`/api/companies/${id}`).then((response) => response.data);
};

export default {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
