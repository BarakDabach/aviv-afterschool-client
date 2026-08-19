import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

export type AdminSummaryCardTone = 'brand' | 'warning' | 'success' | 'danger' | 'neutral';

export type AdminSummaryCard = {
  value: string;
  label: string;
  detail: string;
  icon: string;
  tone?: AdminSummaryCardTone;
  leftToRight?: boolean;
};

@Component({
  selector: 'app-admin-summary-cards',
  imports: [NgClass, NgIcon],
  templateUrl: './admin-summary-cards.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSummaryCards {
  readonly cards = input.required<readonly AdminSummaryCard[]>();
  readonly containerClass = input('grid grid-cols-2 gap-3 lg:grid-cols-4');
  readonly valueClass = input('text-[length:var(--app-card-title-size)]');
}
