import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthFacade } from '../facades/auth.facade';
import { ParentFacade } from '../facades/parent.facade';
import { GlobalStore } from '../stores/global.store';
import { RegistrationStatus, type RegistrationState } from '../types/registration-status.type';

const BLOCKING_ACTIVE_REGISTRATION_STATUSES = new Set<RegistrationStatus>([
  RegistrationStatus.WaitingForDocuments,
  RegistrationStatus.PendingApproval,
]);

const ensureAuthSession = async (globalStore: InstanceType<typeof GlobalStore>, authFacade: AuthFacade): Promise<void> => {
  if (globalStore.loggedIn()) return;

  const session = await authFacade.getMe();

  if (session) {
    globalStore.setUser(session.user);
    return;
  }

  globalStore.clearUser();
};

const redirectIfAuthenticated = (globalStore: InstanceType<typeof GlobalStore>, router: Router): boolean | UrlTree => {
  if (!globalStore.loggedIn()) return true;

  return router.createUrlTree([globalStore.isAdmin() ? '/admin' : '/home']);
};

const hasBlockingActiveRegistration = (registration: RegistrationState | null): registration is RegistrationState => {
  return registration !== null && BLOCKING_ACTIVE_REGISTRATION_STATUSES.has(registration.status);
};

export const guestOnlyGuard: CanActivateFn = async () => {
  const globalStore = inject(GlobalStore);
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  await ensureAuthSession(globalStore, authFacade);

  return redirectIfAuthenticated(globalStore, router);
};

export const parentAuthGuard: CanActivateFn = async (_route, state) => {
  const globalStore = inject(GlobalStore);
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  await ensureAuthSession(globalStore, authFacade);

  if (!globalStore.loggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  }

  if (!globalStore.isParent()) {
    return router.createUrlTree([globalStore.isAdmin() ? '/admin' : '/']);
  }

  return true;
};

export const adminAuthGuard: CanActivateFn = async (_route, state) => {
  const globalStore = inject(GlobalStore);
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  await ensureAuthSession(globalStore, authFacade);

  if (!globalStore.loggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  }

  return globalStore.isAdmin() ? true : router.createUrlTree(['/home']);
};

export const parentRegistrationAvailabilityGuard: CanActivateFn = async () => {
  const globalStore = inject(GlobalStore);
  const authFacade = inject(AuthFacade);
  const parentFacade = inject(ParentFacade);
  const router = inject(Router);

  await ensureAuthSession(globalStore, authFacade);

  if (!globalStore.loggedIn()) return true;

  if (!globalStore.isParent()) {
    return router.createUrlTree([globalStore.isAdmin() ? '/admin' : '/']);
  }

  try {
    const home = await parentFacade.getParentHome(globalStore.email());

    if (hasBlockingActiveRegistration(home.activeRegistration)) {
      return router.createUrlTree(['/home', home.activeRegistration.id]);
    }
  } catch {
    return true;
  }

  return true;
};
