import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendarDays,
  lucideCheck,
  lucideClock3,
  lucideFolderOpen,
  lucideListChecks,
  lucideSearch,
  lucideSettings,
  lucideShieldCheck,
  lucideUserRound,
  lucideUsersRound,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-admin-dashboard',
  imports: [NgIcon, RouterLink, HlmButtonImports, HlmInputImports],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCalendarDays,
      lucideCheck,
      lucideClock3,
      lucideFolderOpen,
      lucideListChecks,
      lucideSearch,
      lucideSettings,
      lucideShieldCheck,
      lucideUserRound,
      lucideUsersRound,
    }),
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: '../admin-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard {}
