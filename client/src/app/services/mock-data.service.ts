import { Injectable } from '@angular/core';
import {
  DocumentReviewStatus,
  DocumentType,
  Gender,
  PaymentMethod,
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
import type {
  AdminDashboardData,
  AdminDocument,
  AdminDocumentActionRequest,
  AdminYearCreateRequest,
  AdminYearUpdateRequest,
  AdminPaymentMethodRequest,
  AdminRegistrationActionRequest,
  AdminRegistration,
  AdminYearSummary,
  AdminYearsOverview,
} from '../types/admin.type';
import { DataService } from './data.service';
import { ACTIVE_REGISTRATION_YEAR, AVAILABLE_YEAR_PLANS, REGISTRATION_HOLIDAY_PERIODS } from '../config/registration.config';

@Injectable()
export class MockDataService extends DataService {
  private readonly registrations = new Map<number, RegistrationState>();
  private readonly years = new Map<number, Year>([[ACTIVE_REGISTRATION_YEAR.id, ACTIVE_REGISTRATION_YEAR]]);
  private readonly yearPlans = new Map<number, AvailableYearPlan[]>([[ACTIVE_REGISTRATION_YEAR.id, clone(AVAILABLE_YEAR_PLANS)]]);
  private readonly yearHolidayPeriods = new Map<number, HolidayPeriod[]>([[ACTIVE_REGISTRATION_YEAR.id, clone(REGISTRATION_HOLIDAY_PERIODS)]]);
  private readonly yearContracts = new Map<number, { fileName: string; mimeType: string } | null>([[ACTIVE_REGISTRATION_YEAR.id, null]]);
  private activeYearId = ACTIVE_REGISTRATION_YEAR.id;
  private nextYearId = ACTIVE_REGISTRATION_YEAR.id + 1;
  private nextYearPlanId = Math.max(...AVAILABLE_YEAR_PLANS.map((yearPlan) => yearPlan.yearPlanId)) + 1;
  private nextHolidayPeriodId = Math.max(...REGISTRATION_HOLIDAY_PERIODS.map((holiday) => holiday.id)) + 1;
  private nextRegistrationId = 1;
  private nextDocumentId = 1;

  override async getAuthOtpResendTimeoutSeconds(): Promise<number> {
    return 10;
  }

  override async getActiveRegistrationYear(): Promise<Year> {
    return clone(this.currentYear());
  }

  override async getAvailableYearPlans(): Promise<AvailableYearPlan[]> {
    return clone(this.currentYearPlans());
  }

  override async getParentHome(parentEmail?: string): Promise<ParentHome> {
    const normalizedEmail = parentEmail ? normalizeEmail(parentEmail) : '';

    if (!normalizedEmail) {
      throw new Error('חייבים להיות מחוברים כדי לצפות בדף הבית.');
    }

    const registrations = [...this.registrations.values()].filter((registration) => {
      return normalizeEmail(registration.parent.email) === normalizedEmail;
    });

    if (!registrations.length) {
      throw new Error('לא נמצאו הרשמות עבור כתובת האימייל הזו.');
    }

    const activeRegistration = [...registrations]
      .filter((registration) => registration.year.id === this.activeYearId)
      .sort(compareRegistrations)
      .at(0) ?? null;

    return clone({
      parent: registrations[0].parent,
      activeRegistration,
      registrationHistory: registrations.sort(compareRegistrations),
      holidayPeriods: this.currentYearHolidayPeriods(),
    });
  }

  override async getSubmittedRegistration(registrationId: number): Promise<RegistrationState> {
    return clone(this.requireRegistration(registrationId));
  }

  override async getRegisteredParentByEmail(email: string): Promise<AuthenticatedUser | null> {
    const normalizedEmail = normalizeEmail(email);
    const registration = [...this.registrations.values()].find((candidate) => normalizeEmail(candidate.parent.email) === normalizedEmail);

    if (!registration) return null;

    return {
      id: `parent-${registration.parent.email}`,
      fullName: registration.parent.fullName,
      email: registration.parent.email,
      phoneNumber: registration.parent.phoneNumber,
      role: 'parent',
    };
  }

  override async submitRegistration(request: SubmitRegistrationRequest): Promise<RegistrationState> {
    const now = new Date().toISOString();
    const normalizedParentEmail = normalizeEmail(request.draft.parentDetails.email);
    const documents = request.selectedFiles.map<RegistrationDocument>((selectedFile) => ({
      id: this.nextDocumentId++,
      fileName: selectedFile.file.name,
      mimeType: selectedFile.file.type || 'application/octet-stream',
      documentType: selectedFile.documentType,
      scope: selectedFile.scope,
      uploadedAt: now,
      reviewStatus: DocumentReviewStatus.PendingReview,
      reviewedAt: null,
    }));
    const children = request.draft.children.map((child) => {
      const selectedPlan = this.plansForYear(request.draft.year.id).find((yearPlan) => yearPlan.yearPlanId === child.selectedYearPlanId) ?? null;
      const discountPercent = 0;
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
        paymentMethod: selectedPlan?.plan.requiresStandingOrder === false ? PaymentMethod.Cash : PaymentMethod.StandingOrder,
        leaveDate: null,
        appliedDiscountPercent: discountPercent,
        finalPrice: Math.round(planPrice * (1 - discountPercent / 100)),
      };
    });
    const registrationId = this.nextRegistrationId++;
    const draftRegistration = {
      id: registrationId,
      year: request.draft.year,
      status: RegistrationStatus.PendingApproval,
      parent: {
        ...request.draft.parentDetails,
        email: normalizedParentEmail,
      },
      children,
      documents,
      missingDocuments: [] as MissingRegistrationDocument[],
      createdAt: now,
      submittedAt: now,
    } satisfies RegistrationState;
    const registration = this.withCalculatedRequirements(draftRegistration);

    this.registrations.set(registration.id, registration);
    return clone(registration);
  }

  override async uploadRegistrationDocument(request: UploadRegistrationDocumentRequest): Promise<RegistrationState> {
    const registration = this.requireRegistration(request.registrationId);

    if (registration.status !== RegistrationStatus.WaitingForDocuments && registration.status !== RegistrationStatus.PendingApproval) {
      return clone(registration);
    }

    const uploadedDocument: RegistrationDocument = {
      id: this.nextDocumentId++,
      fileName: request.file.name,
      mimeType: request.file.type || 'application/octet-stream',
      documentType: request.documentType,
      scope: request.scope,
      uploadedAt: new Date().toISOString(),
      reviewStatus: DocumentReviewStatus.PendingReview,
      reviewedAt: null,
    };
    const updatedRegistration = this.withCalculatedRequirements({
      ...registration,
      documents: [
        ...registration.documents.filter((document) => !isSameDocumentRequirement(document, request.documentType, request.scope)),
        uploadedDocument,
      ],
    });

    this.registrations.set(updatedRegistration.id, updatedRegistration);
    return clone(updatedRegistration);
  }

  override async getAdminDashboard(): Promise<AdminDashboardData> {
    const activeRegistrations = [...this.registrations.values()]
      .filter((registration) => registration.year.id === this.activeYearId)
      .sort(compareRegistrations);
    const approvedRegistrations = activeRegistrations.filter((registration) => registration.status === RegistrationStatus.Approved);

    return clone({
      activeYear: this.currentYear().yearNumber,
      totalRegistrations: activeRegistrations.length,
      registeredChildren: approvedRegistrations.reduce((total, registration) => total + registration.children.length, 0),
      maxChildCapacity: this.currentYear().maxChildCapacity,
      registrations: activeRegistrations
        .filter((registration) => registration.status === RegistrationStatus.WaitingForDocuments || registration.status === RegistrationStatus.PendingApproval)
        .map((registration) => this.toAdminRegistration(registration)),
    });
  }

  override async getAdminYearsOverview(): Promise<AdminYearsOverview> {
    for (const registration of this.registrations.values()) {
      this.years.set(registration.year.id, registration.year);
    }

    return clone(this.buildAdminYearsOverview());
  }

  override async createAdminYear(request: AdminYearCreateRequest): Promise<AdminYearsOverview> {
    if (request.yearNumber <= this.currentYear().yearNumber) {
      throw new Error('שנת העבודה החדשה חייבת להיות מאוחרת מהשנה הנוכחית.');
    }

    const year: Year = {
      id: this.nextYearId++,
      yearNumber: request.yearNumber,
      maxChildCapacity: request.maxChildCapacity,
      oneTimeInsuranceAmount: request.oneTimeInsuranceAmount,
    };

    this.years.set(year.id, year);
    this.yearPlans.set(year.id, this.toAvailableYearPlans(request.plans));
    this.yearHolidayPeriods.set(year.id, this.toHolidayPeriods(year.id, request.holidayPeriods));
    const sourceContract = request.sourceYearId ? this.yearContracts.get(request.sourceYearId) : null;
    this.yearContracts.set(year.id, {
      fileName: request.contractFileName || sourceContract?.fileName || '',
      mimeType: request.contractMimeType || sourceContract?.mimeType || 'application/octet-stream',
    });
    this.activeYearId = year.id;

    return clone(this.buildAdminYearsOverview());
  }

  override async updateAdminYear(request: AdminYearUpdateRequest): Promise<AdminYearsOverview> {
    const year = this.years.get(request.yearId);
    if (!year) throw new Error('שנת העבודה לא נמצאה.');

    const updatedYear: Year = {
      ...year,
      maxChildCapacity: request.maxChildCapacity,
      oneTimeInsuranceAmount: request.oneTimeInsuranceAmount ?? year.oneTimeInsuranceAmount,
    };

    this.years.set(updatedYear.id, updatedYear);
    if (request.plans) {
      this.yearPlans.set(updatedYear.id, this.toAvailableYearPlans(request.plans));
    }
    this.yearHolidayPeriods.set(updatedYear.id, this.toHolidayPeriods(updatedYear.id, request.holidayPeriods));
    if (request.contractFileName && request.contractMimeType) {
      this.yearContracts.set(updatedYear.id, {
        fileName: request.contractFileName,
        mimeType: request.contractMimeType,
      });
    }

    return clone(this.buildAdminYearsOverview());
  }

  private buildAdminYearsOverview(): AdminYearsOverview {
    const summaries = [...this.years.values()]
      .sort((left, right) => right.yearNumber - left.yearNumber)
      .map((year) => this.toAdminYearSummary(year));
    const currentYear = summaries.find((year) => year.yearId === this.activeYearId);

    if (!currentYear) {
      throw new Error('לא נמצאה שנת עבודה נוכחית.');
    }

    return {
      currentYear,
      historicalYears: summaries.filter((year) => year.yearId !== currentYear.yearId),
    };
  }

  override async setAdminPaymentMethod(request: AdminPaymentMethodRequest): Promise<RegistrationState> {
    const registration = this.requireRegistration(request.registrationId);
    const child = registration.children.find((candidate) => candidate.id === request.childId);
    if (!child) throw new Error('הילד לא נמצא בהרשמה.');

    const nextPaymentMethod = request.isCashOnly ? PaymentMethod.Cash : PaymentMethod.StandingOrder;
    if (child.paymentMethod === nextPaymentMethod) return clone(registration);

    const documents = nextPaymentMethod === PaymentMethod.Cash
      ? registration.documents.filter((document) => {
          return !(document.documentType === DocumentType.StandingOrderApproval
            && document.scope.kind === RegistrationDocumentScopeKind.SpecificChild
            && document.scope.localChildId === child.id);
        })
      : registration.documents;
    const updatedRegistration = this.withCalculatedRequirements({
      ...registration,
      children: registration.children.map((candidate) => candidate.id === child.id
        ? { ...candidate, paymentMethod: nextPaymentMethod }
        : candidate),
      documents,
    });

    this.registrations.set(updatedRegistration.id, updatedRegistration);
    return clone(updatedRegistration);
  }

  override async approveAdminDocument(request: AdminDocumentActionRequest): Promise<RegistrationState> {
    const registration = this.requireRegistration(request.registrationId);
    const document = registration.documents.find((candidate) => candidate.id === request.documentId);
    if (!document || !document.fileName) throw new Error('לא ניתן לאשר מסמך שטרם הועלה.');

    const updatedRegistration = this.withCalculatedRequirements({
      ...registration,
      documents: registration.documents.map((candidate) => candidate.id === request.documentId
        ? { ...candidate, reviewStatus: DocumentReviewStatus.Approved, reviewedAt: new Date().toISOString() }
        : candidate),
    });

    this.registrations.set(updatedRegistration.id, updatedRegistration);
    return clone(updatedRegistration);
  }

  override async approveAdminRegistration(request: AdminRegistrationActionRequest): Promise<RegistrationState> {
    const registration = this.requireRegistration(request.registrationId);

    if (registration.status === RegistrationStatus.WaitingForDocuments) {
      const updatedRegistration = { ...registration, status: RegistrationStatus.Approved };
      this.registrations.set(updatedRegistration.id, updatedRegistration);
      return clone(updatedRegistration);
    }

    const readyRegistration = this.withCalculatedRequirements(registration);

    if (readyRegistration.status !== RegistrationStatus.PendingApproval || !this.isApprovalReady(readyRegistration)) {
      throw new Error('אפשר לאשר את ההרשמה רק לאחר אישור כל המסמכים הרלוונטיים.');
    }

    const updatedRegistration = { ...readyRegistration, status: RegistrationStatus.Approved };
    this.registrations.set(updatedRegistration.id, updatedRegistration);
    return clone(updatedRegistration);
  }

  override async removeAdminRegistration(request: AdminRegistrationActionRequest): Promise<void> {
    this.requireRegistration(request.registrationId);
    this.registrations.delete(request.registrationId);
  }

  private requireRegistration(registrationId: number): RegistrationState {
    const registration = this.registrations.get(registrationId);
    if (!registration) throw new Error('ההרשמה לא נמצאה.');
    return registration;
  }

  private withCalculatedRequirements(registration: RegistrationState): RegistrationState {
    const missingDocuments = getMissingDocumentsForRegistration(registration, registration.documents, this.plansForYear(registration.year.id));
    return {
      ...registration,
      missingDocuments,
      status: registration.status === RegistrationStatus.Approved
        ? RegistrationStatus.Approved
        : missingDocuments.length ? RegistrationStatus.WaitingForDocuments : RegistrationStatus.PendingApproval,
    };
  }

  private isApprovalReady(registration: RegistrationState): boolean {
    return registration.missingDocuments.length === 0
      && registration.documents.length > 0
      && registration.documents.every((document) => document.reviewStatus === DocumentReviewStatus.Approved);
  }

  private toAdminRegistration(registration: RegistrationState): AdminRegistration {
    const childDocuments = registration.children.map((child) => {
      const documents = registration.documents
        .filter((document) => document.scope.kind === RegistrationDocumentScopeKind.SpecificChild && document.scope.localChildId === child.id)
        .map((document) => this.toAdminDocument(document));
      const missingDocuments = registration.missingDocuments
        .filter((document) => document.scope.kind === RegistrationDocumentScopeKind.SpecificChild && document.scope.localChildId === child.id)
        .map((document, index) => this.toMissingAdminDocument(registration.id, child.id, document, index));

      return {
        registrationChildId: child.id,
        fullName: child.child.fullName,
        gender: child.child.gender === Gender.Male ? 'Boy' as const : 'Girl' as const,
        planName: child.selectedPlan?.plan.name ?? '',
        billingPeriod: child.selectedPlan?.plan.requiresStandingOrder ? 'Monthly' as const : 'Daily' as const,
        isCashOnly: child.paymentMethod === PaymentMethod.Cash,
        documents: [...documents, ...missingDocuments],
      };
    });
    const sharedDocuments = registration.documents
      .filter((document) => document.scope.kind === RegistrationDocumentScopeKind.AllChildren)
      .map((document) => this.toAdminDocument(document, registration.children.map((child) => child.child.fullName)));
    const sharedMissingDocuments = registration.missingDocuments
      .filter((document) => document.scope.kind === RegistrationDocumentScopeKind.AllChildren)
      .map((document, index) => this.toMissingAdminDocument(registration.id, 0, document, index));

    return {
      registrationId: registration.id,
      status: registration.status as 'WaitingForDocuments' | 'PendingApproval',
      parentFullName: registration.parent.fullName,
      parentPhoneNumber: registration.parent.phoneNumber,
      uploadComplete: registration.missingDocuments.length === 0,
      approvalReady: this.isApprovalReady(registration),
      expanded: false,
      children: childDocuments,
      sharedDocuments: [...sharedDocuments, ...sharedMissingDocuments],
    };
  }

  private toAdminYearSummary(year: Year): AdminYearSummary {
    const registrations = [...this.registrations.values()]
      .filter((registration) => registration.year.id === year.id)
      .sort(compareRegistrations);
    const children = registrations.flatMap((registration) => registration.children.map((child) => ({
      registrationId: registration.id,
      registrationChildId: child.id,
      fullName: child.child.fullName,
      gender: child.child.gender,
      parentPhoneNumber: registration.parent.phoneNumber,
      planName: child.selectedPlan?.plan.name ?? '',
      paymentMethod: child.paymentMethod
        ?? (child.selectedPlan?.plan.requiresStandingOrder === false ? PaymentMethod.Cash : PaymentMethod.StandingOrder),
      registrationStatus: registration.status,
      yearStatus: child.status,
    })));

    return {
      yearId: year.id,
      yearNumber: year.yearNumber,
      isCurrent: year.id === this.activeYearId,
      registeredChildren: children.length,
      usedCapacity: children.filter((child) => child.yearStatus === RegistrationChildStatus.Active).length,
      maxChildCapacity: year.maxChildCapacity,
      oneTimeInsuranceAmount: year.oneTimeInsuranceAmount,
      plans: this.plansForYear(year.id),
      holidayPeriods: this.holidaysForYear(year.id),
      contractFileName: this.yearContracts.get(year.id)?.fileName ?? null,
      children,
    };
  }

  private currentYear(): Year {
    const year = this.years.get(this.activeYearId);
    if (!year) throw new Error('לא נמצאה שנת עבודה נוכחית.');
    return year;
  }

  private currentYearPlans(): AvailableYearPlan[] {
    return this.plansForYear(this.activeYearId);
  }

  private currentYearHolidayPeriods(): HolidayPeriod[] {
    return this.holidaysForYear(this.activeYearId);
  }

  private plansForYear(yearId: number): AvailableYearPlan[] {
    return this.yearPlans.get(yearId) ?? [];
  }

  private holidaysForYear(yearId: number): HolidayPeriod[] {
    return this.yearHolidayPeriods.get(yearId) ?? [];
  }

  private toAvailableYearPlans(plans: AdminYearCreateRequest['plans']): AvailableYearPlan[] {
    return plans.map((plan) => ({
      yearPlanId: this.nextYearPlanId++,
      plan: {
        id: plan.planId,
        name: plan.name,
        price: plan.price,
        hours: plan.hours,
        isActive: plan.isActive,
        requiresStandingOrder: plan.requiresStandingOrder,
      },
    }));
  }

  private toHolidayPeriods(yearId: number, holidayPeriods: AdminYearCreateRequest['holidayPeriods']): HolidayPeriod[] {
    return holidayPeriods
      .filter((holiday) => holiday.name || holiday.startDate || holiday.endDate)
      .map((holiday) => ({
        id: this.nextHolidayPeriodId++,
        yearId,
        name: holiday.name || 'חופשה',
        startDate: holiday.startDate,
        endDate: holiday.endDate,
      }));
  }

  private toAdminDocument(document: RegistrationDocument, coversChildren?: string[]): AdminDocument {
    return {
      id: document.id,
      type: document.documentType,
      fileName: document.fileName,
      reviewStatus: document.reviewStatus ?? null,
      coversChildren,
    };
  }

  private toMissingAdminDocument(registrationId: number, childId: number, document: MissingRegistrationDocument, index: number): AdminDocument {
    return {
      id: -((registrationId * 1000) + (childId * 10) + index + 1),
      type: document.documentType,
      fileName: null,
      reviewStatus: null,
    };
  }
}

