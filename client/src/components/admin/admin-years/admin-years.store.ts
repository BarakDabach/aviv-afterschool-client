import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { AdminFacade } from '../../../app/facades/admin.facade';
import {
  Gender,
  PaymentMethod,
  REGISTRATION_STATUS_DISPLAY,
  RegistrationChildStatus,
  RegistrationStatus,
} from '../../../app/types/registration-status.type';
import type { AdminYearChild, AdminYearsOverview, AdminYearSummary } from '../../../app/types/admin.type';

type AdminYearsState = {
  overview: AdminYearsOverview | null;
  loading: boolean;
  error: string | null;
  activeFormMode: AdminYearFormMode | null;
};

export type AdminYearFormMode = 'create' | 'duplicate' | 'edit';

export type AdminYearChildView = AdminYearChild & {
  genderLabel: string;
  planLabel: string;
  paymentMethodLabel: string;
  registrationStatusLabel: string;
  registrationStatusTone: 'success' | 'warning' | 'danger' | 'neutral';
  removedLabel: string | null;
  avatarSrc: string;
  avatarAlt: string;
};

export type AdminYearView = Omit<AdminYearSummary, 'children'> & {
  label: string;
  children: AdminYearChildView[];
};

export const AdminYearsStore = signalStore(
  withState<AdminYearsState>({
    overview: null,
    loading: false,
    error: null,
    activeFormMode: null,
  }),
  withProps(() => ({
    adminFacade: inject(AdminFacade),
  })),
  withComputed(({ overview, error, activeFormMode }) => ({
    hasError: computed(() => error() !== null),
    currentYear: computed(() => overview() ? toYearView(overview()!.currentYear) : null),
    historicalYears: computed(() => overview()?.historicalYears.map(toYearView) ?? []),
    formDialogOpen: computed(() => activeFormMode() !== null),
  })),
  withMethods((store) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });

      try {
        patchState(store, {
          overview: await store.adminFacade.getYearsOverview(),
          loading: false,
        });
      } catch (error) {
        patchState(store, {
          loading: false,
          error: error instanceof Error && error.message
            ? error.message
            : 'לא ניתן לטעון את שנות העבודה.',
        });
      }
    },
    openYearForm(mode: AdminYearFormMode): void {
      patchState(store, { activeFormMode: mode });
    },
    closeYearForm(): void {
      patchState(store, { activeFormMode: null });
    },
    applyYearsOverview(overview: AdminYearsOverview): void {
      patchState(store, { overview, activeFormMode: null });
    },
  })),
  withHooks((store) => ({
    onInit(): void {
      void store.load();
    },
  })),
);

function toYearView(year: AdminYearSummary): AdminYearView {
  return {
    ...year,
    label: `${year.yearNumber - 1}/${year.yearNumber}`,
    children: year.children.map(toChildView),
  };
}

function toChildView(child: AdminYearChild): AdminYearChildView {
  const isBoy = child.gender === Gender.Male;

  return {
    ...child,
    genderLabel: isBoy ? 'בן' : 'בת',
    planLabel: child.planName || 'לא נבחרה תוכנית',
    paymentMethodLabel: child.paymentMethod === PaymentMethod.Cash ? 'מזומן' : 'הוראת קבע',
    registrationStatusLabel: REGISTRATION_STATUS_DISPLAY[child.registrationStatus].label,
    registrationStatusTone: statusTone(child.registrationStatus),
    removedLabel: child.yearStatus === RegistrationChildStatus.Left
      ? (isBoy ? 'הוסר' : 'הוסרה')
      : null,
    avatarSrc: isBoy ? '/assets/child-avatar-boy.png' : '/assets/child-avatar-girl.png',
    avatarAlt: isBoy ? 'ילד' : 'ילדה',
  };
}

function statusTone(status: RegistrationStatus): AdminYearChildView['registrationStatusTone'] {
  switch (status) {
    case RegistrationStatus.Approved:
      return 'success';
    case RegistrationStatus.Rejected:
      return 'danger';
    case RegistrationStatus.Cancelled:
      return 'neutral';
    default:
      return 'warning';
  }
}
