import { computed, effect, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { AuthFacade } from '../../app/facades/auth.facade';
import { ParentFacade } from '../../app/facades/parent.facade';
import { GlobalStore } from '../../app/stores/global.store';
import {
  AllergyAnswer,
  DocumentType,
  Gender,
  LOCAL_DRAFT_STATUS_DISPLAY,
  REGISTRATION_STATUS_DISPLAY,
  RegistrationDocumentScopeKind,
  RegistrationDraftStep,
  RegistrationStatus,
  type AvailableYearPlan,
  type ParentRegistrationDetails,
  type RegistrationChildDraft,
  type RegistrationDocumentDraft,
  type RegistrationDocumentScope,
  type RegistrationSelectedFile,
  type RegistrationState,
  type RegistrationStatusDisplay,
  type MissingRegistrationDocument,
  type Year,
} from '../../app/types/registration-status.type';
import { isValidEmail } from '../../app/utils/email.validation';
import { isValidIsraeliMobilePhone } from '../shared/validations/phone.validation';
import { hasMinimumTrimmedLength } from '../shared/validations/text.validation';

type RegistrationStep = {
  index: number;
  draftStep: RegistrationDraftStep | 'SubmittedSummary';
  label: string;
};

type RegistrationFlowState = {
  activeStep: number;
  year: Year;
  enteredParentDetails: ParentRegistrationDetails;
  children: RegistrationChildDraft[];
  childDetailsValid: boolean;
  nextChildId: number;
  availableYearPlans: AvailableYearPlan[];
  documentScopeChoices: Record<DocumentType, RegistrationDocumentScopeKind>;
  documents: RegistrationDocumentDraft[];
  selectedFiles: RegistrationSelectedFile[];
  savedDraft: RegistrationDraftSnapshot | null;
  submittedRegistration: RegistrationState | null;
  loading: boolean;
  error: string | null;
};

type RegistrationDraftSnapshot = {
  year: Year;
  currentStep: RegistrationDraftStep;
  parentDetails: ParentRegistrationDetails;
  children: RegistrationChildDraft[];
  documentScopeChoices: Record<DocumentType, RegistrationDocumentScopeKind>;
  documents: RegistrationDocumentDraft[];
  updatedAt: string;
};

const fallbackYear: Year = {
  id: 0,
  yearNumber: 2027,
};

const currencyFormatter = new Intl.NumberFormat('he-IL');

const createEmptyRegistrationChild = (id: number, selectedYearPlanId: number | null = null): RegistrationChildDraft => ({
  id,
  fullName: '',
  dateOfBirth: '',
  gender: Gender.Female,
  allergyAnswer: AllergyAnswer.No,
  allergyDetails: '',
  selectedYearPlanId,
});

const createEmptyParentDetails = (): ParentRegistrationDetails => ({
  id: 0,
  fullName: '',
  phoneNumber: '',
  email: '',
});

export const RegistrationStore = signalStore(
  withState<RegistrationFlowState>({
    activeStep: 0,
    year: fallbackYear,
    enteredParentDetails: createEmptyParentDetails(),
    children: [createEmptyRegistrationChild(1)],
    childDetailsValid: false,
    nextChildId: 2,
    availableYearPlans: [],
    documentScopeChoices: {
      [DocumentType.SignedContract]: RegistrationDocumentScopeKind.AllChildren,
      [DocumentType.StandingOrderApproval]: RegistrationDocumentScopeKind.AllChildren,
    },
    documents: [],
    selectedFiles: [],
    savedDraft: null,
    submittedRegistration: null,
    loading: false,
    error: null,
  }),
  withProps(() => ({
    authFacade: inject(AuthFacade),
    globalStore: inject(GlobalStore),
    parentFacade: inject(ParentFacade),
    registrationDraftStorageKey: 'aviv-registration-draft',
    steps: [
      { index: 0, draftStep: RegistrationDraftStep.ParentDetails, label: 'הורה' },
      { index: 1, draftStep: RegistrationDraftStep.PlanSelection, label: 'מסלולים' },
      { index: 2, draftStep: RegistrationDraftStep.DocumentsUpload, label: 'מסמכים' },
      { index: 3, draftStep: 'SubmittedSummary', label: 'סיכום' },
    ] satisfies RegistrationStep[],
  })),
  withComputed(({
    activeStep,
    availableYearPlans,
    childDetailsValid,
    children,
    documentScopeChoices,
    documents,
    enteredParentDetails,
    error,
    loading,
    savedDraft,
    selectedFiles,
    submittedRegistration,
    steps,
    year,
  }) => {
    const parentDetails = computed(() => enteredParentDetails());
    const childCountLabel = computed(() => {
      const childCount = children().length;

      if (childCount === 0) return 'אין ילדים';

      return childCount === 1 ? 'ילד אחד' : `${childCount} ילדים`;
    });
    const parentDetailsValid = computed(() => {
      const parent = parentDetails();

      return hasMinimumTrimmedLength(parent.fullName, 2)
        && isValidIsraeliMobilePhone(parent.phoneNumber)
        && isValidEmail(parent.email);
    });
    const plansLoaded = computed(() => availableYearPlans().length > 0);
    const plansSelected = computed(() => children().every((child) => child.selectedYearPlanId !== null));
    const canSubmit = computed(() => parentDetailsValid() && childDetailsValid() && plansSelected() && !loading());
    const primaryDisabled = computed(() => {
      if (loading()) return true;
      if (activeStep() === 0) return !parentDetailsValid();
      if (activeStep() === 1) return !childDetailsValid() || !plansSelected() || !plansLoaded();

      return false;
    });
    const familyTitle = computed(() => {
      const parentName = parentDetails().fullName.trim();
      const familyName = parentName.split(/\s+/).at(-1);

      return familyName ? `משפחת ${familyName}` : 'פרטי משפחה';
    });
    const childrenSummary = computed(() => {
      const childSummaries = children().map((child, index) => {
        const plan = availableYearPlans().find((yearPlan) => yearPlan.yearPlanId === child.selectedYearPlanId);
        const childName = child.fullName.trim() || `ילד ${index + 1}`;

        return `${childName} · ${plan?.plan.name ?? 'לא נבחר מסלול'}`;
      });

      return childSummaries.join(', ');
    });
    const activeVisibleStepIndex = computed(() => activeStep());
    const visibleStepNumber = computed(() => activeStep() + 1);
    const backLabel = computed(() => {
      if (activeStep() <= 0) return 'חזרה';
      if (activeStep() === steps.length - 1) return 'יציאה';

      return `חזרה ל${steps[activeStep() - 1].label}`;
    });
    const primaryLabel = computed(
      () =>
        [
          'המשך למסלולים',
          'המשך למסמכים',
          loading() ? 'שולחים הרשמה' : 'שליחת ההרשמה',
          'חזרה לעמוד הראשי',
        ][activeStep()],
    );
    const registrationStatus = computed<RegistrationStatusDisplay>(() => {
      const submitted = submittedRegistration();

      if (submitted) return REGISTRATION_STATUS_DISPLAY[submitted.status];
      if (savedDraft()) return LOCAL_DRAFT_STATUS_DISPLAY;

      return REGISTRATION_STATUS_DISPLAY[RegistrationStatus.PendingApproval];
    });
    const stepTitle = computed(() => {
      if (activeStep() === steps.length - 1) {
        const firstName = parentDetails().fullName.trim().split(/\s+/)[0];

        return firstName ? `שלום ${firstName}` : 'שלום';
      }

      return ['פרטי ההורה', 'בחירת מסלולים', 'העלאת מסמכים'][activeStep()];
    });
    const stepDescription = computed(() => {
      if (activeStep() === steps.length - 1) return '';

      return [
        'עדכנו את פרטי ההורה שישמש כאיש הקשר הראשי להרשמה.',
        'מלאו את פרטי הילדים ובחרו מסלול נפרד לכל ילד.',
        'אפשר להעלות מסמכים עכשיו או לשלוח את ההרשמה ולהשלים אותם מאוחר יותר.',
      ][activeStep()];
    });
    const contractScope = computed(() => documentScopeChoices()[DocumentType.SignedContract]);
    const standingOrderScope = computed(() => documentScopeChoices()[DocumentType.StandingOrderApproval]);
    const selectedFileCount = computed(() => selectedFiles().length);
    const uploadedDraftDocuments = computed(() => documents().filter((document) => document.fileName));
    const submittedSubtotal = computed(() => {
      const submitted = submittedRegistration();

      if (submitted) {
        return submitted.children.reduce((total, child) => total + (child.finalPrice ?? 0), 0);
      }

      return children().reduce((total, child, index) => {
        const price = availableYearPlans().find((yearPlan) => yearPlan.yearPlanId === child.selectedYearPlanId)?.plan.price ?? 0;

        return total + Math.round(price * (index === 1 ? 0.9 : 1));
      }, 0);
    });
    const formattedSubmittedSubtotal = computed(() => `₪${currencyFormatter.format(submittedSubtotal())}`);
    const submittedDocumentsComplete = computed(() => {
      const submitted = submittedRegistration();

      return submitted ? submitted.missingDocuments.length === 0 : false;
    });
    const hasError = computed(() => error() !== null);

    return {
      parentDetails,
      childCountLabel,
      parentDetailsValid,
      plansSelected,
      canSubmit,
      primaryDisabled,
      familyTitle,
      childrenSummary,
      visibleSteps: computed(() => steps),
      activeVisibleStepIndex,
      visibleStepNumber,
      backLabel,
      primaryLabel,
      registrationStatus,
      stepTitle,
      stepDescription,
      contractScope,
      standingOrderScope,
      selectedFileCount,
      uploadedDraftDocuments,
      submittedSubtotal,
      formattedSubmittedSubtotal,
      submittedDocumentsComplete,
      hasError,
    };
  }),
  withMethods((store) => {
    const normalizeActiveStep = (step: number): number => Math.min(Math.max(step, 0), store.steps.length - 1);
    const stepToDraftStep = (step: number): RegistrationDraftStep => {
      if (step <= 0) return RegistrationDraftStep.ParentDetails;
      if (step === 1) return RegistrationDraftStep.PlanSelection;

      return RegistrationDraftStep.DocumentsUpload;
    };
    const draftStepToStep = (draftStep: RegistrationDraftStep): number => {
      if (draftStep === RegistrationDraftStep.ParentDetails) return 0;
      if (draftStep === RegistrationDraftStep.PlanSelection) return 1;

      return 2;
    };
    const normalizeChildren = (children: RegistrationChildDraft[] | undefined): RegistrationChildDraft[] => {
      if (!children?.length) return [createEmptyRegistrationChild(1, store.availableYearPlans()[0]?.yearPlanId ?? null)];

      return children.map((child) => ({
        id: child.id,
        fullName: child.fullName ?? '',
        dateOfBirth: child.dateOfBirth ?? '',
        gender: child.gender === Gender.Male ? Gender.Male : Gender.Female,
        allergyAnswer: child.allergyAnswer === AllergyAnswer.Yes ? AllergyAnswer.Yes : AllergyAnswer.No,
        allergyDetails: child.allergyDetails ?? '',
        selectedYearPlanId: child.selectedYearPlanId ?? store.availableYearPlans()[0]?.yearPlanId ?? null,
      }));
    };
    const getNextChildId = (children: RegistrationChildDraft[] | undefined): number => {
      if (!children?.length) return 2;

      return Math.max(...children.map((child) => child.id)) + 1;
    };
    const areChildrenValid = (children: RegistrationChildDraft[] | undefined): boolean => {
      const normalizedChildren = normalizeChildren(children);

      return normalizedChildren.length > 0 && normalizedChildren.every((child) => {
        const hasRequiredDetails = hasMinimumTrimmedLength(child.fullName, 2) && child.dateOfBirth.trim().length > 0;
        const hasAllergyAnswer = child.allergyAnswer === AllergyAnswer.Yes || child.allergyAnswer === AllergyAnswer.No;
        const hasAllergyDetails = child.allergyAnswer !== AllergyAnswer.Yes || hasMinimumTrimmedLength(child.allergyDetails, 2);

        return hasRequiredDetails && hasAllergyAnswer && hasAllergyDetails && child.selectedYearPlanId !== null;
      });
    };
    const readSavedDraft = (): RegistrationDraftSnapshot | null => {
      if (typeof localStorage === 'undefined') return null;

      try {
        const rawDraft = localStorage.getItem(store.registrationDraftStorageKey);

        return rawDraft ? (JSON.parse(rawDraft) as RegistrationDraftSnapshot) : null;
      } catch {
        return null;
      }
    };
    const writeSavedDraft = (savedDraft: RegistrationDraftSnapshot): void => {
      if (typeof localStorage === 'undefined') return;

      localStorage.setItem(store.registrationDraftStorageKey, JSON.stringify(savedDraft));
    };
    const clearSavedDraft = (): void => {
      if (typeof localStorage === 'undefined') return;

      localStorage.removeItem(store.registrationDraftStorageKey);
    };
    const scrollToTop = (): void => {
      if (typeof window === 'undefined') return;

      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    };
    const createDraftSnapshot = (): RegistrationDraftSnapshot => ({
      year: store.year(),
      currentStep: stepToDraftStep(store.activeStep()),
      parentDetails: store.parentDetails(),
      children: store.children(),
      documentScopeChoices: store.documentScopeChoices(),
      documents: store.documents(),
      updatedAt: new Date().toISOString(),
    });
    const mergeLoggedInParentDetails = (parentDetails: ParentRegistrationDetails): ParentRegistrationDetails => {
      if (!store.globalStore.loggedIn()) return parentDetails;

      return {
        ...parentDetails,
        fullName: parentDetails.fullName || store.globalStore.fullName(),
        phoneNumber: parentDetails.phoneNumber || store.globalStore.phoneNumber(),
        email: parentDetails.email || store.globalStore.email(),
      };
    };
    const setActiveStep = (step: number): void => {
      const activeStep = normalizeActiveStep(step);

      if (step > store.activeStep() && store.primaryDisabled()) return;
      if (activeStep === store.activeStep()) return;

      patchState(store, { activeStep, error: null });
      scrollToTop();
    };
    const removeFilesForDocumentType = (
      selectedFiles: RegistrationSelectedFile[],
      documentType: DocumentType,
    ): RegistrationSelectedFile[] => selectedFiles.filter((selectedFile) => selectedFile.documentType !== documentType);

    return {
      async initialize(): Promise<void> {
        const savedDraft = readSavedDraft();

        if (!store.globalStore.loggedIn()) {
          const session = await store.authFacade.getMe();

          if (session) {
            store.globalStore.setUser(session.user);
          }
        }

        const draftStep = savedDraft ? draftStepToStep(savedDraft.currentStep) : null;
        const initialStep = savedDraft
          ? store.globalStore.loggedIn() ? Math.max(draftStep ?? 0, 1) : draftStep ?? 0
          : store.globalStore.loggedIn()
            ? 1
            : 0;

        patchState(store, {
          activeStep: initialStep,
          year: savedDraft?.year ?? fallbackYear,
          enteredParentDetails: mergeLoggedInParentDetails(savedDraft?.parentDetails ?? createEmptyParentDetails()),
          children: normalizeChildren(savedDraft?.children),
          childDetailsValid: areChildrenValid(savedDraft?.children),
          nextChildId: getNextChildId(savedDraft?.children),
          documentScopeChoices: savedDraft?.documentScopeChoices ?? store.documentScopeChoices(),
          documents: savedDraft?.documents ?? [],
          savedDraft,
        });

        try {
          const [year, availableYearPlans] = await Promise.all([
            store.parentFacade.getActiveRegistrationYear(),
            store.parentFacade.getAvailableYearPlans(),
          ]);
          const defaultPlanId = availableYearPlans[0]?.yearPlanId ?? null;

          patchState(store, {
            year,
            availableYearPlans,
            children: normalizeChildren(store.children()).map((child) => ({
              ...child,
              selectedYearPlanId: child.selectedYearPlanId ?? defaultPlanId,
            })),
          });
        } catch (error) {
          patchState(store, {
            error: error instanceof Error ? error.message : 'לא הצלחנו לטעון את נתוני ההרשמה.',
          });
        }
      },
      setParentFullName(fullName: string): void {
        patchState(store, {
          enteredParentDetails: {
            ...store.enteredParentDetails(),
            fullName,
          },
        });
      },
      setParentPhoneNumber(phoneNumber: string): void {
        patchState(store, {
          enteredParentDetails: {
            ...store.enteredParentDetails(),
            phoneNumber,
          },
        });
      },
      setParentEmail(email: string): void {
        patchState(store, {
          enteredParentDetails: {
            ...store.enteredParentDetails(),
            email,
          },
        });
      },
      addChild(): void {
        const nextChildId = store.nextChildId();

        patchState(store, {
          children: [
            ...store.children(),
            createEmptyRegistrationChild(nextChildId, store.availableYearPlans()[0]?.yearPlanId ?? null),
          ],
          nextChildId: nextChildId + 1,
        });
      },
      removeChild(childId: number): void {
        const nextChildren = store.children().filter((child) => child.id !== childId);

        if (nextChildren.length) {
          patchState(store, { children: nextChildren });
          return;
        }

        const nextChildId = store.nextChildId();

        patchState(store, {
          children: [createEmptyRegistrationChild(nextChildId, store.availableYearPlans()[0]?.yearPlanId ?? null)],
          nextChildId: nextChildId + 1,
        });
      },
      updateChild(childId: number, patch: Partial<Omit<RegistrationChildDraft, 'id'>>): void {
        patchState(store, {
          children: store.children().map((child) => (child.id === childId ? { ...child, ...patch } : child)),
        });
      },
      setChildren(children: RegistrationChildDraft[]): void {
        const existingChildren = store.children();

        patchState(store, {
          children: normalizeChildren(children).map((child) => {
            const existingChild = existingChildren.find((existing) => existing.id === child.id);

            return {
              ...child,
              selectedYearPlanId: child.selectedYearPlanId ?? existingChild?.selectedYearPlanId ?? store.availableYearPlans()[0]?.yearPlanId ?? null,
            };
          }),
        });
      },
      setChildDetailsValid(childDetailsValid: boolean): void {
        patchState(store, { childDetailsValid });
      },
      reserveChildId(): number {
        const nextChildId = store.nextChildId();

        patchState(store, { nextChildId: nextChildId + 1 });

        return nextChildId;
      },
      setChildPlan(childId: number, selectedYearPlanId: string | number | null): void {
        if (selectedYearPlanId === null) return;

        const yearPlanId = Number(selectedYearPlanId);

        if (!store.availableYearPlans().some((yearPlan) => yearPlan.yearPlanId === yearPlanId)) return;

        patchState(store, {
          children: store.children().map((child) => (child.id === childId ? { ...child, selectedYearPlanId: yearPlanId } : child)),
        });
      },
      getPlanLabel(selectedYearPlanId: number | null): string {
        return store.availableYearPlans().find((yearPlan) => yearPlan.yearPlanId === selectedYearPlanId)?.plan.name ?? 'לא נבחר מסלול';
      },
      getPlanPrice(selectedYearPlanId: number | null): number {
        return store.availableYearPlans().find((yearPlan) => yearPlan.yearPlanId === selectedYearPlanId)?.plan.price ?? 0;
      },
      getChildFinalPrice(child: RegistrationChildDraft, index: number): number {
        const price = this.getPlanPrice(child.selectedYearPlanId);

        return Math.round(price * (index === 1 ? 0.9 : 1));
      },
      getChildDiscountPercent(index: number): number {
        return index === 1 ? 10 : 0;
      },
      setDocumentScope(documentType: DocumentType, scopeKind: string): void {
        if (scopeKind !== RegistrationDocumentScopeKind.AllChildren && scopeKind !== RegistrationDocumentScopeKind.SpecificChild) return;

        patchState(store, {
          documentScopeChoices: {
            ...store.documentScopeChoices(),
            [documentType]: scopeKind,
          },
          selectedFiles: removeFilesForDocumentType(store.selectedFiles(), documentType),
          documents: store.documents().filter((document) => document.documentType !== documentType),
        });
      },
      selectDocumentFile(documentType: DocumentType, scope: RegistrationDocumentScope, event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        const documents = store.documents().filter((document) => {
          return document.documentType !== documentType || JSON.stringify(document.scope) !== JSON.stringify(scope);
        });
        const selectedFiles = store.selectedFiles().filter((selectedFile) => {
          return selectedFile.documentType !== documentType || JSON.stringify(selectedFile.scope) !== JSON.stringify(scope);
        });

        patchState(store, {
          documents: [
            ...documents,
            {
              documentType,
              scope,
              fileName: file.name,
              mimeType: file.type || 'application/octet-stream',
              updatedAt: new Date().toISOString(),
            },
          ],
          selectedFiles: [
            ...selectedFiles,
            {
              documentType,
              scope,
              file,
            },
          ],
        });
      },
      async uploadMissingDocument(missingDocument: MissingRegistrationDocument, event: Event): Promise<void> {
        const submittedRegistration = store.submittedRegistration();
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!submittedRegistration || submittedRegistration.status !== RegistrationStatus.WaitingForDocuments || !file) return;

        patchState(store, { loading: true, error: null });

        try {
          const updatedRegistration = await store.parentFacade.uploadRegistrationDocument({
            registrationId: submittedRegistration.id,
            documentType: missingDocument.documentType,
            scope: missingDocument.scope,
            file,
          });

          patchState(store, {
            submittedRegistration: updatedRegistration,
            loading: false,
          });
        } catch (error) {
          patchState(store, {
            loading: false,
            error: error instanceof Error ? error.message : 'לא הצלחנו להעלות את המסמך.',
          });
        } finally {
          input.value = '';
        }
      },
      sharedScope(): RegistrationDocumentScope {
        return { kind: RegistrationDocumentScopeKind.AllChildren };
      },
      childScope(childId: number): RegistrationDocumentScope {
        return {
          kind: RegistrationDocumentScopeKind.SpecificChild,
          localChildId: childId,
        };
      },
      documentFileName(documentType: DocumentType, scope: RegistrationDocumentScope): string {
        return store.documents().find((document) => {
          return document.documentType === documentType && JSON.stringify(document.scope) === JSON.stringify(scope);
        })?.fileName ?? '';
      },
      goBack(): void {
        if (store.activeStep() > 0) setActiveStep(store.activeStep() - 1);
      },
      async goNext(): Promise<void> {
        if (store.primaryDisabled()) return;

        const nextStep = Math.min(store.steps.length - 1, store.activeStep() + 1);

        if (nextStep === store.steps.length - 1) {
          await this.submitRegistration();
          return;
        }

        setActiveStep(nextStep);
      },
      saveAndContinueLater(): void {
        const savedDraft = createDraftSnapshot();

        writeSavedDraft(savedDraft);
        patchState(store, {
          activeStep: store.steps.length - 1,
          savedDraft,
          submittedRegistration: null,
          error: null,
        });
        scrollToTop();
      },
      async submitRegistration(): Promise<void> {
        if (!store.canSubmit()) {
          patchState(store, {
            error: !store.parentDetailsValid()
              ? 'חסרים פרטי הורה תקינים. חזרו לשלב פרטי ההורה ועדכנו שם, טלפון ואימייל.'
              : 'חסרים פרטי ילד או בחירת מסלול. חזרו לשלב המסלולים והשלימו את הפרטים.',
          });
          return;
        }

        patchState(store, { loading: true, error: null });

        try {
          const submittedRegistration = await store.parentFacade.submitRegistration({
            draft: createDraftSnapshot(),
            selectedFiles: store.selectedFiles(),
          });

          clearSavedDraft();
          patchState(store, {
            activeStep: store.steps.length - 1,
            submittedRegistration,
            savedDraft: null,
            loading: false,
          });
          scrollToTop();
        } catch (error) {
          patchState(store, {
            loading: false,
            error: error instanceof Error ? error.message : 'לא הצלחנו לשלוח את ההרשמה.',
          });
        }
      },
      setActiveStep,
      syncLoggedInParentDetails(): void {
        const currentParent = store.enteredParentDetails();
        const nextParent = mergeLoggedInParentDetails(currentParent);

        if (
          nextParent.fullName !== currentParent.fullName
          || nextParent.phoneNumber !== currentParent.phoneNumber
          || nextParent.email !== currentParent.email
        ) {
          patchState(store, { enteredParentDetails: nextParent });
        }
      },
    };
  }),
  withHooks((store) => ({
    onInit(): void {
      void store.initialize();

      effect(() => {
        if (!store.globalStore.loggedIn()) return;

        store.syncLoggedInParentDetails();
      });
    },
  })),
);