function getMissingDocumentsForRegistration(
  registration: RegistrationState,
  uploadedDocuments: RegistrationDocument[],
  availablePlans: AvailableYearPlan[],
): MissingRegistrationDocument[] {
  return [
    ...getMissingByDocumentTypeForRegistration(registration, uploadedDocuments, availablePlans, DocumentType.SignedContract),
    ...getMissingByDocumentTypeForRegistration(registration, uploadedDocuments, availablePlans, DocumentType.StandingOrderApproval),
  ];
}

function getMissingByDocumentTypeForRegistration(
  registration: RegistrationState,
  uploadedDocuments: RegistrationDocument[],
  availablePlans: AvailableYearPlan[],
  documentType: DocumentType,
): MissingRegistrationDocument[] {
  const relevantChildren = documentType === DocumentType.StandingOrderApproval
    ? registration.children.filter((childState) => {
        const plan = availablePlans.find((yearPlan) => yearPlan.yearPlanId === childState.selectedPlan?.yearPlanId);
        return plan?.plan.requiresStandingOrder && childState.paymentMethod === PaymentMethod.StandingOrder;
      })
    : registration.children;

  if (!relevantChildren.length) return [];

  const hasSharedDocument = uploadedDocuments.some((document) => {
    return document.documentType === documentType && document.scope.kind === RegistrationDocumentScopeKind.AllChildren;
  });
  if (hasSharedDocument) return [];

  return relevantChildren
    .filter((child) => !uploadedDocuments.some((document) => {
      return document.documentType === documentType
        && document.scope.kind === RegistrationDocumentScopeKind.SpecificChild
        && document.scope.localChildId === child.id;
    }))
    .map((child) => ({
      documentType,
      scope: { kind: RegistrationDocumentScopeKind.SpecificChild, localChildId: child.id },
      label: `${documentType === DocumentType.SignedContract ? 'חוזה חתום' : 'אישור הוראת קבע'} - ${child.child.fullName}`,
    }));
}

function isSameDocumentRequirement(document: RegistrationDocument, documentType: DocumentType, scope: RegistrationDocumentScope): boolean {
  if (document.documentType !== documentType || document.scope.kind !== scope.kind) return false;
  return scope.kind === RegistrationDocumentScopeKind.AllChildren
    || (document.scope.kind === RegistrationDocumentScopeKind.SpecificChild && document.scope.localChildId === scope.localChildId);
}

function compareRegistrations(left: RegistrationState, right: RegistrationState): number {
  return (right.submittedAt ?? '').localeCompare(left.submittedAt ?? '') || right.id - left.id;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
