import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Image, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getRecruiterProfile, updateRecruiterProfile } from '../../api/profileApi';
import { createCompany, updateCompany } from '../../api/companyApi';

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    foundedYear: '',
    logoUrl: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getRecruiterProfile();
      const profile = res?.data || res;
      if (profile?.company) {
        const comp = profile.company;
        setCompanyId(comp.id);
        setCompanyInfo(comp);
        setFormData({
          name: comp.name || '',
          description: comp.description || '',
          website: comp.website || '',
          location: comp.location || '',
          industry: comp.industry || '',
          foundedYear: comp.foundedYear ? String(comp.foundedYear) : '',
          logoUrl: comp.logoUrl || '',
        });
      }
    } catch (err) {
      console.error('Failed to load recruiter profile:', err);
      toast.error('Failed to load company profile information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      website: formData.website?.trim() || null,
      location: formData.location?.trim() || null,
      industry: formData.industry?.trim() || null,
      foundedYear: formData.foundedYear ? parseInt(formData.foundedYear, 10) : null,
      logoUrl: formData.logoUrl?.trim() || null,
    };

    try {
      let savedCompany;
      if (companyId) {
        const res = await updateCompany(companyId, payload);
        savedCompany = res?.data || res;
        toast.success('Company profile updated successfully!');
      } else {
        const res = await createCompany(payload);
        savedCompany = res?.data || res;
        if (savedCompany?.id) {
          setCompanyId(savedCompany.id);
          // Link recruiter profile with newly created company
          try {
            await updateRecruiterProfile({ companyId: savedCompany.id });
          } catch (linkErr) {
            console.warn('Could not auto-link recruiter company ID:', linkErr);
          }
        }
        toast.success('Company profile created successfully!');
      }

      setCompanyInfo(savedCompany);
      await loadProfile();
    } catch (err) {
      console.error('Error saving company profile:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save company profile';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium text-sm">Loading company profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your organization details, branding, and location shown on job postings.
        </p>
      </div>

      {/* Top Overview Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-5">
            {companyInfo?.logoUrl ? (
              <img
                src={companyInfo.logoUrl}
                alt={companyInfo.name || 'Company Logo'}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl shadow-sm flex-shrink-0">
                {companyInfo?.name ? companyInfo.name.charAt(0).toUpperCase() : <Building2 className="w-9 h-9" />}
              </div>
            )}

            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-slate-900">
                  {companyInfo?.name || 'Your Company Name'}
                </h2>
                {companyInfo?.id && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-500 mt-2">
                {companyInfo?.location && (
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {companyInfo.location}
                  </span>
                )}
                {companyInfo?.industry && (
                  <span className="flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {companyInfo.industry}
                  </span>
                )}
                {companyInfo?.foundedYear && (
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Founded {companyInfo.foundedYear}
                  </span>
                )}
              </div>

              {companyInfo?.website && (
                <div className="mt-2.5">
                  <a
                    href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    <Globe className="w-3.5 h-3.5 mr-1" />
                    {companyInfo.website}
                    <ExternalLink className="w-3 h-3 ml-1 text-slate-400" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {companyInfo?.jobCount != null && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center self-stretch sm:self-center">
              <span className="block text-xl font-bold text-indigo-600">{companyInfo.jobCount}</span>
              <span className="text-xs text-slate-500 font-medium">Jobs Posted</span>
            </div>
          )}
        </div>

        {companyInfo?.description && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">About the Company</h4>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {companyInfo.description}
            </p>
          </div>
        )}
      </div>

      {/* Edit/Create Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-6">
          {companyId ? 'Edit Organization Information' : 'Register Your Company'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Acme Corporation"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g. Software & Technology, Fintech, Healthcare"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
            </div>

            {/* Founded Year */}
            <div>
              <label htmlFor="foundedYear" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Founded Year
              </label>
              <input
                type="number"
                id="foundedYear"
                name="foundedYear"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.foundedYear}
                onChange={handleChange}
                placeholder="e.g. 2018"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Headquarters / Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
            </div>

            {/* Website URL */}
            <div>
              <label htmlFor="website" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://company.example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
            </div>

            {/* Logo URL */}
            <div className="md:col-span-2">
              <label htmlFor="logoUrl" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Company Logo URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
                />
                {formData.logoUrl && (
                  <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50 flex-shrink-0">
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Direct link to an image (PNG, JPG, SVG)</p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Company Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your company culture, mission, and the products or services you build..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800 leading-relaxed"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={loadProfile}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Company Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
