export enum RegistrationStatus {
  WaitingForDocuments = 'WaitingForDocuments',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
}

export enum RegistrationDraftStep {
  ParentDetails = 'ParentDetails',
  PlanSelection = 'PlanSelection',
  DocumentsUpload = 'DocumentsUpload',
}

export enum RegistrationStatusTone {
  Neutral = 'neutral',
  Warning = 'warning',
  Success = 'success',
  Danger = 'danger',
}

export type RegistrationStatusDisplay = {
  label: string;
  description: string;
  tone: RegistrationStatusTone;
};

export const REGISTRATION_STATUS_DISPLAY: Record<RegistrationStatus, RegistrationStatusDisplay> = {
  [RegistrationStatus.WaitingForDocuments]: {
    label: 'ממתינה למסמכים',
    description: 'ההרשמה ממתינה להשלמת המסמכים החסרים על ידי ההורה.',
    tone: RegistrationStatusTone.Warning,
  },
  [RegistrationStatus.PendingApproval]: {
    label: 'ממתינה לאישור',
    description: 'ההרשמה והמסמכים התקבלו ותמתין לבדיקה ידנית של צוות הצהרון.',
    tone: RegistrationStatusTone.Warning,
  },
  [RegistrationStatus.Approved]: {
    label: 'מאושרת',
    description: 'ההרשמה אושרה על ידי צוות הצהרון.',
    tone: RegistrationStatusTone.Success,
  },
  [RegistrationStatus.Rejected]: {
    label: 'נדחתה',
    description: 'ההרשמה נבדקה ולא אושרה במתכונתה הנוכחית.',
    tone: RegistrationStatusTone.Danger,
  },
  [RegistrationStatus.Cancelled]: {
    label: 'בוטלה',
    description: 'ההרשמה בוטלה, והנתונים נשמרים לצפייה בלבד.',
    tone: RegistrationStatusTone.Neutral,
  },
};

export const LOCAL_DRAFT_STATUS_DISPLAY: RegistrationStatusDisplay = {
  label: 'טיוטה נשמרה',
  description: 'שמרנו את פרטי ההרשמה שהוזנו עד עכשיו. אפשר לחזור מאוחר יותר ולהמשיך מאותה נקודה.',
  tone: RegistrationStatusTone.Neutral,
};

export enum Gender {
  Female = 'Female',
  Male = 'Male',
}

export enum AllergyAnswer {
  Yes = 'yes',
  No = 'no',
}

export enum DocumentType {
  SignedContract = 'SignedContract',
  StandingOrderApproval = 'StandingOrderApproval',
}

export enum DocumentReviewStatus {
  PendingReview = 'PendingReview',
  Approved = 'Approved',
}

export enum PaymentMethod {
  Cash = 'Cash',
  StandingOrder = 'StandingOrder',
}

export enum RegistrationDocumentScopeKind {
  AllChildren = 'AllChildren',
  SpecificChild = 'SpecificChild',
}

export type RegistrationDocumentScope =
  | {
      kind: RegistrationDocumentScopeKind.AllChildren;
    }
  | {
      kind: RegistrationDocumentScopeKind.SpecificChild;
      localChildId: number;
    };

export interface Parent {
  id: number;
  fullName: string;
  phoneNumber: string;
}

export interface ParentRegistrationDetails extends Parent {
  email: string;
}

export interface Child {
  id: number;
  fullName: string;
  uniqueId: string;
  dateOfBirth: string;
  gender: Gender;
  allergies?: string | null;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  hours: string;
  isActive: boolean;
  requiresStandingOrder: boolean;
}

export interface Year {
  id: number;
  yearNumber: number;
  maxChildCapacity: number;
  oneTimeInsuranceAmount: number;
}

export interface HolidayPeriod {
  id: number;
  yearId: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface AvailableYearPlan {
  yearPlanId: number;
  plan: Plan;
}

export interface SelectedYearPlan {
  yearPlanId: number;
  plan: Plan;
}

export enum RegistrationChildStatus {
  Active = 'Active',
  Left = 'Left',
}

export interface RegistrationChildState {
  id: number;
  child: Child;
  selectedPlan: SelectedYearPlan | null;
  status: RegistrationChildStatus;
  paymentMethod?: PaymentMethod;
  leaveDate?: string | null;
  appliedDiscountPercent?: number;
  finalPrice?: number;
}

export interface RegistrationDocument {
  id: number;
  fileName: string;
  mimeType: string;
  documentType: DocumentType;
  scope: RegistrationDocumentScope;
  uploadedAt: string;
  reviewStatus?: DocumentReviewStatus;
  reviewedAt?: string | null;
}

export interface RegistrationState {
  id: number;
  year: Year;
  status: RegistrationStatus;
  parent: ParentRegistrationDetails;
  children: RegistrationChildState[];
  documents: RegistrationDocument[];
  missingDocuments: MissingRegistrationDocument[];
  createdAt?: string;
  submittedAt?: string;
}

export interface ParentHome {
  parent: Parent;
  activeRegistration: RegistrationState | null;
  registrationHistory: RegistrationState[];
  holidayPeriods: HolidayPeriod[];
}

export interface RegistrationChildDraft {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  allergyAnswer: AllergyAnswer;
  allergyDetails: string;
  selectedYearPlanId: number | null;
  paymentMethod?: PaymentMethod;
}

export interface RegistrationDocumentDraft {
  documentType: DocumentType;
  scope: RegistrationDocumentScope;
  fileName: string | null;
  mimeType: string | null;
  updatedAt: string;
}

export interface RegistrationDraft {
  year: Year;
  currentStep: RegistrationDraftStep;
  parentDetails: ParentRegistrationDetails;
  children: RegistrationChildDraft[];
  documentScopeChoices: Record<DocumentType, RegistrationDocumentScopeKind>;
  documents: RegistrationDocumentDraft[];
  updatedAt: string;
}

export interface MissingRegistrationDocument {
  documentType: DocumentType;
  scope: RegistrationDocumentScope;
  label: string;
}

export interface SubmitRegistrationRequest {
  draft: RegistrationDraft;
  selectedFiles: RegistrationSelectedFile[];
}

export interface RegistrationSelectedFile {
  documentType: DocumentType;
  scope: RegistrationDocumentScope;
  file: File;
}

export interface UploadRegistrationDocumentRequest extends RegistrationSelectedFile {
  registrationId: number;
}
