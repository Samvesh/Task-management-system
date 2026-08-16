'use client';

import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  LayoutGrid,
  FolderOpen,
  ChevronDown,
  ChevronsUpDown,
  Sun,
  Moon,
  Palette,
  Settings,
  LogOut,
  Check,
} from 'lucide-react';
import { useStore } from '@/providers/store-provider';
import { Avatar } from '@/components/ui';
import { THEMES, COLOR_MODES } from '@/lib/theme-config';
import type { Theme, ColorMode } from '@/lib/theme-config';

interface SidebarProps {
  activePage: 'tasks' | 'projects' | 'settings';
  onNavigate: (page: string) => void;
}

export const Sidebar = observer(function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  const { theme, auth } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeSubmenuOpen, setThemeSubmenuOpen] = useState(false);
  const [colorSubmenuOpen, setColorSubmenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setThemeSubmenuOpen(false);
        setColorSubmenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      key: 'tasks',
      label: 'Tasks',
      icon: <LayoutGrid size={17} />,
    },
    {
      key: 'projects',
      label: 'Projects',
      icon: <FolderOpen size={17} />,
    },
  ];

  return (
    <aside className="w-[240px] min-h-screen bg-sidebar-bg border-r-2 border-sidebar-border flex flex-col flex-shrink-0 relative select-none">
      {/* ---- User / Workspace header ---- */}
      <div className="p-4 border-b-2 border-sidebar-border">
        <button
          className="flex items-center gap-3 w-full text-left hover:bg-sidebar-hover rounded-xl p-2 -m-1 transition-all cursor-pointer border border-transparent hover:border-border"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
        >
          <Avatar name={auth.fullName || 'Guest'} size="sm" />
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-sidebar-text truncate">
              {auth.fullName || 'Guest'}
            </span>
            <span className="block text-[11px] text-sidebar-text-muted capitalize">
              {auth.isGuest ? 'Guest Workspace' : 'Personal Workspace'}
            </span>
          </div>
          <ChevronsUpDown size={15} className="text-sidebar-text-muted flex-shrink-0" />
        </button>
      </div>

      {/* ---- Navigation ---- */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-2.5 mb-2 text-[11px] font-bold text-sidebar-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <span>Workspace</span>
          <ChevronDown size={12} className="opacity-70" />
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => onNavigate(item.key)}
                className={`
                  flex items-center gap-3 w-full px-3 py-2 text-sm rounded-xl
                  transition-all duration-150 cursor-pointer font-medium relative overflow-hidden
                  ${
                    activePage === item.key
                      ? 'bg-accent/10 text-accent font-bold'
                      : 'text-sidebar-text-muted hover:bg-sidebar-hover hover:text-sidebar-text'
                  }
                `}
              >
                {activePage === item.key && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent" />
                )}
                <div className={activePage === item.key ? 'text-accent' : ''}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Theme Toggle at Sidebar Bottom */}
      <div className="p-4 border-t border-sidebar-border flex items-center justify-between mt-auto">
        <button
          onClick={() => theme.setTheme(theme.isDark ? 'light' : 'dark')}
          className="flex items-center gap-2 text-sidebar-text-muted hover:text-sidebar-text transition-colors cursor-pointer group"
          title="Toggle site theme (Light / Dark)"
        >
          {theme.isDark ? <Moon size={16} /> : <Sun size={16} />}
          <span className="text-xs font-bold">{theme.isDark ? 'Dark Mode' : 'Light Mode'}</span>
          {theme.isDark && (
            <div className="ml-1 w-8 h-4.5 bg-accent rounded-full relative shadow-inner flex items-center">
              <div className="w-3.5 h-3.5 bg-white rounded-full absolute right-0.5 shadow-sm flex items-center justify-center">
                <Check size={9} className="text-accent" />
              </div>
            </div>
          )}
        </button>

        <button
          onClick={() => {
            onNavigate('settings');
          }}
          className="p-1.5 border border-border text-sidebar-text-muted hover:text-sidebar-text hover:bg-sidebar-hover rounded-xl transition-colors cursor-pointer shadow-2xs bg-surface"
          title="Settings"
        >
          <Settings size={15} />
        </button>
      </div>

      {/* ---- User Dropdown Menu ---- */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute bottom-16 left-3 right-3 bg-surface-overlay rounded-2xl border-2 border-border-strong shadow-2xl p-2 z-[9999] animate-[modal-in_150ms_ease-out]"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* User info card inside dropdown */}
          <div className="flex items-center gap-3 p-3 bg-sidebar-hover/60 rounded-xl border border-border mb-2">
            <Avatar name={auth.fullName || 'Guest'} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-text-primary truncate">
                {auth.fullName || 'Guest'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {auth.isGuest ? 'Guest User' : 'User Account'}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <div className="space-y-1">
            {/* Change Theme submenu */}
            <div>
              <button
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-sidebar-hover rounded-lg transition-colors cursor-pointer"
                onClick={() => {
                  setThemeSubmenuOpen(!themeSubmenuOpen);
                  setColorSubmenuOpen(false);
                }}
              >
                <span className="flex items-center gap-2.5">
                  {theme.isDark ? <Moon size={15} /> : <Sun size={15} />}
                  <span>Change Theme</span>
                </span>
                <ChevronDown size={13} className={`transition-transform duration-150 ${themeSubmenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {themeSubmenuOpen && (
                <div className="mt-1 mb-1.5 p-1 bg-sidebar-hover/50 rounded-xl border border-border space-y-0.5">
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => {
                        theme.setTheme(t.value as Theme);
                        setThemeSubmenuOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {t.value === 'light' ? <Sun size={13} /> : <Moon size={13} />}
                        <span>{t.label}</span>
                      </span>
                      {theme.theme === t.value && (
                        <Check size={14} className="text-accent font-bold" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color Mode submenu */}
            <div>
              <button
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-sidebar-hover rounded-lg transition-colors cursor-pointer"
                onClick={() => {
                  setColorSubmenuOpen(!colorSubmenuOpen);
                  setThemeSubmenuOpen(false);
                }}
              >
                <span className="flex items-center gap-2.5">
                  <Palette size={15} />
                  <span>Color Mode</span>
                </span>
                <ChevronDown size={13} className={`transition-transform duration-150 ${colorSubmenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {colorSubmenuOpen && (
                <div className="mt-1 mb-1.5 p-1 bg-sidebar-hover/50 rounded-xl border border-border grid grid-cols-2 gap-1">
                  {COLOR_MODES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        theme.setColorMode(c.value as ColorMode);
                        setColorSubmenuOpen(false);
                      }}
                      className={`
                        flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer
                        ${
                          theme.colorMode === c.value
                            ? 'bg-surface text-text-primary font-semibold border border-border shadow-xs'
                            : 'text-text-secondary hover:bg-surface'
                        }
                      `}
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10 shadow-xs"
                        style={{ backgroundColor: c.swatch }}
                      />
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              onClick={() => {
                onNavigate('settings');
                setMenuOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-sidebar-hover rounded-lg transition-colors cursor-pointer"
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>
          </div>

          {/* Logout button */}
          <div className="border-t border-border pt-1.5 mt-1.5">
            <button
              onClick={() => {
                auth.clearSession();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
});
