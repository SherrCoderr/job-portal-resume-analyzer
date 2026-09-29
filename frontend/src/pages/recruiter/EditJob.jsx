import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  Plus, 
  X, 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getJobById, updateJob } from '../../api/jobApi';

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

const EXPERIENCE_LEVELS = [
  { value: 'ENTRY_LEVEL', label: 'Entry Level (0-2 years)' },
  { value: 'MID_LEVEL', label: 'Mid Level (3-5 years)' },
  { value: 'SENIOR_LEVEL', label: 'Senior Level (5-8 years)' },
  { value: 'LEAD_EXECUTIVE', label: 'Lead / Executive (8+ years)' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID_LEVEL',
    minExperienceYears: 0,
    minSalary: '',
    maxSalary: '',
    salaryCurrency: 'USD',
    status: 'ACTIVE',
    companyId: null,
  });

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [niceToHaveSkills, setNiceToHaveSkills] = useState([]);
  
  const [reqInput, setReqInput] = useState('');
  const [niceInput, setNiceInput] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getJobById(id);
        const job = res?.data || res;

        if (job) {
          setFormData({
            title: job.title || '',
            description: job.description || '',
            location: job.location || '',
            jobType: job.jobType || 'FULL_TIME',
            experienceLevel: job.experienceLevel || 'MID_LEVEL',
            minExperienceYears: job.minExperienceYears ?? 0,
            minSalary: job.minSalary != null ? String(job.minSalary) : '',
            maxSalary: job.maxSalary != null ? String(job.maxSalary) : '',
            salaryCurrency: job.salaryCurrency || 'USD',
            status: job.status || 'ACTIVE',
            companyId: job.companyId || null,
          });

          setRequiredSkills(job.requiredSkills || []);
          setNiceToHaveSkills(job.niceToHaveSkills || []);
        }
      } catch (err) {
        console.error('Failed to load job details:', err);
        toast.error('Unable to fetch job details');
        navigate('/recruiter/jobs');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Skill Chip Management
  const addRequiredSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || reqInput).trim();
    if (!trimmed) return;
    if (requiredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" is already in required skills`);
      return;
    }
    setRequiredSkills((prev) => [...prev, trimmed]);
    setReqInput('');
  };

  const removeRequiredSkill = (skillToRemove) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const addNiceSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || niceInput).trim();
    if (!trimmed) return;
    if (niceToHaveSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" is already in nice-to-have skills`);
      return;
    }
    setNiceToHaveSkills((prev) => [...prev, trimmed]);
    setNiceInput('');
  };

  const removeNiceSkill = (skillToRemove) => {
    setNiceToHaveSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Job description is required');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Job location is required');
      return;
    }
    if (requiredSkills.length === 0) {
      toast.error('At least one required skill is required');
      return;
    }

    if (
      formData.minSalary &&
      formData.maxSalary &&
      parseFloat(formData.minSalary) > parseFloat(formData.maxSalary)
    ) {
      toast.error('Minimum salary cannot exceed maximum salary');
      return;
    }

    setSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      jobType: formData.jobType,
      experienceLevel: formData.experienceLevel,
      minExperienceYears: formData.minExperienceYears ? parseInt(formData.minExperienceYears, 10) : 0,
      minSalary: formData.minSalary ? parseFloat(formData.minSalary) : null,
      maxSalary: formData.maxSalary ? parseFloat(formData.maxSalary) : null,
      salaryCurrency: formData.salaryCurrency || 'USD',
      requiredSkills: requiredSkills,
      niceToHaveSkills: niceToHaveSkills,
      status: formData.status,
      companyId: formData.companyId,
    };

    try {
      await updateJob(id, payload);
      toast.success('Job posting updated successfully!');
      navigate('/recruiter/jobs');
    } catch (err) {
      console.error('Error updating job posting:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update job posting';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium text-sm">Loading job posting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Back Link */}
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Manage Jobs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Job Posting</h1>
            <p className="text-slate-500 text-sm mt-1">
              Update role requirements, skills, and position details.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                formData.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Job Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Role Overview</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Job Title"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
                />
              </div>
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="jobType" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Job Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800 bg-white"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label htmlFor="experienceLevel" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Experience Level <span className="text-rose-500">*</span>
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800 bg-white"
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Experience Years */}
            <div>
              <label htmlFor="minExperienceYears" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Minimum Experience (Years)
              </label>
              <input
                type="number"
                id="minExperienceYears"
                name="minExperienceYears"
                min="0"
                max="50"
                value={formData.minExperienceYears}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
            </div>

            {/* Job Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Job Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe role responsibilities, deliverables, and team context..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Compensation & Salary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Salary & Compensation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="minSalary" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Minimum Salary
              </label>
              <input
                type="number"
                id="minSalary"
                name="minSalary"
                min="0"
                step="500"
                value={formData.minSalary}
                onChange={handleChange}
                placeholder="e.g. 80000"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
            </div>

            <div>
              <label htmlFor="maxSalary" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Maximum Salary
              </label>
              <input
                type="number"
                id="maxSalary"
                name="maxSalary"
                min="0"
                step="500"
                value={formData.maxSalary}
                onChange={handleChange}
                placeholder="e.g. 130000"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
            </div>

            <div>
              <label htmlFor="salaryCurrency" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Currency
              </label>
              <select
                id="salaryCurrency"
                name="salaryCurrency"
                value={formData.salaryCurrency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800 bg-white"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Skills & Resume Matching Requirements */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Skills & Matching Requirements</h2>
              <p className="text-xs text-slate-500">
                Changes to required skills will impact future candidate match calculations.
              </p>
            </div>
          </div>

          {/* Required Skills Multi-input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Required Skills <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                {requiredSkills.length} added
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRequiredSkill();
                  }
                }}
                placeholder="Type a skill and press Add"
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
              <button
                type="button"
                onClick={() => addRequiredSkill()}
                className="inline-flex items-center px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            </div>

            {/* Chips */}
            {requiredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 min-h-[48px] items-center">
                {requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeRequiredSkill(skill)}
                      className="ml-1.5 p-0.5 hover:bg-indigo-700 rounded-full transition"
                      title="Remove skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                No required skills. Add at least one required skill.
              </div>
            )}
          </div>

          {/* Nice to Have Skills Multi-input */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Nice to Have Skills (Optional)
              </label>
              <span className="text-xs text-slate-400">
                {niceToHaveSkills.length} added
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={niceInput}
                onChange={(e) => setNiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNiceSkill();
                  }
                }}
                placeholder="Type bonus skill and press Add"
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm text-slate-800"
              />
              <button
                type="button"
                onClick={() => addNiceSkill()}
                className="inline-flex items-center px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm transition"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            </div>

            {/* Chips */}
            {niceToHaveSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[48px] items-center">
                {niceToHaveSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-800"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeNiceSkill(skill)}
                      className="ml-1.5 p-0.5 hover:bg-slate-300 rounded-full transition"
                      title="Remove skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                No bonus skills added.
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4 pt-2">
          <Link
            to="/recruiter/jobs"
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Updating Job...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
