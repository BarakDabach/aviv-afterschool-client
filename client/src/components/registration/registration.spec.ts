import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthFacade } from '../../app/facades/auth.facade';
import { ParentFacade } from '../../app/facades/parent.facade';
import { NotificationService } from '../../app/services/notification.service';
import { GlobalStore } from '../../app/stores/global.store';
import { RegistrationStore } from './registration.store';
import { Registration } from './registration';

describe('Registration', () => {
  let fixture: ComponentFixture<Registration>;
  let globalStore: InstanceType<typeof GlobalStore>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Registration],
      providers: [
        {
          provide: AuthFacade,
          useValue: {
            getMe: vi.fn().mockResolvedValue(null),
            requestOtp: vi.fn(),
            verifyOtp: vi.fn(),
            logout: vi.fn(),
          },
        },
        {
          provide: ParentFacade,
          useValue: {
            getActiveRegistrationYear: vi.fn().mockResolvedValue({ id: 1, yearNumber: 2027 }),
            getAvailableYearPlans: vi.fn().mockResolvedValue([
              {
                yearPlanId: 101,
                plan: {
                  id: 1,
                  name: '4-5 פעמים בשבוע',
                  price: 1350,
                  hours: '13:00-17:00',
                  isActive: true,
                  requiresStandingOrder: true,
                },
              },
            ]),
            getParentHome: vi.fn().mockResolvedValue({
              parent: {
                id: 1,
                fullName: 'דנה לוי',
                email: 'dana@example.com',
                phoneNumber: '0501234567',
              },
              activeRegistration: null,
              registrationHistory: [],
              holidayPeriods: [],
            }),
            submitRegistration: vi.fn(),
            uploadRegistrationDocument: vi.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            success: vi.fn(),
            info: vi.fn(),
            warning: vi.fn(),
            error: vi.fn(),
          },
        },
        provideRouter([]),
      ],
    }).compileComponents();

    globalStore = TestBed.inject(GlobalStore);
    globalStore.setUser({
      id: 'parent-1',
      role: 'parent',
      fullName: 'דנה לוי',
      email: 'dana@example.com',
      phoneNumber: '0501234567',
    });

    fixture = TestBed.createComponent(Registration);
    fixture.detectChanges();
    await settleSignals();
    fixture.detectChanges();
  });

  it('starts logged-in parents at the children step', () => {
    const store = fixture.componentRef.injector.get(RegistrationStore);

    expect(store.activeStep()).toBe(1);
    expect(store.parentDetails()).toEqual(expect.objectContaining({
      fullName: 'דנה לוי',
      email: 'dana@example.com',
      phoneNumber: '0501234567',
    }));
  });

  it('allows a logged-in parent to navigate back to the parent stage manually', async () => {
    const store = fixture.componentRef.injector.get(RegistrationStore);

    expect(store.activeStep()).toBe(1);

    store.setActiveStep(0);
    fixture.detectChanges();
    await settleSignals();
    fixture.detectChanges();

    expect(store.activeStep()).toBe(0);
  });
});

async function settleSignals(): Promise<void> {
  for (let index = 0; index < 10; index += 1) {
    await Promise.resolve();
  }
}
