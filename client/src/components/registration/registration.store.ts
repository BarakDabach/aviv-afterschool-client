import { computed, effect, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { GlobalStore } from '../../app/stores/global.store';
import {
  AllergyAnswer,
  REGISTRATION_STATUS_PROPERTIES,
  RegistrationPlanId,
  RegistrationStatusKind,
  type RegistrationChildDraft,
  type RegistrationDraftSnapshot,
  type RegistrationStatus,
} from '../../app/types/registration-status.type';
import { isValidIsraeliMobilePhone } from '../shared/validations/phone.validation';
import { hasMinimumTrimmedLength } from '../shared/validations/text.validation';

type RegistrationStep = {
  index: number;
  label: string;
};

type RegistrationParentDetails = {
  fullName: string;
  phone: string;
};

type RegistrationFlowState = {
  activeStep: number;
  parentDetails: RegistrationParentDetails;
  children: RegistrationChildDraft[];
  childDetailsValid: boolean;
  nextChildId: number;
  selectedPlan: RegistrationPlanId;
  savedDraft: RegistrationDraftSnapshot | null;
  registrationStatus: RegistrationStatus;
};

type GlobalStoreInstance = InstanceType<typeof GlobalStore>;

const REGISTRATION_DRAFT_STORAGE_KEY = 'aviv-registration-draft';

const STEPS: RegistrationStep[] = [
  { index: 0, label: 'הורה' },
  { index: 1, label: 'ילדים' },
  { index: 2, label: 'אישורים' },
  { index: 3, label: 'סיום' },
];

const EMPTY_PARENT_DETAILS: RegistrationParentDetails = {
  fullName: '',
  phone: '',
};

const createEmptyChild = (id: number): RegistrationChildDraft => ({
  id,
  name: '',
  birthDate: '',
  allergyAnswer: AllergyAnswer.No,
  allergyDetails: '',
});

const createRegistrationStatus = (kind: RegistrationStatusKind, updatedAtIso: string): RegistrationStatus => ({
  kind,
  ...REGISTRATION_STATUS_PROPERTIES[kind],
  updatedAtIso,
});

const createDraftStatus = (updatedAtIso = new Date().toISOString()): RegistrationStatus => createRegistrationStatus(RegistrationStatusKind.Draft, updatedAtIso);

const createPendingReviewStatus = (updatedAtIso = new Date().toISOString()): RegistrationStatus =>
  createRegistrationStatus(RegistrationStatusKind.PendingReview, updatedAtIso);

const normalizeActiveStep = (step: number, loggedIn: boolean): number => {
  const activeStep = Math.min(Math.max(step, 0), STEPS.length - 1);

  return loggedIn && activeStep === 0 ? 1 : activeStep;
};

const getNextChildId = (children: RegistrationChildDraft[] | undefined): number => {
  if (!children?.length) return 2;

  return Math.max(...children.map((child) => child.id)) + 1;
};

const normalizeChildren = (children: RegistrationChildDraft[] | undefined): RegistrationChildDraft[] => {
  if (!children?.length) return [createEmptyChild(1)];

  return children.map((child) => ({
    ...child,
    allergyAnswer: child.allergyAnswer === AllergyAnswer.Yes ? AllergyAnswer.Yes : AllergyAnswer.No,
    allergyDetails: child.allergyDetails ?? '',
  }));
};

const areChildrenValid = (children: RegistrationChildDraft[] | undefined): boolean => {
  const normalizedChildren = normalizeChildren(children);

  return normalizedChildren.every((child) => {
    const hasRequiredDetails = hasMinimumTrimmedLength(child.name, 2) && child.birthDate.trim().length > 0;
    const hasAllergyAnswer = child.allergyAnswer === AllergyAnswer.Yes || child.allergyAnswer === AllergyAnswer.No;
    const hasAllergyDetails = child.allergyAnswer !== AllergyAnswer.Yes || hasMinimumTrimmedLength(child.allergyDetails, 2);

    return hasRequiredDetails && hasAllergyAnswer && hasAllergyDetails;
  });
};

const readSavedDraft = (): RegistrationDraftSnapshot | null => {
  if (typeof localStorage === 'undefined') return null;

  try {
    const rawDraft = localStorage.getItem(REGISTRATION_DRAFT_STORAGE_KEY);

    return rawDraft ? (JSON.parse(rawDraft) as RegistrationDraftSnapshot) : null;
  } catch {
    return null;
  }
};

const writeSavedDraft = (savedDraft: RegistrationDraftSnapshot): void => {
  if (typeof localStorage === 'undefined') return;

  localStorage.setItem(REGISTRATION_DRAFT_STORAGE_KEY, JSON.stringify(savedDraft));
};

const clearSavedDraft = (): void => {
  if (typeof localStorage === 'undefined') return;

  localStorage.removeItem(REGISTRATION_DRAFT_STORAGE_KEY);
};

const scrollToTop = (): void => {
  if (typeof window === 'undefined') return;

  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
};

const createInitialRegistrationState = (globalStore: GlobalStoreInstance): RegistrationFlowState => {
  const savedDraft = readSavedDraft();
  const initialActiveStep = savedDraft ? normalizeActiveStep(savedDraft.activeStep, globalStore.loggedIn()) : globalStore.loggedIn() ? 1 : 0;

  return {
    activeStep: initialActiveStep,
    parentDetails: savedDraft?.parentDetails ?? EMPTY_PARENT_DETAILS,
    children: normalizeChildren(savedDraft?.children),
    childDetailsValid: areChildrenValid(savedDraft?.children),
    nextChildId: getNextChildId(savedDraft?.children),
    selectedPlan: savedDraft?.selectedPlan ?? RegistrationPlanId.Full,
    savedDraft,
    registrationStatus: savedDraft ? createDraftStatus(savedDraft.savedAtIso) : createPendingReviewStatus(),
  };
};

export const RegistrationStore = signalStore(
  withState(() => createInitialRegistrationState(inject(GlobalStore))),
  withProps(() => ({
    globalStore: inject(GlobalStore),
    steps: STEPS,
  })),
  withComputed(({ children, globalStore, parentDetails, registrationStatus, selectedPlan }) => ({
    selectedPlanLabel: computed(() => (selectedPlan() === RegistrationPlanId.Full ? 'מסלול מלא' : 'שלושה ימים')),
    isFullPlan: computed(() => selectedPlan() === RegistrationPlanId.Full),
    isThreePlan: computed(() => selectedPlan() === RegistrationPlanId.Three),
    childCountLabel: computed(() => {
      const childCount = children().length;

      return childCount === 1 ? 'ילד אחד' : `${childCount} ילדים`;
    }),
    visibleSteps: computed(() => (globalStore.loggedIn() ? STEPS.filter((step) => step.index !== 0) : STEPS)),
    resolvedParentDetails: computed(() => {
      if (globalStore.loggedIn()) {
        return {
          fullName: globalStore.fullName(),
          phone: globalStore.phoneNumber(),
        };
      }

      return parentDetails();
    }),
    shouldShowParentDetailsStep: computed(() => !globalStore.loggedIn()),
    isDraftStatus: computed(() => registrationStatus().kind === RegistrationStatusKind.Draft),
  })),
  withComputed(({ activeStep, childDetailsValid, children, isDraftStatus, resolvedParentDetails, selectedPlanLabel, shouldShowParentDetailsStep, visibleSteps }) => ({
    parentDetails: computed(() => resolvedParentDetails()),
    activeVisibleStepIndex: computed(() => visibleSteps().findIndex((step) => step.index === activeStep())),
    visibleStepNumber: computed(() => Math.max(visibleSteps().findIndex((step) => step.index === activeStep()), 0) + 1),
    parentDetailsValid: computed(() => {
      const parent = resolvedParentDetails();

      return hasMinimumTrimmedLength(parent.fullName, 2) && isValidIsraeliMobilePhone(parent.phone);
    }),
    familyTitle: computed(() => {
      const parentName = resolvedParentDetails().fullName.trim();
      const familyName = parentName.split(/\s+/).at(-1);

      return familyName ? `משפחת ${familyName}` : 'פרטי משפחה';
    }),
    childrenSummary: computed(() => {
      const childNames = children().map((child, index) => child.name.trim() || `ילד ${index + 1}`);

      return `${childNames.join(', ')} · ${selectedPlanLabel()}`;
    }),
    primaryDisabled: computed(() => {
      if (activeStep() === 0 && shouldShowParentDetailsStep()) {
        const parent = resolvedParentDetails();

        return !hasMinimumTrimmedLength(parent.fullName, 2) || !isValidIsraeliMobilePhone(parent.phone);
      }

      if (activeStep() === 1) return !childDetailsValid();

      return false;
    }),
    backLabel: computed(() => {
      const activeVisibleStepIndex = visibleSteps().findIndex((step) => step.index === activeStep());

      if (activeVisibleStepIndex <= 0) return 'חזרה';
      if (activeStep() === STEPS.length - 1) return 'יציאה';

      return `חזרה ל${visibleSteps()[activeVisibleStepIndex - 1].label}`;
    }),
    primaryLabel: computed(
      () =>
        [
          'המשך לפרטי הילד',
          'המשך למסלול ואישורים',
          'שליחת ההרשמה',
          'חזרה לעמוד הראשי',
        ][activeStep()],
    ),
    stepTitle: computed(() => {
      if (activeStep() === STEPS.length - 1) {
        return isDraftStatus() ? 'ההרשמה נשמרה' : 'ההרשמה נשלחה';
      }

      return ['פרטי ההורה', 'פרטי הילדים', 'מסלול ואישורים'][activeStep()];
    }),
  })),
  withComputed(({ activeStep, registrationStatus }) => ({
    stepDescription: computed(() => {
      if (activeStep() === STEPS.length - 1) {
        return registrationStatus().description;
      }

      return [
        'הזינו את פרטי ההורה שישמש כאיש הקשר הראשי להרשמה.',
        'מלאו את פרטי הילדים. אפשר להוסיף ילד נוסף לפני שממשיכים למסלול.',
        'בחרו מסלול והעלו את החוזה החתום יחד עם מסמכי האישור.',
      ][activeStep()];
    }),
  })),
  withMethods((store) => ({
    setParentFullName(fullName: string): void {
      patchState(store, {
        parentDetails: {
          ...store.parentDetails(),
          fullName,
        },
      });
    },
    setParentPhone(phone: string): void {
      patchState(store, {
        parentDetails: {
          ...store.parentDetails(),
          phone,
        },
      });
    },
    addChild(): void {
      const nextChildId = store.nextChildId();

      patchState(store, {
        children: [
          ...store.children(),
          createEmptyChild(nextChildId),
        ],
        nextChildId: nextChildId + 1,
      });
    },
    removeChild(childId: number): void {
      const nextChildren = store.children().filter((child) => child.id !== childId);

      if (nextChildren.length > 0) {
        patchState(store, { children: nextChildren });
        return;
      }

      const nextChildId = store.nextChildId();

      patchState(store, {
        children: [createEmptyChild(nextChildId)],
        nextChildId: nextChildId + 1,
      });
    },
    updateChild(childId: number, patch: Partial<Omit<RegistrationChildDraft, 'id'>>): void {
      patchState(store, {
        children: store.children().map((child) => (child.id === childId ? { ...child, ...patch } : child)),
      });
    },
    setChildren(children: RegistrationChildDraft[]): void {
      patchState(store, {
        children: normalizeChildren(children),
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
    setSelectedPlan(selectedPlan: string): void {
      if (selectedPlan !== RegistrationPlanId.Full && selectedPlan !== RegistrationPlanId.Three) return;

      patchState(store, { selectedPlan: selectedPlan as RegistrationPlanId });
    },
    goBack(): void {
      if (store.activeStep() > 0) {
        this.setActiveStep(store.activeStep() - 1);
      }
    },
    goNext(): void {
      if (store.primaryDisabled()) return;

      const nextStep = Math.min(STEPS.length - 1, store.activeStep() + 1);

      if (nextStep === STEPS.length - 1) {
        this.submitRegistration();
        return;
      }

      this.setActiveStep(nextStep);
    },
    saveAndContinueLater(): void {
      const savedAtIso = new Date().toISOString();
      const savedDraft: RegistrationDraftSnapshot = {
        activeStep: store.activeStep(),
        parentDetails: store.parentDetails(),
        children: store.children(),
        selectedPlan: store.selectedPlan(),
        savedAtIso,
      };

      writeSavedDraft(savedDraft);
      patchState(store, {
        activeStep: STEPS.length - 1,
        savedDraft,
        registrationStatus: createDraftStatus(savedAtIso),
      });
      scrollToTop();
    },
    setActiveStep(step: number): void {
      const activeStep = normalizeActiveStep(step, store.globalStore.loggedIn());

      if (step > store.activeStep() && store.primaryDisabled()) return;
      if (activeStep === store.activeStep()) return;

      patchState(store, { activeStep });
      scrollToTop();
    },
    submitRegistration(): void {
      clearSavedDraft();
      patchState(store, {
        activeStep: STEPS.length - 1,
        savedDraft: null,
        registrationStatus: createPendingReviewStatus(),
      });
      scrollToTop();
    },
  })),
  withHooks((store) => ({
    onInit(): void {
      effect(() => {
        if (store.globalStore.loggedIn() && store.activeStep() === 0) {
          patchState(store, { activeStep: 1 });
        }
      });
    },
  })),
);
