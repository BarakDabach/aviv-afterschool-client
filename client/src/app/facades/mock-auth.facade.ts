import { inject, Injectable } from '@angular/core';
import { MockAuthService } from '../services/mock-auth.service';
import type { AuthSession, OtpChallenge } from '../types/auth.type';
import { AuthFacade } from './auth.facade';

@Injectable()
export class MockAuthFacade extends AuthFacade {
  private readonly authService = inject(MockAuthService);

  override requestOtp(email: string): Promise<OtpChallenge> {
    return this.authService.requestOtp({ email });
  }

  override verifyOtp(challengeId: string, otp: string): Promise<AuthSession> {
    return this.authService.verifyOtp({ challengeId, otp });
  }

  override getMe(): Promise<AuthSession | null> {
    return this.authService.getCurrentSession();
  }

  override logout(): Promise<void> {
    return this.authService.logout();
  }
}
