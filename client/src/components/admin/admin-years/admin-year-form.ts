import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, effect, inject, input, signal, untracked } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideFileUp,
  lucidePlus,
  lucideShield,
  lucideTrash2,
  lucideUsersRound,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { FocusNextOnEnterDirective } from '../../registration/focus-next-on-enter.directive';
import { AdminYearFormStore, type AdminYearFormMode, type AdminYearHolidayFormRow } from './admin-year-form.store';
import type { AdminYearView } from './admin-years.store';
import type { AdminYearsOverview } from '../../../app/types/admin.type';

@Component({
  selector: 'app-admin-year-form',
  imports: [
    NgClass,
    NgIcon,
    HlmButtonImports,
    HlmCardImports,
    HlmCheckboxImports,
    HlmDatePickerImports,
    HlmInputImports,
    FocusNextOnEnterDirective,
  ],
  providers: [
    AdminYearFormStore,
    provideIcons({
      lucideCalendar,
      lucideFileUp,
      lucidePlus,
      lucideShield,
      lucideTrash2,
      lucideUsersRound,
      lucideX,
    }),
  ],
  templateUrl: './admin-year-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminYearForm {
  readonly mode = input.required<AdminYearFormMode>();
  readonly currentYear = input.required<AdminYearView>();

  @Output() readonly saved = new EventEmitter<AdminYearsOverview>();
  @Output() readonly cancelled = new EventEmitter<void>();

  protected readonly store = inject(AdminYearFormStore);
  protected readonly fieldLabelClass = 'grid gap-[0.3rem] [&_span]:text-[length:var(--app-body-size)] [&_span]:text-foreground [&_input]:h-[var(--app-field-height)] [&_input]:rounded-[0.48rem] [&_input]:bg-[color-mix(in_oklch,var(--background)_74%,white)] [&_input]:text-center [&_input]:text-[length:var(--app-body-size)] [&_input]:text-foreground [&_input]:[direction:rtl] [&_input]:focus-visible:border-brand [&_input]:focus-visible:ring-2 [&_input]:focus-visible:ring-brand/20 [&_small]:min-h-4 [&_small]:text-[0.72rem] [&_small]:font-semibold [&_small]:text-destructive';
  protected readonly fieldErrorClass = '[&_input]:border-destructive [&_input]:focus-visible:border-destructive [&_input]:focus-visible:ring-destructive/20';
  protected readonly formatDateRange = (dates: [Date | null, Date | null]): string => {
    const [start, end] = dates;
    if (!start && !end) return '';
    if (start && !end) return this.formatDate(start);
    if (!start && end) return this.formatDate(end);
    return `${this.formatDate(start!)} - ${this.formatDate(end!)}`;
  };
  protected readonly parseDateRange = (value: string): [Date, Date] | null => {
    const [startValue, endValue] = value.split(' - ').map((part) => part.trim());
    const start = this.parseDate(startValue);
    const end = this.parseDate(endValue);
    return start && end ? [start, end] : null;
  };
  private readonly initializedKey = signal('');

  constructor() {
    effect(() => {
      const mode = this.mode();
      const currentYear = this.currentYear();
      const key = `${mode}-${currentYear.yearId}-${currentYear.yearNumber}-${currentYear.registeredChildren}`;

      untracked(() => {
        if (this.initializedKey() === key) return;

        this.store.initialize(mode, currentYear);
        this.initializedKey.set(key);
      });
    });
  }

  protected async submit(): Promise<void> {
    const overview = await this.store.submit(this.currentYear());
    if (overview) {
      this.saved.emit(overview);
    }
  }

  protected holidayDateRange(holiday: AdminYearHolidayFormRow): [Date, Date] | undefined {
    const start = this.parseDate(holiday.startDate);
    const end = this.parseDate(holiday.endDate);
    return start && end ? [start, end] : undefined;
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const normalizedValue = value.trim();
    const dottedDate = normalizedValue.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    const date = dottedDate
      ? new Date(Number(dottedDate[3]), Number(dottedDate[2]) - 1, Number(dottedDate[1]))
      : new Date(`${normalizedValue}T00:00:00`);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
