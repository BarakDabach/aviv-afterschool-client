import { inject, Injectable } from '@angular/core';
import { DataService } from '../services/data.service';
import type {
  AvailableYearPlan,
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

  submitRegistration(request: SubmitRegistrationRequest): Promise<RegistrationState> {
    return this.dataService.submitRegistration(request);
  }

  uploadRegistrationDocument(request: UploadRegistrationDocumentRequest): Promise<RegistrationState> {
    return this.dataService.uploadRegistrationDocument(request);
  }
}
