import { describe, expect, it } from 'vitest';
import {
  AllergyAnswer,
  DocumentType,
  Gender,
  PaymentMethod,
  RegistrationChildStatus,
  RegistrationDraftStep,
  RegistrationDocumentScopeKind,
  RegistrationStatus,
  type RegistrationDraft,
  type RegistrationSelectedFile,
  type Year,
} from '../types/registration-status.type';
import { DataService } from './data.service';
import { MockDataService } from './mock-data.service';

describe('DataService', () => {
  const configureMockService = (): DataService => {
    return new MockDataService();
  };

  it('mocks the backend OTP resend timeout as ten seconds', async () => {
    const service = configureMockService();

    await expect(service.getAuthOtpResendTimeoutSeconds()).resolves.toBe(10);
  });

  it('returns the configured current year and an empty history without admin fixtures', async () => {
    const service = configureMockService();

    const overview = await service.getAdminYearsOverview();

    expect(overview.currentYear).toMatchObject({
      yearNumber: 2027,
      registeredChildren: 0,
      usedCapacity: 0,
      maxChildCapacity: 60,
      oneTimeInsuranceAmount: 200,
      children: [],
    });
    expect(overview.historicalYears).toEqual([]);
  });

  it('projects parent-submitted children into the admin years overview without exposing birth dates', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const draft = createDraft(year, plans[0].yearPlanId, [
      { id: 1, fullName: 'אורי לוי' },
      { id: 2, fullName: 'נועה לוי' },
    ]);

    await service.submitRegistration({ draft, selectedFiles: [] });
    const overview = await service.getAdminYearsOverview();

    expect(overview.currentYear.registeredChildren).toBe(2);
    expect(overview.currentYear.usedCapacity).toBe(2);
    expect(overview.currentYear.children).toHaveLength(2);
    expect(overview.currentYear.children[0]).toMatchObject({
      registrationId: 1,
      planName: plans[0].plan.name,
      paymentMethod: PaymentMethod.StandingOrder,
      registrationStatus: RegistrationStatus.WaitingForDocuments,
      yearStatus: RegistrationChildStatus.Active,
    });
    expect(overview.currentYear.children[0]).not.toHaveProperty('dateOfBirth');
  });

  it('returns submitted parent home data with active registration, history, and holidays', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    await service.submitRegistration({
      draft: createDraft(year, plans[0].yearPlanId, [{ id: 1, fullName: 'אורי לוי' }]),
      selectedFiles: [],
    });
    const home = await service.getParentHome('parent@example.com');

    expect(home.parent.fullName).toBe('דנה לוי');
    expect(home.activeRegistration?.status).toBe(RegistrationStatus.WaitingForDocuments);
    expect(home.registrationHistory.length).toBeGreaterThan(0);
    expect(home.holidayPeriods.map((period) => period.name)).toEqual(['ראש השנה', 'סוכות', 'חנוכה']);
  });

  it('loads a submitted registration by id for parent home drill-in', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    await service.submitRegistration({
      draft: createDraft(year, plans[0].yearPlanId, [{ id: 1, fullName: 'אורי לוי' }]),
      selectedFiles: [],
    });
    const home = await service.getParentHome('parent@example.com');
    const registrationId = home.activeRegistration!.id;

    await expect(service.getSubmittedRegistration(registrationId)).resolves.toMatchObject({
      id: registrationId,
      status: RegistrationStatus.WaitingForDocuments,
    });
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

  it('requires an authenticated parent email to return parent home data', async () => {
    const service = configureMockService();

    await expect(service.getParentHome()).rejects.toThrow('חייבים להיות מחוברים');
  });

  it('marks a single-child registration as pending approval when all required documents are uploaded', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const draft = createDraft(year, plans[0].yearPlanId, [
      { id: 1, fullName: 'אורי לוי' },
    ]);

    const registration = await service.submitRegistration({
      draft,
      selectedFiles: [
        createSelectedFile(DocumentType.SignedContract, RegistrationDocumentScopeKind.AllChildren, 'contract.pdf'),
        createSelectedFile(DocumentType.StandingOrderApproval, RegistrationDocumentScopeKind.AllChildren, 'standing-order.pdf'),
      ],
    });

    expect(registration.status).toBe(RegistrationStatus.PendingApproval);
    expect(registration.missingDocuments).toHaveLength(0);
    expect(registration.documents).toHaveLength(2);
  });

  it('marks a multi-child registration as pending approval when every child has separate required documents', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const draft = createDraft(year, plans[0].yearPlanId, [
      { id: 1, fullName: 'אורי לוי' },
      { id: 2, fullName: 'נועה לוי' },
    ], RegistrationDocumentScopeKind.SpecificChild);

    const registration = await service.submitRegistration({
      draft,
      selectedFiles: [
        createSelectedFile(DocumentType.SignedContract, RegistrationDocumentScopeKind.SpecificChild, 'contract-ori.pdf', 1),
        createSelectedFile(DocumentType.SignedContract, RegistrationDocumentScopeKind.SpecificChild, 'contract-noa.pdf', 2),
        createSelectedFile(DocumentType.StandingOrderApproval, RegistrationDocumentScopeKind.SpecificChild, 'standing-order-ori.pdf', 1),
        createSelectedFile(DocumentType.StandingOrderApproval, RegistrationDocumentScopeKind.SpecificChild, 'standing-order-noa.pdf', 2),
      ],
    });

    expect(registration.status).toBe(RegistrationStatus.PendingApproval);
    expect(registration.missingDocuments).toHaveLength(0);
    expect(registration.documents).toHaveLength(4);
  });

  it('marks a multi-child registration as pending approval when shared required documents are uploaded', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const draft = createDraft(year, plans[0].yearPlanId, [
      { id: 1, fullName: 'אורי לוי' },
      { id: 2, fullName: 'נועה לוי' },
    ]);

    const registration = await service.submitRegistration({
      draft,
      selectedFiles: [
        createSelectedFile(DocumentType.SignedContract, RegistrationDocumentScopeKind.AllChildren, 'contract.pdf'),
        createSelectedFile(DocumentType.StandingOrderApproval, RegistrationDocumentScopeKind.AllChildren, 'standing-order.pdf'),
      ],
    });

    expect(registration.status).toBe(RegistrationStatus.PendingApproval);
    expect(registration.missingDocuments).toHaveLength(0);
  });

  it('keeps a registration waiting for documents and reports uploaded and missing documents', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const draft = createDraft(year, plans[0].yearPlanId, [
      { id: 1, fullName: 'אורי לוי' },
      { id: 2, fullName: 'נועה לוי' },
    ], RegistrationDocumentScopeKind.SpecificChild);

    const registration = await service.submitRegistration({
      draft,
      selectedFiles: [
        createSelectedFile(DocumentType.SignedContract, RegistrationDocumentScopeKind.SpecificChild, 'contract-ori.pdf', 1),
      ],
    });

    expect(registration.status).toBe(RegistrationStatus.WaitingForDocuments);
    expect(registration.documents.map((document) => document.fileName)).toEqual(['contract-ori.pdf']);
    expect(registration.missingDocuments.map((document) => document.label)).toEqual([
      'חוזה חתום - נועה לוי',
      'אישור הוראת קבע - אורי לוי',
      'אישור הוראת קבע - נועה לוי',
    ]);
  });

  it('does not require standing-order approval for a daily-plan-only registration', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const dailyPlan = plans.find((yearPlan) => !yearPlan.plan.requiresStandingOrder);

    expect(dailyPlan).toBeDefined();

    const draft = createDraft(year, dailyPlan!.yearPlanId, [
      { id: 1, fullName: 'אורי לוי' },
    ]);

    const registration = await service.submitRegistration({
      draft,
      selectedFiles: [
        createSelectedFile(DocumentType.SignedContract, RegistrationDocumentScopeKind.AllChildren, 'contract.pdf'),
      ],
    });

    expect(registration.status).toBe(RegistrationStatus.PendingApproval);
    expect(registration.missingDocuments).toHaveLength(0);
    expect(registration.documents.map((document) => document.documentType)).toEqual([DocumentType.SignedContract]);
  });

  it('requires standing-order approval only for monthly-plan children in mixed-plan registrations', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const monthlyPlan = plans.find((yearPlan) => yearPlan.plan.requiresStandingOrder)!;
    const dailyPlan = plans.find((yearPlan) => !yearPlan.plan.requiresStandingOrder)!;
    const draft = createDraft(year, monthlyPlan.yearPlanId, [
      { id: 1, fullName: 'אורי לוי', selectedYearPlanId: monthlyPlan.yearPlanId },
      { id: 2, fullName: 'נועה לוי', selectedYearPlanId: dailyPlan.yearPlanId },
    ], RegistrationDocumentScopeKind.SpecificChild);

    const registration = await service.submitRegistration({
      draft,
      selectedFiles: [
        createSelectedFile(DocumentType.SignedContract, RegistrationDocumentScopeKind.SpecificChild, 'contract-ori.pdf', 1),
        createSelectedFile(DocumentType.SignedContract, RegistrationDocumentScopeKind.SpecificChild, 'contract-noa.pdf', 2),
      ],
    });

    expect(registration.status).toBe(RegistrationStatus.WaitingForDocuments);
    expect(registration.missingDocuments.map((document) => document.label)).toEqual([
      'אישור הוראת קבע - אורי לוי',
    ]);
  });

  it('allows one shared standing-order approval to satisfy all required monthly-plan children', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const monthlyPlan = plans.find((yearPlan) => yearPlan.plan.requiresStandingOrder)!;
    const dailyPlan = plans.find((yearPlan) => !yearPlan.plan.requiresStandingOrder)!;
    const draft = createDraft(year, monthlyPlan.yearPlanId, [
      { id: 1, fullName: 'אורי לוי', selectedYearPlanId: monthlyPlan.yearPlanId },
      { id: 2, fullName: 'נועה לוי', selectedYearPlanId: monthlyPlan.yearPlanId },
      { id: 3, fullName: 'רוני לוי', selectedYearPlanId: dailyPlan.yearPlanId },
    ]);

    const registration = await service.submitRegistration({
      draft,
      selectedFiles: [
        createSelectedFile(DocumentType.SignedContract, RegistrationDocumentScopeKind.AllChildren, 'contract.pdf'),
        createSelectedFile(DocumentType.StandingOrderApproval, RegistrationDocumentScopeKind.AllChildren, 'standing-order.pdf'),
      ],
    });

    expect(registration.status).toBe(RegistrationStatus.PendingApproval);
    expect(registration.missingDocuments).toHaveLength(0);
  });

  it('transitions a waiting registration to pending approval after missing documents are uploaded', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const draft = createDraft(year, plans[0].yearPlanId, [
      { id: 1, fullName: 'אורי לוי' },
    ]);
    const submittedRegistration = await service.submitRegistration({
      draft,
      selectedFiles: [],
    });

    expect(submittedRegistration.status).toBe(RegistrationStatus.WaitingForDocuments);
    expect(submittedRegistration.missingDocuments).toHaveLength(2);

    const withContract = await service.uploadRegistrationDocument({
      registrationId: submittedRegistration.id,
      documentType: submittedRegistration.missingDocuments[0].documentType,
      scope: submittedRegistration.missingDocuments[0].scope,
      file: new File(['mock'], 'contract.pdf', { type: 'application/pdf' }),
    });

    expect(withContract.status).toBe(RegistrationStatus.WaitingForDocuments);
    expect(withContract.missingDocuments).toHaveLength(1);

    const completed = await service.uploadRegistrationDocument({
      registrationId: submittedRegistration.id,
      documentType: withContract.missingDocuments[0].documentType,
      scope: withContract.missingDocuments[0].scope,
      file: new File(['mock'], 'standing-order.pdf', { type: 'application/pdf' }),
    });

    expect(completed.status).toBe(RegistrationStatus.PendingApproval);
    expect(completed.missingDocuments).toHaveLength(0);
    expect(completed.documents.map((document) => document.fileName)).toEqual(['contract.pdf', 'standing-order.pdf']);
  });

  it('lets admins change payment type while a registration is waiting for documents', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const monthlyPlan = plans.find((yearPlan) => yearPlan.plan.requiresStandingOrder)!;
    const draft = createDraft(year, monthlyPlan.yearPlanId, [
      { id: 1, fullName: 'אורי לוי' },
    ]);
    const registration = await service.submitRegistration({
      draft,
      selectedFiles: [],
    });

    expect(registration.status).toBe(RegistrationStatus.WaitingForDocuments);

    const cashRegistration = await service.setAdminPaymentMethod({
      registrationId: registration.id,
      childId: 1,
      isCashOnly: true,
    });

    expect(cashRegistration.status).toBe(RegistrationStatus.WaitingForDocuments);
    expect(cashRegistration.children[0].paymentMethod).toBe(PaymentMethod.Cash);
    expect(cashRegistration.missingDocuments.map((document) => document.documentType)).toEqual([
      DocumentType.SignedContract,
    ]);

    const standingOrderRegistration = await service.setAdminPaymentMethod({
      registrationId: registration.id,
      childId: 1,
      isCashOnly: false,
    });

    expect(standingOrderRegistration.status).toBe(RegistrationStatus.WaitingForDocuments);
    expect(standingOrderRegistration.children[0].paymentMethod).toBe(PaymentMethod.StandingOrder);
    expect(standingOrderRegistration.missingDocuments.map((document) => document.documentType)).toEqual([
      DocumentType.SignedContract,
      DocumentType.StandingOrderApproval,
    ]);
  });

  it('lets admins approve a registration that is still waiting for documents', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const draft = createDraft(year, plans[0].yearPlanId, [
      { id: 1, fullName: 'אורי לוי' },
    ]);
    const registration = await service.submitRegistration({
      draft,
      selectedFiles: [],
    });

    expect(registration.status).toBe(RegistrationStatus.WaitingForDocuments);

    const approvedRegistration = await service.approveAdminRegistration({
      registrationId: registration.id,
    });

    expect(approvedRegistration.status).toBe(RegistrationStatus.Approved);
    expect(approvedRegistration.missingDocuments).toHaveLength(2);
  });

  it('accepts document replacements while a registration is pending approval', async () => {
    const service = configureMockService();
    const year = await service.getActiveRegistrationYear();
    const plans = await service.getAvailableYearPlans();
    const draft = createDraft(year, plans[0].yearPlanId, [
      { id: 1, fullName: 'אורי לוי' },
    ]);
    const registration = await service.submitRegistration({
      draft,
      selectedFiles: [
        createSelectedFile(DocumentType.SignedContract, RegistrationDocumentScopeKind.AllChildren, 'contract.pdf'),
        createSelectedFile(DocumentType.StandingOrderApproval, RegistrationDocumentScopeKind.AllChildren, 'standing-order.pdf'),
      ],
    });
    const afterUploadAttempt = await service.uploadRegistrationDocument({
      registrationId: registration.id,
      documentType: DocumentType.SignedContract,
      scope: { kind: RegistrationDocumentScopeKind.AllChildren },
      file: new File(['mock'], 'replacement-contract.pdf', { type: 'application/pdf' }),
    });

    expect(afterUploadAttempt.status).toBe(RegistrationStatus.PendingApproval);
    expect(afterUploadAttempt.missingDocuments).toHaveLength(0);
    expect(afterUploadAttempt.documents.map((document) => document.fileName)).toEqual(['standing-order.pdf', 'replacement-contract.pdf']);
  });
});

