import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from '../../app/facades/auth.facade';
import { ParentFacade } from '../../app/facades/parent.facade';
import { GlobalStore } from '../../app/stores/global.store';
import {
  AllergyAnswer,
  DocumentType,
  Gender,
  RegistrationDocumentScopeKind,
  RegistrationChildStatus,
  RegistrationDraftStep,
  RegistrationStatus,
  type AvailableYearPlan,
  type RegistrationState,
  type SubmitRegistrationRequest,
  type UploadRegistrationDocumentRequest,
  type Year,
} from '../../app/types/registration-status.type';
import { RegistrationStore } from './registration.store';

const activeYear: Year = {
  id: 1,
  yearNumber: 2027,
};

const availableYearPlans: AvailableYearPlan[] = [
  {
    yearPlanId: 101,
    plan: {
      id: 1,
      name: 'מסלול חודשי מלא',
      price: 1450,
      hours: 'ימים א-ה עד 16:30',
      isActive: true,
      requiresStandingOrder: true,
    },
  },
  {
    yearPlanId: 102,
    plan: {
      id: 2,
      name: 'מסלול יומי',
      price: 1050,
      hours: 'שלושה ימים לבחירה עד 16:30',
      isActive: true,
      requiresStandingOrder: false,
    },
  },
];

describe('RegistrationStore', () => {
  let facade: {
    getActiveRegistrationYear: ReturnType<typeof vi.fn>;
    getAvailableYearPlans: ReturnType<typeof vi.fn>;
    submitRegistration: ReturnType<typeof vi.fn>;
    uploadRegistrationDocument: ReturnType<typeof vi.fn>;
  };
  let authFacade: {
    getMe: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    requestOtp: ReturnType<typeof vi.fn>;
    verifyOtp: ReturnType<typeof vi.fn>;
  };
  let globalStore: InstanceType<typeof GlobalStore>;
  let store: InstanceType<typeof RegistrationStore>;

  beforeEach(async () => {
    localStorage.clear();

    facade = {
      getActiveRegistrationYear: vi.fn().mockResolvedValue(activeYear),
      getAvailableYearPlans: vi.fn().mockResolvedValue(availableYearPlans),
      submitRegistration: vi.fn(),
      uploadRegistrationDocument: vi.fn(),
    };
    authFacade = {
      getMe: vi.fn().mockResolvedValue(null),
      logout: vi.fn(),
      requestOtp: vi.fn(),
      verifyOtp: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        RegistrationStore,
        {
          provide: AuthFacade,
          useValue: authFacade,
        },
        {
          provide: ParentFacade,
          useValue: facade,
        },
      ],
    });

    globalStore = TestBed.inject(GlobalStore);
    globalStore.clearUser();
    store = TestBed.inject(RegistrationStore);
    await settle();
  });

  it('initializes a frontend-only local draft with the first plan selected by default', () => {
    expect(store.activeStep()).toBe(0);
    expect(store.availableYearPlans()).toEqual(availableYearPlans);
    expect(store.children()).toHaveLength(1);
    expect(store.children()[0].selectedYearPlanId).toBe(availableYearPlans[0].yearPlanId);
    expect(store.submittedRegistration()).toBeNull();
  });

  it('starts at the children stage for an authenticated parent without a saved draft', async () => {
    globalStore.setUser({
      id: 'parent-1',
      role: 'parent',
      fullName: 'דנה לוי',
      email: 'dana@example.com',
      phoneNumber: '0501234567',
    });

    await store.initialize();
    await settle();

    expect(store.activeStep()).toBe(1);
    expect(store.parentDetails()).toEqual(expect.objectContaining({
      fullName: 'דנה לוי',
      email: 'dana@example.com',
      phoneNumber: '0501234567',
    }));
  });

  it('restores a persisted parent session before choosing the first registration step', async () => {
    authFacade.getMe.mockResolvedValueOnce({
      user: {
        id: 'parent-1',
        role: 'parent',
        fullName: 'דנה לוי',
        email: 'dana@example.com',
        phoneNumber: '0501234567',
      },
      expiresAtIso: new Date(Date.now() + 60_000).toISOString(),
    });
    globalStore.clearUser();

    await store.initialize();
    await settle();

    expect(store.activeStep()).toBe(1);
    expect(globalStore.loggedIn()).toBe(true);
    expect(store.parentDetails().email).toBe('dana@example.com');
  });

  it('shows an error instead of silently ignoring submit when required parent details are missing', async () => {
    enterValidParentDetails(store);
    await store.goNext();
    store.setChildren([createChildDraft(1, 'אורי לוי', availableYearPlans[0].yearPlanId)]);
    store.setChildDetailsValid(true);
    await store.goNext();
    store.setParentPhoneNumber('');

    await store.goNext();

    expect(facade.submitRegistration).not.toHaveBeenCalled();
    expect(store.error()).toContain('חסרים פרטי הורה תקינים');
  });

  it('stores serializable draft data in localStorage without persisting selected file contents', async () => {
    enterValidParentDetails(store);
    await store.goNext();
    store.setChildren([
      createChildDraft(1, 'אורי לוי', availableYearPlans[0].yearPlanId),
      createChildDraft(2, 'נועה לוי', availableYearPlans[1].yearPlanId),
    ]);
    store.setChildDetailsValid(true);
    await store.goNext();
    store.selectDocumentFile(
      DocumentType.SignedContract,
      { kind: RegistrationDocumentScopeKind.AllChildren },
      fileInputEvent('contract.pdf'),
    );

    store.saveAndContinueLater();

    const rawDraft = localStorage.getItem('aviv-registration-draft');

    expect(rawDraft).not.toBeNull();

    const savedDraft = JSON.parse(rawDraft!);

    expect(store.activeStep()).toBe(3);
    expect(store.submittedRegistration()).toBeNull();
    expect(savedDraft.currentStep).toBe(RegistrationDraftStep.DocumentsUpload);
    expect(savedDraft.children).toHaveLength(2);
    expect(savedDraft.documents).toEqual([
      expect.objectContaining({
        documentType: DocumentType.SignedContract,
        fileName: 'contract.pdf',
        mimeType: 'application/pdf',
        scope: { kind: RegistrationDocumentScopeKind.AllChildren },
      }),
    ]);
    expect(savedDraft.selectedFiles).toBeUndefined();
    expect(JSON.stringify(savedDraft)).not.toContain('mock-file-content');
  });

  it('submits a persisted registration, clears the local draft, and shows submitted summary state', async () => {
    const submittedRegistration = createSubmittedRegistration(RegistrationStatus.WaitingForDocuments);

    facade.submitRegistration.mockResolvedValueOnce(submittedRegistration);

    enterValidParentDetails(store);
    await store.goNext();
    store.setChildren([createChildDraft(1, 'אורי לוי', availableYearPlans[0].yearPlanId)]);
    store.setChildDetailsValid(true);
    await store.goNext();
    store.saveAndContinueLater();

    expect(localStorage.getItem('aviv-registration-draft')).not.toBeNull();

    store.setActiveStep(2);
    await store.goNext();
    await settle();

    expect(facade.submitRegistration).toHaveBeenCalledWith({
      draft: expect.objectContaining({
        currentStep: RegistrationDraftStep.DocumentsUpload,
      }),
      selectedFiles: [],
    });
    expect(store.activeStep()).toBe(3);
    expect(store.submittedRegistration()).toEqual(submittedRegistration);
    expect(store.registrationStatus().label).toBe('ממתינה למסמכים');
    expect(localStorage.getItem('aviv-registration-draft')).toBeNull();
  });

  it('uploads missing documents from the submitted summary and transitions to pending approval', async () => {
    const waitingRegistration = createSubmittedRegistration(RegistrationStatus.WaitingForDocuments);
    const pendingRegistration = {
      ...waitingRegistration,
      status: RegistrationStatus.PendingApproval,
      documents: [
        {
          id: 1,
          documentType: DocumentType.SignedContract,
          fileName: 'contract.pdf',
          mimeType: 'application/pdf',
          scope: { kind: RegistrationDocumentScopeKind.SpecificChild, localChildId: 1 },
          uploadedAt: new Date().toISOString(),
        },
      ],
      missingDocuments: [],
    } satisfies RegistrationState;

    facade.submitRegistration.mockResolvedValueOnce(waitingRegistration);
    facade.uploadRegistrationDocument.mockResolvedValueOnce(pendingRegistration);

    enterValidParentDetails(store);
    await store.goNext();
    store.setChildren([createChildDraft(1, 'אורי לוי', availableYearPlans[1].yearPlanId)]);
    store.setChildDetailsValid(true);
    await store.goNext();
    await store.goNext();
    await settle();

    expect(store.submittedRegistration()?.status).toBe(RegistrationStatus.WaitingForDocuments);

    await store.uploadMissingDocument(waitingRegistration.missingDocuments[0], fileInputEvent('contract.pdf'));
    await settle();

    expect(facade.uploadRegistrationDocument).toHaveBeenCalledWith({
      registrationId: waitingRegistration.id,
      documentType: DocumentType.SignedContract,
      scope: { kind: RegistrationDocumentScopeKind.SpecificChild, localChildId: 1 },
      file: expect.objectContaining({ name: 'contract.pdf' }),
    } satisfies UploadRegistrationDocumentRequest);
    expect(store.submittedRegistration()).toEqual(pendingRegistration);
    expect(store.submittedDocumentsComplete()).toBe(true);
    expect(store.registrationStatus().label).toBe('ממתינה לאישור');
  });
});

