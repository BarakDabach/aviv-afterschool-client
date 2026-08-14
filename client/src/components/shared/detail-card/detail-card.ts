import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-detail-card',
  imports: [NgIcon],
  templateUrl: './detail-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCard {
  @Input({ required: true }) iconName = '';
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
}
