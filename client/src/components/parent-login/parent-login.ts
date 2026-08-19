import { ChangeDetectionStrategy, Component, ElementRef, HostListener, effect, inject, viewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideKeyRound } from '@ng-icons/lucide';
import { BrnInputOtpImports } from '@spartan-ng/brain/input-otp';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { LoginStore } from '../../features/auth/login.store';
import { DetailsCard } from '../shared/details-card/details-card';

@Component({
  selector: 'app-parent-login',
  imports: [NgClass, NgIcon, RouterLink, BrnInputOtpImports, HlmButtonImports, HlmInputImports, DetailsCard],
  providers: [
    LoginStore,
    provideIcons({
      lucideArrowLeft,
      lucideKeyRound,
    }),
  ],
  templateUrl: './parent-login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentLogin {
  protected readonly store = inject(LoginStore);
  protected readonly otpSlots = [0, 1, 2, 3, 4, 5];
  private readonly requestOtpButton = viewChild<ElementRef<HTMLButtonElement>>('requestOtpButton');
  private readonly verifyButton = viewChild<ElementRef<HTMLButtonElement>>('verifyButton');
  private hasOtpHistoryEntry = false;
  private otpCompletionHandled = false;

  constructor() {
    effect(() => {
      if (this.store.step() !== 'otp' || this.hasOtpHistoryEntry) {
        return;
      }

      window.history.pushState({ parentLoginStep: 'otp' }, '', window.location.href);
      this.hasOtpHistoryEntry = true;
    });
  }

  @HostListener('window:popstate')
  protected handleHistoryBack(): void {
    if (this.store.step() !== 'otp') {
      return;
    }

    this.hasOtpHistoryEntry = false;
    this.store.editEmail();
  }

  protected handleOtpInput(value: string): void {
    this.store.updateOtp(value);

    if (value.replace(/\D/g, '').length < 6) {
      this.otpCompletionHandled = false;
      return;
    }

    if (this.otpCompletionHandled) {
      return;
    }

    this.otpCompletionHandled = true;
    this.closeOtpKeyboardAndFocusLogin();
  }

  protected handleOtpCompleted(value: string): void {
    this.handleOtpInput(value);
  }

  protected focusRequestOtpButton(event: Event): void {
    event.preventDefault();
    this.store.markEmailTouched();

    queueMicrotask(() => {
      const button = this.requestOtpButton()?.nativeElement;

      if (button && !button.disabled) {
        button.focus({ preventScroll: true });
      }
    });
  }

  private closeOtpKeyboardAndFocusLogin(): void {
    const otpInput = document.getElementById('login-otp-input') as HTMLInputElement | null;
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    otpInput?.blur();

    if (activeElement?.id === 'login-otp-input') {
      activeElement.blur();
    }

    window.setTimeout(() => {
      otpInput?.blur();

      const button = this.verifyButton()?.nativeElement;

      if (button && !button.disabled) {
        button.focus({ preventScroll: true });
      }
    }, 80);
  }

  protected navigateToEmailStep(): void {
    if (this.hasOtpHistoryEntry) {
      window.history.back();
      return;
    }

    this.store.editEmail();
  }
}
