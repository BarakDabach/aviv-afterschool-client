import { Injectable } from '@angular/core';
import {
  DocumentType,
  Gender,
  type HolidayPeriod,
  type ParentHome,
  RegistrationChildStatus,
  RegistrationDocumentScopeKind,
  RegistrationStatus,
  type AvailableYearPlan,
  type MissingRegistrationDocument,
  type RegistrationDocument,
  type RegistrationDocumentScope,
  type RegistrationState,
  type SubmitRegistrationRequest,
  type UploadRegistrationDocumentRequest,
  type Year,
} from '../types/registration-status.type';
import type { AuthenticatedUser } from '../types/auth.type';
import { DataService } from './data.service';

@Injectable()
export class MockDataService extends DataService {
  private readonly registrations = new Map<number, RegistrationState>();
  private nextRegistrationId = 1001;
  private nextDocumentId = 1;

  constructor() {
    super();
    MOCK_PARENT_REGISTRATIONS.forEach((registration) => this.registrations.set(registration.id, clone(registration)));
    this.nextRegistrationId = Math.max(...MOCK_PARENT_REGISTRATIONS.map((registration) => registration.id)) + 1;
    this.nextDocumentId = Math.max(...MOCK_PARENT_REGISTRATIONS.flatMap((registration) => registration.documents.map((document) => document.id)), 0) + 1;
  }

  override async getAuthOtpResendTimeoutSeconds(): Promise<number> {
    return 10;
  }

  override async getActiveRegistrationYear(): Promise<Year> {
    return MOCK_ACTIVE_YEAR;
  }

  override async getAvailableYearPlans(): Promise<AvailableYearPlan[]> {
    return MOCK_AVAILABLE_YEAR_PLANS;
  }

  override async getParentHome(parentEmail?: string): Promise<ParentHome> {
    const normalizedEmail = parentEmail ? normalizeEmail(parentEmail) : '';
    const registrations = [...this.registrations.values()].filter((registration) => {
      return !normalizedEmail || normalizeEmail(registration.parent.email) === normalizedEmail;
    });
    const activeRegistration = [...registrations]
      .sort((left: RegistrationState, right: RegistrationState) => right.year.yearNumber - left.year.yearNumber || right.id - left.id)
      .at(0) ?? null;
    const parent = activeRegistration?.parent ?? registrations[0]?.parent ?? MOCK_PARENT;

    return clone({
      parent,
      activeRegistration,
      registrationHistory: registrations,
      holidayPeriods: MOCK_HOLIDAY_PERIODS,
    });
  }

  override async getSubmittedRegistration(registrationId: number): Promise<RegistrationState> {
    const registration = this.registrations.get(registrationId);

    if (!registration) {
      throw new Error('Registration was not found.');
    }

    return clone(registration);
  }

  override async getRegisteredParentByEmail(email: string): Promise<AuthenticatedUser | null> {
    const normalizedEmail = normalizeEmail(email);
    const registration = [...this.registrations.values()].find((candidate) => normalizeEmail(candidate.parent.email) === normalizedEmail);

    if (!registration) return null;

    return {
      id: `parent-registration-${registration.parent.id || registration.id}`,
      fullName: registration.parent.fullName,
      email: registration.parent.email,
      phoneNumber: registration.parent.phoneNumber,
      role: 'parent',
    };
  }

