import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { AuthenticatedUser } from '../types/auth.type';

type GlobalStoreState = {
  user: AuthenticatedUser | null;
};

const initialGlobalStoreState: GlobalStoreState = {
  user: null,
};

export const GlobalStore = signalStore(
  { providedIn: 'root' },
  withState(initialGlobalStoreState),
  withComputed(({ user }) => ({
    fullName: computed(() => user()?.fullName ?? ''),
    email: computed(() => user()?.email ?? ''),
    phoneNumber: computed(() => user()?.phoneNumber ?? ''),
    role: computed(() => user()?.role ?? null),
    loggedIn: computed(() => user() !== null),
    isParent: computed(() => user()?.role === 'parent'),
    isAdmin: computed(() => user()?.role === 'admin'),
  })),
  withMethods((store) => ({
    setUser(user: AuthenticatedUser): void {
      patchState(store, { user });
    },
    clearUser(): void {
      patchState(store, initialGlobalStoreState);
    },
  })),
);
