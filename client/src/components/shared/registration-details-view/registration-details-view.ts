import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideChevronLeft,
  lucideClock3,
  lucideSave,
  lucideTrash2,
  lucideUpload,
  lucideUserRound,
  lucideUsersRound,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import {
  DocumentType,
  RegistrationDocumentScopeKind,
  RegistrationStatus,
  type MissingRegistrationDocument,
  type RegistrationChildState,
  type RegistrationDocument,
  type RegistrationState,
  type RegistrationStatusDisplay,
} from '../../../app/types/registration-status.type';

type ManageableDocument = MissingRegistrationDocument | RegistrationDocument;

const currencyFormatter = new Intl.NumberFormat('he-IL');

@Component({
  selector: 'app-registration-details-view',
  imports: [NgClass, NgIcon, RouterLink, HlmButtonImports],
  providers: [
    provideIcons({
      lucideCheck,
      lucideChevronLeft,
      lucideClock3,
      lucideSave,
      lucideTrash2,
      lucideUpload,
      lucideUserRound,
      lucideUsersRound,
    }),
  ],
  templateUrl: './registration-details-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationDetailsView {
  @Input({ required: true }) registration!: RegistrationState;
  @Input({ required: true }) status!: RegistrationStatusDisplay;
  @Input() backLink: string | unknown[] = '/home';
  @Input() backLabel = 'חזרה לבית שלי בצהרון';
  @Input() showBackLink = true;
  @Input() loading = false;
  @Input() allowDocumentUpload = true;
  @Input() hasSelectedMissingDocumentFiles = false;
  @Input() saveButtonLabel = 'שמירת מסמכים';
  @Input() savingButtonLabel = 'שומרים מסמכים';
  @Input() missingDocumentFileName: (document: ManageableDocument) => string = () => '';

  @Output() missingDocumentSelected = new EventEmitter<{ document: ManageableDocument; event: Event }>();
  @Output() missingDocumentRemoved = new EventEmitter<ManageableDocument>();
  @Output() missingDocumentsSaved = new EventEmitter<void>();

  protected readonly registrationStatus = RegistrationStatus;

  protected childNames(registration: RegistrationState): string {
    return registration.children.map((childState) => childState.child.fullName).join(' ו');
  }

  protected childCountLabel(registration: RegistrationState): string {
    return registration.children.length === 1 ? 'ילד אחד' : `${registration.children.length} ילדים`;
  }

  protected allergyLabel(childState: RegistrationChildState): string {
    const allergies = childState.child.allergies?.trim();

    return allergies ? `אלרגיות ורגישויות: ${allergies}` : '';
  }

  protected formatYear(yearNumber: number): string {
    return `תשפ״${yearNumber === 2027 ? 'ז' : yearNumber === 2026 ? 'ו' : 'ה'} · ${yearNumber - 1}/${yearNumber}`;
  }

  protected formattedChildPrice(finalPrice: number | null | undefined): string {
    return `₪ ${currencyFormatter.format(finalPrice ?? 0)}`;
  }

  protected documentTypeLabel(documentType: DocumentType): string {
    return documentType === DocumentType.SignedContract ? 'חוזה חתום' : 'אישור הוראת קבע';
  }

  protected documentScopeLabel(registration: RegistrationState, document: ManageableDocument): string {
    const scope = document.scope;

    if (scope.kind === RegistrationDocumentScopeKind.AllChildren) return 'כל הילדים';

    return registration.children.find((childState) => childState.child.id === scope.localChildId)?.child.fullName ?? 'ילד';
  }

  protected displayFileName(document: ManageableDocument): string {
    return this.missingDocumentFileName(document) || ('fileName' in document ? document.fileName : '');
  }

  protected canUploadDocuments(registration: RegistrationState): boolean {
    return this.allowDocumentUpload && registration.status === RegistrationStatus.WaitingForDocuments;
  }
}
