import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable()
export class MockDataService extends DataService {
  override async getAuthOtpResendTimeoutSeconds(): Promise<number> {
    return 10;
  }
}
