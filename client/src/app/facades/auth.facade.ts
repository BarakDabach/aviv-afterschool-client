import { inject, Injectable } from '@angular/core';
import { MockAuthService } from '../services/mock-auth.service';
import type { AuthSession, OtpChallenge } from '../types/auth.type';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authService = inject(MockAuthService);

  requestOtp(email: string): Promise<OtpChallenge> {
    return this.authService.requestOtp({ email });
  }

  verifyOtp(challengeId: string, otp: string): Promise<AuthSession> {
    return this.authService.verifyOtp({ challengeId, otp });
  }

  getMe(): Promise<AuthSession | null> {
    return this.authService.getCurrentSession();
  }

  logout(): Promise<void> {
    return this.authService.logout();
  }
}
