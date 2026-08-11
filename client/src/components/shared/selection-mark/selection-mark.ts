import { booleanAttribute, ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';

@Component({
  selector: 'app-selection-mark',
  imports: [HlmRadioGroupImports],
  templateUrl: './selection-mark.html',
  styleUrl: './selection-mark.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionMark {
  @Input({ transform: booleanAttribute }) selected = false;

  @HostBinding('class.selected')
  protected get selectedClass(): boolean {
    return this.selected;
  }
}