function enterValidParentDetails(store: InstanceType<typeof RegistrationStore>): void {
  store.setParentFullName('דנה לוי');
  store.setParentPhoneNumber('0501234567');
  store.setParentEmail('dana@example.com');
}

function createChildDraft(id: number, fullName: string, selectedYearPlanId: number) {
  return {
    id,
    fullName,
    dateOfBirth: '2021-03-14',
    gender: Gender.Female,
    allergyAnswer: AllergyAnswer.No,
    allergyDetails: '',
    selectedYearPlanId,
  };
}

function createSubmittedRegistration(status: RegistrationStatus): RegistrationState {
  const missingDocuments = status === RegistrationStatus.WaitingForDocuments
    ? [
        {
          documentType: DocumentType.SignedContract,
          scope: { kind: RegistrationDocumentScopeKind.SpecificChild, localChildId: 1 },
          label: 'חוזה חתום - אורי לוי',
        },
      ]
    : [];

  return {
    id: 1001,
    year: activeYear,
    status,
    parent: {
      id: 1,
      fullName: 'דנה לוי',
      phoneNumber: '0501234567',
      email: 'dana@example.com',
    },
    children: [
      {
        id: 1,
        child: {
          id: 1,
          fullName: 'אורי לוי',
          uniqueId: '',
          dateOfBirth: '2021-03-14',
          gender: Gender.Female,
          allergies: null,
        },
        selectedPlan: {
          yearPlanId: availableYearPlans[0].yearPlanId,
          plan: availableYearPlans[0].plan,
        },
        status: RegistrationChildStatus.Active,
        finalPrice: availableYearPlans[0].plan.price,
      },
    ],
    documents: [],
    missingDocuments,
  };
}

function fileInputEvent(fileName: string): Event {
  const file = new File(['mock-file-content'], fileName, { type: 'application/pdf' });

  return {
    target: {
      files: [file],
      value: '',
    },
  } as unknown as Event;
}

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
