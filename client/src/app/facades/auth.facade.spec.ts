import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockAuthService } from '../services/mock-auth.service';
import { AuthFacade } from './auth.facade';

describe('AuthFacade', () => {
  const authService = {
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
    getCurrentSession: vi.fn(),
    logout: vi.fn(),
  };

  let facade: AuthFacade;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        {
          provide: MockAuthService,
          useValue: authService,
        },
      ],
    });

    facade = TestBed.inject(AuthFacade);
  });

  it('delegates auth use cases to the auth service boundary', async () => {
    authService.requestOtp.mockResolvedValueOnce({ challengeId: 'challenge-1' });
    authService.verifyOtp.mockResolvedValueOnce({ user: { email: 'parent@example.com', role: 'parent' } });
    authService.getCurrentSession.mockResolvedValueOnce(null);
    authService.logout.mockResolvedValueOnce(undefined);

    await expect(facade.requestOtp('parent@example.com')).resolves.toEqual({ challengeId: 'challenge-1' });
    await expect(facade.verifyOtp('challenge-1', '123456')).resolves.toEqual({ user: { email: 'parent@example.com', role: 'parent' } });
    await expect(facade.getMe()).resolves.toBeNull();
    await expect(facade.logout()).resolves.toBeUndefined();

    expect(authService.requestOtp).toHaveBeenCalledWith({ email: 'parent@example.com' });
    expect(authService.verifyOtp).toHaveBeenCalledWith({ challengeId: 'challenge-1', otp: '123456' });
    expect(authService.getCurrentSession).toHaveBeenCalled();
    expect(authService.logout).toHaveBeenCalled();
  });
});
