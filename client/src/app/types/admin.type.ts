import type {
  Gender,
  PaymentMethod,
  RegistrationChildStatus,
  RegistrationStatus,
} from './registration-status.type';

export type AdminQueue = 'waitingForDocuments' | 'pendingApproval';
export type AdminRegistrationStatus = 'WaitingForDocuments' | 'PendingApproval';
export type AdminBillingPeriod = 'Daily' | 'Monthly';
export type AdminDocumentType = 'SignedContract' | 'StandingOrderApproval';
export type AdminTone = 'brand' | 'warning' | 'success';

export interface AdminDocument {
  id: number;
  type: AdminDocumentType;
  fileName: string | null;
  reviewStatus: 'PendingReview' | 'Approved' | null;
  coversChildren?: string[];
}

export interface AdminChild {
  registrationChildId: number;
  fullName: string;
  gender: 'Boy' | 'Girl';
  planName: string;
  billingPeriod: AdminBillingPeriod;
  isCashOnly: boolean;
  documents: AdminDocument[];
}

export interface AdminRegistration {
  registrationId: number;
  status: AdminRegistrationStatus;
  parentFullName: string;
  parentPhoneNumber: string;
  uploadComplete: boolean;
  approvalReady: boolean;
  expanded: boolean;
  children: AdminChild[];
  sharedDocuments: AdminDocument[];
}

export interface AdminDashboardData {
  activeYear: number;
  totalRegistrations: number;
  registeredChildren: number;
  maxChildCapacity: number;
  registrations: AdminRegistration[];
}

export interface AdminYearChild {
  registrationId: number;
  registrationChildId: number;
  fullName: string;
  gender: Gender;
  parentPhoneNumber: string;
  planName: string;
  paymentMethod: PaymentMethod;
  registrationStatus: RegistrationStatus;
  yearStatus: RegistrationChildStatus;
}

export interface AdminYearSummary {
  yearId: number;
  yearNumber: number;
  isCurrent: boolean;
  registeredChildren: number;
  usedCapacity: number;
  maxChildCapacity: number;
  oneTimeInsuranceAmount: number;
  children: AdminYearChild[];
}

export interface AdminYearsOverview {
  currentYear: AdminYearSummary;
  historicalYears: AdminYearSummary[];
}

export interface AdminPaymentMethodRequest {
  registrationId: number;
  childId: number;
  isCashOnly: boolean;
}

export interface AdminDocumentActionRequest {
  registrationId: number;
  documentId: number;
}

export interface AdminRegistrationActionRequest {
  registrationId: number;
}
