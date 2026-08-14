import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2, lucideUserRound } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { AllergyAnswer } from '../../../../app/types/registration-status.type';
import { ChildDetailsStageStore } from './child-details-stage.store';

@Component({
  selector: 'app-child-details-stage',
  imports: [FormField, NgIcon, NgClass, HlmButtonImports, HlmInputImports, HlmRadioGroupImports],
  providers: [ChildDetailsStageStore, provideIcons({ lucidePlus, lucideTrash2, lucideUserRound })],
  templateUrl: './child-details-stage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildDetailsStage {
  protected readonly store = inject(ChildDetailsStageStore);
  protected readonly allergyAnswer = AllergyAnswer;
}
