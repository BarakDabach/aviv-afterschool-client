import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendarClock, lucidePlus, lucideTrash2, lucideUserRound } from '@ng-icons/lucide';
import { BrnToggleGroupImports } from '@spartan-ng/brain/toggle-group';
import { provideNativeDateAdapter } from '@spartan-ng/brain/date-time';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { AllergyAnswer, Gender } from '../../../../app/types/registration-status.type';
import { DetailsCard } from '../../../shared/details-card/details-card';
import { SelectionCard } from '../../../shared/selection-card/selection-card';
import { ChildDetailsStageStore } from './child-details-stage.store';

@Component({
  selector: 'app-child-details-stage',
  imports: [
    FormField,
    NgIcon,
    NgClass,
    HlmButtonImports,
    HlmDatePickerImports,
    HlmInputImports,
    BrnToggleGroupImports,
    DetailsCard,
    SelectionCard,
  ],
  providers: [ChildDetailsStageStore, provideNativeDateAdapter(), provideIcons({ lucideCalendarClock, lucidePlus, lucideTrash2, lucideUserRound })],
  templateUrl: './child-details-stage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildDetailsStage {
  protected readonly store = inject(ChildDetailsStageStore);
  protected readonly allergyAnswer = AllergyAnswer;
  protected readonly gender = Gender;
}
