import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideIdCard, lucidePhone, lucideShieldCheck, lucideUserRound } from '@ng-icons/lucide';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-parent-details-stage',
  imports: [NgIcon, HlmInputImports],
  providers: [provideIcons({ lucideIdCard, lucidePhone, lucideShieldCheck, lucideUserRound })],
  templateUrl: './parent-details-stage.html',
  styleUrl: '../stage-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentDetailsStage {}
