import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideDownload, lucideFileText, lucideUserRound } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-agreements-stage',
  imports: [NgIcon, HlmButtonImports, HlmCheckboxImports, HlmInputImports],
  providers: [provideIcons({ lucideCheck, lucideDownload, lucideFileText, lucideUserRound })],
  templateUrl: './agreements-stage.html',
  styleUrl: '../stage-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgreementsStage {}
