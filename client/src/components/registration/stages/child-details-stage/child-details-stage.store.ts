import { computed, effect, inject, signal, untracked } from '@angular/core';
import { applyEach, applyWhen, form, schema, validate, type FieldTree } from '@angular/forms/signals';
import { signalStore, withComputed, withHooks, withMethods, withProps } from '@ngrx/signals';
import { AllergyAnswer, Gender, type RegistrationChildDraft } from '../../../../app/types/registration-status.type';
import { RegistrationStore } from '../../registration.store';

type ChildDetailsFormModel = RegistrationChildDraft[];
type ChildDetailsField = FieldTree<RegistrationChildDraft, number>;

const childDetailsSchema = schema<RegistrationChildDraft>((child) => {
  validate(child.fullName, ({ value }) => {
    return value().trim().length > 1 ? undefined : { kind: 'child-name', message: 'הזינו שם מלא של הילד' };
  });

  validate(child.dateOfBirth, ({ value }) => {
    return value().trim().length > 0 ? undefined : { kind: 'child-birth-date', message: 'הזינו תאריך לידה' };
  });

  validate(child.gender, ({ value }) => {
    return value() === Gender.Female || value() === Gender.Male ? undefined : { kind: 'child-gender', message: 'בחרו מגדר' };
  });

  validate(child.allergyAnswer, ({ value }) => {
    return value() === AllergyAnswer.Yes || value() === AllergyAnswer.No ? undefined : { kind: 'child-allergy-answer', message: 'בחרו תשובה' };
  });

  applyWhen(child.allergyDetails, ({ valueOf }) => valueOf(child.allergyAnswer) === AllergyAnswer.Yes, (allergyDetails) => {
    validate(allergyDetails, ({ value }) => {
      return value().trim().length > 1
        ? undefined
        : { kind: 'child-allergy-details', message: 'פרטו את האלרגיות או הרגישויות' };
    });
  });
});

