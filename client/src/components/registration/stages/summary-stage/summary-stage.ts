import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideClock, lucideInfo, lucideShieldCheck, lucideUserRound } from '@ng-icons/lucide';
import {
  DocumentType,
  RegistrationDocumentScopeKind,
  RegistrationStatus,
  RegistrationStatusTone,
  type MissingRegistrationDocument,
  type RegistrationChildState,
  type RegistrationDocument,
  type RegistrationState,
} from '../../../../app/types/registration-status.type';
import { RegistrationStore } from '../../registration.store';

@Component({
  selector: 'app-summary-stage',
  imports: [NgIcon, NgClass],
  providers: [provideIcons({ lucideCheck, lucideClock, lucideInfo, lucideShieldCheck, lucideUserRound })],
  templateUrl: './summary-stage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryStage {
  protected readonly store = inject(RegistrationStore);
  protected readonly registrationStatus = RegistrationStatus;
  protected readonly registrationStatusTone = RegistrationStatusTone;
  protected readonly documentType = DocumentType;

  protected hasMissingDocument(registration: RegistrationState, documentType: DocumentType): boolean {
    return registration.missingDocuments.some((document) => document.documentType === documentType);
  }

  protected documentStatusText(registration: RegistrationState, documentType: DocumentType): string {
    if (!this.hasMissingDocument(registration, documentType)) return 'הושלם';

    return 'ממתין להעלאת מסמך';
  }

  protected documentTypeLabel(documentType: DocumentType): string {
    return documentType === DocumentType.SignedContract ? 'חוזה וחתימה' : 'אישור הוראת קבע';
  }

  protected allergyLabel(childState: RegistrationChildState): string {
    const allergies = childState.child.allergies?.trim();

    return allergies ? `אלרגיות ורגישויות: ${allergies}` : '';
  }

  protected documentScopeLabel(registration: RegistrationState, document: RegistrationDocument | MissingRegistrationDocument): string {
    const scope = document.scope;

    if (scope.kind === RegistrationDocumentScopeKind.AllChildren) return '';

    return registration.children.find((childState) => childState.child.id === scope.localChildId)?.child.fullName ?? '';
  }
}
