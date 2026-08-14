export enum RegistrationStatusKind {
  Draft = 'draft',
  PendingReview = 'pending_review',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum RegistrationStatusTone {
  Neutral = 'neutral',
  Warning = 'warning',
  Success = 'success',
  Danger = 'danger',
}

export type RegistrationStatus = {
  kind: RegistrationStatusKind;
  label: string;
  description: string;
  tone: RegistrationStatusTone;
  updatedAtIso: string;
};

export type RegistrationStatusProperties = Omit<RegistrationStatus, 'kind' | 'updatedAtIso'>;

export const REGISTRATION_STATUS_PROPERTIES: Record<RegistrationStatusKind, RegistrationStatusProperties> = {
  [RegistrationStatusKind.Draft]: {
    label: 'טיוטה נשמרה',
    description: 'שמרנו את פרטי ההרשמה שהוזנו עד עכשיו. אפשר לחזור מאוחר יותר ולהמשיך מאותה נקודה.',
    tone: RegistrationStatusTone.Neutral,
  },
  [RegistrationStatusKind.PendingReview]: {
    label: 'ממתינה לבדיקה',
    description: 'ההרשמה התקבלה ותמתין לבדיקה ידנית של צוות הצהרון.',
    tone: RegistrationStatusTone.Warning,
  },
  [RegistrationStatusKind.Approved]: {
    label: 'מאושרת',
    description: 'ההרשמה אושרה על ידי צוות הצהרון.',
    tone: RegistrationStatusTone.Success,
  },
  [RegistrationStatusKind.Rejected]: {
    label: 'דורשת עדכון',
    description: 'נדרש עדכון בפרטי ההרשמה לפני שנוכל להשלים את התהליך.',
    tone: RegistrationStatusTone.Danger,
  },
};

export enum RegistrationPlanId {
  Full = 'full',
  Three = 'three',
}

export enum AllergyAnswer {
  Yes = 'yes',
  No = 'no',
}

export type RegistrationChildDraft = {
  id: number;
  name: string;
  birthDate: string;
  allergyAnswer: AllergyAnswer;
  allergyDetails: string;
};

export type RegistrationDraftSnapshot = {
  activeStep: number;
  parentDetails: {
    fullName: string;
    phone: string;
  };
  children: RegistrationChildDraft[];
  selectedPlan: RegistrationPlanId;
  savedAtIso: string;
};
