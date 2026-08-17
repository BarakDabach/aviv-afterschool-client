import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthFacade } from '../../app/facades/auth.facade';
import { MockAuthFacade } from '../../app/facades/mock-auth.facade';
import { DataService } from '../../app/services/data.service';
import { MockDataService } from '../../app/services/mock-data.service';
import { ParentLogin } from './parent-login';

@Component({
  template: '',
})
class EmptyRouteComponent {}

const setInputValue = (input: HTMLInputElement, value: string): void => {
  input.value = value;
  input.dispatchEvent(new Event('input'));
};

describe('ParentLogin', () => {
  let fixture: ComponentFixture<ParentLogin>;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ParentLogin],
      providers: [
        {
          provide: AuthFacade,
          useClass: MockAuthFacade,
        },
        {
          provide: DataService,
          useClass: MockDataService,
        },
        provideRouter([
          { path: 'home', component: EmptyRouteComponent },
          { path: 'admin', component: EmptyRouteComponent },
          { path: 'registration', component: EmptyRouteComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ParentLogin);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('renders the email OTP login screen from the SDS flow', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('כתובת אימייל');
    expect(compiled.textContent).toContain('שליחת קוד אימות');
    expect(compiled.textContent).toContain('אין צורך בסיסמה');
  });

  it('shows field-level validation for invalid email and OTP input', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('input[aria-label="כתובת אימייל"]') as HTMLInputElement;

    setInputValue(emailInput, 'bad-email');
    emailInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('כתובת האימייל אינה תקינה');
    expect(emailInput.getAttribute('aria-invalid')).toBe('true');

    setInputValue(emailInput, 'parent@example.com');
    fixture.detectChanges();

    const requestButton = Array.from(compiled.querySelectorAll('button')).find((button) => button.textContent?.includes('שליחת קוד אימות')) as HTMLButtonElement;
    requestButton.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const otpInput = compiled.querySelector('input[aria-label="קוד אימות"]') as HTMLInputElement;
    setInputValue(otpInput, '12');
    otpInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('קוד האימות צריך להכיל 6 ספרות');
    expect(otpInput.getAttribute('aria-invalid')).toBe('true');
  });

  it('moves from email entry to OTP verification and signs in a parent', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('input[aria-label="כתובת אימייל"]') as HTMLInputElement;

    setInputValue(emailInput, 'parent@example.com');
    fixture.detectChanges();

    const requestButton = Array.from(compiled.querySelectorAll('button')).find((button) => button.textContent?.includes('שליחת קוד אימות')) as HTMLButtonElement;
    requestButton.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('קוד אימות');
    expect(compiled.textContent).toContain('שליחה מחדש בעוד');
    expect(compiled.textContent).not.toContain('שינוי כתובת אימייל');
    expect(compiled.textContent).not.toContain('הקוד נשלח אל');

    const otpInput = compiled.querySelector('input[aria-label="קוד אימות"]') as HTMLInputElement;
    setInputValue(otpInput, '123456');
    fixture.detectChanges();

    const verifyButton = Array.from(compiled.querySelectorAll('button')).find((button) => button.textContent?.includes('כניסה למערכת')) as HTMLButtonElement;
    verifyButton.click();
    await fixture.whenStable();

    expect(router.url).toBe('/home');
  });
});
