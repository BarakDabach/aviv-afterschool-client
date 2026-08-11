import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideClock, lucideShieldCheck, lucideUsersRound } from '@ng-icons/lucide';

@Component({
  selector: 'app-summary-stage',
  imports: [NgIcon],
  providers: [provideIcons({ lucideCheck, lucideClock, lucideShieldCheck, lucideUsersRound })],
  templateUrl: './summary-stage.html',
  styleUrl: '../stage-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryStage {}
