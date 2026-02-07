import React from 'react';

/**
 * Full-page loader - covers the main content area
 * Use when the entire page depends on fetched data
 */
export const PageLoader = ({ message = 'Loading, please wait...' }) => (
  <div className="w-full h-full flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 border-4 border-[#b01c34] border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#d4375a]/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
      </div>
      <span className="text-gray-500 font-medium text-sm tracking-wide">{message}</span>
    </div>
  </div>
);

/**
 * Section loader - for a specific section/table area
 * Use when only part of the page depends on fetched data
 */
export const SectionLoader = ({ message = 'Loading data...' }) => (
  <div className="w-full flex items-center justify-center py-16">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-[#b01c34] border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-400 text-sm font-medium">{message}</span>
    </div>
  </div>
);

/**
 * Button loader - inline spinner for submit buttons
 * Use inside buttons during form submission
 */
export const ButtonLoader = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

/**
 * Table skeleton loader - mimics table rows loading
 * Use when waiting for table data to load
 */
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full animate-pulse">
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="flex gap-2 py-3 border-b border-gray-100">
        {Array.from({ length: cols }).map((_, colIdx) => (
          <div key={colIdx} className="flex-1">
            <div className="h-4 bg-gray-200 rounded-md" style={{ width: `${60 + Math.random() * 30}%` }}></div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default PageLoader;