  override async submitRegistration(request: SubmitRegistrationRequest): Promise<RegistrationState> {
    const uploadedAt = new Date().toISOString();
    const documents = request.selectedFiles.map<RegistrationDocument>((selectedFile, index) => ({
      id: this.nextDocumentId + index,
      fileName: selectedFile.file.name,
      mimeType: selectedFile.file.type || 'application/octet-stream',
      documentType: selectedFile.documentType,
      scope: selectedFile.scope,
      uploadedAt,
    }));
    this.nextDocumentId += documents.length;
    const children = request.draft.children.map((child, index) => {
      const selectedPlan = MOCK_AVAILABLE_YEAR_PLANS.find((yearPlan) => yearPlan.yearPlanId === child.selectedYearPlanId) ?? null;
      const discountPercent = index === 1 ? 10 : 0;
      const planPrice = selectedPlan?.plan.price ?? 0;

      return {
        id: child.id,
        child: {
          id: child.id,
          fullName: child.fullName,
          uniqueId: '',
          dateOfBirth: child.dateOfBirth,
          gender: child.gender,
          allergies: child.allergyAnswer === 'yes' ? child.allergyDetails : null,
        },
        selectedPlan,
        status: RegistrationChildStatus.Active,
        leaveDate: null,
        appliedDiscountPercent: discountPercent,
        finalPrice: Math.round(planPrice * (1 - discountPercent / 100)),
      };
    });
    const missingDocuments = getMissingDocuments(request, documents);

    const registration = {
      id: this.nextRegistrationId++,
      year: request.draft.year,
      status: missingDocuments.length ? RegistrationStatus.WaitingForDocuments : RegistrationStatus.PendingApproval,
      parent: request.draft.parentDetails,
      children,
      documents,
      missingDocuments,
    };

    this.registrations.set(registration.id, registration);

    return registration;
  }

  override async uploadRegistrationDocument(request: UploadRegistrationDocumentRequest): Promise<RegistrationState> {
    const registration = this.registrations.get(request.registrationId);

    if (!registration) {
      throw new Error('Registration was not found.');
    }

    if (registration.status !== RegistrationStatus.WaitingForDocuments && registration.status !== RegistrationStatus.PendingApproval) {
      return registration;
    }

    const uploadedDocument: RegistrationDocument = {
      id: this.nextDocumentId++,
      fileName: request.file.name,
      mimeType: request.file.type || 'application/octet-stream',
      documentType: request.documentType,
      scope: request.scope,
      uploadedAt: new Date().toISOString(),
    };
    const documents = [
      ...registration.documents.filter((document) => !isSameDocumentRequirement(document, request.documentType, request.scope)),
      uploadedDocument,
    ];
    const missingDocuments = getMissingDocumentsForRegistration(registration, documents);
    const updatedRegistration = {
      ...registration,
      documents,
      missingDocuments,
      status: missingDocuments.length ? RegistrationStatus.WaitingForDocuments : RegistrationStatus.PendingApproval,
    };

    this.registrations.set(updatedRegistration.id, updatedRegistration);

    return updatedRegistration;
  }
}

const MOCK_ACTIVE_YEAR: Year = {
  id: 1,
  yearNumber: 2027,
};

const MOCK_PARENT = {
  id: 1,
  fullName: 'דנה לוי',
  phoneNumber: '0501234567',
};

