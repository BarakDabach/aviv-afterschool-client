import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from '../facades/auth.facade';
import { GlobalStore } from '../stores/global.store';
import { adminAuthGuard, guestOnlyGuard, parentAuthGuard } from './parent-route.guard';

describe('parent route guards', () => {
  let authFacade: {
    getMe: ReturnType<typeof vi.fn>;
  };
  let globalStore: InstanceType<typeof GlobalStore>;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    authFacade = {
      getMe: vi.fn().mockResolvedValue(null),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthFacade,
          useValue: authFacade,
        },
      ],
    });

    globalStore = TestBed.inject(GlobalStore);
    globalStore.clearUser();
    router = TestBed.inject(Router);
  });

  it('redirects authenticated parents away from the login screen', async () => {
    authFacade.getMe.mockResolvedValueOnce(parentSession('דנה לוי', 'dana@example.com'));

    const result = await TestBed.runInInjectionContext(() => guestOnlyGuard({} as never, { url: '/login' } as never));

    expect(authFacade.getMe).toHaveBeenCalledTimes(1);
    expect(serializeResult(router, result)).toBe('/home');
  });

  it('redirects unauthenticated users to login before loading parent home', async () => {
    const result = await TestBed.runInInjectionContext(() => parentAuthGuard({} as never, { url: '/home' } as never));

    expect(authFacade.getMe).toHaveBeenCalledTimes(1);
    expect(serializeResult(router, result)).toBe('/login?redirect=%2Fhome');
  });

  it('allows a logged-in parent to access parent home routes', async () => {
    globalStore.setUser(parentSession('דנה לוי', 'dana@example.com').user);

    const result = await TestBed.runInInjectionContext(() => parentAuthGuard({} as never, { url: '/home/1001' } as never));

    expect(result).toBe(true);
  });

  it('redirects an authenticated admin away from parent-only routes', async () => {
    authFacade.getMe.mockResolvedValueOnce(adminSession());

    const result = await TestBed.runInInjectionContext(() => parentAuthGuard({} as never, { url: '/home' } as never));

    expect(serializeResult(router, result)).toBe('/admin');
  });

  it('redirects unauthenticated users to login before loading admin years', async () => {
    const result = await TestBed.runInInjectionContext(() => adminAuthGuard({} as never, { url: '/admin/years' } as never));

    expect(serializeResult(router, result)).toBe('/login?redirect=%2Fadmin%2Fyears');
  });

  it('redirects authenticated parents away from admin years', async () => {
    globalStore.setUser(parentSession('דנה לוי', 'dana@example.com').user);

    const result = await TestBed.runInInjectionContext(() => adminAuthGuard({} as never, { url: '/admin/years' } as never));

    expect(serializeResult(router, result)).toBe('/home');
  });

  it('allows authenticated admins to open admin years', async () => {
    globalStore.setUser(adminSession().user);

    const result = await TestBed.runInInjectionContext(() => adminAuthGuard({} as never, { url: '/admin/years' } as never));

    expect(result).toBe(true);
  });
});

function parentSession(fullName: string, email: string) {
  return {
    user: {
      id: 'parent-1',
      role: 'parent' as const,
      fullName,
      email,
      phoneNumber: '0501234567',
    },
    expiresAtIso: new Date(Date.now() + 60_000).toISOString(),
  };
}

function adminSession() {
  return {
    user: {
      id: 'admin-1',
      role: 'admin' as const,
      fullName: 'מנהל',
      email: 'admin@example.com',
    },
    expiresAtIso: new Date(Date.now() + 60_000).toISOString(),
  };
}

function serializeResult(router: Router, result: unknown): string {
  if (result === true) return 'true';
  if (result instanceof UrlTree) return router.serializeUrl(result);

  return String(result);
}
