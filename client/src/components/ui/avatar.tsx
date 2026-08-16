'use client';

import React from 'react';

/**
 * Avatar component matching the Figma design.
 *
 * Shows a user's avatar image or falls back to initials in a colored circle.
 * Used in: sidebar user section, task cards, member lists, profile page.
 */
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

/**
 * Generate a deterministic color from a name string.
 * This ensures the same user always gets the same avatar color.
 */
function getInitialColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-purple-500',
    'bg-cyan-500',
    'bg-orange-500',
    'bg-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} ${getInitialColor(
        name,
      )} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

/**
 * AvatarGroup — stacked avatars like the member display in Figma task cards.
 */
interface AvatarGroupProps {
  users: { name: string; avatar?: string | null }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((user, i) => (
        <Avatar
          key={i}
          src={user.avatar}
          name={user.name}
          size={size}
          className="ring-2 ring-surface"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`${sizeMap[size]} rounded-full bg-sidebar-active flex items-center justify-center text-text-muted font-medium flex-shrink-0 ring-2 ring-surface`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
