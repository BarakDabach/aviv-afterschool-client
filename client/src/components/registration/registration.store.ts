import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { REGISTRATION_STATUS_PROPERTIES, type RegistrationChildDraft, type RegistrationDraftSnapshot, type RegistrationPlanId, type RegistrationStatus, type RegistrationStatusKind } from '../../app/types/registration-status.type';
import { UserStore } from '../../app/stores/user.store';

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
  nextChildId: number;
  selectedPlan: RegistrationPlanId;
  savedDraft: RegistrationDraftSnapshot | null;
  registrationStatus: RegistrationStatus;
};

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
  allergyAnswer: 'no',
});

@Injectable()
export class RegistrationStore {
  private readonly userStore = inject(UserStore);
  private readonly savedDraftFromStorage = this.readSavedDraft();

  readonly steps = STEPS;

  private readonly state = signal<RegistrationFlowState>({
    activeStep: this.getInitialActiveStep(),
    parentDetails: this.savedDraftFromStorage?.parentDetails ?? EMPTY_PARENT_DETAILS,
    children: this.savedDraftFromStorage?.children?.length ? this.savedDraftFromStorage.children : [createEmptyChild(1)],
    nextChildId: this.getNextChildId(this.savedDraftFromStorage?.children),
    selectedPlan: this.savedDraftFromStorage?.selectedPlan ?? 'full',
    savedDraft: this.savedDraftFromStorage,
    registrationStatus: this.savedDraftFromStorage ? this.createDraftStatus(this.savedDraftFromStorage.savedAtIso) : this.createPendingReviewStatus(),
  });

  readonly activeStep = computed(() => this.state().activeStep);
  readonly children = computed(() => this.state().children);
  readonly selectedPlan = computed(() => this.state().selectedPlan);
  readonly selectedPlanLabel = computed(() => (this.selectedPlan() === 'full' ? 'מסלול מלא' : 'שלושה ימים'));
  readonly childCountLabel = computed(() => {
    const childCount = this.children().length;

    return childCount === 1 ? 'ילד אחד' : `${childCount} ילדים`;
  });
  readonly childrenSummary = computed(() => {
    const childNames = this.children().map((child, index) => child.name.trim() || `ילד ${index + 1}`);

    return `${childNames.join(', ')} · ${this.selectedPlanLabel()}`;
  });
  readonly savedDraft = computed(() => this.state().savedDraft);
  readonly registrationStatus = computed(() => this.state().registrationStatus);
  readonly visibleSteps = computed(() => (this.userStore.loggedIn() ? this.steps.filter((step) => step.index !== 0) : this.steps));
  readonly activeVisibleStepIndex = computed(() => this.visibleSteps().findIndex((step) => step.index === this.activeStep()));
  readonly visibleStepNumber = computed(() => Math.max(this.activeVisibleStepIndex(), 0) + 1);
  readonly parentDetails = computed(() => {
    if (this.userStore.loggedIn()) {
      return {
        fullName: this.userStore.fullName(),
        phone: this.userStore.phoneNumber(),
      };
    }

    return this.state().parentDetails;
  });
  readonly familyTitle = computed(() => {
    const parentName = this.parentDetails().fullName.trim();
    const familyName = parentName.split(/\s+/).at(-1);

    return familyName ? `משפחת ${familyName}` : 'פרטי משפחה';
  });
  readonly shouldShowParentDetailsStep = computed(() => !this.userStore.loggedIn());

  readonly parentDetailsValid = computed(() => {
    const parent = this.parentDetails();

    return parent.fullName.trim().length > 1 && this.isValidIsraeliMobile(parent.phone);
  });

  readonly primaryDisabled = computed(() => {
    if (this.activeStep() === 0 && this.shouldShowParentDetailsStep()) return !this.parentDetailsValid();

    return false;
  });

  constructor() {
    effect(() => {
      if (this.userStore.loggedIn() && this.activeStep() === 0) {
        this.patchState({ activeStep: 1 });
      }
    });
  }

  readonly backLabel = computed(() => {
    const activeStep = this.activeStep();
    const activeVisibleStepIndex = this.activeVisibleStepIndex();

    if (activeVisibleStepIndex <= 0) return 'חזרה';
    if (activeStep === this.steps.length - 1) return 'יציאה';

    return `חזרה ל${this.visibleSteps()[activeVisibleStepIndex - 1].label}`;
  });

  readonly primaryLabel = computed(
    () =>
      [
        'המשך לפרטי הילד',
        'המשך למסלול ואישורים',
        'שליחת ההרשמה',
        'חזרה לעמוד הראשי',
      ][this.activeStep()],
  );

  readonly stepTitle = computed(() => {
    if (this.activeStep() === this.steps.length - 1) {
      return this.registrationStatus().kind === 'draft' ? 'ההרשמה נשמרה' : 'ההרשמה נשלחה';
    }

    return ['פרטי ההורה', 'פרטי הילדים', 'מסלול ואישורים'][this.activeStep()];
  });

  readonly stepDescription = computed(() => {
    if (this.activeStep() === this.steps.length - 1) {
      return this.registrationStatus().description;
    }

    return [
      'הזינו את פרטי ההורה שישמש כאיש הקשר הראשי להרשמה.',
      'מלאו את פרטי הילדים. אפשר להוסיף ילד נוסף לפני שממשיכים למסלול.',
      'בחרו מסלול והעלו את החוזה החתום יחד עם מסמכי האישור.',
    ][this.activeStep()];
  });

