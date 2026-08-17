import { inject, Injectable } from '@angular/core';
import { DataService } from '../services/data.service';
import type {
  AvailableYearPlan,
  ParentHome,
  RegistrationState,
  SubmitRegistrationRequest,
  UploadRegistrationDocumentRequest,
  Year,
} from '../types/registration-status.type';

@Injectable({ providedIn: 'root' })
export class ParentFacade {
  private readonly dataService = inject(DataService);

  getActiveRegistrationYear(): Promise<Year> {
    return this.dataService.getActiveRegistrationYear();
  }

  getAvailableYearPlans(): Promise<AvailableYearPlan[]> {
    return this.dataService.getAvailableYearPlans();
  }

  getParentHome(parentEmail?: string): Promise<ParentHome> {
    return this.dataService.getParentHome(parentEmail);
  }

  getSubmittedRegistration(registrationId: number): Promise<RegistrationState> {
    return this.dataService.getSubmittedRegistration(registrationId);
  }

  submitRegistration(request: SubmitRegistrationRequest): Promise<RegistrationState> {
    return this.dataService.submitRegistration(request);
  }

  uploadRegistrationDocument(request: UploadRegistrationDocumentRequest): Promise<RegistrationState> {
    return this.dataService.uploadRegistrationDocument(request);
  }
}
