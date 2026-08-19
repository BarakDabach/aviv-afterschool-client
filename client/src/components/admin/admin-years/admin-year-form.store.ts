import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AdminFacade } from '../../../app/facades/admin.facade';
import type { AdminYearCreateRequest, AdminYearUpdateRequest, AdminYearsOverview } from '../../../app/types/admin.type';
import type { AdminYearView } from './admin-years.store';

export type AdminYearFormMode = 'create' | 'duplicate' | 'edit';

export type AdminYearPlanFormRow = {
  yearPlanId: number;
  name: string;
  hint: string;
  price: string;
  visible: boolean;
  priceLocked: boolean;
};

export type AdminYearHolidayFormRow = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

type AdminYearFormState = {
  mode: AdminYearFormMode;
  yearLabel: string;
  plans: AdminYearPlanFormRow[];
  holidays: AdminYearHolidayFormRow[];
  contractFileName: string | null;
  contractMimeType: string | null;
  capacity: string;
  insuranceAmount: string;
  submitted: boolean;
  submitting: boolean;
  successMessage: string | null;
  error: string | null;
  priceLocked: boolean;
  insuranceLocked: boolean;
};

const initialState: AdminYearFormState = {
  mode: 'create',
  yearLabel: '',
  plans: [],
  holidays: [],
  contractFileName: null,
  contractMimeType: null,
  capacity: '',
  insuranceAmount: '',
  submitted: false,
  submitting: false,
  successMessage: null,
  error: null,
  priceLocked: false,
  insuranceLocked: false,
};