const MOCK_AVAILABLE_YEAR_PLANS: AvailableYearPlan[] = [
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

const MOCK_ACTIVE_REGISTRATION_ID = 1001;

const MOCK_PARENT_REGISTRATIONS: RegistrationState[] = [
  {
    id: MOCK_ACTIVE_REGISTRATION_ID,
    year: MOCK_ACTIVE_YEAR,
    status: RegistrationStatus.WaitingForDocuments,
    parent: {
      ...MOCK_PARENT,
      email: 'parent@example.com',
    },
    children: [
      {
        id: 1,
        child: {
          id: 1,
          fullName: 'נועה לוי',
          uniqueId: '',
          dateOfBirth: '2020-03-10',
          gender: Gender.Female,
          allergies: null,
        },
        selectedPlan: MOCK_AVAILABLE_YEAR_PLANS[0],
        status: RegistrationChildStatus.Active,
        leaveDate: null,
        appliedDiscountPercent: 0,
        finalPrice: 1450,
      },
      {
        id: 2,
        child: {
          id: 2,
          fullName: 'אורי לוי',
          uniqueId: '',
          dateOfBirth: '2021-06-18',
          gender: Gender.Male,
          allergies: null,
        },
        selectedPlan: MOCK_AVAILABLE_YEAR_PLANS[0],
        status: RegistrationChildStatus.Active,
        leaveDate: null,
        appliedDiscountPercent: 10,
        finalPrice: 1305,
      },
    ],
    documents: [
      {
        id: 1,
        fileName: 'signed-contract-levi.pdf',
        mimeType: 'application/pdf',
        documentType: DocumentType.SignedContract,
        scope: { kind: RegistrationDocumentScopeKind.AllChildren },
        uploadedAt: '2026-08-01T09:30:00.000Z',
      },
    ],
    missingDocuments: [
      {
        documentType: DocumentType.StandingOrderApproval,
        scope: { kind: RegistrationDocumentScopeKind.SpecificChild, localChildId: 1 },
        label: 'אישור הוראת קבע',
      },
      {
        documentType: DocumentType.StandingOrderApproval,
        scope: { kind: RegistrationDocumentScopeKind.SpecificChild, localChildId: 2 },
        label: 'אסמכתת ביטוח',
      },
    ],
  },
  {
    id: 1002,
    year: { id: 2, yearNumber: 2026 },
    status: RegistrationStatus.Approved,
    parent: {
      ...MOCK_PARENT,
      email: 'parent@example.com',
    },
    children: [
      {
        id: 3,
        child: {
          id: 1,
          fullName: 'נועה לוי',
          uniqueId: '',
          dateOfBirth: '2020-03-10',
          gender: Gender.Female,
          allergies: null,
        },
        selectedPlan: MOCK_AVAILABLE_YEAR_PLANS[0],
        status: RegistrationChildStatus.Active,
        leaveDate: null,
        appliedDiscountPercent: 0,
        finalPrice: 1450,
      },
    ],
    documents: [],
    missingDocuments: [],
  },
  {
    id: 1003,
    year: { id: 3, yearNumber: 2025 },
    status: RegistrationStatus.Approved,
    parent: {
      ...MOCK_PARENT,
      email: 'parent@example.com',
    },
    children: [
      {
        id: 4,
        child: {
          id: 1,
          fullName: 'נועה לוי',
          uniqueId: '',
          dateOfBirth: '2020-03-10',
          gender: Gender.Female,
          allergies: null,
        },
        selectedPlan: MOCK_AVAILABLE_YEAR_PLANS[0],
        status: RegistrationChildStatus.Active,
        leaveDate: null,
        appliedDiscountPercent: 0,
        finalPrice: 1450,
      },
    ],
    documents: [],
    missingDocuments: [],
  },
  {
    id: 1004,
    year: { id: 4, yearNumber: 2024 },
    status: RegistrationStatus.Approved,
    parent: {
      ...MOCK_PARENT,
      email: 'parent@example.com',
    },
    children: [
      {
        id: 5,
        child: {
          id: 2,
          fullName: 'אורי לוי',
          uniqueId: '',
          dateOfBirth: '2021-06-18',
          gender: Gender.Male,
          allergies: null,
        },
        selectedPlan: MOCK_AVAILABLE_YEAR_PLANS[0],
        status: RegistrationChildStatus.Active,
        leaveDate: null,
        appliedDiscountPercent: 0,
        finalPrice: 1450,
      },
    ],
    documents: [],
    missingDocuments: [],
  },
];

const MOCK_HOLIDAY_PERIODS: HolidayPeriod[] = [
  {
    id: 1,
    yearId: MOCK_ACTIVE_YEAR.id,
    name: 'ראש השנה',
    startDate: '2026-09-12',
    endDate: '2026-09-14',
  },
  {
    id: 2,
    yearId: MOCK_ACTIVE_YEAR.id,
    name: 'סוכות',
    startDate: '2026-09-27',
    endDate: '2026-10-04',
  },
  {
    id: 3,
    yearId: MOCK_ACTIVE_YEAR.id,
    name: 'חנוכה',
    startDate: '2026-12-08',
    endDate: '2026-12-15',
  },
];

function getMissingDocuments(
  request: SubmitRegistrationRequest,
  uploadedDocuments: RegistrationDocument[],
): MissingRegistrationDocument[] {
  return [
    ...getMissingByDocumentType(request, uploadedDocuments, DocumentType.SignedContract),
    ...getMissingByDocumentType(request, uploadedDocuments, DocumentType.StandingOrderApproval),
  ];
}

function getMissingDocumentsForRegistration(
  registration: RegistrationState,
  uploadedDocuments: RegistrationDocument[],
): MissingRegistrationDocument[] {
  return [
    ...getMissingByDocumentTypeForRegistration(registration, uploadedDocuments, DocumentType.SignedContract),
    ...getMissingByDocumentTypeForRegistration(registration, uploadedDocuments, DocumentType.StandingOrderApproval),
  ];
}

function getMissingByDocumentType(
  request: SubmitRegistrationRequest,
  uploadedDocuments: RegistrationDocument[],
  documentType: DocumentType,
): MissingRegistrationDocument[] {
  const relevantChildren = documentType === DocumentType.StandingOrderApproval
    ? request.draft.children.filter((child) => {
        const selectedPlan = MOCK_AVAILABLE_YEAR_PLANS.find((yearPlan) => yearPlan.yearPlanId === child.selectedYearPlanId);

        return selectedPlan?.plan.requiresStandingOrder;
      })
    : request.draft.children;

  if (!relevantChildren.length) return [];

  const hasSharedDocument = uploadedDocuments.some((document) => {
    return document.documentType === documentType && document.scope.kind === RegistrationDocumentScopeKind.AllChildren;
  });

  if (hasSharedDocument) return [];

  return relevantChildren
    .filter((child) => {
      return !uploadedDocuments.some((document) => {
        return document.documentType === documentType
          && document.scope.kind === RegistrationDocumentScopeKind.SpecificChild
          && document.scope.localChildId === child.id;
      });
    })
    .map((child) => ({
      documentType,
      scope: {
        kind: RegistrationDocumentScopeKind.SpecificChild,
        localChildId: child.id,
      },
      label: `${documentType === DocumentType.SignedContract ? 'חוזה חתום' : 'אישור הוראת קבע'} - ${child.fullName}`,
    }));
}

function getMissingByDocumentTypeForRegistration(
  registration: RegistrationState,
  uploadedDocuments: RegistrationDocument[],
  documentType: DocumentType,
): MissingRegistrationDocument[] {
  const relevantChildren = documentType === DocumentType.StandingOrderApproval
    ? registration.children.filter((childState) => childState.selectedPlan?.plan.requiresStandingOrder)
    : registration.children;

  if (!relevantChildren.length) return [];

  const hasSharedDocument = uploadedDocuments.some((document) => {
    return document.documentType === documentType && document.scope.kind === RegistrationDocumentScopeKind.AllChildren;
  });

  if (hasSharedDocument) return [];

  return relevantChildren
    .filter((childState) => {
      return !uploadedDocuments.some((document) => {
        return document.documentType === documentType
          && document.scope.kind === RegistrationDocumentScopeKind.SpecificChild
          && document.scope.localChildId === childState.child.id;
      });
    })
    .map((childState) => ({
      documentType,
      scope: {
        kind: RegistrationDocumentScopeKind.SpecificChild,
        localChildId: childState.child.id,
      },
      label: `${documentType === DocumentType.SignedContract ? 'חוזה חתום' : 'אישור הוראת קבע'} - ${childState.child.fullName}`,
    }));
}

function isSameDocumentRequirement(
  document: RegistrationDocument,
  documentType: DocumentType,
  scope: RegistrationDocumentScope,
): boolean {
  if (document.documentType !== documentType || document.scope.kind !== scope.kind) return false;
  if (scope.kind === RegistrationDocumentScopeKind.AllChildren) return true;

  return document.scope.kind === RegistrationDocumentScopeKind.SpecificChild
    && document.scope.localChildId === scope.localChildId;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
