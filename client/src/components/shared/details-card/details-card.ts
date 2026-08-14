import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-details-card',
  imports: [NgIcon],
  templateUrl: './details-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsCard {
  @Input({ required: true }) iconName = '';
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
}
