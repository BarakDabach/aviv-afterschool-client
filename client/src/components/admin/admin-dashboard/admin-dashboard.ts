import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBadgeCheck,
  lucideBanknote,
  lucideCheck,
  lucideChevronDown,
  lucideChevronUp,
  lucideCircleAlert,
  lucideClipboardList,
  lucideClock3,
  lucideFileText,
  lucideLandmark,
  lucideLoaderCircle,
  lucidePhone,
  lucideTrash2,
  lucideUsersRound,
} from '@ng-icons/lucide';
import { BrnCollapsibleImports } from '@spartan-ng/brain/collapsible';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AdminDashboardStore } from './admin-dashboard.store';

@Component({
  selector: 'app-admin-dashboard',
  imports: [NgClass, NgTemplateOutlet, NgIcon, BrnCollapsibleImports, HlmButtonImports],
  providers: [
    AdminDashboardStore,
    provideIcons({
      lucideBadgeCheck,
      lucideBanknote,
      lucideCheck,
      lucideChevronDown,
      lucideChevronUp,
      lucideCircleAlert,
      lucideClipboardList,
      lucideClock3,
      lucideFileText,
      lucideLandmark,
      lucideLoaderCircle,
      lucidePhone,
      lucideTrash2,
      lucideUsersRound,
    }),
  ],
  templateUrl: './admin-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard {
  protected readonly store = inject(AdminDashboardStore);
}
