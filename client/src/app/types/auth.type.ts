export type AuthRole = 'parent' | 'admin';

export type AuthenticatedUser = {
  id: string;
  fullName: string;
  email: string;
  role: AuthRole;
  phoneNumber?: string;
};

export type OtpRequest = {
  email: string;
};

export type OtpChallenge = {
  challengeId: string;
  email: string;
  role: AuthRole;
  expiresAtIso: string;
  resendAvailableAtIso: string;
};

export type OtpVerification = {
  challengeId: string;
  otp: string;
};

export type AuthSession = {
  user: AuthenticatedUser;
  expiresAtIso: string;
};
