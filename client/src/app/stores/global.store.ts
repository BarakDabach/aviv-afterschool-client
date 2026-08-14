import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { User } from '../types/user.type';

type GlobalStoreState = {
  user: User | null;
};

const initialGlobalStoreState: GlobalStoreState = {
  user: null,
};

export const GlobalStore = signalStore(
  { providedIn: 'root' },
  withState(initialGlobalStoreState),
  withComputed(({ user }) => ({
    fullName: computed(() => user()?.fullName ?? ''),
    phoneNumber: computed(() => user()?.phoneNumber ?? ''),
    loggedIn: computed(() => {
      const currentUser = user();

      return currentUser !== null && currentUser.fullName.trim().length > 0 && currentUser.phoneNumber.trim().length > 0;
    }),
  })),
  withMethods((store) => ({
    setUser(user: User): void {
      patchState(store, { user });
    },
    clearUser(): void {
      patchState(store, initialGlobalStoreState);
    },
  })),
);
