import { computed, Injectable, signal } from '@angular/core';
import type { User } from '../types/user.type';

type UserStoreState = {
  user: User | null;
};

const EMPTY_USER_STORE_STATE: UserStoreState = {
  user: null,
};

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly state = signal<UserStoreState>(EMPTY_USER_STORE_STATE);

  readonly user = computed(() => this.state().user);
  readonly fullName = computed(() => this.user()?.fullName ?? '');
  readonly phoneNumber = computed(() => this.user()?.phoneNumber ?? '');
  readonly loggedIn = computed(() => {
    const user = this.user();

    return user !== null && user.fullName.trim().length > 0 && user.phoneNumber.trim().length > 0;
  });

  setUser(user: User): void {
    this.state.set({ user });
  }

  clearUser(): void {
    this.state.set(EMPTY_USER_STORE_STATE);
  }
}
