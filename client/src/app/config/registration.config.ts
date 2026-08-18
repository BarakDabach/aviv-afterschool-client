import type { AvailableYearPlan, HolidayPeriod, Year } from '../types/registration-status.type';

export const ACTIVE_REGISTRATION_YEAR: Year = { id: 1, yearNumber: 2027 };

export const AVAILABLE_YEAR_PLANS: AvailableYearPlan[] = [
  { yearPlanId: 101, plan: { id: 1, name: 'מסלול חודשי מלא', price: 1450, hours: 'ימים א-ה עד 16:30', isActive: true, requiresStandingOrder: true } },
  { yearPlanId: 102, plan: { id: 2, name: 'מסלול יומי', price: 1050, hours: 'שלושה ימים לבחירה עד 16:30', isActive: true, requiresStandingOrder: false } },
];

export const REGISTRATION_HOLIDAY_PERIODS: HolidayPeriod[] = [
  { id: 1, yearId: ACTIVE_REGISTRATION_YEAR.id, name: 'ראש השנה', startDate: '2026-09-12', endDate: '2026-09-14' },
  { id: 2, yearId: ACTIVE_REGISTRATION_YEAR.id, name: 'סוכות', startDate: '2026-09-27', endDate: '2026-10-04' },
  { id: 3, yearId: ACTIVE_REGISTRATION_YEAR.id, name: 'חנוכה', startDate: '2026-12-08', endDate: '2026-12-15' },
];

export const ADMIN_CHILD_CAPACITY = 60;
