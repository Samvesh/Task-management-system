'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { IRootStore, initializeStore } from '@/stores';

/**
 * React context for the MobX State Tree root store.
 *
 * This pattern bridges MST with React:
 * 1. StoreProvider wraps the app and creates/hydrates the store
 * 2. useStore() hook gives any component access to the store
 * 3. Components wrapped with `observer()` from mobx-react-lite
 *    auto-re-render when observed store properties change
 */
const StoreContext = createContext<IRootStore | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<IRootStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = initializeStore();
  }

  useEffect(() => {
    // Hydrate stores from localStorage on client mount
    storeRef.current?.hydrate();
  }, []);

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

/**
 * Hook to access the root MST store from any component.
 *
 * Usage:
 *   const { theme, auth } = useStore();
 *   theme.setTheme('dark');
 *   auth.isAuthenticated;
 */
export function useStore(): IRootStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
}
