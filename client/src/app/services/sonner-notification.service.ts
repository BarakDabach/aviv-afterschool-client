import { Injectable } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { NotificationService } from './notification.service';

@Injectable()
export class SonnerNotificationService extends NotificationService {
  override success(message: string): void {
    toast.success(message);
  }

  override info(message: string): void {
    toast(message);
  }

  override warning(message: string): void {
    toast.warning(message);
  }

  override error(message: string): void {
    toast.error(message);
  }
}
