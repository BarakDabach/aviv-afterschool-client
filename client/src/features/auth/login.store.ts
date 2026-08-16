import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { AuthFacade } from '../../app/facades/auth.facade';
import { GlobalStore } from '../../app/stores/global.store';
import type { AuthenticatedUser } from '../../app/types/auth.type';
import { isValidEmail } from '../../app/utils/email.validation';

type LoginStep = 'email' | 'otp';

type LoginState = {
  step: LoginStep;
  email: string;
  emailTouched: boolean;
  otp: string;
  otpTouched: boolean;
  challengeId: string | null;
  challengeExpiresAtIso: string | null;
  resendAvailableAtIso: string | null;
  nowMs: number;
  loading: boolean;
  error: string | null;
  notice: string | null;
  user: AuthenticatedUser | null;
};

const initialLoginState: LoginState = {
  step: 'email',
  email: '',
  emailTouched: false,
  otp: '',
  otpTouched: false,
  challengeId: null,
  challengeExpiresAtIso: null,
  resendAvailableAtIso: null,
  nowMs: Date.now(),
  loading: false,
  error: null,
  notice: null,
  user: null,
};

const normalizeOtp = (otp: string): string => otp.replace(/\D/g, '').slice(0, 6);

export const LoginStore = signalStore(
  withState(initialLoginState),
  withProps(() => ({
    authFacade: inject(AuthFacade),
    globalStore: inject(GlobalStore),
    router: inject(Router),
  })),
  withComputed(({ email, emailTouched, loading, nowMs, otp, otpTouched, resendAvailableAtIso, step, user }) => {
    const trimmedEmail = computed(() => email().trim());
    const emailValid = computed(() => isValidEmail(email()));
    const otpValid = computed(() => otp().length === 6);
    const resendSecondsRemaining = computed(() => {
      const resendAt = resendAvailableAtIso();

      if (!resendAt) return 0;

      return Math.max(0, Math.ceil((new Date(resendAt).getTime() - nowMs()) / 1000));
    });
    const resendCountdownLabel = computed(() => {
      const seconds = resendSecondsRemaining();
      const minutesPart = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secondsPart = (seconds % 60).toString().padStart(2, '0');

      return `${minutesPart}:${secondsPart}`;
    });
    const emailError = computed(() => {
      if (!emailTouched()) return '';
      if (trimmedEmail().length === 0) return 'יש להזין כתובת אימייל.';
      if (!emailValid()) return 'כתובת האימייל אינה תקינה.';

      return '';
    });
    const otpError = computed(() => {
      if (!otpTouched()) return '';
      if (otp().length === 0) return 'יש להזין קוד אימות.';
      if (!otpValid()) return 'קוד האימות צריך להכיל 6 ספרות.';

      return '';
    });

    return {
      emailValid,
      otpValid,
      emailError,
      otpError,
      emailHasError: computed(() => emailError().length > 0),
      otpHasError: computed(() => otpError().length > 0),
      resendSecondsRemaining,
      resendCountdownLabel,
      canRequestOtp: computed(() => step() === 'email' && emailValid() && !loading()),
      canResendOtp: computed(() => step() === 'otp' && emailValid() && !loading() && resendSecondsRemaining() === 0),
      canVerifyOtp: computed(() => step() === 'otp' && otpValid() && !loading()),
      isAuthenticated: computed(() => user() !== null),
    };
  }),
  withMethods((store) => {
    const applySession = (user: AuthenticatedUser): void => {
      store.globalStore.setUser(user);
      patchState(store, { user });
    };

    const routeAfterLogin = async (user: AuthenticatedUser): Promise<void> => {
      await store.router.navigateByUrl(user.role === 'admin' ? '/admin' : '/my-registrations');
    };
    const sendOtp = async (notice: string): Promise<void> => {
      patchState(store, {
        emailTouched: true,
        loading: true,
        error: null,
        notice: null,
      });

      try {
        const challenge = await store.authFacade.requestOtp(store.email());

        patchState(store, {
          step: 'otp',
          challengeId: challenge.challengeId,
          challengeExpiresAtIso: challenge.expiresAtIso,
          resendAvailableAtIso: challenge.resendAvailableAtIso,
          nowMs: Date.now(),
          otp: '',
          otpTouched: false,
          notice,
        });
      } catch (error) {
        patchState(store, {
          error: error instanceof Error ? error.message : 'לא הצלחנו לשלוח קוד אימות.',
        });
      } finally {
        patchState(store, { loading: false });
      }
    };

    return {
      updateEmail(email: string): void {
        patchState(store, {
          email,
          error: null,
          notice: null,
        });
      },
      markEmailTouched(): void {
        patchState(store, { emailTouched: true });
      },
      updateOtp(otp: string): void {
        patchState(store, {
          otp: normalizeOtp(otp),
          error: null,
        });
      },
      markOtpTouched(): void {
        patchState(store, { otpTouched: true });
      },
      async requestOtp(): Promise<void> {
        patchState(store, { emailTouched: true });
        if (!store.canRequestOtp()) return;

        await sendOtp('שלחנו קוד אימות לכתובת האימייל.');
      },
      async resendOtp(): Promise<void> {
        patchState(store, { emailTouched: true });
        if (!store.canResendOtp()) return;

        await sendOtp('שלחנו קוד חדש לכתובת האימייל.');
      },
      async verifyOtp(): Promise<void> {
        const challengeId = store.challengeId();

        patchState(store, { otpTouched: true });
        if (!challengeId || !store.canVerifyOtp()) return;

        patchState(store, { loading: true, error: null });

        try {
          const session = await store.authFacade.verifyOtp(challengeId, store.otp());

          applySession(session.user);
          await routeAfterLogin(session.user);
        } catch (error) {
          patchState(store, {
            error: error instanceof Error ? error.message : 'לא הצלחנו לאמת את הקוד.',
          });
        } finally {
          patchState(store, { loading: false });
        }
      },
      editEmail(): void {
        patchState(store, {
          step: 'email',
          otp: '',
          otpTouched: false,
          challengeId: null,
          challengeExpiresAtIso: null,
          resendAvailableAtIso: null,
          error: null,
          notice: null,
        });
      },
      async restoreSession(): Promise<void> {
        const session = await store.authFacade.getMe();

        if (!session) {
          store.globalStore.clearUser();
          patchState(store, { user: null });
          return;
        }

        applySession(session.user);
      },
      async logout(): Promise<void> {
        await store.authFacade.logout();
        store.globalStore.clearUser();
        patchState(store, initialLoginState);
      },
    };
  }),
  withHooks((store) => {
    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    return {
      onInit(): void {
        countdownInterval = setInterval(() => {
          patchState(store, { nowMs: Date.now() });
        }, 1000);
      },
      onDestroy(): void {
        if (countdownInterval) {
          clearInterval(countdownInterval);
        }
      },
    };
  }),
);
