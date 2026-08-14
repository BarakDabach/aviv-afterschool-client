import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideClock, lucideShieldCheck, lucideUsersRound } from '@ng-icons/lucide';
import { RegistrationStore } from '../../registration.store';

@Component({
  selector: 'app-summary-stage',
  imports: [NgIcon, NgClass],
  providers: [provideIcons({ lucideCheck, lucideClock, lucideShieldCheck, lucideUsersRound })],
  templateUrl: './summary-stage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryStage {
  protected readonly store = inject(RegistrationStore);
}