export const AdminYearFormStore = signalStore(
  withState<AdminYearFormState>(initialState),
  withComputed(({ mode, plans, holidays, contractFileName, capacity, insuranceAmount, submitted, insuranceLocked }) => ({
    title: computed(() => {
      switch (mode()) {
        case 'duplicate':
          return 'שכפול שנה נוכחית';
        case 'edit':
          return 'עריכת שנה';
        default:
          return 'יצירת שנה חדשה';
      }
    }),
    primaryActionLabel: computed(() => {
      switch (mode()) {
        case 'duplicate':
          return 'יצירת שנה משוכפלת';
        case 'edit':
          return 'שמירת שינויים';
        default:
          return 'יצירת שנה';
      }
    }),
    contractRequired: computed(() => mode() === 'create'),
    contractHasError: computed(() => submitted() && mode() === 'create' && !contractFileName()),
    plansHaveError: computed(() => submitted() && plans().some((plan) => plan.visible && !isPositiveAmount(plan.price))),
    capacityHasError: computed(() => submitted() && !isPositiveInteger(capacity())),
    insuranceHasError: computed(() => submitted() && !insuranceLocked() && !isPositiveAmount(insuranceAmount())),
    holidaysHaveError: computed(() => submitted() && holidays().some((holiday) => !isHolidayCompleteOrEmpty(holiday))),
    canSubmit: computed(() =>
      plans().every((plan) => !plan.visible || isPositiveAmount(plan.price))
      && isPositiveInteger(capacity())
      && (mode() !== 'create' || Boolean(contractFileName()))
      && (insuranceLocked() || isPositiveAmount(insuranceAmount()))
      && holidays().every(isHolidayCompleteOrEmpty),
    ),
  })),
  withMethods((store, adminFacade = inject(AdminFacade)) => ({
    initialize(mode: AdminYearFormMode, currentYear: AdminYearView): void {
      const nextYearNumber = mode === 'edit' ? currentYear.yearNumber : currentYear.yearNumber + 1;
      const fieldsLocked = mode === 'edit' && currentYear.registeredChildren > 0;
      const sourcePlans = currentYear.plans.length ? currentYear.plans : [];

      patchState(store, {
        mode,
        yearLabel: `${nextYearNumber - 1}/${nextYearNumber}`,
        plans: sourcePlans.map((yearPlan) => ({
          yearPlanId: yearPlan.yearPlanId,
          name: yearPlan.plan.name,
          hint: yearPlan.plan.requiresStandingOrder ? 'חודשי · הוראת קבע' : 'חד פעמי',
          price: mode === 'create' ? '' : yearPlan.plan.price.toString(),
          visible: yearPlan.plan.isActive,
          priceLocked: fieldsLocked,
        })),
        holidays: mode === 'edit' && currentYear.holidayPeriods.length
          ? currentYear.holidayPeriods.map((holiday) => ({
            id: holiday.id,
            name: holiday.name,
            startDate: holiday.startDate,
            endDate: holiday.endDate,
          }))
          : [emptyHoliday()],
        contractFileName: mode === 'edit' ? currentYear.contractFileName : null,
        contractMimeType: mode === 'edit' && currentYear.contractFileName ? 'application/pdf' : null,
        capacity: mode === 'create' ? '' : currentYear.maxChildCapacity.toString(),
        insuranceAmount: mode === 'create' ? '' : currentYear.oneTimeInsuranceAmount.toString(),
        submitted: false,
        submitting: false,
        successMessage: null,
        error: null,
        priceLocked: fieldsLocked,
        insuranceLocked: fieldsLocked,
      });
    },
    updatePlanPrice(yearPlanId: number, price: string): void {
      patchState(store, {
        plans: store.plans().map((plan) => plan.yearPlanId === yearPlanId ? { ...plan, price } : plan),
      });
    },
    togglePlanVisibility(yearPlanId: number, visible: boolean): void {
      patchState(store, {
        plans: store.plans().map((plan) => plan.yearPlanId === yearPlanId ? { ...plan, visible } : plan),
      });
    },
    addHoliday(): void {
      patchState(store, { holidays: [...store.holidays(), emptyHoliday()] });
    },
    removeHoliday(id: number): void {
      patchState(store, { holidays: store.holidays().filter((holiday) => holiday.id !== id) });
    },
    updateHoliday(id: number, field: keyof Omit<AdminYearHolidayFormRow, 'id'>, value: string): void {
      patchState(store, {
        holidays: store.holidays().map((holiday) => holiday.id === id ? { ...holiday, [field]: value } : holiday),
      });
    },
    updateHolidayRange(id: number, range: [Date, Date] | null): void {
      patchState(store, {
        holidays: store.holidays().map((holiday) => holiday.id === id
          ? {
            ...holiday,
            startDate: range ? toIsoDate(range[0]) : '',
            endDate: range ? toIsoDate(range[1]) : '',
          }
          : holiday),
      });
    },
    selectContractFile(event: Event): void {
      const input = event.target instanceof HTMLInputElement ? event.target : null;
      const file = input?.files?.[0] ?? null;

      if (!file) return;

      patchState(store, { contractFileName: file.name, contractMimeType: file.type || 'application/octet-stream' });
    },
    clearContractFile(): void {
      patchState(store, { contractFileName: null, contractMimeType: null });
    },
    updateCapacity(capacity: string): void {
      patchState(store, { capacity });
    },
    updateInsuranceAmount(insuranceAmount: string): void {
      patchState(store, { insuranceAmount });
    },
    async submit(currentYear: AdminYearView): Promise<AdminYearsOverview | null> {
      patchState(store, { submitted: true, successMessage: null, error: null });

      if (!store.canSubmit()) return null;

      patchState(store, { submitting: true });

      try {
        const overview = store.mode() === 'edit'
          ? await adminFacade.updateYear(toUpdateRequest(store, currentYear))
          : await adminFacade.createYear(toCreateRequest(store, currentYear));

        patchState(store, {
          submitting: false,
          successMessage: successMessage(store.mode()),
        });
        return overview;
      } catch (error) {
        patchState(store, {
          submitting: false,
          error: error instanceof Error && error.message ? error.message : 'לא ניתן לשמור את שנת העבודה.',
        });
        return null;
      }
    },
  })),
);

let holidayId = 0;

function emptyHoliday(): AdminYearHolidayFormRow {
  holidayId += 1;

  return {
    id: holidayId,
    name: '',
    startDate: '',
    endDate: '',
  };
}

