import type { AvailableYearPlan, HolidayPeriod, Year } from '../types/registration-status.type';

export const ACTIVE_REGISTRATION_YEAR: Year = {
  id: 1,
  yearNumber: 2027,
  maxChildCapacity: 60,
  oneTimeInsuranceAmount: 200,
};

export const AVAILABLE_YEAR_PLANS: AvailableYearPlan[] = [
  { yearPlanId: 101, plan: { id: 1, name: '4-5 פעמים בשבוע', price: 1350, hours: '13:00-17:00', isActive: true, requiresStandingOrder: true } },
  { yearPlanId: 102, plan: { id: 2, name: '3 פעמים בשבוע', price: 1050, hours: '13:00-17:00', isActive: true, requiresStandingOrder: true } },
  { yearPlanId: 103, plan: { id: 3, name: '2 פעמים בשבוע', price: 850, hours: '13:00-17:00', isActive: true, requiresStandingOrder: true } },
  { yearPlanId: 104, plan: { id: 4, name: 'חד פעמי', price: 100, hours: '13:00-17:00', isActive: true, requiresStandingOrder: false } },
];

export const REGISTRATION_HOLIDAY_PERIODS: HolidayPeriod[] = [
  { id: 1, yearId: ACTIVE_REGISTRATION_YEAR.id, name: 'ראש השנה', startDate: '2026-09-12', endDate: '2026-09-14' },
  { id: 2, yearId: ACTIVE_REGISTRATION_YEAR.id, name: 'סוכות', startDate: '2026-09-27', endDate: '2026-10-04' },
  { id: 3, yearId: ACTIVE_REGISTRATION_YEAR.id, name: 'חנוכה', startDate: '2026-12-08', endDate: '2026-12-15' },
];
