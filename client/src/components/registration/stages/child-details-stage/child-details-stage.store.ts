import { computed, effect, inject, signal, untracked } from '@angular/core';
import { applyEach, applyWhen, form, schema, validate, type FieldTree } from '@angular/forms/signals';
import { signalStore, withComputed, withHooks, withMethods, withProps } from '@ngrx/signals';
import { AllergyAnswer, type RegistrationChildDraft } from '../../../../app/types/registration-status.type';
import { RegistrationStore } from '../../registration.store';

type ChildDetailsFormModel = RegistrationChildDraft[];
type ChildDetailsField = FieldTree<RegistrationChildDraft, number>;

const childDetailsSchema = schema<RegistrationChildDraft>((child) => {
  validate(child.name, ({ value }) => {
    return value().trim().length > 1 ? undefined : { kind: 'child-name', message: 'הזינו שם מלא של הילד' };
  });

  validate(child.birthDate, ({ value }) => {
    return value().trim().length > 0 ? undefined : { kind: 'child-birth-date', message: 'הזינו תאריך לידה' };
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
    const childrenModel = signal<ChildDetailsFormModel>(
      registrationStore.children().map((child) => normalizeChildDraft(child)),
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
  withComputed(({ childrenForm, childrenModel }) => {
    const children = computed(() => childrenModel());
    const valid = computed(() => children().length > 0 && childrenForm().valid());

    return {
      children,
      valid,
    };
  }),
  withMethods(({ childrenForm, childrenModel, registrationStore }) => ({
    childField(index: number): ChildDetailsField {
      return childrenForm[index];
    },
    addChild(): void {
      childrenModel.update((children) => [
        ...children,
        createEmptyChild(registrationStore.reserveChildId()),
      ]);
    },
    removeChild(childId: number): void {
      childrenModel.update((children) => {
        const nextChildren = children.filter((child) => child.id !== childId);

        return nextChildren.length ? nextChildren : [createEmptyChild(registrationStore.reserveChildId())];
      });
    },
    selectedDate(value: string): Date | undefined {
      return parseIsoDate(value);
    },
    setBirthDate(childField: ChildDetailsField, birthDate: Date | null): void {
      childField.birthDate().value.set(birthDate ? formatIsoDate(birthDate) : '');
      childField.birthDate().markAsTouched();
    },
    setAllergyAnswer(childField: ChildDetailsField, allergyAnswer: string): void {
      if (allergyAnswer !== AllergyAnswer.Yes && allergyAnswer !== AllergyAnswer.No) return;

      childField.allergyAnswer().value.set(allergyAnswer);
      childField.allergyAnswer().markAsTouched();

      if (allergyAnswer === AllergyAnswer.No) {
        childField.allergyDetails().value.set('');
        childField.allergyDetails().reset('');
      }
    },
    childDisplayName(child: RegistrationChildDraft, index: number): string {
      return child.name.trim() || `ילד ${index + 1}`;
    },
    childNameHasError(childField: ChildDetailsField): boolean {
      return childField.name().touched() && childField.name().invalid();
    },
    birthDateHasError(childField: ChildDetailsField): boolean {
      return childField.birthDate().touched() && childField.birthDate().invalid();
    },
    allergyDetailsHasError(childField: ChildDetailsField): boolean {
      return childField.allergyDetails().touched() && childField.allergyDetails().invalid();
    },
    childNameError(childField: ChildDetailsField): string {
      return this.childNameHasError(childField) ? childField.name().errors()[0]?.message || 'הזינו שם מלא של הילד' : '';
    },
    birthDateError(childField: ChildDetailsField): string {
      return this.birthDateHasError(childField) ? childField.birthDate().errors()[0]?.message || 'הזינו תאריך לידה' : '';
    },
    allergyDetailsError(childField: ChildDetailsField): string {
      return this.allergyDetailsHasError(childField)
        ? childField.allergyDetails().errors()[0]?.message || 'פרטו את האלרגיות או הרגישויות'
        : '';
    },
    syncChildren(children: RegistrationChildDraft[], valid: boolean): void {
      registrationStore.setChildren(children.map((child) => normalizeChildDraft(child)));
      registrationStore.setChildDetailsValid(valid);
    },
  })),
  withHooks(({ childrenModel, syncChildren, valid }) => ({
    onInit(): void {
      effect(() => {
        const children = childrenModel().map((child) => normalizeChildDraft(child));
        const formValid = valid();

        untracked(() => {
          syncChildren(children, formValid);
        });
      });
    },
  })),
);

function createEmptyChild(id: number): RegistrationChildDraft {
  return {
    id,
    name: '',
    birthDate: '',
    allergyAnswer: AllergyAnswer.No,
    allergyDetails: '',
  };
}

function normalizeChildDraft(child: RegistrationChildDraft): RegistrationChildDraft {
  return {
    ...child,
    allergyAnswer: child.allergyAnswer === AllergyAnswer.Yes ? AllergyAnswer.Yes : AllergyAnswer.No,
    allergyDetails: child.allergyDetails ?? '',
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

function isSameDateParts(date: Date, year: number, month: number, day: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
