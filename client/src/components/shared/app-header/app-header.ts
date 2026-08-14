import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarDays,
  lucideCalendarRange,
  lucideChevronLeft,
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
  imports: [NgIcon, RouterLink, HlmButtonImports],
  providers: [
    provideIcons({
      lucideCalendarDays,
      lucideCalendarRange,
      lucideChevronLeft,
      lucideHome,
      lucideMenu,
      lucideUserRound,
      lucideX,
    }),
  ],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
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

    return [
      { label: this.actionLabel(), route: this.actionRoute(), icon: this.variant() === 'back' ? 'lucideChevronLeft' : 'lucideUserRound' },
      ...this.publicItems.filter((item) => item.route !== this.actionRoute()),
    ];
  });

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected isActive(route: string): boolean {
    const current = this.activePath();
    return route === '/admin' ? current === '/admin' : current.startsWith(route);
  }
}
