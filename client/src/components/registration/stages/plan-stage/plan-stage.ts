import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarClock, lucideCheck } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { SelectionMark } from '../../../shared/selection-mark/selection-mark';

@Component({
  selector: 'app-plan-stage',
  imports: [NgIcon, HlmButtonImports, HlmRadioGroupImports, SelectionMark],
  providers: [provideIcons({ lucideCalendarClock, lucideCheck })],
  templateUrl: './plan-stage.html',
  styleUrl: '../stage-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanStage {
  protected selectedPlan = 'full';
}
