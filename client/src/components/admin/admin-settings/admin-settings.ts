import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideChevronLeft,
  lucideFileText,
  lucideListChecks,
  lucideMinus,
  lucidePencil,
  lucidePlus,
  lucideSave,
  lucideSettings,
  lucideUserRound,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-admin-settings',
  imports: [NgIcon, RouterLink, HlmButtonImports],
  providers: [
    provideIcons({
      lucideCheck,
      lucideChevronLeft,
      lucideFileText,
      lucideListChecks,
      lucideMinus,
      lucidePencil,
      lucidePlus,
      lucideSave,
      lucideSettings,
      lucideUserRound,
    }),
  ],
  templateUrl: './admin-settings.html',
  styleUrl: '../admin-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettings {}
