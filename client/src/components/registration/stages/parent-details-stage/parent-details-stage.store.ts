import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { form, validate } from '@angular/forms/signals';
import { RegistrationStore } from '../../registration.store';

type ParentDetailsFormModel = {
  fullName: string;
  phone: string;
};

@Injectable()
export class ParentDetailsStageStore {
  private readonly registrationStore = inject(RegistrationStore);
  private readonly parentModel = signal<ParentDetailsFormModel>({
    fullName: this.registrationStore.parentDetails().fullName,
    phone: this.registrationStore.parentDetails().phone,
  });

  readonly parentForm = form(this.parentModel, (parent) => {
    validate(parent.fullName, ({ value }) => {
      return value().trim().length > 1 ? undefined : { kind: 'full-name', message: 'הזינו שם מלא' };
    });

    validate(parent.phone, ({ value }) => {
      const normalizedPhone = value().replace(/\D/g, '');

      return /^05\d{8}$/.test(normalizedPhone) ? undefined : { kind: 'phone', message: 'הזינו מספר נייד תקין' };
    });
  });

  readonly fullNameHasError = computed(() => this.parentForm.fullName().touched() && this.parentForm.fullName().invalid());
  readonly phoneHasError = computed(() => this.parentForm.phone().touched() && this.parentForm.phone().invalid());

  readonly fullNameError = computed(() => (this.fullNameHasError() ? this.parentForm.fullName().errors()[0]?.message || 'הזינו שם מלא' : ''));
  readonly phoneError = computed(() => (this.phoneHasError() ? this.parentForm.phone().errors()[0]?.message || 'הזינו מספר נייד תקין' : ''));

  constructor() {
    effect(() => {
      const parent = this.parentModel();

      untracked(() => {
        this.registrationStore.setParentFullName(parent.fullName);
        this.registrationStore.setParentPhone(parent.phone);
      });
    });
  }
}
