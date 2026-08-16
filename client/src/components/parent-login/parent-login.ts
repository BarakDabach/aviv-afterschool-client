import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideKeyRound } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { LoginStore } from '../../features/auth/login.store';

@Component({
  selector: 'app-parent-login',
  imports: [NgClass, NgIcon, RouterLink, HlmButtonImports, HlmInputImports],
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
}
