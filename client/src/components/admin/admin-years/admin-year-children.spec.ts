import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Gender, PaymentMethod, RegistrationChildStatus, RegistrationStatus } from '../../../app/types/registration-status.type';
import { AdminYearChildren } from './admin-year-children';
import type { AdminYearChildView } from './admin-years.store';

describe('AdminYearChildren', () => {
  let fixture: ComponentFixture<AdminYearChildren>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminYearChildren] }).compileComponents();
    fixture = TestBed.createComponent(AdminYearChildren);
  });

  it('renders required child details without age or birth date', () => {
    const child = {
      registrationId: 1,
      registrationChildId: 1,
      fullName: 'נועה לוי',
      gender: Gender.Female,
      parentPhoneNumber: '050-123-4567',
      planName: '4-5 פעמים בשבוע',
      paymentMethod: PaymentMethod.StandingOrder,
      registrationStatus: RegistrationStatus.Approved,
      yearStatus: RegistrationChildStatus.Active,
      genderLabel: 'בת',
      planLabel: '4-5 פעמים בשבוע',
      paymentMethodLabel: 'הוראת קבע',
      registrationStatusLabel: 'מאושרת',
      registrationStatusTone: 'success',
      removedLabel: null,
      avatarSrc: '/assets/child-avatar-girl.png',
      avatarAlt: 'ילדה',
      dateOfBirth: '2021-03-14',
    } as AdminYearChildView & { dateOfBirth: string };

    fixture.componentRef.setInput('children', [child]);
    fixture.componentRef.setInput('layout', 'mobile');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('נועה לוי');
    expect(text).toContain('4-5 פעמים בשבוע');
    expect(text).toContain('הוראת קבע');
    expect(text).toContain('מאושרת');
    expect(text).not.toContain('2021-03-14');
    expect(text).not.toContain('גיל');
  });
});
