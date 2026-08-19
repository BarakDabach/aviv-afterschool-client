import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePhone, lucideUsersRound } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import type { AdminYearChildView } from './admin-years.store';

@Component({
  selector: 'app-admin-year-children',
  imports: [NgClass, NgIcon, HlmBadgeImports, HlmCardImports, HlmEmptyImports, HlmSeparatorImports],
  providers: [provideIcons({ lucidePhone, lucideUsersRound })],
  templateUrl: './admin-year-children.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminYearChildren {
  readonly children = input.required<AdminYearChildView[]>();
  readonly layout = input<'mobile' | 'desktop'>('mobile');
  readonly insetEmpty = input(false);
}
