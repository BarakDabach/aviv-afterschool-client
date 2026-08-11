import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideIdCard, lucidePhone, lucidePlus, lucideShieldCheck, lucideUserRound } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-parent-details-stage',
  imports: [NgIcon, HlmButtonImports, HlmInputImports],
  providers: [provideIcons({ lucideIdCard, lucidePhone, lucidePlus, lucideShieldCheck, lucideUserRound })],
  templateUrl: './parent-details-stage.html',
  styleUrl: '../stage-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentDetailsStage {
  protected showExtraContact = false;
}
