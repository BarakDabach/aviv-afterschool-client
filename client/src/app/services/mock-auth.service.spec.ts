import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DataService } from './data.service';
import { MockDataService } from './mock-data.service';
import { MockAuthService } from './mock-auth.service';
import { AllergyAnswer, Gender, RegistrationDocumentScopeKind, RegistrationDraftStep } from '../types/registration-status.type';

describe('MockAuthService', () => {
  let service: MockAuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        MockAuthService,
        {
          provide: DataService,
          useClass: MockDataService,
        },
      ],
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
    expect(session.user.phoneNumber).toBe('0501234567');

    await expect(service.verifyOtp({ challengeId: challenge.challengeId, otp: '123456' })).rejects.toThrow('אינו תקף');
    await expect(service.getCurrentSession()).resolves.toEqual(session);
  });

  it('resolves admin identity from the submitted email', async () => {
    const challenge = await service.requestOtp({ email: 'admin@example.com' });
    const session = await service.verifyOtp({ challengeId: challenge.challengeId, otp: '123456' });

    expect(session.user.role).toBe('admin');
  });

  it('resolves parent identity from submitted registration data', async () => {
    const dataService = TestBed.inject(DataService);
    const year = await dataService.getActiveRegistrationYear();
    const plans = await dataService.getAvailableYearPlans();

    await dataService.submitRegistration({
      draft: {
        year,
        currentStep: RegistrationDraftStep.DocumentsUpload,
        parentDetails: {
          id: 0,
          fullName: 'רות ישראלי',
          phoneNumber: '0501234567',
          email: 'ruth@example.com',
        },
        children: [
          {
            id: 1,
            fullName: 'יעל ישראלי',
            dateOfBirth: '2021-01-01',
            gender: Gender.Female,
            allergyAnswer: AllergyAnswer.No,
            allergyDetails: '',
            selectedYearPlanId: plans[0].yearPlanId,
          },
        ],
        documentScopeChoices: {
          SignedContract: RegistrationDocumentScopeKind.AllChildren,
          StandingOrderApproval: RegistrationDocumentScopeKind.AllChildren,
        },
        documents: [],
        updatedAt: new Date().toISOString(),
      },
      selectedFiles: [],
    });

    const challenge = await service.requestOtp({ email: 'ruth@example.com' });
    const session = await service.verifyOtp({ challengeId: challenge.challengeId, otp: '123456' });

    expect(session.user).toMatchObject({
      fullName: 'רות ישראלי',
      email: 'ruth@example.com',
      role: 'parent',
    });
  });
});
