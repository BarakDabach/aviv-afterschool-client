import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideCalendarClock } from '@ng-icons/lucide';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { DetailsCard } from '../../../shared/details-card/details-card';
import { PaymentMethod } from '../../../../app/types/registration-status.type';
import { RegistrationStore } from '../../registration.store';

@Component({
  selector: 'app-plan-stage',
  imports: [NgClass, HlmRadioGroupImports, DetailsCard],
  providers: [provideIcons({ lucideCalendarClock })],
  templateUrl: './plan-stage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanStage {
  protected readonly store = inject(RegistrationStore);
  protected readonly paymentMethod = PaymentMethod;
}
