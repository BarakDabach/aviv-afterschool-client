import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { provideNativeDateAdapter } from '@spartan-ng/brain/date-time';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';

let nextDatePickerId = 0;

@Component({
  selector: 'app-spartan-date-picker',
  imports: [HlmDatePickerImports],
  providers: [provideNativeDateAdapter()],
  templateUrl: './spartan-date-picker.html',
  styleUrl: './spartan-date-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpartanDatePicker {
  readonly value = input('');
  readonly placeholder = input('בחרו תאריך');
  readonly ariaLabel = input('בחירת תאריך');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly valueChange = output<string>();

  protected readonly inputId = `spartan-date-picker-${++nextDatePickerId}`;
  protected readonly maxDate = new Date();
  protected readonly defaultFocusedDate = new Date(2020, 0, 1);
  protected readonly selectedDate = computed(() => parseIsoDate(this.value()));
  protected readonly formatDate = formatDisplayDate;
  protected readonly formatInputDate = formatDisplayDate;
  protected readonly parseDate = parseDisplayDate;

  protected selectDate(date: Date | null): void {
    this.valueChange.emit(date ? formatIsoDate(date) : '');
  }
}

function parseIsoDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return isSameDateParts(date, Number(year), Number(month), Number(day)) ? date : undefined;
}

function parseDisplayDate(value: string): Date | null {
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return isSameDateParts(date, Number(year), Number(month), Number(day)) ? date : null;
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function isSameDateParts(date: Date, year: number, month: number, day: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
