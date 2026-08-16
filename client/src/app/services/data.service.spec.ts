import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DataService } from './data.service';

describe('DataService', () => {
  it('mocks the backend OTP resend timeout as ten seconds', async () => {
    const service = TestBed.inject(DataService);

    await expect(service.getAuthOtpResendTimeoutSeconds()).resolves.toBe(10);
  });
});
