import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Error state display with red alert styling, AlertCircle icon, and optional retry action.
 * @param {Object} props
 * @param {string} [props.title='Error'] - Alert header title.
 * @param {string} [props.message='Something went wrong. Please try again.'] - Error message text.
 * @param {Function} [props.onRetry] - Optional callback function to retry the failed operation.
 * @param {string} [props.retryText='Try Again'] - Label for the retry button.
 * @param {string} [props.className=''] - Additional CSS classes.
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryText = 'Try Again',
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>

        <div className="flex-1 space-y-1">
          {title && (
            <h3 className="text-base font-semibold text-red-800">
              {title}
            </h3>
          )}
          <p className="text-sm text-red-700 leading-relaxed">
            {message}
          </p>

          {onRetry && (
            <div className="pt-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs transition-colors hover:bg-red-700 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{retryText}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
