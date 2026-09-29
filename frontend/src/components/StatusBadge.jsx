import React from 'react';

/**
 * Status badge with standardized color tokens.
 * @param {Object} props
 * @param {string} props.status - Status key (e.g., APPLIED, SHORTLISTED, REJECTED, HIRED, ACTIVE, CLOSED).
 * @param {boolean} [props.showDot=true] - Whether to show a colored indicator dot.
 * @param {string} [props.className=''] - Additional CSS classes.
 */
export default function StatusBadge({
  status = '',
  showDot = true,
  className = '',
}) {
  const normalized = (status || '').toUpperCase().trim();

  // Color schemes for specified and common statuses
  const colorMap = {
    APPLIED: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-600',
    },
    PENDING: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-600',
    },
    SHORTLISTED: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-600',
    },
    IN_REVIEW: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-600',
    },
    REJECTED: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      dot: 'bg-red-600',
    },
    HIRED: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-600',
    },
    ACTIVE: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-600',
    },
    CLOSED: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-500',
    },
    INACTIVE: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-500',
    },
  };

  const scheme = colorMap[normalized] || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-200',
    dot: 'bg-slate-500',
  };

  const formattedLabel = normalized
    ? normalized
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ')
    : 'Unknown';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${scheme.bg} ${scheme.text} ${scheme.border} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${scheme.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{formattedLabel}</span>
    </span>
  );
}
