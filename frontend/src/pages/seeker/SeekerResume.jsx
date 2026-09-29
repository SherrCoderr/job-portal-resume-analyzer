import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  FileCheck,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  uploadResume,
  getMyResumes,
  deleteResume,
  downloadResume,
} from '../../api/resumeApi';

export default function SeekerResume() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [recentlyUploaded, setRecentlyUploaded] = useState(null);
  const [expandedResumeId, setExpandedResumeId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch user's resumes
  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await getMyResumes();
      const data = res?.data || res;
      setResumes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load resumes:', err);
      toast.error('Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Format bytes to human readable size
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Upload handler
  const handleFileProcess = async (file) => {
    if (!file) return;

    // Validate file type
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      toast.error('Supported formats: PDF, DOCX, TXT only.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    const toastId = toast.loading('Uploading and analyzing resume...');

    try {
      const res = await uploadResume(formData);
      const uploadedData = res?.data || res;

      toast.success(res?.message || 'Resume uploaded and parsed successfully!', {
        id: toastId,
      });

      // Save for recent extraction highlight
      setRecentlyUploaded(uploadedData);

      // Refresh list
      await fetchResumes();
    } catch (err) {
      console.error('Upload failed:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload resume. Please try again.';
      toast.error(errMsg, { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  // Download handler
  const handleDownload = async (resume) => {
    try {
      setDownloadingId(resume.id);
      const toastId = toast.loading('Preparing download...');
      const blob = await downloadResume(resume.id);

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume.fileName || resume.name || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download started', { id: toastId });
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download resume file.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteResume(id);
      toast.success('Resume deleted successfully.');

      if (recentlyUploaded?.id === id) {
        setRecentlyUploaded(null);
      }

      await fetchResumes();
    } catch (err) {
      console.error('Failed to delete resume:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete resume.';
      toast.error(errMsg);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedResumeId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Resume Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload your resume to automatically extract skills, analyze ATS compatibility, and apply to job openings.
          </p>
        </div>

        {/* Upload Box / Drag & Drop Area */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Upload New Resume</h2>
          <p className="text-xs text-slate-500 mb-6">
            Supported formats: PDF, DOCX, TXT (Maximum file size: 10 MB)
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
            />

            <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-800">
                {uploading
                  ? 'Analyzing resume and extracting skills...'
                  : 'Click to upload or drag and drop your file here'}
              </p>
              <p className="text-xs text-slate-500">
                PDF or Word documents parsed automatically using AI skill extraction
              </p>
            </div>

            <button
              type="button"
              disabled={uploading}
              className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Select File from Computer</span>
            </button>
          </div>
        </div>

        {/* Recently Uploaded Skills Extraction Result */}
        {recentlyUploaded && (
          <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 rounded-xl shadow-md p-6 border border-indigo-200 animate-fadeIn">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-600 text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Extracted Skills from "{recentlyUploaded.fileName || 'Uploaded Resume'}"
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Our AI parser identified the following skills in your document:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRecentlyUploaded(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-xs"
                title="Dismiss"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              {Array.isArray(recentlyUploaded.parsedSkills) &&
              recentlyUploaded.parsedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {recentlyUploaded.parsedSkills.map((skill, index) => (
                    <span
                      key={`recent-skill-${index}`}
                      className="inline-flex items-center gap-1 bg-white border border-indigo-300 text-indigo-700 font-semibold px-3 py-1 rounded-lg text-xs shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No explicit skills were automatically extracted. You can manage skills in your profile.
                </p>
              )}
            </div>
          </div>
        )}

        {/* My Resumes List */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Resumes</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your uploaded resumes, inspect extracted skills, and download files
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Total: {resumes.length}
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
              <p className="text-sm text-slate-500">Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">No resumes uploaded yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Upload your resume above to start applying for roles with automated ATS compatibility matching.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {resumes.map((resume, index) => {
                const skills = Array.isArray(resume.parsedSkills)
                  ? resume.parsedSkills
                  : Array.isArray(resume.skills)
                  ? resume.skills
                  : [];
                const isExpanded = expandedResumeId === resume.id;
                const isActive =
                  resume.isActive ??
                  resume.active ??
                  resume.isDefault ??
                  index === 0;

                return (
                  <div key={resume.id} className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* File Info */}
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                          <FileText className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 break-all">
                              {resume.fileName || resume.name || 'Resume Document'}
                            </h3>

                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                              {formatBytes(resume.fileSize || resume.size)}
                            </span>

                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Uploaded {formatDate(resume.uploadDate || resume.createdAt)}
                            </span>

                            <span className="flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                              {skills.length} skills parsed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {skills.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(resume.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            <span>Skills</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownload(resume)}
                          disabled={downloadingId === resume.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50"
                          title="Download resume"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingId === resume.id ? 'Downloading...' : 'Download'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(resume.id)}
                          disabled={deletingId === resume.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete resume"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Parsed Skills Chips */}
                    {isExpanded && skills.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
                        <p className="text-xs font-semibold text-slate-600 mb-2">
                          Parsed Skills ({skills.length}):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s, sIdx) => (
                            <span
                              key={`${resume.id}-skill-${sIdx}`}
                              className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md border border-slate-200 font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
