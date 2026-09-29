import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Standard pagination control with smart ellipsis and accessible controls.
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (defaults to 1-indexed, or 0-indexed if zeroIndexed=true).
 * @param {number} props.totalPages - Total number of pages.
 * @param {Function} props.onPageChange - Callback invoked with the selected page.
 * @param {boolean} [props.zeroIndexed=false] - Whether currentPage and onPageChange expect 0-indexed page numbers.
 * @param {boolean} [props.hideOnSinglePage=false] - If true, returns null when totalPages <= 1.
 * @param {string} [props.className=''] - Additional styling classes.
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  zeroIndexed = false,
  hideOnSinglePage = false,
  className = '',
}) {
  if (totalPages <= 0) return null;
  if (hideOnSinglePage && totalPages <= 1) return null;

  // Normalize to 1-indexed for display and internal logic
  const normalizedCurrent = zeroIndexed ? currentPage + 1 : currentPage;

  const isFirstPage = normalizedCurrent <= 1;
  const isLastPage = normalizedCurrent >= totalPages;

  const handlePageClick = (page) => {
    if (page === normalizedCurrent || page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(zeroIndexed ? page - 1 : page);
    }
  };

  /**
   * Helper to generate page numbers with ellipsis:
   * e.g., [1, 2, 3, 4, 5] or [1, '...', 4, 5, 6, '...', 10]
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const showLeftEllipsis = normalizedCurrent > 4;
    const showRightEllipsis = normalizedCurrent < totalPages - 3;

    if (!showLeftEllipsis && showRightEllipsis) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (showLeftEllipsis && !showRightEllipsis) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(normalizedCurrent - 1);
      pages.push(normalizedCurrent);
      pages.push(normalizedCurrent + 1);
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={`flex items-center justify-center gap-1 sm:gap-2 select-none ${className}`}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => handlePageClick(normalizedCurrent - 1)}
        disabled={isFirstPage}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isFirstPage
            ? 'cursor-not-allowed text-slate-300'
            : 'cursor-pointer text-slate-700 hover:bg-slate-100 hover:text-indigo-600'
        }`}
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-sm font-medium text-slate-400"
              >
                &hellip;
              </span>
            );
          }

          const isActive = page === normalizedCurrent;

          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => handlePageClick(page)}
              aria-current={isActive ? 'page' : undefined}
              className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-600'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => handlePageClick(normalizedCurrent + 1)}
        disabled={isLastPage}
        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isLastPage
            ? 'cursor-not-allowed text-slate-300'
            : 'cursor-pointer text-slate-700 hover:bg-slate-100 hover:text-indigo-600'
        }`}
        aria-label="Next Page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
