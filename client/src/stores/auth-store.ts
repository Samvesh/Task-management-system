import { types, Instance } from 'mobx-state-tree';

/**
 * Auth store — manages the current user session.
 *
 * Handles:
 * - Guest login (stores JWT + user info)
 * - Session persistence (localStorage)
 * - Auth state (isAuthenticated, currentUser)
 */
export const AuthStore = types
  .model('AuthStore', {
    accessToken: types.optional(types.string, ''),
    userId: types.optional(types.string, ''),
    fullName: types.optional(types.string, ''),
    isGuest: types.optional(types.boolean, false),
    isAuthenticated: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    setSession(data: {
      accessToken: string;
      user: { _id: string; fullName: string; isGuest: boolean };
    }) {
      self.accessToken = data.accessToken;
      self.userId = data.user._id;
      self.fullName = data.user.fullName;
      self.isGuest = data.user.isGuest;
      self.isAuthenticated = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('ablespace-token', data.accessToken);
        localStorage.setItem(
          'ablespace-user',
          JSON.stringify(data.user),
        );
      }
    },
    clearSession() {
      self.accessToken = '';
      self.userId = '';
      self.fullName = '';
      self.isGuest = false;
      self.isAuthenticated = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('ablespace-token');
        localStorage.removeItem('ablespace-user');
      }
    },
    hydrate() {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('ablespace-token');
      const userJson = localStorage.getItem('ablespace-user');

      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          self.accessToken = token;
          self.userId = user._id;
          self.fullName = user.fullName;
          self.isGuest = user.isGuest ?? false;
          self.isAuthenticated = true;
        } catch {
          // Invalid stored data, clear it
          localStorage.removeItem('ablespace-token');
          localStorage.removeItem('ablespace-user');
        }
      }
    },
  }));

export interface IAuthStore extends Instance<typeof AuthStore> {}
