import type { AuthSession, OtpChallenge } from '../types/auth.type';

export abstract class AuthFacade {
  abstract requestOtp(email: string): Promise<OtpChallenge>;

  abstract verifyOtp(challengeId: string, otp: string): Promise<AuthSession>;

  abstract getMe(): Promise<AuthSession | null>;

  abstract logout(): Promise<void>;
}
