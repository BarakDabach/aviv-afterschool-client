import { booleanAttribute, ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';

@Component({
  selector: 'app-selection-mark',
  imports: [HlmRadioGroupImports],
  templateUrl: './selection-mark.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionMark {
  @Input({ transform: booleanAttribute }) selected = false;

  @HostBinding('class')
  protected get hostClasses(): string {
    const base =
      'inline-grid aspect-square h-[var(--app-selection-size)] min-h-[var(--app-selection-size)] w-[var(--app-selection-size)] min-w-[var(--app-selection-size)] flex-none place-items-center rounded-full bg-transparent transition-[border-color,background,box-shadow] duration-150';
    const idle = 'border-2 border-[color-mix(in_oklch,var(--brand)_70%,white)]';
    const selected = 'border-[0.35rem] border-[color-mix(in_oklch,var(--surface-sage)_70%,white)] bg-brand shadow-[0_0_0_1px_var(--brand)]';

    return `${base} ${this.selected ? selected : idle}`;
  }
}
