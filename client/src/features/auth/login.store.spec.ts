import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from '../../app/facades/auth.facade';
import { MockAuthFacade } from '../../app/facades/mock-auth.facade';
import { DataService } from '../../app/services/data.service';
import { NotificationService } from '../../app/services/notification.service';
import { GlobalStore } from '../../app/stores/global.store';
import { LoginStore } from './login.store';

@Component({
  template: '',
})
class EmptyRouteComponent {}

describe('LoginStore', () => {
  const knownParent = {
    id: 'parent-registration-1001',
    fullName: 'דנה לוי',
    email: 'parent@example.com',
    phoneNumber: '0501234567',
    role: 'parent' as const,
  };

  let store: InstanceType<typeof LoginStore>;
  let globalStore: InstanceType<typeof GlobalStore>;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        LoginStore,
        {
          provide: AuthFacade,
          useClass: MockAuthFacade,
        },
        {
          provide: DataService,
          useValue: {
            getAuthOtpResendTimeoutSeconds: () => Promise.resolve(0),
            getRegisteredParentByEmail: (email: string) => Promise.resolve(email.trim().toLowerCase() === 'parent@example.com' ? knownParent : null),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            success: vi.fn(),
            info: vi.fn(),
            warning: vi.fn(),
            error: vi.fn(),
          },
        },
        provideRouter([
          { path: 'home', component: EmptyRouteComponent },
          { path: 'admin', component: EmptyRouteComponent },
        ]),
      ],
    });

    store = TestBed.inject(LoginStore);
    globalStore = TestBed.inject(GlobalStore);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('requests an OTP for a known parent and advances to the OTP step', async () => {
    store.updateEmail('parent@example.com');

    expect(store.canRequestOtp()).toBe(true);

    await store.requestOtp();

    expect(store.step()).toBe('otp');
    expect(store.challengeId()).toBeTruthy();
    expect(store.notice()).toContain('שלחנו קוד אימות');
  });

  it('shows an error for an unknown parent email', async () => {
    store.updateEmail('unknown@example.com');

    await store.requestOtp();

    expect(store.step()).toBe('email');
    expect(store.error()).toContain('כתובת האימייל אינה מוכרת');
  });

  it('exposes field validation errors after fields are touched', async () => {
    store.markEmailTouched();

    expect(store.emailHasError()).toBe(true);
    expect(store.emailError()).toContain('יש להזין כתובת אימייל');

    store.updateEmail('not-an-email');

    expect(store.emailError()).toContain('אינה תקינה');

    store.updateEmail('parent@example.com');
    await store.requestOtp();
    store.updateOtp('12');
    store.markOtpTouched();

    expect(store.otpHasError()).toBe(true);
    expect(store.otpError()).toContain('6 ספרות');
  });

  it('resends OTP by replacing the active challenge', async () => {
    store.updateEmail('parent@example.com');
    await store.requestOtp();

    expect(store.canResendOtp()).toBe(true);
    const firstChallengeId = store.challengeId();

    await store.resendOtp();

    expect(store.challengeId()).toBeTruthy();
    expect(store.challengeId()).not.toBe(firstChallengeId);
    expect(store.otp()).toBe('');
  });

  it('switches resend from countdown to action when the timeout is reached', async () => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-16T10:00:00.000Z'));

    TestBed.configureTestingModule({
      providers: [
        LoginStore,
        {
          provide: AuthFacade,
          useClass: MockAuthFacade,
        },
        {
          provide: DataService,
          useValue: {
            getAuthOtpResendTimeoutSeconds: () => Promise.resolve(10),
            getRegisteredParentByEmail: (email: string) => Promise.resolve(email.trim().toLowerCase() === 'parent@example.com' ? knownParent : null),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            success: vi.fn(),
            info: vi.fn(),
            warning: vi.fn(),
            error: vi.fn(),
          },
        },
        provideRouter([
          { path: 'home', component: EmptyRouteComponent },
          { path: 'admin', component: EmptyRouteComponent },
        ]),
      ],
    });

    const countdownStore = TestBed.inject(LoginStore);
    countdownStore.updateEmail('parent@example.com');
    await countdownStore.requestOtp();

    expect(countdownStore.canResendOtp()).toBe(false);
    expect(countdownStore.resendCountdownLabel()).toBe('00:10');

    vi.advanceTimersByTime(10_000);

    expect(countdownStore.resendCountdownLabel()).toBe('00:00');
    expect(countdownStore.canResendOtp()).toBe(true);
  });

  it('verifies the OTP, updates global auth state, and routes by role', async () => {
    store.updateEmail('admin@example.com');
    await store.requestOtp();
    store.updateOtp('123456');

    await store.verifyOtp();

    expect(globalStore.isAdmin()).toBe(true);
    expect(globalStore.email()).toBe('admin@example.com');
    expect(router.url).toBe('/admin');
  });
});
