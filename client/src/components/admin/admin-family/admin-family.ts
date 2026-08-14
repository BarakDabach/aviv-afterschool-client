import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCheck,
  lucideChevronLeft,
  lucideClock3,
  lucideFileText,
  lucideListChecks,
  lucideSettings,
  lucideShieldCheck,
  lucideTrash2,
  lucideUserRound,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-admin-family',
  imports: [NgIcon, RouterLink, HlmButtonImports],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCheck,
      lucideChevronLeft,
      lucideClock3,
      lucideFileText,
      lucideListChecks,
      lucideSettings,
      lucideShieldCheck,
      lucideTrash2,
      lucideUserRound,
    }),
  ],
  templateUrl: './admin-family.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFamily {}
