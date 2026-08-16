import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { ParentFacade } from '../../app/facades/parent.facade';
import { GlobalStore } from '../../app/stores/global.store';
import {
  DocumentType,
  REGISTRATION_STATUS_DISPLAY,
  RegistrationDocumentScopeKind,
  RegistrationStatus,
  type HolidayPeriod,
  type MissingRegistrationDocument,
  type ParentHome,
  type RegistrationChildState,
  type RegistrationDocument,
  type RegistrationDocumentScope,
  type RegistrationSelectedFile,
  type RegistrationState,
  type RegistrationStatusDisplay,
} from '../../app/types/registration-status.type';

type ParentHomeState = {
  home: ParentHome | null;
  selectedRegistrationId: number | null;
  selectedRegistration: RegistrationState | null;
  selectedMissingDocumentFiles: RegistrationSelectedFile[];
  loading: boolean;
  error: string | null;
};

const currencyFormatter = new Intl.NumberFormat('he-IL');
const dateFormatter = new Intl.DateTimeFormat('he-IL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const ParentHomeStore = signalStore(
  withState<ParentHomeState>({
    home: null,
    selectedRegistrationId: null,
    selectedRegistration: null,
    selectedMissingDocumentFiles: [],
    loading: false,
    error: null,
  }),
  withProps(() => ({
    globalStore: inject(GlobalStore),
    parentFacade: inject(ParentFacade),
  })),
  withComputed(({ home, selectedMissingDocumentFiles, selectedRegistration, selectedRegistrationId, error }) => {
    const activeRegistration = computed(() => home()?.activeRegistration ?? null);
    const displayedRegistration = computed(() => selectedRegistration() ?? activeRegistration());
    const isDetailMode = computed(() => selectedRegistrationId() !== null);
    const parentFirstName = computed(() => home()?.parent.fullName.trim().split(/\s+/)[0] || 'דנה');
    const activeStatus = computed<RegistrationStatusDisplay>(() => {
      const registration = activeRegistration();

      return registration ? REGISTRATION_STATUS_DISPLAY[registration.status] : REGISTRATION_STATUS_DISPLAY[RegistrationStatus.PendingApproval];
    });
    const selectedStatus = computed<RegistrationStatusDisplay>(() => {
      const registration = displayedRegistration();

      return registration ? REGISTRATION_STATUS_DISPLAY[registration.status] : REGISTRATION_STATUS_DISPLAY[RegistrationStatus.PendingApproval];
    });
    const hasError = computed(() => error() !== null);

    return {
      activeRegistration,
      activeStatus,
      hasSelectedMissingDocumentFiles: computed(() => selectedMissingDocumentFiles().length > 0),
      displayedRegistration,
      hasError,
      isDetailMode,
      parentFirstName,
      selectedStatus,
      sharedDocumentLabel: computed(() => {
        const registration = activeRegistration();
        const hasSharedDocuments = registration?.documents.some((document) => document.scope.kind === RegistrationDocumentScopeKind.AllChildren);

        return hasSharedDocuments ? 'מסמכים משותפים' : '';
      }),
    };
  }),
  withMethods((store) => {
    const documentRequirementKey = (documentType: DocumentType, scope: RegistrationDocumentScope): string => {
      const scopeKey = scope.kind === RegistrationDocumentScopeKind.AllChildren
        ? RegistrationDocumentScopeKind.AllChildren
        : `${RegistrationDocumentScopeKind.SpecificChild}:${scope.localChildId}`;

      return `${documentType}:${scopeKey}`;
    };
    const documentScopeKey = (document: MissingRegistrationDocument | RegistrationDocument): string => {
      return documentRequirementKey(document.documentType, document.scope);
    };
    const selectedFileKey = (selectedFile: RegistrationSelectedFile): string => {
      return documentRequirementKey(selectedFile.documentType, selectedFile.scope);
    };
    const canManageRegistrationDocuments = (registration: RegistrationState): boolean => {
      return registration.status === RegistrationStatus.WaitingForDocuments || registration.status === RegistrationStatus.PendingApproval;
    };
    const replaceRegistration = (registration: RegistrationState): void => {
      const currentHome = store.home();

      if (!currentHome) {
        patchState(store, { selectedRegistration: registration });
        return;
      }

      patchState(store, {
        home: {
          ...currentHome,
          activeRegistration: currentHome.activeRegistration?.id === registration.id ? registration : currentHome.activeRegistration,
          registrationHistory: currentHome.registrationHistory.map((historyRegistration) => {
            return historyRegistration.id === registration.id ? registration : historyRegistration;
          }),
        },
        selectedRegistration: store.selectedRegistrationId() === registration.id ? registration : store.selectedRegistration(),
      });
    };

    return {
      async load(selectedRegistrationId: number | null): Promise<void> {
        patchState(store, {
          selectedRegistrationId,
          selectedMissingDocumentFiles: [],
          loading: true,
          error: null,
        });

        try {
          const home = await store.parentFacade.getParentHome(store.globalStore.email());
          const selectedRegistration = selectedRegistrationId === null
            ? null
            : home.registrationHistory.find((registration) => registration.id === selectedRegistrationId)
              ?? await store.parentFacade.getSubmittedRegistration(selectedRegistrationId);

          patchState(store, {
            home,
            selectedRegistration,
            loading: false,
          });
        } catch (error) {
          patchState(store, {
            loading: false,
            error: error instanceof Error ? error.message : 'לא הצלחנו לטעון את דף הבית.',
          });
        }
      },
      selectMissingDocumentFile(document: MissingRegistrationDocument | RegistrationDocument, event: Event): void {
        const registration = store.displayedRegistration();
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!registration || !canManageRegistrationDocuments(registration) || !file) return;

        const nextFile: RegistrationSelectedFile = {
          documentType: document.documentType,
          scope: document.scope,
          file,
        };
        const nextKey = selectedFileKey(nextFile);

        patchState(store, {
          selectedMissingDocumentFiles: [
            ...store.selectedMissingDocumentFiles().filter((selectedFile) => selectedFileKey(selectedFile) !== nextKey),
            nextFile,
          ],
          error: null,
        });

        input.value = '';
      },
      removeMissingDocumentFile(document: MissingRegistrationDocument | RegistrationDocument): void {
        const key = documentScopeKey(document);

        patchState(store, {
          selectedMissingDocumentFiles: store.selectedMissingDocumentFiles().filter((selectedFile) => selectedFileKey(selectedFile) !== key),
        });
      },
      async saveMissingDocuments(): Promise<void> {
        const registration = store.displayedRegistration();
        const selectedFiles = store.selectedMissingDocumentFiles();

        if (!registration || !canManageRegistrationDocuments(registration) || selectedFiles.length === 0) return;

        patchState(store, { loading: true, error: null });

        try {
          for (const selectedFile of selectedFiles) {
            const updatedRegistration = await store.parentFacade.uploadRegistrationDocument({
              registrationId: registration.id,
              documentType: selectedFile.documentType,
              scope: selectedFile.scope,
              file: selectedFile.file,
            });

            replaceRegistration(updatedRegistration);
            patchState(store, {
              selectedMissingDocumentFiles: store.selectedMissingDocumentFiles().filter((pendingFile) => selectedFileKey(pendingFile) !== selectedFileKey(selectedFile)),
            });
          }

          patchState(store, { loading: false });
        } catch (error) {
          patchState(store, {
            loading: false,
            error: error instanceof Error ? error.message : 'לא הצלחנו להעלות את המסמך.',
          });
        }
      },
      missingDocumentFileName(document: MissingRegistrationDocument | RegistrationDocument): string {
        const key = documentScopeKey(document);

        return store.selectedMissingDocumentFiles().find((selectedFile) => selectedFileKey(selectedFile) === key)?.file.name ?? '';
      },
      documentDisplayFileName(document: RegistrationDocument): string {
        return this.missingDocumentFileName(document) || document.fileName;
      },
      childNames(registration: RegistrationState): string {
        return registration.children.map((childState) => childState.child.fullName).join(' ו');
      },
      childCountLabel(registration: RegistrationState): string {
        const count = registration.children.length;

        return count === 1 ? 'ילד אחד' : `${count} ילדים`;
      },
      formattedSubtotal(registration: RegistrationState): string {
        const subtotal = registration.children.reduce((total, childState) => total + (childState.finalPrice ?? 0), 0);

        return `₪ ${currencyFormatter.format(subtotal)}`;
      },
      formattedChildPrice(finalPrice: number | null | undefined): string {
        return `₪ ${currencyFormatter.format(finalPrice ?? 0)}`;
      },
      allergyLabel(childState: RegistrationChildState): string {
        const allergies = childState.child.allergies?.trim();

        return allergies ? `אלרגיות ורגישויות: ${allergies}` : '';
      },
      formatYear(yearNumber: number): string {
        return `תשפ״${yearNumber === 2027 ? 'ז' : yearNumber === 2026 ? 'ו' : 'ה'} · ${yearNumber - 1}/${yearNumber}`;
      },
      statusLabel(registration: RegistrationState): string {
        return REGISTRATION_STATUS_DISPLAY[registration.status].label;
      },
      formatHolidayRange(period: HolidayPeriod): string {
        return `${dateFormatter.format(new Date(period.startDate))}-${dateFormatter.format(new Date(period.endDate))}`;
      },
      documentTypeLabel(documentType: DocumentType): string {
        return documentType === DocumentType.SignedContract ? 'חוזה חתום' : 'אישור הוראת קבע';
      },
      documentScopeLabel(registration: RegistrationState, document: MissingRegistrationDocument | RegistrationDocument): string {
        const scope = document.scope;

        if (scope.kind === RegistrationDocumentScopeKind.AllChildren) return 'כל הילדים';

        return registration.children.find((childState) => childState.child.id === scope.localChildId)?.child.fullName ?? 'ילד';
      },
    };
  }),
);
