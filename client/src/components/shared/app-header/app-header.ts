import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { BrnDrawerImports } from '@spartan-ng/brain/drawer';
import {
  lucideCalendarDays,
  lucideCalendarRange,
  lucideHome,
  lucideLogOut,
  lucideMenu,
  lucideUserRound,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AuthFacade } from '../../../app/facades/auth.facade';
import { GlobalStore } from '../../../app/stores/global.store';

export type AppHeaderVariant = 'public' | 'back' | 'admin';

type HeaderNavItem = {
  label: string;
  route: string;
  icon: string;
};

@Component({
  selector: 'app-header',
  host: {
    class: 'sticky top-0 z-50 block',
  },
  imports: [NgClass, NgIcon, RouterLink, BrnDrawerImports, HlmButtonImports],
  providers: [
    provideIcons({
      lucideCalendarDays,
      lucideCalendarRange,
      lucideHome,
      lucideLogOut,
      lucideMenu,
      lucideUserRound,
      lucideX,
    }),
  ],
  templateUrl: './app-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
  private readonly authFacade = inject(AuthFacade);
  private readonly globalStore = inject(GlobalStore);
  private readonly router = inject(Router);

  readonly variant = input<AppHeaderVariant>('public');
  readonly actionLabel = input('התחברות');
  readonly actionRoute = input('/');
  readonly activePath = input('/');

  protected readonly menuOpen = signal(false);

  protected readonly adminItems: HeaderNavItem[] = [
    { label: 'בית', route: '/admin', icon: 'lucideHome' },
    { label: 'שנים', route: '/admin/years', icon: 'lucideCalendarRange' },
    { label: 'שנה נוכחית', route: '/admin/current-year', icon: 'lucideCalendarDays' },
  ];

  private readonly publicItems: HeaderNavItem[] = [
    { label: 'התחברות', route: '/login', icon: 'lucideUserRound' },
    { label: 'הרשמה', route: '/registration', icon: 'lucideCalendarDays' },
  ];

  protected readonly loggedIn = computed(() => this.globalStore.loggedIn());

  private readonly homeRoute = computed(() => {
    if (this.globalStore.isAdmin()) return '/admin';

    return '/home';
  });

  protected readonly parentItems = computed<HeaderNavItem[]>(() => {
    if (!this.loggedIn()) return this.publicItems;

    return [
      { label: 'בית', route: this.homeRoute(), icon: 'lucideHome' },
      { label: 'הרשמה', route: '/registration', icon: 'lucideCalendarDays' },
    ];
  });

  protected readonly mobileItems = computed<HeaderNavItem[]>(() => {
    if (this.variant() === 'admin') return this.adminItems;
    if (this.variant() === 'back') return this.parentItems();
    if (this.loggedIn()) return this.parentItems();

    return [
      { label: this.actionLabel(), route: this.actionRoute(), icon: 'lucideUserRound' },
      ...this.publicItems.filter((item) => item.route !== this.actionRoute()),
    ];
  });

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onDrawerStateChanged(state: 'closed' | 'open'): void {
    this.menuOpen.set(state === 'open');
  }

  protected async logout(): Promise<void> {
    await this.authFacade.logout();
    this.globalStore.clearUser();
    this.closeMenu();
    await this.router.navigateByUrl('/');
  }

  protected isActive(route: string): boolean {
    const current = this.activePath();
    return route === '/admin' ? current === '/admin' : current.startsWith(route);
  }
}
