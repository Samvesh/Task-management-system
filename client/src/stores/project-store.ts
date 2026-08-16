import { types, Instance, flow } from 'mobx-state-tree';
import { api } from '@/lib/api-client';

/**
 * Project model — mirrors the Mongoose Project schema on the server.
 */
const ProjectModel = types.model('Project', {
  _id: types.identifier,
  name: types.string,
  description: types.optional(types.string, ''),
  priority: types.optional(types.string, 'none'),
  dueDate: types.maybeNull(types.string),
  createdBy: types.optional(types.string, ''),
  createdAt: types.optional(types.string, ''),
});

export const ProjectStore = types
  .model('ProjectStore', {
    projects: types.optional(types.array(ProjectModel), []),
    isLoading: types.optional(types.boolean, false),
    error: types.optional(types.string, ''),
  })
  .views((self) => ({
    get projectCount() {
      return self.projects.length;
    },
  }))
  .actions((self) => ({
    /**
     * Fetch all projects from the API.
     */
    fetchProjects: flow(function* () {
      self.isLoading = true;
      self.error = '';
      try {
        const data: Array<Record<string, unknown>> = yield api.get('/projects');
        const mapped = data.map((p: Record<string, unknown>) => ({
          _id: p._id as string,
          name: p.name as string,
          description: (p.description as string) || '',
          priority: (p.priority as string) || 'none',
          dueDate: (p.dueDate as string) || null,
          createdBy: (p.createdBy as string) || '',
          createdAt: (p.createdAt as string) || '',
        }));
        self.projects.replace(mapped);
      } catch (e) {
        self.error = e instanceof Error ? e.message : 'Failed to fetch projects';
      } finally {
        self.isLoading = false;
      }
    }),

    /**
     * Create a new project via the API and add it to the local list.
     */
    createProject: flow(function* (data: { name: string; description?: string; priority?: string }) {
      self.error = '';
      try {
        const created: Record<string, unknown> = yield api.post('/projects', data);
        self.projects.push({
          _id: created._id as string,
          name: created.name as string,
          description: (created.description as string) || '',
          priority: (created.priority as string) || 'none',
          dueDate: (created.dueDate as string) || null,
          createdBy: (created.createdBy as string) || '',
          createdAt: (created.createdAt as string) || '',
        });
        return created;
      } catch (e) {
        self.error = e instanceof Error ? e.message : 'Failed to create project';
        throw e;
      }
    }),

    /**
     * Delete a project via the API and remove it from the local list.
     */
    deleteProject: flow(function* (id: string) {
      self.error = '';
      try {
        yield api.delete(`/projects/${id}`);
        const idx = self.projects.findIndex((p) => p._id === id);
        if (idx !== -1) self.projects.splice(idx, 1);
      } catch (e) {
        self.error = e instanceof Error ? e.message : 'Failed to delete project';
        throw e;
      }
    }),
  }));

export interface IProjectStore extends Instance<typeof ProjectStore> {}
