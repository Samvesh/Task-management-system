import { types, Instance } from 'mobx-state-tree';
import { ThemeStore } from './theme-store';
import { AuthStore } from './auth-store';
import { TaskStore } from './task-store';
import { ProjectStore } from './project-store';

/**
 * Root store — the top-level MobX State Tree model.
 *
 * This is the single source of truth for all client-side state.
 * Every feature store is composed here as a child model.
 *
 * Think of it like combining Redux slices:
 *   const store = configureStore({
 *     reducer: { theme: themeReducer, auth: authReducer }
 *   });
 *
 * But in MST, models are nested directly and share a tree context.
 */
export const RootStore = types
  .model('RootStore', {
    theme: types.optional(ThemeStore, {}),
    auth: types.optional(AuthStore, {}),
    tasks: types.optional(TaskStore, {}),
    projects: types.optional(ProjectStore, {}),
  })
  .actions((self) => ({
    /**
     * Hydrate all stores from localStorage on client mount.
     */
    hydrate() {
      self.theme.hydrate();
      self.auth.hydrate();
    },
  }));

export interface IRootStore extends Instance<typeof RootStore> {}

/** Singleton store instance */
let rootStore: IRootStore | undefined;

export function initializeStore(): IRootStore {
  // For SSR, always create a new store
  if (typeof window === 'undefined') {
    return RootStore.create({});
  }

  // For client, reuse the singleton
  if (!rootStore) {
    rootStore = RootStore.create({});
  }

  return rootStore;
}
