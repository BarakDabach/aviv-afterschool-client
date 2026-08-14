export type RegistrationStatusKind = 'draft' | 'pending_review' | 'approved' | 'rejected';

export type RegistrationStatusTone = 'neutral' | 'warning' | 'success' | 'danger';

export type RegistrationStatus = {
  kind: RegistrationStatusKind;
  label: string;
  description: string;
  tone: RegistrationStatusTone;
  updatedAtIso: string;
};

export type RegistrationStatusProperties = Omit<RegistrationStatus, 'kind' | 'updatedAtIso'>;

export const REGISTRATION_STATUS_PROPERTIES: Record<RegistrationStatusKind, RegistrationStatusProperties> = {
  draft: {
    label: 'טיוטה נשמרה',
    description: 'שמרנו את פרטי ההרשמה שהוזנו עד עכשיו. אפשר לחזור מאוחר יותר ולהמשיך מאותה נקודה.',
    tone: 'neutral',
  },
  pending_review: {
    label: 'ממתינה לבדיקה',
    description: 'ההרשמה התקבלה ותמתין לבדיקה ידנית של צוות הצהרון.',
    tone: 'warning',
  },
  approved: {
    label: 'מאושרת',
    description: 'ההרשמה אושרה על ידי צוות הצהרון.',
    tone: 'success',
  },
  rejected: {
    label: 'דורשת עדכון',
    description: 'נדרש עדכון בפרטי ההרשמה לפני שנוכל להשלים את התהליך.',
    tone: 'danger',
  },
};

export type RegistrationPlanId = 'full' | 'three';

export type RegistrationChildDraft = {
  id: number;
  name: string;
  birthDate: string;
  allergyAnswer: string;
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
