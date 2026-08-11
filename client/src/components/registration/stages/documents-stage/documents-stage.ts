import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCamera, lucideCheck, lucideFile, lucideFileUp, lucideLink, lucideShieldCheck } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';

@Component({
  selector: 'app-documents-stage',
  imports: [NgIcon, HlmButtonImports, HlmCheckboxImports],
  providers: [provideIcons({ lucideCamera, lucideCheck, lucideFile, lucideFileUp, lucideLink, lucideShieldCheck })],
  templateUrl: './documents-stage.html',
  styleUrl: '../stage-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsStage {}
