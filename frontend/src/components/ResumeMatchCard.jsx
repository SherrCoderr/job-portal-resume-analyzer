import React from 'react';
import { CheckCircle2, XCircle, Award, Percent, Layers, AlertCircle } from 'lucide-react';

/**
 * ResumeMatchCard component to display match score and skill breakdown
 * @param {Object} props
 * @param {Object} props.match - ResumeMatchResponse { matchScore, totalRequiredSkillsCount, matchedSkillsCount, missingSkillsCount, matchedSkills, missingSkills }
 * @param {string} [props.className] - Optional extra class names
 */
const ResumeMatchCard = ({ match, className = '' }) => {
  if (!match) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center space-x-3 text-slate-500">
          <AlertCircle className="w-5 h-5 text-slate-400" />
          <span className="text-sm">No resume match score available for this candidate.</span>
        </div>
      </div>
    );
  }

  const score = Math.round(match.matchScore ?? 0);
  const matchedSkills = match.matchedSkills || [];
  const missingSkills = match.missingSkills || [];
  const totalCount = match.totalRequiredSkillsCount ?? (matchedSkills.length + missingSkills.length);
  const matchedCount = match.matchedSkillsCount ?? matchedSkills.length;
  const missingCount = match.missingSkillsCount ?? missingSkills.length;

  // Determine score color theme
  let scoreBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let progressBarColor = 'bg-emerald-500';
  let ringColor = 'text-emerald-500';

  if (score < 50) {
    scoreBadgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
    progressBarColor = 'bg-rose-500';
    ringColor = 'text-rose-500';
  } else if (score < 75) {
    scoreBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    progressBarColor = 'bg-amber-500';
    ringColor = 'text-amber-500';
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
      {/* Header with Title and Score Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Resume Match Analysis</h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Automated skill comparison against job requirements
          </p>
        </div>

        <div className={`inline-flex items-center px-4 py-2 rounded-full border text-lg font-bold ${scoreBadgeColor}`}>
          <Percent className="w-4 h-4 mr-1 stroke-[2.5]" />
          <span>{score}% Match</span>
        </div>
      </div>

      {/* Progress Bar & Summary Stats */}
      <div className="my-5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span>Match Progress</span>
          <span>{matchedCount} of {totalCount} Skills Matched</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
            <p className="text-xs text-slate-500 font-medium">Required Skills</p>
            <p className="text-lg font-bold text-slate-800">{totalCount}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
            <p className="text-xs text-emerald-700 font-medium">Matched</p>
            <p className="text-lg font-bold text-emerald-700">{matchedCount}</p>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-lg p-2.5">
            <p className="text-xs text-rose-700 font-medium">Missing</p>
            <p className="text-lg font-bold text-rose-700">{missingCount}</p>
          </div>
        </div>
      </div>

      {/* Detailed Skill Breakdown */}
      <div className="space-y-4 pt-2">
        {/* Matched Skills */}
        <div>
          <div className="flex items-center space-x-1.5 text-sm font-semibold text-emerald-700 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Matched Skills ({matchedSkills.length})</span>
          </div>
          {matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No matching skills identified.</p>
          )}
        </div>

        {/* Missing Skills */}
        <div>
          <div className="flex items-center space-x-1.5 text-sm font-semibold text-rose-700 mb-2">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Missing / Recommended Skills ({missingSkills.length})</span>
          </div>
          {missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Candidate satisfies all required skills!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeMatchCard;
