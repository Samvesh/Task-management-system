import { types, Instance } from 'mobx-state-tree';

/**
 * MobX State Tree store for theme management.
 *
 * MST is like a typed, snapshot-able version of Redux — but with
 * mutable-looking code that's actually tracked immutably under the hood.
 *
 * Key concepts for your interview:
 * - `types.model()` defines a "model" (like a Redux slice)
 * - `.props({})` defines the state shape (like Redux initial state)
 * - `.actions()` defines mutations (like Redux reducers, but look like plain mutations)
 * - `.views()` defines computed values (like Redux selectors)
 *
 * Why MST over Redux?
 * - Less boilerplate (no action types, no switch statements)
 * - Built-in TypeScript types
 * - Snapshot serialization (easy to persist/restore state)
 * - Tree structure with references (good for relational data like tasks → users)
 */
export const ThemeStore = types
  .model('ThemeStore', {
    theme: types.optional(
      types.enumeration('Theme', ['light', 'dark']),
      'light',
    ),
    colorMode: types.optional(
      types.enumeration('ColorMode', ['amber', 'blue', 'pink', 'rose', 'emerald', 'black']),
      'blue',
    ),
  })
  .actions((self) => ({
    setTheme(theme: 'light' | 'dark') {
      self.theme = theme;
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('ablespace-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
    },
    setColorMode(color: 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black') {
      self.colorMode = color;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ablespace-color', color);
        document.documentElement.setAttribute('data-color', color);
      }
    },
    /**
     * Initialize from localStorage on client mount.
     * Called once in the ThemeProvider.
     */
    hydrate() {
      if (typeof window === 'undefined') return;

      const savedTheme = localStorage.getItem('ablespace-theme') as 'light' | 'dark' | null;
      const savedColor = localStorage.getItem('ablespace-color') as 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black' | null;

      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        self.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
      if (savedColor && ['amber', 'blue', 'pink', 'rose', 'emerald', 'black'].includes(savedColor)) {
        self.colorMode = savedColor;
        document.documentElement.setAttribute('data-color', savedColor);
      }
    },
  }))
  .views((self) => ({
    get isDark() {
      return self.theme === 'dark';
    },
  }));

export interface IThemeStore extends Instance<typeof ThemeStore> {}
