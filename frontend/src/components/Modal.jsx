import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Overlay modal with dark backdrop, responsive sizes, and accessible escape/click outside to dismiss.
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible.
 * @param {Function} props.onClose - Dismiss callback.
 * @param {string|React.ReactNode} [props.title] - Modal header title.
 * @param {React.ReactNode} props.children - Modal content.
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Max width size preset.
 * @param {boolean} [props.showCloseButton=true] - Whether to show the top-right X button.
 * @param {string} [props.className=''] - Additional container classes.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = '',
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-2xl',
    xl: 'max-w-2xl sm:max-w-4xl',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`relative w-full ${selectedSize} rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ease-out animate-in fade-in zoom-in-95 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            {title ? (
              <h3
                id="modal-title"
                className="text-lg font-semibold text-slate-900 tracking-tight"
              >
                {title}
              </h3>
            ) : (
              <div />
            )}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="pt-4 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
