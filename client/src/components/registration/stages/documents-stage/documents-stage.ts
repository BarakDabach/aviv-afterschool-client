import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCamera, lucideFileUp, lucideShieldCheck } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-documents-stage',
  imports: [NgIcon, HlmButtonImports],
  providers: [provideIcons({ lucideCamera, lucideFileUp, lucideShieldCheck })],
  templateUrl: './documents-stage.html',
  styleUrl: '../stage-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsStage {}
