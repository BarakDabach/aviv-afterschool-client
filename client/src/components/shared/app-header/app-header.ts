import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { BrnDrawerImports } from '@spartan-ng/brain/drawer';
import {
  lucideCalendarDays,
  lucideCalendarRange,
  lucideHome,
  lucideMenu,
  lucideUserRound,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

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
      lucideMenu,
      lucideUserRound,
      lucideX,
    }),
  ],
  templateUrl: './app-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
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
    { label: 'התחברות', route: '/parent-login', icon: 'lucideUserRound' },
    { label: 'הרשמה', route: '/registration', icon: 'lucideCalendarDays' },
  ];

  protected readonly mobileItems = computed<HeaderNavItem[]>(() => {
    if (this.variant() === 'admin') return this.adminItems;
    if (this.variant() === 'back') return this.publicItems;

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

  protected isActive(route: string): boolean {
    const current = this.activePath();
    return route === '/admin' ? current === '/admin' : current.startsWith(route);
  }
}
