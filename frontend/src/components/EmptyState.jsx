import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Empty state placeholder displayed when collections or query results have no items.
 * @param {Object} props
 * @param {React.ComponentType<{ className?: string }>} [props.icon=Inbox] - Icon component.
 * @param {string} [props.title='No items found'] - Primary heading.
 * @param {string} [props.description='There are no records to display at this time.'] - Secondary text.
 * @param {string} [props.actionText] - Label for an optional primary action button.
 * @param {Function} [props.onAction] - Callback triggered when action button is clicked.
 * @param {React.ReactNode} [props.action] - Custom action node (e.g., Link or custom button).
 * @param {string} [props.className=''] - Additional CSS classes.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionText,
  onAction,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs max-w-lg mx-auto my-6 ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-slate-800">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {action ? (
        <div className="mt-6">{action}</div>
      ) : (
        actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
