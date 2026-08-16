import type {
  AvailableYearPlan,
  ParentHome,
  RegistrationState,
  SubmitRegistrationRequest,
  UploadRegistrationDocumentRequest,
  Year,
} from '../types/registration-status.type';
import type { AuthenticatedUser } from '../types/auth.type';

export abstract class DataService {
  abstract getAuthOtpResendTimeoutSeconds(): Promise<number>;

  abstract getActiveRegistrationYear(): Promise<Year>;

  abstract getAvailableYearPlans(): Promise<AvailableYearPlan[]>;

  abstract getParentHome(parentEmail?: string): Promise<ParentHome>;

  abstract getSubmittedRegistration(registrationId: number): Promise<RegistrationState>;

  abstract getRegisteredParentByEmail(email: string): Promise<AuthenticatedUser | null>;

  abstract submitRegistration(request: SubmitRegistrationRequest): Promise<RegistrationState>;

  abstract uploadRegistrationDocument(request: UploadRegistrationDocumentRequest): Promise<RegistrationState>;
}
