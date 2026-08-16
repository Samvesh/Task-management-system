'use client';

import React, { forwardRef } from 'react';

/**
 * Input component with rich focus states and clean border styling.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative w-full">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted flex items-center pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-xl border-2 border-border bg-surface
              px-3.5 py-2.5 text-sm text-text-primary
              placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
              transition-all duration-150 shadow-sm
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-danger focus:ring-danger/30 focus:border-danger' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-danger mt-0.5">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
