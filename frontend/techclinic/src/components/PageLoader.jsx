import React from 'react';

/**
 * Full-page skeleton loader - covers the main content area
 * Mimics a generic page layout with header, cards, and content
 */
export const PageLoader = ({ message }) => (
  <div className="w-full h-full flex flex-col gap-5 animate-pulse min-h-[60vh]">
    {/* Skeleton Header */}
    <div>
      <div className='h-6 w-48 bg-gray-200 rounded-lg' />
      <div className='h-4 w-64 bg-gray-100 rounded-lg mt-2' />
    </div>
    {/* Skeleton Content Card */}
    <div className='bg-white rounded-xl ring-1 ring-gray-100 p-6'>
      <div className='flex items-center gap-3 mb-5'>
        <div className='w-8 h-8 rounded-lg bg-gray-200' />
        <div className='h-5 w-36 bg-gray-200 rounded' />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='flex flex-col gap-1.5'>
            <div className='h-3 w-20 bg-gray-100 rounded' />
            <div className='h-10 w-full bg-gray-100 rounded-xl' />
          </div>
        ))}
      </div>
    </div>
    {/* Skeleton Second Card */}
    <div className='bg-white rounded-xl ring-1 ring-gray-100 p-6'>
      <div className='flex items-center gap-3 mb-5'>
        <div className='w-8 h-8 rounded-lg bg-gray-200' />
        <div className='h-5 w-40 bg-gray-200 rounded' />
      </div>
      <div className='flex flex-col lg:flex-row gap-6'>
        <div className='w-full lg:w-1/2 flex flex-col gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='h-10 w-full bg-gray-100 rounded-xl' />
          ))}
        </div>
        <div className='w-full lg:w-1/2 flex flex-col gap-4'>
          <div className='h-28 w-full bg-gray-100 rounded-xl' />
          <div className='h-28 w-full bg-gray-100 rounded-xl' />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Session verification skeleton - full-screen skeleton for auth checks
 * Mimics the app layout shell while verifying session
 */
export const SessionSkeleton = () => (
  <div className='w-full h-screen flex bg-gray-50'>
    {/* Sidebar skeleton */}
    <div className='hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 p-4 gap-4 animate-pulse'>
      <div className='h-10 w-32 bg-gray-200 rounded-xl mb-4' />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-gray-100' />
          <div className='h-4 w-24 bg-gray-100 rounded' />
        </div>
      ))}
    </div>
    {/* Main content skeleton */}
    <div className='flex-1 p-6 animate-pulse'>
      <div className='h-6 w-48 bg-gray-200 rounded-lg mb-2' />
      <div className='h-4 w-64 bg-gray-100 rounded-lg mb-6' />
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='bg-white rounded-xl ring-1 ring-gray-100 p-5 h-24' />
        ))}
      </div>
      <div className='bg-white rounded-xl ring-1 ring-gray-100 h-64' />
    </div>
  </div>
);

/**
 * Form skeleton loader - for patient forms and diagnosis forms
 * Mimics a form layout with two cards: student info and medical info
 */
export const FormSkeleton = () => (
  <div className='w-full flex flex-col gap-5 animate-pulse'>
    {/* Skeleton Header */}
    <div>
      <div className='h-6 w-48 bg-gray-200 rounded-lg' />
      <div className='h-4 w-72 bg-gray-100 rounded-lg mt-2' />
    </div>
    {/* Skeleton Student Info Card */}
    <div className='bg-white rounded-xl ring-1 ring-gray-100 p-6'>
      <div className='flex items-center gap-2.5 mb-5'>
        <div className='w-8 h-8 rounded-lg bg-gray-200' />
        <div>
          <div className='h-4 w-36 bg-gray-200 rounded' />
          <div className='h-3 w-56 bg-gray-100 rounded mt-2' />
        </div>
      </div>
      <div className='flex flex-wrap gap-x-[5%] gap-y-4'>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className='w-[47.5%]'>
            <div className='h-3 w-16 bg-gray-100 rounded mb-1.5' />
            <div className='h-10 w-full bg-gray-100 rounded-xl' />
          </div>
        ))}
      </div>
    </div>
    {/* Skeleton Medical Info Card */}
    <div className='bg-white rounded-xl ring-1 ring-gray-100 p-6'>
      <div className='flex items-center gap-2.5 mb-5'>
        <div className='w-8 h-8 rounded-lg bg-gray-200' />
        <div>
          <div className='h-4 w-40 bg-gray-200 rounded' />
          <div className='h-3 w-52 bg-gray-100 rounded mt-2' />
        </div>
      </div>
      <div className='flex flex-col lg:flex-row gap-6'>
        <div className='w-full lg:w-1/2 flex flex-col gap-4'>
          <div className='h-10 w-full bg-gray-100 rounded-xl' />
          <div className='h-10 w-full bg-gray-100 rounded-xl' />
          <div className='h-10 w-full bg-gray-100 rounded-xl' />
        </div>
        <div className='w-full lg:w-1/2 flex flex-col gap-4'>
          <div className='h-28 w-full bg-gray-100 rounded-xl' />
          <div className='h-28 w-full bg-gray-100 rounded-xl' />
        </div>
      </div>
      <div className='flex justify-end mt-6 pt-4 border-t border-gray-100'>
        <div className='h-10 w-36 bg-gray-200 rounded-xl' />
      </div>
    </div>
  </div>
);

/**
 * Section loader skeleton - for a specific section/table area
 * Use when only part of the page depends on fetched data
 */
export const SectionLoader = () => (
  <div className="w-full animate-pulse py-8">
    <div className='flex flex-col gap-3'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='flex gap-4 px-5 py-3'>
          <div className='h-4 w-24 bg-gray-200 rounded' />
          <div className='h-4 w-32 bg-gray-100 rounded' />
          <div className='h-4 w-20 bg-gray-100 rounded' />
        </div>
      ))}
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
