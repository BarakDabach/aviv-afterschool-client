import { NgClass } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

const currencyFormatter = new Intl.NumberFormat('he-IL');

@Component({
  selector: 'app-selection-card',
  imports: [NgClass],
  templateUrl: './selection-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block [direction:rtl]',
    dir: 'rtl',
  },
})
export class SelectionCard {
  @Input({ required: true }) title = '';
  @Input() description = '';
  @Input({ required: true }) price: string | number = '';
  @Input() priceMeta = '';
  @Input() ariaLabel = '';
  @Input({ transform: booleanAttribute }) selected = false;
  @Input({ transform: booleanAttribute }) selectable = true;

  @Output() selectedChange = new EventEmitter<void>();

  protected get cardStateClasses(): Record<string, boolean> {
    return {
      'border-brand bg-[color-mix(in_oklch,var(--surface-sage)_54%,white)] shadow-[0_0.4rem_1rem_color-mix(in_oklch,var(--brand)_12%,transparent)] motion-safe:scale-[1.01]': this.selected,
      'border-[color-mix(in_oklch,var(--border)_78%,var(--surface-warm))] bg-[color-mix(in_oklch,var(--surface-warm)_58%,white)] hover:border-[color-mix(in_oklch,var(--brand)_48%,var(--border))] hover:bg-[color-mix(in_oklch,var(--surface-warm)_42%,white)]': !this.selected,
      'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 active:scale-[0.99]': this.selectable,
    };
  }

  protected get displayPrice(): string {
    return typeof this.price === 'number' ? `₪${currencyFormatter.format(this.price)}` : this.price;
  }

  protected select(): void {
    this.selectedChange.emit();
  }
}
