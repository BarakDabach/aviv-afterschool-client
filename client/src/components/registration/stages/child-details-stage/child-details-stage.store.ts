import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { applyEach, applyWhen, form, schema, validate, type FieldTree } from '@angular/forms/signals';
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

@Injectable()
export class ChildDetailsStageStore {
  private readonly registrationStore = inject(RegistrationStore);
  private readonly childrenModel = signal<ChildDetailsFormModel>(
    this.registrationStore.children().map((child) => this.normalizeChildDraft(child)),
  );

  readonly childrenForm = form(this.childrenModel, (children) => {
    applyEach(children, childDetailsSchema);
  });

  readonly children = computed(() => this.childrenModel());
  readonly valid = computed(() => this.children().length > 0 && this.childrenForm().valid());

  childField(index: number): ChildDetailsField {
    return this.childrenForm[index];
  }

  constructor() {
    effect(() => {
      const children = this.childrenModel().map((child) => this.normalizeChildDraft(child));
      const valid = this.valid();

      untracked(() => {
        this.registrationStore.setChildren(children);
        this.registrationStore.setChildDetailsValid(valid);
      });
    });
  }

  addChild(): void {
    this.childrenModel.update((children) => [
      ...children,
      this.createEmptyChild(this.registrationStore.reserveChildId()),
    ]);
  }

  removeChild(childId: number): void {
    this.childrenModel.update((children) => {
      const nextChildren = children.filter((child) => child.id !== childId);

      return nextChildren.length ? nextChildren : [this.createEmptyChild(this.registrationStore.reserveChildId())];
    });
  }

  setBirthDate(childField: ChildDetailsField, birthDate: string): void {
    childField.birthDate().value.set(birthDate);
    childField.birthDate().markAsTouched();
  }

  setAllergyAnswer(childField: ChildDetailsField, allergyAnswer: string): void {
    if (allergyAnswer !== AllergyAnswer.Yes && allergyAnswer !== AllergyAnswer.No) return;

    childField.allergyAnswer().value.set(allergyAnswer);
    childField.allergyAnswer().markAsTouched();

    if (allergyAnswer === AllergyAnswer.No) {
      childField.allergyDetails().value.set('');
      childField.allergyDetails().reset('');
    }
  }

  childDisplayName(child: RegistrationChildDraft, index: number): string {
    return child.name.trim() || `ילד ${index + 1}`;
  }

  childNameHasError(childField: ChildDetailsField): boolean {
    return childField.name().touched() && childField.name().invalid();
  }

  birthDateHasError(childField: ChildDetailsField): boolean {
    return childField.birthDate().touched() && childField.birthDate().invalid();
  }

  allergyDetailsHasError(childField: ChildDetailsField): boolean {
    return childField.allergyDetails().touched() && childField.allergyDetails().invalid();
  }

  childNameError(childField: ChildDetailsField): string {
    return this.childNameHasError(childField) ? childField.name().errors()[0]?.message || 'הזינו שם מלא של הילד' : '';
  }

  birthDateError(childField: ChildDetailsField): string {
    return this.birthDateHasError(childField) ? childField.birthDate().errors()[0]?.message || 'הזינו תאריך לידה' : '';
  }

  allergyDetailsError(childField: ChildDetailsField): string {
    return this.allergyDetailsHasError(childField)
      ? childField.allergyDetails().errors()[0]?.message || 'פרטו את האלרגיות או הרגישויות'
      : '';
  }

  private createEmptyChild(id: number): RegistrationChildDraft {
    return {
      id,
      name: '',
      birthDate: '',
      allergyAnswer: AllergyAnswer.No,
      allergyDetails: '',
    };
  }

  private normalizeChildDraft(child: RegistrationChildDraft): RegistrationChildDraft {
    return {
      ...child,
      allergyAnswer: child.allergyAnswer === AllergyAnswer.Yes ? AllergyAnswer.Yes : AllergyAnswer.No,
      allergyDetails: child.allergyDetails ?? '',
    };
  }
}
