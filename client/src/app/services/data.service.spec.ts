import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  AllergyAnswer,
  Gender,
  RegistrationDraftStep,
  RegistrationDocumentScopeKind,
  RegistrationStatus,
} from '../types/registration-status.type';
import { DataService } from './data.service';
import { MockDataService } from './mock-data.service';

describe('DataService', () => {
  const configureMockService = (): DataService => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DataService,
          useClass: MockDataService,
        },
      ],
    });

    return TestBed.inject(DataService);
  };

  it('mocks the backend OTP resend timeout as ten seconds', async () => {
    const service = configureMockService();

    await expect(service.getAuthOtpResendTimeoutSeconds()).resolves.toBe(10);
  });

  it('returns backend-shaped registration data for the parent registration flow', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();

    expect(year.yearNumber).toBeGreaterThan(0);
    expect(plans.length).toBeGreaterThan(0);

    const registration = await service.submitRegistration({
      draft: {
        year,
        currentStep: RegistrationDraftStep.DocumentsUpload,
        parentDetails: {
          id: 0,
          fullName: 'דנה לוי',
          phoneNumber: '050-123-4567',
          email: 'parent@example.com',
        },
        children: [
          {
            id: 1,
            fullName: 'אורי לוי',
            dateOfBirth: '2021-03-14',
            gender: Gender.Male,
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

    expect(registration.status).toBe(RegistrationStatus.WaitingForDocuments);
    expect(registration.parent.email).toBe('parent@example.com');
    expect(registration.children[0].selectedPlan?.yearPlanId).toBe(plans[0].yearPlanId);
  });
});