function createDraft(
  year: Year,
  selectedYearPlanId: number,
  children: Array<{ id: number; fullName: string; selectedYearPlanId?: number }>,
  scopeKind = RegistrationDocumentScopeKind.AllChildren,
): RegistrationDraft {
  return {
    year,
    currentStep: RegistrationDraftStep.DocumentsUpload,
    parentDetails: {
      id: 0,
      fullName: 'דנה לוי',
      phoneNumber: '050-123-4567',
      email: 'parent@example.com',
    },
    children: children.map((child) => ({
      id: child.id,
      fullName: child.fullName,
      dateOfBirth: '2021-03-14',
      gender: Gender.Male,
      allergyAnswer: AllergyAnswer.No,
      allergyDetails: '',
      selectedYearPlanId: child.selectedYearPlanId ?? selectedYearPlanId,
    })),
    documentScopeChoices: {
      SignedContract: scopeKind,
      StandingOrderApproval: scopeKind,
    },
    documents: [],
    updatedAt: new Date().toISOString(),
  };
}

function createSelectedFile(
  documentType: DocumentType,
  scopeKind: RegistrationDocumentScopeKind,
  fileName: string,
  localChildId?: number,
): RegistrationSelectedFile {
  return {
    documentType,
    scope: scopeKind === RegistrationDocumentScopeKind.AllChildren
      ? { kind: RegistrationDocumentScopeKind.AllChildren }
      : { kind: RegistrationDocumentScopeKind.SpecificChild, localChildId: localChildId ?? 1 },
    file: new File(['mock'], fileName, { type: 'application/pdf' }),
  };
}
