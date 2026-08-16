import { Injectable } from '@angular/core';
import {
  DocumentType,
  RegistrationChildStatus,
  RegistrationDocumentScopeKind,
  RegistrationStatus,
  type AvailableYearPlan,
  type MissingRegistrationDocument,
  type RegistrationDocument,
  type RegistrationState,
  type SubmitRegistrationRequest,
  type Year,
} from '../types/registration-status.type';
import { DataService } from './data.service';

@Injectable()
export class MockDataService extends DataService {
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
      id: index + 1,
      fileName: selectedFile.file.name,
      mimeType: selectedFile.file.type || 'application/octet-stream',
      documentType: selectedFile.documentType,
      scope: selectedFile.scope,
      uploadedAt,
    }));
    const children = request.draft.children.map((child, index) => {
      const selectedPlan = MOCK_AVAILABLE_YEAR_PLANS.find((yearPlan) => yearPlan.yearPlanId === child.selectedYearPlanId) ?? null;
      const discountPercent = index === 1 ? 10 : 0;
      const planPrice = selectedPlan?.plan.price ?? 0;

      return {
        id: index + 1,
        child: {
          id: index + 1,
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

    return {
      id: 1001,
      year: request.draft.year,
      status: missingDocuments.length ? RegistrationStatus.WaitingForDocuments : RegistrationStatus.PendingApproval,
      parent: request.draft.parentDetails,
      children,
      documents,
      missingDocuments,
    };
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
