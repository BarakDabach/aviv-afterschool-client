import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarDays, lucideCopy, lucidePencil, lucidePlus, lucideShield, lucideUsersRound } from '@ng-icons/lucide';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { AdminSummaryCards, type AdminSummaryCard } from '../admin-summary-cards/admin-summary-cards';
import { AdminYearChildren } from './admin-year-children';
import type { AdminYearView } from './admin-years.store';

type AdminYearSummaryCards = {
  year: AdminYearView;
  cards: readonly AdminSummaryCard[];
};

@Component({
  selector: 'app-admin-years-mobile',
  imports: [
    AdminYearChildren,
    NgIcon,
    HlmAccordionImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmEmptyImports,
    AdminSummaryCards,
  ],
  providers: [provideIcons({ lucideCalendarDays, lucideCopy, lucidePencil, lucidePlus, lucideShield, lucideUsersRound })],
  templateUrl: './admin-years-mobile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminYearsMobile {
  readonly currentYear = input.required<AdminYearView>();
  readonly historicalYears = input.required<AdminYearView[]>();
  @Output() readonly createYear = new EventEmitter<void>();
  @Output() readonly duplicateYear = new EventEmitter<void>();
  @Output() readonly editYear = new EventEmitter<void>();

  readonly currentYearSummaryCards = computed<readonly AdminSummaryCard[]>(() => buildYearSummaryCards(this.currentYear(), true));
  readonly historicalYearsSummaryCards = computed<readonly AdminYearSummaryCards[]>(() =>
    this.historicalYears().map((year) => ({
      year,
      cards: buildYearSummaryCards(year, false),
    })),
  );

  protected requestCreateYear(): void {
    this.createYear.emit();
  }

  protected requestDuplicateYear(): void {
    this.duplicateYear.emit();
  }

  protected requestEditYear(): void {
    this.editYear.emit();
  }
}

function buildYearSummaryCards(year: AdminYearView, isCurrent: boolean): AdminSummaryCard[] {
  return [
    {
      value: year.label,
      label: 'שנת לימודים',
      detail: isCurrent ? 'השנה הנוכחית' : 'שנה קודמת',
      icon: 'lucideCalendarDays',
      tone: 'brand',
      leftToRight: true,
    },
    {
      value: year.registeredChildren.toString(),
      label: 'ילדים',
      detail: 'מספר הרשמה',
      icon: 'lucideUsersRound',
    },
    {
      value: `${year.usedCapacity}/${year.maxChildCapacity}`,
      label: 'קיבולת',
      detail: 'שיעור תפוסה',
      icon: 'lucideUsersRound',
      leftToRight: true,
    },
    {
      value: `₪${year.oneTimeInsuranceAmount}`,
      label: 'ביטוח לילד',
      detail: 'סכום חד פעמי',
      icon: 'lucideShield',
      leftToRight: true,
    },
  ];
}
