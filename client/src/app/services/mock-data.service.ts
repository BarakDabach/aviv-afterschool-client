import { Injectable } from '@angular/core';
import {
  DocumentType,
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
import { DataService } from './data.service';

@Injectable()
export class MockDataService extends DataService {
  private readonly registrations = new Map<number, RegistrationState>();
  private nextRegistrationId = 1001;
  private nextDocumentId = 1;

  override async getAuthOtpResendTimeoutSeconds(): Promise<number> {
    return 10;
  }

  override async getActiveRegistrationYear(): Promise<Year> {
    return MOCK_ACTIVE_YEAR;
  }

  override async getAvailableYearPlans(): Promise<AvailableYearPlan[]> {
    return MOCK_AVAILABLE_YEAR_PLANS;
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

    if (registration.status !== RegistrationStatus.WaitingForDocuments) {
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
