import { inject, Injectable } from '@angular/core';
import type {
  AdminDashboardData,
  AdminDocumentActionRequest,
  AdminPaymentMethodRequest,
  AdminRegistrationActionRequest,
} from '../types/admin.type';
import type { RegistrationState } from '../types/registration-status.type';
import { DataService } from '../services/data.service';

@Injectable({ providedIn: 'root' })
export class AdminFacade {
  private readonly dataService = inject(DataService);

  getDashboard(): Promise<AdminDashboardData> {
    return this.dataService.getAdminDashboard();
  }

  setPaymentMethod(request: AdminPaymentMethodRequest): Promise<RegistrationState> {
    return this.dataService.setAdminPaymentMethod(request);
  }

  approveDocument(request: AdminDocumentActionRequest): Promise<RegistrationState> {
    return this.dataService.approveAdminDocument(request);
  }

  approveRegistration(request: AdminRegistrationActionRequest): Promise<RegistrationState> {
    return this.dataService.approveAdminRegistration(request);
  }

  removeRegistration(request: AdminRegistrationActionRequest): Promise<void> {
    return this.dataService.removeAdminRegistration(request);
  }
}
