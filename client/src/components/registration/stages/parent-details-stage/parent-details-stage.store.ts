import { computed, effect, inject, signal, untracked } from '@angular/core';
import { form, validate } from '@angular/forms/signals';
import { signalStore, withComputed, withHooks, withMethods, withProps } from '@ngrx/signals';
import { ISRAELI_MOBILE_PHONE_ERROR_MESSAGE, isValidIsraeliMobilePhone } from '../../../shared/validations/phone.validation';
import { FULL_NAME_ERROR_MESSAGE, hasMinimumTrimmedLength } from '../../../shared/validations/text.validation';
import { RegistrationStore } from '../../registration.store';

type ParentDetailsFormModel = {
  fullName: string;
  phone: string;
};

export const ParentDetailsStageStore = signalStore(
  withProps(() => {
    const registrationStore = inject(RegistrationStore);
    const parentModel = signal<ParentDetailsFormModel>({
      fullName: registrationStore.parentDetails().fullName,
      phone: registrationStore.parentDetails().phone,
    });
    const parentForm = form(parentModel, (parent) => {
      validate(parent.fullName, ({ value }) => {
        return hasMinimumTrimmedLength(value(), 2) ? undefined : { kind: 'full-name', message: FULL_NAME_ERROR_MESSAGE };
      });

      validate(parent.phone, ({ value }) => {
        return isValidIsraeliMobilePhone(value()) ? undefined : { kind: 'phone', message: ISRAELI_MOBILE_PHONE_ERROR_MESSAGE };
      });
    });

    return {
      parentForm,
      parentModel,
      registrationStore,
    };
  }),
  withComputed(({ parentForm }) => {
    const fullNameHasError = computed(() => parentForm.fullName().touched() && parentForm.fullName().invalid());
    const phoneHasError = computed(() => parentForm.phone().touched() && parentForm.phone().invalid());
    const fullNameError = computed(() => (fullNameHasError() ? parentForm.fullName().errors()[0]?.message || FULL_NAME_ERROR_MESSAGE : ''));
    const phoneError = computed(() => (phoneHasError() ? parentForm.phone().errors()[0]?.message || ISRAELI_MOBILE_PHONE_ERROR_MESSAGE : ''));

    return {
      fullNameHasError,
      phoneHasError,
      fullNameError,
      phoneError,
    };
  }),
  withMethods(({ registrationStore }) => ({
    syncParentDetails(parent: ParentDetailsFormModel): void {
      registrationStore.setParentFullName(parent.fullName);
      registrationStore.setParentPhone(parent.phone);
    },
  })),
  withHooks(({ parentModel, syncParentDetails }) => ({
    onInit(): void {
      effect(() => {
        const parent = parentModel();

        untracked(() => {
          syncParentDetails(parent);
        });
      });
    },
  })),
);
