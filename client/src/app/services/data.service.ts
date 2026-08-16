import type {
  AvailableYearPlan,
  RegistrationState,
  SubmitRegistrationRequest,
  Year,
} from '../types/registration-status.type';

export abstract class DataService {
  abstract getAuthOtpResendTimeoutSeconds(): Promise<number>;

  abstract getActiveRegistrationYear(): Promise<Year>;

  abstract getAvailableYearPlans(): Promise<AvailableYearPlan[]>;

  abstract submitRegistration(request: SubmitRegistrationRequest): Promise<RegistrationState>;
}
