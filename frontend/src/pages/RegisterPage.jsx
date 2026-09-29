import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  Briefcase,
  BadgeCheck,
  Eye,
  EyeOff,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthDefault, { useAuth as useAuthNamed } from '../hooks/useAuth';

const useAuth = useAuthNamed || useAuthDefault;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'ROLE_JOB_SEEKER', // ROLE_JOB_SEEKER or ROLE_RECRUITER
    companyName: '',
    designation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.role === 'ROLE_RECRUITER') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required for recruiter accounts';
      }
      if (!formData.designation.trim()) {
        newErrors.designation = 'Job designation / title is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
    if (selectedRole === 'ROLE_JOB_SEEKER') {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.companyName;
        delete copy.designation;
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        companyName: formData.role === 'ROLE_RECRUITER' ? formData.companyName.trim() : undefined,
        designation: formData.role === 'ROLE_RECRUITER' ? formData.designation.trim() : undefined,
      };

      const response = await register(payload);
      toast.success('Registration successful! Welcome aboard.');

      const authData = response?.data || response;
      const role = authData?.role || formData.role;

      if (role === 'ROLE_RECRUITER' || role === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed. Please check your information and try again.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const isRecruiter = formData.role === 'ROLE_RECRUITER';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        {/* Brand / Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 font-bold text-2xl tracking-tight mb-2 hover:opacity-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-slate-900">
              Job<span className="text-indigo-600">Portal</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Create your account
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Choose your account type and get started in seconds
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Account Type Selector (Radio Buttons as Cards) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                I want to join as:
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Job Seeker Option */}
                <div
                  onClick={() => handleRoleSelect('ROLE_JOB_SEEKER')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    !isRecruiter
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full mb-2 ${
                      !isRecruiter
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <User className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold">Job Seeker</span>
                  <span className="text-2xs text-slate-500 text-center mt-0.5">
                    Find jobs & analyze resume
                  </span>
                </div>

                {/* Recruiter Option */}
                <div
                  onClick={() => handleRoleSelect('ROLE_RECRUITER')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isRecruiter
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full mb-2 ${
                      isRecruiter
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Building className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold">Recruiter</span>
                  <span className="text-2xs text-slate-500 text-center mt-0.5">
                    Post jobs & screen candidates
                  </span>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Alex Johnson"
                  className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.fullName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className={`block w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-hidden"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Phone number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="block w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            {/* Recruiter-Specific Fields */}
            {isRecruiter && (
              <div className="pt-4 border-t border-slate-200/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
                  <Building className="h-4 w-4" />
                  <span>Company Details</span>
                </div>

                {/* Company Name */}
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Building className="h-5 w-5" />
                    </div>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Technologies"
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                        errors.companyName
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                          : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                      }`}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                {/* Designation / Title */}
                <div>
                  <label
                    htmlFor="designation"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Your Designation / Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <input
                      id="designation"
                      name="designation"
                      type="text"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g. Talent Acquisition Lead / HR Manager"
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                        errors.designation
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/20'
                          : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                      }`}
                    />
                  </div>
                  {errors.designation && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.designation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating your account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register as {isRecruiter ? 'Recruiter' : 'Job Seeker'}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">
                Already registered?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              <span>Sign in to your account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
