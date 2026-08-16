import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DataService {
  async getAuthOtpResendTimeoutSeconds(): Promise<number> {
    return 10;
  }
}
