import { computed, effect, inject, signal, untracked } from '@angular/core';
import { form, validate } from '@angular/forms/signals';
import { signalStore, withComputed, withHooks, withMethods, withProps } from '@ngrx/signals';
import { isValidEmail } from '../../../../app/utils/email.validation';
import { ISRAELI_MOBILE_PHONE_ERROR_MESSAGE, isValidIsraeliMobilePhone } from '../../../shared/validations/phone.validation';
import { FULL_NAME_ERROR_MESSAGE, hasMinimumTrimmedLength } from '../../../shared/validations/text.validation';
import { RegistrationStore } from '../../registration.store';

type ParentDetailsFormModel = {
  fullName: string;
  phoneNumber: string;
  email: string;
};

export const ParentDetailsStageStore = signalStore(
  withProps(() => {
    const registrationStore = inject(RegistrationStore);
    const parentModel = signal<ParentDetailsFormModel>({
      fullName: registrationStore.parentDetails().fullName,
      phoneNumber: registrationStore.parentDetails().phoneNumber,
      email: registrationStore.parentDetails().email,
    });
    const parentForm = form(parentModel, (parent) => {
      validate(parent.fullName, ({ value }) => {
        return hasMinimumTrimmedLength(value(), 2) ? undefined : { kind: 'full-name', message: FULL_NAME_ERROR_MESSAGE };
      });

      validate(parent.phoneNumber, ({ value }) => {
        return isValidIsraeliMobilePhone(value()) ? undefined : { kind: 'phone', message: ISRAELI_MOBILE_PHONE_ERROR_MESSAGE };
      });

      validate(parent.email, ({ value }) => {
        return isValidEmail(value()) ? undefined : { kind: 'email', message: 'כתובת האימייל אינה תקינה.' };
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
    const phoneHasError = computed(() => parentForm.phoneNumber().touched() && parentForm.phoneNumber().invalid());
    const emailHasError = computed(() => parentForm.email().touched() && parentForm.email().invalid());
    const fullNameError = computed(() => (fullNameHasError() ? parentForm.fullName().errors()[0]?.message || FULL_NAME_ERROR_MESSAGE : ''));
    const phoneError = computed(() => (phoneHasError() ? parentForm.phoneNumber().errors()[0]?.message || ISRAELI_MOBILE_PHONE_ERROR_MESSAGE : ''));
    const emailError = computed(() => (emailHasError() ? parentForm.email().errors()[0]?.message || 'כתובת האימייל אינה תקינה.' : ''));

    return {
      fullNameHasError,
      phoneHasError,
      emailHasError,
      fullNameError,
      phoneError,
      emailError,
    };
  }),
  withMethods(({ registrationStore }) => ({
    syncParentDetails(parent: ParentDetailsFormModel): void {
      registrationStore.setParentFullName(parent.fullName);
      registrationStore.setParentPhoneNumber(parent.phoneNumber);
      registrationStore.setParentEmail(parent.email);
    },
  })),
  withHooks(({ parentModel, registrationStore, syncParentDetails }) => ({
    onInit(): void {
      effect(() => {
        const parent = registrationStore.parentDetails();

        untracked(() => {
          const currentParent = parentModel();

          if (
            currentParent.fullName !== parent.fullName
            || currentParent.phoneNumber !== parent.phoneNumber
            || currentParent.email !== parent.email
          ) {
            parentModel.set({
              fullName: parent.fullName,
              phoneNumber: parent.phoneNumber,
              email: parent.email,
            });
          }
        });
      });

      effect(() => {
        const parent = parentModel();

        untracked(() => {
          syncParentDetails(parent);
        });
      });
    },
  })),
);
