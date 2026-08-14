import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarClock, lucideCheck } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { SelectionMark } from '../../../shared/selection-mark/selection-mark';
import { RegistrationStore } from '../../registration.store';

@Component({
  selector: 'app-plan-stage',
  imports: [NgIcon, NgClass, HlmButtonImports, HlmRadioGroupImports, SelectionMark],
  providers: [provideIcons({ lucideCalendarClock, lucideCheck })],
  templateUrl: './plan-stage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanStage {
  protected readonly store = inject(RegistrationStore);
}
