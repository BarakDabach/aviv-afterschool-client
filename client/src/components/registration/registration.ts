import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideCheck, lucideChevronRight } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { RegistrationStatusTone } from '../../app/types/registration-status.type';
import { RegistrationDetailsView } from '../shared/registration-details-view/registration-details-view';
import { RegistrationStore } from './registration.store';
import { ChildDetailsStage } from './stages/child-details-stage/child-details-stage';
import { DocumentsStage } from './stages/documents-stage/documents-stage';
import { ParentDetailsStage } from './stages/parent-details-stage/parent-details-stage';

@Component({
  selector: 'app-registration',
  imports: [
    NgIcon,
    NgClass,
    RouterLink,
    HlmButtonImports,
    ParentDetailsStage,
    ChildDetailsStage,
    DocumentsStage,
    RegistrationDetailsView,
  ],
  providers: [RegistrationStore, provideIcons({ lucideArrowLeft, lucideCheck, lucideChevronRight })],
  templateUrl: './registration.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {
  protected readonly store = inject(RegistrationStore);
  protected readonly registrationStatusTone = RegistrationStatusTone;
}
