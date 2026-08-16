'use client';

import React from 'react';

/**
 * Priority-specific badge with balanced width and theme-conscious styling.
 * Width is tuned (min-w-[90px]) so words like 'Medium' and 'Urgent' fit with comfortable margin.
 */
import { ChevronUp, Minus, AlertCircle } from 'lucide-react';

const priorityStyles: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  urgent: {
    label: 'Urgent',
    icon: <AlertCircle size={12} strokeWidth={3} />,
    className:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/10 dark:bg-red-500/20',
  },
  high: {
    label: 'High',
    icon: <ChevronUp size={14} strokeWidth={3} />,
    className:
      'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/10 dark:bg-orange-500/20',
  },
  medium: {
    label: 'Medium',
    icon: <ChevronUp size={14} strokeWidth={3} />,
    className:
      'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/10 dark:bg-amber-500/20',
  },
  low: {
    label: 'Low',
    icon: <Minus size={14} strokeWidth={3} />,
    className:
      'bg-gray-500/10 text-gray-600 dark:text-gray-300 border-gray-500/10 dark:bg-gray-500/20',
  },
  none: {
    label: 'No Priority',
    icon: <Minus size={14} strokeWidth={3} />,
    className:
      'bg-gray-500/5 text-gray-400 dark:text-gray-500 border-border',
  },
};

interface PriorityBadgeProps {
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none' | string;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const normalized = (priority || 'none').toLowerCase();
  const config = priorityStyles[normalized] || priorityStyles.none;

  return (
    <span
      className={`
        inline-flex items-center justify-center gap-1.5
        min-w-[85px] px-3 py-1.5 text-xs font-bold
        rounded-full whitespace-nowrap
        ${config.className}
        ${className}
      `}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

/**
 * General Badge component for labels, status indicators, and tags.
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'priority' | 'status';
  color?: string;
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({
  children,
  variant = 'default',
  color,
  dot = false,
  className = '',
  style,
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors border shadow-2xs';

  const variantStyles = {
    default: 'bg-sidebar-hover text-text-secondary border-border',
    priority: '',
    status: 'bg-sidebar-hover text-text-secondary border-border',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color || 'currentColor' }}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

/**
 * Label tag matching the task card labels ("Deployment", "Research", etc.)
 */
interface LabelTagProps {
  label: string;
  className?: string;
}

const labelColors: Record<string, string> = {
  research: '#8b5cf6',
  design: '#ec4899',
  development: '#3b82f6',
  testing: '#22c55e',
  deployment: '#f97316',
};

export function LabelTag({ label, className = '' }: LabelTagProps) {
  const color = labelColors[label.toLowerCase()] || '#6b7280';

  return (
    <span
      className={`
        inline-flex items-center justify-center gap-1.5
        px-3 py-0.5 text-xs font-medium
        rounded-full whitespace-nowrap
        bg-sidebar-hover text-text-secondary border border-border
        ${className}
      `}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </span>
  );
}
