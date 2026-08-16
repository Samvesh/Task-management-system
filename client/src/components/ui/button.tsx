'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap active:scale-[0.98]';

  const variants = {
    primary:
      'bg-text-primary text-text-inverse hover:opacity-90 active:opacity-80 border border-transparent shadow-xs',
    secondary:
      'bg-surface border border-border text-text-primary hover:bg-sidebar-hover hover:border-border-strong active:bg-sidebar-active shadow-xs',
    danger:
      'bg-danger text-white hover:bg-danger-hover active:opacity-90 border border-transparent shadow-xs',
    ghost:
      'bg-transparent text-text-secondary hover:bg-sidebar-hover hover:text-text-primary active:bg-sidebar-active',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[30px]',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2 min-h-[36px]',
    lg: 'px-5 py-2.5 text-sm gap-2 min-h-[40px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
