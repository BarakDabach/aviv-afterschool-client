import { computed, effect, inject, signal, untracked } from '@angular/core';
import { form, validate } from '@angular/forms/signals';
import { signalStore, withComputed, withHooks, withProps } from '@ngrx/signals';
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
  withComputed(({ parentForm }) => ({
    fullNameHasError: computed(() => parentForm.fullName().touched() && parentForm.fullName().invalid()),
    phoneHasError: computed(() => parentForm.phone().touched() && parentForm.phone().invalid()),
    fullNameError: computed(() => (parentForm.fullName().touched() && parentForm.fullName().invalid() ? parentForm.fullName().errors()[0]?.message || FULL_NAME_ERROR_MESSAGE : '')),
    phoneError: computed(() =>
      parentForm.phone().touched() && parentForm.phone().invalid() ? parentForm.phone().errors()[0]?.message || ISRAELI_MOBILE_PHONE_ERROR_MESSAGE : '',
    ),
  })),
  withHooks(({ parentModel, registrationStore }) => ({
    onInit(): void {
      effect(() => {
        const parent = parentModel();

        untracked(() => {
          registrationStore.setParentFullName(parent.fullName);
          registrationStore.setParentPhone(parent.phone);
        });
      });
    },
  })),
);
