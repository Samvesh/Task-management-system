'use client';

import React from 'react';
import { Sidebar } from './sidebar';

interface AppShellProps {
  children: React.ReactNode;
  activePage: 'tasks' | 'projects' | 'settings';
  onNavigate: (page: string) => void;
}

export function AppShell({ children, activePage, onNavigate }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-surface w-full overflow-x-hidden">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto overflow-x-hidden bg-surface">
        {children}
      </main>
    </div>
  );
}
