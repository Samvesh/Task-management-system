import { types, Instance, flow, cast } from 'mobx-state-tree';
import { api } from '@/lib/api-client';

/**
 * Task model — mirrors the Mongoose Task schema on the server.
 *
 * Only the fields we actually need on the client are included here.
 * The server returns additional computed fields (createdAt, updatedAt)
 * that we simply read through without modeling.
 */
const TaskModel = types.model('Task', {
  _id: types.identifier,
  title: types.string,
  description: types.optional(types.string, ''),
  status: types.optional(types.string, 'todo'),
  priority: types.optional(types.string, 'none'),
  dueDate: types.maybeNull(types.string),
  labels: types.optional(types.array(types.string), []),
  project: types.maybeNull(types.string),
  createdBy: types.optional(types.string, ''),
  createdAt: types.optional(types.string, ''),
});

export const TaskStore = types
  .model('TaskStore', {
    tasks: types.optional(types.array(TaskModel), []),
    isLoading: types.optional(types.boolean, false),
    error: types.optional(types.string, ''),
  })
  .views((self) => ({
    get taskCount() {
      return self.tasks.length;
    },
    getByStatus(status: string) {
      return self.tasks.filter((t) => t.status === status);
    },
  }))
  .actions((self) => ({
    /**
     * Fetch all tasks from the API.
     */
    fetchTasks: flow(function* () {
      self.isLoading = true;
      self.error = '';
      try {
        const data: Array<Record<string, unknown>> = yield api.get('/tasks');
        // Map server response to our model shape
        const mapped = data.map((t: Record<string, unknown>) => ({
          _id: t._id as string,
          title: t.title as string,
          description: (t.description as string) || '',
          status: (t.status as string) || 'todo',
          priority: (t.priority as string) || 'none',
          dueDate: (t.dueDate as string) || null,
          labels: (t.labels as string[]) || [],
          project: (t.project as string) || null,
          createdBy: (t.createdBy as string) || '',
          createdAt: (t.createdAt as string) || '',
        }));
        self.tasks = cast(mapped);
      } catch (e) {
        self.error = e instanceof Error ? e.message : 'Failed to fetch tasks';
      } finally {
        self.isLoading = false;
      }
    }),

    /**
     * Create a new task via the API and add it to the local list.
     */
    createTask: flow(function* (data: { title: string; description?: string; priority?: string }) {
      self.error = '';
      try {
        const created: Record<string, unknown> = yield api.post('/tasks', data);
        self.tasks.push({
          _id: created._id as string,
          title: created.title as string,
          description: (created.description as string) || '',
          status: (created.status as string) || 'todo',
          priority: (created.priority as string) || 'none',
          dueDate: (created.dueDate as string) || null,
          labels: (created.labels as string[]) || [],
          project: (created.project as string) || null,
          createdBy: (created.createdBy as string) || '',
          createdAt: (created.createdAt as string) || '',
        });
        return created;
      } catch (e) {
        self.error = e instanceof Error ? e.message : 'Failed to create task';
        throw e;
      }
    }),

    /**
     * Delete a task via the API and remove it from the local list.
     */
    deleteTask: flow(function* (id: string) {
      self.error = '';
      try {
        yield api.delete(`/tasks/${id}`);
        const idx = self.tasks.findIndex((t) => t._id === id);
        if (idx !== -1) self.tasks.splice(idx, 1);
      } catch (e) {
        self.error = e instanceof Error ? e.message : 'Failed to delete task';
        throw e;
      }
    }),
  }));

export interface ITaskStore extends Instance<typeof TaskStore> {}
