import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBaby, lucideCheck, lucideDownload, lucideFileText, lucideUserRound } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-agreements-stage',
  imports: [NgIcon, HlmButtonImports],
  providers: [provideIcons({ lucideBaby, lucideCheck, lucideDownload, lucideFileText, lucideUserRound })],
  templateUrl: './agreements-stage.html',
  styleUrl: '../stage-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgreementsStage {}