  setParentFullName(fullName: string): void {
    this.patchState({
      parentDetails: {
        ...this.parentDetails(),
        fullName,
      },
    });
  }

  setParentPhone(phone: string): void {
    this.patchState({
      parentDetails: {
        ...this.parentDetails(),
        phone,
      },
    });
  }

  addChild(): void {
    const nextChildId = this.state().nextChildId;

    this.patchState({
      children: [
        ...this.children(),
        createEmptyChild(nextChildId),
      ],
      nextChildId: nextChildId + 1,
    });
  }

  removeChild(childId: number): void {
    const nextChildren = this.children().filter((child) => child.id !== childId);

    if (nextChildren.length > 0) {
      this.patchState({ children: nextChildren });
      return;
    }

    const nextChildId = this.state().nextChildId;

    this.patchState({
      children: [createEmptyChild(nextChildId)],
      nextChildId: nextChildId + 1,
    });
  }

  updateChild(childId: number, patch: Partial<Omit<RegistrationChildDraft, 'id'>>): void {
    this.patchState({
      children: this.children().map((child) => (child.id === childId ? { ...child, ...patch } : child)),
    });
  }

  setSelectedPlan(selectedPlan: string): void {
    if (selectedPlan !== 'full' && selectedPlan !== 'three') return;

    this.patchState({ selectedPlan });
  }

  goBack(): void {
    if (this.activeStep() > 0) {
      this.setActiveStep(this.activeStep() - 1);
    }
  }

  goNext(): void {
    if (this.primaryDisabled()) return;

    const nextStep = Math.min(this.steps.length - 1, this.activeStep() + 1);

    if (nextStep === this.steps.length - 1) {
      this.submitRegistration();
      return;
    }

    this.setActiveStep(nextStep);
  }

  saveAndContinueLater(): void {
    const savedAtIso = new Date().toISOString();
    const savedDraft: RegistrationDraftSnapshot = {
      activeStep: this.activeStep(),
      parentDetails: this.parentDetails(),
      children: this.children(),
      selectedPlan: this.selectedPlan(),
      savedAtIso,
    };

    this.writeSavedDraft(savedDraft);
    this.patchState({
      activeStep: this.steps.length - 1,
      savedDraft,
      registrationStatus: this.createDraftStatus(savedAtIso),
    });
    this.scrollToTop();
  }

  setActiveStep(step: number): void {
    const activeStep = this.normalizeActiveStep(step);

    if (step > this.activeStep() && this.primaryDisabled()) return;
    if (activeStep === this.activeStep()) return;

    this.patchState({ activeStep });
    this.scrollToTop();
  }

  private submitRegistration(): void {
    this.clearSavedDraft();
    this.patchState({
      activeStep: this.steps.length - 1,
      savedDraft: null,
      registrationStatus: this.createPendingReviewStatus(),
    });
    this.scrollToTop();
  }

  private patchState(patch: Partial<RegistrationFlowState>): void {
    this.state.update((state) => ({ ...state, ...patch }));
  }

  private normalizeActiveStep(step: number): number {
    const activeStep = Math.min(Math.max(step, 0), this.steps.length - 1);

    if (this.userStore.loggedIn() && activeStep === 0) return 1;

    return activeStep;
  }

  private isValidIsraeliMobile(phone: string): boolean {
    const normalizedPhone = phone.replace(/\D/g, '');

    return /^05\d{8}$/.test(normalizedPhone);
  }

  private getNextChildId(children: RegistrationChildDraft[] | undefined): number {
    if (!children?.length) return 2;

    return Math.max(...children.map((child) => child.id)) + 1;
  }

  private getInitialActiveStep(): number {
    if (this.savedDraftFromStorage) return this.normalizeActiveStep(this.savedDraftFromStorage.activeStep);
    if (this.userStore.loggedIn()) return 1;

    return 0;
  }

  private createDraftStatus(updatedAtIso = new Date().toISOString()): RegistrationStatus {
    return this.createRegistrationStatus('draft', updatedAtIso);
  }

  private createPendingReviewStatus(updatedAtIso = new Date().toISOString()): RegistrationStatus {
    return this.createRegistrationStatus('pending_review', updatedAtIso);
  }

  private createRegistrationStatus(kind: RegistrationStatusKind, updatedAtIso: string): RegistrationStatus {
    return {
      kind,
      ...REGISTRATION_STATUS_PROPERTIES[kind],
      updatedAtIso,
    };
  }

  private readSavedDraft(): RegistrationDraftSnapshot | null {
    if (typeof localStorage === 'undefined') return null;

    try {
      const rawDraft = localStorage.getItem(REGISTRATION_DRAFT_STORAGE_KEY);

      return rawDraft ? (JSON.parse(rawDraft) as RegistrationDraftSnapshot) : null;
    } catch {
      return null;
    }
  }

  private writeSavedDraft(savedDraft: RegistrationDraftSnapshot): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(REGISTRATION_DRAFT_STORAGE_KEY, JSON.stringify(savedDraft));
  }

  private clearSavedDraft(): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.removeItem(REGISTRATION_DRAFT_STORAGE_KEY);
  }

  private scrollToTop(): void {
    if (typeof window === 'undefined') return;

    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  }
}
