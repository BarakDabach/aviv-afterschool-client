import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideFileUp } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { DocumentType, RegistrationDocumentScopeKind } from '../../../../app/types/registration-status.type';
import { DetailsCard } from '../../../shared/details-card/details-card';
import { RegistrationStore } from '../../registration.store';

@Component({
  selector: 'app-documents-stage',
  imports: [NgIcon, NgClass, HlmButtonImports, HlmRadioGroupImports, DetailsCard],
  providers: [provideIcons({ lucideDownload, lucideFileUp })],
  templateUrl: './documents-stage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsStage {
  protected readonly store = inject(RegistrationStore);
  protected readonly documentType = DocumentType;
  protected readonly scopeKind = RegistrationDocumentScopeKind;
}
