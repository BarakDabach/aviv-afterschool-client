import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-details-card',
  imports: [NgIcon, HlmButtonImports],
  templateUrl: './details-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsCard {
  @Input({ required: true }) iconName = '';
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
  @Input() actionLabel = '';
  @Input() actionAriaLabel = '';
  @Input() actionIconName = '';
  @Input() showAction = false;

  @Output() actionClicked = new EventEmitter<void>();
}