function isPositiveInteger(value: string): boolean {
  return /^[1-9]\d*$/.test(value.trim());
}

function isPositiveAmount(value: string): boolean {
  const normalized = value.trim();
  return normalized !== '' && Number.isFinite(Number(normalized)) && Number(normalized) > 0;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isHolidayCompleteOrEmpty(holiday: AdminYearHolidayFormRow): boolean {
  const hasAnyValue = Boolean(holiday.name || holiday.startDate || holiday.endDate);
  if (!hasAnyValue) return true;

  return Boolean(holiday.startDate && holiday.endDate && holiday.startDate <= holiday.endDate);
}

function successMessage(mode: AdminYearFormMode): string {
  switch (mode) {
    case 'duplicate':
      return 'טיוטת השנה המשוכפלת מוכנה לבדיקה.';
    case 'edit':
      return 'השינויים נשמרו בטיוטת המוק.';
    default:
      return 'טיוטת השנה החדשה מוכנה לבדיקה.';
  }
}

function toCreateRequest(
  store: {
    mode: () => AdminYearFormMode;
    yearLabel: () => string;
    capacity: () => string;
    insuranceAmount: () => string;
    contractFileName: () => string | null;
    contractMimeType: () => string | null;
    plans: () => AdminYearPlanFormRow[];
    holidays: () => AdminYearHolidayFormRow[];
  },
  currentYear: AdminYearView,
): AdminYearCreateRequest {
  return {
    sourceYearId: store.mode() === 'duplicate' ? currentYear.yearId : undefined,
    yearNumber: yearNumberFromLabel(store.yearLabel()),
    maxChildCapacity: Number(store.capacity()),
    oneTimeInsuranceAmount: Number(store.insuranceAmount()),
    contractFileName: store.contractFileName() ?? '',
    contractMimeType: store.contractMimeType() ?? 'application/octet-stream',
    plans: store.plans().map((plan) => toPlanRequest(plan, currentYear)),
    holidayPeriods: store.holidays().map(toHolidayRequest),
  };
}

function toUpdateRequest(
  store: {
    capacity: () => string;
    insuranceLocked: () => boolean;
    insuranceAmount: () => string;
    contractFileName: () => string | null;
    contractMimeType: () => string | null;
    priceLocked: () => boolean;
    plans: () => AdminYearPlanFormRow[];
    holidays: () => AdminYearHolidayFormRow[];
  },
  currentYear: AdminYearView,
): AdminYearUpdateRequest {
  return {
    yearId: currentYear.yearId,
    maxChildCapacity: Number(store.capacity()),
    oneTimeInsuranceAmount: store.insuranceLocked() ? undefined : Number(store.insuranceAmount()),
    contractFileName: store.contractFileName() || undefined,
    contractMimeType: store.contractMimeType() || undefined,
    plans: store.priceLocked() ? undefined : store.plans().map((plan) => toPlanRequest(plan, currentYear)),
    holidayPeriods: store.holidays().map(toHolidayRequest),
  };
}

function toPlanRequest(plan: AdminYearPlanFormRow, currentYear: AdminYearView): AdminYearCreateRequest['plans'][number] {
  const sourcePlan = currentYear.plans.find((yearPlan) => yearPlan.yearPlanId === plan.yearPlanId)?.plan;

  return {
    planId: sourcePlan?.id ?? plan.yearPlanId,
    name: plan.name,
    price: Number(plan.price),
    hours: sourcePlan?.hours ?? '13:00-17:00',
    isActive: plan.visible,
    requiresStandingOrder: sourcePlan?.requiresStandingOrder ?? plan.name !== 'חד פעמי',
  };
}

function toHolidayRequest(holiday: AdminYearHolidayFormRow): AdminYearCreateRequest['holidayPeriods'][number] {
  return {
    name: holiday.name,
    startDate: holiday.startDate,
    endDate: holiday.endDate,
  };
}

function yearNumberFromLabel(label: string): number {
  const [, endYear] = label.split('/');
  return Number(endYear);
}
