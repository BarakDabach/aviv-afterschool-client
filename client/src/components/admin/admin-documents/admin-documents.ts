import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideChevronLeft,
  lucideClock3,
  lucideFileImage,
  lucideFileText,
  lucideShieldCheck,
  lucideUserRound,
  lucideUsersRound,
  lucideWalletCards,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-admin-documents',
  imports: [NgIcon, RouterLink, HlmButtonImports],
  providers: [
    provideIcons({
      lucideCheck,
      lucideChevronLeft,
      lucideClock3,
      lucideFileImage,
      lucideFileText,
      lucideShieldCheck,
      lucideUserRound,
      lucideUsersRound,
      lucideWalletCards,
      lucideX,
    }),
  ],
  templateUrl: './admin-documents.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDocuments {}
