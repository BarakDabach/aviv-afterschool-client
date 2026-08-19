import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminFacade } from '../../../app/facades/admin.facade';
import type { AdminYearsOverview } from '../../../app/types/admin.type';
import {
  Gender,
  PaymentMethod,
  RegistrationChildStatus,
  RegistrationStatus,
} from '../../../app/types/registration-status.type';
import { AdminYearsStore } from './admin-years.store';

describe('AdminYearsStore', () => {
  let getYearsOverview: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getYearsOverview = vi.fn().mockResolvedValue(createOverview());

    TestBed.configureTestingModule({
      providers: [
        AdminYearsStore,
        {
          provide: AdminFacade,
          useValue: { getYearsOverview },
        },
      ],
    });
  });

  it('loads and formats current and historical year summaries', async () => {
    const store = TestBed.inject(AdminYearsStore);

    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(getYearsOverview).toHaveBeenCalledTimes(1);
    expect(store.currentYear()?.label).toBe('2026/2027');
    expect(store.historicalYears().map((year) => year.label)).toEqual(['2025/2026']);
  });

  it('formats removal state by gender and omits it for active children', async () => {
    const store = TestBed.inject(AdminYearsStore);

    await vi.waitFor(() => expect(store.currentYear()?.children.length).toBe(3));

    const [activeBoy, removedBoy, removedGirl] = store.currentYear()!.children;
    expect(activeBoy.removedLabel).toBeNull();
    expect(removedBoy.removedLabel).toBe('הוסר');
    expect(removedGirl.removedLabel).toBe('הוסרה');
    expect(activeBoy).not.toHaveProperty('dateOfBirth');
  });

  it('maps payment and registration states into ready-to-render labels', async () => {
    const store = TestBed.inject(AdminYearsStore);

    await vi.waitFor(() => expect(store.currentYear()).not.toBeNull());

    const children = store.currentYear()!.children;
    expect(children[0].paymentMethodLabel).toBe('הוראת קבע');
    expect(children[0].registrationStatusLabel).toBe('מאושרת');
    expect(children[1].registrationStatusLabel).toBe('ממתינה לאישור');
  });
});

function createOverview(): AdminYearsOverview {
  return {
    currentYear: {
      yearId: 2,
      yearNumber: 2027,
      isCurrent: true,
      registeredChildren: 3,
      usedCapacity: 1,
      maxChildCapacity: 30,
      oneTimeInsuranceAmount: 200,
      children: [
        child(10, 1, 'אורי לוי', Gender.Male, RegistrationChildStatus.Active, RegistrationStatus.Approved),
        child(10, 2, 'דני לוי', Gender.Male, RegistrationChildStatus.Left, RegistrationStatus.PendingApproval),
        child(11, 1, 'נועה כהן', Gender.Female, RegistrationChildStatus.Left, RegistrationStatus.Cancelled),
      ],
    },
    historicalYears: [{
      yearId: 1,
      yearNumber: 2026,
      isCurrent: false,
      registeredChildren: 0,
      usedCapacity: 0,
      maxChildCapacity: 28,
      oneTimeInsuranceAmount: 180,
      children: [],
    }],
  };
}

function child(
  registrationId: number,
  registrationChildId: number,
  fullName: string,
  gender: Gender,
  yearStatus: RegistrationChildStatus,
  registrationStatus: RegistrationStatus,
) {
  return {
    registrationId,
    registrationChildId,
    fullName,
    gender,
    parentPhoneNumber: '050-123-4567',
    planName: '3 פעמים בשבוע',
    paymentMethod: PaymentMethod.StandingOrder,
    registrationStatus,
    yearStatus,
  };
}
