'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/providers/store-provider';
import { LoginPage } from '@/components/pages/login-page';
import { AppShell } from '@/components/layout';
import { Button, Input, Modal, PriorityBadge } from '@/components/ui';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  PauseCircle,
  X,
  MoreVertical,
  ClipboardList,
  Check,
} from 'lucide-react';

/**
 * Main app orchestrator — handles auth gating and page routing.
 */
export const AppRoot = observer(function AppRoot() {
  const { auth } = useStore();
  const [activePage, setActivePage] = useState<'tasks' | 'projects' | 'settings'>('tasks');

  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppShell activePage={activePage} onNavigate={(page) => setActivePage(page as 'tasks' | 'projects' | 'settings')}>
      {activePage === 'tasks' && <TasksPage />}
      {activePage === 'projects' && <ProjectsPage />}
      {activePage === 'settings' && <SettingsPlaceholder />}
    </AppShell>
  );
});

/* ─────────────────────── Shared Helpers ─────────────────────── */

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />;
    case 'doing':
      return <Clock size={16} className="text-blue-500 flex-shrink-0" />;
    case 'on-hold':
      return <PauseCircle size={16} className="text-amber-500 flex-shrink-0" />;
    default:
      return <Circle size={16} className="text-text-muted flex-shrink-0" />;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'todo': return 'To Do';
    case 'doing': return 'Doing';
    case 'completed': return 'Completed';
    case 'on-hold': return 'On Hold';
    default: return status;
  }
}

/**
 * Inline search bar with compact footprint and clean bounds.
 */
function SearchBar({
  value,
  onChange,
  onClose,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-strong rounded-xl shadow-xs transition-all animate-[modal-in_150ms_ease-out]">
      <Search size={14} className="text-text-muted flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        className="bg-transparent text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none w-[130px] sm:w-[170px]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-text-muted hover:text-text-primary p-0.5 rounded-md hover:bg-sidebar-hover transition-colors cursor-pointer"
        >
          <X size={12} />
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        className="text-text-muted hover:text-text-primary p-0.5 rounded-md hover:bg-sidebar-hover transition-colors cursor-pointer border-l border-border pl-1.5"
        title="Close search"
      >
        <X size={13} />
      </button>
    </div>
  );
}

/**
 * Filter dropdown with spacious form options and clear buttons.
 */
