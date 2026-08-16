import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DataService } from './data.service';
import { MockAuthService } from './mock-auth.service';

describe('MockAuthService', () => {
  let service: MockAuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [MockAuthService, DataService],
    });

    service = TestBed.inject(MockAuthService);
  });

  it('creates a parent OTP challenge only for a known parent email', async () => {
    await expect(service.requestOtp({ email: 'missing@example.com' })).rejects.toThrow('כתובת האימייל אינה מוכרת');

    const challenge = await service.requestOtp({ email: 'PARENT@example.com ' });

    expect(challenge.email).toBe('parent@example.com');
    expect(challenge.role).toBe('parent');
    expect(challenge.challengeId).toBeTruthy();
    expect(new Date(challenge.resendAvailableAtIso).getTime()).toBeGreaterThan(Date.now());
  });

  it('verifies an OTP and restores the authenticated session', async () => {
    const challenge = await service.requestOtp({ email: 'parent@example.com' });
    const session = await service.verifyOtp({ challengeId: challenge.challengeId, otp: '123456' });

    expect(session.user.role).toBe('parent');
    expect(session.user.email).toBe('parent@example.com');

    await expect(service.verifyOtp({ challengeId: challenge.challengeId, otp: '123456' })).rejects.toThrow('אינו תקף');
    await expect(service.getCurrentSession()).resolves.toEqual(session);
  });

  it('resolves admin identity from the submitted email', async () => {
    const challenge = await service.requestOtp({ email: 'admin@example.com' });
    const session = await service.verifyOtp({ challengeId: challenge.challengeId, otp: '123456' });

    expect(session.user.role).toBe('admin');
  });
});