export const ChildDetailsStageStore = signalStore(
  withProps(() => {
    const registrationStore = inject(RegistrationStore);
    const defaultPlanId = registrationStore.availableYearPlans()[0]?.yearPlanId ?? null;
    const childrenModel = signal<ChildDetailsFormModel>(
      registrationStore.children().map((child) => normalizeChildDraft(child, defaultPlanId)),
    );
    const childrenForm = form(childrenModel, (children) => {
      applyEach(children, childDetailsSchema);
    });

    return {
      childrenForm,
      childrenModel,
      defaultFocusedDate: new Date(2020, 0, 1),
      formatDate: formatDisplayDate,
      formatInputDate: formatDisplayDate,
      maxDate: new Date(),
      parseDate: parseDisplayDate,
      registrationStore,
    };
  }),
  withComputed(({ childrenForm, childrenModel, registrationStore }) => {
    const children = computed(() => childrenModel());
    const valid = computed(() => children().length > 0 && childrenForm().valid());
    const subtotal = computed(() => {
      return registrationStore.children().reduce((total, child, index) => total + registrationStore.getChildFinalPrice(child, index), 0);
    });
    const formattedSubtotal = computed(() => formatCurrency(subtotal()));

    return {
      children,
      valid,
      availableYearPlans: computed(() => registrationStore.availableYearPlans()),
      subtotal,
      formattedSubtotal,
    };
  }),
  withMethods(({ childrenForm, childrenModel, registrationStore }) => ({
    childField(index: number): ChildDetailsField {
      return childrenForm[index];
    },
    addChild(): void {
      childrenModel.update((children) => [
        ...children,
        createEmptyChild(registrationStore.reserveChildId(), registrationStore.availableYearPlans()[0]?.yearPlanId ?? null),
      ]);
    },
    removeChild(childId: number): void {
      childrenModel.update((children) => {
        const nextChildren = children.filter((child) => child.id !== childId);

        return nextChildren.length ? nextChildren : [createEmptyChild(registrationStore.reserveChildId(), registrationStore.availableYearPlans()[0]?.yearPlanId ?? null)];
      });
    },
    selectedDate(value: string): Date | undefined {
      return parseIsoDate(value);
    },
    setBirthDate(childField: ChildDetailsField, birthDate: Date | null): void {
      childField.dateOfBirth().value.set(birthDate ? formatIsoDate(birthDate) : '');
      childField.dateOfBirth().markAsTouched();
    },
    setGender(childField: ChildDetailsField, gender: unknown): void {
      if (gender !== Gender.Female && gender !== Gender.Male) return;

      childField.gender().value.set(gender);
      childField.gender().markAsTouched();
    },
    setAllergyAnswer(childField: ChildDetailsField, allergyAnswer: unknown): void {
      if (allergyAnswer !== AllergyAnswer.Yes && allergyAnswer !== AllergyAnswer.No) return;

      childField.allergyAnswer().value.set(allergyAnswer);
      childField.allergyAnswer().markAsTouched();

      if (allergyAnswer === AllergyAnswer.No) {
        childField.allergyDetails().value.set('');
        childField.allergyDetails().reset('');
      }
    },
    childDisplayName(child: RegistrationChildDraft, index: number): string {
      return child.fullName.trim();
    },
    childNameHasError(childField: ChildDetailsField): boolean {
      return childField.fullName().touched() && childField.fullName().invalid();
    },
    birthDateHasError(childField: ChildDetailsField): boolean {
      return childField.dateOfBirth().touched() && childField.dateOfBirth().invalid();
    },
    allergyDetailsHasError(childField: ChildDetailsField): boolean {
      return childField.allergyDetails().touched() && childField.allergyDetails().invalid();
    },
    childNameError(childField: ChildDetailsField): string {
      return this.childNameHasError(childField) ? childField.fullName().errors()[0]?.message || 'הזינו שם מלא של הילד' : '';
    },
    birthDateError(childField: ChildDetailsField): string {
      return this.birthDateHasError(childField) ? childField.dateOfBirth().errors()[0]?.message || 'הזינו תאריך לידה' : '';
    },
    allergyDetailsError(childField: ChildDetailsField): string {
      return this.allergyDetailsHasError(childField)
        ? childField.allergyDetails().errors()[0]?.message || 'פרטו את האלרגיות או הרגישויות'
        : '';
    },
    setChildPlan(childId: number, selectedYearPlanId: string | number | null): void {
      registrationStore.setChildPlan(childId, selectedYearPlanId);

      const yearPlanId = selectedYearPlanId === null ? null : Number(selectedYearPlanId);

      if (yearPlanId === null || !registrationStore.availableYearPlans().some((yearPlan) => yearPlan.yearPlanId === yearPlanId)) return;

      childrenModel.update((children) => {
        return children.map((child) => (child.id === childId ? { ...child, selectedYearPlanId: yearPlanId } : child));
      });
    },
    getPlanLabel(selectedYearPlanId: number | null): string {
      return registrationStore.getPlanLabel(selectedYearPlanId);
    },
    getChildFinalPrice(child: RegistrationChildDraft, index: number): number {
      return registrationStore.getChildFinalPrice(child, index);
    },
    getChildDiscountPercent(index: number): number {
      return registrationStore.getChildDiscountPercent(index);
    },
    syncChildren(children: RegistrationChildDraft[], valid: boolean): void {
      const defaultPlanId = registrationStore.availableYearPlans()[0]?.yearPlanId ?? null;

      registrationStore.setChildren(children.map((child) => normalizeChildDraft(child, defaultPlanId)));
      registrationStore.setChildDetailsValid(valid);
    },
  })),
  withHooks(({ childrenModel, registrationStore, syncChildren, valid }) => ({
    onInit(): void {
      effect(() => {
        const defaultPlanId = registrationStore.availableYearPlans()[0]?.yearPlanId ?? null;
        const registrationChildren = registrationStore.children().map((child) => normalizeChildDraft(child, defaultPlanId));
        const formChildren = untracked(() => childrenModel().map((child) => normalizeChildDraft(child, defaultPlanId)));

        if (!sameChildren(registrationChildren, formChildren)) {
          untracked(() => childrenModel.set(registrationChildren));
        }
      });

      effect(() => {
        const defaultPlanId = registrationStore.availableYearPlans()[0]?.yearPlanId ?? null;
        const children = childrenModel().map((child) => normalizeChildDraft(child, defaultPlanId));
        const formValid = valid();

        untracked(() => {
          syncChildren(children, formValid);
        });
      });
    },
  })),
);

function createEmptyChild(id: number, selectedYearPlanId: number | null): RegistrationChildDraft {
  return {
    id,
    fullName: '',
    dateOfBirth: '',
    gender: Gender.Female,
    allergyAnswer: AllergyAnswer.No,
    allergyDetails: '',
    selectedYearPlanId,
  };
}

function sameChildren(left: RegistrationChildDraft[], right: RegistrationChildDraft[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function normalizeChildDraft(child: RegistrationChildDraft, defaultPlanId: number | null): RegistrationChildDraft {
  return {
    ...child,
    fullName: child.fullName ?? '',
    dateOfBirth: child.dateOfBirth ?? '',
    gender: child.gender === Gender.Male ? Gender.Male : Gender.Female,
    allergyAnswer: child.allergyAnswer === AllergyAnswer.Yes ? AllergyAnswer.Yes : AllergyAnswer.No,
    allergyDetails: child.allergyDetails ?? '',
    selectedYearPlanId: child.selectedYearPlanId ?? defaultPlanId,
  };
}

function parseIsoDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return isSameDateParts(date, Number(year), Number(month), Number(day)) ? date : undefined;
}

function parseDisplayDate(value: string): Date | null {
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return isSameDateParts(date, Number(year), Number(month), Number(day)) ? date : null;
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function formatCurrency(amount: number): string {
  return `₪${new Intl.NumberFormat('he-IL').format(amount)}`;
}

function isSameDateParts(date: Date, year: number, month: number, day: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
