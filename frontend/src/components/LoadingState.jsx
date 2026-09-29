import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Centered loading spinner with optional message.
 * @param {Object} props
 * @param {string} [props.message='Loading...'] - Optional message displayed beneath the spinner.
 * @param {boolean} [props.fullScreen=false] - If true, centers within the full viewport.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Spinner size.
 * @param {string} [props.className=''] - Additional container classes.
 */
export default function LoadingState({
  message = 'Loading...',
  fullScreen = false,
  size = 'md',
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6'
    : `flex flex-col items-center justify-center py-12 px-4 ${className}`;

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <Loader2
        className={`${sizeClasses[size] || sizeClasses.md} text-indigo-600 animate-spin`}
        aria-hidden="true"
      />
      {message && (
        <p className="mt-4 text-sm font-medium text-slate-600 tracking-wide animate-pulse">
          {message}
        </p>
      )}
      <span className="sr-only">{message || 'Loading'}</span>
    </div>
  );
}