function FilterDropdown({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange,
  onClose,
  type,
}: {
  statusFilter: string;
  priorityFilter: string;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onClose: () => void;
  type: 'task' | 'project';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const statuses = type === 'task'
    ? [
        { value: '', label: 'All Statuses' },
        { value: 'todo', label: 'To Do' },
        { value: 'doing', label: 'Doing' },
        { value: 'completed', label: 'Completed' },
        { value: 'on-hold', label: 'On Hold' },
      ]
    : [];

  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[240px] bg-surface-overlay rounded-xl border border-border-strong shadow-2xl p-4 z-50 animate-[modal-in_150ms_ease-out]"
      style={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border">
        <p className="text-xs font-bold text-text-primary uppercase tracking-wider">Filter Options</p>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-sidebar-hover transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {statuses.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {(statusFilter || priorityFilter) && (
        <button
          type="button"
          onClick={() => { onStatusChange(''); onPriorityChange(''); }}
          className="mt-4 w-full py-1.5 text-xs text-accent hover:text-accent-hover font-semibold transition-colors border border-accent/30 rounded-lg hover:bg-accent/10 cursor-pointer"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}

/* ───────────────────────────── Tasks Page ───────────────────────────── */

const TasksPage = observer(function TasksPage() {
  const { tasks: taskStore } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    taskStore.fetchTasks();
  }, [taskStore]);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await taskStore.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority !== 'none' ? priority : undefined,
      });
      setTitle('');
      setDescription('');
      setPriority('none');
      setShowModal(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, priority, taskStore]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await taskStore.deleteTask(id);
      setSelectedTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {
      // Handled in store
    }
  }, [taskStore]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedTaskIds.size === 0) return;
    
    // We confirm before deleting multiple to avoid accidental deletion
    if (!window.confirm(`Are you sure you want to delete ${selectedTaskIds.size} task(s)?`)) return;

    try {
      await Promise.all(Array.from(selectedTaskIds).map((id) => taskStore.deleteTask(id)));
      setSelectedTaskIds(new Set());
    } catch (e) {
      console.error('Failed to delete some tasks');
    }
  }, [selectedTaskIds, taskStore]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredTasks = taskStore.tasks.filter((task) => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    return true;
  });

  const hasActiveFilters = statusFilter || priorityFilter;

  return (
    <div className="px-6 py-6 sm:px-10 sm:py-8 w-full max-w-6xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">Tasks</h1>
              <span className="text-sm font-bold text-accent bg-accent/15 px-3 py-0.5 rounded-full shadow-2xs">
                {taskStore.tasks.length}
              </span>
            </div>
            <p className="text-sm text-text-muted">
              Organize your work. Prioritize what matters.
            </p>
          </div>

          <div className="flex items-center gap-3 relative">
            {showSearch ? (
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClose={() => { setShowSearch(false); setSearchQuery(''); }}
                placeholder="Search tasks..."
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="p-2.5 border border-border bg-surface hover:border-border-strong hover:bg-sidebar-hover rounded-xl text-text-muted hover:text-text-primary transition-all cursor-pointer shadow-2xs"
                title="Search tasks"
              >
                <Search size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFilter(!showFilter)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs bg-surface ${
                hasActiveFilters
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'border-border hover:border-border-strong hover:bg-sidebar-hover text-text-muted hover:text-text-primary'
              }`}
              title="Filter tasks"
            >
              <Filter size={18} />
            </button>

            {showFilter && (
              <FilterDropdown
                statusFilter={statusFilter}
                priorityFilter={priorityFilter}
                onStatusChange={setStatusFilter}
                onPriorityChange={setPriorityFilter}
                onClose={() => setShowFilter(false)}
                type="task"
              />
            )}

            {selectedTaskIds.size > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 px-3 py-2.5 rounded-xl font-semibold shadow-sm transition-colors cursor-pointer text-sm mr-1"
                title={`Delete ${selectedTaskIds.size} selected tasks`}
              >
                <Trash2 size={16} />
                <span>Delete ({selectedTaskIds.size})</span>
              </button>
            )}

            <button 
              type="button" 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-colors cursor-pointer text-sm"
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-semibold text-text-muted">Active Filters:</span>
          {statusFilter && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-sidebar-hover text-text-primary px-3 py-0.5 rounded-full border border-border shadow-2xs">
              <span>Status: <strong>{statusLabel(statusFilter)}</strong></span>
              <button type="button" onClick={() => setStatusFilter('')} className="hover:text-danger transition-colors cursor-pointer">
                <X size={11} />
              </button>
            </span>
          )}
          {priorityFilter && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-sidebar-hover text-text-primary px-3 py-0.5 rounded-full border border-border shadow-2xs">
              <span>Priority: <strong className="capitalize">{priorityFilter}</strong></span>
              <button type="button" onClick={() => setPriorityFilter('')} className="hover:text-danger transition-colors cursor-pointer">
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Loading state */}
      {taskStore.isLoading && (
        <div className="flex flex-col items-center justify-center h-56 border border-border rounded-2xl bg-surface">
          <Loader2 size={26} className="animate-spin text-accent mb-2" />
          <p className="text-xs font-medium text-text-muted">Loading tasks...</p>
        </div>
      )}

      {/* Error state */}
      {taskStore.error && (
        <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium">
          {taskStore.error}
        </div>
      )}

      {/* Empty state */}
      {!taskStore.isLoading && taskStore.tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border-strong rounded-2xl bg-surface p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-sidebar-hover border border-border flex items-center justify-center mb-3">
            <Circle size={22} className="text-text-muted" />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1">No tasks created yet</h3>
          <p className="text-text-muted text-xs max-w-sm mb-4">
            Create your first task to get started organizing your project work.
          </p>
          <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
            <Plus size={15} />
            <span>Create First Task</span>
          </Button>
        </div>
      )}

      {/* No results for filters */}
      {!taskStore.isLoading && taskStore.tasks.length > 0 && filteredTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-56 border border-dashed border-border rounded-2xl bg-surface p-6 text-center">
          <Search size={26} className="text-text-muted mb-2" />
          <p className="text-sm font-bold text-text-primary mb-0.5">No matching tasks found</p>
          <p className="text-xs text-text-muted mb-3">Try adjusting your search terms or clearing current filters.</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setStatusFilter(''); setPriorityFilter(''); }}
            className="text-xs font-bold text-accent hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Task List Table with generous internal cell padding */}
      {!taskStore.isLoading && filteredTasks.length > 0 && (
        <div className="border border-border rounded-2xl overflow-hidden shadow-xs bg-surface mb-8">
          {/* Table Header with spacious padding */}
          <div className="flex items-center gap-4 px-7 py-4 border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
            <div className="flex-1 min-w-[200px] pl-1">Task</div>
            <div className="w-[130px] text-center">Status</div>
            <div className="w-[130px] text-center">Priority</div>
            <div className="w-[60px] text-center pr-2">Action</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border/60">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center gap-4 px-7 py-4 hover:bg-sidebar-hover/40 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-[200px] pr-2">
                  <div 
                    onClick={() => toggleSelection(task._id)}
                    className={`flex-shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-[6px] border cursor-pointer shadow-2xs transition-all ${
                      selectedTaskIds.has(task._id)
                        ? 'bg-accent border-accent text-white'
                        : 'border-border-strong bg-surface hover:border-accent'
                    }`}
                  >
                    {selectedTaskIds.has(task._id) && <Check size={12} strokeWidth={4} />}
                  </div>
                  
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={18} className="text-accent" />
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-text-muted truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-[130px] flex items-center justify-center">
                  <span className="inline-flex items-center justify-center gap-2 min-w-[90px] px-3 py-1.5 text-xs font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-transparent">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <span>{statusLabel(task.status)}</span>
                  </span>
                </div>

                <div className="w-[130px] flex items-center justify-center">
                  <PriorityBadge priority={task.priority} />
                </div>

                <div className="w-[60px] flex justify-center pr-2">
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-all cursor-pointer"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task">
        <form
          onSubmit={(e) => { e.preventDefault(); handleCreate(); }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g., Write API Documentation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all shadow-2xs"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Description
            </label>
            <textarea
              placeholder="Add task details, notes, or instructions (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none shadow-2xs"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer shadow-2xs"
            >
              <option value="none">No Priority</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>
          </div>

          {submitError && (
            <p className="text-xs font-medium text-danger bg-danger/10 p-3 rounded-xl border border-danger/30">
              {submitError}
            </p>
          )}

          {/* Footer actions with generous separation */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span>Create Task</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
});

/* ───────────────────────── Projects Page ──────────────────────────── */

const ProjectsPage = observer(function ProjectsPage() {
  const { projects: projectStore } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    projectStore.fetchProjects();
  }, [projectStore]);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await projectStore.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        priority: priority !== 'none' ? priority : undefined,
      });
      setName('');
      setDescription('');
      setPriority('none');
      setShowModal(false);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, description, priority, projectStore]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await projectStore.deleteProject(id);
    } catch {
      // Handled in store
    }
  }, [projectStore]);

  const filteredProjects = projectStore.projects.filter((project) => {
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (priorityFilter && project.priority !== priorityFilter) return false;
    return true;
  });

  const hasActiveFilters = !!priorityFilter;

  return (
    <div className="px-6 py-6 sm:px-10 sm:py-8 w-full max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Projects</h1>
          {projectStore.projects.length > 0 && (
            <span className="text-xs font-bold text-text-secondary bg-sidebar-hover border border-border px-2.5 py-0.5 rounded-full shadow-2xs">
              {filteredProjects.length}{filteredProjects.length !== projectStore.projects.length ? ` of ${projectStore.projects.length}` : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 relative">
          {showSearch ? (
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClose={() => { setShowSearch(false); setSearchQuery(''); }}
              placeholder="Search projects..."
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="p-2 border border-border hover:border-border-strong hover:bg-sidebar-hover rounded-xl text-text-muted hover:text-text-primary transition-all cursor-pointer shadow-2xs"
              title="Search projects"
            >
              <Search size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFilter(!showFilter)}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
              hasActiveFilters
                ? 'bg-accent/15 border-accent text-accent'
                : 'border-border hover:border-border-strong hover:bg-sidebar-hover text-text-muted hover:text-text-primary'
            }`}
            title="Filter projects"
          >
            <Filter size={15} />
          </button>

          {showFilter && (
            <FilterDropdown
              statusFilter=""
              priorityFilter={priorityFilter}
              onStatusChange={() => {}}
              onPriorityChange={setPriorityFilter}
              onClose={() => setShowFilter(false)}
              type="project"
            />
          )}

          <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
            <Plus size={15} />
            <span>Add Project</span>
          </Button>
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-semibold text-text-muted">Active Filters:</span>
          {priorityFilter && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-sidebar-hover text-text-primary px-3 py-0.5 rounded-full border border-border shadow-2xs">
              <span>Priority: <strong className="capitalize">{priorityFilter}</strong></span>
              <button type="button" onClick={() => setPriorityFilter('')} className="hover:text-danger transition-colors cursor-pointer">
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Loading state */}
      {projectStore.isLoading && (
        <div className="flex flex-col items-center justify-center h-56 border border-border rounded-2xl bg-surface">
          <Loader2 size={26} className="animate-spin text-accent mb-2" />
          <p className="text-xs font-medium text-text-muted">Loading projects...</p>
        </div>
      )}

      {/* Error state */}
      {projectStore.error && (
        <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium">
          {projectStore.error}
        </div>
      )}

      {/* Empty state */}
      {!projectStore.isLoading && projectStore.projects.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border-strong rounded-2xl bg-surface p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-sidebar-hover border border-border flex items-center justify-center mb-3">
            <Circle size={22} className="text-text-muted" />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1">No projects created yet</h3>
          <p className="text-text-muted text-xs max-w-sm mb-4">
            Organize tasks into cohesive projects by creating your first project now.
          </p>
          <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
            <Plus size={15} />
            <span>Create First Project</span>
          </Button>
        </div>
      )}

      {/* No results */}
      {!projectStore.isLoading && projectStore.projects.length > 0 && filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center h-56 border border-dashed border-border rounded-2xl bg-surface p-6 text-center">
          <Search size={26} className="text-text-muted mb-2" />
          <p className="text-sm font-bold text-text-primary mb-0.5">No matching projects found</p>
          <p className="text-xs text-text-muted mb-3">Try searching with a different name or clearing current filters.</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setPriorityFilter(''); }}
            className="text-xs font-bold text-accent hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Projects Table */}
      {!projectStore.isLoading && filteredProjects.length > 0 && (
        <div className="border border-border rounded-2xl overflow-hidden shadow-xs bg-surface">
          {/* Table Header */}
          <div className="flex items-center gap-4 px-7 py-3.5 bg-sidebar-hover/80 border-b border-border text-xs font-bold text-text-muted uppercase tracking-wider">
            <div className="flex-1 min-w-[200px] pl-1">Project Name</div>
            <div className="w-[130px] text-center">Priority</div>
            <div className="w-[150px] text-center">Created Date</div>
            <div className="w-[60px] text-right pr-2">Action</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border/60">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="flex items-center gap-4 px-7 py-3.5 hover:bg-sidebar-hover/40 transition-colors group"
              >
                <div className="flex-1 min-w-[200px] pr-2">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {project.name}
                  </p>
                  {project.description && (
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="w-[130px] flex items-center justify-center">
                  <PriorityBadge priority={project.priority} />
                </div>

                <div className="w-[150px] text-xs font-medium text-text-muted text-center">
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </div>

                <div className="w-[60px] flex justify-end pr-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(project._id)}
                    className="p-1.5 hover:bg-danger/15 rounded-lg text-text-muted hover:text-danger transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Project">
        <form
          onSubmit={(e) => { e.preventDefault(); handleCreate(); }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Project Name
            </label>
            <input
              type="text"
              placeholder="e.g., Design Homepage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all shadow-2xs"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Description
            </label>
            <textarea
              placeholder="Add project scope, roadmap, or goals (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none shadow-2xs"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer shadow-2xs"
            >
              <option value="none">No Priority</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>
          </div>

          {submitError && (
            <p className="text-xs font-medium text-danger bg-danger/10 p-3 rounded-xl border border-danger/30">
              {submitError}
            </p>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span>Create Project</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
});

/* ──────────────────────── Settings Placeholder ──────────────────────── */

function SettingsPlaceholder() {
  const { auth } = useStore();

  return (
    <div className="px-6 py-6 sm:px-10 sm:py-8 w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-6">Settings</h1>

      <div className="border border-border rounded-2xl bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-text-primary">Profile & Account</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage your workspace account information</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="p-4 bg-sidebar-hover/50 rounded-xl border border-border">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Display Name</label>
            <p className="text-sm font-bold text-text-primary mt-1">{auth.fullName || 'Guest User'}</p>
          </div>
          <div className="p-4 bg-sidebar-hover/50 rounded-xl border border-border">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Account Type</label>
            <p className="text-sm font-bold text-text-primary mt-1">{auth.isGuest ? 'Guest Session' : 'Registered User'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
