import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { provideIcons } from '@ng-icons/core';
import { lucideIdCard } from '@ng-icons/lucide';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { DetailCard } from '../../../shared/detail-card/detail-card';
import { ParentDetailsStageStore } from './parent-details-stage.store';

@Component({
  selector: 'app-parent-details-stage',
  imports: [NgClass, FormField, HlmInputImports, DetailCard],
  providers: [ParentDetailsStageStore, provideIcons({ lucideIdCard })],
  templateUrl: './parent-details-stage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentDetailsStage {
  protected readonly store = inject(ParentDetailsStageStore);
}
