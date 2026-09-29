import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  MapPin,
  Globe,
  GitBranch,
  Link as LinkIcon,
  FileText,
  Plus,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { getSeekerProfile, updateSeekerProfile } from '../../api/profileApi';

export default function SeekerProfile() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [activeResume, setActiveResume] = useState(null);

  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    experienceYears: '',
    education: '',
    location: '',
    currentCompany: '',
    currentPosition: '',
    skills: [],
    portfolioUrl: '',
    githubUrl: '',
    linkedinUrl: '',
  });

  // Fetch seeker profile on mount
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getSeekerProfile();
        const data = res?.data || res;

        if (isMounted && data) {
          // Normalize skills into an array
          let skillsArray = [];
          if (Array.isArray(data.skills)) {
            skillsArray = data.skills;
          } else if (typeof data.skills === 'string') {
            skillsArray = data.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
          }

          setFormData({
            headline: data.headline || '',
            bio: data.bio || '',
            experienceYears:
              data.experienceYears !== undefined && data.experienceYears !== null
                ? data.experienceYears
                : '',
            education: data.education || '',
            location: data.location || '',
            currentCompany: data.currentCompany || '',
            currentPosition: data.currentPosition || '',
            skills: skillsArray,
            portfolioUrl: data.portfolioUrl || '',
            githubUrl: data.githubUrl || '',
            linkedinUrl: data.linkedinUrl || '',
          });

          // Check if active resume is attached
          if (data.activeResume || data.resume || data.resumeFileName) {
            setActiveResume(data.activeResume || data.resume || { fileName: data.resumeFileName });
          }
        }
      } catch (err) {
        console.error('Failed to load seeker profile:', err);
        toast.error('Failed to load profile. Please refresh.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    if (formData.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Skill already added');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setSkillInput('');
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        experienceYears:
          formData.experienceYears === ''
            ? null
            : Number(formData.experienceYears),
      };

      const res = await updateSeekerProfile(payload);
      toast.success(res?.message || 'Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save profile changes.';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Title & User Header */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-2xl font-bold shadow-md">
              {(user?.fullName || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {user?.fullName || user?.name || 'Candidate Profile'}
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{user?.email || 'No email provided'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Role: Job Seeker
            </span>
          </div>
        </div>

        {/* Active Resume Banner */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Active Resume</span>
                  {activeResume ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Attached
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Not Uploaded
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeResume?.fileName
                    ? `Current file: ${activeResume.fileName}`
                    : 'Upload or set an active resume to accelerate job applications and match analyses.'}
                </p>
              </div>
            </div>

            <Link
              to="/seeker/resumes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3.5 py-2 transition-colors whitespace-nowrap self-end sm:self-auto"
            >
              <span>Manage Resumes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-slate-100 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tell recruiters about your professional expertise and background
              </p>
            </div>

            {/* Headline */}
            <div>
              <label htmlFor="headline" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Professional Headline *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="headline"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g. Senior Full-Stack Engineer | React & Spring Boot Specialist"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Summary / Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Highlight your key achievements, preferred technologies, and career trajectory..."
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Experience, Education, Location in 3-column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label htmlFor="experienceYears" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="experienceYears"
                  name="experienceYears"
                  min="0"
                  max="60"
                  step="0.5"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  placeholder="e.g. 4.5"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="education" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Highest Education
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="e.g. B.S. in Computer Science"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location / City
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Current Position & Current Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="currentPosition" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Position (Optional)
                </label>
                <input
                  type="text"
                  id="currentPosition"
                  name="currentPosition"
                  value={formData.currentPosition}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="currentCompany" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Company (Optional)
                </label>
                <input
                  type="text"
                  id="currentCompany"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  placeholder="e.g. Tech Corp Inc."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-slate-100 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Skills & Expertise</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add technical and domain skills to match against job descriptions
              </p>
            </div>

            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill (e.g. React, Spring Boot, Docker) and press Enter"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Skills Chips Container */}
              <div className="mt-4 min-h-[50px] p-3 rounded-lg bg-slate-50 border border-slate-200">
                {formData.skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No skills added yet. Add skills to increase ATS match rates!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-600 focus:outline-none ml-0.5"
                          title={`Remove ${skill}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Online Presence & Links */}
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-slate-100 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Online Profiles & Social Links</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Share your portfolio and professional links with potential employers
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="portfolioUrl" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Portfolio / Personal Website URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    id="portfolioUrl"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://yourportfolio.dev"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="githubUrl" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    id="githubUrl"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/yourusername"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="linkedinUrl" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourusername"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
