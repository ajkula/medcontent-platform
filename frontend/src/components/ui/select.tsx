'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, error, ...props }, ref) => {
    return (
      <div className='space-y-2'>
        {label && (
          <label className='block text-sm font-medium text-grey-700'>
            {label}
          </label>
        )}
        <select
          className={cn(
            "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className='text-sm text-red-500'>{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };