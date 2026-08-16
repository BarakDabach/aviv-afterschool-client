import { inject, Injectable } from '@angular/core';
import type { AuthRole, AuthSession, AuthenticatedUser, OtpChallenge, OtpRequest, OtpVerification } from '../types/auth.type';
import { DataService } from './data.service';

type StoredChallenge = OtpChallenge & {
  otpHash: string;
  used: boolean;
};

const TEST_OTP = '123456';
const OTP_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const SESSION_STORAGE_KEY = 'aviv-auth-session';

const KNOWN_PARENTS: AuthenticatedUser[] = [
  {
    id: 'parent-dana-levi',
    fullName: 'דנה לוי',
    email: 'parent@example.com',
    role: 'parent',
    phoneNumber: '0501234567',
  },
  {
    id: 'parent-michal-cohen',
    fullName: 'מיכל כהן',
    email: 'michal@example.com',
    role: 'parent',
    phoneNumber: '0521234567',
  },
];

const PREDEFINED_ADMINS: AuthenticatedUser[] = [
  {
    id: 'admin-aviv',
    fullName: 'אביב',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: 'admin-office',
    fullName: 'מנהלת הצהרון',
    email: 'office@example.com',
    role: 'admin',
  },
];

@Injectable({ providedIn: 'root' })
export class MockAuthService {
  private readonly dataService = inject(DataService);
  private readonly challenges = new Map<string, StoredChallenge>();

  async requestOtp(request: OtpRequest): Promise<OtpChallenge> {
    const email = this.normalizeEmail(request.email);
    const user = await this.findUser(email);

    if (!user) {
      throw new Error('כתובת האימייל אינה מוכרת במערכת.');
    }

    this.invalidateExistingChallenges(email, user.role);

    const now = Date.now();
    const resendTimeoutSeconds = await this.dataService.getAuthOtpResendTimeoutSeconds();
    const challenge: StoredChallenge = {
      challengeId: this.createChallengeId(),
      email,
      role: user.role,
      expiresAtIso: new Date(now + OTP_TTL_MS).toISOString(),
      resendAvailableAtIso: new Date(now + resendTimeoutSeconds * 1000).toISOString(),
      otpHash: this.hashOtp(TEST_OTP),
      used: false,
    };

    this.challenges.set(challenge.challengeId, challenge);

    return this.toPublicChallenge(challenge);
  }

  async verifyOtp(verification: OtpVerification): Promise<AuthSession> {
    const challenge = this.challenges.get(verification.challengeId);

    if (!challenge || challenge.used) {
      throw new Error('קוד האימות אינו תקף. בקשו קוד חדש ונסו שוב.');
    }

    if (new Date(challenge.expiresAtIso).getTime() <= Date.now()) {
      this.challenges.delete(challenge.challengeId);
      throw new Error('קוד האימות פג תוקף. בקשו קוד חדש.');
    }

    if (challenge.otpHash !== this.hashOtp(verification.otp.trim())) {
      throw new Error('קוד האימות שהוזן שגוי.');
    }

    const user = await this.findUser(challenge.email, challenge.role);

    if (!user) {
      throw new Error('לא ניתן להשלים את ההתחברות.');
    }

    challenge.used = true;

    const session: AuthSession = {
      user,
      expiresAtIso: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };

    this.writeSession(session);

    return session;
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const session = this.readSession();

    if (!session) return null;

    if (new Date(session.expiresAtIso).getTime() <= Date.now()) {
      this.clearSession();
      return null;
    }

    return session;
  }

  async logout(): Promise<void> {
    this.clearSession();
  }

  private async findUser(email: string, role?: AuthRole): Promise<AuthenticatedUser | null> {
    const users = role === 'admin' ? PREDEFINED_ADMINS : role === 'parent' ? KNOWN_PARENTS : [...KNOWN_PARENTS, ...PREDEFINED_ADMINS];
    const predefinedUser = users.find((user) => user.email === email) ?? null;

    if (predefinedUser || role === 'admin') return predefinedUser;

    return this.dataService.getRegisteredParentByEmail(email);
  }

  private invalidateExistingChallenges(email: string, role: AuthRole): void {
    for (const [challengeId, challenge] of this.challenges.entries()) {
      if (challenge.email === email && challenge.role === role && !challenge.used) {
        this.challenges.delete(challengeId);
      }
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private createChallengeId(): string {
    if (globalThis.crypto && 'randomUUID' in globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }

    return `challenge-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private hashOtp(otp: string): string {
    return btoa(`aviv:${otp}`);
  }

  private toPublicChallenge(challenge: StoredChallenge): OtpChallenge {
    return {
      challengeId: challenge.challengeId,
      email: challenge.email,
      role: challenge.role,
      expiresAtIso: challenge.expiresAtIso,
      resendAvailableAtIso: challenge.resendAvailableAtIso,
    };
  }

  private readSession(): AuthSession | null {
    if (typeof localStorage === 'undefined') return null;

    try {
      const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);

      return rawSession ? (JSON.parse(rawSession) as AuthSession) : null;
    } catch {
      return null;
    }
  }

  private writeSession(session: AuthSession): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  private clearSession(): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}
