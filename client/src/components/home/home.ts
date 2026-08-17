import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendarDays,
  lucideCheck,
  lucideChevronLeft,
  lucideClock3,
  lucideFileText,
  lucideFileUp,
  lucideSave,
  lucideTrash2,
  lucideUpload,
  lucideUser,
  lucideUserRound,
  lucideUsersRound,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { ParentHomeStore } from './home.store';

@Component({
  selector: 'app-home',
  imports: [NgClass, NgIcon, RouterLink, HlmButtonImports],
  providers: [
    ParentHomeStore,
    provideIcons({
      lucideArrowLeft,
      lucideCalendarDays,
      lucideCheck,
      lucideChevronLeft,
      lucideClock3,
      lucideFileText,
      lucideFileUp,
      lucideSave,
      lucideTrash2,
      lucideUpload,
      lucideUser,
      lucideUserRound,
      lucideUsersRound,
    }),
  ],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly store = inject(ParentHomeStore);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((paramMap) => {
      const rawRegistrationId = paramMap.get('registrationId');
      const registrationId = rawRegistrationId ? Number(rawRegistrationId) : null;

      void this.store.load(Number.isFinite(registrationId) ? registrationId : null);
    });
  }
}
